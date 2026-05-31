"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getUserProfile } from "@/services/auth";
import { getProperties, getSavedProperties, saveProperty, unsaveProperty } from "@/services/property";
import { getRecommendedProperties, RecommendedProperty } from "@/services/recommendation";
import { getUserLeads, BrokerLead } from "@/services/lead";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { useCompareStore } from "@/store/compare-store";
import { calculateInvestmentScore, getRecommendation } from "@/utils/investment";
import Link from "next/link";
import toast from "react-hot-toast";

interface UserActivity {
  id: string;
  type: "saved" | "contacted" | "compared";
  title: string;
  description: string;
  date: Date;
  link: string;
}

export default function UserDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [userLeads, setUserLeads] = useState<BrokerLead[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Zustand compare state
  const addToCompare = useCompareStore((state) => state.addToCompare);
  const isCompared = useCompareStore((state) => state.isCompared);
  const comparedList = useCompareStore((state) => state.selectedProperties);

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
          // 1. Fetch User Profile
          const profileData = await getUserProfile(user.uid);
          setProfile(profileData);

          // 2. Fetch All Properties
          const propertiesData = await getProperties();
          setAllProperties(propertiesData);

          // 3. Fetch User Saved Properties
          const savedData = await getSavedProperties(user.uid);
          setSavedProperties(savedData);

          // 4. Fetch User Leads
          const leadsData = await getUserLeads(user.uid);
          setUserLeads(leadsData);

        } catch (error) {
          console.error("Failed to load user dashboard data:", error);
          toast.error("Error retrieving dashboard details");
        } finally {
          setLoading(false);
        }
      } else {
        setUserId(null);
        setProfile(null);
        setAllProperties([]);
        setSavedProperties([]);
        setUserLeads([]);
        setRecommendations([]);
        setActivities([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Compute recommendations and activity log when base data loads
  useEffect(() => {
    if (loading || !userId) return;

    const computeDashboardExtras = async () => {
      try {
        // --- 1. COMPUTE RECOMMENDATIONS (3 to 5 cards) ---
        let finalRecs: RecommendedProperty[] = [];

        // Try getting recommendations based on the latest saved property first
        if (savedProperties.length > 0) {
          const latestSaved = savedProperties[0]; // Already fetched as sorted or standard
          const engineRecs = await getRecommendedProperties(latestSaved.id);
          finalRecs = [...engineRecs];
        }

        // If recommendations are fewer than 3, supplement with interest-based profile matching
        if (finalRecs.length < 5) {
          const preferredCity = profile?.preferredCity || "Pune";
          const preferredBhk = Number(profile?.preferredBhk) || 2;

          const savedIds = new Set(savedProperties.map((p) => p.id));
          const existingRecIds = new Set(finalRecs.map((r) => r.id));

          // Score candidate properties
          const candidates = allProperties
            .filter((p) => !savedIds.has(p.id) && !existingRecIds.has(p.id))
            .map((property) => {
              let matchScore = 0;
              const reasons: string[] = [];

              // Check city match
              if (property.city?.trim().toLowerCase() === preferredCity.trim().toLowerCase()) {
                matchScore += 4;
                reasons.push(`In preferred city (${preferredCity})`);
              }

              // Check BHK match
              if (Number(property.bhk) === preferredBhk) {
                matchScore += 3;
                reasons.push(`Matches preferred ${preferredBhk} BHK config`);
              }

              // Add weight for investment score
              const invScore = calculateInvestmentScore(property);
              if (invScore >= 8) {
                matchScore += 3;
                reasons.push("Strong Investment Potential");
              } else if (invScore >= 6) {
                matchScore += 2;
                reasons.push("Good Appreciation Potential");
              }

              const matchPercentage = Math.round((matchScore / 10) * 100);

              return {
                id: property.id,
                title: property.title,
                city: property.city,
                location: property.location,
                price: property.price,
                bhk: property.bhk,
                area: property.area,
                imageUrl: property.imageUrl,
                matchScore,
                matchPercentage: Math.min(100, matchPercentage),
                reasons: reasons.length > 0 ? reasons : ["Stable Residential Estate"],
              };
            });

          // Sort candidates by matchScore descending and take the best ones to fill to 5
          const sortedCandidates = candidates.sort((a, b) => b.matchScore - a.matchScore);
          const deficit = 5 - finalRecs.length;
          finalRecs = [...finalRecs, ...sortedCandidates.slice(0, deficit)];
        }

        setRecommendations(finalRecs.slice(0, 5));

        // --- 2. AGGREGATE RECENT ACTIVITY LOG ---
        const activityList: UserActivity[] = [];

        // A. Saved Properties Activities
        savedProperties.forEach((prop, idx) => {
          // Use index/fake diff for ordering if savedAt is missing, or parse savedAt if available
          activityList.push({
            id: `saved-${prop.id}`,
            type: "saved",
            title: "Saved Property Listing",
            description: `You saved "${prop.title}" in ${prop.city}.`,
            date: new Date(Date.now() - idx * 24 * 60 * 60 * 1000), // Dynamic offset
            link: `/property/${prop.id}`,
          });
        });

        // B. Lead Submissions
        userLeads.forEach((lead) => {
          const leadDate = lead.createdAt ? new Date(lead.createdAt.seconds * 1000) : new Date();
          activityList.push({
            id: `lead-${lead.id}`,
            type: "contacted",
            title: "Inquired with Broker",
            description: `Inquired about "${lead.propertyTitle}". Message: "${lead.message.slice(0, 60)}..."`,
            date: leadDate,
            link: `/property/${lead.propertyId}`,
          });
        });

        // C. Compared Properties (Zustand basket)
        comparedList.forEach((comp, idx) => {
          activityList.push({
            id: `compared-${comp.id}`,
            type: "compared",
            title: "Compared Property",
            description: `Added "${comp.title}" to active comparison slots.`,
            date: new Date(Date.now() - idx * 30 * 60 * 1000),
            link: `/compare`,
          });
        });

        // Sort activities: most recent first
        activityList.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivities(activityList.slice(0, 6)); // Top 6 activities

      } catch (error) {
        console.error("Failed to compute dashboard extras:", error);
      }
    };

    computeDashboardExtras();
  }, [loading, userId, savedProperties, userLeads, allProperties, profile, comparedList]);

  // Manage saves directly from dashboard
  const handleSaveToggle = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) return;
    const isCurrentlySaved = savedProperties.some((p) => p.id === propertyId);

    try {
      if (isCurrentlySaved) {
        await unsaveProperty(userId, propertyId);
        setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
        toast.success("Removed from Saved Properties");
      } else {
        await saveProperty(userId, propertyId);
        const addedProp = allProperties.find((p) => p.id === propertyId);
        if (addedProp) {
          setSavedProperties((prev) => [addedProp, ...prev]);
        }
        toast.success("Added to Saved Properties! ❤️");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update save status");
    }
  };

  if (loading) {
    return (
      <RoleProtectedRoute allowedRole="user">
        <DashboardLayout role="user">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Investor Workspace</h2>
              <p className="text-muted-foreground mt-2">
                Explore dynamic predictions, manage interest matches, and view curated market trends.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 active:scale-95"
            >
              🔍 Browse Catalog
            </Link>
          </div>

          {/* MAIN HORIZONTAL METRICS STATS */}
          <StatsCards />

          {/* TWO-COLUMN WHITESPACE OPTIMIZED RESPONSIVE GRID */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* LEFT COLUMN: MAIN CONTENT (2/3 Width) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* 1. RECOMMENDED PROPERTIES SECTION */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    ✨ Recommended For You
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-powered property matches tailored to your profile preferences and saved list context.
                  </p>
                </div>

                <div className="space-y-4">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-sm text-muted-foreground">No matches found. Complete your profile preferences to trigger matching.</p>
                      <Link href="/user/profile" className="mt-3 inline-block text-xs text-blue-400 hover:underline">
                        Set Profile Preferences →
                      </Link>
                    </div>
                  ) : (
                    recommendations.map((rec) => {
                      const isSaved = savedProperties.some((p) => p.id === rec.id);
                      const invScore = calculateInvestmentScore(rec);
                      const recLabel = getRecommendation(invScore);

                      return (
                        <div
                          key={rec.id}
                          className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-white/5 bg-background/30 hover:bg-background/50 hover:border-white/10 transition duration-300"
                        >
                          {/* Image */}
                          <div className="relative h-44 md:w-60 w-full shrink-0 overflow-hidden">
                            <img
                              src={rec.imageUrl?.startsWith("http") ? rec.imageUrl : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80"}
                              alt={rec.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute top-3 left-3 rounded-full bg-emerald-500/90 text-black px-2.5 py-1 text-[10px] font-bold">
                              {rec.matchPercentage}% Match
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex justify-between items-start">
                                <Link href={`/property/${rec.id}`} className="text-lg font-bold text-white hover:text-blue-400 transition line-clamp-1">
                                  {rec.title}
                                </Link>
                                <button
                                  onClick={(e) => handleSaveToggle(e, rec.id)}
                                  className="text-white hover:scale-110 transition ml-2 shrink-0 text-sm"
                                >
                                  {isSaved ? "❤️" : "🤍"}
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground">📍 {rec.location}, {rec.city}</p>
                              
                              {/* Match Reasons */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {rec.reasons.slice(0, 2).map((reason, idx) => (
                                  <span key={idx} className="rounded-md bg-blue-500/10 border border-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                                    ✦ {reason}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <span className="text-lg font-bold text-white">
                                ₹ {rec.price?.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  ⭐ Score {invScore}
                                </span>
                                <Link
                                  href={`/property/${rec.id}`}
                                  className="text-xs text-white hover:underline font-semibold"
                                >
                                  Details →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* 2. SAVED PROPERTIES SUMMARY */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      ❤️ Saved Listings Summary
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quick overview of your watchlist. You have saved {savedProperties.length} properties total.
                    </p>
                  </div>
                  <Link href="/saved-properties" className="text-xs text-blue-400 hover:underline shrink-0">
                    View All ({savedProperties.length}) →
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {savedProperties.length === 0 ? (
                    <div className="col-span-3 text-center py-10 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-sm text-muted-foreground">Your saved list is empty.</p>
                      <Link href="/properties" className="mt-3 inline-block text-xs text-blue-400 hover:underline">
                        Explore properties in catalog →
                      </Link>
                    </div>
                  ) : (
                    savedProperties.slice(0, 3).map((prop) => {
                      const score = calculateInvestmentScore(prop);
                      return (
                        <div
                          key={prop.id}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-background/30 hover:bg-background/50 hover:border-white/10 transition duration-300 h-[260px]"
                        >
                          <div className="relative h-28 w-full overflow-hidden">
                            <img
                              src={prop.imageUrl?.startsWith("http") ? prop.imageUrl : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=500&q=80"}
                              alt={prop.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <button
                              onClick={(e) => handleSaveToggle(e, prop.id)}
                              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center border border-white/10 hover:bg-black/80 transition"
                            >
                              <span className="text-rose-500 text-xs">❤️</span>
                            </button>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <Link href={`/property/${prop.id}`} className="text-sm font-semibold text-white hover:text-blue-400 transition line-clamp-1">
                                {prop.title}
                              </Link>
                              <p className="text-[10px] text-muted-foreground truncate">📍 {prop.location}</p>
                            </div>
                            
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <span className="text-xs font-bold text-white">₹ {prop.price?.toLocaleString()}</span>
                              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                                ⭐ {score}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* 3. RECENT ACTIVITY TIMELINE */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    ⏱️ Recent Activity
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Chronological activity ledger tracking saves, inquiries, and compared listings.
                  </p>
                </div>

                <div className="relative pl-6 border-l border-white/10 space-y-6">
                  {activities.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground pl-0 border-l-0">
                      No recent activities logged on this profile yet.
                    </div>
                  ) : (
                    activities.map((act) => {
                      let typeEmoji = "👁️";
                      let badgeColor = "bg-white/5 text-white border-white/10";
                      
                      if (act.type === "saved") {
                        typeEmoji = "❤️";
                        badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/15";
                      } else if (act.type === "contacted") {
                        typeEmoji = "💬";
                        badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/15";
                      } else if (act.type === "compared") {
                        typeEmoji = "📊";
                        badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/15";
                      }

                      return (
                        <div key={act.id} className="relative group">
                          {/* Timeline dot */}
                          <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full bg-background border border-white/20 flex items-center justify-center text-[9px]">
                            {typeEmoji}
                          </span>
                          
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition">
                                {act.link.startsWith("/") ? (
                                  <Link href={act.link}>{act.title}</Link>
                                ) : (
                                  <span>{act.title}</span>
                                )}
                              </h4>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${badgeColor}`}>
                                {act.type}
                              </span>
                              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                                {act.date.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {act.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: ACTIONS + AI INSIGHTS (1/3 Width) */}
            <div className="space-y-8">
              
              {/* 4. QUICK ACTIONS CARD */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">⚡ Quick Actions</h3>
                  <p className="text-xs text-muted-foreground mt-1">Direct shortcut paths to main tools.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/properties"
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 px-5 py-4 text-sm hover:border-white/20 transition hover:bg-muted/20"
                  >
                    <span>Browse Properties</span>
                    <span className="text-muted-foreground text-xs">→</span>
                  </Link>

                  <Link
                    href="/compare"
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 px-5 py-4 text-sm hover:border-white/20 transition hover:bg-muted/20"
                  >
                    <span className="flex items-center gap-2">
                      Compare Properties
                      {comparedList.length > 0 && (
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold text-blue-400">
                          {comparedList.length} Selected
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground text-xs">→</span>
                  </Link>

                  <Link
                    href="/saved-properties"
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 px-5 py-4 text-sm hover:border-white/20 transition hover:bg-muted/20"
                  >
                    <span>View Saved Properties</span>
                    <span className="text-muted-foreground text-xs">→</span>
                  </Link>

                  <Link
                    href="/user/profile"
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 px-5 py-4 text-sm hover:border-white/20 transition hover:bg-muted/20"
                  >
                    <span>Configure Interests</span>
                    <span className="text-muted-foreground text-xs">→</span>
                  </Link>
                </div>
              </section>

              {/* 5. AI SERVICES CARD */}
              <section className="rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                    AI Workspace
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3 flex items-center gap-2">
                    ✨ AI Services
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Expose underlying platform models and scoring engines.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Investment Intelligence</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Recommendation Engine</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Property Comparison</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>House Price Prediction</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/ai-lab"
                    className="flex w-full items-center justify-center rounded-2xl bg-foreground py-3.5 text-sm font-semibold text-background hover:opacity-90 transition active:scale-95 shadow-md shadow-black/10 cursor-pointer"
                  >
                    Launch AI Lab
                  </Link>
                </div>
              </section>

              {/* 6. VERTICAL AI MARKET INSIGHTS */}
              <InsightsPanel layout="vertical" />

            </div>

          </div>

        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}