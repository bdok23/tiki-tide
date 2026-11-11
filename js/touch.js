(() => {
  if (!TOUCH) return;
  const pad = document.createElement('div');
  pad.id = 'pad';
  const add = (label, key, cls) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = cls;
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
    pad.appendChild(b);
  };
  add('◀', 'ArrowLeft', 'l');
  add('▶', 'ArrowRight', 'r');
  add('▲', 'ArrowUp', 'u');
  add('▼', 'ArrowDown', 'd');
  add('A', 'Enter', 'a');
  add('LOOK', 'l', 'look');
  document.body.appendChild(pad);
  applyPadSize();
  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
})();
