"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { logoutUser } from "@/services/auth";
import { useEffect, useState } from "react";
import { initFirestoreMetadata } from "@/services/seed";
import { useTheme } from "next-themes";

export function Navbar() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        initFirestoreMetadata();
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <nav className="border-b border-border bg-card text-foreground shadow-sm">

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight text-foreground"
                >
                    RealStateQ AI
                </Link>

                <div className="flex items-center gap-4">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-2xl border border-border bg-background p-2 px-3 text-xs font-semibold text-foreground transition hover:bg-muted shadow-sm cursor-pointer"
                            aria-label="Toggle Theme"
                        >
                            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </button>
                    )}

                    {user ? (
                        <>

                            <Link
                                href="/dashboard"
                                className="rounded-2xl border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-muted"
                            >
                                Dashboard
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-500/10 cursor-pointer"
                            >
                                Logout
                            </button>

                        </>
                    ) : (
                        <>

                            <Link
                                href="/login"
                                className="rounded-2xl border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-muted"
                            >
                                Login
                            </Link>

                            <Link
                                href="/login"
                                className="rounded-2xl bg-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-primary/95 active:scale-95 shadow-md shadow-primary/10"
                            >
                                Get started
                            </Link>

                        </>
                    )}

                </div>

            </div>

        </nav>
    );
}