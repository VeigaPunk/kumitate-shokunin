#!/usr/bin/env node
/**
 * supp.mjs — prototype supplementary checker for claim C2 (round 64, wave 2, seat K64R2CriticJjForge).
 * Not an integration artifact: measures whether four candidate strengthenings (S-A..S-D) catch the
 * wave-2 forgeries while the honest tree at 2ed8a5f still passes. Reads a clone, writes nothing there.
 *
 * usage: node supp.mjs <clone> <rev>
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const lane = resolve(process.argv[2]);
const rev = process.argv[3];
const ENTRY = 'corpus/knowledge/jj-workspace-seat-containment.md';
const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
if (rv.status !== 0) { console.log(`SUPP: UNREADABLE ${rev}`); process.exit(2); }
const full = rv.stdout.trim();
const T = mkdtempSync(join(tmpdir(), 'supp.'));
const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x -C "${T}"`], { encoding: 'utf8' });
if (ar.status !== 0) { console.log('SUPP: ARCHIVE-FAILED'); process.exit(2); }
const rd = (rel) => { try { return readFileSync(join(T, rel), 'utf8'); } catch { return null; } };
const norm = (s) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();

const entry = rd(ENTRY) || '';
const stated = new Map();
{
  const at = entry.search(/^##\s+Demo outcomes\s*$/m);
  if (at >= 0) for (const l of entry.slice(at).split('\n').slice(1)) {
    if (/^##\s/.test(l)) break;
    const m = /^-\s+([a-z0-9_]+)=(.*?)\s*$/.exec(l);
    if (m) stated.set(m[1], m[2]);
  }
}
const bullets = [...entry.matchAll(/^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/gm)].map((m) => ({ id: m[1], q: m[2] }));
const ids = [...new Set([...entry.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
const rows = new Map();
{
  const lines = (rd('corpus/SOURCES.md') || '').split('\n');
  const start = lines.findIndex((l) => /^ {0,3}##\s+Registry\b/.test(l));
  if (start >= 0) {
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
    for (let i = start + 1; i < end; i += 1) { const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(lines[i]); if (m) rows.set(m[1], lines[i]); }
  }
}
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
let pins = { captures: [] };
try { pins = JSON.parse(rd('.ufo/pins/source-captures.json')); } catch { /* absent */ }

const bad = [];
const note = [];

// ---- S-A: the demo must execute jj (PATH shim + private TMPDIR), state real keys with real values
{
  const SH = join(T, '..', `shim-${process.pid}-${Date.now()}`);
  const bin = join(SH, 'bin');
  const tmp = join(SH, 'tmp');
  mkdirSync(bin, { recursive: true }); mkdirSync(tmp, { recursive: true });
  const real = spawnSync('bash', ['-c', 'command -v jj'], { encoding: 'utf8' }).stdout.trim();
  const log = join(SH, 'jj.log');
  writeFileSync(join(bin, 'jj'), `#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> ${JSON.stringify(log)}\nexec ${JSON.stringify(real)} "$@"\n`);
  spawnSync('chmod', ['+x', join(bin, 'jj')]);
  const r = spawnSync('bash', [join(T, 'scripts', 'jj-seat-demo.sh')], {
    encoding: 'utf8', timeout: 180000, cwd: T,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TMPDIR: tmp },
  });
  const calls = existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean) : [];
  const live = new Map();
  for (const l of (r.stdout || '').split('\n')) { const m = /^JJ_SEAT: ([a-z0-9_]+)=(.*)$/.exec(l); if (m) live.set(m[1], m[2]); }
  const reqSub = ['workspace add', 'abandon', 'squash', 'op log', 'workspace update-stale', 'workspace forget'];
  const missing = reqSub.filter((s) => !calls.some((c) => c.includes(s)));
  const REQUIRED_KEYS = ['workspaces_after_add', 'seat_has_git_dir', 'seat_file_in_default_tree', 'seat_snapshot_in_shared_op_log',
    'ignore_working_copy_adds_op', 'rewrite_seat_head_seat_state', 'abandon_seat_head_seat_state', 'update_stale_recovers',
    'absolute_path_write_seen_in_default', 'workspaces_after_forget'];
  const lackKeys = REQUIRED_KEYS.filter((k) => !stated.has(k));
  const emptyVals = [...stated].filter(([, v]) => v.trim() === '').length;
  const distinct = new Set([...stated.values()]).size;
  let jjdir = false;
  try { jjdir = readdirSync(tmp, { recursive: true }).some((p) => String(p).endsWith('.jj')); } catch { /* none */ }
  note.push(`jj-calls=${calls.length} missing-sub=${missing.join(',') || 'none'} jjdir-in-private-tmp=${jjdir} keys=${stated.size} lack=${lackKeys.join(',') || 'none'} empty-values=${emptyVals} distinct=${distinct}`);
  if (r.status !== 0) bad.push(`S-A demo-exit=${r.status}`);
  if (calls.length < 20) bad.push(`S-A jj-calls=${calls.length}`);
  if (missing.length) bad.push(`S-A missing-subcommands=${missing.join(',')}`);
  // jjdir stays informational: the demo's EXIT trap removes its fixtures (measured: honest demo leaves no .jj under TMPDIR)
  if (lackKeys.length) bad.push(`S-A missing-required-keys=${lackKeys.join(',')}`);
  if (emptyVals) bad.push(`S-A empty-values=${emptyVals}`);
  if (distinct < 4) bad.push(`S-A distinct-values=${distinct}`);
  if ([...stated].some(([k, v]) => live.get(k) !== v)) bad.push('S-A stated-vs-live');
  rmSync(SH, { recursive: true, force: true });
}

// ---- S-B: every key=value token in the entry outside `## Demo outcomes` must agree with the stated table
{
  const at = entry.search(/^##\s+Demo outcomes\s*$/m);
  const outside = at >= 0 ? `${entry.slice(0, at)}${entry.slice(entry.indexOf('\n## ', at + 1) >>> 0)}` : entry;
  const seen = new Map();
  for (const m of outside.matchAll(/\b([a-z][a-z0-9_]{4,})=(yes|no|stale|fresh|\d+|[a-z0-9][a-z0-9-]*)\b/g)) {
    if (!stated.has(m[1])) continue;
    if (!seen.has(m[1])) seen.set(m[1], new Set());
    seen.get(m[1]).add(m[2]);
  }
  const conflicts = [...seen].filter(([k, vs]) => [...vs].some((v) => v !== stated.get(k)));
  note.push(`prose-tokens=${seen.size} conflicting=${conflicts.map(([k]) => k).join(',') || 'none'}`);
  if (conflicts.length) bad.push(`S-B prose-disagrees-with-outcomes=${conflicts.map(([k, vs]) => `${k}:${[...vs].join('/')}!=${stated.get(k)}`).join(';')}`);
}

// ---- S-C: the committed capture must BE the live page (byte equality), not merely contain the quotes
const liveText = new Map();
{
  for (const id of ids) {
    const line = rows.get(id);
    const url = line && /(https?:\/\/[^\s|)]+)/.exec(cells(line)[2] || '');
    if (!url) { bad.push(`S-C ${id}:no-url`); continue; }
    const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-jj64)', url[1]], { maxBuffer: 128 * 1024 * 1024 });
    if (r.status !== 0) { bad.push(`S-C ${id}:live-unreachable`); continue; }
    liveText.set(id, norm(r.stdout.toString('utf8')));
    const liveSha = createHash('sha256').update(r.stdout).digest('hex');
    const pin = pins.captures.find((c) => c.sourceId === id);
    if (!pin) { bad.push(`S-C ${id}:unpinned`); continue; }
    if (pin.sha256 !== liveSha) bad.push(`S-C ${id}:capture!=live(${pin.sha256.slice(0, 8)}!=${liveSha.slice(0, 8)})`);
  }
}

// ---- S-D (opt-in via SUPP_SD=1; measured to false-positive on the honest tree): every Mechanism paragraph must share a 8-word window with a located quote or the cited captures
if (process.env.SUPP_SD === '1') {
  const at = entry.search(/^##\s+Mechanism[^\n]*$/m);
  if (at >= 0) {
    const body = entry.slice(at).split('\n').slice(1);
    const paras = [];
    let cur = [];
    for (const l of body) { if (/^##\s/.test(l)) break; if (l.trim() === '') { if (cur.length) paras.push(cur.join(' ')); cur = []; } else cur.push(l); }
    if (cur.length) paras.push(cur.join(' '));
    const pool = `${bullets.map((b) => norm(b.q)).join(' ')} ${[...liveText.values()].join(' ')}`;
    const poolWords = pool.split(' ');
    const grams = new Set();
    for (let i = 0; i + 8 <= poolWords.length; i += 1) grams.add(poolWords.slice(i, i + 8).join(' '));
    const unsupported = [];
    for (const p of paras) {
      const w = norm(p).split(' ');
      let hit = false;
      for (let i = 0; i + 8 <= w.length && !hit; i += 1) if (grams.has(w.slice(i, i + 8).join(' '))) hit = true;
      if (!hit) unsupported.push(norm(p).slice(0, 40));
    }
    note.push(`mechanism-paras=${paras.length} unsupported=${unsupported.length}`);
    if (unsupported.length) bad.push(`S-D paragraphs-without-8word-source-window=${unsupported.length}(${unsupported[0]})`);
  }
}

rmSync(T, { recursive: true, force: true });
console.log(`SUPP: ${bad.length ? 'FAIL' : 'PASS'} rev=${full} | ${note.join(' | ')}${bad.length ? `\n  ${bad.join('\n  ')}` : ''}`);
process.exit(bad.length ? 1 : 0);
