import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const seat = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-97/K97ExecTool';
const scratch = '/fast/scratch/hyaku/kumitate-r97/K97ExecTool';
const candidate = readFileSync(`${seat}/sources-check.mjs`, 'utf8');
const start = '  const sourceLines =';
const end = '    sectionAtLine[index] = activeSection;\n  }\n';
function span(text) { const a = text.indexOf(start); return [a, text.indexOf(end, a) + end.length]; }
const [a,b] = span(candidate);
const names = ['crlfstrip','spaceonly','wsclass','jstrim','trailcr','nbsp','h1loose','h1keep','emptyhead','anyindent','casefold','closeseq','h3heading','defaultin','nodisclose'];
const receipt = [`Axes: operability / selftest clause coverage / no change to per-row checks`, `Candidate: ${seat}/sources-check.mjs`, 'Command: node teeth.mjs; controls generated from frozen base by make-controls97.py'];
let killed = 0;
for (const name of names) {
  const control = readFileSync(`${scratch}/ctrl-src/ctl-${name}.mjs`, 'utf8');
  const [c,d] = span(control);
  let text = candidate.slice(0,a) + control.slice(c,d) + candidate.slice(b);
  if (name === 'nodisclose') text = text.replace("        add('error', 'ROW_OUTSIDE_REGISTRY',", "        if (false) add('error', 'ROW_OUTSIDE_REGISTRY',");
  const dir = `${scratch}/teeth-retained/${name}`;
  mkdirSync(dir, {recursive:true});
  writeFileSync(`${dir}/sources-check.mjs`, text);
  for (const file of ['cap-spawn.mjs','cap-run.mjs']) copyFileSync(`${seat}/${file}`, `${dir}/${file}`);
  const r = spawnSync(process.execPath, [`${dir}/sources-check.mjs`, '--selftest'], {encoding:'utf8', timeout:60000, env:{...process.env,TMPDIR:scratch}});
  const output = (r.stdout ?? '') + (r.stderr ?? '');
  writeFileSync(`${seat}/teeth-${name}.txt`, output);
  const failures = [...output.matchAll(/^FAIL (r97sec-.*)$/gm)].map(m=>m[1]);
  const ok = r.status === 1 && failures.length > 0;
  if (ok) killed++;
  receipt.push(`${name}: ${ok?'KILLED':'SURVIVED'} exit=${r.status} new-arms=[${failures.join('; ')}] receipt=teeth-${name}.txt`);
}
receipt.push(`Arm teeth: ${killed}/15`);
writeFileSync(`${seat}/arm-teeth.txt`, receipt.join('\n')+'\n');
console.log(receipt.join('\n'));
process.exitCode = killed===15?0:1;
