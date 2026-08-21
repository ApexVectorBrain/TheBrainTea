import type { Config } from "@netlify/functions";

export default async function handler() {
  const base = process.env.APP_BASE_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) return;
  const response = await fetch(`${base}/api/cron/send-appointment-reminders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!response.ok) console.error(`send-appointment-reminders: HTTP ${response.status}`);
}

// Run in short intervals so the service can target the one-hour mark. The
// database email journal ensures each appointment receives one reminder only.
export const config: Config = { schedule: "*/5 * * * *" };
