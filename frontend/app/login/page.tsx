"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Eye, EyeOff } from "lucide-react";


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
    const [showPassword, setShowPassword] = useState(false);

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
            <section className="relative hidden w-1/2 overflow-hidden border-r border-border lg:flex bg-muted/20">

                {/* Background Glow */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at top left, rgba(99,102,241,0.15), transparent 45%)",
                    }}
                />

                <div className="relative z-10 flex flex-col justify-between px-16 py-10">

                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 hover:opacity-90"
                    >
                        <span className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center text-xs text-white">Q</span>
                        RealStateQ AI
                    </Link>

                    <div className="flex max-w-xl flex-1 flex-col justify-center">

                        <h1 className="text-6xl font-bold leading-[1.05] tracking-tight text-foreground">
                            Smarter Real Estate Decisions with AI
                        </h1>

                        <p className="mt-8 max-w-lg text-lg leading-8 text-muted-foreground">
                            Analyze properties, predict investment opportunities,
                            explore market intelligence, and connect with verified brokers
                            using RealStateQ AI.
                        </p>

                        <div className="mt-14 space-y-8">

                            <div className="flex items-start gap-4">
                                <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />

                                <p className="text-muted-foreground font-medium">
                                    AI-powered property price prediction
                                </p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />

                                <p className="text-muted-foreground font-medium">
                                    Investment analytics and market insights
                                </p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />

                                <p className="text-muted-foreground font-medium">
                                    Verified listings and broker ecosystem
                                </p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />

                                <p className="text-muted-foreground font-medium">
                                    Real-time intelligence dashboards
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* RIGHT PANEL */}
            <section className="flex w-full items-center justify-center px-6 lg:w-1/2 bg-background">

                <div className="w-full max-w-md rounded-[32px] border border-border bg-card p-8 shadow-xl">

                    {/* TOP TOGGLE */}
                    <div className="mb-8 flex rounded-2xl border border-border bg-muted/40 p-1">

                        <button
                            onClick={() => setIsSignup(false)}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer ${!isSignup
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Login
                        </button>

                        <button
                            onClick={() => setIsSignup(true)}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer ${isSignup
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Sign Up
                        </button>

                    </div>

                    {/* ROLE TOGGLE */}
                    <div className="mb-6 flex gap-3">

                        <button
                            onClick={() => setRole("user")}
                            className={`rounded-2xl px-5 py-2 text-sm font-semibold transition cursor-pointer ${role === "user"
                                ? "bg-primary text-white shadow-sm"
                                : "border border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                                }`}
                        >
                            User / Investor
                        </button>

                        <button
                            onClick={() => setRole("broker")}
                            className={`rounded-2xl px-5 py-2 text-sm font-semibold transition cursor-pointer ${role === "broker"
                                ? "bg-primary text-white shadow-sm"
                                : "border border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                                }`}
                        >
                            Broker
                        </button>

                    </div>

                    {/* HEADING */}
                    <div className="mb-8">

                        <h2 className="text-3xl font-bold text-foreground">
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
                            <div>
                                <label htmlFor="auth-name" className="sr-only">Full Name</label>
                                <input
                                    id="auth-name"
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="auth-email" className="sr-only">Email Address</label>
                            <input
                                id="auth-email"
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="auth-password" className="sr-only">
                                Password
                            </label>

                            <input
                                id="auth-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={
                                    isSignup ? "new-password" : "current-password"
                                }
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>

                        <button
                            disabled={loading}
                            onClick={handleEmailAuth}
                            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary/95 active:scale-95 disabled:opacity-50 shadow-md shadow-primary/10 cursor-pointer"
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

                        <span className="text-xs text-muted-foreground font-semibold">
                            OR
                        </span>

                        <div className="h-px flex-1 bg-border" />

                    </div>

                    {/* GOOGLE AUTH */}
                    <button
                        onClick={handleGoogleAuth}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-muted cursor-pointer"
                    >
                        <FcGoogle className="h-5 w-5" />

                        Continue with Google
                    </button>

                </div>

            </section>

        </main>
    );
}