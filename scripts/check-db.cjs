require("dotenv").config();
const { Client } = require("pg");

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) { console.log("NO_DATABASE_URL"); process.exit(1); }
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20000 });
  try {
    await c.connect();
    const b = await c.query(
      `select count(*) filter (where "images" like 'data:%')::int as b64, count(*)::int as total from "Product"`
    );
    console.log("OK products_with_base64:", b.rows[0].b64, "of", b.rows[0].total);
    const sz = await c.query(`select pg_size_pretty(coalesce(sum(octet_length("images")),0)) as sz from "Product"`);
    console.log("images column size:", sz.rows[0].sz);
    await c.end();
  } catch (e) {
    console.log("DB_ERROR:", e.message);
    try { await c.end(); } catch {}
  }
})();
