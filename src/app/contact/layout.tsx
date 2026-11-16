import type { ReactNode } from "react";

export const metadata = {
  title: "Contact The Brain Tea | Sakal Nagar, Pune",
  description: "Address, phone, WhatsApp, email and hours for The Brain Tea, near Sakal Nagar metro station in Pune.",
  alternates: { canonical: "/contact" }, openGraph: { url: "/contact", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
