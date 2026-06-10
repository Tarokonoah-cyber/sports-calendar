"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  ALL_LEAGUE_IDS,
  CYCLING_LEAGUE_IDS,
  CYCLING_LEAGUES,
  PRIMARY_LEAGUES,
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

function LeagueGroup({
  title,
  leagueIds,
  leagues,
  defaultOpen = false,
}: {
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
      <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent">
        <Checkbox checked={checked} onCheckedChange={(nextChecked) => setLeagueGroup(leagueIds, nextChecked === true)} />
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1 text-left"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <span className="text-xs text-muted-foreground">{open ? "收合" : `${leagues.length} 項`}</span>
        </button>
      </div>

      {open ? (
        <div className="ml-6 grid grid-cols-2 gap-x-2 gap-y-1 border-l border-border pl-3">
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
  const toggleLeague = useCalendarStore((state) => state.toggleLeague);

  const allChecked = getGroupChecked(activeLeagueIds, ALL_LEAGUE_IDS);

  return (
    <div className="space-y-1">
      <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent">
        <Checkbox checked={allChecked} onCheckedChange={(checked) => setAllLeagues(checked === true)} />
        <span className="min-w-0 flex-1 truncate">全選</span>
      </label>

      <LeagueGroup title="FIFA 世界盃" leagueIds={WORLD_CUP_LEAGUE_IDS} leagues={WORLD_CUP_LEAGUES} />

      {PRIMARY_LEAGUES.map((league) => (
        <label key={league.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent">
          <Checkbox checked={activeLeagueIds.includes(league.id)} onCheckedChange={() => toggleLeague(league.id)} />
          <span className="min-w-0 flex-1 truncate">{league.name}</span>
        </label>
      ))}

      <LeagueGroup title="單車" leagueIds={CYCLING_LEAGUE_IDS} leagues={CYCLING_LEAGUES} />
    </div>
  );
}
