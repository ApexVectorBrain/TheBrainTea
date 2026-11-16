import type { ReactNode } from "react";

export const metadata = { alternates: { canonical: "/internship" }, openGraph: { url: "/internship", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
