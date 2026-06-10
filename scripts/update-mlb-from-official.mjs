#!/usr/bin/env node
/**
 * Generate data/mlb.json from the official MLB Stats API.
 * Yahoo Taiwan is used as the zh-TW naming reference for team labels; the game
 * schedule itself is generated from MLB's official schedule source so the full
 * season can be fetched without hand-copying 30 team pages.
 *
 * npm run update:mlb
 */

import fs from "node:fs/promises";
import path from "node:path";

const START_DATE = process.env.MLB_START_DATE || "2026-03-25";
const END_DATE = process.env.MLB_END_DATE || "2026-10-04";
const API_URL = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&gameTypes=R&hydrate=team,venue&startDate=${START_DATE}&endDate=${END_DATE}`;

const TEAMS = {
  ARI: { zh: "響尾蛇", name: "Arizona Diamondbacks", yahooSlug: "響尾蛇" },
  ATH: { zh: "運動家", name: "Athletics", yahooSlug: "運動家" },
  ATL: { zh: "勇士", name: "Atlanta Braves", yahooSlug: "勇士" },
  BAL: { zh: "金鶯", name: "Baltimore Orioles", yahooSlug: "金鶯" },
  BOS: { zh: "紅襪", name: "Boston Red Sox", yahooSlug: "紅襪" },
  CHC: { zh: "小熊", name: "Chicago Cubs", yahooSlug: "小熊" },
  CWS: { zh: "白襪", name: "Chicago White Sox", yahooSlug: "白襪" },
  CIN: { zh: "紅人", name: "Cincinnati Reds", yahooSlug: "紅人" },
  CLE: { zh: "守護者", name: "Cleveland Guardians", yahooSlug: "守護者" },
  COL: { zh: "落磯", name: "Colorado Rockies", yahooSlug: "落磯" },
  DET: { zh: "老虎", name: "Detroit Tigers", yahooSlug: "老虎" },
  HOU: { zh: "太空人", name: "Houston Astros", yahooSlug: "太空人" },
  KC: { zh: "皇家", name: "Kansas City Royals", yahooSlug: "皇家" },
  LAA: { zh: "天使", name: "Los Angeles Angels", yahooSlug: "天使" },
  LAD: { zh: "道奇", name: "Los Angeles Dodgers", yahooSlug: "道奇" },
  MIA: { zh: "馬林魚", name: "Miami Marlins", yahooSlug: "馬林魚" },
  MIL: { zh: "釀酒人", name: "Milwaukee Brewers", yahooSlug: "釀酒人" },
  MIN: { zh: "雙城", name: "Minnesota Twins", yahooSlug: "雙城" },
  NYM: { zh: "大都會", name: "New York Mets", yahooSlug: "大都會" },
  NYY: { zh: "洋基", name: "New York Yankees", yahooSlug: "洋基" },
  PHI: { zh: "費城人", name: "Philadelphia Phillies", yahooSlug: "費城人" },
  PIT: { zh: "海盜", name: "Pittsburgh Pirates", yahooSlug: "海盜" },
  SD: { zh: "教士", name: "San Diego Padres", yahooSlug: "教士" },
  SEA: { zh: "水手", name: "Seattle Mariners", yahooSlug: "水手" },
  SF: { zh: "巨人", name: "San Francisco Giants", yahooSlug: "巨人" },
  STL: { zh: "紅雀", name: "St. Louis Cardinals", yahooSlug: "紅雀" },
  TB: { zh: "光芒", name: "Tampa Bay Rays", yahooSlug: "光芒" },
  TEX: { zh: "遊騎兵", name: "Texas Rangers", yahooSlug: "遊騎兵" },
  TOR: { zh: "藍鳥", name: "Toronto Blue Jays", yahooSlug: "藍鳥" },
  WSH: { zh: "國民", name: "Washington Nationals", yahooSlug: "國民" },
};

function teamInfo(team) {
  const abbrev = team?.abbreviation || team?.teamName || team?.name;
  const mapped = TEAMS[abbrev] || { zh: team?.teamName || abbrev, name: team?.name || abbrev, yahooSlug: team?.teamName || abbrev };
  return { abbrev, ...mapped };
}

function gameToEvent(game) {
  const away = teamInfo(game.teams.away.team);
  const home = teamInfo(game.teams.home.team);
  const venue = game.venue?.name || "";
  const status = game.status?.detailedState || "Scheduled";
  const scoreText = game.teams.away.score != null && game.teams.home.score != null ? ` ${game.teams.away.score}-${game.teams.home.score}` : "";
  return {
    id: `mlb-2026-${game.gamePk}`,
    leagueId: "mlb",
    leagueName: "MLB 美國職棒大聯盟",
    sport: "baseball",
    title: `${away.zh} @ ${home.zh}${scoreText}`,
    matchup: `${away.zh} @ ${home.zh}`,
    startTime: game.gameDate,
    endTime: undefined,
    location: venue,
    city: venue,
    officialUrl: `https://www.mlb.com/gameday/${game.gamePk}`,
    participants: [away.zh, home.zh, away.name, home.name, away.abbrev, home.abbrev],
    tags: ["MLB", "美國職棒", status, away.zh, home.zh, away.abbrev, home.abbrev],
  };
}

async function main() {
  const res = await fetch(API_URL, { headers: { "user-agent": "sports-calendar-updater/1.0" } });
  if (!res.ok) throw new Error(`MLB schedule source returned ${res.status}`);
  const payload = await res.json();
  const events = payload.dates.flatMap((date) => date.games.map(gameToEvent));
  events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "data", "mlb.json"), JSON.stringify(events, null, 2), "utf8");
  await fs.writeFile(path.join(process.cwd(), "data", "mlb-teams.json"), JSON.stringify(TEAMS, null, 2), "utf8");
  console.log(`Generated data/mlb.json with ${events.length} MLB games from ${START_DATE} to ${END_DATE}.`);
  console.log("Team zh-TW labels are aligned with Yahoo Taiwan MLB team names where applicable.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
