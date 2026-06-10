"use client";

import { eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { EventButton } from "@/components/calendar/event-button";
import { getEventsForDate, getWeekRange } from "@/components/calendar/calendar-utils";
import { formatTaiwanDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { SportsEvent } from "@/types/sports";

interface WeekViewProps {
  events: SportsEvent[];
  selectedDate: Date;
  selectedEventId: string | null;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (eventId: string) => void;
}

export function WeekView({ events, selectedDate, selectedEventId, onSelectDate, onSelectEvent }: WeekViewProps) {
  const range = getWeekRange(selectedDate);
  const days = eachDayOfInterval(range);

  return (
    <section className="grid min-w-[720px] grid-cols-7 overflow-hidden rounded-lg border border-border bg-background">
      {days.map((day) => {
        const dayEvents = getEventsForDate(events, day);

        return (
          <div className="min-h-[620px] border-r border-border last:border-r-0" key={day.toISOString()}>
            <button
              className={cn(
                "flex w-full items-center justify-between border-b border-border px-3 py-3 text-left transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSameDay(day, selectedDate) && "bg-muted",
              )}
              onClick={() => onSelectDate(day)}
              type="button"
            >
              <span>
                <span className="block text-xs text-muted-foreground">{formatTaiwanDate(day, "EEE")}</span>
                <span className="text-sm font-medium">{formatTaiwanDate(day, "M/d")}</span>
              </span>
              {isToday(day) && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">今天</span>}
            </button>
            <div className="space-y-2 p-2">
              {dayEvents.map((event) => (
                <EventButton
                  event={event}
                  isSelected={selectedEventId === event.id}
                  key={event.id}
                  onClick={onSelectEvent}
                />
              ))}
              {dayEvents.length === 0 && <p className="px-2 py-6 text-xs text-muted-foreground">沒有賽事</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}
