import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check, Fuel, Gauge, GitBranch, MessageCircle, Phone, Settings2, Zap } from "lucide-react";
import { Gallery } from "@/components/gallery";
import { VehicleCard } from "@/components/vehicle-card";
import { formatNumber, formatPrice, vehicleTitle } from "@/lib/format";
import { site } from "@/lib/site";
import { getVehicleBySlug, listVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const vehicle = await getVehicleBySlug((await params).slug);
  if (!vehicle) return {};
  const title = vehicleTitle(vehicle);
  return { title, description: `${title}, ${vehicle.year}, ${formatNumber(vehicle.kms)} km por ${formatPrice(vehicle.price)}.`, openGraph: { images: [vehicle.photos[0]] } };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const vehicle = await getVehicleBySlug((await params).slug);
  if (!vehicle) notFound();
  const allVehicles = await listVehicles();
  const related = allVehicles.filter((item) => item.active && item.id !== vehicle.id && item.status !== "sold").slice(0, 3);
  const title = vehicleTitle(vehicle);

  return (
    <div className="bg-[#f6f5f2]">
      <div className="shell overflow-hidden py-4 text-xs text-zinc-500 sm:py-5 sm:text-sm"><Link href="/">Início</Link> <span className="mx-1 sm:mx-2">/</span> <Link href="/#stock">Viaturas</Link> <span className="mx-1 sm:mx-2">/</span> <span className="text-zinc-900">{vehicle.brand} {vehicle.model}</span></div>
      <section className="shell pb-14 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_.75fr]">
          <Gallery photos={vehicle.photos} title={title} />
          <aside>
            <p className="eyebrow text-[#8d6a27]">{vehicle.brand}</p>
            <h1 className="text-3xl font-black tracking-[-.04em] text-zinc-950 sm:text-4xl">{vehicle.model}</h1>
            <p className="mt-1 text-xl text-zinc-500">{vehicle.version}</p>
            <p className="my-6 text-3xl font-black sm:my-8 sm:text-4xl">{formatPrice(vehicle.price)}</p>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200">
              <Detail icon={<CalendarDays />} label="Ano" value={`${vehicle.month}/${vehicle.year}`} />
              <Detail icon={<Gauge />} label="Quilómetros" value={vehicle.kms ? `${formatNumber(vehicle.kms)} km` : "Sob consulta"} />
              <Detail icon={<Fuel />} label="Combustível" value={vehicle.fuel} />
              <Detail icon={<GitBranch />} label="Transmissão" value={vehicle.transmission} />
              <Detail icon={<Zap />} label="Potência" value={`${vehicle.horsepower} cv`} />
              <Detail icon={<Settings2 />} label="Cilindrada" value={vehicle.displacement ? `${formatNumber(vehicle.displacement)} cc` : "—"} />
            </div>
            <div className="mt-6 grid gap-3">
              <a className="gold-button justify-center py-4" href={`${site.whatsappUrl}%20${encodeURIComponent(title)}`} target="_blank" rel="noreferrer"><MessageCircle size={19} />Pedir informações</a>
              <a className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 py-4 font-bold" href={site.phoneHref}><Phone size={19} />{site.phone}</a>
            </div>
            <p className="mt-4 text-center text-xs text-zinc-400">Custo de chamada para a rede móvel nacional.</p>
          </aside>
        </div>
        <div className="mt-14 rounded-2xl bg-white p-7 shadow-sm sm:p-10">
          <h2 className="mb-6 text-2xl font-black">Equipamento e destaques</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.equipment.map((item) => <li key={item} className="flex items-start gap-3 text-zinc-700"><Check className="mt-0.5 shrink-0 text-[#a57b2d]" size={18} />{item}</li>)}
          </ul>
          <div className="mt-8 space-y-4 border-t border-zinc-100 pt-7 text-sm leading-6 text-zinc-600">
            <p className="text-base font-black text-zinc-900">🎯 Tratamos do processo de financiamento.</p>
            <p>Consultar condições comerciais de financiamento e preparação. Ao valor anunciado acresce despesas administrativas no valor de <strong className="text-zinc-900">350€ mais iva</strong></p>
            <p>Este anúncio foi inserido por rotina informática, a informação/descrição não dispensa confirmação junto dos nossos comerciais, nem poderá ser considerada vinculativa.</p>
            <p className="font-bold text-zinc-800">Automóveisamucar - Mediação Automóvel, Lda - Intermediários de crédito a título acessório - AUT 0002884 do B.P.</p>
          </div>
        </div>
      </section>
      {related.length > 0 && <section className="bg-white py-20"><div className="shell"><p className="eyebrow text-[#8d6a27]">Também poderá gostar</p><h2 className="mb-10 text-3xl font-black">Outras viaturas</h2><div className="grid gap-6 md:grid-cols-3">{related.map((item) => <VehicleCard key={item.id} vehicle={item} />)}</div></div></section>}
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="bg-white p-4"><div className="mb-2 text-[#a57b2d]">{icon}</div><p className="text-xs text-zinc-400">{label}</p><p className="mt-0.5 text-sm font-bold text-zinc-800">{value}</p></div>;
}
