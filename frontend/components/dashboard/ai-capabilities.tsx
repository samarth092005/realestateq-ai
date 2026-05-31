"use client";

import React from "react";

interface Capability {
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}

export function AICapabilities() {
  const capabilities: Capability[] = [
    {
      title: "Investment Intelligence",
      description: "Automated analysis of property attributes (area, BHK, and location) to determine high-yield real estate opportunities and risk ratios.",
      badge: "Firestore Engine",
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Recommendation Engine",
      description: "Curates property suggestions by correlating user search preferences, budget constraints, and active saved listing histories.",
      badge: "Real-time Matching",
      icon: (
        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      title: "Property Comparison",
      description: "Exposes comparative matrices calculating feature differences, BHK ratios, pricing layouts, and localized value index spreads side-by-side.",
      badge: "Vector Analysis",
      icon: (
        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      ),
    },
    {
      title: "XGBoost Valuation Model",
      description: "An advanced gradient boosted regressor trained on the Ames Housing Dataset. Executes high-dimensional inferences using 80 numerical and categorical parameters.",
      badge: "92.67% R² Accuracy",
      icon: (
        <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "FastAPI Inference Engine",
      description: "Asynchronous backend endpoint managing row-level transformations, median imputations, and predictive scaling dynamically in sub-10ms speeds.",
      badge: "High Performance",
      icon: (
        <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeMiterlimit={10} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6" />
        </svg>
      ),
    },
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
          Core Architecture
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
          AI & ML Platform Capabilities
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          A visualization of our production intelligence layers, showing proprietary scoring engines, vector matching pipelines, and XGBoost regressors.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-background/20 p-6 transition duration-300 hover:border-white/20 hover:bg-background/40 hover:-translate-y-0.5"
          >
            <div>
              {/* Icon & Badge Header */}
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-white/5 p-3 group-hover:bg-white/10 transition">
                  {cap.icon}
                </div>
                {cap.badge && (
                  <span className="rounded-md bg-white/4 border border-white/5 px-2 py-0.5 text-[9px] font-bold text-muted-foreground group-hover:text-white transition">
                    {cap.badge}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="mt-5 text-xl font-semibold text-white group-hover:text-blue-400 transition">
                {cap.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90 transition">
                {cap.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
