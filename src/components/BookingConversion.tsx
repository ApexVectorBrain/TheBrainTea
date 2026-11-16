"use client";
import { useEffect } from "react";
import { track } from "./MarketingAnalytics";
export default function BookingConversion({ id, amount, isFree }: { id: string; amount: number; isFree: boolean }) {
  useEffect(() => {
    const key = `tbt:conversion:${id}`;
    try { if (localStorage.getItem("tbt-analytics-consent") !== "accepted" || sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { return; }
    track("booking_confirmed", { booking_type: isFree ? "free_call" : "paid", value: amount / 100, currency: "INR", booking_id: id });
  }, [id, amount, isFree]);
  return null;
}
