import { DefaultAzureCredential } from "@azure/identity";
import { TableClient, type TableEntityResult } from "@azure/data-tables";
import { promises as fs } from "node:fs";
import path from "node:path";
import { slugify } from "@/lib/format";
import {
  vehicleInputSchema,
  vehicleSchema,
  type Vehicle,
  type VehicleInput,
} from "@/types/vehicle";

const partitionKey = "inventory";
const localDataPath = path.join(process.cwd(), "src", "data", "vehicles.json");

function getTableClient() {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) return null;

  const tableName = process.env.AZURE_STORAGE_TABLE_NAME ?? "vehicles";
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return TableClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
      tableName,
    );
  }
  return new TableClient(
    `https://${accountName}.table.core.windows.net`,
    tableName,
    new DefaultAzureCredential(),
  );
}

function fromEntity(entity: TableEntityResult<Record<string, unknown>>): Vehicle {
  if (!entity.rowKey) throw new Error("A viatura guardada não tem identificador.");
  return vehicleSchema.parse({
    id: entity.rowKey,
    slug: entity.slug,
    brand: entity.brand,
    model: entity.model,
    version: entity.version,
    price: entity.price,
    year: entity.year,
    month: entity.month,
    kms: entity.kms,
    fuel: entity.fuel,
    horsepower: entity.horsepower,
    displacement: entity.displacement,
    transmission: entity.transmission,
    equipment: JSON.parse(String(entity.equipment ?? "[]")),
    photos: JSON.parse(String(entity.photos ?? "[]")),
    status: entity.status,
    featured: entity.featured,
    sortOrder: entity.sortOrder,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}

function toEntity(vehicle: Vehicle) {
  return {
    partitionKey,
    rowKey: vehicle.id,
    slug: vehicle.slug,
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    price: vehicle.price,
    year: vehicle.year,
    month: vehicle.month,
    kms: vehicle.kms,
    fuel: vehicle.fuel,
    horsepower: vehicle.horsepower,
    displacement: vehicle.displacement,
    transmission: vehicle.transmission,
    equipment: JSON.stringify(vehicle.equipment),
    photos: JSON.stringify(vehicle.photos),
    status: vehicle.status,
    featured: vehicle.featured,
    sortOrder: vehicle.sortOrder,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
  };
}

async function readLocalVehicles(): Promise<Vehicle[]> {
  const contents = await fs.readFile(localDataPath, "utf8");
  return zodVehicleArray(JSON.parse(contents));
}

function zodVehicleArray(input: unknown): Vehicle[] {
  if (!Array.isArray(input)) throw new Error("O catálogo local é inválido.");
  return input.map((vehicle) => vehicleSchema.parse(vehicle));
}

async function writeLocalVehicles(vehicles: Vehicle[]) {
  await fs.writeFile(localDataPath, `${JSON.stringify(vehicles, null, 2)}\n`);
}

export async function listVehicles(): Promise<Vehicle[]> {
  const client = getTableClient();
  if (!client) return readLocalVehicles();

  const vehicles: Vehicle[] = [];
  for await (const entity of client.listEntities({
    queryOptions: { filter: `PartitionKey eq '${partitionKey}'` },
  })) {
    vehicles.push(fromEntity(entity));
  }
  return vehicles.sort(
    (a, b) => b.sortOrder - a.sortOrder || b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getVehicleBySlug(slug: string) {
  const vehicles = await listVehicles();
  return vehicles.find((vehicle) => vehicle.slug === slug) ?? null;
}

export async function saveVehicle(rawInput: VehicleInput): Promise<Vehicle> {
  const input = vehicleInputSchema.parse(rawInput);
  const now = new Date().toISOString();
  const existing = (await listVehicles()).find(
    (vehicle) => vehicle.id === input.id,
  );
  const baseSlug = slugify(`${input.brand}-${input.model}-${input.version}`);
  const vehicle = vehicleSchema.parse({
    ...input,
    slug: `${baseSlug}-${input.id.slice(-6).toLowerCase()}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  const client = getTableClient();
  if (client) {
    await client.createTable();
    await client.upsertEntity(toEntity(vehicle), "Replace");
  } else {
    const vehicles = await readLocalVehicles();
    const index = vehicles.findIndex((item) => item.id === vehicle.id);
    if (index >= 0) vehicles[index] = vehicle;
    else vehicles.unshift(vehicle);
    await writeLocalVehicles(vehicles);
  }

  return vehicle;
}

export async function deleteVehicle(id: string) {
  const client = getTableClient();
  if (client) {
    await client.deleteEntity(partitionKey, id);
    return;
  }

  const vehicles = await readLocalVehicles();
  const filtered = vehicles.filter((vehicle) => vehicle.id !== id);
  if (filtered.length === vehicles.length) {
    throw new Error("Viatura não encontrada.");
  }
  await writeLocalVehicles(filtered);
}
