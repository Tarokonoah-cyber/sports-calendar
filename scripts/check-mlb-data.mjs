#!/usr/bin/env node
import fs from "node:fs";
const file = "data/mlb.json";
const events = JSON.parse(fs.readFileSync(file, "utf8"));
const dates = events.map((e) => e.startTime?.slice(0, 10)).filter(Boolean).sort();
console.log(`MLB games: ${events.length}`);
console.log(`First date: ${dates[0]}`);
console.log(`Last date: ${dates[dates.length - 1]}`);
console.log(`First 5:`);
for (const e of events.slice(0, 5)) console.log(`- ${e.startTime} ${e.title}`);
