export type SportCategory = "football" | "basketball" | "baseball" | "motorsport" | "cycling" | "athletics";

export type LeagueId =
  | "worldcup-group-a"
  | "worldcup-group-b"
  | "worldcup-group-c"
  | "worldcup-group-d"
  | "worldcup-group-e"
  | "worldcup-group-f"
  | "worldcup-group-g"
  | "worldcup-group-h"
  | "worldcup-group-i"
  | "worldcup-group-j"
  | "worldcup-group-k"
  | "worldcup-group-l"
  | "nba"
  | "mlb"
  | "npb"
  | "cpbl"
  | "f1"
  | "diamondleague"
  | "giro"
  | "tourdefrance"
  | "vuelta"
  | "milan-san-remo"
  | "tour-of-flanders"
  | "paris-roubaix"
  | "liege-bastogne-liege"
  | "il-lombardia";

export type CalendarView = "day" | "week" | "month";

export interface SportsEvent {
  id: string;
  leagueId: LeagueId;
  leagueName: string;
  sport: SportCategory;
  title: string;
  matchup: string;
  startTime: string;
  endTime?: string;
  location: string;
  city: string;
  officialUrl: string;
  participants: string[];
  tags: string[];
}

export interface LeagueConfig {
  id: LeagueId;
  name: string;
  shortName: string;
  sport: SportCategory;
  tone: string;
}
