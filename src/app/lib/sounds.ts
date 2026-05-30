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

// ─── Звук рисования в стиле Mario: ноты мажорной пентатоники, square ───
// C5 D5 E5 G5 A5 + C6 — звучит как NES-чиптюн, всегда мелодично, без диссонанса
const MARIO_PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
let lastDrawTime = 0;
let drawNoteIndex = 0;
export function playDraw() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  if (now - lastDrawTime < 0.04) return;
  lastDrawTime = now;

  // Идём по нотам по кругу — получается восходящая мелодия,
  // плюс рандомные перескоки для разнообразия
  drawNoteIndex =
    (drawNoteIndex + (Math.random() < 0.7 ? 1 : 2)) %
    MARIO_PENTATONIC.length;
  const freq = MARIO_PENTATONIC[drawNoteIndex];

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, now);
  // Чуть приукрашиваем — лёгкий glide вверх как у NES-arp
  osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 0.04);
  osc.connect(gain).connect(c.destination);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.022, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  osc.start(now);
  osc.stop(now + 0.07);
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
  const vol = Math.min(0.03 + intensity * 0.025, 0.13);
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
    gain.gain.linearRampToValueAtTime(0.16, start + 0.01);
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
  gain.gain.setValueAtTime(0.12, now);
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
  gain.gain.linearRampToValueAtTime(0.08, now + 0.003);
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
  gain.gain.linearRampToValueAtTime(0.1, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.start(now);
  osc.stop(now + 0.18);
}

// ─── «Свуш» при навигации внутри проекта — чёткий нисходящий sine-sweep
export function playSwoosh() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const duration = 0.18;

  // Базовый тон: sine 1500→260 Hz, exp-кривая = ощущение пролёта
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1500, now);
  osc.frequency.exponentialRampToValueAtTime(260, now + duration);
  osc.connect(gain).connect(c.destination);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.03);

  // Лёгкая «подкладка» — triangle на октаву ниже для воздуха
  const sub = c.createOscillator();
  const subGain = c.createGain();
  sub.type = "triangle";
  sub.frequency.setValueAtTime(750, now);
  sub.frequency.exponentialRampToValueAtTime(130, now + duration);
  sub.connect(subGain).connect(c.destination);
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.05, now + 0.008);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  sub.start(now);
  sub.stop(now + duration + 0.03);
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
  g1.gain.linearRampToValueAtTime(0.1, now + 0.005);
  g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc1.start(now);
  osc1.stop(now + 0.14);

  const osc2 = c.createOscillator();
  const g2 = c.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(660, now + 0.02);
  osc2.connect(g2).connect(c.destination);
  g2.gain.setValueAtTime(0, now + 0.02);
  g2.gain.linearRampToValueAtTime(0.12, now + 0.025);
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
  g1.gain.linearRampToValueAtTime(0.12, now + 0.005);
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
  g2.gain.linearRampToValueAtTime(0.06, now + 0.025);
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

  tick(now, 0.45); // нажатие — громче
  tick(now + 0.055, 0.24); // отпускание — тише
}
