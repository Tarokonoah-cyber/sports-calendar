"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  ALL_LEAGUE_IDS,
  ATHLETICS_LEAGUE_IDS,
  ATHLETICS_LEAGUES,
  BASEBALL_LEAGUE_IDS,
  BASEBALL_LEAGUES,
  BASKETBALL_LEAGUE_IDS,
  BASKETBALL_LEAGUES,
  CYCLING_LEAGUE_IDS,
  CYCLING_LEAGUES,
  MOTORSPORT_LEAGUE_IDS,
  MOTORSPORT_LEAGUES,
  WORLD_CUP_LEAGUE_IDS,
  WORLD_CUP_LEAGUES,
} from "@/lib/leagues";
import { useCalendarStore } from "@/store/calendar-store";
import type { LeagueConfig, LeagueId } from "@/types/sports";

function getGroupChecked(activeLeagueIds: LeagueId[], groupLeagueIds: LeagueId[]) {
  const activeCount = groupLeagueIds.filter((leagueId) => activeLeagueIds.includes(leagueId)).length;
  if (activeCount === 0) return false;
  return activeCount === groupLeagueIds.length ? true : "indeterminate";
}

function LeagueRow({ league }: { league: LeagueConfig }) {
  const activeLeagueIds = useCalendarStore((state) => state.activeLeagueIds);
  const toggleLeague = useCalendarStore((state) => state.toggleLeague);

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md py-1.5 pl-9 pr-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
      <Checkbox checked={activeLeagueIds.includes(league.id)} onCheckedChange={() => toggleLeague(league.id)} />
      <span className="min-w-0 flex-1 truncate">{league.name}</span>
    </label>
  );
}

function SportGroup({
  icon,
  title,
  leagueIds,
  leagues,
  defaultOpen = false,
}: {
  icon: string;
  title: string;
  leagueIds: LeagueId[];
  leagues: LeagueConfig[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const activeLeagueIds = useCalendarStore((state) => state.activeLeagueIds);
  const setLeagueGroup = useCalendarStore((state) => state.setLeagueGroup);
  const checked = getGroupChecked(activeLeagueIds, leagueIds);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 rounded-md py-1.5 pr-2 transition-colors hover:bg-muted/50">
        <Checkbox checked={checked} onCheckedChange={(nextChecked) => setLeagueGroup(leagueIds, nextChecked === true)} />
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="w-5 shrink-0 text-center text-base leading-none" aria-hidden="true">
            {icon}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{title}</span>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{leagues.length}</span>
        </button>
      </div>

      {open ? (
        <div className="space-y-1">
          {leagues.map((league) => (
            <LeagueRow key={league.id} league={league} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LeagueFilter() {
  const activeLeagueIds = useCalendarStore((state) => state.activeLeagueIds);
  const setAllLeagues = useCalendarStore((state) => state.setAllLeagues);
  const allChecked = getGroupChecked(activeLeagueIds, ALL_LEAGUE_IDS);

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center gap-3 rounded-md py-1.5 pr-2 text-sm transition-colors hover:bg-muted/50">
        <Checkbox checked={allChecked} onCheckedChange={(checked) => setAllLeagues(checked === true)} />
        <span className="min-w-0 flex-1 truncate font-medium">全選</span>
      </label>

      <div className="space-y-2 pt-1">
        <SportGroup icon="🏆" title="FIFA 世界盃" leagueIds={WORLD_CUP_LEAGUE_IDS} leagues={WORLD_CUP_LEAGUES} />
        <SportGroup icon="🏀" title="籃球" leagueIds={BASKETBALL_LEAGUE_IDS} leagues={BASKETBALL_LEAGUES} defaultOpen />
        <SportGroup icon="⚾" title="棒球" leagueIds={BASEBALL_LEAGUE_IDS} leagues={BASEBALL_LEAGUES} />
        <SportGroup icon="🏎️" title="賽車" leagueIds={MOTORSPORT_LEAGUE_IDS} leagues={MOTORSPORT_LEAGUES} />
        <SportGroup icon="💎" title="田徑 / 鑽石聯賽" leagueIds={ATHLETICS_LEAGUE_IDS} leagues={ATHLETICS_LEAGUES} />
        <SportGroup icon="🚴" title="單車" leagueIds={CYCLING_LEAGUE_IDS} leagues={CYCLING_LEAGUES} />
      </div>
    </div>
  );
}
