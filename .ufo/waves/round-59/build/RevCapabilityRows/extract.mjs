#!/usr/bin/env node
/**
 * Read-only extractor for RevCapabilityRows.
 * Mirrors repair59-probe.mjs B4 string predicates on git show <rev>:SCORECARD.md.
 * Does not write outside this process's stdout/stderr.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const scoreRev = '5469c0a58d7986ff8a5f203938ae1c8785a92213';
const baseRev = '0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f';

function gitShow(rev) {
  return spawnSync('git', ['-C', lane, 'show', `${rev}:SCORECARD.md`], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

function firstCell(line) {
  if (!line.startsWith('|')) return '';
  const i = line.indexOf('|', 1);
  if (i < 0) return '';
  return line.slice(1, i).trim();
}

function windowAt(line, needle) {
  const i = line.indexOf(needle);
  if (i < 0) return 'ABSENT';
  const a = Math.max(0, i - 40);
  const b = Math.min(line.length, i + needle.length + 40);
  return `index=${i} context=${JSON.stringify(line.slice(a, b))}`;
}

function analyze(label, text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const capStart = lines.findIndex((l) => l === '## Capabilities');
  let capEnd = lines.length;
  if (capStart >= 0) {
    for (let i = capStart + 1; i < lines.length; i += 1) {
      if (lines[i].startsWith('## ')) {
        capEnd = i;
        break;
      }
    }
  }
  const cap = lines.filter((l) => l.startsWith('| `'));
  const citeRows = cap.filter((l) => l.startsWith('| `cite-sources` |'));
  const receiptRows = cap.filter((l) => l.startsWith('| `receipt-evidence` |'));
  const mapRows = cap.filter((l) => l.startsWith('| `readme-map` |'));
  const map = mapRows[0] || '';
  const cite = citeRows.length > 0;
  const receipt = receiptRows.length > 0;
  const mapv2 = map.includes('v2');
  const sixteen = map.includes('16/16');
  const stale135 = map.includes('files=135');
  const ok = cite && receipt && mapv2 && sixteen && !stale135;

  process.stdout.write(`== ${label} ==\n`);
  process.stdout.write(`bytes=${Buffer.byteLength(text)} sha256=${createHash('sha256').update(text).digest('hex')}\n`);
  process.stdout.write(`capabilities-heading-line=${capStart < 0 ? 'ABSENT' : capStart + 1} next-h2-line=${capEnd + 1}\n`);
  process.stdout.write(`backtick-prefixed-table-rows=${cap.length}\n`);
  lines.forEach((l, i) => {
    if (!l.startsWith('| `')) return;
    const inCap = capStart >= 0 && i > capStart && i < capEnd;
    process.stdout.write(
      `ROW line=${i + 1} inCapabilitiesSection=${inCap} firstCell=${JSON.stringify(firstCell(l))}\n`,
    );
  });
  process.stdout.write(
    `B4 cite=${cite} receipt=${receipt} mapv2=${mapv2} 16/16=${sixteen} stale135=${stale135} ok=${ok}\n`,
  );
  process.stdout.write(`cite-sources-row-count=${citeRows.length}\n`);
  process.stdout.write(`receipt-evidence-row-count=${receiptRows.length}\n`);
  process.stdout.write(`readme-map-row-count=${mapRows.length}\n`);
  process.stdout.write(`FIRST receipt-evidence=${JSON.stringify(firstCell(receiptRows[0] || ''))}\n`);
  process.stdout.write(`FIRST cite-sources=${JSON.stringify(firstCell(citeRows[0] || ''))}\n`);
  process.stdout.write(`FIRST readme-map=${JSON.stringify(firstCell(map))}\n`);
  if (map) {
    process.stdout.write(`readme-map v2 ${windowAt(map, 'v2')}\n`);
    process.stdout.write(`readme-map 16/16 ${windowAt(map, '16/16')}\n`);
    process.stdout.write(`readme-map files=135 ${windowAt(map, 'files=135')}\n`);
    process.stdout.write(`readme-map files-tokens=${JSON.stringify(map.match(/files=\d+/g))}\n`);
    process.stdout.write(`readme-map contains-substring-v1=${map.includes('v1')} ${windowAt(map, 'v1')}\n`);
    process.stdout.write(`readme-map contains-14/14=${map.includes('14/14')}\n`);
    process.stdout.write('README_MAP_ROW_BEGIN\n');
    process.stdout.write(`${map}\n`);
    process.stdout.write('README_MAP_ROW_END\n');
  }
  for (const name of ['receipt-evidence', 'cite-sources']) {
    const row = cap.find((l) => l.startsWith(`| \`${name}\` |`)) || '';
    process.stdout.write(`${name.toUpperCase().replace(/-/g, '_')}_ROW_BEGIN\n`);
    process.stdout.write(`${row}\n`);
    process.stdout.write(`${name.toUpperCase().replace(/-/g, '_')}_ROW_END\n`);
  }
  let hits = 0;
  lines.forEach((l, i) => {
    if (!l.includes('files=135')) return;
    hits += 1;
    process.stdout.write(
      `files=135-at-line=${i + 1} isReadmeMapCapRow=${l.startsWith('| `readme-map` |')} inCapabilitiesSection=${capStart >= 0 && i > capStart && i < capEnd}\n`,
    );
  });
  process.stdout.write(`files=135-line-count=${hits}\n`);
  process.stdout.write(`ITEM_OK=${ok}\n`);
}

const shown = gitShow(scoreRev);
if (shown.status !== 0) {
  process.stderr.write(`git show score failed status=${shown.status}\n${shown.stderr || ''}`);
  process.exit(2);
}
const wt = readFileSync(`${lane}/SCORECARD.md`, 'utf8');
process.stdout.write(`worktree-equals-score-rev=${wt === shown.stdout}\n`);
process.stdout.write(
  `worktree-sha256=${createHash('sha256').update(wt).digest('hex')}\n`,
);
analyze('score-rev', shown.stdout);

const base = gitShow(baseRev);
if (base.status !== 0) {
  process.stderr.write(`git show base failed status=${base.status}\n${base.stderr || ''}`);
  process.exit(2);
}
process.stdout.write('\n');
analyze('base-rev-supplement-not-the-item-subject', base.stdout);
