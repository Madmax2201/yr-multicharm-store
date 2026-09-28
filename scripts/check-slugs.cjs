require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const r = await c.query(`SELECT "name","slug" FROM "Product" ORDER BY "name"`);
  for (const x of r.rows) console.log(`/products/${x.slug}   <-  ${x.name}`);
  const nulls = await c.query(`SELECT count(*)::int AS n FROM "Product" WHERE "slug" IS NULL OR "slug" = ''`);
  const dupes = await c.query(`SELECT "slug", count(*)::int AS n FROM "Product" GROUP BY 1 HAVING count(*) > 1`);
  console.log(`\nempty slugs: ${nulls.rows[0].n}`);
  console.log(`duplicate slugs: ${dupes.rows.length}`);
  await c.end();
})();
