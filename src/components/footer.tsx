import Image from "next/image";
import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080808] text-zinc-300">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.15fr_1fr_1fr]">
        <div>
          <Image
            src="/brand/logo-wide.png"
            alt="Samucar"
            width={660}
            height={296}
            className="mb-5 h-12 w-auto"
          />
          <p className="max-w-md leading-7 text-zinc-400">{site.description}</p>
        </div>
        <div>
          <h2 className="footer-title">Contactos</h2>
          <ul className="space-y-4 text-sm">
            <li><a className="footer-link" href={site.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={18} />{site.address}</a></li>
            <li><a className="footer-link" href={site.phoneHref}><Phone size={18} />{site.phone}</a></li>
            <li><a className="footer-link" href={`mailto:${site.email}`}><Mail size={18} />{site.email}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Horário</h2>
          <div className="flex gap-3 text-sm leading-7 text-zinc-400">
            <Clock3 className="mt-1 shrink-0 text-[#d8b45f]" size={18} />
            <p>Seg. a Sexta: 10:00–13:00 / 15:00–19:00<br />Sábado: 10:00–13:00 / 15:00–18:00<br />Domingo: Encerrado</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-6 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Samucar. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/termos">Termos de uso</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/intermediacao-de-credito">Intermediação de crédito</Link>
            <a href="https://www.livroreclamacoes.pt/inicio" target="_blank" rel="noreferrer">Livro de reclamações</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
