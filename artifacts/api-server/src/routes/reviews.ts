import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

function serializeReview(row: typeof reviewsTable.$inferSelect) {
  return {
    id: row.id,
    customerName: row.customerName,
    rating: row.rating,
    comment: row.comment,
    contactInfo: row.contactInfo ?? null,
    game: row.game ?? null,
    screenshotUrl: row.screenshotUrl ?? null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

// GET /reviews (Public)
router.get("/reviews", async (_req, res): Promise<void> => {
  try {
    const reviewsData = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.status, "approved"))
      .orderBy(desc(reviewsTable.createdAt));

    const totalReviews = reviewsData.length;
    let sumRating = 0;
    const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

    for (const r of reviewsData) {
      sumRating += r.rating;
      const key = String(r.rating);
      if (distribution[key] !== undefined) {
        distribution[key]++;
      }
    }

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

    res.json({
      reviews: reviewsData.map(serializeReview),
      stats: {
        averageRating,
        totalReviews,
        distribution,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /reviews (Public)
router.post("/reviews", async (req, res): Promise<void> => {
  try {
    const { customerName, rating, comment, contactInfo, game, screenshotUrl } = req.body;

    if (!customerName || typeof customerName !== "string" || customerName.trim() === "") {
      res.status(400).json({ error: "Customer name is required" });
      return;
    }
    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      res.status(400).json({ error: "Comment is required" });
      return;
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ error: "Rating must be a number between 1 and 5" });
      return;
    }

    const newReview = await db.insert(reviewsTable).values({
      customerName: customerName.trim(),
      rating: Math.round(numRating),
      comment: comment.trim(),
      contactInfo: typeof contactInfo === "string" ? contactInfo.trim() : null,
      game: typeof game === "string" ? game : null,
      screenshotUrl: typeof screenshotUrl === "string" ? screenshotUrl : null,
      status: "pending",
    }).returning();

    if (newReview.length === 0) {
      res.status(500).json({ error: "Failed to create review" });
      return;
    }

    res.status(201).json(serializeReview(newReview[0]));
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// GET /admin/reviews (Admin Protected)
router.get("/admin/reviews", requireAdmin, async (req, res): Promise<void> => {
  try {
    const statusFilter = typeof req.query["statusFilter"] === "string" ? req.query["statusFilter"] : undefined;

    const allReviews = await db
      .select()
      .from(reviewsTable)
      .where(statusFilter ? eq(reviewsTable.status, statusFilter) : undefined)
      .orderBy(desc(reviewsTable.createdAt));

    res.json(allReviews.map(serializeReview));
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// PATCH /admin/reviews/:id/approve (Admin Protected)
router.patch("/admin/reviews/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  try {
    const numId = Number(req.params.id);
    if (!numId || isNaN(numId)) {
      res.status(400).json({ error: "Invalid review ID" });
      return;
    }

    const updated = await db
      .update(reviewsTable)
      .set({ status: "approved" })
      .where(eq(reviewsTable.id, numId))
      .returning();

    if (updated.length === 0) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    res.json(serializeReview(updated[0]));
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ error: "Failed to approve review" });
  }
});

// PATCH /admin/reviews/:id/reject (Admin Protected)
router.patch("/admin/reviews/:id/reject", requireAdmin, async (req, res): Promise<void> => {
  try {
    const numId = Number(req.params.id);
    if (!numId || isNaN(numId)) {
      res.status(400).json({ error: "Invalid review ID" });
      return;
    }

    const updated = await db
      .update(reviewsTable)
      .set({ status: "rejected" })
      .where(eq(reviewsTable.id, numId))
      .returning();

    if (updated.length === 0) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    res.json(serializeReview(updated[0]));
  } catch (error) {
    console.error("Error rejecting review:", error);
    res.status(500).json({ error: "Failed to reject review" });
  }
});

// DELETE /admin/reviews/:id (Admin Protected)
router.delete("/admin/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  try {
    const numId = Number(req.params.id);
    if (!numId || isNaN(numId)) {
      res.status(400).json({ error: "Invalid review ID" });
      return;
    }

    const deleted = await db
      .delete(reviewsTable)
      .where(eq(reviewsTable.id, numId))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
