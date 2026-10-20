import { BadgeCheck, Clock3, Mail } from "lucide-react";
import { VehicleRequestForm } from "@/components/vehicle-request-form";

type VehicleRequestPageProps = {
  type: "sell" | "order";
  eyebrow: string;
  title: string;
  introduction: string;
  benefits: string[];
};

export function VehicleRequestPage({
  type,
  eyebrow,
  title,
  introduction,
  benefits,
}: VehicleRequestPageProps) {
  return (
    <div className="bg-[#f6f5f2]">
      <section className="border-b border-zinc-200 bg-[#0b0b0b] py-16 text-white sm:py-24">
        <div className="shell">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">{introduction}</p>
        </div>
      </section>
      <section className="shell grid gap-10 py-14 sm:py-20 lg:grid-cols-[.62fr_1.38fr] lg:items-start">
        <aside className="lg:sticky lg:top-32">
          <h2 className="text-2xl font-black text-zinc-950">Como funciona</h2>
          <ul className="mt-6 space-y-5">
            {benefits.map((benefit) => (
              <li className="flex gap-3 text-sm leading-6 text-zinc-600" key={benefit}>
                <BadgeCheck className="mt-0.5 shrink-0 text-[#a57b2d]" size={20} />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-9 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
            <p className="flex gap-3"><Clock3 className="shrink-0 text-[#a57b2d]" size={19} />Analisamos o pedido e entramos em contacto consigo.</p>
            <p className="flex gap-3"><Mail className="shrink-0 text-[#a57b2d]" size={19} />Receberá a resposta através dos contactos indicados.</p>
          </div>
        </aside>
        <VehicleRequestForm type={type} />
      </section>
    </div>
  );
}
