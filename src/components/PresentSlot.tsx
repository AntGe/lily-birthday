import { motion, useAnimate, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { buttonColor } from "../lib/color";
import { puff } from "../lib/confetti";
import { playChime, playPop, unlockAudio } from "../lib/sound";
import type { Trip } from "../types";
import { DestinationCard } from "./DestinationCard";
import { GiftBox, type BoxDims } from "./GiftBox";
import { GiftTag } from "./GiftTag";
import { paperStyle } from "./WrappingPaper";
import { copy } from "../copy";
import "./PresentSlot.css";

// Each present has its own silhouette: tall, wide, cube, slim (in order).
const SHAPES: BoxDims[] = [
  { w: 150, h: 196, d: 132, lid: 40 },
  { w: 226, h: 124, d: 150, lid: 34 },
  { w: 172, h: 166, d: 172, lid: 38 },
  { w: 120, h: 216, d: 108, lid: 36 },
];
const BASE_RX = -18;
const BASE_RY = -28;

interface Props {
  trip: Trip;
  index: number;
  opened: boolean;
  onUnwrapped: (id: string) => void;
  onOpenTrip: (id: string) => void;
  onChoose: (id: string) => void;
  cardRef?: (el: HTMLButtonElement | null) => void;
}

export function PresentSlot({ trip, index, opened, onUnwrapped, onOpenTrip, onChoose, cardRef }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"wrapped" | "unwrapping" | "open">(opened ? "open" : "wrapped");
  const [revealedNow, setRevealedNow] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const presentRef = useRef<HTMLButtonElement>(null);
  const cardBtnRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocus = useRef(false);

  const dims = SHAPES[index % SHAPES.length];
  const springCfg = { stiffness: 170, damping: 20 };
  const rx = useSpring(BASE_RX, springCfg);
  const ry = useSpring(BASE_RY, springCfg);

  // Tie the gift tag's string to the lid's front-right corner (measured from the projected 3D box).
  useLayoutEffect(() => {
    if (phase !== "wrapped") return;
    const measure = () => {
      const bob = stageRef.current?.querySelector(".present-bob");
      const skirt = bob?.querySelector(".gb-skirt--front");
      if (!bob || !skirt) return;
      const s = bob.getBoundingClientRect();
      const k = skirt.getBoundingClientRect();
      const sc = s.width / (bob as HTMLElement).offsetWidth || 1;
      // Keep the tag (~150px wide) inside the slot on narrow screens
      const stageW = stageRef.current?.clientWidth ?? Infinity;
      const maxX = (stageW - (s.left - (stageRef.current?.getBoundingClientRect().left ?? 0))) / sc - 158;
      setAnchor({
        x: Math.round(Math.min((k.right - s.left - k.width * 0.12) / sc, maxX)),
        y: Math.round((k.bottom - s.top - k.height * 0.35) / sc),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [phase]);

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (reduced || phase !== "wrapped" || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    ry.set(BASE_RY + nx * 8);
    rx.set(BASE_RX - ny * 8);
  };
  const onLeave = () => {
    rx.set(BASE_RX);
    ry.set(BASE_RY);
  };

  async function unwrap() {
    if (phase !== "wrapped") return;
    // Keyboard users keep their place: focus moves to the card that replaces this present.
    restoreFocus.current = document.activeElement === presentRef.current;
    unlockAudio();
    setPhase("unwrapping");
    onLeave();
    const colors = [trip.wrap.base, trip.wrap.ribbon, trip.wrap.ink, "#C8A46A", "#F4DCDD"];

    if (reduced) {
      await Promise.all([
        animate(".present", { opacity: 0 }, { duration: 0.3 }),
        animate(".card-wrap", { opacity: [0, 1] }, { duration: 0.3 }),
      ]);
      finish();
      return;
    }

    // 1. Anticipation wiggle
    await animate(".gb-body", { rotate: [0, -4, 4, -3, 2.5, 0] }, { duration: 0.42, ease: "easeInOut" });

    // 2. The bow unties and the ribbons slide off towards the knot
    animate(".tag", { opacity: 0, y: 26, rotate: 14 }, { duration: 0.45, ease: "easeIn" });
    animate(".bow-loop", { pathLength: [1, 0] }, { duration: 0.42, ease: [0.55, 0, 0.75, 0.2] });
    animate(".bow-loop", { opacity: 0 }, { duration: 0.1, delay: 0.34 });
    animate(".bow-tail--l", { x: -22, y: 26, rotate: -35, opacity: 0 }, { duration: 0.45, ease: "easeIn" });
    animate(".bow-tail--r", { x: 22, y: 26, rotate: 35, opacity: 0 }, { duration: 0.45, ease: "easeIn" });
    animate(".bow-knot", { scale: 0.2, opacity: 0 }, { duration: 0.25, delay: 0.24 });
    animate(".gb-band--v", { scaleY: 0 }, { duration: 0.38, delay: 0.08, ease: [0.6, 0, 0.4, 1] });
    animate(".gb-band--x", { scaleX: 0 }, { duration: 0.38, delay: 0.08, ease: [0.6, 0, 0.4, 1] });
    await animate(".gb-band--z", { scaleY: 0 }, { duration: 0.38, delay: 0.08, ease: [0.6, 0, 0.4, 1] });

    // 3. The paper tears down a jagged seam; little scraps tumble
    // Opaque paper rips along the zig-zag seam; it only fades once it's well apart
    animate(".gb-tear--l", { x: "-62%", y: 10, rotate: -12 }, { duration: 0.6, ease: [0.25, 0.6, 0.4, 1] });
    animate(".gb-tear--r", { x: "62%", y: 14, rotate: 12 }, { duration: 0.6, ease: [0.25, 0.6, 0.4, 1] });
    animate(".gb-tear--l, .gb-tear--r", { opacity: [1, 1, 0] }, { duration: 0.6, times: [0, 0.6, 1], ease: "easeIn" });
    scope.current?.querySelectorAll<HTMLElement>(".gb-scrap").forEach((el, i) => {
      const dir = i % 2 ? 1 : -1;
      animate(
        el,
        { opacity: [0, 1, 1, 0], x: [0, dir * (16 + i * 5)], y: [0, 70 + i * 12], rotate: [0, dir * (140 + i * 30)] },
        { duration: 0.85, delay: i * 0.025, ease: "easeIn" },
      );
    });
    await new Promise((r) => setTimeout(r, 300));

    // 4. The lid dips, then lifts away on a spring (faces fade; never fade a preserve-3d parent)
    playPop();
    await animate(".gb-lid", { y: 5 }, { duration: 0.1, ease: "easeOut" });
    animate(".gb-lid", { y: -150, x: 34, rotate: -16 }, { type: "spring", stiffness: 170, damping: 16 });
    animate(".gb-lid .gb-face, .gb-bow-plane", { opacity: 0 }, { duration: 0.35, delay: 0.25 });
    animate(".gb-glow", { opacity: [0, 1, 0.8] }, { duration: 0.45, ease: "easeOut" });
    await new Promise((r) => setTimeout(r, 230));

    // 5. The card rises out of the box as the box sinks away; a puff of confetti
    playChime();
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) {
      puff({ x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height * 0.55) / window.innerHeight }, colors);
    }
    setRevealedNow(true);
    // The card starts inside the box's outline and grows up out of it
    animate(".present", { y: 60, scale: 0.86, opacity: 0 }, { duration: 0.32, delay: 0.06, ease: [0.4, 0, 1, 1] });
    animate(".card-wrap", { opacity: [0, 1] }, { duration: 0.16, ease: "easeOut" });
    await animate(".card-wrap", { y: [20, 0], scale: [0.55, 1] }, { type: "spring", stiffness: 170, damping: 17 });
    finish();
  }

  useEffect(() => {
    if (phase !== "open" || !restoreFocus.current) return;
    restoreFocus.current = false;
    cardBtnRef.current?.focus({ preventScroll: true });
  }, [phase]);

  function finish() {
    setRevealedNow(true);
    setPhase("open");
    onUnwrapped(trip.id);
  }

  const style = {
    "--accent": trip.wrap.base,
    "--accent-ink": "#fff",
    "--btn": buttonColor(trip.wrap.base, trip.wrap.ink),
    "--i": index,
  } as CSSProperties;

  return (
    <div ref={scope} className="slot" style={style} data-phase={phase}>
      <div ref={stageRef} className="slot-stage">
        <div
          className="card-wrap"
          style={phase !== "open" ? { opacity: 0, pointerEvents: "none" } : undefined}
          aria-hidden={phase !== "open"}
        >
          <DestinationCard
            ref={(el) => {
              cardBtnRef.current = el;
              cardRef?.(el);
            }}
            trip={trip} onOpen={() => onOpenTrip(trip.id)} inert={phase !== "open"} />
        </div>

        {phase !== "open" && (
          <button
            ref={presentRef}
            type="button"
            className="present"
            onClick={unwrap}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            aria-disabled={phase !== "wrapped" || undefined}
            aria-label={copy.choose.unwrapLabel(index + 1, 4, trip.wrap.tagHint)}
          >
            <span className="present-bob">
              <GiftBox dims={dims} paper={paperStyle(trip.wrap)} ribbon={trip.wrap.ribbon} rotateX={rx} rotateY={ry} tearable />
              <span className="present-sparkles" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <GiftTag anchor={anchor} phase={index * 0.9}>
                {trip.wrap.tagHint}
              </GiftTag>
            </span>
          </button>
        )}
      </div>

      <div className="slot-cta">
        {phase === "open" && (
          <motion.button
            type="button"
            className="btn choose-btn"
            onClick={() => onChoose(trip.id)}
            initial={revealedNow ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 170, damping: 20 }}
          >
            {copy.choose.chooseThis}
            <span className="sr-only">: {trip.name}</span> <span aria-hidden="true">♡</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
