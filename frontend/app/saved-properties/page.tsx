"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSavedProperties, unsaveProperty } from "@/services/property";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import Link from "next/link";
import toast from "react-hot-toast";
import { BackToDashboard } from "@/components/layout/back-to-dashboard";
import { useCompareStore } from "@/store/compare-store";
import { calculateInvestmentScore, getRecommendation } from "@/utils/investment";

export default function SavedPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const addToCompare = useCompareStore((state) => state.addToCompare);
  const isCompared = useCompareStore((state) => state.isCompared);

  const handleCompareToggle = (e: React.MouseEvent, property: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(property);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const data = await getSavedProperties(user.uid);
          setProperties(data);
        } catch (error) {
          console.error("Failed to load saved properties:", error);
          toast.error("Failed to load saved properties");
        } finally {
          setLoading(false);
        }
      } else {
        setUserId(null);
        setProperties([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUnsave = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;

    try {
      await unsaveProperty(userId, propertyId);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      toast.success("Property removed from saved list");
    } catch (error) {
      console.error(error);
      toast.error("Failed to unsave property");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout role="user">
        <main className="space-y-8">
          <BackToDashboard />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Saved Properties</h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Manage your saved listings and explore their investment metrics.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-[32px] border border-border bg-card/40 py-20 text-center backdrop-blur-xl">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-2xl font-bold">No saved properties yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
                Explore available listings in the catalog and click the heart icon to save them here.
              </p>
              <Link
                href="/properties"
                className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((property) => {
                const investmentScore = calculateInvestmentScore(property);
                const recommendation = getRecommendation(investmentScore);

                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.id}`}
                    className="group flex flex-col md:flex-row overflow-hidden rounded-[32px] border border-border bg-card/60 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                  >
                    {/* IMAGE */}
                    <div className="h-[260px] w-full md:w-[400px] shrink-0 relative">
                      <img
                        src={
                          property.imageUrl?.startsWith("http")
                            ? property.imageUrl
                            : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
                        }
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={(e) => handleUnsave(e, property.id)}
                        className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 border border-white/20 hover:bg-black/60 transition"
                        title="Remove from Saved"
                      >
                        <span className="text-rose-500 text-lg">❤️</span>
                      </button>
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-1 flex-col justify-center p-8">
                      <h2 className="text-3xl font-bold">
                        {property.title}
                      </h2>

                      <p className="mt-2 text-muted-foreground">
                        📍 {property.location}, {property.city}
                      </p>

                      <p className="mt-5 text-3xl font-bold text-foreground">
                        ₹ {property.price?.toLocaleString()}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="rounded-full border border-border bg-muted/30 px-4 py-2 text-sm text-foreground">
                          {property.bhk} BHK
                        </span>

                        <span className="rounded-full border border-border bg-muted/30 px-4 py-2 text-sm text-foreground">
                          {property.area} sqft
                        </span>

                        <span className="rounded-full border border-border bg-muted/30 px-4 py-2 text-sm text-foreground">
                          Residential
                        </span>
                        <span className="rounded-full border border-border bg-muted/30 px-4 py-2 text-sm text-foreground">
                          Ready To Move
                        </span>
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ⭐ Score {investmentScore}
                        </span>

                        <span className="text-sm text-muted-foreground">
                          {recommendation}
                        </span>
                      </div>

                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <span className="font-medium text-primary hover:underline">
                          View Details & Insights →
                        </span>
                        <button
                          onClick={(e) => handleCompareToggle(e, property)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                            isCompared(property.id)
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "bg-muted/50 text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {isCompared(property.id) ? "Selected" : "Compare"}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
