#!/usr/bin/env node
/** CtlShortSpan receipt mutator: compress three body wall_start values to a 10 s span and reseal digests/sidecars. Exit 0 on success, 1 on invalid input or clock shape, 64 on usage. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const [dirArg, ...rest] = process.argv.slice(2);
if (!dirArg || rest.length) {
  process.stderr.write('USAGE node mutate-short-span.mjs <receipts-dir>\n');
  process.exit(64);
}
const dir = resolve(dirArg);
const names = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sortKeys = (value) => Array.isArray(value) ? value.map(sortKeys)
  : (value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]))
    : value);
const canonical = (value) => JSON.stringify(sortKeys(value));
const digestOf = (record) => {
  const copy = { ...record };
  delete copy.digest;
  return sha256(canonical(copy));
};

const records = names.map((name) => {
  const file = join(dir, name);
  const lines = readFileSync(file, 'utf8').split('\n');
  if (lines.length !== 3 || lines[2] !== '' || !lines[0].startsWith('run-at: ')) {
    throw new Error(`bad receipt shape: ${name}`);
  }
  const body = JSON.parse(lines[1]);
  const start = Date.parse(body.wall_start);
  const end = Date.parse(body.wall_end);
  const prelude = Date.parse(lines[0].slice('run-at: '.length));
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(prelude)) {
    throw new Error(`bad receipt clocks: ${name}`);
  }
  return { name, file, lines, body, oldStart: body.wall_start, oldDigest: body.digest, start, end, prelude };
});
const spanOf = (values) => Math.max(...values) - Math.min(...values);
const before = spanOf(records.map((record) => record.start));
const base = Math.min(...records.map((record) => record.start)) - 1000;
for (const [index, record] of [...records].sort((a, b) => a.start - b.start).entries()) {
  record.newStartMs = base + index * 5000;
}

for (const record of records) {
  const { body, lines, file, name, newStartMs, end, prelude } = record;
  if (end < newStartMs || prelude < Math.min(newStartMs, end) - 60_000 || prelude > Math.max(newStartMs, end) + 60_000) {
    throw new Error(`mutation would violate receipt-attest clocks: ${name}`);
  }
  body.wall_start = new Date(newStartMs).toISOString();
  body.digest = digestOf(body);
  const text = `${lines[0]}\n${canonical(body)}\n`;
  const bytes = Buffer.from(text, 'utf8');
  const sidecar = sha256(bytes);
  writeFileSync(file, bytes);
  writeFileSync(`${file}.sha256`, `${sidecar}  ${basename(file)}\n`);
  process.stdout.write(`${JSON.stringify({ receipt: name, old_wall_start: record.oldStart, new_wall_start: body.wall_start, old_digest: record.oldDigest, new_digest: body.digest, sidecar_sha256: sidecar })}\n`);
}
const after = spanOf(records.map((record) => record.newStartMs));
if (after !== 10_000) throw new Error(`unexpected mutated span: ${after}`);
process.stdout.write(`SPAN_BEFORE_MS=${before}\nSPAN_AFTER_MS=${after}\n`);
