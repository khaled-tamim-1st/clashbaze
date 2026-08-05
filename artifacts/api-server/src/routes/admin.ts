import { Router } from "express";
import { VerifyAdminBody, UploadImageBody } from "@workspace/api-zod";
import { adminAuth } from "../lib/firebaseAdmin";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// POST /admin/verify — verify Firebase ID token via Firebase Admin SDK
router.post("/admin/verify", async (req, res): Promise<void> => {
  try {
    const { token } = VerifyAdminBody.parse(req.body);

    const decoded = await adminAuth().verifyIdToken(token);

    const adminEmail = process.env["ADMIN_EMAIL"];
    if (!adminEmail) {
      req.log.error("ADMIN_EMAIL environment variable is not set");
      res.status(500).json({ error: "Server misconfigured" }); return;
    }

    if (!decoded.email || decoded.email.toLowerCase() !== adminEmail.toLowerCase()) {
      res.status(403).json({ error: "Forbidden" }); return;
    }

    res.json({ valid: true, email: decoded.email });
  } catch (err) {
    req.log.error({ err }, "Failed to verify admin token");
    res.status(401).json({ error: "Unauthorized" });
  }
});

// POST /upload/image — upload image to Cloudinary
router.post("/upload/image", requireAdmin, async (req, res): Promise<void> => {
  try {
    const { data, folder } = UploadImageBody.parse(req.body);

    const cloudName = process.env["VITE_CLOUDINARY_CLOUD_NAME"];
    const uploadPreset = process.env["VITE_CLOUDINARY_UPLOAD_PRESET"];

    if (!cloudName || !uploadPreset) {
      res.status(500).json({ error: "Cloudinary not configured" }); return;
    }

    const formData = new FormData();
    formData.append("file", data);
    formData.append("upload_preset", uploadPreset);
    if (folder) formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ err }, "Cloudinary upload failed");
      res.status(500).json({ error: "Upload failed" }); return;
    }

    const result = (await response.json()) as { secure_url: string; public_id: string };
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    req.log.error({ err }, "Failed to upload image");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
