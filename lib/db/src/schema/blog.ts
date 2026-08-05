import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blogTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  game: text("game"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBlogSchema = createInsertSchema(blogTable).omit({ id: true, createdAt: true });
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type BlogPost = typeof blogTable.$inferSelect;
