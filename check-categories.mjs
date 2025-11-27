import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function check() {
  const cats = await db.select().from(categories);
  console.log("Existing categories:", cats);
  process.exit(0);
}

check();
