"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/services/auth";
import Link from "next/link";

export function BackToDashboard() {
  const [role, setRole] = useState<"user" | "broker" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRole = await getUserRole(user.uid);
          setRole(userRole);
        } catch (error) {
          console.error("Error fetching user role in BackToDashboard:", error);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !role) {
    return null;
  }

  const dashboardHref = role === "broker" ? "/broker" : "/user";

  return (
    <div className="mb-6 flex items-center">
      <Link
        href={dashboardHref}
        className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:border-primary/20 hover:bg-muted hover:text-primary hover:shadow-md hover:shadow-primary/5 active:scale-95"
      >
        <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Back to Dashboard
      </Link>
    </div>
  );
}
