"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      try {
        const role = await getUserRole(user.uid);
        if (role === "pending_onboarding") {
          router.push("/onboarding");
        } else if (role === "broker") {
          router.push("/broker");
        } else {
          router.push("/user");
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        router.push("/user"); // Default fallback
      }
    });

    return () => unsubscribe();
  }, [router, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}