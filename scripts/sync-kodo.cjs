// Copies the standalone KODO landing page from the Figma source folder into
// public/kodo, which is what the /kodo route serves.
//
// public/kodo/config.js is preserved when it already exists, so the configured
// orderEndpoint and whatsappNumber are never wiped by a re-sync.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "KODO-landing-page-developer-source");
const dest = path.join(root, "public", "kodo");

const FILES = ["index.html", "styles.css", "app.js"];

function copyFile(name) {
  const from = path.join(src, name);
  const to = path.join(dest, name);
  if (!fs.existsSync(from)) {
    console.error(`missing source file: ${from}`);
    process.exitCode = 1;
    return;
  }
  fs.copyFileSync(from, to);
  console.log(`copied ${name}`);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
  console.log("copied assets/");
}

if (!fs.existsSync(src)) {
  console.error(`source folder not found: ${src}`);
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });

for (const name of FILES) copyFile(name);

const configPath = path.join(dest, "config.js");
if (fs.existsSync(configPath)) {
  console.log("kept existing public/kodo/config.js");
} else {
  fs.copyFileSync(path.join(src, "config.js"), configPath);
  console.log("copied config.js (template)");
}

const assetsSrc = path.join(src, "assets");
if (fs.existsSync(assetsSrc)) copyDir(assetsSrc, path.join(dest, "assets"));
else console.error("missing source folder: assets/");

console.log("KODO landing page synced to public/kodo");
