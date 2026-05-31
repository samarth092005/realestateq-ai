"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface StatItem {
  title: string;
  value: string | number;
  change: string;
}

export function StatsCards() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const docRef = doc(db, "analytics", "global_stats");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStats([
            {
              title: "Properties Analyzed",
              value: data.propertiesAnalyzed?.toLocaleString() ?? "12,480",
              change: "+18.2%",
            },
            {
              title: "AI Prediction Accuracy",
              value: `${data.predictionAccuracy ?? 94}%`,
              change: "+4.3%",
            },
            {
              title: "Investment Opportunities",
              value: data.investmentOpportunities?.toLocaleString() ?? "248",
              change: "+12.7%",
            },
            {
              title: "Active Brokers",
              value: `${data.activeBrokers ?? 350}+`,
              change: "+9.1%",
            },
          ]);
        } else {
          // Fallback if not seeded yet
          setStats([
            { title: "Properties Analyzed", value: "12,480", change: "+18.2%" },
            { title: "AI Prediction Accuracy", value: "94%", change: "+4.3%" },
            { title: "Investment Opportunities", value: "248", change: "+12.7%" },
            { title: "Active Brokers", value: "350+", change: "+9.1%" },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch global stats:", err);
        setError(true);
        // Fallback default set in case of query failure
        setStats([
          { title: "Properties Analyzed", value: "12,480", change: "+18.2%" },
          { title: "AI Prediction Accuracy", value: "94%", change: "+4.3%" },
          { title: "Investment Opportunities", value: "248", change: "+12.7%" },
          { title: "Active Brokers", value: "350+", change: "+9.1%" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-[28px] border border-white/10 bg-card/60 p-6 backdrop-blur-xl animate-pulse h-32 flex flex-col justify-between"
          >
            <div className="h-4 w-1/2 rounded bg-white/5"></div>
            <div className="h-8 w-1/3 rounded bg-white/5"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-[28px] border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20"
        >
          <p className="text-sm text-muted-foreground">
            {stat.title}
          </p>
          <div className="mt-4 flex items-end justify-between">
            <h2 className="text-4xl font-bold tracking-tight">
              {stat.value}
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}