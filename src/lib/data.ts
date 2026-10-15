import tripsJson from "../data/trips.json";
import imagesJson from "../data/images.json";
import metaJson from "../data/photo-meta.json";
import focusJson from "../data/photo-focus.json";
import creditsJson from "../data/credits.json";
import type { Credit, ImageEntry, PhotoMeta, Trip } from "../types";

// Typographic apostrophes for Fraunces display type (content otherwise verbatim).
const typo = (s: string) =>
  s
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/(\w)'(?=[\s.,;:!?)]|$)/g, "$1’")
    .replace(/(\d) (m|km|h|°C)(?![\w])/g, "$1\u00a0$2");
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
const meta = metaJson as Record<string, PhotoMeta>;
const focus = focusJson as Record<string, string>;
export const credits = creditsJson as Credit[];

export const photoMeta = (id: string): PhotoMeta | undefined => meta[id];
export const photoFocus = (id: string): string | undefined => focus[id];

/** Every photo for a destination, in manifest order (the modal gallery shows all of them). */
export const photosFor = (dest: string) => images.filter((i) => i.dest === dest && meta[i.id]).map((i) => i.id);

/** Readable alt text: the manifest subject without editorial notes in brackets. */
export function altFor(id: string): string {
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
