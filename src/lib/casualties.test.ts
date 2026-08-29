import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  POLICE_SNAPSHOT,
  mergeCasualties,
  parseBulletinSummary,
  sumBipadFloodLoss,
} from "./casualties.ts";

describe("sumBipadFloodLoss", () => {
  it("sums flood losses in the affected corridor after 26 Aug and ignores other hazards", () => {
    const sum = sumBipadFloodLoss([
      {
        title: "Flood at Gajuri Rural Municipality-7",
        incidentOn: "2026-08-26T00:00:00+05:45",
        hazard: 11,
        loss: { peopleDeathCount: 2, peopleMissingCount: 10, peopleInjuredCount: 3 },
      },
      {
        title: "Snake Bite at Belbari Municipality-8",
        incidentOn: "2026-08-26T00:00:00+05:45",
        hazard: 20,
        loss: { peopleDeathCount: 1, peopleMissingCount: 0, peopleInjuredCount: 1 },
      },
      {
        title: "Flood at old site",
        incidentOn: "2025-07-01T00:00:00+05:45",
        hazard: 11,
        loss: { peopleDeathCount: 40, peopleMissingCount: 0, peopleInjuredCount: 0 },
      },
    ]);
    assert.deepEqual(sum, { dead: 2, missing: 10, injured: 3 });
  });
});

describe("parseBulletinSummary", () => {
  it("reads NDRRMA-style flood figures and ignores unrelated daily bulletins", () => {
    const hit = parseBulletinSummary(
      "Rasuwa flash flood: the death toll has reached 400. 950 people are missing and 80 people have been injured.",
    );
    assert.deepEqual(hit, { dead: 400, missing: 950, injured: 80 });
    const miss = parseBulletinSummary(
      "Over the past 24 hours, 29 disaster-related incidents have been reported, including snakebites, landslides, fires, floods. Eleven have been injured.",
    );
    assert.deepEqual(miss, {});
  });
});

describe("mergeCasualties", () => {
  it("never drops below the police snapshot and takes higher live official counts", () => {
    const merged = mergeCasualties(POLICE_SNAPSHOT, [
      {
        counts: { dead: 4, missing: 1, injured: 47 },
        source: "BIPAD Portal",
        asOf: "2026-08-27T12:00:00+05:45",
      },
      {
        counts: { dead: 600, missing: 1100, injured: 90 },
        source: "NDRRMA",
        asOf: "2026-08-29T08:00:00+05:45",
      },
    ]);
    assert.equal(merged.dead, 600);
    assert.equal(merged.missing, 1100);
    assert.equal(merged.injured, 90);
    assert.equal(merged.source, "NDRRMA");
    assert.equal(merged.live, true);
  });
});
