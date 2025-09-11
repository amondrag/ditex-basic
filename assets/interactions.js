// interactions.js — safe to run as <script type="module">

/* Sticky header + scroll progress */
const header = document.querySelector('header');
let ticking = false;
function onScroll() {
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  if (header) header.classList.toggle('is-scrolled', y > 4);
  const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
  const p = Math.min(1, Math.max(0, y / max));
  document.body.style.setProperty('--scroll', p.toFixed(4));
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

/* Reveal on scroll */
(() => {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => io.observe(el));
})();

/* Marquee: duplicate track for seamless loop */
(() => {
  const wrappers = document.querySelectorAll('[data-marquee]');
  wrappers.forEach(w => {
    const track = w.querySelector('.marquee');
    if (!track) return;
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentNode.appendChild(clone);
  });
})();

/* Lazy-load non-hero images (keep hero/LCP eager) */
(() => {
  // exclude images in the hero area and any explicitly opted-out with data-eager
  const imgs = document.querySelectorAll('img:not(.hero img):not([data-eager])');
  imgs.forEach(img => {
    if (!img.hasAttribute('loading'))  img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });
})();

/* Parallax (respect reduced motion) */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const items = [...document.querySelectorAll('[data-parallax-y]')].map(el => ({
    el,
    f: parseFloat(el.getAttribute('data-parallax-y')) || 0.15
  }));
  if (!items.length) return;

  let raf = 0;
  function step() {
    const vh = window.innerHeight;
    for (const { el, f } of items) {
      const r = el.getBoundingClientRect();
      const offset = (r.top - vh / 2) * f;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    raf = 0;
  }
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(step); }, { passive: true });
  window.addEventListener('resize', step, { passive: true });
  step();
})();

/* Animated counters */
(() => {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      io.unobserve(el);
      const target = parseFloat(el.getAttribute('data-target')) || 0;
      const dur = 1200;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * easeOutCubic(p)).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.5 });
  counters.forEach(el => io.observe(el));
})();

/* Tilt (CSS-vars based; works with mouse/pen/touch; respects reduced motion) */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const MAX = 6;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length) return;

  cards.forEach(card => {
    let rect = card.getBoundingClientRect();

    const recalc = () => { rect = card.getBoundingClientRect(); };
    window.addEventListener('resize', recalc, { passive: true });

    card.addEventListener('pointerenter', () => { recalc(); card.classList.add('tilting'); });
    card.addEventListener('pointermove', e => {
      const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;  // -1..1
      const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1..1
      const rx = clamp(-yNorm * MAX, -MAX, MAX);
      const ry = clamp( xNorm * MAX, -MAX, MAX);
      card.style.setProperty('--rx', rx.toFixed(2));
      card.style.setProperty('--ry', ry.toFixed(2));
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0');
      card.style.setProperty('--ry', '0');
    }, { passive: true });
  });
})();

/* Smooth scroll for same-page anchors (only if target exists) */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = id && document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* Language switcher defaults (so it works w/ or w/o JS) + dynamic mapping */
(() => {
  const toEN = document.getElementById('to-en');
  const toES = document.getElementById('to-es');
  if (!toEN || !toES) return;

  const path = location.pathname;
  const isES = /^\/es(\/|$)/i.test(path);

  if (isES) {
    // /es/foo -> /foo
    toEN.href = path.replace(/^\/es/i, '') || '/';
    toES.href = path;
    toES.classList.add('is-active');
  } else {
    // /foo -> /es/foo (root -> /es/)
    toEN.href = path || '/';
    toES.href = path === '/' ? '/es/' : '/es' + path;
    toEN.classList.add('is-active');
  }
})();
