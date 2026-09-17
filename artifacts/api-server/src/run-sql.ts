import { pool } from "@workspace/db";
import fs from "node:fs";

async function main() {
  const filePath = process.argv[2] || "seed-clash-royale-accounts.sql";
  console.log(`Reading and executing SQL file: ${filePath}`);
  const sql = fs.readFileSync(filePath, "utf-8");
  const res = await pool.query(sql);
  console.log("✅ SQL executed successfully!");
  if (Array.isArray(res)) {
    for (const r of res) {
      console.log(`Command: ${r.command}, RowCount: ${r.rowCount}`);
    }
  } else {
    console.log(`Command: ${res.command}, RowCount: ${res.rowCount}`);
  }
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ SQL execution error:", err);
  process.exit(1);
});
