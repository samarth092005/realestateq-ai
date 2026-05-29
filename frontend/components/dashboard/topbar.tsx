export function Topbar() {
    return (
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-8">

            {/* SEARCH */}
            <div className="w-full max-w-md">

                <input
                    type="text"
                    placeholder="Search properties, locations, brokers..."
                    className="w-full rounded-2xl border border-white/10 bg-card/60 px-5 py-3 text-sm outline-none transition focus:border-white/20"
                />

            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-4">

                {/* NOTIFICATION */}
                <button className="rounded-2xl border border-white/10 bg-card/60 px-4 py-3 text-sm text-muted-foreground transition hover:border-white/20">
                    Notifications
                </button>

                {/* PROFILE */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/60 px-4 py-2">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                        SA
                    </div>

                    <div>

                        <p className="text-sm font-medium">
                            Samarth
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Investor Account
                        </p>

                    </div>

                </div>

            </div>

        </header>
    );
}