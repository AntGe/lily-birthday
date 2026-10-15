import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, RefObject } from "react";
import { copy } from "../copy";
import { altFor } from "../lib/data";
import type { JourneyStop } from "../types";
import { HeartIcon } from "./Icons";
import { Photo } from "./Photo";
import "./Journey.css";

interface Props {
  stops: JourneyStop[];
  scrollRoot: RefObject<HTMLElement | null>;
  onPhoto: (images: string[], index: number) => void;
}

// Each print lands slightly askew, like photos tucked into a travel journal.
const TILT = [-3, 2.5, -1.5];

/** A loose, image-led itinerary: where we'll be, a vague hint, and a few photo prints. */
export function Journey({ stops, scrollRoot, onPhoto }: Props) {
  const reduced = useReducedMotion();
  const viewport = { root: scrollRoot, once: true, amount: 0.25 };
  let side = 0;

  return (
    <ol className="journey">
      {stops.map((stop) => {
        const quiet = stop.images.length === 0;
        const flip = !quiet && side++ % 2 === 1;
        return (
          <motion.li
            key={stop.days}
            className={`jn-stop ${quiet ? "jn-stop--quiet" : ""} ${flip ? "jn-stop--flip" : ""}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={reduced ? { duration: 0.3 } : { type: "spring", stiffness: 170, damping: 22 }}
          >
            <div className="jn-node" aria-hidden="true">
              <HeartIcon />
            </div>

            <div className="jn-text">
              <span className="jn-days">{copy.journey.days(stop.days)}</span>
              <h4 className="jn-title display">{stop.title}</h4>
              <p className="jn-hint">{stop.hint}</p>
            </div>

            {!quiet && (
              <div className={`jn-prints jn-prints--${Math.min(stop.images.length, 3)}`}>
                {stop.images.slice(0, 3).map((id, k) => (
                  <motion.button
                    key={id}
                    type="button"
                    className="jn-print"
                    style={{ "--k": k } as CSSProperties}
                    onClick={() => onPhoto(stop.images, k)}
                    aria-label={copy.journey.enlarge(altFor(id))}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: TILT[k] }}
                    whileHover={reduced ? undefined : { rotate: 0, scale: 1.04, zIndex: 5 }}
                    viewport={viewport}
                    transition={
                      reduced ? { duration: 0.3 } : { type: "spring", stiffness: 170, damping: 18, delay: 0.08 + k * 0.09 }
                    }
                  >
                    <span className="jn-photo">
                      <Photo id={id} sizes="(max-width: 760px) 60vw, 280px" alt="" />
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
