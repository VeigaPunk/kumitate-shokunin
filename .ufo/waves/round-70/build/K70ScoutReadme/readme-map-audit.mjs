// K70ScoutReadme read-only audit: index rows vs corpus files vs pins. Reads only; writes to stdout.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const [,, lane, readmePath, pinsPath] = process.argv;
const readme = readFileSync(readmePath, 'utf8');
const reg = JSON.parse(readFileSync(pinsPath, 'utf8'));
const files = ['knowledge', 'lessons'].flatMap(d => readdirSync(join(lane, 'corpus', d)).filter(n => n.endsWith('.md')).map(n => `${d}/${n}`)).sort();
const rows = []; const malformed = []; const lines = readme.split('\n');
lines.forEach((l0, i) => {
  const l = l0.replace(/^ {0,3}/, '');
  if (!l.startsWith('|')) return;
  const m = l.match(/^\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|/);
  if (m) rows.push({ path: m[1], line: i + 1 }); else {
    const fc = l.split('|')[1];
    if (fc && /^\s*`?(knowledge|lessons)\//.test(fc)) malformed.push(`line ${i + 1}: ${fc.trim().slice(0, 80)}`);
  }
});
const rowPaths = rows.map(r => r.path);
const fset = new Set(files), rset = new Set(rowPaths), cset = new Set(reg.covered);
const out = {
  version: reg.version, files: files.length, rows: rows.length, uniqueRows: rset.size, covered: reg.covered.length, uniqueCovered: cset.size,
  malformedRows: malformed,
  duplicateRows: rowPaths.filter((p, i) => rowPaths.indexOf(p) !== i),
  orphanRows: rowPaths.filter(p => !fset.has(p)),
  uncoveredFiles: files.filter(f => !rset.has(f)),
  unpinnedFiles: files.filter(f => !cset.has(f)),
  stalePins: reg.covered.filter(c => !fset.has(c)),
  rowLinesOutsideCoverageMap: rows.filter(r => r.line > 203).map(r => `${r.line}:${r.path}`),
};
console.log(JSON.stringify(out, null, 2));
