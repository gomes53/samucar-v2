import { slugify } from "@/lib/format";
import type { Vehicle } from "@/types/vehicle";

export type StockBrand = {
  name: string;
  slug: string;
  count: number;
};

export function listStockBrands(vehicles: Vehicle[]): StockBrand[] {
  const counts = new Map<string, number>();
  vehicles
    .filter((vehicle) => vehicle.active && vehicle.status !== "sold")
    .forEach((vehicle) => counts.set(vehicle.brand, (counts.get(vehicle.brand) ?? 0) + 1));

  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((left, right) => left.name.localeCompare(right.name, "pt"));
}

export function findStockBrand(vehicles: Vehicle[], slug: string) {
  return listStockBrands(vehicles).find((brand) => brand.slug === slug) ?? null;
}
