#!/usr/bin/env node
/**
 * supplementary-c2.mjs — independent supplementary checker for kumitate round 64 claim C2.
 *
 *   node supplementary-c2.mjs <lane-dir> <rev> [--entry corpus/knowledge/<file>.md]
 *                             [--pin-file <json>] [--no-live] [--verbose]
 *
 * Written by seat K64R2ExecSupplementaryC2 (wave 2). It is NOT the frozen counter and does not
 * replace it: it closes attack classes the frozen J64 counter (probe/jj64-probe.mjs) scores HELD
 * on. Every lane byte is read from one `git archive <rev>` stream (tar members read with
 * `tar -xOf`), never from the working tree; nothing in the lane is written.
 *
 * Arms (each prints PASS/FAIL with a reason):
 *  S1 archive hygiene   — every path this checker reads (entry, SOURCES.md, pin file, demo, every
 *                         capture pin) is a regular tar member, is not a symlink, has no symlink
 *                         ancestor, is repo-relative without `..`, and resolves inside the tree;
 *                         no symlink exists under corpus/, scripts/ or .ufo/pins/ (claim ground).
 *  S2 prose numbers     — every `key=value` token in the entry's prose (all sections except
 *                         `## Demo outcomes` and `## Located quotes`) names a stated outcome key
 *                         and carries the same value. Catches prose that contradicts the section
 *                         the counter compares (J6 only compares stated vs demo).
 *  S3 quotes, independent normaliser — strip comments/script/style/template/noscript blocks, strip
 *                         tags, decode numeric+named entities, NFKC-fold, unify dashes/quotes,
 *                         collapse whitespace. Every bullet is <= 25 words, unique, found in its
 *                         row's capture and found EXACTLY ONCE there.
 *  S4 demo bytes        — scripts/jj-seat-demo.sh is an executable regular member; its sha256
 *                         equals the pin (`.ufo/pins/counter-pins.json` name `jj-seat-demo` if the
 *                         lane has it, else the proposed pin file); it is run twice, each time with
 *                         a fresh TMPDIR and a fresh empty cwd inside scratch, must exit 0, print
 *                         byte-identical output, print >= 21 distinct keys, write nothing into the
 *                         caller's cwd, and agree with the stated outcomes.
 *  S5 captures live     — row URL must be a public http(s) host (loopback/private rejected); the
 *                         live fetch must still carry every bullet; the pinned capture must be
 *                         IDENTIFIABLE as the row's document (canonical/og:url path match, else
 *                         title/first-heading slug, else the URL itself appears in the capture);
 *                         live bytes are then reported as identical or differ-outside-quotes, and a
 *                         diff that intersects a quoted section is a FAIL.
 *  S6 registry rows     — S-rows are re-split by an independent markdown cell splitter (escaped
 *                         pipes and backtick spans respected, exactly 11 cells), then id/source/
 *                         tier/status/opened/used-by are re-verified and the citation is required
 *                         to be bidirectional (cited <=> used-by names the entry).
 *
 * Output: one `S<n> PASS|FAIL <detail>` line per arm, then
 *         `SUPP_C2: PASS|FAIL arms=<k>/6 rev=<full> entry=<path>`; exit 0 PASS, 1 FAIL,
 *         2 revision/archive unreadable. `--no-live` turns S5 into a declared FAIL (like J5).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pos = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--entry' || argv[i] === '--pin-file') { i += 1; continue; }
  if (argv[i].startsWith('--')) continue;
  pos.push(argv[i]);
}
if (pos.length < 2) {
  process.stderr.write('usage: supplementary-c2.mjs <lane-dir> <rev> [--entry path] [--pin-file path] [--no-live] [--verbose]\n');
  process.exit(64);
}
const lane = resolve(pos[0]);
const revArg = pos[1];
const ENTRY = opt('--entry', 'corpus/knowledge/jj-workspace-seat-containment.md');
const DEMO = 'scripts/jj-seat-demo.sh';
const PIN_FILE = opt('--pin-file', join(dirname(new URL(import.meta.url).pathname), 'proposed-pin.jj-seat-demo.json'));
const LIVE = !argv.includes('--no-live');
const VERBOSE = argv.includes('--verbose');
const RULE = 'SUPP-C2';

const sh = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;

const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${revArg}^{commit}`], { encoding: 'utf8' });
if (rv.status !== 0) {
  process.stdout.write(`SUPP_C2: FAIL arms=0/6 rev=${revArg} | rev-unreadable\n`);
  process.exit(2);
}
const full = rv.stdout.trim();

const SC = mkdtempSync(join(tmpdir(), 'suppc2.'));
const aTar = join(SC, 'a.tar');
const T = join(SC, 'tree');
mkdirSync(T);
const cleanup = () => { try { rmSync(SC, { recursive: true, force: true }); } catch { /* best effort */ } };
const bail = (why) => { process.stdout.write(`SUPP_C2: FAIL arms=0/6 rev=${full} | ${why}\n`); cleanup(); process.exit(2); };

// ---- the one read: git archive <rev> bytes ---------------------------------
{
  const r = spawnSync('bash', ['-c', `git -C ${sh(lane)} archive --format=tar ${sh(full)} > ${sh(aTar)}`], { encoding: 'utf8' });
  if (r.status !== 0) bail(`archive-failed:${(r.stderr || '').trim().slice(0, 120)}`);
}
const tl = spawnSync('tar', ['-tvf', aTar], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (tl.status !== 0) bail('tar-list-failed');
const members = new Map();
for (const line of tl.stdout.split('\n')) {
  if (!line.trim()) continue;
  const m = /^(\S{10})\s+\S+\s+(\d+)\s+\S+\s+\S+\s+(.*)$/.exec(line);
  if (!m) continue;
  let name = m[3];
  const arrow = name.indexOf(' -> ');
  if (arrow >= 0) name = name.slice(0, arrow);
  members.set(name.replace(/^\.\//, ''), { mode: m[1], bytes: Number(m[2]) });
}
const xr = spawnSync('tar', ['-xf', aTar, '-C', T], { maxBuffer: 32 * 1024 * 1024 });
if (xr.status !== 0) bail('tar-extract-failed');

const cache = new Map();
const read = (rel) => {
  if (typeof rel !== 'string' || rel === '') return null;
  if (cache.has(rel)) return cache.get(rel);
  const mem = members.get(rel);
  let b = null;
  if (mem && mem.mode[0] === '-') {
    const r = spawnSync('tar', ['-xOf', aTar, rel], { maxBuffer: 512 * 1024 * 1024 });
    if (r.status === 0) b = r.stdout;
  }
  cache.set(rel, b);
  return b;
};

// ---- independent normaliser (deliberately unlike the counter's norm()) ------
const NAMED = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", mdash: '\u2014', ndash: '\u2013',
  hellip: '\u2026', lsquo: '\u2018', rsquo: '\u2019', ldquo: '\u201c', rdquo: '\u201d',
  middot: '\u00b7', times: '\u00d7', rarr: '\u2192', copy: '\u00a9', reg: '\u00ae', trade: '\u2122',
};
const cp = (n) => { try { return String.fromCodePoint(n); } catch { return ''; } };
const decodeEntities = (s) => s
  .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => cp(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => cp(Number(d)))
  .replace(/&([a-zA-Z][a-zA-Z0-9]{1,10});/g, (m, n) => (NAMED[n] !== undefined ? NAMED[n] : m));
const normInd = (buf) => {
  let s = Buffer.isBuffer(buf) ? buf.toString('utf8') : String(buf);
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<template\b[\s\S]*?<\/template\s*>|<noscript\b[\s\S]*?<\/noscript\s*>/gi, ' ');
  s = s.replace(/<[^>]*>/g, ' ');
  s = decodeEntities(s);
  s = s.normalize('NFKC');
  s = s.replace(/[\u2018\u2019\u201a\u201b]/g, "'").replace(/[\u201c\u201d\u201e]/g, '"').replace(/[\u2010-\u2015\u2212]/g, '-');
  s = s.replace(/\*\*|__|`/g, '');
  return s.replace(/\s+/g, ' ').trim();
};
const countOf = (hay, needle) => {
  if (!needle) return 0;
  let n = 0;
  let i = 0;
  for (;;) {
    const j = hay.indexOf(needle, i);
    if (j < 0) return n;
    n += 1;
    i = j + needle.length;
  }
};

// ---- entry parsing ---------------------------------------------------------
const entryBuf = read(ENTRY);
const entryText = entryBuf ? entryBuf.toString('utf8') : '';
const header = entryText.split('\n').slice(0, 20).join('\n');
const entryIds = [...new Set([...header.matchAll(/^source:[^\n]*/gm)]
  .flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];

const sectionBody = (text, name) => {
  const at = text.search(new RegExp(`^##\\s+${name}\\s*$`, 'm'));
  if (at < 0) return null;
  const lines = text.slice(at).split('\n').slice(1);
  const out = [];
  for (const l of lines) { if (/^##\s/.test(l)) break; out.push(l); }
  return out.join('\n');
};
const stripSection = (text, name) => {
  const at = text.search(new RegExp(`^##\\s+${name}\\s*$`, 'm'));
  if (at < 0) return text;
  const lines = text.slice(at).split('\n').slice(1);
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) if (/^##\s/.test(lines[i])) { end = i; break; }
  return text.slice(0, at) + lines.slice(end).join('\n');
};
const parseStated = (text) => {
  const stated = new Map();
  const body = sectionBody(text, 'Demo outcomes');
  if (body === null) return stated;
  for (const l of body.split('\n')) {
    const m = /^-\s+([a-z0-9_]+)=(.*?)\s*$/.exec(l);
    if (m) stated.set(m[1], m[2]);
  }
  return stated;
};
const parseBullets = (text) => {
  const bullets = [];
  const body = sectionBody(text, 'Located quotes');
  if (body === null) return bullets;
  for (const l of body.split('\n')) {
    const m = /^-\s+(S\d{3,})\s+[\u2014-]\s+"(.+)"\s*$/.exec(l);
    if (m) bullets.push({ id: m[1], q: m[2] });
  }
  return bullets;
};
const bullets = parseBullets(entryText);
const stated = parseStated(entryText);

// ---- pins ------------------------------------------------------------------
let pinsJson = null;
{
  const raw = read('.ufo/pins/source-captures.json');
  if (raw) { try { pinsJson = JSON.parse(raw.toString('utf8')); } catch { pinsJson = null; } }
}
const pinById = new Map();
if (pinsJson && Array.isArray(pinsJson.captures)) for (const c of pinsJson.captures) pinById.set(c.sourceId, c);
const pinPathFor = (id) => (pinById.get(id) ? pinById.get(id).path : null);

const resolvePin = () => {
  const raw = read('.ufo/pins/counter-pins.json');
  if (raw) {
    try {
      const j = JSON.parse(raw.toString('utf8'));
      const p = (j.pins || []).find((x) => x && (x.name === 'jj-seat-demo' || x.name === 'pin.jj-seat-demo' || x.path === DEMO));
      if (p && /^[0-9a-f]{64}$/.test(p.sha256 || '')) return { sha256: p.sha256, name: p.name, source: `.ufo/pins/counter-pins.json#${p.name}` };
    } catch { /* fall through to the proposal */ }
  }
  try {
    const j = JSON.parse(readFileSync(PIN_FILE, 'utf8'));
    if (/^[0-9a-f]{64}$/.test(j.sha256 || '')) return { sha256: j.sha256, name: j.name, source: `proposed:${PIN_FILE}` };
  } catch { /* no pin at all */ }
  return null;
};

// ---- registry: independent markdown cell splitter --------------------------
const splitRow = (line) => {
  let s = line.replace(/^\s{0,3}/, '');
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  let code = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (ch === '`') { code = !code; cur += ch; continue; }
    if (ch === '|' && !code) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
};
const registryText = (() => {
  const raw = read('corpus/SOURCES.md');
  if (!raw) return null;
  const text = raw.toString('utf8');
  const at = text.search(/^ {0,3}##\s+Registry\b/m);
  if (at < 0) return null;
  const lines = text.slice(at).split('\n').slice(1);
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
  return lines.slice(0, end).join('\n');
})();
const rows = new Map(); // id -> { line, cells, url }
const rowCellCount = new Map();
const dupRows = [];
if (registryText) {
  for (const line of registryText.split('\n')) {
    if (!/^ {0,3}\|/.test(line)) continue;
    const cells = splitRow(line);
    const idm = /^S\d{3,}$/.exec(cells[0] || '');
    if (!idm) continue;
    const id = cells[0];
    if (rows.has(id)) dupRows.push(id);
    const urlm = /(https?:\/\/[^\s|)]+)/.exec(cells[1] || '');
    rows.set(id, { line, cells, url: urlm ? urlm[1] : null });
    rowCellCount.set(id, cells.length);
  }
}

// ---- fetch / identity helpers ---------------------------------------------
const publicUrl = (u) => {
  let x;
  try { x = new URL(u); } catch { return null; }
  if (!/^https?:$/.test(x.protocol)) return null;
  const h = x.hostname.toLowerCase();
  if (h === 'localhost' || h === '::1' || h.endsWith('.localhost')) return null;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return null;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return null;
  if (/^\[?f[cd][0-9a-f]{2}:/.test(h)) return null;
  return x;
};
const pathKey = (p) => p.replace(/\.(md|html?)$/i, '').split('/')
  .filter((s) => s && !/^(latest|stable|main|master|v?\d+(\.\d+)*)$/.test(s))
  .join('/').toLowerCase();
const alnum = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const identity = (url, captureBuf) => {
  const x = publicUrl(url);
  if (!x) return { ok: false, why: 'bad-url' };
  const want = pathKey(x.pathname);
  const wantLast = alnum(want.split('/').pop() || '');
  const text = captureBuf.toString('utf8');
  const canon = [...text.matchAll(/<(?:link|meta)\b[^>]*(?:rel=["']canonical["'][^>]*href=["']([^"']+)["']|property=["']og:url["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:url["'])[^>]*>/gi)]
    .map((m) => m[1] || m[2] || m[3]).filter(Boolean);
  for (const c of canon) {
    try { if (pathKey(new URL(c, url).pathname) === want) return { ok: true, why: `canonical:${c}` }; } catch { /* ignore */ }
  }
  const titleM = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(text);
  const h1M = /^#\s+(.+)$/m.exec(text);
  const label = normInd(titleM ? titleM[1] : (h1M ? h1M[1] : ''));
  if (wantLast && alnum(label).includes(wantLast)) return { ok: true, why: `title:${label.slice(0, 40)}` };
  if (want && text.includes(x.pathname)) return { ok: true, why: `url-in-capture:${x.pathname}` };
  return { ok: false, why: `no-marker-for:${want || url}` };
};
const fetchLive = (url) => {
  const r = spawnSync('curl', ['-fsSL', '--max-time', '60', '--retry', '1', '-A', 'Mozilla/5.0 (kumitate-supp-c2)', url], { maxBuffer: 256 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
};
const sentences = (normed) => normed.split(/(?<=[.!?\u3002])\s+/).map((s) => s.trim()).filter((s) => s.length > 20);
const subOf = (line) => {
  const t = line.trim().split(/\s+/).filter(Boolean);
  const takesValue = new Set(['-R', '--repository', '--config', '--color', '-T', '--template', '-m', '--message', '-r', '--revision', '--from', '--into']);
  let i = 0;
  while (i < t.length) {
    const a = t[i];
    if (takesValue.has(a)) { i += 2; continue; }
    if (a.startsWith('-')) { i += 1; continue; }
    break;
  }
  if (i >= t.length) return null;
  const first = t[i];
  const second = t[i + 1] && !t[i + 1].startsWith('-') ? t[i + 1] : null;
  if (['workspace', 'op', 'git', 'file'].includes(first) && second) return `${first} ${second}`;
  return first;
};
const REQUIRED_SUBS = ['workspace add', 'workspace list', 'workspace forget', 'workspace update-stale', 'op log', 'abandon', 'squash', 'describe', 'git init'];

// ---- arms ------------------------------------------------------------------
const reasons = { S1: [], S2: [], S3: [], S4: [], S5: [], S6: [] };
const info = { S1: '', S2: '', S3: '', S4: '', S5: '', S6: '' };
const detail = [];

// S1 -------------------------------------------------------------------------
{
  const R = reasons.S1;
  if (!pinsJson) R.push('pins-unparseable');
  const pinPaths = pinsJson && Array.isArray(pinsJson.captures) ? pinsJson.captures.map((c) => c.path) : [];
  const readSet = [...new Set([ENTRY, 'corpus/SOURCES.md', '.ufo/pins/source-captures.json', DEMO, ...pinPaths])];
  for (const p of readSet) {
    if (typeof p !== 'string' || p === '') { R.push('bad-path'); continue; }
    if (isAbsolute(p) || p.split('/').includes('..') || p.startsWith('./')) { R.push(`unsafe-path:${p}`); continue; }
    const mem = members.get(p);
    if (!mem) { R.push(`absent:${p}`); continue; }
    if (mem.mode[0] === 'l') { R.push(`symlink:${p}`); continue; }
    if (mem.mode[0] !== '-') { R.push(`not-regular:${p}:${mem.mode}`); continue; }
    let d = dirname(p);
    while (d && d !== '.' && d !== '/') {
      const dm = members.get(`${d}/`) || members.get(d);
      if (dm && dm.mode[0] === 'l') R.push(`symlink-ancestor:${d}`);
      d = dirname(d);
    }
    try {
      const rp = realpathSync(join(T, p));
      if (!(rp === T || rp.startsWith(T + sep))) R.push(`escapes-tree:${p}`);
    } catch { R.push(`unreadable:${p}`); }
  }
  const symlinks = [...members.entries()].filter(([, m]) => m.mode[0] === 'l');
  for (const [name] of symlinks) if (/^(corpus|scripts)\//.test(name) || /^\.ufo\/pins\//.test(name)) R.push(`ground-symlink:${name}`);
  info.S1 = `read-set=${readSet.length} pins=${pinPaths.length} symlinks-in-archive=${symlinks.length} (none in claim ground)`;
  if (VERBOSE) detail.push(`  S1 read-set: ${readSet.join(' ')}`);
}

// S2 -------------------------------------------------------------------------
{
  const R = reasons.S2;
  if (!entryText) R.push('entry-absent');
  else {
    const h = entryText.indexOf('\n# ');
    const body = h >= 0 ? entryText.slice(h + 1) : entryText;
    const prose = stripSection(stripSection(body, 'Demo outcomes'), 'Located quotes');
    const tokens = [...prose.matchAll(/\b([a-z][a-z0-9_]{2,})=([a-z0-9][a-z0-9-]*)\b/g)].map((m) => ({ k: m[1], v: m[2] }));
    if (tokens.length === 0) R.push('no-prose-tokens');
    const valueMatches = (v, sv) => sv === v || sv.split(/,\s*/).map((s) => s.trim()).includes(v);
    const seen = new Map();
    for (const t of tokens) {
      seen.set(t.k, (seen.get(t.k) || 0) + 1);
      if (!stated.has(t.k)) { R.push(`prose-key-not-in-demo:${t.k}`); continue; }
      if (!valueMatches(t.v, stated.get(t.k))) R.push(`${t.k}:prose=${t.v}:demo=${stated.get(t.k)}`);
    }
    info.S2 = `prose-tokens=${tokens.length} distinct=${seen.size} stated=${stated.size}`;
    if (VERBOSE) detail.push(`  S2 keys: ${[...seen.keys()].join(' ')}`);
  }
}

// S3 -------------------------------------------------------------------------
{
  const R = reasons.S3;
  if (!entryText) R.push('entry-absent');
  else {
    if (bullets.length < 4) R.push(`bullets=${bullets.length}`);
    for (const id of entryIds) if (!bullets.some((b) => b.id === id)) R.push(`${id}:no-bullet`);
    const seen = new Set();
    const per = [];
    for (const b of bullets) {
      if (b.q.trim().split(/\s+/).length > 25) R.push(`${b.id}:over-25-words`);
      if (!entryIds.includes(b.id)) { R.push(`${b.id}:not-a-source`); continue; }
      if (seen.has(b.q)) R.push(`${b.id}:duplicate-bullet`); else seen.add(b.q);
      const cap = read(pinPathFor(b.id));
      if (!cap) { R.push(`${b.id}:capture-absent`); continue; }
      const n = countOf(normInd(cap), normInd(Buffer.from(b.q)));
      per.push(`${b.id}=${n}`);
      if (n !== 1) R.push(`${b.id}:quote-count=${n}`);
    }
    info.S3 = `bullets=${bullets.length} rows=${entryIds.length} counts=${per.join(',')}`;
  }
}

// S4 -------------------------------------------------------------------------
{
  const R = reasons.S4;
  const demoBytes = read(DEMO);
  const mem = members.get(DEMO);
  if (!demoBytes) R.push('demo-absent');
  else {
    if (!mem || mem.mode[3] !== 'x') R.push(`demo-not-executable:${mem ? mem.mode : 'absent'}`);
    const sha = createHash('sha256').update(demoBytes).digest('hex');
    const pin = resolvePin();
    if (!pin) R.push('no-pin');
    else if (pin.sha256 !== sha) R.push(`pin-mismatch:${pin.source}:pin=${pin.sha256.slice(0, 16)}:blob=${sha.slice(0, 16)}`);
    info.S4 = `blob=${sha} bytes=${demoBytes.length} pin=${pin ? pin.source : 'none'}`;
    const jjReal = spawnSync('bash', ['-c', 'command -v jj'], { encoding: 'utf8' }).stdout.trim();
    const shim = join(SC, 'shim');
    const shimLog = join(SC, 'jj-argv.log');
    if (!jjReal) R.push('jj-absent-on-host');
    else {
      mkdirSync(shim, { recursive: true });
      writeFileSync(join(shim, 'jj'), `#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> ${sh(shimLog)}\nexec ${sh(jjReal)} "$@"\n`);
      chmodSync(join(shim, 'jj'), 0o755);
    }
    const runs = [];
    for (let i = 0; i < 2; i += 1) {
      const tmp = mkdtempSync(join(SC, `run${i}-tmp-`));
      const cwd = mkdtempSync(join(SC, `run${i}-cwd-`));
      writeFileSync(shimLog, '');
      const env = {
        ...process.env,
        PATH: jjReal ? `${shim}:${process.env.PATH}` : process.env.PATH,
        TMPDIR: tmp, TMP: tmp, TEMP: tmp, HOME: join(tmp, 'home'), XDG_CONFIG_HOME: join(tmp, 'home', '.config'),
      };
      const r = spawnSync('bash', [join(T, 'scripts', 'jj-seat-demo.sh')], { cwd, encoding: 'buffer', timeout: 240000, env });
      const left = readdirSync(cwd);
      const calls = readFileSync(shimLog, 'utf8').split('\n').filter((l) => l.trim() !== '');
      runs.push({ status: r.status, out: r.stdout || Buffer.alloc(0), left, calls, tmp });
      if (r.status !== 0) R.push(`run${i}-exit=${r.status}`);
      if (left.length) R.push(`run${i}-cwd-writes=${left.join(',')}`);
    }
    const keys = new Map();
    for (const l of runs[0].out.toString('utf8').split('\n')) {
      const m = /^JJ_SEAT: ([a-z0-9_]+)=(.*)$/.exec(l);
      if (m) { if (keys.has(m[1]) && keys.get(m[1]) !== m[2]) R.push(`live-key-conflict:${m[1]}`); keys.set(m[1], m[2]); }
    }
    if (!runs[0].out.equals(runs[1].out)) R.push('nondeterministic-output');
    if (keys.size < 21) R.push(`demo-keys=${keys.size}`);
    if (!/^JJ_SEAT_DEMO: DONE /m.test(runs[0].out.toString('utf8'))) R.push('no-done-line');
    for (const [k, v] of stated) {
      if (!keys.has(k)) R.push(`${k}:stated-not-live`);
      else if (keys.get(k) !== v) R.push(`${k}:stated=${v}:live=${keys.get(k)}`);
    }
    for (const k of keys.keys()) if (!stated.has(k)) R.push(`${k}:live-not-stated`);
    const subs = new Set();
    for (const r of runs) for (const c of r.calls) { const s = subOf(c); if (s) subs.add(s); }
    const missing = REQUIRED_SUBS.filter((s) => !subs.has(s));
    if (runs[0].calls.length < 20) R.push(`jj-calls=${runs[0].calls.length}`);
    if (missing.length) R.push(`jj-subcommands-missing=${missing.join('/')}`);
    info.S4 += ` runs=2 keys=${keys.size} cwd-clean=${runs.every((r) => r.left.length === 0)} jj-calls=${runs[0].calls.length} subcommands=${subs.size}`;
    if (VERBOSE) detail.push(`  S4 subcommands: ${[...subs].sort().join(' ')}`);
  }
}

// S5 -------------------------------------------------------------------------
{
  const R = reasons.S5;
  if (!LIVE) R.push('live-fetch-skipped');
  else if (!entryText) R.push('entry-absent');
  else {
    const notes = [];
    for (const id of entryIds) {
      const row = rows.get(id);
      if (!row) { R.push(`${id}:not-in-registry`); continue; }
      if (!row.url) { R.push(`${id}:no-url`); continue; }
      const x = publicUrl(row.url);
      if (!x) { R.push(`${id}:non-public-url:${row.url.slice(0, 40)}`); continue; }
      const cap = read(pinPathFor(id));
      if (!cap) { R.push(`${id}:capture-absent`); continue; }
      const live = fetchLive(row.url);
      if (!live) { R.push(`${id}:live-unreachable`); continue; }
      const liveT = normInd(live);
      for (const b of bullets.filter((q) => q.id === id)) {
        if (!liveT.includes(normInd(Buffer.from(b.q)))) R.push(`${id}:quote-not-live(${b.q.slice(0, 24)})`);
      }
      const ident = identity(row.url, cap);
      if (live.equals(cap)) notes.push(`${id}:identical${ident.ok ? '' : ' (identity by byte-equality)'}`);
      else {
        if (!ident.ok) R.push(`${id}:capture-not-bound-to-url(${ident.why})`);
        const qs = bullets.filter((q) => q.id === id).map((q) => normInd(Buffer.from(q.q)));
        const capS = sentences(normInd(cap));
        const liveS = sentences(liveT);
        const capCount = new Map();
        for (const s of capS) capCount.set(s, (capCount.get(s) || 0) + 1);
        const liveCount = new Map();
        for (const s of liveS) liveCount.set(s, (liveCount.get(s) || 0) + 1);
        const diff = [];
        for (const [s, n] of capCount) if ((liveCount.get(s) || 0) < n) diff.push(s);
        for (const [s, n] of liveCount) if ((capCount.get(s) || 0) < n) diff.push(s);
        const inside = diff.filter((s) => qs.some((q) => q.includes(s) || s.includes(q)));
        if (inside.length) R.push(`${id}:diff-inside-quotes=${inside.length}`);
        notes.push(`${id}:differ-outside-quotes(diff-sentences=${diff.length}${inside.length ? `,inside=${inside.length}` : ''})`);
      }
    }
    info.S5 = notes.join(' ');
  }
}

// S6 -------------------------------------------------------------------------
{
  const R = reasons.S6;
  if (!registryText) R.push('registry-absent');
  else {
    if (dupRows.length) R.push(`duplicate-row:${dupRows.join(',')}`);
    const citing = new Set();
    for (const [id, n] of rowCellCount) if (n !== 11) R.push(`${id}:cells=${n}`);
    for (const id of entryIds) {
      const row = rows.get(id);
      if (!row) { R.push(`${id}:not-in-registry`); continue; }
      if (rowCellCount.get(id) !== 11) continue;
      const c = row.cells;
      if (!row.url) R.push(`${id}:no-url`);
      if (!c[2]) R.push(`${id}:no-tier`);
      if (c[7] !== 'mined') R.push(`${id}:status=${c[7]}`);
      if (c[8] !== '2026-10-25') R.push(`${id}:opened=${c[8]}`);
      if (!/^\d+[dmy]$/.test(c[9] || '')) R.push(`${id}:ttl=${c[9]}`);
      if (!(c[10] || '').includes(ENTRY)) R.push(`${id}:used-by-lacks-entry`);
    }
    for (const [id, row] of rows) if ((row.cells[10] || '').includes(ENTRY)) citing.add(id);
    for (const id of citing) if (!entryIds.includes(id)) R.push(`${id}:cites-entry-but-entry-omits-it`);
    info.S6 = `rows=${rows.size} cells=11/11 cited=${entryIds.join(',')} citing-entry=${[...citing].join(',') || 'none'}`;
  }
}

// ---- observation (not part of the verdict): the same keys in C2's other prose --
const observations = [];
{
  for (const doc of ['corpus/lessons/round-64.md', 'corpus/knowledge/agent-isolation-substrates.md', 'PROVINCE.md']) {
    const b = read(doc);
    if (!b) continue;
    const text = b.toString('utf8');
    for (const m of text.matchAll(/\b([a-z][a-z0-9_]{2,})=([a-z0-9][a-z0-9-]*)\b/g)) {
      const k = m[1];
      const v = m[2];
      if (!stated.has(k)) continue;
      const sv = stated.get(k);
      if (sv !== v && !sv.split(/,\s*/).map((s) => s.trim()).includes(v)) observations.push(`${doc}:${k}=${v} (entry/demo=${sv})`);
    }
  }
}

// ---- verdict ---------------------------------------------------------------
const ids = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const held = ids.filter((id) => reasons[id].length === 0);
const out = [];
for (const id of ids) {
  const okArm = reasons[id].length === 0;
  out.push(`${id} ${okArm ? 'PASS' : 'FAIL'} ${info[id]}${okArm ? '' : ` | ${reasons[id].slice(0, 8).join('; ')}`}`);
}
out.push(...detail);
for (const o of observations) out.push(`OBS prose-drift ${o}`);
const ok = held.length === ids.length;
out.push(`SUPP_C2: ${ok ? 'PASS' : 'FAIL'} arms=${held.length}/6 rev=${full} entry=${ENTRY} rule=${RULE}`);
process.stdout.write(`${out.join('\n')}\n`);
cleanup();
process.exit(ok ? 0 : 1);
