#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const base = process.cwd();
const manualPath = path.join(base, "data", "mlb-manual-yankees-dodgers-2026.json");
const mlbPath = path.join(base, "data", "mlb.json");
const manual = JSON.parse(await fs.readFile(manualPath, "utf8"));
let current = [];
try { current = JSON.parse(await fs.readFile(mlbPath, "utf8")); } catch {}

const isManualNyyLad = (event) =>
  event?.id?.startsWith("mlb-2026-") &&
  Array.isArray(event.participants) &&
  (event.participants.includes("NYY") || event.participants.includes("LAD"));

const map = new Map();
for (const event of current) {
  if (!isManualNyyLad(event)) map.set(event.id, event);
}
for (const event of manual) map.set(event.id, event);
const merged = [...map.values()].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)) || String(a.id).localeCompare(String(b.id)));
await fs.writeFile(mlbPath, JSON.stringify(merged, null, 2), "utf8");
console.log(`Merged ${manual.length} manual Yankees/Dodgers MLB games into data/mlb.json.`);
console.log(`data/mlb.json now has ${merged.length} MLB events.`);
