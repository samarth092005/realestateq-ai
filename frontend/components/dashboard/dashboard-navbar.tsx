"use client";

import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";

interface DashboardNavbarProps {
    role: "user" | "broker";
}

export function DashboardNavbar({
    role,
}: DashboardNavbarProps) {

    const router = useRouter();

    const handleLogout = async () => {
        await logoutUser();
        router.push("/login");
    };

    return (
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-8">

            {/* LEFT */}
            <div>

                <h1 className="text-2xl font-bold">
                    {role === "broker"
                        ? "Broker Dashboard"
                        : "User Dashboard"}
                </h1>

                <p className="text-sm text-muted-foreground">
                    Welcome back to RealStateQ AI
                </p>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">

                <span className="rounded-full border border-white/10 bg-card px-4 py-2 text-xs font-medium">
                    {role === "broker"
                        ? "Broker"
                        : "User"}
                </span>

                <button
                    onClick={handleLogout}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white"
                >
                    Logout
                </button>

            </div>

        </header>
    );
}