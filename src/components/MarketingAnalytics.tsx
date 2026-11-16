"use client";
import { useEffect, useState } from "react";

const KEY = "tbt-analytics-consent";
export function track(event: string, values: Record<string, string | number> = {}) {
  try { if (localStorage.getItem(KEY) !== "accepted") return; } catch { return; }
  const w = window as typeof window & { dataLayer?: unknown[] };
  (w.dataLayer ||= []).push({ event, ...values });
}
export default function MarketingAnalytics() {
  const [choice, setChoice] = useState<string | null>("pending");
  useEffect(() => {
    try { setChoice(localStorage.getItem(KEY)); } catch { setChoice("necessary"); }
  }, []);
  useEffect(() => {
    if (choice !== "accepted") return;
    const params = new URLSearchParams(window.location.search);
    for (const [source, key] of [["utm_source", "utmSource"], ["utm_campaign", "utmCampaign"], ["gclid", "gclid"], ["fbclid", "fbclid"]]) {
      const value = params.get(source); if (value) try { sessionStorage.setItem(`tbt:${key}`, value.slice(0, 200)); } catch {}
    }
    const id = process.env.NEXT_PUBLIC_GTM_ID;
    if (id && /^GTM-[A-Z0-9]+$/.test(id) && !document.getElementById("tbt-gtm")) {
      const w = window as typeof window & { dataLayer?: unknown[] }; w.dataLayer ||= [];
      function gtag(..._args: unknown[]) { w.dataLayer!.push(arguments); }
      gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      gtag("consent", "update", { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const script = document.createElement("script"); script.id = "tbt-gtm"; script.async = true; script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`; document.head.appendChild(script);
    }
    const click = (event: MouseEvent) => { const link = (event.target as Element)?.closest?.("a"); if (!link) return; const href = link.getAttribute("href") || ""; if (href.includes("wa.me/")) track("whatsapp_click", { location: "site" }); if (href.startsWith("tel:")) track("phone_click", { location: "site" }); };
    document.addEventListener("click", click); return () => document.removeEventListener("click", click);
  }, [choice]);
  if (choice !== null) return null;
  function choose(value: string) { try { localStorage.setItem(KEY, value); } catch {} setChoice(value); }
  return <div role="region" aria-label="Cookie preferences" className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl rounded-xl bg-white p-5 shadow-xl border border-slate-300 text-slate-900"><p className="text-sm">We use optional analytics to understand how visitors use our site. You can choose only necessary storage.</p><div className="mt-3 flex flex-wrap gap-3"><button onClick={() => choose("accepted")} className="rounded-full bg-slate-800 text-white px-5 py-2">Accept</button><button onClick={() => choose("necessary")} className="rounded-full border border-slate-700 px-5 py-2">Only necessary</button></div></div>;
}
