import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { SportsEvent } from "@/types/sports";

export const WEEK_STARTS_ON = 1 as const;

export function getEventDate(event: SportsEvent) {
  return parseISO(event.startTime);
}

export function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function getMonthRange(date: Date) {
  return {
    start: startOfWeek(startOfMonth(date), { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: WEEK_STARTS_ON }),
  };
}

export function getWeekRange(date: Date) {
  return {
    start: startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
  };
}

export function getEventsForDate(events: SportsEvent[], date: Date) {
  return events.filter((event) => isSameDay(getEventDate(event), date));
}

export function sortEventsByFavorites(
  events: SportsEvent[],
  favoriteTeams: string[],
  favoriteLeagueIds: string[] = [],
  favoriteEventIds: string[] = [],
) {
  const normalizedFavoriteTeams = favoriteTeams.map((team) => team.trim().toLowerCase()).filter(Boolean);

  return [...events].sort((a, b) => {
    const score = (event: SportsEvent) => {
      const teamScore = event.participants.some((participant) =>
        normalizedFavoriteTeams.some((team) => participant.toLowerCase().includes(team) || team.includes(participant.toLowerCase())),
      )
        ? 4
        : 0;
      const leagueScore = favoriteLeagueIds.includes(event.leagueId) ? 2 : 0;
      const eventScore = favoriteEventIds.includes(event.id) ? 1 : 0;
      return teamScore + leagueScore + eventScore;
    };

    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return a.startTime.localeCompare(b.startTime);
  });
}

export function matchesSearch(event: SportsEvent, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    event.title,
    event.matchup,
    event.leagueName,
    event.location,
    event.city,
    event.sport,
    ...event.participants,
    ...event.tags,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}
