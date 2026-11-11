let AC = null;
let master;
let musicGain;
let noiseBuf;
let musicOn = true;
let nextNote = 0;
let step = 0;
let theme = 'beach';
const now = () => (AC ? AC.currentTime : 0);
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

function initAudio() {
  if (AC) {
    if (AC.state === 'suspended') AC.resume();
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  AC = new Ctx();
  master = AC.createGain();
  master.gain.value = 0.55;
  master.connect(AC.destination);
  musicGain = AC.createGain();
  musicGain.gain.value = 0.42;
  musicGain.connect(master);
  noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  nextNote = AC.currentTime + 0.1;
}

function voice(freq, t, dur, type, vol, dest, slideTo) {
  if (!AC) return;
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dest || master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, vol, freq, type, t0, dest) {
  if (!AC) return;
  const t = t0 ?? AC.currentTime;
  const src = AC.createBufferSource();
  src.buffer = noiseBuf;
  const f = AC.createBiquadFilter();
  f.type = type || 'lowpass';
  f.frequency.value = freq;
  const g = AC.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(dest || master);
  src.start(t, Math.random());
  src.stop(t + dur + 0.05);
}

const sfx = {
  jump: () => voice(260, now(), 0.14, 'square', 0.05, null, 620),
  land: () => noise(0.08, 0.12, 500),
  step: hard => noise(0.03, 0.035, hard ? 2600 : 900),
  pickup: () => {
    const t = now();
    voice(660, t, 0.1, 'triangle', 0.12);
    voice(990, t + 0.08, 0.2, 'triangle', 0.12);
  },
  coin: () => {
    const t = now();
    voice(988, t, 0.07, 'square', 0.045);
    voice(1319, t + 0.07, 0.25, 'square', 0.045);
  },
  splash: () => {
    noise(0.6, 0.3, 1400);
    voice(420, now(), 0.3, 'sine', 0.1, null, 80);
  },
  boing: () => voice(150, now(), 0.35, 'sine', 0.22, null, 720),
  hurt: () => voice(500, now(), 0.25, 'square', 0.07, null, 110),
  shake: () => {
    const t = now();
    for (let i = 0; i < 4; i++) noise(0.07, 0.12, 700, 'lowpass', t + i * 0.08);
  },
  crack: () => {
    noise(0.2, 0.4, 3000, 'highpass');
    voice(140, now(), 0.15, 'square', 0.1, null, 60);
  },
  stomp: () => voice(330, now(), 0.15, 'square', 0.07, null, 90),
  rumble: () => noise(0.4, 0.22, 140),
  boom: () => {
    noise(0.9, 0.6, 300);
    voice(110, now(), 0.6, 'sine', 0.4, null, 30);
  },
  dig: () => {
    const t = now();
    for (let i = 0; i < 3; i++) noise(0.12, 0.2, 1200, 'bandpass', t + i * 0.22);
  },
  thunk: () => {
    voice(180, now(), 0.08, 'square', 0.08, null, 90);
    noise(0.05, 0.15, 2000);
  },
  door: () => {
    voice(90, now(), 0.25, 'sawtooth', 0.05, null, 140);
    noise(0.12, 0.1, 400, 'lowpass', now() + 0.2);
  },
  menu: () => voice(520, now(), 0.05, 'square', 0.04),
  select: () => {
    const t = now();
    voice(520, t, 0.06, 'square', 0.04);
    voice(780, t + 0.06, 0.1, 'square', 0.04);
  },
  wail: () => {
    const t = now();
    voice(300, t, 1.2, 'sine', 0.06, null, 520);
    voice(303, t, 1.2, 'sine', 0.05, null, 260);
  },
  magic: () => {
    const t = now();
    [72, 76, 79, 84, 88, 91].forEach((m, i) => voice(midi(m), t + i * 0.09, 0.5, 'triangle', 0.08));
  },
  fanfare: () => {
    const t = now();
    [[72, 0], [76, 0.12], [79, 0.24], [84, 0.36], [79, 0.6], [84, 0.72]].forEach(([m, d]) => {
      voice(midi(m), t + d, 0.35, 'square', 0.05);
      voice(midi(m - 12), t + d, 0.35, 'triangle', 0.08);
    });
  },
  talk: f => voice(f * (0.9 + Math.random() * 0.2), now(), 0.045, 'square', 0.022),
  monkey: () => {
    const t = now();
    voice(700, t, 0.12, 'sawtooth', 0.04, null, 1100);
    voice(800, t + 0.15, 0.12, 'sawtooth', 0.04, null, 1300);
  },
  squawk: () => {
    const t = now();
    voice(1300, t, 0.1, 'sawtooth', 0.035, null, 700);
    voice(1500, t + 0.12, 0.12, 'sawtooth', 0.035, null, 800);
  },
  chirp: () => {
    const t = now();
    voice(2200, t, 0.06, 'sine', 0.03, null, 2900);
    voice(2400, t + 0.09, 0.06, 'sine', 0.03, null, 3100);
  },
  drip: () => voice(rnd(1400, 2200), now(), 0.12, 'sine', 0.05, null, 700),
  squeak: () => voice(2600, now(), 0.07, 'square', 0.02, null, 3400),
  scratch: () => {
    voice(900, now(), 0.3, 'sawtooth', 0.08, null, 90);
    noise(0.25, 0.2, 2500, 'bandpass');
  },
  honk: () => voice(240, now(), 0.25, 'sawtooth', 0.06, null, 200),
};

function lead(kind, f, t) {
  const d = musicGain;
  if (kind === 'steel') {
    voice(f, t, 0.38, 'sine', 0.09, d);
    voice(f * 2.01, t, 0.14, 'sine', 0.03, d);
    voice(f * 3, t, 0.07, 'triangle', 0.012, d);
  } else if (kind === 'marimba') {
    voice(f, t, 0.24, 'triangle', 0.13, d);
    voice(f * 4, t, 0.05, 'sine', 0.03, d);
  } else if (kind === 'organ') {
    voice(f, t, 0.55, 'sawtooth', 0.022, d);
    voice(f * 1.008, t, 0.55, 'sawtooth', 0.022, d);
    voice(f / 2, t, 0.55, 'sine', 0.06, d);
  } else if (kind === 'squeeze') {
    voice(f, t, 0.15, 'square', 0.035, d);
    voice(f * 2, t, 0.15, 'sawtooth', 0.012, d);
  } else if (kind === 'pad') {
    voice(f, t, 1.6, 'sine', 0.08, d);
    voice(f * 1.5, t, 1.6, 'sine', 0.02, d);
    voice(f * 2.005, t, 1.2, 'sine', 0.02, d);
  } else if (kind === 'clav') {
    voice(f, t, 0.1, 'square', 0.05, d);
    voice(f * 2, t, 0.05, 'sawtooth', 0.02, d);
  } else if (kind === 'bell') {
    voice(f, t, 0.9, 'sine', 0.07, d);
    voice(f * 3.01, t, 0.3, 'sine', 0.014, d);
  } else if (kind === 'flute') {
    voice(f, t, 0.4, 'triangle', 0.09, d);
    voice(f * 2, t, 0.2, 'sine', 0.02, d);
  }
}

const TAVERN_TUNES = [
  [67, 71, 74, 79, 74, 71, 72, 76, 79, 76, 72, 76, 74, 78, 81, 78, 74, 69, 71, 74, 71, 67, 0, 0],
  [74, 0, 71, 67, 71, 74, 76, 0, 72, 67, 72, 76, 78, 74, 69, 74, 78, 81, 79, 0, 74, 71, 67, 0],
  [79, 78, 79, 74, 0, 71, 76, 74, 76, 72, 0, 67, 69, 71, 72, 74, 76, 78, 79, 0, 79, 79, 0, 0],
];

const THEMES = {
  beach: {
    dur: 0.19, spb: 8, lead: 'steel', bass: [0, 3, 6], stab: [1, 3, 5, 7],
    mel: [76, 79, 81, 79, 76, 0, 72, 74, 76, 74, 72, 0, 69, 72, 0, 0, 74, 76, 79, 76, 74, 0, 71, 74, 72, 0, 76, 79, 76, 74, 72, 0],
    bars: [[36, [60, 64, 67]], [41, [60, 65, 69]], [43, [59, 62, 67]], [36, [60, 64, 67]]],
    perc: (s, t) => noise(0.03, s % 2 ? 0.035 : 0.02, 7000, 'highpass', t, musicGain),
  },
  jungle: {
    dur: 0.17, spb: 8, lead: 'marimba', bass: [0, 3, 5, 6], stab: [2, 6],
    mel: [69, 0, 72, 74, 76, 74, 72, 0, 69, 72, 0, 67, 69, 0, 0, 0, 76, 0, 79, 76, 74, 72, 74, 0, 72, 69, 67, 69, 0, 0, 64, 67],
    bars: [[33, [57, 60, 64]], [33, [57, 60, 64]], [31, [55, 59, 62]], [29, [53, 57, 60]]],
    perc: (s, t) => {
      if ([0, 2, 3, 5, 6].includes(s)) voice(s % 2 ? 150 : 210, t, 0.09, 'sine', 0.12, musicGain, 90);
      if (s % 2) noise(0.02, 0.02, 6000, 'highpass', t, musicGain);
    },
  },
  spooky: {
    dur: 0.25, spb: 6, lead: 'organ', bass: [0], bassDur: 0.6, stab: [2, 4], stabDur: 0.2,
    mel: [62, 0, 65, 0, 69, 0, 68, 0, 65, 0, 62, 0, 61, 0, 64, 0, 67, 0, 65, 64, 62, 0, 0, 0],
    bars: [[38, [62, 65, 69]], [34, [58, 62, 65]], [33, [57, 61, 64]], [38, [62, 65, 69]]],
    perc: (s, t) => {
      if (s === 0 && Math.random() < 0.2) voice(880, t, 1.4, 'sine', 0.015, musicGain, 600);
    },
  },
  tavern: {
    dur: 0.13, spb: 6, lead: 'squeeze', bass: [0, 3], stab: [2, 5],
    mel: TAVERN_TUNES[0],
    bars: [[43, [59, 62, 67]], [36, [60, 64, 67]], [38, [57, 62, 66]], [43, [59, 62, 67]]],
    perc: (s, t) => {
      if (s === 3) noise(0.05, 0.06, 1800, 'bandpass', t, musicGain);
      if (s === 0) voice(120, t, 0.08, 'sine', 0.14, musicGain, 60);
    },
  },
  cave: {
    dur: 0.45, spb: 4, lead: 'pad', bass: [0], bassDur: 1.6, stab: [],
    mel: [64, 0, 0, 67, 0, 71, 0, 0, 66, 0, 0, 62, 0, 64, 0, 0],
    bars: [[28, []], [28, []], [24, []], [26, []]],
    perc: (s, t) => {
      if (Math.random() < 0.18) voice(rnd(1500, 2400), t + rnd(0, 0.3), 0.1, 'sine', 0.03, musicGain, 800);
    },
  },
  ruins: {
    dur: 0.22, spb: 8, lead: 'flute', bass: [0, 4], bassDur: 0.4, stab: [2, 6], stabDur: 0.3,
    mel: [62, 0, 65, 67, 69, 0, 67, 65, 62, 0, 60, 0, 62, 0, 0, 0, 69, 0, 72, 71, 69, 0, 67, 65, 67, 0, 65, 64, 62, 0, 0, 0],
    bars: [[38, [62, 65, 69]], [36, [60, 64, 67]], [31, [55, 58, 62]], [38, [62, 65, 69]]],
    perc: (s, t) => {
      if ([0, 3, 6].includes(s)) noise(0.14, 0.14, 180, 'lowpass', t, musicGain);
    },
  },
};

Object.assign(THEMES, {
  sea: {
    dur: 0.17, spb: 6, lead: 'flute', bass: [0, 3], stab: [2, 5],
    mel: [62, 0, 65, 69, 0, 69, 67, 0, 65, 64, 0, 62, 60, 0, 64, 67, 0, 67, 69, 67, 65, 62, 0, 0],
    bars: [[38, [62, 65, 69]], [36, [60, 64, 67]], [36, [60, 64, 67]], [38, [62, 65, 69]]],
    perc: (s, t) => {
      if (s === 0) noise(0.5, 0.05, 700, 'lowpass', t, musicGain);
      if (s === 3) noise(0.04, 0.04, 3000, 'bandpass', t, musicGain);
    },
  },
  funk: {
    dur: 0.125, spb: 16, lead: 'clav', bass: [], stab: [4, 7, 12, 15], stabDur: 0.08,
    mel: [0, 0, 76, 0, 79, 0, 76, 74, 0, 76, 0, 0, 71, 0, 74, 0, 0, 0, 76, 0, 79, 81, 0, 79, 76, 0, 74, 0, 71, 74, 76, 0],
    bars: [[40, [64, 67, 71, 74]], [45, [64, 69, 72, 76]]],
    perc: (s, t, root) => {
      if (s % 4 === 0) voice(130, t, 0.12, 'sine', 0.3, musicGain, 45);
      if (s % 4 === 2) noise(0.04, 0.05, 8000, 'highpass', t, musicGain);
      if (s === 4 || s === 12) noise(0.1, 0.12, 1800, 'bandpass', t, musicGain);
      if ([0, 3, 6, 10, 14].includes(s)) voice(midi(root), t, 0.14, 'sawtooth', 0.11, musicGain);
      if (s === 7 || s === 11) voice(midi(root + 12), t, 0.07, 'square', 0.07, musicGain);
    },
  },
  ice: {
    dur: 0.2, spb: 8, lead: 'bell', bass: [0, 4], bassDur: 0.5, stab: [],
    mel: [84, 0, 88, 0, 91, 0, 88, 0, 86, 0, 89, 0, 93, 0, 89, 0, 84, 88, 91, 96, 91, 88, 84, 0, 83, 0, 86, 0, 91, 0, 0, 0],
    bars: [[48, [60, 64, 67]], [53, [60, 65, 69]], [48, [60, 64, 67]], [43, [59, 62, 67]]],
    perc: (s, t) => noise(0.03, s % 2 ? 0.015 : 0.04, 9000, 'highpass', t, musicGain),
  },
  cheese: {
    dur: 0.2, spb: 6, lead: 'squeeze', bass: [0], bassDur: 0.3, stab: [2, 4], stabDur: 0.14,
    mel: [72, 0, 77, 0, 81, 0, 79, 77, 76, 0, 72, 0, 70, 0, 74, 0, 77, 0, 76, 74, 72, 0, 0, 0],
    bars: [[41, [65, 69, 72]], [36, [64, 67, 72]], [46, [65, 70, 74]], [36, [64, 67, 70]]],
    perc: (s, t, root) => {
      if (s === 0) voice(midi(root - 12), t, 0.25, 'sawtooth', 0.06, musicGain);
    },
  },
});

function setTheme(name) {
  if (theme === name) return;
  theme = name;
  step = 0;
}

function music() {
  if (!AC) return;
  if (nextNote < AC.currentTime - 0.5) nextNote = AC.currentTime + 0.05;
  const T = THEMES[theme];
  while (nextNote < AC.currentTime + 0.2) {
    if (musicOn) {
      const bar = Math.floor(step / T.spb) % T.bars.length;
      const s = step % T.spb;
      const m = T.mel[step % T.mel.length];
      if (m) lead(T.lead, midi(m), nextNote);
      const [root, chord] = T.bars[bar];
      if (T.bass.includes(s)) voice(midi(root), nextNote, T.bassDur || 0.24, 'triangle', 0.2, musicGain);
      if (T.stab.includes(s)) chord.forEach(n => voice(midi(n), nextNote, T.stabDur || 0.12, 'sine', 0.025, musicGain));
      if (T.perc) T.perc(s, nextNote, root);
    }
    nextNote += T.dur;
    step++;
  }
}
