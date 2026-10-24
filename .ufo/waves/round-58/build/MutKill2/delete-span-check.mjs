// MutKill2 auxiliary: delete exactly the receipt-evidence SPAN_SHORT comparison in a scratch copy.
// Contract: writes only beneath this script's build directory and requires one unique target line.
// Exit 0 = one guard line deleted; exit 1 = out-of-bounds path or zero/multiple target lines.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const build = dirname(fileURLToPath(import.meta.url));
const tool = resolve(process.argv[2] || '');
if (!tool.startsWith(`${build}/`)) throw new Error(`tool path outside ${build}`);
const lines = readFileSync(tool, 'utf8').split('\n');
const matches = lines
  .map((line, index) => ({ line, index }))
  .filter(({ line }) => /^\s*if \(span < minSpan\) unmet\('SPAN_SHORT',/.test(line));
if (matches.length !== 1) throw new Error(`span-check target count ${matches.length}, want 1`);
const [{ line, index }] = matches;
lines.splice(index, 1);
writeFileSync(tool, lines.join('\n'));
process.stdout.write(`MUTATION: deleted source-line=${index + 1} text=${JSON.stringify(line.trim())}\n`);
