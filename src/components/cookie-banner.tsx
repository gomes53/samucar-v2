"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  consentChangeEvent,
  openConsentEvent,
  readAnalyticsConsent,
  saveAnalyticsConsent,
} from "@/lib/analytics";

function subscribeToConsent(callback: () => void) {
  window.addEventListener(consentChangeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(consentChangeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function CookieBanner() {
  const hasSavedConsent = useSyncExternalStore(
    subscribeToConsent,
    () => readAnalyticsConsent() !== null,
    () => true,
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener(openConsentEvent, openPreferences);
    return () => window.removeEventListener(openConsentEvent, openPreferences);
  }, []);

  if (hasSavedConsent && !preferencesOpen) return null;

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#111] p-5 text-sm text-zinc-300 shadow-2xl sm:inset-x-4 sm:bottom-4 sm:p-6"
      role="dialog"
      aria-label="Preferências de cookies"
      aria-modal="true"
    >
      <h2 className="text-base font-black text-white">A sua privacidade é importante</h2>
      <p className="mt-2 leading-6">
        Utilizamos cookies necessários ao funcionamento do site e, apenas com a sua autorização,
        cookies de análise para compreender como o site é utilizado.{" "}
        <Link className="text-[#e0be6f] underline" href="/cookies">Política de cookies</Link>
      </p>
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded-xl border border-white/25 px-5 py-3 font-bold text-white transition hover:border-white/60"
          onClick={() => {
            saveAnalyticsConsent("rejected");
            setPreferencesOpen(false);
          }}
        >
          Recusar cookies
        </button>
        <button
          type="button"
          className="gold-button justify-center px-5 py-3"
          onClick={() => {
            saveAnalyticsConsent("accepted");
            setPreferencesOpen(false);
          }}
        >
          Aceitar cookies
        </button>
      </div>
    </aside>
  );
}

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="text-left hover:text-zinc-300"
      onClick={() => window.dispatchEvent(new Event(openConsentEvent))}
    >
      Preferências de cookies
    </button>
  );
}
