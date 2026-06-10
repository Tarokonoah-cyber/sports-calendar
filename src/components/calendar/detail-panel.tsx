"use client";

import { parseISO } from "date-fns";
import { ExternalLink, MapPin, Star, X } from "lucide-react";
import { LeagueMark } from "@/components/calendar/league-mark";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTaiwanDate } from "@/lib/date";
import { LEAGUE_BY_ID, SPORT_LABELS } from "@/lib/leagues";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/store/calendar-store";
import type { SportsEvent } from "@/types/sports";

interface DetailPanelProps {
  event: SportsEvent | null;
  className?: string;
  onClose?: () => void;
}

export function DetailPanel({ event, className, onClose }: DetailPanelProps) {
  const favoriteEventIds = useCalendarStore((state) => state.favoriteEventIds);
  const favoriteLeagueIds = useCalendarStore((state) => state.favoriteLeagueIds);
  const favoriteTeams = useCalendarStore((state) => state.favoriteTeams);
  const toggleFavoriteEvent = useCalendarStore((state) => state.toggleFavoriteEvent);
  const toggleFavoriteLeague = useCalendarStore((state) => state.toggleFavoriteLeague);
  const toggleFavoriteTeam = useCalendarStore((state) => state.toggleFavoriteTeam);

  if (!event) {
    return (
      <aside className={cn("h-full bg-background p-4", className)}>
        <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
          選取一場賽事以查看詳細資訊。
        </div>
      </aside>
    );
  }

  const startTime = parseISO(event.startTime);
  const league = LEAGUE_BY_ID[event.leagueId];
  const isFavoriteEvent = favoriteEventIds.includes(event.id);
  const isFavoriteLeague = favoriteLeagueIds.includes(event.leagueId);

  return (
    <aside className={cn("h-full overflow-y-auto bg-background p-4", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <LeagueMark leagueId={event.leagueId} />
            <span className="text-xs font-medium text-muted-foreground">{event.leagueName}</span>
          </div>
          <h2 className="text-lg font-semibold leading-tight">{event.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SPORT_LABELS[league.sport]}</p>
        </div>
        {onClose && (
          <Button aria-label="關閉詳細資訊" onClick={onClose} size="icon" variant="ghost">
            <X />
          </Button>
        )}
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">時間 GMT+8</p>
          <p className="mt-1 font-medium">{formatTaiwanDate(startTime, "yyyy 年 M 月 d 日 EEEE")}</p>
          <p className="font-mono text-muted-foreground">{formatTaiwanDate(startTime, "HH:mm")}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">地點</p>
          <p className="mt-1 flex items-center gap-2 font-medium">
            <MapPin className="size-4" />
            {event.location}
          </p>
          <p className="text-muted-foreground">{event.city}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">賽事類型</p>
          <p className="mt-1 font-medium">{event.leagueName}</p>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="space-y-2">
        <Button
          className="w-full justify-start"
          onClick={() => toggleFavoriteEvent(event.id)}
          variant={isFavoriteEvent ? "default" : "outline"}
        >
          <Star />
          {isFavoriteEvent ? "已收藏賽事" : "收藏這場賽事"}
        </Button>
        <Button
          className="w-full justify-start"
          onClick={() => toggleFavoriteLeague(event.leagueId)}
          variant={isFavoriteLeague ? "default" : "outline"}
        >
          <Star />
          {isFavoriteLeague ? "已收藏聯盟" : "收藏這個聯盟"}
        </Button>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">球隊 / 參賽者</p>
        <div className="space-y-2">
          {event.participants.map((participant) => {
            const isFavoriteTeam = favoriteTeams.includes(participant);

            return (
              <Button
                className="w-full justify-between"
                key={participant}
                onClick={() => toggleFavoriteTeam(participant)}
                variant={isFavoriteTeam ? "default" : "outline"}
              >
                <span className="truncate">{participant}</span>
                <Star className="size-3" />
              </Button>
            );
          })}
        </div>
      </div>

      <Separator className="my-5" />

      <Button asChild className="w-full justify-start" variant="outline">
        <a href={event.officialUrl} rel="noreferrer" target="_blank">
          <ExternalLink />
          官方網站
        </a>
      </Button>
    </aside>
  );
}
