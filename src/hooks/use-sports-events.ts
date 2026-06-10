"use client";

import { useQuery } from "@tanstack/react-query";
import type { SportsEvent } from "@/types/sports";

async function fetchEvents() {
  const response = await fetch("/api/events");

  if (!response.ok) {
    throw new Error("無法載入賽事資料。");
  }

  return (await response.json()) as { events: SportsEvent[] };
}

export function useSportsEvents(initialEvents: SportsEvent[]) {
  return useQuery({
    queryKey: ["sports-events"],
    queryFn: fetchEvents,
    initialData: { events: initialEvents },
    staleTime: 1000 * 60 * 5,
  });
}
