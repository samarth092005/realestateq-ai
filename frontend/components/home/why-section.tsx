import {
  BrainCircuit,
  Shield,
  TrendingUp,
  MapPinned,
} from "lucide-react";

const points = [
  {
    title: "AI-Driven Property Intelligence",
    description:
      "Leverage machine learning models to analyze property trends, pricing patterns, and investment potential.",
    icon: BrainCircuit,
  },
  {
    title: "Smarter Investment Decisions",
    description:
      "Identify high-growth opportunities with predictive analytics and real-time market insights.",
    icon: TrendingUp,
  },
  {
    title: "Verified & Transparent Listings",
    description:
      "Reduce uncertainty with broker/admin verified listings and structured property data.",
    icon: Shield,
  },
  {
    title: "Location-Based Market Insights",
    description:
      "Explore real estate hotspots, demand trends, and growth zones through intelligent mapping.",
    icon: MapPinned,
  },
];

export function WhySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-28">

      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

        {/* Left Content */}
        <div>

          <div className="mb-4 inline-flex rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
            Why RealStateQ AI
          </div>

          <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Making Real Estate Decisions Smarter With AI
          </h2>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            RealStateQ AI combines machine learning, analytics,
            and market intelligence to help users discover
            better investment opportunities with confidence.
          </p>

        </div>

        {/* Right Grid */}
        <div className="grid gap-5 sm:grid-cols-2">

          {points.map((point) => {
            const Icon = point.icon;

            return (
              <div
                key={point.title}
                className="rounded-3xl border border-white/10 bg-card/80 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20"
              >

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold">
                  {point.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {point.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}