require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const r = await c.query(`SELECT "id","name","brand","price" FROM "Product" ORDER BY "name"`);
  for (const x of r.rows) console.log(`${x.id}  ${x.name}`);
  const one = await c.query(`SELECT "id","name" FROM "Product" WHERE "id" = $1`, ["cmtlpxlhf000oh4hu6mtav5j0"]);
  console.log("\nlookup:", one.rows[0] || "NOT FOUND");
  await c.end();
})();
