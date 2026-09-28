require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const file = process.argv[2] || "supabase-full-setup.sql";
const sql = fs.readFileSync(path.join(__dirname, "..", file), "utf8");

(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });
  try {
    await c.connect();
    await c.query(sql);
    console.log("executed:", file);
  } catch (e) {
    console.log("SQL_ERROR:", e.message);
    try { await c.end(); } catch {}
    process.exit(1);
  }

  const r = await c.query(`
    SELECT
      (SELECT count(*) FROM "Product")       AS products,
      (SELECT count(*) FROM "Category")      AS categories,
      (SELECT count(*) FROM "User")          AS users,
      (SELECT count(*) FROM "ProductVariant") AS variants,
      (SELECT count(*) FROM "Coupon")        AS coupons,
      (SELECT count(*) FROM "Review")        AS reviews,
      (SELECT pg_size_pretty(pg_database_size(current_database()))) AS db_size
  `);
  console.log(r.rows[0]);

  const cats = await c.query(
    `select "category", count(*)::int as n from "Product" group by 1 order by 2 desc`
  );
  console.log("products per category:", cats.rows);

  const img = await c.query(
    `select count(*)::int as total, count(*) filter (where "images" like 'data:%')::int as base64,
            count(*) filter (where "images" like 'https://%')::int as http
     from "Product"`
  );
  console.log("images:", img.rows[0]);

  await c.end();
})();
