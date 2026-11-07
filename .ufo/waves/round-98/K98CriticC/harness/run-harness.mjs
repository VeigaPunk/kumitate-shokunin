#!/usr/bin/env node
/**
 * run-harness.mjs — evaluate the extracted declaredPins() over files.
 *
 * usage: node run-harness.mjs <tool.mjs> <out.jsonl> <file> [<file> ...]
 * output: one JSON line per file, in argument order:
 *   {"file":..., "declared":[...], "outside":[...], "malformed":[...]}
 * `declared` is the pin set in insertion order; `outside`/`malformed` are the
 * row-id arrays in file order, exactly as declaredPins() fills them.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [toolPath, outPath, ...files] = process.argv.slice(2);
if (!toolPath || !outPath || files.length === 0) {
  console.error('usage: node run-harness.mjs <tool.mjs> <out.jsonl> <file>...');
  process.exit(64);
}
const tmp = mkdtempSync(join(tmpdir(), 'k98-harness-'));
const modPath = join(tmp, 'rule.mjs');
try {
  execFileSync(process.execPath, [new URL('./extract.mjs', import.meta.url).pathname, toolPath, modPath], { stdio: ['ignore', 'ignore', 'inherit'] });
  const { declaredPins } = await import(`file://${modPath}`);
  const lines = [];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    const malformed = [];
    const outside = [];
    const pins = declaredPins(text, malformed, outside);
    lines.push(JSON.stringify({ file: f, declared: [...pins], outside, malformed }));
  }
  writeFileSync(outPath, lines.join('\n') + '\n');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
