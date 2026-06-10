import type { LeagueConfig, LeagueId } from "@/types/sports";

const worldCupGroups = Array.from({ length: 12 }, (_, index) => {
  const letter = String.fromCharCode("A".charCodeAt(0) + index);
  const tones = ["#111111", "#27272a", "#3f3f46", "#52525b", "#18181b", "#404040"];
  return {
    id: `worldcup-group-${letter.toLowerCase()}` as LeagueId,
    name: `${letter} 組`,
    shortName: letter,
    sport: "football" as const,
    tone: tones[index % tones.length],
  };
});

export const LEAGUES: LeagueConfig[] = [
  ...worldCupGroups,
  { id: "nba", name: "NBA", shortName: "NBA", sport: "basketball", tone: "#27272a" },
  { id: "mlb", name: "MLB", shortName: "MLB", sport: "baseball", tone: "#3f3f46" },
  { id: "npb", name: "NPB", shortName: "NPB", sport: "baseball", tone: "#52525b" },
  { id: "cpbl", name: "CPBL", shortName: "CPBL", sport: "baseball", tone: "#18181b" },
  { id: "f1", name: "Formula 1", shortName: "F1", sport: "motorsport", tone: "#111111" },
  { id: "giro", name: "Giro d'Italia", shortName: "Giro", sport: "cycling", tone: "#3f3f46" },
  { id: "tourdefrance", name: "Tour de France", shortName: "TDF", sport: "cycling", tone: "#52525b" },
  { id: "vuelta", name: "Vuelta a España", shortName: "Vuelta", sport: "cycling", tone: "#18181b" },
  { id: "milan-san-remo", name: "Milan-San Remo", shortName: "MSR", sport: "cycling", tone: "#27272a" },
  { id: "tour-of-flanders", name: "Tour of Flanders", shortName: "RVV", sport: "cycling", tone: "#3f3f46" },
  { id: "paris-roubaix", name: "Paris-Roubaix", shortName: "PR", sport: "cycling", tone: "#52525b" },
  { id: "liege-bastogne-liege", name: "Liege-Bastogne-Liege", shortName: "LBL", sport: "cycling", tone: "#18181b" },
  { id: "il-lombardia", name: "Il Lombardia", shortName: "LOM", sport: "cycling", tone: "#27272a" },
];

export const WORLD_CUP_LEAGUES = LEAGUES.filter((league) => league.id.startsWith("worldcup-group-"));
export const WORLD_CUP_LEAGUE_IDS = WORLD_CUP_LEAGUES.map((league) => league.id);
export const CYCLING_LEAGUES = LEAGUES.filter((league) => league.sport === "cycling");
export const CYCLING_LEAGUE_IDS = CYCLING_LEAGUES.map((league) => league.id);
export const PRIMARY_LEAGUES = LEAGUES.filter(
  (league) => !WORLD_CUP_LEAGUE_IDS.includes(league.id) && !CYCLING_LEAGUE_IDS.includes(league.id),
);
export const ALL_LEAGUE_IDS = LEAGUES.map((league) => league.id);
export const LEAGUE_BY_ID = Object.fromEntries(LEAGUES.map((league) => [league.id, league])) as Record<LeagueId, LeagueConfig>;

export const SPORT_LABELS = {
  football: "足球",
  basketball: "籃球",
  baseball: "棒球",
  motorsport: "賽車",
  cycling: "單車",
} as const;
