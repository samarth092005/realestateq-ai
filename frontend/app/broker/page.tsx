"use client";

import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";

export default function UserDashboard() {

  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <RoleProtectedRoute allowedRole="broker">

      <main className="p-8">

        <div className="flex items-center justify-between">

          <h1 className="text-4xl font-bold">
            User Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 text-white"
          >
            Logout
          </button>

        </div>

      </main>

    </RoleProtectedRoute>
  );
}