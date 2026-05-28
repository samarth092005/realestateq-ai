export function Footer() {
  return (
    <footer className="border-t border-white/10">

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">

        <div>

          <h3 className="text-lg font-semibold">
            RealStateQ AI
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered real estate intelligence platform.
          </p>

        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">

          <button className="transition hover:text-foreground">
            Features
          </button>

          <button className="transition hover:text-foreground">
            Analytics
          </button>

          <button className="transition hover:text-foreground">
            About
          </button>

        </div>

      </div>

    </footer>
  );
}