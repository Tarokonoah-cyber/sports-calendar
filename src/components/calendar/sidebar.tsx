"use client";

import { addDays, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, CalendarRange, Star, TableProperties } from "lucide-react";
import { LeagueFilter } from "@/components/calendar/league-filter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTaiwanDate } from "@/lib/date";
import { LEAGUE_BY_ID } from "@/lib/leagues";
import { useCalendarStore } from "@/store/calendar-store";
import type { SportsEvent } from "@/types/sports";

interface SidebarProps {
  events: SportsEvent[];
}

export function Sidebar({ events }: SidebarProps) {
  const favoriteEventIds = useCalendarStore((state) => state.favoriteEventIds);
  const favoriteLeagueIds = useCalendarStore((state) => state.favoriteLeagueIds);
  const favoriteTeams = useCalendarStore((state) => state.favoriteTeams);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setView = useCalendarStore((state) => state.setView);
  const setSelectedEventId = useCalendarStore((state) => state.setSelectedEventId);

  const favoriteEvents = events.filter((event) => favoriteEventIds.includes(event.id)).slice(0, 4);

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-background p-3">
      <div className="space-y-1">
        <Button
          className="w-full justify-start"
          onClick={() => {
            setSelectedDate(new Date().toISOString());
            setView("day");
          }}
          variant="ghost"
        >
          <CalendarDays />
          今天
        </Button>
        <Button
          className="w-full justify-start"
          onClick={() => {
            setSelectedDate(startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString());
            setView("week");
          }}
          variant="ghost"
        >
          <CalendarRange />
          本週
        </Button>
        <Button
          className="w-full justify-start"
          onClick={() => {
            setSelectedDate(startOfMonth(new Date()).toISOString());
            setView("month");
          }}
          variant="ghost"
        >
          <TableProperties />
          本月
        </Button>
      </div>

      <Separator className="my-4" />

      <section>
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <Star className="size-3" />
          收藏
        </div>
        <div className="space-y-1 px-2 text-sm">
          {favoriteEvents.map((event) => (
            <button
              className="block w-full truncate rounded-md py-1 text-left text-muted-foreground transition-colors duration-150 hover:text-foreground"
              key={event.id}
              onClick={() => {
                setSelectedDate(event.startTime);
                setSelectedEventId(event.id);
              }}
              type="button"
            >
              {event.matchup} · {formatTaiwanDate(new Date(event.startTime), "M/d")}
            </button>
          ))}
          {favoriteLeagueIds.map((leagueId) => (
            <div className="truncate text-muted-foreground" key={leagueId}>
              {LEAGUE_BY_ID[leagueId].name}
            </div>
          ))}
          {favoriteTeams.map((team) => (
            <div className="truncate text-muted-foreground" key={team}>
              {team}
            </div>
          ))}
          {favoriteEvents.length === 0 && favoriteLeagueIds.length === 0 && favoriteTeams.length === 0 && (
            <p className="py-2 text-xs text-muted-foreground">尚未收藏任何項目。</p>
          )}
        </div>
      </section>

      <Separator className="my-4" />

      <section>
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          賽事
        </div>
        <LeagueFilter />
      </section>

      <div className="mt-auto px-2 pt-6 text-xs text-muted-foreground">
        {formatTaiwanDate(addDays(new Date(), 0), "yyyy/M/d")}
      </div>
    </aside>
  );
}
