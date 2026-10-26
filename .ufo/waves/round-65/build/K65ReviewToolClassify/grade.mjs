// Grade the 20 registry verdict regexes empirically: run each gate once in the
// clone at 47fe2383, capture stdout/stderr separately, count distinct matching lines.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const CLONE = process.env.CLONE||'/tmp/kumitate-r65/K65ReviewToolClassify/clone';
const reg = JSON.parse(readFileSync('/tmp/kumitate-r65/K65ReviewToolClassify/gates.json', 'utf8')).gates;
const ENV = { PATH: process.env.PATH, HOME: '/tmp/kumitate-r65/K65ReviewToolClassify/home', LANG: 'C', LC_ALL: 'C', NO_COLOR: '1' };
const genc = process.argv.includes('--gen');   // no: placeholder

const results = [];
let i = 0;
const conc = Number(process.env.CONC || 4);
async function worker() {
  while (i < reg.length) {
    const g = reg[i++];
    const needs = g.needs || g.argv.find((a) => /\.(mjs|js|sh|py)$/.test(a)) || null;
    const { existsSync } = await import('node:fs');
    if (needs && !existsSync(`${CLONE}/${needs}`)) { results.push({ id: g.id, absent: needs }); continue; }
    const r = spawnSync('timeout', ['-k', '2', String(g.timeout), ...g.argv], {
      cwd: CLONE, encoding: 'utf8', env: ENV, maxBuffer: 64 << 20, timeout: (g.timeout + 20) * 1000, killSignal: 'SIGKILL',
    });
    const outLines = `${r.stdout || ''}`.split('\n').map((l) => l.trimEnd());
    const errLines = `${r.stderr || ''}`.split('\n').map((l) => l.trimEnd());
    const re = new RegExp(g.verdict);
    const hits = (lines, stream) => lines.map((l, n) => { const m = re.exec(l); return m ? { stream, n: n + 1, line: l.trim(), word: m[1] !== undefined ? m[1] : m[0] } : null; }).filter(Boolean);
    const ho = hits(outLines, 'stdout'), he = hits(errLines, 'stderr');
    const all = [...ho, ...he];
    const last = all.length ? all[all.length - 1] : null;
    results.push({
      id: g.id, rc: r.status, signal: r.signal, err: r.error ? r.error.code : null,
      outHits: ho, errHits: he,
      distinctLines: [...new Set(all.map((h) => h.line))],
      distinctWords: [...new Set(all.map((h) => h.word))],
      lastWord: last && last.word, lastStream: last && last.stream,
      clean: !!last && [0].includes(r.status) && g.clean.includes(last.word),
      stdoutTail: outLines.filter(Boolean).slice(-4), stderrTail: errLines.filter(Boolean).slice(-4),
    });
  }
}
await Promise.all(Array.from({ length: conc }, worker));
writeFileSync('/tmp/kumitate-r65/K65ReviewToolClassify/grade.json', JSON.stringify(results, null, 1));
for (const r of results) {
  if (r.absent) { console.log(`${r.id.padEnd(30)} ABSENT needs=${r.absent}`); continue; }
  console.log(`${r.id.padEnd(30)} rc=${String(r.rc).padEnd(4)} sig=${String(r.signal).padEnd(6)} out=${r.outHits.length} err=${r.errHits.length} words=${JSON.stringify(r.distinctWords)} lines=${r.distinctLines.length} last=${r.lastWord}@${r.lastStream} clean=${r.clean}${r.err ? ' ERR=' + r.err : ''}`);
}
