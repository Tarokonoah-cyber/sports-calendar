"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ALL_LEAGUE_IDS } from "@/lib/leagues";
import type { CalendarView, LeagueId } from "@/types/sports";

interface CalendarState {
  activeLeagueIds: LeagueId[];
  favoriteEventIds: string[];
  favoriteLeagueIds: LeagueId[];
  favoriteTeams: string[];
  searchQuery: string;
  selectedDate: string;
  selectedEventId: string | null;
  view: CalendarView;
  setLeagueGroup: (leagueIds: LeagueId[], enabled: boolean) => void;
  setSelectedDate: (date: string) => void;
  setSelectedEventId: (eventId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setView: (view: CalendarView) => void;
  toggleFavoriteEvent: (eventId: string) => void;
  toggleFavoriteLeague: (leagueId: LeagueId) => void;
  toggleFavoriteTeam: (teamName: string) => void;
  toggleLeague: (leagueId: LeagueId) => void;
}

function toggleItem<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      activeLeagueIds: ALL_LEAGUE_IDS,
      favoriteEventIds: [],
      favoriteLeagueIds: [],
      favoriteTeams: [],
      searchQuery: "",
      selectedDate: new Date().toISOString(),
      selectedEventId: null,
      view: "month",
      setLeagueGroup: (leagueIds, enabled) =>
        set((state) => ({
          activeLeagueIds: enabled
            ? Array.from(new Set([...state.activeLeagueIds, ...leagueIds]))
            : state.activeLeagueIds.filter((leagueId) => !leagueIds.includes(leagueId)),
        })),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setView: (view) => set({ view }),
      toggleFavoriteEvent: (eventId) =>
        set((state) => ({ favoriteEventIds: toggleItem(state.favoriteEventIds, eventId) })),
      toggleFavoriteLeague: (leagueId) =>
        set((state) => ({ favoriteLeagueIds: toggleItem(state.favoriteLeagueIds, leagueId) })),
      toggleFavoriteTeam: (teamName) =>
        set((state) => ({ favoriteTeams: toggleItem(state.favoriteTeams, teamName) })),
      toggleLeague: (leagueId) =>
        set((state) => ({ activeLeagueIds: toggleItem(state.activeLeagueIds, leagueId) })),
    }),
    {
      name: "sports-calendar-state",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CalendarState>;
        const activeLeagueIds = state.activeLeagueIds?.filter((leagueId) =>
          ALL_LEAGUE_IDS.includes(leagueId),
        );

        return {
          activeLeagueIds: activeLeagueIds?.length ? activeLeagueIds : ALL_LEAGUE_IDS,
          favoriteEventIds: state.favoriteEventIds ?? [],
          favoriteLeagueIds: state.favoriteLeagueIds?.filter((leagueId) => ALL_LEAGUE_IDS.includes(leagueId)) ?? [],
          favoriteTeams: state.favoriteTeams ?? [],
          view: state.view ?? "month",
        };
      },
      partialize: (state) => ({
        activeLeagueIds: state.activeLeagueIds,
        favoriteEventIds: state.favoriteEventIds,
        favoriteLeagueIds: state.favoriteLeagueIds,
        favoriteTeams: state.favoriteTeams,
        view: state.view,
      }),
    },
  ),
);
