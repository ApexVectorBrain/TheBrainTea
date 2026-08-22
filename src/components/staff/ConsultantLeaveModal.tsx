"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import {
  ErrorNote,
  Field,
  inputClass,
  LoadingRow,
  Modal,
} from "@/components/admin/ui";

export interface LeaveConsultant {
  id: string;
  name: string;
  isActive?: boolean;
  status?: string;
}

interface LeaveRecord {
  id: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  therapist: { id: string; name: string };
}

function todayInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

export function ConsultantLeaveModal({
  consultants,
  onClose,
}: {
  consultants: LeaveConsultant[];
  onClose: () => void;
}) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [startDate, setStartDate] = useState(todayInIndia);
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState(todayInIndia);
  const [endTime, setEndTime] = useState("23:59");
  const [reason, setReason] = useState("Leave");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/consultant-leaves");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load leave records");
      setLeaves(data.leaves);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leave records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addLeave = async () => {
    if (!therapistId) {
      setError("Choose a consultant first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/consultant-leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId,
          startDate,
          startTime,
          endDate,
          endTime,
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not mark leave");
      setLeaves((current) => [...current, data.leave].sort((a, b) => a.startAt.localeCompare(b.startAt)));
      setTherapistId("");
      setReason("Leave");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark leave");
    } finally {
      setBusy(false);
    }
  };

  const removeLeave = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/consultant-leaves?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove leave");
      setLeaves((current) => current.filter((leave) => leave.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove leave");
    } finally {
      setBusy(false);
    }
  };

  const bookableConsultants = consultants.filter(
    (consultant) =>
      (consultant.status === undefined || consultant.status === "APPROVED") &&
      (consultant.isActive === undefined || consultant.isActive),
  );

  return (
    <Modal title="Consultant Leave" onClose={onClose} wide>
      <div className="space-y-6 font-dmsans">
        <p className="text-sm text-ink-muted">
          Mark the exact period a consultant is unavailable. New bookings and reschedules that overlap it will be refused. Resolve any active appointment first, so no client is left on a leave period.
        </p>
        <ErrorNote message={error} />

        <div className="surface-inset grid grid-cols-1 gap-3 rounded-soft p-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Consultant">
            <select value={therapistId} onChange={(event) => setTherapistId(event.target.value)} className={inputClass}>
              <option value="">Choose consultant</option>
              {bookableConsultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
              ))}
            </select>
          </Field>
          <Field label="From date (IST)">
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClass} />
          </Field>
          <Field label="From time (IST)">
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className={inputClass} />
          </Field>
          <Field label="To date (IST)">
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={inputClass} />
          </Field>
          <Field label="To time (IST)">
            <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className={inputClass} />
          </Field>
          <div className="md:col-span-2 xl:col-span-4">
            <Field label="Reason (optional)">
              <input value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} placeholder="e.g. Annual leave" />
            </Field>
          </div>
          <button type="button" onClick={addLeave} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-full bg-ocean px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-surface-raised-sm disabled:opacity-40">
            <CalendarOff size={14} /> {busy ? "Saving…" : "Mark leave"}
          </button>
        </div>

        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted">Upcoming leave</h3>
          {loading ? <LoadingRow label="Loading leave records..." /> : leaves.length === 0 ? (
            <p className="text-sm italic text-ink-muted">No upcoming leave is marked.</p>
          ) : (
            <div className="space-y-2">
              {leaves.map((leave) => (
                <div key={leave.id} className="surface-inset flex flex-wrap items-center justify-between gap-3 rounded-soft px-4 py-3 text-xs">
                  <div>
                    <p className="font-semibold text-ocean-deep">{leave.therapist.name}</p>
                    <p className="mt-0.5 text-ink-muted">{formatDateTime(leave.startAt)} → {formatDateTime(leave.endAt)}</p>
                    {leave.reason && <p className="mt-1 text-ink-muted">{leave.reason}</p>}
                  </div>
                  <button type="button" aria-label={`Remove leave for ${leave.therapist.name}`} onClick={() => removeLeave(leave.id)} disabled={busy} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
