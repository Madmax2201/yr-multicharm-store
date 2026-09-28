const { Client } = require("pg");
const url = process.env.TEST_URL;
if (!url) { console.log("set TEST_URL"); process.exit(1); }
(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 25000 });
  try {
    await c.connect();
    const v = await c.query("select version()");
    console.log("CONNECTED:", v.rows[0].version.split(",")[0]);
    const t = await c.query(`select table_name from information_schema.tables where table_schema='public' order by table_name`);
    console.log("tables:", t.rows.length ? t.rows.map(r => r.table_name).join(", ") : "(empty database)");
    await c.end();
  } catch (e) {
    console.log("CONNECT_ERROR:", e.message);
    try { await c.end(); } catch {}
  }
})();
