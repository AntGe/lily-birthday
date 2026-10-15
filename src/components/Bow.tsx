import { useId } from "react";
import { darken, lighten } from "../lib/color";

// A satin bow drawn with thick strokes, so it can "untie" by un-drawing (pathLength 1 → 0).
// Loops start at the knot, so un-drawing pulls each loop back into it.
const LOOP_L = "M100 70C82 46 38 16 24 40C12 62 58 80 100 70";
const LOOP_R = "M100 70C118 46 162 16 176 40C188 62 142 80 100 70";
const TAIL_L = "M97 76C90 86 80 96 64 104";
const TAIL_R = "M103 76C112 88 124 96 140 102";

export function Bow({ color, className }: { color: string; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const grad = `bow-g-${uid}`;
  const sheen = `bow-s-${uid}`;

  return (
    <svg className={`bow ${className ?? ""}`} viewBox="0 0 200 112" aria-hidden="true" overflow="visible">
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="0.45" stopColor={lighten(color, 0.3)} />
          <stop offset="1" stopColor={darken(color, 0.22)} />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g className="bow-tail bow-tail--l">
        <path d={TAIL_L} stroke={`url(#${grad})`} strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M62 100l-12 9 18 0Z" fill={darken(color, 0.18)} />
      </g>
      <g className="bow-tail bow-tail--r">
        <path d={TAIL_R} stroke={`url(#${grad})`} strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M142 98l12 9-18 1Z" fill={darken(color, 0.18)} />
      </g>
      <path className="bow-loop" d={LOOP_L} stroke={`url(#${grad})`} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="bow-loop" d={LOOP_R} stroke={`url(#${grad})`} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path className="bow-loop bow-loop--sheen" d={LOOP_L} stroke={`url(#${sheen})`} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" transform="translate(-2 -4)" />
      <path className="bow-loop bow-loop--sheen" d={LOOP_R} stroke={`url(#${sheen})`} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" transform="translate(2 -4)" />
      <ellipse className="bow-knot" cx="100" cy="71" rx="13" ry="11" fill={`url(#${grad})`} />
      <ellipse className="bow-knot" cx="97" cy="67" rx="5" ry="3" fill="#fff" opacity="0.35" />
    </svg>
  );
}
