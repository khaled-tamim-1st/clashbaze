import { Router } from "express";
import { db } from "@workspace/db";
import { blogTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  ListBlogPostsQueryParams,
  CreateBlogPostBody,
  UpdateBlogPostBody,
  GetBlogPostParams,
  UpdateBlogPostParams,
  DeleteBlogPostParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// GET /blog
router.get("/blog", async (req, res) => {
  try {
    const query = ListBlogPostsQueryParams.parse(req.query);
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    let rows;
    if (query.game) {
      rows = await db
        .select()
        .from(blogTable)
        .where(eq(blogTable.game, query.game))
        .orderBy(desc(blogTable.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      rows = await db
        .select()
        .from(blogTable)
        .orderBy(desc(blogTable.createdAt))
        .limit(limit)
        .offset(offset);
    }

    res.json(rows.map(serializeBlog));
  } catch (err) {
    req.log.error({ err }, "Failed to list blog posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /blog
router.post("/blog", requireAdmin, async (req, res) => {
  try {
    const body = CreateBlogPostBody.parse(req.body);
    const [row] = await db.insert(blogTable).values(body).returning();
    res.status(201).json(serializeBlog(row));
  } catch (err) {
    req.log.error({ err }, "Failed to create blog post");
    res.status(400).json({ error: "Bad request" });
  }
});

// GET /blog/:slug
router.get("/blog/:slug", async (req, res): Promise<void> => {
  try {
    const { slug } = GetBlogPostParams.parse(req.params);
    const [row] = await db
      .select()
      .from(blogTable)
      .where(eq(blogTable.slug, slug))
      .limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeBlog(row));
  } catch (err) {
    req.log.error({ err }, "Failed to get blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /blog/:slug
router.put("/blog/:slug", requireAdmin, async (req, res): Promise<void> => {
  try {
    const { slug } = UpdateBlogPostParams.parse(req.params);
    const body = UpdateBlogPostBody.parse(req.body);
    const [row] = await db
      .update(blogTable)
      .set(body)
      .where(eq(blogTable.slug, slug))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeBlog(row));
  } catch (err) {
    req.log.error({ err }, "Failed to update blog post");
    res.status(400).json({ error: "Bad request" });
  }
});

// DELETE /blog/:slug
router.delete("/blog/:slug", requireAdmin, async (req, res) => {
  try {
    const { slug } = DeleteBlogPostParams.parse(req.params);
    await db.delete(blogTable).where(eq(blogTable.slug, slug));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete blog post");
    res.status(500).json({ error: "Internal server error" });
  }
});

function serializeBlog(row: typeof blogTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    coverImage: row.coverImage ?? null,
    seoTitle: row.seoTitle ?? null,
    seoDescription: row.seoDescription ?? null,
    game: row.game ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export default router;
