import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Inventory } from "@/components/inventory";
import { findStockBrand } from "@/lib/brands";
import { listVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

type BrandPageProps = {
  params: Promise<{ brand: string }>;
};

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const vehicles = await listVehicles();
  const brand = findStockBrand(vehicles, (await params).brand);
  if (!brand) return {};

  const title = `${brand.name} usados em Almada`;
  const description = `Consulte ${brand.count} ${brand.name} ${brand.count === 1 ? "usado disponível" : "usados disponíveis"} na Samucar, em Almada. Viaturas selecionadas, financiamento e acompanhamento personalizado.`;
  return {
    title,
    description,
    alternates: { canonical: `/${brand.slug}` },
    openGraph: {
      title: `${title} | Samucar`,
      description,
      type: "website",
      url: `/${brand.slug}`,
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const vehicles = await listVehicles();
  const brand = findStockBrand(vehicles, (await params).brand);
  if (!brand) notFound();

  const brandVehicles = vehicles.filter(
    (vehicle) => vehicle.active && vehicle.status !== "sold" && vehicle.brand === brand.name,
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samucar.pt";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${brand.name} usados na Samucar`,
    numberOfItems: brandVehicles.length,
    itemListElement: brandVehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/viaturas/${vehicle.slug}`,
      name: `${vehicle.brand} ${vehicle.model} ${vehicle.version}`,
    })),
  };

  return (
    <div className="bg-[#f6f5f2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <div className="shell py-5 text-sm text-zinc-500">
        <Link href="/">Início</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{brand.name}</span>
      </div>
      <section className="shell pb-20 pt-8 sm:pb-28 sm:pt-12">
        <p className="eyebrow text-[#8d6a27]">Stock por marca</p>
        <h1 className="section-heading max-w-4xl">{brand.name} usados em Almada</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
          {brand.count === 1
            ? `Descubra o ${brand.name} disponível na Samucar.`
            : `Descubra os ${brand.count} ${brand.name} disponíveis na Samucar.`} Consulte preços,
          equipamento e fotografias, ou fale connosco para obter mais informações.
        </p>
        <div className="mt-12">
          <Inventory vehicles={brandVehicles} fixedBrand={brand.name} />
        </div>
      </section>
    </div>
  );
}
