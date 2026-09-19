import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/clashbaze";
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "./init-whatsapp-tables";
export * from "./init-reviews-tables";
