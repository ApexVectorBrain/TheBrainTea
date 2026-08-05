import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimiter } from "@/lib/rateLimit";
import { clientIp } from "@/server/http";

const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10 MiB
const PDF_MIME_TYPE = "application/pdf";

const fieldsSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8).max(20),
  college: z.string().trim().min(2).max(200),
  course: z.string().trim().min(2).max(200),
  yearOrSemester: z.string().trim().min(1).max(50),
  internshipType: z.enum(["graduate", "postgraduate"]),
  preferredStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  statementOfPurpose: z.string().trim().min(20).max(5000),
});

function isPdfFileName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}

function hasPdfSignature(buffer: Buffer): boolean {
  // File.type and the filename are supplied by the browser and can be forged.
  // Every valid PDF starts with this signature; checking it blocks renamed
  // executables and HTML files before anything is stored or downloaded.
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

export async function POST(request: Request) {
  try {
    // Namespaced bucket — a bare IP key here shared its budget with booking
    // creation, so applicants and clients throttled each other.
    const ip = clientIp(request);
    const { isBlocked } = rateLimiter(`internship:${ip}`, 5, 60000);
    if (isBlocked) {
      return NextResponse.json(
        {
          error:
            "Too many applications submitted. Please wait a minute and try again.",
        },
        { status: 429 },
      );
    }

    const form = await request.formData();
    const parsed = fieldsSchema.safeParse({
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone"),
      college: form.get("college"),
      course: form.get("course"),
      yearOrSemester: form.get("yearOrSemester"),
      internshipType: form.get("internshipType"),
      preferredStart: form.get("preferredStart"),
      statementOfPurpose: form.get("statementOfPurpose"),
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: first
            ? `${first.path.join(".")}: ${first.message}`
            : "Please check the form and try again.",
        },
        { status: 400 },
      );
    }

    const resume = form.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      return NextResponse.json(
        { error: "Please attach your resume." },
        { status: 400 },
      );
    }
    if (resume.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { error: "Resume must be 10 MB or smaller." },
        { status: 400 },
      );
    }
    if (!isPdfFileName(resume.name) || resume.type !== PDF_MIME_TYPE) {
      return NextResponse.json(
        { error: "Resume must be a PDF file." },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resume.arrayBuffer());
    if (!hasPdfSignature(resumeBuffer)) {
      return NextResponse.json(
        { error: "The uploaded file is not a valid PDF." },
        { status: 400 },
      );
    }

    await prisma.internshipApplication.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        college: parsed.data.college,
        course: parsed.data.course,
        yearOrSemester: parsed.data.yearOrSemester,
        internshipType: parsed.data.internshipType,
        preferredStart: new Date(parsed.data.preferredStart),
        statementOfPurpose: parsed.data.statementOfPurpose,
        resumeFileName: resume.name,
        resumeMimeType: PDF_MIME_TYPE,
        resumeData: resumeBuffer,
      },
    });

    return NextResponse.json({
      message: "Application submitted successfully.",
    });
  } catch (error) {
    console.error("Internship application API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
