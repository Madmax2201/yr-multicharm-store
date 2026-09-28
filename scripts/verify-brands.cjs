require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();

  const b = await c.query(`SELECT count(*)::int AS n FROM "Brand"`);
  console.log(`Brand rows: ${b.rows[0].n}`);

  const r = await c.query(`SELECT "brand", count(*)::int AS n FROM "Product" GROUP BY 1 ORDER BY 2 DESC, 1`);
  console.log("Product.brand values:");
  for (const x of r.rows) console.log(`  ${x.brand}  x${x.n}`);

  const orphan = await c.query(
    `SELECT count(*)::int AS n FROM "Product" p
     WHERE p."brand" IS NOT NULL AND p."brand" <> ''
       AND NOT EXISTS (SELECT 1 FROM "Brand" b WHERE b.slug = p."brand")`
  );
  console.log(`Products with unmatched brand: ${orphan.rows[0].n}`);

  await c.end();
})();
