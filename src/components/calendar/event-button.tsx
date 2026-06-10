"use client";

import { parseISO } from "date-fns";
import { MapPin } from "lucide-react";
import { LeagueMark } from "@/components/calendar/league-mark";
import { formatTaiwanDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { SportsEvent } from "@/types/sports";

interface EventButtonProps {
  event: SportsEvent;
  isSelected?: boolean;
  onClick: (eventId: string) => void;
  size?: "compact" | "regular";
}

export function EventButton({ event, isSelected = false, onClick, size = "regular" }: EventButtonProps) {
  const isCompact = size === "compact";

  return (
    <button
      className={cn(
        "group w-full rounded-md border border-border bg-card text-left transition-colors duration-150 hover:border-foreground/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isCompact ? "px-2 py-1" : "px-3 py-2",
        isSelected && "border-foreground bg-accent",
      )}
      onClick={() => onClick(event.id)}
      type="button"
    >
      <span className="flex min-w-0 items-start gap-2">
        <LeagueMark className="mt-0.5" leagueId={event.leagueId} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={cn("truncate font-medium text-foreground", isCompact ? "text-xs" : "text-sm")}>
              {event.matchup}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {formatTaiwanDate(parseISO(event.startTime), "HH:mm")}
            </span>
          </span>
          {!isCompact && (
            <span className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
