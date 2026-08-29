import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectAlerts } from "./official-alerts.ts";

describe("selectAlerts", () => {
  it("keeps the latest unique flood and road alerts after 20 Aug 2026", () => {
    const alerts = selectAlerts([
      {
        id: 1,
        title: "Flood warning at Uttargaya-5, Rasuwa",
        startedOn: "2026-08-21T03:20:00+05:45",
        source: "dhm",
      },
      {
        id: 2,
        title: "Flood warning at Uttargaya-5, Rasuwa",
        startedOn: "2026-08-25T21:10:00+05:45",
        source: "dhm",
      },
      {
        id: 3,
        title: "Forest Fire at Uttargaya-1, Rasuwa",
        startedOn: "2026-08-26T10:00:00+05:45",
        source: "icimod",
      },
      {
        id: 4,
        title: "Road closed in Gosaikunda-5, Rasuwa",
        startedOn: "2026-08-26T11:30:00+05:45",
        source: "dor",
      },
      {
        id: 5,
        title: "Flood warning at old site",
        startedOn: "2026-07-01T00:00:00+05:45",
        source: "dhm",
      },
    ]);
    assert.equal(alerts.length, 2);
    assert.equal(alerts[0]?.title, "Road closed in Gosaikunda-5, Rasuwa");
    assert.equal(alerts[0]?.sourceLabel, "Department of Roads");
    assert.equal(alerts[1]?.startedOn, "2026-08-25T21:10:00+05:45");
  });
});
