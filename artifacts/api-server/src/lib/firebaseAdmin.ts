import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let app: App | undefined;

function loadServiceAccount(): object {
  // بيقبل القيمة مباشرة كـ JSON، أو مسار لملف يحتوي عليها (أبسط وأقل عرضة للكسر)
  const raw =
    process.env["FIREBASE_SERVICE_ACCOUNT_KEY"] ||
    (process.env["FIREBASE_SERVICE_ACCOUNT_KEY_PATH"]
      ? readFileSync(process.env["FIREBASE_SERVICE_ACCOUNT_KEY_PATH"], "utf-8")
      : undefined);

  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is required but was not provided.",
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