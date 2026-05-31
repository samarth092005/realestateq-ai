"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProperties } from "@/services/property";
import { calculateInvestmentScore } from "@/utils/investment";

export function FeaturedProperties() {
  const [featuredList, setFeaturedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const list = await getProperties();
        // Compute investment score for each property and sort by score descending
        const withScores = list.map((property) => ({
          ...property,
          investmentScore: calculateInvestmentScore(property as any),
        }));
        
        withScores.sort((a, b) => b.investmentScore - a.investmentScore);
        
        // Take top 3
        setFeaturedList(withScores.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const formatPrice = (price: number) => {
    if (!price) return "₹0";
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(0)} Lakh`;
    }
    return `₹ ${price.toLocaleString()}`;
  };

  const fallbackProperties = [
    {
      id: "luxury-apartment",
      title: "Luxury Apartment",
      city: "Pune",
      location: "Kalyani Nagar",
      price: 12400000,
      imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80",
      bhk: 3,
      area: 1600,
      investmentScore: 8.5,
    },
    {
      id: "modern-villa",
      title: "Modern Villa",
      city: "Mumbai",
      location: "Bandra West",
      price: 28500000,
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      bhk: 4,
      area: 2500,
      investmentScore: 9.0,
    },
    {
      id: "premium-residency",
      title: "Premium Residency",
      city: "Bangalore",
      location: "Indiranagar",
      price: 9800000,
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
      bhk: 2,
      area: 1100,
      investmentScore: 7.8,
    },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-8 py-28">

      <div className="mb-16 text-center">

        <div className="inline-flex rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
          Featured Properties
        </div>

        <h2 className="mt-6 text-5xl font-bold tracking-tight">
          Discover Premium Real Estate Opportunities
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Explore curated properties enhanced with AI-powered valuation,
          investment scoring and market intelligence.
        </p>

      </div>

      {loading ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-card/60 p-6 backdrop-blur-xl animate-pulse space-y-4 h-[420px]"
            >
              <div className="h-[200px] w-full rounded-2xl bg-white/5"></div>
              <div className="h-6 w-3/4 rounded bg-white/5"></div>
              <div className="h-4 w-1/2 rounded bg-white/5"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {(featuredList.length > 0 ? featuredList : fallbackProperties).map((property) => (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className="group overflow-hidden rounded-[32px] border border-white/10 bg-card/60 transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={
                    property.imageUrl ||
                    property.image ||
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={property.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-xl border border-emerald-500/20 bg-emerald-600/90 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                  ⭐ {property.investmentScore} / 10 Score
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition truncate">
                    {property.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm">
                    📍 {property.location}, {property.city}
                  </p>
                  
                  {property.bhk && property.area && (
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs border border-white/5">
                        {property.bhk} BHK
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs border border-white/5">
                        {property.area} sqft
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xl font-bold text-white">
                    {typeof property.price === "number" ? formatPrice(property.price) : property.price}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground group-hover:text-white transition">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}