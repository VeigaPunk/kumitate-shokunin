#!/usr/bin/env node
// Round-39 C2 measurement: does `anchor-truth --base <frozen floor>` accept hand edits that
// lose a base-true anchor or forge a true one? Runs in a throwaway clone of the lane at --rev;
// never writes the lane. Prints one line per attack and `FLOOR_PROBE accepted=<a>/<n>`.
// Usage: node floor-probe.mjs --lane <lane repo> --rev <commit> --src <pinned source clone>
// Exit 0 when the probe ran (whatever it measured), 2 when the control run is not CLEAN.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'e18ff1af3392e3823227644c977c237737fe65c9';
const S8 = 'corpus/knowledge/remaining-scripts-census.md';
const PIN = '.ufo/pins/anchor-truth.json';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const lane = arg('--lane'); const rev = arg('--rev'); const src = arg('--src');
if (!lane || !rev || !src) { process.stderr.write('usage: --lane <repo> --rev <commit> --src <clone>\n'); process.exit(64); }
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', ...opts });

const tmp = mkdtempSync(join(tmpdir(), 'r39-floor-probe-'));
const dir = join(tmp, 'lane');
try {
  if (sh('git', ['clone', '-q', '--no-hardlinks', lane, dir]).status !== 0) throw new Error('clone failed');
  if (sh('git', ['-C', dir, 'checkout', '-q', '--detach', rev]).status !== 0) throw new Error(`checkout ${rev} failed`);
  const full = sh('git', ['-C', dir, 'rev-parse', 'HEAD']).stdout.trim();
  const pristinePin = readFileSync(join(dir, PIN), 'utf8');
  const pristineNote = readFileSync(join(dir, S8), 'utf8');
  const tool = (extra = []) => {
    const r = sh(process.execPath, [join(dir, 'scripts/anchor-truth.mjs'), '--self', dir, '--src', src, ...extra]);
    const out = r.stdout ?? '';
    return { status: r.status, out, verdict: out.trim().split('\n').pop() ?? '' };
  };
  const reset = () => { writeFileSync(join(dir, PIN), pristinePin); writeFileSync(join(dir, S8), pristineNote); };
  const editPin = (f) => { const p = JSON.parse(pristinePin); f(p.notes[S8].entries, p); writeFileSync(join(dir, PIN), JSON.stringify(p, null, 1) + '\n'); };
  const srcLines = (path, a, b) => sh('git', ['-C', src, 'show', `${sh('git', ['-C', src, 'rev-parse', 'HEAD']).stdout.trim()}:${path}`]).stdout.split('\n').slice(a - 1, b).join('\n');

  const control = tool(['--base', BASE]);
  process.stdout.write(`FLOOR_PROBE lane-rev=${full} base=${BASE}\nCONTROL exit=${control.status} ${control.verdict}\n`);
  if (control.status !== 0) { process.stdout.write('FLOOR_PROBE: INVALID (control not CLEAN)\n'); process.exitCode = 2; }
  else {
    const attacks = [
      ['A1-closure-r38-missing-key', () => editPin((E) => Object.assign(E[3], { token: null, expect: 'unchecked', source: 'pair', key: 'closure-r38-missing-base-key' }))],
      ['A2-valid-shaped-key', () => editPin((E) => Object.assign(E[3], { token: null, expect: 'unchecked', source: 'pair', key: `${E[3].path}|#|${E.length}` }))],
      ['A3-forged-true-token', () => editPin((E) => {
        const d = E.find((e) => e.expect === 'debt:false' && e.path);
        const seg = srcLines(d.path, d.a, d.b);
        const tok = (seg.match(/[A-Za-z_][A-Za-z0-9_]{2,}/u) ?? [null])[0];
        Object.assign(d, { token: tok, expect: 'true' });
      })],
      ['A4-hand-source', () => editPin((E) => Object.assign(E[3], { token: null, expect: 'unchecked', source: 'hand', key: 'hand-edit-key' }))],
      ['A5-base-true-range-widened', () => {
        const e = JSON.parse(pristinePin).notes[S8].entries[3];
        const eof = srcLines(e.path, 1, 1e9).split('\n').length;
        const wide = `${e.path}:1-${eof}`;
        if (!pristineNote.includes(`\`${e.raw}\``)) throw new Error('A5 raw not found');
        writeFileSync(join(dir, S8), pristineNote.replace(`\`${e.raw}\``, `\`${wide}\``));
        const w = tool(['--write-pin']);
        if (w.status !== 0) return `re-pin refused: ${w.verdict}`;
        return null;
      }],
    ];
    let accepted = 0;
    for (const [name, apply] of attacks) {
      reset();
      const pre = apply();
      if (typeof pre === 'string') { process.stdout.write(`REFUSED ${name} ${pre}\n`); continue; }
      const r = tool(['--base', BASE]);
      const kinds = [...new Set([...r.out.matchAll(/^TRUTH {2}(\S+)/gmu)].map((m) => m[1]))].join(',');
      if (r.status === 0) { accepted++; process.stdout.write(`ACCEPTED ${name} exit=0 ${r.verdict}\n`); }
      else process.stdout.write(`REFUSED ${name} exit=${r.status} kinds=${kinds || '-'} ${r.verdict}\n`);
    }
    process.stdout.write(`FLOOR_PROBE accepted=${accepted}/${attacks.length}\n`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
