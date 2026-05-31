"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: "user" | "broker";
}

export function Sidebar({
  role,
}: SidebarProps) {
  const pathname = usePathname();

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
          { name: "Saved", href: "/saved-properties" },
          { name: "Compare", href: "/compare" },
          { name: "AI Lab", href: "/ai-lab" },
          { name: "Profile", href: "/user/profile" },
        ];

  return (
    <aside className="hidden w-72 border-r border-border bg-card lg:flex lg:flex-col shadow-sm">

      {/* LOGO */}
      <div className="border-b border-border px-8 py-6">

        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-foreground hover:opacity-90"
        >
          RealStateQ AI
        </Link>

      </div>

      {/* NAVIGATION */}
      <nav className="flex flex-1 flex-col gap-2 p-6">

        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`rounded-2xl px-5 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-foreground text-background font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}