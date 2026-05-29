"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/services/auth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "user" | "broker";
}

export function RoleProtectedRoute({
  children,
  allowedRole,
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        router.push("/login");
        return;
      }

      const role = await getUserRole(user.uid);

      if (role !== allowedRole) {

        if (role === "broker") {
          router.push("/broker");
        } else {
          router.push("/user");
        }

        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, allowedRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}