#!/usr/bin/env node
// Unit self-test for lib/derive-state.mjs (seat K70ScribeWaveCensus).
// Hand-written cases only; asserts the dead/unknown discriminator, not any seat outcome.
import { deriveState } from "./lib/derive-state.mjs";

function seat(over = {}) {
  return {
    name: "CASE",
    dispatch: { declared: true, instance: null, source: "none" },
    settle: { status: "unknown", session: null, settled_at: null, error: null },
    result: { present: false, output_bytes: null, output_sha256: null, duplicate_of: null },
    report: { present: false, path: ".ufo/waves/round-70/w1/CASE.md", bytes: null, sha256: null },
    build: { present: false, file_count: null },
    trailer: { declared: null, resolves: null, matches_seat: null },
    state: "pending-collection",
    mismatches: [],
    ...over,
  };
}

const cases = [
  ["reconciled", seat({
    dispatch: { declared: true, instance: "C-1", source: "w1.ready.partial" },
    settle: { status: "settled", session: "s1", settled_at: "2026-10-30T00:00:00Z", error: null },
    result: { present: true, output_bytes: 120, output_sha256: "a".repeat(64), duplicate_of: null },
    report: { present: true, path: ".ufo/waves/round-70/w1/CASE.md", bytes: 10, sha256: "b".repeat(64) },
    trailer: { declared: ".ufo/waves/round-70/w1/CASE.md", resolves: true, matches_seat: true },
  }), "reconciled"],
  ["reconciled_no_trailer", seat({
    dispatch: { declared: true, instance: "C-1", source: "w1.ready.partial" },
    settle: { status: "settled", session: "s1", settled_at: null, error: null },
    result: { present: true, output_bytes: 120, output_sha256: "a".repeat(64), duplicate_of: null },
    report: { present: true, path: ".ufo/waves/round-70/w1/CASE.md", bytes: 10, sha256: "b".repeat(64) },
    trailer: { declared: null, resolves: null, matches_seat: null },
  }), "reconciled"],
  ["result_only", seat({
    settle: { status: "settled", session: "s1", settled_at: null, error: null },
    result: { present: true, output_bytes: 120, output_sha256: "a".repeat(64), duplicate_of: null },
  }), "partial_result_only"],
  ["result_only_trailer_bad", seat({
    settle: { status: "settled", session: "s1", settled_at: null, error: null },
    result: { present: true, output_bytes: 120, output_sha256: "a".repeat(64), duplicate_of: null },
    report: { present: true, path: ".ufo/waves/round-70/w1/CASE.md", bytes: 10, sha256: "b".repeat(64) },
    trailer: { declared: ".ufo/waves/round-70/w1/OTHER.md", resolves: true, matches_seat: false },
  }), "partial_result_only"],
  ["empty_output", seat({
    settle: { status: "settled", session: "s1", settled_at: null, error: null },
    result: { present: true, output_bytes: 0, output_sha256: null, duplicate_of: null },
  }), "empty_output"],
  ["report_only", seat({
    report: { present: true, path: ".ufo/waves/round-70/w1/CASE.md", bytes: 10, sha256: "b".repeat(64) },
  }), "partial_report_only"],
  ["error", seat({
    settle: { status: "error", session: "s1", settled_at: null, error: "boom" },
  }), "error"],
  ["dead_dispatch_evidence", seat({
    dispatch: { declared: true, instance: "C-7", source: "w1.ready.partial" },
  }), "dead"],
  ["dead_session_evidence", seat({
    settle: { status: "unsettled", session: "sess-9", settled_at: null, error: null },
  }), "dead"],
  ["unknown_no_evidence", seat(), "unknown"],
];

let fail = 0;
for (const [label, row, expected] of cases) {
  const got = deriveState(row);
  const ok = got === expected;
  if (!ok) fail++;
  console.log((ok ? "DERIVE70: ok   " : "DERIVE70: FAIL ") + label + "\texpected=" + expected + "\tgot=" + got);
}
// explicit discriminator assertion: identical rows except start evidence
const base = seat();
const withInstance = seat({ dispatch: { declared: true, instance: "C-1", source: "w1.ready.partial" } });
const dDead = deriveState(withInstance);
const dUnknown = deriveState(base);
const discOk = dDead === "dead" && dUnknown === "unknown";
if (!discOk) fail++;
console.log((discOk ? "DERIVE70: ok   " : "DERIVE70: FAIL ") + "dead_vs_unknown_discriminator\twith_instance=" + dDead + "\twithout_instance=" + dUnknown);
console.log("DERIVE70: " + (fail === 0 ? "PASS" : "FAIL") + " cases=" + cases.length + " failures=" + fail);
process.exit(fail === 0 ? 0 : 1);
