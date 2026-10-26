#!/usr/bin/env node
/**
 * omp65-probe.mjs — frozen counter for kumitate round 65 claim C2 (rule O65 v1).
 *
 *   node .ufo/waves/round-65/probe/omp65-probe.mjs <lane-dir> <rev> [--entry corpus/knowledge/<file>.md] [--opened YYYY-MM-DD] [--no-live]
 *
 * Output: one verdict line and exit code.
 *   OMP65_HELD  held=8/8 checks=8 rev=<rev> rule=O65   exit 0
 *   OMP65_UNMET held=k/8 checks=8 rev=<rev> rule=O65 | <check> MISS <reason> ...   exit 1
 * Exit 2 only when the revision itself cannot be read. Every lane byte is read with `git archive <rev>`.
 *
 * O1 the entry exists and opens with the provenance trio: source: (>= 3 distinct S### ids), verified-at: <opened>, recheck:.
 * O2 every S### on the entry's `source:` lines is a row inside `## Registry` of corpus/SOURCES.md that is NEW this round
 *    (absent at the round-base revision): exactly 11 cells, status mined, opened = <opened>, a URL, tier A or B, used-by naming the entry.
 * O3 each cited row is bound in .ufo/pins/source-captures.json to a committed capture whose sha256 and size equal the pin.
 * O4 the entry's `## Located quotes` section holds >= 6 bullets `- S### — "<quote>"`, each <= 25 words, each found
 *    (markup/whitespace-normalised) in that row's capture; every cited row has >= 1 bullet; >= 1 bullet carries the literal 2025-11-25.
 * O5 each bullet's quote is also found in a fresh live fetch of the row's URL (unreachable = MISS).
 * O6 the entry's `## Host measurements` section lists bullets `- <key>=<value>` (>= 12) and `bash scripts/omp-binary-probe.sh` in the
 *    archive, run now on this host, exits 0 and prints `OMP_BIN: <key>=<value>` for the same key set with the same values; the
 *    measured `real_version` is pinned by >= 2 cited rows (their URL carries `/v<real_version>/` or the release commit);
 *    and the entry body names `lit_2026_07_28` (the absent revision) and `real_version`.
 * O7 `sources-census.sh validate --file <archive>/corpus/SOURCES.md` exits 0, `sources-check` prints SOURCES_CHECK: CLEAN,
 *    PROVINCE.md names the entry on a frontier line, and `node scripts/readme-map.mjs` prints README_MAP: CLEAN.
 * O8 `corpus/knowledge/omp-task-contract.md` at the measured revision begins with exactly the bytes it had at the round-base
 *    revision (append-only) and carries an appended heading naming `Amendment 2026-10-25` whose text names the entry path and `Version skew`.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync as wfs, chmodSync } from 'node:fs';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CENSUS = process.env.SOURCES_CENSUS || '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const RULE = 'O65';
const BASE = '47fe2383151909d31557ada118ad84f90404dc6c'; // round-65 base: lane tip when the round started
const RELEASE_COMMIT = '45c35e40c46166dc726ccc52f5d27f40f2449f99'; // git ls-remote refs/tags/v18.12.6, read 2026-10-25
const argv = process.argv.slice(2);
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--entry', '--opened'].includes(argv[i - 1])));
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
if (pos.length < 2) { process.stderr.write('usage: omp65-probe.mjs <lane-dir> <rev> [--entry path] [--opened date] [--no-live]\n'); process.exit(64); }
const lane = resolve(pos[0]);
const rev = pos[1];
const ENTRY = opt('--entry', 'corpus/knowledge/omp-installed-release-mcp-runtime.md');
const OPENED = opt('--opened', '2026-10-25');
const LIVE = !argv.includes('--no-live');
const FREEZE = process.env.OMP65_FREEZE || '2ca91a0c81542cad5f731049aa55dd2f99ade98d'; // freeze commit: instrumentation is read from here, never from M

const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
if (rv.status !== 0) { process.stdout.write(`OMP65_UNMET held=0/8 checks=8 rev=${rev} rule=${RULE} | rev-unreadable\n`); process.exit(2); }
const full = rv.stdout.trim();

const T = mkdtempSync(join(tmpdir(), 'omp65.'));
const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x -C "${T}"`], { encoding: 'utf8' });
if (ar.status !== 0) { process.stdout.write(`OMP65_UNMET held=0/8 checks=8 rev=${full} rule=${RULE} | archive-failed\n`); rmSync(T, { recursive: true, force: true }); process.exit(2); }
const rd = (rel) => { try { return readFileSync(join(T, rel)); } catch { return null; } };
const cells0 = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
const urlOf = (line) => { const m = line && /(https?:\/\/[^\s|)]+)/.exec(cells0(line)[2] || ''); return m ? m[1] : null; };
const hostOf = (u) => { try { return new URL(u).host; } catch { return null; } };
const gitFile = (p) => { const g = spawnSync('git', ['-C', lane, 'show', `${FREEZE}:${p}`], { maxBuffer: 64 * 1024 * 1024 }); return g.status === 0 ? g.stdout : null; };

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const miss = [];
const results = {};
const check = (id, ok, why) => { results[id] = ok; if (!ok) miss.push(`${id} MISS ${why}`); };

// ---- O1
const entryRaw = rd(ENTRY);
let ids = [];
if (!entryRaw) check('O1', false, 'entry-absent');
else {
  const text = entryRaw.toString('utf8');
  const head = text.split('\n').slice(0, 14).join('\n');
  const hasSrc = /^source:\s*S\d{3,}/m.test(head);
  const hasVer = new RegExp(`^verified-at:\\s*${OPENED}`, 'm').test(head);
  const hasRec = /^recheck:\s*\S+/m.test(head);
  ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
  check('O1', hasSrc && hasVer && hasRec && ids.length >= 3, `trio source=${hasSrc} verified-at=${hasVer} recheck=${hasRec} ids=${ids.length}`);
}

// ---- O2
const rowsOf = (buf) => {
  const rows = new Map();
  if (!buf) return rows;
  const lines = buf.toString('utf8').split('\n');
  const start = lines.findIndex((l) => /^ {0,3}##\s+Registry\b/.test(l));
  let end = lines.length;
  for (let i = start + 1; i < lines.length && start >= 0; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
  if (start >= 0) for (let i = start + 1; i < end; i += 1) { const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(lines[i]); if (m) rows.set(m[1], lines[i]); }
  return rows;
};
const rows = rowsOf(rd('corpus/SOURCES.md'));
const baseSrc = spawnSync('git', ['-C', lane, 'show', `${BASE}:corpus/SOURCES.md`], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
const baseRows = rowsOf(baseSrc.status === 0 ? baseSrc.stdout : null);
const ALLOWED_HOSTS = new Set([...baseRows.values()].map((l) => hostOf(urlOf(l))).filter(Boolean));
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
if (!entryRaw) check('O2', false, 'no-entry');
else {
  const bad = [];
  if (ids.length < 3) bad.push(`cites-${ids.length}-rows`);
  for (const id of ids) {
    const line = rows.get(id);
    if (!line) { bad.push(`${id}:not-in-registry`); continue; }
    if (baseRows.has(id)) bad.push(`${id}:existed-at-round-base`);
    const c = cells(line);
    if (c.length !== 13) { bad.push(`${id}:NF=${c.length}`); continue; }
    const [, , source, , tier, , , , status, opened, , usedBy] = c;
    if (status !== 'mined') bad.push(`${id}:status=${status}`);
    if (opened !== OPENED) bad.push(`${id}:opened=${opened}`);
    if (!usedBy.includes(ENTRY)) bad.push(`${id}:used-by-lacks-entry`);
    if (!/https?:\/\//.test(source)) bad.push(`${id}:no-url`);
    if (tier !== 'A' && tier !== 'B') bad.push(`${id}:tier=${tier}`);
  }
  check('O2', bad.length === 0, bad.join(','));
}

// ---- O3
const caps = new Map();
try { for (const c of JSON.parse(rd('.ufo/pins/source-captures.json').toString('utf8')).captures) caps.set(c.sourceId, c); } catch { /* absent */ }
const capText = new Map();
{
  const bad = [];
  for (const id of ids) {
    const c = caps.get(id);
    if (!c) { bad.push(`${id}:unbound`); continue; }
    const b = rd(c.path);
    if (!b) { bad.push(`${id}:capture-absent`); continue; }
    if (createHash('sha256').update(b).digest('hex') !== c.sha256 || b.length !== c.bytes) bad.push(`${id}:hash-or-size`);
    if (c.url !== urlOf(rows.get(id))) bad.push(`${id}:capture-url-mismatch`);
    if (Number(c.status) !== 200) bad.push(`${id}:capture-status=${c.status}`);
    else capText.set(id, norm(b));
  }
  check('O3', ids.length > 0 && bad.length === 0, ids.length ? bad.join(',') : 'no-rows');
}

// ---- O4
const bullets = [];
if (entryRaw) {
  const text = entryRaw.toString('utf8');
  const at = text.search(/^##\s+Located quotes\s*$/m);
  if (at >= 0) {
    for (const l of text.slice(at).split('\n').slice(1)) {
      if (/^##\s/.test(l)) break;
      const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
      if (m) bullets.push({ id: m[1], q: m[2] });
    }
  }
}
{
  const bad = [];
  if (bullets.length < 6) bad.push(`bullets=${bullets.length}`);
  for (const id of ids) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);
  if (!bullets.some((b) => b.q.includes('2025-11-25'))) bad.push('no-2025-11-25-quote');
  for (const b of bullets) {
    if (b.q.trim().split(/\s+/).length > 25) bad.push(`${b.id}:over-25-words`);
    if (!ids.includes(b.id)) { bad.push(`${b.id}:not-a-source`); continue; }
    const t = capText.get(b.id);
    const qn = norm(b.q);
    if (qn.length < 8 || !/[A-Za-z0-9]/.test(qn)) bad.push(`${b.id}:quote-empty-or-short`);
    else if (!t || !t.includes(qn)) bad.push(`${b.id}:quote-not-in-capture(${b.q.slice(0, 30)})`);
  }
  check('O4', bad.length === 0, bad.slice(0, 6).join(';'));
}

// ---- O5
if (!LIVE) check('O5', false, 'live-fetch-skipped');
else {
  const bad = [];
  const live = new Map();
  for (const id of ids) {
    const line = rows.get(id);
    const url = line && /(https?:\/\/[^\s|)]+)/.exec(cells(line)[2] || '');
    if (!url) { bad.push(`${id}:no-url`); continue; }
    const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-omp65)', url[1]], { maxBuffer: 128 * 1024 * 1024 });
    if (r.status !== 0) { bad.push(`${id}:live-unreachable`); continue; }
    const cap = caps.get(id);
    if (!cap || createHash('sha256').update(r.stdout).digest('hex') !== cap.sha256) bad.push(`${id}:live-body-differs-from-capture`);
    const host = hostOf(url[1]);
    if (!host || !ALLOWED_HOSTS.has(host)) bad.push(`${id}:url-host-not-in-registry(${host})`);
    live.set(id, norm(r.stdout));
  }
  for (const b of bullets) {
    const t = live.get(b.id);
    if (!t) continue;
    if (!t.includes(norm(b.q))) bad.push(`${b.id}:quote-not-live(${b.q.slice(0, 30)})`);
  }
  check('O5', bullets.length > 0 && bad.length === 0, bullets.length ? bad.slice(0, 6).join(';') : 'no-bullets');
}

// ---- O6
{
  const bad = [];
  const text = entryRaw ? entryRaw.toString('utf8') : '';
  const at = text.search(/^##\s+Host measurements\s*$/m);
  const stated = new Map();
  if (at >= 0) {
    for (const l of text.slice(at).split('\n').slice(1)) {
      if (/^##\s/.test(l)) break;
      const m = /^-\s+([A-Za-z0-9_-]+)=(.*?)\s*$/.exec(l);
      if (m) stated.set(m[1], m[2]);
    }
  }
  if (stated.size < 12) bad.push(`stated-keys=${stated.size}`);
  const probe = join(T, 'scripts', 'omp-binary-probe.sh');
  if (!existsSync(probe)) bad.push('probe-absent');
  else {
    const frozen = gitFile('scripts/omp-binary-probe.sh');
    const runnable = join(T, '.omp65-frozen-probe.sh');
    if (!frozen) bad.push('frozen-probe-unreadable');
    else { wfs(runnable, frozen); chmodSync(runnable, 0o755); }
    const r = frozen ? spawnSync('bash', [runnable], { encoding: 'utf8', timeout: 180000 }) : { status: 1, stdout: '' };
    if (r.status !== 0) bad.push(`probe-exit=${r.status}`);
    const live = new Map();
    for (const l of (r.stdout || '').split('\n')) { const m = /^OMP_BIN: ([A-Za-z0-9_-]+)=(.*)$/.exec(l); if (m) live.set(m[1], m[2]); }
    for (const [k, v] of live) if (stated.get(k) !== v) bad.push(`${k}:stated=${stated.get(k)}:live=${v}`);
    for (const k of stated.keys()) if (!live.has(k)) bad.push(`${k}:stated-not-live`);
    const real = live.get('real_version');
    if (!real) bad.push('no-real-version');
    else {
      const pinned = ids.filter((id) => { const u = urlOf(rows.get(id)) || ''; return u.includes(`/v${real}/`) || u.includes(`/${RELEASE_COMMIT}/`); });
      if (pinned.length < 2) bad.push(`rows-pinned-to-installed-version=${pinned.length}<2`);
    }
  }
  if (!text.includes('lit_2026_07_28') || !text.includes('real_version')) bad.push('body-lacks-lit_2026_07_28-or-real_version');
  check('O6', bad.length === 0, bad.slice(0, 6).join(';'));
}

// ---- O7
{
  const r = spawnSync('bash', [CENSUS, 'validate', '--file', join(T, 'corpus', 'SOURCES.md')], { encoding: 'utf8' });
  const prov = rd('PROVINCE.md');
  let named = false;
  if (prov) {
    const pt = prov.toString('utf8');
    const at = pt.search(/^#{2,3}\s+Frontier\b.*$/m);
    if (at >= 0) {
      const rest = pt.slice(at);
      const end = rest.slice(1).search(/^#{1,3}\s/m);
      const sec = end < 0 ? rest : rest.slice(0, end + 1);
      named = sec.split('\n').some((l) => l.includes(ENTRY));
    }
  }
  let clean = false; let sclean = false;
  if (existsSync(join(T, 'scripts', 'readme-map.mjs'))) {
    const ob = gitFile('scripts/readme-map.mjs');
    if (ob) wfs(join(T, '.oracle-readme-map.mjs'), ob);
    const m = ob ? spawnSync('node', ['.oracle-readme-map.mjs'], { cwd: T, encoding: 'utf8' }) : { status: 1, stdout: '' };
    clean = m.status === 0 && /README_MAP: CLEAN/.test(m.stdout);
  }
  if (existsSync(join(T, 'scripts', 'sources-check.mjs'))) {
    const ob = gitFile('scripts/sources-check.mjs');
    if (ob) wfs(join(T, '.oracle-sources-check.mjs'), ob);
    const m = ob ? spawnSync('node', ['.oracle-sources-check.mjs'], { cwd: T, encoding: 'utf8' }) : { status: 1, stdout: '' };
    sclean = m.status === 0 && /SOURCES_CHECK: CLEAN/.test(m.stdout);
  }
  check('O7', r.status === 0 && named && clean && sclean, `census-exit=${r.status} province-names-entry=${named} readme-map-clean=${clean} sources-check-clean=${sclean}`);
}

// ---- O8
{
  const P = 'corpus/knowledge/omp-task-contract.md';
  const baseBytes = spawnSync('git', ['-C', lane, 'show', `${BASE}:${P}`], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  const now = rd(P);
  const bad = [];
  if (baseBytes.status !== 0 || !now) bad.push('file-unreadable');
  else {
    if (!now.subarray(0, baseBytes.stdout.length).equals(baseBytes.stdout)) bad.push('base-bytes-not-a-prefix');
    const tail = now.subarray(baseBytes.stdout.length).toString('utf8');
    if (!/^#{1,3}\s.*Amendment 2026-10-25/m.test(tail)) bad.push('no-amendment-heading');
    if (!tail.includes(ENTRY) || !/Version skew/.test(tail)) bad.push('amendment-lacks-entry-or-Version-skew');
  }
  check('O8', bad.length === 0, bad.join(','));
}

rmSync(T, { recursive: true, force: true });
const held = Object.values(results).filter(Boolean).length;
const ok = held === 8;
process.stdout.write(`OMP65_${ok ? 'HELD' : 'UNMET'} held=${held}/8 checks=8 rev=${full} rule=${RULE}${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(ok ? 0 : 1);
