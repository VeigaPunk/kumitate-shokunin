#!/usr/bin/env node
/**
 * anchor-truth.mjs — per-anchor truth gate (contract `kumitate-anchor-truth-v1`, round 38).
 *
 * WHY. Rounds 36 and 37 were rejected-harmed. `claims-check --fidelity` pairs a
 * symbol with an anchor by 14-character adjacency, and its ratchet ceilings equal
 * the current debt, so the gate passed a forward shift of 123 anchors (round 36)
 * and a reset that re-broke 62 true anchors (round 37). See
 * `corpus/lessons/round-36-verifier-spotcheck.md` and
 * `corpus/lessons/round-37-verifier-spotcheck.md`. This gate checks every anchor of
 * the registered notes against the pinned upstream source. It pins one expectation
 * per anchor and fails on regression, set change, stale debt, debt growth and
 * invalid review overrides.
 *
 * ANCHORS. Every backticked `path:N`, `path:N-M`, `:N` or `:N-M` span outside fenced
 * code, in a paragraph, heading or table row. A bare `:N` takes the most recent
 * repo-relative path (contains `/`, no leading `.`). Paths come from headings, path
 * spans and path-bearing anchors.
 *
 * PAIRING (proposal only; the pin is the authority). Within a sentence, the symbols
 * seen since the previous anchor run pair positionally with the next run: the last
 * k symbols take the k anchors, left first. If there are fewer symbols than anchors,
 * the leading anchors take the next symbol in the sentence. Spans joined only by
 * `,`, `;`, `/`, parentheses, `and` or `or` form one run.
 *
 * TRUTH. The token (the paired symbol, or a reviewed override) is normalised:
 * quotes, a trailing call or argument list, and leading `.`/`#`/`-` are stripped.
 * The token is true when the whole normalised token, or its longest identifier,
 * occurs word-bounded on the cited line(s) of the file (letters, digits and `_` bound a
 * word; `$` does not, so a shell `$NAME` use matches `NAME`). The file is resolved inside
 * the pinned clone: an exact path, else a unique `ls-files` suffix. Absolute and
 * `..` paths, and anything that resolves outside the clone, are `dead`.
 *
 * PIN `.ufo/pins/anchor-truth.json`
 *   { contract, revision, notes: { "<note path>": { anchors, entries: [
 *       { key, ord, raw, path, a, b, token, source, expect } ] } } }
 *   expect: `true` | `unchecked` (no token) | `debt:false` | `debt:dead`
 *   source: `pair` | `review:<seat>`; key = `<path>|<token or #>|<k>`, the k-th
 *   occurrence of that path+token in the note.
 * Findings (`TRUTH  <KIND>  <note>#<ord> …`), all errors:
 *   REGRESSED          expect true, token not on the cited line(s)
 *   ANCHOR_SET_CHANGED the note's raw anchor sequence differs from the pin (re-pin)
 *   DEBT_STALE         expect debt, but the token now reads true (shrink the pin)
 *   OVERRIDE_INVALID   review token absent from the sentence or the cited line(s)
 *   REVIEW_UNBOUND     review:<seat> source with no committed review record for this anchor
 *   DEBT_GREW          (--base REV) a note's debt count rose, or a key true at REV is debt now
 *   DEBT_NEW           (--open REV) a current debt anchor has no equal debt anchor at the
 *                       round-open revision (same raw@path occurrence and same token)
 *   CHECKED_SHRANK     (--base REV) a note's count of `true` expectations fell
 *   PIN_REGRESSION     (--write-pin) a key expected true would become non-true; pin not written
 *
 * REVIEW BINDING. A `review:<seat>` source is a claim: "seat X reviewed this anchor and
 * said this token". The claim is true only when a COMMITTED review record backs it, and the
 * record is read from committed bytes (`git show REV:<path>`), never from the working tree.
 *   REVISION. The records are read at the revision the caller names with `--open REV` (the
 *   round-open revision): a record written in the very change being judged cannot bind.
 *   Without `--open` the records are read at the lane's current HEAD and the gate prints one
 *   warning line, because that revision is inside the change being judged.
 *   RECORDS. Every committed file `.ufo/waves/<round>/anchor-reviews.json` is a review
 *   registry: `{ "<note>#<ord>": { seat, token } }`.
 *   IDENTITY. The ordinal alone is not the binding (ordinals shift when the note grows), so
 *   a record's `<note>#<ord>` is resolved through the PIN at the record revision to an anchor
 *   identity `raw@path#occurrence`. A pin entry is bound only when a record names the same
 *   note, the same seat and the same token AND resolves to that entry's own anchor (the same
 *   identity, or the same file with one cited range nested in the other: a widened or
 *   narrowed citation of the reviewed anchor is the same anchor). A review token that
 *   travels to another anchor, or a seat that never reviewed it, is unbound.
 *   NO SEAT REPORT NEEDED. The registry is the record; a per-seat report file
 *   (`.ufo/waves/<round>/build|falsify/<seat>.md`) is corroboration, not a requirement (the
 *   L1 seat of round 38 left its review in the registry only).
 *   WORKFLOW. Commit the registry first, then re-pin: `--write-pin` refuses to write a pin
 *   whose review source has no committed record (REVIEW_UNBOUND, pin not written), so an
 *   unbound override can never be laundered into the pin.
 * Verdict (last stdout line):
 *   TRUTH: CLEAN (notes=<n> anchors=<n> true=<n> debt=<n> unchecked=<n> src-rev=<12>)
 *   TRUTH: DRIFT (<n> findings: KIND …)
 *   TRUTH: FAIL-CLOSED (<TOKEN> detail)
 * exit: 0 clean · 1 drift · 2 fail-closed · 64 usage
 *
 * CLI: node scripts/anchor-truth.mjs [--self DIR] [--pin FILE] [--src DIR]
 *        [--base REV] [--open REV] [--write-pin [--reviews FILE] [--notes a.md,b.md]] [--json] [--selftest]
 * `--open REV` adds the round-open floor: the pin at REV (the revision the L1 passes on the
 * command line, never a lane file) is a second base for BASE_TRUE_LOST, DEBT_GREW and
 * CHECKED_SHRANK, and every current debt anchor must equal a debt anchor at REV by identity
 * (raw@path occurrence) and by token, else DEBT_NEW. `unchecked` anchors are exempt.
 * Read-only except `--write-pin`, which writes the pin file only. The selftest writes
 * only mkdtemp fixtures.
 */
import { spawnSync } from 'node:child_process';
import { capSpawnSync } from './cap-spawn.mjs';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-anchor-truth-v1';
const TOOL_FILE = fileURLToPath(import.meta.url);
const W = '[\\p{L}\\p{N}_]';
const SPAN = /`([^`\n]+)`/gu;
const ANCH = /^([\p{L}\p{N}_./@+-]*[\p{L}\p{N}_-]\.[\p{L}\p{N}_]+)?:(\d+)(?:-(\d+))?$/u;
const PATHRE = /^[\p{L}\p{N}_./@+-]+\.(?:mjs|cjs|js|ts|json|md|sh|rs|toml|py|service|timer|ya?ml|txt|lock|conf)$/u;
const IDENT = /[A-Za-z_$][\p{L}\p{N}_$]*/gu;
const JOIN = /^[\s,;/()]*(?:(?:and|or)[\s,;/()]*)?$/u;
const SENT_END = /(?:\.\s+(?=[A-Z*`(])|\.\s*$|;\s|:\s*$)/u;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_NOTE_BYTES = 4 * 1024 * 1024;
const MAX_JSON_BYTES = 32 * 1024 * 1024;
const MAX_OPEN_PIN_BYTES = 4 * 1024 * 1024;
const MAX_TOKEN_CHARS = 256;
const NOTE_KEY = /^corpus\/knowledge\/[A-Za-z0-9._-]+\.md$/;
const REVIEW_REGISTRY_RE = /^\.ufo\/waves\/[^/]+\/anchor-reviews\.json$/u;
const MAX_REVIEW_BYTES = 32 * 1024 * 1024;
const MAX_REVIEW_REGISTRIES = 64;
const GIT_BIN = existsSync('/usr/bin/git') ? '/usr/bin/git' : 'git';
const GIT_ENV_KEEP = new Set(['PATH', 'HOME', 'LANG', 'LC_ALL', 'TMPDIR', 'SYSTEMROOT',
  'GIT_CEILING_DIRECTORIES', 'GIT_CONFIG_NOSYSTEM', 'GIT_CONFIG_GLOBAL', 'GIT_CONFIG_SYSTEM',
  'GIT_OPTIONAL_LOCKS', 'GIT_TERMINAL_PROMPT', 'GIT_ATTR_NOSYSTEM']);

function gitEnv(extra) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (GIT_ENV_KEEP.has(k)) env[k] = v;
  return { ...env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', ...(extra ?? {}) };
}
function git(dir, args) {
  const r = spawnSync(GIT_BIN, ['-C', dir, ...args], { encoding: 'utf8', timeout: 60_000, maxBuffer: 64 * 1024 * 1024, env: gitEnv() });
  return { ok: !r.error && r.status === 0, out: r.stdout ?? '', err: r.stderr ?? '' };
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const strip = (s) => s.replace(/^[\s]+|[\s]+$/gu, '');

/* ── parsing ─────────────────────────────────────────────────────────────── */

function* blocks(text) {
  let cur = [];
  let start = null;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ln = i + 1;
    if (strip(line) === '' || line.startsWith('#') || line.replace(/^\s+/u, '').startsWith('|') || line.startsWith('```')) {
      if (cur.length) { yield [cur.join(' '), start]; cur = []; }
      if (strip(line)) yield [line, ln];
      continue;
    }
    if (!cur.length) start = ln;
    cur.push(line);
  }
  if (cur.length) yield [cur.join(' '), start];
}

/** Parse a note into anchors in document order: {line, path, a, b, sym, raw, sentence}. */
export function parseNote(text) {
  const out = [];
  let curPath = null;
  let inCode = false;
  for (const [blk, ln] of blocks(text)) {
    if (blk.startsWith('```')) { inCode = !inCode; continue; }
    if (inCode) continue;
    if (blk.startsWith('#')) {
      const m = [...blk.matchAll(SPAN)].map((x) => x[1]).filter((s) => PATHRE.test(s) && s.includes('/') && !s.startsWith('.'));
      if (m.length) curPath = m[0];
    }
    const isRow = blk.replace(/^\s+/u, '').startsWith('|');
    const sentences = [];
    let sent = [];
    let pos = 0;
    for (const m of blk.matchAll(SPAN)) {
      const gap = blk.slice(pos, m.index);
      if (SENT_END.test(gap) || (isRow && gap.includes('|'))) {
        if (sent.length) sentences.push(sent);
        sent = [];
      }
      sent.push([m[1], gap, pos, m.index]);
      pos = m.index + m[0].length;
    }
    if (sent.length) sentences.push(sent);
    sentences.forEach((s) => {
      // Override scope: the anchor's own paragraph, heading or table row (round 38): a review
      // token must occur in the note's text around the anchor, never be invented.
      const sentence = blk;
      const items = s.map(([val, gap]) => {
        const am = ANCH.exec(val);
        if (am) return { kind: 'A', val, gap, path: am[1] ?? null, a: Number(am[2]), b: Number(am[3] ?? am[2]) };
        if (PATHRE.test(val)) return { kind: 'P', val, gap };
        return { kind: 'S', val, gap };
      });
      let pending = [];
      let i = 0;
      while (i < items.length) {
        const it = items[i];
        if (it.kind === 'P') {
          if (it.val.includes('/') && !it.val.startsWith('.')) curPath = it.val;
          i++; continue;
        }
        if (it.kind === 'S') { pending.push(it.val); i++; continue; }
        const run = [it];
        let j = i + 1;
        while (j < items.length && items[j].kind === 'A' && JOIN.test(items[j].gap)) { run.push(items[j]); j++; }
        const k = run.length;
        const syms = pending.length ? pending.slice(-k) : [];
        let nxt = null;
        if (syms.length === 0) {
          // Forward fill ("At `path:N`, `sym`") only when that symbol does not own the next
          // anchor run itself: a lookahead never steals another citation's symbol.
          for (let q = j; q < items.length; q++) {
            if (items[q].kind !== 'S') continue;
            let r2 = q + 1;
            while (r2 < items.length && items[r2].kind === 'S' && JOIN.test(items[r2].gap)) r2++;
            const owned = r2 < items.length && items[r2].kind === 'A';
            if (!owned) nxt = items[q].val;
            break;
          }
        }
        // Fewer symbols than anchors: the earliest pending symbol is shared by the leading anchors
        // (one phrase cited at two sites), never borrowed from later text.
        const assign = syms.length ? [...Array(k - syms.length).fill(syms[0]), ...syms] : Array(k).fill(null);
        run.forEach((r, idx) => {
          const path = r.path ?? curPath;
          if (r.path) curPath = r.path;
          const a = assign[idx];
          out.push({ line: ln, path, a: r.a, b: r.b, sym: a !== null ? a : nxt, raw: r.val, sentence });
        });
        pending = [];
        i = j;
      }
    });
  }
  return out;
}

export function norm(sym) {
  let s = strip(sym).replace(/^["']+|["']+$/g, '');
  s = s.replace(/\(.*\)$/u, '');
  s = s.replace(/^[.#-]+/u, '');
  const toks = s.match(IDENT) ?? [];
  let longest = s;
  if (toks.length) { longest = toks[0]; for (const t of toks) if (t.length > longest.length) longest = t; }
  return [s, longest];
}
const wb = (t, seg) => t !== '' && new RegExp(`(?<!${W})${esc(t)}(?!${W})`, 'u').test(seg);

/* ── source access (pinned clone) ────────────────────────────────────────── */

class Source {
  // Reads committed blobs at the pinned revision only (`git show REV:path`), never the clone's
  // working tree: a dirty or symlinked worktree cannot change a verdict (round-38 SentGate).
  constructor(root, rev) {
    this.root = root;
    this.rev = rev;
    this.cache = new Map();
    const t = git(root, ['ls-tree', '-r', '-z', rev]);
    if (!t.ok) throw new Error('source tree inventory failed');
    this.files = new Set(t.out.split('\0').filter(Boolean).flatMap((row) => {
      const tab = row.indexOf('\t');
      return /^100(?:644|755) blob /u.test(row) && tab >= 0 ? [row.slice(tab + 1)] : [];
    }));
    this.list = [...this.files];
  }
  resolve(path) {
    if (!path || path.startsWith('/') || path.split('/').includes('..')) return null;
    if (this.files.has(path)) return path;
    const c = this.list.filter((f) => f.endsWith('/' + path));
    return c.length === 1 ? c[0] : null;
  }
  lines(rel) {
    if (!this.cache.has(rel)) {
      const sz = git(this.root, ['cat-file', '-s', `${this.rev}:${rel}`]);
      if (!sz.ok || Number(sz.out.trim()) > MAX_FILE_BYTES) { this.cache.set(rel, null); return null; }
      const r = git(this.root, ['show', `${this.rev}:${rel}`]);
      this.cache.set(rel, r.ok ? r.out.split('\n') : null);
    }
    return this.cache.get(rel);
  }
}

/**
 * Committed review records for `review:<seat>` pin sources (round-40 closure R39-1).
 *
 * A review source is a claim: "seat X reviewed this anchor and said this token". The claim
 * holds only when a COMMITTED review record backs it. Records live in review registries
 * (`.ufo/waves/<round>/anchor-reviews.json`), read from the lane's committed bytes at HEAD,
 * never from the working tree. A registry maps `<note>#<ord>` to { seat, token }; the
 * ordinal is resolved against the note as committed at the revision that last wrote the
 * registry, so a record follows its anchor when the note's anchor order shifts.
 *
 * A record binds a pin entry when it names the same note, the same seat and the same token
 * AND its anchor is the entry's anchor: the same file, with cited line ranges that overlap
 * (a widened or narrowed citation of the reviewed range is the same anchor). A review token
 * that travels to another anchor, or a seat that never reviewed it, is unbound.
 */
class ReviewRecords {
  constructor(laneRoot, rev) {
    this.root = laneRoot;
    this.rev = rev ?? null;
    this.byKey = new Map();  // `${note}|${seat}|${token}` -> [{identity, path, a, b}]
    this.registries = 0;
    this.records = 0;
    this.error = null;
    if (!this.rev) return;
    const tree = git(laneRoot, ['ls-tree', '-r', '-z', this.rev]);
    if (!tree.ok) return;
    const registryPaths = [];
    for (const row of tree.out.split('\0')) {
      if (!row) continue;
      const tab = row.indexOf('\t');
      if (tab < 0) continue;
      const path = row.slice(tab + 1);
      if (REVIEW_REGISTRY_RE.test(path)) registryPaths.push(path);
    }
    if (registryPaths.length > MAX_REVIEW_REGISTRIES) {
      this.error = { token: 'REVIEW_REGISTRY_LIMIT', detail: `count=${registryPaths.length} max=${MAX_REVIEW_REGISTRIES}` };
      return;
    }
    // The pin at the record revision: a record's ordinal is resolved through it, so a record
    // names an anchor (raw@path#occurrence) and not a position in a list.
    const pin = this.pinAt(this.rev);
    const pins = new Map();
    if (pin) {
      for (const [note, pn] of Object.entries(pin.notes ?? {})) {
        const entries = pn?.entries ?? [];
        pins.set(note, { entries, ids: identities(entries) });
      }
    }
    for (const path of registryPaths) {
      const body = this.blob(this.rev, path);
      if (body === null) continue;
      let json;
      try { json = JSON.parse(body); } catch { continue; }
      if (!json || typeof json !== 'object' || Array.isArray(json)) continue;
      this.registries++;
      for (const [k, v] of Object.entries(json)) {
        const hash = k.lastIndexOf('#');
        if (hash < 1) continue;
        const note = k.slice(0, hash);
        const ord = Number(k.slice(hash + 1));
        if (!note || !Number.isInteger(ord) || ord < 0) continue;
        if (!v || typeof v !== 'object') continue;
        const seat = typeof v.seat === 'string' ? v.seat : null;
        const token = typeof v.token === 'string' ? v.token : null;
        if (!seat || token === null) continue;
        const np = pins.get(note);
        if (!np || ord >= np.entries.length) continue;
        const entry = np.entries[ord];
        const key = `${note}|${seat}|${token}`;
        if (!this.byKey.has(key)) this.byKey.set(key, []);
        this.byKey.get(key).push({ identity: np.ids[ord], path: entry.path ?? null, a: entry.a, b: entry.b });
        this.records++;
      }
    }
  }
  blob(rev, path) {
    const size = git(this.root, ['cat-file', '-s', `${rev}:${path}`]);
    if (!size.ok || Number(size.out.trim()) > MAX_REVIEW_BYTES) return null;
    const r = git(this.root, ['show', `${rev}:${path}`]);
    return r.ok ? r.out : null;
  }
  pinAt(rev) {
    const body = this.blob(rev, '.ufo/pins/anchor-truth.json');
    if (body === null) return null;
    try { return JSON.parse(body); } catch { return null; }
  }
  /**
   * True when a committed record binds this review-sourced entry: the record names the same
   * note, seat and token, and its anchor is the entry's anchor (same identity, or the same
   * file with one cited range nested in the other: a widened or narrowed citation of the
   * reviewed anchor is the same anchor). The nested fallback applies only when the record's
   * own anchor identity is gone from the current note, and one record binds at most one entry
   * that way, so a record cannot be borrowed by a second anchor (round-40 falsify seats
   * AtkReviewForge and AtkNovelPin).
   */
  bound(note, e, identity, current) {
    if (typeof e.source !== 'string' || !e.source.startsWith('review:')) return true;
    const seat = e.source.slice('review:'.length);
    const list = this.byKey.get(`${note}|${seat}|${e.token}`);
    if (!list) return false;
    for (const rec of list) {
      if (identity && rec.identity === identity) return true;
    }
    for (const rec of list) {
      if (current && current.has(rec.identity)) continue;
      if (!rec.path || !e.path || rec.path !== e.path) continue;
      if (!Number.isInteger(e.a) || !Number.isInteger(e.b)) continue;
      this.nestUsed ??= new Set();
      if (this.nestUsed.has(rec)) continue;
      if ((rec.a <= e.a && e.b <= rec.b) || (e.a <= rec.a && rec.b <= e.b)) { this.nestUsed.add(rec); return true; }
    }
    return false;
  }
}

/** Status of one (path, a, b, token): true | false | dead | unchecked. */
function judge(src, path, a, b, token) {
  if (token === null || token === undefined) return 'unchecked';
  if (String(token).length > MAX_TOKEN_CHARS) return 'false';
  const rp = src.resolve(path);
  if (rp === null) return 'dead';
  const L = src.lines(rp);
  if (L === null || a < 1 || b > L.length || a > b) return 'dead';
  const seg = L.slice(a - 1, b).join('\n');
  const [full, longest] = norm(token);
  return (full && wb(full, seg)) || (longest && wb(longest, seg)) ? 'true' : 'false';
}

function keyed(entries) {
  const seen = new Map();
  for (const e of entries) {
    const base = `${e.path}|${e.token ?? '#'}`;
    const k = seen.get(base) ?? 0;
    seen.set(base, k + 1);
    e.key = `${base}|${k}`;
  }
  return entries;
}

/* ── pin construction and checking ───────────────────────────────────────── */

function buildEntries(noteText, src, prior, reviews, note) {
  const anchors = parseNote(noteText);
  const priorByOrd = new Map((prior?.entries ?? []).map((e) => [e.ord, e]));
  const entries = anchors.map((x, ord) => {
    const rv = reviews?.[`${note}#${ord}`];
    const pe = priorByOrd.get(ord);
    let token = x.sym;
    let source = 'pair';
    if (rv && rv.token) { token = rv.token; source = `review:${rv.seat ?? 'l1'}`; }
    else if (pe && pe.source?.startsWith('review:') && pe.raw === x.raw) { token = pe.token; source = pe.source; }
    const st = judge(src, x.path, x.a, x.b, token);
    const expect = st === 'true' ? 'true' : st === 'unchecked' ? 'unchecked' : `debt:${st}`;
    return { ord, raw: x.raw, path: x.path, a: x.a, b: x.b, token: token ?? null, source, expect, line: x.line, sentence: x.sentence };
  });
  return keyed(entries);
}

function overrideValid(e, src) {
  const [full, longest] = norm(e.token);
  const inSentence = wb(full, e.sentence) || wb(longest, e.sentence);
  return inSentence && judge(src, e.path, e.a, e.b, e.token) === 'true';
}

function checkNote(note, noteText, pinNote, src, recs) {
  const findings = [];
  const anchors = parseNote(noteText);
  const ids = identities(pinNote.entries ?? []);
  const rawNow = anchors.map((x) => `${x.raw}@${x.path}`);
  const rawPin = pinNote.entries.map((e) => `${e.raw}@${e.path}`);
  const counts = { anchors: anchors.length, true: 0, debt: 0, unchecked: 0 };
  if (rawNow.length !== rawPin.length || rawNow.some((r, i) => r !== rawPin[i])) {
    const i = rawNow.findIndex((r, idx) => r !== rawPin[idx]);
    findings.push(['ANCHOR_SET_CHANGED', `${note}#${i < 0 ? rawNow.length : i}`, `now=${rawNow.length} pinned=${rawPin.length} first-diff=${i < 0 ? 'length' : `${rawNow[i] ?? '∅'} vs ${rawPin[i] ?? '∅'}`}`]);
    return { findings, counts };
  }
  pinNote.entries.forEach((e, i) => {
    const x = anchors[i];
    const live = { ...e, sentence: x.sentence };
    const st = judge(src, e.path, e.a, e.b, e.token);
    if (e.expect === 'true') counts.true++; else if (e.expect === 'unchecked') counts.unchecked++; else counts.debt++;
    if (String(e.source).startsWith('review:')) {
      if (!recs.bound(note, e, ids[e.ord], new Set(ids))) {
        findings.push(['REVIEW_UNBOUND', `${note}#${e.ord}`, `${e.raw} source=${e.source} token=${e.token} no committed review record binds this anchor`]);
      }
      if (!overrideValid(live, src)) {
        findings.push(['OVERRIDE_INVALID', `${note}#${e.ord}`, `${e.raw} token=${e.token}`]);
      }
    }
    if (e.source === 'pair' && e.token !== (x.sym ?? null)) {
      // A `pair` token must be the note's own pairing; a hand-set token on the line is not a repair.
      findings.push(['TOKEN_FORGED', `${note}#${e.ord}`, `${e.raw} pinned=${e.token} paired=${x.sym ?? null}`]);
    }
    if (e.expect === 'true' && st !== 'true') findings.push(['REGRESSED', `${note}#${e.ord}`, `${e.raw} token=${e.token} status=${st}`]);
    else if (e.expect.startsWith('debt:') && st === 'true') findings.push(['DEBT_STALE', `${note}#${e.ord}`, `${e.raw} token=${e.token}`]);
    else if (e.expect === 'unchecked' && e.token !== null) findings.push(['REGRESSED', `${note}#${e.ord}`, `${e.raw} unchecked entry carries a token`]);
  });
  return { findings, counts };
}

/** Token-independent anchor identity: the nth occurrence of `raw@path` in its note. */
function identities(entries) {
  const seen = new Map();
  return entries.map((e) => {
    const id = `${e.raw}@${e.path}`;
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    return `${id}#${n}`;
  });
}

function compareBase(pin, basePin) {
  const findings = [];
  for (const [note, bn] of Object.entries(basePin.notes ?? {})) {
    const cn = pin.notes?.[note];
    const tally = (n) => {
      const c = { true: 0, debt: 0 };
      for (const e of n?.entries ?? []) { if (e.expect === 'true') c.true++; else if (String(e.expect).startsWith('debt:')) c.debt++; }
      return c;
    };
    const b = tally(bn);
    const c = tally(cn);
    if (!cn) { findings.push(['CHECKED_SHRANK', `${note}#-`, `note dropped from the pin (base true=${b.true})`]); continue; }
    if (c.debt > b.debt) findings.push(['DEBT_GREW', `${note}#-`, `debt ${b.debt} -> ${c.debt}`]);
    if (c.true < b.true) findings.push(['CHECKED_SHRANK', `${note}#-`, `true ${b.true} -> ${c.true}`]);
    const now = new Map(cn.entries.map((e) => [e.key, e]));
    for (const e of bn.entries ?? []) {
      if (e.expect !== 'true') continue;
      const m = now.get(e.key);
      if (m && m.expect !== 'true') findings.push(['DEBT_GREW', `${note}#${m.ord}`, `${e.key} true at base, ${m.expect} now`]);
    }
    // The key carries the paired token, so a current entry re-keyed or re-tokened escaped the
    // key match above (round-38 closure R38-1). Identity reads neither key nor token: every
    // anchor true at base must still exist at the same raw@path occurrence and still be true.
    const curIds = identities(cn.entries);
    const byId = new Map();
    curIds.forEach((id, i) => byId.set(id, cn.entries[i]));
    const baseIds = identities(bn.entries ?? []);
    (bn.entries ?? []).forEach((e, i) => {
      if (e.expect !== 'true') return;
      const m = byId.get(baseIds[i]);
      if (!m) findings.push(['BASE_TRUE_LOST', `${note}#${e.ord}`, `${baseIds[i]} true at base, anchor gone`]);
      else if (m.expect !== 'true') findings.push(['BASE_TRUE_LOST', `${note}#${m.ord}`, `${baseIds[i]} true at base, ${m.expect} now`]);
    });
    // Occurrence order alone can be masked: insert an earlier true copy of a base-true raw@path,
    // then falsify the original. Per raw@path that held a true anchor at base, the number of
    // non-true anchors may not grow.
    const groups = (entries, ids) => {
      const g = new Map();
      entries.forEach((e, i) => {
        const k = ids[i].replace(/#\d+$/u, '');
        const c = g.get(k) ?? { t: 0, n: 0 };
        if (e.expect === 'true') c.t++; else c.n++;
        g.set(k, c);
      });
      return g;
    };
    const gNow = groups(cn.entries, curIds);
    for (const [k, b] of groups(bn.entries ?? [], baseIds)) {
      const c = gNow.get(k) ?? { t: 0, n: 0 };
      if (b.t > 0 && c.n > b.n) findings.push(['BASE_TRUE_LOST', `${note}#-`, `${k} non-true anchors ${b.n} -> ${c.n} at a raw@path true at base`]);
    }
  }
  return findings;
}

/**
 * Round-open floor (round 40, R39-3): the pin at the round-open revision is a second base.
 * BASE_TRUE_LOST, DEBT_GREW and CHECKED_SHRANK run against it exactly as they run against
 * `--base`, and every current debt anchor must equal a debt anchor at that revision by
 * identity (raw@path occurrence) and by token; `unchecked` anchors are exempt.
 */
function compareOpen(pin, openPin) {
  const findings = compareBase(pin, openPin).map(([k, id, d]) => [k, id, `${d} (open floor)`]);
  for (const [note, cn] of Object.entries(pin.notes ?? {})) {
    const on = openPin.notes?.[note];
    const openIds = on ? identities(on.entries ?? []) : [];
    const openDebt = new Set();
    (on?.entries ?? []).forEach((e, i) => {
      if (String(e.expect).startsWith('debt:')) openDebt.add(`${openIds[i]} ${e.token ?? ''}`);
    });
    const curIds = identities(cn.entries ?? []);
    cn.entries.forEach((e, i) => {
      if (!String(e.expect).startsWith('debt:')) return;
      const key = `${curIds[i]} ${e.token ?? ''}`;
      if (!openDebt.has(key)) {
        findings.push(['DEBT_NEW', `${note}#${e.ord}`, `${curIds[i]} ${e.expect} now, no equal debt anchor at the open revision`]);
      }
    });
  }
  return findings;
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const o = { self: process.cwd(), pin: null, src: null, base: null, open: null, write: false, reviews: null, notes: null, json: false, selftest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => { if (i + 1 >= argv.length) throw new Error(`${a} needs a value`); return argv[++i]; };
    if (a === '--self') o.self = val();
    else if (a === '--pin') o.pin = val();
    else if (a === '--src') o.src = val();
    else if (a === '--base') o.base = val();
    else if (a === '--open') o.open = val();
    else if (a === '--write-pin') o.write = true;
    else if (a === '--reviews') o.reviews = val();
    else if (a === '--notes') o.notes = val().split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--json') o.json = true;
    else if (a === '--selftest') o.selftest = true;
    else throw new Error(`unknown argument ${a}`);
  }
  return o;
}

function readCapped(p, cap) {
  if (statSync(p).size > cap) throw new Error(`file over ${cap} bytes: ${p}`);
  return readFileSync(p, 'utf8');
}
function noteOk(self, note) {
  if (!NOTE_KEY.test(note)) return false;
  const p = join(self, note);
  try { const r = realpathSync(p); const s = realpathSync(self); return r.startsWith(s + sep); } catch { return false; }
}

function validPin(pin) {
  if (!pin || pin.contract !== CONTRACT || !/^[0-9a-f]{40}$/.test(pin.revision ?? '')
      || !pin.notes || Array.isArray(pin.notes) || !Object.keys(pin.notes).length) return false;
  for (const [note, pn] of Object.entries(pin.notes)) {
    if (!NOTE_KEY.test(note) || !pn || !Array.isArray(pn.entries) || pn.anchors !== pn.entries.length) return false;
    const keys = new Set();
    for (let i = 0; i < pn.entries.length; i++) {
      const e = pn.entries[i];
      const a = ANCH.exec(e?.raw ?? '');
      if (!a || e.ord !== i || e.a !== Number(a[2]) || e.b !== Number(a[3] ?? a[2])
          || !(e.path === null || typeof e.path === 'string')
          || !(e.token === null || (typeof e.token === 'string' && e.token.length <= MAX_TOKEN_CHARS))
          || !['true', 'unchecked', 'debt:false', 'debt:dead'].includes(e.expect)
          || typeof e.source !== 'string' || !(e.source === 'pair' || (/^review:\S+$/u.test(e.source) && e.token !== null))
          || typeof e.key !== 'string' || keys.has(e.key)) return false;
      keys.add(e.key);
    }
  }
  return true;
}

function failClosed(token, detail) {
  process.stdout.write(`TRUTH: FAIL-CLOSED (${token} ${detail})\n`);
  return 2;
}

export function run(argv) {
  let o;
  try { o = parseArgs(argv); } catch (e) { process.stderr.write(`anchor-truth: ${e.message}\n`); return 64; }
  if (o.selftest) return selfTest();
  const self = resolve(o.self);
  const pinPath = resolve(self, o.pin ?? '.ufo/pins/anchor-truth.json');
  const originPath = join(self, '.ufo/pins/origin.json');
  if (!existsSync(originPath)) return failClosed('ORIGIN_PIN_MISSING', originPath);
  let origin;
  try { origin = JSON.parse(readFileSync(originPath, 'utf8')); } catch { return failClosed('ORIGIN_PIN_INVALID', originPath); }
  if (origin?.contract !== 'kumitate-origin-pin-v1' || !/^[0-9a-f]{40}$/.test(origin.revision ?? '')) return failClosed('ORIGIN_PIN_INVALID', originPath);
  const srcDir = o.src ?? origin.clone;
  if (!srcDir || !existsSync(srcDir)) return failClosed('SRC_MISSING', String(srcDir));
  const head = git(srcDir, ['rev-parse', 'HEAD']);
  if (!head.ok || head.out.trim() !== origin.revision) return failClosed('SRC_REV_MISMATCH', `head=${head.out.trim() || '?'} pinned=${origin.revision}`);
  const src = new Source(srcDir, origin.revision);
  const srcRev = origin.revision.slice(0, 12);
  // Review records are read from committed bytes at a revision the caller names (--open REV,
  // the round-open revision): a record written in the very change being judged cannot bind.
  let recRev = null;
  let openPinRel = null;
  if (o.open !== null) {
    if (!/^[0-9A-Za-z][0-9A-Za-z._/-]{0,199}$/.test(o.open) || o.open.includes('..')) return failClosed('OPEN_INVALID', o.open);
    const r = git(self, ['rev-parse', `${o.open}^{commit}`]);
    if (!r.ok || !/^[0-9a-f]{40}$/u.test(r.out.trim())) return failClosed('OPEN_UNREADABLE', o.open);
    recRev = r.out.trim();
    openPinRel = pinPath.startsWith(self + sep) ? pinPath.slice(self.length + 1) : null;
    if (openPinRel === null) return failClosed('OPEN_INVALID', 'pin outside --self');
    const size = git(self, ['cat-file', '-s', `${recRev}:${openPinRel}`]);
    const sizeText = size.out.trim();
    if (!size.ok || !/^\d+$/u.test(sizeText)) return failClosed('OPEN_UNREADABLE', `${o.open}:${openPinRel}`);
    const bytes = Number(sizeText);
    if (bytes > MAX_OPEN_PIN_BYTES) return failClosed('OPEN_PIN_TOO_LARGE', `${openPinRel} bytes=${bytes} max=${MAX_OPEN_PIN_BYTES}`);
  } else {
    const r = git(self, ['rev-parse', 'HEAD']);
    recRev = r.ok && /^[0-9a-f]{40}$/u.test(r.out.trim()) ? r.out.trim() : null;
    process.stdout.write(recRev
      ? `TRUTH_WARN review sources are bound against the lane's current HEAD (${recRev.slice(0, 12)}), not a pinned round-open revision; pass --open REV to pin the record revision\n`
      : "TRUTH_WARN review sources are unbound: the lane has no committed revision and no --open REV was given\n");
  }
  const recs = new ReviewRecords(self, recRev);
  if (recs.error) return failClosed(recs.error.token, recs.error.detail);

  let pin = null;
  if (existsSync(pinPath)) {
    try { pin = JSON.parse(readCapped(pinPath, MAX_JSON_BYTES)); } catch { return failClosed('PIN_INVALID', pinPath); }
    if (!pin || typeof pin !== 'object' || Array.isArray(pin)) return failClosed('PIN_INVALID', pinPath);
    for (const note of Object.keys(pin.notes ?? {})) if (!noteOk(self, note) && existsSync(join(self, note))) return failClosed('NOTE_KEY_INVALID', note);
    for (const note of Object.keys(pin.notes ?? {})) if (!NOTE_KEY.test(note)) return failClosed('NOTE_KEY_INVALID', note);
    if (!validPin(pin)) return failClosed('PIN_INVALID', pinPath);
  }

  if (o.write) {
    const notes = o.notes ?? Object.keys(pin?.notes ?? {});
    if (!notes.length) return failClosed('NO_NOTES', 'pass --notes on the first --write-pin');
    let reviews = null;
    if (o.reviews) { try { reviews = JSON.parse(readCapped(resolve(self, o.reviews), MAX_JSON_BYTES)); } catch { return failClosed('REVIEWS_INVALID', o.reviews); } }
    for (const note of notes) if (!noteOk(self, note)) return failClosed('NOTE_KEY_INVALID', note);
    const next = { contract: CONTRACT, revision: origin.revision, notes: {} };
    const problems = [];
    for (const note of notes) {
      const p = join(self, note);
      if (!existsSync(p)) return failClosed('NOTE_MISSING', note);
      const entries = buildEntries(readCapped(p, MAX_NOTE_BYTES), src, pin?.notes?.[note], reviews, note);
      const entryIds = identities(entries);
      for (const e of entries) {
        if (e.source.startsWith('review:')) {
          if (!recs.bound(note, e, entryIds[e.ord], new Set(entryIds))) problems.push(['REVIEW_UNBOUND', `${note}#${e.ord}`, `${e.raw} source=${e.source} token=${e.token} no committed review record binds this anchor`]);
          if (!overrideValid(e, src)) problems.push(['OVERRIDE_INVALID', `${note}#${e.ord}`, `${e.raw} token=${e.token}`]);
        }
      }
      const priorEntries = pin?.notes?.[note]?.entries ?? [];
      const prior = new Map(priorEntries.map((e) => [e.key, e]));
      const flagged = new Set();
      for (const e of entries) {
        const pe = prior.get(e.key);
        if (pe && pe.expect === 'true' && e.expect !== 'true') { problems.push(['PIN_REGRESSION', `${note}#${e.ord}`, `${e.key} true -> ${e.expect}`]); flagged.add(e.ord); }
      }
      // Same anchor count: an ordinal that was true must stay true even when its token changed
      // (a re-paired symbol must not launder a regression; round-38 CritMonotonic A5).
      if (priorEntries.length === entries.length) {
        for (const e of entries) {
          const pe = priorEntries[e.ord];
          if (!flagged.has(e.ord) && pe && pe.expect === 'true' && e.expect !== 'true') problems.push(['PIN_REGRESSION', `${note}#${e.ord}`, `ord true -> ${e.expect} (token ${pe.token} -> ${e.token})`]);
        }
      }
      next.notes[note] = { anchors: entries.length, entries: entries.map(({ sentence, line, ...rest }) => rest) };
    }
    if (problems.length) {
      for (const [k, id, d] of problems) process.stdout.write(`TRUTH  ${k}  ${id}  ${d}\n`);
      process.stdout.write(`TRUTH: DRIFT (${problems.length} findings: ${[...new Set(problems.map((p) => p[0]))].join(' ')}; pin not written)\n`);
      return 1;
    }
    mkdirSync(dirname(pinPath), { recursive: true });
    writeFileSync(pinPath, JSON.stringify(next, null, 1) + '\n');
    const t = Object.values(next.notes).flatMap((n) => n.entries);
    process.stdout.write(`TRUTH: PINNED (notes=${notes.length} anchors=${t.length} true=${t.filter((e) => e.expect === 'true').length} debt=${t.filter((e) => e.expect.startsWith('debt:')).length} unchecked=${t.filter((e) => e.expect === 'unchecked').length} src-rev=${srcRev})\n`);
    return 0;
  }

  if (pin === null) return failClosed('PIN_MISSING', pinPath);
  if (pin.revision !== origin.revision) return failClosed('PIN_REV_STALE', `pin=${pin.revision} origin=${origin.revision}`);
  const findings = [];
  const total = { anchors: 0, true: 0, debt: 0, unchecked: 0 };
  const perNote = [];
  for (const [note, pn] of Object.entries(pin.notes)) {
    const p = join(self, note);
    if (!existsSync(p)) { findings.push(['ANCHOR_SET_CHANGED', `${note}#-`, 'note missing']); continue; }
    const { findings: f, counts } = checkNote(note, readCapped(p, MAX_NOTE_BYTES), pn, src, recs);
    findings.push(...f);
    perNote.push([note, counts]);
    for (const k of Object.keys(total)) total[k] += counts[k];
  }
  if (o.base !== null) {
    if (!/^[0-9A-Za-z][0-9A-Za-z._/-]{0,199}$/.test(o.base) || o.base.includes('..')) return failClosed('BASE_INVALID', o.base);
    const rel = pinPath.startsWith(self + sep) ? pinPath.slice(self.length + 1) : null;
    if (rel === null) return failClosed('BASE_INVALID', 'pin outside --self');
    const shown = git(self, ['show', `${o.base}:${rel}`]);
    if (!shown.ok) return failClosed('BASE_UNREADABLE', `${o.base}:${rel}`);
    let basePin;
    try { basePin = JSON.parse(shown.out); } catch { return failClosed('BASE_UNREADABLE', 'json'); }
    if (!validPin(basePin) || basePin.revision !== pin.revision) return failClosed('BASE_INVALID', 'pin schema or source revision');
    findings.push(...compareBase(pin, basePin));
  }
  if (o.open !== null) {
    const shown = git(self, ['show', `${recRev}:${openPinRel}`]);
    if (!shown.ok) return failClosed('OPEN_UNREADABLE', `${o.open}:${openPinRel}`);
    let openPin;
    try { openPin = JSON.parse(shown.out); } catch { return failClosed('OPEN_UNREADABLE', 'json'); }
    if (!validPin(openPin) || openPin.revision !== pin.revision) return failClosed('OPEN_INVALID', 'pin schema or source revision');
    findings.push(...compareOpen(pin, openPin));
  }
  if (o.json) {
    process.stdout.write(JSON.stringify({ contract: CONTRACT, srcRev: origin.revision, total, perNote: Object.fromEntries(perNote), findings }) + '\n');
  } else {
    for (const [note, c] of perNote) process.stdout.write(`TRUTH note=${note} anchors=${c.anchors} true=${c.true} debt=${c.debt} unchecked=${c.unchecked}\n`);
    for (const [k, id, d] of findings) process.stdout.write(`TRUTH  ${k}  ${id}  ${d}\n`);
    process.stdout.write(`TRUTH_TOTAL anchors=${total.anchors} true=${total.true} debt=${total.debt} unchecked=${total.unchecked}\n`);
  }
  if (findings.length) {
    const kinds = [...new Set(findings.map((f) => f[0]))];
    process.stdout.write(`TRUTH: DRIFT (${findings.length} findings: ${kinds.join(' ')}${o.base ? ` base=${o.base}` : ''}${o.open ? ` open=${o.open}` : ''} src-rev=${srcRev})\n`);
    return 1;
  }
  process.stdout.write(`TRUTH: CLEAN (notes=${perNote.length} anchors=${total.anchors} true=${total.true} debt=${total.debt} unchecked=${total.unchecked}${o.base ? ` base=${o.base}` : ''}${o.open ? ` open=${o.open}` : ''} src-rev=${srcRev})\n`);
  return 0;
}

/* ── hermetic self-test ──────────────────────────────────────────────────── */

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'anchor-truth-selftest-'));
  const results = [];
  const G = { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
  const g = (dir, args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', env: gitEnv(G) });
  const SRC_FILES = {
    'scripts/a.mjs': 'x\nconst BETA_MARK = 2;\nconst ALPHA_MARK = 1;\nexport default ALPHA_MARK;\n',
    'scripts/b.mjs': 'function one() {}\nfunction two() {}\n',
  };
  const mkSrc = (name) => {
    const d = join(tmp, `${name}-src`);
    for (const [p, c] of Object.entries(SRC_FILES)) { mkdirSync(dirname(join(d, p)), { recursive: true }); writeFileSync(join(d, p), c); }
    g(d, ['init', '-q']); g(d, ['add', '.']); g(d, ['commit', '-q', '-m', 'src']);
    return { dir: d, rev: g(d, ['rev-parse', 'HEAD']).stdout.trim() };
  };
  const NOTE = 'corpus/knowledge/fx.md';
  const mkSelf = (name, note, src) => {
    const d = join(tmp, name);
    mkdirSync(join(d, 'corpus/knowledge'), { recursive: true });
    mkdirSync(join(d, '.ufo/pins'), { recursive: true });
    writeFileSync(join(d, NOTE), note);
    writeFileSync(join(d, '.ufo/pins/origin.json'), JSON.stringify({ contract: 'kumitate-origin-pin-v1', revision: src.rev, clone: src.dir }));
    g(d, ['init', '-q']);
    return d;
  };
  const tool = (self, args) => {
    // The child runs under scripts/cap-run.mjs (contract kumitate-cap-run-v2): the fixture root
    // is bound read-write because the sandbox's /tmp is a fresh tmpfs, the environment is the
    // allowlist gitEnv() builds (never this process's env), and the budget is 120 s.
    const r = capSpawnSync(process.execPath, [TOOL_FILE, '--self', self, ...args], {
      env: gitEnv(), bind: [tmp], timeout: 120_000,
    });
    const out = r.stdout ?? '';
    return { status: r.status, out, verdict: out.trim().split('\n').pop() ?? '' };
  };
  // A lane whose note, pin and review registry are COMMITTED: the gate reads review records
  // from committed bytes and resolves them through the PIN at the record revision, so a
  // fixture without a committed registry (or without a committed pin) has no record at all.
  const mkReviewed = (name, note, records, src) => {
    const d = mkSelf(name, note, src);
    commit(d);
    tool(d, ['--write-pin', '--notes', NOTE]);
    const openRev = commit(d);
    if (records) {
      mkdirSync(join(d, '.ufo/waves/round-99'), { recursive: true });
      writeFileSync(join(d, '.ufo/waves/round-99/anchor-reviews.json'), JSON.stringify(records, null, 1) + '\n');
      commit(d);
    }
    return { d, openRev };
  };
  const commit = (d) => { g(d, ['add', '-A']); g(d, ['commit', '-q', '-m', 'pin']); return g(d, ['rev-parse', 'HEAD']).stdout.trim(); };
  const pinOf = (d) => JSON.parse(readFileSync(join(d, '.ufo/pins/anchor-truth.json'), 'utf8'));
  const setPin = (d, f) => { const p = pinOf(d); f(p); writeFileSync(join(d, '.ufo/pins/anchor-truth.json'), JSON.stringify(p)); };
  const check = (id, label, fn) => {
    let ok = false; let detail = '';
    try { const r = fn(); ok = r.ok; detail = r.detail ?? ''; } catch (e) { detail = `threw ${e.message}`; }
    results.push({ id, label, ok, detail });
  };
  const H = '## `scripts/a.mjs`\n\n';
  const src = mkSrc('base');
  try {
    check('AT01', 'clean: a true anchor pins and reads CLEAN', () => {
      const d = mkSelf('at01', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      const w = tool(d, ['--write-pin', '--notes', NOTE]);
      const r = tool(d, []);
      return { ok: w.status === 0 && r.status === 0 && r.verdict.startsWith('TRUTH: CLEAN') && /true=1 /.test(r.verdict), detail: r.verdict };
    });
    check('AT02', 'positional run `a` / `b` (`:2`, `:3`) pairs left-first by position', () => {
      const d = mkSelf('at02', `${H}\`BETA_MARK\` / \`ALPHA_MARK\` (\`scripts/a.mjs:2\`, \`:3\`).\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const e = pinOf(d).notes[NOTE].entries;
      return { ok: e.length === 2 && e[0].token === 'BETA_MARK' && e[1].token === 'ALPHA_MARK' && e.every((x) => x.expect === 'true'), detail: JSON.stringify(e.map((x) => [x.token, x.expect])) };
    });
    check('AT03', 'next-symbol shift: anchor set change fails the check and the re-pin refuses (PIN_REGRESSION)', () => {
      const d = mkSelf('at03', `${H}\`BETA_MARK\` (\`scripts/a.mjs:2\`), \`ALPHA_MARK\` (\`:3\`).\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      writeFileSync(join(d, NOTE), `${H}\`BETA_MARK\` (\`scripts/a.mjs:3\`), \`ALPHA_MARK\` (\`:3\`).\n`);
      const r = tool(d, []);
      const w = tool(d, ['--write-pin']);
      return { ok: r.status === 1 && /ANCHOR_SET_CHANGED/.test(r.out) && w.status === 1 && /PIN_REGRESSION/.test(w.out), detail: `${r.verdict} | ${w.verdict}` };
    });
    check('AT04', 'right-first discriminator: `BETA_MARK` (`:3`), `ALPHA_MARK` (`:3`) pins BETA as debt, ALPHA true', () => {
      const d = mkSelf('at04', `${H}\`BETA_MARK\` (\`scripts/a.mjs:3\`), \`ALPHA_MARK\` (\`:3\`).\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const e = pinOf(d).notes[NOTE].entries;
      return { ok: e[0].token === 'BETA_MARK' && e[0].expect === 'debt:false' && e[1].expect === 'true', detail: JSON.stringify(e.map((x) => [x.token, x.expect])) };
    });
    check('AT05', 'swapped run re-pin refuses (PIN_REGRESSION)', () => {
      const d = mkSelf('at05', `${H}\`BETA_MARK\` / \`ALPHA_MARK\` (\`scripts/a.mjs:2\`, \`:3\`).\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      writeFileSync(join(d, NOTE), `${H}\`BETA_MARK\` / \`ALPHA_MARK\` (\`scripts/a.mjs:3\`, \`:2\`).\n`);
      const w = tool(d, ['--write-pin']);
      return { ok: w.status === 1 && /PIN_REGRESSION/.test(w.out), detail: w.verdict };
    });
    check('AT06', 'hand-edited pin token not on the line reads REGRESSED', () => {
      const d = mkSelf('at06', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { p.notes[NOTE].entries[0].token = 'GAMMA_MARK'; });
      const r = tool(d, []);
      return { ok: r.status === 1 && /REGRESSED/.test(r.out), detail: r.verdict };
    });
    check('AT07', 'debt flipped into the pin by hand reads DEBT_GREW against --base', () => {
      const d = mkSelf('at07', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      setPin(d, (p) => { p.notes[NOTE].entries[0].expect = 'debt:false'; p.notes[NOTE].entries[0].token = 'GAMMA_MARK'; });
      const r = tool(d, ['--base', base]);
      return { ok: r.status === 1 && /DEBT_GREW/.test(r.out), detail: r.verdict };
    });
    check('AT08', 'a true expectation dropped to unchecked reads CHECKED_SHRANK against --base', () => {
      const d = mkSelf('at08', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      setPin(d, (p) => { p.notes[NOTE].entries[0].expect = 'unchecked'; p.notes[NOTE].entries[0].token = null; });
      const r = tool(d, ['--base', base]);
      return { ok: r.status === 1 && /CHECKED_SHRANK/.test(r.out), detail: r.verdict };
    });
    check('AT09', 'review override absent from the sentence reads OVERRIDE_INVALID', () => {
      const d = mkSelf('at09', `${H}The header lives at \`scripts/a.mjs:3\`.\n`, src);
      writeFileSync(join(d, 'reviews.json'), JSON.stringify({ [`${NOTE}#0`]: { token: 'ALPHA_MARK', seat: 'fx' } }));
      const w = tool(d, ['--write-pin', '--notes', NOTE, '--reviews', 'reviews.json']);
      return { ok: w.status === 1 && /OVERRIDE_INVALID/.test(w.out), detail: w.verdict };
    });
    check('AT10', 'review override present in the sentence and on the line pins true', () => {
      const d = mkReviewed('at10', `${H}The ALPHA_MARK constant is set at \`scripts/a.mjs:3\`.\n`, { [`${NOTE}#0`]: { seat: 'fx', token: 'ALPHA_MARK' } }, src).d;
      writeFileSync(join(d, 'reviews.json'), JSON.stringify({ [`${NOTE}#0`]: { token: 'ALPHA_MARK', seat: 'fx' } }));
      const w = tool(d, ['--write-pin', '--notes', NOTE, '--reviews', 'reviews.json']);
      const r = tool(d, []);
      return { ok: w.status === 0 && r.status === 0 && /true=1 /.test(r.verdict), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT11', 'fixed debt left in the pin reads DEBT_STALE', () => {
      const d = mkSelf('at11', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { p.notes[NOTE].entries[0].expect = 'debt:false'; });
      const r = tool(d, []);
      return { ok: r.status === 1 && /DEBT_STALE/.test(r.out), detail: r.verdict };
    });
    check('AT12', 'line beyond EOF and a `..` escape are dead debt, never read outside the clone', () => {
      const d = mkSelf('at12', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:99\`; \`ALPHA_MARK\` at \`../a-src/scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const e = pinOf(d).notes[NOTE].entries;
      const r = tool(d, []);
      return { ok: e.length === 2 && e.every((x) => x.expect === 'debt:dead') && r.status === 0, detail: JSON.stringify(e.map((x) => x.expect)) };
    });
    check('AT13', 'source clone at another revision fails closed (exit 2)', () => {
      const d = mkSelf('at13', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const o = JSON.parse(readFileSync(join(d, '.ufo/pins/origin.json'), 'utf8'));
      o.revision = '0'.repeat(40);
      writeFileSync(join(d, '.ufo/pins/origin.json'), JSON.stringify(o));
      const r = tool(d, []);
      return { ok: r.status === 2 && /SRC_REV_MISMATCH/.test(r.verdict), detail: r.verdict };
    });
    check('AT14', '"At `path:N`, `sym`" with no earlier symbol pairs forward', () => {
      const d = mkSelf('at14', '## `scripts/b.mjs`\n\nAt `scripts/b.mjs:2`, `two` is declared.\n', src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const e = pinOf(d).notes[NOTE].entries;
      return { ok: e.length === 1 && e[0].token === 'two' && e[0].expect === 'true', detail: JSON.stringify(e.map((x) => [x.token, x.expect])) };
    });
    check('AT15', 'bare `:N` resolves through the heading path; fenced code is ignored', () => {
      const d = mkSelf('at15', '## `scripts/b.mjs`\n\n```\n`one` (`:9`)\n```\n\n`one` (`:1`) and `two` (`:2`).\n', src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const e = pinOf(d).notes[NOTE].entries;
      return { ok: e.length === 2 && e.every((x) => x.path === 'scripts/b.mjs' && x.expect === 'true'), detail: JSON.stringify(e.map((x) => [x.path, x.expect])) };
    });
    check('AT16', 'clean pin re-checked against itself as --base stays CLEAN', () => {
      const d = mkSelf('at16', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      const r = tool(d, ['--base', base]);
      return { ok: r.status === 0 && r.verdict.startsWith('TRUTH: CLEAN'), detail: r.verdict };
    });
    check('AT18', 'one phrase cited at two sites pairs both anchors with that phrase, never a later symbol', () => {
      const d = mkSelf('at18', `${H}The mark is \`ALPHA_MARK\` (\`scripts/a.mjs:3\`, \`scripts/a.mjs:4\`), then \`BETA_MARK\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const e = pinOf(d).notes[NOTE].entries;
      return { ok: e.length === 2 && e.every((x) => x.token === 'ALPHA_MARK' && x.expect === 'true'), detail: JSON.stringify(e.map((x) => [x.token, x.expect])) };
    });
    check('AT19', 'forward fill never steals a symbol that owns the next citation', () => {
      const d = mkSelf('at19', `${H}Bindings start at \`scripts/a.mjs:4\` (\`ALPHA_MARK\` is at \`scripts/a.mjs:3\`).\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const e = pinOf(d).notes[NOTE].entries;
      return { ok: e.length === 2 && e[0].expect === 'unchecked' && e[1].token === 'ALPHA_MARK' && e[1].expect === 'true', detail: JSON.stringify(e.map((x) => [x.token, x.expect])) };
    });
    check('AT20', 're-paired token cannot launder a true ordinal (PIN_REGRESSION by ordinal)', () => {
      const d = mkSelf('at20', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      writeFileSync(join(d, NOTE), `${H}\`BETA_MARK\` at \`scripts/a.mjs:3\`.\n`);
      const w = tool(d, ['--write-pin']);
      return { ok: w.status === 1 && /PIN_REGRESSION/.test(w.out), detail: w.verdict };
    });
    check('AT21', 'a dirty source worktree cannot change a verdict (committed blobs only)', () => {
      const s2 = mkSrc('dirty');
      const d = mkSelf('at21', `${H}\`BETA_MARK\` at \`scripts/a.mjs:3\`.\n`, s2);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const before = pinOf(d).notes[NOTE].entries[0].expect;
      writeFileSync(join(s2.dir, 'scripts/a.mjs'), 'x\nconst BETA_MARK = 2;\nconst BETA_MARK2 = BETA_MARK;\n');
      const r = tool(d, []);
      return { ok: before === 'debt:false' && r.status === 0 && /debt=1 /.test(r.verdict), detail: `${before} | ${r.verdict}` };
    });
    check('AT22', 'a pin note key outside corpus/knowledge fails closed (exit 2)', () => {
      const d = mkSelf('at22', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { p.notes['../../etc/passwd'] = p.notes[NOTE]; });
      const r = tool(d, []);
      return { ok: r.status === 2 && /NOTE_KEY_INVALID/.test(r.verdict), detail: r.verdict };
    });
    check('AT23', 'a base-true anchor replaced by another true anchor reads BASE_TRUE_LOST against --base (round-38 closure R38-1)', () => {
      const d = mkSelf('at23', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`two\` at \`scripts/b.mjs:2\`.\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--base', base]);
      return { ok: w.status === 0 && r.status === 1 && /BASE_TRUE_LOST/.test(r.out), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT24', 'a re-keyed base-true entry hand-set to unchecked, counts held by a forged token, reads BASE_TRUE_LOST and TOKEN_FORGED', () => {
      const d = mkSelf('at24', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. \`BETA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      setPin(d, (p) => {
        const [e0, e1] = p.notes[NOTE].entries;
        Object.assign(e0, { token: null, expect: 'unchecked', key: 'fx-missing-base-key' });
        Object.assign(e1, { token: 'ALPHA_MARK', expect: 'true' });
      });
      const r = tool(d, ['--base', base]);
      return { ok: r.status === 1 && /BASE_TRUE_LOST/.test(r.out) && /TOKEN_FORGED/.test(r.out), detail: r.verdict };
    });
    check('AT25', 'an inserted earlier anchor shifts a base-true key index and ordinal yet stays CLEAN by identity', () => {
      const d = mkSelf('at25', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:4\`. \`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--base', base]);
      return { ok: w.status === 0 && r.status === 0 && r.verdict.startsWith('TRUTH: CLEAN') && /true=2 /.test(r.verdict), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT26', 'a pin entry source outside pair or review:<seat> fails closed (exit 2)', () => {
      const d = mkSelf('at26', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { p.notes[NOTE].entries[0].source = 'hand'; });
      const r = tool(d, []);
      return { ok: r.status === 2 && /PIN_INVALID/.test(r.verdict), detail: r.verdict };
    });
    check('AT27', 'an earlier true copy of a base-true raw cannot mask the original turned unchecked (BASE_TRUE_LOST by raw@path group)', () => {
      const d = mkSelf('at27', `${H}Intro.\n\nThe mark \`ALPHA_MARK\` is at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n\nThe mark is at \`scripts/a.mjs:3\`.\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--base', base]);
      return { ok: w.status === 0 && r.status === 1 && /BASE_TRUE_LOST/.test(r.out) && /non-true anchors 0 -> 1/.test(r.out), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT28', 'a debt entry hand-set to a null token and unchecked reads TOKEN_FORGED (debt hidden as unchecked)', () => {
      const d = mkSelf('at28', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. \`BETA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { Object.assign(p.notes[NOTE].entries[1], { token: null, expect: 'unchecked' }); });
      const r = tool(d, []);
      return { ok: r.status === 1 && /TOKEN_FORGED/.test(r.out), detail: r.verdict };
    });
    check('AT29', 'identity carries the resolved path: one bare `:N` true under one heading cannot be swapped for another heading\'s', () => {
      const d = mkSelf('at29', '## `scripts/a.mjs`\n\n`BETA_MARK` (`:2`).\n\n## `scripts/b.mjs`\n\nSee (`:2`).\n', src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      writeFileSync(join(d, NOTE), '## `scripts/b.mjs`\n\n`two` (`:2`).\n\n## `scripts/a.mjs`\n\nSee (`:2`).\n');
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--base', base]);
      return { ok: w.status === 0 && r.status === 1 && /BASE_TRUE_LOST/.test(r.out), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT30', 'a review:<seat> entry with a null token fails closed as PIN_INVALID', () => {
      const d = mkSelf('at30', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { Object.assign(p.notes[NOTE].entries[0], { source: 'review:fx', token: null, expect: 'unchecked' }); });
      const r = tool(d, []);
      return { ok: r.status === 2 && /PIN_INVALID/.test(r.verdict), detail: r.verdict };
    });
    check('AT31', 'a self-declared review source with no committed record reads REVIEW_UNBOUND (round-40 closure R39-1)', () => {
      const { d, openRev } = mkReviewed('at31', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, { [`${NOTE}#0`]: { seat: 'other', token: 'ALPHA_MARK' } }, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { Object.assign(p.notes[NOTE].entries[0], { source: 'review:NoSuchSeat' }); });
      const head = tool(d, []);
      const open = tool(d, ['--open', openRev]);
      return { ok: head.status === 1 && /REVIEW_UNBOUND/.test(head.out) && open.status === 1 && /REVIEW_UNBOUND/.test(open.out), detail: `${head.verdict} | ${open.verdict}` };
    });
    check('AT32', 'a committed review record binds its anchor; a record naming another seat does not', () => {
      const note = `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`;
      const bound = mkReviewed('at32bound', note, { [`${NOTE}#0`]: { seat: 'fx', token: 'ALPHA_MARK' } }, src).d;
      tool(bound, ['--write-pin', '--notes', NOTE]);
      setPin(bound, (p) => { Object.assign(p.notes[NOTE].entries[0], { source: 'review:fx' }); });
      const ok = tool(bound, []);
      const other = mkReviewed('at32other', note, { [`${NOTE}#0`]: { seat: 'other', token: 'ALPHA_MARK' } }, src).d;
      tool(other, ['--write-pin', '--notes', NOTE]);
      setPin(other, (p) => { Object.assign(p.notes[NOTE].entries[0], { source: 'review:fx' }); });
      const bad = tool(other, []);
      return { ok: ok.status === 0 && /TRUTH: CLEAN/u.test(ok.verdict) && bad.status === 1 && /REVIEW_UNBOUND/.test(bad.out), detail: `${ok.verdict} | ${bad.verdict}` };
    });
    check('AT33', 'a review record binds one anchor: a review token that travels to another anchor is unbound', () => {
      const d = mkReviewed('at33', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. \`ALPHA_MARK\` at \`scripts/a.mjs:4\`.\n`, { [`${NOTE}#0`]: { seat: 'fx', token: 'ALPHA_MARK' } }, src).d;
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { Object.assign(p.notes[NOTE].entries[1], { source: 'review:fx' }); });
      const r = tool(d, []);
      return { ok: r.status === 1 && /REVIEW_UNBOUND/.test(r.out), detail: r.verdict };
    });
    check('AT34', 'the write path refuses an unbound review source, and --open REV reads only the records committed at REV', () => {
      const d = mkReviewed('at34', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, null, src).d;
      writeFileSync(join(d, 'reviews.json'), JSON.stringify({ [`${NOTE}#0`]: { token: 'ALPHA_MARK', seat: 'NoSuchSeat' } }));
      const w = tool(d, ['--write-pin', '--notes', NOTE, '--reviews', 'reviews.json']);
      const kept = pinOf(d).notes[NOTE].entries[0].source;
      // A record committed AFTER the open revision cannot bind: --open pins the record revision.
      const late = mkReviewed('at34late', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, null, src);
      const openRev = late.openRev;
      mkdirSync(join(late.d, '.ufo/waves/round-99'), { recursive: true });
      writeFileSync(join(late.d, '.ufo/waves/round-99/anchor-reviews.json'), JSON.stringify({ [`${NOTE}#0`]: { seat: 'fx', token: 'ALPHA_MARK' } }, null, 1) + '\n');
      commit(late.d);
      tool(late.d, ['--write-pin', '--notes', NOTE]);
      setPin(late.d, (p) => { Object.assign(p.notes[NOTE].entries[0], { source: 'review:fx' }); });
      const atOpen = tool(late.d, ['--open', openRev]);
      const atHead = tool(late.d, []);
      return { ok: w.status === 1 && /REVIEW_UNBOUND/.test(w.out) && kept !== 'review:NoSuchSeat'
        && atOpen.status === 1 && /REVIEW_UNBOUND/.test(atOpen.out) && atHead.status === 0 && /TRUTH: CLEAN/u.test(atHead.verdict),
      detail: `${w.verdict} kept=${kept} | ${atOpen.verdict} | ${atHead.verdict}` };
    });
    check('AT43', 'a debt sibling at a base-true raw@path reads BASE_TRUE_LOST (the group counts every non-true anchor, not only unchecked ones)', () => {
      const d = mkSelf('at43', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n\n\`GAMMA_MARK\` at \`scripts/a.mjs:2\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. \`BETA_MARK\` at \`scripts/a.mjs:3\`.\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--base', base]);
      return { ok: w.status === 0 && r.status === 1 && /BASE_TRUE_LOST/.test(r.out) && /non-true anchors 0 -> 1/.test(r.out), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT44', 'a second unchecked anchor at a raw@path that held no true anchor at base stays CLEAN (the group check only guards base-true groups)', () => {
      const d = mkSelf('at44', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n\nThe mark is at \`scripts/a.mjs:2\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n\nThe mark is at \`scripts/a.mjs:2\`. The mark is at \`scripts/a.mjs:2\`.\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--base', base]);
      return { ok: w.status === 0 && r.status === 0 && r.verdict.startsWith('TRUTH: CLEAN'), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT45', 'a hand-edited pin whose base-true key now holds a debt entry reads DEBT_GROW by key (the old key-match loop)', () => {
      const d = mkSelf('at45', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n\n\`GAMMA_MARK\` at \`scripts/a.mjs:2\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const base = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:2\`. \`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`);
      setPin(d, (p) => {
        const n = p.notes[NOTE];
        n.anchors = 2;
        n.entries = [
          { key: 'scripts/a.mjs|ALPHA_MARK|0', ord: 0, raw: 'scripts/a.mjs:2', path: 'scripts/a.mjs', a: 2, b: 2, token: 'ALPHA_MARK', source: 'pair', expect: 'debt:false' },
          { key: 'scripts/a.mjs|ALPHA_MARK|1', ord: 1, raw: 'scripts/a.mjs:3', path: 'scripts/a.mjs', a: 3, b: 3, token: 'ALPHA_MARK', source: 'pair', expect: 'true' },
        ];
      });
      const r = tool(d, ['--base', base]);
      return { ok: r.status === 1 && /DEBT_GREW/.test(r.out) && /fx\.md#0/.test(r.out) && /scripts\/a\.mjs\|ALPHA_MARK\|0 true at base/.test(r.out), detail: r.verdict };
    });
    check('AT46', 'a record binds a nested re-citation only when its own anchor is gone: a second anchor cannot borrow it, an honest widening keeps it', () => {
      const borrow = mkReviewed('at46borrow', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:2-4\`. The ALPHA_MARK again at \`scripts/a.mjs:3\`.\n`, { [`${NOTE}#0`]: { seat: 'fx', token: 'ALPHA_MARK' } }, src);
      tool(borrow.d, ['--write-pin', '--notes', NOTE]);
      setPin(borrow.d, (p) => { Object.assign(p.notes[NOTE].entries[1], { source: 'review:fx', token: 'ALPHA_MARK', expect: 'true' }); });
      const bad = tool(borrow.d, []);
      const widen = mkReviewed('at46widen', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, { [`${NOTE}#0`]: { seat: 'fx', token: 'ALPHA_MARK' } }, src);
      writeFileSync(join(widen.d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:2-4\`.\n`);
      tool(widen.d, ['--write-pin', '--notes', NOTE]);
      setPin(widen.d, (p) => { Object.assign(p.notes[NOTE].entries[0], { source: 'review:fx', token: 'ALPHA_MARK', expect: 'true' }); });
      const good = tool(widen.d, []);
      return { ok: bad.status === 1 && /REVIEW_UNBOUND\s+\S+#1/u.test(bad.out) && good.status === 0 && /TRUTH: CLEAN/u.test(good.verdict), detail: `${bad.verdict} | ${good.verdict}` };
    });
    check('AT47', 'more than 64 committed review registries fails closed under --open', () => {
      const d = mkSelf('at47', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      for (let i = 0; i < 65; i++) {
        const path = join(d, '.ufo', 'waves', `round-${String(i).padStart(3, '0')}`, 'anchor-reviews.json');
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, '{}\n');
      }
      const open = commit(d);
      const r = tool(d, ['--open', open]);
      return { ok: r.status === 2 && /REVIEW_REGISTRY_LIMIT/.test(r.verdict), detail: r.verdict };
    });
    check('AT48', 'an open pin over 4 MiB fails closed before git show', () => {
      const d = mkSelf('at48', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      setPin(d, (p) => { p.padding = 'x'.repeat(4 * 1024 * 1024); });
      const open = commit(d);
      const r = tool(d, ['--open', open]);
      return { ok: r.status === 2 && /OPEN_PIN_TOO_LARGE/.test(r.verdict), detail: r.verdict };
    });
    check('AT17', 'unknown flag is a usage refusal (exit 64)', () => {
      const r = tool(join(tmp, 'at01'), ['--bogus']);
      return { ok: r.status === 64, detail: `exit=${r.status}` };
    });
    check('AT39', 'a debt anchor swapped for another debt anchor at a fresh identity reads DEBT_NEW against --open (round-40 R39-3 one-for-one trade)', () => {
      const d = mkSelf('at39', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. \`GHOST_ONE\` at \`scripts/a.mjs:2\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const open = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. \`GHOST_TWO\` at \`scripts/b.mjs:1\`.\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--open', open]);
      return { ok: w.status === 0 && r.status === 1 && /DEBT_NEW/.test(r.out) && !/DEBT_GREW/.test(r.out), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT40', 'new false anchors at a fresh path read DEBT_NEW against --open (round-40 R39-3 headroom)', () => {
      const d = mkSelf('at40', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const open = commit(d);
      const extra = [0, 1, 2].map((i) => `\`GHOST_${i}\` at \`scripts/b.mjs:1\`.`).join(' ');
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. ${extra}\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--open', open]);
      return { ok: w.status === 0 && r.status === 1 && /DEBT_NEW/.test(r.out), detail: `${w.verdict} | ${r.verdict}` };
    });
    check('AT41', 'an open-true anchor turned false reads DEBT_GREW against --open (round-40 R39-3 re-break)', () => {
      const d = mkSelf('at41', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const open = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`GHOST_REBREAK\` at \`scripts/a.mjs:3\`.\n`);
      setPin(d, (p) => {
        const e = p.notes[NOTE].entries[0];
        Object.assign(e, { token: 'GHOST_REBREAK', expect: 'debt:false', key: 'scripts/a.mjs|GHOST_REBREAK|0' });
      });
      const r = tool(d, ['--open', open]);
      return { ok: r.status === 1 && /DEBT_GREW/.test(r.out), detail: r.verdict };
    });
    check('AT42', 'an honest new true anchor stays CLEAN against --open (the floor refuses false anchors, not new knowledge)', () => {
      const d = mkSelf('at42', `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`.\n`, src);
      tool(d, ['--write-pin', '--notes', NOTE]);
      const open = commit(d);
      writeFileSync(join(d, NOTE), `${H}\`ALPHA_MARK\` at \`scripts/a.mjs:3\`. \`BETA_MARK\` at \`scripts/a.mjs:2\`.\n`);
      const w = tool(d, ['--write-pin']);
      const r = tool(d, ['--open', open]);
      return { ok: w.status === 0 && r.status === 0 && r.verdict.startsWith('TRUTH: CLEAN'), detail: `${w.verdict} | ${r.verdict}` };
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  for (const r of results) process.stdout.write(`${r.ok ? 'PASS' : 'FAIL'} ${r.id} ${r.label}${r.ok ? '' : `\n     ${r.detail}`}\n`);
  const pass = results.filter((r) => r.ok).length;
  process.stdout.write(`ANCHOR_TRUTH_SELFTEST: ${pass}/${results.length} pass\nVERDICT: ${pass === results.length ? 'PASS' : 'FAIL'}\n`);
  return pass === results.length ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(TOOL_FILE)) {
  try { process.exitCode = run(process.argv.slice(2)); }
  catch (e) { process.exitCode = failClosed('INPUT_UNREADABLE', e.message); }
}
