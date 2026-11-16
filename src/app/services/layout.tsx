import type { ReactNode } from "react";

export const metadata = {
  title: "Counselling Services and Fees | The Brain Tea, Pune",
  description: "Individual, couples and family, and career counselling in Pune. Explore our services and book an in-person or online session.",
  alternates: { canonical: "/services" }, openGraph: { url: "/services", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
