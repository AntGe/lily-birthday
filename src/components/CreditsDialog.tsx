import { altFor, credits } from "../lib/data";
import { CloseIcon } from "./Icons";
import { Modal } from "./Modal";
import { copy } from "../copy";

export function CreditsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} className="credits" labelledBy="credits-title" variant="pop">
      <div className="credits-card">
        <button type="button" className="credits-close" onClick={onClose} aria-label={copy.credits.close}>
          <CloseIcon />
        </button>
        <h2 id="credits-title" className="display">
          {copy.credits.title}
        </h2>
        <p className="credits-intro">{copy.credits.intro}</p>
        <ul className="credits-list">
          {credits.map((c) => (
            <li key={c.id}>
              <span className="credits-id">{altFor(c.id)}</span>
              <span className="credits-who">
                {c.sourceUrl ? (
                  <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                    {c.author}
                  </a>
                ) : (
                  c.author
                )}
                {" · "}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}
              </span>
            </li>
          ))}
          {credits.length === 0 && <li>{copy.credits.empty}</li>}
        </ul>
      </div>
    </Modal>
  );
}
