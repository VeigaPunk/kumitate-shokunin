import { readFileSync } from 'node:fs';
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
const src = readFileSync('/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md', 'utf8');
for (const l of src.split('\n')) {
  if (!/^\| S20[02] /.test(l)) continue;
  const c = cells(l);
  const id = c[1];
  const bad = [];
  if (c.length !== 13) bad.push(`${id}:NF=${c.length}`);
  const [, , source, , tier, , , , status, opened, , usedBy] = c;
  if (status !== 'mined') bad.push(`${id}:status=${status}`);
  if (opened !== '2026-10-25') bad.push(`${id}:opened=${opened}`);
  if (!usedBy.includes('corpus/knowledge/multi-agent-coordinator-topologies.md')) bad.push(`${id}:used-by-lacks-entry(usedBy=${JSON.stringify(usedBy)})`);
  if (!/https?:\/\//.test(source)) bad.push(`${id}:no-url`);
  if (tier === '') bad.push(`${id}:no-tier`);
  console.log(`T2 ${id} cells=${c.length} -> ${bad.length ? bad.join(',') : 'OK'}`);
}
