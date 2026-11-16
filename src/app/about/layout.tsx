import type { ReactNode } from "react";

export const metadata = {
  title: "About The Brain Tea | Counselling Practice in Pune",
  description: "Why The Brain Tea exists, how we work, and the principles behind our counselling and psychotherapy practice in Pune.",
  alternates: { canonical: "/about" }, openGraph: { url: "/about", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
