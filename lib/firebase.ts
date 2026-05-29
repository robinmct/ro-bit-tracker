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

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Make sure .env.local is present and all NEXT_PUBLIC_FIREBASE_* variables are defined.`
    );
  }
  return value;
}

let app: FirebaseApp | undefined;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser.");
  }
  if (!app) {
    const firebaseConfig: FirebaseOptions = {
      apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
      authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
      projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
      storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
      appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
      measurementId: getEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
    };
    app = initializeApp(firebaseConfig);
  }
  return app;
}

function getAuthInstance() {
  return getAuth(getFirebaseApp());
}

function getDbInstance() {
  return getFirestore(getFirebaseApp());
}

// Re-export everything so callers don't need to change.
// Auth and DB instances are resolved lazily at runtime.
export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop) {
    return (getAuthInstance() as any)[prop];
  },
});

export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    return (getDbInstance() as any)[prop];
  },
});

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
