#!/usr/bin/env node
// K70AttackC2Forge — isolated counterexample for the R70 contract edge:
//   "c2 forgecapture live digest failure is required, network failure cannot count pass."
//
// What is REAL here: the M11 digest() replica below is copied VERBATIM from the frozen
// deprec69 counter (.ufo/waves/round-69/probe/deprec69-probe.mjs lines 512-521) and executed
// against three real endpoints (refused connection, local 404 server, local mismatch server).
// The R7 predicate and the control gate are copied VERBATIM from the frozen replay70 probe
// (line 36) and the frozen c2-controls.sh gate (lines 111-117) respectively.
// What is SYNTHESIZED: the receipt bodies, modeled byte-faithfully on the frozen probe's own
// output format (deprec69-probe.mjs line 551) — used only to drive the verbatim predicates.
// No original control script is executed; no frozen bytes are touched; all output is private.

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const outDir = process.argv[2] || '.';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

// ---------- (1) VERBATIM replica of frozen M11 digest() ----------
// deprec69-probe.mjs:512-521 — three-way outcome: sha hex | 'http-<status>' | 'unreachable'
const digest = async (url) => {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 45000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: 'follow' });
    clearTimeout(t);
    if (!r.ok) return `http-${r.status}`;
    const buf = Buffer.from(await r.arrayBuffer());
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch { return 'unreachable'; }
};

// ---------- (2) VERBATIM replica of frozen replay70 R7 predicate ----------
// replay70-probe.mjs:36 — note: no S210:origin-sha-mismatch requirement, no live= requirement
const r7 = ({ status, text, preserved, workEmpty, label, mode }) => ({
  ok: status === 0 && text.includes(label) && text.includes('CONTROL-PASS ' + mode) && preserved && workEmpty,
  terms: { status: status === 0, label: text.includes(label), pass: text.includes('CONTROL-PASS ' + mode), preserved, workEmpty },
});

// ---------- (3) VERBATIM replica of frozen c2 gate (c2-controls.sh:111-117) ----------
// digestGate models whether the generated private copy preserved line 113
//   grep -q 'S210:origin-sha-mismatch' "$W/c2-$MODE.txt"
function frozenGate({ firstLine, rc, mode, receipt, digestGate }) {
  if (!firstLine.startsWith('DEPREC69_UNMET')) return { status: 1, receipt: receipt + 'CONTROL-FAIL ' + mode + '\n' };
  if (rc !== 1) return { status: 1, receipt: receipt + `CONTROL-FAIL ${mode} (exit ${rc})\n` };
  if (digestGate && mode === 'forgecapture' && !receipt.includes('S210:origin-sha-mismatch'))
    return { status: 1, receipt: receipt + `CONTROL-FAIL ${mode} (the digest arm did not bite)\n` };
  return { status: 0, receipt: receipt + 'CONTROL-PASS ' + mode + '\n' };
}

const log = [];
const say = (s) => { log.push(s); console.log(s); };

(async () => {
  say('# K70AttackC2Forge — forgecapture network-failure counterexample');

  // --- real executed evidence of the M11 three-way mapping ---
  const pinned = sha('the-capture-we-expect');
  const mismatchServer = http.createServer((q, s) => { s.writeHead(200); s.end('tampered-by-upstream-or-honest-change'); });
  const notFoundServer = http.createServer((q, s) => { s.writeHead(404); s.end('nope'); });
  await new Promise((r) => mismatchServer.listen(0, '127.0.0.1', r));
  await new Promise((r) => notFoundServer.listen(0, '127.0.0.1', r));
  const mport = mismatchServer.address().port, nport = notFoundServer.address().port;

  const hUnreachable = await digest('http://127.0.0.1:1/none');                    // refused
  const h404 = await digest(`http://127.0.0.1:${nport}/x`);                        // http error
  const hMismatch = await digest(`http://127.0.0.1:${mport}/x`);                   // reachable, wrong bytes
  mismatchServer.close(); notFoundServer.close();

  const missReason = (h, pin) => h === 'unreachable' ? 'origin-unreachable' : String(h).startsWith('http-') ? `origin-${h}` : (h !== pin ? 'origin-sha-mismatch' : 'ok');
  // ^^ VERBATIM decision shape of deprec69-probe.mjs:528-531

  say(`m11.real.digest unreachable -> ${hUnreachable} -> miss=${missReason(hUnreachable, pinned)}`);
  say(`m11.real.digest http      -> ${h404} -> miss=${missReason(h404, pinned)}`);
  say(`m11.real.digest mismatch  -> ${hMismatch} -> miss=${missReason(hMismatch, pinned)}`);
  say(`m11.real.digest match     -> ${sha('the-capture-we-expect')} -> miss=${missReason(pinned, pinned)}`);
  say('');

  // --- synthesized receipts, byte-faithful to deprec69-probe.mjs:551 output format ---
  const REV = 'a'.repeat(40);
  const mkReceipt = (liveState, missBits, trailerLive) =>
    `DEPREC69_UNMET held=10/11 checks=11 rev=${REV} rule=M69 live=${liveState} | M10 MISS env-poison | M11 MISS ${missBits}\n` +
    `DEPREC69 detail lines...\n` +
    `control=forgecapture live=${trailerLive} exit=1 rev=${REV}\n`;

  const NETFAIL = mkReceipt('exercised', 'S210:origin-unreachable,S207:origin-unreachable', 'exercised');
  const NOLIVE  = mkReceipt('no-live(vacuous-declared)', 'no-live', 'no-live-vacuous-declared');
  const GOOD    = mkReceipt('exercised', 'S210:origin-sha-mismatch', 'exercised');

  const matrix = [
    ['A honest gate + network-fail receipt',      NETFAIL, true],
    ['B weakened gate + network-fail receipt',    NETFAIL, false],
    ['C weakened gate + no-live receipt',         NOLIVE,  false],
    ['D honest gate + genuine digest-mismatch',   GOOD,    true],
    ['E weakened gate + genuine digest-mismatch', GOOD,    false],
  ];

  const results = [];
  for (const [name, receipt, digestGate] of matrix) {
    const g = frozenGate({ firstLine: receipt.split('\n')[0], rc: 1, mode: 'forgecapture', receipt, digestGate });
    const verdict = r7({ status: g.status, text: g.receipt, preserved: true, workEmpty: true, label: 'DEPREC69_UNMET', mode: 'forgecapture' });
    results.push({ name, digestGate, controlStatus: g.status, r7: verdict.ok, terms: verdict.terms });
    say(`${name}: control exit=${g.status} (${digestGate ? 'gate intact' : 'GATE DROPPED'}) -> R7 ${verdict.ok ? 'PASS' : 'MISS'}`);
  }
  say('');

  const defect = results.filter((r) => r.digestGate === false && (r.name.includes('network-fail') || r.name.includes('no-live')));
  say(`DEFECT CONFIRMED: ${defect.length}/2 weakened-gate scenarios count as R7 PASS although no live digest failure occurred`);
  say('Root cause: replay70-probe.mjs:36 (R7) requires only DEPREC69_UNMET + CONTROL-PASS forgecapture in the');
  say("receipt; the 'digest arm bit' property (S210:origin-sha-mismatch) and the live=exercised trailer are");
  say('enforced ONLY by c2-controls.sh:113 inside the NON-FROZEN private copy the implementation generates.');

  fs.writeFileSync(path.join(outDir, 'counterexample-transcript.txt'), log.join('\n') + '\n');
  fs.writeFileSync(path.join(outDir, 'receipt-network-fail.txt'), NETFAIL);
  fs.writeFileSync(path.join(outDir, 'receipt-no-live.txt'), NOLIVE);
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2) + '\n');
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
