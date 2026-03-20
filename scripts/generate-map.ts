/**
 * generate-map.ts
 *
 * Generates public/assets/europe-map.png from the UG locations in
 * config/participants.ts using OpenStreetMap tiles + Nominatim geocoding.
 *
 * Usage (from stream root):
 *   npx tsx scripts/generate-map.ts
 *
 * Dependencies (install once or in GHA):
 *   npm install staticmaps
 *   npm install -D tsx
 */

import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import StaticMaps from "staticmaps";
import { USER_GROUPS } from "../config/participants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "../public/assets/europe-map.png");

// ── Config ────────────────────────────────────────────────────────────────────
const MAP_WIDTH  = 1920;
const MAP_HEIGHT = 1080;
const TILE_URL   = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

// Marker dot written to a temp PNG via inline SVG (staticmaps uses `got` which can't load data URIs)
const MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
  <circle cx="9" cy="9" r="7" fill="#a78bfa" fill-opacity="0.9" stroke="#fff" stroke-width="2"/>
</svg>`;
const MARKER_FILE = path.join(os.tmpdir(), "gd-map-marker.svg");
fs.writeFileSync(MARKER_FILE, MARKER_SVG);

// ── Nominatim geocoding ───────────────────────────────────────────────────────
async function geocode(location: string): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "community-gameday-stream-map/1.0" },
    });
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Collect unique locations from USER_GROUPS
  const locations = Array.from(new Set(USER_GROUPS.map((g) => g.location)));
  console.log(`Geocoding ${locations.length} unique locations...`);

  const coords: [number, number][] = [];
  for (const loc of locations) {
    // Nominatim rate-limit: max 1 req/s
    await new Promise((r) => setTimeout(r, 1100));
    const coord = await geocode(loc);
    if (coord) {
      coords.push(coord);
      console.log(`  ✓ ${loc} → ${coord[1].toFixed(4)}, ${coord[0].toFixed(4)}`);
    } else {
      console.warn(`  ✗ ${loc} — not found`);
    }
  }

  if (!coords.length) {
    console.error("No coordinates resolved — aborting.");
    process.exit(1);
  }

  // Build the map
  const map = new StaticMaps({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tileUrl: TILE_URL,
    tileSubdomains: ["a", "b", "c"],
    tileSize: 256,
  });

  // Add a dot marker for each city
  for (const coord of coords) {
    map.addMarker({
      coord,
      img: MARKER_FILE,
      width: 18,
      height: 18,
      offsetX: 9,
      offsetY: 9,
    });
  }

  // Auto-fit the map to all markers with some padding
  await map.render();
  await map.image.save(OUT_PATH);
  console.log(`\n✅ Map saved to: ${OUT_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
