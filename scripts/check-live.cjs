const urls = [
  "https://yrmulticharm.vercel.app/api/diag",
  "https://yrmulticharm.vercel.app/api/products?limit=1",
  "https://yrmulticharm.vercel.app/api/site-settings",
  "https://yrmulticharm.vercel.app/api/categories",
];

(async () => {
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: { accept: "application/json" } });
      const ct = r.headers.get("content-type") || "(none)";
      const body = await r.text();
      console.log(`\n${u.replace("https://yrmulticharm.vercel.app", "")}`);
      console.log(`  status: ${r.status}   content-type: ${ct}`);
      console.log(`  body[0..220]: ${JSON.stringify(body.slice(0, 220))}`);
    } catch (e) {
      console.log(`\n${u}\n  ERR ${e.message}`);
    }
  }
})();
