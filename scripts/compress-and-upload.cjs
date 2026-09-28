require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { put } = require("@vercel/blob");

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) { console.log("NO_BLOB_TOKEN"); process.exit(1); }

const SRC = path.join(__dirname, "..", "public", "images");
const SKIP = new Set(["Logo.jpg", "hero-bg.jpg"]);

(async () => {
  const files = fs
    .readdirSync(SRC)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .filter((f) => !SKIP.has(f))
    .filter((f) => fs.statSync(path.join(SRC, f)).size > 0);

  const mapping = {};
  let before = 0;
  let after = 0;

  for (const file of files) {
    const full = path.join(SRC, file);
    const origSize = fs.statSync(full).size;
    before += origSize;

    const outName = file.replace(/\.[^.]+$/, "") + ".jpg";
    const buf = await sharp(full)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    after += buf.length;

    const blob = await put(`products/${outName}`, buf, {
      access: "public",
      contentType: "image/jpeg",
      token,
    });

    mapping[file] = blob.url;
    mapping["/images/" + file] = blob.url;
    console.log(
      `${file}  ${(origSize / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB`
    );
  }

  fs.writeFileSync(
    path.join(__dirname, "blob-image-mapping.json"),
    JSON.stringify(mapping, null, 2)
  );

  console.log("---");
  console.log("files:", files.length);
  console.log("before:", (before / 1024 / 1024).toFixed(2), "MB");
  console.log("after: ", (after / 1024 / 1024).toFixed(2), "MB");
  console.log("saved: ", ((before - after) / 1024 / 1024).toFixed(2), "MB");
  console.log("mapping written to scripts/blob-image-mapping.json");
})().catch((e) => { console.log("ERROR:", e.message); process.exit(1); });
