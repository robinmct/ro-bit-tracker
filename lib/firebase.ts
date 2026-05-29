import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

let app: FirebaseApp | undefined;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser.");
  }
  if (!app) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

    const missing: string[] = [];
    if (!apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");

    if (missing.length > 0) {
      throw new Error(
        `Missing environment variables: ${missing.join(", ")}. Make sure they are set in your .env.local file (for local dev) or in your Vercel project settings (for production), then redeploy.`
      );
    }

    const firebaseConfig: FirebaseOptions = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
    };

    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getAuthInstance() {
  return getAuth(getFirebaseApp());
}

export function getDbInstance() {
  return getFirestore(getFirebaseApp());
}

export type { User };

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  firebaseSignOut as signOut,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
};

export type { Unsubscribe };
