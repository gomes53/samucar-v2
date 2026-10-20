"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { site } from "@/lib/site";

const homeReloadKey = "samucar:home-reload";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeMenu = () => {
    setMenuOpen(false);
    setServicesOpen(false);
  };

  useEffect(() => {
    if (window.sessionStorage.getItem(homeReloadKey) !== "true") return;

    window.sessionStorage.removeItem(homeReloadKey);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.history.scrollRestoration = "auto";
    });
  }, []);

  const reloadHome = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.location.pathname !== "/") return;

    event.preventDefault();
    window.sessionStorage.setItem(homeReloadKey, "true");
    window.history.scrollRestoration = "manual";
    window.history.replaceState(null, "", "/");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="shell flex h-20 items-center justify-between gap-4 sm:h-24 sm:gap-6">
        <Link href="/" aria-label="Samucar — página inicial" onClick={reloadHome}>
          <Image
            src="/brand/logo-wide.png"
            alt="Samucar"
            width={673}
            height={166}
            className="h-14 w-auto sm:h-[4.5rem]"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <Link className="nav-link" href="/#stock">Viaturas</Link>
          <details className="group relative">
            <summary className="nav-link flex list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
              Serviços
              <ChevronDown className="transition group-open:rotate-180" size={15} />
            </summary>
            <div className="absolute left-1/2 top-8 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#111] p-2 shadow-2xl">
              <Link className="block rounded-lg px-4 py-3 text-zinc-200 transition hover:bg-white/10 hover:text-[#e0be6f]" href="/compramos-o-seu-carro">Compramos o seu carro</Link>
              <Link className="block rounded-lg px-4 py-3 text-zinc-200 transition hover:bg-white/10 hover:text-[#e0be6f]" href="/viatura-sob-encomenda">Viatura sob encomenda</Link>
            </div>
          </details>
          <Link className="nav-link" href="/#sobre">Sobre nós</Link>
          <Link className="nav-link" href="/contactos">Contactos</Link>
          <Link className="nav-link" href="/intermediacao-de-credito">Intermediação de Crédito</Link>
        </nav>
        <span className="hidden xl:block">
          <a
            href={site.phoneHref}
            className="gold-button"
            aria-label={`Ligar para ${site.phone}`}
          >
            <Phone size={17} />
            {site.phone}
          </a>
        </span>
        <div className="relative lg:hidden">
          <button
            type="button"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-white/20"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu />
            <span className="sr-only">Abrir menu</span>
          </button>
          {menuOpen && (
            <nav id="mobile-navigation" className="absolute right-0 top-14 flex max-h-[calc(100vh-7rem)] w-72 flex-col overflow-y-auto rounded-xl border border-white/10 bg-[#111] p-3 shadow-2xl">
              <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/#stock" onClick={closeMenu}>Viaturas</Link>
              <button
                type="button"
                className="flex items-center justify-between rounded-lg px-4 py-3 text-left hover:bg-white/10"
                aria-expanded={servicesOpen}
                onClick={() => setServicesOpen((open) => !open)}
              >
                Serviços
                <ChevronDown className={`transition ${servicesOpen ? "rotate-180" : ""}`} size={17} />
              </button>
              {servicesOpen && (
                <div className="mb-1 ml-3 border-l border-white/15 pl-2">
                  <Link className="block rounded-lg px-4 py-3 text-sm text-zinc-300 hover:bg-white/10" href="/compramos-o-seu-carro" onClick={closeMenu}>Compramos o seu carro</Link>
                  <Link className="block rounded-lg px-4 py-3 text-sm text-zinc-300 hover:bg-white/10" href="/viatura-sob-encomenda" onClick={closeMenu}>Viatura sob encomenda</Link>
                </div>
              )}
              <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/#sobre" onClick={closeMenu}>Sobre nós</Link>
              <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/contactos" onClick={closeMenu}>Contactos</Link>
              <Link className="rounded-lg px-4 py-3 hover:bg-white/10" href="/intermediacao-de-credito" onClick={closeMenu}>Intermediação de Crédito</Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
