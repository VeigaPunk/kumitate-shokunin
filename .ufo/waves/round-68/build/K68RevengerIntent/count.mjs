import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const src = readFileSync(process.argv[2], 'utf8') + '\nexport { items67 };';
import { writeFileSync } from 'node:fs';
writeFileSync(process.argv[3], src);
const { items67 } = await import(process.argv[3]);
const lane = process.argv[4];
for (const rev of process.argv.slice(5)) {
  let tot = 0, sec = 0, spots = 0; const per = [];
  for (let n = 55; n <= 66; n += 1) {
    const r = spawnSync('git', ['-C', lane, 'show', `${rev}:corpus/lessons/round-${n}-verifier-spotcheck.md`], { encoding: 'utf8', maxBuffer: 1 << 28 });
    if (r.status !== 0) { per.push(`${n}:absent`); continue; }
    spots += 1; const p = items67(r.stdout); tot += p.items.length; sec += p.sections.length;
    per.push(`${n}:i${p.items.length}/s${p.sections.length}`);
  }
  console.log(`${rev.slice(0,8)} spots=${spots} sections=${sec} items=${tot} | ${per.join(' ')}`);
}
