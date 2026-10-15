import { SpeakerIcon } from "./Icons";

export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={onToggle}
      aria-pressed={on}
      aria-label="Sound"
      title={on ? "Sound on" : "Sound off"}
    >
      <SpeakerIcon muted={!on} />
    </button>
  );
}
