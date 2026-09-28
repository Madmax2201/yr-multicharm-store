// End-to-end test: landing page renders, form submits, admin can validate.
const BASE = process.env.TARGET || "https://yrmulticharm.vercel.app";

async function main() {
  // 1. landing page
  const page = await fetch(`${BASE}/kodo`, { redirect: "follow" });
  console.log(`landing page: HTTP ${page.status}`);
  const html = await page.text();
  for (const needle of ["KODO", "sponsor", "lead-name", "lead-phone", "lead-wilaya"]) {
    console.log(`  contains "${needle}": ${html.includes(needle)}`);
  }

  // 2. reject a bad submission
  const bad = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "x", phone: "abc" }),
  });
  console.log(`bad submission: HTTP ${bad.status} ${JSON.stringify(await bad.json())}`);

  // 3. valid submission
  const stamp = Date.now();
  const good = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Sponsor",
      phone: "0555 12 34 56",
      email: "sponsor@example.com",
      wilaya: "الجزائر",
      quantity: 3,
      message: "Automated end-to-end test",
    }),
  });
  const leadBody = await good.json();
  console.log(`valid submission: HTTP ${good.status} ${JSON.stringify(leadBody)}`);

  // 4. admin list
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@glowandbeauty.com", password: "admin123" }),
  });
  const cookie = (login.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");

  const list = await fetch(`${BASE}/api/admin/leads`, { headers: { cookie } });
  const listBody = await list.json();
  console.log(`admin list: HTTP ${list.status} summary=${JSON.stringify(listBody.summary)}`);

  const found = (listBody.leads || []).find((l) => l.id === leadBody.id);
  console.log(`  created lead visible to admin: ${!!found}`);
  if (found) {
    console.log(`  -> ${found.name} / ${found.phone} / ${found.wilaya} / status=${found.status}`);

    // 5. validate (approve)
    const put = await fetch(`${BASE}/api/admin/leads/${found.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "APPROVED", notes: "verified by e2e test" }),
    });
    console.log(`approve: HTTP ${put.status} -> ${(await put.json()).status}`);

    // 6. clean up
    const del = await fetch(`${BASE}/api/admin/leads/${found.id}`, {
      method: "DELETE",
      headers: { cookie },
    });
    console.log(`cleanup delete: HTTP ${del.status}`);
  }

  // 7. confirm public admin route is closed
  const anon = await fetch(`${BASE}/api/admin/leads`);
  console.log(`unauthenticated admin list: HTTP ${anon.status} (expect 401)`);
}

main().catch((e) => console.log("ERROR", e.message));
