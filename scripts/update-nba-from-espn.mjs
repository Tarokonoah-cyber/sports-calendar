import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "nba.json");
const TEAM_FILE = path.join(ROOT, "data", "nba-teams.json");

const START_DATE = process.argv[2] || "2026-01-01";
const END_DATE = process.argv[3] || "2026-06-30";
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

const finalsGameByDate = {
  "2026-06-03": "G1",
  "2026-06-05": "G2",
  "2026-06-08": "G3",
  "2026-06-10": "G4",
  "2026-06-13": "G5",
  "2026-06-16": "G6",
  "2026-06-19": "G7",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function ymdUTC(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function ymdParam(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function parseDateYMD(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dateOnlyFromIso(value) {
  return String(value || "").slice(0, 10);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadTeamNames() {
  try {
    return JSON.parse(await fs.readFile(TEAM_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function fetchJson(url, retry = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retry; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 sports-calendar NBA updater",
          accept: "application/json,text/plain,*/*",
        },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      await sleep(300 + attempt * 700);
    }
  }
  throw lastError;
}

function getCompetitors(event) {
  const competitors = event?.competitions?.[0]?.competitors || [];
  const away = competitors.find((c) => c.homeAway === "away") || competitors[1] || {};
  const home = competitors.find((c) => c.homeAway === "home") || competitors[0] || {};
  return { away, home };
}

function teamAbbr(competitor) {
  return competitor?.team?.abbreviation || competitor?.team?.shortDisplayName || "";
}

function teamName(competitor, names) {
  const abbr = teamAbbr(competitor);
  return names[abbr] || competitor?.team?.shortDisplayName || competitor?.team?.displayName || abbr || "TBD";
}

function normalizeStatus(status) {
  const name = status?.type?.name || "";
  const state = status?.type?.state || "";
  const detail = status?.type?.detail || status?.type?.description || "";
  if (/unnecessary/i.test(name) || /unnecessary/i.test(detail)) return "unnecessary";
  if (/postponed/i.test(name) || /postponed/i.test(detail)) return "postponed";
  if (/final/i.test(name) || /post/i.test(state)) return "final";
  if (/in/i.test(state)) return "live";
  return "scheduled";
}

function gameNumber(event, date) {
  const text = [
    event.name,
    event.shortName,
    event.note,
    event.competitions?.[0]?.notes?.map((n) => n.headline).join(" "),
    event.competitions?.[0]?.series?.summary,
    event.status?.type?.detail,
    event.status?.type?.shortDetail,
  ]
    .filter(Boolean)
    .join(" ");
  const found = text.match(/Game\s*(\d+)/i) || text.match(/G\s*(\d+)/i);
  if (found) return `G${found[1]}`;
  return finalsGameByDate[date] || "";
}

function seasonLabel(event, date) {
  const text = [
    event.name,
    event.shortName,
    event.season?.slug,
    event.competitions?.[0]?.notes?.map((n) => n.headline).join(" "),
    event.competitions?.[0]?.series?.summary,
    event.status?.type?.detail,
  ]
    .filter(Boolean)
    .join(" ");

  if (date >= "2026-06-03" && date <= "2026-06-30") return "NBA 總冠軍賽";
  if (/Finals|NBA Finals/i.test(text)) return "NBA 總冠軍賽";
  if (date >= "2026-04-18" && date <= "2026-06-02") return "NBA 季後賽";
  if (/Playoffs|First Round|Conference|Semifinals|Finals|Round/i.test(text)) return "NBA 季後賽";
  if (date >= "2026-04-14" && date <= "2026-04-17") return "NBA 附加賽";
  if (/Play-In|Play In/i.test(text)) return "NBA 附加賽";
  if (/All-Star|Rising Stars/i.test(text)) return "NBA 全明星";
  return "NBA 正規賽";
}

function mapEvent(event, names) {
  const { away, home } = getCompetitors(event);
  const awayAbbr = teamAbbr(away);
  const homeAbbr = teamAbbr(home);
  const awayName = teamName(away, names);
  const homeName = teamName(home, names);
  const startTime = event.date || event.competitions?.[0]?.date;
  const date = dateOnlyFromIso(startTime);
  const label = seasonLabel(event, date);
  const number = gameNumber(event, date);
  const matchup = `${awayName} VS ${homeName}`;
  const isFinals = label === "NBA 總冠軍賽";
  const isPlayoff = label === "NBA 季後賽" || label === "NBA 附加賽" || isFinals;
  const prefix = isFinals
    ? `🏆 NBA 總冠軍賽${number ? ` ${number}` : ""}`
    : isPlayoff
      ? `🏀 ${label}${number ? ` ${number}` : ""}`
      : label === "NBA 全明星"
        ? "⭐ NBA 全明星"
        : "🏀";
  const title = isPlayoff || label === "NBA 全明星" ? `${prefix}：${matchup}` : `${prefix} ${matchup}`;
  const venue = event.competitions?.[0]?.venue;
  const status = normalizeStatus(event.status);

  return {
    id: `nba-${String(event.id || event.uid || `${date}-${awayAbbr}-${homeAbbr}`).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    leagueId: "nba",
    leagueName: "NBA",
    sport: "basketball",
    title,
    matchup,
    startTime,
    endTime: "",
    location: venue?.fullName || "TBD",
    city: venue?.address?.city || "",
    officialUrl: event.links?.[0]?.href || "https://www.nba.com/schedule",
    participants: [awayName, homeName, awayAbbr, homeAbbr].filter(Boolean),
    tags: ["NBA", "🏀", isFinals ? "🏆" : "", label, number, status, awayName, homeName, awayAbbr, homeAbbr].filter(Boolean),
    status,
  };
}

async function main() {
  const names = await loadTeamNames();
  const all = [];
  let current = parseDateYMD(START_DATE);
  const end = parseDateYMD(END_DATE);

  console.log(`Fetching NBA schedule from ESPN: ${START_DATE} to ${END_DATE}`);

  while (current <= end) {
    const param = ymdParam(current);
    const url = `${ESPN}?dates=${param}&limit=100`;
    const json = await fetchJson(url);
    const events = Array.isArray(json.events) ? json.events : [];
    for (const event of events) {
      const mapped = mapEvent(event, names);
      if (!mapped.startTime) continue;
      if (mapped.status === "unnecessary") continue;
      all.push(mapped);
    }
    if (events.length) console.log(`${ymdUTC(current)}: ${events.length} games`);
    current = addDays(current, 1);
    await sleep(80);
  }

  const unique = [...new Map(all.map((event) => [event.id, event])).values()]
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, `${JSON.stringify(unique, null, 2)}\n`);

  console.log(`Wrote ${unique.length} NBA events to ${OUT}`);
  console.log(`First: ${unique[0]?.startTime || "none"}`);
  console.log(`Last:  ${unique.at(-1)?.startTime || "none"}`);
  console.log(`Finals: ${unique.filter((event) => event.tags.includes("NBA 總冠軍賽")).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
