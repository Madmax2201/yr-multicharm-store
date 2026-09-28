require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  await c.query(`UPDATE "Product" SET "featured" = false`);
  const r = await c.query(
    `UPDATE "Product" SET "featured" = true WHERE "name" = ANY($1) RETURNING "name"`,
    [["IPL 02", "IPL 03", "Braun Pro 5", "Philips Lumea"]]
  );
  console.log("featured now:", r.rows.map((x) => x.name));
  const all = await c.query(
    `SELECT "name", "featured" FROM "Product" WHERE "featured" = true ORDER BY "createdAt" DESC`
  );
  console.log("homepage will show:", all.rows.map((x) => x.name));
  await c.end();
})();
