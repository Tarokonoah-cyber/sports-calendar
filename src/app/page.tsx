import { SportsCalendar } from "@/components/calendar/sports-calendar";
import { getAllEvents } from "@/lib/events";

export default function Home() {
  return <SportsCalendar initialEvents={getAllEvents()} />;
}
