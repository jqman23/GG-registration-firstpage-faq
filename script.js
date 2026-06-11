(function () {
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

  items.forEach(item => {
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

  function reportHeight() {
    const h = document.getElementById('faqShell').offsetHeight;
    window.parent.postMessage({ ggWidgetHeight: h + 2 }, '*');
  }

  if (window.ResizeObserver) {
    new ResizeObserver(reportHeight).observe(document.getElementById('faqShell'));
  }
  window.addEventListener('load', reportHeight);
})();
