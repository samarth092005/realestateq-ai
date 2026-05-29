import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { InsightsPanel } from "@/components/dashboard/insights-panel";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen bg-background text-foreground">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col">

        {/* TOPBAR */}
        <Topbar />

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 space-y-8 p-8">

          {/* PAGE HEADER */}
          <div>

            <h1 className="text-4xl font-bold tracking-tight">
              Dashboard
            </h1>

            <p className="mt-2 text-muted-foreground">
              Welcome back to RealStateQ AI analytics platform.
            </p>

          </div>

          {/* ANALYTICS CARDS */}
          <StatsCards />

          {/* AI INSIGHTS */}
          <InsightsPanel />

        </div>

      </div>

    </main>
  );
}