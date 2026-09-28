require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const r = await c.query(`SELECT "brand", count(*)::int AS n FROM "Product" GROUP BY 1 ORDER BY 2 DESC, 1`);
  console.log("distinct brands:");
  for (const x of r.rows) console.log(`  ${JSON.stringify(x.brand)}  x${x.n}`);
  await c.end();
})();
