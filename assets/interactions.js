
/* DITEX Interactions + Language Switcher Mapper */
// Sticky header + scroll progress
const header = document.querySelector('header');
function onScroll() {
  const y = window.scrollY || document.documentElement.scrollTop;
  if (header) header.classList.toggle('is-scrolled', y > 8);
  const doc = document.documentElement;
  const progress = (doc.scrollTop) / (doc.scrollHeight - doc.clientHeight);
  document.body.style.setProperty('--scroll', (progress || 0).toFixed(4));
}
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
},{ threshold:.14, rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el=> io.observe(el));

// Marquee enhancer
function enhanceMarquee(){
  document.querySelectorAll('[data-marquee]').forEach(wrapper=>{
    const track = wrapper.querySelector('.marquee'); if(!track) return;
    const totalWidth = Array.from(track.children).reduce((s, c)=> s + c.getBoundingClientRect().width, 0);
    const vw = wrapper.getBoundingClientRect().width;
    if(totalWidth < vw * 2){ const clone = track.cloneNode(true); clone.setAttribute('aria-hidden','true'); track.parentNode.appendChild(clone); }
  });
}
window.addEventListener('load', enhanceMarquee);

// Parallax hero
const parallaxEls = Array.from(document.querySelectorAll('[data-parallax-y]'));
function parallax(){
  const y = window.scrollY || document.documentElement.scrollTop;
  parallaxEls.forEach(el=>{ const s = parseFloat(el.getAttribute('data-parallax-y')) || 0.15; el.style.transform = `translate3d(0, ${y * s}px, 0)`; });
}
window.addEventListener('scroll', parallax, { passive: true }); parallax();

// Counters
const ease = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;
function animateCounter(el){
  const target = parseFloat(el.getAttribute('data-target')) || 0;
  const dur = parseInt(el.getAttribute('data-duration') || '1000', 10);
  let t0 = null; const start = 0;
  function step(ts){ if(!t0) t0 = ts; const p = Math.min(1, (ts - t0)/dur); const val = Math.floor(start + (target - start) * ease(p)); el.textContent = val.toLocaleString(); if(p < 1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
const ioCounter = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ animateCounter(e.target); ioCounter.unobserve(e.target); } });
},{ threshold:.6 });
document.querySelectorAll('[data-counter]').forEach(el=> ioCounter.observe(el));

// Tilt (optional)
document.querySelectorAll('[data-tilt]').forEach(card => {
  let rID = null;
  function onMove(e){
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width * 2 - 1;
    const y = (e.clientY - r.top)/r.height * 2 - 1;
    card.style.setProperty('--rx', (y * -6).toFixed(2));
    card.style.setProperty('--ry', (x * 6).toFixed(2));
    if(!rID){ rID = requestAnimationFrame(()=>{ card.style.transform = `perspective(800px) rotateX(var(--rx)deg) rotateY(var(--ry)deg)`; rID = null; }); }
  }
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', ()=>{ card.style.transform = 'translateZ(0)'; });
});

// Smooth anchor scroll
function smoothTo(hash){
  const el = document.querySelector(hash); if(!el) return;
  const start = window.scrollY || document.documentElement.scrollTop;
  const end = el.getBoundingClientRect().top + start - 12;
  const dur = 600; let t0 = null;
  function step(ts){ if(!t0) t0 = ts; const p = Math.min(1, (ts - t0)/dur); const y = start + (end - start) * ease(p); window.scrollTo(0, y); if(p < 1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if(!a) return;
  const hash = a.getAttribute('href'); if(hash && hash.length > 1){ e.preventDefault(); smoothTo(hash); }
});

// Language switcher URL mapper
(function(){
  const map = {
    "/": "/es/",
    "/index.html": "/es/",
    "/about.html": "/es/acerca.html",
    "/services.html": "/es/servicios.html",
    "/work.html": "/es/trabajos.html",
    "/blog.html": "/es/blog.html",
    "/contact.html": "/es/contacto.html"
  };
  const reverse = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const es = map[path] || "/es/";
  const en = reverse[path] || "/";
  const toEs = document.getElementById("to-es");
  const toEn = document.getElementById("to-en");
  if(toEs) toEs.href = es;
  if(toEn) toEn.href = en;

  // Mark active lang
  const htmlLang = document.documentElement.getAttribute('lang') || 'en';
  const active = htmlLang.toLowerCase().startsWith('es') ? toEs : toEn;
  if(active) active.classList.add('is-active');
})();
