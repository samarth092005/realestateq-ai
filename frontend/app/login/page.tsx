"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { signInWithGoogle } from "@/services/auth";

export default function LoginPage() {

    const [isSignup, setIsSignup] = useState(false);

    const [role, setRole] = useState<"user" | "broker">("user");

    const handleGoogleAuth = async () => {
        try {
            const user = await signInWithGoogle();

            console.log("Authenticated User:", user);

        } catch (error) {
            console.error(error);
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

                <div className="relative z-10 flex flex-col justify-center px-16">

                    <div className="max-w-xl">

                        <h1 className="text-5xl font-bold leading-tight">
                            Smarter Real Estate Decisions with AI
                        </h1>

                        <p className="mt-6 text-lg text-muted-foreground">
                            Analyze properties, predict investment opportunities,
                            explore market intelligence, and connect with verified brokers
                            using RealStateQ AI.
                        </p>

                        <div className="mt-12 space-y-6">

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
                                className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-white/20"
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-white/20"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-sm outline-none transition focus:border-white/20"
                        />

                        <button
                            className="w-full rounded-2xl bg-foreground py-3 text-sm font-medium text-background transition hover:opacity-90"
                        >
                            {isSignup ? "Create Account" : "Login"}
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