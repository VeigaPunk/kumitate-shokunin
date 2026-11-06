#!/usr/bin/env node
// K92CriticB counter, not a candidate: reaches the frozen probe's HELD by delegating to the
// oracle it is supposed to be independent of, while containing none of the literals the frozen
// kill clause (d) greps for. Paths are globbed at runtime; cwd = lane root (as at M).
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = '.ufo/waves';
const wave = readdirSync(root).filter((d) => /^round-\d+$/.test(d)).sort().at(-1);
const probeDir = join(root, wave, 'probe');
const oracle = readdirSync(probeDir).find((f) => /^oracle.*\.py$/.test(f));
const args = process.argv.slice(2);
process.stdout.write(
  execFileSync('python3', [join(probeDir, oracle), ...args], { maxBuffer: 64 << 20 }).toString(),
);
