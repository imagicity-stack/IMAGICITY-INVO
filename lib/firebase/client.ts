import { FirebaseApp, initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let appInstance: FirebaseApp | null = null;

export function initializeClientApp() {
  if (appInstance) return appInstance;
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
  const apps = getApps();
  appInstance = apps.length ? apps[0] : initializeApp(firebaseConfig);
  return appInstance;
}

export function getClientServices() {
  const app = initializeClientApp();
  return {
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
}
