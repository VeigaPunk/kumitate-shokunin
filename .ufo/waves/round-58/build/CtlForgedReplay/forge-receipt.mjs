#!/usr/bin/env node
// CtlForgedReplay auxiliary mutator: reseal a scratch receipt with a zeroed stdout digest.
// Input is one receipt path inside the seat's sandbox clone; output is mutation metadata.
// Exit 0 = expected scratch mutation written; 1 = input or mutation invariant failed.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  process.stderr.write('usage: node forge-receipt.mjs <scratch-receipt>\n');
  process.exit(1);
}
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

const beforeText = readFileSync(file, 'utf8');
const lines = beforeText.split('\n');
if (lines.length !== 3 || lines[2] !== '') throw new Error('receipt is not two lines plus trailing newline');
const before = JSON.parse(lines[1]);
const after = { ...before, stdout_sha256: '0'.repeat(64) };
delete after.digest;
after.digest = digestOf(after);
const afterText = `${lines[0]}\n${canonical(after)}\n`;
writeFileSync(file, afterText);
writeFileSync(`${file}.sha256`, `${sha256(Buffer.from(afterText))}  attest-run-1.txt\n`);

const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
const changedFields = keys.filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
const metadata = {
  file,
  nonce_before: before.nonce,
  nonce_after: after.nonce,
  nonce_unchanged: before.nonce === after.nonce,
  stdout_sha256_before: before.stdout_sha256,
  stdout_sha256_after: after.stdout_sha256,
  stdout_zeroed: after.stdout_sha256 === '0'.repeat(64),
  digest_before: before.digest,
  digest_after: after.digest,
  changed_fields: changedFields,
  receipt_sha256_after: sha256(Buffer.from(afterText)),
};
process.stdout.write(`${JSON.stringify(metadata, null, 2)}\n`);
if (!metadata.nonce_unchanged || !metadata.stdout_zeroed
    || JSON.stringify(changedFields) !== JSON.stringify(['digest', 'stdout_sha256'])) {
  process.exit(1);
}
