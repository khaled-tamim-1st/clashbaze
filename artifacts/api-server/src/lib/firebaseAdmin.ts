import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let app: App | undefined;

function loadServiceAccount(): object {
  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_KEY"];

  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required but was not provided.",
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.");
  }
}

function getFirebaseAdminApp(): App {
  if (!app) {
    const existingApps = getApps();
    app =
      existingApps[0] ??
      initializeApp({
        credential: cert(loadServiceAccount() as Parameters<typeof cert>[0]),
      });
  }
  return app;
}

export function adminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}
