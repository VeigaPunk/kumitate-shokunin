#!/usr/bin/env node
// Extracts the frozen C85_C1 fixture table verbatim from the frozen probe and
// renders the label-keyed cheat lanes into OUTDIR (default: ./regen beside this
// script). The frozen probe is read, never modified; the measured artifacts in
// this directory (control-*.mjs, fixtures.json, receipts/) are not overwritten.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.argv[2] ?? join(HERE, 'regen'));
const PROBE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs';
const REF = '/fast/scratch/hyaku/kumitate-r85/L1/draft/scripts/counter-receipt.mjs';
const src = readFileSync(PROBE, 'utf8');

const start = src.indexOf('const good');
const end = src.indexOf('let held = 0;');
if (start < 0 || end < 0) throw new Error('cannot locate fixture fragment');
const fragment = src.slice(start, end);
const sandbox = { createHash, process, module: { exports: null } };
vm.createContext(sandbox);
vm.runInContext(`${fragment}\nmodule.exports = { cases, nonce };`, sandbox);
const { cases, nonce: genNonce } = sandbox.module.exports;
if (!Array.isArray(cases) || cases.length !== 20) throw new Error(`expected 20 cases, got ${cases?.length}`);
const nonceInFragment = /const nonce = `rev=\$\{[^}]*\}`;/.exec(fragment);
if (!nonceInFragment) throw new Error('cannot locate nonce line');

const table = {};
for (const [name, text, sourceText, code, token, rows, heldCount, sourceLine] of cases) {
  table[name] = { text, code, token, rows, heldCount, ...(sourceLine === undefined ? {} : { sourceLine }) };
  if (sourceText === null) throw new Error(`unexpected null sourceText for ${name}`);
}

// Offset proof: the nonce line is always `rev=` + 16 hex + `\n` = 21 bytes.
const offsets = new Set();
for (const [name, text] of cases) {
  if (text === null) continue;
  const sample = 'rev=' + createHash('sha256').update(name).digest('hex').slice(0, 16);
  offsets.add(Buffer.byteLength(`${sample}\n${text}`) - Buffer.byteLength(text));
}
if (offsets.size !== 1) throw new Error(`nonce offset not constant: ${[...offsets]}`);
const offset = [...offsets][0];

mkdirSync(ROOT, { recursive: true });
const template = readFileSync(join(HERE, 'template.mjs.txt'), 'utf8');
for (const mode of ['a', 'b', 'c', 'd', 'e']) {
  const dir = join(ROOT, `lane-${mode}`, 'scripts');
  mkdirSync(dir, { recursive: true });
  const rendered = template
    .replace('__TABLE__', JSON.stringify(table))
    .replace('__GEN_NONCE__', genNonce)
    .replaceAll('__MODE__', mode);
  writeFileSync(join(dir, 'counter-receipt.mjs'), rendered);
}

// The contrast lane needs L1's v2 draft; it is not part of the control, so a
// missing draft is reported, not fatal.
const refDir = join(ROOT, 'lane-ref', 'scripts');
mkdirSync(refDir, { recursive: true });
try {
  copyFileSync(REF, join(refDir, 'counter-receipt.mjs'));
} catch {
  console.log(`REF unavailable at ${REF}: lane-ref not rendered (contrast only)`);
}

// Instrumented copy of the frozen probe: prints the run nonce and each want2.
const instrumented = src
  .replace('const cases = [', "console.log('PROBE_NONCE ' + nonce);\nconst cases = [")
  .replace("const got2 = out[1] ?? '';", "console.log('WANT2 ' + name + ' ' + want2);\n      const got2 = out[1] ?? '';");
if (instrumented === src) throw new Error('instrumentation anchors missed');
writeFileSync(join(ROOT, 'probe85-c1-instrumented.mjs'), instrumented);

writeFileSync(join(ROOT, 'fixtures.json'), JSON.stringify(table, null, 2) + '\n');
console.log(`FIXTURES cases=${cases.length} table=${Object.keys(table).length} nonce_line_bytes=${offset} gen_nonce=${genNonce}`);
console.log(`OUTDIR ${ROOT}`);
console.log(`NONCE_LINE_SOURCE ${nonceInFragment[0]}`);
const counts = { receiptArms: 0, labelPassableWithoutRead: [] };
for (const [name, text, , , , rows] of cases) {
  if (rows !== null && text !== null) counts.receiptArms += 1;
  if (rows !== null && text === null) counts.labelPassableWithoutRead.push(name);
}
counts.labelPassableWithoutRead.push('usage');
console.log(`COUNTS receipt_arms=${counts.receiptArms} label_passable=${counts.labelPassableWithoutRead.join(',')}`);
