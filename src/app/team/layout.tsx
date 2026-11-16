import type { ReactNode } from "react";

export const metadata = { alternates: { canonical: "/team" }, openGraph: { url: "/team", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
