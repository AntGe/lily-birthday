const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

const toHex = (rgb: readonly number[]) =>
  "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

/** Linear mix of two hex colours; t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number) {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}

export const lighten = (c: string, t: number) => mix(c, "#ffffff", t);
export const darken = (c: string, t: number) => mix(c, "#000000", t);

/** Relative luminance, for picking readable text on an accent colour. */
export function luminance(hex: string) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * A button colour that carries white text at AA (4.5:1): the accent itself if it can,
 * otherwise the paper's dark ink if there is one, otherwise a darkened accent.
 */
export function buttonColor(accent: string, ink?: string, surface = "#ffffff") {
  if (contrast(accent, surface) >= 4.5) return accent;
  if (ink && contrast(ink, surface) >= 4.5) return ink;
  let c = accent;
  for (let i = 0; i < 16 && contrast(c, surface) < 4.5; i++) c = darken(c, 0.06);
  return c;
}

/** Accent-coloured text that stays AA on the cream/blush surfaces of the modal and postcard. */
export const accentText = (accent: string, ink?: string) => buttonColor(accent, ink, "#f9e8e4");
