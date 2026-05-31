"use client";

import { logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

interface DashboardNavbarProps {
    role: "user" | "broker";
    onMenuClick?: () => void;
}

export function DashboardNavbar({
    role,
    onMenuClick,
}: DashboardNavbarProps) {

    const router = useRouter();

    const handleLogout = async () => {
        await logoutUser();
        router.push("/login");
    };

    return (
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-8">

            {/* LEFT */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-xl border border-white/10 bg-card p-2 text-white lg:hidden hover:bg-white/10 transition cursor-pointer"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div>
                    <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                        {role === "broker"
                            ? "Broker Dashboard"
                            : "User Dashboard"}
                    </h1>

                    <p className="hidden sm:block text-xs text-muted-foreground">
                        Welcome back to RealStateQ AI
                    </p>
                </div>

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