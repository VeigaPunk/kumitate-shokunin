#!/usr/bin/env node
/**
 * run-controls91.mjs — build and score every round-91 pre-data control with the FROZEN probe91-c1.
 *
 *   node .ufo/waves/round-91/controls/run-controls91.mjs --lane <LANE> --rev <40-hex> --work <SCRATCH>
 *        --alt <ALT-ROOT> [--probe <path>] [--out <dir>] [--jobs <n>] [--only <name,...>]
 *
 * Evidence tooling, never the counter: the counter is probe91-c1.mjs, frozen before any control is
 * scored. Every control is the base instrument at --rev (v4) or a committed round-90 construction,
 * with exactly ONE edit at the external-instrument read line
 *   `try { bytes = readFileSync(abs); } catch (e) { ... }`
 * (the line is byte-identical in v4 and in every round-90 construction; the generator refuses a
 * base that does not carry it exactly once). Variants:
 *
 *   base-v4-at-rev        no edit: the do-nothing control.
 *   dev-prefix            refuse tokens under `/dev/`, else read as v4.
 *   refuse-external       refuse every external instrument.
 *   type-only             lstat-type check (regular files only), no size cap.
 *   cap-only              lstat size > 16777216 refused, no type check.
 *   cap-edge-minus1       type check + cap at 16777215 (one byte below the declared edge).
 *   refuse-empty          type check + cap + refuse size 0.
 *   bounded-nonblock      O_NONBLOCK|O_NOFOLLOW open, bounded read of at most cap+1 bytes, no type check.
 *   ref-fd-fstat          POSITIVE control: O_RDONLY|O_NOFOLLOW|O_NONBLOCK open, fstat the descriptor,
 *                         refuse non-regular and size > 16777216, read from that descriptor.
 *   r90-global-strip+ref  round-90 reviewer cand-1 (whole-text strip) with the ref-fd-fstat graft.
 *   r90-tmpdir-gated+ref  round-90 criticA cand d (prefix tolerance only when TMPDIR is an ancestor of
 *                         --dir) with the ref-fd-fstat graft.
 *   r90-roundpath-gated+ref  round-90 criticA cand e re-keyed to this round's scratch token
 *                         (`/kumitate-r91/`) with the ref-fd-fstat graft.
 *   refuse-all            the round-90 refuse-all control.
 *   absent                a tool path that does not exist.
 *
 * Output: one line per control to <out>/table.txt (`name<TAB>verdict<TAB>failing arms<TAB>tool sha`)
 * and each control's full probe stdout to <out>/ctl-<name>.txt.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const lane = resolve(opt('--lane', '.'));
const rev = opt('--rev', '');
const workArg = opt('--work', '');
const altArg = opt('--alt', '');
const probe = resolve(opt('--probe', join(lane, '.ufo/waves/round-91/probe/probe91-c1.mjs')));
const outDir = resolve(opt('--out', join(lane, '.ufo/waves/round-91/controls')));
const jobs = Number(opt('--jobs', '4'));
const only = opt('--only', '');
if (!/^[a-f0-9]{40}$/.test(rev) || !workArg || !altArg) {
  console.error('usage: run-controls91.mjs --lane <LANE> --rev <40-hex> --work <SCRATCH> --alt <ALT>');
  process.exit(64);
}
const work = resolve(workArg);
const toolDir = join(work, 'tools');
mkdirSync(toolDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
const sha = (b) => createHash('sha256').update(b).digest('hex');

const READ_LINE = "      try { bytes = readFileSync(abs); } catch (e) { throw new FailClosed('UNRESOLVED', `${file} external instrument unreadable: ${abs} (${e.code || 'read failed'})`); }";
const FAIL = (why) => `throw new FailClosed('UNRESOLVED', \`\${file} external instrument ${why}: \${abs}\`);`;
const CAP = 16777216;
const VARIANT = {
  none: null,
  'dev-prefix': `      if (abs.startsWith('/dev/')) ${FAIL('under /dev')}\n${READ_LINE}`,
  'refuse-external': `      ${FAIL('refused (external)')}`,
  'type-only': `      if (!est.isFile()) ${FAIL('not a regular file')}\n${READ_LINE}`,
  'cap-only': `      if (est.size > ${CAP}) ${FAIL('too large')}\n${READ_LINE}`,
  'cap-edge-minus1': `      if (!est.isFile()) ${FAIL('not a regular file')}\n      if (est.size > ${CAP - 1}) ${FAIL('too large')}\n${READ_LINE}`,
  'refuse-empty': `      if (!est.isFile()) ${FAIL('not a regular file')}\n      if (est.size > ${CAP} || est.size === 0) ${FAIL('too large or empty')}\n${READ_LINE}`,
  'bounded-nonblock': [
    '      {',
    '        let xfd = null;',
    '        try {',
    '          xfd = openSync(abs, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK);',
    `          const buf = Buffer.alloc(${CAP + 1}); let n = 0; let k;`,
    `          while (n < buf.length && (k = readSync(xfd, buf, n, buf.length - n, null)) > 0) n += k;`,
    `          if (n > ${CAP}) ${FAIL('too large')}`,
    '          bytes = buf.subarray(0, n);',
    '        } catch (e) { if (e instanceof FailClosed) throw e; ' + FAIL('unreadable') + ' }',
    '        finally { if (xfd !== null) { try { closeSync(xfd); } catch { /* closed */ } } }',
    '      }',
  ].join('\n'),
  'ref-fd-fstat': [
    '      {',
    '        let xfd = null;',
    '        try {',
    '          xfd = openSync(abs, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK);',
    '          const xst = fstatSync(xfd);',
    `          if (!xst.isFile()) ${FAIL('not a regular file')}`,
    `          if (xst.size > ${CAP}) ${FAIL('too large')}`,
    '          bytes = readFileSync(xfd);',
    '        } catch (e) { if (e instanceof FailClosed) throw e; ' + FAIL('unreadable') + ' }',
    '        finally { if (xfd !== null) { try { closeSync(xfd); } catch { /* closed */ } } }',
    '      }',
  ].join('\n'),
};

function build(name, baseText, variant, rekey) {
  let text = baseText;
  const count = text.split(READ_LINE).length - 1;
  if (count !== 1) throw new Error(`${name}: read line found ${count} times`);
  if (VARIANT[variant] !== null) text = text.replace(READ_LINE, () => VARIANT[variant]);
  if (variant === 'bounded-nonblock' && !/\breadSync\b/.test(text.split('\n').find((l) => l.startsWith('import {') && l.includes('node:fs')) || '')) {
    text = text.replace(/(\bopenSync,)/, '$1 readSync,');
  }
  if (rekey) text = text.split(rekey[0]).join(rekey[1]);
  const p = join(toolDir, `${name}.mjs`);
  writeFileSync(p, text);
  return p;
}

const baseText = spawnSync('git', ['-C', lane, 'show', `${rev}:scripts/receipt-bind.mjs`], { encoding: 'utf8', maxBuffer: 64 << 20 }).stdout;
const r90 = (p) => readFileSync(join(lane, '.ufo/waves/round-90', p), 'utf8');
const controls = [
  ['base-v4-at-rev', () => build('base-v4-at-rev', baseText, 'none')],
  ['dev-prefix', () => build('dev-prefix', baseText, 'dev-prefix')],
  ['refuse-external', () => build('refuse-external', baseText, 'refuse-external')],
  ['type-only', () => build('type-only', baseText, 'type-only')],
  ['cap-only', () => build('cap-only', baseText, 'cap-only')],
  ['cap-edge-minus1', () => build('cap-edge-minus1', baseText, 'cap-edge-minus1')],
  ['refuse-empty', () => build('refuse-empty', baseText, 'refuse-empty')],
  ['bounded-nonblock', () => build('bounded-nonblock', baseText, 'bounded-nonblock')],
  ['ref-fd-fstat', () => build('ref-fd-fstat', baseText, 'ref-fd-fstat')],
  ['r90-global-strip+ref', () => build('r90-global-strip+ref', r90('K90Reviewer/cand-1-global-strip.mjs'), 'ref-fd-fstat')],
  ['r90-tmpdir-gated+ref', () => build('r90-tmpdir-gated+ref', r90('K90CriticA/cand/d-tmpdir-gated-prefix.mjs'), 'ref-fd-fstat')],
  ['r90-roundpath-gated+ref', () => build('r90-roundpath-gated+ref', r90('K90CriticA/cand/e-round-path-gated-prefix.mjs'), 'ref-fd-fstat', ['kumitate-r90', 'kumitate-r91'])],
  ['refuse-all', () => join(lane, '.ufo/waves/round-90/controls/refuse-all.mjs')],
  ['absent', () => join(lane, '.ufo/waves/round-91/controls/absent-tool-does-not-exist.mjs')],
].filter(([n]) => !only || only.split(',').includes(n));

function score(name, toolPath) {
  return new Promise((done) => {
    const w = join(work, `p-${name.replace(/[^a-z0-9-]/gi, '_')}`);
    rmSync(w, { recursive: true, force: true });
    const c = spawn(process.execPath, [probe, '--lane', lane, '--work', w, '--alt', resolve(altArg), '--rev', rev, '--tool', toolPath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.on('data', (b) => { out += b; });
    c.stderr.on('data', (b) => { out += b; });
    c.on('close', (code) => {
      rmSync(w, { recursive: true, force: true });
      writeFileSync(join(outDir, `ctl-${name}.txt`), `${out}exit=${code}\n`);
      let toolSha = 'ABSENT';
      try { toolSha = sha(readFileSync(toolPath)); } catch { /* absent */ }
      const verdict = (out.match(/^C91_C1: .*$/m) || ['ABSENT'])[0];
      const failing = [...out.matchAll(/^ARM (\S+): FAIL/gm)].map((m) => m[1]).join(',');
      done(`${name}\t${verdict}\t${failing}\tsha256=${toolSha}`);
    });
  });
}

const built = controls.map(([n, f]) => [n, f()]);
const rows = new Array(built.length);
let next = 0;
async function worker() {
  while (next < built.length) {
    const i = next++;
    rows[i] = await score(built[i][0], built[i][1]);
    console.log(rows[i]);
  }
}
await Promise.all(Array.from({ length: Math.max(1, jobs) }, worker));
const prior = only ? '' : '';
writeFileSync(join(outDir, only ? `table-${only.replace(/,/g, '_')}.txt` : 'table.txt'), `${prior}${rows.join('\n')}\n`);
