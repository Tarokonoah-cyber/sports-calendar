import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";

export function GET() {
  return NextResponse.json({ events: getAllEvents() });
}
