const AREAS = {};

function parrotHint() {
  const f = S.flags;
  if (!f.bottle) return 'Squawk! Bottle on the beach! Read it! Read it!';
  if (!f.emerald) return 'Coconut! Shake the palm! Smash it on the rock! Rawk!';
  if (!f.monkeyPaid) return 'Monkey has a fancy hat! Monkey wants a banana! Squawk!';
  if (!f.duelWon) return 'Spooky captain on the ship wants his hat! Rawk! Spooky!';
  if (!has('lantern') && !f.sapphire) return 'Betty sells a lantern! Four doubloons! Shiny coins everywhere!';
  if (!f.sapphire) return 'Blue stone in the dark cave! Behind the falling water!';
  if (!f.gemsPlaced) return 'Feed the Tiki! Feed the Tiki! Squawk!';
  return 'Treasure! Treasure! Mango gets a cut! Rawk!';
}

AREAS.beach = (() => {
  const SEA = 224;
  const WEND = 236;
  const PLX = 264;
  const terrain = x => 212 + (Math.sin(x * 0.011) * 3 + Math.sin(x * 0.029 + 1) * 1.5) * smooth(320, 480, x) + (1 - smooth(206, 350, x)) * 20;
  const floor = x => (x < WEND ? terrain(x) + (WEND - x) * 0.3 : terrain(x));
  const crab = { x: 620, y: 0, dir: 1, flipped: 0 };
  const shellLines = ['I can hear the ocean. Which is also right there.', 'Now I hear faint steel drums. And someone ordering a drink.', 'It says: "Remember to save your game." Weird shell.'];

  function sail(x, y, w, h, ph) {
    for (let i = 0; i < h; i++) {
      const f = i / h;
      const flap = Math.sin(G.t * 2 + i * 0.15 + ph) * 3 * f;
      const ww = w - f * w * 0.25;
      if ((i > h * 0.35 && i < h * 0.47) || (i > h * 0.7 && i < h * 0.76)) {
        rect(x + flap, y + i, ww * 0.35, 1, '#b9c9bd');
        rect(x + flap + ww * 0.6, y + i, ww * 0.4, 1, '#cfdccf');
      } else rect(x + flap, y + i, ww, 1, i % 8 === 0 ? '#a9bbb0' : '#cfdccf');
    }
    for (let k = 0; k < 5; k++) rect(x + k * (w / 5) + Math.sin(G.t * 2 + ph + k) * 2, y + h, 3, 3 + (k % 3) * 2, '#b9c9bd');
  }

  function drawShip() {
    for (let y = 0; y < 34; y++) {
      const l = 40 + y * 0.9;
      const r = 214 - y * 0.6;
      rect(l, 204 + y, r - l, 1, y % 5 === 0 ? '#2a1a12' : '#4a3020');
      if (y % 5 === 2) dither(l, 204 + y, r - l, 1, '#3a2418');
    }
    seg(208, 205, 244, 188, '#3a2618', 2);
    rect(38, 176, 48, 28, '#4a3020');
    rect(36, 174, 52, 3, '#5c3e2a');
    for (let x = 40; x < 86; x += 6) rect(x, 177, 1, 27, '#3a2418');
    const fl = Math.sin(G.t * 9) > 0.2 ? '#7dffcf' : '#5fe0b2';
    rect(46, 184, 10, 9, '#1a1010');
    rect(47, 185, 8, 7, fl);
    rect(64, 184, 10, 9, '#1a1010');
    rect(65, 185, 8, 7, fl);
    rect(51, 185, 1, 7, '#1a1010');
    rect(69, 185, 1, 7, '#1a1010');
    for (let x = 90; x < 206; x += 8) rect(x, 196, 1, 8, '#5c3e2a');
    rect(88, 195, 120, 1, '#6b4a32');
    rect(40, 204, 170, 2, '#6b4a32');
    for (let x = 46; x < 206; x += 12) rect(x, 204, 1, 2, '#4a3020');
    rect(185, 190, 2, 14, '#3a2618');
    blob(186, 190, 6, 6, '#8b5a2b');
    blob(186, 190, 4, 4, '#4a3020');
    for (let i = 0; i < 4; i++) seg(186 - Math.cos(i * 0.785 + G.t * 0.3) * 8, 190 - Math.sin(i * 0.785 + G.t * 0.3) * 8, 186 + Math.cos(i * 0.785 + G.t * 0.3) * 8, 190 + Math.sin(i * 0.785 + G.t * 0.3) * 8, '#a8703a');
    rect(111, 200, 18, 4, '#140c0c');
    rect(110, 199, 20, 1, '#8a6a4a');
    rect(128, 196, 2, 4, '#8a6a4a');
    for (const [mx, top] of [[104, 96], [166, 70]]) {
      for (let y = top; y < 204; y++) rect(mx - (204 - y) * 0.03, y, 3, 1, '#3a2618');
      rect(mx - 24, top + 12, 48, 2, '#3a2618');
      seg(mx, top, mx - 40, 198, '#2a1a12');
      seg(mx, top, mx + 36, 198, '#2a1a12');
    }
    sail(82, 110, 44, 50, 0);
    sail(144, 84, 46, 62, 2);
    for (let i = 0; i < 16; i++) {
      const fy = 62 + Math.sin(G.t * 6 + i * 0.5) * (i / 16) * 2.5;
      rect(168 + i, fy, 1, 9, '#15101c');
      if (i > 4 && i < 11) rect(168 + i, fy + 2 + (i % 2), 1, 3, '#e8e8e8');
      if (i === 6 || i === 9) rect(168 + i, fy + 3, 1, 1, '#15101c');
    }
    rect(43, 160, 2, 16, '#3a2618');
    rect(40, 166, 8, 8, '#2a3a34');
    rect(42, 168, 4, 4, '#9dffe0');
    seg(198, 204, PLX, terrain(PLX), '#7a5236', 2);
    for (let x = 204; x < PLX; x += 7) rect(x, lerp(204, terrain(PLX), (x - 198) / (PLX - 198)) + 2, 1, 2, '#4a3020');
  }

  return {
    name: 'Castaway Cove', w: 1150, music: 'beach', checkpoint: 330, sea: SEA, dust: '#f0d28c',
    terrain,
    ground: x => (x < WEND ? null : terrain(x)),
    platforms: [{ x1: 44, x2: 206, y: 204 }, { x1: 198, x2: PLX, y: 204, y2: terrain(PLX) }],
    coins: [[84, 186], [640, 168], [1010, 166]],
    exitR: { to: 'jungle', x: 30 },
    anchors: { crab: () => [crab.x, crab.y - 20] },
    enter() {
      crab.x = 620;
      crab.flipped = 0;
    },
    update(playing) {
      const p = player;
      const f = S.flags;
      if (crab.flipped > 0) crab.flipped -= DT;
      else {
        crab.x += crab.dir * 0.55;
        if (crab.x > 790) crab.dir = -1;
        if (crab.x < 520) crab.dir = 1;
      }
      crab.y = terrain(crab.x);
      if (playing) {
        const dx = p.x - crab.x;
        const dy = p.y - crab.y;
        if (Math.abs(dx) < 12 && dy > -15 && dy < 4) {
          if (p.vy > 0.5 && dy < -3 && crab.flipped <= 0) {
            crab.flipped = 3;
            p.vy = -5.6;
            p.onGround = false;
            sfx.stomp();
            sparkle(crab.x, crab.y - 10, '#ffe66d');
            f.stomps = (f.stomps || 0) + 1;
            if (f.stomps === 1) say(['crab', 'CLACK?!'], ['me', 'Sorry, little guy.']);
            if (f.stomps === 3 && !f.crabFriend) {
              f.crabFriend = true;
              egg('crab');
              say(['crab', 'Clack. Clack clack. (Fine. Truce.)'], ['me', "He's put on a little coconut helmet. I think we're friends now."]);
            }
          } else if (crab.flipped <= 0 && p.hurt <= 0 && !f.crabFriend) {
            p.vx = Math.sign(dx || 1) * 3.6;
            p.vy = -3.6;
            p.onGround = false;
            p.hurt = 1;
            G.shake = 4;
            sfx.hurt();
            quip(pick(['Ow! Pinchy!', 'Yeowch!', 'Rude!', 'My toe!']));
          }
        }
        if (G.idle > 14 && !p.sit && p.onGround && p.x > 270) {
          p.sit = true;
          egg('sunset');
          say(['me', 'You know, for a shipwreck, this is a really nice sunset.']);
        }
      }
      const cx = G.camX + W / 2;
      if (cx < 520 && Math.random() < 0.04) emit({ x: rnd(244, 290), y: SEA - 1, vx: rnd(-0.3, 0.3), vy: rnd(-1.3, -0.4), g: 0.05, life: 0.6, color: '#ffffff' });
      if (Math.random() < 0.5) emit({ x: 372 + rnd(-2, 2), y: terrain(372) - 6, vx: rnd(-0.2, 0.2), vy: rnd(-0.8, -0.3), life: rnd(0.3, 0.7), color: pick(['#ffd166', '#ff9f1c', '#ff6b35']), glow: true });
      if (Math.random() < 0.06) emit({ x: 44 + rnd(-2, 2), y: 166, vx: rnd(-0.2, 0.2), vy: rnd(-0.4, -0.1), life: 1, color: '#9dffe0', glow: true });
      if (AC && cx < 600 && Math.random() < 0.003) noise(1.6, 0.05, 500);
    },
    things: [
      {
        x: 186, y: 204, hy: 22, r: 14, name: "the ship's wheel", def: 'use',
        label: () => 'Take the wheel and set sail',
        look: "The ship's wheel. It has a cup holder. Captain Mildew thought of everything.",
        use() {
          if (!S.flags.ghostMet) return say(['me', "I can't just sail off in someone else's haunted ship."], ['me', 'I should at least meet whoever is glowing below deck.']);
          sfx.door();
          travel('sea', 250, 150);
        },
      },
      {
        x: 120, y: 204, hy: 14, name: 'the hatch', def: 'use',
        label: () => 'Climb down into the ship',
        look: 'A hatch into the hold. Cold green light leaks out, along with a smell of old socks.',
        use() {
          sfx.door();
          travel('ship', 70);
        },
      },
      {
        x: 300, hy: 10, name: 'the message in a bottle', def: 'pick', hidden: () => S.flags.bottle,
        look: 'A bottle with a rolled-up note inside. Classic.',
        pick() {
          S.flags.bottle = true;
          give('bottle');
          note('The message says the old Tiki in the ruins guards a treasure and hungers for three stones.');
          say(
            ['me', 'A message in a bottle!'],
            ['note', '"To whoever finds this: the old Tiki past the jungle guards the treasure of Captain Mildew."'],
            ['note', '"It hungers for three stones. Good luck. Signed, a very sunburnt sailor."'],
            ['me', 'Treasure? I accept.'],
          );
        },
      },
      {
        x: 352, hy: 16, name: 'my crate', def: 'look',
        look: () => say(['me', 'Everything I own: one crate. Contents: sand. I am a pirate of modest means.']),
      },
      {
        x: 430, hy: 12, name: 'the spiral shell', def: 'use',
        label: () => 'Listen to the spiral shell',
        look: 'A big pink spiral shell. Somebody used to live here. Nice place.',
        pick: () => say(['me', "It's stuck in the sand like it pays rent."]),
        use() {
          const n = (S.flags.shellN = (S.flags.shellN || 0) + 1);
          say(['me', shellLines[Math.min(n, 3) - 1]]);
          if (n === 3) egg('shell');
        },
      },
      {
        get x() {
          return crab.x;
        },
        hy: 20, name: 'the crab', def: 'talk',
        look: () => say(['me', S.flags.crabFriend ? 'Sheldon. My small armoured friend.' : 'A crab with strong opinions about personal space.']),
        talk: () => say(['crab', S.flags.crabFriend ? 'Clack clack. (Nice bandana.)' : 'CLACK! CLACK! (Get off my beach!)']),
        pick: () => say(['me', 'I like my fingers attached.']),
      },
      {
        x: 870, hy: 10, name: 'the X', def: 'use', hidden: () => !S.flags.map || S.flags.dug,
        label: () => 'Dig at the X',
        look: 'A faded red X in the sand, right where the map said. Subtle.',
        use() {
          if (!has('shovel')) return say(['me', 'X marks the spot. My fingernails mark their objection. I need a shovel.']);
          S.flags.dug = true;
          sfx.dig();
          G.shake = 3;
          burst(26, () => ({ x: 870 + rnd(-6, 6), y: terrain(870), vx: rnd(-1.6, 1.6), vy: rnd(-3.4, -1), g: 0.16, life: rnd(0.5, 1), color: pick(['#f0d28c', '#d9b061', '#b88f45']), size: 2 }));
          talk([['me', 'Dig, dig, dig...'], ['me', "A rubber duck. In an eyepatch. Captain Mildew buried a rubber duck."], ['me', "I'm keeping him. His name is Sir Quacksalot."]], () => {
            give('duck');
            egg('duck');
          });
        },
      },
      {
        x: 1090, hy: 30, name: 'the signpost', def: 'look',
        look: () => say(['me', '"JUNGLE: this way. TAVERN: this way. HAUNTED SHIP: behind you. Have a nice day."']),
      },
    ],
    back(cam) {
      ctx.drawImage(SKY.sunset, 0, 0);
      drawStars(50, 70);
      drawSun(cam, 310, 160, 38);
      drawClouds(cam, ['#9e4a74', '#c9637a', '#f19b8f', '#f6b39c'], 7, 78);
      drawSeaBand(cam, 182, '#2c3e78', '#36508f', 310, '#ffd98a', '#ff9e6b');
      drawVolcano(cam, 700, 188, 108, '#3d2350');
      drawHillLayer(cam, 0.25, 420, 600, 188, 22, '#4a2b5f', '#5d3a70', 0);
      drawHillLayer(cam, 0.45, 540, 700, 195, 32, '#2b2a4c', null, 2);
      drawPalmRow(cam, 0.6, 380, 210, '#1f2340');
    },
    mid(cam) {
      drawPalm(400, terrain(400), 80, -1, 0, 2, 1.1);
      drawPalm(770, terrain(770), 72, 1, 0, 0, 2.3);
      drawPalm(960, terrain(960), 86, -1, 0, 3, 3.7);
      for (let wx = cam - 2; wx < cam + W + 2; wx++) {
        const gy = Math.round(floor(wx));
        groundCol(wx, gy, gy > SEA ? 'wet' : 'sand');
      }
      drawShip();
      const f = S.flags;
      crate(342, terrain(352), 20, 16);
      const fy = terrain(372);
      rect(366, fy - 3, 12, 3, '#4a3020');
      seg(366, fy - 1, 378, fy - 5, '#5c3e2a', 2);
      seg(378, fy - 1, 366, fy - 5, '#5c3e2a', 2);
      rect(369, fy - 9 - (Math.sin(G.t * 18) > 0 ? 1 : 0), 6, 6, '#ff9f1c');
      rect(370, fy - 11, 4, 5, '#ffd166');
      if (!f.bottle) {
        const y = terrain(300) - 4 + Math.sin(G.t * 2) * 0.6;
        rect(295, y, 9, 4, '#7cc8a0');
        rect(295, y, 9, 1, '#b5e8cf');
        rect(304, y + 1, 3, 2, '#7cc8a0');
        rect(307, y + 1, 1, 2, '#a0522d');
        rect(297, y + 1, 4, 2, '#f5deb3');
      }
      const sy = terrain(430);
      blob(430, sy - 4, 8, 4, '#f4a6b8');
      blob(428, sy - 5, 5, 3, '#f9c4d0');
      for (const k of [-5, -2, 1, 4]) rect(430 + k, sy - 7, 1, 5, '#d97a92');
      rect(437, sy - 5, 3, 3, '#f7c6d2');
      const xy = terrain(870);
      if (f.dug) {
        blob(870, xy + 1, 9, 3, '#8a6e3c');
        blob(884, xy - 2, 7, 3, '#e6c070');
      } else if (f.map) {
        seg(864, xy + 1, 876, xy + 5, '#d62839', 2);
        seg(876, xy + 1, 864, xy + 5, '#d62839', 2);
      }
      signpost(1090, terrain(1090), [[1, '#a0703a'], [1, '#8b5a2b'], [-1, '#6b6b8a']]);
      for (const [x, c] of [[560, '#ff8a5c'], [700, '#ffb3c6'], [930, '#ff8a5c']]) {
        const gy = terrain(x);
        rect(x - 2, gy - 1, 5, 1, c);
        rect(x, gy - 3, 1, 5, c);
      }
    },
    actors() {
      actor(crab.x, crab.y, 1, () => crabSprite(crab.flipped > 0, S.flags.crabFriend));
      if (crab.flipped > 0) {
        for (let i = 0; i < 3; i++) {
          const a = G.t * 5 + i * 2.09;
          rect(crab.x + Math.cos(a) * 8, crab.y - 16 + Math.sin(a) * 2, 2, 2, '#ffe66d');
        }
      }
    },
    front(cam) {
      drawWaterFront(cam, SEA, 360, floor);
    },
    light(cam) {
      ctx.globalCompositeOperation = 'lighter';
      glow(372 - cam, terrain(372) - 8, 40 + Math.sin(G.t * 12) * 3, 'rgba(255,150,60,0.35)');
      glow(44 - cam, 170, 34, 'rgba(120,255,200,0.35)');
      glow(60 - cam, 190, 40, 'rgba(120,255,200,0.15)');
      ctx.globalCompositeOperation = 'source-over';
    },
  };
})();

AREAS.ship = (() => {
  const FL = 222;
  const rat = { x: 380, dir: 1 };
  const DUEL = [
    {
      taunt: "Yer wit's as dull as a butter cutlass!",
      opts: [
        ["Then it matches your edge. You haven't had one since you died.", true, 'HRNGH. A fair hit.'],
        ['I know you are, but what am I?', false, 'A soggy landlubber, that be what.'],
        ['Look behind you! A two-headed parrot!', false, "...I be a GHOST, lad. There's nothin' behind me. I checked."],
      ],
    },
    {
      taunt: "I've sailed with barnacles braver than ye!",
      opts: [
        ['Well, I once saw a barnacle. So there.', false, 'That be the worst comeback in seven seas.'],
        ["At least the barnacles stuck around. Your crew didn't.", true, 'OOF. Right in the mutiny.'],
        ['Barnacles are actually very brave.', false, "Aye, they are. That's me point."],
      ],
    },
    {
      taunt: "Ye'll never find me treasure, ye bandana-wearin' bilge rat!",
      opts: [
        ['Please? Pretty please?', false, 'No.'],
        ['My bandana is very fashionable.', false, "It be a napkin on yer head, lad."],
        ["I already found your hat. The treasure can't be far behind.", true, 'ARRR. Ye have me there.'],
      ],
    },
  ];

  function duelRound(i) {
    if (i >= DUEL.length) {
      return talk(
        [
          ['ghost', "HAR HAR HAR! Two hundred years and that's the best duel I've had!"],
          ['ghost', 'Ye have a sharp tongue and ye return hats. Rare qualities in a pirate.'],
          ['ghost', 'Take this. The Heart of the Tide. The old Tiki wants it back. Lift me curse, lad.'],
        ],
        () => {
          S.flags.duelWon = true;
          give('ruby');
          sparkle(455, FL - 40, '#ff4d6d');
          note('Won the duel of wits. Captain Mildew gave me the red stone: the Heart of the Tide.');
        },
      );
    }
    const r = DUEL[i];
    talk([['ghost', r.taunt]], () =>
      ask(
        r.opts.map(o => ({
          text: o[0],
          fn: () => (o[1] ? talk([['me', o[0]], ['ghost', o[2]]], () => duelRound(i + 1)) : talk([['me', o[0]], ['ghost', o[2]], ['ghost', 'HAR! Try again, lad.']], () => duelRound(i))),
        })),
      ),
    );
  }

  function ghostTalk() {
    const f = S.flags;
    if (f.duelWon && crewCount() === 3 && !f.crewToast) {
      f.crewToast = true;
      return say(['ghost', 'A dancing skeleton, a penguin captain and a mouse who cooks. Finest crew the Biscuit ever had.'], ['ghost', 'Better than me old lot. They mutinied over a cheese shortage.'], ['me', 'That will not be a problem any more.']);
    }
    if (f.duelWon) return say(['ghost', f.gemsPlaced ? 'I feel lighter already, lad. Go and open that chest!' : 'The Tiki waits past the jungle. Mind the gate. It sticks.']);
    if (has('hat') || f.hatReturned) {
      if (has('hat')) {
        take('hat');
        f.hatReturned = true;
        sfx.magic();
        return talk(
          [
            ['me', 'I believe this belongs to you. It has been lightly chewed.'],
            ['ghost', 'ME HAT! Oh, me beautiful hat! A captain without a hat is just a damp man in a coat.'],
            ['ghost', "But I'll not hand me stone to just anyone. A duel of wits! I taunt, ye answer. Have at ye!"],
          ],
          () => duelRound(0),
        );
      }
      return talk([['ghost', 'Back for another round? Have at ye!']], () => duelRound(0));
    }
    f.ghostMet = true;
    sfx.wail();
    note('Captain Mildew, the ghost of the Soggy Biscuit, wants his hat back. A monkey in the jungle stole it.');
    say(
      ['ghost', 'WHOOOO BOARDS THE SOGGY BISCUIT?'],
      ['me', 'Pip. Shipwrecked. Mostly harmless. Are you a ghost?'],
      ['ghost', 'Captain Mildew McGraw, cursed to haunt this wreck till the Tiki has its three stones again.'],
      ['ghost', 'I hold the red one. But I cannot think straight! A thievin\' monkey made off with me HAT.'],
      ['ghost', 'Bring me hat, lad, and we shall talk about stones.'],
      ['ghost', 'And if ye fancy a voyage, take the wheel up top. The Biscuit still floats. Mostly. There be stranger isles out there.'],
    );
  }

  return {
    name: 'The Soggy Biscuit', w: 600, music: 'spooky', checkpoint: 70, hard: true, dust: '#8a6a4a', minX: 26, maxX: 578,
    terrain: () => FL,
    ground: () => FL,
    platforms: [{ x1: 163, x2: 197, y: 202 }, { x1: 291, x2: 339, y: 202 }, { x1: 306, x2: 324, y: 182 }],
    coins: [[315, 160]],
    anchors: { ghost: () => [455, FL - 74], rat: () => [rat.x, FL - 12], bones: () => [240, FL - 46] },
    enter() {
      rat.x = 380;
    },
    update() {
      rat.x += rat.dir * 0.8;
      if (rat.x > 430) rat.dir = -1;
      if (rat.x < 350) rat.dir = 1;
      if (Math.random() < 0.15) emit({ x: 455 + rnd(-8, 8), y: FL - rnd(8, 50), vx: rnd(-0.2, 0.2), vy: rnd(-0.5, -0.1), life: rnd(0.6, 1.2), color: '#9dffe0', glow: true });
      if (Math.random() < 0.02) emit({ x: rnd(G.camX, G.camX + W), y: rnd(60, 200), vx: rnd(-0.1, 0.1), vy: 0.05, life: 3, color: '#6a7a70' });
      if (AC && Math.random() < 0.002) noise(1.2, 0.05, 300);
    },
    things: [
      {
        x: 60, hy: 40, name: 'the ladder', def: 'use',
        label: () => 'Climb up to the deck',
        look: 'A ladder back up to fresh air and fewer ghosts.',
        use() {
          sfx.door();
          travel('beach', 120, 204);
        },
      },
      {
        x: 118, hy: 30, name: 'the shovel', def: 'pick', hidden: () => S.flags.shovel,
        look: 'A sturdy shovel. Every pirate ship has one. Treasure does not bury itself.',
        pick() {
          S.flags.shovel = true;
          give('shovel');
          say(['me', 'One shovel. For burying things. Or the opposite.']);
        },
      },
      {
        x: 240, hy: 34, name: 'the skeleton', def: 'talk',
        look: 'A skeleton holding five aces. He died as he lived: cheating.',
        talk: () => say(['me', 'Good hand?'], ['bones', '...'], ['me', "He's got a great poker face. Well. Poker skull."]),
        pick: () => say(['me', "He's all bones about it. No."]),
      },
      {
        x: 392, hy: 60, name: 'the treasure map', def: 'pick', hidden: () => S.flags.map,
        look: 'A map of the cove pinned to the wall with a fork. There is a big red X on the beach.',
        pick() {
          S.flags.map = true;
          give('map');
          note('The treasure map shows an X on the beach, between two palm trees east of the crab.');
          say(['me', 'A treasure map! X marks a spot on the beach, between two palms.'], ['me', "I'll need something to dig with."]);
        },
      },
      {
        get x() {
          return rat.x;
        },
        hy: 10, r: 14, name: 'the rat', def: 'talk',
        look: 'A rat in a tiny waistcoat. He looks like he knows things.',
        pick: () => say(['me', 'He has a waistcoat. He has dignity. I will not.']),
        talk() {
          const n = (S.flags.ratN = (S.flags.ratN || 0) + 1);
          sfx.squeak();
          if (n === 1) say(['rat', 'Squeak.'], ['me', 'Hello to you too.']);
          else if (n === 2) say(['rat', 'Squeak squeak.'], ['me', 'Is that so.']);
          else {
            say(['rat', 'Squeak squeak. Squeak. (The captain cheats at cards. And the skeleton lets him.)'], ['me', 'Reginald, you gossip.']);
            egg('rat');
          }
        },
      },
      { x: 455, hy: 70, r: 26, name: 'Captain Mildew', def: 'talk', look: 'A ghost pirate. Translucent, damp and deeply upset about something.', talk: ghostTalk, use: ghostTalk },
      {
        x: 515, hy: 22, name: 'the sea chest', def: 'look',
        look: () => say(['me', S.flags.duelWon ? 'Empty now, apart from a sock. One sock.' : "The captain's sea chest. Something inside glows red. He is watching me very closely."]),
        use: () => say(['ghost', S.flags.duelWon ? 'Take the sock, if ye like.' : "HANDS OFF ME CHEST."]),
      },
      {
        x: 562, hy: 24, name: 'the cannon', def: 'use',
        label: () => 'Fire the cannon',
        look: 'A cannon, still loaded after two hundred years. That seems safe.',
        use() {
          sfx.boom();
          G.shake = 14;
          burst(30, () => ({ x: 575, y: FL - 14, vx: rnd(-2.5, 0.5), vy: rnd(-1.5, 1), drag: 0.94, life: rnd(0.6, 1.4), color: pick(['#888', '#aaa', '#555']), size: 2 }));
          egg('cannon');
          say(['me', 'BOOM!'], ['ghost', 'NOT INDOORS, LAD!'], ['me', 'Somewhere, a seagull is very surprised.']);
        },
      },
    ],
    back() {
      rect(0, 0, W, H, '#1a100c');
    },
    mid() {
      for (let y = 34; y < FL; y += 12) {
        rect(0, y, 600, 12, (y / 12) % 2 < 1 ? '#4a3122' : '#42291c');
        rect(0, y, 600, 1, '#2e1c12');
        for (let x = (Math.floor(y / 12) % 2) * 45; x < 600; x += 90) rect(x, y, 1, 12, '#2e1c12');
      }
      for (let x = 0; x <= 600; x += 100) {
        rect(x - 5, 30, 10, FL - 30, '#33201a');
        rect(x - 5, 30, 2, FL - 30, '#4a3122');
      }
      rect(0, 0, 600, 34, '#140c08');
      rect(0, 30, 600, 6, '#33201a');
      for (const px of [140, 300, 500]) {
        blob(px, 110, 13, 13, '#8a6d2a');
        blob(px, 110, 11, 11, '#b08d3a');
        blob(px, 110, 9, 9, '#101e3c');
        rect(px - 8, 113 + Math.sin(G.t + px) * 1.5, 16, 6, '#1d3a6a');
        rect(px - 5, 113 + Math.sin(G.t + px) * 1.5, 6, 1, '#6fa0d8');
        rect(px + 3, 105, 3, 3, '#e8ecf5');
        rect(px - 5, 104, 1, 1, '#fff');
      }
      ctx.globalAlpha = 0.012;
      for (let i = 0; i < 26; i++) rect(46 + i * 0.4, 0, 28 - i * 0.2, FL, '#bfe9ff');
      ctx.globalAlpha = 1;
      rect(50, 0, 2, FL, '#6b4a32');
      rect(68, 0, 2, FL, '#6b4a32');
      for (let y = 12; y < FL; y += 12) rect(50, y, 20, 2, '#7a5a3a');
      rect(0, FL, 600, H - FL, '#5b3a26');
      rect(0, FL, 600, 2, '#7a5236');
      for (let x = 0; x < 600; x += 30) rect(x, FL + 2, 1, H, '#3e271b');
      for (let y = FL + 12; y < H; y += 12) rect(0, y, 600, 1, '#3e271b');
      if (!S.flags.shovel) {
        seg(112, FL, 124, FL - 34, '#8b5a2b', 2);
        rect(107, FL - 8, 8, 8, '#9aa0a6');
        rect(107, FL - 8, 2, 8, '#c8ccd0');
      }
      crate(165, FL, 32, 20);
      rect(222, FL - 16, 36, 3, '#6b4a32');
      rect(226, FL - 13, 3, 13, '#4a3020');
      rect(251, FL - 13, 3, 13, '#4a3020');
      actor(240, FL - 4, 1, () => skeletonSprite(true), 1);
      rect(230, FL - 18, 4, 2, '#f2f2f2');
      rect(236, FL - 18, 4, 2, '#f2f2f2');
      rect(246, FL - 19, 3, 3, '#d4a017');
      barrel(300, FL);
      barrel(330, FL);
      barrel(315, FL - 20);
      if (!S.flags.map) {
        rect(384, 150, 16, 12, '#e8d5a3');
        rect(384, 150, 16, 1, '#c4ad78');
        seg(387, 153, 393, 158, '#8a6e3c');
        rect(394, 156, 3, 3, '#d62839');
        rect(391, 148, 1, 5, '#c8ccd0');
      }
      actor(515, FL, 1, () => chestSprite(S.flags.duelWon ? 1 : 0));
      rect(540, FL - 16, 34, 10, '#2a2a30');
      rect(540, FL - 16, 34, 2, '#44444c');
      rect(572, FL - 18, 5, 14, '#1a1a20');
      rect(536, FL - 14, 5, 6, '#2a2a30');
      blob(552, FL - 4, 5, 5, '#5a3a1a');
      blob(552, FL - 4, 2, 2, '#2e1c12');
      rect(578, FL - 26, 22, 22, '#0c0a14');
      for (const lx of [210, 420]) {
        const sw = Math.sin(G.t * 1.4 + lx) * 4;
        seg(lx, 36, lx + sw, 66, '#2a2a30');
        rect(lx + sw - 4, 66, 8, 10, '#2a3a34');
        rect(lx + sw - 2, 68, 4, 6, Math.sin(G.t * 11 + lx) > 0 ? '#9dffe0' : '#6fe0c0');
      }
      seg(400, 60, 440, 60, '#5a5040');
      for (let i = 0; i <= 20; i++) rect(400 + i * 2, 60 + Math.sin((i / 20) * Math.PI) * 9, 2, 2, '#8a7a5a');
    },
    actors() {
      actor(rat.x, FL, rat.dir, ratSprite);
      const talking = line && line.who === 'ghost';
      actor(455, FL - 6 + Math.sin(G.t * 2) * 3, player.x < 455 ? -1 : 1, () => ghostSprite({ hat: S.flags.hatReturned, talking }), 0.82, '#0b3b34');
    },
    front() {},
    light(cam) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(50,80,95,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const lx of [210, 420]) glow(lx - cam + Math.sin(G.t * 1.4 + lx) * 4, 72, 60 + Math.sin(G.t * 9 + lx) * 3, 'rgba(110,255,190,0.4)');
      glow(455 - cam, FL - 34, 54, 'rgba(120,255,220,0.3)');
      for (const px of [140, 300, 500]) glow(px - cam, 110, 34, 'rgba(90,140,255,0.25)');
      glow(60 - cam, 60, 70, 'rgba(160,210,255,0.22)');
      if (!S.flags.duelWon) glow(515 - cam, FL - 12, 16, 'rgba(255,60,90,0.35)');
      ctx.globalCompositeOperation = 'source-over';
    },
  };
})();

AREAS.jungle = (() => {
  const BA = 1310;
  const BB = 1490;
  const terrain = x => 212 + Math.sin(x * 0.011) * 3 + Math.sin(x * 0.029 + 1) * 1.5;
  const onBridge = () => player.x > BA && player.x < BB;
  function bridgeY(x) {
    const t = (x - BA) / (BB - BA);
    let y = lerp(terrain(BA), terrain(BB), t) + Math.sin(Math.PI * t) * 8;
    if (onBridge()) y += Math.exp(-(((x - player.x) / 30) ** 2)) * 4 * Math.sin(Math.PI * t);
    return y;
  }
  const ground = x => (x > BA && x < BB ? bridgeY(x) : terrain(x));
  const monkey = { x: 1290, y: 0, leaving: false, delay: 0, lt: 0, gone: false };
  const palm = { shake: 0 };
  const ban = { shake: 0 };
  const leaf = { x: 760, squish: 0 };
  let flies = [];

  function shakeFx(x, y) {
    sfx.shake();
    G.shake = 2;
    burst(12, () => ({ x: x + rnd(-18, 18), y: y + rnd(-5, 5), vx: rnd(-0.4, 0.4), vy: rnd(0, 0.4), g: 0.01, life: rnd(2, 4), color: pick(['#2e7d32', '#4caf50']), size: 2, leaf: true }));
  }

  return {
    name: 'Mango Jungle', w: 1560, music: 'jungle', checkpoint: 40, dust: '#8a6a4a',
    terrain, ground,
    platforms: [{ x1: 700, x2: 818, y: 118 }],
    coins: [[728, 102], [792, 102], [760, 70], [1400, 176]],
    exitL: { to: 'beach', x: 1120 },
    exitR: { to: 'ruins', x: 30 },
    anchors: { parrot: () => [400, terrain(400) - 70], monkey: () => [monkey.x, monkey.y - 34] },
    enter() {
      const f = S.flags;
      monkey.x = 1290;
      monkey.y = terrain(1290) - 6;
      monkey.leaving = false;
      monkey.gone = !!f.monkeyPaid;
      if (f.monkeyPaid) f.monkeyGone = true;
      if (f.coconut === 'falling') {
        f.coconut = 'ground';
        f.coconutX = 222;
      }
      if (f.banana === 'falling') {
        f.banana = 'ground';
        f.bananaX = 948;
      }
      flies = Array.from({ length: 34 }, () => ({ x: rnd(0, 1560), y: rnd(70, 200), ph: rnd(0, 6.28) }));
    },
    block(p) {
      if (!S.flags.monkeyGone && p.x > 1272) {
        p.x = 1272;
        p.vx = Math.min(0, p.vx);
      }
    },
    onLand(p, onPlat) {
      if (!onPlat && Math.abs(p.x - leaf.x) < 14) {
        p.vy = -10.6;
        p.onGround = false;
        p.coyote = 0;
        p.spring = true;
        p.squash = -0.7;
        leaf.squish = 1;
        sfx.boing();
        burst(8, () => ({ x: leaf.x + rnd(-12, 12), y: p.y - 2, vx: rnd(-0.8, 0.8), vy: rnd(-1.5, -0.5), g: 0.08, life: rnd(0.4, 0.8), color: pick(['#81c784', '#43a047']), size: 1 }));
      }
    },
    update() {
      const f = S.flags;
      palm.shake = Math.max(0, palm.shake - DT * 1.5);
      ban.shake = Math.max(0, ban.shake - DT * 1.5);
      leaf.squish = Math.max(0, leaf.squish - DT * 3);
      if (monkey.leaving && !monkey.gone) {
        if (monkey.delay > 0) monkey.delay -= DT;
        else {
          f.monkeyGone = true;
          monkey.lt += DT;
          if (monkey.x < 1520) {
            monkey.x += 1.9;
            monkey.y = ground(monkey.x) - Math.abs(Math.sin(monkey.lt * 7)) * 18;
          } else monkey.gone = true;
        }
      }
      if (Math.random() < 0.07) emit({ x: G.camX + rnd(0, W), y: -4, vx: rnd(-0.2, 0.3), vy: rnd(0.3, 0.55), life: rnd(5, 8), color: pick(['#2e7d32', '#4caf50', '#8bc34a', '#c0ca33']), size: 2, leaf: true });
      if (Math.random() < 0.12) emit({ x: 648 + rnd(-2, 2), y: 108, vx: rnd(0.05, 0.3), vy: rnd(-0.5, -0.2), life: rnd(1.5, 3), color: pick(['#8a8a9a', '#6a6a7a']), size: 2 });
      if (AC && Math.random() < 0.004) sfx.chirp();
      for (const fl of flies) {
        fl.x += Math.sin(G.t * 0.7 + fl.ph) * 0.3;
        fl.y += Math.cos(G.t * 0.9 + fl.ph * 1.3) * 0.25;
      }
    },
    things: [
      { x: 50, hy: 30, name: 'the signpost', def: 'look', look: () => say(['me', '"BEACH: back that way. RUSTY ANCHOR TAVERN: ahead. ANCIENT RUINS: far ahead, past the monkey."']) },
      {
        x: 180, hy: 44, name: 'the palm tree', def: 'use',
        label: () => 'Shake the palm tree',
        look: 'A tall palm with a cluster of coconuts. They look loose. Ish.',
        pick: () => say(['me', "I can't pick up a tree. I checked."]),
        use() {
          const f = S.flags;
          palm.shake = 1;
          shakeFx(200, terrain(180) - 86);
          if (!f.coconut) {
            f.coconut = 'falling';
            fallers.push({ id: 'coconut', x: 200, y: terrain(180) - 80, vx: 0.9, vy: 0, done: x => { f.coconut = 'ground'; f.coconutX = Math.round(x); } });
            say(['me', 'Shake, shake, shake...']);
          } else say(['me', 'The other coconuts are holding on for dear life.']);
        },
      },
      {
        get x() {
          return S.flags.coconutX || 222;
        },
        hy: 10, name: 'the coconut', def: 'pick', hidden: () => S.flags.coconut !== 'ground',
        look: 'A coconut. It rattles. Coconuts are not supposed to rattle.',
        pick() {
          S.flags.coconut = 'taken';
          give('coconut');
          say(['me', 'One coconut, freshly harvested. Something rattles inside. Now to crack it...']);
        },
      },
      {
        x: 290, hy: 20, name: 'the flat rock', def: 'use',
        label: () => (has('coconut') ? 'Smash the coconut on the rock' : 'Look at the flat rock'),
        look: 'A flat, sturdy rock. Perfect for smashing things.',
        use() {
          if (has('coconut')) {
            take('coconut');
            S.flags.emerald = true;
            sfx.crack();
            G.shake = 6;
            const gy = terrain(290);
            burst(18, () => ({ x: 290, y: gy - 12, vx: rnd(-1.8, 1.8), vy: rnd(-3, -0.6), g: 0.16, life: rnd(0.5, 1), color: pick(['#f5f5f5', '#e8f4ff', '#5a3a1e']), size: 1 }));
            sparkle(290, gy - 14, '#2ecc71');
            talk([['me', 'HI-YAH!'], ['me', 'Coconut water... and an EMERALD? Nature is weird.']], () => {
              give('emerald');
              note('Found the green stone inside a coconut: the Jungle Eye.');
            });
          } else if (S.flags.emerald) say(['me', 'My trusty smashing rock. We had good times.']);
          else say(['me', 'A flat, sturdy rock. Perfect for smashing things. I have nothing to smash.']);
        },
      },
      {
        x: 400, hy: 66, name: 'the parrot', def: 'talk',
        look: 'A parrot who has clearly seen everything on this island and will tell anyone.',
        pick: () => say(['parrot', 'RAWK! Hands off the merchandise!']),
        talk() {
          sfx.squawk();
          say(['parrot', parrotHint()], ['parrot', pick(['Pretty bird! Pretty bird!', 'Mango wants a mango! Rawk!', 'Jump on the big leaf! Boing! Boing!', 'Press I for pockets! Press Escape to save! Squawk!', 'Betty waters down the root brew! Rawk!'])]);
        },
      },
      {
        x: 606, hy: 46, name: 'the tavern door', def: 'use',
        label: () => 'Enter the Rusty Anchor',
        look: 'The Rusty Anchor. A tavern in a tree. Warm light, loud singing, a strong smell of fried banana.',
        use() {
          sfx.door();
          travel('tavern', 60);
        },
      },
      {
        x: 760, hy: 14, r: 26, name: 'the springy leaf', def: 'look',
        look: () => say(['me', 'A big springy leaf. I bet I could bounce on this.']),
        pick: () => say(['me', "It's attached to the jungle."]),
      },
      {
        x: 960, hy: 44, name: 'the banana tree', def: 'use',
        label: () => 'Shake the banana tree',
        look: 'A banana tree with one perfectly ripe bunch.',
        use() {
          const f = S.flags;
          ban.shake = 1;
          shakeFx(960, terrain(960) - 60);
          if (!f.banana) {
            f.banana = 'falling';
            fallers.push({ id: 'banana', x: 964, y: terrain(960) - 46, vx: -0.6, vy: 0, done: x => { f.banana = 'ground'; f.bananaX = Math.round(x); } });
            say(['me', 'Banana incoming!']);
          } else say(['me', 'The rest are still green. Patience, bananas.']);
        },
      },
      {
        get x() {
          return S.flags.bananaX || 948;
        },
        hy: 10, name: 'the banana', def: 'pick', hidden: () => S.flags.banana !== 'ground',
        look: 'A perfect banana. Someone around here would love this.',
        pick() {
          S.flags.banana = 'taken';
          give('banana');
          say(['me', 'A perfect banana. Someone around here would love this.']);
        },
      },
      {
        x: 1105, hy: 40, name: 'the stone head', def: 'look',
        look: () => say(['me', 'A mossy stone head. It looks like it has seen things. Mostly tourists.']),
        talk: () => say(['me', 'Hello?'], ['me', 'Nothing. Not every statue on this island talks, apparently.']),
      },
      {
        get x() {
          return monkey.x;
        },
        hy: 38, name: 'the monkey', def: 'talk', hidden: () => monkey.leaving || monkey.gone,
        label: () => (has('banana') ? 'Give the banana to the monkey' : 'Talk to the monkey'),
        look: "A monkey sitting in front of the bridge, wearing a captain's hat three sizes too big.",
        pick: () => say(['monkey', 'OOK!'], ['me', 'He bites. Noted.']),
        talk() {
          sfx.monkey();
          if (has('banana')) {
            take('banana');
            S.flags.monkeyPaid = true;
            monkey.leaving = true;
            monkey.delay = 5;
            talk([['monkey', 'OOK! OOK OOK!'], ['monkey', '*nom nom nom*'], ['monkey', 'Ook. (A fair trade. Take the smelly hat. The bridge is yours.)']], () => {
              give('hat');
              note("Traded a banana for the captain's hat. The bridge to the ruins is open.");
            });
          } else say(['monkey', 'Ook ook! (No banana, no bridge. No banana, no hat.)'], ['me', 'Seems fair.']);
        },
        use() {
          this.talk();
        },
      },
    ],
    back(cam) {
      ctx.drawImage(SKY.dusk, 0, 0);
      drawStars(70, 100);
      drawSun(cam, 240, 186, 34);
      drawClouds(cam, ['#7a3a6a', '#a8507a', '#d98090', '#e8a0a0'], 5, 70);
      drawVolcano(cam, 420, 200, 120, '#33204a');
      drawHillLayer(cam, 0.25, -200, -100, 196, 26, '#3f2656', '#52346a', 1);
      drawHillLayer(cam, 0.45, -200, -100, 204, 34, '#262446', null, 3);
      drawPalmRow(cam, 0.6, -100, 214, '#1c1f3a');
      drawBushWall(cam, 0.8, -200, -100, 5000, 5100, 214, 52, '#16382c', '#1f4a39');
      drawTrunks(cam, 0.8, 0, 1250, '#13302a', '#1b3d34', '#123026');
    },
    mid(cam) {
      const f = S.flags;
      const bt = terrain(826);
      rect(819, 0, 15, bt, '#4a3222');
      rect(819, 0, 3, bt, '#5c4030');
      dither(829, 0, 5, bt, '#3a2618');
      for (let y = 4; y < bt; y += 8) rect(823 + (y % 16 ? 2 : 6), y, 1, 5, '#3a2618');
      rect(812, bt - 4, 8, 4, '#4a3222');
      rect(833, bt - 4, 9, 4, '#4a3222');
      rect(698, 118, 122, 5, '#5a3d28');
      rect(698, 118, 122, 1, '#6e4c33');
      blob(708, 114, 10, 4, '#2e6b3a');
      blob(742, 113, 7, 3, '#357a42');
      blob(796, 114, 9, 4, '#2e6b3a');
      rect(722, 121, 1, 22, '#2d5a27');
      rect(804, 121, 1, 32, '#2d5a27');

      rect(640, 96, 8, 24, '#5a4a40');
      rect(639, 94, 10, 3, '#6a5a50');
      for (let i = 0; i < 28; i++) {
        const w = 8 + i * 2;
        rect(606 - w, 110 + i, w * 2, 1, i % 3 ? '#b8923a' : '#9a7a2e');
      }
      rect(566, 138, 82, 74, '#6b4a32');
      for (let x = 566; x < 648; x += 9) rect(x, 138, 1, 74, '#4a3020');
      rect(566, 138, 82, 2, '#8a6a4a');
      rect(594, 166, 24, 46, '#3a2418');
      rect(596, 168, 20, 44, '#ffb347');
      rect(596, 168, 20, 44, Math.sin(G.t * 7) > 0 ? 'rgba(255,220,120,0.25)' : 'rgba(255,160,60,0.1)');
      rect(605, 168, 1, 44, '#c47a2a');
      rect(613, 190, 2, 2, '#3a2418');
      rect(626, 156, 14, 12, '#3a2418');
      rect(627, 157, 12, 10, '#ffcf70');
      rect(632, 157, 1, 10, '#3a2418');
      rect(627, 161, 12, 1, '#3a2418');
      rect(572, 150, 14, 2, '#4a3020');
      const sw = Math.sin(G.t * 1.6) * 1.5;
      seg(575, 152, 575 + sw, 158, '#2a2a30');
      seg(583, 152, 583 + sw, 158, '#2a2a30');
      rect(571 + sw, 158, 16, 12, '#8b5a2b');
      rect(571 + sw, 158, 16, 1, '#a8703a');
      rect(578 + sw, 160, 2, 7, '#c8ccd0');
      rect(575 + sw, 166, 8, 2, '#c8ccd0');
      rect(576 + sw, 161, 6, 1, '#c8ccd0');

      const [ptx, pty] = drawPalm(180, terrain(180), 92, 1, palm.shake, f.coconut ? 2 : 3, 0.4);
      void ptx;
      void pty;
      drawBananaTree(960, terrain(960), ban.shake, !f.banana);
      const py = terrain(400);
      rect(399, py - 44, 2, 44, '#6b4226');
      rect(390, py - 45, 20, 2, '#7a4f2e');
      const hy = terrain(1105);
      blob(1105, hy - 16, 14, 17, '#6a6f66');
      blob(1103, hy - 18, 11, 13, '#7d8378');
      rect(1097, hy - 24, 5, 3, '#3a3d38');
      rect(1107, hy - 24, 5, 3, '#3a3d38');
      rect(1103, hy - 19, 3, 6, '#5a5f56');
      rect(1099, hy - 10, 12, 2, '#3a3d38');
      dither(1094, hy - 32, 14, 6, '#3f7a3a');
      drawFlora(cam, terrain, 20, 1540, [[150, 320], [380, 420], [560, 660], [735, 790], [BA - 30, BB + 14], [1085, 1125]]);
      for (let wx = cam - 2; wx < cam + W + 2; wx++) {
        if (wx > BA && wx < BB) {
          rect(wx, 214, 1, H - 214, '#140d1f');
          rect(wx, 258 + Math.sin(wx * 0.1 + G.t) * 1, 1, 12, '#1d3557');
          continue;
        }
        groundCol(wx, Math.round(terrain(wx)), 'jungle');
      }
      const ya = terrain(BA);
      const yb = terrain(BB);
      rect(BA - 3, ya - 20, 4, 22, '#5a3a1a');
      rect(BB - 1, yb - 20, 4, 22, '#5a3a1a');
      for (let x = BA; x <= BB; x++) {
        const y = bridgeY(x);
        rect(x, y - 16 + Math.sin((Math.PI * (x - BA)) / (BB - BA)) * 3, 1, 1, '#c8a46a');
        rect(x, y + 3, 1, 1, '#7a6040');
        if ((x - BA) % 15 === 0) rect(x, y - 15, 1, 15, '#a88452');
      }
      for (let x = BA + 1; x < BB; x += 6) {
        const y = bridgeY(x + 2);
        rect(x, y, 5, 3, '#8a5a35');
        rect(x, y, 5, 1, '#a8703a');
        rect(x, y + 3, 5, 1, '#5a3a1a');
      }
      const ry = terrain(290);
      blob(290, ry - 5, 13, 6, '#6e6e6e');
      blob(288, ry - 7, 10, 3, '#8a8a8a');
      rect(280, ry - 11, 20, 1, '#a5a5a5');
      rect(285, ry - 7, 1, 4, '#555');
      const ly = terrain(leaf.x);
      rect(leaf.x - 1, ly - 5, 3, 5, '#2e7d32');
      const sq = Math.sin(leaf.squish * Math.PI * 3) * leaf.squish * 3;
      for (let k = -15; k <= 15; k++) {
        const y = ly - 6 + sq - (Math.abs(k) / 15) ** 2 * (4 - sq);
        rect(leaf.x + k, y, 1, 3, '#43a047');
        if (Math.abs(k) < 13) rect(leaf.x + k, y, 1, 1, '#81c784');
        if (k % 5 === 0) rect(leaf.x + k, y + 1, 1, 2, '#2e7d32');
      }
      signpost(50, terrain(50), [[-1, '#a0703a'], [1, '#8b5a2b'], [1, '#6b8a6b']]);
      if (f.coconut === 'ground') icon('coconut', (f.coconutX || 222) - 6, terrain(f.coconutX || 222) - 11);
      if (f.banana === 'ground') icon('banana', (f.bananaX || 948) - 6, terrain(f.bananaX || 948) - 11);
      blob(1290, terrain(1290) - 3, 9, 4, '#6d6d6d');
      rect(1283, terrain(1290) - 7, 11, 1, '#8a8a8a');
    },
    actors() {
      const py = terrain(400) - 45 + Math.round(Math.sin(G.t * 3) * 0.6);
      actor(400, py, player.x < 400 ? -1 : 1, () => parrotSprite(line && line.who === 'parrot'));
      if (!monkey.gone) {
        const hop = monkey.leaving && monkey.delay <= 0;
        actor(monkey.x, monkey.y, hop ? 1 : player.x < monkey.x ? -1 : 1, () => monkeySprite({ hat: !S.flags.monkeyPaid, talking: line && line.who === 'monkey', leaving: hop }));
      }
    },
    front(cam) {
      drawCanopy(cam, -100, 1700, [[560, 660]]);
    },
    light(cam) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(110,165,135,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,236,170,0.05)';
      for (let i = 0; i < 6; i++) {
        const x0 = ((((i * 97 + 40 - cam * 0.9) % (W + 200)) + W + 200) % (W + 200)) - 100;
        const wob = Math.sin(G.t * 0.6 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(x0 + wob, 0);
        ctx.lineTo(x0 + 18 + wob, 0);
        ctx.lineTo(x0 + 92, H);
        ctx.lineTo(x0 + 52, H);
        ctx.fill();
      }
      glow(606 - cam, 190, 46, 'rgba(255,170,70,0.4)');
      glow(633 - cam, 162, 26, 'rgba(255,200,100,0.35)');
      for (const fl of flies) {
        const a = (Math.sin(G.t * 3 + fl.ph) + 1) / 2;
        const sx = fl.x - cam;
        if (a < 0.2 || sx < -4 || sx > W + 4) continue;
        ctx.fillStyle = `rgba(220,255,120,${a * 0.3})`;
        ctx.fillRect(Math.round(sx) - 1, Math.round(fl.y) - 1, 3, 3);
        ctx.fillStyle = `rgba(240,255,170,${a})`;
        ctx.fillRect(Math.round(sx), Math.round(fl.y), 1, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
      drawForeFerns(cam, 0, 1260, '#0a1f17');
    },
  };
})();

AREAS.tavern = (() => {
  const FL = 226;
  const DARTS = ['The dart hits the wall. The wall had it coming.', 'The dart lands in a pirate\'s drink. He drinks around it.', 'The dart hits the wanted poster. Right in my nose.', 'So close! It bounced off the board and into the fire.'];
  const HINTS = [
    [['p1', "Duelling old Mildew, are ye? He's touchy about bein' dead. Aim there."], ['p2', "And his crew left him. Every last one. Don't let him forget it."]],
    [['p3', 'In my day we walked to the treasure. Uphill. Both ways.'], ['p1', 'Nobody asked, Mortimer.']],
    [['p2', "There be doubloons all over this island. On the wreck, up the big tree, even above the bridge."], ['p3', 'I dropped one off that chandelier once. Never saw it again.']],
    [['p1', 'We be very unimportant pirates.'], ['p2', 'Extremely.'], ['p3', 'Nobody has ever asked us about anything.']],
  ];

  function bettyTalk() {
    const f = S.flags;
    if (has('lantern') || f.sapphire) return say(['betty', pick(["How's that lantern treating you, love? Mind the bats.", "If you see old Mildew, tell him his bar tab is two hundred years overdue.", 'Fried banana? No? Your loss, love.'])]);
    f.bettyMet = true;
    note('Betty at the Rusty Anchor sells a lantern for 4 doubloons.');
    talk([['betty', "Welcome to the Rusty Anchor, love. I'm Betty. I sell root brew, fried banana and one lantern."]], () =>
      ask([
        {
          text: 'I will take the lantern. (4 doubloons)',
          fn() {
            if (wallet() >= 4) {
              S.spent += 4;
              sfx.coin();
              talk([['betty', 'Pleasure doing business. It burns for hours and only smells a little of fish.']], () => give('lantern'));
            } else say(['betty', `That is ${4 - wallet()} doubloon${4 - wallet() === 1 ? '' : 's'} short, love. They are lying all over this island. Go and look up.`]);
          },
        },
        { text: 'What is the word around here?', fn: () => say(['betty', 'Word is the cave behind the waterfall is darker than a squid at midnight. Nobody goes in without a light.'], ['betty', 'And the monkey by the bridge has a new hat. Thinks he is a captain now.']) },
        { text: 'Just looking, thanks.', fn: () => say(['betty', 'Look all you like, love. Looking is free. Everything else is extra.']) },
      ]),
    );
  }

  return {
    name: 'The Rusty Anchor', w: 480, music: 'tavern', checkpoint: 60, hard: true, dust: '#8a6a4a', minX: 22, maxX: 468,
    terrain: () => FL,
    ground: () => FL,
    platforms: [{ x1: 158, x2: 204, y: 208 }],
    coins: [[240, 152]],
    anchors: { betty: () => [372, FL - 78], p1: () => [150, FL - 62], p2: () => [181, FL - 68], p3: () => [212, FL - 62] },
    update() {
      for (let i = 0; i < 2; i++) emit({ x: 250 + rnd(-10, 10), y: FL - 16, vx: rnd(-0.2, 0.2), vy: rnd(-1, -0.4), life: rnd(0.3, 0.7), color: pick(['#ffd166', '#ff9f1c', '#ff6b35']), glow: true });
    },
    things: [
      {
        x: 40, hy: 46, name: 'the door', def: 'use',
        label: () => 'Go back outside',
        look: 'The door back to the jungle.',
        use() {
          sfx.door();
          travel('jungle', 606);
        },
      },
      {
        x: 96, hy: 62, name: 'the dartboard', def: 'use',
        label: () => 'Throw a dart',
        look: 'A dartboard. Most of the darts are in the wall around it.',
        use() {
          const n = (S.flags.dartN = (S.flags.dartN || 0) + 1);
          sfx.thunk();
          if (n % 4 === 0) {
            egg('darts');
            sparkle(96, 150, '#ffe066');
            say(['me', 'BULLSEYE!'], ['p1', 'Beginner\'s luck.'], ['p3', 'In my day the bullseye was smaller.']);
          } else say(['me', DARTS[n % DARTS.length]]);
        },
      },
      {
        x: 181, hy: 60, r: 30, name: 'the three pirates', def: 'talk',
        look: 'Three pirates nursing mugs of root brew. They look suspiciously unimportant.',
        talk() {
          const n = (S.flags.pirateN = (S.flags.pirateN || 0) + 1);
          talk(HINTS[(n - 1) % HINTS.length]);
        },
      },
      {
        x: 286, hy: 66, name: 'the wanted poster', def: 'look',
        look() {
          egg('poster');
          say(['me', '"WANTED: for crashing a rowboat into the reef. Reward: one (1) banana."'], ['me', "That drawing looks nothing like me. My bandana is much nicer."]);
        },
      },
      { x: 372, hy: 70, r: 34, name: 'Betty', def: 'talk', look: 'Betty, owner of the Rusty Anchor. Hair like a sunset, arms like a ship\'s carpenter.', talk: bettyTalk, use: bettyTalk },
      {
        x: 456, hy: 40, name: 'the barrel organ', def: 'use',
        label: () => 'Crank the barrel organ',
        look: 'A barrel organ with a monkey-shaped handle. It controls the mood in here.',
        use() {
          S.flags.tune = ((S.flags.tune || 0) + 1) % TAVERN_TUNES.length;
          THEMES.tavern.mel = TAVERN_TUNES[S.flags.tune];
          step = 0;
          applyTrackFx();
          sfx.select();
          egg('organ');
          say(['me', pick(['A new tune! The pirates approve. Slightly.', 'Ooh, I like this one.', 'Catchy.'])]);
        },
      },
    ],
    enter() {
      THEMES.tavern.mel = TAVERN_TUNES[S.flags.tune || 0];
    },
    back() {
      rect(0, 0, W, H, '#2a1810');
    },
    mid() {
      for (let y = 30; y < FL; y += 14) {
        rect(0, y, W, 14, (y / 14) % 2 < 1 ? '#6b4630' : '#5f3d29');
        rect(0, y, W, 1, '#3e271b');
      }
      for (let x = 20; x < W; x += 115) {
        rect(x - 5, 26, 10, FL - 26, '#3e271b');
        rect(x - 5, 26, 2, FL - 26, '#523424');
      }
      rect(0, 0, W, 30, '#1a0e08');
      rect(0, 24, W, 7, '#3e271b');
      rect(26, 164, 30, 62, '#2a1810');
      rect(29, 167, 24, 59, '#3a2a5a');
      rect(29, 167, 24, 20, '#6a3a6a');
      blob(41, 167, 12, 6, '#2a1810');
      rect(50, 196, 2, 3, '#d4a017');
      blob(96, 150, 13, 13, '#2a1810');
      blob(96, 150, 11, 11, '#e8e2d0');
      blob(96, 150, 8, 8, '#c0392b');
      blob(96, 150, 5, 5, '#e8e2d0');
      blob(96, 150, 2, 2, '#c0392b');
      rect(80, 140, 3, 1, '#c8ccd0');
      rect(110, 163, 3, 1, '#c8ccd0');
      rect(222, 166, 58, 60, '#4a4a52');
      rect(218, 160, 66, 8, '#5a5a62');
      rect(230, 182, 42, 44, '#140c0c');
      for (let x = 222; x < 280; x += 10) rect(x, 168, 1, 14, '#3a3a42');
      rect(236, FL - 6, 30, 6, '#3a2418');
      rect(239, FL - 14, 8, 8, '#ff9f1c');
      rect(248, FL - 18, 8, 12, '#ffd166');
      rect(257, FL - 12, 7, 6, '#ff6b35');
      rect(276, 140, 22, 28, '#e8d5a3');
      rect(276, 140, 22, 1, '#c4ad78');
      rect(281, 145, 12, 3, '#3b2416');
      rect(283, 150, 8, 7, '#f2c488');
      rect(283, 149, 8, 2, '#d62839');
      rect(285, 153, 1, 1, '#111');
      rect(288, 153, 1, 1, '#111');
      rect(280, 160, 14, 1, '#3b2416');
      rect(280, 163, 10, 1, '#3b2416');
      rect(312, 120, 136, 3, '#3e271b');
      rect(312, 150, 136, 3, '#3e271b');
      for (let i = 0; i < 12; i++) {
        const c = ['#2ecc71', '#e67e22', '#3a86ff', '#c0392b', '#f4d35e', '#9b59b6'][i % 6];
        const bx = 318 + i * 11;
        const by = i % 2 ? 150 : 120;
        rect(bx, by - 12, 5, 12, c);
        rect(bx + 1, by - 16, 3, 4, c);
        rect(bx, by - 12, 1, 12, 'rgba(255,255,255,0.4)');
      }
      rect(239, 30, 2, 66, '#2a2a30');
      rect(214, 96, 52, 3, '#5a4a2a');
      for (const cx of [216, 232, 248, 262]) {
        rect(cx, 88, 3, 8, '#f2e8cf');
        rect(cx, 84 - (Math.sin(G.t * 15 + cx) > 0 ? 1 : 0), 3, 4, '#ffd166');
      }
      rect(0, FL, W, H - FL, '#6b4630');
      rect(0, FL, W, 2, '#8a6040');
      for (let x = 0; x < W; x += 34) rect(x, FL + 2, 1, H, '#4a2e1e');
      for (let y = FL + 12; y < H; y += 12) rect(0, y, W, 1, '#4a2e1e');
      rect(444, 196, 26, 30, '#7a4a22');
      rect(444, 196, 26, 2, '#a8703a');
      for (let i = 0; i < 5; i++) rect(448 + i * 4, 176 + (i % 2) * 4, 3, 20 - (i % 2) * 4, '#d4a017');
      const cr = G.t * 3;
      seg(470, 206, 470 + Math.cos(cr) * 5, 206 + Math.sin(cr) * 5, '#c8ccd0', 2);
    },
    actors() {
      actor(150, FL, 1, () => pirateSprite(0, line && line.who === 'p1'));
      actor(212, FL, -1, () => pirateSprite(2, line && line.who === 'p3'));
      actor(181, FL - 4, 1, () => pirateSprite(1, line && line.who === 'p2'));
      rect(156, 208, 50, 4, '#7a5236');
      rect(156, 208, 50, 1, '#9a6a46');
      rect(178, 212, 6, 14, '#5a3a24');
      rect(170, 224, 22, 2, '#5a3a24');
      rect(166, 202, 5, 6, '#b8b8b8');
      rect(190, 202, 5, 6, '#b8b8b8');
      actor(372, FL - 20, player.x < 372 ? -1 : 1, () => bettySprite(line && line.who === 'betty'));
      rect(306, 198, 142, 28, '#7a4a22');
      rect(304, 194, 146, 5, '#a8703a');
      rect(304, 194, 146, 1, '#c88a4a');
      for (let x = 312; x < 448; x += 16) rect(x, 199, 1, 27, '#5a3418');
      rect(330, 186, 6, 8, '#b8b8b8');
      rect(330, 185, 6, 1, '#fff8e0');
      rect(410, 188, 8, 6, '#2ecc71');
      rect(412, 184, 4, 4, '#2ecc71');
    },
    front() {},
    light() {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(190,130,90,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      glow(250, FL - 14, 90 + Math.sin(G.t * 11) * 5, 'rgba(255,140,50,0.4)');
      glow(240, 90, 70, 'rgba(255,210,110,0.35)');
      glow(41, 190, 30, 'rgba(160,110,200,0.2)');
      ctx.globalCompositeOperation = 'source-over';
    },
  };
})();

AREAS.ruins = (() => {
  const TIKI = 640;
  const GATE = 752;
  const CHEST = 1010;
  const TORCH = [820, 1100];
  const terrain = x => 212 + (Math.sin(x * 0.011) * 3 + Math.sin(x * 0.029 + 1) * 1.5) * (1 - smooth(360, 440, x)) - smooth(300, 440, x) * 8;
  let lift = 0;
  let open = 0;
  let delay = 0;

  function tikiTalk() {
    const f = S.flags;
    if (f.gemsPlaced) return say(['tiki', 'THE WAY IS OPEN, SMALL ONE.']);
    const n = ['ruby', 'emerald', 'sapphire'].filter(has).length;
    if (n === 3) {
      ['ruby', 'emerald', 'sapphire'].forEach(take);
      f.gemsPlaced = true;
      delay = 3.5;
      sfx.magic();
      const top = terrain(TIKI) - 64;
      sparkle(TIKI, top + 4, '#ff4d6d');
      sparkle(TIKI - 5, top + 15, '#2ecc71');
      sparkle(TIKI + 5, top + 15, '#3a86ff');
      note('The Tiki has its three stones. The temple gate is opening.');
      return say(['tiki', 'RED OF THE SEA. GREEN OF THE NUT. BLUE OF THE FALLS.'], ['tiki', 'THE OFFERING IS COMPLETE!'], ['me', 'Did that statue just talk? And why is the ground shaking?']);
    }
    if (!f.tikiMet) {
      f.tikiMet = true;
      note("The Tiki's riddle: red from the sea, green from a nut, blue from where water falls.");
      return say(
        ['tiki', 'WHO DARES WAKE THE TIKI?'],
        ['me', 'Uh. Pip. Hi.'],
        ['tiki', 'BRING ME THREE STONES: RED FROM THE SEA, GREEN FROM A NUT, BLUE FROM WHERE WATER FALLS.'],
        ['tiki', n ? `YOU CARRY ${n}. THE TIKI IS PATIENT. MOSTLY.` : 'THEN THE GATE SHALL OPEN, AND THE CAPTAIN SHALL REST.'],
      );
    }
    say(['tiki', `${3 - n} STONE${3 - n === 1 ? '' : 'S'} MORE. THE TIKI IS PATIENT. MOSTLY.`]);
  }

  function openChest() {
    S.flags.won = true;
    open = 0.01;
    sfx.fanfare();
    G.shake = 5;
    const gy = terrain(CHEST);
    burst(80, () => ({ x: CHEST + rnd(-5, 5), y: gy - 12, vx: rnd(-2.6, 2.6), vy: rnd(-5.4, -1.6), g: 0.16, life: rnd(1, 2.2), color: pick(['#f4c430', '#ffe066', '#fff3b0', '#ff4d6d', '#2ecc71', '#3a86ff']), size: 2, glow: true }));
    talk(
      [
        ['me', 'The treasure of Tiki Tide!'],
        ['me', 'Gold, jewels, and... a ship in a bottle?'],
        ['ghost', 'ME SHIP! The Soggy Biscuit, as she was before the reef. Before the curse.'],
        ['ghost', "Ye kept yer word, lad. Me hat, me stones, me dignity. The curse be lifted."],
        ['ghost', 'The gold is yers. And so is the Biscuit. She floats. Mostly.'],
        ['me', 'I have a ship? I HAVE A SHIP!'],
        ['ghost', 'Fair winds, Captain Pip. And never trust a monkey with yer hat.'],
      ],
      () => {
        G.mode = 'end';
        saveGame('auto');
      },
    );
  }

  return {
    name: 'The Tiki Ruins', w: 1200, music: 'ruins', checkpoint: 40, dust: '#b0ad98',
    terrain,
    ground: terrain,
    coins: [[470, 168], [900, 192]],
    exitL: { to: 'jungle', x: 1530 },
    anchors: { tiki: () => [TIKI, terrain(TIKI) - 84], ghost: () => [CHEST - 44, terrain(CHEST) - 74] },
    enter() {
      lift = S.flags.gateOpen ? 118 : 0;
      open = S.flags.won ? 1 : 0;
      if (S.flags.gemsPlaced && !S.flags.gateOpen) delay = 1;
    },
    block(p) {
      if (!S.flags.gateOpen && p.x > GATE - 10) {
        p.x = GATE - 10;
        p.vx = Math.min(0, p.vx);
      }
    },
    update() {
      const f = S.flags;
      if (f.gemsPlaced && !f.gateOpen) {
        delay -= DT;
        if (delay <= 0) {
          lift += 0.5;
          G.shake = Math.max(G.shake, 2.5);
          if (Math.floor(G.t * 60) % 12 === 0) sfx.rumble();
          if (Math.random() < 0.5) dust(GATE + rnd(-10, 10), terrain(GATE), 1);
          if (lift >= 118) {
            lift = 118;
            f.gateOpen = true;
            sfx.land();
            G.shake = 7;
            quip('Open sesame... ish.');
          }
        }
      }
      if (open > 0 && open < 1) open = Math.min(1, open + DT * 2);
      const gy = terrain(240);
      for (let i = 0; i < 2; i++) emit({ x: rnd(224, 258), y: gy - 2, vx: rnd(-0.7, 0.7), vy: rnd(-1, -0.2), drag: 0.97, life: rnd(0.5, 1), color: pick(['#ffffff', '#cfefff']), size: Math.random() < 0.4 ? 2 : 1 });
      for (const tx of TORCH) if (Math.random() < 0.6) emit({ x: tx + rnd(-1, 1), y: terrain(tx) - 46, vx: rnd(-0.15, 0.15), vy: rnd(-0.7, -0.3), life: rnd(0.3, 0.6), color: pick(['#ffd166', '#ff9f1c', '#ff6b35']), glow: true });
      if (f.won && Math.random() < 0.2) emit({ x: CHEST - 44 + rnd(-8, 8), y: terrain(CHEST) - rnd(10, 50), vy: rnd(-0.5, -0.1), life: 1, color: '#9dffe0', glow: true });
    },
    things: [
      {
        x: 240, hy: 34, name: 'the waterfall', def: 'use',
        label: () => 'Go behind the waterfall',
        look: 'A waterfall. Behind it, a crack in the cliff, black as a squid at midnight.',
        use() {
          if (!has('lantern')) {
            note('The cave behind the waterfall is pitch black. I need a light.');
            return say(['me', 'There is a cave back here! And it is pitch black.'], ['me', 'I am brave, not stupid. I need a light.']);
          }
          sfx.splash();
          travel('cave', 60);
        },
      },
      { x: TIKI, hy: 78, r: 24, name: 'the Tiki', def: 'talk', label: () => (['ruby', 'emerald', 'sapphire'].every(has) ? 'Offer the three stones to the Tiki' : 'Talk to the Tiki'), look: 'An ancient Tiki with three empty sockets and a very judgmental mouth.', talk: tikiTalk, use: tikiTalk },
      {
        x: GATE - 12, hy: 60, name: 'the stone gate', def: 'use', hidden: () => S.flags.gemsPlaced,
        label: () => 'Push the stone gate',
        look: 'Solid stone bars. Whatever is behind them, somebody really did not want it borrowed.',
        use() {
          G.shake = 1.5;
          say(['me', 'Nnnnnngh!'], ['me', '...Nope. Not budging.']);
        },
      },
      { x: CHEST, hy: 26, name: 'the treasure chest', def: 'use', hidden: () => S.flags.won, label: () => 'Open the treasure chest', look: "Captain Mildew's treasure chest. It is humming.", use: openChest },
    ],
    back(cam) {
      ctx.drawImage(SKY.night, 0, 0);
      drawStars(140, 170);
      drawMoon(cam, 350, 60);
      drawClouds(cam, ['#1a2448', '#243058', '#34467a', '#465c94'], 4, 60);
      drawHillLayer(cam, 0.25, -200, -100, 196, 30, '#16203e', '#22305a', 4);
      drawHillLayer(cam, 0.45, -200, -100, 206, 30, '#101830', null, 6);
      drawPalmRow(cam, 0.6, -100, 214, '#0c1226');
    },
    mid(cam) {
      for (let x = 170; x < 312; x++) {
        const top = 26 + Math.abs(x - 241) * 0.3 + hash(Math.floor(x / 5)) * 8;
        const gy = terrain(x);
        rect(x, top, 1, gy - top, (x >> 2) & 1 ? '#3a3e5c' : '#353955');
        rect(x, top, 1, 2, '#2f6a3d');
        if (hash(x + 3) > 0.8) rect(x, top + 12 + hash(x) * 80, 1, 5, '#2a2d48');
      }
      const g0 = terrain(240);
      rect(228, 150, 26, g0 - 150, '#0a0812');
      for (let x = 222; x < 260; x++) {
        const gy = terrain(x);
        rect(x, 30, 1, gy - 30, 'rgba(130,190,245,0.82)');
        for (let k = 0; k < 5; k++) rect(x, 30 + ((G.t * 110 + hash(x) * 260 + k * 44) % (gy - 30)), 1, 8, '#e8f6ff');
      }
      rect(221, 30, 1, g0 - 30, '#ffffff');
      rect(260, 30, 1, g0 - 30, '#dff3ff');
      rect(217, 27, 48, 4, '#cfefff');
      const gy = terrain(900);
      for (const [x1, top] of [[720, 70], [744, 54], [770, 38], [800, 22]]) rect(x1, top, 1200 - x1, gy - top, '#5d5f6e');
      const ts = y => (y >= 70 ? 720 : y >= 54 ? 744 : y >= 38 ? 770 : 800);
      for (let y = 30; y < gy; y += 10) {
        rect(ts(y), y, 1200 - ts(y), 1, '#474958');
        for (let x = 720 + (Math.floor(y / 10) % 2) * 10; x < 1200; x += 20) if (x >= ts(y)) rect(x, y, 1, 10, '#474958');
      }
      rect(766, 92, 434, gy - 92, '#1c1a22');
      rect(870, 92, 12, gy - 92, '#2e2b36');
      rect(1050, 92, 12, gy - 92, '#2e2b36');
      blob(960, 132, 30, 24, '#26232e');
      rect(944, 124, 9, 6, S.flags.gateOpen ? '#ffb347' : '#141218');
      rect(968, 124, 9, 6, S.flags.gateOpen ? '#ffb347' : '#141218');
      rect(948, 142, 26, 4, '#141218');
      rect(732, 78, 60, 14, '#6e7080');
      for (let x = 734; x < 790; x += 5) rect(x, 82 + ((x / 5) % 2) * 3, 3, 3, '#4c4e5c');
      for (const px of [560, 700]) {
        rect(px - 6, 90, 12, gy - 90, '#7c7e8c');
        rect(px + 3, 90, 3, gy - 90, '#5e606e');
        rect(px - 9, 85, 18, 6, '#8e909e');
        for (let y = 94; y < gy - 12; y += 4) if (hash(px + y) > 0.55) rect(px - 6 + Math.floor(hash(y) * 4), y, 2, 3, '#2f6a3d');
      }
      rect(552, 77, 70, 8, '#7c7e8c');
      rect(626, 80, 8, 4, '#7c7e8c');
      rect(680, 78, 30, 7, '#7c7e8c');
      for (const tx of TORCH) torch(tx, terrain(tx) - 40);
      for (let wx = cam - 2; wx < cam + W + 2; wx++) groundCol(wx, Math.round(terrain(wx)), wx + (hash(wx) - 0.5) * 36 < 400 ? 'jungle' : 'stone');
      drawFlora(cam, terrain, 20, 380, [[200, 280]]);
      actor(TIKI, terrain(TIKI), 1, () => tikiSprite(line && line.who === 'tiki', S.flags.gemsPlaced));
      const gg = terrain(GATE);
      ctx.save();
      ctx.beginPath();
      ctx.rect(738, 92, 40, gg - 92);
      ctx.clip();
      const top = gg - 62 - lift;
      for (let i = 0; i < 6; i++) {
        rect(742 + i * 5, top, 3, 62, '#3e3a44');
        rect(742 + i * 5, top, 1, 62, '#5a5662');
      }
      rect(740, top + 3, 32, 3, '#2e2a34');
      rect(740, top + 30, 32, 3, '#2e2a34');
      ctx.restore();
      actor(CHEST, terrain(CHEST), 1, () => chestSprite(open));
    },
    actors() {
      if (S.flags.won) actor(CHEST - 44, terrain(CHEST) - 6 + Math.sin(G.t * 2) * 3, 1, () => ghostSprite({ hat: true, talking: line && line.who === 'ghost' }), 0.82, '#0b3b34');
    },
    front(cam) {
      drawCanopy(cam, -100, 200, [[170, 312]]);
    },
    light(cam) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(120,135,200,0.38)';
      ctx.fillRect(0, 0, W, H);
      const ix = 766 - cam;
      if (ix < W) {
        ctx.fillStyle = S.flags.gateOpen ? 'rgba(90,75,120,0.55)' : 'rgba(55,45,85,0.75)';
        ctx.fillRect(Math.max(0, ix), 92, W, H - 92);
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const tx of TORCH) glow(tx - cam, terrain(tx) - 46, 56 + Math.sin(G.t * 13 + tx) * 4, 'rgba(255,150,60,0.42)');
      if (S.flags.gemsPlaced) {
        const top = terrain(TIKI) - 64;
        const p = 0.25 + (Math.sin(G.t * 3) + 1) * 0.1;
        glow(TIKI - 5 - cam, top + 15, 15, `rgba(46,204,113,${p})`);
        glow(TIKI + 5 - cam, top + 15, 15, `rgba(58,134,255,${p})`);
        glow(TIKI - cam, top + 4, 15, `rgba(224,36,94,${p})`);
      }
      if (open > 0) glow(CHEST - cam, terrain(CHEST) - 14, 64, 'rgba(255,200,80,0.5)');
      if (S.flags.won) glow(CHEST - 44 - cam, terrain(CHEST) - 34, 50, 'rgba(120,255,220,0.3)');
      ctx.fillStyle = 'rgba(170,200,255,0.04)';
      for (let i = 0; i < 3; i++) {
        const x0 = 330 - cam * 0.5 + i * 60;
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0 + 26, 0);
        ctx.lineTo(x0 - 60, H);
        ctx.lineTo(x0 - 110, H);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      drawForeFerns(cam, 0, 330, '#060d14');
    },
  };
})();

AREAS.cave = (() => {
  const terrain = x => 226 + Math.sin(x * 0.03) * 3 + Math.sin(x * 0.071) * 2;
  const dark = mk(W, H);
  const dk = dark.getContext('2d');
  const CRYSTALS = [[150, '#5ee7ff', '#d6fbff'], [164, '#c77dff', '#f0d6ff'], [330, '#5ee7ff', '#d6fbff'], [520, '#c77dff', '#f0d6ff'], [534, '#5ee7ff', '#d6fbff'], [660, '#7dffb0', '#dcffe9']];
  let bats = [];

  return {
    name: 'Squid-at-Midnight Cave', w: 700, music: 'cave', checkpoint: 60, hard: true, dark: true, dust: '#51466b', minX: 16, maxX: 684,
    terrain,
    ground: terrain,
    platforms: [{ x1: 440, x2: 522, y: 198 }],
    coins: [[481, 172]],
    anchors: { bones: () => [612, terrain(612) - 40] },
    enter() {
      bats = Array.from({ length: 6 }, (_, i) => ({ x: rnd(120, 640), y: rnd(50, 90), ph: i * 1.3, s: rnd(0.6, 1.2) }));
    },
    update() {
      for (const b of bats) {
        b.x += Math.cos(G.t * b.s + b.ph) * 1.2;
        b.y += Math.sin(G.t * 2.3 * b.s + b.ph) * 0.6;
      }
      if (Math.random() < 0.03) {
        const x = rnd(G.camX, G.camX + W);
        emit({ x, y: 30, vy: 2, g: 0.1, life: 1.2, color: '#9fd4f5' });
        if (AC && Math.random() < 0.4) sfx.drip();
      }
      if (AC && Math.random() < 0.004) sfx.squeak();
      for (const [x, c] of CRYSTALS) if (Math.random() < 0.02) emit({ x: x + rnd(-6, 6), y: terrain(x) - rnd(4, 24), vy: -0.15, life: 1, color: c, glow: true });
    },
    things: [
      {
        x: 40, hy: 40, name: 'the way out', def: 'use',
        label: () => 'Go back out through the waterfall',
        look: 'Moonlight and a curtain of water. The way out.',
        use() {
          sfx.splash();
          travel('ruins', 280);
        },
      },
      {
        x: 180, hy: 38, name: 'the unlucky adventurer', def: 'look',
        look() {
          egg('skeleton');
          say(['me', 'A skeleton holding a sign: "I SHOULD HAVE SAVED MY GAME."'], ['me', 'Wise words. Escape, then Save. Got it.']);
        },
        talk: () => say(['me', 'Any tips?'], ['bones', '...'], ['me', 'The sign says it all, really.']),
      },
      { x: 340, hy: 14, r: 30, name: 'the pool', def: 'look', look: () => say(['me', 'My reflection looks adventurous. And damp.']) },
      { x: 526, hy: 30, name: 'the crystals', def: 'look', look: 'Glowing crystals. Pretty, but the Tiki was very specific about colours.', pick: () => say(['me', 'They are part of the cave. The cave is not giving them up.']) },
      {
        x: 612, hy: 34, name: 'the old skeleton', def: 'pick',
        label: () => (S.flags.sapphire ? 'Look at the old skeleton' : 'Take the blue stone from the skeleton'),
        look: () => say(['me', S.flags.sapphire ? 'He looks relieved, honestly.' : 'A skeleton in a sailor coat, clutching a blue stone. The sunburnt sailor from the bottle, I think.']),
        pick() {
          if (S.flags.sapphire) return say(['me', 'He has given enough.']);
          S.flags.sapphire = true;
          sparkle(612, terrain(612) - 16, '#3a86ff');
          talk([['me', 'Sorry, friend. You will not be needing this.'], ['me', 'Brrr! Cold as cave water. The Tear of the Falls!']], () => {
            give('sapphire');
            note('Found the blue stone in the cave behind the waterfall: the Tear of the Falls.');
          });
        },
        use() {
          this.pick();
        },
      },
    ],
    back() {
      rect(0, 0, W, H, '#0d0a14');
    },
    mid(cam) {
      for (let k = Math.floor(cam / 22) - 1; k < (cam + W) / 22 + 1; k++) {
        const x = k * 22 + hash(k) * 12;
        blob(x, 60 + hash(k + 1) * 130, 16 + hash(k + 2) * 14, 12 + hash(k + 3) * 10, hash(k + 4) > 0.5 ? '#1a1526' : '#15111f');
      }
      for (let k = Math.floor(cam / 16) - 1; k < (cam + W) / 16 + 1; k++) {
        if (hash(k + 20) > 0.35) stalactite(k * 16 + hash(k) * 8, 14 + hash(k + 9) * 46, hash(k) > 0.5 ? '#2a2438' : '#332b46');
      }
      rect(0, 100, 30, 140, '#243a5c');
      for (let x = 0; x < 26; x++) for (let k = 0; k < 3; k++) rect(x, 100 + ((G.t * 110 + hash(x) * 200 + k * 50) % 130), 1, 7, '#cfe8ff');
      rect(290, terrain(340) + 1, 100, 6, '#1d3a6a');
      for (let x = 292; x < 388; x += 9) rect(x + Math.sin(G.t * 1.5 + x) * 3, terrain(340) + 2, 5, 1, '#6fa0d8');
      for (let wx = cam - 2; wx < cam + W + 2; wx++) {
        if (wx > 290 && wx < 390) {
          rect(wx, terrain(340) + 5, 1, H, '#2a2438');
          continue;
        }
        groundCol(wx, Math.round(terrain(wx)), 'cave');
      }
      rect(438, 198, 86, 7, '#3a3050');
      rect(438, 198, 86, 2, '#51466b');
      for (let i = 0; i < 12; i++) rect(446 + i * 6, 205, 4, 3 + hash(i) * 8, '#2a2438');
      for (const [x, c, hl] of CRYSTALS) {
        const gy = terrain(x);
        crystal(x, gy, 20 + hash(x) * 12, c, hl);
        crystal(x - 6, gy, 10 + hash(x + 1) * 6, c, hl);
        crystal(x + 6, gy, 13 + hash(x + 2) * 6, c, hl);
      }
      const sg = terrain(180);
      actor(180, sg, 1, () => skeletonSprite(true));
      rect(194, sg - 26, 2, 26, '#6b4226');
      rect(184, sg - 34, 24, 12, '#a0703a');
      rect(184, sg - 34, 24, 1, '#c08a4a');
      for (let i = 0; i < 5; i++) rect(187 + i * 4, sg - 31, 2, 2, '#3b2416');
      for (let i = 0; i < 4; i++) rect(189 + i * 4, sg - 27, 2, 2, '#3b2416');
      const og = terrain(612);
      actor(612, og, -1, () => {
        skeletonSprite(true);
        rect(-7, -15, 14, 10, '#2f4a6a');
        rect(-7, -15, 3, 10, '#3d6088');
        rect(-5, -27, 10, 3, '#d62839');
      });
      if (!S.flags.sapphire) {
        gem(618, og - 16, '#3a86ff', '#cfe3ff', '#1f55b8');
      }
      for (const b of bats) {
        const fl = Math.sin(G.t * 16 + b.ph) > 0 ? 2 : -1;
        rect(b.x - 1, b.y, 3, 3, '#1a1024');
        rect(b.x - 5, b.y - fl, 4, 2, '#2a1a3a');
        rect(b.x + 2, b.y - fl, 4, 2, '#2a1a3a');
        rect(b.x - 1, b.y, 1, 1, '#ff5c5c');
        rect(b.x + 1, b.y, 1, 1, '#ff5c5c');
      }
    },
    actors() {},
    front() {},
    light(cam) {
      dk.globalCompositeOperation = 'source-over';
      dk.clearRect(0, 0, W, H);
      dk.fillStyle = 'rgba(4,3,10,0.94)';
      dk.fillRect(0, 0, W, H);
      dk.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r, a) => {
        const g = dk.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(0,0,0,${a})`);
        g.addColorStop(0.6, `rgba(0,0,0,${a * 0.6})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        dk.fillStyle = g;
        dk.fillRect(x - r, y - r, r * 2, r * 2);
      };
      hole(player.x - cam + player.face * 6, player.y - 16, 120 + Math.sin(G.t * 9) * 3, 1);
      for (const [x] of CRYSTALS) hole(x - cam, terrain(x) - 14, 34 + Math.sin(G.t * 2 + x) * 3, 0.75);
      hole(10 - cam, 170, 80, 0.8);
      if (!S.flags.sapphire) hole(620 - cam, terrain(612) - 12, 22, 0.8);
      ctx.drawImage(dark, 0, 0);
      ctx.globalCompositeOperation = 'lighter';
      glow(player.x - cam + player.face * 6, player.y - 14, 90, 'rgba(255,190,90,0.2)');
      for (const [x, c] of CRYSTALS) glow(x - cam, terrain(x) - 14, 30, c === '#5ee7ff' ? 'rgba(90,230,255,0.3)' : c === '#c77dff' ? 'rgba(200,120,255,0.3)' : 'rgba(120,255,170,0.3)');
      if (!S.flags.sapphire) glow(623 - cam, terrain(612) - 11, 16, 'rgba(58,134,255,0.5)');
      ctx.globalCompositeOperation = 'source-over';
    },
  };
})();
