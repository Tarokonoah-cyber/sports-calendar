"use client";

import { addDays, addMonths, addWeeks, parseISO, subDays, subMonths, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTaiwanDate } from "@/lib/date";
import { useCalendarStore } from "@/store/calendar-store";
import type { CalendarView } from "@/types/sports";

interface CalendarToolbarProps {
  onToggleMobileFilters: () => void;
}

function moveDate(date: Date, view: CalendarView, direction: "previous" | "next") {
  if (view === "month") {
    return direction === "next" ? addMonths(date, 1) : subMonths(date, 1);
  }

  if (view === "week") {
    return direction === "next" ? addWeeks(date, 1) : subWeeks(date, 1);
  }

  return direction === "next" ? addDays(date, 1) : subDays(date, 1);
}

function getRangeLabel(date: Date, view: CalendarView) {
  if (view === "month") {
    return formatTaiwanDate(date, "yyyy 年 M 月");
  }

  if (view === "week") {
    return `${formatTaiwanDate(date, "M 月 d 日")}當週`;
  }

  return formatTaiwanDate(date, "M 月 d 日 EEEE");
}

export function CalendarToolbar({ onToggleMobileFilters }: CalendarToolbarProps) {
  const searchQuery = useCalendarStore((state) => state.searchQuery);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const setSearchQuery = useCalendarStore((state) => state.setSearchQuery);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setView = useCalendarStore((state) => state.setView);
  const view = useCalendarStore((state) => state.view);
  const currentDate = parseISO(selectedDate);

  return (
    <header className="flex shrink-0 flex-col gap-3 border-b border-border bg-background px-3 py-3 md:px-4">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">Sports Calendar 體育賽事日曆</h1>
          <p className="truncate text-xs text-muted-foreground">{getRangeLabel(currentDate, view)} · GMT+8</p>
        </div>
        <Button
          aria-label="上一段日期"
          onClick={() => setSelectedDate(moveDate(currentDate, view, "previous").toISOString())}
          size="icon"
          variant="outline"
        >
          <ChevronLeft />
        </Button>
        <Button
          aria-label="下一段日期"
          onClick={() => setSelectedDate(moveDate(currentDate, view, "next").toISOString())}
          size="icon"
          variant="outline"
        >
          <ChevronRight />
        </Button>
        <Button onClick={() => setSelectedDate(new Date().toISOString())} size="sm" variant="outline">
          今天
        </Button>
        <Button
          aria-label="開關篩選器"
          className="md:hidden"
          onClick={onToggleMobileFilters}
          size="icon"
          variant="outline"
        >
          <SlidersHorizontal />
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜尋球隊、國家、聯盟或賽事"
            value={searchQuery}
          />
        </div>
        <Tabs onValueChange={(value) => setView(value as CalendarView)} value={view}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger className="flex-1 sm:flex-none" value="day">
              日
            </TabsTrigger>
            <TabsTrigger className="flex-1 sm:flex-none" value="week">
              週
            </TabsTrigger>
            <TabsTrigger className="flex-1 sm:flex-none" value="month">
              月
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
