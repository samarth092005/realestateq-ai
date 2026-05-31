"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getUserRole } from "@/services/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const [role, setRole] = useState<"user" | "broker">("user");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const currentRole = await getUserRole(user.uid);
        if (currentRole === "user" || currentRole === "broker") {
          // Already onboarded, bypass
          router.push(currentRole === "broker" ? "/broker" : "/user");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Onboarding auth check failed:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSelectRole = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You are not authenticated.");
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        role: role,
        updatedAt: new Date().toISOString(),
      });

      toast.success(`Welcome aboard! Role saved successfully. 🚀`);
      router.push(role === "broker" ? "/broker" : "/user");
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to select role. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Checking credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground items-center justify-center px-6">
      <div className="relative overflow-hidden w-full max-w-md rounded-[32px] border border-white/10 bg-card/80 p-8 backdrop-blur-sm shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        
        <div className="relative z-10 text-center space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Choose Your Role</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              To get started, please tell us how you plan to use RealStateQ AI.
            </p>
          </div>

          <div className="grid gap-4 pt-4">
            {/* User Option */}
            <button
              onClick={() => setRole("user")}
              className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                role === "user"
                  ? "bg-white/5 text-white border-white/30 shadow-lg shadow-black/20"
                  : "bg-background/40 text-muted-foreground border-white/5 hover:border-white/15"
              }`}
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                Investor / Homebuyer 🔑
              </span>
              <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Browse analyzed listings, save favorites, compare options, and consult real-time AI valuation insights.
              </span>
            </button>

            {/* Broker Option */}
            <button
              onClick={() => setRole("broker")}
              className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                role === "broker"
                  ? "bg-white/5 text-white border-white/30 shadow-lg shadow-black/20"
                  : "bg-background/40 text-muted-foreground border-white/5 hover:border-white/15"
              }`}
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                Licensed Broker Partner 🏢
              </span>
              <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Publish property listings, manage active market inventory, analyze portfolio scores, and manage potential leads.
              </span>
            </button>
          </div>

          <button
            disabled={saving}
            onClick={handleSelectRole}
            className="w-full rounded-2xl bg-foreground py-4 font-bold text-background transition hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-xl cursor-pointer"
          >
            {saving ? "Configuring Account..." : "Continue to Dashboard →"}
          </button>
        </div>
      </div>
    </main>
  );
}
