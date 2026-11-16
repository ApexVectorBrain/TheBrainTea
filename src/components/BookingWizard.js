"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@/components/MarketingAnalytics";
import { TEAM } from "@/lib/team-data";
import { bookingPortraitStyle } from "@/lib/booking-consultants";

// Service-first booking flow:
//   1. Service   → what kind of session
//   2. Consultant→ who (only those offering the chosen service)
//   3. Schedule  → the chosen consultant's real availability
//   4. Details   → client information
//   5. Confirm   → summary + how the fee is settled
//
// The client is charged the chosen consultant's own rate.

const STEPS = [
  { stepNum: 1, label: "Service" },
  { stepNum: 2, label: "Consultant" },
  { stepNum: 3, label: "Schedule" },
  { stepNum: 4, label: "Details" },
  { stepNum: 5, label: "Confirm" },
];

const rupees = (minor) => `₹${(minor / 100).toLocaleString("en-IN")}`;

function displayConsultantName(name) {
  return name?.replace(/^Dr\.\s+(?=Madhumati Dhumak$)/, "");
}

export function hasAvailableSlots(slots = []) {
  return slots.some((slot) => slot.isAvailable);
}

export default function BookingWizard({ services = [], initialService = "" }) {
  const router = useRouter();

  const preselected = services.find((s) => s.slug === initialService) || null;

  useEffect(() => { if (preselected) track("booking_started", { booking_type: preselected.slug === "free-15-minute-call" ? "free_call" : "paid" }); }, []);

  const [step, setStep] = useState(preselected ? 2 : 1);
  const [selectedService, setSelectedService] = useState(preselected);

  const [consultants, setConsultants] = useState([]);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [clientDetails, setClientDetails] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    emergencyContact: "",
    referralSource: "",
    referralDoctor: "",
    gdprConsent: false,
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default the date to tomorrow, client-side only (deferred so the effect
  // body never sets state synchronously, and SSR renders an empty value —
  // avoiding a hydration mismatch on the date).
  useEffect(() => {
    const id = setTimeout(() => {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      setSelectedDate(
        `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(t.getDate()).padStart(2, "0")}`,
      );
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // Load the consultants who offer the selected service whenever it changes.
  // All state updates happen inside the async body (never synchronously in
  // the effect) so the effect stays render-safe.
  useEffect(() => {
    if (!selectedService) return;
    let cancelled = false;
    const load = async () => {
      setLoadingConsultants(true);
      setErrorMsg("");
      setConsultants([]);
      setSelectedConsultant(null);
      try {
        const res = await fetch(
          `/api/consultants?service=${encodeURIComponent(selectedService.slug)}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setConsultants(data.consultants || []);
        else setErrorMsg(data.error || "Failed to load consultants.");
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setErrorMsg("Network error loading consultants.");
        }
      } finally {
        if (!cancelled) setLoadingConsultants(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedService]);

  // Load the chosen consultant's slots for the chosen date.
  useEffect(() => {
    if (!selectedConsultant || !selectedDate) return;
    let cancelled = false;
    const load = async () => {
      setLoadingSlots(true);
      setErrorMsg("");
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/bookings/available-slots?therapist=${selectedConsultant.slug}&date=${selectedDate}&service=${encodeURIComponent(selectedService.slug)}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setSlots(data.slots || []);
        else setErrorMsg(data.error || "Failed to load available slots.");
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setErrorMsg("Network error loading available slots.");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedConsultant, selectedDate, selectedService]);

  const handleClientDetailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClientDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedService)
        return setErrorMsg("Please select a service to continue.");
      track("booking_started", { booking_type: selectedService.slug === "free-15-minute-call" ? "free_call" : "paid" });
    } else if (step === 2) {
      if (!selectedConsultant)
        return setErrorMsg("Please choose a consultant to continue.");
    } else if (step === 3) {
      if (!selectedDate || !selectedSlot)
        return setErrorMsg("Please select an available date and time slot.");
    } else if (step === 4) {
      const { name, email, phone, age, referralSource, referralDoctor, gdprConsent } =
        clientDetails;
      if (!name || !email || !phone || !age || !referralSource || (referralSource === "doctor" && !referralDoctor.trim()))
        return setErrorMsg("Please fill out all client information fields.");
      if (!gdprConsent)
        return setErrorMsg(
          "You must consent to the Privacy Policy and IT Act terms.",
        );
    }
    setErrorMsg("");
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    // If the service was preselected from a service page, step 1 is skipped.
    const floor = preselected ? 2 : 1;
    setStep((s) => Math.max(floor, s - 1));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistSlug: selectedConsultant.slug,
          serviceSlug: selectedService.slug,
          date: selectedDate,
          time: selectedSlot.startTime,
          ...clientDetails,
          ...Object.fromEntries(["utmSource", "utmCampaign", "gclid", "fbclid"].flatMap(key => { try { const v = sessionStorage.getItem(`tbt:${key}`); return v ? [[key, v]] : []; } catch { return []; } })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsSubmitting(false);
        setErrorMsg(data.error || "Failed to create booking.");
        return;
      }
      const booking = data.booking;
      if (booking.status !== "CONFIRMED") track("booking_submitted", { booking_type: selectedService.slug === "free-15-minute-call" ? "free_call" : "paid", value: booking.amountMinor / 100, currency: "INR", booking_id: booking.id });
      if (data.payment?.checkoutUrl) {
        window.location.assign(data.payment.checkoutUrl);
        return;
      }
      if (booking.status === "AWAITING_PAYMENT") {
        router.push(`/booking/payment-status?bookingId=${booking.id}`);
        return;
      }
      router.push(`/booking-confirmed?id=${booking.id}`);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to book session. Check your network connection.");
      setIsSubmitting(false);
    }
  };

  const fee = selectedService?.slug === "free-15-minute-call" ? 0 : selectedConsultant?.feeMinor ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-cormorant text-5xl font-semibold text-charcoal mb-3">
          Reserve Your Space
        </h1>
        <p className="text-forest-slate text-base">
          A deliberate step towards emotional clarity and grounded presence.
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-between mb-10 border-b border-mist/35 pb-6 text-xs tracking-wider uppercase text-forest-slate">
        {STEPS.map((item) => (
          <div
            key={item.stepNum}
            aria-current={step === item.stepNum ? "step" : undefined}
            className={`flex flex-col items-center gap-1 transition-all ${
              step >= item.stepNum
                ? "opacity-100 font-semibold text-forest"
                : "opacity-100"
            }`}
          >
            <span
              className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                step >= item.stepNum
                  ? "border-forest bg-forest text-warm-white"
                  : "border-sage/40 text-forest-slate"
              }`}
            >
              0{item.stepNum}
            </span>
            <span className="text-xs mt-1 normal-case tracking-normal">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 sm:p-8 md:p-12 rounded-2xl border border-mist/30 shadow-warm-soft relative">
        {errorMsg && (
          <div role="alert" className="mb-6 p-4 rounded bg-rose-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <h2 className="font-cormorant text-3xl font-semibold text-charcoal mb-4 border-b border-mist/20 pb-2">
              Select a Service
            </h2>
            <p className="text-forest-slate mb-6 text-sm">
              Choose the kind of session you&apos;re looking for. Next, you will
              pick the consultant who offers it.
            </p>

            {/* A service reached via /book?service=… is only preselected if it
                is actually bookable; say so rather than silently dropping the
                client back to an unexplained list. */}
            {initialService && !preselected && services.length > 0 && (
              <p className="text-terracotta text-sm italic bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                The service you came here for isn&apos;t open for booking right
                now. Please choose one of the sessions below.
              </p>
            )}

            {services.length === 0 ? (
              <p className="text-terracotta text-sm italic bg-red-50 p-4 rounded-xl border border-red-100 mb-8">
                No services are open for booking at the moment. Please check
                back soon, or contact us and we&apos;ll arrange a session for
                you.
              </p>
            ) : (
              <div className="space-y-4 mb-8">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`block p-5 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-ocean ${
                      selectedService?.id === service.id
                        ? "border-forest bg-warm-white shadow-sm ring-1 ring-forest/10"
                        : "border-mist/40 bg-warm-white/40 hover:border-sage"
                    }`}
                  >
                    <input type="radio" name="service" value={service.id} checked={selectedService?.id === service.id} onChange={() => setSelectedService(service)} className="sr-only" />
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-cormorant text-xl font-bold text-charcoal">
                          {service.name}
                        </h3>
                        <p className="text-forest-slate text-sm leading-relaxed mt-1">
                          {service.description}
                        </p>
                      </div>
                      <span className="text-xs text-forest-slate shrink-0 mt-1">
                        {service.durationMinutes} min{service.startingFeeMinor != null && <> · {service.startingFeeMinor === 0 ? "Free" : `from ${rupees(service.startingFeeMinor)}`}</>}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-mist/20">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={services.length === 0}
                className="bg-forest hover:bg-terracotta text-warm-white font-medium px-8 py-3 rounded-full transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Consultant */}
        {step === 2 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {!preselected && (
              <button
                onClick={handlePrevStep}
                className="mb-6 flex items-center gap-2 text-forest-slate hover:text-charcoal transition-colors text-xs font-semibold"
              >
                ← Back to Services
              </button>
            )}
            <h2 className="font-cormorant text-3xl font-semibold text-charcoal mb-2 border-b border-mist/20 pb-2">
              Choose Your Consultant
            </h2>
            <p className="text-forest-slate mb-6 text-sm">
              These practitioners offer{" "}
              <span className="font-semibold text-forest">
                {selectedService?.name}
              </span>
              . Each sets their own session fee.
            </p>

            {selectedService?.slug !== "free-15-minute-call" && services.some(service => service.slug === "free-15-minute-call") && <button type="button" onClick={() => { setSelectedService(services.find(service => service.slug === "free-15-minute-call")); setSelectedConsultant(null); setErrorMsg(""); }} className="mb-6 inline-flex min-h-[44px] items-center underline font-semibold text-forest-slate">Need help choosing? Book a free introductory call</button>}

            {loadingConsultants ? (
              <p className="text-forest-slate text-sm italic py-8 text-center">
                Loading consultants…
              </p>
            ) : consultants.length === 0 ? (
              <p className="text-terracotta text-sm italic bg-red-50 p-4 rounded-xl border border-red-100">
                No consultants are currently available for this service. Please
                check back soon or contact us.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {consultants.map((c) => {
                  const profile = TEAM.find(member => member.slug === c.slug || (member.slug === "madhumati-dhumak" && c.slug === "dr-madhumati-dhumak"));
                  return <article key={c.id} className="rounded-xl border border-mist/40 bg-warm-white/50">
                    <label className={`p-5 cursor-pointer flex gap-4 rounded-xl focus-within:ring-2 focus-within:ring-ocean ${selectedConsultant?.id === c.id ? "ring-2 ring-forest bg-warm-white" : "hover:bg-warm-white"}`}>
                      <input type="radio" name="consultant" value={c.id} checked={selectedConsultant?.id === c.id} onChange={() => setSelectedConsultant(c)} className="sr-only" />
                      {c.photo && <span className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-mist/30"><img src={c.photo} alt="" style={bookingPortraitStyle(c)} className="h-full w-full object-cover" /></span>}
                      <span className="min-w-0"><span className="block font-cormorant text-xl font-bold text-charcoal">{c.name}</span>
                        <span className="block text-forest-slate text-sm leading-relaxed mt-1 line-clamp-2">{c.bio}</span>
                        {profile?.languages?.length > 0 && <span className="block text-sm mt-1">{profile.languages.join(", ")}</span>}
                        <span className="block text-forest-slate font-semibold text-sm mt-2">{rupees(selectedService?.slug === "free-15-minute-call" ? 0 : c.feeMinor)} / session</span>
                      </span>
                    </label>
                    <details className="px-5 pb-4 text-sm"><summary className="cursor-pointer text-forest-slate font-semibold py-2">Read more</summary><p className="leading-relaxed">{c.bio}</p>{profile?.specialisations?.length > 0 && <p className="mt-2">Areas of focus: {profile.specialisations.join(", ")}</p>}<Link href={`/team#${c.slug}`} className="inline-flex min-h-[44px] items-center underline">View profile</Link></details>
                  </article>;
                })}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-mist/20">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={consultants.length === 0}
                className="bg-forest hover:bg-terracotta text-warm-white font-medium px-8 py-3 rounded-full transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date and Slots */}
        {step === 3 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <button
              onClick={handlePrevStep}
              className="mb-6 flex items-center gap-2 text-forest-slate hover:text-charcoal transition-colors text-xs font-semibold"
            >
              ← Back to Consultants
            </button>
            <h2 className="font-cormorant text-3xl font-semibold text-charcoal mb-6 border-b border-mist/20 pb-2">
              Schedule with {displayConsultantName(selectedConsultant?.name)}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
              <div className="md:col-span-5 flex flex-col gap-3">
                <label htmlFor="booking-date" className="text-xs font-bold tracking-wider uppercase text-forest-slate">
                  Select Appointment Date
                </label>
                <input
                  type="date"
                  id="booking-date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-warm-white/60 rounded-xl border border-mist/35 p-3.5 text-sm text-charcoal focus:ring-forest focus:border-forest"
                />
              </div>

              <div className="md:col-span-7 flex flex-col gap-3">
                <p id="available-times-label" className="text-xs font-bold tracking-wider uppercase text-forest-slate">
                  Available Time Slots
                </p>
                {loadingSlots ? (
                  <p className="text-forest-slate text-sm italic">
                    Loading available slots...
                  </p>
                ) : hasAvailableSlots(slots) ? (
                  <div role="group" aria-labelledby="available-times-label" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.isAvailable}
                        aria-pressed={selectedSlot?.id === slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg border text-center text-xs transition-all ${
                          !slot.isAvailable
                            ? "bg-mist/10 text-forest-slate/40 border-mist/10 cursor-not-allowed"
                            : selectedSlot?.id === slot.id
                              ? "border-forest bg-forest text-warm-white shadow-sm font-semibold"
                              : "border-mist/40 bg-warm-white/40 hover:border-sage text-charcoal"
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-terracotta text-sm italic bg-red-50 p-4 rounded-xl border border-red-100">
                    No availability for {displayConsultantName(selectedConsultant?.name)} on{" "}
                    {selectedDate}. Please select another date.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-mist/20">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-forest hover:bg-terracotta text-warm-white font-medium px-8 py-3 rounded-full transition-colors shadow-sm hover:shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <button
              onClick={handlePrevStep}
              className="mb-6 flex items-center gap-2 text-forest-slate hover:text-charcoal transition-colors text-xs font-semibold"
            >
              ← Back to Schedule
            </button>
            <h2 className="font-cormorant text-3xl font-semibold text-charcoal mb-8 border-b border-mist/20 pb-2">
              Client Details
            </h2>

            <form className="space-y-6">
              <div>
                <label htmlFor="booking-name" className="text-xs font-bold tracking-wider uppercase text-forest-slate block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                    id="booking-name"
                  value={clientDetails.name}
                  onChange={handleClientDetailChange}
                  placeholder="Your full name"
                  className="w-full bg-warm-white/50 border-t-0 border-l-0 border-r-0 border-b border-mist/60 focus:ring-0 focus:border-forest text-charcoal py-2 px-0 transition-colors text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="booking-email" className="text-xs font-bold tracking-wider uppercase text-forest-slate block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="booking-email"
                    value={clientDetails.email}
                    onChange={handleClientDetailChange}
                    placeholder="jane@example.com"
                    className="w-full bg-warm-white/50 border-t-0 border-l-0 border-r-0 border-b border-mist/60 focus:ring-0 focus:border-forest text-charcoal py-2 px-0 transition-colors text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="booking-phone" className="text-xs font-bold tracking-wider uppercase text-forest-slate block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="booking-phone"
                    value={clientDetails.phone}
                    onChange={handleClientDetailChange}
                    placeholder="10-digit mobile number"
                    className="w-full bg-warm-white/50 border-t-0 border-l-0 border-r-0 border-b border-mist/60 focus:ring-0 focus:border-forest text-charcoal py-2 px-0 transition-colors text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="booking-age" className="text-xs font-bold tracking-wider uppercase text-forest-slate block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="booking-age"
                    inputMode="numeric"
                    min="1"
                    max="120"
                    value={clientDetails.age}
                    onChange={handleClientDetailChange}
                    placeholder="e.g. 32"
                    className="w-full bg-warm-white/50 border-t-0 border-l-0 border-r-0 border-b border-mist/60 focus:ring-0 focus:border-forest text-charcoal py-2 px-0 transition-colors text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="referralSource" className="text-xs font-bold uppercase text-forest-slate block mb-1">How did you hear about us?</label>
                  <select id="referralSource" name="referralSource" value={clientDetails.referralSource} onChange={handleClientDetailChange} className="w-full p-3" required>
                    <option value="">Please select</option><option value="google">Google search</option><option value="social">Instagram or Facebook</option><option value="friend_family">Friend or family</option><option value="doctor">Doctor</option><option value="workplace">Workplace</option><option value="school">School or college</option><option value="other">Other</option>
                  </select>
                  {clientDetails.referralSource === "doctor" && <label className="block mt-3">Doctor’s name<input name="referralDoctor" value={clientDetails.referralDoctor} onChange={handleClientDetailChange} className="w-full p-3" required /></label>}
                </div>
              </div>

              <div className="pt-4 flex items-start gap-4">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  name="gdprConsent"
                  checked={clientDetails.gdprConsent}
                  onChange={handleClientDetailChange}
                  className="mt-1 h-5 w-5 text-forest border-mist/60 focus:ring-forest rounded"
                  required
                />
                <label
                  htmlFor="gdprConsent"
                  className="text-xs text-forest-slate leading-relaxed select-none"
                >
                  I consent to the collection and secure storage of my contact
                  and health information in accordance with the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-forest underline underline-offset-2 hover:text-terracotta"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and the applicable privacy practices described there.
                </label>
              </div>
            </form>

            <div className="flex justify-end pt-8 border-t border-mist/20 mt-8">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-forest hover:bg-terracotta text-warm-white font-medium px-8 py-3 rounded-full transition-colors shadow-sm hover:shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Summary & Payment */}
        {step === 5 && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <button
              onClick={handlePrevStep}
              className="mb-6 flex items-center gap-2 text-forest-slate hover:text-charcoal transition-colors text-xs font-semibold"
            >
              ← Back to Details
            </button>
            <h2 className="font-cormorant text-3xl font-semibold text-charcoal mb-6 border-b border-mist/20 pb-2">
              Confirm Booking
            </h2>

            <div className="bg-warm-white/50 p-6 rounded-xl border border-mist/20 flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-center border-b border-mist/10 pb-3">
                <span className="text-xs font-bold uppercase text-forest-slate">
                  Consultant
                </span>
                <span className="text-sm font-bold text-charcoal">
                  {displayConsultantName(selectedConsultant?.name)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-mist/10 pb-3">
                <span className="text-xs font-bold uppercase text-forest-slate">
                  Service
                </span>
                <span className="text-sm font-bold text-charcoal">
                  {selectedService?.name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-mist/10 pb-3">
                <span className="text-xs font-bold uppercase text-forest-slate">
                  Date & Time
                </span>
                <span className="text-sm font-bold text-charcoal">
                  {selectedDate} at {selectedSlot?.startTime}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-forest">
                  Total Amount Due
                </span>
                <span className="text-2xl text-terracotta font-bold">
                  {rupees(fee)}
                </span>
              </div>
            </div>

            <div className="mb-8 p-7 rounded-xl border border-mist/40 bg-warm-white/50">
              <h3 className="font-cormorant text-2xl font-semibold text-charcoal mb-2">
                Completing your booking
              </h3>
              <p className="text-sm text-forest-slate leading-relaxed mb-5">
                {fee === 0 ? "Your free call will be scheduled without payment." : "Complete your booking to see the next step for payment or confirmation."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-mist/20">
              <span className="text-xs text-forest-slate leading-relaxed max-w-sm">
                * Note: Sessions can be cancelled up to 48 hours, or rescheduled
                up to 24 hours, before slot start.
              </span>
              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                className="bg-forest hover:bg-terracotta text-warm-white font-medium px-8 py-4 rounded-full transition-colors disabled:opacity-50 min-w-[200px] shadow-sm hover:shadow-md"
              >
                {isSubmitting ? "Submitting..." : fee === 0 ? "Book free call" : "Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
