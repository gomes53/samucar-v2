"use client";

export const consentStorageKey = "samucar-cookie-consent";
export const consentChangeEvent = "samucar:consent-change";
export const openConsentEvent = "samucar:open-consent";

export type AnalyticsConsent = "accepted" | "rejected";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  const value = window.localStorage.getItem(consentStorageKey);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function saveAnalyticsConsent(consent: AnalyticsConsent) {
  window.localStorage.setItem(consentStorageKey, consent);
  window.dispatchEvent(new CustomEvent(consentChangeEvent, { detail: consent }));
}

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (readAnalyticsConsent() !== "accepted") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...parameters });
}
