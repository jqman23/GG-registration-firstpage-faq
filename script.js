(function () {
  const INDIV = 175;
  const EARLY_BIRD = 0.90;

  function groupRate(n) {
    if (n >= 50) return 90;
    if (n >= 40) return 105;
    if (n >= 30) return 120;
    if (n >= 20) return 135;
    return 150;
  }

  function fmt(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function setTierClass(n, slider) {
    const groupContent = slider.closest('.groupContent');
    if (!groupContent) return;

    groupContent.classList.remove('tierSmall', 'tierMedium', 'tierLarge');

    if (n >= 50) {
      groupContent.classList.add('tierLarge');
    } else if (n >= 30) {
      groupContent.classList.add('tierMedium');
    } else {
      groupContent.classList.add('tierSmall');
    }
  }

  // ── Group slider ────────────────────────────────────────
  function updateGroupSlider() {
    const slider = document.getElementById('groupSlider');
    if (!slider) return;

    const n = +slider.value;
    setTierClass(n, slider);

    const rate = groupRate(n);
    const indiv = n * INDIV;
    const total = Math.round(n * rate * EARLY_BIRD);
    const saved = indiv - total;

    document.getElementById('groupPill').textContent = n + ' people';
    document.getElementById('groupIndiv').textContent = fmt(indiv);
    document.getElementById('groupTotal').textContent = fmt(total) + ' total';
    document.getElementById('groupSavingsBig').textContent = fmt(saved) + ' saved';

    document.querySelectorAll('.groupTierItem').forEach(function (el) {
      const min = +el.dataset.min;
      const max = +el.dataset.max;
      el.classList.toggle('active', n >= min && n <= max);
    });
  }

  const slider = document.getElementById('groupSlider');
  if (slider) {
    slider.addEventListener('input', function () {
      updateGroupSlider();

      const panel = slider.closest('.faqPanel');
      if (panel && panel.style.maxHeight) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    updateGroupSlider();
  }

  // ── Group contact form ──────────────────────────────────
  const gcSend = document.getElementById('gcSend');
  if (gcSend) {
    gcSend.addEventListener('click', async function () {
      const nameEl = document.getElementById('gcName');
      const emailEl = document.getElementById('gcEmail');
      const msgEl = document.getElementById('gcMsg');

      let valid = true;

      [nameEl, emailEl, msgEl].forEach(function (el) {
        if (!el.value.trim()) {
          el.classList.add('gcError');
          el.addEventListener('input', function () {
            el.classList.remove('gcError');
          }, { once: true });
          valid = false;
        }
      });

      if (!valid) return;

      this.disabled = true;
      this.textContent = 'Sending…';

      try {
        const res = await fetch('https://formsubmit.co/ajax/globalgathering@cuanschutz.edu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: nameEl.value.trim(),
            email: emailEl.value.trim(),
            message: msgEl.value.trim(),
            _subject: 'Group Registration Question — Global Gathering',
            _template: 'box'
          })
        });

        if (!res.ok) throw new Error();

        document.getElementById('groupFormFields').style.display = 'none';
        document.getElementById('gcSuccess').style.display = 'block';

        const panel = gcSend.closest('.faqPanel');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';

        reportHeight();
      } catch (_) {
        this.disabled = false;
        this.textContent = 'Send →';
        alert('Something went wrong — please email globalgathering@cuanschutz.edu directly.');
      }
    });
  }

  // ── Accordion ───────────────────────────────────────────
  const items = Array.from(document.querySelectorAll('.faqItem'));

  function openItem(item) {
    item.classList.add('open');
    const btn = item.querySelector('.faqBtn');
    const panel = item.querySelector('.faqPanel');
    btn.setAttribute('aria-expanded', 'true');
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }

  function closeItem(item) {
    item.classList.remove('open');
    const btn = item.querySelector('.faqBtn');
    const panel = item.querySelector('.faqPanel');
    btn.setAttribute('aria-expanded', 'false');
    panel.style.maxHeight = null;
  }

  items.forEach(function (item) {
    item.querySelector('.faqBtn').addEventListener('click', function () {
      const isOpen = item.classList.contains('open');
      items.forEach(closeItem);
      if (!isOpen) openItem(item);
      reportHeight();
    });
  });

  // ── Show/hide FAQ list ───────────────────────────────────
  var faqList = document.getElementById('faqList');
  var openAllBtn = document.getElementById('openAll');
  var closeAllBtn = document.getElementById('closeAll');
  var toggleLine = document.getElementById('faqToggleLine');

  function doToggle() {
    var isHidden = faqList.classList.contains('hidden');

    faqList.classList.toggle('hidden', !isHidden);
    openAllBtn.classList.toggle('hidden', !isHidden);
    closeAllBtn.classList.toggle('hidden', !isHidden);

    toggleLine.innerHTML = isHidden
      ? 'Have questions before continuing with the registration process? <span id="toggleFaqs">Click here</span> to hide FAQs.'
      : 'Have questions before continuing with the registration process? <span id="toggleFaqs">Click here</span> to see FAQs.';

    reportHeight();
  }

  toggleLine.addEventListener('click', function (e) {
    if (e.target.id === 'toggleFaqs') doToggle();
  });

  openAllBtn.addEventListener('click', function () {
    items.forEach(openItem);
    reportHeight();
  });

  closeAllBtn.addEventListener('click', function () {
    items.forEach(closeItem);
    reportHeight();
  });

  // ── Click tracking once per session ──────────────────────
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxq8HofSFbnFxS7HeKQKZVhyuPIqpu_7NAWhvOzAXBzyxfatdeJu8hfGCRCahOINshA/exec';
  var TRACK_KEY = 'ggFaqTracked';

  async function trackClick() {
    if (sessionStorage.getItem(TRACK_KEY)) return;

    sessionStorage.setItem(TRACK_KEY, '1');

    var params = new URLSearchParams({
      sheet: '2026Registration',
      button: 'RegFirstPageFAQ'
    });

    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function () {
        ctrl.abort();
      }, 3000);

      var geo = await fetch('https://ipapi.co/json/', {
        signal: ctrl.signal
      }).then(function (r) {
        return r.json();
      });

      clearTimeout(timer);

      if (geo.ip) params.set('ip', geo.ip);
      if (geo.country_name) params.set('country', geo.country_name);
      if (geo.region) params.set('state', geo.region);
      if (geo.city) params.set('city', geo.city);
    } catch (_) {}

    fetch(SCRIPT_URL + '?' + params.toString(), {
      mode: 'no-cors'
    }).catch(function () {});
  }

  document.getElementById('faqShell').addEventListener('pointerdown', trackClick, { once: true });

  // ── Height reporting ─────────────────────────────────────
  function reportHeight() {
    const h = document.getElementById('faqShell').offsetHeight;
    window.parent.postMessage({ ggWidgetHeight: h + 2 }, '*');
  }

  if (window.ResizeObserver) {
    new ResizeObserver(reportHeight).observe(document.getElementById('faqShell'));
  }

  window.addEventListener('load', reportHeight);
})();
