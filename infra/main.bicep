targetScope = 'resourceGroup'

@description('Azure region for the storage account. Static Web Apps is a global service.')
param location string = resourceGroup().location

@description('Globally unique Static Web App name.')
param siteName string = 'samucar-${uniqueString(resourceGroup().id)}'

@description('Password used to access /admin.')
@secure()
@minLength(12)
param adminPassword string

@description('Random secret of at least 32 characters used to sign admin session cookies.')
@secure()
@minLength(32)
param adminSessionSecret string

var storageName = take('st${uniqueString(resourceGroup().id, siteName)}', 24)

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storage
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

resource images 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'vehicle-images'
  properties: {
    publicAccess: 'None'
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource vehiclesTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tableService
  name: 'vehicles'
}

resource staticSite 'Microsoft.Web/staticSites@2023-12-01' = {
  name: siteName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
  }
}

resource appSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticSite
  name: 'appsettings'
  properties: {
    AZURE_STORAGE_ACCOUNT_NAME: storage.name
    AZURE_STORAGE_CONNECTION_STRING: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
    AZURE_STORAGE_TABLE_NAME: vehiclesTable.name
    AZURE_STORAGE_CONTAINER_NAME: images.name
    ADMIN_PASSWORD: adminPassword
    ADMIN_SESSION_SECRET: adminSessionSecret
    NEXT_PUBLIC_SITE_URL: 'https://${staticSite.properties.defaultHostname}'
  }
}

output staticWebAppName string = staticSite.name
output staticWebAppUrl string = 'https://${staticSite.properties.defaultHostname}'
output storageAccountName string = storage.name
