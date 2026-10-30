#!/usr/bin/env node
// Builds a SYNTHETIC close-mode self-test fixture for the validator.
// It mechanically mirrors the CURRENT filesystem (mid-wave snapshot) and asserts NO seat
// outcome: every value is copied from bytes on disk, and seat states are the mechanical
// derivation of those bytes. It is NOT a reconciliation of a settled wave and must never
// be copied into .ufo/waves/round-70/close/.
// Usage: node make-selftest-fixture.mjs <LANE> <OUT_JSON>
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { deriveState, STATES } from "./lib/derive-state.mjs";

const lane = process.argv[2] || "/home/vgpnk/Projects/shokunin/kumitate-shokunin";
const out = process.argv[3] || path.join(lane, ".ufo/waves/round-70/build/K70ScribeWaveCensus/selftest/midwave-close-fixture.json");
const W = path.join(lane, ".ufo/waves/round-70");
const dispatch = JSON.parse(readFileSync(path.join(W, "w1-dispatch.json"), "utf8"));
let partial = {};
try { partial = JSON.parse(readFileSync(path.join(W, "w1.ready.partial"), "utf8")); } catch { /* optional */ }

// Lenient trailer extraction: sibling wave-1 reports use several forms
// ("Report: <path>", "**Report:** <path>", "- Report: <path>") and many use none at all.
// Every "Report:" marker in the file is collected so ambiguity is visible instead of silently lost.
function trailerMarkers(text) {
  const out = [];
  for (const m of text.matchAll(/Report:\s*\**\s*`?([^\s`*]+)/g)) out.push(m[1]);
  return out;
}

const seats = Object.entries(dispatch.registry.members).map(([name, m]) => {
  const reportAbs = path.join(W, "w1", name + ".md");
  const buildAbs = path.join(W, "build", name);
  const hasReport = existsSync(reportAbs);
  let reportBytes = null, reportSha = null, trailerDeclared = null, trailerResolves = null, trailerMatches = null, trailerParse = "not_applicable";
  if (hasReport) {
    const buf = readFileSync(reportAbs);
    reportBytes = buf.length;
    reportSha = createHash("sha256").update(buf).digest("hex");
    const markers = trailerMarkers(buf.toString("utf8"));
    trailerParse = markers.length === 0 ? "missing" : markers.length === 1 ? "ok" : "ambiguous_multiple";
    if (markers.length > 0) {
      trailerDeclared = markers[0];
      const abs = path.isAbsolute(trailerDeclared) ? trailerDeclared : path.join(lane, trailerDeclared);
      trailerResolves = existsSync(abs);
      trailerMatches = trailerDeclared === ".ufo/waves/round-70/w1/" + name + ".md";
    }
  }
  const buildExists = existsSync(buildAbs) && statSync(buildAbs).isDirectory();
  const buildFiles = buildExists ? readdirSync(buildAbs).length : null;
  const row = {
    name,
    role: m.role,
    milestone: m.milestone,
    axes: m.axes,
    dispatch: { declared: true, instance: partial[name] || null, source: partial[name] ? "w1.ready.partial" : "none" },
    settle: hasReport
      ? { status: "settled", session: null, settled_at: null, error: null }
      : { status: "unsettled", session: null, settled_at: null, error: null },
    result: hasReport
      ? { present: true, output_bytes: reportBytes, output_sha256: reportSha, duplicate_of: null }
      : { present: false, output_bytes: null, output_sha256: null, duplicate_of: null },
    report: { present: hasReport, path: ".ufo/waves/round-70/w1/" + name + ".md", bytes: reportBytes, sha256: reportSha },
    build: { present: buildExists, file_count: buildFiles },
    trailer: { declared: trailerDeclared, parse: trailerParse, resolves: trailerResolves, matches_seat: trailerMatches },
    state: "pending-collection",
    mismatches: trailerParse === "missing" ? ["TRAILER_MISSING"] : trailerParse === "ambiguous_multiple" ? ["TRAILER_AMBIGUOUS"] : [],
  };
  row.state = deriveState(row);
  return row;
});

const doc = {
  schema: "ufo-wave-reconciliation-v2",
  wave: "kumitate-r70-w1",
  round: 70,
  observed_at: new Date().toISOString(),
  notes: [
    "SYNTHETIC SELF-TEST FIXTURE — mechanically mirrored from a mid-wave filesystem snapshot.",
    "It asserts no seat outcome: every field is copied from bytes on disk and states are the mechanical derivation of those bytes.",
    "NOT a reconciliation of a settled wave; must not be copied into .ufo/waves/round-70/close/.",
  ],
  evidence_sources: {
    dispatch: ".ufo/waves/round-70/w1-dispatch.json",
    ready_partial: ".ufo/waves/round-70/w1.ready.partial",
    results: "SYNTHETIC — no results collection exists yet",
    report_dir: ".ufo/waves/round-70/w1",
    build_root: ".ufo/waves/round-70/build",
    observed_rev: null,
  },
  declared_seats: seats.length,
  seats,
  state_counts: Object.fromEntries(STATES.map((s) => [s, seats.filter((x) => x.state === s).length])),
  role_counts: seats.reduce((a, s) => ((a[s.role] = (a[s.role] || 0) + 1), a), {}),
  settled: seats.filter((s) => s.result.present).length,
  settled_nonempty: seats.filter((s) => s.settle.status === "settled" && s.result.present && s.result.output_bytes > 0).length,
  reports_present: seats.filter((s) => s.report.present).length,
  missing_reports: seats.filter((s) => !s.report.present).map((s) => s.name),
  empty_outputs: seats.filter((s) => s.result.present && s.result.output_bytes === 0).map((s) => s.name),
  dead_seats: seats.filter((s) => s.state === "dead").map((s) => ({ name: s.name, instance: s.dispatch.instance, settle_status: s.settle.status, subreason: s.settle.session ? "no_settle_record" : "no_settle_record" })),
  unknown_seats: seats.filter((s) => s.state === "unknown").map((s) => ({ name: s.name, reason: s.dispatch.instance ? "ambiguous_partial" : "no_dispatch_no_output" })),
  handoff: "SYNTHETIC FIXTURE — no handoff exists",
};

writeFileSync(out, JSON.stringify(doc, null, 1) + "\n");
console.log("wrote " + out);
console.log("state_counts=" + JSON.stringify(doc.state_counts));
console.log("reports_present=" + doc.reports_present + " settled=" + doc.settled + " missing_reports=" + doc.missing_reports.length);
