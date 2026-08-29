#!/usr/bin/env node
/**
 * Refresh the hardcoded Nepal Police / NDRRMA casualty snapshot.
 * Never lowers a count. Exits 0 with no file writes if nothing is higher.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CASUALTIES_PATH = join(ROOT, "src/lib/casualties.ts");
const RELIEF_PATH = join(ROOT, "src/data/relief.ts");
const FETCH_MS = 12_000;
const UA = "StandWithNepal/1.0 (flood-relief awareness; snapshot-refresh)";

const BIPAD_INCIDENT =
  "https://bipadportal.gov.np/api/v1/incident/?date_from=2026-08-26&expand=loss&limit=200&ordering=-id";
const NDRRMA_BULLETINS =
  "https://ndrrma.gov.np/api/v1/bulletin/bulletins/?ordering=-id&limit=8";
const IFRC_EVENT = "https://goadmin.ifrc.org/api/v2/event/8073/";
const WIKI =
  "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Nepal_floods&prop=wikitext&format=json";

const FLOOD_HINT =
  /rasuwa|nuwakot|dhading|chitwan|gorkha|tanahun|nawalparasi|nawalpur|trishuli|bhotekoshi|bhotekosi|timure|syabru|devighat|gajuri|gosaikunda|uttargaya|flash flood|बाढी/i;
const FLOOD_HAZARDS = new Set([11, 14, 17, 26, 28]);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function comma(n) {
  return Number(n).toLocaleString("en-US");
}

function nptParts(ms = Date.now()) {
  const d = new Date(ms + (5 * 60 + 45) * 60 * 1000);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    h: d.getUTCHours(),
    min: d.getUTCMinutes(),
  };
}

function nptIso(ms = Date.now()) {
  const p = nptParts(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${p.y}-${pad(p.m)}-${pad(p.day)}T${pad(p.h)}:${pad(p.min)}:00+05:45`;
}

function formatDay(ms = Date.now()) {
  const p = nptParts(ms);
  return `${p.day} ${MONTHS[p.m - 1]} ${p.y}`;
}

function formatFiguresAsOf(ms = Date.now()) {
  const p = nptParts(ms);
  const hour12 = p.h % 12 || 12;
  const ampm = p.h < 12 ? "a.m." : "p.m.";
  return `${p.day} ${MONTHS[p.m - 1]} ${p.y}, ${hour12}:${String(p.min).padStart(2, "0")} ${ampm} NPT`;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function sumBipadFloodLoss(rows) {
  const out = { dead: 0, missing: 0, injured: 0 };
  for (const row of rows) {
    const title = row.title ?? "";
    const on = row.incidentOn ?? "";
    if (on && on < "2026-08-26") continue;
    const haz = typeof row.hazard === "number" ? row.hazard : null;
    const relevant =
      (haz !== null && FLOOD_HAZARDS.has(haz)) || FLOOD_HINT.test(title);
    if (!relevant) continue;
    const loss = row.loss;
    if (!loss || typeof loss !== "object") continue;
    out.dead += Number(loss.peopleDeathCount) || 0;
    out.missing += Number(loss.peopleMissingCount) || 0;
    out.injured += Number(loss.peopleInjuredCount) || 0;
  }
  return out;
}

function parseBulletinSummary(text) {
  if (!FLOOD_HINT.test(text)) return {};
  const out = {};
  const dead = text.match(
    /(\d{2,4})\s+(?:people\s+)?(?:have been\s+)?(?:killed|confirmed dead|dead|deaths)|death toll(?:\s+\w+){0,6}\s+(\d{2,4})/i,
  );
  const missing = text.match(
    /(\d{1,4}(?:,\d{3})*|\d{2,4})\s+(?:people\s+)?(?:are\s+)?(?:still\s+)?missing/i,
  );
  const injured = text.match(
    /(\d{2,4})\s+(?:people\s+)?(?:have been\s+)?injured/i,
  );
  const d = Number(String(dead?.[1] || dead?.[2] || "").replace(/,/g, ""));
  const m = Number(String(missing?.[1] || "").replace(/,/g, ""));
  const i = Number(injured?.[1]);
  if (d >= 20 && d <= 10000) out.dead = d;
  if (m >= 20 && m <= 50000) out.missing = m;
  if (i >= 10 && i <= 20000) out.injured = i;
  return out;
}

function parseWikiNepal(wikitext) {
  const out = {};
  const dead = wikitext.match(
    /deaths\s*=[\s\S]{0,280}?(\d{2,4})\+?\s+in Nepal/i,
  );
  const missing = wikitext.match(
    /missing\s*=[\s\S]{0,280}?([\d,]{3,6})\+?\s+in Nepal/i,
  );
  // Injured on Wikipedia has jumped around vs the police table; skip it here.
  const d = Number(dead?.[1]);
  const m = Number(String(missing?.[1] || "").replace(/,/g, ""));
  if (d >= 20 && d <= 10000) out.dead = d;
  if (m >= 20 && m <= 50000) out.missing = m;
  return out;
}

function ifrcCandidate(event) {
  const reports = Array.isArray(event.field_reports) ? event.field_reports : [];
  let dead = 0;
  let missing = 0;
  let injured = 0;
  let asOf =
    typeof event.updated_at === "string"
      ? event.updated_at
      : new Date().toISOString();
  for (const raw of reports) {
    if (!raw || typeof raw !== "object") continue;
    dead = Math.max(dead, Number(raw.gov_num_dead) || Number(raw.num_dead) || 0);
    missing = Math.max(
      missing,
      Number(raw.gov_num_missing) || Number(raw.num_missing) || 0,
    );
    injured = Math.max(
      injured,
      Number(raw.gov_num_injured) || Number(raw.num_injured) || 0,
    );
    if (typeof raw.updated_at === "string") asOf = raw.updated_at;
  }
  if (!dead && !missing && !injured) return null;
  return {
    counts: {
      dead: dead || undefined,
      missing: missing || undefined,
      injured: injured || undefined,
    },
    source: "IFRC / Nepal Red Cross",
    asOf,
  };
}

function readSnapshot(src) {
  const m = src.match(
    /export const POLICE_SNAPSHOT: CasualtySnapshot = \{([\s\S]*?)\};/,
  );
  if (!m) throw new Error("POLICE_SNAPSHOT not found");
  const block = m[1];
  const num = (k) => Number(block.match(new RegExp(k + ":\\s*(\\d+)"))[1]);
  const source = block.match(/source:\s*"([^"]+)"/)[1];
  const asOf = block.match(/asOf:\s*"([^"]+)"/)[1];
  return {
    dead: num("dead"),
    missing: num("missing"),
    injured: num("injured"),
    source,
    asOf,
    live: false,
  };
}

function merge(snapshot, candidates) {
  const result = { ...snapshot };
  for (const c of candidates) {
    const d = c.counts.dead;
    const m = c.counts.missing;
    const i = c.counts.injured;
    let used = false;
    if (typeof d === "number" && d > result.dead) {
      result.dead = d;
      used = true;
    }
    if (typeof m === "number" && m > result.missing) {
      result.missing = m;
      used = true;
    }
    if (typeof i === "number" && i > result.injured) {
      result.injured = i;
      used = true;
    }
    if (used) {
      result.source = c.source;
      result.asOf = c.asOf;
    }
  }
  return result;
}

function patchCasualties(src, snap) {
  return src.replace(
    /export const POLICE_SNAPSHOT: CasualtySnapshot = \{[\s\S]*?\};/,
    `export const POLICE_SNAPSHOT: CasualtySnapshot = {
  dead: ${snap.dead},
  missing: ${snap.missing},
  injured: ${snap.injured},
  source: ${JSON.stringify(snap.source)},
  asOf: ${JSON.stringify(snap.asOf)},
  live: false,
};`,
  );
}

function patchRelief(src, snap) {
  let out = src;
  const day = formatDay();
  const asOf = formatFiguresAsOf();
  out = out.replace(
    /export const UPDATED_ON = "[^"]+";/,
    `export const UPDATED_ON = "${day}";`,
  );
  out = out.replace(
    /export const FIGURES_AS_OF = "[^"]+";/,
    `export const FIGURES_AS_OF = "${asOf}";`,
  );
  out = out.replace(
    /export const FIGURES_SOURCE = "[^"]+";/,
    `export const FIGURES_SOURCE = ${JSON.stringify(snap.source)};`,
  );
  out = out.replace(
    /export const FIGURES_NOTE =\n {2}"[^"]+";/,
    `export const FIGURES_NOTE =\n  "Latest snapshot ${asOf}. Confirmed dead ${comma(snap.dead)}, missing ${comma(snap.missing)}, injured ${comma(snap.injured)}. Numbers are still changing.";`,
  );
  out = out.replace(
    /export const SHARE_TEXT =\n {2}"[\s\S]*?https:\/\/pmdrf\.nchl\.com\.np\/";/,
    `export const SHARE_TEXT =\n  "Catastrophic flash floods hit Nepal’s Himalayas on 26 August. Official figures: ${comma(snap.dead)} deaths, with ${comma(snap.missing)} people still missing. Donate only through the official Government of Nepal Prime Minister’s Disaster Relief Fund:\\nhttps://pmdrf.nchl.com.np/";`,
  );
  out = out.replace(
    /export const stats = \[[\s\S]*?\] as const;/,
    `export const stats = [
  { value: "${comma(snap.dead)}", label: "Confirmed dead" },
  { value: "${comma(snap.missing)}", label: "Missing" },
  { value: "${comma(snap.injured)}", label: "Injured" },
  { value: "14", label: "Hydropower plants damaged" },
] as const;`,
  );
  return out;
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const casSrc = readFileSync(CASUALTIES_PATH, "utf8");
  const relSrc = readFileSync(RELIEF_PATH, "utf8");
  const snapshot = readSnapshot(casSrc);
  const candidates = [];

  const settled = await Promise.allSettled([
    fetchJson(BIPAD_INCIDENT),
    fetchJson(NDRRMA_BULLETINS),
    fetchJson(IFRC_EVENT),
    fetchJson(WIKI),
  ]);

  if (settled[0].status === "fulfilled") {
    const rows = settled[0].value?.results;
    if (Array.isArray(rows)) {
      const sum = sumBipadFloodLoss(rows);
      if (sum.dead || sum.missing || sum.injured) {
        candidates.push({
          counts: sum,
          source: "BIPAD Portal (NDRRMA)",
          asOf: nptIso(),
        });
      }
    }
  } else {
    console.warn("BIPAD failed:", settled[0].reason?.message || settled[0].reason);
  }

  if (settled[1].status === "fulfilled") {
    const rows = settled[1].value?.results;
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (!row || typeof row !== "object") continue;
        const text = [row.title, row.summary, row.description]
          .filter((x) => typeof x === "string")
          .join(". ");
        const parsed = parseBulletinSummary(text);
        if (parsed.dead || parsed.missing || parsed.injured) {
          candidates.push({
            counts: parsed,
            source: "NDRRMA bulletin",
            asOf:
              typeof row.date === "string"
                ? `${row.date}T08:00:00+05:45`
                : nptIso(),
          });
          break;
        }
      }
    }
  } else {
    console.warn("NDRRMA failed:", settled[1].reason?.message || settled[1].reason);
  }

  if (settled[2].status === "fulfilled" && settled[2].value) {
    const cand = ifrcCandidate(settled[2].value);
    if (cand) candidates.push(cand);
  } else if (settled[2].status === "rejected") {
    console.warn("IFRC failed:", settled[2].reason?.message || settled[2].reason);
  }

  if (settled[3].status === "fulfilled") {
    const wt = settled[3].value?.parse?.wikitext?.["*"] || "";
    const parsed = parseWikiNepal(wt);
    if (parsed.dead || parsed.missing) {
      candidates.push({
        counts: parsed,
        source: "Nepal Police / NDRRMA",
        asOf: nptIso(),
      });
    }
  } else {
    console.warn("Wikipedia failed:", settled[3].reason?.message || settled[3].reason);
  }

  const merged = merge(snapshot, candidates);
  const changed =
    merged.dead !== snapshot.dead ||
    merged.missing !== snapshot.missing ||
    merged.injured !== snapshot.injured;

  console.log(
    JSON.stringify(
      { current: snapshot, merged, candidates, changed },
      null,
      2,
    ),
  );

  if (!changed) {
    console.log("No higher official counts — leaving snapshot unchanged.");
    return;
  }

  if (dry) {
    console.log("Dry run — not writing files.");
    return;
  }

  writeFileSync(CASUALTIES_PATH, patchCasualties(casSrc, merged));
  writeFileSync(RELIEF_PATH, patchRelief(relSrc, merged));
  console.log("Updated src/lib/casualties.ts and src/data/relief.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
