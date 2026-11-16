"use client";
import { useEffect } from "react";
import { track } from "./MarketingAnalytics";
export default function BookingConversion({ id, amount, isFree, service }: { id: string; amount: number; isFree: boolean; service: string }) {
  useEffect(() => {
    const event = isFree ? "discovery_call_booked" : "booking_confirmed";
    function emit() {
      const key = `tbt:conversion:${event}:${id}`;
      try {
        if (localStorage.getItem("tbt-analytics-consent") !== "accepted" || sessionStorage.getItem(key)) return;
        track(event, isFree ? { booking_id: id } : { booking_id: id, value: amount / 100, currency: "INR", service });
        sessionStorage.setItem(key, "1");
      } catch { return; }
    }
    emit(); window.addEventListener("tbt-consent-changed", emit);
    return () => window.removeEventListener("tbt-consent-changed", emit);
  }, [id, amount, isFree, service]);
  return null;
}
