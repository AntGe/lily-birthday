// Fetches one raw photo per manifest entry into photos-src/ and writes src/data/credits.json.
//
// Source order per id (first hit wins):
//   1. photos-override/{id}.(jpg|jpeg|png|webp)   — your own photos, always win
//   2. photos-src/{id}.*  already on disk           — cached / hand-curated, never re-downloaded
//   3. `unsplash` photo id                          — (+ `unsplashAlt` saved as {id}--alt)
//   4. `commons` exact Wikimedia Commons file title
//   5. Commons search with `query`                  — top 3 saved as {id}--c1..c3, c1 promoted
//   6. Openverse search with `query`
//
// photos-src/_sources.json remembers where each file came from, so credits can be rebuilt offline-ish.
// Run with --refresh-credits to re-query author/licence metadata.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC_DIR = path.join(ROOT, "photos-src");
const OVERRIDE_DIR = path.join(ROOT, "photos-override");
const SOURCES_FILE = path.join(SRC_DIR, "_sources.json");
const CREDITS_FILE = path.join(ROOT, "src/data/credits.json");
const UA = "BirthdayTripGift/1.0 (personal project)";
const EXTS = ["jpg", "jpeg", "png", "webp"];
const GOOD_LICENSE = /^(cc0|pd|public domain|cc by(-sa)?( \d\.\d)?)/i;
const REFRESH = process.argv.includes("--refresh-credits");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (p) => fs.access(p).then(() => true, () => false);
const stripHtml = (s) => (s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

let lastRequest = 0;
async function request(url, { asJson = false, retry = true } = {}) {
  const wait = lastRequest + 1000 - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if ((res.status === 429 || res.status >= 500) && retry) {
    await sleep(3000);
    return request(url, { asJson, retry: false });
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return asJson ? res.json() : Buffer.from(await res.arrayBuffer());
}

async function findLocal(dir, id) {
  for (const ext of EXTS) {
    const p = path.join(dir, `${id}.${ext}`);
    if (await exists(p)) return p;
  }
  return null;
}

const commonsApi = (params) =>
  `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2000&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl&${params}`;

function commonsInfo(page) {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const md = info.extmetadata ?? {};
  return {
    url: info.thumburl ?? info.url,
    width: info.width,
    height: info.height,
    author: stripHtml(md.Artist?.value) || "Wikimedia Commons",
    license: md.LicenseShortName?.value ?? "See source",
    licenseUrl: md.LicenseUrl?.value ?? null,
    sourceUrl: info.descriptionurl,
  };
}

async function commonsByTitle(title) {
  const data = await request(commonsApi(`titles=${encodeURIComponent(`File:${title}`)}`), { asJson: true });
  const page = Object.values(data?.query?.pages ?? {})[0];
  if (!page || "missing" in page) return null;
  return commonsInfo(page);
}

async function commonsSearch(query) {
  const q = encodeURIComponent(`${query} filetype:bitmap`);
  const data = await request(
    commonsApi(`generator=search&gsrnamespace=6&gsrsearch=${q}&gsrlimit=15`),
    { asJson: true },
  );
  return Object.values(data?.query?.pages ?? {})
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map(commonsInfo)
    .filter(Boolean)
    .filter((c) => c.width >= 1600 && c.width > c.height && GOOD_LICENSE.test(c.license));
}

async function unsplashPhotographer(id) {
  try {
    const html = (await request(`https://unsplash.com/photos/${id}`)).toString("utf8");
    const og = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ?? "";
    const by = og.match(/by ([^|]+?) on Unsplash/i)?.[1];
    return by?.trim() || "Unsplash";
  } catch {
    return "Unsplash";
  }
}

async function openverseSearch(query) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&page_size=10&aspect_ratio=wide`;
  const data = await request(url, { asJson: true });
  return (data.results ?? []).map((r) => ({
    url: r.url,
    author: r.creator || "Openverse",
    license: `${(r.license ?? "").toUpperCase()} ${r.license_version ?? ""}`.trim(),
    licenseUrl: r.license_url ?? null,
    sourceUrl: r.foreign_landing_url ?? r.url,
  }));
}

async function save(name, buf) {
  const p = path.join(SRC_DIR, `${name}.jpg`);
  await fs.writeFile(p, buf);
  return p;
}

async function fetchOne(img, sources) {
  const { id } = img;

  if (await findLocal(OVERRIDE_DIR, id)) {
    sources[id] = { ...(sources[id] ?? {}), source: "override", author: "Personal photo", license: "Personal", licenseUrl: null, sourceUrl: null };
    return "override";
  }
  if (await findLocal(SRC_DIR, id)) return "cached";

  if (img.unsplash) {
    try {
      await save(id, await request(`https://unsplash.com/photos/${img.unsplash}/download?force=true`));
      const author = await unsplashPhotographer(img.unsplash);
      sources[id] = { source: "unsplash", author, license: "Unsplash License", licenseUrl: "https://unsplash.com/license", sourceUrl: `https://unsplash.com/photos/${img.unsplash}` };
      if (img.unsplashAlt) {
        await save(`${id}--alt`, await request(`https://unsplash.com/photos/${img.unsplashAlt}/download?force=true`)).catch(() => {});
      }
      return "unsplash";
    } catch (e) {
      console.warn(`    unsplash miss for ${id}: ${e.message}`);
    }
  }

  if (img.commons) {
    try {
      const hit = await commonsByTitle(img.commons);
      if (hit) {
        await save(id, await request(hit.url));
        sources[id] = { source: "commons", ...pick(hit) };
        return "commons";
      }
    } catch (e) {
      console.warn(`    commons title miss for ${id}: ${e.message}`);
    }
  }

  if (img.query) {
    try {
      const hits = (await commonsSearch(img.query)).slice(0, 3);
      for (const [i, hit] of hits.entries()) {
        await save(`${id}--c${i + 1}`, await request(hit.url));
      }
      if (hits.length) {
        await fs.copyFile(path.join(SRC_DIR, `${id}--c1.jpg`), path.join(SRC_DIR, `${id}.jpg`));
        sources[id] = { source: "commons", ...pick(hits[0]), needsReview: true };
        return "commons-search";
      }
    } catch (e) {
      console.warn(`    commons search miss for ${id}: ${e.message}`);
    }
    try {
      const hit = (await openverseSearch(img.query))[0];
      if (hit) {
        await save(id, await request(hit.url));
        sources[id] = { source: "openverse", ...pick(hit), needsReview: true };
        return "openverse";
      }
    } catch (e) {
      console.warn(`    openverse miss for ${id}: ${e.message}`);
    }
  }
  return "missing";
}

const pick = ({ author, license, licenseUrl, sourceUrl }) => ({ author, license, licenseUrl, sourceUrl });

// Fill author/licence for cached entries that only know their source URL.
async function resolveCredit(entry) {
  if (!entry || (entry.author && entry.author !== "Unknown" && entry.license && !REFRESH)) return entry;
  if (entry.source === "commons" && entry.sourceUrl?.includes("/wiki/File:")) {
    const title = decodeURIComponent(entry.sourceUrl.split("/wiki/File:")[1]).replace(/_/g, " ");
    try {
      const hit = await commonsByTitle(title);
      if (hit) return { ...entry, author: hit.author, license: hit.license, licenseUrl: hit.licenseUrl };
    } catch (e) {
      console.warn(`    credit lookup failed for ${title}: ${e.message}`);
    }
  }
  if (entry.source === "unsplash") {
    const id = entry.sourceUrl?.match(/unsplash\.com\/photos\/([\w-]+)$/)?.[1];
    const author = entry.author ?? (id ? await unsplashPhotographer(id) : "Unsplash");
    return { ...entry, author, license: "Unsplash License", licenseUrl: "https://unsplash.com/license" };
  }
  // Leave unresolved (e.g. rate-limited) entries untouched so the next run retries them.
  return entry;
}

async function main() {
  await fs.mkdir(SRC_DIR, { recursive: true });
  const images = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/images.json"), "utf8"));
  let sources = {};
  try {
    sources = JSON.parse(await fs.readFile(SOURCES_FILE, "utf8"));
  } catch {
    /* first run */
  }

  const report = [];
  for (const img of images) {
    const how = await fetchOne(img, sources);
    sources[img.id] = await resolveCredit(sources[img.id]);
    report.push({ id: img.id, how, review: sources[img.id]?.needsReview ? "check candidates" : "" });
    console.log(`  ${how.padEnd(15)} ${img.id}`);
    await fs.writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2) + "\n");
  }

  const credits = images
    .filter((img) => sources[img.id])
    .map(({ id }) => {
      const s = sources[id];
      return { id, author: s.author ?? "Unknown", license: s.license ?? "See source", licenseUrl: s.licenseUrl ?? null, sourceUrl: s.sourceUrl ?? null };
    });
  await fs.writeFile(CREDITS_FILE, JSON.stringify(credits, null, 2) + "\n");

  console.log("\nid | source | notes");
  for (const r of report) console.log(`${r.id} | ${r.how} | ${r.review}`);
  const missing = report.filter((r) => r.how === "missing");
  if (missing.length) {
    console.log(`\nNo photo found for: ${missing.map((m) => m.id).join(", ")}. Drop your own into photos-override/.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
