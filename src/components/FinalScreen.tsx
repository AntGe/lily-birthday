import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { FINAL_NOTE, FROM_NAME, HER_NAME } from "../config";
import { accentText } from "../lib/color";
import { heartPuff } from "../lib/confetti";
import { playPop } from "../lib/sound";
import { useSceneFocus } from "../lib/useSceneFocus";
import type { Trip } from "../types";
import { HeartIcon } from "./Icons";
import { Photo } from "./Photo";
import { paperBackground } from "./WrappingPaper";
import "./FinalScreen.css";

interface Props {
  trip: Trip;
  onChangeMind: () => void;
}

export function FinalScreen({ trip, onChangeMind }: Props) {
  const reduced = useReducedMotion();
  const headingRef = useSceneFocus<HTMLHeadingElement>();
  const stampRef = useRef<HTMLDivElement>(null);

  // The postmark lands like a rubber stamp, with a pop and a little puff of hearts
  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => {
      const r = stampRef.current?.getBoundingClientRect();
      if (!r) return;
      playPop();
      heartPuff({ x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }, [trip.wrap.base, trip.wrap.ribbon]);
    }, 1220);
    return () => window.clearTimeout(t);
  }, [reduced, trip]);
  const style = {
    "--accent": trip.wrap.base,
    "--accent-deep": accentText(trip.wrap.base, trip.wrap.ink),
    "--ribbon": trip.wrap.ribbon,
    "--paper": paperBackground(trip.wrap),
  } as CSSProperties;

  const enter = (delay: number, from: object = { y: 14 }) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: delay * 0.3 } }
      : {
          initial: { opacity: 0, ...from },
          animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
          transition: { type: "spring" as const, stiffness: 170, damping: 20, delay },
        };

  return (
    <section className="final" style={style} aria-labelledby="final-title">
      <motion.article className="postcard" {...enter(0.1, { y: 40, scale: 0.92, rotate: -2 })}>
        <div className="postcard-inner">
          <div className="postcard-photo">
            <Photo id={trip.hero} sizes="(max-width: 760px) 92vw, 440px" priority />
            <motion.div
              ref={stampRef}
              className="postmark"
              aria-hidden="true"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.9, rotate: -24 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={reduced ? { duration: 0.3, delay: 0.33 } : { delay: 1.1, type: "spring", stiffness: 520, damping: 22, mass: 0.7 }}
            >
              <svg viewBox="0 0 120 120">
                <defs>
                  <path id="pm-arc" d="M60 60m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0" />
                </defs>
                <circle cx="60" cy="60" r="55" />
                <circle cx="60" cy="60" r="31" />
                <text>
                  <textPath href="#pm-arc" startOffset="0">
                    {`${trip.name} · ${trip.country} · `.toUpperCase()}
                  </textPath>
                </text>
              </svg>
              <span className="postmark-heart">
                <HeartIcon />
              </span>
            </motion.div>
          </div>

          <div className="postcard-divider" aria-hidden="true" />

          <div className="postcard-text">
            <motion.p className="postcard-eyebrow" {...enter(0.5)}>
              {trip.length} · {trip.region}
            </motion.p>
            <motion.h1 ref={headingRef} tabIndex={-1} id="final-title" className="postcard-title display" {...enter(0.6)}>
              <span className="postcard-lead">{HER_NAME}, we’re going to</span> <em>{trip.name}!</em>
            </motion.h1>
            <motion.p className="postcard-note" {...enter(0.75)}>
              {FINAL_NOTE}
            </motion.p>
            <motion.p className="postcard-sign script" {...enter(0.9)}>
              with love, {FROM_NAME}
            </motion.p>

            <ul className="stamps" aria-label="Highlights waiting for us">
              {trip.highlights.map((h, i) => (
                <motion.li key={h.title} className="stamp" {...enter(1.2 + i * 0.09, { scale: 1.35, rotate: (i % 2 ? 6 : -6) })}>
                  <span className="stamp-inner">
                    <span className="stamp-paper" aria-hidden="true" />
                    <span className="stamp-title">{h.title}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.article>

      <motion.p className="final-change" {...enter(2)}>
        <button type="button" className="link-quiet" onClick={onChangeMind}>
          change my mind
        </button>
      </motion.p>
    </section>
  );
}
