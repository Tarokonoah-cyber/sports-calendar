import fs from "node:fs/promises";

const events = JSON.parse(await fs.readFile("data/nba.json", "utf8"));
const finals = events.filter((event) => event.tags?.includes("總冠軍賽") || event.title?.includes("總冠軍賽"));
console.log(`NBA events: ${events.length}`);
console.log(`First: ${events[0]?.startTime} ${events[0]?.title}`);
console.log(`Last:  ${events.at(-1)?.startTime} ${events.at(-1)?.title}`);
console.log(`Finals: ${finals.length}`);
for (const event of finals) console.log(`${event.startTime} ${event.title}`);
if (events.length < 500) {
  console.error("Too few NBA events. Schedule probably did not import correctly.");
  process.exit(1);
}
if (!finals.length) {
  console.error("No NBA Finals events found. Trophy labels were not generated.");
  process.exit(1);
}
