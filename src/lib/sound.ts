// Tiny synthesised sounds (no audio files). Muted by default; the first click unlocks audio.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

function ensureContext(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on) ensureContext();
}

/** Call from a user gesture so Safari lets us play later. */
export function unlockAudio() {
  ensureContext();
}

function bell(c: AudioContext, freq: number, start: number, length = 1.4, gain = 0.18) {
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, start);
  out.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  out.gain.exponentialRampToValueAtTime(0.0001, start + length);
  out.connect(master!);

  // A sine with a quiet inharmonic partial reads as "glassy chime".
  for (const [mult, level] of [
    [1, 1],
    [2.76, 0.18],
    [5.4, 0.06],
  ] as const) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * mult, start);
    g.gain.value = level;
    osc.connect(g).connect(out);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }
}

export function playChime() {
  const c = ensureContext();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const notes = [1318.5, 1661.2, 1975.5, 2637.0]; // E6 G#6 B6 E7
  notes.forEach((f, i) => bell(c, f, t + i * 0.075, 1.2, 0.12));
}

export function playPop() {
  const c = ensureContext();
  if (!c) return;
  const t = c.currentTime + 0.005;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + 0.2);
}

export function playFanfare() {
  const c = ensureContext();
  if (!c) return;
  const t = c.currentTime + 0.02;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0]; // C major sparkle run
  notes.forEach((f, i) => bell(c, f, t + i * 0.09, 1.8, 0.13));
  [1046.5, 1318.5, 1567.98].forEach((f) => bell(c, f, t + notes.length * 0.09 + 0.05, 2.4, 0.09));
}
