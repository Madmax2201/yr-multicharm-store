// End-to-end probe of the admin upload route on production.
const BASE = process.env.TARGET || "https://yrmulticharm.vercel.app";
const FILE = process.argv[2];

async function main() {
  // 1. log in as admin
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@glowandbeauty.com", password: "admin123" }),
  });
  console.log(`login: HTTP ${login.status}`);
  const cookie = (login.headers.getSetCookie?.() || [])
    .map((c) => c.split(";")[0])
    .join("; ");
  if (!cookie) {
    console.log("no session cookie; body:", await login.text());
    return;
  }

  // 2. attempt an upload
  const buf = require("fs").readFileSync(FILE);
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type: "image/jpeg" }), "probe.jpg");

  const up = await fetch(`${BASE}/api/upload`, { method: "POST", body: fd, headers: { cookie } });
  const body = await up.text();
  console.log(`upload: HTTP ${up.status}`);
  console.log(`body: ${body.slice(0, 600)}`);
}

main().catch((e) => console.log("ERROR", e.message));
