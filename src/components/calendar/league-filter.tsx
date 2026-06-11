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
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground">
      <Checkbox checked={activeLeagueIds.includes(league.id)} onCheckedChange={() => toggleLeague(league.id)} />
      <span className="min-w-0 flex-1 truncate">{league.name}</span>
    </label>
  );
}

function SportGroup({
  icon,
  title,
  shortTitle,
  leagueIds,
  leagues,
  defaultOpen = false,
}: {
  icon: string;
  title: string;
  shortTitle: string;
  leagueIds: LeagueId[];
  leagues: LeagueConfig[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const activeLeagueIds = useCalendarStore((state) => state.activeLeagueIds);
  const setLeagueGroup = useCalendarStore((state) => state.setLeagueGroup);
  const checked = getGroupChecked(activeLeagueIds, leagueIds);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2 px-2 py-2">
        <Checkbox checked={checked} onCheckedChange={(nextChecked) => setLeagueGroup(leagueIds, nextChecked === true)} />
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <span className="flex h-8 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-700 text-[11px] font-bold leading-none text-white shadow-sm">
            <span className="text-base leading-none">{icon}</span>
            <span className="mt-0.5">{shortTitle}</span>
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{leagues.length}</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-muted/20 px-3 py-2">
          <div className="grid grid-cols-1 gap-1">
            {leagues.map((league) => (
              <LeagueRow key={league.id} league={league} />
            ))}
          </div>
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
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent">
        <Checkbox checked={allChecked} onCheckedChange={(checked) => setAllLeagues(checked === true)} />
        <span className="min-w-0 flex-1 truncate">全選</span>
      </label>

      <SportGroup icon="🏆" title="FIFA 世界盃" shortTitle="WC26" leagueIds={WORLD_CUP_LEAGUE_IDS} leagues={WORLD_CUP_LEAGUES} />
      <SportGroup icon="🏀" title="籃球" shortTitle="籃球" leagueIds={BASKETBALL_LEAGUE_IDS} leagues={BASKETBALL_LEAGUES} defaultOpen />
      <SportGroup icon="⚾" title="棒球" shortTitle="棒球" leagueIds={BASEBALL_LEAGUE_IDS} leagues={BASEBALL_LEAGUES} defaultOpen />
      <SportGroup icon="🏎️" title="賽車" shortTitle="賽車" leagueIds={MOTORSPORT_LEAGUE_IDS} leagues={MOTORSPORT_LEAGUES} />
      <SportGroup icon="💎" title="田徑 / 鑽石聯賽" shortTitle="田徑" leagueIds={ATHLETICS_LEAGUE_IDS} leagues={ATHLETICS_LEAGUES} />
      <SportGroup icon="🚴" title="單車" shortTitle="單車" leagueIds={CYCLING_LEAGUE_IDS} leagues={CYCLING_LEAGUES} />
    </div>
  );
}
