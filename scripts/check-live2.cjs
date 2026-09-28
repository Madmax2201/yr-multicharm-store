const base = "https://yrmulticharm.vercel.app";

(async () => {
  const diag = await (await fetch(`${base}/api/diag`)).json();
  console.log("diag.prisma:", JSON.stringify(diag.prisma));
  console.log("diag.tcp:", JSON.stringify(diag.tcp), " dns family:", diag.dns?.family);

  const p = await (await fetch(`${base}/api/products?limit=50`)).json();
  console.log(`\nproducts returned: ${p.products?.length}  total: ${p.total ?? "?"}`);
  for (const x of p.products || []) {
    const imgs = Array.isArray(x.images) ? x.images[0] : String(x.images).slice(0, 50);
    console.log(`  ${String(x.name).padEnd(15)} ${String(x.category).padEnd(17)} ${String(imgs).slice(0, 58)}`);
  }

  for (const path of ["/api/products/featured", "/api/admin/reviews", "/api/admin/dashboard", "/api/coupons/validate?code=WELCOME20"]) {
    const r = await fetch(`${base}${path}`);
    const ct = r.headers.get("content-type") || "";
    const b = (await r.text()).slice(0, 90);
    console.log(`\n${path}\n  ${r.status} ${ct.split(";")[0]}  ${JSON.stringify(b)}`);
  }
})();
