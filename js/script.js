
// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
const NUM_BITS = 8;
let value      = 0;   // 0–255
let clickCount = 0;

// Accumulated rotation per card (always decrements by 180 — never reverses)
// Index 0 = bit 7 (MSB), index 7 = bit 0 (LSB)
const cardRotation = new Array(NUM_BITS).fill(0);

// ═══════════════════════════════════════════════════════
//  CARD METADATA
// ═══════════════════════════════════════════════════════
// All 8 cards in order MSB→LSB (indices 0–7)
const BIT_LABELS = ['Bit 7','Bit 6','Bit 5','Bit 4','Bit 3','Bit 2','Bit 1','Bit 0'];
const BIT_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];

// ═══════════════════════════════════════════════════════
//  BUILD CARDS  (high nibble = bits 7-4, low = bits 3-0)
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
//  BUILD CARDS — todos os 8 em linha única
// ═══════════════════════════════════════════════════════
function buildCards() {
  const row = document.getElementById('cardsRow');
  row.innerHTML = '';

  for (let i = 0; i < NUM_BITS; i++) {
    const unit = document.createElement('div');
    unit.className = 'card-unit';
    unit.id = `card-unit-${i}`;
    // Todos exceto o MSB (índice 0) têm gancho de carry
    const hasHook = i > 0;

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
    row.appendChild(unit);
  }
}

// ═══════════════════════════════════════════════════════
//  ROTATION HELPERS
// ═══════════════════════════════════════════════════════
function applyRotation(i) {
  const flipper = document.getElementById(`flipper-${i}`);
  if (flipper) flipper.style.transform = `rotateX(${cardRotation[i]}deg)`;
}

function syncVisuals() {
  const bits = valueToBits(value);
  for (let i = 0; i < NUM_BITS; i++) {
    const flipper = document.getElementById(`flipper-${i}`);
    const hook    = document.getElementById(`hook-${i}`);
    if (!flipper) continue;
    flipper.style.transition = 'none';
    flipper.style.transform  = `rotateX(${cardRotation[i]}deg)`;
    void flipper.offsetWidth;
    flipper.style.transition = '';
    if (hook) {
      bits[i] === 1 ? hook.classList.add('engaged') : hook.classList.remove('engaged');
    }
  }
  updateDisplay();
}

// ═══════════════════════════════════════════════════════
//  DISPLAY
// ═══════════════════════════════════════════════════════
function updateDisplay() {
  const bits = valueToBits(value);
  // Show as two groups of 4 for readability: "1010 0110"
  const highNibble = bits.slice(0,4).join('');
  const lowNibble  = bits.slice(4,8).join('');
  document.getElementById('displayBinary').textContent  = highNibble + ' ' + lowNibble;
  document.getElementById('displayDecimal').textContent = value;
  document.getElementById('displayHex').textContent     = '0x' + value.toString(16).toUpperCase().padStart(2,'0');
}

// ═══════════════════════════════════════════════════════
//  INCREMENT — animated carry chain
// ═══════════════════════════════════════════════════════
let isBusy = false; // debounce during overflow animation

function increment() {
  if (isBusy) return;

  if (value >= 255) {
    flashOverflow();
    return;
  }

  const prevBits = valueToBits(value);
  value++;
  clickCount++;
  document.getElementById('crankCount').textContent = clickCount;

  const newBits = valueToBits(value);

  // Collect changed bits, LSB fires first (index 7 → index 0)
  const changed = [];
  for (let i = 0; i < NUM_BITS; i++) {
    if (prevBits[i] !== newBits[i]) changed.push(i);
  }
  changed.sort((a, b) => b - a); // highest index first = LSB first

  changed.forEach((idx, step) => {
    setTimeout(() => {
      cardRotation[idx] -= 180;
      applyRotation(idx);

      const hook = document.getElementById(`hook-${idx}`);
      if (hook) {
        const halfTurns = Math.round(Math.abs(cardRotation[idx]) / 180);
        halfTurns % 2 === 1 ? hook.classList.add('engaged') : hook.classList.remove('engaged');
      }
      updateDisplay();
    }, step * 140);
  });

  addLogEntry(valueToBits(value).join(''), value);
}

// ═══════════════════════════════════════════════════════
//  CRANK
// ═══════════════════════════════════════════════════════
const crankDisk = document.getElementById('crankDisk');

crankDisk.addEventListener('click', () => {
  crankDisk.classList.remove('spinning');
  void crankDisk.offsetWidth;
  crankDisk.classList.add('spinning');
  crankDisk.addEventListener('animationend', () => crankDisk.classList.remove('spinning'), { once: true });
  increment();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'Enter') {
    e.preventDefault(); crankDisk.click();
  }
  if (e.code === 'KeyR') document.getElementById('btnReset').click();
});

// ═══════════════════════════════════════════════════════
//  OVERFLOW
// ═══════════════════════════════════════════════════════
function flashOverflow() {
  isBusy = true;
  const msg = document.getElementById('overflowMsg');
  msg.classList.remove('show');
  void msg.offsetWidth;
  msg.classList.add('show');

  // Flip all cards forward one more half-turn (all were at '1'), cascade LSB→MSB
  for (let i = NUM_BITS - 1; i >= 0; i--) {
    const delay = (NUM_BITS - 1 - i) * 100;
    setTimeout(() => {
      cardRotation[i] -= 180;
      applyRotation(i);
      const hook = document.getElementById(`hook-${i}`);
      if (hook) hook.classList.remove('engaged');
    }, delay);
  }

  setTimeout(() => {
    value = 0; clickCount = 0;
    document.getElementById('crankCount').textContent = 0;
    clearLog();
    // Round each rotation to nearest clean multiple of 360
    for (let i = 0; i < NUM_BITS; i++) {
      const turns = Math.round(Math.abs(cardRotation[i]) / 360);
      cardRotation[i] = -(turns * 360);
    }
    syncVisuals();
    addLogEntry('00000000', 0);
    isBusy = false;
  }, 1800);
}

// ═══════════════════════════════════════════════════════
//  LOG
// ═══════════════════════════════════════════════════════
function addLogEntry(bits, dec) {
  const entries = document.getElementById('stepEntries');
  entries.querySelectorAll('.latest').forEach(e => e.classList.remove('latest'));

  const high = bits.slice(0,4);
  const low  = bits.slice(4,8);

  const entry = document.createElement('div');
  entry.className = 'step-entry latest';
  entry.innerHTML = `
    <span class="step-num">#${dec.toString().padStart(3,'0')}</span>
    <span class="step-bits">${high} ${low}</span>
    <span class="step-eq">=</span>
    <span class="step-dec">${dec}</span>
    <span class="step-eq" style="font-size:10px;color:var(--wood-dark)">
      &nbsp;(0x${dec.toString(16).toUpperCase().padStart(2,'0')})
    </span>
  `;
  entries.prepend(entry);
  while (entries.children.length > 20) entries.removeChild(entries.lastChild);
}

function clearLog() {
  document.getElementById('stepEntries').innerHTML = '';
}

// ═══════════════════════════════════════════════════════
//  RESET
// ═══════════════════════════════════════════════════════
document.getElementById('btnReset').addEventListener('click', () => {
  if (isBusy) return;
  value = 0; clickCount = 0;
  document.getElementById('crankCount').textContent = 0;
  clearLog();
  for (let i = 0; i < NUM_BITS; i++) cardRotation[i] = 0;
  syncVisuals();
  addLogEntry('00000000', 0);
});

// ═══════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════
function valueToBits(v) {
  return [
    (v >> 7) & 1, (v >> 6) & 1, (v >> 5) & 1, (v >> 4) & 1,
    (v >> 3) & 1, (v >> 2) & 1, (v >> 1) & 1,  v       & 1
  ];
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
buildCards();
syncVisuals();
addLogEntry('00000000', 0);
