import { motion, useTransform, type MotionValue } from "motion/react";
import { useMemo, type CSSProperties } from "react";
import { Bow } from "./Bow";
import { liningStyle } from "./WrappingPaper";
import "./GiftBox.css";

export interface BoxDims {
  w: number;
  h: number;
  d: number;
  lid: number;
}

interface GiftBoxProps {
  dims: BoxDims;
  paper: CSSProperties;
  ribbon: string;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** Split the front paper along a jagged seam so it can tear open. */
  tearable?: boolean;
  /** Bow width in px (defaults to ~70% of the lid's width). */
  bowSize?: number;
  /** Gold heart embossed on the bare box under the paper. */
  emboss?: boolean;
  className?: string;
}

const SIDES = ["back", "left", "right", "front"] as const;

/** A jagged vertical tear seam: ~26 zig-zag points, generated once per box. */
function makeSeam(seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const n = 26;
  return Array.from({ length: n + 1 }, (_, i) => {
    const y = (i / n) * 100;
    const x = 50 + (i % 2 ? 1 : -1) * (2 + rand() * 4.5) + (rand() - 0.5) * 3;
    return [x, y] as const;
  });
}

function seamClips(seed: number) {
  const pts = makeSeam(seed);
  const left = ["0% 0%", ...pts.map(([x, y]) => `${(x + 0.4).toFixed(2)}% ${y.toFixed(2)}%`), "0% 100%"];
  const right = ["100% 0%", ...pts.map(([x, y]) => `${(x - 0.4).toFixed(2)}% ${y.toFixed(2)}%`), "100% 100%"];
  return { left: `polygon(${left.join(",")})`, right: `polygon(${right.join(",")})`, pts };
}

export function GiftBox({ dims, paper, ribbon, rotateX, rotateY, tearable, bowSize, emboss, className }: GiftBoxProps) {
  const { w, h, d, lid } = dims;
  const overhang = Math.max(4, Math.round(Math.min(w, d) * 0.035));
  const band = Math.round(Math.max(12, Math.min(26, Math.min(w, d) * 0.13)));
  const bow = bowSize ?? Math.round((w + 2 * overhang) * 0.78);
  const counterY = useTransform(rotateY, (v) => -v);
  const clips = useMemo(() => seamClips(w * 7 + h * 3 + d), [w, h, d]);
  const lining = liningStyle();

  const vars = {
    "--w": `${w}px`,
    "--h": `${h}px`,
    "--d": `${d}px`,
    "--lid": `${lid}px`,
    "--e": `${overhang}px`,
    "--band": `${band}px`,
    "--bow": `${bow}px`,
    "--ribbon": ribbon,
  } as CSSProperties;

  return (
    <div className={`gb ${className ?? ""}`} style={vars} aria-hidden="true">
      <div className="gb-shadow" />
      <div className="gb-body">
        <motion.div className="gb-box" style={{ rotateX, rotateY }}>
          <div className="gb-face gb-bottom" style={lining}>
            <div className="gb-glow" />
          </div>

          {SIDES.map((side) => (
            <div key={side} className={`gb-hinge gb-hinge--${side}`}>
              <div className="gb-wall" data-side={side}>
                <div className="gb-face gb-outer" style={side === "front" && tearable ? undefined : paper}>
                  {side === "front" && tearable && (
                    <>
                      <div className="gb-under" style={lining}>
                        {emboss && <span className="gb-emboss">♡</span>}
                      </div>
                      <div className="gb-tear gb-tear--l" style={{ ...paper, clipPath: clips.left }} />
                      <div className="gb-tear gb-tear--r" style={{ ...paper, clipPath: clips.right }} />
                      {[12, 26, 38, 52, 64, 78, 90].map((y, i) => (
                        <span
                          key={y}
                          className="gb-scrap"
                          style={{ ...paper, top: `${y}%`, left: `${clips.pts[Math.round((y / 100) * 26)][0] - 3}%`, rotate: `${i * 47}deg` }}
                        />
                      ))}
                    </>
                  )}
                  <div className="gb-band gb-band--v" />
                  <div className="gb-shade" />
                </div>
                <div className="gb-face gb-inner" style={lining} />
              </div>
            </div>
          ))}

          <div className="gb-lid-anchor">
            <div className="gb-lid">
              <div className="gb-face gb-lid-top" style={paper}>
                <div className="gb-band gb-band--x" />
                <div className="gb-band gb-band--z" />
                <div className="gb-shade" />
              </div>
              {SIDES.map((side) => (
                <div key={side} className={`gb-face gb-skirt gb-skirt--${side}`} style={paper}>
                  <div className="gb-band gb-band--v gb-band--skirt" />
                  <div className="gb-shade" />
                </div>
              ))}
              <motion.div className="gb-bow-plane" style={{ rotateY: counterY }}>
                <Bow color={ribbon} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
