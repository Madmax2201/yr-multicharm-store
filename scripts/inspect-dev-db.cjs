const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "..", "dev.db"), { readOnly: true });

const tables = db
  .prepare("select name from sqlite_master where type='table' order by name")
  .all()
  .map((r) => r.name);

console.log("tables:", tables.join(", "));

if (tables.includes("Product")) {
  const n = db.prepare('select count(*) as c from "Product"').get();
  console.log("products:", n.c);

  const withB64 = db
    .prepare(`select count(*) as c from "Product" where "images" like 'data:%'`)
    .get();
  console.log("products with base64 images:", withB64.c);

  const rows = db
    .prepare('select "name", "images", "isActive" from "Product" order by "name"')
    .all();
  for (const r of rows) {
    console.log(`  - [${r.isActive ? "on" : "off"}] ${r.name} => ${String(r.images).slice(0, 70)}`);
  }
}

for (const t of ["User", "Order", "OrderItem", "Address", "Review", "WishlistItem", "Coupon", "Category", "ProductVariant"]) {
  if (tables.includes(t)) {
    const c = db.prepare(`select count(*) as c from "${t}"`).get();
    console.log(`${t}: ${c.c}`);
  }
}
