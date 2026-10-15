import { motion, stagger, useAnimate, useReducedMotion, useSpring, type AnimationOptions, type DOMKeyframesDefinition } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TAG_LINE } from "../config";
import { copy } from "../copy";
import { GiftBox } from "../components/GiftBox";
import { GiftTag } from "../components/GiftTag";
import { blushPaperStyle } from "../components/WrappingPaper";
import { birthdayBurst } from "../lib/confetti";
import { createSequencer, type Sequencer } from "../lib/sequence";
import { playChime, playPop, unlockAudio } from "../lib/sound";
import { BirthdayNote, BirthdayTitle, type RevealStage } from "./BirthdayReveal";
import "./Sealed.css";

const DIMS = { w: 264, h: 200, d: 264, lid: 56 };
const BASE_RX = -20;
const BASE_RY = -32;
const AUTO_ADVANCE_MS = 9000;
/** Unscaled projected height of the unfolded box (viewed from above), and how far its centre sits below .ov-floor's. */
const CROSS_H = 636;
const CROSS_DROP = 77;

interface Props {
  phase: "sealed" | "intro";
  onOpen: () => void;
  onDone: () => void;
}

/** Scenes A + B: the big sealed present, and the Happy Birthday reveal it unpacks into. */
export function Sealed({ phase, onOpen, onDone }: Props) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<RevealStage>("hidden");
  const [instant, setInstant] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const seqRef = useRef<Sequencer | null>(null);
  const started = useRef(false);
  const viaKeyboard = useRef(false);
  const openedAt = useRef(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const rx = useSpring(BASE_RX, { stiffness: 120, damping: 18 });
  const ry = useSpring(BASE_RY, { stiffness: 120, damping: 18 });

  useLayoutEffect(() => {
    const measure = () => {
      const bob = scope.current?.querySelector(".ov-bob");
      const skirt = bob?.querySelector(".gb-skirt--front");
      if (!bob || !skirt) return;
      const s = bob.getBoundingClientRect();
      const k = skirt.getBoundingClientRect();
      // Rects are already scaled by --s; the tag is positioned inside the scaled box, so undo it.
      const sc = s.width / (bob as HTMLElement).offsetWidth || 1;
      setAnchor({
        x: Math.round((k.right - s.left - k.width * 0.1) / sc),
        y: Math.round((k.bottom - s.top - k.height * 0.3) / sc),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [scope]);

  // Auto-advance once the note is showing (not for keyboard users, who may be mid-read).
  useEffect(() => {
    if (stage !== "note" || viaKeyboard.current) return;
    const t = window.setTimeout(() => doneRef.current(), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [stage]);

  /** Scale + offset that land the unfolded box between "Happy Birthday {name}" and the note. */
  function floorFit() {
    const root = scope.current;
    const top = root?.querySelector(".ov-top");
    const floor = root?.querySelector<HTMLElement>(".ov-floor");
    if (!top || !floor) return { y: 0, scale: 0.44 };
    const S = parseFloat(getComputedStyle(floor).getPropertyValue("--s")) || 1;
    const vh = window.innerHeight;
    const topBottom = top.getBoundingClientRect().bottom;
    const noteTop = vh - Math.min(80, Math.max(28, vh * 0.07)) - (window.innerWidth < 600 ? 200 : 150);
    const scale = Math.min(0.5, Math.max(0.26, (noteTop - topBottom - 32) / (CROSS_H * S)));
    const f = floor.getBoundingClientRect();
    const y = (topBottom + noteTop) / 2 - (f.top + f.height / 2) - CROSS_DROP * scale * S;
    return { y, scale };
  }

  async function open() {
    if (started.current) return;
    started.current = true;
    openedAt.current = performance.now();
    unlockAudio();
    onOpen();

    const seq = createSequencer();
    seqRef.current = seq;
    const a = (target: string, kf: DOMKeyframesDefinition, o: AnimationOptions = {}) =>
      seq.track(animate(target, kf, seq.opts(o)));

    const box = scope.current?.querySelector(".ov-box")?.getBoundingClientRect();
    const origin = box
      ? { x: (box.left + box.width / 2) / window.innerWidth, y: (box.top + box.height * 0.45) / window.innerHeight }
      : { x: 0.5, y: 0.5 };

    if (reduced) {
      await a(".ov-box", { opacity: 0 }, { duration: 0.3 });
      setInstant(true);
      setStage("note");
      return;
    }

    // 1. Anticipation wiggle
    await a(".ov-box .gb-body", { rotate: [0, -4, 4, -4, 3, 0] }, { duration: 0.46, ease: "easeInOut" });

    // 2. The bow unties; the tails flutter away; the ribbons slide off
    a(".ov-box .tag", { opacity: 0, y: 40, rotate: 22 }, { duration: 0.6, ease: "easeIn" });
    a(".ov-box .bow-loop", { pathLength: [1, 0] }, { duration: 0.5, ease: [0.55, 0, 0.75, 0.2] });
    a(".ov-box .bow-loop", { opacity: 0 }, { duration: 0.12, delay: 0.42 });
    a(".ov-box .bow-tail--l", { x: -70, y: -30, rotate: -80, opacity: 0 }, { duration: 0.7, ease: [0.3, 0.1, 0.4, 1] });
    a(".ov-box .bow-tail--r", { x: 80, y: -40, rotate: 90, opacity: 0 }, { duration: 0.7, ease: [0.3, 0.1, 0.4, 1] });
    a(".ov-box .bow-knot", { scale: 0.2, opacity: 0 }, { duration: 0.3, delay: 0.3 });
    a(".ov-box .gb-band--v", { scaleY: 0 }, { duration: 0.45, delay: 0.15, ease: [0.6, 0, 0.4, 1] });
    a(".ov-box .gb-band--x", { scaleX: 0 }, { duration: 0.45, delay: 0.15, ease: [0.6, 0, 0.4, 1] });
    a(".ov-box .gb-band--z", { scaleY: 0 }, { duration: 0.45, delay: 0.15, ease: [0.6, 0, 0.4, 1] });
    await seq.wait(560);

    // 3. The lid dips, then pops off on a springy arc and flies away
    playPop();
    await a(".ov-box .gb-lid", { y: 9 }, { duration: 0.13, ease: "easeOut" });
    a(".ov-box .gb-lid", { y: -560, x: 260, rotate: 32 }, { type: "spring", stiffness: 110, damping: 15 });
    a(".ov-box .gb-lid .gb-face, .ov-box .gb-bow-plane", { opacity: 0 }, { duration: 0.4, delay: 0.5 });
    await seq.wait(180);

    // 4. Light bursts out, with a big confetti burst (hearts included)
    playChime();
    a(".ov-box .gb-glow", { opacity: [0, 1, 0.75] }, { duration: 0.9 });
    a(".ov-bloom", { opacity: [0, 1, 0.55], scale: [0.3, 1.5, 1.25] }, { duration: 1.3, ease: "easeOut" });
    if (!seq.skipped) birthdayBurst(origin);

    // 5. "Happy Birthday" writes itself, then her name (CSS-driven, see BirthdayReveal)
    if (!seq.skipped) setStage("writing");
    await seq.wait(700);

    // 6. The walls fold outward and flat: the box unpacks into the floor
    scope.current?.querySelector(".ov-box .gb")?.setAttribute("data-unfolded", "true");
    a(".ov-box .gb-wall", { rotateX: -90 }, { type: "spring", stiffness: 80, damping: 13, delay: stagger(0.08) });
    seq.track(animate(rx, -60, seq.opts({ type: "spring" as const, stiffness: 60, damping: 16 })));
    seq.track(animate(ry, 0, seq.opts({ type: "spring" as const, stiffness: 60, damping: 16 })));
    const fit = floorFit();
    a(".ov-floor", { y: fit.y, scale: fit.scale }, { type: "spring", stiffness: 70, damping: 16 });
    a(".ov-box .gb-shadow", { opacity: 0 }, { duration: 0.5 });
    await seq.wait(1500);

    // 7. The note, then the way forward
    setStage("note");
  }

  function skip() {
    const seq = seqRef.current;
    if (!seq || seq.skipped) return;
    // A double-click on the present must not skip it: the pop and the burst always land.
    if (performance.now() - openedAt.current < 1800) return;
    seq.skip();
    setInstant(true);
    setStage("note");
  }

  return (
    <motion.section
      ref={scope}
      className={`overture overture--${phase}`}
      onClick={phase === "intro" ? (stage === "note" ? () => onDone() : skip) : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 0, transition: { duration: 0.3 } } : { opacity: 0, y: -24, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.8 }}
    >
      <div className="ov-top">
        <BirthdayTitle stage={stage} instant={instant} />
      </div>

      <div className="ov-floor">
        <div className="ov-bloom" aria-hidden="true">
          <span className="ov-rays" />
        </div>
        <button
          type="button"
          className="ov-box"
          onClick={(e) => {
            e.stopPropagation();
            if (phase === "sealed") {
              viaKeyboard.current = e.detail === 0;
              void open();
            } else skip();
          }}
          aria-label={phase === "sealed" ? copy.sealed.boxLabel : copy.sealed.skipLabel}
          tabIndex={phase === "sealed" ? 0 : -1}
        >
          <span className="ov-bob">
            <GiftBox dims={DIMS} paper={blushPaperStyle()} ribbon="#C8A46A" rotateX={rx} rotateY={ry} bowSize={210} />
            <GiftTag anchor={anchor} size="lg" phase={0.6}>
              {TAG_LINE} <span className="ov-heart">♡</span>
            </GiftTag>
          </span>
        </button>
        <p className="ov-hint" aria-hidden="true">
          {copy.sealed.hint}
        </p>
      </div>

      <div className="ov-bottom">
        <BirthdayNote stage={stage} instant={instant} onNext={onDone} />
      </div>
    </motion.section>
  );
}
