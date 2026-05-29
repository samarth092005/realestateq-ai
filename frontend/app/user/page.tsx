"use client";

import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";

export default function UserDashboard() {

  return (
    <RoleProtectedRoute allowedRole="user">

      <DashboardLayout role="user">

        {/* cards */}
        <StatsCards />

      </DashboardLayout>

    </RoleProtectedRoute>
  );
}