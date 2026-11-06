import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const privateKey = requiredEnvironmentVariable("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: requiredEnvironmentVariable("FIREBASE_PROJECT_ID"),
      clientEmail: requiredEnvironmentVariable("FIREBASE_CLIENT_EMAIL"),
      privateKey,
    }),
  });
}

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}
