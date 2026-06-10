import cycling from "../../data/cycling.json";
import cpbl from "../../data/cpbl.json";
import f1 from "../../data/f1.json";
import mlb from "../../data/mlb.json";
import nba from "../../data/nba.json";
import npb from "../../data/npb.json";
import worldcup from "../../data/worldcup.json";
import type { SportsEvent } from "@/types/sports";

const events = [
  ...worldcup,
  ...nba,
  ...mlb,
  ...npb,
  ...cpbl,
  ...f1,
  ...cycling,
] as SportsEvent[];

export function getAllEvents() {
  return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
}
