import { useCallback, useState, type CSSProperties } from "react";
import { altFor, photoFocus, photoMeta } from "../lib/data";
import "./Photo.css";

const BASE = import.meta.env.BASE_URL;
const WIDTHS = [400, 800, 1600] as const;

export const photoUrl = (id: string, w: (typeof WIDTHS)[number], fmt: "avif" | "webp") =>
  `${BASE}photos/${id}-${w}.${fmt}`;

export function photoSrcSet(id: string, fmt: "avif" | "webp") {
  const meta = photoMeta(id);
  const seen = new Set<number>();
  return WIDTHS.flatMap((w) => {
    const actual = meta?.widths?.[w] ?? w;
    if (seen.has(actual)) return [];
    seen.add(actual);
    return [`${photoUrl(id, w, fmt)} ${actual}w`];
  }).join(", ");
}

interface PhotoProps {
  id: string;
  sizes: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  /** Overrides the focal point from photo-focus.json (CSS object-position). */
  position?: string;
  /** Keep the photo's own aspect ratio instead of filling the parent. */
  intrinsic?: boolean;
}

export function Photo({ id, sizes, alt, priority, className, position, intrinsic }: PhotoProps) {
  const meta = photoMeta(id);
  const [loaded, setLoaded] = useState(false);

  // Cached images can finish before React attaches onLoad, so check on mount too.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  if (!meta) return <span className={`photo photo--missing ${className ?? ""}`} aria-hidden />;

  const style: CSSProperties = {
    backgroundImage: `url(${meta.blur})`,
    ...(intrinsic ? { aspectRatio: String(meta.ratio) } : null),
  };
  const objectPosition = position ?? photoFocus(id) ?? "50% 50%";

  return (
    <span
      className={`photo ${intrinsic ? "photo--intrinsic" : ""} ${className ?? ""}`}
      data-loaded={loaded}
      style={style}
    >
      <picture>
        <source type="image/avif" srcSet={photoSrcSet(id, "avif")} sizes={sizes} />
        <source type="image/webp" srcSet={photoSrcSet(id, "webp")} sizes={sizes} />
        <img
          ref={imgRef}
          src={photoUrl(id, 800, "webp")}
          alt={alt ?? altFor(id)}
          width={meta.w}
          height={meta.h}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
          style={{ objectPosition }}
          onLoad={() => setLoaded(true)}
        />
      </picture>
    </span>
  );
}
