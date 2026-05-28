import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

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

export async function signupWithEmail(
    email: string,
    password: string
) {
    try {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        return result.user;

    } catch (error) {
        console.error("Signup Error:", error);
        throw error;
    }
}

export async function loginWithEmail(
    email: string,
    password: string
) {
    try {
        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return result.user;

    } catch (error) {
        console.error("Login Error:", error);
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