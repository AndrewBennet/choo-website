// Choo! website: the little animations. Plain JS, no libraries.
// Everything here is decoration: the page reads fine without it, and with prefers-reduced-motion
// the app recordings stay as still pictures.
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches;
  const pad = (n) => String(n).padStart(2, '0');
  const mmss = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
  const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  /* ---------- Reveal on scroll: adds .in-view, which starts CSS animations ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('in-view', e.isIntersecting);
    }, { threshold: 0.2 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('in-view'));
  }

  /* ---------- Clock, date and "Passing 14:32" times use the visitor's own clock ---------- */
  const now = new Date();
  document.querySelectorAll('[data-clock]').forEach((n) => { n.textContent = hhmm(now); });
  document.querySelectorAll('[data-date]').forEach((n) => {
    n.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  });
  document.querySelectorAll('[data-soon]').forEach((n) => {
    n.textContent = `Passing ${hhmm(new Date(Date.now() + Number(n.dataset.soon) * 60000))}`;
  });

  /* ---------- Countdowns that tick: 0:09, 0:08 … Now! … and round again ---------- */
  const tickers = [...document.querySelectorAll('[data-tick]')].map((node) => ({ node, start: Number(node.dataset.tick), left: Number(node.dataset.tick) }));
  if (!still() && tickers.length) {
    setInterval(() => {
      for (const t of tickers) {
        t.left -= 1;
        if (t.left > 0) t.node.textContent = mmss(t.left);
        else if (t.left > -3) t.node.textContent = 'Now!';
        else { t.left = t.start; t.node.textContent = mmss(t.left); }
      }
    }, 1000);
  }

  /* ---------- Scroll: the header train, hero parallax and the phone's tilt ---------- */
  const root = document.documentElement;
  const progress = document.querySelector('.progress-train');
  const layers = [...document.querySelectorAll('.hero .layer')];
  const phone = document.getElementById('hero-phone');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    if (progress) progress.style.setProperty('--p', Math.min(1, y / max).toFixed(4));
    if (still()) return;
    if (y < window.innerHeight * 1.2) {
      for (const l of layers) l.style.transform = `translateY(${(y * Number(l.dataset.depth)).toFixed(1)}px)`;
      if (phone) {
        const k = Math.min(1, y / 500);
        phone.style.setProperty('--tilt', `${(2 - 5 * k).toFixed(2)}deg`);
        phone.style.setProperty('--lift', `${(-30 * k).toFixed(1)}px`);
      }
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- App recordings: light or dark to match, playing only while on screen ---------- */
  // Until one plays (and with reduced motion, or without this script), its still frame shows from the
  // stylesheet, so the right one shows straight away in dark mode too.
  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  const clips = [...document.querySelectorAll('video[data-clip]')];
  const showing = new Set();
  const load = (video) => {
    const base = `assets/media/${video.dataset.clip}${dark.matches ? '-dark' : ''}`;
    if (video.dataset.loaded === base) return;
    video.dataset.loaded = base;
    video.poster = `${base}.webp`;
    // H.264 first: it's the smaller here, and plays everywhere; VP9 for browsers without it.
    video.replaceChildren(...[['mp4', 'video/mp4'], ['webm', 'video/webm']].map(([ext, type]) => {
      const source = document.createElement('source');
      source.src = `${base}.${ext}`;
      source.type = type;
      return source;
    }));
    video.load();
  };
  const update = (video) => {
    if (showing.has(video) && !document.hidden) {
      load(video);
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };
  if (!still() && clips.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) showing.add(e.target); else showing.delete(e.target);
        update(e.target);
      }
    }, { rootMargin: '200px 0px' });
    clips.forEach((v) => io.observe(v));
    document.addEventListener('visibilitychange', () => clips.forEach(update));
    dark.addEventListener?.('change', () => clips.forEach((v) => { if (v.dataset.loaded) { delete v.dataset.loaded; update(v); } }));
  }
  reduce.addEventListener?.('change', () => location.reload());
})();
