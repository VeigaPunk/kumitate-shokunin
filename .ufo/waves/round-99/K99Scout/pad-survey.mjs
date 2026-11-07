#!/usr/bin/env node
// K99Scout pad survey (read-only).
//
// Counts Registry rows whose ANY cell carries, at either edge, a character that
// ECMAScript String.prototype.trim() strips but the POSIX "blank" class
// /^[ \t]+|[ \t]+$/ does NOT strip.
//
// trim-only set (ECMA-262 TrimString: WhiteSpace + LineTerminator), minus the
// two chars the blank class also strips (SP \u0020, TAB \u0009):
//   VT \u000B, FF \u000C, LF \u000A, CR \u000D, LS \u2028, PS \u2029,
//   NBSP \u00A0, Zs \u1680 \u2000-\u200A \u202F \u205F \u3000, ZWNBSP \uFEFF
//
// Usage: node pad-survey.mjs <label> <file> [<label> <file> ...]
//        node pad-survey.mjs --stdin <label>   (content on stdin)
// Emits one TSV line per offending row and a summary to stderr.

import { readFileSync } from 'node:fs';

// TRIM_ONLY is computed from the JS runtime itself, not hand-listed: every code
// point c with c.trim() === '' (JS TrimString strips it) that the POSIX blank
// class /[ \t]/ does NOT strip. Derived here so the survey cannot drift from
// the runtime the tool under test uses.
const TRIM_ONLY = new Set();
for (let cp = 0; cp <= 0x10FFFF; cp += 1) {
  if (cp >= 0xD800 && cp <= 0xDFFF) continue;
  const ch = String.fromCodePoint(cp);
  if (ch.trim() !== '') continue;
  if (/^[ \t]$/.test(ch)) continue; // blank class strips it too
  TRIM_ONLY.add(ch);
}

function nameOf(ch) {
  const c = ch.codePointAt(0);
  const hex = 'U+' + c.toString(16).toUpperCase().padStart(4, '0');
  const known = {
    '\u000A': 'LF', '\u000B': 'VT', '\u000C': 'FF', '\u000D': 'CR',
    '\u2028': 'LS', '\u2029': 'PS', '\u00A0': 'NBSP', '\u1680': 'OGHAM_SPACE',
    '\u202F': 'NNBSP', '\u205F': 'MMSP', '\u3000': 'IDEOGRAPHIC_SPACE',
    '\uFEFF': 'ZWNBSP',
  };
  if (known[ch]) return `${hex}(${known[ch]})`;
  if (c >= 0x2000 && c <= 0x200A) return `${hex}(EN_QUAD..HAIRSP)`;
  return hex;
}

// Section grammar mirrors sources-check.mjs (r97) / census row_pass.
function registrySections(lines) {
  const sec = new Array(lines.length).fill(null);
  let active = null;
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    if (/^ {0,3}##[ \t]/.test(raw)) {
      active = raw.replace(/^ {0,3}##/, '').replace(/^[ \t]+|[ \t]+$/g, '');
    } else if (/^ {0,3}#[ \t]/.test(raw)) {
      active = null;
    }
    sec[i] = active;
  }
  return sec;
}

// A cell's "edge pad" is what a reader removes from the edge. The POSIX blank
// class /[ \t]/ removes an ASCII SP/TAB run; JS trim() removes that run plus the
// TRIM_ONLY characters that sit next to it. So the probe is: strip the leading
// [ \t] run, then look for TRIM_ONLY characters immediately after it (and
// symmetrically at the trailing edge). A TRIM_ONLY char buried in the middle of
// a cell is not an edge pad and is not counted.
function edgePads(value) {
  const lead = [];
  let i = 0;
  while (i < value.length && (value[i] === ' ' || value[i] === '\t')) i += 1;
  while (i < value.length && TRIM_ONLY.has(value[i])) { lead.push(value[i]); i += 1; }
  const trail = [];
  let j = value.length - 1;
  while (j >= 0 && (value[j] === ' ' || value[j] === '\t')) j -= 1;
  while (j >= 0 && TRIM_ONLY.has(value[j])) { trail.unshift(value[j]); j -= 1; }
  return { lead, trail };
}

export function survey(label, text) {
  const lines = text.split('\n');
  const sec = registrySections(lines);
  const out = [];
  let rows = 0;
  let registryRows = 0;
  let asciiPadCells = 0;      // cells whose edge pad is ASCII SP/TAB only
  let noPadCells = 0;         // cells with no edge pad at all
  const offendingRows = new Set();  // "line" of rows with >=1 offending cell
  const asciiPadClasses = new Set();
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!/^ {0,3}\|/.test(line)) continue;
    if (sec[i] !== 'Registry') continue;
    registryRows += 1;
    const body = line.replace(/^ {0,3}/, '');
    const fields = body.split('|');
    if (fields.length < 3) continue;
    const cells = fields.slice(1, fields.length - 1); // interior cells
    if (cells.length === 0) continue;
    const idCell = cells[0] ?? '';
    const idTrimmed = idCell.trim();
    const isSeparator = idTrimmed.toLowerCase() === 'id' || /^:?-{3,}:?$/.test(idTrimmed);
    if (!isSeparator) rows += 1;
    const cellNames = ['id', 'source', 'kind', 'tier', 'scope', 'anchor', 'teaches',
      'status', 'opened', 'recheck', 'used-by'];
    for (let c = 0; c < cells.length && c < 11; c += 1) {
      const { lead, trail } = edgePads(cells[c]);
      if (lead.length === 0 && trail.length === 0) {
        // record the raw ASCII edge pad (if any) for the per-lane pad profile
        const raw = cells[c];
        const leadRun = (raw.match(/^[ \t]+/) ?? [''])[0];
        const trailRun = (raw.match(/[ \t]+$/) ?? [''])[0];
        if (leadRun !== '' || trailRun !== '') {
          asciiPadCells += 1;
          if (leadRun !== '') asciiPadClasses.add('lead:' + JSON.stringify(leadRun));
          if (trailRun !== '') asciiPadClasses.add('trail:' + JSON.stringify(trailRun));
        } else noPadCells += 1;
        continue;
      }
      offendingRows.add(i + 1);
      out.push({
        label,
        line: i + 1,
        cell: cellNames[c] ?? `cell${c + 1}`,
        cellIndex: c + 1,
        id: idTrimmed,
        lead: lead.map(nameOf).join(','),
        trail: trail.map(nameOf).join(','),
        fields: fields.length,
      });
    }
  }
  return {
    label,
    out,
    registryRows,
    rows,
    asciiPadCells,
    noPadCells,
    offendingRows: offendingRows.size,
    asciiPadClasses: [...asciiPadClasses].sort(),
  };
}

function main() {
  const args = process.argv.slice(2);
  const results = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--stdin') {
      const label = args[i + 1];
      const text = readFileSync(0, 'utf8');
      results.push(survey(label, text));
      i += 1;
    } else {
      const label = args[i];
      const file = args[i + 1];
      const text = readFileSync(file, 'utf8');
      results.push(survey(label, text));
      i += 1;
    }
  }
  for (const r of results) {
    for (const row of r.out) {
      process.stdout.write([r.label, row.line, row.cell, `cell${row.cellIndex}`,
        JSON.stringify(row.id), row.lead || '-', row.trail || '-', `fields=${row.fields}`].join('\t') + '\n');
    }
  }
  const total = results.reduce((a, r) => a + r.out.length, 0);
  process.stderr.write(`rows-with-trim-only-pads: ${total}\n`);
  for (const r of results) {
    process.stderr.write([
      `  ${r.label}`,
      `registryRows=${r.registryRows}`,
      `dataRows=${r.rows}`,
      `offendingRows=${r.offendingRows}`,
      `offendingCells=${r.out.length}`,
      `asciiPadCells=${r.asciiPadCells}`,
      `noPadCells=${r.noPadCells}`,
      `asciiPadClasses=${JSON.stringify(r.asciiPadClasses)}`,
    ].join('\t') + '\n');
  }
}

if (process.argv[1] && process.argv[1].endsWith('pad-survey.mjs')) main();
