"use client";

import { FcGoogle } from "react-icons/fc";

import { signInWithGoogle } from "@/services/auth";

export function GoogleLoginButton() {

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();

      console.log("Logged In User:", user);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/80 px-5 py-3 text-sm font-medium backdrop-blur-sm transition hover:border-white/20 hover:bg-muted"
    >
      <FcGoogle className="h-5 w-5" />

      Continue with Google
    </button>
  );
}