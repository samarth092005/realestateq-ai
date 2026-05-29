import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBrkDhAOj5TA9nVX9vc_URNxkwqpyEZD4A",
    authDomain: "reakstateq-ai.firebaseapp.com",
    projectId: "reakstateq-ai",
    storageBucket: "reakstateq-ai.firebasestorage.app",
    messagingSenderId: "557412959069",
    appId: "1:557412959069:web:4be5b4ed5803a330579eb4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


export const db = getFirestore(app);