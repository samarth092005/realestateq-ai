import { Navbar } from "@/components/layout/navbar";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { FeaturesSection } from "@/components/home/features-section";
import { GradientBackground } from "@/components/ui/gradient-background";
import { WhySection } from "@/components/home/why-section";
import { CTASection } from "@/components/home/cta-section";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { FeaturedProperties } from "@/components/home/featured-properties";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <GradientBackground />

      {/* Hero Section */}
      <section className="mx-auto grid max-w-[1400px] items-center gap-20 px-8 py-36 lg:grid-cols-2">

        {/* LEFT CONTENT */}
        <div>

          <div className="mb-6 inline-flex rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
            AI-Powered Real Estate Intelligence
          </div>

          <h1 className="max-w-3xl text-6xl font-bold leading-tight tracking-tight md:text-7xl">
            Smarter Property Decisions With AI & Market Intelligence
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-9 text-muted-foreground">
            Analyze properties, predict prices, explore investment insights,
            and discover smarter opportunities with RealStateQ AI.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link
               href="/properties"
              className="rounded-2xl bg-foreground px-8 py-4 text-sm font-medium text-background transition hover:opacity-90"
            >
              Explore Properties
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-border px-8 py-4 text-sm font-medium transition hover:bg-muted"
            >
              Get Started
            </Link>
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center">

          <Image
            src="/images/property-hero-copy.jpg"
            alt="Property Hero"
            width={900}
            height={600}
            className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-2xl"
          />
          <div className="absolute -bottom-10 -left-6 rounded-3xl border border-white/10 bg-card/90 p-5 shadow-xl backdrop-blur-xl">

            <p className="text-xs text-muted-foreground">
              AI Investment Score
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              8.7 / 10
            </h3>

          </div>

          <div className="absolute -right-8 top-10 rounded-3xl border border-white/10 bg-card/90 p-5 shadow-xl backdrop-blur-xl">

            <p className="text-xs text-muted-foreground">
              Price Prediction
            </p>

            <h3 className="mt-1 text-xl font-bold">
              ₹1.24 Cr
            </h3>

          </div>

        </div>

      </section>

      <FeaturedProperties />


      {/* Stats Section */}
      <section className="mx-auto max-w-[1400px] px-8 pb-32">

        <div className="mb-12 text-center">

          <div className="inline-flex rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
            Platform Impact
          </div>

          <h2 className="mt-6 text-5xl font-bold tracking-tight">
            Real Estate Intelligence at Scale
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Transforming property discovery and investment analysis through AI-driven insights.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-card/80 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-4xl font-bold">12K+</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Properties Analyzed
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-card/80 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-4xl font-bold">94%</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              AI Prediction Accuracy
            </p>
          </div>

          <div className="rounded-4xl border border-white/10 bg-card/80 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-3xl font-bold">350+</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Active Brokers
            </p>
          </div>

          <div className="rounded-4xl border border-white/10 bg-card/80 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="text-3xl font-bold">25+</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cities Covered
            </p>
          </div>

        </div>

      </section>
      <DashboardPreview />
      {/* <FeaturesSection /> */}
      <WhySection />
      <CTASection />
      <Footer />

    </main>
  );
}