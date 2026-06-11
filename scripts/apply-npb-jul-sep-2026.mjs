import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const NPB_FILE = path.join(ROOT, 'data', 'npb.json');
const PATCH_FILE = path.join(ROOT, 'data', 'npb-jul-sep-2026.json');

function inJulSep2026(event) {
  return event?.leagueId === 'npb' && /^2026-(07|08|09)-/.test(String(event.startTime || ''));
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

const current = await readJson(NPB_FILE, []);
const patch = await readJson(PATCH_FILE, []);
if (!Array.isArray(patch) || patch.length < 400) {
  throw new Error(`NPB patch looks incomplete: ${patch.length} events`);
}
const merged = [...current.filter((event) => !inJulSep2026(event)), ...patch]
  .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)) || String(a.id).localeCompare(String(b.id)));
await fs.writeFile(NPB_FILE, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Wrote ${merged.length} events to data/npb.json`);
console.log(`Added/replaced Jul-Sep NPB events: ${patch.length}`);
