export const ALERT_SINCE = "2026-08-20T00:00:00+05:45";

const SOURCE_LABEL: Record<string, string> = {
  dhm: "DHM — Hydrology & Meteorology",
  dor: "Department of Roads",
  nepal_police: "Nepal Police",
  nsc: "National Seismological Centre",
};

const ALERT_KEEP = /flood|road closed|landslide|heavy rain|bridge/i;

export type OfficialAlert = {
  id: number;
  title: string;
  startedOn: string;
  source: string;
  sourceLabel: string;
};

export type BipadAlert = {
  id?: number;
  title?: string;
  startedOn?: string;
  source?: string;
  hazard?: number | null;
};

export function selectAlerts(raw: BipadAlert[]): OfficialAlert[] {
  const latestByTitle = new Map<string, OfficialAlert>();
  for (const row of raw) {
    const title = (row.title ?? "").trim();
    const startedOn = row.startedOn ?? "";
    if (!title || startedOn < ALERT_SINCE) continue;
    if (!ALERT_KEEP.test(title)) continue;
    const id = typeof row.id === "number" ? row.id : 0;
    const source = (row.source ?? "").toLowerCase();
    const next: OfficialAlert = {
      id,
      title,
      startedOn,
      source,
      sourceLabel: SOURCE_LABEL[source] ?? "Government of Nepal",
    };
    const prev = latestByTitle.get(title);
    if (!prev || startedOn > prev.startedOn) latestByTitle.set(title, next);
  }
  return [...latestByTitle.values()]
    .sort((a, b) => (a.startedOn < b.startedOn ? 1 : -1))
    .slice(0, 8);
}
