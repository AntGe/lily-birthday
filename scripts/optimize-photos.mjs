// Turns the chosen raw photos into responsive AVIF + WebP files and a blur-up manifest.
//   source priority: photos-override/{id}.* (hand-picked, always wins) → photos-src/{id}.*
//   output: public/photos/{id}-{400|800|1600}.{avif,webp} + src/data/photo-meta.json
// Re-runs are incremental: a photo is only re-encoded when its source file changes.
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT_DIR = path.join(ROOT, "public/photos");
const META_FILE = path.join(ROOT, "src/data/photo-meta.json");
const CACHE_FILE = path.join(ROOT, "photos-src/_optimized.json");
const WIDTHS = [400, 800, 1600];
const EXTS = ["jpg", "jpeg", "png", "webp"];
const FORCE = process.argv.includes("--force");

const exists = (p) => fs.access(p).then(() => true, () => false);
const readJson = async (p, fallback) => {
  try {
    return JSON.parse(await fs.readFile(p, "utf8"));
  } catch {
    return fallback;
  }
};

async function findSource(id) {
  for (const dir of ["photos-override", "photos-src"]) {
    for (const ext of EXTS) {
      const p = path.join(ROOT, dir, `${id}.${ext}`);
      if (await exists(p)) return p;
    }
  }
  return null;
}

async function processOne(id, cache, meta) {
  const src = await findSource(id);
  if (!src) {
    console.warn(`  ✗ ${id}: no source photo (add photos-override/${id}.jpg)`);
    return false;
  }
  const stat = await fs.stat(src);
  const signature = `${path.relative(ROOT, src)}:${stat.size}:${Math.round(stat.mtimeMs)}`;
  const outputsExist = await exists(path.join(OUT_DIR, `${id}-1600.avif`));
  if (!FORCE && cache[id] === signature && meta[id] && outputsExist) return true;

  const info = await sharp(src).metadata();
  const swap = (info.orientation ?? 1) >= 5;
  const W = swap ? info.height : info.width;
  const H = swap ? info.width : info.height;

  const widths = {};
  for (const w of WIDTHS) {
    const pipeline = sharp(src, { failOn: "none" })
      .rotate()
      .resize({ width: w, withoutEnlargement: true });
    await pipeline.clone().avif({ quality: 50, effort: 5 }).toFile(path.join(OUT_DIR, `${id}-${w}.avif`));
    await pipeline.clone().webp({ quality: 75, effort: 5 }).toFile(path.join(OUT_DIR, `${id}-${w}.webp`));
    widths[w] = Math.min(w, W);
  }

  const blurBuf = await sharp(src, { failOn: "none" })
    .rotate()
    .resize({ width: 24 })
    .webp({ quality: 40 })
    .toBuffer();

  meta[id] = {
    ratio: Number((W / H).toFixed(4)),
    w: W,
    h: H,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    widths,
  };
  cache[id] = signature;
  console.log(`  ✓ ${id} (${W}×${H}) from ${path.relative(ROOT, src)}`);
  return true;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const images = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/images.json"), "utf8"));
  const meta = await readJson(META_FILE, {});
  const cache = await readJson(CACHE_FILE, {});

  console.log(`Optimising ${images.length} photos…`);
  const queue = images.map((img) => img.id);
  const missing = [];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const id = queue.shift();
      if (!(await processOne(id, cache, meta))) missing.push(id);
    }
  });
  await Promise.all(workers);

  // Keep the manifest in manifest order and drop ids that no longer exist.
  const ordered = {};
  for (const { id } of images) if (meta[id]) ordered[id] = meta[id];
  await fs.writeFile(META_FILE, JSON.stringify(ordered, null, 2) + "\n");
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");

  console.log(`Done. ${Object.keys(ordered).length}/${images.length} photos ready.`);
  if (missing.length) {
    console.log(`Missing: ${missing.join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
