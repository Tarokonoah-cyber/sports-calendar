"use client";

import { EventButton } from "@/components/calendar/event-button";
import { getEventsForDate } from "@/components/calendar/calendar-utils";
import { formatTaiwanDate } from "@/lib/date";
import type { SportsEvent } from "@/types/sports";

interface DayViewProps {
  events: SportsEvent[];
  selectedDate: Date;
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}

export function DayView({ events, selectedDate, selectedEventId, onSelectEvent }: DayViewProps) {
  const dayEvents = getEventsForDate(events, selectedDate);

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">{formatTaiwanDate(selectedDate, "EEEE")}</p>
        <h2 className="text-base font-semibold">{formatTaiwanDate(selectedDate, "yyyy 年 M 月 d 日")}</h2>
      </div>
      <div className="space-y-2 p-3">
        {dayEvents.map((event) => (
          <EventButton
            event={event}
            isSelected={selectedEventId === event.id}
            key={event.id}
            onClick={onSelectEvent}
          />
        ))}
        {dayEvents.length === 0 && (
          <div className="px-2 py-16 text-center text-sm text-muted-foreground">這一天沒有已排定的賽事。</div>
        )}
      </div>
    </section>
  );
}
