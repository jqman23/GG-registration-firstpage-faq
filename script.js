(function () {
  const INDIV = 175;

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

  // ── Group slider ────────────────────────────────────────
  function updateGroupSlider() {
    const slider = document.getElementById('groupSlider');
    if (!slider) return;
    const n    = +slider.value;
    const rate = groupRate(n);
    const indiv = n * INDIV;
    const total = n * rate;
    const saved = indiv - total;
    const pct   = Math.round((saved / indiv) * 100);

    document.getElementById('groupPill').textContent       = n + ' people';
    document.getElementById('groupIndiv').textContent      = fmt(indiv);
    document.getElementById('groupTotal').textContent      = fmt(total) + ' total';
    document.getElementById('groupSavingsBig').textContent = fmt(saved) + ' saved';
    document.getElementById('heroPct').textContent         = pct + '%';

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
      // update panel height since content reflows minimally
      const panel = slider.closest('.faqPanel');
      if (panel && panel.style.maxHeight) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
    updateGroupSlider();
  }

  // ── Accordion ───────────────────────────────────────────
  const items = Array.from(document.querySelectorAll('.faqItem'));

  function openItem(item) {
    item.classList.add('open');
    const btn   = item.querySelector('.faqBtn');
    const panel = item.querySelector('.faqPanel');
    btn.setAttribute('aria-expanded', 'true');
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }

  function closeItem(item) {
    item.classList.remove('open');
    const btn   = item.querySelector('.faqBtn');
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

  document.getElementById('openAll').addEventListener('click', function () {
    items.forEach(openItem);
    reportHeight();
  });

  document.getElementById('closeAll').addEventListener('click', function () {
    items.forEach(closeItem);
    reportHeight();
  });

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
