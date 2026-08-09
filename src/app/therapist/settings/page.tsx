"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
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

interface SlotBlock {
  id: string;
  startAt: string;
  endAt: string;
  reason: string | null;
}

export default function TherapistSettingsPage() {
  const [weekly, setWeekly] = useState<WeeklySlot[]>([]);
  const [blocks, setBlocks] = useState<SlotBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blockBusy, setBlockBusy] = useState(false);

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
        setBlocks(data.blocks);
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

  const addBlock = async () => {
    if (!blockStart || !blockEnd) {
      setBlockError("Start and end are required");
      return;
    }
    setBlockBusy(true);
    setBlockError("");
    try {
      const res = await fetch("/api/therapist/availability/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: new Date(blockStart).toISOString(),
          endAt: new Date(blockEnd).toISOString(),
          reason: blockReason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add block");
      setBlocks((rows) =>
        [...rows, data.block].sort((a, b) =>
          a.startAt.localeCompare(b.startAt),
        ),
      );
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : "Failed to add block");
    } finally {
      setBlockBusy(false);
    }
  };

  const removeBlock = async (id: string) => {
    setBlockBusy(true);
    try {
      const res = await fetch(`/api/therapist/availability/blocks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove block");
      setBlocks((rows) => rows.filter((b) => b.id !== id));
    } catch (err) {
      setBlockError(
        err instanceof Error ? err.message : "Failed to remove block",
      );
    } finally {
      setBlockBusy(false);
    }
  };

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
          View admin-set working hours and block off one-off unavailability.
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

      <Panel
        title="Unavailability Blocks"
        subtitle="Block off leave or one-off unavailability within your normal hours."
      >
        <div className="space-y-4 font-dmsans">
          <ErrorNote message={blockError} />
          <div className="flex flex-wrap items-end gap-3">
            <Field label="From">
              <input
                type="datetime-local"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="To">
              <input
                type="datetime-local"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Reason (optional)">
              <input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className={inputClass}
                placeholder="e.g. Leave"
              />
            </Field>
            <button
              type="button"
              disabled={blockBusy}
              onClick={addBlock}
              className="rounded-full bg-ocean px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-surface-raised-sm disabled:opacity-40"
            >
              Add block
            </button>
          </div>

          {blocks.length === 0 ? (
            <p className="text-xs italic text-ink-muted">
              No unavailability blocks scheduled.
            </p>
          ) : (
            <div className="space-y-2">
              {blocks.map((b) => (
                <div
                  key={b.id}
                  className="surface-inset flex flex-wrap items-center justify-between gap-2 rounded-soft px-4 py-2.5 text-xs"
                >
                  <span className="font-semibold text-ocean-deep">
                    {formatDateTime(b.startAt)} → {formatDateTime(b.endAt)}
                  </span>
                  <span className="text-ink-muted">{b.reason || "—"}</span>
                  <button
                    type="button"
                    onClick={() => removeBlock(b.id)}
                    disabled={blockBusy}
                    className="text-ink-muted hover:text-red-700"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
