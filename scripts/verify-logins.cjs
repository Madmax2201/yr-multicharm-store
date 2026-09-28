require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Client } = require("pg");

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000 });
  await c.connect();
  const users = await c.query(`SELECT "name","email","role","password" FROM "User" ORDER BY "role"`);
  const guesses = ["admin123", "user123", "admin", "password", "123456", "admin1234"];
  for (const u of users.rows) {
    const match = guesses.find((g) => bcrypt.compareSync(g, u.password));
    console.log(`${u.role.padEnd(5)} | ${u.name.padEnd(13)} | ${u.email.padEnd(26)} | password: ${match || "NO MATCH"}`);
  }
  await c.end();
})();
