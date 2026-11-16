import type { ReactNode } from "react";

export const metadata = {
  title: "Questions About Therapy | The Brain Tea, Pune",
  description: "Answers to common questions about confidentiality, first sessions, fees, online therapy, cancellations and working with children.",
  alternates: { canonical: "/faq" }, openGraph: { url: "/faq", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
