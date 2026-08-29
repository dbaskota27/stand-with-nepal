import { createServerFn } from "@tanstack/react-start";
import {
  POLICE_SNAPSHOT,
  mergeCasualties,
  parseBulletinSummary,
  sumBipadFloodLoss,
  type CasualtySnapshot,
  type LiveCandidate,
} from "@/lib/casualties";
import {
  selectAlerts,
  type BipadAlert,
  type OfficialAlert,
} from "@/lib/official-alerts";

export type { OfficialAlert, CasualtySnapshot };

const BIPAD_ALERT = "https://bipadportal.gov.np/api/v1/alert/";
const BIPAD_INCIDENT =
  "https://bipadportal.gov.np/api/v1/incident/?date_from=2026-08-26&expand=loss&limit=100&ordering=-id";
const NDRRMA_BULLETINS =
  "https://ndrrma.gov.np/api/v1/bulletin/bulletins/?ordering=-id&limit=6";
const IFRC_EVENT = "https://goadmin.ifrc.org/api/v2/event/8073/";
const WIKI_PAGE =
  "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Nepal_floods&prop=wikitext&format=json";
const CACHE_MS = 10 * 60 * 1000;
const FETCH_MS = 8000;

const SEARCHES = [
  "Rasuwa",
  "Uttargaya",
  "Gosaikunda",
  "Gajuri",
  "Nuwakot",
  "Dhading",
  "Chitwan",
];

export type OfficialBrief = {
  fetchedAt: string;
  live: boolean;
  alerts: OfficialAlert[];
  ifrcUpdatedAt: string | null;
  casualties: CasualtySnapshot;
};

export const FALLBACK_BRIEF: OfficialBrief = {
  fetchedAt: new Date().toISOString(),
  live: false,
  alerts: [],
  ifrcUpdatedAt: null,
  casualties: POLICE_SNAPSHOT,
};

type CacheBox = { at: number; data: OfficialBrief };
let cache: CacheBox | null = null;

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "StandWithNepal/1.0 (flood-relief awareness)",
    },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchAlertsFor(query: string): Promise<BipadAlert[]> {
  const url = `${BIPAD_ALERT}?search=${encodeURIComponent(query)}&limit=40`;
  const data = (await fetchJson(url)) as { results?: BipadAlert[] };
  return Array.isArray(data.results) ? data.results : [];
}

function ifrcCandidate(event: Record<string, unknown>): LiveCandidate | null {
  const reports = Array.isArray(event.field_reports) ? event.field_reports : [];
  let dead = 0;
  let missing = 0;
  let injured = 0;
  let asOf =
    typeof event.updated_at === "string" ? event.updated_at : new Date().toISOString();
  for (const raw of reports) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    dead = Math.max(dead, Number(r.gov_num_dead) || Number(r.num_dead) || 0);
    missing = Math.max(
      missing,
      Number(r.gov_num_missing) || Number(r.num_missing) || 0,
    );
    injured = Math.max(
      injured,
      Number(r.gov_num_injured) || Number(r.num_injured) || 0,
    );
    if (typeof r.updated_at === "string") asOf = r.updated_at;
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


function parseWikiNepal(wikitext: string): Partial<CasualtySnapshot> {
  const out: Partial<CasualtySnapshot> = {};
  const dead = wikitext.match(
    /deaths\s*=[\s\S]{0,280}?(\d{2,4})\+?\s+in Nepal/i,
  );
  const missing = wikitext.match(
    /missing\s*=[\s\S]{0,280}?([\d,]{3,6})\+?\s+in Nepal/i,
  );
  const d = Number(dead?.[1]);
  const m = Number(String(missing?.[1] || "").replace(/,/g, ""));
  if (d >= 20 && d <= 10000) out.dead = d;
  if (m >= 20 && m <= 50000) out.missing = m;
  return out;
}

async function loadOfficialBrief(): Promise<OfficialBrief> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return cache.data;

  const candidates: LiveCandidate[] = [];
  let live = false;
  let ifrcUpdatedAt: string | null = null;
  const raw: BipadAlert[] = [];

  const [alertSettled, bipadInc, ndrrma, ifrc, wiki] = await Promise.allSettled([
    Promise.allSettled(SEARCHES.map((q) => fetchAlertsFor(q))),
    fetchJson(BIPAD_INCIDENT),
    fetchJson(NDRRMA_BULLETINS),
    fetchJson(IFRC_EVENT),
    fetchJson(WIKI_PAGE),
  ]);

  if (alertSettled.status === "fulfilled") {
    for (const item of alertSettled.value) {
      if (item.status === "fulfilled") {
        live = true;
        raw.push(...item.value);
      }
    }
  }
  const alerts = selectAlerts(raw);

  if (bipadInc.status === "fulfilled") {
    live = true;
    const rows = (bipadInc.value as { results?: unknown }).results;
    if (Array.isArray(rows)) {
      const sum = sumBipadFloodLoss(rows);
      if (sum.dead || sum.missing || sum.injured) {
        candidates.push({
          counts: sum,
          source: "BIPAD Portal (NDRRMA)",
          asOf: new Date().toISOString(),
        });
      }
    }
  }

  if (ndrrma.status === "fulfilled") {
    live = true;
    const rows = (ndrrma.value as { results?: unknown }).results;
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (!row || typeof row !== "object") continue;
        const r = row as Record<string, unknown>;
        const text = [r.title, r.summary, r.description]
          .filter((x) => typeof x === "string")
          .join(". ");
        const parsed = parseBulletinSummary(text);
        if (parsed.dead || parsed.missing || parsed.injured) {
          candidates.push({
            counts: parsed,
            source: "NDRRMA bulletin",
            asOf:
              typeof r.date === "string"
                ? `${r.date}T08:00:00+05:45`
                : new Date().toISOString(),
          });
          break;
        }
      }
    }
  }

  if (ifrc.status === "fulfilled" && ifrc.value && typeof ifrc.value === "object") {
    live = true;
    const event = ifrc.value as Record<string, unknown>;
    if (typeof event.updated_at === "string") ifrcUpdatedAt = event.updated_at;
    const cand = ifrcCandidate(event);
    if (cand) candidates.push(cand);
  }

  if (wiki.status === "fulfilled" && wiki.value && typeof wiki.value === "object") {
    const wt =
      (wiki.value as { parse?: { wikitext?: { "*": string } } }).parse?.wikitext?.[
        "*"
      ] || "";
    const parsed = parseWikiNepal(wt);
    if (parsed.dead || parsed.missing) {
      live = true;
      candidates.push({
        counts: parsed,
        source: "Nepal Police / NDRRMA",
        asOf: new Date().toISOString(),
      });
    }
  }

  const casualties = mergeCasualties(POLICE_SNAPSHOT, candidates);

  const data: OfficialBrief = {
    fetchedAt: new Date().toISOString(),
    live,
    alerts,
    ifrcUpdatedAt,
    casualties,
  };
  cache = { at: now, data };
  return data;
}

export const getOfficialBrief = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      return await loadOfficialBrief();
    } catch {
      return { ...FALLBACK_BRIEF, fetchedAt: new Date().toISOString() };
    }
  },
);
