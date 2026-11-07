#!/usr/bin/env node
/**
 * extract.mjs — pull declaredPins() and its four regex constants out of a
 * round-gate.mjs byte image, verbatim, into an importable module.
 *
 * Extraction rule (recorded exactly): let S = index of the first line beginning
 * "const SOURCES_ROW_RE = "; let F = index of "function declaredPins(" after S;
 * let B = index of the first "{" after F; walk forward from B counting braces;
 * the extract runs from S through the "}" that closes the function, and the
 * function's own closing brace is the first line equal to "}" after F (the
 * function has no nested column-0 brace).  The slice must contain exactly the
 * four `const SOURCES_*_RE` declarations plus `function declaredPins`.  The
 * result is written as an ESM module exporting `declaredPins`.
 *
 * usage: node extract.mjs <tool.mjs> <out.mjs>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [toolPath, outPath] = process.argv.slice(2);
if (!toolPath || !outPath) {
  console.error('usage: node extract.mjs <tool.mjs> <out.mjs>');
  process.exit(64);
}
const src = readFileSync(toolPath, 'utf8');

const S = src.indexOf('\nconst SOURCES_ROW_RE = ');
if (S < 0) { console.error('SOURCES_ROW_RE not found'); process.exit(2); }
const start = S + 1;
const F = src.indexOf('function declaredPins(', start);
if (F < 0) { console.error('declaredPins not found'); process.exit(2); }
const braceOpen = src.indexOf('{', F);
let depth = 0;
let end = -1;
for (let i = braceOpen; i < src.length; i++) {
  const ch = src[i];
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end < 0) { console.error('unbalanced function'); process.exit(2); }

const slice = src.slice(start, end);
const consts = [...slice.matchAll(/^const (SOURCES_[A-Z_]+) = /gm)].map((m) => m[1]);
const want = ['SOURCES_ROW_RE', 'SOURCES_URL_RE', 'SOURCES_PIN_RE', 'SOURCES_SEGMENT_RE'];
if (consts.join(',') !== want.join(',')) {
  console.error(`unexpected constants: ${consts.join(',')}`);
  process.exit(2);
}
if ((slice.match(/^function /gm) ?? []).length !== 1) {
  console.error('unexpected number of functions in slice'); process.exit(2);
}

const mod = `/* extracted verbatim from ${toolPath} bytes [${start},${end}) */\n`
  + slice + '\nexport { declaredPins };\n';
writeFileSync(outPath, mod);
console.log(JSON.stringify({ tool: toolPath, start, end, bytes: end - start, consts, out: outPath }));
