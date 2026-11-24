// The Art World Report: smooth scroll, reveals and menu
const root = document.documentElement;
root.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Split text into words, keeping inline tags such as <em>
function splitWords(el, cls, inner) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const s = document.createElement('span');
          s.className = cls;
          if (inner) { const i = document.createElement('span'); i.textContent = part; s.append(i); }
          else s.textContent = part;
          frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return [...el.querySelectorAll('.' + cls)];
}

document.querySelectorAll('[data-lines]').forEach((el) => {
  el.setAttribute('aria-label', el.textContent.trim());
  const words = splitWords(el, 'ln', true);
  let top = null, line = -1;
  words.forEach((w) => {
    w.setAttribute('aria-hidden', 'true');
    if (w.offsetTop !== top) { top = w.offsetTop; line++; }
    w.firstChild.style.setProperty('--l', line);
  });
});
document.querySelectorAll('[data-words]').forEach((el) => {
  splitWords(el, 'wd', false).forEach((w, i) => w.style.setProperty('--i', i));
});

// Play each block once as it scrolls into view
const targets = document.querySelectorAll('[data-r],[data-lines],[data-words]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  targets.forEach((t) => io.observe(t));
} else targets.forEach((t) => t.classList.add('in'));

// Smooth scroll (the page works normally if this cannot load)
let lenis = null;
if (!reduced) {
  import('https://cdn.jsdelivr.net/npm/lenis@1.3.19/+esm').then(({ default: Lenis }) => {
    lenis = new Lenis({ smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }).catch(() => {});
}
function goTo(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const offset = -parseFloat(getComputedStyle(root).fontSize) * 5;
  if (lenis) lenis.scrollTo(target, { offset });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  history.replaceState(null, '', hash);
}

// Menu
const menu = document.getElementById('menu');
const openBtn = document.getElementById('menu-open');
const closeBtn = document.getElementById('menu-close');
function setMenu(open) {
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menu.inert = !open;
  openBtn.setAttribute('aria-expanded', String(open));
  root.classList.toggle('lock', open);
  if (lenis) open ? lenis.stop() : lenis.start();
  (open ? closeBtn : openBtn).focus();
}
if (menu) {
  menu.inert = true;
  openBtn.addEventListener('click', () => setMenu(true));
  closeBtn.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  e.preventDefault();
  if (menu && menu.classList.contains('open')) setMenu(false);
  goTo(a.getAttribute('href'));
});

// Newsletter form: not connected to a service yet
const form = document.getElementById('signup');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('signup-note').textContent = 'Sign-up is not open yet. Please check back soon.';
});

// Solid header bar once the page has moved: white over light areas, charcoal over dark ones
const header = document.querySelector('.site-header');
if (header) {
  const isDarkBelow = () => {
    const y = header.offsetHeight / 2;
    const stack = document.elementsFromPoint(window.innerWidth / 2, y).filter((el) => !header.contains(el));
    for (let el = stack[0]; el; el = el.parentElement) {
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!m || (m.length > 3 && +m[3] === 0)) continue;
      return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) < 128;
    }
    return false;
  };
  let queued = false;
  const setBar = () => {
    queued = false;
    const on = window.scrollY > 8;
    header.classList.toggle('solid', on);
    header.classList.toggle('on-dark', on && isDarkBelow());
  };
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(setBar); } };
  window.addEventListener('scroll', ask, { passive: true });
  window.addEventListener('resize', ask);
  setBar();
}
