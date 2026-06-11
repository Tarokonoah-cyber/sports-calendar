import fs from "node:fs/promises";

const events = JSON.parse(await fs.readFile("data/nba.json", "utf8"));
const finals = events.filter((event) => event.tags?.includes("NBA 總冠軍賽") || event.title?.includes("總冠軍賽"));
const byMonth = events.reduce((acc, event) => {
  const month = event.startTime.slice(0, 7);
  acc[month] = (acc[month] || 0) + 1;
  return acc;
}, {});

console.log(`NBA events: ${events.length}`);
console.log(`First: ${events[0]?.startTime}`);
console.log(`Last:  ${events.at(-1)?.startTime}`);
console.log(`Finals events: ${finals.length}`);
console.table(byMonth);
if (!events.length) process.exit(1);
if (!finals.length) {
  console.error("No NBA Finals events found. Check data source or date range.");
  process.exit(1);
}
