const stick = { x: 0, y: 0, on: false };

(() => {
  if (!TOUCH) return;
  document.body.classList.add('touch');
  applyPadSize();
  const el = (cls, txt) => {
    const d = document.createElement('div');
    d.className = cls;
    if (txt) d.textContent = txt;
    document.body.appendChild(d);
    return d;
  };
  const zoneEl = el('stickzone');
  const base = el('stickbase');
  const knob = document.createElement('div');
  knob.className = 'stickknob';
  base.appendChild(knob);
  el('rotate', 'Turn your phone sideways to play');

  let id = null;
  let ox = 0;
  let oy = 0;
  let lastDir = null;
  const DIRS = { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown' };

  function release() {
    id = null;
    stick.on = false;
    stick.x = 0;
    stick.y = 0;
    lastDir = null;
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    base.style.left = '';
    base.style.top = '';
    base.style.bottom = '';
    base.classList.remove('on');
    knob.style.transform = '';
  }

  function move(t) {
    const r = base.offsetWidth / 2;
    let dx = t.clientX - ox;
    let dy = t.clientY - oy;
    const sea = area.topdown;
    const free = sea || (area.locked && area.locked()) || G.mode !== 'play' || !!choice;
    if (!free) dy = 0;
    const m = Math.hypot(dx, dy);
    if (m > r) {
      dx = (dx / m) * r;
      dy = (dy / m) * r;
    }
    stick.x = dx / r;
    stick.y = dy / r;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    if (!sea) {
      keys.ArrowLeft = stick.x < -0.3;
      keys.ArrowRight = stick.x > 0.3;
    }
    const mag = Math.hypot(stick.x, stick.y);
    const dir = mag < 0.6 ? null : Math.abs(stick.x) > Math.abs(stick.y) ? (stick.x < 0 ? 'l' : 'r') : stick.y < 0 ? 'u' : 'd';
    if (mag < 0.35) lastDir = null;
    if (dir && dir !== lastDir) {
      lastDir = dir;
      if (free && !sea) pressed[DIRS[dir]] = true;
    }
  }

  zoneEl.addEventListener(
    'touchstart',
    e => {
      e.preventDefault();
      initAudio();
      const t = e.changedTouches[0];
      if (G.mode !== 'play') {
        const z = zoneAt(t);
        if (z) z.fn();
        return;
      }
      if (id !== null) return;
      id = t.identifier;
      ox = t.clientX;
      oy = t.clientY;
      stick.on = true;
      const r = base.offsetWidth / 2;
      base.style.left = `${ox - r}px`;
      base.style.top = `${oy - r}px`;
      base.style.bottom = 'auto';
      base.classList.add('on');
    },
    { passive: false },
  );
  const find = e => [...e.changedTouches].find(t => t.identifier === id);
  zoneEl.addEventListener(
    'touchmove',
    e => {
      e.preventDefault();
      const t = find(e);
      if (t) move(t);
    },
    { passive: false },
  );
  for (const ev of ['touchend', 'touchcancel']) {
    zoneEl.addEventListener(
      ev,
      e => {
        e.preventDefault();
        if (find(e)) release();
      },
      { passive: false },
    );
  }

  const button = (label, key, cls) => {
    const b = el(`tbtn ${cls}`, label);
    const down = e => {
      e.preventDefault();
      initAudio();
      if (!keys[key]) pressed[key] = true;
      keys[key] = true;
      b.classList.add('on');
    };
    const up = e => {
      e.preventDefault();
      keys[key] = false;
      b.classList.remove('on');
    };
    b.addEventListener('touchstart', down, { passive: false });
    b.addEventListener('touchend', up, { passive: false });
    b.addEventListener('touchcancel', up, { passive: false });
  };
  button('A', 'Enter', 'a');
  button('JUMP', 'ArrowUp', 'jump');
  button('LOOK', 'l', 'look');

  setInterval(() => document.body.classList.toggle('sea', !!(area && area.topdown)), 250);
  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
})();
