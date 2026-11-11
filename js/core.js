const W = 480;
const H = 270;
const DT = 1 / 60;
const FONT = '"Press Start 2P", monospace';
const OUT = '#1a1024';
const COIN_TOTAL = 18;
const TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const ACT = TOUCH ? 'A' : 'Enter';
const PAD_SIZES = [['Small', 0.8], ['Medium', 1], ['Large', 1.25]];
function padSize() {
  try {
    return clampPad(Number(localStorage.getItem('tikitide.pad') ?? 1));
  } catch {
    return 1;
  }
}
function clampPad(n) {
  return n >= 0 && n < PAD_SIZES.length ? n : 1;
}
function applyPadSize(n) {
  if (n !== undefined) {
    try {
      localStorage.setItem('tikitide.pad', String(n));
    } catch {
      return;
    }
  }
  document.body.style.setProperty('--s', PAD_SIZES[padSize()][1]);
}

const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const display = document.getElementById('screen');
const dctx = display.getContext('2d');
const buf = mk(W, H);
const bctx = buf.getContext('2d');
let ctx = bctx;
let U = 3;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const r = display.getBoundingClientRect();
  U = ((r.width || window.innerWidth) / W) * dpr;
  display.width = Math.floor(W * U);
  display.height = Math.floor(H * U);
}
addEventListener('resize', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 300));
resize();

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const hash = n => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

function blob(cx, cy, rx, ry, c) {
  ctx.fillStyle = c;
  const r = Math.max(1, Math.round(ry));
  for (let y = -r; y <= r; y++) {
    const w = rx * Math.sqrt(Math.max(0, 1 - (y / Math.max(ry, 0.5)) ** 2));
    if (w < 0.5) continue;
    ctx.fillRect(Math.round(cx - w), Math.round(cy + y), Math.round(w * 2), 1);
  }
}

function dither(x, y, w, h, c) {
  ctx.fillStyle = c;
  x = Math.round(x);
  y = Math.round(y);
  for (let j = 0; j < h; j++) {
    for (let i = (x + y + j) & 1; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  }
}

function seg(x1, y1, x2, y2, c, w) {
  const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) | 0;
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    rect(lerp(x1, x2, t), lerp(y1, y2, t), w || 1, w || 1, c);
  }
}

function glow(x, y, r, c) {
  if (x < -r || x > W + r) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

const SPR = 96;
const spr = mk(SPR, SPR);
const sctx = spr.getContext('2d');
const sil = mk(SPR, SPR);
const lctx = sil.getContext('2d');

function actor(x, y, flip, fn, alpha, outline) {
  sctx.clearRect(0, 0, SPR, SPR);
  sctx.save();
  sctx.translate(SPR / 2, SPR - 14);
  if (flip < 0) sctx.scale(-1, 1);
  const old = ctx;
  ctx = sctx;
  fn();
  ctx = old;
  sctx.restore();
  lctx.globalCompositeOperation = 'source-over';
  lctx.clearRect(0, 0, SPR, SPR);
  lctx.drawImage(spr, 0, 0);
  lctx.globalCompositeOperation = 'source-in';
  lctx.fillStyle = outline || OUT;
  lctx.fillRect(0, 0, SPR, SPR);
  const dx = Math.round(x) - SPR / 2;
  const dy = Math.round(y) - (SPR - 14);
  ctx.globalAlpha = alpha ?? 1;
  ctx.drawImage(sil, dx + 1, dy);
  ctx.drawImage(sil, dx - 1, dy);
  ctx.drawImage(sil, dx, dy + 1);
  ctx.drawImage(sil, dx, dy - 1);
  ctx.drawImage(spr, dx, dy);
  ctx.globalAlpha = 1;
}

const keys = {};
let pressed = {};
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
const recent = [];
const norm = k => (k.length === 1 ? k.toLowerCase() : k);
addEventListener('keydown', e => {
  const k = norm(e.key);
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'F5', 'F9', 'Tab'].includes(k)) e.preventDefault();
  if (!keys[k]) {
    pressed[k] = true;
    recent.push(k);
    if (recent.length > 8) recent.shift();
    if (recent.length === 8 && recent.every((r, i) => r === KONAMI[i])) pressed.konami = true;
  }
  keys[k] = true;
  initAudio();
});
addEventListener('keyup', e => {
  keys[norm(e.key)] = false;
});
addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
});
const hit = (...ks) => ks.some(k => pressed[k]);

const ITEMS = {
  bottle: { name: 'Message in a bottle', desc: 'A soggy note from a very sunburnt sailor. It mentions a Tiki, a treasure and three stones.' },
  coconut: { name: 'Coconut', desc: 'Hard, hairy and suspiciously heavy. It rattles when shaken.' },
  banana: { name: 'Banana', desc: 'A perfect banana. The universal currency of monkeys.' },
  hat: { name: "Captain's hat", desc: 'A damp tricorn that smells of seaweed and regret. Slightly chewed by a monkey.' },
  map: { name: 'Treasure map', desc: 'A crude map of the cove. A big red X sits on the beach between two palm trees.' },
  shovel: { name: 'Shovel', desc: 'For burying things. Or un-burying things. The shovel does not judge.' },
  lantern: { name: 'Lantern', desc: "Betty's finest. Burns for hours and only smells a little of fish." },
  duck: { name: 'Sir Quacksalot', desc: 'A rubber duck wearing an eyepatch. He has seen things at the bottom of a hole.' },
  ruby: { name: 'Heart of the Tide', desc: 'A ruby the colour of a sunset. Red, from the sea.' },
  emerald: { name: 'Jungle Eye', desc: 'An emerald that grew inside a coconut. Green, from a nut.' },
  pepper: { name: 'Royal ghost pepper', desc: 'From the pantry of Queen Camembert. Warm to the touch. Warm to the soul. Dangerous to the tongue.' },
  snowball: { name: 'Everlasting snowball', desc: 'A snowball from Brrrmuda that refuses to melt. It is cold and it is proud of it.' },
  record: { name: 'Golden record', desc: 'First prize in the Funkadelica dance-off. Plays one song. The song is a banger.' },
  sapphire: { name: 'Tear of the Falls', desc: 'A sapphire as cold as cave water. Blue, from where water falls.' },
};

const EGGS = {
  duck: 'Dug up Sir Quacksalot',
  crab: 'Made peace with Sheldon the crab',
  shell: 'Took a call on the shell phone',
  sunset: 'Stopped to watch the sunset',
  cannon: 'Fired the cannon indoors',
  darts: 'Hit a bullseye at the Rusty Anchor',
  organ: 'Changed the tavern tune',
  poster: 'Recognised a familiar face',
  skeleton: 'Learned from a cautionary skeleton',
  rat: 'Got the gossip from Reginald the rat',
  konami: 'Entered a very old code',
  kraken: 'Waved back at the kraken',
  edge: 'Sailed to the edge of the map',
  flamingo: 'Got on the VIP list',
  pole: 'Licked the frozen signpost',
  cheese: 'Tasted the island',
};

function newState() {
  return { area: 'beach', x: 330, flags: {}, inv: [], coins: {}, spent: 0, eggs: {}, journal: [], time: 0 };
}

let S = newState();
const G = { mode: 'title', t: 0, camX: 0, camT: 0, shake: 0, fade: 0, fadeDir: 0, pending: null, toast: '', toastT: 0, menu: null, menuRoot: 'title', inv: { tab: 0, i: 0 }, idle: 0, hintT: 0 };
let area = null;
let player = null;
let parts = [];
let fallers = [];

function newPlayer(x, y) {
  return { x, y, vx: 0, vy: 0, face: 1, onGround: true, phase: 0, squash: 0, blink: 0, hurt: 0, dead: 0, coyote: 0, jumpBuf: 0, stepIdx: 0, spring: false, sit: false };
}

const has = id => S.inv.includes(id);
const coinCount = () => Object.keys(S.coins).length;
const wallet = () => coinCount() - S.spent;
const eggCount = () => Object.keys(S.eggs).length;
const crewCount = () => ['crewDave', 'crewWaddles', 'crewGary'].filter(k => S.flags[k]).length;

function toast(text) {
  G.toast = text;
  G.toastT = 3;
}
function give(id) {
  if (!has(id)) S.inv.push(id);
  sfx.pickup();
  toast(`Got: ${ITEMS[id].name}`);
}
function take(id) {
  const i = S.inv.indexOf(id);
  if (i >= 0) S.inv.splice(i, 1);
}
function note(text) {
  if (S.journal.includes(text)) return;
  S.journal.push(text);
}
function egg(id) {
  if (S.eggs[id]) return;
  S.eggs[id] = true;
  sfx.magic();
  toast(`Secret found: ${EGGS[id]}`);
}

const SAVE_KEY = s => `tikitide.save.${s}`;
const SLOTS = ['auto', 'quick', '1', '2', '3'];
const SLOT_NAMES = { auto: 'Autosave', quick: 'Quicksave', 1: 'Slot 1', 2: 'Slot 2', 3: 'Slot 3' };

function saveGame(slot) {
  if (player) {
    S.x = Math.round(player.x);
    S.y = player.onGround ? Math.round(player.y) : undefined;
  }
  try {
    localStorage.setItem(SAVE_KEY(slot), JSON.stringify({ S, meta: { area: AREAS[S.area].name, coins: coinCount(), time: Math.round(S.time) } }));
    return true;
  } catch {
    return false;
  }
}
function readSlot(slot) {
  try {
    const raw = localStorage.getItem(SAVE_KEY(slot));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function slotLabel(slot) {
  const d = readSlot(slot);
  return d ? `${SLOT_NAMES[slot]}: ${d.meta.area}, ${d.meta.coins} coins, ${fmtTime(d.meta.time)}` : `${SLOT_NAMES[slot]}: empty`;
}

function emit(o) {
  parts.push({ x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 1, life: 1, size: 1, color: '#fff', glow: false, leaf: false, seed: Math.random() * 6, ...o, max: o.life || 1 });
}
function burst(n, f) {
  for (let i = 0; i < n; i++) emit(f(i));
}
function sparkle(x, y, color) {
  burst(20, i => {
    const a = (i / 20) * Math.PI * 2;
    const s = rnd(0.6, 2);
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, drag: 0.92, life: rnd(0.5, 1), color, glow: true };
  });
}
function dust(x, y, n, color) {
  burst(n, () => ({ x: x + rnd(-4, 4), y: y - 1, vx: rnd(-0.7, 0.7), vy: rnd(-0.7, -0.1), drag: 0.93, life: rnd(0.3, 0.6), color: color || (area && area.dust) || '#b0a080', size: Math.random() < 0.3 ? 2 : 1 }));
}
function updateParticles() {
  for (const p of parts) {
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.g;
    p.x += p.vx + (p.leaf ? Math.sin(G.t * 2 + p.seed) * 0.4 : 0);
    p.y += p.vy;
    p.life -= DT;
  }
  parts = parts.filter(p => p.life > 0);
  if (parts.length > 1000) parts.splice(0, parts.length - 1000);
}
function drawParticles() {
  for (const p of parts) {
    const a = clamp(p.life / p.max, 0, 1);
    if (p.glow) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - p.size), Math.round(p.y - p.size), p.size * 3, p.size * 3);
      ctx.globalAlpha = a;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.globalAlpha = p.leaf ? Math.min(1, a * 3) : a;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}
