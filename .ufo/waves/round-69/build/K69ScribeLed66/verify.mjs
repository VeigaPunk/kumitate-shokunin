import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build = resolve(root, '.ufo/waves/round-69/build/K69ScribeLed66');
const base = '8d557f85312de4fcc82e09ff735d21436bc3746d';
const norm = s => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const wb = (q, t) => new RegExp(`(^|[^A-Za-z0-9])${norm(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(t));
const check = (ok, reason) => { if (!ok) throw Error(reason); };
const source = readFileSync(resolve(root, 'corpus/lessons/round-66-verifier-spotcheck.md'), 'utf8');
const section = source.split('## Routed defects for round 67\n')[1];
check(section, 'routed section missing');
const items = section.split('\n').filter(s => /^- /.test(s));
const rows = readFileSync(resolve(build, 'rows.md'), 'utf8').trim().split('\n');
check(items.length === 4 && rows.length === 4, 'expected exactly four items/rows');
const output = ['Axes: operability (binding accuracy, complete item coverage); no score change claimed.', `Base: ${base}`];
let closed = 0, wontfix = 0, open = 0;
for (let i = 0; i < rows.length; i++) {
  const c = rows[i].slice(1, -1).split('|').map(x => x.trim());
  check(c.length === 7 && c[0] === `R66-D${i+1}` && c[1] === '66' && Number(c[2]) === i+1, 'row identity');
  const q = c[3].slice(1, -1), words = q.split(/\s+/).length;
  check(words >= 3 && words <= 25 && wb(q, items[i]), `${c[0]} quote binding`);
  const hits = items.filter(t => wb(q, t)).length;
  check(hits === 1, `${c[0]} quote uniqueness`);
  output.push(`${c[0]} item=${i+1} quote_words=${words} section_item_hits=${hits} status=${c[5]}`);
  if (c[5] === 'open') { check(c[6] === '-', 'open answer'); open++; continue; }
  check(['closed', 'wontfix'].includes(c[5]), 'status');
  const a = /^([^\s]+):(\d+) — "(.+)"$/.exec(c[6]);
  check(a && !a[1].startsWith('/') && !a[1].includes('..') && a[1] !== 'corpus/routed-ledger.md' && !/verifier-spotcheck\.md$/.test(a[1]), 'answer format/path');
  const line = readFileSync(resolve(root, a[1]), 'utf8').split('\n')[Number(a[2])-1];
  check(line !== undefined && wb(a[3], line), `${c[0]} exact answer line`);
  const args = ['-C', root, 'show', `${base}:${a[1]}`];
  const before = spawnSync('git', args, { encoding: 'utf8' });
  output.push(`COMMAND: git ${args.join(' ')}`);
  output.push(`EXIT=${before.status}`);
  if (before.status === 0) {
    check(!norm(before.stdout).includes(norm(a[3])), `${c[0]} answer predates base`);
    output.push('BASE_QUOTE_ABSENT=true');
  } else {
    check(before.status === 128 && /does not exist in|exists on disk, but not in/.test(before.stderr), `unexpected git failure: ${before.stderr}`);
    output.push(before.stderr.trim(), 'BASE_PATH_ABSENT=true');
  }
  output.push(`EXACT_LINE ${a[1]}:${a[2]}: ${line}`);
  if (c[5] === 'closed') closed++; else wontfix++;
}
output.push(`ROW_BINDINGS: PASS rows=4 items=4 closed=${closed} wontfix=${wontfix} open=${open}`);
output.push('L69_ROUND66_CLOSURE: NOT SATISFIED (R66-D1 open; no round-66 leftover reconciliation was observed).');
output.push('R66-D4 is an ordinal-derived identifier for the unlabelled operator note; its answer is a proposed disposition draft, not promotion evidence.');
const receipt = output.join('\n')+'\n';
writeFileSync(resolve(build, 'verification.txt'), receipt);
console.log(receipt);
