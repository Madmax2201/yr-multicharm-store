const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "..", "dev.db"), { readOnly: true });
const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, "blob-image-mapping.json"), "utf8"));

const byBase = {};
for (const [k, v] of Object.entries(mapping)) byBase[path.basename(k)] = v;

const q = (s) => (s === null || s === undefined ? "NULL" : s);
const str = (s) => (s === null || s === undefined ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const num = (n) => (n === null || n === undefined ? "NULL" : String(n));
const bool = (b) => (b ? "true" : "false");
const ts = (d) => (d ? `'${new Date(d).toISOString()}'` : "NULL");

// legacy category -> seeded slug
const CAT = {
  "beauty-devices": "beauty-devices",
  "Bath & Body": "ipl-hair-removal",
};
// sensible storefront spread across the 3 seeded categories
const OVERRIDE = {
  "IPL 02": "ipl-hair-removal",
  "IPL 03": "ipl-hair-removal",
  "Philips Lumea": "ipl-hair-removal",
  "Tria Laser 4X": "ipl-hair-removal",
  "Braun Pro 5": "ipl-hair-removal",
  "ANLAN": "beauty-devices",
  "Acura 99": "beauty-devices",
  "DermRays V4S": "beauty-devices",
  "KODO": "beauty-devices",
  "MLAY T14": "beauty-devices",
  "MLAY T16": "beauty-devices",
  "MLAY T18": "beauty-devices",
};

const CATS = [
  ["cmey6cduq0000p8gzjewy1n0a", "IPL Hair Removal", "ipl-hair-removal"],
  ["cmey6cduq0001p8gzjewy1n0a", "Beauty Devices", "beauty-devices"],
  ["cmey6cduq0002p8gzjewy1n0a", "Accessories", "accessories"],
];

const out = [];
out.push(`-- ============================================================`);
out.push(`-- YR Multicharm - Supabase bootstrap (schema + data)`);
out.push(`-- Generated from local dev.db; images repointed to Vercel Blob`);
out.push(`-- Run this ONCE in Supabase > SQL Editor > New query > Run`);
out.push(`-- ============================================================`);
out.push(``);
out.push(`BEGIN;`);
out.push(``);

// wipe in FK-safe order so re-running is safe
out.push(`-- clean slate (FK-safe order)`);
for (const t of ["CouponProduct","OrderItem","WishlistItem","Review","Order","Address","ProductVariant","Coupon","Product","Category","User"])
  out.push(`DELETE FROM "${t}";`);
out.push(``);

out.push(`-- categories`);
for (const [id, name, slug] of CATS)
  out.push(
    `INSERT INTO "Category" ("id","name","slug","icon","createdAt") VALUES (${str(id)}, ${str(name)}, ${str(slug)}, NULL, NOW());`
  );
out.push(``);

out.push(`-- users (bcrypt hashes preserved - same passwords work)`);
for (const u of db.prepare('select * from "User"').all()) {
  out.push(
    `INSERT INTO "User" ("id","name","email","password","role","phone","createdAt","updatedAt") VALUES (${str(u.id)}, ${str(u.name)}, ${str(u.email)}, ${str(u.password)}, ${str(u.role)}, ${q(u.phone) ? str(u.phone) : "NULL"}, ${ts(u.createdAt)}, ${ts(u.updatedAt)});`
  );
}
out.push(``);

let imgLocal = 0, imgBlob = 0;
const products = db.prepare('select * from "Product" order by "name"').all();
out.push(`-- products (${products.length})`);
for (const p of products) {
  let list;
  try { list = JSON.parse(p.images); } catch { list = [p.images]; }
  const mapped = list.map((e) => {
    const b = path.basename(String(e));
    if (byBase[b]) { imgBlob++; return byBase[b]; }
    imgLocal++; return e;
  });
  const cat = OVERRIDE[p.name] || CAT[p.category] || "beauty-devices";
  out.push(
    `INSERT INTO "Product" ("id","name","description","price","comparePrice","images","category","subcategory","brand","ingredients","howToUse","stock","isActive","featured","createdAt","updatedAt") VALUES (${str(p.id)}, ${str(p.name)}, ${str(p.description)}, ${num(p.price)}, ${num(p.comparePrice)}, ${str(JSON.stringify(mapped))}, ${str(cat)}, ${q(p.subcategory) ? str(p.subcategory) : "NULL"}, ${q(p.brand) ? str(p.brand) : "NULL"}, ${q(p.ingredients) ? str(p.ingredients) : "NULL"}, ${q(p.howToUse) ? str(p.howToUse) : "NULL"}, ${num(p.stock)}, ${bool(p.isActive)}, ${bool(p.featured)}, ${ts(p.createdAt)}, ${ts(p.updatedAt)});`
  );
}
out.push(``);

const variants = db.prepare('select * from "ProductVariant"').all();
out.push(`-- product variants (${variants.length})`);
for (const v of variants)
  out.push(
    `INSERT INTO "ProductVariant" ("id","productId","name","price","stock","sku") VALUES (${str(v.id)}, ${str(v.productId)}, ${str(v.name)}, ${num(v.price)}, ${num(v.stock)}, ${str(v.sku)});`
  );
out.push(``);

const coupons = db.prepare('select * from "Coupon"').all();
out.push(`-- coupons (${coupons.length})`);
for (const c of coupons)
  out.push(
    `INSERT INTO "Coupon" ("id","code","discount","type","minAmount","maxUses","usedCount","expiresAt","isActive","createdAt") VALUES (${str(c.id)}, ${str(c.code)}, ${num(c.discount)}, ${str(c.type)}, ${num(c.minAmount)}, ${num(c.maxUses)}, ${num(c.usedCount)}, ${ts(c.expiresAt)}, ${bool(c.isActive)}, ${ts(c.createdAt)});`
  );
out.push(``);

const cp = db.prepare('select * from "CouponProduct"').all();
out.push(`-- coupon<->product links (${cp.length})`);
for (const r of cp)
  out.push(
    `INSERT INTO "CouponProduct" ("couponId","productId") VALUES (${str(r.couponId)}, ${str(r.productId)});`
  );
out.push(``);

const revs = db.prepare('select * from "Review"').all();
out.push(`-- reviews (${revs.length})`);
for (const r of revs)
  out.push(
    `INSERT INTO "Review" ("id","rating","comment","userId","productId","createdAt") VALUES (${str(r.id)}, ${num(r.rating)}, ${q(r.comment) ? str(r.comment) : "NULL"}, ${str(r.userId)}, ${str(r.productId)}, ${ts(r.createdAt)});`
  );
out.push(``);
out.push(`COMMIT;`);
out.push(``);
out.push(`-- verify`);
out.push(`SELECT (SELECT count(*) FROM "Product") AS products,`);
out.push(`       (SELECT count(*) FROM "Category") AS categories,`);
out.push(`       (SELECT count(*) FROM "User") AS users,`);
out.push(`       (SELECT count(*) FROM "ProductVariant") AS variants,`);
out.push(`       (SELECT count(*) FROM "Coupon") AS coupons;`);

fs.writeFileSync(path.join(__dirname, "..", "supabase-seed.sql"), out.join("\n"), "utf8");

const schema = fs.readFileSync(path.join(__dirname, "..", "supabase-bootstrap.sql"), "utf8");
const combined = `${schema}\n\n${out.join("\n")}`;
fs.writeFileSync(path.join(__dirname, "..", "supabase-full-setup.sql"), combined, "utf8");

console.log("products:", products.length, "| blob images:", imgBlob, "| local images:", imgLocal);
console.log("variants:", variants.length, "| coupons:", coupons.length, "| couponLinks:", cp.length, "| reviews:", revs.length);
console.log("wrote supabase-seed.sql and supabase-full-setup.sql");
