/**
 * generate-map.ts
 *
 * Generates public/assets/europe-map.png from the UG locations in
 * config/participants.ts using OpenStreetMap/CartoDB tiles + Nominatim geocoding.
 * Each UG city is marked with its country flag emoji (via Twemoji PNGs).
 *
 * Usage (from stream root):
 *   npx tsx scripts/generate-map.ts
 *
 * Dependencies (in devDependencies): staticmaps, tsx
 */

import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import StaticMaps from "staticmaps";
import { USER_GROUPS } from "../config/participants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH   = path.join(__dirname, "../public/assets/europe-map.png");

// ── Config ────────────────────────────────────────────────────────────────────
const MAP_WIDTH  = 1920;
const MAP_HEIGHT = 1080;
const TILE_URL   = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const FLAG_SIZE  = 28; // rendered px size of each flag marker

// ── Flag PNG download via Twemoji ─────────────────────────────────────────────
// Converts a flag emoji (e.g. 🇧🇪) to its Twemoji CDN filename (e.g. 1f1e7-1f1ea.png)
function flagToTwemojiName(flag: string): string {
  return [...flag]
    .map((ch) => ch.codePointAt(0)!.toString(16).toLowerCase())
    .join("-") + ".png";
}

const FLAG_CACHE_DIR = path.join(os.tmpdir(), "gd-flag-cache");
fs.mkdirSync(FLAG_CACHE_DIR, { recursive: true });

async function getFlagPng(flag: string): Promise<string | null> {
  const name      = flagToTwemojiName(flag);
  const cachePath = path.join(FLAG_CACHE_DIR, name);
  if (fs.existsSync(cachePath)) return cachePath;

  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${name}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "community-gameday-stream-map/1.0" } });
    if (!res.ok) { console.warn(`  ⚠ flag PNG not found for ${flag} (${name})`); return null; }
    fs.writeFileSync(cachePath, Buffer.from(await res.arrayBuffer()));
    return cachePath;
  } catch {
    return null;
  }
}

// ── Nominatim geocoding ───────────────────────────────────────────────────────
async function geocode(location: string): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  try {
    const res  = await fetch(url, { headers: { "User-Agent": "community-gameday-stream-map/1.0" } });
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Build list: unique location+flag pairs (one entry per UG)
  const entries = USER_GROUPS.map((g) => ({ location: g.location, flag: g.flag }));
  console.log(`Geocoding ${entries.length} UG locations...`);

  type MarkerEntry = { coord: [number, number]; flag: string };
  const markers: MarkerEntry[] = [];

  for (const { location, flag } of entries) {
    await new Promise((r) => setTimeout(r, 1100)); // Nominatim: 1 req/s
    const coord = await geocode(location);
    if (coord) {
      markers.push({ coord, flag });
      console.log(`  ✓ ${flag}  ${location}`);
    } else {
      console.warn(`  ✗ ${location} — geocode failed`);
    }
  }

  if (!markers.length) { console.error("No markers — aborting."); process.exit(1); }

  // Download flag PNGs (cached)
  console.log("\nFetching flag PNGs...");
  const flagPaths: Map<string, string | null> = new Map();
  const uniqueFlags = Array.from(new Set(markers.map((m) => m.flag)));
  for (const flag of uniqueFlags) {
    if (!flagPaths.has(flag)) {
      flagPaths.set(flag, await getFlagPng(flag));
    }
  }

  // Build map
  const map = new StaticMaps({
    width: MAP_WIDTH, height: MAP_HEIGHT,
    tileUrl: TILE_URL,
    tileSubdomains: ["a", "b", "c"],
    tileSize: 256,
  });

  for (const { coord, flag } of markers) {
    const imgPath = flagPaths.get(flag);
    if (!imgPath) continue;
    map.addMarker({
      coord,
      img:     imgPath,
      width:   FLAG_SIZE,
      height:  FLAG_SIZE,
      offsetX: Math.round(FLAG_SIZE / 2),
      offsetY: Math.round(FLAG_SIZE / 2),
    });
  }

  await map.render();
  await map.image.save(OUT_PATH);
  console.log(`\n✅ Map saved → ${OUT_PATH}  (${markers.length} flags)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
