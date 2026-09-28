require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const r = await c.query(`SELECT count(*)::int AS total, count(*) FILTER (WHERE "featured")::int AS featured FROM "Product"`);
  console.log("products:", r.rows[0]);
  await c.end();
})();
