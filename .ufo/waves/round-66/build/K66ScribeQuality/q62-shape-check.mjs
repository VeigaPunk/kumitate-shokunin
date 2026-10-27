#!/usr/bin/env node
// K66ScribeQuality shape check over the staged drafts (not a lane gate): checklist grammar (copied
// verbatim from scripts/surface-probe.mjs:278), GFM cell counts, registry census after the patch.
import { readFileSync } from "node:fs";

const B = new URL(".", import.meta.url).pathname;
const skill = readFileSync(`${B}stage/SKILL.md`, "utf8").split("\n");
const score = readFileSync(`${B}stage/SCORECARD.md`, "utf8").split("\n");

const CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u;
const items = skill.filter((l) => /^\s*- \[ \]/.test(l));
const bad = items.filter((l) => !CHECKLIST_RE.test(l));
console.log(`checklist items=${items.length} grammar_errors=${bad.length}`);
const mine = items.find((l) => l.includes("Routed-defect ledger gate"));
const m = CHECKLIST_RE.exec(mine);
console.log(`new item parses=${!!m} cmd=${JSON.stringify(m?.groups.cmd)} exits=${m?.groups.exits} expect=${JSON.stringify(m?.groups.expect)}`);

const cells = (line) => line.replace(/\\\|/g, "").split("|").length - 2;
for (const name of ["routed-ledger", "harm-matrix", "omp-binary-probe"]) {
  const line = skill.find((l) => l.startsWith(`| ${name} |`));
  console.log(`SKILL row ${name} cells=${cells(line)}`);
}
for (const name of ["`routed-ledger`", "`harm-matrix`"]) {
  const line = score.find((l) => l.startsWith(`| ${name} |`));
  console.log(`SCORECARD row ${name} cells=${cells(line)}`);
}
const start = skill.indexOf("| name | kind | entry command | self-test | pinned values live in |");
const rows = skill.slice(start).filter((l) => /^\| [a-z]/.test(l) && !l.startsWith("| name "));
const gates = rows.filter((l) => l.split("|")[2].trim() === "gate");
console.log(`registry rows=${rows.length} gate_rows=${gates.length} gate_files=${gates.length - 1} (plan-before-ready carries two rows)`);
const dupe = rows.map((l) => l.split("|")[1].trim()).filter((n, i, a) => a.indexOf(n) !== i);
console.log(`duplicate registry names=${JSON.stringify(dupe)}`);
