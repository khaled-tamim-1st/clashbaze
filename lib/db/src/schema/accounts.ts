import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  game: text("game").notNull(), // clash-of-clans | clash-royale
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  oldPrice: numeric("old_price", { precision: 10, scale: 2 }),
  images: text("images").array().notNull().default([]),
  description: text("description"),
  status: text("status").notNull().default("available"), // available | reserved | sold
  townHall: integer("town_hall"),
  arena: text("arena"),
  trophies: integer("trophies"),
  heroes: text("heroes"),
  gems: integer("gems"),
  skins: text("skins"),
  league: text("league"),
  evolutions: text("evolutions"),
  emotes: text("emotes"),
  maxCards: integer("max_cards"),
  whatsappMessage: text("whatsapp_message"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id: true, createdAt: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;
