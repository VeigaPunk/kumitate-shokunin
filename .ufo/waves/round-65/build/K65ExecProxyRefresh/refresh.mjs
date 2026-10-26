#!/usr/bin/env node
/**
 * refresh.mjs — dry-run printer for the round-65 proxy-stanza refresh.
 *
 * Contract: this tool NEVER writes. It reads `<self>/SCORECARD.md` (both pinned
 * blocks) and `<self>/scripts/proxy-check.mjs` (the two pin-key registries), then
 * prints replacement block text the L1 may paste. It deliberately re-reads the
 * pin registries from the tool that owns them instead of keeping a second copy:
 * a stale copy here would print a key set proxy-check would reject as
 * `GATE_PIN_KEY_UNKNOWN` (fail-closed) and call that a refresh.
 *
 * Block text is printed in the same `key=value` grammar `proxy-check.mjs`
 * parses (`RE_STANZA_KV`), with the keys in the stanza's own order.
 *
 * Modes
 *   --set K=V        override one declared value (repeatable). K is one of the
 *                    seventeen term keys (A, C, C1, C1_total, C2, C2_total,
 *                    S_members, S_sections, R_members, R_sections,
 *                    coverage_script, coverage_runtime, C1k, C1k_total,
 *                    K_members, K_sections, coverage_kimi).
 *   --from-check     fill the counts from `node <self>/scripts/proxy-check.mjs
 *                    --json` (.terms) — the tool that owns the derivation, so
 *                    the dry run cannot disagree with what the gate computes.
 *                    Default: the values currently declared in the block.
 *   --gate-extra K=P register a gate pin the tree does not yet carry (repeatable),
 *                    e.g. --gate-extra pin.harm-matrix=scripts/harm-matrix.mjs.
 *                    The printed line is only accepted once the same key is in
 *                    `GATE_PINS` of scripts/proxy-check.mjs (a NOTE says so).
 *   --self DIR       lane root (default: cwd). Must contain SCORECARD.md.
 *   --json           machine-readable result instead of the block text.
 *
 * Pins are recomputed from the working tree (sha256 of each registered file);
 * a registered file that is absent is fail-closed, never printed as a pin.
 *
 * Exit: 0 the printed blocks would read `PROXY: MATCH`; 1 they would read
 * `PROXY: DRIFT` (the reason is printed); 2 fail-closed (missing/unparsable
 * SCORECARD block, unparsable pin registry, absent pin file); 64 usage.
 */

import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const PROXY_CONTRACT = 'kumitate-proxy-v1';
const GATE_CONTRACT = 'kumitate-gate-pins-v1';
const TERM_KEYS = ['A', 'C', 'C1', 'C1_total', 'C2', 'C2_total',
  'S_members', 'S_sections', 'R_members', 'R_sections',
  'coverage_script', 'coverage_runtime',
  'C1k', 'C1k_total', 'K_members', 'K_sections', 'coverage_kimi'];
const RE_KV = /^([A-Za-z][A-Za-z0-9_.-]*)=(\S+)$/u;
const RE_PIN_ENTRY = /'(pin\.[A-Za-z0-9_.-]+)'\s*:\s*'([^']+)'/gu;

const USAGE = `usage: node refresh.mjs [--self DIR] [--set K=V]... [--from-check]
                          [--gate-extra K=P]... [--json]
`;

function die(code, token, detail) {
  process.stdout.write(`PROXY_REFRESH: ${token}${detail ? ` ${detail}` : ''}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = { self: process.cwd(), sets: new Map(), fromCheck: false, gateExtra: new Map(), json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined) die(64, 'USAGE', `${a} needs a value`);
      i += 1;
      return v;
    };
    if (a === '--self') opts.self = resolve(next());
    else if (a === '--set') {
      const [k, v] = next().split('=');
      opts.sets.set(k, v);
    } else if (a === '--from-check') opts.fromCheck = true;
    else if (a === '--gate-extra') {
      const [k, v] = next().split('=');
      opts.gateExtra.set(k, v);
    } else if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') { process.stdout.write(USAGE); process.exit(0); }
    else die(64, 'USAGE', `unknown argument ${JSON.stringify(a)}`);
  }
  return opts;
}

function readText(file) {
  try { return readFileSync(file, 'utf8'); } catch { return null; }
}

function sha256File(file) {
  try { return createHash('sha256').update(readFileSync(file)).digest('hex'); } catch { return null; }
}

/** `{ start, end }` line indexes of the one block opened by `head`, `end` exclusive of the terminator. */
function blockBounds(text, head) {
  const lines = text.split('\n');
  const heads = [];
  for (let i = 0; i < lines.length; i += 1) if (lines[i].trim().startsWith(head)) heads.push(i);
  if (heads.length !== 1) return { error: `${head}: ${heads.length} blocks (exactly 1 required)` };
  const start = heads[0];
  let end = -1;
  for (let i = start; i < lines.length; i += 1) if (lines[i].includes('-->')) { end = i; break; }
  if (end < 0) return { error: `${head}: block opened at line ${start + 1} is never terminated` };
  return { start, end, lines };
}

/** Ordered `[key, value]` pairs of a block body. */
function blockPairs(bounds) {
  const pairs = [];
  for (let i = bounds.start + 1; i < bounds.end; i += 1) {
    const raw = bounds.lines[i].trim();
    if (raw === '') continue;
    const m = RE_KV.exec(raw);
    if (!m) return { error: `line ${i + 1} is not key=value: ${JSON.stringify(bounds.lines[i])}` };
    pairs.push([m[1], m[2]]);
  }
  return { pairs };
}

/** `{ 'pin.x': 'scripts/x.mjs', ... }` read from proxy-check.mjs's own registry literals. */
function pinRegistries(toolText) {
  const out = {};
  for (const name of ['PINS', 'GATE_PINS']) {
    const at = toolText.indexOf(`const ${name} = {`);
    if (at < 0) return { error: `scripts/proxy-check.mjs: no "const ${name} = {" literal` };
    const close = toolText.indexOf('\n};', at);
    if (close < 0) return { error: `scripts/proxy-check.mjs: ${name} literal never closed` };
    const body = toolText.slice(at, close);
    const map = {};
    for (const m of body.matchAll(RE_PIN_ENTRY)) map[m[1]] = m[2];
    if (Object.keys(map).length === 0) return { error: `scripts/proxy-check.mjs: ${name} literal has no pin entries` };
    out[name] = map;
  }
  return out;
}

/** The terms proxy-check itself computed for this tree (`--json`), or null. */
function termsFromCheck(self) {
  const tool = join(self, 'scripts', 'proxy-check.mjs');
  const r = spawnSync(process.execPath, [tool, '--json'], { encoding: 'utf8', cwd: self });
  const text = `${r.stdout ?? ''}`;
  const at = text.indexOf('{');
  if (at < 0) return { error: `proxy-check --json printed no JSON (status ${r.status})` };
  let doc;
  try { doc = JSON.parse(text.slice(at)); } catch (e) { return { error: `proxy-check JSON unparsable: ${e.message}` }; }
  if (!doc.terms) return { error: 'proxy-check JSON carries no .terms' };
  return { terms: doc.terms };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const scorecardPath = join(opts.self, 'SCORECARD.md');
  const scorecard = readText(scorecardPath);
  if (scorecard === null) die(2, 'FAIL-CLOSED', `SCORECARD.md unreadable under ${opts.self}`);

  const proxy = blockBounds(scorecard, `<!-- ${PROXY_CONTRACT}`);
  if (proxy.error) die(2, 'FAIL-CLOSED', proxy.error);
  const proxyPairs = blockPairs(proxy);
  if (proxyPairs.error) die(2, 'FAIL-CLOSED', proxyPairs.error);
  const gate = blockBounds(scorecard, `<!-- ${GATE_CONTRACT}`);
  if (gate.error) die(2, 'FAIL-CLOSED', gate.error);
  const gatePairs = blockPairs(gate);
  if (gatePairs.error) die(2, 'FAIL-CLOSED', gatePairs.error);

  const toolText = readText(join(opts.self, 'scripts', 'proxy-check.mjs'));
  if (toolText === null) die(2, 'FAIL-CLOSED', 'scripts/proxy-check.mjs unreadable');
  const regs = pinRegistries(toolText);
  if (regs.error) die(2, 'FAIL-CLOSED', regs.error);

  const declared = Object.fromEntries(proxyPairs.pairs);
  const declaredGate = Object.fromEntries(gatePairs.pairs);

  // A key the owning tool does not know is exactly the state both parsers fail
  // closed on; printing a "refresh" around it would hide the fault.
  const knownProxy = new Set([...TERM_KEYS, ...Object.keys(regs.PINS)]);
  for (const key of Object.keys(declared)) {
    if (!knownProxy.has(key)) die(2, 'FAIL-CLOSED', `${key} is in the ${PROXY_CONTRACT} block but not in proxy-check.mjs (STANZA_KEY_UNKNOWN)`);
  }
  for (const key of Object.keys(declaredGate)) {
    if (!(key in regs.GATE_PINS)) die(2, 'FAIL-CLOSED', `${key} is in the ${GATE_CONTRACT} block but not in proxy-check.mjs GATE_PINS (GATE_PIN_KEY_UNKNOWN)`);
  }

  // --- counts: declared baseline, then --from-check, then --set (last wins).
  const values = new Map();
  for (const k of TERM_KEYS) {
    if (!(k in declared)) die(2, 'FAIL-CLOSED', `${PROXY_CONTRACT} block lacks ${k}`);
    values.set(k, declared[k]);
  }
  const source = opts.fromCheck ? 'proxy-check --json' : 'declared';
  if (opts.fromCheck) {
    const t = termsFromCheck(opts.self);
    if (t.error) die(2, 'FAIL-CLOSED', t.error);
    for (const k of TERM_KEYS) {
      if (typeof t.terms[k] !== 'number') die(2, 'FAIL-CLOSED', `proxy-check .terms lacks numeric ${k}`);
      values.set(k, String(t.terms[k]));
    }
  }
  for (const [k, v] of opts.sets) {
    if (!TERM_KEYS.includes(k)) die(64, 'USAGE', `--set ${k}: not a ${PROXY_CONTRACT} term key`);
    if (!/^\d+$/u.test(v)) die(64, 'USAGE', `--set ${k}=${v}: not a non-negative integer`);
    values.set(k, v);
  }

  // --- pins: every registered key, hashed from this tree.
  const pins = [];
  for (const [block, map] of [['proxy', regs.PINS], ['gate', regs.GATE_PINS]]) {
    for (const [key, rel] of Object.entries(map)) {
      const sha = sha256File(join(opts.self, rel));
      const where = block === 'proxy' ? 'pin (v1)' : 'pin (gate)';
      if (sha === null) {
        let kind = 'absent';
        try { kind = statSync(join(opts.self, rel)).isDirectory() ? 'dir' : 'non-file'; } catch { /* absent */ }
        die(2, 'FAIL-CLOSED', `${key}: ${rel} is ${kind} — a pin cannot be printed for a file that is not there`);
      }
      pins.push({ key, rel, sha, was: block === 'proxy' ? (declared[key] ?? null) : (declaredGate[key] ?? null), block: where });
    }
  }
  for (const [key, rel] of opts.gateExtra) {
    if (!/^pin\.[A-Za-z0-9_.-]+$/u.test(key)) die(64, 'USAGE', `--gate-extra ${key}: not a pin.<name> key`);
    if (key in regs.GATE_PINS || key in regs.PINS) die(64, 'USAGE', `--gate-extra ${key}: already registered in proxy-check.mjs`);
    const sha = sha256File(join(opts.self, rel));
    if (sha === null) die(2, 'FAIL-CLOSED', `--gate-extra ${key}: ${rel} is absent`);
    pins.push({ key, rel, sha, was: declaredGate[key] ?? null, block: 'pin (gate, NEW)' });
  }

  // --- derived scores: the block is only refreshable to a state the gate accepts.
  const n = (k) => Number.parseInt(values.get(k), 10);
  const operability = Math.floor(10 * ((n('A') + n('C')) / (n('A') + n('C') + 3)));
  const coverageDen = n('C1_total') * n('C2_total');
  const coverage = coverageDen === 0 ? 0 : Math.floor(10 * (n('C1') / n('C1_total')) * (n('C2') / n('C2_total')));
  const notes = [];
  if (n('C2') !== n('C2_total')) notes.push(`C2=${n('C2')} C2_total=${n('C2_total')} — ${n('C2_total') - n('C2')} note(s) without a corpus/README.md row; coverage floors to ${coverage}`);
  if (n('C1') !== n('C1_total')) notes.push(`C1=${n('C1')} C1_total=${n('C1_total')} — an uncovered registry row; coverage floors to ${coverage}`);
  if (operability !== 9) notes.push(`operability derives ${operability}, not the terminal 9`);
  if (coverage !== 10) notes.push(`coverage derives ${coverage}, not the retired-axis 10 (## Axes would read AXES_DRIFT)`);
  const unregistered = [...opts.gateExtra.keys()].filter((k) => !(k in regs.GATE_PINS));

  const proxyText = [`<!-- ${PROXY_CONTRACT}`, ...[...TERM_KEYS].map((k) => `${k}=${values.get(k)}`),
    ...pins.filter((p) => p.block === 'pin (v1)').map((p) => `${p.key}=${p.sha}`), '-->'].join('\n');
  const gateLines = [...gatePairs.pairs.map(([k]) => k),
    ...pins.filter((p) => p.block !== 'pin (v1)' && !gatePairs.pairs.some(([k2]) => k2 === p.key)).map((p) => p.key)]
    .map((key) => {
      const p = pins.find((x) => x.key === key);
      return `${key}=${p.sha}`;
    });
  const gateText = [`<!-- ${GATE_CONTRACT}`, ...gateLines, '-->'].join('\n');

  const changed = [
    ...[...TERM_KEYS].filter((k) => declared[k] !== values.get(k)).map((k) => `${k}: ${declared[k]} -> ${values.get(k)}`),
    ...pins.filter((p) => p.was !== p.sha).map((p) => `${p.key}: ${p.was === null ? 'absent' : p.was} -> ${p.sha}`),
  ];

  if (opts.json) {
    process.stdout.write(`${JSON.stringify({ contract: PROXY_CONTRACT, mode: 'refresh-dry-run', self: opts.self,
      source, values: Object.fromEntries(values), operability, coverage, notes, changed, unregistered,
      pins: pins.map(({ key, rel, sha, was, block }) => ({ key, rel, sha, was, block })) }, null, 1)}\n`);
  } else {
    for (const note of notes) process.stdout.write(`PROXY_REFRESH: NOTE ${note}\n`);
    for (const key of unregistered) process.stdout.write(`PROXY_REFRESH: NOTE ${key} is not in scripts/proxy-check.mjs GATE_PINS — the block would fail closed (GATE_PIN_KEY_UNKNOWN) until it is registered\n`);
    process.stdout.write(`--- ${PROXY_CONTRACT} replacement (paste over lines ${proxy.start + 1}-${proxy.end + 1})\n${proxyText}\n`);
    process.stdout.write(`--- ${GATE_CONTRACT} replacement (paste over lines ${gate.start + 1}-${gate.end + 1})\n${gateText}\n`);
    process.stdout.write(`--- changed (${changed.length})\n${changed.map((c) => `  ${c}`).join('\n')}${changed.length === 0 ? '  (none)' : ''}\n`);
    process.stdout.write(`--- derived operability=${operability} coverage=${coverage}\n`);
  }
  process.exit(notes.length === 0 && unregistered.length === 0 ? 0 : 1);
}

process.exitCode = main();
