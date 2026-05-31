"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCompareStore, Property } from "@/store/compare-store";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { BackToDashboard } from "@/components/layout/back-to-dashboard";
import { getPropertyIntelligence } from "@/utils/investment";

export default function ComparePage() {
  const { selectedProperties, removeFromCompare, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <ProtectedRoute>
        <DashboardLayout role="user">
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Calculate intelligence metrics for selected properties
  const propertiesWithMetrics = selectedProperties.map((p) => ({
    ...p,
    metrics: getPropertyIntelligence(p),
  }));

  const hasTwoProperties = selectedProperties.length === 2;

  // Determine the best investment choice if we have 2 properties
  let recommendedProperty: any = null;
  let reasonDetails: string[] = [];

  if (hasTwoProperties) {
    const propA = propertiesWithMetrics[0];
    const propB = propertiesWithMetrics[1];

    if (propA.metrics.investmentScore > propB.metrics.investmentScore) {
      recommendedProperty = propA;
    } else if (propB.metrics.investmentScore > propA.metrics.investmentScore) {
      recommendedProperty = propB;
    } else {
      // In case of a tie, default to Property A but indicate a high-level tie
      recommendedProperty = propA;
    }

    if (recommendedProperty) {
      const otherProperty = recommendedProperty.id === propA.id ? propB : propA;
      
      // Reason 1: Score comparison
      if (recommendedProperty.metrics.investmentScore > otherProperty.metrics.investmentScore) {
        reasonDetails.push(
          `Higher investment score of ${recommendedProperty.metrics.investmentScore}/10 compared to ${otherProperty.metrics.investmentScore}/10`
        );
      } else {
        reasonDetails.push(
          `Excellent investment score of ${recommendedProperty.metrics.investmentScore}/10 matching alternative choice`
        );
      }

      // Reason 2: Growth potential comparison
      if (
        recommendedProperty.metrics.growthPotential === "High" &&
        otherProperty.metrics.growthPotential === "Medium"
      ) {
        reasonDetails.push(
          `Stronger growth potential (High Growth in ${recommendedProperty.city} vs Medium Growth in ${otherProperty.city})`
        );
      } else if (recommendedProperty.metrics.growthPotential === "High") {
        reasonDetails.push(`Located in highly prospective growth market (${recommendedProperty.city})`);
      }

      // Reason 3: Risk level comparison
      const riskRank: Record<string, number> = { "Low Risk": 1, "Medium Risk": 2, "High Risk": 3 };
      const rankRec = riskRank[recommendedProperty.metrics.riskLevel];
      const rankOther = riskRank[otherProperty.metrics.riskLevel];

      if (rankRec < rankOther) {
        reasonDetails.push(
          `Lower risk profile (${recommendedProperty.metrics.riskLevel} vs ${otherProperty.metrics.riskLevel})`
        );
      } else {
        reasonDetails.push(`Favorable risk profile (${recommendedProperty.metrics.riskLevel})`);
      }
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout role="user">
        <main className="mx-auto max-w-[1400px] space-y-8 pb-20">
          <BackToDashboard />

          {/* Page Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Compare Properties</h1>
              <p className="mt-2 text-base text-muted-foreground">
                Compare investment potential, pricing, and property metrics side-by-side.
              </p>
            </div>
            {selectedProperties.length > 0 && (
              <button
                onClick={clearCompare}
                className="self-start rounded-2xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted shadow-sm cursor-pointer"
              >
                Clear Comparison
              </button>
            )}
          </div>

          {/* Empty / Single State */}
          {!hasTwoProperties ? (
            <div className="rounded-[32px] border border-border bg-card p-10 text-center shadow-sm sm:p-20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-3xl">
                📊
              </div>
              <h3 className="text-2xl font-bold text-foreground">Compare Side-by-Side</h3>
              
              {selectedProperties.length === 1 ? (
                <div className="mx-auto mt-4 max-w-md">
                  <p className="text-sm text-muted-foreground">
                    You have selected **1 property** so far. Select one more property from the catalog or your saved properties to unlock comprehensive investment intelligence.
                  </p>
                  
                  {/* Current single property preview */}
                  <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-background p-4 text-left shadow-sm">
                    <img
                      src={
                        selectedProperties[0].imageUrl?.startsWith("http")
                          ? selectedProperties[0].imageUrl
                          : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={selectedProperties[0].title}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-foreground">
                        {selectedProperties[0].title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        📍 {selectedProperties[0].location}, {selectedProperties[0].city}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCompare(selectedProperties[0].id)}
                      className="rounded-xl bg-muted border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-red-500 hover:text-white transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Select up to 2 properties from the catalog to run direct investment evaluation, scoring, and risk profiling.
                </p>
              )}

              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/properties"
                  className="rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95 shadow animate-fadeIn"
                >
                  Browse Properties
                </Link>
                <Link
                  href="/saved-properties"
                  className="rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-95 shadow-sm"
                >
                  Saved List
                </Link>
              </div>
            </div>
          ) : (
            /* Comparison Interface */
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              
              {/* Left Side: Comparison Matrix */}
              <div className="overflow-hidden rounded-[32px] border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Specification
                        </th>
                        {propertiesWithMetrics.map((property) => (
                          <th
                            key={property.id}
                            className="p-6 text-sm font-bold text-foreground max-w-[250px] sm:max-w-[300px]"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-background">
                                <img
                                  src={
                                    property.imageUrl?.startsWith("http")
                                      ? property.imageUrl
                                      : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80"
                                  }
                                  alt={property.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <button
                                  onClick={() => removeFromCompare(property.id)}
                                  className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-xs font-bold text-white hover:bg-red-500 hover:text-white transition cursor-pointer"
                                  title="Remove from Compare"
                                >
                                  ✕
                                </button>
                              </div>
                              <span className="truncate text-base font-bold sm:text-lg text-foreground">
                                {property.title}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      
                      {/* Price */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">Price</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6 text-lg font-bold text-foreground">
                            ₹ {p.price?.toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      {/* City */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">City</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6 text-sm text-foreground font-medium">
                            {p.city}
                          </td>
                        ))}
                      </tr>

                      {/* Location */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">Location</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6 text-sm text-muted-foreground font-medium">
                            {p.location}
                          </td>
                        ))}
                      </tr>

                      {/* BHK */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">BHK Configuration</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6 text-sm text-foreground font-medium">
                            {p.bhk} BHK
                          </td>
                        ))}
                      </tr>

                      {/* Area */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">Total Area</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6 text-sm text-foreground font-medium">
                            {p.area} sqft
                          </td>
                        ))}
                      </tr>

                      {/* Investment Score */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">AI Score</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6">
                            <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              ⭐ {p.metrics.investmentScore} / 10
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Growth Potential */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">Growth Potential</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                p.metrics.growthPotential === "High"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                              }`}
                            >
                              {p.metrics.growthPotential}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Rental Potential */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">Rental Potential</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                p.metrics.rentalPotential === "High"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : p.metrics.rentalPotential === "Medium"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {p.metrics.rentalPotential}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Risk Level */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">Risk Level</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                p.metrics.riskLevel === "Low Risk"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : p.metrics.riskLevel === "Medium Risk"
                                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                              }`}
                            >
                              {p.metrics.riskLevel}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* AI Recommendation */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">AI Recommendation</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6">
                            <span
                              className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold border ${
                                p.metrics.recommendation === "Strong Buy"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : p.metrics.recommendation === "Good Opportunity"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {p.metrics.recommendation}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Actions */}
                      <tr>
                        <td className="p-6 text-sm font-semibold text-muted-foreground">Actions</td>
                        {propertiesWithMetrics.map((p) => (
                          <td key={p.id} className="p-6">
                            <div className="flex flex-col gap-2.5 sm:flex-row">
                              <Link
                                href={`/property/${p.id}`}
                                className="inline-flex justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition shadow-sm"
                              >
                                View Details
                              </Link>
                              <button
                                onClick={() => removeFromCompare(p.id)}
                                className="inline-flex justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-red-500 hover:text-white transition cursor-pointer shadow-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        ))}
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Side: Intelligence Insights */}
              <div className="space-y-6">
                
                {/* Winner Card */}
                {recommendedProperty && (
                  <div className="rounded-[32px] border border-blue-500/20 bg-blue-500/10 p-8 shadow-md">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Intelligence Report
                    </p>
                    <h3 className="mt-3 text-2xl font-extrabold text-foreground">
                      Best Investment Choice
                    </h3>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-4 rounded-2xl bg-background p-4 border border-border shadow-sm">
                        <img
                          src={
                            recommendedProperty.imageUrl?.startsWith("http")
                              ? recommendedProperty.imageUrl
                              : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=200&q=80"
                          }
                          alt={recommendedProperty.title}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                            🏆 Recommended Property
                          </p>
                          <h4 className="truncate text-sm font-bold text-foreground mt-1">
                            {recommendedProperty.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ₹ {recommendedProperty.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-sm font-bold text-foreground mb-3">
                          Why this property stands out:
                        </p>
                        <ul className="space-y-3">
                          {reasonDetails.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                              <span className="text-emerald-500 dark:text-emerald-400 font-bold shrink-0">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Card */}
                <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm">
                  <h4 className="text-base font-bold text-foreground">How we analyze properties</h4>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Our platform computes intelligence rankings dynamically. Scores are weighted heavily based on high-demand metro regions (Mumbai, Bangalore, Pune), layout spacing efficiency, rental return expectations, and target risk factors.
                  </p>
                  <div className="mt-5 space-y-2 border-t border-border pt-5 text-[11px] text-muted-foreground">
                    <p>• **High Demand**: Cities with proven real-estate compounding indicators receive boost multipliers.</p>
                    <p>• **Rental Thresholds**: Space size above 800 and 1200 sqft mark rental demand triggers.</p>
                    <p>• **Risk Management**: Strong score thresholds correlate directly to solid investment reliability.</p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
