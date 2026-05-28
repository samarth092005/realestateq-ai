import {
  Brain,
  BarChart3,
  Building2,
  Map,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "AI Price Prediction",
    description:
      "Predict accurate property pricing using machine learning models and market trends.",
    icon: Brain,
  },
  {
    title: "Investment Analysis",
    description:
      "Analyze ROI potential, growth predictions, and investment opportunities instantly.",
    icon: BarChart3,
  },
  {
    title: "Smart Property Comparison",
    description:
      "Compare properties side-by-side using AI-driven insights and metrics.",
    icon: Building2,
  },
  {
    title: "Market Heatmaps",
    description:
      "Explore high-demand regions and real estate hotspots with interactive heatmaps.",
    icon: Map,
  },
  {
    title: "Verified Listings",
    description:
      "Maintain trust and transparency through broker/admin verification systems.",
    icon: ShieldCheck,
  },
  {
    title: "AI Recommendations",
    description:
      "Receive intelligent property recommendations tailored to user preferences.",
    icon: Sparkles,
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-28">

      <div className="mb-14 text-center">

        <div className="mb-4 inline-flex rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
          Platform Features
        </div>

        <h2 className="text-4xl font-bold tracking-tight">
          Everything You Need For Smarter Real Estate Decisions
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          RealStateQ AI combines machine learning, analytics,
          and modern real estate intelligence into one platform.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-foreground/20"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
}