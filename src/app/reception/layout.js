import DashboardShell from "./DashboardShell";
export const metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }) { return <DashboardShell>{children}</DashboardShell>; }
