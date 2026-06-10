#!/usr/bin/env node
/**
 * Fetch NPB official 2026 all-team calendar pages and regenerate data/npb.json.
 * Source: https://npb.jp/bis/eng/2026/calendar/
 * No external npm packages required.
 */

import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://npb.jp/bis/eng/2026/calendar/";
const PAGES = [
  { url: `${BASE_URL}index_04.html`, months: [3, 4], label: "March - April" },
  { url: `${BASE_URL}index_05.html`, months: [5], label: "May" },
  { url: `${BASE_URL}`, months: [6], label: "June" },
  { url: `${BASE_URL}index_07.html`, months: [7], label: "July" },
  { url: `${BASE_URL}index_08.html`, months: [8], label: "August" },
  { url: `${BASE_URL}index_09.html`, months: [9], label: "September" },
];

const TEAM_NAMES = {
  H: "Fukuoka SoftBank Hawks",
  F: "Hokkaido Nippon-Ham Fighters",
  B: "ORIX Buffaloes",
  E: "Tohoku Rakuten Golden Eagles",
  L: "Saitama Seibu Lions",
  M: "Chiba Lotte Marines",
  T: "Hanshin Tigers",
  DB: "Yokohama DeNA BayStars",
  G: "Yomiuri Giants",
  D: "Chunichi Dragons",
  C: "Hiroshima Toyo Carp",
  S: "Tokyo Yakult Swallows",
};

function decodeHtml(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&#039;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function htmlToLines(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/a>/gi, "\n")
    .replace(/<\/td>/gi, "\n")
    .replace(/<\/th>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return decodeHtml(text)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function isoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function makeEvent({ date, home, away, time, scoreHome, scoreAway, index }) {
  const hasResult = scoreHome !== undefined && scoreAway !== undefined;
  const cleanTime = time ?? "18:00";
  const title = hasResult ? `${home} ${scoreHome} - ${scoreAway} ${away}` : `${home} vs ${away}`;

  return {
    id: `npb-2026-${date}-${slug(home)}-${slug(away)}-${index}`,
    leagueId: "npb",
    leagueName: "NPB 日本職棒",
    sport: "baseball",
    title,
    matchup: `${home} vs ${away}`,
    startTime: `${date}T${cleanTime}:00+09:00`,
    location: "TBD",
    city: "日本",
    officialUrl: BASE_URL,
    participants: [home, away, TEAM_NAMES[home] ?? home, TEAM_NAMES[away] ?? away],
    tags: ["NPB", "日本職棒", home, away, TEAM_NAMES[home] ?? home, TEAM_NAMES[away] ?? away],
  };
}

function parsePage(html, { months }) {
  const lines = htmlToLines(html);
  const start = lines.findIndex((line) => line === "Sunday");
  if (start < 0) throw new Error("Could not find calendar table start.");

  const relevant = lines.slice(start + 7);
  const events = [];
  let currentMonth = months[0];
  let activeSingleMonth = months.length > 1;
  let previousDay = 0;
  let currentDay = null;
  let eventIndex = 0;

  for (const line of relevant) {
    if (/Copyright|Qualifiers for|Team Index|Home$/.test(line)) break;

    const dayMatch = line.match(/^([1-9]|[12]\d|3[01])$/);
    if (dayMatch) {
      const nextDay = Number(dayMatch[1]);
      if (months.length > 1) {
        if (previousDay > 0 && nextDay < previousDay) currentMonth = months[1];
        activeSingleMonth = true;
      } else {
        if (!activeSingleMonth && nextDay === 1) activeSingleMonth = true;
        else if (activeSingleMonth && previousDay > 0 && nextDay < previousDay) activeSingleMonth = false;
      }
      previousDay = nextDay;
      currentDay = activeSingleMonth ? nextDay : null;
      continue;
    }

    if (!currentDay || !activeSingleMonth) continue;

    let match = line.match(/^([A-Z]{1,2})\s+(\d+|\*)\s+-\s+(\d+|\*)\s+([A-Z]{1,2})$/);
    if (match) {
      const [, home, scoreHome, scoreAway, away] = match;
      const date = isoDate(2026, currentMonth, currentDay);
      events.push(makeEvent({ date, home, away, scoreHome, scoreAway, index: ++eventIndex }));
      continue;
    }

    match = line.match(/^([A-Z]{1,2})\s+-\s+([A-Z]{1,2})\s+(\d{1,2}:\d{2})$/);
    if (match) {
      const [, home, away, time] = match;
      const date = isoDate(2026, currentMonth, currentDay);
      events.push(makeEvent({ date, home, away, time, index: ++eventIndex }));
    }
  }

  return events;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": "sports-calendar/npb-updater" } });
  if (!res.ok) throw new Error(`NPB official page returned ${res.status}: ${url}`);
  return res.text();
}

async function main() {
  const allEvents = [];
  await fs.mkdir(path.join(process.cwd(), "data", "_source-cache"), { recursive: true });

  for (const page of PAGES) {
    const html = await fetchText(page.url);
    await fs.writeFile(path.join(process.cwd(), "data", "_source-cache", `npb-2026-${page.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`), html, "utf8");
    const pageEvents = parsePage(html, page);
    allEvents.push(...pageEvents);
    console.log(`${page.label}: ${pageEvents.length} games`);
  }

  allEvents.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.matchup.localeCompare(b.matchup));
  await fs.writeFile(path.join(process.cwd(), "data", "npb.json"), JSON.stringify(allEvents, null, 2) + "\n", "utf8");
  console.log(`Wrote data/npb.json with ${allEvents.length} NPB games from official NPB calendar pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
