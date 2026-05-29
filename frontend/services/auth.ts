import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";

import {
    doc,
    setDoc,
    getDoc,
} from "firebase/firestore";

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
    name: string,
    email: string,
    password: string,
    role: "user" | "broker"
) {
    try {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        await setDoc(
            doc(db, "users", result.user.uid),
            {
                uid: result.user.uid,
                name,
                email,
                role,
                createdAt: new Date().toISOString(),
            }
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
export async function getUserRole(uid: string) {
    const userRef = doc(db, "users", uid);

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data().role;
    }

    return null;
}

export async function logoutUser() {
    try {
        await signOut(auth);

    } catch (error) {
        console.error("Logout Error:", error);
        throw error;
    }
}