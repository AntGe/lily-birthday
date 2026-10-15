import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { altFor, credits } from "../lib/data";
import { ChevronIcon, CloseIcon } from "./Icons";
import { Modal } from "./Modal";
import { Photo } from "./Photo";
import "./Lightbox.css";

export interface LightboxItem {
  id: string;
  caption?: string;
}

interface Props {
  items: LightboxItem[];
  start: number;
  onClose: () => void;
}

export function Lightbox({ items, start, onClose }: Props) {
  const [index, setIndex] = useState(start);
  const [dir, setDir] = useState(0);
  const reduced = useReducedMotion();
  const item = items[index];
  const credit = credits.find((c) => c.id === item.id);

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      setIndex((i) => (i + delta + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <Modal onClose={onClose} className="lightbox" label="Photo viewer" variant="fade">
      <div className="lb">
        <div className="lb-stage">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.figure
              key={item.id}
              className="lb-figure"
              custom={dir}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
              transition={{ type: "spring", stiffness: 170, damping: 22 }}
            >
              <Photo id={item.id} sizes="(max-width: 1100px) 96vw, 1100px" intrinsic className="lb-photo" priority />
              <figcaption className="lb-caption">
                <span>{item.caption ?? altFor(item.id)}</span>
                {credit && (
                  <span className="lb-credit">
                    Photo: {credit.author}
                    {credit.license ? ` · ${credit.license}` : ""}
                  </span>
                )}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <>
            <button type="button" className="lb-nav lb-nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
              <ChevronIcon />
            </button>
            <button type="button" className="lb-nav lb-nav--next" onClick={() => go(1)} aria-label="Next photo">
              <ChevronIcon />
            </button>
            <p className="lb-count" aria-hidden="true">
              {index + 1} / {items.length}
            </p>
          </>
        )}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {`Photo ${index + 1} of ${items.length}: ${item.caption ?? altFor(item.id)}`}
        </p>
        <button type="button" className="lb-close" onClick={onClose} aria-label="Close photo">
          <CloseIcon />
        </button>
      </div>
    </Modal>
  );
}
