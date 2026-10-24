// MutKill2 auxiliary: reseal three scratch receipts with wall_start values spanning 10000 ms.
// Contract: writes only beneath this script's build directory; preserves argv, nonces, output hashes, wall_end, and preludes.
// Exit 0 = all three receipts resealed and validated; exit 1 = malformed input, out-of-bounds path, or inconsistent clocks.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const build = dirname(fileURLToPath(import.meta.url));
const receipts = resolve(process.argv[2] || '');
if (!receipts.startsWith(`${build}/`)) throw new Error(`receipts path outside ${build}`);
const names = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
};
const canonical = (value) => JSON.stringify(sortKeys(value));
const digestOf = (record) => {
  const copy = { ...record };
  delete copy.digest;
  return sha256(canonical(copy));
};

let base = null;
const rows = [];
for (const [index, name] of names.entries()) {
  const file = join(receipts, name);
  const lines = readFileSync(file, 'utf8').split('\n');
  if (lines.length !== 3 || lines[2] !== '' || !lines[0].startsWith('run-at: ')) {
    throw new Error(`${name}: unexpected receipt shape`);
  }
  const body = JSON.parse(lines[1]);
  const previous = body.wall_start;
  if (base === null) base = Date.parse(previous);
  if (!Number.isFinite(base)) throw new Error(`${name}: invalid base wall_start`);
  const nextMs = base + index * 5000;
  body.wall_start = new Date(nextMs).toISOString();
  const endMs = Date.parse(body.wall_end);
  const preludeMs = Date.parse(lines[0].slice('run-at: '.length));
  if (!Number.isFinite(endMs) || !Number.isFinite(preludeMs) || endMs < nextMs
      || preludeMs < nextMs - 60_000 || preludeMs > endMs + 60_000) {
    throw new Error(`${name}: resealed clocks would not verify`);
  }
  body.digest = digestOf(body);
  const nextText = `${lines[0]}\n${canonical(body)}\n`;
  writeFileSync(file, nextText);
  writeFileSync(`${file}.sha256`, `${sha256(nextText)}  ${basename(file)}\n`);
  rows.push({ name, previous, next: body.wall_start, ms: nextMs });
}
const times = rows.map((row) => row.ms);
const span = Math.max(...times) - Math.min(...times);
if (span !== 10_000) throw new Error(`span ${span} != 10000`);
for (const row of rows) process.stdout.write(`${row.name} wall_start ${row.previous} -> ${row.next}\n`);
process.stdout.write(`SHORT_SPAN: receipts=${rows.length} span_ms=${span} resealed=inner-digest+sidecar prelude=unchanged wall_end=unchanged\n`);
