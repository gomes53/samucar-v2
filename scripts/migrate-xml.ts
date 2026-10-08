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

function parseLegacyNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

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
  const blobName = `migrated/${vehicleId}/${index + 1}`;
  for (const extension of ["jpg", "png", "webp"]) {
    const existingBlob = container.getBlockBlobClient(`${blobName}.${extension}`);
    if (await existingBlob.exists()) return `/api/images/${existingBlob.name}`;
  }
  let response: Response | null = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    response = await fetch(url);
    if (response.ok) break;
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Falha ao transferir ${url}: HTTP ${response.status}`);
    }
    if (attempt < 5) {
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
    }
  }
  if (!response?.ok) {
    throw new Error(`Falha ao transferir ${url}: HTTP ${response?.status ?? "desconhecido"} após 5 tentativas`);
  }
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const blob = container.getBlockBlobClient(`${blobName}.${extension}`);
  await blob.uploadData(Buffer.from(await response.arrayBuffer()), {
    blobHTTPHeaders: { blobContentType: contentType, blobCacheControl: "public, max-age=31536000, immutable" },
  });
  return `/api/images/${blob.name}`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await mapper(items[index], index);
      }
    }),
  );
  return results;
}

const outputPath = path.join(process.cwd(), "src", "data", "vehicles.json");
let existingVehicles = new Map<string, Vehicle>();
try {
  const existing = JSON.parse(await readFile(outputPath, "utf8")) as Vehicle[];
  existingVehicles = new Map(existing.map((vehicle) => [vehicle.id, vehicle]));
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
}

const now = new Date().toISOString();
const vehicles: Vehicle[] = [];
for (const [vehicleIndex, item] of xmlVehicles.entries()) {
  const id = String(item.ID);
  const sourcePhotos = item.PhotoList?.Photo
    ? Array.isArray(item.PhotoList.Photo) ? item.PhotoList.Photo : [item.PhotoList.Photo]
    : [];
  const photos = await mapWithConcurrency(sourcePhotos, 6, (photo, photoIndex) =>
    migratePhoto(photo, id, photoIndex),
  );
  const input: VehicleInput = {
    id,
    brand: String(item.Brand),
    model: String(item.Model),
    version: String(item.Version),
    price: parseLegacyNumber(item.Price),
    year: parseLegacyNumber(item.Year),
    month: parseLegacyNumber(item.Month) || 1,
    kms: parseLegacyNumber(item.Kms),
    fuel: String(item.Fuel),
    horsepower: parseLegacyNumber(item.HP),
    displacement: parseLegacyNumber(item.CC),
    transmission: String(item.Transmission),
    equipment: String(item.EquipmentList ?? "").split(",").map((value) => value.trim()).filter(Boolean),
    photos,
    status: "available",
    featured: vehicleIndex < 6,
    sortOrder: xmlVehicles.length - vehicleIndex,
  };
  const existingVehicle = existingVehicles.get(id);
  vehicles.push({
    ...input,
    slug: `${slugify(`${input.brand}-${input.model}-${input.version}`)}-${id.slice(-6).toLowerCase()}`,
    createdAt: existingVehicle?.createdAt ?? now,
    updatedAt: existingVehicle?.updatedAt ?? now,
  });
}

await writeFile(outputPath, `${JSON.stringify(vehicles, null, 2)}\n`);

if (process.env.AZURE_STORAGE_ACCOUNT_NAME) {
  for (const vehicle of vehicles) await saveVehicle(vehicle);
  console.log(`Migradas ${vehicles.length} viaturas para Azure Table Storage.`);
}
console.log(`Gerado ${outputPath} com ${vehicles.length} viaturas.`);
