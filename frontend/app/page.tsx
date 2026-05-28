import { Navbar } from "@/components/layout/navbar";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { FeaturesSection } from "@/components/home/features-section";
import { GradientBackground } from "@/components/ui/gradient-background";
import { WhySection } from "@/components/home/why-section";
import { CTASection } from "@/components/home/cta-section";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <GradientBackground />

      {/* Hero Section */}
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-28 text-center">

        <div className="mb-6 rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
          AI-Powered Real Estate Intelligence
        </div>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Smarter Property Decisions With AI & Market Intelligence
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Analyze properties, predict prices, explore investment insights,
          and discover smarter opportunities with RealStateQ AI.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <button className="rounded-2xl bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90">
            Explore Platform
          </button>

          <button className="rounded-2xl border border-border px-6 py-3 text-sm font-medium transition hover:bg-muted">
            View Analytics
          </button>
        </div>

      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-6 pb-24">

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-card/80 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-3xl font-bold">12K+</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Properties Analyzed
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-card/80 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-3xl font-bold">94%</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              AI Prediction Accuracy
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-card/80 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-3xl font-bold">350+</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Active Brokers
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-card/80 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-3xl font-bold">25+</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cities Covered
            </p>
          </div>

        </div>

      </section>
      <DashboardPreview />
      <FeaturesSection />
      <WhySection />
      <CTASection />
      <Footer />

    </main>
  );
}