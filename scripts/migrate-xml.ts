import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { saveVehicle } from "../src/lib/vehicles";
import { slugify } from "../src/lib/format";
import type { Vehicle, VehicleInput } from "../src/types/vehicle";

type XmlVehicle = {
  ID: number | string;
  Brand: string;
  Model: string;
  Version: string;
  Price: number;
  Year: number;
  Month: number;
  Kms: number;
  Fuel: string;
  HP: number;
  CC: number;
  Transmission: string;
  EquipmentList?: string;
  PhotoList?: { Photo?: string | string[] };
};

const args = process.argv.slice(2);
const sourceIndex = args.indexOf("--source");
const source = sourceIndex >= 0 ? args[sourceIndex + 1] : path.join(process.cwd(), "data_custom.xml");
const downloadImages = args.includes("--download-images");
const parser = new XMLParser({ parseTagValue: true, trimValues: true });
const document = parser.parse(await readFile(source, "utf8"));
const xmlVehicles: XmlVehicle[] = Array.isArray(document.VehicleList.Vehicle)
  ? document.VehicleList.Vehicle
  : [document.VehicleList.Vehicle];

let container: ReturnType<BlobServiceClient["getContainerClient"]> | null = null;
if (downloadImages) {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) throw new Error("AZURE_STORAGE_ACCOUNT_NAME é obrigatório com --download-images.");
  const service = process.env.AZURE_STORAGE_CONNECTION_STRING
    ? BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
    : new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, new DefaultAzureCredential());
  container = service.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME ?? "vehicle-images");
  await container.createIfNotExists();
}

async function migratePhoto(url: string, vehicleId: string, index: number) {
  if (!container) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao transferir ${url}: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const blob = container.getBlockBlobClient(`migrated/${vehicleId}/${index + 1}.${extension}`);
  await blob.uploadData(Buffer.from(await response.arrayBuffer()), {
    blobHTTPHeaders: { blobContentType: contentType, blobCacheControl: "public, max-age=31536000, immutable" },
  });
  return `/api/images/${blob.name}`;
}

const now = new Date().toISOString();
const vehicles: Vehicle[] = [];
for (const [vehicleIndex, item] of xmlVehicles.entries()) {
  const id = String(item.ID);
  const sourcePhotos = item.PhotoList?.Photo
    ? Array.isArray(item.PhotoList.Photo) ? item.PhotoList.Photo : [item.PhotoList.Photo]
    : [];
  const photos: string[] = [];
  for (const [photoIndex, photo] of sourcePhotos.entries()) {
    photos.push(await migratePhoto(photo, id, photoIndex));
  }
  const input: VehicleInput = {
    id,
    brand: String(item.Brand),
    model: String(item.Model),
    version: String(item.Version),
    price: Number(item.Price),
    year: Number(item.Year),
    month: Number(item.Month) || 1,
    kms: Number(item.Kms),
    fuel: String(item.Fuel),
    horsepower: Number(item.HP),
    displacement: Number(item.CC),
    transmission: String(item.Transmission),
    equipment: String(item.EquipmentList ?? "").split(",").map((value) => value.trim()).filter(Boolean),
    photos,
    status: "available",
    featured: vehicleIndex < 6,
  };
  vehicles.push({
    ...input,
    slug: `${slugify(`${input.brand}-${input.model}-${input.version}`)}-${id.slice(-6).toLowerCase()}`,
    createdAt: now,
    updatedAt: now,
  });
}

const outputPath = path.join(process.cwd(), "src", "data", "vehicles.json");
await writeFile(outputPath, `${JSON.stringify(vehicles, null, 2)}\n`);

if (process.env.AZURE_STORAGE_ACCOUNT_NAME) {
  for (const vehicle of vehicles) await saveVehicle(vehicle);
  console.log(`Migradas ${vehicles.length} viaturas para Azure Table Storage.`);
}
console.log(`Gerado ${outputPath} com ${vehicles.length} viaturas.`);
