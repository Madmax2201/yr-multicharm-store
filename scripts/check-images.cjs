require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const r = await c.query(`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE "images" LIKE '%data:%')::int AS base64,
           count(*) FILTER (WHERE "images" LIKE '%https://%')::int AS blob_http,
           count(*) FILTER (WHERE "images" LIKE '%/images/%')::int AS local_path
    FROM "Product"`);
  console.log("image storage:", r.rows[0]);
  const one = await c.query(`SELECT "name","images" FROM "Product" WHERE "name"='IPL 02'`);
  console.log("\nIPL 02 images:", one.rows[0].images);
  await c.end();
})();
