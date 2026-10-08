import Image from "next/image";
import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="shell flex h-20 items-center justify-between gap-4 sm:h-24 sm:gap-6">
        <Link href="/" aria-label="Samucar — página inicial">
          <Image
            src="/brand/logo-wide.png"
            alt="Samucar"
            width={660}
            height={296}
            className="h-12 w-auto sm:h-16"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link className="nav-link" href="/#stock">Viaturas</Link>
          <Link className="nav-link" href="/#sobre">Sobre nós</Link>
          <Link className="nav-link" href="/contactos">Contactos</Link>
          <Link className="nav-link" href="/intermediacao-de-credito">Intermediação de Crédito</Link>
        </nav>
        <span className="hidden sm:block">
          <a
            href={site.phoneHref}
            className="gold-button"
            aria-label={`Ligar para ${site.phone}`}
          >
            <Phone size={17} />
            {site.phone}
          </a>
        </span>
        <details className="relative md:hidden">
          <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border border-white/20">
            <Menu />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <nav className="absolute right-0 top-14 flex w-56 flex-col rounded-xl border border-white/10 bg-[#111] p-3 shadow-2xl">
            <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/#stock">Viaturas</Link>
            <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/#sobre">Sobre nós</Link>
            <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/contactos">Contactos</Link>
            <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/intermediacao-de-credito">Intermediação de Crédito</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
