#!/usr/bin/env node
/**
 * Starter updater for official schedule pages.
 * Run manually or in CI, then review generated JSON before commit.
 *
 * npm i cheerio
 * node scripts/update-schedules.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";

const officialSources = {
  cpbl: "https://www.cpbl.com.tw/schedule",
  npb: "https://npb.jp/eng/",
  f1: "https://www.formula1.com/en/racing/2026",
  fifa: "https://www.fifa.com/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums",
  mlb: "https://www.mlb.com/schedule/2026-03-25",
  tourdefrance: "https://www.letour.fr/en/overall-route",
};

async function assertReachable(name, url) {
  const res = await fetch(url, { headers: { "user-agent": "sports-calendar-updater/1.0" } });
  if (!res.ok) throw new Error(`${name} source returned ${res.status}: ${url}`);
  return res.text();
}

async function main() {
  await fs.mkdir(path.join(process.cwd(), "data", "_source-cache"), { recursive: true });
  for (const [name, url] of Object.entries(officialSources)) {
    const html = await assertReachable(name, url);
    await fs.writeFile(path.join(process.cwd(), "data", "_source-cache", `${name}.html`), html, "utf8");
    console.log(`Cached ${name}: ${url}`);
  }
  console.log("官方頁面已快取。下一步請針對各站 HTML 結構撰寫 parser，避免手動複製造成錯誤。");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
