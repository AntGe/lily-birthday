export type PaperKind = "waves" | "stars" | "proteas" | "ferns";

export interface Wrap {
  paper: PaperKind;
  base: string;
  ink: string;
  ribbon: string;
  tagHint: string;
}

export interface Highlight {
  title: string;
  hook: string;
  image: string | null;
}

export interface Day {
  n: number;
  title: string;
  base: string;
  do: string[];
  animal: string | null;
  taste: string;
  tip: string;
  image: string | null;
  special?: boolean;
}

export interface Trip {
  id: string;
  order: number;
  name: string;
  country: string;
  region: string;
  length: string;
  tagline: string;
  summary: string;
  vibes: string[];
  weather: { air: string; sea: string; note: string };
  hero: string;
  wrap: Wrap;
  why: { animals: string; food: string; adventure: string };
  highlights: Highlight[];
  days: Day[];
  goodToKnow: string[];
}

export interface ImageEntry {
  id: string;
  dest: string;
  subject: string;
  use: string;
}

export interface PhotoMeta {
  ratio: number;
  w: number;
  h: number;
  blur: string;
  widths: Record<string, number>;
}

export interface Credit {
  id: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string | null;
}

export type Scene = "sealed" | "intro" | "choose" | "chosen";
