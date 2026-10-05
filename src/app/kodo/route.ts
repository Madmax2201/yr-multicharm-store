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
 * A route handler bypasses the root layout, so the Meta Pixel that
 * src/app/layout.tsx loads never runs here. The pixel is injected into the
 * served markup instead, which also keeps public/kodo/index.html a verbatim
 * copy of the design source.
 *
 * The file is read once at module scope so the content is baked in at build
 * time and no filesystem access is needed at request time.
 */
const PAGE_PATH = join(process.cwd(), "public", "kodo", "index.html");

const PIXEL_ID = "1965342204162672";

const PIXEL_SCRIPT = `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
</script>`;

const PIXEL_NOSCRIPT = `<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1"
/></noscript>`;

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
  if (!html.includes("<head>") || !html.includes("<body>")) {
    throw new Error("KODO landing page is missing a <head> or <body> element.");
  }

  return html
    .replace("<head>", `<head><base href="/kodo/">\n${PIXEL_SCRIPT}\n`)
    .replace("<body>", `<body>\n${PIXEL_NOSCRIPT}\n`);
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
