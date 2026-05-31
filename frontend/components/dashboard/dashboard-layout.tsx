"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardNavbar } from "./dashboard-navbar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { logoutUser } from "@/services/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "user" | "broker";
}

export function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout error in mobile layout:", error);
    }
  };

  const links =
    role === "broker"
      ? [
          { name: "Dashboard", href: "/broker" },
          { name: "My Properties", href: "/broker/my-properties" },
          { name: "Add Property", href: "/broker/add-property" },
          { name: "Browse Properties", href: "/properties" },
          { name: "Compare", href: "/compare" },
          { name: "AI Lab", href: "/ai-lab" },
          { name: "Profile", href: "/broker/profile" },
        ]
      : [
          { name: "Dashboard", href: "/user" },
          { name: "Browse Properties", href: "/properties" },
          { name: "Saved Properties", href: "/saved-properties" },
          { name: "Compare", href: "/compare" },
          { name: "AI Lab", href: "/ai-lab" },
          { name: "Profile", href: "/user/profile" },
        ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* DESKTOP SIDEBAR */}
      <Sidebar role={role} />

      {/* MOBILE NAV DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Menu Shell */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-white/10 p-6 shadow-2xl transition duration-300 animate-in slide-in-from-left">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold tracking-tight text-white hover:opacity-90"
              >
                RealStateQ AI
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl border border-white/10 bg-background/50 p-2 text-white hover:bg-white/10 transition"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links scroll container */}
            <nav className="mt-6 flex flex-1 flex-col gap-2 overflow-y-auto">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-2xl px-5 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout anchor in drawer */}
            <div className="pt-6 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full rounded-2xl bg-red-500 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition active:scale-98"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE AREA */}
      <div className="flex flex-1 flex-col">

        <DashboardNavbar
          role={role}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}