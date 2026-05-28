export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-28">

      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-card/80 px-8 py-20 text-center backdrop-blur-sm">

        {/* Glow */}
        <div
          className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)",
          }}
        />

        <div className="relative z-10">

          <div className="mb-4 inline-flex rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
            Start Exploring
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-5xl">
            Discover Smarter Real Estate Intelligence With AI
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Analyze properties, predict market trends,
            and make confident investment decisions
            using AI-powered real estate insights.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

            <button className="rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90">
              Get Started
            </button>

            <button className="rounded-2xl border border-border px-6 py-3 text-sm font-medium transition hover:bg-muted">
              Explore Dashboard
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}