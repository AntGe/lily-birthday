import type { CSSProperties } from "react";
import "./Backdrop.css";

// Soft cream → blush room: drifting light blobs, paper grain and slow bokeh.
// Positions are generated once with a fixed seed so the room looks the same every visit.
let seed = 7;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const BOKEH = Array.from({ length: 18 }, (_, i) => {
  const gold = i % 3 === 0;
  return {
    left: `${(rand() * 100).toFixed(1)}%`,
    top: `${(rand() * 100).toFixed(1)}%`,
    size: Math.round(gold ? 6 + rand() * 10 : 40 + rand() * 110),
    delay: -(rand() * 30).toFixed(1),
    duration: (22 + rand() * 26).toFixed(1),
    drift: Math.round(-40 - rand() * 80),
    kind: gold ? "spark" : "bokeh",
    opacity: gold ? 0.9 : 0.3 + rand() * 0.35,
  };
});

export function Backdrop({ tint }: { tint?: string }) {
  return (
    <div className="backdrop" aria-hidden="true" style={tint ? ({ "--tint": tint } as CSSProperties) : undefined}>
      <div className="backdrop-blob backdrop-blob--a" />
      <div className="backdrop-blob backdrop-blob--b" />
      <div className="backdrop-blob backdrop-blob--c" />
      <div className="backdrop-tint" />
      {BOKEH.map((b, i) => (
        <span
          key={i}
          className={`backdrop-${b.kind}`}
          style={
            {
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              "--drift": `${b.drift}px`,
              "--o": b.opacity,
            } as CSSProperties
          }
        />
      ))}
      <div className="backdrop-grain" />
    </div>
  );
}
