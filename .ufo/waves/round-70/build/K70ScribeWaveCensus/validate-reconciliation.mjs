#!/usr/bin/env node
// Round-70 wave reconciliation validator (v2 schema, seat K70ScribeWaveCensus).
// Read-only. Modes:
//   --mode template : structure-only checks (placeholders allowed, state must be pending-collection)
//   --mode derive   : print the derived state per seat from the recorded signals (writes nothing)
//   --mode close    : full checks incl. filesystem cross-check and derived-state agreement
// Usage:
//   node validate-reconciliation.mjs --lane <LANE_DIR> --file <RECONCILIATION_JSON> [--mode template|derive|close]
//
// Exit codes: 0 = no anomalies; 1 = anomalies found; 2 = usage/IO error.

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { deriveState, STATES, hasStartEvidence } from "./lib/derive-state.mjs";

const derive = deriveState;

const argv = process.argv.slice(2);
function arg(name, dflt) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
}
const lane = path.resolve(arg("--lane", ""));
const file = path.resolve(arg("--file", ""));
const mode = arg("--mode", "close");
if (!lane || !file || !["template", "derive", "close"].includes(mode)) {
  console.error("usage: node validate-reconciliation.mjs --lane DIR --file FILE [--mode template|derive|close]");
  process.exit(2);
}

const MISMATCH_CODES = ["UNDECLARED_SEAT", "DUPLICATE_RESULT", "TRAILER_MISSING", "TRAILER_AMBIGUOUS", "TRAILER_UNRESOLVED", "TRAILER_SEAT_MISMATCH", "ARTIFACT_PATH_ABSENT", "RESULT_NEVER_SETTLED", "OUTPUT_REPORT_DRIFT"];
const ROLES = ["executor", "critic", "reviewer", "mutation-tester", "scout", "scribe", "connector"];

const anomalies = [];
const note = (a, code, detail) => anomalies.push({ code, detail });

let doc;
try {
  doc = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error("cannot parse " + file + ": " + e.message);
  process.exit(2);
}
const dispatchPath = path.join(lane, ".ufo/waves/round-70/w1-dispatch.json");
let dispatch = { registry: { members: {} } };
try { dispatch = JSON.parse(readFileSync(dispatchPath, "utf8")); } catch (e) { note("dispatch", "DISPATCH_UNREADABLE", e.message); }
const declared = Object.entries(dispatch.registry.members || {});

const rows = Array.isArray(doc.seats) ? doc.seats : [];
const byName = new Map();
for (const s of rows) {
  if (byName.has(s.name)) note(s.name, "DUPLICATE_SEAT_ROW", "seat row appears twice");
  byName.set(s.name, s);
}

// --- structural checks (all modes) ---
if (doc.schema !== "ufo-wave-reconciliation-v2") note("doc", "SCHEMA_ID", "expected ufo-wave-reconciliation-v2, got " + doc.schema);
if (rows.length !== declared.length) note("doc", "SEAT_COUNT", "seats rows=" + rows.length + " declared=" + declared.length);
if (doc.declared_seats !== declared.length) note("doc", "DECLARED_SEATS", "declared_seats=" + doc.declared_seats + " dispatch=" + declared.length);
for (const [name, m] of declared) {
  if (!byName.has(name)) note(name, "SEAT_ROW_MISSING", "declared seat has no reconciliation row");
}
for (const s of rows) {
  if (!dispatch.registry.members || !dispatch.registry.members[s.name]) note(s.name, "UNDECLARED_SEAT", "row is not a declared dispatch member");
  if (!STATES.includes(s.state)) note(s.name, "BAD_STATE", String(s.state));
  if (!ROLES.includes(s.role)) note(s.name, "BAD_ROLE", String(s.role));
  if (!Array.isArray(s.mismatches)) note(s.name, "BAD_MISMATCHES", "mismatches not an array");
  else for (const c of s.mismatches) if (!MISMATCH_CODES.includes(c)) note(s.name, "BAD_MISMATCH_CODE", String(c));
  if (s.trailer && !["not_applicable", "ok", "missing", "ambiguous_multiple"].includes(s.trailer.parse)) note(s.name, "BAD_TRAILER_PARSE", String(s.trailer.parse));
  const expectReport = ".ufo/waves/round-70/w1/" + s.name + ".md";
  if (s.report && s.report.path !== expectReport) note(s.name, "REPORT_PATH", s.report.path + " != " + expectReport);
  if (mode === "template" && s.state !== "pending-collection") note(s.name, "TEMPLATE_STATE", "template row must be pending-collection, got " + s.state);
}
// state_counts
if (doc.state_counts && typeof doc.state_counts === "object") {
  const sum = Object.values(doc.state_counts).reduce((a, b) => a + (Number(b) || 0), 0);
  if (sum !== declared.length) note("doc", "STATE_COUNTS_SUM", "state_counts sum=" + sum + " declared=" + declared.length);
  for (const st of STATES) {
    if (!(st in doc.state_counts)) note("doc", "STATE_COUNTS_KEY", "missing key " + st);
  }
}

// --- derived state (shared module; see lib/derive-state.mjs) ---

if (mode === "derive") {
  for (const [name] of declared) {
    const s = byName.get(name);
    if (!s) { console.log(name + "\tMISSING_ROW"); continue; }
    console.log(name + "\t" + s.state + "\t->\t" + derive(s));
  }
  process.exit(0);
}

// --- close-mode cross checks ---
if (mode === "close") {
  const readyPath = path.join(lane, ".ufo/waves/round-70/w1.ready.partial");
  let partial = {};
  try { partial = JSON.parse(readFileSync(readyPath, "utf8")); } catch (e) { note("doc", "READY_PARTIAL_UNREADABLE", e.message); }

  for (const [name] of declared) {
    const s = byName.get(name);
    if (!s) continue;
    const reportAbs = path.join(lane, ".ufo/waves/round-70/w1", name + ".md");
    const onDisk = existsSync(reportAbs);
    if (onDisk !== !!(s.report && s.report.present)) note(name, "REPORT_PRESENCE_DRIFT", "disk=" + onDisk + " row=" + (s.report && s.report.present));
    if (onDisk) {
      const buf = readFileSync(reportAbs);
      const h = createHash("sha256").update(buf).digest("hex");
      if (s.report.sha256 && s.report.sha256 !== h) note(name, "REPORT_SHA_DRIFT", "row=" + s.report.sha256 + " disk=" + h);
      if (typeof s.report.bytes !== "number" || s.report.bytes !== buf.length) note(name, "REPORT_BYTES_DRIFT", "row=" + s.report.bytes + " disk=" + buf.length);
    }
    const tp = s.trailer && s.trailer.parse;
    if (onDisk) {
      if (tp === "not_applicable") note(name, "TRAILER_PARSE_DRIFT", "report present but trailer.parse=not_applicable");
      if (!s.trailer.declared && tp === "ok") note(name, "TRAILER_PARSE_DRIFT", "trailer.parse=ok but declared=null");
    } else if (tp === "ok") {
      note(name, "TRAILER_PARSE_DRIFT", "no report on disk but trailer.parse=ok");
    }
    const buildAbs = path.join(lane, ".ufo/waves/round-70/build", name);
    const buildExists = existsSync(buildAbs) && statSync(buildAbs).isDirectory();
    if (buildExists !== !!(s.build && s.build.present)) note(name, "BUILD_PRESENCE_DRIFT", "disk=" + buildExists + " row=" + (s.build && s.build.present));
    if (buildExists && typeof s.build.file_count === "number") {
      const n = readdirSync(buildAbs).length;
      if (n !== s.build.file_count) note(name, "BUILD_COUNT_DRIFT", "row=" + s.build.file_count + " disk=" + n);
    }
    const inst = partial[name] || null;
    const rowInst = (s.dispatch && s.dispatch.instance) || null;
    if (inst !== rowInst) note(name, "DISPATCH_INSTANCE_DRIFT", "ready.partial=" + inst + " row=" + rowInst);
    const d = derive(s);
    if (d !== s.state) note(name, "STATE_DERIVATION_MISMATCH", "row=" + s.state + " derived=" + d);
    // dead vs unknown rule: dead requires start evidence AND no result entry AND no report
    const hasEntry = !!(s.result && s.result.present);
    const startEvidence = !!(s.dispatch && s.dispatch.instance) || !!(s.settle && s.settle.session);
    if (s.state === "dead" && (!startEvidence || hasEntry)) note(name, "DEAD_RULE", "dead requires start evidence and no result entry");
    if (s.state === "unknown" && (startEvidence || hasEntry)) note(name, "UNKNOWN_RULE", "unknown requires no start evidence and no result entry");
  }
  const deadRows = rows.filter((s) => s.state === "dead").map((s) => s.name).sort();
  const deadList = (doc.dead_seats || []).map((d) => d.name).sort();
  if (JSON.stringify(deadRows) !== JSON.stringify(deadList)) note("doc", "DEAD_LIST_DRIFT", "rows=" + deadRows.join(",") + " list=" + deadList.join(","));
  const unkRows = rows.filter((s) => s.state === "unknown").map((s) => s.name).sort();
  const unkList = (doc.unknown_seats || []).map((d) => d.name).sort();
  if (JSON.stringify(unkRows) !== JSON.stringify(unkList)) note("doc", "UNKNOWN_LIST_DRIFT", "rows=" + unkRows.join(",") + " list=" + unkList.join(","));
  const missRows = rows.filter((s) => !(s.report && s.report.present)).map((s) => s.name).sort();
  const missList = (doc.missing_reports || []).slice().sort();
  if (JSON.stringify(missRows) !== JSON.stringify(missList)) note("doc", "MISSING_REPORTS_DRIFT", "rows=" + missRows.length + " list=" + missList.length);
  const empRows = rows.filter((s) => s.result && s.result.present && s.result.output_bytes === 0).map((s) => s.name).sort();
  const empList = (doc.empty_outputs || []).slice().sort();
  if (JSON.stringify(empRows) !== JSON.stringify(empList)) note("doc", "EMPTY_OUTPUTS_DRIFT", "rows=" + empRows.length + " list=" + empList.length);
  const settledRows = rows.filter((s) => s.result && s.result.present).length;
  if (doc.settled !== settledRows) note("doc", "SETTLED_DRIFT", "doc=" + doc.settled + " rows=" + settledRows);
  const settledNonEmpty = rows.filter((s) => s.settle && s.settle.status === "settled" && s.result && s.result.present && s.result.output_bytes > 0).length;
  if (doc.settled_nonempty !== settledNonEmpty) note("doc", "SETTLED_NONEMPTY_DRIFT", "doc=" + doc.settled_nonempty + " rows=" + settledNonEmpty);
  const repPresent = rows.filter((s) => s.report && s.report.present).length;
  if (doc.reports_present !== repPresent) note("doc", "REPORTS_PRESENT_DRIFT", "doc=" + doc.reports_present + " rows=" + repPresent);
  const roleCounts = rows.reduce((a, s) => ((a[s.role] = (a[s.role] || 0) + 1), a), {});
  if (JSON.stringify(doc.role_counts) !== JSON.stringify(roleCounts)) note("doc", "ROLE_COUNTS_DRIFT", "doc=" + JSON.stringify(doc.role_counts) + " rows=" + JSON.stringify(roleCounts));
}

if (anomalies.length === 0) {
  console.log("RECONCILE70: PASS mode=" + mode + " seats=" + rows.length + " anomalies=0");
  process.exit(0);
}
console.log("RECONCILE70: FAIL mode=" + mode + " seats=" + rows.length + " anomalies=" + anomalies.length);
for (const a of anomalies) console.log("  " + a.code + "\t" + a.detail);
process.exit(1);
