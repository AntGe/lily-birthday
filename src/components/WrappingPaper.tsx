import type { CSSProperties } from "react";
import type { PaperKind, Wrap } from "../types";

// Each wrapping paper is an SVG <pattern> tile, inlined as a data-URI CSS background.

const f = (n: number) => +n.toFixed(2);
const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function tile(w: number, h: number, body: string) {
  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<defs><pattern id="p" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${body}</pattern></defs>` +
      `<rect width="100%" height="100%" fill="url(#p)"/></svg>`,
  );
}

function star(cx: number, cy: number, r: number, points = 5, inner = 0.45) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const rr = i % 2 ? r * inner : r;
    d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`;
  }
  return d + "Z";
}

const heart = (cx: number, cy: number, s: number) =>
  `M${f(cx)} ${f(cy + s * 0.9)}C${f(cx - s * 1.4)} ${f(cy)} ${f(cx - s * 0.7)} ${f(cy - s * 1.05)} ${f(cx)} ${f(cy - s * 0.35)}` +
  `C${f(cx + s * 0.7)} ${f(cy - s * 1.05)} ${f(cx + s * 1.4)} ${f(cy)} ${f(cx)} ${f(cy + s * 0.9)}Z`;

function waves(w: Wrap) {
  const ink = w.ink;
  return {
    image: tile(
      64,
      32,
      `<path d="M0 9Q8 3.5 16 9T32 9T48 9T64 9" fill="none" stroke="${ink}" stroke-opacity=".62" stroke-width="1.3" stroke-linecap="round"/>` +
        `<path d="M-8 25Q0 19.5 8 25T24 25T40 25T56 25T72 25" fill="none" stroke="${ink}" stroke-opacity=".3" stroke-width="1"/>` +
        `<circle cx="40" cy="16.5" r="1.1" fill="${ink}" fill-opacity=".45"/><circle cx="6" cy="17" r=".8" fill="${ink}" fill-opacity=".35"/>`,
    ),
    size: "64px 32px",
  };
}

function stars(w: Wrap) {
  const ink = w.ink;
  const s5 = [
    [12, 14, 2.8],
    [58, 42, 2.4],
    [30, 72, 2.6],
    [82, 80, 2],
  ];
  const s4 = [
    [44, 12, 4.4],
    [8, 50, 3.6],
    [70, 64, 3.8],
  ];
  const dots = [
    [26, 30],
    [86, 34],
    [50, 86],
    [16, 88],
    [64, 6],
  ];
  return {
    image: tile(
      96,
      96,
      s5.map(([x, y, r]) => `<path d="${star(x, y, r)}" fill="${ink}" fill-opacity=".9"/>`).join("") +
        s4.map(([x, y, r]) => `<path d="${star(x, y, r, 4, 0.26)}" fill="${ink}" fill-opacity=".75"/>`).join("") +
        dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="${ink}" fill-opacity=".55"/>`).join("") +
        // Crescent moon: an ink disc with a paper-coloured disc biting into it
        `<circle cx="76" cy="20" r="6.5" fill="${ink}" fill-opacity=".95"/><circle cx="79" cy="17.5" r="5.6" fill="${w.base}"/>` +
        `<circle cx="34" cy="48" r="4.6" fill="${ink}" fill-opacity=".8"/><circle cx="36.2" cy="46.4" r="4" fill="${w.base}"/>`,
    ),
    size: "96px 96px",
  };
}

function protea(cx: number, cy: number, s: number, rot: number, ink: string) {
  const petals = [-58, -38, -19, 0, 19, 38, 58]
    .map((a) => {
      const h = s * (a === 0 ? 1 : 1 - Math.abs(a) / 260);
      return `<path transform="rotate(${a})" d="M0 0C${f(-s * 0.32)} ${f(-h * 0.3)} ${f(-s * 0.2)} ${f(-h * 0.85)} 0 ${f(-h)}C${f(s * 0.2)} ${f(-h * 0.85)} ${f(s * 0.32)} ${f(-h * 0.3)} 0 0Z"/>`;
    })
    .join("");
  return (
    `<g transform="translate(${cx} ${cy}) rotate(${rot})">` +
    `<path d="M0 ${f(s * 0.1)}Q${f(s * 0.08)} ${f(s * 0.7)} ${f(-s * 0.05)} ${f(s * 1.15)}" fill="none" stroke="${ink}" stroke-opacity=".45" stroke-width="1"/>` +
    `<path d="M${f(-s * 0.02)} ${f(s * 0.62)}q${f(-s * 0.45)} ${f(-s * 0.05)} ${f(-s * 0.55)} ${f(-s * 0.32)}q${f(s * 0.36)} ${f(-s * 0.02)} ${f(s * 0.55)} ${f(s * 0.32)}Z" fill="${ink}" fill-opacity=".22"/>` +
    `<g fill="#FBE3E0" fill-opacity=".55" stroke="${ink}" stroke-opacity=".55" stroke-width=".8">${petals}</g>` +
    `<ellipse cx="0" cy="${f(-s * 0.42)}" rx="${f(s * 0.26)}" ry="${f(s * 0.34)}" fill="${ink}" fill-opacity=".2" stroke="${ink}" stroke-opacity=".5" stroke-width=".7"/>` +
    `</g>`
  );
}

function penguin(x: number, y: number) {
  // About 16px tall, facing the viewer, with little gold feet
  return (
    `<g transform="translate(${x} ${y})">` +
    `<ellipse cx="0" cy="0" rx="5.2" ry="8" fill="#3A2630"/>` +
    `<ellipse cx="0" cy="1.6" rx="3.5" ry="6" fill="#FFF8F3"/>` +
    `<circle cx="0" cy="-5" r="3.6" fill="#3A2630"/>` +
    `<circle cx="-1.3" cy="-5.4" r=".6" fill="#FFF8F3"/><circle cx="1.3" cy="-5.4" r=".6" fill="#FFF8F3"/>` +
    `<path d="M-1 -3.8L0 -2.4L1 -3.8Z" fill="#C8A46A"/>` +
    `<path d="M-3.4 7.4h2.6M.8 7.4h2.6" stroke="#C8A46A" stroke-width="1.4" stroke-linecap="round"/>` +
    `</g>`
  );
}

function proteas(w: Wrap) {
  const ink = w.ink;
  return {
    image: tile(
      150,
      150,
      protea(32, 46, 22, -12, ink) +
        protea(104, 30, 16, 14, ink) +
        protea(86, 108, 20, -4, ink) +
        protea(22, 128, 13, 20, ink) +
        penguin(132, 72) +
        `<path d="${heart(62, 76, 2.6)}" fill="${ink}" fill-opacity=".35"/>` +
        `<circle cx="140" cy="132" r="1" fill="${ink}" fill-opacity=".4"/><circle cx="58" cy="10" r="1" fill="${ink}" fill-opacity=".4"/>`,
    ),
    size: "150px 150px",
  };
}

function frond(x: number, y: number, len: number, rot: number, ink: string, op: number) {
  const leaves: string[] = [];
  const steps = 9;
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    const ly = -len * t;
    const lx = Math.sin(t * Math.PI * 0.9) * len * 0.06;
    const size = len * 0.17 * (1 - t * 0.75);
    leaves.push(
      `<ellipse cx="${f(lx - size * 0.62)}" cy="${f(ly + size * 0.2)}" rx="${f(size * 0.62)}" ry="${f(size * 0.22)}" transform="rotate(28 ${f(lx)} ${f(ly)})"/>`,
      `<ellipse cx="${f(lx + size * 0.62)}" cy="${f(ly + size * 0.2)}" rx="${f(size * 0.62)}" ry="${f(size * 0.22)}" transform="rotate(-28 ${f(lx)} ${f(ly)})"/>`,
    );
  }
  return (
    `<g transform="translate(${x} ${y}) rotate(${rot})" fill="${ink}" fill-opacity="${op}">` +
    `<path d="M0 0Q${f(len * 0.09)} ${f(-len * 0.5)} 0 ${f(-len)}" fill="none" stroke="${ink}" stroke-opacity="${op + 0.1}" stroke-width="1"/>` +
    leaves.join("") +
    `</g>`
  );
}

function ferns(w: Wrap) {
  const ink = w.ink;
  return {
    image: tile(
      120,
      120,
      frond(26, 70, 58, -18, ink, 0.42) +
        frond(88, 118, 50, 22, ink, 0.32) +
        frond(98, 46, 36, -40, ink, 0.26) +
        `<circle cx="58" cy="20" r="1.1" fill="${ink}" fill-opacity=".45"/><circle cx="12" cy="104" r="1" fill="${ink}" fill-opacity=".4"/>`,
    ),
    size: "120px 120px",
  };
}

const builders: Record<PaperKind, (w: Wrap) => { image: string; size: string }> = {
  waves,
  stars,
  proteas,
  ferns,
};

export function paperStyle(wrap: Wrap): CSSProperties {
  const { image, size } = builders[wrap.paper](wrap);
  return { backgroundColor: wrap.base, backgroundImage: image, backgroundSize: size };
}

/** The blush paper of the big birthday present: tiny gold dots and rose hearts. */
export function blushPaperStyle(): CSSProperties {
  const image = tile(
    60,
    60,
    `<path d="${heart(15, 15, 3.6)}" fill="#D4919B" fill-opacity=".55"/>` +
      `<path d="${heart(45, 45, 3.6)}" fill="#D4919B" fill-opacity=".55"/>` +
      `<circle cx="45" cy="15" r="1.6" fill="#C8A46A" fill-opacity=".8"/>` +
      `<circle cx="15" cy="45" r="1.6" fill="#C8A46A" fill-opacity=".8"/>`,
  );
  return { backgroundColor: "#F4DCDD", backgroundImage: image, backgroundSize: "60px 60px" };
}

/** Inside of a box: cream card with a fine gold dot. */
export function liningStyle(): CSSProperties {
  const image = tile(22, 22, `<circle cx="11" cy="11" r="1.1" fill="#C8A46A" fill-opacity=".55"/>`);
  return { backgroundColor: "#FFF8F3", backgroundImage: image, backgroundSize: "22px 22px" };
}

/** A paper swatch as a CSS background value, for small decorative uses (final screen stamps etc). */
export function paperBackground(wrap: Wrap): string {
  const s = paperStyle(wrap);
  return `${s.backgroundImage} 0 0 / ${s.backgroundSize} repeat, ${s.backgroundColor}`;
}
