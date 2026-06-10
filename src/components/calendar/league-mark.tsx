import { LEAGUE_BY_ID } from "@/lib/leagues";
import { cn } from "@/lib/utils";
import type { LeagueId } from "@/types/sports";

interface LeagueMarkProps {
  leagueId: LeagueId;
  className?: string;
}

export function LeagueMark({ leagueId, className }: LeagueMarkProps) {
  const league = LEAGUE_BY_ID[leagueId];

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[10px] font-semibold leading-none text-white",
        className,
      )}
      style={{ backgroundColor: league.tone, borderColor: league.tone }}
    >
      {league.shortName}
    </span>
  );
}
