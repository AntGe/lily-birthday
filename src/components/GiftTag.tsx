import type { CSSProperties, ReactNode } from "react";
import "./GiftTag.css";

interface GiftTagProps {
  children: ReactNode;
  /** Where the string is tied, in px relative to the positioned parent. */
  anchor: { x: number; y: number } | null;
  size?: "sm" | "lg";
  /** Seconds offset for the sway so a row of tags doesn't move in lockstep. */
  phase?: number;
  className?: string;
}

/** A little kraft-and-gold gift tag hanging on a string, swaying gently. */
export function GiftTag({ children, anchor, size = "sm", phase = 0, className }: GiftTagProps) {
  if (!anchor) return null;
  return (
    <span
      className={`tag tag--${size} ${className ?? ""}`}
      style={{ left: anchor.x, top: anchor.y, "--sway-delay": `${-phase}s` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="tag-swing">
        <svg className="tag-string" viewBox="0 0 40 56" preserveAspectRatio="none">
          <path d="M1 1C12 14 26 28 40 56" />
        </svg>
        <span className="tag-card">
          <span className="tag-hole" />
          <span className="tag-text">{children}</span>
        </span>
      </span>
    </span>
  );
}
