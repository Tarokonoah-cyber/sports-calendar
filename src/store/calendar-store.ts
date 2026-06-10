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
  setAllLeagues: (enabled: boolean) => void;
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
      setAllLeagues: (enabled) => set({ activeLeagueIds: enabled ? ALL_LEAGUE_IDS : [] }),
      setLeagueGroup: (leagueIds, enabled) =>
        set((state) => {
          const next = new Set(state.activeLeagueIds);
          leagueIds.forEach((leagueId) => {
            if (enabled) {
              next.add(leagueId);
            } else {
              next.delete(leagueId);
            }
          });
          return { activeLeagueIds: Array.from(next) };
        }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setView: (view) => set({ view }),
      toggleFavoriteEvent: (eventId) =>
        set((state) => ({
          favoriteEventIds: state.favoriteEventIds.includes(eventId)
            ? state.favoriteEventIds.filter((id) => id !== eventId)
            : [...state.favoriteEventIds, eventId],
        })),
      toggleFavoriteLeague: (leagueId) =>
        set((state) => ({
          favoriteLeagueIds: state.favoriteLeagueIds.includes(leagueId)
            ? state.favoriteLeagueIds.filter((id) => id !== leagueId)
            : [...state.favoriteLeagueIds, leagueId],
        })),
      toggleFavoriteTeam: (teamName) =>
        set((state) => ({
          favoriteTeams: state.favoriteTeams.includes(teamName)
            ? state.favoriteTeams.filter((name) => name !== teamName)
            : [...state.favoriteTeams, teamName],
        })),
      toggleLeague: (leagueId) =>
        set((state) => ({
          activeLeagueIds: state.activeLeagueIds.includes(leagueId)
            ? state.activeLeagueIds.filter((id) => id !== leagueId)
            : [...state.activeLeagueIds, leagueId],
        })),
    }),
    { name: "sports-calendar" },
  ),
);
