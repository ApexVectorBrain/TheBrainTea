import { NextRequest, NextResponse } from "next/server";

type Role = "ADMIN" | "RECEPTIONIST" | "THERAPIST";

type Session = {
  role: Role;
  exp?: number;
};

const DEV_FALLBACK_SECRET = "fallback-secret-key-for-local-development";
const encoder = new TextEncoder();

function base64UrlBytes(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);
    return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function decodeJson<T>(value: string): T | null {
  const bytes = base64UrlBytes(value);
  if (!bytes) return null;
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

/**
 * Edge-safe HS256 verification for the session cookie. This deliberately
 * verifies the signature and expiry rather than treating a cookie's presence
 * as authentication. The API routes repeat authorization server-side.
 */
async function readSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [encodedHeader, encodedPayload, encodedSignature, ...extra] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature || extra.length > 0) {
    return null;
  }

  const header = decodeJson<{ alg?: string }>(encodedHeader);
  const payload = decodeJson<Session>(encodedPayload);
  const signature = base64UrlBytes(encodedSignature);
  if (header?.alg !== "HS256" || !payload || !signature) return null;
  if (!Object.values(["ADMIN", "RECEPTIONIST", "THERAPIST"] as const).includes(payload.role)) {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const secret = process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? null : DEV_FALLBACK_SECRET);
  if (!secret) return null;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signed = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature as unknown as BufferSource,
      signed,
    );
    return valid ? payload : null;
  } catch {
    return null;
  }
}

function loginResponse(request: NextRequest, pathname: string) {
  const destination = new URL(
    pathname.startsWith("/therapist") ? "/therapist/login" : "/admin/login",
    request.url,
  );
  destination.searchParams.set("next", pathname);
  return NextResponse.redirect(destination);
}

function homeFor(role: Role): string {
  if (role === "THERAPIST") return "/therapist";
  if (role === "RECEPTIONIST") return "/reception";
  return "/admin";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login pages must remain reachable before a session exists.
  if (pathname === "/admin/login" || pathname === "/therapist/login") {
    return NextResponse.next();
  }

  const session = await readSession(request.cookies.get("auth_token")?.value);
  if (!session) return loginResponse(request, pathname);

  const permitted =
    (pathname.startsWith("/admin") && session.role === "ADMIN") ||
    (pathname.startsWith("/reception") &&
      (session.role === "ADMIN" || session.role === "RECEPTIONIST")) ||
    (pathname.startsWith("/therapist") && session.role === "THERAPIST");

  if (!permitted) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/reception/:path*", "/therapist/:path*"],
};
