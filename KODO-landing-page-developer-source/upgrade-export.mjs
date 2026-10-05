import fs from 'node:fs';
import path from 'node:path';

// One-time migration of the visual Figma export into a working landing page.
const file = path.join(import.meta.dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');
if (html.includes('id="order-form"')) throw new Error('Page has already been upgraded');

const formStart = html.indexOf('<div layer-name="14 Order Form Section"');
const formEnd = html.indexOf('<div layer-name="Sticky / Bottom CTA"', formStart);
if (formStart < 0 || formEnd < 0) throw new Error('Order form markers not found');
const form = `<section id="order-form" class="figma-133 order-section" dir="rtl" aria-labelledby="order-heading">
  <form id="kodo-order" class="order-form" novalidate>
    <h2 id="order-heading">اطلبي جهازك الآن</h2>
    <p class="order-subtitle">املئي معلوماتك وسنتواصل معك لتأكيد الطلب</p>
    <div class="form-field"><label for="full-name">الاسم الكامل <span aria-hidden="true">*</span></label><input id="full-name" name="fullName" type="text" autocomplete="name" placeholder="مثال: فاطمة علي" minlength="3" maxlength="100" required></div>
    <div class="form-field"><label for="phone">رقم الهاتف <span aria-hidden="true">*</span></label><input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0770 000 000" maxlength="20" required></div>
    <div class="form-row">
      <div class="form-field"><label for="wilaya">الولاية <span aria-hidden="true">*</span></label><input id="wilaya" name="wilaya" type="text" autocomplete="address-level1" placeholder="الولاية" maxlength="60" required></div>
      <div class="form-field"><label for="municipality">البلدية <span aria-hidden="true">*</span></label><input id="municipality" name="municipality" type="text" autocomplete="address-level2" placeholder="البلدية" maxlength="60" required></div>
    </div>
    <div class="form-field"><label for="address">العنوان <small>(اختياري)</small></label><input id="address" name="address" type="text" autocomplete="street-address" placeholder="الشارع، الحي..." maxlength="180"></div>
    <div class="bot-trap" aria-hidden="true"><label for="company-site">اتركي هذا الحقل فارغاً</label><input id="company-site" name="companySite" type="text" tabindex="-1" autocomplete="off"></div>
    <button class="order-submit" type="submit">إرسال طلب التأكيد <span aria-hidden="true">←</span></button>
    <p id="form-status" class="form-status" role="status" aria-live="polite"></p>
    <p class="order-reassurance">سنتواصل معك لتأكيد الطلب قبل الشحن</p>
  </form>
</section>`;
html = html.slice(0, formStart) + form + html.slice(formEnd);

html = html.replace('src="assets/asset-13.png" alt=""', 'src="assets/banner-after.png" alt="امرأة تستخدم جهاز KODO على ساقها"');
const beforeMarker = '<div layer-name="10 Product Explanation"';
if (!html.includes(beforeMarker)) throw new Error('Banner marker not found');
html = html.replace(beforeMarker, '<img class="banner-before" src="assets/banner-before.png" alt="قبل الاستخدام: شعر ظاهر على الساق" /><div class="banner-label" aria-hidden="true">قبل <span>／</span> بعد</div>' + beforeMarker);

// The price art is made from several independent Figma layers; one transparent link covers the whole pill.
html = html.replace('<div layer-name="CTA / Hero"', '<div role="button" tabindex="0" aria-label="اكتشفي تفاصيل KODO" data-scroll-target="details" layer-name="CTA / Hero"');
html = html.replace('<div layer-name="CTA / Order KODO"', '<div role="button" tabindex="0" aria-label="انتقلي إلى نموذج الطلب" data-scroll-target="order-form" layer-name="CTA / Order KODO"');
html = html.replace('<div layer-name="Sticky / Bottom CTA"', '<div role="button" tabindex="0" aria-label="اطلبي الآن بسعر 55,000 دج" data-scroll-target="order-form" layer-name="Sticky / Bottom CTA"');
html = html.replace('<div layer-name="FAB / WhatsApp"', '<a id="whatsapp-contact" aria-label="تواصلي معنا عبر واتساب" target="_blank" rel="noopener noreferrer" layer-name="FAB / WhatsApp"');
html = html.replace('</svg>\n</div><div layer-name="FAB / WA Tooltip"', '</svg>\n</a><div layer-name="FAB / WA Tooltip"');
html = html.replace('class="figma-1"', 'class="figma-1"');
html = html.replace('<div layer-name="07 Pain Point Cards + 08 Core Benefits"', '<div id="details" layer-name="07 Pain Point Cards + 08 Core Benefits"');
html = html.replace('</div>\n<script>\n(function(){const page=', '<a class="price-hit" href="#order-form" aria-label="اطلبي الآن بسعر 55,000 دج"></a>\n</div>\n<script>\n(function(){const page=');
html = html.replace('</body>', '<script src="config.js"></script>\n<script src="app.js"></script>\n</body>');
fs.writeFileSync(file, html);
