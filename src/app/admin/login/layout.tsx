import type { ReactNode } from "react";

export const metadata = {
  title: "Staff Login | The Brain Tea",
  description: "Sign in to The Brain Tea staff portal.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
