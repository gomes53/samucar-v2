import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 10 * 1024 * 1024;

function getContainerClient() {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) return null;

  const service = process.env.AZURE_STORAGE_CONNECTION_STRING
    ? BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
      )
    : new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential(),
      );
  return service.getContainerClient(
    process.env.AZURE_STORAGE_CONTAINER_NAME ?? "vehicle-images",
  );
}

export async function uploadVehicleImage(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato não suportado. Utilize JPG, PNG ou WebP.");
  }
  if (file.size > maxFileSize) {
    throw new Error("Cada fotografia pode ter no máximo 10 MB.");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blobName = `${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const container = getContainerClient();

  if (container) {
    await container.createIfNotExists();
    const blob = container.getBlockBlobClient(blobName);
    await blob.uploadData(bytes, {
      blobHTTPHeaders: {
        blobContentType: file.type,
        blobCacheControl: "public, max-age=31536000, immutable",
      },
    });
    return `/api/images/${blobName}`;
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDirectory, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await fs.writeFile(path.join(uploadDirectory, fileName), bytes);
  return `/uploads/${fileName}`;
}

export async function deleteVehicleImage(url: string) {
  const container = getContainerClient();
  if (container) {
    const proxyPrefix = "/api/images/";
    const directPrefix = `${container.url}/`;
    const blobName = url.startsWith(proxyPrefix)
      ? url.slice(proxyPrefix.length)
      : url.startsWith(directPrefix)
        ? decodeURIComponent(url.slice(directPrefix.length))
        : null;
    if (blobName) {
      await container.deleteBlob(blobName, {
        deleteSnapshots: "include",
      });
    }
    return;
  }

  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url);
    await fs.rm(filePath, { force: true });
  }
}

export async function downloadVehicleImage(blobName: string) {
  const container = getContainerClient();
  if (!container) throw new Error("O armazenamento de imagens não está configurado.");

  const blob = container.getBlockBlobClient(blobName);
  const [properties, contents] = await Promise.all([
    blob.getProperties(),
    blob.downloadToBuffer(),
  ]);
  return {
    contents,
    contentType: properties.contentType ?? "application/octet-stream",
    cacheControl:
      properties.cacheControl ?? "public, max-age=31536000, immutable",
  };
}
