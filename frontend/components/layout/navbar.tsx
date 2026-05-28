export function Navbar() {
    return (
        <nav className="border-b border-border">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                <h1 className="text-xl font-semibold tracking-tight">
                    RealStateQ AI
                </h1>

                <div className="flex items-center gap-4">

                    <button className="text-sm text-muted-foreground transition hover:text-foreground">
                        Login
                    </button>

                    <button className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90">
                        Get Started
                    </button>

                </div>
            </div>
        </nav>
    );
}