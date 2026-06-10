"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  CYCLING_LEAGUE_IDS,
  CYCLING_LEAGUES,
  PRIMARY_LEAGUES,
  WORLD_CUP_LEAGUE_IDS,
  WORLD_CUP_LEAGUES,
} from "@/lib/leagues";
import { useCalendarStore } from "@/store/calendar-store";
import type { LeagueId, LeagueConfig } from "@/types/sports";

function getGroupChecked(activeLeagueIds: LeagueId[], groupLeagueIds: LeagueId[]) {
  const activeCount = groupLeagueIds.filter((leagueId) => activeLeagueIds.includes(leagueId)).length;

  if (activeCount === 0) {
    return false;
  }

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

export function LeagueFilter() {
  const activeLeagueIds = useCalendarStore((state) => state.activeLeagueIds);
  const setLeagueGroup = useCalendarStore((state) => state.setLeagueGroup);
  const toggleLeague = useCalendarStore((state) => state.toggleLeague);
  const worldCupChecked = getGroupChecked(activeLeagueIds, WORLD_CUP_LEAGUE_IDS);
  const cyclingChecked = getGroupChecked(activeLeagueIds, CYCLING_LEAGUE_IDS);

  return (
    <div className="space-y-1">
      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent">
        <Checkbox
          checked={worldCupChecked}
          onCheckedChange={(checked) => setLeagueGroup(WORLD_CUP_LEAGUE_IDS, checked === true)}
        />
        <span className="min-w-0 flex-1 truncate">FIFA 世界盃</span>
      </label>

      <div className="ml-6 space-y-1 border-l border-border pl-3">
        {WORLD_CUP_LEAGUES.map((league) => (
          <LeagueRow key={league.id} league={league} />
        ))}
      </div>

      {PRIMARY_LEAGUES.map((league) => (
        <label
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent"
          key={league.id}
        >
          <Checkbox
            checked={activeLeagueIds.includes(league.id)}
            onCheckedChange={() => toggleLeague(league.id)}
          />
          <span className="min-w-0 flex-1 truncate">{league.name}</span>
        </label>
      ))}

      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent">
        <Checkbox
          checked={cyclingChecked}
          onCheckedChange={(checked) => setLeagueGroup(CYCLING_LEAGUE_IDS, checked === true)}
        />
        <span className="min-w-0 flex-1 truncate">單車</span>
      </label>

      <div className="ml-6 space-y-1 border-l border-border pl-3">
        {CYCLING_LEAGUES.map((league) => (
          <LeagueRow key={league.id} league={league} />
        ))}
      </div>
    </div>
  );
}
