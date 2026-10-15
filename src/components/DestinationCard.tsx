import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { forwardRef, type CSSProperties, type PointerEvent } from "react";
import { shortTemp } from "../lib/data";
import type { Trip } from "../types";
import { ArrowIcon, ClockIcon, SunIcon, WaveIcon } from "./Icons";
import { Photo } from "./Photo";
import "./DestinationCard.css";

export const CARD_SIZES = "(max-width: 560px) 92vw, 320px";

interface Props {
  trip: Trip;
  onOpen: () => void;
  /** Disable hover/press behaviour (e.g. while the final choice plays out). */
  inert?: boolean;
}

export const DestinationCard = forwardRef<HTMLButtonElement, Props>(function DestinationCard({ trip, onOpen, inert }, ref) {
  const reduced = useReducedMotion();
  const spring = { stiffness: 170, damping: 20 };
  const rx = useSpring(useMotionValue(0), spring);
  const ry = useSpring(useMotionValue(0), spring);
  const lift = useSpring(useMotionValue(0), spring);

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (reduced || inert || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    ry.set(nx * 10);
    rx.set(-ny * 8);
    lift.set(-6);
    e.currentTarget.style.setProperty("--mx", `${((nx + 0.5) * 100).toFixed(1)}%`);
    e.currentTarget.style.setProperty("--my", `${((ny + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    lift.set(0);
  };

  const style = {
    rotateX: rx,
    rotateY: ry,
    y: lift,
    transformPerspective: 900,
    "--accent": trip.wrap.base,
    "--ribbon": trip.wrap.ribbon,
  } as unknown as CSSProperties;

  return (
    <motion.button
      ref={ref}
      type="button"
      className="dcard"
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onBlur={onLeave}
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`${trip.name}, ${trip.country}. ${trip.length}. ${trip.tagline}. See the full trip`}
      tabIndex={inert ? -1 : 0}
    >
      <span className="dcard-frame">
        <span className="dcard-photo">
          <Photo id={trip.hero} sizes={CARD_SIZES} priority />
          <span className="dcard-photo-fade" />
          <span className="dcard-pills">
            <span className="pill pill--glass">
              <ClockIcon />
              {trip.length}
            </span>
            <span className="pill pill--glass">
              <SunIcon />
              {shortTemp(trip.weather.air)}
              <span className="dcard-dot">·</span>
              <WaveIcon />
              {shortTemp(trip.weather.sea)}
            </span>
          </span>
        </span>

        <span className="dcard-body">
          <span className="dcard-name display">{trip.name}</span>
          <span className="dcard-country">{trip.country}</span>
          <span className="dcard-tagline">{trip.tagline}</span>
          <span className="dcard-summary">{trip.summary}</span>
          <span className="dcard-vibes">
            {trip.vibes.map((v) => (
              <span key={v} className="dcard-chip">
                {v}
              </span>
            ))}
          </span>
        </span>

        <span className="dcard-hint">
          Tap to see the trip <ArrowIcon />
        </span>
        <span className="dcard-sheen" />
      </span>
    </motion.button>
  );
});
