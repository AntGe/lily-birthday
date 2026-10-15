import confetti from "canvas-confetti";

const PALETTE = ["#F4DCDD", "#D4919B", "#C8A46A", "#E8D3A6", "#FFF8F3", "#B86F7C"];

let heart: confetti.Shape | null = null;
function heartShape() {
  if (!heart) {
    try {
      heart = confetti.shapeFromPath({
        path: "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.3 4.1c2.2-.3 4 .9 5.7 3 1.7-2.1 3.5-3.3 5.7-3 3.6.4 5.4 4.3 3.9 7.7C19.5 16.4 12 21 12 21z",
      });
    } catch {
      heart = null;
    }
  }
  return heart;
}

const base: confetti.Options = {
  disableForReducedMotion: true,
  ticks: 260,
  zIndex: 60,
};

/** The big "Happy Birthday" burst coming out of the opened box. */
export function birthdayBurst(origin: { x: number; y: number }) {
  const h = heartShape();
  confetti({ ...base, particleCount: 150, spread: 100, startVelocity: 48, origin, colors: PALETTE, scalar: 1.05 });
  window.setTimeout(() => {
    confetti({ ...base, particleCount: 70, spread: 140, startVelocity: 34, origin, colors: PALETTE, scalar: 0.9 });
    if (h) {
      confetti({ ...base, particleCount: 26, spread: 90, startVelocity: 38, origin, colors: ["#D4919B", "#E8A3A0", "#C8A46A"], shapes: [h], scalar: 1.6, flat: true });
    }
  }, 180);
}

/** A small puff in a destination's colours when a present opens. */
export function puff(origin: { x: number; y: number }, colors: string[]) {
  confetti({ ...base, particleCount: 46, spread: 70, startVelocity: 26, gravity: 0.9, ticks: 180, origin, colors, scalar: 0.8 });
}

/** The final, huge celebration (~3 s of bursts from both sides plus hearts). */
export function celebrate(colors: string[]) {
  const h = heartShape();
  const all = [...colors, ...PALETTE];
  const end = Date.now() + 2800;
  confetti({ ...base, particleCount: 160, spread: 120, startVelocity: 55, origin: { x: 0.5, y: 0.55 }, colors: all });
  // Side cannons at ~60 fps, even on 120 Hz displays
  let last = 0;
  (function frame(now: number) {
    if (now - last >= 15) {
      last = now;
      confetti({ ...base, particleCount: 5, angle: 60, spread: 60, startVelocity: 62, origin: { x: 0, y: 0.75 }, colors: all });
      confetti({ ...base, particleCount: 5, angle: 120, spread: 60, startVelocity: 62, origin: { x: 1, y: 0.75 }, colors: all });
    }
    if (Date.now() < end) requestAnimationFrame(frame);
  })(performance.now());
  if (h) {
    [400, 1200, 2000].forEach((delay, i) =>
      window.setTimeout(() => {
        confetti({ ...base, particleCount: 22, spread: 100, startVelocity: 40, origin: { x: 0.3 + i * 0.2, y: 0.6 }, colors: ["#D4919B", "#E8A3A0", ...colors], shapes: [h], scalar: 1.8, flat: true });
      }, delay),
    );
  }
}

/** A little puff of hearts, e.g. when the postmark stamps down. */
export function heartPuff(origin: { x: number; y: number }, colors: string[]) {
  const h = heartShape();
  if (!h) return;
  confetti({ ...base, particleCount: 12, spread: 80, startVelocity: 16, gravity: 0.6, ticks: 140, origin, colors: ["#D4919B", "#E8A3A0", ...colors], shapes: [h], scalar: 1.4, flat: true });
}

export function resetConfetti() {
  confetti.reset();
}
