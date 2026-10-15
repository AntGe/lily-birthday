import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { BIRTHDAY_LINE, GREETING, INTRO_NOTE } from "../config";
import { copy } from "../copy";
import { ArrowIcon } from "../components/Icons";
import "./BirthdayReveal.css";

export type RevealStage = "hidden" | "writing" | "note";

interface Props {
  stage: RevealStage;
  /** Jump straight to the finished state (the reveal was skipped). */
  instant: boolean;
  onNext: () => void;
}

/** "Happy Birthday" writes itself in script, then her name, then the note. */
export function BirthdayTitle({ stage, instant }: { stage: RevealStage; instant: boolean }) {
  const reduced = useReducedMotion();
  if (stage === "hidden") return null;
  const letters = [...BIRTHDAY_LINE];
  const quick = instant || reduced;

  return (
    <div className={`hb ${quick ? "is-instant" : ""}`}>
      <h1 className="sr-only">
        {`${BIRTHDAY_LINE}, ${GREETING.charAt(0).toLocaleLowerCase("bg")}${GREETING.slice(1)}!`}
      </h1>
      <svg className="hb-svg" viewBox="0 0 1000 230" aria-hidden="true">
        <defs>
          <linearGradient id="hb-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B88A4E" />
            <stop offset="0.35" stopColor="#E3C58C" />
            <stop offset="0.55" stopColor="#C29355" />
            <stop offset="0.8" stopColor="#E9CF9A" />
            <stop offset="1" stopColor="#A9793F" />
          </linearGradient>
        </defs>
        <text x="500" y="165" textAnchor="middle" className="hb-text">
          {letters.map((ch, i) => (
            <tspan key={i} style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? " " : ch}
            </tspan>
          ))}
        </text>
      </svg>
      <motion.p
        className="hb-name display"
        aria-hidden="true"
        initial={{ opacity: 0, y: quick ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={quick ? { duration: 0.3 } : { delay: letters.length * 0.07 + 0.55, type: "spring", stiffness: 170, damping: 20 }}
      >
        {GREETING}
      </motion.p>
    </div>
  );
}

export function BirthdayNote({ stage, instant, onNext }: Props) {
  const reduced = useReducedMotion();
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (stage !== "note") return;
    const active = document.activeElement;
    if (!active || active === document.body || active.classList.contains("ov-box")) {
      nextRef.current?.focus({ preventScroll: true });
    }
  }, [stage]);
  if (stage !== "note") return null;
  const quick = instant || reduced;
  return (
    <div className="hb-note-wrap">
      <motion.p
        id="hb-note"
        className="hb-note"
        initial={{ opacity: 0, y: quick ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={quick ? { duration: 0.3 } : { type: "spring", stiffness: 170, damping: 22 }}
      >
        {INTRO_NOTE}
      </motion.p>
      <motion.button
        ref={nextRef}
        aria-describedby="hb-note"
        type="button"
        className="hb-next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        initial={{ opacity: 0, y: quick ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={quick ? { duration: 0.3, delay: 0.1 } : { delay: 0.6, type: "spring", stiffness: 170, damping: 20 }}
      >
        {copy.reveal.next} <ArrowIcon />
      </motion.button>
    </div>
  );
}
