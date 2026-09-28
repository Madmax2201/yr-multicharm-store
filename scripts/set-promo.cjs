require("dotenv").config();
const { Client } = require("pg");
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const names = ["IPL 02", "MLAY T14"];
  for (const n of names) {
    const r = await c.query(
      `UPDATE "Product" SET "comparePrice" = ROUND("price" * 1.25 / 100) * 100
       WHERE "name" = $1 AND "comparePrice" IS NULL RETURNING "name","price","comparePrice"`,
      [n]
    );
    if (r.rows[0]) {
      const { price, comparePrice } = r.rows[0];
      const off = Math.round(((comparePrice - price) / comparePrice) * 100);
      console.log(`${r.rows[0].name}: now ${price} DA (was ${comparePrice} DA) -> ${off}% off`);
    } else {
      console.log(`${n}: skipped (already has a comparePrice)`);
    }
  }
  await c.end();
})();
