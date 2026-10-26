import { DashboardShell } from "@/components/admin/dashboard-shell";

// The dashboard waits for the client-side session check before rendering pages,
// so it can't be part of the prerendered shell.
export const instant = false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
