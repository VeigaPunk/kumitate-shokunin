#!/usr/bin/env node
/* MutKill1 scratch fixture: zero attest-run-1's stdout digest, preserve its
 * nonce and prelude, reseal the inner digest and sidecar. Exit 0 on success,
 * 1 on an unexpected receipt shape, 64 on usage. Writes only in the scratch lane. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const [lane, ...rest] = process.argv.slice(2);
if (!lane || rest.length) {
  process.stderr.write('usage: node forge-receipt.mjs <scratch-lane>\n');
  process.exit(64);
}
const file = join(lane, '.ufo/waves/round-58/receipts/attest-run-1.txt');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
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
const originalText = readFileSync(file, 'utf8');
const lines = originalText.split('\n');
if (lines.length !== 3 || lines[2] !== '') {
  process.stderr.write('unexpected receipt framing\n');
  process.exit(1);
}
const body = JSON.parse(lines[1]);
const before = body.stdout_sha256;
const nonce = body.nonce;
const prelude = lines[0];
if (!/^[0-9a-f]{64}$/.test(before || '') || !/^[0-9a-f]{32}$/.test(nonce || '')) {
  process.stderr.write('unexpected receipt fields\n');
  process.exit(1);
}
body.stdout_sha256 = '0'.repeat(64);
body.digest = digestOf(body);
const forgedText = `${prelude}\n${canonical(body)}\n`;
writeFileSync(file, forgedText);
writeFileSync(`${file}.sha256`, `${sha256(Buffer.from(forgedText))}  ${basename(file)}\n`);
process.stdout.write(`${JSON.stringify({
  file,
  nonce,
  nonce_preserved: nonce === JSON.parse(originalText.split('\n')[1]).nonce,
  stdout_sha256_before: before,
  stdout_sha256_after: body.stdout_sha256,
  inner_digest_after: body.digest,
  sidecar_sha256_after: sha256(Buffer.from(forgedText)),
})}\n`);
