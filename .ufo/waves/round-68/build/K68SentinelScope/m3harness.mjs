import { normalize, join, sep } from 'node:path';
const A = '/fast/scratch/hyaku/kumitate-r68/K68SentinelScope/archive';
// verbatim predicate from .ufo/waves/round-68/probe/deprec68-probe.mjs:196-199
function guard(pinPath) {
  const p = normalize(pinPath || '');
  if (p.startsWith('..') || p.startsWith(sep) || p.includes(`..${sep}`)) return 'path-escape';
  const fullP = normalize(join(A, p));
  if (!fullP.startsWith(normalize(A) + sep)) return 'path-outside';
  return 'allowed:' + fullP;
}
for (const c of ['corpus/captures/s207.md','../etc/passwd','.ufo/../../../etc/passwd','/etc/passwd','', '.', 'a/../..', './/../../x', 'corpus/../x', '..foo/x.md', 'C:\\tmp\\x', '.ufo/pins/source-captures.json', 'sub/..']) {
  console.log(JSON.stringify(c).padEnd(30), '->', guard(c));
}
