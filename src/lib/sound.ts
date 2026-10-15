// Background song + tiny synthesised effects. Browsers only allow audio after a user gesture,
// so the song starts (with a slow fade-in) on her first click. The speaker toggle mutes everything.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

const MUSIC_URL = `${import.meta.env.BASE_URL}audio/song.m4a`;
/** A tasteful background level (the master is loud); routed through Web Audio so it also holds on iOS. */
const MUSIC_LEVEL = 0.2;
let music: HTMLAudioElement | null = null;
let musicGain: GainNode | null = null;
let musicWanted = false;

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
  if (on) {
    // The audio context is only created inside a user gesture (first click), never on page load.
    if (musicWanted) startMusic();
  } else {
    stopMusic();
  }
}

/** Start fetching the song early (after the page has settled) so it's ready by the first click. */
export function preloadMusic() {
  if (music || typeof Audio === "undefined") return;
  music = new Audio(MUSIC_URL);
  music.loop = true;
  music.preload = "auto";
}

function fadeMusic(to: number, seconds: number) {
  if (!ctx || !musicGain) return;
  const g = musicGain.gain;
  const t = ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(to, t + seconds);
}

/** Call from a user gesture. Safe to call repeatedly. */
export function startMusic() {
  musicWanted = true;
  const c = ensureContext();
  if (!c) return;
  preloadMusic();
  if (!music) return;
  try {
    if (!musicGain) {
      musicGain = c.createGain();
      musicGain.gain.value = 0;
      c.createMediaElementSource(music).connect(musicGain).connect(c.destination);
    }
  } catch {
    return;
  }
  if (!music.paused) return fadeMusic(MUSIC_LEVEL, 1.5);
  void music
    .play()
    .then(() => fadeMusic(MUSIC_LEVEL, 3.5))
    .catch(() => {});
}

function stopMusic() {
  if (!music || music.paused) return;
  fadeMusic(0, 0.6);
  const m = music;
  window.setTimeout(() => {
    if (!enabled || document.hidden) m.pause();
  }, 650);
}

// Pause when the tab is hidden, pick up again when she comes back.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopMusic();
    else if (enabled && musicWanted) startMusic();
  });
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
