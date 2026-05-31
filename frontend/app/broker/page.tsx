"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getBrokerProperties } from "@/services/property";
import { getBrokerLeads, BrokerLead } from "@/services/lead";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { calculateInvestmentScore } from "@/utils/investment";
import Link from "next/link";
import toast from "react-hot-toast";

export default function BrokerDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [listingsCount, setListingsCount] = useState<number | null>(null);
  const [leadsCount, setLeadsCount] = useState<number | null>(null);
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const [leads, setLeads] = useState<BrokerLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Fetch broker's listed properties
          const propertiesList = await getBrokerProperties(user.uid);
          setProperties(propertiesList);
          setListingsCount(propertiesList.length);

          // 2. Fetch broker's buyer inquiry leads
          const leadsList = await getBrokerLeads(user.uid);
          setLeadsCount(leadsList.length);
          setLeads(leadsList);
          
          const newLeads = leadsList.filter((lead) => lead.status === "new").length;
          setNewLeadsCount(newLeads);
        } catch (error) {
          console.error("Failed to load broker statistics:", error);
          toast.error("Error retrieving broker portfolio details");
        } finally {
          setLoading(false);
        }
      } else {
        setProperties([]);
        setListingsCount(0);
        setLeadsCount(0);
        setNewLeadsCount(0);
        setLeads([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Compute portfolio metrics
  const averagePrice = properties.length > 0 
    ? properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / properties.length 
    : 0;

  const uniqueCities = Array.from(
    new Set(
      properties
        .map((p) => p.city?.trim())
        .filter(Boolean)
    )
  ).sort();

  // Get latest 3 Listings
  const recentListings = [...properties]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  // Get latest 3 Leads
  const recentLeads = [...leads]
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return timeB - timeA;
    })
    .slice(0, 3);

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

  return (
    <RoleProtectedRoute allowedRole="broker">
      <DashboardLayout role="broker">
        <div className="space-y-8">
          
          {/* HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Broker Console</h2>
              <p className="text-muted-foreground mt-2">
                Manage listing portfolios, respond to dynamic lead inquiries, and evaluate property investment grades.
              </p>
            </div>
            <Link
              href="/broker/add-property"
              className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 active:scale-95 shadow-lg shadow-white/5"
            >
              + Add Property
            </Link>
          </div>

          {/* DYNAMIC METRIC CARDS */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition hover:border-white/20 hover:-translate-y-1 duration-300">
              <p className="text-sm text-muted-foreground">My Listed Properties</p>
              <div className="mt-4 flex items-end justify-between">
                <h3 className="text-4xl font-bold tracking-tight">
                  {listingsCount}
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">Live</span>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition hover:border-white/20 hover:-translate-y-1 duration-300">
              <p className="text-sm text-muted-foreground">Buyer Inquiries</p>
              <div className="mt-4 flex items-end justify-between">
                <h3 className="text-4xl font-bold tracking-tight">
                  {leadsCount}
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  +{newLeadsCount} new
                </span>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-card/60 p-6 backdrop-blur-xl transition hover:border-white/20 hover:-translate-y-1 duration-300">
              <p className="text-sm text-muted-foreground">Platform Page Views</p>
              <div className="mt-4 flex items-end justify-between">
                <h3 className="text-4xl font-bold tracking-tight">1,824</h3>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">Past 30 days</span>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN OPTIMIZED LAYOUT */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* LEFT COLUMN: MAIN CONTENT PANEL (2/3 Width) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* 1. RECENT LISTINGS (LATEST 3 LISTINGS) */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      🏠 Recent Listed Properties
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The latest listings added by you to the marketplace.
                    </p>
                  </div>
                  <Link href="/broker/my-properties" className="text-xs text-blue-400 hover:underline shrink-0">
                    Manage Catalog ({properties.length}) →
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentListings.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-sm text-muted-foreground">You haven't listed any properties yet.</p>
                      <Link href="/broker/add-property" className="mt-3 inline-block text-xs text-blue-400 hover:underline">
                        Create your first listing →
                      </Link>
                    </div>
                  ) : (
                    recentListings.map((prop) => {
                      const score = calculateInvestmentScore(prop);
                      return (
                        <div
                          key={prop.id}
                          className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/5 bg-background/30 hover:bg-background/50 hover:border-white/10 transition duration-300"
                        >
                          {/* Image */}
                          <div className="relative h-32 sm:w-48 w-full shrink-0 overflow-hidden">
                            <img
                              src={prop.imageUrl?.startsWith("http") ? prop.imageUrl : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=500&q=80"}
                              alt={prop.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <Link href={`/property/${prop.id}`} className="text-base font-bold text-white hover:text-blue-400 transition line-clamp-1">
                                  {prop.title}
                                </Link>
                              </div>
                              <p className="text-xs text-muted-foreground">📍 {prop.location}, {prop.city}</p>
                              
                              <div className="flex items-center gap-2.5 mt-2">
                                <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                                  {prop.bhk} BHK
                                </span>
                                <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                                  {prop.area} sqft
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                              <span className="text-base font-bold text-white">
                                ₹ {prop.price?.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-2.5">
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  ⭐ Score {score}
                                </span>
                                <Link
                                  href={`/property/${prop.id}`}
                                  className="text-xs text-white hover:underline"
                                >
                                  Preview →
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

              {/* 2. RECENT LEADS (LATEST 3 LEADS) */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    ✉️ Active Inquiry Leads
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Client inquiries received for your property listings. Respond directly via email.
                  </p>
                </div>

                <div className="space-y-4">
                  {recentLeads.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-sm text-muted-foreground">No leads received yet. Your active inquiries will appear here.</p>
                    </div>
                  ) : (
                    recentLeads.map((lead) => {
                      const leadDate = lead.createdAt ? new Date(lead.createdAt.seconds * 1000) : new Date();
                      return (
                        <div
                          key={lead.id}
                          className="rounded-2xl border border-white/5 bg-background/30 p-5 space-y-3 text-left hover:border-white/10 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white">{lead.userName}</h4>
                              <a
                                href={`mailto:${lead.userEmail}?subject=Regarding your inquiry on ${lead.propertyTitle}`}
                                className="text-xs text-blue-400 hover:underline"
                              >
                                ✉️ {lead.userEmail}
                              </a>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {leadDate.toLocaleDateString()}
                            </span>
                          </div>

                          <div className="rounded-xl bg-white/2 border border-white/5 p-3 space-y-1">
                            <p className="text-[10px] text-muted-foreground">Regarding Listing:</p>
                            <Link href={`/property/${lead.propertyId}`} className="text-xs text-emerald-400 font-semibold hover:underline block truncate">
                              {lead.propertyTitle}
                            </Link>
                            <p className="text-xs text-muted-foreground/90 italic pt-1 leading-relaxed border-t border-white/5 mt-1">
                              "{lead.message}"
                            </p>
                          </div>

                          <div className="flex justify-end pt-1">
                            <a
                              href={`mailto:${lead.userEmail}?subject=Regarding your inquiry on ${lead.propertyTitle}`}
                              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-semibold text-white hover:bg-white/10 transition"
                            >
                              📧 Compose Quick Reply
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* 3. PORTFOLIO SUMMARY CARD */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    📊 Portfolio Summary
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Statistical breakdown of your active listings and regional footprint.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  
                  {/* Total Listings */}
                  <div className="rounded-2xl border border-white/5 bg-background/40 p-5 space-y-1">
                    <p className="text-xs text-muted-foreground">Total Listings</p>
                    <h4 className="text-3xl font-bold text-white">{properties.length}</h4>
                    <p className="text-[10px] text-emerald-400 font-medium">Active & Live</p>
                  </div>

                  {/* Avg Price */}
                  <div className="rounded-2xl border border-white/5 bg-background/40 p-5 space-y-1">
                    <p className="text-xs text-muted-foreground">Average Price</p>
                    <h4 className="text-2xl font-bold text-white truncate">
                      ₹ {averagePrice > 0 ? averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
                    </h4>
                    <p className="text-[10px] text-blue-400 font-medium">Portfolio Avg</p>
                  </div>

                  {/* Cities Covered */}
                  <div className="rounded-2xl border border-white/5 bg-background/40 p-5 space-y-1">
                    <p className="text-xs text-muted-foreground">Cities Covered</p>
                    <h4 className="text-3xl font-bold text-white">{uniqueCities.length}</h4>
                    <p className="text-[10px] text-muted-foreground truncate" title={uniqueCities.join(", ")}>
                      {uniqueCities.length > 0 ? uniqueCities.join(", ") : "None"}
                    </p>
                  </div>

                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: QUICK ACTIONS + AI MARKET INSIGHTS (1/3 Width) */}
            <div className="space-y-8">
              
              {/* 4. QUICK ACTIONS CARD */}
              <section className="rounded-[32px] border border-white/10 bg-card/60 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">⚡ Quick Actions</h3>
                  <p className="text-xs text-muted-foreground mt-1">Operational shortcuts for brokers.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/broker/add-property"
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 px-5 py-4 text-sm hover:border-white/20 transition hover:bg-muted/20"
                  >
                    <span>Add New Property Listing</span>
                    <span className="text-muted-foreground text-xs">+</span>
                  </Link>

                  <Link
                    href="/broker/my-properties"
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 px-5 py-4 text-sm hover:border-white/20 transition hover:bg-muted/20"
                  >
                    <span>My Listed Properties</span>
                    <span className="text-muted-foreground text-xs">→</span>
                  </Link>

                  <Link
                    href="/broker/profile"
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 px-5 py-4 text-sm hover:border-white/20 transition hover:bg-muted/20"
                  >
                    <span>Edit Profile Settings</span>
                    <span className="text-muted-foreground text-xs">→</span>
                  </Link>
                </div>
              </section>

              {/* 5. AI TOOLKIT CARD */}
              <section className="rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8 backdrop-blur-xl space-y-6">
                <div>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                    AI Workspace
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3 flex items-center gap-2">
                    ✨ AI Toolkit
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Operational tools exposing underlying platform models.</p>
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