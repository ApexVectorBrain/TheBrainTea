"use client";

import React, { useState } from "react";
import { Input, Textarea } from "./ui/Input";
import Button from "./ui/Button";
import Surface from "./ui/Surface";

export default function InternshipApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateResume = (file: File | undefined): string | null => {
    if (!file) return "Please attach your resume.";
    if (file.size > 10 * 1024 * 1024) return "Resume must be 10 MB or smaller.";
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      return "Please upload your resume as a PDF file.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    const resume = new FormData(e.currentTarget).get("resume");
    const resumeError = validateResume(resume instanceof File ? resume : undefined);
    if (resumeError) {
      setErrorMsg(resumeError);
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/internship", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A network error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Surface variant="raised" radius="surface" className="p-8 text-center">
        <h3 className="font-cormorant text-2xl font-semibold text-forest-slate mb-2">
          Thanks for your interest!
        </h3>
        <p className="text-sm text-charcoal/80 leading-relaxed">
          Your application has been received. We&apos;ll review it and reach out
          by email if it&apos;s a good fit.
        </p>
      </Surface>
    );
  }

  return (
    <Surface variant="raised" radius="surface" className="p-6 md:p-10">
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-red-200 text-red-700 text-sm font-medium">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" id="fullName" name="fullName" required />
          <Input label="Email" id="email" name="email" type="email" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Phone" id="phone" name="phone" type="tel" required />
          <Input
            label="College / University"
            id="college"
            name="college"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Current Course" id="course" name="course" required />
          <Input
            label="Year / Semester"
            id="year"
            name="yearOrSemester"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="internshipType"
              className="text-xs font-bold tracking-wider uppercase text-charcoal/80 block mb-2"
            >
              Internship Type *
            </label>
            <select
              id="internshipType"
              name="internshipType"
              required
              className="floating-input"
              defaultValue=""
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="graduate">Graduate -- Administrative Focus</option>
              <option value="postgraduate">
                Postgraduate -- Clinical Focus
              </option>
            </select>
          </div>
          <Input
            label="Preferred Start Date"
            id="startDate"
            name="preferredStart"
            type="date"
            required
          />
        </div>
        <Textarea
          label="Statement of Purpose"
          id="sop"
          name="statementOfPurpose"
          required
          rows={5}
        />
        <div>
          <label
            htmlFor="resume"
            className="text-xs font-bold tracking-wider uppercase text-charcoal/80 block mb-2"
          >
            Resume Upload *
          </label>
          <input
            id="resume"
            name="resume"
            type="file"
            accept="application/pdf,.pdf"
            required
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              const resumeError = validateResume(file);
              setErrorMsg(resumeError ?? "");
              if (resumeError) event.currentTarget.value = "";
            }}
            className="w-full text-sm text-charcoal/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-sage file:text-white file:text-xs file:font-semibold file:cursor-pointer cursor-pointer"
          />
          <p className="mt-2 text-xs text-charcoal/70">
            PDF only, up to 10 MB.
          </p>
        </div>
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Surface>
  );
}
