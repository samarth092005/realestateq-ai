"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getUserProfile } from "@/services/auth";
import { getBrokerProperties } from "@/services/property";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { doc, updateDoc } from "firebase/firestore";
import { calculateInvestmentScore } from "@/utils/investment";
import toast from "react-hot-toast";

export default function BrokerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Broker specific fields state
  const [brokerBio, setBrokerBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [specializationTags, setSpecializationTags] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Fetch broker's profile
          const profileData = await getUserProfile(user.uid);
          setProfile(profileData);

          if (profileData) {
            setBrokerBio(profileData.brokerBio || "");
            setExperienceYears(profileData.experienceYears !== undefined ? String(profileData.experienceYears) : "");
            setSpecializationTags(profileData.specializationTags || "");
          }

          // 2. Fetch broker's actual listings
          const brokerListings = await getBrokerProperties(user.uid);
          setProperties(brokerListings);
        } catch (error) {
          console.error("Failed to load broker analytics data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setProperties([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setSavingProfile(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const expNum = experienceYears === "" ? 0 : Number(experienceYears);
      await updateDoc(userRef, {
        brokerBio,
        experienceYears: isNaN(expNum) ? 0 : expNum,
        specializationTags,
      });

      // Update local state
      setProfile((prev: any) => ({
        ...prev,
        brokerBio,
        experienceYears: isNaN(expNum) ? 0 : expNum,
        specializationTags,
      }));

      toast.success("Broker profile updated successfully! 🏢");
    } catch (error) {
      console.error("Failed to update broker profile:", error);
      toast.error("Failed to save broker profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <RoleProtectedRoute allowedRole="broker">
        <DashboardLayout role="broker">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <RoleProtectedRoute allowedRole="broker">
        <DashboardLayout role="broker">
          <div className="text-center py-20">
            <h3 className="text-xl font-bold">Failed to load broker profile</h3>
            <p className="text-muted-foreground mt-2 text-sm">Please refresh the page or try logging in again.</p>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  // Perform dynamic portfolio math calculations
  const totalListed = properties.length;
  const portfolioValue = properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const avgPrice = totalListed > 0 ? Math.round(portfolioValue / totalListed) : 0;
  
  // Unique cities list
  const citiesSet = new Set(properties.map((p) => p.city?.trim()).filter(Boolean));
  const citiesCovered = citiesSet.size > 0 ? Array.from(citiesSet).join(", ") : "None";

  // Calculate portfolio-wide average investment score
  const avgInvestmentScore =
    totalListed > 0
      ? Number(
          (properties.reduce((sum, p) => sum + calculateInvestmentScore(p), 0) / totalListed).toFixed(1)
        )
      : 0;

  // Render variables
  const formattedJoinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "May 2026";

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "B";

  // Rule-based insights generation
  const activeCity = Array.from(citiesSet)[0] || "";
  const presenceInsight = activeCity 
    ? `Strong Portfolio Presence in ${activeCity}` 
    : "Expanding Market Coverage";
    
  const portfolioStrength = avgInvestmentScore >= 8 
    ? "Premium Elite Portfolio" 
    : avgInvestmentScore >= 7 
    ? "High-Yield Portfolio" 
    : "Standard Growth Portfolio";

  const activityStatus = totalListed >= 5 
    ? "Highly Active Agent" 
    : totalListed >= 1 
    ? "Active Listing Agent" 
    : "No Listings Active";

  return (
    <RoleProtectedRoute allowedRole="broker">
      <DashboardLayout role="broker">
        <main className="mx-auto max-w-5xl space-y-8 pb-12">
          {/* HEADER SECTION */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Broker Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Monitor active market inventory, calculate dynamic asset values, and review your professional profile.
            </p>
          </div>

          {/* SECTION A - BROKER HEADER */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl transition duration-300 hover:border-white/20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[100px]"></div>

            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-tr from-emerald-500 to-blue-400 text-3xl font-bold text-black shadow-xl shadow-emerald-500/10 overflow-hidden">
                {auth.currentUser?.photoURL ? (
                  <img
                    src={auth.currentUser.photoURL}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Bio Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/15">
                    Verified Broker Partner
                  </span>
                </div>
                <p className="text-muted-foreground">{profile.email}</p>
                {profile.brokerBio && (
                  <p className="text-sm text-muted-foreground/80 max-w-xl italic mt-1 leading-relaxed">
                    "{profile.brokerBio}"
                  </p>
                )}
                <p className="text-xs text-muted-foreground/60">
                  🗓️ Partner since {formattedJoinDate}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SECTION B - BROKER INFORMATION */}
            <div className="rounded-[32px] border border-white/10 bg-card/40 p-8 backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6">Broker Information</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Company Representative</span>
                  <span className="font-semibold">{profile.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Corporate Email</span>
                  <span className="font-semibold">{profile.email}</span>
                </div>
                {profile.experienceYears !== undefined && profile.experienceYears !== 0 && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Years of Experience</span>
                    <span className="font-semibold">{profile.experienceYears} Years</span>
                  </div>
                )}
                {profile.specializationTags && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Specializations</span>
                    <span className="font-semibold text-right max-w-[220px] truncate" title={profile.specializationTags}>
                      {profile.specializationTags}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    Active License
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Joined Date</span>
                  <span className="font-semibold">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "May 30, 2026"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-muted-foreground">Broker ID Reference</span>
                  <span className="font-mono text-xs text-muted-foreground/80 bg-background/50 rounded-xl p-3 border border-white/5 break-all select-all">
                    {profile.uid}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION E - PERFORMANCE INSIGHTS */}
            <div className="rounded-[32px] border border-white/10 bg-card/40 p-8 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-6">Operational Insights</h3>
                
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-background/30 p-4">
                    <span className="text-xs text-muted-foreground block mb-1">Portfolio Strategy</span>
                    <span className="text-sm font-bold text-white">{presenceInsight}</span>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-background/30 p-4">
                    <span className="text-xs text-muted-foreground block mb-1">Asset Composition</span>
                    <span className="text-sm font-bold text-white">{portfolioStrength}</span>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-background/30 p-4">
                    <span className="text-xs text-muted-foreground block mb-1">Market Activity Level</span>
                    <span className="text-sm font-bold text-white">{activityStatus}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/60 mt-6 italic">
                💡 Insights are generated automatically using standard real-estate metrics matching your listed properties.
              </p>
            </div>
          </div>

          {/* SECTION C - BROKER STATISTICS */}
          <div className="rounded-[32px] border border-white/10 bg-card/40 p-8 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-6">Listing Performance & Analytics</h3>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stat 1 */}
              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <p className="text-xs text-muted-foreground">Properties Listed</p>
                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold">{totalListed}</h4>
                  <span className="text-xl">🏢</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <p className="text-xs text-muted-foreground">Active Catalog Items</p>
                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold">{totalListed}</h4>
                  <span className="text-xl">✅</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <p className="text-xs text-muted-foreground">
                  Portfolio Value
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold">
                    ₹ {(portfolioValue / 100000).toFixed(1)}L
                  </h4>

                  <span className="text-xl">
                    💰
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <p className="text-xs text-muted-foreground">Average Investment Rating</p>
                <div className="mt-3 flex items-end justify-between">
                  <h4 className="text-3xl font-bold text-emerald-400">{avgInvestmentScore}/10</h4>
                  <span className="text-xl">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* EDIT BROKER DETAILS CARD */}
          <div className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Edit Broker Profile</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize your corporate details, experience level, and professional bio.
                </p>
              </div>
              <button
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="inline-flex items-center justify-center rounded-2xl bg-foreground px-5 py-3 text-xs font-semibold text-background transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {savingProfile ? "Saving Profile..." : "Save Broker Details"}
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="broker-exp" className="text-xs text-muted-foreground">Years of Experience</label>
                <input
                  id="broker-exp"
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 5"
                  className="rounded-2xl border border-white/10 bg-background/50 p-4 text-sm text-foreground focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="broker-specs" className="text-xs text-muted-foreground">Area Specializations (comma-separated)</label>
                <input
                  id="broker-specs"
                  type="text"
                  value={specializationTags}
                  onChange={(e) => setSpecializationTags(e.target.value)}
                  placeholder="e.g. Luxury Estates, Commercial Land, Pune Resale"
                  className="rounded-2xl border border-white/10 bg-background/50 p-4 text-sm text-foreground focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="broker-bio" className="text-xs text-muted-foreground">Corporate Bio</label>
                <textarea
                  id="broker-bio"
                  value={brokerBio}
                  onChange={(e) => setBrokerBio(e.target.value)}
                  placeholder="Describe your brokerage services, regional focus, and value proposition..."
                  rows={4}
                  className="rounded-2xl border border-white/10 bg-background/50 p-4 text-sm text-foreground focus:outline-none focus:border-white/20 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION D - PORTFOLIO OVERVIEW */}
          <div className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-6">Financial Portfolio Breakdown</h3>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <span className="text-xs text-muted-foreground block mb-2">Total Valuation Volume</span>
                <span className="text-2xl font-bold block truncate">₹ {portfolioValue.toLocaleString()}</span>
              </div>

              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <span className="text-xs text-muted-foreground block mb-2">Average Catalog Price</span>
                <span className="text-2xl font-bold block truncate">₹ {avgPrice.toLocaleString()}</span>
              </div>

              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <span className="text-xs text-muted-foreground block mb-2">Cities Covered</span>
                <span className="text-sm font-bold block truncate mt-1 text-white">{citiesCovered}</span>
              </div>

              <div className="rounded-2xl border border-white/5 bg-background/40 p-5">
                <span className="text-xs text-muted-foreground block mb-2">Dominant Segment</span>
                <span className="text-sm font-bold block truncate mt-1 text-white">Residential Spaces</span>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}
