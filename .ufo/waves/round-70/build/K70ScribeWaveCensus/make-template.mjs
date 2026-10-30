#!/usr/bin/env node
// Regenerates wave-reconciliation.template.json (64 rows) from the frozen dispatch file.
// Placeholders only: every seat state is pending-collection; dispatch.instance is the
// dispatch-time fact copied from w1.ready.partial. Asserts no seat outcome.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const lane = process.argv[2] || "/home/vgpnk/Projects/shokunin/kumitate-shokunin";
const out = process.argv[3] || path.join(lane, ".ufo/waves/round-70/build/K70ScribeWaveCensus/wave-reconciliation.template.json");
const W = path.join(lane, ".ufo/waves/round-70");
const dispatch = JSON.parse(readFileSync(path.join(W, "w1-dispatch.json"), "utf8"));
let partial = {};
try { partial = JSON.parse(readFileSync(path.join(W, "w1.ready.partial"), "utf8")); } catch { /* dispatch evidence may be absent */ }

const STATES = ["pending-collection", "reconciled", "partial_result_only", "partial_report_only", "empty_output", "error", "dead", "unknown"];

const seats = Object.entries(dispatch.registry.members).map(([name, m]) => ({
  name,
  role: m.role,
  milestone: m.milestone,
  axes: m.axes,
  dispatch: { declared: true, instance: partial[name] || null, source: partial[name] ? "w1.ready.partial" : "none" },
  settle: { status: "unknown", session: null, settled_at: null, error: null },
  result: { present: false, output_bytes: null, output_sha256: null, duplicate_of: null },
  report: { present: false, path: ".ufo/waves/round-70/w1/" + name + ".md", bytes: null, sha256: null },
  build: { present: false, file_count: null },
  trailer: { declared: null, parse: "not_applicable", resolves: null, matches_seat: null },
  state: "pending-collection",
  mismatches: [],
}));

const doc = {
  schema: "ufo-wave-reconciliation-v2",
  wave: "kumitate-r70-w1",
  round: 70,
  observed_at: new Date().toISOString(),
  notes: [
    "TEMPLATE — placeholder values, NOT observations. Every seat state is pending-collection.",
    "Fill settle/result/report/build/trailer at close from the results collection and the filesystem, then re-derive states with lib/derive-state.mjs.",
    "dispatch.instance is prefilled from w1.ready.partial as of generation time; it is the only pre-observed field and it is dispatch-time fact, not a seat outcome.",
  ],
  evidence_sources: {
    dispatch: ".ufo/waves/round-70/w1-dispatch.json",
    ready_partial: ".ufo/waves/round-70/w1.ready.partial",
    results: ".ufo/waves/round-70/w1-results.json (written at close)",
    report_dir: ".ufo/waves/round-70/w1",
    build_root: ".ufo/waves/round-70/build",
    observed_rev: null,
  },
  declared_seats: seats.length,
  seats,
  state_counts: Object.fromEntries(STATES.map((s) => [s, s === "pending-collection" ? seats.length : 0])),
  role_counts: seats.reduce((a, s) => ((a[s.role] = (a[s.role] || 0) + 1), a), {}),
  settled: 0,
  settled_nonempty: 0,
  reports_present: 0,
  missing_reports: seats.map((s) => s.name),
  empty_outputs: [],
  dead_seats: [],
  unknown_seats: [],
  handoff: "TEMPLATE — replace with the Main WAVE-DONE handoff line at close",
};

writeFileSync(out, JSON.stringify(doc, null, 1) + "\n");
console.log("wrote " + out + " seats=" + seats.length + " with_instance=" + seats.filter((s) => s.dispatch.instance).length);
