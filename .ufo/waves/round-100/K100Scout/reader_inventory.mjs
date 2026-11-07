#!/usr/bin/env node
/**
 * reader_inventory.mjs (K100Scout, round 100) -- inventory of every reader of
 * SOURCES row ids in the fleet lanes' scripts/ directories.
 *
 *   node reader_inventory.mjs <fleet-root>
 *
 * For each file under <fleet-root>/*-shokunin/scripts/ it reports every line
 * that looks like a row-id reader: a regex/pattern whose literal mentions an
 * S### id class, together with the flags in force and the split mode used.
 * It classifies each hit against the census row gate
 * (`^ {0,3}\|` + id cell trimmed of ASCII SP/TAB only).
 *
 * Report-only. Reads nothing but the fleet's scripts/ trees.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || '/home/vgpnk/Projects/shokunin';
const SCAN_EXT = new Set(['.mjs', '.js', '.cjs', '.ts', '.py', '.sh', '.bash', '']);

// --- the census row gate, for the classification column -----------------
const CENSUS_GATE = /^ {0,3}\|/;          // row gate
const CENSUS_ID = /^S[0-9]{3,}$/;          // id form
const JS_BLANK = '[ \\t]';                  // ASCII SP/TAB (POSIX blank)

function classify(literal, flags) {
  const notes = [];
  const hasM = flags.includes('m');
  const hasG = flags.includes('g');
  // indent gate
  let indent = 'unknown';
  if (/^\^\{0,3\}\\\|/.test(literal) || literal.includes('^ {0,3}\\|')) indent = '0-3 ASCII SP (census-conformant)';
  else if (literal.includes('^\\s*\\|')) indent = 'JS \\s -- accepts TAB/NBSP/4+ SP (DIVERGES)';
  else if (literal.includes('^ {0,3}\\|')) indent = '0-3 ASCII SP (census-conformant)';
  else if (/^\^\\\|/.test(literal)) indent = 'column 0 only (stricter than census)';
  else indent = 'not a row-gate literal';
  // id-cell pad
  let pad = 'unknown';
  if (literal.includes('\\s*') || literal.includes('[ \\t]*')) {
    if (/\\s\*\((S|S\\d)/.test(literal) || /\[[^\]]*\\s[^\]]*\]\*\(/.test(literal)) {
      pad = 'JS \\s -- accepts NBSP/VT/FF/CR/U+FEFF/U+2028 (DIVERGES)';
    } else if (literal.includes('[ \\t]*')) {
      pad = 'ASCII SP/TAB only (census-conformant)';
    }
  }
  // m flag
  if (hasM) notes.push('`m` flag: `^` also matches after CR/U+2028/U+2029 (DIVERGES: gawk RS=LF)');
  if (hasG) notes.push('`g` flag');
  return { indent, pad, notes, hasM, hasG };
}

function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else {
      const ext = p.slice(p.lastIndexOf('.'));
      if (SCAN_EXT.has(ext)) out.push(p);
    }
  }
}

// find regex-ish literals mentioning an S### id class
const LITERAL_RE = /(\/(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\\n])+\/[gimsuy]*)/g;
const IDCLASS = /S\[0-9\]|S\\d/;

const lanes = [];
for (const d of readdirSync(ROOT)) {
  if (!d.endsWith('-shokunin')) continue;
  const sdir = join(ROOT, d, 'scripts');
  try { statSync(sdir); } catch { continue; }
  lanes.push([d, sdir]);
}

const rows = [];
for (const [lane, sdir] of lanes.sort()) {
  const files = [];
  walk(sdir, files);
  for (const f of files) {
    let text;
    try { text = readFileSync(f, 'utf8'); } catch { continue; }
    const lines = text.split('\n');
    lines.forEach((line, idx) => {
      // only lines that plausibly read a SOURCES row
      const mentionsSources = /SOURCES|registry|REGISTRY/i.test(line) || /SOURCES/.test(text.slice(0, 0));
      LITERAL_RE.lastIndex = 0;
      let m;
      while ((m = LITERAL_RE.exec(line)) !== null) {
        const lit = m[1];
        if (!IDCLASS.test(lit)) continue;
        const flags = lit.slice(lit.lastIndexOf('/') + 1);
        const c = classify(lit, flags);
        rows.push({
          lane, file: relative(ROOT, f), line: idx + 1,
          literal: lit, flags,
          indent: c.indent, pad: c.pad, notes: c.notes,
          source: line.trim().slice(0, 160),
        });
      }
      // python re.compile literals
      const py = line.match(/re\.compile\(\s*r?["']([^"']+)["']/);
      if (py && IDCLASS.test(py[1])) {
        rows.push({
          lane, file: relative(ROOT, f), line: idx + 1,
          literal: py[1], flags: 'python-re',
          indent: py[1].includes('{0,3}') ? '0-3 ASCII SP (census-conformant)'
                 : py[1].startsWith('^\\|') ? 'column 0 only (stricter than census)'
                 : py[1].includes('\\s*') ? 'JS \\s -- DIVERGES' : 'unknown',
          pad: py[1].includes('\\s*') ? 'JS \\s -- DIVERGES' : 'ASCII SP/TAB only (census-conformant)',
          notes: [], source: line.trim().slice(0, 160),
        });
      }
    });
  }
}

process.stdout.write(JSON.stringify(rows, null, 1));
