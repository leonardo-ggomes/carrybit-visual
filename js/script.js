
// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
const NUM_BITS = 4;
let value      = 0;   // 0–15
let clickCount = 0;

// Each card tracks its own total accumulated rotation (multiples of -180deg).
// Bit=0 → even multiple (0, -360, -720…)  → front face visible
// Bit=1 → odd multiple  (-180, -540, …)   → back face visible
// This way every flip always continues in the SAME direction (never reverses).
const cardRotation = [0, 0, 0, 0]; // degrees, per card index

// ═══════════════════════════════════════════════════════
//  BUILD CARDS
// ═══════════════════════════════════════════════════════
const cardsRow = document.getElementById('cardsRow');

const BIT_LABELS = ['Bit 3', 'Bit 2', 'Bit 1', 'Bit 0'];
const BIT_VALUES = [8, 4, 2, 1];

function buildCards() {
  cardsRow.innerHTML = '';

  for (let i = 0; i < NUM_BITS; i++) {
    const unit = document.createElement('div');
    unit.className = 'card-unit';
    unit.id = `card-unit-${i}`;
    const hasHook = i < NUM_BITS - 1;

    unit.innerHTML = `
      <div class="card-pivot"></div>
      <div class="card-flipper-wrap">
        <div class="card-flipper" id="flipper-${i}">
          <div class="card-face face-zero">
            <div class="card-notch"></div>
            <div class="card-screw tl"></div>
            <div class="card-screw tr"></div>
            <div class="card-digit">0</div>
            <div class="card-screw bl"></div>
            <div class="card-screw br"></div>
          </div>
          <div class="card-face face-one">
            <div class="card-notch"></div>
            <div class="card-screw tl"></div>
            <div class="card-screw tr"></div>
            <div class="card-digit">1</div>
            <div class="card-screw bl"></div>
            <div class="card-screw br"></div>
          </div>
        </div>
        ${hasHook ? `<div class="carry-hook-wrap"><div class="carry-hook" id="hook-${i}"></div></div>` : ''}
      </div>
      <div class="card-bit-label">
        ${BIT_LABELS[i]}
        <strong>${BIT_VALUES[i]}</strong>
      </div>
    `;

    cardsRow.appendChild(unit);
  }
}

// Apply the current cardRotation[i] directly as a CSS transform.
// The CSS `transition` on .card-flipper handles the smooth animation.
function applyRotation(i) {
  const flipper = document.getElementById(`flipper-${i}`);
  flipper.style.transform = `rotateX(${cardRotation[i]}deg)`;
}

// ═══════════════════════════════════════════════════════
//  SYNC DISPLAY NUMBERS
// ═══════════════════════════════════════════════════════
function updateDisplay() {
  const bits = valueToBits(value);
  document.getElementById('displayBinary').textContent  = bits.join('');
  document.getElementById('displayDecimal').textContent = value;
  document.getElementById('displayHex').textContent     = '0x' + value.toString(16).toUpperCase();
}

// Full instant sync (used after reset)
function syncVisuals() {
  const bits = valueToBits(value);
  for (let i = 0; i < NUM_BITS; i++) {
    const flipper = document.getElementById(`flipper-${i}`);
    const hook    = document.getElementById(`hook-${i}`);

    // Snap to correct rotation instantly (disable transition briefly)
    flipper.style.transition = 'none';
    flipper.style.transform  = `rotateX(${cardRotation[i]}deg)`;
    void flipper.offsetWidth; // reflow
    flipper.style.transition = '';

    if (hook) {
      bits[i] === 1
        ? hook.classList.add('engaged')
        : hook.classList.remove('engaged');
    }
  }
  updateDisplay();
}

// ═══════════════════════════════════════════════════════
//  INCREMENT — animated carry chain
// ═══════════════════════════════════════════════════════
function increment() {
  if (value >= 15) {
    flashOverflow();
    setTimeout(() => {
      // Reset rotations to nearest even multiple of 360
      // so cards snap cleanly back to 0-face
      for (let i = 0; i < NUM_BITS; i++) {
        // Round up to next multiple of -360 (complete full turns)
        const turns = Math.ceil(Math.abs(cardRotation[i]) / 360);
        cardRotation[i] = -(turns * 360);
      }
      value      = 0;
      clickCount = 0;
      document.getElementById('crankCount').textContent = 0;
      clearLog();
      syncVisuals();
    }, 1500);
    return;
  }

  const prevBits = valueToBits(value);
  value++;
  clickCount++;
  document.getElementById('crankCount').textContent = clickCount;

  const newBits = valueToBits(value);

  // Collect changed cards, sort so LSB (index 3) fires first
  const changed = [];
  for (let i = 0; i < NUM_BITS; i++) {
    if (prevBits[i] !== newBits[i]) changed.push(i);
  }
  changed.sort((a, b) => b - a);  // highest index = LSB = first

  // Fire each flip with a staggered delay
  changed.forEach((idx, step) => {
    setTimeout(() => {
      // Always subtract 180 → keeps spinning in the same direction forever
      cardRotation[idx] -= 180;
      applyRotation(idx);

      const hook = document.getElementById(`hook-${idx}`);
      if (hook) {
        // Hook engaged when card shows '1' (odd number of half-turns)
        const halfTurns = Math.round(Math.abs(cardRotation[idx]) / 180);
        halfTurns % 2 === 1
          ? hook.classList.add('engaged')
          : hook.classList.remove('engaged');
      }

      updateDisplay();
    }, step * 160);
  });

  addLogEntry(newBits.join(''), value);
}

// ═══════════════════════════════════════════════════════
//  CRANK ANIMATION
// ═══════════════════════════════════════════════════════
const crankDisk = document.getElementById('crankDisk');

crankDisk.addEventListener('click', () => {
  // Spin animation
  crankDisk.classList.remove('spinning');
  void crankDisk.offsetWidth;
  crankDisk.classList.add('spinning');
  crankDisk.addEventListener('animationend', () => {
    crankDisk.classList.remove('spinning');
  }, { once: true });

  increment();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'Enter') {
    e.preventDefault();
    crankDisk.click();
  }
  if (e.code === 'KeyR') {
    document.getElementById('btnReset').click();
  }
});

// ═══════════════════════════════════════════════════════
//  OVERFLOW
// ═══════════════════════════════════════════════════════
function flashOverflow() {
  const msg = document.getElementById('overflowMsg');
  msg.classList.remove('show');
  void msg.offsetWidth;
  msg.classList.add('show');
  // Animate all cards one more half-turn forward (carry chain collapsing to 0000)
  for (let i = 0; i < NUM_BITS; i++) {
    setTimeout(() => {
      cardRotation[i] -= 180; // each was at "1" (odd), this takes it to even = 0
      applyRotation(i);
      const hook = document.getElementById(`hook-${i}`);
      if (hook) hook.classList.remove('engaged');
    }, i * 120);
  }
}

// ═══════════════════════════════════════════════════════
//  LOG
// ═══════════════════════════════════════════════════════
function addLogEntry(bits, dec) {
  const entries = document.getElementById('stepEntries');
  // Remove "latest" from previous
  entries.querySelectorAll('.latest').forEach(e => e.classList.remove('latest'));

  const entry = document.createElement('div');
  entry.className = 'step-entry latest';
  entry.innerHTML = `
    <span class="step-num">#${dec.toString().padStart(2,'0')}</span>
    <span class="step-bits">${bits}</span>
    <span class="step-eq">=</span>
    <span class="step-dec">${dec}</span>
    <span class="step-eq" style="font-size:10px;color:var(--wood-dark)">
      &nbsp;(0x${dec.toString(16).toUpperCase()})
    </span>
  `;
  entries.prepend(entry);

  // Keep max 16 entries
  while (entries.children.length > 16) {
    entries.removeChild(entries.lastChild);
  }
}

function clearLog() {
  document.getElementById('stepEntries').innerHTML = '';
}

// ═══════════════════════════════════════════════════════
//  RESET
// ═══════════════════════════════════════════════════════
document.getElementById('btnReset').addEventListener('click', () => {
  value = 0; clickCount = 0;
  document.getElementById('crankCount').textContent = 0;
  clearLog();
  // Snap all rotations to 0 (nearest clean full turn)
  for (let i = 0; i < NUM_BITS; i++) {
    cardRotation[i] = 0;
  }
  syncVisuals();
  addLogEntry('0000', 0);
});

// ═══════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════
function valueToBits(v) {
  return [(v >> 3) & 1, (v >> 2) & 1, (v >> 1) & 1, v & 1];
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
buildCards();
syncVisuals();

// Add initial log entry
addLogEntry('0000', 0);
