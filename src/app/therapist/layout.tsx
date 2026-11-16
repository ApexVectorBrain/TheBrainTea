import type { ReactNode } from "react";
import DashboardShell from "./DashboardShell";
export const metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }: { children: ReactNode }) { return <DashboardShell>{children}</DashboardShell>; }
