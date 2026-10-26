#!/usr/bin/env node
/**
 * registry-coverage.mjs — DRAFT (K65ConnOverlap, round 65 wave 1 connector).
 *
 * WHY. `scripts/harm-matrix-gates.json` (the harm-matrix registry, 20 rows at the
 * freeze commit) and the lane's SKILL.md checklist (33 rows) are TWO inventories of
 * the same thing: the lane's gate commands. PROTOCOL.md §Gate standard names SKILL.md
 * as a child lane's *registry home* ("a child lane's registry home is its own SKILL.md",
 * PROTOCOL.md:398). A gate that lives in SKILL.md but not in the harm registry is a
 * gate the "no axis harmed" check never runs: the harm matrix reads CLEAN while the
 * lane's own close-checklist item moved. That is exactly the masked-verdict class the
 * round's ratchet targets, in the tool that is supposed to catch it.
 *
 * WHAT IT DOES. It parses SKILL.md with the lane's OWN frozen checklist grammar —
 * `CHECKLIST_RE` and `parseChecklist()` from scripts/surface-probe.mjs:278 and :979 —
 * so there is no second grammar to drift, and compares the parsed command set against
 * the harm registry's `argv` set. It reports three findings:
 *
 *   GATE_UNREGISTERED   a SKILL.md checklist row whose command is not in the registry
 *   GATE_UNLISTED       a registry row whose command is not a SKILL.md checklist row
 *   GATE_EXIT_DIVERGES  a command in both whose SKILL.md expected exit set admits an
 *                       exit the registry does not (or vice versa)
 *
 * It NEVER relaxes a check: it is a separate gate (its own registry row would be
 * `node scripts/registry-coverage.mjs`), it fails closed, and it can only add
 * findings.
 *
 * EXIT MAP
 *   0  clean (no findings)
 *   1  >= 1 finding
 *   2  fail-closed (unreadable lane, unreadable registry, unparsable SKILL.md, or a
 *      registry that names no gate at all)
 *   64 usage error
 *
 * Usage
 *   node scripts/registry-coverage.mjs [--lane DIR] [--gates FILE] [--json]
 *
 * NOT INTEGRATED BY THIS SEAT: the L1 owns scripts/. This is a draft in the seat's
 * build directory, run against a scratch copy of the lane.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTRACT = 'kumitate-registry-coverage-v1';

/* ---------------------------------------------------------------- the lane's own grammar
 *
 * Copied verbatim from scripts/surface-probe.mjs so the two files cannot disagree
 * about what a checklist row is. Upstream lines:
 *   scripts/surface-probe.mjs:278  const CHECKLIST_RE = /^\s*- \[ \] .../u;
 *   scripts/surface-probe.mjs:979  function parseChecklist(text) { ... }
 *
 * surface-probe.mjs exports nothing and self-executes at :1903
 * (`process.exitCode = main();`), so its parser cannot be imported as a library:
 * `import('.../surface-probe.mjs')` runs the whole live conformance probe before
 * resolving. A copy is the only reuse available without touching that file; if the
 * L1 prefers, the same two blocks can be lifted into a shared module both import.
 */
const CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u;

function parseChecklist(text) {
  const items = [];
  for (const [index, line] of text.split('\n').entries()) {
    if (!/^\s*- \[/.test(line)) continue;
    const match = CHECKLIST_RE.exec(line);
    if (match) {
      items.push({
        line: index + 1,
        label: match.groups.label,
        command: match.groups.cmd,
        exits: match.groups.exits.split('|').map(Number),
        expect: match.groups.expect,
      });
      continue;
    }
    if (/^\s*- \[[xX]\]/.test(line)) {
      items.push({ line: index + 1, checked: true, label: line.replace(/^\s*- \[[xX]\]\s*/, '').slice(0, 80) });
      continue;
    }
    items.push({ line: index + 1, malformed: true, raw: line.trim().slice(0, 120) });
  }
  return items;
}

/* ---------------------------------------------------------------- helpers */

const out = (s) => process.stdout.write(`${s}\n`);
const failClosed = (reason, detail = '') => {
  out(`REGISTRY_COVERAGE: FAIL_CLOSED reason=${reason}${detail ? ` detail=${JSON.stringify(detail)}` : ''}`);
  process.exit(2);
};
const usage = () => {
  process.stderr.write('usage: registry-coverage.mjs [--lane DIR] [--gates FILE] [--json]\n');
  process.exit(64);
};

function argvOf(gate) {
  return Array.isArray(gate.argv) ? gate.argv.map(String).join(' ') : null;
}

/** The registry's own exit set. v1 harm-matrix gates carry no `ok_exit` field, so
 *  the default [0] is used, exactly as scripts/harm-matrix.mjs:66 does. */
function okExitOf(gate) {
  return Array.isArray(gate.ok_exit) && gate.ok_exit.length ? gate.ok_exit.map(Number) : [0];
}

/* ---------------------------------------------------------------- main */

function main(argv) {
  let lane = null;
  let gatesFile = null;
  let json = false;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--lane') lane = argv[++i];
    else if (a === '--gates') gatesFile = argv[++i];
    else if (a === '--json') json = true;
    else if (a === '-h' || a === '--help') usage();
    else usage();
  }
  lane = resolve(lane ?? join(HERE, '..'));
  gatesFile = resolve(gatesFile ?? join(lane, 'scripts', 'harm-matrix-gates.json'));

  if (!existsSync(lane) || !statSync(lane).isDirectory()) failClosed('LANE_UNREADABLE', lane);
  const skill = join(lane, 'SKILL.md');
  if (!existsSync(skill)) failClosed('SKILL_MISSING', skill);
  if (!existsSync(gatesFile)) failClosed('GATES_UNREADABLE', gatesFile);

  let raw;
  try { raw = JSON.parse(readFileSync(gatesFile, 'utf8')); }
  catch (e) { failClosed('GATES_UNREADABLE', String(e.message).slice(0, 160)); }
  const gates = Array.isArray(raw) ? raw : raw && raw.gates;
  if (!Array.isArray(gates) || gates.length === 0) failClosed('GATES_INVALID', 'no gates array');

  const items = parseChecklist(readFileSync(skill, 'utf8'));
  const malformed = items.filter((it) => it.malformed);
  const checklist = items.filter((it) => it.command);

  const byCommand = new Map();
  for (const it of checklist) if (!byCommand.has(it.command)) byCommand.set(it.command, it);
  const gateByCommand = new Map();
  for (const g of gates) {
    const cmd = argvOf(g);
    if (cmd && !gateByCommand.has(cmd)) gateByCommand.set(cmd, g);
  }

  const findings = [];
  for (const it of checklist) {
    if (!gateByCommand.has(it.command)) {
      findings.push({ kind: 'GATE_UNREGISTERED', command: it.command, detail: `SKILL.md:${it.line} (expect ${it.expect})` });
    }
  }
  for (const g of gates) {
    const cmd = argvOf(g);
    if (!cmd) continue;
    if (!byCommand.has(cmd)) {
      findings.push({ kind: 'GATE_UNLISTED', command: cmd, detail: `registry id=${g.id}` });
      continue;
    }
    const it = byCommand.get(cmd);
    const ok = okExitOf(g);
    const extra = it.exits.filter((e) => !ok.includes(e));
    const missing = ok.filter((e) => !it.exits.includes(e));
    if (extra.length || missing.length) {
      findings.push({
        kind: 'GATE_EXIT_DIVERGES', command: cmd, detail: `registry id=${g.id} ok_exit=[${ok}] skill_exit=[${it.exits}]`,
      });
    }
  }
  for (const it of malformed) {
    findings.push({ kind: 'CHECKLIST_GRAMMAR', command: '', detail: `SKILL.md:${it.line} ${it.raw}` });
  }

  const counts = {};
  for (const f of findings) counts[f.kind] = (counts[f.kind] ?? 0) + 1;

  if (json) {
    out(`${JSON.stringify({
      schema: CONTRACT, lane, gates: gatesFile, checklistItems: checklist.length,
      registryGates: gates.length, findings, counts,
      verdict: findings.length ? 'FINDINGS' : 'CLEAN', exitCode: findings.length ? 1 : 0,
    }, null, 2)}\n`);
  } else {
    for (const f of findings) out(`FINDING ${f.kind} ${f.command} ${f.detail}`);
    out(`REGISTRY_COVERAGE: ${findings.length ? 'FINDINGS' : 'CLEAN'} checklist=${checklist.length} registry=${gates.length} findings=${findings.length} unregistered=${counts.GATE_UNREGISTERED ?? 0} unlisted=${counts.GATE_UNLISTED ?? 0} exit_diverges=${counts.GATE_EXIT_DIVERGES ?? 0}`);
  }
  return findings.length ? 1 : 0;
}

process.exit(main(process.argv.slice(2)));
