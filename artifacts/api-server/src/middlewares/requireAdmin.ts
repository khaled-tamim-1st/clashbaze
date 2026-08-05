import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "../lib/firebaseAdmin";

/**
 * Verifies the Firebase ID token sent in the `Authorization: Bearer <token>`
 * header using the Firebase Admin SDK, then checks that the token's email
 * matches the ADMIN_EMAIL environment variable. This check happens entirely
 * server-side and must never rely on any admin flag coming from the client.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const adminEmail = process.env["ADMIN_EMAIL"];
  if (!adminEmail) {
    req.log.error("ADMIN_EMAIL environment variable is not set");
    res.status(500).json({ error: "Server misconfigured" });
    return;
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token);

    if (!decoded.email || decoded.email.toLowerCase() !== adminEmail.toLowerCase()) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  } catch (err) {
    req.log.error({ err }, "Failed to verify admin token");
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
