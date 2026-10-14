"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  consentChangeEvent,
  readAnalyticsConsent,
  trackEvent,
  type AnalyticsConsent,
} from "@/lib/analytics";

const deniedConsent = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

function initializeConsentMode() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  window.gtag("consent", "default", { ...deniedConsent, wait_for_update: 500 });
}

function updateConsent(consent: AnalyticsConsent) {
  window.gtag?.("consent", "update", {
    ...deniedConsent,
    analytics_storage: consent === "accepted" ? "granted" : "denied",
  });
}

function loadTagManager(containerId: string) {
  if (document.getElementById("samucar-google-tag-manager")) return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.id = "samucar-google-tag-manager";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
}

function clearAnalyticsCookies() {
  const domain = window.location.hostname;
  document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => name === "_gid" || name === "_gat" || name.startsWith("_ga"))
    .forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${domain}; SameSite=Lax`;
    });
}

export function Analytics({ containerId }: { containerId: string }) {
  const pathname = usePathname();
  const initialPath = useRef(pathname);

  useEffect(() => {
    initializeConsentMode();

    const applyConsent = (consent: AnalyticsConsent) => {
      updateConsent(consent);
      if (consent === "accepted") loadTagManager(containerId);
      else clearAnalyticsCookies();
    };
    const storedConsent = readAnalyticsConsent();
    if (storedConsent) applyConsent(storedConsent);

    const handleConsent = (event: Event) => {
      applyConsent((event as CustomEvent<AnalyticsConsent>).detail);
    };
    window.addEventListener(consentChangeEvent, handleConsent);
    return () => window.removeEventListener(consentChangeEvent, handleConsent);
  }, [containerId]);

  useEffect(() => {
    if (pathname === initialPath.current) return;
    initialPath.current = pathname;
    trackEvent("virtual_page_view", {
      page_location: window.location.href,
      page_path: `${window.location.pathname}${window.location.search}`,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}

export function AnalyticsEvent({
  name,
  parameters,
}: {
  name: string;
  parameters?: Record<string, string | number | boolean>;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent(name, parameters);
  }, [name, parameters]);
  return null;
}
