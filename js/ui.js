const CPS = 38;
const SPEAKERS = {
  me: ['#ffffff', 210],
  note: ['#f3d9a4', 320],
  parrot: ['#86ff6a', 950],
  monkey: ['#ffb347', 520],
  tiki: ['#5ee7ff', 85],
  crab: ['#ff8080', 760],
  ghost: ['#9dffe0', 130],
  betty: ['#ff9ecf', 430],
  p1: ['#ffd23f', 180],
  p2: ['#ff8a5c', 260],
  p3: ['#c9b8ff', 150],
  rat: ['#d0d0d0', 1300],
  bones: ['#e8e2d0', 100],
  dj: ['#ff7cf4', 300],
  dave: ['#ffe680', 160],
  carl: ['#ff9ecf', 600],
  waddles: ['#9fd4ff', 700],
  pete: ['#ffffff', 240],
  queen: ['#ffd23f', 900],
  gary: ['#ffb86b', 800],
};

const clickZones = [];
function zone(x, y, w, h, fn) {
  clickZones.push({ x, y, w, h, fn });
}
function zoneAt(e) {
  const r = display.getBoundingClientRect();
  const x = ((e.clientX - r.left) * display.width) / r.width;
  const y = ((e.clientY - r.top) * display.height) / r.height;
  return clickZones.find(z => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);
}
display.addEventListener('mousedown', e => {
  initAudio();
  const z = zoneAt(e);
  if (z) z.fn();
});
display.addEventListener(
  'touchstart',
  e => {
    e.preventDefault();
    initAudio();
    const z = zoneAt(e.changedTouches[0]);
    if (z) z.fn();
  },
  { passive: false },
);
display.addEventListener('mousemove', e => {
  const z = zoneAt(e);
  display.style.cursor = z && !z.quiet ? 'pointer' : 'default';
});

let convo = [];
let line = null;
let convoDone = null;
let choice = null;

function nextLine() {
  line = convo.shift() || null;
  if (!line && convoDone) {
    const f = convoDone;
    convoDone = null;
    f();
  }
}
function talk(lines, done) {
  convo = lines.map(([who, text]) => ({ who, text, t: 0 }));
  convoDone = done || null;
  nextLine();
}
function say(...lines) {
  talk(lines);
}
function quip(text) {
  if (!line && !choice) say(['me', text]);
}
function ask(options) {
  choice = { options, i: 0 };
}
function anchor(who) {
  const f = area.anchors && area.anchors[who];
  return f ? f() : [player.x, player.y - (S.flags.bigHead ? 44 : 36)];
}

function updateSpeech() {
  if (!line) return;
  const before = Math.floor(line.t * CPS);
  line.t += DT;
  const after = Math.floor(line.t * CPS);
  if (after > before && after <= line.text.length && after % 2 === 0 && line.text[after - 1] !== ' ') sfx.talk(SPEAKERS[line.who][1]);
  if (line.t > line.text.length / CPS + 1.5 + line.text.length * 0.018) nextLine();
}

function skipLine() {
  const full = line.text.length / CPS;
  if (line.t < full) line.t = full;
  else nextLine();
}

function buildMenu(kind) {
  if (kind === 'title') {
    const items = [{ label: 'New Game', fn: newGame }];
    if (readSlot('auto')) items.push({ label: 'Continue', fn: () => loadSlot('auto') });
    items.push({ label: 'Load Game', fn: () => openMenu('load') });
    items.push({ label: 'Controls', fn: () => openMenu('controls') });
    return { kind, title: '', items, i: readSlot('auto') ? 1 : 0 };
  }
  if (kind === 'pause') {
    return {
      kind, title: 'PAUSED', i: 0,
      items: [
        { label: 'Resume', fn: resume },
        { label: 'Save Game', fn: () => openMenu('save') },
        { label: 'Load Game', fn: () => openMenu('load') },
        { label: 'Retry this area', fn: retryArea },
        { label: 'Inventory & Journal', fn: openInventory },
        { label: 'Warp (cheat)', fn: () => openMenu('warp') },
        { label: 'Controls', fn: () => openMenu('controls') },
        { label: `Music: ${musicOn ? 'On' : 'Off'}`, fn: () => { musicOn = !musicOn; openMenu('pause', 7); } },
        { label: 'Quit to Title', fn: toTitle },
      ].concat(TOUCH ? [{ label: `Button size: ${PAD_SIZES[padSize()][0]}`, fn: () => { applyPadSize((padSize() + 1) % PAD_SIZES.length); openMenu('pause', 9); } }] : []),
    };
  }
  if (kind === 'warp') {
    return {
      kind, title: 'WARP TO', i: 0,
      items: Object.keys(AREAS).map(id => ({
        label: AREAS[id].name,
        fn: () => {
          S.flags.ghostMet = true;
          resume();
          travel(id, AREAS[id].checkpoint);
        },
      })),
    };
  }
  if (kind === 'save') {
    return {
      kind, title: 'SAVE GAME', i: 0,
      items: ['1', '2', '3'].map(s => ({
        label: slotLabel(s),
        fn: () => {
          const ok = saveGame(s);
          resume();
          toast(ok ? `Saved to ${SLOT_NAMES[s]}` : 'Could not save');
          if (ok) sfx.select();
        },
      })),
    };
  }
  if (kind === 'load') {
    return {
      kind, title: 'LOAD GAME', i: 0,
      items: SLOTS.map(s => ({ label: slotLabel(s), disabled: !readSlot(s), fn: () => loadSlot(s) })),
    };
  }
  return {
    kind: 'controls', title: 'CONTROLS', i: 0, items: [],
    text: [
      ['← →', 'Walk'],
      ['↑', 'Jump'],
      ['Enter / Space', 'Do the obvious thing, skip dialogue'],
      ['E', 'Talk to'],
      ['P', 'Pick up'],
      ['U', 'Use'],
      ['L', 'Look at'],
      ['I', 'Inventory, journal, secrets'],
      ['Esc', 'Pause, save, load, retry'],
      ['F5 / F9', 'Quicksave / Quickload'],
      ['M', 'Music on or off'],
    ],
  };
}

function openMenu(kind, i) {
  G.menu = buildMenu(kind);
  if (i !== undefined) G.menu.i = i;
  if (G.mode !== 'title') G.mode = 'menu';
}
function resume() {
  G.menu = null;
  G.mode = 'play';
}
function toTitle() {
  G.mode = 'title';
  G.menuRoot = 'title';
  G.menu = buildMenu('title');
  setTheme('beach');
}
function retryArea() {
  resume();
  enterArea(S.area, area.checkpoint, undefined, true);
  toast('Back to the start of this area');
}
function openInventory() {
  G.menu = null;
  G.mode = 'inv';
  G.inv = { tab: 0, i: 0 };
}

function menuActivate() {
  const it = G.menu.items[G.menu.i];
  if (it.disabled) sfx.thunk();
  else {
    sfx.select();
    it.fn();
  }
}

function openPause() {
  if (G.mode !== 'play') return;
  sfx.menu();
  G.menuRoot = 'pause';
  openMenu('pause');
}

function updateMenu() {
  const m = G.menu;
  if (m.kind === 'controls') {
    if (hit('Escape', 'Enter', ' ', 'ArrowDown', 'e')) {
      sfx.menu();
      openMenu(G.menuRoot);
    }
    return;
  }
  const n = m.items.length;
  if (hit('ArrowDown', 's')) {
    m.i = (m.i + 1) % n;
    sfx.menu();
  }
  if (hit('ArrowUp', 'w')) {
    m.i = (m.i + n - 1) % n;
    sfx.menu();
  }
  if (hit('Enter', ' ', 'e')) return menuActivate();
  if (hit('Escape')) {
    sfx.menu();
    if (m.kind === 'pause') resume();
    else if (m.kind !== 'title') openMenu(G.menuRoot);
  }
}

function updateInventory() {
  const v = G.inv;
  const lists = [S.inv, S.journal, Object.keys(EGGS)];
  if (hit('ArrowRight', 'Tab')) {
    v.tab = (v.tab + 1) % 3;
    v.i = 0;
    sfx.menu();
  }
  if (hit('ArrowLeft')) {
    v.tab = (v.tab + 2) % 3;
    v.i = 0;
    sfx.menu();
  }
  const n = Math.max(1, lists[v.tab].length);
  if (hit('ArrowDown')) {
    v.i = (v.i + 1) % n;
    sfx.menu();
  }
  if (hit('ArrowUp')) {
    v.i = (v.i + n - 1) % n;
    sfx.menu();
  }
  if (hit('Escape', 'i', 'Enter')) {
    sfx.menu();
    G.mode = 'play';
  }
}

const iconCache = {};
function iconCanvas(id) {
  if (!iconCache[id]) {
    const cv = mk(12, 12);
    const old = ctx;
    ctx = cv.getContext('2d');
    icon(id, 0, 0);
    ctx = old;
    iconCache[id] = cv;
  }
  return iconCache[id];
}

function outlined(str, x, y, color, size, align) {
  dctx.font = `${size}px ${FONT}`;
  dctx.textAlign = align || 'center';
  dctx.textBaseline = 'top';
  dctx.lineJoin = 'round';
  dctx.lineWidth = Math.max(2, size * 0.45);
  dctx.strokeStyle = '#000';
  dctx.strokeText(str, x, y);
  dctx.fillStyle = color;
  dctx.fillText(str, x, y);
}

function wrap(text, maxW, size) {
  dctx.font = `${size}px ${FONT}`;
  const out = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const test = cur ? `${cur} ${w}` : w;
    if (dctx.measureText(test).width > maxW && cur) {
      out.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) out.push(cur);
  return out;
}

function wavy(text, y, size, cols, amp) {
  dctx.font = `${size}px ${FONT}`;
  let x = display.width / 2 - dctx.measureText(text).width / 2;
  for (let i = 0; i < text.length; i++) {
    outlined(text[i], x, y + Math.sin(G.t * 3 + i * 0.6) * amp * U, cols[i % cols.length], size, 'left');
    x += dctx.measureText(text[i]).width;
  }
}

function drawSpeech(cam) {
  if (!line) return;
  const size = Math.round(5.6 * U);
  const lines = wrap(line.text, 250 * U, size);
  const lh = size * 1.55;
  const widest = Math.max(...lines.map(l => dctx.measureText(l).width));
  const [wx, wy] = anchor(line.who);
  const cx = clamp((wx - cam) * U, widest / 2 + 6 * U, display.width - widest / 2 - 6 * U);
  let y = Math.max(22 * U, wy * U - lines.length * lh);
  let shown = Math.floor(line.t * CPS);
  for (const l of lines) {
    const part = l.slice(0, Math.max(0, shown));
    shown -= l.length + 1;
    dctx.font = `${size}px ${FONT}`;
    if (part) outlined(part, cx - dctx.measureText(l).width / 2, y, SPEAKERS[line.who][0], size, 'left');
    y += lh;
  }
}

function drawChoice() {
  const size = Math.round(5.2 * U);
  const lh = size * 1.7;
  const rows = choice.options.map(o => wrap(o.text, 420 * U, size));
  const total = rows.reduce((a, r) => a + r.length, 0);
  const h = total * lh + 10 * U;
  dctx.fillStyle = 'rgba(8,4,18,0.82)';
  dctx.fillRect(0, display.height - h, display.width, h);
  dctx.fillStyle = '#ffd23f';
  dctx.fillRect(0, display.height - h, display.width, Math.max(1, U));
  let y = display.height - h + 6 * U;
  rows.forEach((r, i) => {
    const sel = i === choice.i;
    r.forEach((l, k) => {
      outlined((k === 0 ? (sel ? '▶ ' : '  ') : '  ') + l, 12 * U, y, sel ? '#ffe680' : '#b8a8d8', size, 'left');
      y += lh;
    });
    zone(0, y - r.length * lh, display.width, r.length * lh, () => {
      const o = choice.options[i];
      choice = null;
      sfx.select();
      o.fn();
    });
  });
}

function panel(x, y, w, h) {
  dctx.fillStyle = 'rgba(10,5,22,0.9)';
  dctx.fillRect(x, y, w, h);
  dctx.strokeStyle = '#ffd23f';
  dctx.lineWidth = Math.max(2, U);
  dctx.strokeRect(x, y, w, h);
  dctx.strokeStyle = '#7a4b2a';
  dctx.strokeRect(x + 3 * U, y + 3 * U, w - 6 * U, h - 6 * U);
}

function drawMenu() {
  const m = G.menu;
  const title = G.mode === 'title' && m.kind === 'title';
  const dw = display.width;
  const dh = display.height;
  if (!title) {
    dctx.fillStyle = 'rgba(6,2,14,0.6)';
    dctx.fillRect(0, 0, dw, dh);
    panel(dw * 0.12, dh * 0.1, dw * 0.76, dh * 0.8);
    outlined(m.title, dw / 2, dh * 0.15, '#ffd23f', Math.round(11 * U));
  }
  if (m.kind === 'controls') {
    const size = Math.round(5.6 * U);
    m.text.forEach(([k, d], i) => {
      const y = dh * 0.27 + i * size * 1.75;
      outlined(k, dw * 0.42, y, '#5ee7ff', size, 'right');
      outlined(d, dw * 0.46, y, '#ffffff', size, 'left');
    });
    outlined('Click or Esc to go back', dw / 2, dh * 0.83, '#b8a8d8', Math.round(4.6 * U));
    zone(0, 0, dw, dh, () => openMenu(G.menuRoot));
    return;
  }
  const size = Math.round((title ? 7 : 6) * U);
  const small = m.kind === 'save' || m.kind === 'load' || m.kind === 'warp';
  const fs = small ? Math.round(5 * U) : size;
  const y0 = title ? dh * 0.5 : dh * 0.3;
  m.items.forEach((it, i) => {
    const sel = i === m.i;
    const col = it.disabled ? '#5a5070' : sel ? '#ffe680' : '#ffffff';
    outlined((sel ? '▶ ' : '') + it.label, dw / 2, y0 + i * fs * 2, col, fs);
    zone(dw * 0.15, y0 + i * fs * 2 - fs * 0.5, dw * 0.7, fs * 2, () => {
      m.i = i;
      menuActivate();
    });
  });
  if (!title) outlined('↑↓ choose   Enter select   Esc back', dw / 2, dh * 0.83, '#b8a8d8', Math.round(4.4 * U));
}

function drawInventory() {
  const dw = display.width;
  const dh = display.height;
  const v = G.inv;
  dctx.fillStyle = 'rgba(6,2,14,0.6)';
  dctx.fillRect(0, 0, dw, dh);
  panel(dw * 0.06, dh * 0.07, dw * 0.88, dh * 0.86);
  const tabs = ['ITEMS', 'JOURNAL', 'SECRETS'];
  tabs.forEach((t, i) => {
    outlined(t, dw * (0.25 + i * 0.25), dh * 0.12, i === v.tab ? '#ffd23f' : '#6a5a8a', Math.round(7 * U));
    zone(dw * (0.14 + i * 0.25), dh * 0.09, dw * 0.22, dh * 0.09, () => {
      v.tab = i;
      v.i = 0;
      sfx.menu();
    });
  });
  zone(0, dh * 0.82, dw, dh * 0.18, () => {
    G.mode = 'play';
  });
  const size = Math.round(5.2 * U);
  const lh = size * 2.1;
  const x0 = dw * 0.11;
  const y0 = dh * 0.24;
  dctx.imageSmoothingEnabled = false;
  if (v.tab === 0) {
    dctx.drawImage(iconCanvas('coin'), dw * 0.74, dh * 0.215, 12 * U, 12 * U);
    outlined(`${wallet()} to spend, ${coinCount()}/${COIN_TOTAL} found`, dw * 0.73, dh * 0.24, '#ffe680', Math.round(4.4 * U), 'right');
    if (!S.inv.length) outlined('Pockets: empty. Dreams: big.', dw / 2, dh * 0.45, '#b8a8d8', size);
    S.inv.forEach((id, i) => {
      const y = y0 + (i + 1) * lh;
      const sel = i === v.i;
      dctx.drawImage(iconCanvas(id), x0, y - 3 * U, 12 * U, 12 * U);
      outlined(ITEMS[id].name, x0 + 16 * U, y, sel ? '#ffe680' : '#ffffff', size, 'left');
      if (sel) outlined('◀', dw * 0.47, y, '#ffe680', size, 'left');
    });
    const id = S.inv[v.i];
    if (id) {
      dctx.drawImage(iconCanvas(id), dw * 0.66, dh * 0.33, 36 * U, 36 * U);
      wrap(ITEMS[id].desc, dw * 0.36, Math.round(4.6 * U)).forEach((l, k) => outlined(l, dw * 0.54, dh * 0.52 + k * 8 * U, '#f3d9a4', Math.round(4.6 * U), 'left'));
    }
  } else if (v.tab === 1) {
    if (!S.journal.length) outlined('Nothing yet. Go get shipwrecked.', dw / 2, dh * 0.45, '#b8a8d8', size);
    let y = y0;
    const fs = Math.round(4.6 * U);
    S.journal.slice(-9).forEach(j => {
      wrap(`- ${j}`, dw * 0.78, fs).forEach(l => {
        outlined(l, x0, y, '#f3d9a4', fs, 'left');
        y += fs * 1.7;
      });
      y += fs * 0.5;
    });
  } else {
    outlined(`${eggCount()} of ${Object.keys(EGGS).length} found`, dw / 2, y0 - 2 * U, '#86ff6a', Math.round(4.6 * U));
    Object.keys(EGGS).forEach((k, i) => {
      const got = S.eggs[k];
      outlined(got ? `★ ${EGGS[k]}` : '☆ ? ? ?', x0, y0 + (i + 1) * size * 1.75, got ? '#ffe680' : '#5a5070', Math.round(4.8 * U), 'left');
    });
  }
  outlined('←→ tabs   ↑↓ select   click here, I or Esc to close', dw / 2, dh * 0.87, '#b8a8d8', Math.round(4.2 * U));
}

function drawTextLayer(cam) {
  const dw = display.width;
  const dh = display.height;
  if (G.mode === 'title') {
    dctx.fillStyle = 'rgba(10,4,20,0.5)';
    dctx.fillRect(0, dh * 0.1, dw, dh * 0.82);
    if (G.menu.kind === 'title') {
      wavy('TIKI TIDE', dh * 0.16, Math.round(30 * U), ['#ffd23f', '#ff9f1c', '#ff6b6b', '#5ee7ff'], 3);
      outlined('The Curse of the Soggy Biscuit', dw / 2, dh * 0.36, '#fff3b0', Math.round(7 * U));
      outlined(TOUCH ? 'Tap to choose' : '↑↓ choose    Enter select', dw / 2, dh * 0.86, '#d7c6ff', Math.round(4.6 * U));
    }
    drawMenu();
    return;
  }
  if (G.mode === 'end') {
    dctx.fillStyle = 'rgba(10,4,20,0.6)';
    dctx.fillRect(0, dh * 0.08, dw, dh * 0.84);
    wavy('THE END', dh * 0.13, Math.round(24 * U), ['#ffd23f', '#ff9f1c'], 3);
    const fs = Math.round(5.4 * U);
    ['Captain Mildew got his hat, his treasure and his rest.', crewCount() === 3 ? 'Pip got a ship and the finest crew on the seven seas,' : 'Pip got a ship, a crew of one parrot,', 'and a very good story for the Rusty Anchor.'].forEach((l, i) => outlined(l, dw / 2, dh * 0.33 + i * fs * 1.8, '#fff3b0', fs));
    outlined(`Doubloons: ${coinCount()}/${COIN_TOTAL}`, dw / 2, dh * 0.56, '#ffe680', Math.round(6.5 * U));
    outlined(`Secrets: ${eggCount()}/${Object.keys(EGGS).length}`, dw / 2, dh * 0.64, '#86ff6a', Math.round(6.5 * U));
    outlined(`Crew recruited: ${crewCount()}/3    Time: ${fmtTime(S.time)}`, dw / 2, dh * 0.72, '#ffffff', Math.round(5.4 * U));
    if (Math.floor(G.t * 2) % 2 === 0) outlined('Press Enter to keep exploring', dw / 2, dh * 0.82, '#d7c6ff', Math.round(5 * U));
    zone(0, 0, dw, dh, () => {
      G.mode = 'play';
    });
    return;
  }
  if (area.overlay && G.mode === 'play') area.overlay(cam);
  drawSpeech(cam);
  outlined(`${wallet()}`, 20 * U, 7 * U, '#ffe680', Math.round(6 * U), 'left');
  if (G.cardT > 0) {
    dctx.globalAlpha = clamp(G.cardT, 0, 1);
    outlined(area.name, dw / 2, dh * 0.2, '#fff3b0', Math.round(11 * U));
    dctx.globalAlpha = 1;
  }
  if (G.toastT > 0) {
    dctx.globalAlpha = clamp(G.toastT, 0, 1);
    const size = Math.round(5 * U);
    dctx.font = `${size}px ${FONT}`;
    const tw = dctx.measureText(G.toast).width + 14 * U;
    dctx.fillStyle = 'rgba(10,5,22,0.85)';
    dctx.fillRect(dw / 2 - tw / 2, 5 * U, tw, 13 * U);
    outlined(G.toast, dw / 2, 9 * U, '#86ff6a', size);
    dctx.globalAlpha = 1;
  }
  if (G.mode === 'play') {
    if (choice) drawChoice();
    else if (!line && !(area.locked && area.locked())) {
      const t = nearest();
      if (t) {
        outlined(`${ACT}: ${labelFor(t)}`, dw / 2, (H - 26) * U, '#ffd98a', Math.round(6 * U));
        const verbs = [];
        if (t.talk) verbs.push('E talk');
        if (t.pick) verbs.push('P pick up');
        if (t.use) verbs.push('U use');
        verbs.push('L look');
        if (!TOUCH) outlined(verbs.join('   '), dw / 2, (H - 14) * U, '#b8a8d8', Math.round(4.2 * U));
      } else if (G.hintT > 0 && !area.topdown) {
        outlined(TOUCH ? 'Tap the bag or menu buttons up top' : 'I inventory    Esc menu    F5 quicksave', dw / 2, (H - 14) * U, '#b8a8d8', Math.round(4.2 * U));
      }
    }
  }
  if (G.mode === 'play' && line && !choice) {
    const z = { x: 0, y: 0, w: dw, h: dh, fn: skipLine, quiet: true };
    clickZones.push(z);
  }
  if (G.mode === 'menu') drawMenu();
  if (G.mode === 'inv') drawInventory();
  if (G.fade > 0) {
    dctx.fillStyle = `rgba(4,2,10,${clamp(G.fade, 0, 1)})`;
    dctx.fillRect(0, 0, dw, dh);
  }
}

function drawHud() {
  if (G.mode === 'title' || G.mode === 'end') return;
  icon('coin', 5, 5);
  let x = 5;
  for (const id of S.inv) {
    ctx.globalAlpha = 0.5;
    rect(x, 20, 14, 14, '#000');
    ctx.globalAlpha = 1;
    icon(id, x + 1, 21);
    x += 16;
  }
  for (const [bx, kind] of [[W - 23, 'menu'], [W - 44, 'bag']]) {
    rect(bx, 5, 18, 15, OUT);
    rect(bx + 1, 6, 16, 13, '#3a2a5a');
    rect(bx + 1, 6, 16, 1, '#6a5a9a');
    if (kind === 'menu') for (const y of [9, 12, 15]) rect(bx + 4, y, 10, 2, '#ffe680');
    else {
      rect(bx + 6, 8, 6, 2, '#c8a46a');
      rect(bx + 4, 10, 10, 7, '#a0703a');
      rect(bx + 4, 10, 10, 1, '#c8a46a');
      rect(bx + 8, 12, 2, 2, '#ffe680');
    }
  }
  if (G.mode === 'play' && !G.fadeDir) {
    zone((W - 23) * U, 5 * U, 18 * U, 15 * U, openPause);
    const bag = () => {
      if (choice) return;
      sfx.menu();
      openInventory();
    };
    zone((W - 44) * U, 5 * U, 18 * U, 15 * U, bag);
    zone(5 * U, 5 * U, Math.max(30, S.inv.length * 16) * U, 30 * U, bag);
  }
}
