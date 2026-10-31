// Choo! website: the little animations. Plain JS, no libraries.
// Everything here is decoration: the page reads fine without it, and with prefers-reduced-motion
// it draws one still frame instead of moving.
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches;
  const SVG = 'http://www.w3.org/2000/svg';
  const el = (name, attrs = {}, parent) => {
    const node = document.createElementNS(SVG, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.appendChild(node);
    return node;
  };
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

  /* ---------- The hero map: trains glide along the lines past two pins ---------- */
  const map = document.getElementById('map');
  if (!map) return;
  const railA = document.getElementById('railA');
  const railB = document.getElementById('railB');
  const gTrains = document.getElementById('trains');
  const gPins = document.getElementById('pins');
  const gPuffs = document.getElementById('puffs');
  const gBridges = document.getElementById('bridges');
  const card = {
    count: document.getElementById('card-count'),
    dir: document.getElementById('card-dir'),
    kind: document.getElementById('card-kind'),
    then: document.getElementById('card-then'),
    signals: document.getElementById('card-signals'),
  };
  const banner = document.getElementById('banner');
  const bannerTitle = document.getElementById('banner-title');
  const bannerBody = document.getElementById('banner-body');

  const CAR = 15, GAP = 2;
  const line = (path, at) => {
    const length = path.getTotalLength();
    return { path, length, spot: length * at };
  };
  const A = line(railA, 0.5);
  const B = line(railB, 0.64);
  const pointAt = (L, s) => {
    const a = L.path.getPointAtLength(Math.max(0, Math.min(L.length, s - 1)));
    const b = L.path.getPointAtLength(Math.max(0, Math.min(L.length, s + 1)));
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
  };

  // A bridge deck across each line where the pins are.
  const deck = (L, width, fill, edge) => {
    const p = pointAt(L, L.spot);
    const g = el('g', { transform: `translate(${p.x} ${p.y}) rotate(${p.angle + 90})` }, gBridges);
    el('rect', { x: -width / 2 - 2, y: -6.5, width: width + 4, height: 13, rx: 3, fill: edge }, g);
    el('rect', { x: -width / 2, y: -4.5, width, height: 9, rx: 2, fill }, g);
  };
  deck(A, 44, 'var(--map-road)', 'var(--map-rail)');
  deck(B, 30, 'var(--map-road)', 'var(--tube)');

  // What runs on line A, in turn. dir 1 runs towards the bottom right ("towards the city").
  const KINDS = {
    passenger: { emoji: '🚆', title: null, colours: ['#ffd642', '#ff941f'] },
    freight: { emoji: '🚂', title: 'Freight train', colours: ['#ff941f', '#7f8aa6', '#4f6a9a', '#7f8aa6', '#c9653a'], notable: true },
    charter: { emoji: '⭐️', title: 'Charter train', colours: ['#178553', '#a3462e'], notable: true, steam: true },
    leaf: { emoji: '🍂', title: 'Leaf-clearing train', colours: ['#ffd642', '#ffd642', '#ff941f'], notable: true },
    test: { emoji: '🔬', title: 'Test train', colours: ['#ffd642'], notable: true },
  };
  const scheduleA = [
    { kind: 'passenger', cars: 5, dir: 1, then: 'Then 4 min, 9 min and 13 min' },
    { kind: 'freight', cars: 11, dir: -1, then: 'Then 5 min, 8 min and 14 min' },
    { kind: 'passenger', cars: 4, dir: -1, then: 'Then 3 min, 7 min and 12 min' },
    { kind: 'charter', cars: 6, dir: 1, then: 'Then 6 min, 10 min and 15 min' },
    { kind: 'leaf', cars: 3, dir: -1, then: 'Then 2 min, 7 min and 11 min' },
    { kind: 'passenger', cars: 8, dir: 1, then: 'Then 5 min, 9 min and 16 min' },
    { kind: 'test', cars: 3, dir: 1, then: 'Then 4 min, 8 min and 12 min' },
  ];
  const SPEED_A = 36, GAP_A = 13; // units a second; seconds between one train going and the next passing
  const SPEED_B = 30;

  // Lay out the passing times: each train passes GAP_A seconds after the one before has gone.
  let t0 = 10;
  const runsA = scheduleA.map((s) => {
    const kind = KINDS[s.kind];
    const len = s.cars * (CAR + GAP);
    const run = { ...s, k: kind, len, pass: t0, gone: t0 + len / SPEED_A };
    t0 = run.gone + GAP_A;
    return run;
  });
  const cycleA = t0 - 10;

  // Tube line B: a shuttle each way, one every 11 seconds.
  const runsB = [];
  for (let i = 0; i < 4; i++) runsB.push({ dir: i % 2 ? -1 : 1, cars: 6, len: 6 * (CAR + GAP), pass: 6 + i * 11, gone: 6 + i * 11 + (6 * (CAR + GAP)) / SPEED_B });
  const cycleB = 44;

  // One SVG group of carriages per run, made once.
  const makeTrain = (run, tube) => {
    const g = el('g', { visibility: 'hidden' }, gTrains);
    run.carNodes = [];
    for (let i = 0; i < run.cars; i++) {
      const fill = tube ? '#f4fbf9' : run.k.colours[Math.min(i, run.k.colours.length - 1)];
      const r = el('rect', { x: -CAR / 2, y: -4, width: CAR, height: 8, rx: 2.6, fill, stroke: tube ? 'var(--tube)' : 'rgb(15 31 71 / .55)', 'stroke-width': tube ? 1.4 : 0.8 }, g);
      run.carNodes.push(r);
    }
    run.node = g;
  };
  runsA.forEach((r) => makeTrain(r, false));
  runsB.forEach((r) => makeTrain(r, true));

  const placeTrain = (L, run, tc, speed, cycle) => {
    // The run nearest in time, this cycle or the next, so trains run in smoothly as it loops.
    const t = tc - cycle * Math.round((tc - run.pass) / cycle);
    // Where the front is: at the spot when t == pass, moving in run.dir.
    const head = L.spot + run.dir * speed * (t - run.pass);
    const tail = head - run.dir * run.len;
    const visible = Math.max(head, tail) > -10 && Math.min(head, tail) < L.length + 10;
    run.node.setAttribute('visibility', visible ? 'visible' : 'hidden');
    if (!visible) return null;
    let front = null;
    for (let i = 0; i < run.cars; i++) {
      const s = head - run.dir * (i * (CAR + GAP) + CAR / 2);
      const p = pointAt(L, s);
      run.carNodes[i].setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.angle.toFixed(1)})`);
      if (i === 0) front = p;
    }
    return front;
  };

  // Pins: a pill with emoji, countdown and arrow, a pointer, and the spot's name.
  const makePin = (L, name, style) => {
    const p = pointAt(L, L.spot);
    const g = el('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, gPins);
    const body = el('g', { transform: 'translate(0 -26)' }, g);
    const pill = el('rect', { y: -15, height: 30, rx: 15, fill: style.fill, stroke: style.stroke || 'none', 'stroke-width': 2.5 }, body);
    el('path', { d: 'M-6 13 L0 23 L6 13Z', fill: style.stroke || style.fill }, body);
    const text = el('text', { y: 6, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: style.ink, 'font-family': 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif', style: 'font-variant-numeric: tabular-nums' }, body);
    const star = el('g', { visibility: 'hidden' }, body);
    el('circle', { r: 8, fill: '#ffd642', stroke: '#fff', 'stroke-width': 1.5 }, star);
    el('text', { y: 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#7a4a00', 'font-weight': 900 }, star).textContent = '★';
    const label = el('text', { y: 24, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: 'var(--map-label)', stroke: 'var(--map-land)', 'stroke-width': 3, 'paint-order': 'stroke', 'font-family': 'ui-rounded, system-ui, sans-serif' }, g);
    label.textContent = name;
    let last = '';
    return {
      set(content, starred) {
        if (content === last) return;
        last = content;
        text.textContent = content;
        const w = Math.max(64, text.getComputedTextLength() + 26);
        pill.setAttribute('x', -w / 2);
        pill.setAttribute('width', w);
        star.setAttribute('transform', `translate(${w / 2 - 4} -13)`);
        star.setAttribute('visibility', starred ? 'visible' : 'hidden');
      },
    };
  };
  const pinA = makePin(A, 'Meadow Lane bridge', { fill: 'var(--pin)', ink: '#fff' });
  const pinB = makePin(B, 'Park footbridge', { fill: '#fff', stroke: 'var(--tube)', ink: '#14213d' });

  // Which train a pin is about at time t, and what it says.
  const moment = (runs, t, cycle) => {
    for (const r of runs) {
      if (t < r.pass - 0.6) return { run: r, text: mmss(Math.ceil(r.pass - t)), left: r.pass - t, state: 'coming' };
      if (t < r.gone + 0.6) return { run: r, text: 'Now!', left: 0, state: 'now' };
      if (t < r.gone + 3.2) return { run: r, text: 'Just gone', left: 0, state: 'gone' };
    }
    const left = runs[0].pass + cycle - t;
    return { run: runs[0], text: mmss(Math.ceil(left)), left, state: 'coming' };
  };

  // Steam puffs from a charter's engine.
  const puffs = [];
  let lastPuff = 0;
  const puff = (p, at) => {
    const c = el('circle', { cx: p.x, cy: p.y, r: 3, fill: '#fff', opacity: 0.85 }, gPuffs);
    puffs.push({ c, x: p.x, y: p.y, born: at });
  };
  const stepPuffs = (at) => {
    for (let i = puffs.length - 1; i >= 0; i--) {
      const f = (at - puffs[i].born) / 1.5;
      if (f >= 1) { puffs[i].c.remove(); puffs.splice(i, 1); continue; }
      puffs[i].c.setAttribute('r', (3 + 8 * f).toFixed(1));
      puffs[i].c.setAttribute('cy', (puffs[i].y - 20 * f).toFixed(1));
      puffs[i].c.setAttribute('cx', (puffs[i].x + 6 * f).toFixed(1));
      puffs[i].c.setAttribute('opacity', (0.85 * (1 - f)).toFixed(2));
    }
  };

  let bannerFor = null;
  const soon = hhmm(new Date(Date.now() + 5 * 60000));
  const frame = (t) => {
    const ta = t % cycleA;
    const tb = t % cycleB;

    // Line A
    let steamAt = null;
    for (const r of runsA) {
      const front = placeTrain(A, r, ta, SPEED_A, cycleA);
      if (front && r.k.steam) steamAt = front;
    }
    const mA = moment(runsA, ta, cycleA);
    const arrow = mA.run.dir === 1 ? '→' : '←';
    pinA.set(mA.state === 'coming' ? `${mA.run.k.emoji} ${mA.text} ${arrow}` : mA.state === 'now' ? `${mA.run.k.emoji} Now! ${arrow}` : 'Just gone', mA.run.k.notable && mA.state !== 'gone');
    card.count.textContent = mA.state === 'coming' ? mA.text : mA.state === 'now' ? 'Now!' : 'Just gone';
    card.count.classList.toggle('now', mA.state !== 'coming');
    card.count.style.fontSize = mA.state === 'gone' ? '1.45rem' : '';
    card.dir.textContent = mA.run.dir === 1 ? 'Towards the city' : 'Towards the coast';
    card.kind.textContent = mA.run.k.title ? `${mA.run.k.emoji} ${mA.run.k.title}` : 'On time';
    card.kind.style.color = mA.run.k.title ? '' : 'var(--ink-soft)';
    card.then.textContent = mA.run.then;
    card.signals.classList.toggle('on', mA.state === 'coming' && mA.left <= 8);

    // A heads-up banner for the special ones, while the countdown is still a way off.
    const showBanner = !still() && Boolean(mA.run.k.notable) && mA.state === 'coming' && mA.left > 6;
    if (showBanner && bannerFor !== mA.run) {
      bannerFor = mA.run;
      bannerTitle.textContent = `${mA.run.k.emoji} ${mA.run.k.title} coming to Meadow Lane bridge`;
      bannerBody.textContent = `Passing ${soon} · towards ${mA.run.dir === 1 ? 'the city' : 'the coast'}`;
    }
    banner.classList.toggle('show', showBanner);

    if (steamAt && t - lastPuff > 0.22 && !still()) { puff(steamAt, t); lastPuff = t; }
    stepPuffs(t);

    // Line B (Tube)
    for (const r of runsB) placeTrain(B, r, tb, SPEED_B, cycleB);
    const mB = moment(runsB, tb, cycleB);
    const arrowB = mB.run.dir === 1 ? '↓' : '↑';
    pinB.set(mB.state === 'coming' ? `🚇 ${mB.text} ${arrowB}` : mB.state === 'now' ? `🚇 Now! ${arrowB}` : 'Just gone', false);
  };

  if (still()) {
    // One still frame: a train on its way in, 0:04 from the bridge.
    frame(runsA[0].pass - 4);
    return;
  }

  let running = true;
  let start = performance.now();
  let pausedAt = 0;
  const loop = (ms) => {
    if (!running) return;
    frame((ms - start) / 1000);
    requestAnimationFrame(loop);
  };
  const setRunning = (on) => {
    if (on === running) return;
    running = on;
    if (on) { start += performance.now() - pausedAt; requestAnimationFrame(loop); }
    else pausedAt = performance.now();
  };
  // Start a few seconds before the first train passes, so there's something moving straight away.
  start -= (runsA[0].pass - 7) * 1000;
  requestAnimationFrame(loop);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => setRunning(e.isIntersecting && !document.hidden)).observe(map);
  }
  document.addEventListener('visibilitychange', () => setRunning(!document.hidden));
  reduce.addEventListener?.('change', () => location.reload());
})();
