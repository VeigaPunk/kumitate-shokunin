#!/usr/bin/env node
/**
 * gen-pins.mjs — regenerate the seven S207..S213 capture-pin entries from the bytes
 * that are actually committed under .ufo/waves/round-68/build/captures/.
 *
 * Why a generator and not a pasted fragment: source-capture.mjs (and the round-68
 * counter's M3) verify sha256 + byte length against the file on disk. A pasted hash
 * that is one rename away from the bytes it describes fails closed at close time.
 * This script cannot emit a hash the file does not have.
 *
 * Usage (from the lane root, after the captures are copied):
 *   node .ufo/waves/round-68/build/K68ScribeCaptures/gen-pins.mjs \
 *        .ufo/waves/round-68/build/captures --emit
 *   node .ufo/waves/round-68/build/K68ScribeCaptures/gen-pins.mjs \
 *        .ufo/waves/round-68/build/captures --merge      # rewrite .ufo/pins/source-captures.json
 *
 * --emit   prints the JSON fragment (array of 7 capture entries) to stdout
 * --merge  inserts the entries into .ufo/pins/source-captures.json, keeping id order,
 *          after removing any prior S207..S213 capture entry (idempotent re-run)
 * --check  verifies the registry already agrees with the bytes; exit 1 on any drift
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NAMES = {
  S207: 'S207-deprecated-2026-07-28.md',
  S208: 'S208-feature-lifecycle.md',
  S209: 'S209-sse-v18.12.6.ts',
  S210: 'S210-sep2596-at-183238ddac.md',
  S211: 'S211-transports-2025-11-25.md',
  S212: 'S212-sse-v18.13.1.ts',
  S213: 'S213-commit-183238ddac.patch',
};
const REGISTRY = '.ufo/pins/source-captures.json';
const CAPTURED = '2026-10-27';

const [dirArg, mode] = process.argv.slice(2);
if (!dirArg || !['--emit', '--merge', '--check'].includes(mode)) {
  process.stderr.write('usage: gen-pins.mjs <captureDir> --emit|--merge|--check\n');
  process.exit(64);
}
const dir = dirArg.replace(/\/+$/, '');

const entries = Object.entries(NAMES).map(([sourceId, name]) => {
  const buf = readFileSync(join(dir, name)); // throws (exit 1) if a capture is missing: never invent
  return {
    sourceId,
    path: `${dir}/${name}`.replace(/^\.\//, ''),
    sha256: createHash('sha256').update(buf).digest('hex'),
    bytes: buf.length,
    captured: CAPTURED,
  };
});

const dupPaths = new Set();
for (const e of entries) {
  if (e.path.includes('..')) { process.stderr.write(`${e.sourceId}: path carries ..\n`); process.exit(1); }
  if (dupPaths.has(e.path)) { process.stderr.write(`duplicate path ${e.path}\n`); process.exit(1); }
  dupPaths.add(e.path);
}

if (mode === '--emit') {
  process.stdout.write(`${JSON.stringify(entries, null, 1)}\n`);
} else {
  const doc = JSON.parse(readFileSync(REGISTRY, 'utf8'));
  if (doc.version !== 1 || !Array.isArray(doc.captures) || !Array.isArray(doc.exemptions)) {
    process.stderr.write('registry shape unexpected\n');
    process.exit(1);
  }
  const mine = new Set(Object.keys(NAMES));
  if (mode === '--check') {
    const bad = [];
    for (const e of entries) {
      const c = doc.captures.find((x) => x.sourceId === e.sourceId);
      if (!c) { bad.push(`${e.sourceId}:pin-absent`); continue; }
      for (const k of ['path', 'sha256', 'bytes', 'captured']) if (c[k] !== e[k]) bad.push(`${e.sourceId}:${k}`);
      if (doc.exemptions.some((x) => x.ids.includes(e.sourceId))) bad.push(`${e.sourceId}:exempted-not-captured`);
    }
    process.stdout.write(bad.length ? `PINS_DRIFT ${bad.join(' ')}\n` : 'PINS_OK 7/7 bytes match registry\n');
    process.exit(bad.length ? 1 : 0);
  }
  // --merge: drop prior S207..S213 captures (and any exemption naming them), insert in id order
  const kept = doc.captures.filter((c) => !mine.has(c.sourceId));
  const merged = [...kept, ...entries].sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  doc.captures = merged;
  doc.exemptions = doc.exemptions
    .map((x) => ({ ...x, ids: x.ids.filter((id) => !mine.has(id)) }))
    .filter((x) => x.ids.length > 0);
  writeFileSync(REGISTRY, `${JSON.stringify(doc, null, 1)}\n`);
  process.stdout.write(`PINS_MERGED captures=${doc.captures.length} exemptions=${doc.exemptions.reduce((n, x) => n + x.ids.length, 0)}\n`);
}
