/* ================================================================
   Kartikay Singh — Portfolio
   ================================================================ */

/* ── Carousel ─────────────────────────────────────────────────── */
(function () {
  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');

  if (!carousel || !dotsWrap) return;

  const cards = Array.from(carousel.querySelectorAll('.pcard'));
  let current  = 0;

  /* Build dots */
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Project ' + (i + 1));
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

  function setActive(i) {
    current = Math.max(0, Math.min(i, cards.length - 1));
    dots.forEach((d, j) => {
      const on = j === current;
      d.classList.toggle('active', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function goTo(i) {
    setActive(i);
    cards[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Keyboard */
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  /* Sync dots on scroll */
  let scrollTick;
  carousel.addEventListener('scroll', () => {
    clearTimeout(scrollTick);
    scrollTick = setTimeout(() => {
      const mid = carousel.scrollLeft + carousel.clientWidth / 2;
      let closest = 0, minD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < minD) { minD = d; closest = i; }
      });
      if (closest !== current) setActive(closest);
    }, 60);
  }, { passive: true });

  /* Drag / pointer */
  let startX = 0, startScroll = 0, dragging = false;

  carousel.addEventListener('pointerdown', e => {
    dragging    = true;
    startX      = e.clientX;
    startScroll = carousel.scrollLeft;
    carousel.classList.add('dragging');
    carousel.setPointerCapture(e.pointerId);
  });

  carousel.addEventListener('pointermove', e => {
    if (!dragging) return;
    carousel.scrollLeft = startScroll - (e.clientX - startX);
  });

  const endDrag = () => {
    dragging = false;
    carousel.classList.remove('dragging');
  };
  carousel.addEventListener('pointerup',     endDrag);
  carousel.addEventListener('pointercancel', endDrag);

  setActive(0);
}());

/* ── Active nav link on scroll ────────────────────────────────── */
(function () {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links    = Array.from(document.querySelectorAll('.nav__link'));

  function update() {
    const y = window.scrollY + 120;
    sections.forEach(sec => {
      if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id));
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());
