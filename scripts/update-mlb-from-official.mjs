#!/usr/bin/env node
/**
 * Generate data/mlb.json from MLB's public Stats API.
 *
 * Usage:
 *   node scripts/update-mlb-from-official.mjs
 *
 * Optional:
 *   MLB_START_DATE=2026-03-25 MLB_END_DATE=2026-09-27 node scripts/update-mlb-from-official.mjs
 *
 * This script fetches month-by-month to avoid oversized API responses.
 */

import fs from "node:fs/promises";
import path from "node:path";

const START_DATE = process.env.MLB_START_DATE || "2026-03-25";
const END_DATE = process.env.MLB_END_DATE || "2026-09-27";
const EXPECTED_REGULAR_SEASON_GAMES = 2430;

const TEAMS = {
  108: { abbr: "LAA", zh: "天使", name: "Los Angeles Angels" },
  109: { abbr: "ARI", zh: "響尾蛇", name: "Arizona Diamondbacks" },
  110: { abbr: "BAL", zh: "金鶯", name: "Baltimore Orioles" },
  111: { abbr: "BOS", zh: "紅襪", name: "Boston Red Sox" },
  112: { abbr: "CHC", zh: "小熊", name: "Chicago Cubs" },
  113: { abbr: "CIN", zh: "紅人", name: "Cincinnati Reds" },
  114: { abbr: "CLE", zh: "守護者", name: "Cleveland Guardians" },
  115: { abbr: "COL", zh: "落磯", name: "Colorado Rockies" },
  116: { abbr: "DET", zh: "老虎", name: "Detroit Tigers" },
  117: { abbr: "HOU", zh: "太空人", name: "Houston Astros" },
  118: { abbr: "KC", zh: "皇家", name: "Kansas City Royals" },
  119: { abbr: "LAD", zh: "道奇", name: "Los Angeles Dodgers" },
  120: { abbr: "WSH", zh: "國民", name: "Washington Nationals" },
  121: { abbr: "NYM", zh: "大都會", name: "New York Mets" },
  133: { abbr: "ATH", zh: "運動家", name: "Athletics" },
  134: { abbr: "PIT", zh: "海盜", name: "Pittsburgh Pirates" },
  135: { abbr: "SD", zh: "教士", name: "San Diego Padres" },
  136: { abbr: "SEA", zh: "水手", name: "Seattle Mariners" },
  137: { abbr: "SF", zh: "巨人", name: "San Francisco Giants" },
  138: { abbr: "STL", zh: "紅雀", name: "St. Louis Cardinals" },
  139: { abbr: "TB", zh: "光芒", name: "Tampa Bay Rays" },
  140: { abbr: "TEX", zh: "遊騎兵", name: "Texas Rangers" },
  141: { abbr: "TOR", zh: "藍鳥", name: "Toronto Blue Jays" },
  142: { abbr: "MIN", zh: "雙城", name: "Minnesota Twins" },
  143: { abbr: "PHI", zh: "費城人", name: "Philadelphia Phillies" },
  144: { abbr: "ATL", zh: "勇士", name: "Atlanta Braves" },
  145: { abbr: "CWS", zh: "白襪", name: "Chicago White Sox" },
  146: { abbr: "MIA", zh: "馬林魚", name: "Miami Marlins" },
  147: { abbr: "NYY", zh: "洋基", name: "New York Yankees" },
  158: { abbr: "MIL", zh: "釀酒人", name: "Milwaukee Brewers" }
};

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function minDate(a, b) {
  return a <= b ? a : b;
}

function windows(start, end, daysPerWindow = 21) {
  const result = [];
  let cursor = new Date(`${start}T00:00:00Z`);
  const finalDate = new Date(`${end}T00:00:00Z`);
  while (cursor <= finalDate) {
    const windowEnd = minDate(addDays(cursor, daysPerWindow - 1), finalDate);
    result.push([formatDate(cursor), formatDate(windowEnd)]);
    cursor = addDays(windowEnd, 1);
  }
  return result;
}

function lookupTeam(team) {
  const id = team?.id;
  const mapped = TEAMS[id];
  if (mapped) return mapped;
  const fallbackName = team?.name || team?.teamName || String(id || "Unknown");
  return { abbr: team?.abbreviation || fallbackName, zh: fallbackName, name: fallbackName };
}

function gameToEvent(game) {
  const away = lookupTeam(game.teams.away.team);
  const home = lookupTeam(game.teams.home.team);
  const awayScore = game.teams.away.score;
  const homeScore = game.teams.home.score;
  const hasScore = awayScore !== undefined && homeScore !== undefined;
  const scoreText = hasScore ? ` ${awayScore}-${homeScore}` : "";
  const date = game.officialDate || game.gameDate?.slice(0, 10);

  return {
    id: `mlb-2026-${game.gamePk}`,
    leagueId: "mlb",
    leagueName: "MLB 美國職棒大聯盟",
    sport: "baseball",
    title: `${away.zh} @ ${home.zh}${scoreText}`,
    matchup: `${away.zh} @ ${home.zh}`,
    startTime: game.gameDate,
    endTime: undefined,
    location: game.venue?.name || "",
    city: game.venue?.name || "",
    officialUrl: `https://www.mlb.com/gameday/${game.gamePk}`,
    participants: [away.zh, home.zh, away.name, home.name, away.abbr, home.abbr],
    tags: ["MLB", "美國職棒", "例行賽", date, away.zh, home.zh, away.abbr, home.abbr]
  };
}

async function fetchSchedule(startDate, endDate) {
  const url = new URL("https://statsapi.mlb.com/api/v1/schedule");
  url.searchParams.set("sportId", "1");
  url.searchParams.set("gameTypes", "R");
  url.searchParams.set("hydrate", "team,venue");
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);

  const response = await fetch(url, {
    headers: { "user-agent": "sports-calendar-updater/1.0" }
  });
  if (!response.ok) throw new Error(`MLB API ${response.status} for ${startDate} to ${endDate}`);
  const json = await response.json();
  return json.dates.flatMap((day) => day.games || []);
}

async function main() {
  const allGamesByPk = new Map();

  for (const [start, end] of windows(START_DATE, END_DATE)) {
    const games = await fetchSchedule(start, end);
    console.log(`${start} to ${end}: ${games.length} games`);
    for (const game of games) {
      if (game.gameType === "R") allGamesByPk.set(game.gamePk, game);
    }
  }

  const events = [...allGamesByPk.values()]
    .map(gameToEvent)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "data", "mlb.json"), JSON.stringify(events, null, 2), "utf8");
  await fs.writeFile(path.join(process.cwd(), "data", "mlb-teams.json"), JSON.stringify(TEAMS, null, 2), "utf8");

  console.log(`Generated data/mlb.json with ${events.length} MLB regular-season games.`);
  console.log(`Date range: ${START_DATE} to ${END_DATE}`);
  if (START_DATE === "2026-03-25" && END_DATE === "2026-09-27" && events.length !== EXPECTED_REGULAR_SEASON_GAMES) {
    console.warn(`Warning: expected about ${EXPECTED_REGULAR_SEASON_GAMES} regular-season games, got ${events.length}. Check MLB source/date range.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
