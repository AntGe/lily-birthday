import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { accentText, buttonColor } from "../lib/color";
import { altFor, photosFor, photoMeta } from "../lib/data";
import type { Trip } from "../types";
import { DayTimeline } from "./DayTimeline";
import { ClockIcon, CloseIcon, GlassIcon, MountainIcon, PawIcon, SunIcon, WaveIcon } from "./Icons";
import { Lightbox, type LightboxItem } from "./Lightbox";
import { Modal } from "./Modal";
import { Photo } from "./Photo";
import "./TripModal.css";

interface Props {
  trip: Trip;
  onClose: () => void;
  onChoose: (id: string) => void;
}

export function TripModal({ trip, onClose, onChoose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; start: number } | null>(null);
  const titleId = `trip-title-${trip.id}`;

  // Modal (a child) has already called showModal() when this runs, so this overrides its default focus:
  // arrow keys / Page Down / Space scroll the trip straight away.
  useEffect(() => {
    scrollRef.current?.focus({ preventScroll: true });
  }, []);

  const gallery = photosFor(trip.id);
  const highlightItems: LightboxItem[] = trip.highlights
    .filter((h) => h.image)
    .map((h) => ({ id: h.image!, caption: h.title }));

  const style = {
    "--accent": trip.wrap.base,
    "--accent-deep": accentText(trip.wrap.base, trip.wrap.ink),
    "--btn": buttonColor(trip.wrap.base, trip.wrap.ink),
    "--ribbon": trip.wrap.ribbon,
  } as CSSProperties;

  const reveal = (i: number) =>
    reduced
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, y: 22 },
          whileInView: { opacity: 1, y: 0 },
          transition: { type: "spring" as const, stiffness: 170, damping: 22, delay: i * 0.06 },
        };
  const viewport = { root: scrollRef, once: true, amount: 0.2 };

  return (
    <Modal onClose={onClose} className="trip-modal" labelledBy={titleId} variant="sheet">
      <div className="tm" style={style}>
        <button type="button" className="tm-close" onClick={onClose} aria-label="Close trip details">
          <CloseIcon />
        </button>
        {/* Initial focus lands on the scroller, so arrow keys / space scroll the trip straight away */}
        <div className="tm-scroll" ref={scrollRef} tabIndex={-1}>
          <div className="tm-hero">
            <div className="tm-hero-media">
              <motion.div
                className="tm-hero-photo"
                initial={reduced ? false : { scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Photo id={trip.hero} sizes="(max-width: 960px) 100vw, 960px" priority />
              </motion.div>
              <div className="tm-hero-fade" />
            </div>
            <div className="tm-hero-text">
              <p className="tm-region">{trip.region}</p>
              <h2 id={titleId} className="tm-name display">
                {trip.name}
              </h2>
              <p className="tm-country">{trip.country}</p>
              <p className="tm-tagline">{trip.tagline}</p>
              <div className="tm-pills">
                <span className="pill pill--glass">
                  <ClockIcon /> {trip.length}
                </span>
                <span className="pill pill--glass">
                  <SunIcon /> {trip.weather.air}
                </span>
                <span className="pill pill--glass">
                  <WaveIcon /> Sea {trip.weather.sea}
                </span>
              </div>
            </div>
          </div>

          <div className="tm-body">
            <motion.section className="tm-intro" {...reveal(0)} viewport={viewport}>
              <p className="tm-summary">{trip.summary}</p>
              <p className="tm-weather-note">
                <SunIcon /> {trip.weather.note}
              </p>
            </motion.section>

            <section className="tm-section" aria-labelledby={`${titleId}-why`}>
              <h3 id={`${titleId}-why`} className="tm-h3 display">
                Why you’ll love it
              </h3>
              <div className="tm-why">
                <motion.article className="why-card why-card--animals" {...reveal(0)} viewport={viewport}>
                  <div className="why-illo" aria-hidden="true">
                    <PawIcon className="why-paw why-paw--1" />
                    <PawIcon className="why-paw why-paw--2" />
                    <PawIcon className="why-paw why-paw--3" />
                  </div>
                  <h4 className="why-title">
                    <span className="why-icon">
                      <PawIcon />
                    </span>
                    Animals
                  </h4>
                  <p>{trip.why.animals}</p>
                </motion.article>
                <motion.article className="why-card why-card--food" {...reveal(1)} viewport={viewport}>
                  <h4 className="why-title">
                    <span className="why-icon">
                      <GlassIcon />
                    </span>
                    Food &amp; wine
                  </h4>
                  <p>{trip.why.food}</p>
                </motion.article>
                <motion.article className="why-card why-card--adventure" {...reveal(2)} viewport={viewport}>
                  <h4 className="why-title">
                    <span className="why-icon">
                      <MountainIcon />
                    </span>
                    Adventure
                  </h4>
                  <p>{trip.why.adventure}</p>
                </motion.article>
              </div>
            </section>

            <section className="tm-section" aria-labelledby={`${titleId}-hl`}>
              <h3 id={`${titleId}-hl`} className="tm-h3 display">
                Highlights
              </h3>
              <ul className="tm-highlights">
                {trip.highlights.map((h, i) => (
                  <motion.li key={h.title} {...reveal(i % 3)} viewport={viewport}>
                    <button
                      type="button"
                      className="hl-tile"
                      disabled={!h.image}
                      onClick={() => setLightbox({ items: highlightItems, start: Math.max(0, highlightItems.findIndex((x) => x.caption === h.title)) })}
                    >
                      <span className="hl-photo">
                        {h.image && <Photo id={h.image} sizes="(max-width: 760px) 90vw, 300px" alt="" />}
                        <span className="hl-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      </span>
                      <span className="hl-title display">{h.title}</span>
                      <span className="hl-hook">{h.hook}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </section>

            <section className="tm-section" aria-labelledby={`${titleId}-days`}>
              <h3 id={`${titleId}-days`} className="tm-h3 display">
                Day by day
              </h3>
              <DayTimeline
                days={trip.days}
                scrollRoot={scrollRef}
                onPhoto={(id, caption) => setLightbox({ items: [{ id, caption }], start: 0 })}
              />
            </section>

            <section className="tm-section" aria-labelledby={`${titleId}-gallery`}>
              <h3 id={`${titleId}-gallery`} className="tm-h3 display">
                Gallery
              </h3>
              <ul className="tm-gallery">
                {gallery.map((id, i) => (
                  <li key={id} style={{ aspectRatio: String(photoMeta(id)?.ratio ?? 1.5) }}>
                    <button
                      type="button"
                      className="gal-tile"
                      onClick={() => setLightbox({ items: gallery.map((g) => ({ id: g })), start: i })}
                      aria-label={`Enlarge: ${altFor(id)}`}
                    >
                      <Photo id={id} sizes="(max-width: 760px) 45vw, 300px" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="tm-section tm-section--last" aria-labelledby={`${titleId}-gtk`}>
              <h3 id={`${titleId}-gtk`} className="tm-h3 tm-h3--small display">
                Good to know
              </h3>
              <ul className="tm-gtk">
                {trip.goodToKnow.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="tm-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Keep exploring
            </button>
            <button type="button" className="btn tm-choose" onClick={() => onChoose(trip.id)}>
              I choose {trip.name} <span aria-hidden="true">♡</span>
            </button>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {lightbox && <Lightbox key="lb" items={lightbox.items} start={lightbox.start} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </Modal>
  );
}
