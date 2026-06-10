import type { LeagueConfig, LeagueId } from "@/types/sports";

export const LEAGUES: LeagueConfig[] = [
  { id: "worldcup-group-a", name: "A 組", shortName: "A", sport: "football", tone: "#111111" },
  { id: "worldcup-group-b", name: "B 組", shortName: "B", sport: "football", tone: "#27272a" },
  { id: "worldcup-group-c", name: "C 組", shortName: "C", sport: "football", tone: "#3f3f46" },
  { id: "worldcup-group-d", name: "D 組", shortName: "D", sport: "football", tone: "#52525b" },
  { id: "worldcup-group-e", name: "E 組", shortName: "E", sport: "football", tone: "#18181b" },
  { id: "nba", name: "NBA", shortName: "NBA", sport: "basketball", tone: "#27272a" },
  { id: "mlb", name: "MLB", shortName: "MLB", sport: "baseball", tone: "#3f3f46" },
  { id: "npb", name: "NPB", shortName: "NPB", sport: "baseball", tone: "#52525b" },
  { id: "cpbl", name: "CPBL", shortName: "CPBL", sport: "baseball", tone: "#18181b" },
  { id: "f1", name: "Formula 1 一級方程式", shortName: "F1", sport: "motorsport", tone: "#404040" },
  { id: "giro", name: "環義賽", shortName: "Giro", sport: "cycling", tone: "#6b7280" },
  { id: "tourdefrance", name: "環法自行車賽", shortName: "TdF", sport: "cycling", tone: "#4b5563" },
  { id: "vuelta", name: "環西自行車賽", shortName: "Vuelta", sport: "cycling", tone: "#374151" },
  { id: "milan-san-remo", name: "米蘭-聖雷莫", shortName: "MSR", sport: "cycling", tone: "#71717a" },
  { id: "tour-of-flanders", name: "環法蘭德斯", shortName: "RVV", sport: "cycling", tone: "#52525b" },
  { id: "paris-roubaix", name: "巴黎-魯貝", shortName: "PR", sport: "cycling", tone: "#3f3f46" },
  { id: "liege-bastogne-liege", name: "列日-巴斯通-列日", shortName: "LBL", sport: "cycling", tone: "#27272a" },
  { id: "il-lombardia", name: "環倫巴底", shortName: "LOM", sport: "cycling", tone: "#18181b" },
];

export const ALL_LEAGUE_IDS = LEAGUES.map((league) => league.id);

export const WORLD_CUP_LEAGUES = LEAGUES.filter((league) => league.sport === "football");

export const WORLD_CUP_LEAGUE_IDS = WORLD_CUP_LEAGUES.map((league) => league.id);

export const PRIMARY_LEAGUES = LEAGUES.filter(
  (league) => league.sport !== "cycling" && league.sport !== "football",
);

export const CYCLING_LEAGUES = LEAGUES.filter((league) => league.sport === "cycling");

export const CYCLING_LEAGUE_IDS = CYCLING_LEAGUES.map((league) => league.id);

export const SPORT_LABELS = {
  baseball: "棒球",
  basketball: "籃球",
  cycling: "單車",
  football: "足球",
  motorsport: "賽車",
} as const;

export const LEAGUE_BY_ID = LEAGUES.reduce(
  (acc, league) => {
    acc[league.id] = league;
    return acc;
  },
  {} as Record<LeagueId, LeagueConfig>,
);
