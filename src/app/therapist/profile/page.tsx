"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Link2Off } from "lucide-react";
import { formatINR } from "@/lib/format";
import {
  ErrorNote,
  Field,
  inputClass,
  LoadingRow,
  Panel,
} from "@/components/admin/ui";

interface Consultant {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  bio: string;
  feeMinor: number;
  status: string;
  effectiveCommissionBps: number;
}

export default function TherapistProfilePage() {
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [calendar, setCalendar] = useState<{
    configured: boolean;
    connection: { googleEmail: string | null; connectedAt: string } | null;
  } | null>(null);
  const [calendarError, setCalendarError] = useState("");
  const [calendarBusy, setCalendarBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/therapist/me");
    const data = await res.json();
    if (res.ok) {
      setConsultant(data.consultant);
      setBio(data.consultant.bio);
      setPhoto(data.consultant.photo || "");
    } else {
      setError(data.error || "Failed to load profile");
    }
  }, []);

  const loadCalendar = useCallback(async () => {
    try {
      const res = await fetch("/api/therapist/google-calendar");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load Google Calendar status");
      setCalendar(data);
    } catch (err) {
      setCalendarError(err instanceof Error ? err.message : "Failed to load Google Calendar status");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
  }, [load]);

  useEffect(() => {
    loadCalendar();
    const status = new URLSearchParams(window.location.search).get("googleCalendar");
    if (status === "failed") setCalendarError("Google Calendar could not be connected. Please try again.");
  }, [loadCalendar]);

  const disconnectCalendar = async () => {
    setCalendarBusy(true);
    setCalendarError("");
    try {
      const res = await fetch("/api/therapist/google-calendar", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect Google Calendar");
      await loadCalendar();
    } catch (err) {
      setCalendarError(err instanceof Error ? err.message : "Failed to disconnect Google Calendar");
    } finally {
      setCalendarBusy(false);
    }
  };

  const saveProfile = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/therapist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, photo: photo || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      setNotice("Profile updated.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    setPasswordBusy(true);
    setPasswordError("");
    setPasswordNotice("");
    try {
      const res = await fetch("/api/therapist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPasswordNotice("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="mb-2 font-cormorant text-4xl font-semibold text-ocean-deep">
          Your Profile
        </h1>
        <p className="font-dmsans text-sm text-ink-muted">
          Public bio and photo shown on the practice website.
        </p>
      </div>

      <ErrorNote message={error} />

      {!consultant ? (
        <LoadingRow label="Loading profile..." />
      ) : (
        <>
          <Panel title="Public Profile">
            <div className="space-y-4 font-dmsans">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="surface-inset rounded-soft p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Session Fee
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums text-ocean-deep">
                    {formatINR(consultant.feeMinor)}
                  </div>
                </div>
                <div className="surface-inset rounded-soft p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Commission
                  </div>
                  <div className="mt-1 text-lg font-bold tabular-nums text-ocean-deep">
                    {consultant.effectiveCommissionBps / 100}%
                  </div>
                </div>
                <div className="surface-inset rounded-soft p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Status
                  </div>
                  <div className="mt-1 text-lg font-bold text-ocean-deep">
                    {consultant.status}
                  </div>
                </div>
              </div>
              <p className="text-[11px] italic text-ink-muted">
                Fee and commission are set by the clinic administrator.
              </p>

              <Field label="Photo URL">
                <input
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Bio">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </Field>
              {notice && (
                <p className="text-xs font-medium text-emerald-700">{notice}</p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={saveProfile}
                className="rounded-full bg-ocean px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-surface-raised-sm transition-all hover:-translate-y-0.5 disabled:opacity-40"
              >
                {busy ? "Saving..." : "Save profile"}
              </button>
            </div>
          </Panel>

          <Panel title="Change Password">
            <div className="max-w-sm space-y-4 font-dmsans">
              <ErrorNote message={passwordError} />
              {passwordNotice && (
                <p className="text-xs font-medium text-emerald-700">
                  {passwordNotice}
                </p>
              )}
              <Field label="Current password">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="New password (min 10 characters)">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <button
                type="button"
                disabled={
                  passwordBusy || !currentPassword || newPassword.length < 10
                }
                onClick={changePassword}
                className="rounded-full bg-ocean px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-surface-raised-sm transition-all hover:-translate-y-0.5 disabled:opacity-40"
              >
                {passwordBusy ? "Updating..." : "Change password"}
              </button>
            </div>
          </Panel>

          <Panel
            title="Google Calendar & Meet"
            subtitle="Connect once to create private calendar events and a unique Google Meet link for your confirmed appointments."
          >
            <div className="max-w-2xl space-y-4 font-dmsans">
              {calendarError && <p role="alert" className="text-xs font-medium text-red-700">{calendarError}</p>}
              {calendar?.connection ? (
                <div className="surface-inset flex flex-wrap items-center justify-between gap-4 rounded-soft p-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-ocean-deep">
                      <CalendarCheck size={18} aria-hidden="true" /> Google Calendar connected
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {calendar.connection.googleEmail || "Your Google account"} will own future appointment events and Meet links.
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Disconnecting is unavailable while you have future confirmed appointments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={disconnectCalendar}
                    disabled={calendarBusy}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <Link2Off size={15} aria-hidden="true" /> {calendarBusy ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              ) : calendar?.configured ? (
                <div>
                  <p className="mb-3 text-sm text-ink-muted">No Google account is connected yet. This does not give The Brain Tea access to your Gmail inbox; it only permits creating and updating your own Calendar events and Meet links.</p>
                  <a
                    href="/api/therapist/google-calendar/connect"
                    className="inline-flex min-h-11 items-center rounded-full bg-ocean px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-surface-raised-sm transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
                  >
                    Connect Google Calendar
                  </a>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">Google Calendar setup is not ready yet. Please ask the clinic administrator to finish the Google setup.</p>
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
