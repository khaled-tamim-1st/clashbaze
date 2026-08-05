import { Router } from "express";
import { db } from "@workspace/db";
import { accountsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  ListAccountsQueryParams,
  CreateAccountBody,
  UpdateAccountBody,
  GetAccountParams,
  UpdateAccountParams,
  DeleteAccountParams,
  GetRelatedAccountsParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

// GET /accounts
router.get("/accounts", async (req, res) => {
  try {
    const query = ListAccountsQueryParams.parse(req.query);
    const conditions = [];

    if (query.game) conditions.push(eq(accountsTable.game, query.game));
    if (query.status) conditions.push(eq(accountsTable.status, query.status));
    if (query.featured === "true") conditions.push(eq(accountsTable.featured, true));
    if (query.featured === "false") conditions.push(eq(accountsTable.featured, false));

    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    let rows;
    if (conditions.length > 0) {
      rows = await db
        .select()
        .from(accountsTable)
        .where(and(...conditions))
        .orderBy(desc(accountsTable.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      rows = await db
        .select()
        .from(accountsTable)
        .orderBy(desc(accountsTable.createdAt))
        .limit(limit)
        .offset(offset);
    }

    res.json(rows.map(serializeAccount));
  } catch (err) {
    req.log.error({ err }, "Failed to list accounts");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /accounts
router.post("/accounts", requireAdmin, async (req, res) => {
  try {
    const body = CreateAccountBody.parse(req.body);
    const [row] = await db
      .insert(accountsTable)
      .values({
        ...body,
        price: String(body.price),
        oldPrice: body.oldPrice != null ? String(body.oldPrice) : null,
        images: body.images ?? [],
        featured: body.featured ?? false,
      })
      .returning();
    res.status(201).json(serializeAccount(row));
  } catch (err) {
    req.log.error({ err }, "Failed to create account");
    res.status(400).json({ error: "Bad request" });
  }
});

// GET /accounts/featured
router.get("/accounts/featured", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.featured, true), eq(accountsTable.status, "available")))
      .orderBy(desc(accountsTable.createdAt))
      .limit(12);
    res.json(rows.map(serializeAccount));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured accounts");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /accounts/stats
router.get("/accounts/stats", async (req, res) => {
  try {
    const all = await db.select().from(accountsTable);
    res.json({
      totalAccounts: all.length,
      availableAccounts: all.filter((a) => a.status === "available").length,
      cocAccounts: all.filter((a) => a.game === "clash-of-clans").length,
      crAccounts: all.filter((a) => a.game === "clash-royale").length,
      featuredCount: all.filter((a) => a.featured).length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /accounts/:slug
router.get("/accounts/:slug", async (req, res): Promise<void> => {
  try {
    const { slug } = GetAccountParams.parse(req.params);
    const [row] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.slug, slug))
      .limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeAccount(row));
  } catch (err) {
    req.log.error({ err }, "Failed to get account");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /accounts/:slug
router.put("/accounts/:slug", requireAdmin, async (req, res): Promise<void> => {
  try {
    const { slug } = UpdateAccountParams.parse(req.params);
    const body = UpdateAccountBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body };
    if (body.price !== undefined) updateData.price = String(body.price);
    if (body.oldPrice !== undefined) updateData.oldPrice = body.oldPrice != null ? String(body.oldPrice) : null;

    const [row] = await db
      .update(accountsTable)
      .set(updateData)
      .where(eq(accountsTable.slug, slug))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeAccount(row));
  } catch (err) {
    req.log.error({ err }, "Failed to update account");
    res.status(400).json({ error: "Bad request" });
  }
});

// DELETE /accounts/:slug
router.delete("/accounts/:slug", requireAdmin, async (req, res) => {
  try {
    const { slug } = DeleteAccountParams.parse(req.params);
    await db.delete(accountsTable).where(eq(accountsTable.slug, slug));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete account");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /accounts/:slug/related
router.get("/accounts/:slug/related", async (req, res): Promise<void> => {
  try {
    const { slug } = GetRelatedAccountsParams.parse(req.params);
    const [current] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.slug, slug))
      .limit(1);

    if (!current) { res.json([]); return; }

    const rows = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.game, current.game), eq(accountsTable.status, "available")))
      .orderBy(desc(accountsTable.createdAt))
      .limit(5);

    res.json(rows.filter((r) => r.slug !== slug).slice(0, 4).map(serializeAccount));
  } catch (err) {
    req.log.error({ err }, "Failed to get related accounts");
    res.status(500).json({ error: "Internal server error" });
  }
});

function serializeAccount(row: typeof accountsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    game: row.game,
    price: parseFloat(String(row.price)),
    oldPrice: row.oldPrice != null ? parseFloat(String(row.oldPrice)) : null,
    images: row.images ?? [],
    description: row.description ?? null,
    status: row.status,
    townHall: row.townHall ?? null,
    arena: row.arena ?? null,
    trophies: row.trophies ?? null,
    heroes: row.heroes ?? null,
    gems: row.gems ?? null,
    skins: row.skins ?? null,
    league: row.league ?? null,
    evolutions: row.evolutions ?? null,
    emotes: row.emotes ?? null,
    maxCards: row.maxCards ?? null,
    whatsappMessage: row.whatsappMessage ?? null,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
  };
}

export default router;
