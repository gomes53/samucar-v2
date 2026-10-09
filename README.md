# Samucar

Redesign do site da Samucar com catálogo público, filtros, páginas de detalhe e uma área de administração protegida por palavra-passe.

## Desenvolvimento local

Requisitos: Node.js 22 ou superior.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Abra `http://localhost:3000`. Sem configuração adicional, a palavra-passe local de `/admin` é `admin`.

## Gestão de viaturas

- **Desativar** retira uma viatura do catálogo e bloqueia a respetiva página pública sem apagar dados ou fotografias.
- As viaturas desativadas ficam no separador **Desativadas**, onde podem ser reativadas.
- A eliminação definitiva, incluindo as fotografias, só está disponível para viaturas previamente desativadas.

## Fotografias

- A primeira fotografia da lista é sempre a capa da viatura.
- Ao selecionar vários ficheiros, a ordem escolhida pelo navegador é preservada.
- Na edição, use **Usar como capa** para mover qualquer fotografia para a primeira posição.
- Em Azure, as imagens são guardadas no contentor privado `vehicle-images`; o site entrega-as através de uma rota com cache sem expor a chave do Storage.
- JPG, PNG e WebP são aceites, até 10 MB por ficheiro e 30 ficheiros por carregamento.

## Importar o XML atual

Gerar novamente o catálogo local:

```powershell
npm run migrate -- --source "C:\caminho\data_custom.xml"
```

Depois de criar a infraestrutura, defina `AZURE_STORAGE_ACCOUNT_NAME` e `AZURE_STORAGE_CONNECTION_STRING`. Para copiar também todas as imagens do imgbb para Azure Blob Storage e carregar as viaturas para Table Storage:

```powershell
npm run migrate -- --source "C:\caminho\data_custom.xml" --download-images
```

O processo mantém a ordem das fotografias do XML; a primeira continua a ser a capa.

## Arquitetura e custos

- **Azure Static Web Apps Free**: frontend Next.js e rotas de API, domínio personalizado e TLS. Sem custo fixo no plano Free.
- **Azure Storage Standard LRS**: Table Storage para as viaturas e um contentor Blob privado para imagens.
- **Autenticação local**: palavra-passe guardada como setting secreto no Azure, nunca enviada para o browser exceto durante o login HTTPS. A sessão usa um cookie `HttpOnly`, `Secure` e assinado.

Para um catálogo desta dimensão, o custo recorrente deverá ser dominado pelo espaço ocupado pelas imagens e respetivas operações. Confirme sempre os preços atuais da região escolhida na calculadora Azure.

## Criar recursos Azure

```powershell
az group create --name rg-samucar-prod --location westeurope
az deployment group create `
  --resource-group rg-samucar-prod `
  --template-file infra\main.bicep `
  --parameters adminPassword="<uma-palavra-passe-forte>" `
               adminSessionSecret="<valor-aleatorio-com-pelo-menos-32-carateres>"
```

O Bicep cria o Static Web App Free, a conta Storage LRS, a tabela e o contentor privado de imagens. Não guarde os dois valores secretos no repositório.

## Publicar

1. Coloque o projeto num repositório GitHub.
2. No portal Azure, copie o deployment token do Static Web App.
3. Crie o secret GitHub `AZURE_STATIC_WEB_APPS_API_TOKEN`.
4. Faça push para `main`; o workflow `.github/workflows/azure-static-web-apps.yml` compila e publica.
5. Execute a migração XML com as variáveis Azure definidas.
6. Associe `samucar.pt` em **Custom domains** no Static Web App e atualize o DNS conforme indicado pelo portal.

## Variáveis

Consulte `.env.example`. Em produção são obrigatórias:

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `AZURE_STORAGE_ACCOUNT_NAME`
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_TABLE_NAME`
- `AZURE_STORAGE_CONTAINER_NAME`
