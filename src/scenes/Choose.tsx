import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { PresentSlot } from "../components/PresentSlot";
import { celebrate } from "../lib/confetti";
import { trips, tripById } from "../lib/data";
import { playFanfare } from "../lib/sound";
import { useSceneFocus } from "../lib/useSceneFocus";
import { copy } from "../copy";
import "./Choose.css";

interface Props {
  opened: Set<string>;
  /** Set when she has just said yes: play the celebration, then call onCelebrated. */
  choosingId: string | null;
  onUnwrapped: (id: string) => void;
  onOpenTrip: (id: string) => void;
  onChoose: (id: string) => void;
  onCelebrated: () => void;
  onCredits: () => void;
}

/** Scene C: four presents, each unwrapping into a destination card. */
export function Choose({ opened, choosingId, onUnwrapped, onOpenTrip, onChoose, onCelebrated, onCredits }: Props) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const reduced = useReducedMotion();
  const headingRef = useSceneFocus<HTMLHeadingElement>();
  const celebratedRef = useRef(onCelebrated);
  celebratedRef.current = onCelebrated;
  const count = opened.size;
  const allOpen = count === trips.length;

  // Scene D: the others fall away, the chosen card flies to the centre, confetti everywhere.
  useEffect(() => {
    if (!choosingId) return;
    let cancelled = false;
    const trip = tripById(choosingId);
    (async () => {
      const root = scope.current;
      if (!root || !trip) return;
      const chosen = root.querySelector<HTMLElement>(`[data-slot="${choosingId}"]`);
      const others = [...root.querySelectorAll<HTMLElement>("[data-slot]")].filter((el) => el !== chosen);

      if (reduced) {
        await Promise.all([
          animate(others, { opacity: 0 }, { duration: 0.3 }),
          animate(".choose-head, .choose-foot", { opacity: 0 }, { duration: 0.3 }),
        ]);
        await new Promise((r) => setTimeout(r, 400));
        if (!cancelled) celebratedRef.current();
        return;
      }

      others.forEach((el, i) => {
        animate(el, { opacity: 0, y: 90, rotate: i % 2 ? 7 : -6, scale: 0.92 }, { duration: 0.55, delay: i * 0.06, ease: [0.5, 0, 0.75, 0] });
      });
      animate(".choose-head, .choose-foot", { opacity: 0, y: -16 }, { duration: 0.4 });
      animate(chosen ? chosen.querySelectorAll(".slot-cta") : [], { opacity: 0 }, { duration: 0.2 });

      if (chosen) {
        const card = chosen.querySelector(".card-wrap")?.getBoundingClientRect() ?? chosen.getBoundingClientRect();
        const dx = window.innerWidth / 2 - (card.left + card.width / 2);
        const dy = window.innerHeight / 2 - (card.top + card.height / 2);
        await new Promise((r) => setTimeout(r, 120));
        animate(chosen, { x: dx, y: dy, scale: 1.14, zIndex: 20 }, { type: "spring", stiffness: 150, damping: 18 });
      }
      await new Promise((r) => setTimeout(r, 400)); // the card is landing
      playFanfare();
      celebrate([trip.wrap.base, trip.wrap.ribbon, trip.wrap.ink]);
      if (chosen) animate(chosen, { scale: [1.14, 1.2, 1.14] }, { duration: 0.45, ease: "easeOut" }); // a happy bounce on the burst
      await new Promise((r) => setTimeout(r, 1100));
      // No fade-out here: the scene exit hands straight to the postcard while the confetti is still flying
      if (!cancelled) celebratedRef.current();
    })();
    return () => {
      cancelled = true;
    };
  }, [choosingId, animate, scope, reduced]);

  return (
    <motion.section
      ref={scope}
      className="choose"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.35 }}
    >
      <header className="choose-head">
        <motion.h1
          ref={headingRef}
          tabIndex={-1}
          className="choose-title display"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 20, delay: 0.1 }}
        >
          {copy.choose.title}
        </motion.h1>
        <motion.p
          className="choose-sub"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 20, delay: 0.22 }}
        >
          {copy.choose.sub}
        </motion.p>
        <motion.div
          className="progress"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <div className="progress-line" aria-hidden="true">
            <span
              className="progress-fill"
              style={{ transform: `scaleX(${count ? (count - 1) / (trips.length - 1) : 0})` }}
            />
            {trips.map((_, i) => {
              // Nodes light up in the order she unwraps, in that present's colour
              const lit = tripById([...opened][i]);
              return (
                <span
                  key={i}
                  className={`progress-node ${lit ? "is-on" : ""}`}
                  style={{ left: `${(i / (trips.length - 1)) * 100}%`, background: lit?.wrap.base }}
                />
              );
            })}
          </div>
          <div className="progress-text" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              {allOpen ? (
                <motion.p
                  key="all"
                  className="choose-all display"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 170, damping: 20, delay: 0.3 }}
                >
                  {copy.choose.allOpen}
                </motion.p>
              ) : (
                <motion.p key="count" className="progress-label" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                  {copy.choose.progress(count, trips.length)}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </header>

      <div className="choose-stage">
        <div className="choose-floor" aria-hidden="true" />
        <ul className="choose-grid">
          {trips.map((trip, i) => (
            <motion.li
              key={trip.id}
              data-slot={trip.id}
              className="choose-cell"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduced ? { duration: 0.3 } : { type: "spring", stiffness: 170, damping: 16, delay: 0.1 + i * 0.07 }}
            >
              <PresentSlot
                trip={trip}
                index={i}
                opened={opened.has(trip.id)}
                onUnwrapped={onUnwrapped}
                onOpenTrip={onOpenTrip}
                onChoose={onChoose}
              />
            </motion.li>
          ))}
        </ul>
      </div>

      <footer className="choose-foot">
        <button type="button" className="link-quiet" onClick={onCredits}>
          {copy.choose.credits}
        </button>
      </footer>
    </motion.section>
  );
}
