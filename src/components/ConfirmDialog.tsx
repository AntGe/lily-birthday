import type { CSSProperties } from "react";
import { buttonColor } from "../lib/color";
import type { Trip } from "../types";
import { HeartIcon } from "./Icons";
import { Modal } from "./Modal";
import { Photo } from "./Photo";
import { paperBackground } from "./WrappingPaper";
import "./ConfirmDialog.css";

interface Props {
  trip: Trip;
  onYes: () => void;
  onNo: () => void;
}

export function ConfirmDialog({ trip, onYes, onNo }: Props) {
  const style = {
    "--accent": trip.wrap.base,
    "--btn": buttonColor(trip.wrap.base, trip.wrap.ink),
    "--paper": paperBackground(trip.wrap),
  } as CSSProperties;

  return (
    <Modal
      onClose={onNo}
      className="confirm"
      labelledBy="confirm-title"
      variant="pop"
      returnFocus={() => document.querySelector<HTMLElement>(`[data-slot="${trip.id}"] .dcard`)}
    >
      <div className="confirm-card" style={style}>
        <div className="confirm-strip" aria-hidden="true" />
        <div className="confirm-photo">
          <Photo id={trip.hero} sizes="120px" alt="" />
        </div>
        <span className="confirm-heart" aria-hidden="true">
          <HeartIcon />
        </span>
        <h2 id="confirm-title" className="confirm-title display">
          {trip.name}?
          <br />
          <em>Final answer?</em> <HeartIcon />
        </h2>
        <div className="confirm-actions">
          <button type="button" className="btn confirm-yes" onClick={onYes} autoFocus>
            Yes, this one!
          </button>
          <button type="button" className="btn btn--ghost" onClick={onNo}>
            Let me look again
          </button>
        </div>
      </div>
    </Modal>
  );
}
