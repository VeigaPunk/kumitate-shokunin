#!/usr/bin/env node
// make-seat-controls.mjs — K88Sentinel seat-constructed controls (kill-rule candidates) from the integrated v2.
//   node make-seat-controls.mjs <scripts/receipt-bind.mjs> <out-dir>
// Each control is the v2 source with ONE exact-string rewrite (asserted to match exactly once):
//   ctl-escape-prefix.mjs  ESCAPES_LANE only when the token TEXT starts with '../'; any other relative token
//                          that resolves outside the lane (scripts/../../x, ./../x) is read from disk as external (v1).
//   ctl-read-then-cap.mjs  RECEIPT_TOO_LARGE decided AFTER the whole receipt is read (the plan says "refused before
//                          it is read"); the cap is applied to the byte length of what was read.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [src, out] = process.argv.slice(2);
if (!src || !out) { process.stderr.write('usage: make-seat-controls.mjs <receipt-bind.mjs> <out-dir>\n'); process.exit(64); }
const base = readFileSync(src, 'utf8');
mkdirSync(out, { recursive: true });

function rewrite(text, from, to, name) {
  const n = text.split(from).length - 1;
  if (n !== 1) { process.stderr.write(`${name}: anchor matched ${n} times\n`); process.exit(2); }
  return text.replace(from, to);
}

const esc = rewrite(base,
  "      if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);\n      rel = lr.rel;\n",
  "      if (!lr.inside && instrument.startsWith('../')) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);\n      if (lr.inside) rel = lr.rel; else fromDisk = true;\n",
  'ctl-escape-prefix');
writeFileSync(join(out, 'ctl-escape-prefix.mjs'), esc);

// ctl-escape-prefix-st.mjs  ctl-escape-prefix plus its own selftest made consistent with it: the one selftest
//                           expectation that covers an interior `..` escape is removed (the frozen probe's
//                           `selftest` arm trusts whatever the candidate's own selftest asserts).
const ST_ANCHOR = "  expect('escapes-lane-interior-dotdot', runTool(['--dir', rcEscInterior, '--rev', c2]), 2, FC('ESCAPES_LANE'));\n";
if (esc.includes(ST_ANCHOR)) {
  writeFileSync(join(out, 'ctl-escape-prefix-st.mjs'), rewrite(esc, ST_ANCHOR, '', 'ctl-escape-prefix-st'));
} else {
  // the source's selftest has no interior-`..` expectation: ctl-escape-prefix already passes its own selftest
  process.stdout.write('ctl-escape-prefix-st not generated: source selftest has no escapes-lane-interior-dotdot expectation\n');
}

let cap = rewrite(base,
  "    if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${st.size} bytes (limit ${MAX_RECEIPT_BYTES})`);\n",
  '',
  'ctl-read-then-cap/size');
cap = rewrite(cap,
  "    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n",
  "    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n    { const n = Buffer.byteLength(text, 'utf8'); if (n > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${n} bytes (limit ${MAX_RECEIPT_BYTES})`); }\n",
  'ctl-read-then-cap/read');
writeFileSync(join(out, 'ctl-read-then-cap.mjs'), cap);
process.stdout.write(`wrote ctl-escape-prefix.mjs${esc.includes(ST_ANCHOR) ? ' ctl-escape-prefix-st.mjs' : ''} ctl-read-then-cap.mjs\n`);
