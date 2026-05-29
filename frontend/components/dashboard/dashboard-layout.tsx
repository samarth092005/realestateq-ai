import { Sidebar } from "./sidebar";
import { DashboardNavbar } from "./dashboard-navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "user" | "broker";
}

export function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">

      <Sidebar role={role} />

      <div className="flex flex-1 flex-col">

        <DashboardNavbar role={role} />

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}