"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

import {
  signupWithEmail,
  loginWithEmail,
  signInWithGoogle,
  getUserRole,
} from "@/services/auth";
 import { useRouter } from "next/navigation";

export default function LoginPage() {

    const [isSignup, setIsSignup] = useState(false);

    const [role, setRole] = useState<"user" | "broker">("user");
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleAuth = async () => {
        try {
            const user = await signInWithGoogle();
            setUser(user);

            router.push("/dashboard");

        } catch (error) {
            console.error(error);
        }
    };
    const handleEmailAuth = async () => {
        try {
            setLoading(true);

            if (!email || !password) {
                toast.error("Email and password are required.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                toast.error("Enter a valid email address.");
                return;
            }

            if (password.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }

            if (isSignup && name.trim().length < 3) {
                toast.error("Full name must be at least 3 characters.");
                return;
            }

if (isSignup) {

    const user = await signupWithEmail(
        name,
        email,
        password,
        role
    );

    setUser(user);

    if (role === "broker") {
        router.push("/broker");
        return;
    }

    router.push("/user");
    return;

} else {

    const user = await loginWithEmail(
        email,
        password
    );

    setUser(user);

    const userRole = await getUserRole(user.uid);

    if (userRole === "broker") {
        router.push("/broker");
        return;
    }

    router.push("/user");
    return;

            }

        


        } catch (error) {
            
            console.error(error);
            toast.error("Authentication failed. Please try again.");
        }
        finally {
    setLoading(false);
}
    };

    return (
        <main className="flex min-h-screen bg-background text-foreground">

            {/* LEFT PANEL */}
            <section className="relative hidden w-1/2 overflow-hidden border-r border-white/10 lg:flex">

                {/* Background Glow */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at top left, rgba(99,102,241,0.22), transparent 40%)",
                    }}
                />

                <div className="relative z-10 flex flex-col justify-between px-16 py-10">

                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-white"
                    >
                        RealStateQ AI
                    </Link>

                    <div className="flex max-w-xl flex-1 flex-col justify-center">

                        <h1 className="text-6xl font-bold leading-[1.05] tracking-tight">
                            Smarter Real Estate Decisions with AI
                        </h1>

                        <p className="mt-8 max-w-lg text-lg leading-8 text-muted-foreground">
                            Analyze properties, predict investment opportunities,
                            explore market intelligence, and connect with verified brokers
                            using RealStateQ AI.
                        </p>

                        <div className="mt-14 space-y-8">

                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />

                                <p className="text-muted-foreground">
                                    AI-powered property price prediction
                                </p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />

                                <p className="text-muted-foreground">
                                    Investment analytics and market insights
                                </p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />

                                <p className="text-muted-foreground">
                                    Verified listings and broker ecosystem
                                </p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />

                                <p className="text-muted-foreground">
                                    Real-time intelligence dashboards
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* RIGHT PANEL */}
            <section className="flex w-full items-center justify-center px-6 lg:w-1/2">

                <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-card/80 p-8 backdrop-blur-sm">

                    {/* TOP TOGGLE */}
                    <div className="mb-8 flex rounded-2xl border border-white/10 bg-background p-1">

                        <button
                            onClick={() => setIsSignup(false)}
                            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${!isSignup
                                ? "bg-foreground text-background"
                                : "text-muted-foreground"
                                }`}
                        >
                            Login
                        </button>

                        <button
                            onClick={() => setIsSignup(true)}
                            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${isSignup
                                ? "bg-foreground text-background"
                                : "text-muted-foreground"
                                }`}
                        >
                            Sign Up
                        </button>

                    </div>

                    {/* ROLE TOGGLE */}
                    <div className="mb-6 flex gap-3">

                        <button
                            onClick={() => setRole("user")}
                            className={`rounded-2xl px-5 py-2 text-sm font-medium transition ${role === "user"
                                ? "bg-foreground text-background"
                                : "border border-white/10 bg-card text-muted-foreground"
                                }`}
                        >
                            User / Investor
                        </button>

                        <button
                            onClick={() => setRole("broker")}
                            className={`rounded-2xl px-5 py-2 text-sm font-medium transition ${role === "broker"
                                ? "bg-foreground text-background"
                                : "border border-white/10 bg-card text-muted-foreground"
                                }`}
                        >
                            Broker
                        </button>

                    </div>

                    {/* HEADING */}
                    <div className="mb-8">

                        <h2 className="text-3xl font-bold">
                            {isSignup ? "Create Account" : "Welcome Back"}
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {isSignup
                                ? "Start exploring RealStateQ AI"
                                : "Login to continue"}
                        </p>

                    </div>

                    {/* FORM */}
                    <div className="space-y-4">

                        {isSignup && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-white/20"
                            />
                        )}

<input
  type="email"
  placeholder="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="..."
/>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="..."
/>

                        <button
                            disabled={loading}
                            onClick={handleEmailAuth}
                            className="w-full rounded-2xl bg-foreground py-3 text-sm font-medium text-background transition hover:opacity-90"
                        >
                            {loading
                                ? "Please wait..."
                                : isSignup
                                    ? "Create Account"
                                    : "Login"}
                        </button>

                    </div>

                    {/* DIVIDER */}
                    <div className="my-6 flex items-center gap-3">

                        <div className="h-px flex-1 bg-border" />

                        <span className="text-xs text-muted-foreground">
                            OR
                        </span>

                        <div className="h-px flex-1 bg-border" />

                    </div>

                    {/* GOOGLE AUTH */}
                    <button
                        onClick={handleGoogleAuth}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-card px-5 py-3 text-sm font-medium transition hover:border-white/20 hover:bg-muted"
                    >
                        <FcGoogle className="h-5 w-5" />

                        Continue with Google
                    </button>

                </div>

            </section>

        </main>
    );
}