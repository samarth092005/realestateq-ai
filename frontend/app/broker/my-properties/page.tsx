"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getBrokerProperties, deleteProperty } from "@/services/property";
import { RoleProtectedRoute } from "@/components/auth/role-protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import Link from "next/link";
import toast from "react-hot-toast";
import { BackToDashboard } from "@/components/layout/back-to-dashboard";

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const data = await getBrokerProperties(user.uid);
          setProperties(data);
        } catch (error) {
          console.error("Failed to load broker properties:", error);
          toast.error("Failed to load properties");
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

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property listing? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteProperty(propertyId);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete property listing");
    }
  };

  return (
    <RoleProtectedRoute allowedRole="broker">
      <DashboardLayout role="broker">
        <main className="space-y-8">
          <BackToDashboard />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">My Properties</h1>
              <p className="mt-2 text-muted-foreground text-lg">
                Manage, audit, and coordinate your published real estate listings.
              </p>
            </div>
            <Link
              href="/broker/add-property"
              className="inline-flex items-center justify-center rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              + Add Property
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-[32px] border border-white/10 bg-card/20 py-20 text-center backdrop-blur-xl">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold">No properties listed yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm">
                You haven't uploaded any listings under this broker account. Tap below to create your first one.
              </p>
              <Link
                href="/broker/add-property"
                className="mt-6 inline-flex rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Create First Listing
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="group overflow-hidden rounded-[28px] border border-white/10 bg-card/40 backdrop-blur-xl transition duration-300 hover:border-white/20 flex flex-col h-full"
                >
                  {/* IMAGE */}
                  <div className="h-[200px] w-full relative shrink-0">
                    <img
                      src={
                        property.imageUrl?.startsWith("http")
                          ? property.imageUrl
                          : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-xl font-bold line-clamp-1">
                        {property.title}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        📍 {property.location}, {property.city}
                      </p>

                      <p className="mt-4 text-2xl font-bold text-emerald-400">
                        ₹ {property.price?.toLocaleString()}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-background/30 px-3 py-1 text-xs">
                          {property.bhk} BHK
                        </span>
                        <span className="rounded-full border border-white/10 bg-background/30 px-3 py-1 text-xs">
                          {property.area} sqft
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                      <Link
                        href={`/property/${property.id}`}
                        className="text-xs font-semibold hover:underline"
                      >
                        Preview Page →
                      </Link>

                      <button
                        onClick={() => handleDelete(property.id)}
                        className="rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/15 hover:bg-red-500 hover:text-white transition"
                      >
                        Delete Listing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}
