(() => {
  const config = window.KODO_CONFIG || {};
  const form = document.querySelector('#kodo-order');
  const status = document.querySelector('#form-status');
  const submit = form.querySelector('button[type="submit"]');
  const whatsapp = document.querySelector('#whatsapp-contact');
  const mountedAt = performance.now();
  let lastAttemptAt = 0;
  let inFlight = false;

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    if (id === 'order-form') setTimeout(() => form.querySelector('#full-name').focus({ preventScroll: true }), 450);
  }

  document.querySelectorAll('[data-scroll-target]').forEach((element) => {
    const go = () => scrollToSection(element.dataset.scrollTarget);
    element.addEventListener('click', go);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); go(); }
    });
  });
  document.querySelector('.price-hit')?.addEventListener('click', (event) => { event.preventDefault(); scrollToSection('order-form'); });

  const number = String(config.whatsappNumber || '').replace(/\D/g, '');
  if (number.length >= 10 && number.length <= 15) {
    document.body.append(whatsapp);
    whatsapp.href = `https://wa.me/${number}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن جهاز KODO.')}`;
    new IntersectionObserver(([entry]) => {
      whatsapp.classList.toggle('away-from-form', entry.isIntersecting);
    }, { threshold: 0.05 }).observe(document.querySelector('#order-form'));
  } else {
    whatsapp.hidden = true;
  }

  function showStatus(message, kind = 'error') {
    status.textContent = message;
    status.dataset.kind = kind;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (inFlight) return;
    const now = performance.now();
    if (form.elements.companySite.value || now - mountedAt < 2500) {
      showStatus('يرجى الانتظار قليلاً ثم المحاولة مجدداً.');
      return;
    }
    for (const field of form.querySelectorAll('[required]')) {
      field.value = field.value.trim();
      if (!field.checkValidity()) {
        showStatus('يرجى إكمال الحقول المطلوبة.');
        field.focus();
        return;
      }
    }
    const digits = form.elements.phone.value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) {
      showStatus('يرجى إدخال رقم هاتف صحيح.');
      form.elements.phone.focus();
      return;
    }
    if (!config.orderEndpoint) {
      showStatus('استقبال الطلبات غير مفعّل حالياً. يرجى التواصل معنا قبل إرسال الطلب.');
      return;
    }
    if (now - lastAttemptAt < 10000) { showStatus('يرجى الانتظار قبل إعادة المحاولة.'); return; }
    lastAttemptAt = now;

    const payload = {
      fullName: form.elements.fullName.value,
      phone: form.elements.phone.value.trim(),
      wilaya: form.elements.wilaya.value,
      municipality: form.elements.municipality.value,
      address: form.elements.address.value.trim(),
      product: 'KODO',
      priceDzd: 55000
    };
    inFlight = true;
    submit.disabled = true;
    submit.textContent = 'جارٍ إرسال الطلب…';
    showStatus('');
    try {
      const response = await fetch(config.orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Order API: ${response.status}`);
      showStatus('وصل طلبك. سنتواصل معك لتأكيد التفاصيل قبل الشحن.', 'success');
      form.reset();
      if (!localStorage.getItem('locale')) localStorage.setItem('locale', 'ar');
      window.location.assign('/checkout/success');
    } catch (error) {
      console.error(error);
      showStatus('تعذر إرسال الطلب حالياً. يرجى المحاولة لاحقاً أو التواصل معنا عبر واتساب.');
    } finally {
      inFlight = false;
      submit.disabled = false;
      submit.innerHTML = 'إرسال طلب التأكيد <span aria-hidden="true">←</span>';
    }
  });
})();
