function makeSky(pal, hz) {
  const cv = mk(W, H);
  const c = cv.getContext('2d');
  const img = c.createImageData(W, H);
  const rgb = pal.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < H; y++) {
    const f = clamp(y / hz, 0, 1) * (rgb.length - 1);
    const i = Math.floor(f);
    const fr = f - i;
    for (let x = 0; x < W; x++) {
      const idx = Math.min(rgb.length - 1, i + (fr > bayer[(y & 3) * 4 + (x & 3)] / 16 ? 1 : 0));
      const o = (y * W + x) * 4;
      img.data[o] = rgb[idx][0];
      img.data[o + 1] = rgb[idx][1];
      img.data[o + 2] = rgb[idx][2];
      img.data[o + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  return cv;
}

const SKY = {
  sunset: makeSky(['#1b1035', '#2d1650', '#4b1d63', '#76256c', '#a8346b', '#d4506a', '#ee7560', '#f89a5b', '#fbbf63', '#ffd98a'], 186),
  dusk: makeSky(['#0e0a2a', '#1a1042', '#2c1459', '#4a1a6b', '#6f2370', '#98306f', '#bf476c', '#dd6a66', '#ee9566', '#f7c07a'], 200),
  night: makeSky(['#04051a', '#070a24', '#0a0f2e', '#0e1638', '#131e44', '#182850', '#1e335c', '#254068', '#2d4e74', '#3a6080'], 200),
};

const vignette = mk(W, H);
{
  const c = vignette.getContext('2d');
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(16,4,26,0.6)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

function drawStars(n, maxY) {
  for (let i = 0; i < n; i++) {
    const a = (Math.sin(G.t * 2 + i * 1.7) + 1) / 2;
    if (a < 0.25) continue;
    ctx.globalAlpha = a * 0.85;
    const x = hash(i) * W;
    const y = hash(i + 50) * maxY;
    rect(x, y, 1, 1, '#fff6d8');
    if (i % 9 === 0 && a > 0.8) {
      rect(x - 1, y, 3, 1, '#fff6d8');
      rect(x, y - 1, 1, 3, '#fff6d8');
    }
  }
  ctx.globalAlpha = 1;
}

function drawSun(cam, lx, cy, r) {
  const cx = Math.round(lx - cam * 0.03);
  ctx.globalCompositeOperation = 'lighter';
  glow(cx, cy, 120, 'rgba(255,170,90,0.35)');
  ctx.globalCompositeOperation = 'source-over';
  for (let y = -r; y <= r; y++) {
    if (y > 2 && y % 7 < Math.min(6, (y - 2) / 5)) continue;
    const w = Math.sqrt(r * r - y * y);
    const t = (y + r) / (2 * r);
    rect(cx - w, cy + y, w * 2, 1, t < 0.4 ? '#fff0a8' : t < 0.6 ? '#ffe089' : t < 0.8 ? '#ffc46b' : '#ff9466');
  }
}

function drawMoon(cam, lx, cy) {
  const cx = Math.round(lx - cam * 0.03);
  ctx.globalCompositeOperation = 'lighter';
  glow(cx, cy, 90, 'rgba(150,180,255,0.3)');
  ctx.globalCompositeOperation = 'source-over';
  blob(cx, cy, 20, 20, '#e8ecf5');
  blob(cx - 6, cy - 5, 5, 4, '#c9cfe2');
  blob(cx + 7, cy + 6, 4, 3, '#c9cfe2');
  blob(cx + 4, cy - 9, 2, 2, '#d5daea');
  blob(cx - 8, cy + 9, 3, 2, '#d5daea');
}

function drawClouds(cam, cols, n, maxY) {
  const span = W + 180;
  for (let i = 0; i < n; i++) {
    const x = ((((hash(i) * span - cam * 0.06 + G.t * (2 + i * 0.4)) % span) + span) % span) - 90;
    const y = 20 + hash(i + 9) * maxY;
    const s = 0.8 + hash(i + 3) * 1;
    blob(x, y + 3 * s, 22 * s, 3 * s, cols[0]);
    blob(x, y, 24 * s, 5 * s, cols[1]);
    blob(x - 10 * s, y - 4 * s, 13 * s, 5 * s, cols[2]);
    blob(x + 8 * s, y - 5 * s, 11 * s, 5 * s, cols[3]);
    blob(x + 2 * s, y - 8 * s, 7 * s, 3 * s, cols[3]);
  }
}

function drawSeaBand(cam, y0, base, wave, glx, g1, g2) {
  rect(0, y0, W, H - y0, base);
  for (let y = y0 + 3; y < H; y += 4) {
    for (let x = 0; x < W; x += 26) {
      const o = (Math.sin(G.t * 0.8 + y * 0.9 + x) * 8) | 0;
      rect(x + o, y, 11, 1, wave);
    }
  }
  const sx = glx - cam * 0.03;
  for (let y = y0 + 1; y < y0 + 70; y += 2) {
    const w = 5 + (y - y0) * 0.7 + Math.sin(G.t * 3 + y * 1.7) * 4;
    const o = Math.sin(G.t * 2 + y * 0.7) * 5;
    rect(sx - w / 2 + o, y, w, 1, y % 4 ? g1 : g2);
  }
  rect(0, y0, W, 1, g2);
}

function drawVolcano(cam, lx, base, top, col) {
  const bx = Math.round(lx - cam * 0.12);
  if (bx < -190 || bx > W + 190) return;
  for (let y = top; y < base; y++) {
    const f = (y - top) / (base - top);
    const w = 16 + f * 140 + Math.sin(y * 0.9) * 1.5;
    rect(bx - w, y, w * 2, 1, col);
    if (y % 3 === 0) dither(bx + w * 0.2, y, w * 0.8, 1, 'rgba(0,0,0,0.18)');
  }
  const pulse = (Math.sin(G.t * 2) + 1) / 2;
  for (const k of [-8, 2, 10]) {
    for (let y = top; y < top + 24 + k; y++) {
      ctx.globalAlpha = 0.4 + pulse * 0.5;
      rect(bx + k + Math.sin(y * 0.5 + k) * 2, y, 1, 1, '#ff6b3d');
    }
  }
  ctx.globalAlpha = 1;
  rect(bx - 15, top - 1, 30, 2, pulse > 0.5 ? '#ff9f43' : '#ff7b3a');
  for (let i = 0; i < 9; i++) {
    const p = (G.t * 0.07 + i / 9) % 1;
    ctx.globalAlpha = (1 - p) * 0.5;
    blob(bx + Math.sin(p * 6 + i) * 7 + p * 36, top - 5 - p * 74, 4 + p * 13, (4 + p * 13) * 0.8, '#6b4d7d');
  }
  ctx.globalAlpha = 1;
}

function drawHillLayer(cam, par, s0, s1, base, amp, col, edge, seed) {
  for (let sx = 0; sx < W; sx++) {
    const lx = sx + cam * par;
    const rise = smooth(s0, s1, lx);
    if (rise <= 0) continue;
    const h = base - rise * (amp + Math.sin(lx * 0.013 + seed) * amp * 0.4 + Math.sin(lx * 0.041 + seed * 2) * amp * 0.15);
    rect(sx, h, 1, H - h, col);
    if (edge) rect(sx, h, 1, 1, edge);
  }
}

function drawPalmSil(sx, base, h, c) {
  for (let i = 0; i < h; i++) rect(sx + (i / h) ** 2 * 10, base - i, 3, 1, c);
  const tx = sx + 10;
  const ty = base - h;
  for (const a of [-2.8, -2.2, -1.6, -1.0, -0.4]) {
    for (let k = 0; k < 20; k++) rect(tx + Math.cos(a) * k, ty + Math.sin(a) * k * 0.5 + (k / 20) ** 2 * 10, 2, 1, c);
  }
}

function drawPalmRow(cam, par, startLx, base, col) {
  const pc = cam * par;
  for (let k = Math.floor((pc - 70) / 76); k < (pc + W + 70) / 76; k++) {
    const lx = k * 76 + hash(k) * 34;
    if (lx < startLx) continue;
    drawPalmSil(lx - pc, base, 54 + hash(k + 2) * 36, col);
  }
}

function drawBushWall(cam, par, a, b, c, d, base, amp, col, edge) {
  for (let sx = 0; sx < W; sx++) {
    const lx = sx + cam * par;
    const z = smooth(a, b, lx) * (1 - smooth(c, d, lx));
    if (z <= 0.02) continue;
    const h = base - z * (amp + Math.sin(lx * 0.07) * 6 + hash(Math.floor(lx / 5)) * 7);
    rect(sx, h, 1, H - h, col);
    rect(sx, h, 1, 1, edge);
  }
}

function drawTrunks(cam, par, a, b, col, hi, leaf) {
  const pc = cam * par;
  for (let k = Math.floor((pc - 30) / 130); k < (pc + W + 30) / 130; k++) {
    const lx = k * 130 + hash(k + 30) * 60;
    if (lx < a || lx > b) continue;
    const sx = lx - pc;
    rect(sx, 0, 9, 190, col);
    rect(sx + 1, 0, 2, 190, hi);
    blob(sx + 4, 8, 28, 13, leaf);
  }
}

function drawPalm(x, gy, h, lean, shake, nuts, seed) {
  const sway = Math.sin(G.t * 1.1 + seed) * 2 + Math.sin(G.t * 28) * shake * 4;
  const n = 18;
  let tx = x;
  let ty = gy;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    tx = x + lean * f * f * 20 + sway * f;
    ty = gy - f * h;
    const wd = 7 - f * 2;
    rect(tx - wd / 2, ty, wd, h / n + 1, i % 2 ? '#8b5a2b' : '#a3713d');
    rect(tx - wd / 2, ty, 1, h / n + 1, '#6b4220');
    rect(tx + wd / 2 - 1, ty, 1, h / n + 1, '#b98a52');
  }
  const fronds = [-3.0, -2.55, -2.1, -1.57, -1.05, -0.6, -0.15];
  for (let fi = 0; fi < fronds.length; fi++) {
    const a = fronds[fi] + Math.sin(G.t * 1.6 + seed + fi) * 0.06 + Math.sin(G.t * 30 + fi) * shake * 0.25;
    const L = 22 + hash(seed * 10 + fi) * 10;
    for (let k = 2; k < L; k++) {
      const fx = tx + Math.cos(a) * k;
      const fy = ty + Math.sin(a) * k * 0.55 + (k / L) ** 2 * 13;
      rect(fx, fy, 2, 2, k > L * 0.65 ? '#4caf50' : '#2e7d32');
      rect(fx, fy, 1, 1, k > L * 0.4 ? '#7bd66f' : '#3f9a47');
      if (k % 3 === 0) rect(fx, fy + 2, 1, k > L * 0.5 ? 4 : 3, '#256b2b');
    }
  }
  if (nuts > 0) blob(tx - 3, ty + 4, 2.5, 2.5, '#5a3a1e');
  if (nuts > 1) blob(tx + 3, ty + 5, 2.5, 2.5, '#4a2e16');
  if (nuts > 2) blob(tx, ty + 7, 2.5, 2.5, '#664422');
  return [tx, ty];
}

function drawBananaTree(x, gy, shake, ripe) {
  const h = 58;
  const sway = Math.sin(G.t * 28) * shake * 3 + Math.sin(G.t * 0.9) * 1;
  for (let y = 0; y < h; y++) {
    rect(x - 3 + sway * (y / h), gy - y, 6, 1, y % 6 ? '#7a8f3a' : '#5f7230');
    rect(x - 3 + sway * (y / h), gy - y, 1, 1, '#566a2a');
  }
  const tx = x + sway;
  const ty = gy - h;
  const leaves = [-2.9, -2.3, -1.57, -0.85, -0.25];
  for (let li = 0; li < leaves.length; li++) {
    const a = leaves[li] + Math.sin(G.t * 1.3 + li) * 0.05 + Math.sin(G.t * 31 + li) * shake * 0.3;
    const L = 26 + hash(li + 40) * 8;
    for (let k = 1; k < L; k++) {
      const fx = tx + Math.cos(a) * k;
      const fy = ty + Math.sin(a) * k * 0.7 + (k / L) ** 2 * 15;
      const wd = Math.sin((k / L) * Math.PI) * 4 + 1;
      rect(fx, fy - wd / 2, 2, wd, '#5aa83c');
      rect(fx, fy, 1, 1, '#a5d66b');
      if (k % 5 === 0) rect(fx, fy - wd / 2, 1, wd, '#3f8a2c');
    }
  }
  rect(tx + 2, ty + 3, 1, 5, '#5f7230');
  const c1 = ripe ? '#ffd23f' : '#9ccc65';
  const c2 = ripe ? '#f4c430' : '#8bc34a';
  rect(tx + 1, ty + 8, 2, 5, c1);
  rect(tx + 3, ty + 9, 2, 5, c2);
  rect(tx + 5, ty + 8, 2, 4, c1);
  if (ripe) rect(tx + 2, ty + 13, 2, 3, c2);
}

function fern(x, gy, s) {
  for (const b of [-1, -0.5, 0, 0.5, 1]) {
    const len = 12 * s * (1.2 - Math.abs(b) * 0.3);
    for (let i = 0; i < len; i++) {
      const fx = x + b * i * 0.9 + Math.sin(G.t * 1.5 + x) * i * 0.05;
      const fy = gy - i * (1.2 - Math.abs(b) * 0.5) + (Math.abs(b) > 0.6 ? i * i * 0.03 : 0);
      rect(fx, fy, 2, 1, i % 2 ? '#2f6e3a' : '#3f8f4a');
    }
  }
}

function bush(x, gy, s, k) {
  blob(x, gy - 6 * s, 11 * s, 7 * s, '#1e4a32');
  blob(x - 1, gy - 7 * s, 9 * s, 5 * s, '#24573a');
  blob(x - 4, gy - 9 * s, 5 * s, 4 * s, '#2f6e45');
  const fc = ['#ff4f79', '#ffd23f', '#ff8a5c', '#c77dff'];
  rect(x - 5, gy - 10 * s, 2, 2, fc[k & 3]);
  rect(x + 4, gy - 6 * s, 2, 2, fc[(k + 1) & 3]);
  rect(x - 1, gy - 12 * s, 2, 2, fc[(k + 2) & 3]);
}

function drawFlora(cam, terrain, from, to, skip) {
  for (let k = Math.floor((cam - 40) / 30); k < (cam + W + 40) / 30; k++) {
    const x = k * 30 + hash(k) * 16;
    if (x < from || x > to || skip.some(([a, b]) => x > a && x < b)) continue;
    const gy = terrain(x);
    const s = 0.7 + hash(k + 7) * 0.7;
    if (hash(k + 3) < 0.5) fern(x, gy, s);
    else bush(x, gy, s, k);
  }
}

function drawCanopy(cam, from, to, skipVines) {
  for (let k = Math.floor((cam - 50) / 20); k < (cam + W + 50) / 20; k++) {
    const x = k * 20;
    const z = smooth(from, from + 80, x) * (1 - smooth(to - 80, to, x));
    if (z <= 0.05) continue;
    const r = (10 + hash(k) * 12) * z;
    blob(x, -2 + hash(k + 1) * 7, r, r * 0.7, '#0f3324');
    blob(x + 4, 3 + hash(k + 2) * 7, r * 0.6, r * 0.4, '#1a4d33');
    if (hash(k + 5) > 0.55 && !(skipVines || []).some(([a, b]) => x > a && x < b)) {
      const len = 24 + hash(k + 6) * 84;
      for (let i = 0; i < len; i += 2) {
        const vx = x + Math.sin(G.t * 1.3 + k) * (i / len) * 4;
        rect(vx, i, 1, 2, '#2d5a27');
        if (i % 8 === 0) rect(vx + 1, i, 2, 1, '#4c9a3c');
        if (i % 22 === 10) rect(vx - 2, i, 2, 2, '#3a7a31');
      }
    }
  }
}

function drawForeFerns(cam, from, to, col) {
  const pc = cam * 1.3;
  for (let k = Math.floor((pc - 90) / 80); k < (pc + W + 90) / 80; k++) {
    const lx = k * 80 + hash(k + 11) * 34;
    const wx = lx / 1.3;
    if (wx < from || wx > to || hash(k + 12) < 0.35) continue;
    const sx = lx - pc;
    for (let b = 0; b < 8; b++) {
      const a = -2.7 + b * 0.3 + Math.sin(G.t * 0.8 + k + b) * 0.03;
      const len = 36 + hash(k * 7 + b) * 26;
      for (let i = 0; i < len; i++) rect(sx + Math.cos(a) * i, H + 5 + Math.sin(a) * i + (i / len) ** 2 * 17, 3, 2, col);
    }
  }
}

function groundCol(wx, gy, style) {
  const h = hash(wx);
  if (style === 'sand') {
    rect(wx, gy, 1, H - gy, '#d9b061');
    rect(wx, gy, 1, 2, '#f6dc94');
    rect(wx, gy + 2, 1, 5, '#ecc878');
    if (h < 0.3) rect(wx, gy + 5 + Math.floor(h * 60), 1, 1, '#b88f45');
    if (h > 0.96) rect(wx, gy + 1, 1, 1, '#f7a8b8');
    if ((wx & 1) && h > 0.5) rect(wx, gy + 8 + Math.floor(h * 20), 1, 1, '#e6c070');
  } else if (style === 'wet') {
    rect(wx, gy, 1, H - gy, '#a8894f');
    rect(wx, gy, 1, 2, '#c4a362');
    if (h < 0.2) rect(wx, gy + 3 + Math.floor(h * 30), 1, 1, '#8a6e3c');
  } else if (style === 'jungle') {
    rect(wx, gy, 1, H - gy, '#3d2718');
    rect(wx, gy, 1, 8, '#5b3b26');
    rect(wx, gy - 1, 1, 4, '#4f9a3a');
    rect(wx, gy - 1, 1, 1, '#7cc157');
    if (h > 0.7) rect(wx, gy - 1 - Math.floor((h - 0.7) * 16), 1, 1 + Math.floor((h - 0.7) * 16), '#5fb04a');
    if (h < 0.06) rect(wx, gy + 11 + Math.floor(h * 300), 2, 1, '#6b4a33');
    if ((wx & 1) === 0 && h > 0.4) rect(wx, gy + 9 + Math.floor(h * 30), 1, 1, '#4a3020');
  } else if (style === 'stone') {
    rect(wx, gy, 1, H - gy, '#7f7c69');
    rect(wx, gy, 1, 2, h > 0.4 ? '#6f8f4a' : '#a3a08a');
    if (wx % 20 === 0) rect(wx, gy + 2, 1, H - gy, '#5f5d4f');
    for (let y = gy + 10; y < H; y += 10) rect(wx, y, 1, 1, '#5f5d4f');
    if (h > 0.97) rect(wx, gy + 4, 1, 3, '#6a6858');
  } else if (style === 'cave') {
    rect(wx, gy, 1, H - gy, '#2a2438');
    rect(wx, gy, 1, 2, '#51466b');
    rect(wx, gy + 2, 1, 3, '#3a3050');
    if (h < 0.15) rect(wx, gy + 6 + Math.floor(h * 100), 2, 1, '#3a3050');
  }
}

function drawWaterFront(cam, sea, to, floorFn) {
  if (cam > to) return;
  for (let wx = cam; wx < Math.min(cam + W, to); wx++) {
    const surf = sea + Math.sin(wx * 0.09 + G.t * 2.2) + Math.sin(wx * 0.04 - G.t * 1.3) * 0.8;
    const floor = floorFn(wx);
    if (surf >= floor - 0.5) continue;
    const s = Math.round(surf);
    ctx.fillStyle = 'rgba(46,110,170,0.62)';
    ctx.fillRect(wx, s, 1, Math.max(1, Math.round(floor) - s + 1));
    rect(wx, s, 1, 1, '#bfe9ff');
    if (floor - surf < 3) rect(wx, s, 1, 2, '#ffffff');
    if ((wx + Math.floor(G.t * 10)) % 23 === 0) rect(wx, s + 3, 2, 1, '#9fd4f5');
    if (wx % 7 === 0 && Math.sin(G.t * 3 + wx) > 0.7) rect(wx, s + 1, 1, 1, '#ffd98a');
  }
}

function gem(x, y, c, hl, dk) {
  rect(x + 4, y + 1, 4, 1, c);
  rect(x + 2, y + 2, 8, 3, c);
  rect(x + 3, y + 5, 6, 2, c);
  rect(x + 4, y + 7, 4, 2, c);
  rect(x + 5, y + 9, 2, 1, c);
  rect(x + 3, y + 2, 2, 2, hl);
  rect(x + 7, y + 5, 2, 2, dk);
}

function icon(id, x, y) {
  if (id === 'coconut') {
    blob(x + 6, y + 6, 5, 5, '#5a3a1e');
    blob(x + 5, y + 5, 3, 3, '#6e4826');
    rect(x + 4, y + 3, 1, 1, '#2b1a0c');
    rect(x + 7, y + 3, 1, 1, '#2b1a0c');
    rect(x + 5, y + 6, 2, 1, '#2b1a0c');
  } else if (id === 'banana') {
    rect(x + 1, y + 2, 2, 3, '#ffd23f');
    rect(x + 2, y + 5, 3, 3, '#ffd23f');
    rect(x + 4, y + 7, 5, 3, '#f4c430');
    rect(x + 8, y + 5, 3, 3, '#ffd23f');
    rect(x + 10, y + 3, 1, 2, '#5a3a1e');
    rect(x + 1, y + 1, 1, 1, '#5a3a1e');
  } else if (id === 'ruby') gem(x, y, '#e0245e', '#ffb3c6', '#9c1541');
  else if (id === 'emerald') gem(x, y, '#2ecc71', '#b9f6ca', '#1b8a4a');
  else if (id === 'sapphire') gem(x, y, '#3a86ff', '#cfe3ff', '#1f55b8');
  else if (id === 'coin') {
    blob(x + 6, y + 6, 5, 5, '#d4a017');
    blob(x + 6, y + 6, 4, 4, '#f4c430');
    rect(x + 4, y + 3, 1, 3, '#fff3b0');
    rect(x + 6, y + 4, 1, 4, '#d4a017');
  } else if (id === 'hat') {
    rect(x + 1, y + 7, 10, 2, '#2a2438');
    rect(x + 3, y + 3, 6, 4, '#3a3050');
    rect(x + 4, y + 2, 4, 1, '#3a3050');
    rect(x + 3, y + 6, 6, 1, '#d4a017');
    rect(x + 5, y + 4, 2, 2, '#f2f2f2');
  } else if (id === 'map') {
    rect(x + 1, y + 2, 10, 8, '#e8d5a3');
    rect(x + 1, y + 2, 10, 1, '#c4ad78');
    rect(x + 1, y + 9, 10, 1, '#c4ad78');
    rect(x + 3, y + 4, 3, 1, '#8a6e3c');
    rect(x + 5, y + 5, 1, 2, '#8a6e3c');
    rect(x + 7, y + 6, 1, 1, '#d62839');
    rect(x + 9, y + 6, 1, 1, '#d62839');
    rect(x + 8, y + 7, 1, 1, '#d62839');
    rect(x + 7, y + 8, 1, 1, '#d62839');
    rect(x + 9, y + 8, 1, 1, '#d62839');
  } else if (id === 'shovel') {
    seg(x + 9, y + 1, x + 4, y + 7, '#8b5a2b', 1);
    rect(x + 8, y + 1, 3, 1, '#8b5a2b');
    rect(x + 1, y + 7, 4, 4, '#9aa0a6');
    rect(x + 1, y + 7, 1, 4, '#c8ccd0');
  } else if (id === 'lantern') {
    rect(x + 4, y + 1, 4, 1, '#5a3a1a');
    rect(x + 3, y + 2, 6, 2, '#7a5a2a');
    rect(x + 3, y + 4, 6, 5, '#ffd166');
    rect(x + 5, y + 5, 2, 3, '#fff3b0');
    rect(x + 3, y + 9, 6, 2, '#7a5a2a');
    rect(x + 3, y + 4, 1, 5, '#7a5a2a');
    rect(x + 8, y + 4, 1, 5, '#7a5a2a');
  } else if (id === 'duck') {
    blob(x + 6, y + 8, 5, 3, '#ffd23f');
    blob(x + 4, y + 4, 3, 3, '#ffd23f');
    rect(x, y + 4, 2, 2, '#ff8a3c');
    rect(x + 3, y + 3, 2, 2, '#111');
    rect(x + 2, y + 2, 5, 1, '#111');
  } else if (id === 'pepper') {
    rect(x + 6, y + 1, 2, 2, '#2e7d32');
    rect(x + 4, y + 3, 5, 3, '#e8e8ff');
    rect(x + 3, y + 6, 5, 3, '#d0d0f0');
    rect(x + 2, y + 9, 3, 2, '#b8b8e0');
    rect(x + 5, y + 4, 1, 1, '#111');
    rect(x + 7, y + 4, 1, 1, '#111');
  } else if (id === 'snowball') {
    blob(x + 6, y + 6, 5, 5, '#dff3ff');
    blob(x + 5, y + 5, 3, 3, '#ffffff');
    rect(x + 8, y + 8, 2, 1, '#9fd4f5');
  } else if (id === 'record') {
    blob(x + 6, y + 6, 5, 5, '#d4a017');
    blob(x + 6, y + 6, 4, 4, '#f4c430');
    blob(x + 6, y + 6, 2, 2, '#fff3b0');
    rect(x + 6, y + 6, 1, 1, '#3a2a5a');
  } else if (id === 'bottle') {
    rect(x + 2, y + 4, 7, 5, '#7cc8a0');
    rect(x + 9, y + 5, 2, 3, '#7cc8a0');
    rect(x + 11, y + 6, 1, 1, '#a0522d');
    rect(x + 4, y + 5, 3, 3, '#f5deb3');
    rect(x + 2, y + 4, 7, 1, '#b5e8cf');
  }
}

function pipSprite(p, talking, holdLamp) {
  const moving = p.onGround && Math.abs(p.vx) > 0.3;
  const air = !p.onGround;
  const ph = p.phase;
  const sq = p.squash;
  ctx.scale(1 + sq * 0.3, 1 - sq * 0.3);
  const bob = moving ? -Math.round(Math.abs(Math.sin(ph)) * 1.5) : Math.sin(G.t * 2.5) > 0.6 ? -1 : 0;
  const la = moving ? Math.round(Math.sin(ph) * 4) : air ? 3 : 0;
  const lb = moving ? -la : air ? -2 : 0;
  const aa = moving ? Math.round(-Math.sin(ph) * 3) : 0;
  const up = air ? -4 : 0;
  if (p.sit) {
    rect(-2, -4, 11, 4, '#27495a');
    rect(8, -6, 4, 6, '#3b2416');
    ctx.translate(0, 6);
  } else {
    rect(-3 + lb, -9, 3, air ? 6 : 8, '#1d3a48');
    rect(-3 + lb, air ? -4 : -2, 4, 2, '#2b1a10');
  }
  rect(-6 - aa, -18 + bob + up, 2, 4, '#d9d2c0');
  rect(-6 - aa, -14 + bob + up, 2, 3, '#d99e63');
  rect(-4, -19 + bob, 8, 10, '#f4efe1');
  for (const y of [-18, -16, -14, -12]) rect(-4, y + bob, 8, 1, '#2f6690');
  rect(-4, -19 + bob, 2, 10, '#7a3b2e');
  rect(3, -19 + bob, 1, 10, '#8f4a3a');
  rect(-4, -10 + bob, 8, 2, '#5a3a1a');
  rect(0, -10 + bob, 2, 2, '#f4d35e');
  if (!p.sit) {
    rect(la, -9, 3, air ? 7 : 8, '#27495a');
    rect(la, air ? -3 : -2, 4, 2, '#3b2416');
  }
  rect(3 + aa, -18 + bob + up, 2, 4, '#f4efe1');
  rect(3 + aa, -14 + bob + up, 2, 3, '#f2c488');
  if (holdLamp) {
    rect(5 + aa, -13 + bob + up, 1, 2, '#5a3a1a');
    rect(4 + aa, -11 + bob + up, 4, 5, '#ffd166');
    rect(5 + aa, -10 + bob + up, 2, 3, '#fff3b0');
    rect(4 + aa, -6 + bob + up, 4, 1, '#7a5a2a');
  }
  ctx.save();
  ctx.translate(0, -19 + bob);
  if (S.flags.bigHead) ctx.scale(1.7, 1.7);
  rect(-4, -8, 8, 8, '#f2c488');
  rect(-4, -1, 8, 1, '#d99e63');
  rect(-5, -8, 2, 6, '#4a2a12');
  rect(-4, -10, 9, 3, '#d62839');
  rect(-4, -8, 9, 1, '#a81e2d');
  rect(0, -10, 1, 1, '#ff6b7a');
  const tail = Math.round(Math.sin(G.t * (moving ? 14 : 4)));
  rect(-7, -9 + tail, 3, 1, '#d62839');
  rect(-9, -8 - tail, 3, 1, '#a81e2d');
  if (p.blink > 0) rect(1, -5, 2, 1, '#3b2416');
  else {
    rect(1, -6, 2, 2, '#ffffff');
    rect(2, -6, 1, 2, '#1a1a1a');
  }
  rect(4, -5, 1, 2, '#d99e63');
  rect(1, -3, 3, talking && Math.sin(G.t * 18) > 0 ? 2 : 1, '#8a3f20');
  rect(-2, -4, 1, 1, '#f4d35e');
  ctx.restore();
}

function crabSprite(flipped, helmet) {
  if (flipped) {
    ctx.translate(0, -9);
    ctx.scale(1, -1);
  }
  const st = Math.floor(G.t * (flipped ? 16 : 10)) % 2;
  const snap = Math.sin(G.t * 8) > 0 ? 1 : 0;
  for (const lx of [-6, -4, -2, 2, 4, 6]) rect(lx, -3 + ((lx > 0) === !!st ? 0 : -1), 1, 3, '#b8341b');
  rect(-7, -8, 14, 5, '#e4572e');
  rect(-6, -9, 12, 1, '#f17a4a');
  rect(-5, -5, 10, 1, '#c9432a');
  rect(-3, -12, 1, 3, '#e4572e');
  rect(2, -12, 1, 3, '#e4572e');
  rect(-4, -13, 2, 2, '#ffffff');
  rect(2, -13, 2, 2, '#ffffff');
  rect(-3, -13, 1, 1, '#111');
  rect(2, -13, 1, 1, '#111');
  rect(-11, -11 + snap, 4, 4, '#e4572e');
  rect(-11, -12 + snap, 1, 2, '#f17a4a');
  rect(7, -11 + snap, 4, 4, '#e4572e');
  rect(10, -12 + snap, 1, 2, '#f17a4a');
  if (helmet) {
    rect(-4, -12, 8, 3, '#5a3a1e');
    rect(-3, -13, 6, 1, '#6e4826');
  }
}

function monkeySprite(o) {
  for (let i = 0; i < 10; i++) rect(-5 - i * 0.9, -3 - i * 1.1 + Math.sin(G.t * 3 + i * 0.6) * 1.5, 2, 1, '#5c3317');
  rect(-15, -15 + Math.sin(G.t * 3 + 6) * 1.5, 3, 2, '#5c3317');
  rect(-5, -13, 10, 12, '#7b4b2a');
  rect(-3, -11, 6, 8, '#d9a066');
  rect(-5, -3, 4, 3, '#5c3317');
  rect(1, -3, 4, 3, '#5c3317');
  const scratch = !o.talking && !o.leaving && Math.sin(G.t * 1.3) > 0.4 ? Math.round(Math.abs(Math.sin(G.t * 12))) : 0;
  if (scratch || o.leaving) rect(4, -21 - scratch, 3, 9, '#7b4b2a');
  else rect(4, -12, 3, 8, '#7b4b2a');
  rect(-7, -12, 3, 7, '#6b4022');
  rect(-5, -22, 10, 9, '#7b4b2a');
  rect(-3, -20, 7, 7, '#e0b080');
  rect(-7, -19, 2, 4, '#e0b080');
  rect(5, -19, 2, 4, '#e0b080');
  rect(-1, -18, 2, 2, '#fff');
  rect(2, -18, 2, 2, '#fff');
  rect(0, -18, 1, 2, '#111');
  rect(3, -18, 1, 2, '#111');
  rect(0, -15, 3, 1, '#b07a50');
  rect(-1, -14, 4, o.talking ? 2 : 1, '#5c3317');
  if (o.hat) {
    rect(-8, -24, 16, 2, '#2a2438');
    rect(-5, -29, 10, 5, '#3a3050');
    rect(-5, -25, 10, 1, '#d4a017');
    rect(-1, -28, 2, 2, '#f2f2f2');
  }
}

function parrotSprite(talking) {
  rect(-7, -5, 3, 11, '#3a86ff');
  rect(-8, -3, 1, 10, '#e63946');
  rect(-5, -2, 1, 9, '#ffd23f');
  rect(-2, -1, 1, 2, '#e9b44c');
  rect(1, -1, 1, 2, '#e9b44c');
  rect(-4, -13, 8, 12, '#2fbf4a');
  rect(-2, -11, 5, 8, '#52d96a');
  const flap = talking ? Math.round(Math.sin(G.t * 20) * 3) : 0;
  rect(-6, -11 - Math.max(0, flap), 4, 7, '#ffd23f');
  rect(-6, -8, 4, 4, '#1f9a3a');
  rect(-6, -5, 4, 2, '#3a86ff');
  rect(-3, -20, 7, 7, '#e63946');
  rect(-2, -21, 5, 1, '#ff6b6b');
  rect(4, -18, 3, 3, '#f4d35e');
  rect(5, -15, 2, 2, '#333');
  rect(1, -18, 2, 2, '#fff');
  rect(2, -18, 1, 1, Math.sin(G.t * 0.7) > 0.95 ? '#fff' : '#111');
}

function ghostSprite(o) {
  const w = Math.sin(G.t * 3);
  for (let i = 0; i < 10; i++) {
    const wd = 12 - i * 1.1;
    rect(-wd / 2 + Math.sin(G.t * 4 + i * 0.7) * (i * 0.35), -6 + i * 1.6 - 8, wd, 2, i % 2 ? '#7fe8c9' : '#a6fff0');
  }
  rect(-8, -34, 16, 22, '#8ff5d6');
  rect(-8, -34, 3, 22, '#5ccfae');
  rect(5, -34, 3, 22, '#b9fff0');
  rect(-1, -34, 2, 22, '#5ccfae');
  for (const y of [-30, -25, -20]) rect(1, y, 2, 2, '#e6fff9');
  rect(-12, -32 + w, 4, 12, '#8ff5d6');
  rect(8, -32 - w, 4, 12, '#8ff5d6');
  rect(-12, -21 + w, 4, 3, '#d9fff6');
  rect(8, -21 - w, 4, 3, '#d9fff6');
  rect(-6, -46, 12, 12, '#c9fff2');
  rect(-6, -46, 2, 12, '#9ef0d8');
  rect(-3, -42, 3, 3, '#0b2b28');
  rect(2, -42, 3, 3, '#0b2b28');
  rect(-2, -41, 1, 1, '#ff5c5c');
  rect(3, -41, 1, 1, '#ff5c5c');
  for (let i = 0; i < 7; i++) rect(-6 + i * 2, -36 + (i % 2) + (o.talking ? Math.round(Math.abs(Math.sin(G.t * 14))) : 0), 2, 5 + (i % 3), '#e6fff9');
  rect(-2, -37, 5, o.talking ? 2 : 1, '#0b2b28');
  if (o.hat) {
    rect(-11, -48, 22, 3, '#2a2438');
    rect(-7, -55, 14, 7, '#3a3050');
    rect(-7, -50, 14, 1, '#d4a017');
    rect(-2, -54, 4, 3, '#f2f2f2');
    rect(-11, -49, 3, 2, '#3a3050');
    rect(8, -49, 3, 2, '#3a3050');
  } else {
    rect(-5, -48, 3, 2, '#c9fff2');
    rect(1, -49, 2, 3, '#c9fff2');
  }
}

function bettySprite(talking) {
  rect(-9, -30, 18, 30, '#3d6b8a');
  rect(-7, -28, 14, 28, '#f4efe1');
  rect(-7, -18, 14, 18, '#c44d58');
  rect(-13, -28, 4, 14, '#f2c488');
  rect(9, -28, 4, 14, '#f2c488');
  const wipe = Math.round(Math.sin(G.t * 3) * 3);
  rect(10 + wipe, -15, 6, 4, '#e8e8e8');
  rect(-6, -42, 12, 12, '#f2c488');
  blob(0, -46, 10, 7, '#c0392b');
  blob(-8, -40, 4, 7, '#c0392b');
  blob(8, -40, 4, 7, '#c0392b');
  blob(0, -52, 5, 4, '#d9503f');
  rect(-3, -39, 2, 2, '#111');
  rect(2, -39, 2, 2, '#111');
  rect(-4, -41, 3, 1, '#7a2a1c');
  rect(2, -41, 3, 1, '#7a2a1c');
  rect(-2, -34, 5, talking && Math.sin(G.t * 16) > 0 ? 3 : 1, '#8a2f2f');
  rect(-7, -36, 1, 3, '#f4d35e');
  rect(6, -36, 1, 3, '#f4d35e');
}

function pirateSprite(i, talking) {
  const coat = ['#7a2e2e', '#2e5a7a', '#4a6b2e'][i];
  const skin = ['#e0a070', '#c68650', '#f2c488'][i];
  rect(-7, -22, 14, 22, coat);
  rect(-2, -22, 4, 22, '#f4efe1');
  rect(-7, -22, 2, 22, 'rgba(0,0,0,0.2)');
  rect(-10, -20, 3, 12, coat);
  rect(7, -20, 3, 12, coat);
  const sip = Math.sin(G.t * 0.8 + i * 2) > 0.7 ? -6 : 0;
  rect(8, -12 + sip, 5, 6, '#b8b8b8');
  rect(8, -13 + sip, 5, 1, '#fff8e0');
  rect(-5, -32, 10, 10, skin);
  rect(-2, -29, 2, 2, '#111');
  rect(2, -29, 2, 2, i === 0 ? '#111' : '#111');
  if (i === 0) {
    rect(-6, -36, 12, 4, '#2a2438');
    rect(-8, -33, 16, 1, '#2a2438');
    rect(-5, -26, 10, 5, '#3b2416');
    rect(1, -30, 4, 3, '#111');
    rect(-5, -31, 10, 1, '#111');
  } else if (i === 1) {
    rect(-6, -35, 12, 4, '#d62839');
    rect(5, -33, 3, 5, '#d62839');
    rect(-4, -25, 8, 1, '#3b2416');
    rect(-6, -27, 1, 2, '#f4d35e');
  } else {
    blob(0, -35, 7, 3, '#e8d5a3');
    rect(-9, -33, 18, 1, '#c4ad78');
    rect(-5, -27, 10, 7, '#e8e8e8');
  }
  rect(-1, -24, 3, talking && Math.sin(G.t * 16) > 0 ? 2 : 1, '#5a2a1a');
}

function ratSprite() {
  const run = Math.floor(G.t * 12) % 2;
  for (let i = 0; i < 8; i++) rect(-6 - i, -2 - Math.sin(i * 0.6 + G.t * 6) * 1.2, 1, 1, '#d9a6a6');
  rect(-5, -5, 9, 4, '#8a8a8a');
  rect(-4, -6, 7, 1, '#a5a5a5');
  rect(3, -6, 4, 4, '#8a8a8a');
  rect(7, -4, 1, 1, '#ffb3c6');
  rect(3, -8, 2, 2, '#d9a6a6');
  rect(5, -5, 1, 1, '#111');
  rect(-4 + run, -1, 1, 1, '#d9a6a6');
  rect(2 - run, -1, 1, 1, '#d9a6a6');
}

function skeletonSprite(sitting) {
  const b = '#e8e2d0';
  const d = '#b8b09a';
  if (sitting) {
    rect(-2, -4, 12, 3, b);
    rect(9, -8, 3, 5, b);
    ctx.translate(0, 0);
  } else {
    rect(-3, -10, 2, 10, b);
    rect(1, -10, 2, 10, b);
  }
  const oy = sitting ? 6 : 0;
  rect(-1, -20 + oy, 2, 10, b);
  for (const y of [-19, -16, -13]) rect(-4, y + oy, 8, 1, b);
  rect(-6, -19 + oy, 2, 8, d);
  rect(4, -19 + oy, 2, 8, d);
  rect(-4, -29 + oy, 8, 8, b);
  rect(-3, -22 + oy, 6, 2, b);
  rect(-3, -27 + oy, 2, 3, '#1a1024');
  rect(1, -27 + oy, 2, 3, '#1a1024');
  rect(-1, -24 + oy, 1, 1, '#1a1024');
  for (let i = 0; i < 3; i++) rect(-2 + i * 2, -21 + oy, 1, 1, '#1a1024');
}

function tikiSprite(talking, gems) {
  const top = -64;
  rect(-10, top, 20, 64, '#7a4b2a');
  rect(-10, top, 3, 64, '#8f5a33');
  rect(7, top, 3, 64, '#5e3a20');
  dither(4, top, 3, 64, '#5e3a20');
  rect(-10, top + 22, 20, 1, '#4e2f18');
  rect(-10, top + 42, 20, 1, '#4e2f18');
  rect(-14, top - 5, 28, 6, '#a0522d');
  rect(-14, top - 5, 28, 1, '#c06a3d');
  ['#e63946', '#ffd23f', '#2ecc71', '#3a86ff', '#c77dff', '#e63946'].forEach((c, i) => {
    rect(-13 + i * 5, top - 13 + (i % 2) * 2, 3, 9, c);
    rect(-13 + i * 5, top - 13 + (i % 2) * 2, 1, 9, 'rgba(255,255,255,0.35)');
  });
  rect(-9, top + 9, 8, 3, '#4e2f18');
  rect(1, top + 9, 8, 3, '#4e2f18');
  rect(-7, top + 13, 4, 4, gems ? '#2ecc71' : '#1a0e06');
  rect(3, top + 13, 4, 4, gems ? '#3a86ff' : '#1a0e06');
  rect(-2, top + 2, 4, 4, gems ? '#e0245e' : '#1a0e06');
  if (gems) {
    rect(-7, top + 13, 1, 1, '#fff');
    rect(3, top + 13, 1, 1, '#fff');
    rect(-2, top + 2, 1, 1, '#fff');
  }
  rect(-1, top + 17, 3, 8, '#8b5a33');
  rect(-3, top + 24, 7, 2, '#8b5a33');
  const open = talking ? Math.round(Math.abs(Math.sin(G.t * 12)) * 4) : 0;
  rect(-7, top + 28, 14, 6 + open, '#2a160a');
  for (let i = 0; i < 6; i++) {
    rect(-6 + i * 2.2, top + 28, 1, 2, '#f2e8cf');
    rect(-6 + i * 2.2, top + 32 + open, 1, 2, '#f2e8cf');
  }
  for (let i = 0; i < 5; i++) rect(-8 + (i % 2) * 9, top + 46 + i * 3.4, 6, 1, '#4e2f18');
}

function chestSprite(open) {
  rect(-11, -12, 22, 12, '#7a4a22');
  rect(-11, -12, 22, 1, '#9a6232');
  rect(-11, -8, 22, 2, '#d4a017');
  rect(-11, -12, 2, 12, '#d4a017');
  rect(9, -12, 2, 12, '#d4a017');
  dither(-8, -5, 16, 5, '#5a3418');
  if (open <= 0) {
    rect(-11, -18, 22, 6, '#8a5a2a');
    rect(-10, -19, 20, 1, '#a8703a');
    rect(-11, -15, 22, 1, '#d4a017');
    rect(-2, -14, 4, 5, '#f4d35e');
    rect(-1, -12, 2, 2, '#5a3418');
  } else {
    rect(-11, -12 - 11 * open, 22, 11 * open, '#5a3418');
    rect(-11, -13 - 11 * open, 22, 1, '#d4a017');
    blob(0, -12, 10, 3, '#f4c430');
    blob(-3, -14, 4, 2, '#ffe066');
    rect(3, -15, 2, 2, '#e0245e');
    rect(-6, -14, 2, 2, '#3a86ff');
    for (let i = 0; i < 5; i++) if (Math.sin(G.t * 7 + i * 2) > 0.6) rect(-8 + i * 4, -16, 1, 1, '#ffffff');
  }
}

function barrel(x, y) {
  rect(x - 8, y - 20, 16, 20, '#7a4a22');
  rect(x - 9, y - 16, 18, 12, '#8a5a2a');
  rect(x - 9, y - 16, 2, 12, '#a8703a');
  for (let i = -5; i < 8; i += 4) rect(x + i, y - 20, 1, 20, '#5a3418');
  rect(x - 9, y - 16, 18, 2, '#4a4a4a');
  rect(x - 9, y - 6, 18, 2, '#4a4a4a');
  rect(x - 8, y - 20, 16, 1, '#a8703a');
}

function crate(x, y, w, h) {
  rect(x, y - h, w, h, '#8a6a3a');
  rect(x, y - h, w, 2, '#a8854a');
  rect(x, y - 2, w, 2, '#5a4424');
  rect(x, y - h, 2, h, '#6e5430');
  rect(x + w - 2, y - h, 2, h, '#5a4424');
  seg(x + 2, y - h + 2, x + w - 3, y - 3, '#6e5430', 2);
}

function torch(x, y) {
  rect(x - 1, y, 2, 10, '#5a3a1a');
  rect(x - 4, y - 1, 8, 3, '#3a2a1a');
  const f = Math.sin(G.t * 20 + x) > 0 ? 1 : 0;
  rect(x - 3, y - 7 - f, 6, 6 + f, '#ff9f1c');
  rect(x - 2, y - 9 - f, 4, 6, '#ffd166');
  rect(x - 1, y - 10 - f * 2, 2, 4, '#fff3b0');
}

function signpost(x, gy, arrows) {
  rect(x - 1, gy - 28, 3, 28, '#6b4226');
  arrows.forEach(([dir, c], i) => {
    const y = gy - 28 + i * 9;
    rect(x - 12, y, 24, 6, c);
    rect(x - 12, y, 24, 1, 'rgba(255,255,255,0.3)');
    for (let k = 0; k < 4; k++) rect(dir > 0 ? x + 12 + k : x - 13 - k, y + k * 0.5 + 1, 1, 4 - k, c);
    for (let k = 0; k < 5; k++) rect(x - 8 + k * 4, y + 2, 2, 2, '#3b2416');
  });
}

function stalactite(x, len, c) {
  for (let i = 0; i < len; i++) {
    const w = Math.max(1, (1 - i / len) * len * 0.35);
    rect(x - w / 2, i, w, 1, c);
  }
}

function crystal(x, gy, h, c, hl) {
  for (let i = 0; i < h; i++) {
    const w = Math.max(1, Math.min(i * 0.8 + 1, (h - i) * 0.45 + 1));
    rect(x - w / 2, gy - h + i, w, 1, c);
    rect(x - w / 2, gy - h + i, 1, 1, hl);
  }
}

function penguinSprite(talking) {
  const wob = Math.round(Math.sin(G.t * 5));
  rect(-6, -18, 12, 18, '#1d2333');
  rect(-4, -15, 8, 14, '#f4f6fa');
  rect(-8, -14 + wob, 2, 9, '#1d2333');
  rect(6, -14 - wob, 2, 9, '#1d2333');
  rect(-5, -1, 4, 2, '#ff9f1c');
  rect(1, -1, 4, 2, '#ff9f1c');
  rect(-5, -26, 10, 9, '#1d2333');
  rect(-3, -23, 2, 2, '#fff');
  rect(1, -23, 2, 2, '#fff');
  rect(-2, -22, 1, 1, '#111');
  rect(2, -22, 1, 1, '#111');
  rect(-1, -20, 3, talking && Math.sin(G.t * 16) > 0 ? 3 : 2, '#ff9f1c');
  rect(-8, -28, 16, 2, '#2a2438');
  rect(-5, -33, 10, 5, '#3a3050');
  rect(-5, -29, 10, 1, '#d4a017');
  rect(-1, -32, 2, 2, '#f2f2f2');
  rect(3, -15, 5, 2, '#d62839');
  rect(6, -13, 2, 5, '#d62839');
}

function snowmanSprite(talking) {
  blob(0, -9, 11, 9, '#eef6ff');
  blob(0, -24, 8, 7, '#f6fbff');
  blob(0, -36, 6, 6, '#ffffff');
  rect(8, -26, 9, 1, '#5a3a1a');
  rect(-17, -27, 9, 1, '#5a3a1a');
  rect(15, -29, 1, 3, '#5a3a1a');
  rect(-3, -38, 2, 2, '#111');
  rect(1, -39, 4, 3, '#111');
  rect(-5, -40, 10, 1, '#111');
  rect(0, -35, 5, 2, '#ff8a3c');
  for (let i = 0; i < 4; i++) rect(-3 + i * 2, -32 + (talking && Math.sin(G.t * 16) > 0 ? 1 : 0) + (i === 0 || i === 3 ? -1 : 0), 1, 1, '#111');
  for (const y of [-27, -22, -17]) rect(-1, y, 2, 2, '#3a3050');
  rect(-6, -31, 12, 2, '#d62839');
  rect(3, -29, 2, 6, '#d62839');
}

function mouseSprite(o) {
  for (let i = 0; i < 9; i++) rect(-6 - i, -3 - Math.sin(i * 0.5 + G.t * 3) * 2, 1, 1, '#e8a0a8');
  rect(-5, -14, 10, 14, o.chef ? '#f4f6fa' : '#8a5ac0');
  rect(-3, -12, 6, 10, o.chef ? '#ffffff' : '#a87ad8');
  rect(-7, -12, 2, 7, '#b8b0a8');
  rect(5, -12, 2, 7, '#b8b0a8');
  rect(-4, -1, 3, 2, '#e8a0a8');
  rect(1, -1, 3, 2, '#e8a0a8');
  rect(-5, -23, 10, 9, '#c8c0b8');
  blob(-6, -24, 3, 3, '#c8c0b8');
  blob(6, -24, 3, 3, '#c8c0b8');
  blob(-6, -24, 1.5, 1.5, '#e8a0a8');
  blob(6, -24, 1.5, 1.5, '#e8a0a8');
  rect(-3, -20, 2, 2, '#111');
  rect(2, -20, 2, 2, '#111');
  rect(-1, -17, 2, 2, '#e8a0a8');
  rect(-6, -17, 4, 1, '#888');
  rect(3, -17, 4, 1, '#888');
  rect(-1, -15, 3, o.talking && Math.sin(G.t * 16) > 0 ? 2 : 1, '#7a4a4a');
  if (o.chef) {
    rect(-5, -27, 10, 4, '#ffffff');
    blob(0, -30, 6, 4, '#ffffff');
    rect(6, -10, 2, 2, '#c8ccd0');
    rect(7, -16, 1, 6, '#8b5a2b');
  } else {
    rect(-5, -26, 10, 3, '#f4c430');
    for (const cx of [-5, -1, 3]) rect(cx, -29, 2, 3, '#f4c430');
    rect(-1, -28, 2, 1, '#e0245e');
    rect(-7, -14, 14, 2, '#f4c430');
  }
}

function flamingoSprite(talking) {
  const dip = Math.round(Math.sin(G.t * 1.5) * 1.5);
  rect(0, -16, 1, 16, '#ff7ab0');
  rect(3, -10, 1, 5, '#ff7ab0');
  rect(3, -6, 3, 1, '#ff7ab0');
  blob(1, -22, 8, 6, '#ff8fc0');
  blob(-3, -22, 5, 4, '#ffb3d6');
  rect(7, -36 + dip, 2, 14, '#ff8fc0');
  rect(6, -40 + dip, 5, 5, '#ff8fc0');
  rect(11, -38 + dip, 3, 2, '#f4f6fa');
  rect(13, -37 + dip, 2, talking && Math.sin(G.t * 16) > 0 ? 3 : 2, '#111');
  rect(5, -39 + dip, 7, 2, '#111');
  rect(8, -39 + dip, 1, 1, '#5ee7ff');
  rect(4, -26, 6, 2, '#111');
  rect(6, -24, 2, 2, '#f4c430');
}

function daveSprite(talking) {
  const b = Math.round(Math.abs(Math.sin(G.t * 7.5)) * 3);
  const arm = Math.sin(G.t * 7.5) > 0;
  const bone = '#e8e2d0';
  rect(-3 - (arm ? 1 : 0), -10, 2, 10, bone);
  rect(1 + (arm ? 1 : 0), -10, 2, 10, bone);
  rect(-4, -1, 3, 1, '#f4f6fa');
  rect(1, -1, 3, 1, '#f4f6fa');
  rect(-1, -21 - b, 2, 11, bone);
  for (const y of [-20, -17, -14]) rect(-4, y - b, 8, 1, bone);
  rect(-5, -21 - b, 10, 2, '#c77dff');
  if (arm) {
    seg(4, -19 - b, 9, -30 - b, bone);
    seg(-4, -19 - b, -8, -12 - b, bone);
  } else {
    seg(-4, -19 - b, -9, -30 - b, bone);
    seg(4, -19 - b, 8, -12 - b, bone);
  }
  rect(-4, -30 - b, 8, 8, bone);
  rect(-3, -23 - b, 6, 2, bone);
  blob(0, -33 - b, 8, 5, '#3a2a5a');
  rect(-4, -28 - b, 8, 3, '#111');
  rect(-3, -28 - b, 2, 1, '#5ee7ff');
  rect(1, -28 - b, 2, 1, '#ff7cf4');
  for (let i = 0; i < 3; i++) rect(-2 + i * 2, -23 - b + (talking && Math.sin(G.t * 16) > 0 ? 1 : 0), 1, 1, '#1a1024');
}

function djSprite(talking) {
  rect(-7, -20, 14, 20, '#3a2a5a');
  rect(-7, -20, 14, 2, '#ff7cf4');
  rect(-6, -40, 12, 20, '#a0522d');
  rect(-6, -40, 2, 20, '#c06a3d');
  rect(-4, -36, 3, 4, '#5ee7ff');
  rect(1, -36, 3, 4, '#5ee7ff');
  rect(-1, -31, 2, 5, '#7a3b1e');
  rect(-4, -25, 8, talking && Math.sin(G.t * 16) > 0 ? 4 : 2, '#1a0e06');
  for (let i = 0; i < 4; i++) rect(-3 + i * 2, -25, 1, 1, '#f2e8cf');
  rect(-8, -38, 2, 8, '#111');
  rect(6, -38, 2, 8, '#111');
  rect(-7, -42, 14, 2, '#111');
  for (const [i, c] of [[-5, '#ff7cf4'], [-1, '#ffe680'], [3, '#5ee7ff']]) rect(i, -47, 3, 6, c);
  const sp = Math.round(Math.sin(G.t * 7.5) * 2);
  rect(-11, -18 + sp, 4, 3, '#a0522d');
  rect(7, -18 - sp, 4, 3, '#a0522d');
}
