import type { LeagueConfig, LeagueId, SportCategory } from "@/types/sports";

const worldCupGroups: LeagueConfig[] = Array.from({ length: 12 }, (_, index) => {
  const letter = String.fromCharCode("A".charCodeAt(0) + index);
  const tones = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#1e40af", "#1e3a8a"];
  return {
    id: `worldcup-group-${letter.toLowerCase()}` as LeagueId,
    name: `${letter} 組`,
    shortName: letter,
    sport: "football",
    tone: tones[index % tones.length],
  };
});

export const LEAGUES: LeagueConfig[] = [
  ...worldCupGroups,
  { id: "nba", name: "NBA", shortName: "NBA", sport: "basketball", tone: "#1d4ed8" },
  { id: "mlb", name: "MLB", shortName: "MLB", sport: "baseball", tone: "#059669" },
  { id: "npb", name: "NPB", shortName: "NPB", sport: "baseball", tone: "#047857" },
  { id: "cpbl", name: "CPBL", shortName: "CPBL", sport: "baseball", tone: "#065f46" },
  { id: "f1", name: "Formula 1", shortName: "F1", sport: "motorsport", tone: "#dc2626" },
  { id: "diamondleague", name: "鑽石聯賽", shortName: "DL", sport: "athletics", tone: "#7c3aed" },
  { id: "giro", name: "Giro d'Italia", shortName: "Giro", sport: "cycling", tone: "#ec4899" },
  { id: "tourdefrance", name: "Tour de France", shortName: "TDF", sport: "cycling", tone: "#eab308" },
  { id: "vuelta", name: "Vuelta a España", shortName: "Vuelta", sport: "cycling", tone: "#ef4444" },
  { id: "milan-san-remo", name: "Milan-San Remo", shortName: "MSR", sport: "cycling", tone: "#64748b" },
  { id: "tour-of-flanders", name: "Tour of Flanders", shortName: "RVV", sport: "cycling", tone: "#64748b" },
  { id: "paris-roubaix", name: "Paris-Roubaix", shortName: "PR", sport: "cycling", tone: "#64748b" },
  { id: "liege-bastogne-liege", name: "Liege-Bastogne-Liege", shortName: "LBL", sport: "cycling", tone: "#64748b" },
  { id: "il-lombardia", name: "Il Lombardia", shortName: "LOM", sport: "cycling", tone: "#64748b" },
];

export const WORLD_CUP_LEAGUES = LEAGUES.filter((league) => league.id.startsWith("worldcup-group-"));
export const WORLD_CUP_LEAGUE_IDS = WORLD_CUP_LEAGUES.map((league) => league.id);

export const BASKETBALL_LEAGUES = LEAGUES.filter((league) => league.sport === "basketball");
export const BASKETBALL_LEAGUE_IDS = BASKETBALL_LEAGUES.map((league) => league.id);

export const BASEBALL_LEAGUES = LEAGUES.filter((league) => league.sport === "baseball");
export const BASEBALL_LEAGUE_IDS = BASEBALL_LEAGUES.map((league) => league.id);

export const MOTORSPORT_LEAGUES = LEAGUES.filter((league) => league.sport === "motorsport");
export const MOTORSPORT_LEAGUE_IDS = MOTORSPORT_LEAGUES.map((league) => league.id);

export const ATHLETICS_LEAGUES = LEAGUES.filter((league) => league.sport === "athletics");
export const ATHLETICS_LEAGUE_IDS = ATHLETICS_LEAGUES.map((league) => league.id);

export const CYCLING_LEAGUES = LEAGUES.filter((league) => league.sport === "cycling");
export const CYCLING_LEAGUE_IDS = CYCLING_LEAGUES.map((league) => league.id);

export const PRIMARY_LEAGUES = LEAGUES.filter(
  (league) => !WORLD_CUP_LEAGUE_IDS.includes(league.id) && !CYCLING_LEAGUE_IDS.includes(league.id),
);

export const ALL_LEAGUE_IDS = LEAGUES.map((league) => league.id);
export const LEAGUE_BY_ID = Object.fromEntries(LEAGUES.map((league) => [league.id, league])) as Record<LeagueId, LeagueConfig>;

export const SPORT_LABELS: Record<SportCategory, string> = {
  football: "足球",
  basketball: "籃球",
  baseball: "棒球",
  motorsport: "賽車",
  cycling: "單車",
  athletics: "田徑",
};
