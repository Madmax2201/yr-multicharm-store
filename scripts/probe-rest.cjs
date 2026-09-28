const KEY = process.env.SB_PUBLISHABLE_KEY;
const BASE = `https://uvyogvjxapujhmxquzsn.supabase.co/rest/v1`;

async function probe(path, label) {
  try {
    const r = await fetch(`${BASE}${path}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const text = await r.text();
    console.log(`${label.padEnd(22)} ${r.status}  ${text.slice(0, 160)}`);
  } catch (e) {
    console.log(`${label.padEnd(22)} ERR  ${e.message}`);
  }
}

(async () => {
  await probe("/", "root");
  await probe("/Product?select=name&limit=1", 'Product');
  await probe("/product?select=name&limit=1", "product (lower)");
  await probe("/Category?select=slug&limit=1", "Category");
  await probe("/rpc/nonexistent", "rpc probe");
})();
