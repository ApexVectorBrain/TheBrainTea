import type { ReactNode } from "react";

export const metadata = {
  title: "Book a Counselling Session | The Brain Tea, Pune",
  description: "Choose a service, a psychologist and a time. Book an in-person session in Pune or an online session.",
  alternates: { canonical: "/book" }, openGraph: { url: "/book", images: [{ url: "/social-share.jpg", width: 1200, height: 630 }] },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
