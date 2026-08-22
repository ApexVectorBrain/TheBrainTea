"use client";

import { useEffect, useState } from "react";
import {
  ErrorNote,
  Field,
  inputClass,
  LoadingRow,
  Panel,
} from "@/components/admin/ui";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface WeeklySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function TherapistSettingsPage() {
  const [weekly, setWeekly] = useState<WeeklySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/therapist/availability");
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to load availability");
        setWeekly(data.weekly);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load availability",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const groupedByDay = DAYS.map((_, day) =>
    weekly.map((w, idx) => ({ ...w, idx })).filter((w) => w.dayOfWeek === day),
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="mb-2 font-cormorant text-4xl font-semibold text-ocean-deep">
          Availability Settings
        </h1>
        <p className="font-dmsans text-sm text-ink-muted">
          View the weekly working hours set by your clinic administrator.
        </p>
      </div>

      <ErrorNote message={error} />
      <Panel
        title="Weekly Schedule"
        subtitle="Your administrator manages these working hours. Contact them to request a change."
      >
        {loading ? (
          <LoadingRow label="Loading schedule..." />
        ) : (
          <div className="space-y-5 font-dmsans">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
              {DAYS.map((day, dayIdx) => (
                <div key={day} className="surface-inset rounded-soft p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ocean-deep">
                    {day}
                  </div>
                  <div className="space-y-1.5">
                    {groupedByDay[dayIdx].length === 0 && (
                      <p className="text-[11px] italic text-ink-muted">Off</p>
                    )}
                    {groupedByDay[dayIdx].map((slot) => (
                      <div
                        key={slot.idx}
                        className="rounded-full bg-surface px-2 py-1 text-[11px]"
                      >
                        <span className="text-ink">
                          {slot.startTime}–{slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </Panel>
    </div>
  );
}
