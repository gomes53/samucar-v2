"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

export function CookieBanner() {
  const accepted = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("samucar-cookie-notice") === "accepted",
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);

  if (accepted || dismissed) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-white/10 bg-[#111] p-5 text-sm text-zinc-300 shadow-2xl sm:flex-row sm:items-center">
      <p className="flex-1">
        Utilizamos apenas os cookies necessários ao funcionamento do site.{" "}
        <Link className="text-[#e0be6f] underline" href="/cookies">Saber mais</Link>
      </p>
      <button
        className="gold-button justify-center"
        onClick={() => {
          localStorage.setItem("samucar-cookie-notice", "accepted");
          setDismissed(true);
        }}
      >
        Compreendi
      </button>
    </aside>
  );
}
