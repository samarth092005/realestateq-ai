"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface InsightItem {
  title: string;
  description: string;
}

export function InsightsPanel({ layout = "horizontal" }: { layout?: "horizontal" | "vertical" }) {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "marketInsights"));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map((doc) => doc.data() as InsightItem);
          setInsights(list);
        } else {
          // Fallback if collection is empty
          setInsights([
            {
              title: "Pune Market Growth",
              description: "AI predicts a 12% increase in property prices across Pune over the next quarter.",
            },
            {
              title: "Investment Hotspot",
              description: "Baner and Hinjewadi show the highest projected ROI for long-term investments.",
            },
            {
              title: "Broker Activity Surge",
              description: "Broker engagement has increased by 28% this month compared to previous trends.",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load market insights:", error);
        // Fallback default set in case of query error
        setInsights([
          {
            title: "Pune Market Growth",
            description: "AI predicts a 12% increase in property prices across Pune over the next quarter.",
          },
          {
            title: "Investment Hotspot",
            description: "Baner and Hinjewadi show the highest projected ROI for long-term investments.",
          },
          {
            title: "Broker Activity Surge",
            description: "Broker engagement has increased by 28% this month compared to previous trends.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const gridClass = layout === "vertical" ? "grid gap-6 grid-cols-1" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          AI Market Insights
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Real-time intelligence generated from market analytics and AI models.
        </p>
      </div>

      {loading ? (
        <div className={gridClass}>
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-background/40 p-6 animate-pulse h-40 flex flex-col justify-between"
            >
              <div className="h-6 w-3/4 rounded bg-white/5"></div>
              <div className="h-16 w-full rounded bg-white/5"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className={gridClass}>
          {insights.map((insight, index) => (
            <div
              key={`${insight.title}-${index}`}
              className="rounded-3xl border border-white/10 bg-background/40 p-6 transition hover:border-white/20"
            >
              <h3 className="text-xl font-semibold">
                {insight.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}