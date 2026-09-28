require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const mapping = JSON.parse(
  fs.readFileSync(path.join(__dirname, "blob-image-mapping.json"), "utf8")
);

const byName = {};
for (const [k, v] of Object.entries(mapping)) byName[path.basename(k)] = v;

(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });
  try {
    await c.connect();
    const rows = await c.query('select "id", "name", "images" from "Product"');
    console.log("products in Neon:", rows.rows.length);

    let updated = 0;
    let already = 0;
    let unmatched = 0;

    for (const p of rows.rows) {
      let list;
      try { list = JSON.parse(p.images); } catch { list = [p.images]; }
      if (!Array.isArray(list)) list = [list];

      if (list.length && String(list[0]).startsWith("http")) { already++; continue; }

      const next = list.map((entry) => {
        const base = path.basename(String(entry));
        const url = byName[base];
        if (!url) { unmatched++; return entry; }
        return url;
      });

      const changed = JSON.stringify(next) !== JSON.stringify(list);
      if (changed) {
        await c.query('update "Product" set "images" = $1 where "id" = $2', [
          JSON.stringify(next),
          p.id,
        ]);
        updated++;
        console.log("  updated:", p.name);
      }
    }

    console.log("---");
    console.log("updated:", updated, "| already blob:", already, "| unmatched files:", unmatched);

    const leftover = await c.query(
      `select count(*)::int as c from "Product" where "images" like 'data:%'`
    );
    console.log("products still holding base64:", leftover.rows[0].c);

    const size = await c.query(
      `select pg_size_pretty(coalesce(sum(octet_length("images")),0)) as sz from "Product"`
    );
    console.log("images column size now:", size.rows[0].sz);

    await c.end();
  } catch (e) {
    console.log("DB_ERROR:", e.message);
    try { await c.end(); } catch {}
    process.exit(1);
  }
})();
