# KODO landing page source

Open `index.html` to preview the static landing page. The page uses local images in `assets/` and Cairo from Google Fonts. The design is a 533 px Figma export that scales down on narrow screens.

## Before publishing

Edit `config.js`:

- `orderEndpoint`: your HTTPS endpoint that accepts a JSON `POST` containing `fullName`, `phone`, `wilaya`, `municipality`, `address`, `product`, and `priceDzd`.
- `whatsappNumber`: the business WhatsApp number in international digits, with no `+`, spaces, or punctuation.

The WhatsApp contact button stays hidden until its number is configured. The form shows an honest unavailable message until its endpoint is configured. A successful order message appears only after the endpoint returns a successful HTTP response.

The form has required fields, phone length validation, a hidden honeypot, a minimum time before submission, a ten second retry interval, and duplicate submit prevention. **These browser checks do not stop determined bots.** The server must validate all fields, rate limit by IP and phone, reject duplicates, and use a CAPTCHA or equivalent risk control if abuse appears. Return a non-2xx status when an order is rejected. Do not accept the client supplied price as authoritative; set the product and price on the server.

## Interactions

- Gold price pill: scrolls directly to the order form.
- Purple hero button: scrolls to the section below the hero.
- Final purple CTA and bottom strip: scroll to the order form.
- Buttons have hover and press motion, and the two lifestyle banners crossfade. Reduced motion preference is respected.
- The WhatsApp button is separate from form submission and hides while the order form is visible, avoiding overlap with the confirmation button.

`source-figma-export.html` is the unmodified Builder export. `upgrade-export.mjs` records the one-time HTML transformation; do not rerun it against the upgraded `index.html`.
