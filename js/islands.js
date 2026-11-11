const ISLES = [
  { id: 'beach', name: 'Tiki Tide', x: 170, y: 150, r: 44, dock: ['beach', 150, 204] },
  { id: 'funk', name: 'Isla Funkadelica', x: 560, y: 86, r: 40, dock: ['funk', 70] },
  { id: 'ice', name: 'Brrrmuda', x: 930, y: 196, r: 42, dock: ['ice', 70] },
  { id: 'cheese', name: 'Cheddar Cay', x: 1290, y: 96, r: 40, dock: ['cheese', 70] },
];

function setSail(id) {
  const i = ISLES.find(s => s.id === id);
  sfx.door();
  travel('sea', i.x + i.r + 28, i.y + 8);
}

function sailThing(id) {
  return {
    x: 34, hy: 40, r: 26, name: 'the Soggy Biscuit', def: 'use',
    label: () => 'Board the ship and set sail',
    look: 'The Soggy Biscuit, moored and dripping. She floats. Mostly.',
    use: () => setSail(id),
  };
}

function mooredShip(fl) {
  for (let y = 0; y < 30; y++) rect(0, fl - 26 + y, 44 - y * 0.6, 1, y % 5 === 0 ? '#2a1a12' : '#4a3020');
  rect(0, fl - 28, 46, 2, '#6b4a32');
  seg(44, fl - 27, 66, fl - 38, '#3a2618', 2);
  rect(14, fl - 110, 3, 84, '#3a2618');
  for (let i = 0; i < 44; i++) rect(-6 + Math.sin(G.t * 2 + i * 0.15) * 2 * (i / 44), fl - 104 + i, 30 - i * 0.2, 1, i % 8 === 0 ? '#a9bbb0' : '#cfdccf');
  seg(46, fl - 22, 78, fl, '#7a5236', 2);
  rect(40, fl - 44, 2, 16, '#3a2618');
  rect(37, fl - 40, 8, 8, '#2a3a34');
  rect(39, fl - 38, 4, 4, '#9dffe0');
}

function crewJoined() {
  if (crewCount() === 3) {
    toast('Full crew! Captain Mildew will want to hear this.');
    note('A full crew: Disco Dave at the helm, Captain Waddles navigating, Gouda Gary in the galley.');
  }
}

AREAS.sea = (() => {
  const ship = { a: 0, v: 0 };
  const KR = [740, 226];
  let edgeSaid = false;

  function isle(s) {
    blob(s.x, s.y + 4, s.r + 10, (s.r + 10) * 0.62, '#3aa6cf');
    blob(s.x, s.y + 2, s.r + 4, (s.r + 4) * 0.62, '#7fd0e8');
    blob(s.x, s.y, s.r, s.r * 0.6, '#f0d28c');
    if (s.id === 'beach') {
      blob(s.x + 4, s.y - 3, s.r - 12, (s.r - 12) * 0.6, '#2f8a3f');
      blob(s.x + 8, s.y - 6, 12, 7, '#256b2b');
      for (let i = 0; i < 9; i++) rect(s.x + 14 - i, s.y - 8 - i, 2 + i * 2, 1, '#5a4a6a');
      rect(s.x + 12, s.y - 18, 4, 2, '#ff7b3a');
      rect(s.x - 26, s.y - 2, 1, 6, '#8b5a2b');
      blob(s.x - 26, s.y - 4, 4, 2, '#4caf50');
    } else if (s.id === 'funk') {
      blob(s.x, s.y - 2, s.r - 8, (s.r - 8) * 0.6, '#3a2a6a');
      const pal = ['#ff7cf4', '#5ee7ff', '#ffe680', '#7dffb0'];
      for (let i = -2; i < 3; i++) for (let j = -1; j < 2; j++) rect(s.x + i * 8 - 4, s.y + j * 5 - 4, 7, 4, pal[(i + j + 8 + Math.floor(G.t * 2)) % 4]);
      blob(s.x, s.y - 20, 5, 5, '#d0d0e0');
      if (Math.sin(G.t * 6) > 0) rect(s.x - 2, s.y - 22, 2, 2, '#fff');
    } else if (s.id === 'ice') {
      blob(s.x, s.y, s.r, s.r * 0.6, '#dff3ff');
      blob(s.x - 4, s.y - 3, s.r - 12, (s.r - 12) * 0.6, '#ffffff');
      for (let i = 0; i < 12; i++) rect(s.x - 16 - i * 0.5 + 6, s.y - 20 + i, 1 + i, 1, '#9fc4ea');
      blob(s.x + 14, s.y - 2, 8, 5, '#eef6ff');
      rect(s.x + 12, s.y, 4, 3, '#3a3050');
    } else {
      blob(s.x, s.y, s.r, s.r * 0.6, '#f4c430');
      blob(s.x - 2, s.y - 3, s.r - 8, (s.r - 8) * 0.6, '#ffe066');
      for (const [dx, dy, rr] of [[-14, -2, 4], [6, 4, 3], [12, -8, 5], [-4, 8, 2]]) blob(s.x + dx, s.y + dy, rr, rr * 0.7, '#d4a017');
      for (let i = 0; i < 10; i++) rect(s.x - 20 + i, s.y - 14 - i, 20 - i * 2, 1, '#ffb347');
    }
  }

  return {
    name: 'The Wobbly Sea', w: 1500, music: 'sea', checkpoint: 250, topdown: true, hard: true,
    terrain: () => 150,
    ground: () => 150,
    coins: [],
    quips: ['Yo ho ho and a bottle of root brew.', 'I am the captain now. The ghost said so. Sort of.', 'The sea is wobbly today.'],
    enter() {
      ship.a = 0;
      ship.v = 0;
      edgeSaid = false;
      G.hintT = 8;
    },
    sail() {
      const p = player;
      const locked = !!choice || G.fadeDir !== 0;
      if (!locked) {
        const sm = Math.min(1, Math.hypot(stick.x, stick.y));
        if (stick.on && sm > 0.25) {
          const d = Math.atan2(stick.y, stick.x) - ship.a;
          ship.a += clamp(Math.atan2(Math.sin(d), Math.cos(d)), -0.07, 0.07);
          ship.v += 0.05 * sm;
        }
        ship.a += ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 0.04;
        if (keys.ArrowUp) ship.v += 0.045;
        if (keys.ArrowDown) ship.v -= 0.06;
      }
      ship.v = clamp(ship.v * 0.988, 0, 1.9);
      p.x += Math.cos(ship.a) * ship.v;
      p.y += Math.sin(ship.a) * ship.v;
      p.x = clamp(p.x, 20, this.w - 20);
      p.y = clamp(p.y, 44, H - 34);
      p.onGround = true;
      for (const s of ISLES) {
        const dx = p.x - s.x;
        const dy = (p.y - s.y) / 0.62;
        const d = Math.hypot(dx, dy);
        if (d < s.r + 12) {
          p.x = s.x + (dx / d) * (s.r + 12);
          p.y = s.y + (dy / d) * (s.r + 12) * 0.62;
          ship.v *= 0.9;
        }
      }
      if (ship.v > 0.3 && Math.random() < 0.6) emit({ x: p.x - Math.cos(ship.a) * 12 + rnd(-3, 3), y: p.y - Math.sin(ship.a) * 12 + rnd(-3, 3), life: rnd(0.5, 1.2), color: pick(['#ffffff', '#bfe9ff']), size: Math.random() < 0.4 ? 2 : 1 });
      if (Math.hypot(p.x - KR[0], p.y - KR[1]) < 44 && !S.flags.kraken) {
        S.flags.kraken = true;
        egg('kraken');
        say(['me', 'Is that... a tentacle?'], ['me', "It's waving. I think it's friendly. I'm waving back. From a distance."]);
      }
      if (p.x > this.w - 40) {
        if (!edgeSaid) {
          edgeSaid = true;
          egg('edge');
          say(['me', 'The map just... stops here.'], ['me', '"Here be dragons. Probably. The cartographer got bored." Fair enough.']);
        }
      } else if (p.x < this.w - 120) edgeSaid = false;
    },
    update() {
      if (AC && Math.random() < 0.004) noise(1.4, 0.05, 500);
    },
    things: ISLES.map(s => ({
      x: s.x, y: s.y, rad: s.r + 40, hy: s.r * 0.6 + 8, name: s.name, def: 'use',
      label: () => `Drop anchor at ${s.name}`,
      look: () => say(['me', { beach: 'Tiki Tide. Home, sweet shipwreck.', funk: 'I can hear the bass from here.', ice: 'Brrrmuda. I can see my breath just looking at it.', cheese: 'That island is... is that island made of cheese?' }[s.id]]),
      use() {
        sfx.door();
        travel(...s.dock);
      },
    })),
    back() {
      rect(0, 0, W, H, '#1f6f9f');
    },
    mid(cam) {
      for (let k = Math.floor(cam / 90) - 1; k < (cam + W) / 90 + 1; k++) blob(k * 90 + hash(k) * 50, 40 + hash(k + 5) * 200, 40 + hash(k + 2) * 30, 14 + hash(k + 3) * 12, hash(k) > 0.5 ? '#1b6592' : '#237aab');
      for (let gx = Math.floor(cam / 26) - 1; gx < (cam + W) / 26 + 1; gx++) {
        for (let gy = 0; gy < 17; gy++) {
          const h = hash(gx * 31 + gy);
          if (h < 0.45) continue;
          const x = gx * 26 + h * 14 + Math.sin(G.t * 1.2 + gy + gx) * 3;
          const y = gy * 16 + h * 9 + 6;
          rect(x, y, 5, 1, '#6fc0e6');
          rect(x + 5, y + 1, 3, 1, '#6fc0e6');
        }
      }
      ISLES.forEach(isle);
      const near = S.flags.kraken ? 1 : 0;
      blob(KR[0], KR[1], 22, 9, '#124a6e');
      for (let i = 0; i < 3; i++) {
        const tx = KR[0] - 14 + i * 14;
        const hgt = 8 + near * 10 + Math.sin(G.t * 2 + i) * 3;
        for (let k = 0; k < hgt; k++) rect(tx + Math.sin(G.t * 3 + k * 0.4 + i) * 2, KR[1] - k, 3, 1, k % 3 ? '#b05cc8' : '#d08ae0');
      }
      const dx = 1100;
      const dy = 60 + Math.sin(G.t * 2) * 2;
      blob(dx, dy, 6, 4, '#ffd23f');
      blob(dx + 4, dy - 5, 3, 3, '#ffd23f');
      rect(dx + 7, dy - 5, 2, 2, '#ff8a3c');
      for (let i = 0; i < 4; i++) blob(1440 + i * 13, 150 + Math.sin(G.t * 2 + i) * 4, 5, 4 + Math.sin(G.t * 2 + i) * 2, '#2f8a5a');
      rect(1432, 140 + Math.sin(G.t * 2) * 4, 6, 6, '#2f8a5a');
      rect(1433, 141 + Math.sin(G.t * 2) * 4, 1, 1, '#ffe680');
      blob(60, 54, 16, 16, '#e8d5a3');
      blob(60, 54, 14, 14, '#f3e4b8');
      seg(60, 42, 60, 66, '#8a6e3c');
      seg(48, 54, 72, 54, '#8a6e3c');
      rect(59, 40, 3, 5, '#d62839');
    },
    actors() {
      const p = player;
      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y + Math.sin(G.t * 3) * 1));
      ctx.rotate(ship.a);
      blob(0, 0, 15, 7, OUT);
      blob(0, 0, 14, 6, '#4a3020');
      blob(1, 0, 11, 4, '#6b4a32');
      rect(13, -1, 5, 2, '#3a2618');
      rect(-3, -10, 3, 20, OUT);
      rect(-2, -9, 2, 18, '#cfdccf');
      rect(4, -7, 2, 14, '#cfdccf');
      rect(-9, -2, 3, 4, '#9dffe0');
      ctx.restore();
    },
    front() {},
    light() {},
    overlay(cam) {
      for (const s of ISLES) outlined(s.name, (s.x - cam) * U, (s.y - s.r * 0.6 - 18) * U, '#fff3b0', Math.round(5 * U));
      outlined('Here be dragons', (1440 - cam) * U, 120 * U, '#bfe9ff', Math.round(4 * U));
      if (G.hintT > 0 && !TOUCH) outlined('← → steer    ↑ sails    ↓ slow down    Enter: drop anchor', display.width / 2, (H - 14) * U, '#d7f0ff', Math.round(4.4 * U));
    },
  };
})();

AREAS.funk = (() => {
  const FL = 214;
  const ARW = { ArrowLeft: '←', ArrowUp: '↑', ArrowRight: '→', ArrowDown: '↓' };
  const PAL = ['#ff7cf4', '#5ee7ff', '#ffe680', '#7dffb0', '#ff8a5c', '#c77dff'];
  let dance = null;
  const beat = () => G.t * 4;

  function startRound(r) {
    dance = { round: r, seq: Array.from({ length: 3 + r }, () => pick(Object.keys(ARW))), i: 0, phase: 'show', t: 0 };
  }

  function djTalk() {
    if (S.flags.crewDave) return say(['dj', pick(['You got the moves, little pirate. The floor remembers.', 'This next one goes out to a ghost who lost his hat.', 'Volcano is bubbling in four-four time tonight.'])]);
    talk([['dj', 'Welcome to Isla Funkadelica. I am DJ Lavalamp. The volcano keeps the beat. I keep the volcano happy.']], () =>
      ask([
        { text: 'I want to enter the dance-off.', fn: () => talk([['dj', 'Three rounds. I call the moves, you bust the moves. Watch the arrows, then hit them in order.'], ['dj', 'Drop the beat!']], () => startRound(0)) },
        { text: 'Who is the skeleton?', fn: () => say(['dj', 'Disco Dave. Best helmsman who ever lived. Then best helmsman who ever died.'], ['dj', 'He only sails with captains who can dance.']) },
        { text: 'Just vibing.', fn: () => say(['dj', 'Vibing is free. Vibe responsibly.']) },
      ]),
    );
  }

  return {
    name: 'Isla Funkadelica', w: 900, music: 'funk', checkpoint: 70, hard: true, dust: '#c77dff', minX: 20, maxX: 884,
    terrain: () => FL,
    ground: () => FL,
    platforms: [{ x1: 492, x2: 520, y: 174 }],
    coins: [[506, 148], [800, 166]],
    quips: ['My feet are moving on their own.', 'I have never felt so funky. Or so sweaty.', 'Is the volcano... dancing?', 'This island smells of hairspray and lava.'],
    anchors: { dj: () => [440, FL - 76], dave: () => [620, FL - 56], carl: () => [170, FL - 62] },
    locked: () => !!dance,
    enter() {
      dance = null;
    },
    update() {
      if (dance) {
        dance.t += DT;
        if (dance.phase === 'show' && dance.t > 1 + dance.seq.length * 0.5) dance.phase = 'input';
        else if (dance.phase === 'input') {
          for (const k of Object.keys(ARW)) {
            if (!pressed[k]) continue;
            if (k === dance.seq[dance.i]) {
              dance.i++;
              sfx.coin();
              player.squash = -0.6;
              player.face = k === 'ArrowLeft' ? -1 : 1;
              sparkle(player.x, player.y - 20, pick(PAL));
              if (dance.i === dance.seq.length) {
                if (dance.round === 2) {
                  dance = null;
                  S.flags.crewDave = true;
                  sfx.fanfare();
                  note('Won the Funkadelica dance-off. Disco Dave the skeleton helmsman joined the crew.');
                  talk([['dj', 'FLAWLESS! The volcano has not been this happy since the seventies!'], ['dave', 'Those moves... those are CAPTAIN moves. I am in. I will steer your ship, and I will steer it with STYLE.'], ['me', 'Welcome aboard, Dave.']], () => {
                    give('record');
                    crewJoined();
                  });
                } else startRound(dance.round + 1);
              }
            } else {
              dance = null;
              sfx.scratch();
              G.shake = 4;
              say(['dj', 'Record scratch! Wrong move. Talk to me when you want another go.']);
            }
            break;
          }
        }
      }
      if (Math.random() < 0.2) emit({ x: G.camX + rnd(0, W), y: rnd(30, 180), vy: 0.2, life: rnd(0.5, 1.2), color: pick(PAL), glow: true });
    },
    things: [
      sailThing('funk'),
      {
        x: 170, hy: 50, name: 'Carl the bouncer', def: 'talk',
        look: 'A flamingo in sunglasses and a bow tie. He is standing on one leg and judging everyone.',
        talk() {
          const n = (S.flags.carlN = (S.flags.carlN || 0) + 1);
          sfx.honk();
          if (n === 1) say(['carl', 'Name?'], ['me', 'Pip.'], ['carl', 'Not on the list.'], ['me', 'There is no door. It is a beach.'], ['carl', 'Still not on the list.']);
          else if (n === 2) say(['carl', 'Still not on the list.'], ['me', 'Can I be ON the list?'], ['carl', 'Ask me again and I will think about it.']);
          else {
            say(['carl', 'Fine. You are on the list. VIP. The VIP area is the same beach, but you get to feel better about it.']);
            egg('flamingo');
          }
        },
      },
      { x: 440, hy: 64, r: 28, name: 'DJ Lavalamp', def: 'talk', look: 'A DJ in a tiki mask and headphones. His turntables are powered by lava.', talk: djTalk, use: djTalk },
      {
        x: 620, hy: 48, name: 'Disco Dave', def: 'talk',
        look: 'A skeleton with an afro and star-shaped sunglasses. He has not stopped dancing since 1977.',
        talk: () => say(['dave', S.flags.crewDave ? pick(['Captain! When do we sail? I have a playlist ready.', 'I may have no ears, but I have RHYTHM.']) : 'I only sail with someone who can dance, baby. Win the dance-off and we will talk.']),
      },
      {
        x: 770, hy: 26, name: 'the snack table', def: 'look',
        look: () => say(['me', 'Pineapple on a stick. Cheese on a stick. A stick on a stick.']),
        pick: () => say(['me', 'Everything is glued down. It is a display snack table.'], ['me', 'Who displays snacks?']),
      },
    ],
    back(cam) {
      ctx.drawImage(SKY.night, 0, 0);
      drawStars(120, 150);
      drawVolcano(cam, 420, 204, 120, '#2a1a4a');
      drawHillLayer(cam, 0.25, -200, -100, 200, 24, '#24143e', '#3a2460', 2);
      drawPalmRow(cam, 0.6, -100, 214, '#160c2a');
      const bx = 240 - cam * 0.1;
      rect(bx, 0, 1, 34, '#888');
      blob(bx, 46, 14, 14, '#9a9ab0');
      for (let i = 0; i < 30; i++) {
        const a = i * 0.7 + G.t * 0.8;
        const rx = Math.cos(a) * (4 + (i % 3) * 4);
        const ry = ((i * 37) % 24) - 12;
        if (Math.abs(rx) < Math.sqrt(Math.max(0, 196 - ry * ry))) rect(bx + rx, 46 + ry, 2, 2, Math.sin(a * 3) > 0.3 ? '#ffffff' : PAL[i % PAL.length]);
      }
    },
    mid() {
      rect(0, FL, 900, H - FL, '#150c26');
      rect(0, FL, 96, H - FL, '#d9b061');
      rect(0, FL, 96, 2, '#f6dc94');
      const b = Math.floor(beat());
      for (let k = 0; k < 40; k++) {
        const x = 96 + k * 20;
        const c = PAL[(k * 5 + b * (k % 2 ? 1 : 2)) % PAL.length];
        rect(x, FL, 19, 9, c);
        rect(x, FL, 19, 2, '#ffffff');
        ctx.globalAlpha = 0.45;
        rect(x, FL + 9, 19, 30, c);
        ctx.globalAlpha = 1;
        rect(x + 19, FL, 1, 40, '#150c26');
      }
      mooredShip(FL);
      for (const px of [130, 208]) {
        rect(px - 1, FL - 20, 3, 20, '#d4a017');
        blob(px, FL - 21, 3, 3, '#f4c430');
      }
      for (let i = 0; i <= 20; i++) rect(130 + i * 3.9, FL - 18 + Math.sin((i / 20) * Math.PI) * 6, 3, 2, '#c0392b');
      const pulse = Math.max(0, 1 - (beat() % 1) * 2);
      for (const sx of [384, 506]) {
        rect(sx - 14, FL - 40, 28, 40, '#1a1024');
        rect(sx - 13, FL - 39, 26, 38, '#2a2040');
        blob(sx, FL - 28, 6 + pulse * 2, 6 + pulse * 2, '#111');
        blob(sx, FL - 28, 2, 2, '#888');
        blob(sx, FL - 10, 8 + pulse * 2, 7 + pulse * 2, '#111');
        blob(sx, FL - 10, 3, 3, '#888');
      }
      rect(410, FL - 24, 60, 24, '#3a2a5a');
      rect(408, FL - 26, 64, 3, '#ff7cf4');
      for (const tx of [425, 455]) {
        blob(tx, FL - 30, 8, 3, '#111');
        rect(tx + Math.cos(G.t * 6) * 5, FL - 30 + Math.sin(G.t * 6) * 2, 2, 1, '#ffe680');
      }
      for (let i = 0; i < 6; i++) rect(414 + i * 9, FL - 18 + ((i + b) % 3) * 3, 6, 10 - ((i + b) % 3) * 3, PAL[i]);
      rect(748, FL - 16, 46, 3, '#f4f6fa');
      rect(752, FL - 13, 3, 13, '#8a8a9a');
      rect(787, FL - 13, 3, 13, '#8a8a9a');
      for (let i = 0; i < 4; i++) {
        rect(755 + i * 10, FL - 26, 1, 10, '#c8a46a');
        rect(753 + i * 10, FL - 28, 5, 4, ['#ffd23f', '#f4c430', '#c8a46a', '#ff8a5c'][i]);
      }
      for (const lx of [300, 700, 860]) {
        rect(lx - 3, FL - 8, 7, 8, '#888');
        rect(lx - 4, FL - 44, 9, 36, '#3a1a5a');
        for (let k = 0; k < 3; k++) blob(lx, FL - 14 - ((G.t * 9 + k * 12 + lx) % 28), 2 + (k % 2), 3, PAL[(k + Math.floor(lx)) % PAL.length]);
      }
      drawPalm(250, FL, 80, -1, 0, 0, 5);
      drawPalm(680, FL, 74, 1, 0, 0, 6);
    },
    actors() {
      actor(170, FL, player.x < 170 ? -1 : 1, () => flamingoSprite(line && line.who === 'carl'));
      actor(440, FL - 22, 1, () => djSprite(line && line.who === 'dj'));
      actor(620, FL, 1, () => daveSprite(line && line.who === 'dave'));
    },
    front() {},
    light(cam) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(120,90,190,0.35)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const bx = 240 - cam * 0.1;
      for (let i = 0; i < 5; i++) {
        const a = G.t * 0.7 + i * 1.256;
        const tx = bx + Math.cos(a) * 260;
        ctx.fillStyle = ['rgba(255,124,244,0.09)', 'rgba(94,231,255,0.09)', 'rgba(255,230,128,0.09)', 'rgba(125,255,176,0.09)', 'rgba(255,138,92,0.09)'][i];
        ctx.beginPath();
        ctx.moveTo(bx - 3, 46);
        ctx.lineTo(bx + 3, 46);
        ctx.lineTo(tx + 40, H);
        ctx.lineTo(tx - 40, H);
        ctx.fill();
      }
      glow(bx, 46, 40, 'rgba(255,255,255,0.25)');
      const pulse = Math.max(0, 1 - (beat() % 1) * 2);
      glow(440 - cam, FL - 10, 120, `rgba(255,124,244,${0.1 + pulse * 0.12})`);
      ctx.globalCompositeOperation = 'source-over';
    },
    overlay() {
      if (!dance) return;
      const dw = display.width;
      const size = Math.round(16 * U);
      const shownN = dance.phase === 'show' ? Math.min(dance.seq.length, Math.floor((dance.t - 0.5) / 0.5) + 1) : dance.seq.length;
      outlined(dance.phase === 'show' ? `ROUND ${dance.round + 1}: WATCH` : 'YOUR TURN!', dw / 2, 44 * U, dance.phase === 'show' ? '#ff7cf4' : '#7dffb0', Math.round(8 * U));
      const total = dance.seq.length * size * 1.4;
      dance.seq.forEach((k, i) => {
        if (i >= shownN) return;
        const done = dance.phase === 'input' && i < dance.i;
        const hide = dance.phase === 'input' && i >= dance.i;
        outlined(hide ? '?' : ARW[k], dw / 2 - total / 2 + i * size * 1.4 + size * 0.7, 62 * U, done ? '#7dffb0' : hide ? '#6a5a8a' : '#ffe680', size);
      });
    },
  };
})();

AREAS.ice = (() => {
  const FL = 214;
  const wad = { x: 380, dir: 1 };
  const PETE = [
    [['pete', 'Name is Frosty Pete. I used to be a pirate. Then I stood still too long.']],
    [['pete', 'Do you want to know how I lost my eye?'], ['me', 'Yes.'], ['pete', 'It was a button. It fell off.']],
    [['pete', 'Summer is my least favourite pirate.']],
    [['pete', 'If you see a carrot, do not mention it. Sensitive subject.']],
  ];

  function waddlesTalk() {
    const f = S.flags;
    if (f.crewWaddles) return say(['waddles', pick(['Navigator Waddles reporting. North is that way. Probably.', 'I have charted a course. It is a circle. I like circles.', 'Do we have fish on the ship? Asking for a penguin.'])]);
    if (has('pepper')) {
      take('pepper');
      f.crewWaddles = true;
      sfx.fanfare();
      note('Captain Waddles the penguin ate the ghost pepper, thawed out and joined the crew as navigator.');
      return talk(
        [
          ['waddles', 'Is that a... *gulp*'],
          ['waddles', 'HOOOOOOO! I can feel me flippers! I can feel me FEELINGS!'],
          ['waddles', 'Captain Waddles, at yer service. I navigate. I also slide. Take this, I have been sat on it for years.'],
        ],
        () => {
          give('snowball');
          crewJoined();
        },
      );
    }
    note('Captain Waddles on Brrrmuda would join the crew, but he is frozen. He needs something warm.');
    say(['waddles', 'B-b-brrr. Captain Waddles. Finest navigator in the southern seas.'], ['waddles', 'I would join a crew in a heartbeat, but I am frozen to me own flippers.'], ['waddles', 'Bring me somethin\' WARM, lad. Not a hug. We tried a hug.']);
  }

  return {
    name: 'Brrrmuda', w: 900, music: 'ice', checkpoint: 70, hard: true, slip: true, dust: '#ffffff', minX: 20, maxX: 884,
    terrain: () => FL,
    ground: () => FL,
    platforms: [{ x1: 484, x2: 536, y: 182 }],
    coins: [[510, 158], [820, 168]],
    quips: ['I can see my breath. It looks worried.', 'Wheeee! I mean. Arr.', 'Note to self: pack a jumper.', 'My bandana has frozen solid.'],
    anchors: { waddles: () => [wad.x, FL - 46], pete: () => [660, FL - 56] },
    update() {
      if (!(line && line.who === 'waddles') && Math.abs(player.x - wad.x) > 30) {
        wad.x += wad.dir * 0.3;
        if (wad.x > 420) wad.dir = -1;
        if (wad.x < 350) wad.dir = 1;
      }
      for (let i = 0; i < 2; i++) emit({ x: G.camX + rnd(-20, W + 20), y: -4, vx: rnd(-0.4, 0.1), vy: rnd(0.5, 1.1), life: 5, color: '#ffffff', size: Math.random() < 0.3 ? 2 : 1, leaf: true });
    },
    things: [
      sailThing('ice'),
      {
        x: 250, hy: 34, name: 'the frozen signpost', def: 'look',
        look: () => say(['me', '"WELCOME TO BRRRMUDA. Do not lick the signpost."'], ['me', 'Why would anyone lick the... hm.']),
        use() {
          egg('pole');
          say(['me', 'Just a little lick, to see what...'], ['me', 'Mmph! My tongue ith thtuck!'], ['me', 'Thith ith fine. Thith ith completely fine.'], ['me', '*pop* Ow. Worth it.']);
        },
      },
      {
        get x() {
          return wad.x;
        },
        hy: 40, r: 24, name: 'Captain Waddles', def: 'talk', look: 'A penguin in a pirate hat and a little red scarf, frozen mid-waddle.', talk: waddlesTalk, use: waddlesTalk,
      },
      { x: 510, hy: 44, name: 'the igloo', def: 'look', look: () => say(['me', 'A cosy igloo. Sign on the door: "GONE FISHING. BACK IN SPRING. THERE IS NO SPRING."']) },
      {
        x: 660, hy: 50, name: 'Frosty Pete', def: 'talk',
        look: 'A snowman with an eyepatch and a carrot nose. He gives off a strong retired-pirate energy.',
        talk() {
          const n = (S.flags.peteN = (S.flags.peteN || 0) + 1);
          talk(PETE[(n - 1) % PETE.length]);
        },
        pick: () => say(['pete', 'Hands off the buttons.']),
      },
      { x: 770, hy: 16, name: 'the fishing hole', def: 'look', look: () => say(['me', 'A hole in the ice with a fishing rod. Something down there is looking back at me.'], ['me', 'It winked.']) },
    ],
    back(cam) {
      ctx.drawImage(SKY.night, 0, 0);
      drawStars(140, 170);
      ctx.globalCompositeOperation = 'lighter';
      for (let b = 0; b < 3; b++) {
        for (let x = 0; x < W; x += 3) {
          const y = 40 + b * 22 + Math.sin(x * 0.02 + G.t * 0.5 + b * 2) * 14 + Math.sin(x * 0.05 - G.t * 0.3) * 5;
          ctx.fillStyle = ['rgba(90,255,170,0.10)', 'rgba(90,220,255,0.08)', 'rgba(190,120,255,0.07)'][b];
          ctx.fillRect(x, y, 3, 34 + Math.sin(x * 0.03 + G.t) * 10);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      drawMoon(cam, 380, 50);
      for (let sx = 0; sx < W; sx++) {
        const lx = sx + cam * 0.25;
        const h = 190 - Math.abs(((lx % 120) + 120) % 120 - 60) * 1.1 - Math.abs(((lx * 1.7) % 70) - 35) * 0.5;
        rect(sx, h, 1, H - h, '#6f93c4');
        rect(sx, h, 1, 8, '#e8f4ff');
      }
      for (let sx = 0; sx < W; sx++) {
        const lx = sx + cam * 0.5;
        const h = 204 - Math.abs(((lx % 90) + 90) % 90 - 45) * 0.9;
        rect(sx, h, 1, H - h, '#a9c8ea');
        rect(sx, h, 1, 4, '#ffffff');
      }
    },
    mid(cam) {
      for (let wx = cam - 2; wx < cam + W + 2; wx++) {
        const h = hash(wx);
        rect(wx, FL, 1, H - FL, '#bcd8f2');
        rect(wx, FL, 1, 3, '#ffffff');
        rect(wx, FL + 3, 1, 5, '#e3f1ff');
        if (h > 0.9) rect(wx, FL + 10 + Math.floor(h * 30), 3, 1, '#9fc4ea');
        if (h < 0.04) rect(wx, FL - 1, 2, 1, '#dff3ff');
      }
      mooredShip(FL);
      rect(249, FL - 30, 3, 30, '#6b4226');
      rect(238, FL - 30, 24, 10, '#a0703a');
      rect(238, FL - 30, 24, 2, '#ffffff');
      for (let i = 0; i < 4; i++) rect(241 + i * 5, FL - 20, 2, 3 + (i % 2) * 3, '#dff3ff');
      blob(510, FL - 2, 36, 32, '#cfe6ff');
      blob(510, FL - 4, 33, 30, '#eef6ff');
      rect(470, FL, 82, 3, '#ffffff');
      rect(470, FL + 3, 82, 5, '#e3f1ff');
      rect(470, FL + 8, 82, H - FL, '#bcd8f2');
      for (let y = FL - 28; y < FL; y += 8) {
        const w = Math.sqrt(Math.max(0, 1 - ((y - FL + 4) / 30) ** 2)) * 33;
        rect(510 - w, y, w * 2, 1, '#9fc4ea');
        for (let x = -w + ((y / 8) % 2) * 6; x < w; x += 12) rect(510 + x, y, 1, 8, '#9fc4ea');
      }
      rect(500, FL - 20, 20, 20, '#1a1024');
      blob(510, FL - 20, 10, 6, '#1a1024');
      rect(503, FL - 16, 14, 16, '#ffb347');
      rect(766, FL - 1, 14, 3, '#1d3a6a');
      seg(786, FL, 774, FL - 26, '#8b5a2b');
      rect(774, FL - 26, 1, 24 + Math.sin(G.t * 2) * 2, '#c8ccd0');
      for (const tx of [150, 320, 590, 720, 850]) {
        const s = 0.7 + hash(tx) * 0.6;
        for (let i = 0; i < 4; i++) {
          const w = (14 - i * 3) * s;
          rect(tx - w, FL - 8 * s - i * 9 * s, w * 2, 9 * s, i % 2 ? '#1f5a48' : '#256b55');
          rect(tx - w, FL - 8 * s - i * 9 * s, w * 2, 2, '#ffffff');
        }
        rect(tx - 1, FL - 8 * s, 3, 8 * s, '#4a3020');
      }
    },
    actors() {
      actor(660, FL, player.x < 660 ? -1 : 1, () => snowmanSprite(line && line.who === 'pete'));
      actor(wad.x, FL, S.flags.crewWaddles ? (player.x < wad.x ? -1 : 1) : wad.dir, () => penguinSprite(line && line.who === 'waddles'));
      if (!S.flags.crewWaddles) {
        ctx.globalAlpha = 0.45;
        rect(wad.x - 9, FL - 20, 18, 20, '#bfe9ff');
        ctx.globalAlpha = 1;
        rect(wad.x - 9, FL - 20, 18, 1, '#ffffff');
      }
    },
    front() {},
    light(cam) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(150,180,235,0.3)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      glow(510 - cam, FL - 8, 40, 'rgba(255,170,70,0.4)');
      ctx.globalCompositeOperation = 'source-over';
    },
  };
})();

AREAS.cheese = (() => {
  const terrain = x => 212 + Math.sin(x * 0.012) * 3 + Math.sin(x * 0.03) * 1.5;
  const TASTE = ['It is a mild cheddar. With notes of beach.', 'Still cheddar. Slightly sandy.', 'I should stop eating the island. One more bite.'];

  function queenTalk() {
    const f = S.flags;
    if (f.pepperGot) return say(['queen', pick(['We are amused. Do not ruin it.', 'Mind the fondue, pirate. It minds you.', 'Our kingdom is delicious and we will not apologise.'])]);
    talk([['queen', 'We are Queen Camembert the Ripe, ruler of Cheddar Cay. You may squeak.'], ['queen', 'Answer our royal riddle and you may take one treasure from our pantry. What do you call cheese that is not yours?']], () =>
      ask([
        { text: 'Stolen cheese?', fn: () => say(['queen', 'That is a CRIME, not a riddle. Guards! ...We have no guards. Try again.']) },
        {
          text: 'Nacho cheese.',
          fn: () =>
            talk([['queen', 'HA! Nacho cheese! We never tire of it. The court never tires of it. The court is us.'], ['queen', 'Take this from the royal pantry: a ghost pepper. It is the warmest thing in our kingdom, after the volcano.']], () => {
              f.pepperGot = true;
              give('pepper');
              note('Queen Camembert gave me a royal ghost pepper: the warmest thing on Cheddar Cay.');
            }),
        },
        { text: 'Somebody else\'s gouda problem?', fn: () => say(['queen', 'Close. Cheesy, but close. Try again.']) },
      ]),
    );
  }

  function garyTalk() {
    const f = S.flags;
    if (f.crewGary) return say(['gary', pick(['Tonight: fondue. Tomorrow: fondue. I have a system.', 'A ship with no cook is just a floating argument.', 'Captain! Does the ghost eat? Asking for my menu.'])]);
    if (has('snowball')) {
      take('snowball');
      f.crewGary = true;
      sfx.fanfare();
      note('Gouda Gary cooled his fondue with the everlasting snowball and joined the crew as cook.');
      return talk([['gary', 'A snowball that never melts? Into the pot!'], ['gary', '*hisssss* It is PERFECT. Creamy! Stable! Not on fire!'], ['gary', 'Chef Gouda Gary, reporting for galley duty. I bring my own pot.']], crewJoined);
    }
    note('Gouda Gary on Cheddar Cay would cook for the crew, but his fondue is too hot. He needs something cold that stays cold.');
    say(['gary', 'Gouda Gary. Chef. Artist. Currently on fire, a little.'], ['gary', 'The fondue volcano runs too hot! It melts my spoons, my hat, my dreams.'], ['gary', 'Bring me something cold that STAYS cold, and I will cook for any crew you like.']);
  }

  return {
    name: 'Cheddar Cay', w: 900, music: 'cheese', checkpoint: 70, dust: '#ffe066', minX: 20, maxX: 884,
    terrain,
    ground: terrain,
    platforms: [{ x1: 418, x2: 482, y: 184 }],
    coins: [[450, 158], [810, 166]],
    quips: ['I am standing on lunch.', 'Do not eat the island. Do not eat the island.', 'It smells incredible here. And slightly of feet.', 'Somewhere a cracker is missing its purpose.'],
    anchors: { queen: () => [620, terrain(620) - 62], gary: () => [330, terrain(330) - 44] },
    update() {
      const gy = terrain(290);
      if (Math.random() < 0.3) emit({ x: 290 + rnd(-8, 8), y: gy - 20, vx: rnd(-0.2, 0.2), vy: rnd(-0.8, -0.3), life: rnd(0.4, 0.9), color: pick(['#ffe066', '#ffd23f']), size: 2 });
      if (Math.random() < 0.4) emit({ x: 290 + rnd(-5, 5), y: gy - 2, vy: rnd(-0.6, -0.2), life: 0.4, color: pick(['#ff9f1c', '#ff6b35']), glow: true });
    },
    things: [
      sailThing('cheese'),
      {
        x: 190, hy: 14, name: 'the ground', def: 'use',
        label: () => 'Taste the island',
        look: 'On close inspection, the ground is cheese. On closer inspection, it is still cheese.',
        use() {
          const n = (S.flags.tasteN = (S.flags.tasteN || 0) + 1);
          say(['me', TASTE[Math.min(n, 3) - 1]]);
          egg('cheese');
        },
      },
      { x: 330, hy: 36, r: 26, name: 'Gouda Gary', def: 'talk', look: 'A mouse in a chef hat, stirring a pot of fondue that is stirring back.', talk: garyTalk, use: garyTalk },
      { x: 450, y: 184, hy: 12, name: 'the cracker', def: 'look', look: () => say(['me', 'I am standing on a giant cracker. Today is a strange day.']) },
      { x: 620, hy: 54, r: 26, name: 'Queen Camembert', def: 'talk', look: 'A very small queen on a very large wheel of cheese. Her crown is a bottle cap.', talk: queenTalk, use: queenTalk },
      { x: 780, hy: 24, name: 'the grape vine', def: 'look', look: () => say(['me', 'Grapes. Of course there are grapes. This island is a whole cheese board.']), pick: () => say(['me', 'The Queen is watching. I will not risk a grape-related incident.']) },
    ],
    back(cam) {
      ctx.drawImage(SKY.sunset, 0, 0);
      drawSun(cam, 330, 150, 34);
      drawClouds(cam, ['#9e4a74', '#c9637a', '#f19b8f', '#f6b39c'], 6, 70);
      drawSeaBand(cam, 186, '#2c3e78', '#36508f', 330, '#ffd98a', '#ff9e6b');
      drawVolcano(cam, 560, 196, 112, '#c98a22');
      for (let sx = 0; sx < W; sx++) {
        const lx = sx + cam * 0.3;
        const m = ((lx % 220) + 220) % 220;
        const h = 196 - Math.max(0, 70 - Math.abs(m - 150) * 0.8) - (m < 150 ? 0 : Math.max(0, 40 - (m - 150)));
        if (h > 195) continue;
        rect(sx, h, 1, H - h, '#e0a82a');
        rect(sx, h, 1, 2, '#ffe066');
      }
      for (let k = Math.floor((cam * 0.3) / 44) - 1; k < (cam * 0.3 + W) / 44 + 1; k++) {
        const lx = k * 44 + hash(k) * 20;
        const m = ((lx % 220) + 220) % 220;
        if (m > 110 && m < 190) blob(lx - cam * 0.3, 176 + hash(k + 1) * 14, 4 + hash(k + 2) * 4, 3 + hash(k + 2) * 3, '#b8841a');
      }
    },
    mid(cam) {
      for (let wx = cam - 2; wx < cam + W + 2; wx++) {
        const gy = Math.round(terrain(wx));
        rect(wx, gy, 1, H - gy, '#f4c430');
        rect(wx, gy, 1, 2, '#fff3b0');
        rect(wx, gy + 2, 1, 4, '#ffe066');
      }
      for (let k = Math.floor(cam / 34) - 1; k < (cam + W) / 34 + 1; k++) {
        const x = k * 34 + hash(k) * 20;
        blob(x, terrain(x) + 14 + hash(k + 1) * 26, 4 + hash(k + 2) * 6, 3 + hash(k + 2) * 4, '#d4a017');
        blob(x + 1, terrain(x) + 15 + hash(k + 1) * 26, 2 + hash(k + 2) * 4, 2 + hash(k + 2) * 2, '#b8841a');
      }
      mooredShip(terrain(20));
      const gg = terrain(290);
      rect(279, gg - 3, 22, 3, '#4a3020');
      rect(282, gg - 8, 5, 5, '#ff9f1c');
      rect(290, gg - 10, 6, 7, '#ffd166');
      blob(290, gg - 16, 13, 8, '#3a3a42');
      rect(277, gg - 23, 26, 3, '#55555f');
      blob(290, gg - 22, 11, 2, '#ffe066');
      for (let i = 0; i < 3; i++) blob(284 + i * 6, gg - 23 - Math.abs(Math.sin(G.t * 3 + i * 2)) * 3, 2, 2, '#fff3b0');
      rect(424, 184, 2, terrain(424) - 184, '#c8a46a');
      rect(474, 184, 2, terrain(474) - 184, '#c8a46a');
      rect(416, 184, 68, 6, '#e8c890');
      rect(416, 184, 68, 1, '#f6e0b0');
      for (let i = 0; i < 6; i++) rect(424 + i * 10, 186, 2, 2, '#b8935a');
      const qg = terrain(620);
      blob(620, qg - 8, 24, 9, '#e0a82a');
      rect(596, qg - 8, 48, 8, '#e0a82a');
      blob(620, qg - 10, 24, 8, '#ffe066');
      blob(612, qg - 10, 4, 2, '#d4a017');
      blob(630, qg - 8, 3, 2, '#d4a017');
      rect(640, qg - 40, 2, 32, '#8b5a2b');
      rect(642, qg - 40, 12, 8, '#8a5ac0');
      rect(646, qg - 38, 4, 4, '#f4c430');
      const vg = terrain(780);
      rect(772, vg - 30, 2, 30, '#6b4226');
      rect(790, vg - 30, 2, 30, '#6b4226');
      rect(770, vg - 31, 24, 2, '#6b4226');
      blob(778, vg - 28, 6, 3, '#2e7d32');
      blob(788, vg - 29, 5, 3, '#3f9a47');
      for (const [dx, dy] of [[0, 0], [3, 0], [-3, 0], [1, 3], [-2, 3], [0, 6]]) blob(781 + dx, vg - 22 + dy, 2, 2, '#7b3fa0');
      for (const x of [120, 240, 540, 700, 860]) {
        const gy = terrain(x);
        rect(x, gy - 12, 1, 12, '#c8a46a');
        rect(x - 3, gy - 18, 7, 7, hash(x) > 0.5 ? '#ffd23f' : '#fff3b0');
        rect(x - 1, gy - 16, 2, 2, '#d4a017');
      }
    },
    actors() {
      actor(330, terrain(330), player.x < 330 ? -1 : 1, () => mouseSprite({ chef: true, talking: line && line.who === 'gary' }));
      actor(620, terrain(620) - 18, player.x < 620 ? -1 : 1, () => mouseSprite({ talking: line && line.who === 'queen' }));
    },
    front() {},
    light(cam) {
      ctx.globalCompositeOperation = 'lighter';
      glow(290 - cam, terrain(290) - 8, 36 + Math.sin(G.t * 12) * 3, 'rgba(255,150,60,0.35)');
      ctx.globalCompositeOperation = 'source-over';
    },
  };
})();
