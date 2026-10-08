import Link from "next/link";
import { randomInt } from "node:crypto";
import { ArrowDown, BadgeCheck, CarFront, Headphones, ShieldCheck } from "lucide-react";
import { Inventory } from "@/components/inventory";
import { listVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const vehicles = await listVehicles();
  const premiumVehicles = vehicles
    .filter((vehicle) => vehicle.status === "available" && vehicle.photos.length > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);
  const heroVehicle =
    premiumVehicles.length > 0
      ? premiumVehicles[randomInt(premiumVehicles.length)]
      : undefined;

  return (
    <>
      <section
        className="hero"
        style={
          heroVehicle
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.94) 0%, rgba(0,0,0,.76) 48%, rgba(0,0,0,.28) 100%), url("${heroVehicle.photos[0]}")`,
              }
            : undefined
        }
      >
        <div className="shell relative z-10 flex min-h-[590px] flex-col justify-center py-20 text-white sm:min-h-[680px] sm:py-24">
          <p className="eyebrow">Stand automóvel em Almada</p>
          <h1 className="max-w-4xl text-[2.75rem] font-black leading-[.98] tracking-[-.045em] min-[390px]:text-5xl sm:text-7xl lg:text-[92px]">
            O seu próximo carro começa <span className="gold-text">aqui.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:mt-7 sm:text-lg sm:leading-8">
            Viaturas usadas, elétricas e híbridas selecionadas com rigor.
            Transparência, confiança e acompanhamento em cada quilómetro.
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-2 gap-3 sm:mt-10 sm:flex sm:max-w-none sm:flex-wrap sm:gap-4">
            <Link className="gold-button justify-center px-4 py-3.5 sm:px-6 sm:py-4" href="#stock"><CarFront size={19} />Ver viaturas</Link>
            <Link className="outline-button px-4 py-3.5 sm:px-6 sm:py-4" href="/contactos">Fale connosco</Link>
          </div>
          <a href="#stock" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-400" aria-label="Ver stock"><ArrowDown /></a>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <div className="shell grid divide-y divide-zinc-200 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <TrustItem icon={<BadgeCheck />} title="Seleção rigorosa" text="Viaturas escolhidas ao detalhe" />
          <TrustItem icon={<ShieldCheck />} title="Compra segura" text="Informação clara e transparente" />
          <TrustItem icon={<Headphones />} title="Acompanhamento" text="Antes, durante e depois da compra" />
        </div>
      </section>

      <section id="stock" className="scroll-mt-24 bg-[#f6f5f2] py-20 sm:py-28">
        <div className="shell">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow text-[#8d6a27]">O nosso stock</p>
            <h2 className="section-heading">Encontre a viatura certa para si</h2>
            <p className="mt-4 leading-7 text-zinc-600">Pesquise por marca, combustível ou transmissão e descubra todas as viaturas disponíveis.</p>
          </div>
          <Inventory vehicles={vehicles} />
        </div>
      </section>

      <section id="sobre" className="scroll-mt-20 bg-[#0b0b0b] py-24 text-white sm:py-32">
        <div className="shell grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Desde 2012 consigo</p>
            <h2 className="section-heading max-w-xl">Mais do que automóveis, relações de confiança.</h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-zinc-400">
            <p>Somos um stand automóvel em Almada dedicado à comercialização de viaturas usadas, selecionadas para responder às diferentes necessidades dos nossos clientes.</p>
            <p>No nosso stock encontrará carros usados, elétricos e híbridos de várias marcas e segmentos. Consulte as viaturas disponíveis online ou visite-nos em Almada.</p>
            <Link href="/contactos" className="inline-flex font-bold text-[#e0be6f]">Conheça-nos melhor →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-7 sm:justify-center">
      <span className="text-[#b88932]">{icon}</span>
      <div><p className="font-bold text-zinc-900">{title}</p><p className="text-sm text-zinc-500">{text}</p></div>
    </div>
  );
}
