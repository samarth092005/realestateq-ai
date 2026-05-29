import Link from "next/link";

interface SidebarProps {
  role: "user" | "broker";
}

export function Sidebar({
  role,
}: SidebarProps) {

  const links =
    role === "broker"
      ? [
          "Dashboard",
          "Listings",
          "Leads",
          "Analytics",
          "Profile",
        ]
      : [
          "Dashboard",
          "Properties",
          "Saved",
          "Insights",
          "Profile",
        ];

  return (
    <aside className="hidden w-72 border-r border-white/10 bg-card/40 backdrop-blur-xl lg:flex lg:flex-col">

      {/* LOGO */}
      <div className="border-b border-white/10 px-8 py-6">

        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          RealStateQ AI
        </Link>

      </div>

      {/* NAVIGATION */}
      <nav className="flex flex-1 flex-col gap-2 p-6">

        {links.map((link, index) => (

          <button
            key={link}
            className={`rounded-2xl px-5 py-3 text-left text-sm font-medium transition ${
              index === 0
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {link}
          </button>

        ))}

      </nav>

    </aside>
  );
}