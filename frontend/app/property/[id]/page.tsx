"use client";

import { useEffect, useState } from "react";
import { getPropertyById, saveProperty, unsaveProperty, checkIfPropertySaved } from "@/services/property";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { BackToDashboard } from "@/components/layout/back-to-dashboard";
import { getRecommendedProperties, RecommendedProperty } from "@/services/recommendation";
import Link from "next/link";
import { getUserProfile } from "@/services/auth";
import { ContactBrokerModal } from "@/components/property/contact-broker-modal";
import { doc, getDoc } from "firebase/firestore";
import { getPropertyIntelligence, generatePropertyInsights, CityIntelligence } from "@/utils/investment";

export default function PropertyDetailsPage() {

  const params = useParams();
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);

  // Contact Broker Lead States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null);
  
  const [cityConfig, setCityConfig] = useState<Record<string, CityIntelligence> | undefined>(undefined);

  useEffect(() => {
    const fetchCityConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "config", "city_intelligence"));
        if (configDoc.exists()) {
          setCityConfig(configDoc.data() as Record<string, CityIntelligence>);
        }
      } catch (e) {
        console.error("Failed to load city intelligence config:", e);
      }
    };
    fetchCityConfig();
  }, []);

  useEffect(() => {
    if (!params.id) return;

    const fetchProperty = async () => {
      setLoadingProperty(true);
      setErrorLoading(false);
      try {
        const data = await getPropertyById(params.id as string);
        if (!data) {
          setErrorLoading(true);
          toast.error("Property listing not found.");
        } else {
          setProperty(data);
        }
      } catch (error) {
        console.error("Error loading property:", error);
        setErrorLoading(true);
        toast.error("Failed to load property details. Please try again.");
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchProperty();

  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;

    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const recs = await getRecommendedProperties(params.id as string);
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [params.id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          if (params.id) {
            const saved = await checkIfPropertySaved(user.uid, params.id as string);
            setIsSaved(saved);
          }
          
          // Prefetch full user profile from Firestore for Contact Broker form pre-filling
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile({
              name: profile.name || user.displayName || "",
              email: profile.email || user.email || "",
            });
          } else {
            setUserProfile({
              name: user.displayName || "",
              email: user.email || "",
            });
          }
        } catch (e) {
          console.error("Failed to check user details:", e);
          setUserProfile({
            name: user.displayName || "",
            email: user.email || "",
          });
        }
      } else {
        setUserId(null);
        setIsSaved(false);
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, [params.id]);

  const handleContactBrokerClick = () => {
    if (!userId) {
      toast.error("Please login to contact the broker");
      router.push("/login");
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveToggle = async () => {
    if (!userId || !params.id) {
      toast.error("Please login to save properties");
      return;
    }

    try {
      if (isSaved) {
        await unsaveProperty(userId, params.id as string);
        setIsSaved(false);
        toast.success("Property unsaved");
      } else {
        await saveProperty(userId, params.id as string);
        setIsSaved(true);
        toast.success("Property saved! ❤️");
      }
    } catch (e) {
      console.error(e);
      toast.error("Action failed");
    }
  };



  if (loadingProperty) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
      </div>
    );
  }

  if (errorLoading || !property) {
    return (
      <main className="mx-auto max-w-[1600px] px-8 py-10">
        <BackToDashboard />
        <div className="rounded-[32px] border border-white/10 bg-card/40 p-12 text-center backdrop-blur-xl">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-xl font-bold mt-4">Failed to load property details</h3>
          <p className="text-muted-foreground mt-2 text-sm">The listing may have been removed or you may have lost internet connectivity.</p>
        </div>
      </main>
    );
  }

  const intel = getPropertyIntelligence(property, cityConfig);
  const insights = generatePropertyInsights(property, intel.investmentScore);

 return (
  <main className="mx-auto max-w-[1600px] px-8 py-10">
    <BackToDashboard />

    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">

      {/* LEFT SIDE */}

      <div>

        <img
          src={
            property.imageUrl?.startsWith("http")
              ? property.imageUrl
              : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
          }
          alt={property.title}
          className="h-[420px] w-full rounded-[32px] object-cover"
        />

        <div className="mt-8 rounded-[32px] border border-white/10 bg-card/40 p-8">

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-5xl font-bold">
              {property.title}
            </h1>

            <button
              onClick={handleSaveToggle}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-card/60 hover:bg-card transition hover:border-white/20"
              title={isSaved ? "Unsave Property" : "Save Property"}
            >
              <span className={isSaved ? "text-rose-500 text-2xl" : "text-white text-2xl"}>
                {isSaved ? "❤️" : "🤍"}
              </span>
            </button>
          </div>

          <p className="mt-3 text-lg text-muted-foreground">
            📍 {property.location}, {property.city}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <h2 className="text-4xl font-bold">
              ₹ {property.price?.toLocaleString()}
            </h2>

            {/* AI Investment Badge */}
            <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold backdrop-blur-md shadow-sm select-none ${
              intel.investmentScore >= 8 
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : intel.investmentScore >= 6
                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}>
              <span className="text-[10px]">✨ AI:</span>
              <span>
                {intel.investmentScore >= 8 
                  ? "Strong Buy" 
                  : intel.investmentScore >= 6
                  ? "Good Opportunity"
                  : "Moderate Risk"}
              </span>
              <span className="opacity-40">|</span>
              <span>{intel.investmentScore} / 10</span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-background/30 p-5">

  <p className="text-muted-foreground">
    A {property.bhk} BHK residential property located in
    {property.location}, {property.city} with
    {property.area} sqft area and strong investment potential.
  </p>

</div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm text-muted-foreground">
                BHK
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {property.bhk}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm text-muted-foreground">
                Area
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {property.area} sqft
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm text-muted-foreground">
                Type
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Residential
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm text-muted-foreground">
                Status
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Ready To Move
              </h3>
            </div>

          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-8 rounded-[32px] border border-white/10 bg-card/40 p-8">

          <h3 className="text-2xl font-semibold">
            Description
          </h3>

          <p className="mt-4 text-muted-foreground">
            {property.description}
          </p>

        </div>

        {/* AI INSIGHTS */}

        <div className="mt-8 rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8">

          <h3 className="text-2xl font-semibold">
            AI Insights
          </h3>

          <div className="mt-6 space-y-3 text-muted-foreground">

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {insights.map((insight, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 p-4">
                  {insight}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="space-y-6">

        <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-8">

          <p className="text-sm text-muted-foreground">
            Investment Score
          </p>

          <h2 className="mt-3 text-5xl font-bold text-emerald-400">
            {intel.investmentScore}/10
          </h2>

        </div>

        <div className="rounded-[32px] border border-blue-500/20 bg-blue-500/10 p-8">

          <p className="text-sm text-muted-foreground">
            Recommendation
          </p>

          <h3 className="mt-3 text-2xl font-bold text-blue-400">
            {intel.recommendation}
          </h3>

        </div>

        <div className="rounded-[32px] border border-white/10 bg-card/40 p-8">

          <h3 className="text-xl font-semibold">
            Investment Analysis
          </h3>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between">
              <span>Rental Potential</span>
              <span>{intel.rentalPotential}</span>
            </div>

            <div className="flex justify-between">
              <span>Growth Potential</span>
              <span>{intel.growthPotential}</span>
            </div>

            <div className="flex justify-between">
              <span>Risk Level</span>
              <span>{intel.riskLevel}</span>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-card/40 p-8">

  <h3 className="text-xl font-semibold">
    Property Highlights
  </h3>

  <div className="mt-5 space-y-3">

    <div className="flex justify-between">
      <span>Location</span>
      <span>{property.city}</span>
    </div>

    <div className="flex justify-between">
      <span>BHK</span>
      <span>{property.bhk}</span>
    </div>

    <div className="flex justify-between">
      <span>Area</span>
      <span>{property.area} sqft</span>
    </div>

  </div>

</div>

          </div>

        </div>

        <div className="rounded-[32px] border border-white/10 bg-card/40 p-8">

          <h3 className="text-xl font-semibold">
            Contact Broker
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
  Connect directly with the broker for pricing,
  site visits and availability.
</p>

          <button
            onClick={handleContactBrokerClick}
            className="mt-6 w-full rounded-2xl bg-foreground py-3 text-background font-semibold hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
          >
            Contact Now
          </button>

        </div>

      </div>

    </div>

    {/* RECOMMENDED PROPERTIES SECTION */}
    <section className="mt-16 border-t border-white/10 pt-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Recommended Properties
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          Properties with similar investment characteristics.
        </p>
      </div>

      {loadingRecs ? (
        /* Pulse Skeleton Loader Cards */
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-card/40 p-6 backdrop-blur-xl animate-pulse space-y-4"
            >
              <div className="h-[200px] w-full rounded-2xl bg-white/5"></div>
              <div className="h-6 w-3/4 rounded-lg bg-white/5"></div>
              <div className="h-4 w-1/2 rounded-lg bg-white/5"></div>
              <div className="flex gap-3 pt-2">
                <div className="h-8 w-20 rounded-full bg-white/5"></div>
                <div className="h-8 w-20 rounded-full bg-white/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        /* Empty State */
        <div className="mt-8 rounded-[32px] border border-white/10 bg-card/20 py-12 text-center backdrop-blur-sm">
          <span className="text-4xl">📊</span>
          <p className="mt-3 text-sm text-muted-foreground">
            No similar properties available.
          </p>
        </div>
      ) : (
        /* Grid of recommendations */
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <Link
              key={rec.id}
              href={`/property/${rec.id}`}
              className="group flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-card/60 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              {/* Image Container with Match Badge */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={
                    rec.imageUrl?.startsWith("http")
                      ? rec.imageUrl
                      : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={rec.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                {/* AI Match Score Badge (Bonus!) */}
                <div className="absolute left-4 top-4 rounded-xl border border-blue-500/20 bg-blue-600/90 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                  ✨ {rec.matchPercentage}% AI Match
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="truncate text-xl font-bold text-white group-hover:text-blue-400 transition">
                  {rec.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  📍 {rec.location}, {rec.city}
                </p>

                <h4 className="mt-4 text-2xl font-extrabold text-white">
                  ₹ {rec.price?.toLocaleString()}
                </h4>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-white">
                    {rec.bhk} BHK
                  </span>
                  <span className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-white">
                    {rec.area} sqft
                  </span>
                </div>

                {/* AI match reasons */}
                <div className="mt-5 border-t border-white/5 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Match Details:
                    </p>
                    <ul className="mt-2.5 space-y-1.5">
                      {rec.reasons.map((reason, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <span className="text-emerald-400 font-bold text-[10px]">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Contact Broker Modal */}
      {userId && property && (
        <ContactBrokerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={property.id}
          propertyTitle={property.title}
          brokerId={property.brokerId}
          userId={userId}
          userProfileName={userProfile?.name}
          userProfileEmail={userProfile?.email}
        />
      )}

  </main>
); }