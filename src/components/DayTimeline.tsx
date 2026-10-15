import { motion, useReducedMotion } from "motion/react";
import type { RefObject } from "react";
import type { Day } from "../types";
import { BulbIcon, GlassIcon, HeartIcon, PawIcon, PinIcon } from "./Icons";
import { Photo } from "./Photo";
import { copy } from "../copy";
import "./DayTimeline.css";

interface Props {
  days: Day[];
  scrollRoot: RefObject<HTMLElement | null>;
  onPhoto: (id: string, caption: string) => void;
}

export function DayTimeline({ days, scrollRoot, onPhoto }: Props) {
  const reduced = useReducedMotion();
  return (
    <ol className="timeline">
      {days.map((day, i) => (
        <motion.li
          key={day.n}
          className={`tl-day ${day.image ? "tl-day--photo" : ""} ${i % 2 ? "tl-day--flip" : ""} ${day.special ? "tl-day--special" : ""}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ root: scrollRoot, once: true, amount: 0.25 }}
          transition={reduced ? { duration: 0.3 } : { type: "spring", stiffness: 170, damping: 22, delay: 0.04 }}
        >
          <div className="tl-node" aria-hidden="true">
            <span>{day.n}</span>
          </div>

          <div className="tl-content">
            <div className="tl-head">
              <span className="tl-badge">{copy.timeline.day(day.n)}</span>
              {day.special && (
                <span className="tl-special">
                  <HeartIcon /> {copy.timeline.romantic}
                </span>
              )}
            </div>
            <h4 className="tl-title display">{day.title}</h4>
            <p className="tl-base">
              <PinIcon /> {day.base}
            </p>
            <ul className="tl-do">
              {day.do.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {day.animal && (
              <p className="tl-animal">
                <PawIcon />
                <span>
                  <strong>{copy.timeline.animal}</strong> {day.animal}
                </span>
              </p>
            )}
            <p className="tl-taste">
              <GlassIcon />
              <span>
                <strong>{copy.timeline.taste}</strong> {day.taste}
              </span>
            </p>
            <p className="tl-tip">
              <BulbIcon />
              <span>{day.tip}</span>
            </p>
          </div>

          {!day.image && (
            <div className="tl-aside" aria-hidden="true">
              <span className="tl-aside-day">{copy.timeline.day(day.n)}</span>
              <span className="tl-aside-place display">{day.base}</span>
            </div>
          )}

          {day.image && (
            <button type="button" className="tl-photo" onClick={() => onPhoto(day.image!, `${copy.timeline.day(day.n)} · ${day.title}`)} aria-label={copy.timeline.enlargeDay(day.n)}>
              <Photo id={day.image} sizes="(max-width: 760px) 90vw, 400px" />
            </button>
          )}
        </motion.li>
      ))}
    </ol>
  );
}
