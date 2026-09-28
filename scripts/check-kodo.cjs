require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const r = await c.query(`SELECT * FROM "Product" WHERE "brand" = 'kodo' OR "name" ILIKE '%kodo%'`);
  for (const p of r.rows) {
    console.log("---");
    console.log("id      :", p.id);
    console.log("name    :", p.name);
    console.log("slug    :", p.slug);
    console.log("brand   :", p.brand);
    console.log("price   :", p.price, " compare:", p.comparePrice);
    console.log("stock   :", p.stock);
    console.log("images  :", p.images);
    console.log("desc    :", p.description);
    console.log("howToUse:", p.howToUse);
    console.log("ingred  :", p.ingredients);
    console.log("subcat  :", p.subcategory);
  }
  console.log("\ntotal kodo products:", r.rows.length);
  await c.end();
})();
