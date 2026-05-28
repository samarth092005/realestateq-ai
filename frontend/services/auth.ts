import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);

        return result.user;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
        throw error;
    }
}