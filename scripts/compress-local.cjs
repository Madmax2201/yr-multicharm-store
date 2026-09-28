require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "..", "public", "images");
const SKIP = new Set(["Logo.jpg", "hero-bg.jpg"]);

(async () => {
  const files = fs
    .readdirSync(SRC)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .filter((f) => !SKIP.has(f));

  let before = 0;
  let after = 0;

  for (const file of files) {
    const full = path.join(SRC, file);
    const orig = fs.statSync(full).size;
    if (orig < 200 * 1024) continue; // already small, leave alone

    before += orig;

    const isPng = /\.png$/i.test(file);
    const pipeline = sharp(full).rotate().resize({ width: 1200, withoutEnlargement: true });

    const buf = isPng
      ? await pipeline.png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer()
      : await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();

    after += buf.length;
    fs.writeFileSync(full, buf);
    console.log(`${file}  ${(orig / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB`);
  }

  console.log("---");
  console.log("before:", (before / 1024 / 1024).toFixed(2), "MB");
  console.log("after: ", (after / 1024 / 1024).toFixed(2), "MB");
})().catch((e) => { console.log("ERROR:", e.message); process.exit(1); });
