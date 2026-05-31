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
        <header className="flex h-20 items-center justify-between border-b border-border bg-card/40 px-8 backdrop-blur-md">

            {/* LEFT */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-xl border border-border bg-card p-2 text-foreground lg:hidden hover:bg-muted transition cursor-pointer"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div>
                    <h1 className="text-xl sm:text-2xl font-bold leading-tight text-foreground">
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

                <span className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground">
                    {role === "broker"
                        ? "Broker"
                        : "User"}
                </span>

                <button
                    onClick={handleLogout}
                    className="rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-500/10 cursor-pointer"
                >
                    Logout
                </button>

            </div>

        </header>
    );
}