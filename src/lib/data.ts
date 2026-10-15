import tripsJson from "../data/trips.bg.json";
import captionsJson from "../data/captions.bg.json";
import imagesJson from "../data/images.json";
import metaJson from "../data/photo-meta.json";
import focusJson from "../data/photo-focus.json";
import creditsJson from "../data/credits.json";
import type { Credit, ImageEntry, PhotoMeta, Trip } from "../types";

// Bulgarian typesetting: numbers stay with their units, and one-letter words / short
// prepositions never dangle at the end of a line.
const typo = (s: string) =>
  s
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/(\w)'(?=[\s.,;:!?)]|$)/g, "$1’")
    .replace(/(\d) (m|km|h|м|км|ч|мин|°C|%)(?![\p{L}])/gu, "$1\u00a0$2")
    .replace(/(^|[\s(„])([вВсСиИкКоОуУаА]|на|На|за|За|от|От|до|До|по|По|се|ще|не|да) /gu, "$1$2\u00a0");
const smart = <T,>(v: T): T =>
  typeof v === "string"
    ? (typo(v) as T)
    : Array.isArray(v)
      ? (v.map(smart) as T)
      : v && typeof v === "object"
        ? (Object.fromEntries(Object.entries(v).map(([k, x]) => [k, smart(x)])) as T)
        : v;

export const trips = (smart(tripsJson) as Trip[]).sort((a, b) => a.order - b.order);
export const tripById = (id: string | null | undefined) => trips.find((t) => t.id === id) ?? null;

const images = imagesJson as ImageEntry[];
const captions = captionsJson as Record<string, string>;
const meta = metaJson as Record<string, PhotoMeta>;
const focus = focusJson as Record<string, string>;
export const credits = creditsJson as Credit[];

export const photoMeta = (id: string): PhotoMeta | undefined => meta[id];
export const photoFocus = (id: string): string | undefined => focus[id];

/** Every photo for a destination, in manifest order (the modal gallery shows all of them). */
export const photosFor = (dest: string) => images.filter((i) => i.dest === dest && meta[i.id]).map((i) => i.id);

/** Caption / alt text for a photo (translated), falling back to the manifest subject. */
export function altFor(id: string): string {
  if (captions[id]) return typo(captions[id]);
  const subject = images.find((i) => i.id === id)?.subject ?? "";
  return subject
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+\/\s+/g, " or ")
    .trim();
}

/** "~25°C south · ~20°C north" → "25°C" ; "29–31°C" stays as is. */
export function shortTemp(s: string): string {
  const m = s.match(/~?\s*(\d+(?:[–-]\d+)?)\s*°C/);
  return m ? `${m[1]}°C` : s;
}

/** Hero photos to warm the cache during the intro. */
export const heroIds = trips.map((t) => t.hero);
