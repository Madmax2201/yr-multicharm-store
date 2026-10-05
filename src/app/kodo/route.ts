import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Serves the standalone KODO landing page (public/kodo/index.html) at /kodo.
 *
 * The page ships its own styles.css, app.js and assets/ folder using relative
 * paths, so the response injects a <base href="/kodo/"> tag. That keeps every
 * relative URL resolving under /kodo/ while the visitor stays on the clean
 * /kodo address. The markup on disk is never modified.
 *
 * The file is read once at module scope so the content is baked in at build
 * time and no filesystem access is needed at request time.
 */
const PAGE_PATH = join(process.cwd(), "public", "kodo", "index.html");

// Prerendered at build time so the HTML is baked into the output and the
// serverless function never needs filesystem access at request time.
export const dynamic = "force-static";

function loadPage(): string {
  let html: string;
  try {
    html = readFileSync(PAGE_PATH, "utf8");
  } catch {
    throw new Error(
      `KODO landing page not found at ${PAGE_PATH}. ` +
        `Run: npm run sync:kodo (or copy KODO-landing-page-developer-source into public/kodo).`
    );
  }
  return html.includes("<head>")
    ? html.replace("<head>", '<head><base href="/kodo/">')
    : html;
}

const page = loadPage();

export async function GET() {
  return new Response(page, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
