import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "nba.json");
const TEAM_FILE = path.join(ROOT, "data", "nba-teams.json");

const SOURCES = [
  "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json",
  "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json",
  "https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2025/league/00_full_schedule.json",
  "https://data.nba.com/data/v2015/json/mobile_teams/nba/2025/league/00_full_schedule.json",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function dateOnly(value) {
  if (!value) return "";
  const text = String(value);
  const match = text.match(/(20\d{2})[-/]?(\d{2})[-/]?(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const d = new Date(text);
  if (!Number.isNaN(d.getTime())) return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return "";
}

function twStartTime(game) {
  const candidates = [
    game.gameTimeUTC,
    game.gameTimeUtc,
    game.gameDateTimeUTC,
    game.gameDateTimeUtc,
    game.gdtutc && game.utctm ? `${game.gdtutc}T${game.utctm}Z` : null,
    game.gdtutc,
    game.gameDateEst,
    game.gdte,
    game.gameDate,
  ].filter(Boolean);

  for (const value of candidates) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  const date = dateOnly(game.gameDateEst || game.gameDate || game.gdte || game.gcode || game.gameCode);
  return date ? `${date}T08:00:00+08:00` : "2026-01-01T08:00:00+08:00";
}

function loadTeamNames() {
  return fs
    .readFile(TEAM_FILE, "utf8")
    .then((text) => JSON.parse(text))
    .catch(() => ({}));
}

function tricode(team) {
  return team?.teamTricode || team?.ta || team?.triCode || team?.abbreviation || team?.teamAbbreviation || "";
}

function englishName(team) {
  const city = team?.teamCity || team?.tc || "";
  const name = team?.teamName || team?.tn || "";
  return `${city} ${name}`.trim() || tricode(team);
}

function normalizeLeagueSchedule(json) {
  const dates = json?.leagueSchedule?.gameDates || json?.gameDates || [];
  return dates.flatMap((dateNode) => dateNode.games || []);
}

function normalizeMobileSchedule(json) {
  const months = json?.lscd || [];
  return months.flatMap((month) => month.mscd?.g || []);
}

function getAway(game) {
  return game.awayTeam || game.v || game.visitorTeam || {};
}

function getHome(game) {
  return game.homeTeam || game.h || game.homeTeam || {};
}

function getGameId(game, index) {
  return game.gameId || game.gid || game.gameCode || game.gcode || `nba-2025-26-${index}`;
}

function inferSeasonType(game, date) {
  const label = `${game.gameLabel || ""} ${game.gameSubLabel || ""} ${game.gameStatusText || ""} ${game.seriesText || ""}`;
  if (/Finals|NBA Finals/i.test(label) || (date >= "2026-06-03" && date <= "2026-06-21")) return "NBA 總冠軍賽";
  if (/Playoff|Round|Game \d/i.test(label) || (date >= "2026-04-18" && date <= "2026-06-21")) return "NBA 季後賽";
  if (/Play-In|Play In/i.test(label) || (date >= "2026-04-14" && date <= "2026-04-17")) return "NBA 附加賽";
  if (/Cup|Emirates/i.test(label)) return "NBA 盃";
  return "NBA 正規賽";
}

function gameNumber(game, date) {
  const label = `${game.gameLabel || ""} ${game.gameSubLabel || ""} ${game.seriesText || ""} ${game.gameStatusText || ""}`;
  const found = label.match(/Game\s*(\d+)/i) || label.match(/G(\d+)/i);
  if (found) return `G${found[1]}`;
  const finals = {
    "2026-06-03": "G1",
    "2026-06-05": "G2",
    "2026-06-08": "G3",
    "2026-06-10": "G4",
    "2026-06-13": "G5",
    "2026-06-16": "G6",
    "2026-06-19": "G7",
  };
  return finals[date] || "";
}

function mapGame(game, index, teamNames) {
  const away = getAway(game);
  const home = getHome(game);
  const awayTri = tricode(away);
  const homeTri = tricode(home);
  const awayName = teamNames[awayTri] || englishName(away);
  const homeName = teamNames[homeTri] || englishName(home);
  const startTime = twStartTime(game);
  const date = dateOnly(startTime);
  const seasonType = inferSeasonType(game, date);
  const g = gameNumber(game, date);
  const isFinals = seasonType === "NBA 總冠軍賽";
  const prefix = isFinals ? `🏆 NBA 總冠軍賽${g ? ` ${g}` : ""}` : `${seasonType}${g && seasonType !== "NBA 正規賽" ? ` ${g}` : ""}`;
  const matchup = `${awayName} vs ${homeName}`;
  const title = `${prefix}：${matchup}`;
  const arena = game.arenaName || game.an || game.arena?.arenaName || "";
  const city = game.arenaCity || game.ac || game.arena?.arenaCity || "";

  return {
    id: `nba-${String(getGameId(game, index)).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    leagueId: "nba",
    leagueName: "NBA",
    sport: "basketball",
    title,
    matchup,
    startTime,
    location: arena || "TBD",
    city: city || "",
    officialUrl: "https://www.nba.com/schedule",
    participants: [awayName, homeName, awayTri, homeTri].filter(Boolean),
    tags: ["NBA", seasonType, isFinals ? "總冠軍賽" : "", isFinals ? "🏆" : "", g, awayName, homeName, awayTri, homeTri].filter(Boolean),
  };
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 sports-calendar schedule updater",
      accept: "application/json,text/plain,*/*",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function main() {
  const teamNames = await loadTeamNames();
  let lastError;
  for (const url of SOURCES) {
    try {
      console.log(`Fetching NBA schedule: ${url}`);
      const json = await fetchJson(url);
      const rawGames = normalizeLeagueSchedule(json).length ? normalizeLeagueSchedule(json) : normalizeMobileSchedule(json);
      if (!rawGames.length) throw new Error("No games found in NBA schedule payload");
      const events = rawGames
        .map((game, index) => mapGame(game, index, teamNames))
        .filter((event) => event.startTime >= "2026-01-01T00:00:00" && event.startTime <= "2026-06-30T23:59:59")
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (!events.length) throw new Error("No 2026 Jan-Jun games found after normalization");
      await fs.mkdir(path.dirname(OUT), { recursive: true });
      await fs.writeFile(OUT, `${JSON.stringify(events, null, 2)}\n`);
      console.log(`Wrote ${events.length} NBA events to ${OUT}`);
      console.log(`First date: ${events[0]?.startTime}`);
      console.log(`Last date:  ${events.at(-1)?.startTime}`);
      console.log(`Finals events: ${events.filter((event) => event.tags.includes("總冠軍賽")).length}`);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Failed source: ${url}`);
      console.warn(error.message);
    }
  }
  throw lastError || new Error("NBA schedule update failed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
