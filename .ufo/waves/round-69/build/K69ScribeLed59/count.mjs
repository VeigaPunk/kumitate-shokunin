import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
const root = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const freeze = '9401d8655970d542b81d318bdad558d6dea39397';
function frozen(path) {
  const r = spawnSync('git', ['-C', root, 'show', `${freeze}:${path}`], { encoding: 'utf8' });
  if (r.status !== 0) throw Error(r.stderr);
  return r.stdout;
}
const probePath = '.ufo/waves/round-69/probe/ledger69-probe.mjs';
const counter = frozen(probePath);
const start = counter.indexOf('function items67(text) {');
const end = counter.indexOf('\nconst spotPath =', start);
if (start < 0 || end < 0) throw Error('counter parser boundaries absent');
const items67 = runInNewContext(`${counter.slice(start, end)}\nitems67`);
console.log(`freeze=${freeze}`);
console.log(`counter-sha256=${createHash('sha256').update(counter).digest('hex')}`);
console.log(`counter-working-copy-equals-freeze=${readFileSync(`${root}/${probePath}`, 'utf8') === counter}`);
for (const mode of ['frozen', 'working']) {
  let total = 0, sections = 0;
  for (let round = 55; round <= 66; round++) {
    const path = `corpus/lessons/round-${round}-verifier-spotcheck.md`;
    const text = mode === 'frozen' ? frozen(path) : readFileSync(`${root}/${path}`, 'utf8');
    const parsed = items67(text);
    total += parsed.items.length; sections += parsed.sections.length;
    console.log(`${mode} round=${round} sections=${parsed.sections.length} items=${parsed.items.length}`);
    if (round === 59) {
      let list = 0, table = 0;
      for (const section of parsed.sections) for (const row of section) {
        if (row.fence) continue;
        if (/^([-*+]|[0-9]+[.)])\s+\S/.test(row.l)) list++;
        if (row.l.startsWith('|')) table++;
      }
      console.log(`${mode} round=59 unfenced-list-starts=${list} unfenced-pipe-rows=${table}`);
    }
  }
  console.log(`${mode} TOTAL spotchecks=12 sections=${sections} items=${total}`);
  if (total !== 61 || sections !== 12) throw Error(`${mode}: plan count differs`);
}
console.log('R59_ZERO_ITEM_PROOF: PASS');
