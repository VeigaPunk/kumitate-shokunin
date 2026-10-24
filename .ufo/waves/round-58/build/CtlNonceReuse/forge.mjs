#!/usr/bin/env node
// CtlNonceReuse auxiliary fixture builder: copy R1 receipts and reuse their committed round-52 nonce in one resealed receipt.
// Writes only the two explicitly named auxiliary receipt directories; exit 0 on a valid fixture, 1 on invalid source bytes or arguments.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const [extraction, baselineDir, forgedDir] = process.argv.slice(2);
if (!extraction || !baselineDir || !forgedDir || process.argv.length !== 5) {
  process.stderr.write('usage: node forge.mjs <r1-extraction> <baseline-receipts> <forged-receipts>\n');
  process.exit(1);
}

const sourceRel = '.ufo/waves/round-52/receipts/attest52-run-2.txt';
const targetRel = '.ufo/waves/round-58/receipts/attest-run-1.txt';
const receiptsRel = '.ufo/waves/round-58/receipts';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
};
const parse = (bytes) => {
  const text = bytes.toString('utf8');
  const lines = text.split('\n');
  if (lines.length !== 3 || lines[2] !== '') throw new Error('receipt is not exactly two lines plus a trailing newline');
  return { lines, body: JSON.parse(lines[1]) };
};

try {
  const oldSource = parse(readFileSync(join(extraction, sourceRel)));
  const oldNonce = oldSource.body.nonce;
  if (!/^[0-9a-f]{32}$/.test(oldNonce || '')) throw new Error('round-52 source nonce is not 32 lowercase hex');

  mkdirSync(baselineDir, { recursive: true });
  mkdirSync(forgedDir, { recursive: true });
  cpSync(join(extraction, receiptsRel), baselineDir, { recursive: true });
  cpSync(join(extraction, receiptsRel), forgedDir, { recursive: true });

  const targetPath = join(forgedDir, 'attest-run-1.txt');
  const originalBytes = readFileSync(join(extraction, targetRel));
  const original = parse(originalBytes);
  const forged = { ...original.body, nonce: oldNonce };
  delete forged.digest;
  const semanticOriginal = { ...original.body, nonce: oldNonce };
  delete semanticOriginal.digest;
  if (JSON.stringify(sortKeys(semanticOriginal)) !== JSON.stringify(sortKeys(forged))) {
    throw new Error('a semantic field other than nonce changed');
  }
  forged.digest = sha256(JSON.stringify(sortKeys(forged)));
  const nextBytes = Buffer.from(`${original.lines[0]}\n${JSON.stringify(sortKeys(forged))}\n`, 'utf8');
  writeFileSync(targetPath, nextBytes);
  writeFileSync(`${targetPath}.sha256`, `${sha256(nextBytes)}  ${basename(targetPath)}\n`);

  const changedFields = Object.keys(sortKeys({ ...original.body, ...forged }))
    .filter((key) => JSON.stringify(original.body[key]) !== JSON.stringify(forged[key]))
    .sort();
  process.stdout.write(`round52_source=${sourceRel}\n`);
  process.stdout.write(`target=${targetRel}\n`);
  process.stdout.write(`original_nonce=${original.body.nonce}\n`);
  process.stdout.write(`forged_nonce=${forged.nonce}\n`);
  process.stdout.write(`changed_body_fields=${changedFields.join(',')}\n`);
  process.stdout.write(`recomputed_digest=${forged.digest}\n`);
  process.stdout.write(`receipt_sha256=${sha256(nextBytes)}\n`);
} catch (error) {
  process.stderr.write(`forge failed: ${error.stack || error}\n`);
  process.exit(1);
}
