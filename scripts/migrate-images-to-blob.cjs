require("dotenv").config();
const { Client } = require("pg");
const { put } = require("@vercel/blob");

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.log("NO_BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}

function dataUrlToBuffer(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  const [, mimeType, b64] = match;
  return { mimeType, buffer: Buffer.from(b64, "base64") };
}

(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });
  try {
    await c.connect();

    const products = await c.query(
      `select "id", "name", "images" from "Product" where "images" like '%data:%'`
    );
    console.log("products with base64 images:", products.rows.length);

    let migrated = 0;
    let skipped = 0;

    for (const p of products.rows) {
      let list;
      try {
        list = JSON.parse(p.images);
      } catch {
        list = [p.images];
      }
      if (!Array.isArray(list)) list = [list];

      const newList = [];
      let changed = false;

      for (const entry of list) {
        if (typeof entry !== "string" || !entry.startsWith("data:")) {
          newList.push(entry);
          continue;
        }
        const parsed = dataUrlToBuffer(entry);
        if (!parsed) {
          newList.push(entry);
          continue;
        }
        try {
          const ext = parsed.mimeType.split("/")[1]?.replace("+xml", "") || "jpg";
          const filename = `products/migrated-${p.id}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const blob = await put(filename, parsed.buffer, {
            access: "public",
            contentType: parsed.mimeType,
            token,
          });
          newList.push(blob.url);
          changed = true;
          migrated++;
        } catch (e) {
          newList.push(entry);
          console.log("  skip image for", p.name, "-", e.message);
        }
      }

      if (changed) {
        await c.query(`update "Product" set "images" = $1 where "id" = $2`, [
          JSON.stringify(newList),
          p.id,
        ]);
      } else {
        skipped++;
      }
    }

    console.log("migrated images:", migrated, "| products unchanged:", skipped);
    await c.end();
  } catch (e) {
    console.log("DB_ERROR:", e.message);
    try { await c.end(); } catch {}
    process.exit(1);
  }
})();
