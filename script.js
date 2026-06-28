/* ── Nav shadow on scroll ─────────────────────────────────────── */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('nav--scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
}());

/* ── Project filter ────────────────────────────────────────────── */
(function () {
  const btns  = Array.from(document.querySelectorAll('.filter-btn'));
  const cards = Array.from(document.querySelectorAll('.pcard'));
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const f = btn.dataset.filter;
      cards.forEach(card => {
        card.style.display = (f === 'All' || card.dataset.category === f) ? '' : 'none';
      });
    });
  });
}());

/* ── Active nav on scroll (index.html only) ───────────────────── */
(function () {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links    = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
  if (!sections.length || !links.length) return;

  function update() {
    const y = window.scrollY + 90;
    let found = false;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (y >= sections[i].offsetTop) {
        const id = sections[i].id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        found = true;
        break;
      }
    }
    if (!found) links.forEach(l => l.classList.remove('active'));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());
