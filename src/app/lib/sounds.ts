// Лёгкий синтез звуков через Web Audio API.
// AudioContext создаётся лениво на первом проигрывании — браузеры запрещают
// его инициализацию до user gesture.

type WindowWithWebkit = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const w = window as WindowWithWebkit;
    const Ctor = window.AudioContext || w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

// Прогреваем AudioContext на первом же взаимодействии со страницей.
// Перехват в capture-фазе — listener срабатывает раньше React-обработчиков,
// то есть ещё до click. Плюс проигрываем беззвучный 1-сэмпловый буфер —
// это форсирует инициализацию аудио-конвейера, чтобы первый реальный
// звук не шёл с задержкой холодного старта.
if (typeof window !== "undefined") {
  const warmUp = () => {
    const c = getCtx();
    if (!c) return;
    try {
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, c.sampleRate);
      src.connect(c.destination);
      src.start(0);
    } catch {
      // не критично
    }
  };
  const opts: AddEventListenerOptions = { once: true, capture: true };
  window.addEventListener("pointerdown", warmUp, opts);
  window.addEventListener("keydown", warmUp, opts);
}

// ─── Звук рисования: «thock» в стиле тактильной клавиатуры ─────────────
// Микс трёх компонент:
//   1) Низкий triangle (корпус) — короткий «бум» на 110–180 Гц
//   2) Шумовой бёрст через band-pass — «тук» наконечника карандаша
//   3) Lowpass на корпус — срезает звонкость
// Лёгкая вариация частот по пентатонике в нижней октаве — не назойливая
// мелодия, но и не монотонный однотонный стук.
const THOCK_NOTES = [110, 123.5, 138.6, 165, 185];
let lastDrawTime = 0;
let drawNoteIndex = 0;
export function playDraw() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  if (now - lastDrawTime < 0.04) return;
  lastDrawTime = now;

  drawNoteIndex =
    (drawNoteIndex + (Math.random() < 0.7 ? 1 : 2)) % THOCK_NOTES.length;
  const baseFreq = THOCK_NOTES[drawNoteIndex];

  // 1) Корпус — низкий triangle, проходит через lowpass для глухости.
  const body = c.createOscillator();
  const bodyGain = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.Q.value = 0.4;
  body.type = "triangle";
  body.frequency.setValueAtTime(baseFreq * 1.1, now);
  body.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.04);
  body.connect(bodyGain).connect(lp).connect(c.destination);
  bodyGain.gain.setValueAtTime(0, now);
  bodyGain.gain.linearRampToValueAtTime(0.035, now + 0.003);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  body.start(now);
  body.stop(now + 0.08);

  // 2) Атака — короткий band-passed шум, имитирует тактильный «тук».
  const noiseLen = Math.max(1, Math.floor(c.sampleRate * 0.025));
  const noiseBuf = c.createBuffer(1, noiseLen, c.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
    nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseLen, 3);
  }
  const noise = c.createBufferSource();
  noise.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 1.4;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.018, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
  noise.connect(bp).connect(noiseGain).connect(c.destination);
  noise.start(now);
  noise.stop(now + 0.03);
}

// ─── Звук удара floater'ов друг о друга — короткий «тук» с гасанием ────
// Высота и громкость пропорциональны импульсу столкновения.
let lastCollideTime = 0;
export function playCollide(impactVel = 1) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // throttle — иначе при контакте нескольких объектов получается каша
  if (now - lastCollideTime < 0.03) return;
  lastCollideTime = now;

  const intensity = Math.min(Math.max(impactVel, 0.3), 5);
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  const freq = 130 + intensity * 60;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.05);
  osc.connect(gain).connect(c.destination);
  const vol = Math.min(0.025 + intensity * 0.021, 0.108);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  osc.start(now);
  osc.stop(now + 0.07);
}

// ─── Звук «отпустить»: восходящая арпеджио из 4 нот ─────────────────────
export function playRelease() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // C4, E4, G4, C5 — мажорный аккорд
  const notes = [261.63, 329.63, 392.0, 523.25];
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    const start = now + i * 0.07;
    osc.frequency.setValueAtTime(freq, start);
    osc.connect(gain).connect(c.destination);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.133, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}

// ─── Звук «очистить»: нисходящий свип ──────────────────────────────────
export function playClear() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(680, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
  osc.connect(gain).connect(c.destination);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  osc.start(now);
  osc.stop(now + 0.27);
}

// ─── Универсальный клик: мягкий blip ───────────────────────────────────
export function playClick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(720, now);
  osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);
  osc.connect(gain).connect(c.destination);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.067, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  osc.start(now);
  osc.stop(now + 0.08);
}

// ─── Клик «zoom»: быстрый восходящий sine-свип ────────────────────────
export function playZoom() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(1150, now + 0.13);
  osc.connect(gain).connect(c.destination);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.083, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.start(now);
  osc.stop(now + 0.18);
}

// ─── Навигация внутри проекта — тот же звук, что у zoom.
export function playSwoosh() {
  playZoom();
}

// ─── Кнопка «назад на главную»: нисходящий двойной sine — зеркало playProjectClick
export function playBack() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  // Сначала высокий E6, затем низкий A5 — ощущение «отступления»
  const osc1 = c.createOscillator();
  const g1 = c.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1100, now);
  osc1.connect(g1).connect(c.destination);
  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(0.083, now + 0.005);
  g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc1.start(now);
  osc1.stop(now + 0.14);

  const osc2 = c.createOscillator();
  const g2 = c.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(660, now + 0.02);
  osc2.connect(g2).connect(c.destination);
  g2.gain.setValueAtTime(0, now + 0.02);
  g2.gain.linearRampToValueAtTime(0.1, now + 0.025);
  g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc2.start(now + 0.02);
  osc2.stop(now + 0.18);
}

// ─── Клик по карточке проекта: два мягких sine-тона (UI-пинг) ─────────
export function playProjectClick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  // Тон 1: A5 (880 Hz) — короткий, с лёгким filter-через гейн
  const osc1 = c.createOscillator();
  const g1 = c.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, now);
  osc1.connect(g1).connect(c.destination);
  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(0.1, now + 0.005);
  g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc1.start(now);
  osc1.stop(now + 0.14);

  // Тон 2: E6 (1318 Hz) — стартует со сдвигом 20мс, тише, для блеска
  const osc2 = c.createOscillator();
  const g2 = c.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1318, now + 0.02);
  osc2.connect(g2).connect(c.destination);
  g2.gain.setValueAtTime(0, now + 0.02);
  g2.gain.linearRampToValueAtTime(0.05, now + 0.025);
  g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  osc2.start(now + 0.02);
  osc2.stop(now + 0.16);
}

// ─── Клик мышкой: сухой «тук-тук» (нажатие + отпускание) ──────────────
export function playToggle() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  // Один щелчок кнопки мыши: сфокусированный шумовой бёрст (bandpass —
  // без яркого «хисса») + короткий низкий «ток» корпуса для веса.
  const tick = (at: number, amp: number) => {
    const dur = 0.02;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1500;
    bp.Q.value = 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(amp, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(at);
    src.stop(at + dur);

    // Низкий «ток» корпуса кнопки
    const osc = c.createOscillator();
    const og = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, at);
    osc.frequency.exponentialRampToValueAtTime(150, at + 0.025);
    og.gain.setValueAtTime(0, at);
    og.gain.linearRampToValueAtTime(amp * 0.6, at + 0.001);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.035);
    osc.connect(og).connect(c.destination);
    osc.start(at);
    osc.stop(at + 0.045);
  };

  tick(now, 0.375); // нажатие — громче
  tick(now + 0.055, 0.2); // отпускание — тише
}
