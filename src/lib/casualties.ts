export type CasualtyCounts = {
  dead: number;
  missing: number;
  injured: number;
};

export type CasualtySnapshot = CasualtyCounts & {
  source: string;
  asOf: string;
  live: boolean;
};

export const POLICE_SNAPSHOT: CasualtySnapshot = {
  dead: 1050,
  missing: 4247,
  injured: 1473,
  source: "NDRRMA / Nepal Police via Wikipedia (Nepal-only)",
  asOf: "2026-09-01T21:36:00+05:45",
  live: false,
};

const FLOOD_HINT =
  /rasuwa|nuwakot|dhading|chitwan|gorkha|tanahun|nawalparasi|nawalpur|trishuli|bhotekoshi|bhotekosi|timure|syabru|devighat|gajuri|gosaikunda|uttargaya|flash flood|बाढी/i;

const FLOOD_HAZARDS = new Set([11, 14, 17, 26, 28]);

export type BipadIncidentLoss = {
  title?: string;
  incidentOn?: string;
  hazard?: number | null;
  loss?: {
    peopleDeathCount?: number | null;
    peopleMissingCount?: number | null;
    peopleInjuredCount?: number | null;
  } | number | null;
};

export function sumBipadFloodLoss(rows: BipadIncidentLoss[]): CasualtyCounts {
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

export function parseBulletinSummary(text: string): Partial<CasualtyCounts> {
  if (!FLOOD_HINT.test(text)) return {};
  const out: Partial<CasualtyCounts> = {};
  const dead = text.match(
    /(\d{2,4})\s+(?:people\s+)?(?:have been\s+)?(?:killed|confirmed dead|dead|deaths)|death toll(?:\s+\w+){0,4}\s+(\d{2,4})/i,
  );
  const missing = text.match(
    /(\d{2,4})\s+(?:people\s+)?(?:are\s+)?(?:still\s+)?missing/i,
  );
  const injured = text.match(
    /(\d{2,4})\s+(?:people\s+)?(?:have been\s+)?injured/i,
  );
  const d = Number(dead?.[1] || dead?.[2]);
  const m = Number(missing?.[1]);
  const i = Number(injured?.[1]);
  if (d >= 20) out.dead = d;
  if (m >= 20) out.missing = m;
  if (i >= 10) out.injured = i;
  return out;
}

export type LiveCandidate = {
  counts: Partial<CasualtyCounts>;
  source: string;
  asOf: string;
};

export function mergeCasualties(
  snapshot: CasualtySnapshot,
  candidates: LiveCandidate[],
): CasualtySnapshot {
  const result: CasualtySnapshot = { ...snapshot };
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
      result.live = true;
    }
  }
  return result;
}
