"use client";

import { parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { DayView } from "@/components/calendar/day-view";
import { DetailPanel } from "@/components/calendar/detail-panel";
import { LeagueFilter } from "@/components/calendar/league-filter";
import { matchesSearch } from "@/components/calendar/calendar-utils";
import { MonthView } from "@/components/calendar/month-view";
import { Sidebar } from "@/components/calendar/sidebar";
import { WeekView } from "@/components/calendar/week-view";
import { useSportsEvents } from "@/hooks/use-sports-events";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/store/calendar-store";
import type { SportsEvent } from "@/types/sports";

interface SportsCalendarProps {
  initialEvents: SportsEvent[];
}

export function SportsCalendar({ initialEvents }: SportsCalendarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { data, isError, isLoading } = useSportsEvents(initialEvents);
  const activeLeagueIds = useCalendarStore((state) => state.activeLeagueIds);
  const searchQuery = useCalendarStore((state) => state.searchQuery);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const selectedEventId = useCalendarStore((state) => state.selectedEventId);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setSelectedEventId = useCalendarStore((state) => state.setSelectedEventId);
  const setView = useCalendarStore((state) => state.setView);
  const view = useCalendarStore((state) => state.view);

  const allEvents = data?.events ?? initialEvents;
  const filteredEvents = useMemo(
    () =>
      allEvents.filter(
        (event) => activeLeagueIds.includes(event.leagueId) && matchesSearch(event, searchQuery),
      ),
    [activeLeagueIds, allEvents, searchQuery],
  );
  const selectedEvent = allEvents.find((event) => event.id === selectedEventId) ?? null;
  const selectedDateObject = parseISO(selectedDate);

  function handleSelectDate(date: Date) {
    setSelectedDate(date.toISOString());
  }

  function handleSelectEvent(eventId: string) {
    setSelectedEventId(eventId);
  }

  function handleShowDay(date: Date) {
    setSelectedDate(date.toISOString());
    setView("day");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <CalendarToolbar onToggleMobileFilters={() => setShowMobileFilters((current) => !current)} />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-72 shrink-0 border-r border-border md:block">
          <Sidebar events={allEvents} />
        </div>

        <main className="flex min-w-0 flex-1 flex-col">
          <div
            className={cn(
              "border-b border-border bg-background px-3 py-3 md:hidden",
              !showMobileFilters && "hidden",
            )}
          >
            <LeagueFilter />
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3 md:p-4">
            {isError && (
              <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
                無法載入賽事資料，仍會先使用本機 Mock Data。
              </div>
            )}
            {isLoading && (
              <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
                載入日曆中...
              </div>
            )}
            {view === "month" && (
              <MonthView
                events={filteredEvents}
                onSelectDate={handleSelectDate}
                onSelectEvent={handleSelectEvent}
                onShowDay={handleShowDay}
                selectedDate={selectedDateObject}
                selectedEventId={selectedEventId}
              />
            )}
            {view === "week" && (
              <WeekView
                events={filteredEvents}
                onSelectDate={handleSelectDate}
                onSelectEvent={handleSelectEvent}
                selectedDate={selectedDateObject}
                selectedEventId={selectedEventId}
              />
            )}
            {view === "day" && (
              <DayView
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                selectedDate={selectedDateObject}
                selectedEventId={selectedEventId}
              />
            )}
          </div>
        </main>

        <div className="hidden w-96 shrink-0 border-l border-border lg:block">
          <DetailPanel event={selectedEvent} />
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-x-0 bottom-0 top-24 z-40 border-t border-border bg-background shadow-none lg:hidden">
          <DetailPanel event={selectedEvent} onClose={() => setSelectedEventId(null)} />
        </div>
      )}
    </div>
  );
}
