import type { MetadataRoute } from "next";
import { listStockBrands } from "@/lib/brands";
import { listVehicles } from "@/lib/vehicles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samucar.pt";
  const vehicles = await listVehicles();
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/contactos", priority: 0.7 },
    { path: "/intermediacao-de-credito", priority: 0.6 },
    { path: "/termos", priority: 0.3 },
    { path: "/cookies", priority: 0.3 },
    { path: "/privacidade", priority: 0.3 },
  ];

  return [
    ...staticRoutes.map(({ path, priority }) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "daily" as const : "monthly" as const,
      priority,
    })),
    ...listStockBrands(vehicles).map((brand) => ({
      url: `${siteUrl}/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...vehicles
      .filter((vehicle) => vehicle.active && vehicle.status !== "sold")
      .map((vehicle) => ({
        url: `${siteUrl}/viaturas/${vehicle.slug}`,
        lastModified: new Date(vehicle.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
  ];
}
