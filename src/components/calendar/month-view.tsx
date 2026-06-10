"use client";

import { eachDayOfInterval, format, isSameDay, isSameMonth, isToday } from "date-fns";
import { EventButton } from "@/components/calendar/event-button";
import { getEventsForDate, getMonthRange } from "@/components/calendar/calendar-utils";
import { cn } from "@/lib/utils";
import type { SportsEvent } from "@/types/sports";

const WEEKDAYS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

interface MonthViewProps {
  events: SportsEvent[];
  selectedDate: Date;
  selectedEventId: string | null;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (eventId: string) => void;
  onShowDay: (date: Date) => void;
}

export function MonthView({
  events,
  selectedDate,
  selectedEventId,
  onSelectDate,
  onSelectEvent,
  onShowDay,
}: MonthViewProps) {
  const range = getMonthRange(selectedDate);
  const days = eachDayOfInterval(range);

  return (
    <section className="min-w-[720px] overflow-hidden rounded-lg border border-border bg-background">
      <div className="grid grid-cols-7 border-b border-border bg-muted/60">
        {WEEKDAYS.map((day) => (
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground" key={day}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day);
          const visibleEvents = dayEvents.slice(0, 4);
          const hiddenCount = dayEvents.length - visibleEvents.length;

          return (
            <div
              className={cn(
                "min-h-[128px] border-b border-r border-border p-2 last:border-r-0",
                !isSameMonth(day, selectedDate) && "bg-muted/30 text-muted-foreground",
                isSameDay(day, selectedDate) && "bg-muted",
              )}
              key={day.toISOString()}
            >
              <button
                className={cn(
                  "mb-2 flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isToday(day) && "bg-primary text-primary-foreground hover:bg-primary",
                )}
                onClick={() => onSelectDate(day)}
                type="button"
              >
                {format(day, "d")}
              </button>
              <div className="space-y-1">
                {visibleEvents.map((event) => (
                  <EventButton
                    event={event}
                    isSelected={selectedEventId === event.id}
                    key={event.id}
                    onClick={onSelectEvent}
                    size="compact"
                  />
                ))}
                {hiddenCount > 0 && (
                  <button
                    className="w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                    onClick={() => onShowDay(day)}
                    type="button"
                  >
                    另有 {hiddenCount} 場，點日期看完整清單
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
