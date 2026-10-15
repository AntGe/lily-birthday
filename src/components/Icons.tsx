import type { SVGProps } from "react";

// Fine-line icons, drawn to sit with Fraunces/Manrope rather than relying on OS emoji.
type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: `icon ${props.className ?? ""}`,
});

export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
  </svg>
);

export const WaveIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 9c1.6-1.6 3.2-1.6 4.8 0s3.2 1.6 4.8 0 3.2-1.6 4.8 0 3.2 1.6 4.6 0" />
    <path d="M2.5 15c1.6-1.6 3.2-1.6 4.8 0s3.2 1.6 4.8 0 3.2-1.6 4.8 0 3.2 1.6 4.6 0" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

export const PawIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <ellipse cx="6.2" cy="10.2" rx="1.9" ry="2.4" transform="rotate(-18 6.2 10.2)" />
    <ellipse cx="9.8" cy="6.4" rx="1.9" ry="2.5" transform="rotate(-6 9.8 6.4)" />
    <ellipse cx="14.2" cy="6.4" rx="1.9" ry="2.5" transform="rotate(6 14.2 6.4)" />
    <ellipse cx="17.8" cy="10.2" rx="1.9" ry="2.4" transform="rotate(18 17.8 10.2)" />
    <path d="M12 11.2c-2.6 0-5.2 3.3-5.2 5.6 0 1.7 1.3 2.6 2.8 2.6 1 0 1.6-.5 2.4-.5s1.4.5 2.4.5c1.5 0 2.8-.9 2.8-2.6 0-2.3-2.6-5.6-5.2-5.6z" />
  </svg>
);

export const GlassIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M7.5 3h9c.3 3.9-.2 8.2-4.5 8.7C7.7 11.2 7.2 6.9 7.5 3z" />
    <path d="M7.9 6.8h8.2" opacity=".55" />
    <path d="M12 11.7V20M8.5 20.5h7" />
  </svg>
);

export const MountainIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 19.5 9 8.5l3.6 6 2.4-3.6 6.5 8.6z" />
    <path d="M7.2 11.6 9 12.6l1.6-1.3" />
    <circle cx="17.5" cy="5.5" r="1.6" />
  </svg>
);

export const HeartIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 20.5s-7.6-4.6-9.6-9.3C.9 7.7 2.8 4 6.3 3.6c2.2-.3 4.1.9 5.7 3 1.6-2.1 3.5-3.3 5.7-3 3.5.4 5.4 4.1 3.9 7.6-2 4.7-9.6 9.3-9.6 9.3z" />
  </svg>
);

export const BulbIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 17.5h6M10 20.5h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V17h5.2v-1.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={1.9}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />
  </svg>
);

export const ChevronIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={1.9}>
    <path d="M9 5.5 15.5 12 9 18.5" />
  </svg>
);

export const SpeakerIcon = ({ muted, ...p }: P & { muted?: boolean }) => (
  <svg {...base(p)}>
    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
    {muted ? (
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    ) : (
      <>
        <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
        <path d="M18 6.5a7.6 7.6 0 0 1 0 11" />
      </>
    )}
  </svg>
);

export const SparkleIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 2.5c.5 4.6 2.4 6.9 7 7.5-4.6.6-6.5 2.9-7 7.5-.5-4.6-2.4-6.9-7-7.5 4.6-.6 6.5-2.9 7-7.5z" />
  </svg>
);
