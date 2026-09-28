// Upload the KODO landing image to Vercel Blob using the local token.
// This bypasses /api/upload entirely, so it works even though the
// BLOB_READ_WRITE_TOKEN env var is still missing in Vercel production.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { put } = require("@vercel/blob");

const SRC = process.argv[2];
const SLUG = process.argv[3] || "kodo-landing";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set in .env");
  }

  const input = fs.readFileSync(SRC);
  const meta = await sharp(input).metadata();
  console.log(`source: ${path.basename(SRC)}`);
  console.log(`  ${meta.width}x${meta.height} ${meta.format} ${(input.length / 1024).toFixed(1)} KB`);

  // Normalise to JPEG for broadest support and to keep the payload small.
  let output = await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  let ext = "jpg";

  if (output.length > 1.2 * 1024 * 1024) {
    output = await sharp(input)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
  }

  const outMeta = await sharp(output).metadata();
  console.log(`output: ${outMeta.width}x${outMeta.height} ${ext} ${(output.length / 1024).toFixed(1)} KB`);

  const blob = await put(`products/${SLUG}.${ext}`, output, {
    access: "public",
    contentType: `image/${ext}`,
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  console.log(`uploaded: ${blob.url}`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
