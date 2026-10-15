import { copy } from "../copy";
import { SpeakerIcon } from "./Icons";

export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={copy.sound.label}
      title={on ? copy.sound.on : copy.sound.off}
    >
      <SpeakerIcon muted={!on} />
    </button>
  );
}
