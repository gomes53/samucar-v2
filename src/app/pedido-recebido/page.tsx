import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pedido recebido",
  robots: { index: false, follow: false },
};

export default function RequestReceivedPage() {
  return (
    <section className="bg-[#f6f5f2] py-20 sm:py-28">
      <div className="shell">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,.08)] sm:p-14">
          <CheckCircle2 className="mx-auto text-[#a57b2d]" size={58} strokeWidth={1.8} />
          <p className="eyebrow mt-7 text-[#8d6a27]">Submissão concluída</p>
          <h1 className="text-4xl font-black tracking-[-.04em] text-zinc-950 sm:text-5xl">Recebemos o seu pedido.</h1>
          <p className="mx-auto mt-5 max-w-lg leading-7 text-zinc-600">
            Obrigado pelo seu contacto. A equipa Samucar irá analisar as informações e responder através do email ou telemóvel indicado.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="gold-button justify-center px-6 py-4" href="/">Voltar à página inicial</Link>
            <a className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-6 py-4 font-bold" href={site.phoneHref}><Phone size={18} />{site.phone}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
