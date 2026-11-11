// Theme toggle (saved theme is restored inline in <head>).
const root = document.documentElement;
const themeBtn = document.querySelector('.theme-btn');
const isDark = () =>
  root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const syncThemeBtn = () => {
  themeBtn.innerHTML = isDark() ? SUN : MOON;
  themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
};
syncThemeBtn();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  syncThemeBtn();
});

// Reading progress: default vertical page scroll. Drives top bar + sidebar card.
const bars = document.querySelectorAll('.progress__bar, .toc-progress__fill');
const pctText = document.querySelector('.toc-progress__pct');
const progress = document.querySelector('.progress');
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? Math.min(scrollY / max, 1) : 0;
  bars.forEach((b) => { b.style.transform = `scaleX(${pct})`; });
  const n = Math.round(pct * 100);
  progress.setAttribute('aria-valuenow', n);
  if (pctText) pctText.textContent = `${n}%`;
};
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

// Copy buttons: copy source text only (strip Prism line-number/highlight nodes).
const COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy';
const DONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>Copied';
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.innerHTML = COPY;
  btn.addEventListener('click', async () => {
    const code = btn.closest('.codeblock').querySelector('code').cloneNode(true);
    code.querySelectorAll('.line-numbers-rows, .line-highlight').forEach((n) => n.remove());
    try {
      await navigator.clipboard.writeText(code.textContent.replace(/\n$/, ''));
      btn.innerHTML = DONE;
    } catch {
      btn.textContent = 'Failed';
    }
    btn.classList.add('is-copied');
    setTimeout(() => { btn.innerHTML = COPY; btn.classList.remove('is-copied'); }, 1500);
  });
});

// Heading anchor links.
document.querySelectorAll('.content :is(h2, h3)[id]').forEach((h) => {
  const a = document.createElement('a');
  a.className = 'anchor';
  a.href = `#${h.id}`;
  a.textContent = '#';
  a.setAttribute('aria-label', `Link to ${h.textContent}`);
  h.append(a);
});

// Active sub-topic: last heading above the top third of the viewport.
const links = [...document.querySelectorAll('.subtopics a')];
const headings = links.map((a) => document.querySelector(a.getAttribute('href')));
const updateActive = () => {
  let i = 0;
  headings.forEach((h, idx) => { if (h && h.getBoundingClientRect().top < innerHeight / 3) i = idx; });
  links.forEach((a, idx) => a.classList.toggle('is-active', idx === i));
};
addEventListener('scroll', updateActive, { passive: true });
updateActive();

// Mobile drawer.
const menuBtn = document.querySelector('.menu-btn');
const isNavOpen = () => document.body.classList.contains('nav-open');
const setNav = (open) => {
  document.body.classList.toggle('nav-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Close topics' : 'Open topics');
};
menuBtn.addEventListener('click', () => setNav(!isNavOpen()));
document.querySelectorAll('.topics a').forEach((a) => a.addEventListener('click', () => setNav(false)));
// Close on backdrop click or Escape.
document.addEventListener('click', (e) => {
  if (isNavOpen() && !e.target.closest('.sidebar--left, .menu-btn')) setNav(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isNavOpen()) { setNav(false); menuBtn.focus(); }
});
