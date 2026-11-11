const NOPE = {
  talk: ["It's not much of a talker.", 'I say hello. Nothing says hello back.', 'We have nothing to discuss.'],
  pick: ["I can't pick that up.", 'That is staying exactly where it is.', 'My pockets have limits.'],
  use: ["I can't use that.", 'I have no idea what I would do with that.', 'Nope.'],
};
const NOTHING = ['My pockets jingle. Mostly with sand.', 'Somewhere, a parrot is talking about me.', 'I wonder what the monkey is up to.', 'Note to self: learn to swim. In boots.', 'Being a pirate is ninety percent walking.', 'Hmm. Nothing to poke here.', 'I poke the air. The air does not react.', 'The island stares back.', 'I could really go for a nap.'];

function thingY(t) {
  return t.y ?? area.ground(t.x) ?? area.terrain(t.x);
}

function nearest() {
  if (!player || player.dead > 0) return null;
  let best = null;
  let bd = 1e9;
  for (const t of area.things) {
    if (t.hidden && t.hidden()) continue;
    const d = t.rad ? Math.hypot(t.x - player.x, t.y - player.y) : Math.abs(t.x - player.x);
    if (d < bd && (t.rad ? d < t.rad : d < (t.r || 20) && Math.abs(player.y - thingY(t)) < 34)) {
      bd = d;
      best = t;
    }
  }
  return best;
}

function labelFor(t) {
  if (t.label) return t.label();
  if (t.def === 'talk') return `Talk to ${t.name}`;
  if (t.def === 'pick') return `Pick up ${t.name}`;
  if (t.def === 'look') return `Look at ${t.name}`;
  return `Use ${t.name}`;
}

function doVerb(verb) {
  const t = nearest();
  if (!t) return quip(pick(area.quips && Math.random() < 0.6 ? area.quips : NOTHING));
  const v = verb === 'def' ? t.def : verb;
  if (v === 'look') {
    if (typeof t.look === 'function') t.look();
    else say(['me', t.look || 'Nothing special.']);
    return;
  }
  if (t[v]) return t[v]();
  say(['me', pick(NOPE[v])]);
}

function travel(to, x, y) {
  if (G.fadeDir) return;
  G.pending = { to, x, y };
  G.fadeDir = 1;
}

function enterArea(id, x, y, quiet) {
  S.area = id;
  area = AREAS[id];
  fallers = [];
  parts = [];
  convo = [];
  line = null;
  convoDone = null;
  choice = null;
  player = newPlayer(x, y ?? area.ground(x) ?? area.terrain(x));
  if (x > area.w / 2) player.face = -1;
  if (area.enter) area.enter();
  G.camX = clamp(x - W / 2, 0, Math.max(0, area.w - W));
  G.camT = G.camX;
  G.camV = 0;
  G.follow = false;
  G.cardT = 3;
  G.idle = 0;
  setTheme(area.music);
  if (!quiet) saveGame('auto');
}

function newGame() {
  S = newState();
  G.menu = null;
  G.mode = 'play';
  G.hintT = 14;
  enterArea('beach', 330);
  note('Shipwrecked on Tiki Tide with one crate of sand. There must be treasure on an island like this.');
  say(['me', 'Shipwrecked. Again.'], ['me', 'New island, same Pip. Is that a bottle washing up over there?']);
}

function loadSlot(slot) {
  const d = readSlot(slot);
  if (!d) return;
  S = { ...newState(), ...d.S };
  G.menu = null;
  G.mode = 'play';
  G.fade = 0;
  G.fadeDir = 0;
  enterArea(S.area, S.x, S.y, true);
  toast(`Loaded ${SLOT_NAMES[slot]}`);
}

function updatePlayer() {
  const p = player;
  const A = area;
  if (p.dead > 0) {
    p.dead--;
    if (p.dead === 0) {
      const x = A.checkpoint;
      player = newPlayer(x, A.ground(x) ?? A.terrain(x));
    }
    return;
  }
  const locked = !!choice || G.fadeDir !== 0 || !!(A.locked && A.locked());
  const ax = locked ? 0 : (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0);
  if (ax || keys.ArrowUp) {
    G.idle = 0;
    p.sit = false;
  } else G.idle += DT;
  const control = p.hurt < 0.6;
  if (ax && control) {
    p.vx += ax * (p.onGround ? (A.slip ? 0.1 : 0.34) : 0.2);
    p.face = ax;
  } else if (p.onGround) p.vx *= A.slip ? 0.975 : 0.72;
  else p.vx *= 0.97;
  const maxV = control ? 2.1 : 3.8;
  p.vx = clamp(p.vx, -maxV, maxV);
  if (!locked && pressed.ArrowUp) p.jumpBuf = 8;
  if (p.jumpBuf > 0 && p.coyote > 0) {
    p.vy = -6.4;
    p.onGround = false;
    p.coyote = 0;
    p.jumpBuf = 0;
    p.squash = -0.6;
    p.spring = false;
    sfx.jump();
    dust(p.x, p.y, 5);
  }
  p.jumpBuf--;
  if (!keys.ArrowUp && p.vy < -2.4 && !p.spring) p.vy += 0.36;
  p.vy = Math.min(p.vy + 0.42, 8.5);
  const prevY = p.y;
  const was = p.onGround;
  p.x += p.vx;
  p.y += p.vy;
  if (p.x < 4 && A.exitL) return travel(A.exitL.to, A.exitL.x);
  if (p.x > A.w - 4 && A.exitR) return travel(A.exitR.to, A.exitR.x);
  p.x = clamp(p.x, A.exitL ? 0 : A.minX || 8, A.exitR ? A.w : A.maxX || A.w - 8);
  if (A.block) A.block(p);
  let landY = null;
  let onPlat = false;
  if (p.vy >= 0) {
    const snap = was ? 4 : 0;
    for (const pl of A.platforms || []) {
      if (p.x < pl.x1 || p.x > pl.x2) continue;
      const py = pl.y2 === undefined ? pl.y : lerp(pl.y, pl.y2, (p.x - pl.x1) / (pl.x2 - pl.x1));
      if (prevY <= py + 3 && p.y >= py - snap && (landY === null || py < landY)) {
        landY = py;
        onPlat = true;
      }
    }
    const gy = A.ground(p.x);
    if (gy !== null && p.y >= gy - snap && prevY <= gy + 8 && (landY === null || gy < landY)) {
      landY = gy;
      onPlat = false;
    }
  }
  if (landY !== null) {
    p.y = landY;
    if (!was && p.vy > 2.6) {
      p.squash = Math.min(0.7, p.vy * 0.1);
      dust(p.x, p.y, 6);
      sfx.land();
    }
    p.vy = 0;
    p.onGround = true;
    p.coyote = 6;
    p.spring = false;
    if (A.onLand) A.onLand(p, onPlat);
  } else {
    p.onGround = false;
    p.coyote--;
  }
  p.squash *= 0.82;
  if (p.hurt > 0) p.hurt -= DT;
  if (p.onGround && Math.abs(p.vx) > 0.3) {
    p.phase += Math.abs(p.vx) * 0.17;
    const idx = Math.floor(p.phase / Math.PI);
    if (idx !== p.stepIdx) {
      p.stepIdx = idx;
      sfx.step(A.hard);
      if (Math.random() < 0.5) dust(p.x, p.y, 1);
    }
  } else if (p.onGround) p.phase = 0;
  if (p.blink > 0) p.blink--;
  else if (Math.random() < 0.006) p.blink = 7;
  if (A.sea && A.ground(p.x) === null && p.y > A.sea + 4) {
    p.dead = 70;
    burst(36, () => ({ x: p.x + rnd(-5, 5), y: A.sea, vx: rnd(-1.5, 1.5), vy: rnd(-4.2, -1.2), g: 0.17, life: rnd(0.5, 1), color: pick(['#bfe9ff', '#ffffff', '#7fc8f8']), size: Math.random() < 0.3 ? 2 : 1 }));
    sfx.splash();
    G.shake = 3;
    quip(pick(['Blub blub! No swimming in boots.', 'The sea is not my friend.', 'Sploosh! Back to the beach.']));
  }
  if (p.y > H + 60) p.dead = 30;
}

function updateItems(playing) {
  if (playing) {
    area.coins.forEach(([x, y], i) => {
      const id = `${S.area}:${i}`;
      if (!S.coins[id] && Math.abs(player.x - x) < 13 && Math.abs(player.y - 13 - y) < 16) {
        S.coins[id] = true;
        sfx.coin();
        sparkle(x, y, '#ffe066');
      }
    });
  }
  for (const d of fallers) {
    d.vy += 0.34;
    d.x += d.vx;
    d.y += d.vy;
    const gy = area.ground(d.x) ?? area.terrain(d.x);
    if (d.y >= gy - 5) {
      d.y = gy - 5;
      if (!d.b) {
        d.b = true;
        sfx.land();
        dust(d.x, gy, 4);
      }
      d.vy *= -0.45;
      d.vx *= 0.7;
      if (Math.abs(d.vy) < 0.7) {
        d.gone = true;
        d.done(d.x);
      }
    }
  }
  fallers = fallers.filter(d => !d.gone);
}

function updatePlay() {
  S.time += DT;
  if (G.hintT > 0) G.hintT -= DT;
  if (G.fadeDir) {
    G.fade += G.fadeDir * DT * 4;
    if (G.fadeDir > 0 && G.fade >= 1) {
      enterArea(G.pending.to, G.pending.x, G.pending.y);
      G.fadeDir = -1;
    } else if (G.fadeDir < 0 && G.fade <= 0) {
      G.fade = 0;
      G.fadeDir = 0;
    }
  }
  if (pressed.konami) {
    S.flags.bigHead = !S.flags.bigHead;
    egg('konami');
    sparkle(player.x, player.y - 26, '#ffd23f');
  }
  if (hit('Escape')) return openPause();
  if (hit('i') && !choice) {
    sfx.menu();
    openInventory();
    return;
  }
  if (hit('F5')) toast(saveGame('quick') ? 'Quicksaved' : 'Could not save');
  if (hit('F9')) {
    if (readSlot('quick')) return loadSlot('quick');
    toast('No quicksave yet');
  }
  if (hit('m')) {
    musicOn = !musicOn;
    toast(`Music ${musicOn ? 'on' : 'off'}`);
  }
  if (choice) {
    const n = choice.options.length;
    if (hit('ArrowDown')) {
      choice.i = (choice.i + 1) % n;
      sfx.menu();
    }
    if (hit('ArrowUp')) {
      choice.i = (choice.i + n - 1) % n;
      sfx.menu();
    }
    if (hit('Enter', ' ', 'e')) {
      const o = choice.options[choice.i];
      choice = null;
      sfx.select();
      o.fn();
    }
  } else if (line) {
    if (hit(' ', 'Enter', 'e', 'p', 'u', 'l')) skipLine();
  } else if (!G.fadeDir && player.dead === 0 && !(area.locked && area.locked())) {
    if (hit(' ', 'Enter')) doVerb('def');
    else if (hit('e')) doVerb('talk');
    else if (hit('p')) doVerb('pick');
    else if (hit('u')) doVerb('use');
    else if (hit('l')) doVerb('look');
  }
  if (area.topdown) area.sail();
  else updatePlayer();
  const centre = clamp(player.x - W / 2, 0, Math.max(0, area.w - W));
  const sx = player.x - G.camX;
  if (area.topdown || sx > W * 0.68 || sx < W * 0.32) G.follow = true;
  if (G.follow) {
    G.camT = centre;
    if (!area.topdown && Math.abs(G.camX - centre) < 1.5 && Math.abs(player.vx) < 0.3) G.follow = false;
  }
  const omega = 2 / (area.topdown ? 0.9 : 0.6);
  const k = omega * DT;
  const decay = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k);
  const off = G.camX - G.camT;
  const tmp = ((G.camV || 0) + omega * off) * DT;
  G.camV = ((G.camV || 0) - omega * tmp) * decay;
  G.camX = G.camT + (off + tmp) * decay;
  const playing = player.dead === 0 && !G.fadeDir;
  area.update(playing);
  updateItems(playing);
  updateParticles();
  updateSpeech();
}

function update() {
  G.t += DT;
  if (G.toastT > 0) G.toastT -= DT;
  if (G.cardT > 0) G.cardT -= DT;
  if (G.mode === 'title') {
    G.camX = (Math.sin(G.t * 0.12 - Math.PI / 2) * 0.5 + 0.5) * (area.w - W);
    G.cardT = 0;
    updateMenu();
    area.update(false);
    updateParticles();
  } else if (G.mode === 'menu') updateMenu();
  else if (G.mode === 'inv') updateInventory();
  else if (G.mode === 'end') {
    area.update(false);
    updateParticles();
    if (Math.random() < 0.8) emit({ x: G.camX + rnd(0, W), y: -4, vx: rnd(-0.5, 0.5), vy: rnd(0.7, 1.6), life: 4, color: pick(['#ff4d6d', '#ffd23f', '#2ecc71', '#3a86ff', '#ffffff', '#ff9f1c']), size: 2, leaf: true });
    if (hit('Enter', ' ')) G.mode = 'play';
  } else updatePlay();
  music();
  G.shake *= 0.9;
  pressed = {};
}

function drawCoins() {
  area.coins.forEach(([x, y], i) => {
    if (S.coins[`${S.area}:${i}`]) return;
    const w = Math.max(1, Math.round(Math.abs(Math.cos(G.t * 4 + i)) * 7));
    const yy = y + Math.sin(G.t * 3 + i) * 1.5;
    rect(x - w / 2 - 1, yy - 5, w + 2, 10, OUT);
    rect(x - w / 2, yy - 4, w, 8, '#d4a017');
    if (w > 2) rect(x - w / 2 + 1, yy - 3, w - 2, 6, '#f4c430');
    if (w > 4) rect(x - 1, yy - 3, 1, 3, '#fff3b0');
  });
  for (const d of fallers) icon(d.id, d.x - 6, d.y - 6);
}

function drawPlayer() {
  const p = player;
  if (p.dead > 0 || area.topdown) return;
  const gy = area.ground(p.x);
  const sy = p.onGround ? p.y : gy;
  if (sy !== null) {
    const d = clamp((sy - p.y) / 70, 0, 1);
    ctx.globalAlpha = 0.28 * (1 - d);
    rect(p.x - 7 + d * 3, sy, 14 - d * 6, 2, '#000');
    ctx.globalAlpha = 1;
  }
  if (p.hurt > 0 && Math.floor(G.t * 20) % 2 === 0) return;
  actor(p.x, p.y, p.face, () => pipSprite(p, line && line.who === 'me', area.dark && has('lantern')));
}

function drawHint() {
  if (G.mode !== 'play' || line || choice || (area.locked && area.locked())) return;
  const t = nearest();
  if (!t) return;
  const x = Math.round(t.x);
  const y = Math.round(thingY(t) - (t.hy || 20) - 10 + Math.sin(G.t * 6) * 2);
  rect(x - 4, y - 1, 9, 3, '#000');
  rect(x - 3, y + 2, 7, 1, '#000');
  rect(x - 2, y + 3, 5, 1, '#000');
  rect(x - 1, y + 4, 3, 1, '#000');
  rect(x - 3, y, 7, 2, '#fff3b0');
  rect(x - 2, y + 2, 5, 1, '#fff3b0');
  rect(x - 1, y + 3, 3, 1, '#ffd23f');
}

function render() {
  ctx = bctx;
  clickZones.length = 0;
  const cam = Math.round(G.camX);
  const shx = G.shake > 0.3 ? Math.round((Math.random() - 0.5) * G.shake) : 0;
  const shy = G.shake > 0.3 ? Math.round((Math.random() - 0.5) * G.shake) : 0;
  area.back(cam);
  ctx.save();
  ctx.translate(-cam + shx, shy);
  area.mid(cam);
  drawCoins();
  area.actors();
  drawPlayer();
  area.front(cam);
  drawParticles();
  drawHint();
  ctx.restore();
  area.light(cam);
  ctx.drawImage(vignette, 0, 0);
  drawHud();
  dctx.imageSmoothingEnabled = false;
  dctx.drawImage(buf, 0, 0, display.width, display.height);
  drawTextLayer(cam);
}

enterArea('beach', 330, undefined, true);
G.menu = buildMenu('title');
let last = performance.now();
let acc = 0;
function frame(t) {
  acc += Math.min(0.1, (t - last) / 1000);
  last = t;
  while (acc >= DT) {
    update();
    acc -= DT;
  }
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
