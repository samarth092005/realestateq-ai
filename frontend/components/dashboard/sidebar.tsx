import Link from "next/link";

export function Sidebar() {
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

                <Link
                    href="/dashboard"
                    className="rounded-2xl bg-foreground px-5 py-3 text-sm font-medium text-background transition"
                >
                    Dashboard
                </Link>

                <button className="rounded-2xl px-5 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted">
                    Properties
                </button>

                <button className="rounded-2xl px-5 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted">
                    Analytics
                </button>

                <button className="rounded-2xl px-5 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted">
                    Brokers
                </button>

                <button className="rounded-2xl px-5 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted">
                    Saved
                </button>

                <button className="rounded-2xl px-5 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted">
                    Settings
                </button>

            </nav>

        </aside>
    );
}