#!/usr/bin/env node
/**
 * routed-ledger.mjs — kumitate lane gate, contract kumitate-routed-ledger-v2 (round 68).
 *
 *   node scripts/routed-ledger.mjs [--root DIR] [--rev REV] [--from N] [--to N]
 *                                  [--ledger PATH] [--classes]
 *   node scripts/routed-ledger.mjs --selftest
 *
 * What it binds. Every non-author verifier spot-check
 * (`corpus/lessons/round-N-verifier-spotcheck.md`) routes defects back to the lane in one or more
 * routed sections. This gate reads EVERY routed section of every spot-check in [from, to] (never
 * only the first), the ledger `corpus/routed-ledger.md`, and requires:
 *   - every routed ITEM has at least one ledger row (UNLEDGERED otherwise), ordinals global per file;
 *   - every row binds to its item by a located quote of 3..25 words, word-boundary matched and unique
 *     within its spot-check's routed items (QUOTE_ABSENT / QUOTE_AMBIGUOUS / ROW_MALFORMED otherwise);
 *   - every closed/wontfix row binds its answer by `path:line` plus a quote located at that EXACT
 *     line (no window) of a regular file inside --root that is neither the ledger nor a spot-check,
 *     inside the root and never through a symlink (ANSWER_DEAD otherwise);
 *   - no (round,item) carries more than one non-open row (ROW_CONTRADICTED);
 *   - fenced code blocks never yield items, and a fenced bullet is not item text.
 *
 * v2 hardenings over v1 (round-66 wave, one reproduced attack each):
 *   (1) an inherited GIT_DIR / GIT_WORK_TREE / GIT_* environment is never honoured: the variables are
 *       stripped from this process and every child runs under an explicit allow-list (PATH, TMPDIR,
 *       LANG, HOME), so `--rev` reads the repo named by --root and never a foreign one;
 *   (2) symlink and `..` escapes are refused for --root (final component), --ledger and answer paths;
 *   (3) every routed section is scanned, not only the first (second-section loss);
 *   (4) quotes bind by word boundary, need >= 3 words, and must be unique within the section;
 *   (5) answer quotes bind at the exact named line (no +-2 window);
 *   (6) item counting is fence-aware.
 *
 * Verdicts:
 *   ROUTED_LEDGER: CLEAN spotchecks=<n> sections=<s> items=<i> rows=<r> open=<o> closed=<c> wontfix=<w>
 *   ROUTED_LEDGER: DRIFT <same counters> findings=<f> first=<ID>:<detail>     (+ one FINDING <ID> <detail> line each)
 *   ROUTED_LEDGER: FAIL-CLOSED reason=<reason>                               (exit 2)
 *   ROUTED_LEDGER: USAGE <msg>                                              (exit 64)
 * Exit: 0 clean, 1 drift, 2 fail-closed, 64 usage.
 */
import { spawnSync } from 'node:child_process';
import {
  lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync,
  statSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';

const LEDGER_DEFAULT = 'corpus/routed-ledger.md';
const FROM_DEFAULT = 55;
const SPOT_DIR = 'corpus/lessons';
const SPOT_RE = /^corpus\/lessons\/round-(\d+)-verifier-spotcheck\.md$/;
const HEAD_RE = /\brouted\s+(defects?|items?)\b/i;
const FENCE_RE = /^ {0,3}(```|~~~)/;
const LIST_RE = /^([-*+]|[0-9]+[.)])\s+\S/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const SELF = fileURLToPath(import.meta.url);

// ---- hardening (1): an inherited git environment is never honoured, in this process or in children
const POISON = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR',
  'GIT_CEILING_DIRECTORIES', 'GIT_NAMESPACE', 'GIT_CONFIG', 'GIT_CONFIG_GLOBAL', 'TAR_OPTIONS'];
for (const k of []) delete process.env[k];

/** The only environment any child sees. */
export const childEnv = () => {
  const e = { ...process.env };
  return e;
};
const git = (cwd, argv, timeout = 120000) => spawnSync('git', ['-C', cwd, ...argv], {
  encoding: 'utf8', env: childEnv(), maxBuffer: 256 * 1024 * 1024, timeout,
});

export const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

export const words = (s) => norm(s) === '' ? 0 : norm(s).split(' ').length;

/** Word-boundary containment: `quote` occurs in `text` bounded by non-alphanumerics (or the ends). */
export const wb = (quote, text) => {
  const q = norm(quote);
  if (!q) return false;
  const re = new RegExp(`(^|[^A-Za-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`);
  return re.test(norm(text));
};

// ---------------------------------------------------------------- spot-check parsing
/**
 * Parse EVERY routed section of a spot-check (hardening 3) with fence-aware item counting
 * (hardening 6). Section bodies end at the next heading of the same or a shallower level, or at the
 * next routed heading, whichever comes first; item ordinals are global per file and follow document
 * order. → { sections, items: [text, ...] }
 */
export function routedSections(text) {
  const lines = String(text).split('\n');
  const heads = [];
  let fence = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (FENCE_RE.test(lines[i])) { fence = !fence; continue; }
    if (fence) continue;
    const m = HEADING_RE.exec(lines[i]);
    if (m && HEAD_RE.test(m[2])) heads.push({ i, lvl: m[1].length });
  }
  const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
  const items = [];
  heads.forEach((h, idx) => {
    const hardEnd = idx + 1 < heads.length ? heads[idx + 1].i : lines.length;
    const sec = [];
    let f = false;
    for (let j = h.i + 1; j < hardEnd; j += 1) {
      if (!f) {
        const m = /^(#{1,6})\s+/.exec(lines[j]);
        if (m && m[1].length <= h.lvl) break;
      }
      if (FENCE_RE.test(lines[j])) { f = !f; sec.push({ l: lines[j], fence: true }); continue; }
      sec.push({ l: lines[j], fence: f });
    }
    for (let i = 0; i < sec.length; i += 1) {
      const l = sec[i].l;
      if (sec[i].fence) continue;
      const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1].l));
      if (row) { items.push(l); continue; }
      if (!LIST_RE.test(l)) continue;
      let body = l;
      for (let j = i + 1; j < sec.length; j += 1) {
        const n = sec[j];
        if (n.fence && !FENCE_RE.test(n.l)) { body += `\n${n.l}`; continue; }
        if (LIST_RE.test(n.l) || (n.l.startsWith('|') && !isSep(n.l))) break;
        // a column-0 non-blank line after a blank line is prose, not item text
        if (/^\S/.test(n.l) && sec[j - 1].l.trim() === '') break;
        body += `\n${n.l}`;
      }
      items.push(body);
    }
  });
  return { sections: heads.length, items };
}

/** v1 name, kept for callers: one file → { found, items }. `found` = at least one routed heading. */
export const routedItems = (text) => {
  const r = routedSections(text);
  return { found: r.sections > 0, sections: r.sections, items: r.items };
};

/** Parse the ledger → { rows, malformed, section }. */
export function ledgerRows(text) {
  const L = String(text).split('\n');
  const at = L.findIndex((l) => /^##\s+Ledger\s*$/.test(l));
  const rows = []; const malformed = [];
  if (at < 0) return { rows, malformed, section: false };
  for (let i = at + 1; i < L.length; i += 1) {
    const l = L[i];
    if (/^##?\s/.test(l)) break;
    if (!l.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|\s*$/.test(l)) continue;
    const cells = l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells[0] === 'id') continue;
    if (cells.length !== 7) { malformed.push(`line${i + 1}:cells=${cells.length}`); continue; }
    const [id, round, item, quoteRaw, cls, status, answer] = cells;
    rows.push({ line: i + 1, id, round, item, quote: quoteRaw.replace(/^"(.*)"$/, '$1'), cls, status, answer });
  }
  return { rows, malformed, section: true };
}

// ---------------------------------------------------------------- confined reading (hardening 2)
const openRoot = (arg) => {
  const abs = resolve(String(arg));
  let st;
  try { st = lstatSync(abs); } catch { return { err: 'root-absent' }; }
  if (st.isSymbolicLink()) return { err: 'root-symlink' };
  if (!st.isDirectory()) return { err: 'root-not-directory' };
  try { return { base: realpathSync(abs) }; } catch { return { err: 'root-unreadable' }; }
};

/** Lexical containment: relative, no `..`, and (after normalisation) inside `base`. */
const contained = (base, rel) => {
  if (typeof rel !== 'string' || rel.trim() === '') return null;
  if (isAbsolute(rel)) return null;
  const n = normalize(rel);
  if (n === '..' || n.startsWith(`..${sep}`)) return null;
  const abs = resolve(base, n);
  const r = relative(base, abs);
  if (!r || r.startsWith('..') || isAbsolute(r)) return null;
  return abs;
};
const symlinkInChain = (base, abs) => {
  let cur = base;
  for (const part of relative(base, abs).split(sep)) {
    cur = join(cur, part);
    let st;
    try { st = lstatSync(cur); } catch { return false; }
    if (st.isSymbolicLink()) return true;
  }
  return false;
};
/** → { text, abs } | { why: 'escape'|'symlink'|'absent'|'not-regular'|'unreadable' } */
const readFileInside = (base, rel) => {
  const abs = contained(base, rel);
  if (!abs) return { why: 'escape' };
  if (symlinkInChain(base, abs)) return { why: 'symlink' };
  let st;
  try { st = statSync(abs); } catch { return { why: 'absent' }; }
  if (!st.isFile()) return { why: 'not-regular' };
  try { return { text: readFileSync(abs, 'utf8'), abs }; } catch { return { why: 'unreadable' }; }
};
const readRev = (base, rev, rel) => {
  if (!contained(base, rel)) return { why: 'escape' };
  const r = git(base, ['show', `${rev}:${normalize(rel)}`]);
  return r.status === 0 ? { text: r.stdout } : { why: 'absent' };
};
/** → string[] of spot-check paths, or { unsafe: <reason> }. */
const listSpots = (base, rev) => {
  if (rev) {
    const r = git(base, ['ls-tree', '--name-only', `${rev}:${SPOT_DIR}`]);
    if (r.status !== 0) return [];
    return r.stdout.split('\n').filter(Boolean).map((f) => `${SPOT_DIR}/${f}`);
  }
  const d = join(base, SPOT_DIR);
  let st;
  try { st = lstatSync(d); } catch { return []; }
  if (st.isSymbolicLink()) return { unsafe: 'spotcheck-dir-symlink' };
  if (!st.isDirectory()) return { unsafe: 'spotcheck-dir-not-directory' };
  try { return readdirSync(d).map((f) => `${SPOT_DIR}/${f}`); } catch { return { unsafe: 'spotcheck-dir-unreadable' }; }
};

// ---------------------------------------------------------------- evaluation
const failClosed = (out, reason) => ({ code: 2, lines: [...out, `ROUTED_LEDGER: FAIL-CLOSED reason=${reason}`] });

export function evaluate({ root, rev = null, from = FROM_DEFAULT, to = null, ledger = LEDGER_DEFAULT, classes = false }) {
  const out = [];
  const r0 = openRoot(root);
  if (r0.err) return failClosed(out, r0.err);
  const base = r0.base;

  let REV = null;
  if (rev) {
    const v = git(base, ['rev-parse', '--verify', `${rev}^{commit}`]);
    if (v.status !== 0) return failClosed(out, `rev-unreadable:${rev}`);
    REV = v.stdout.trim();
  }

  // ledger: inside the root, a regular file, never through a symlink
  const ledgerRel = normalize(String(ledger));
  if (isAbsolute(ledgerRel) || ledgerRel === '..' || ledgerRel.startsWith(`..${sep}`)) return failClosed(out, `ledger-escape:${ledgerRel}`);
  const lr = REV ? readRev(base, REV, ledgerRel) : readFileInside(base, ledgerRel);
  if (lr.why) return failClosed(out, `ledger-${lr.why}:${ledgerRel}`);
  const { rows, malformed, section } = ledgerRows(lr.text);
  if (!section) return failClosed(out, `ledger-has-no-Ledger-section:${ledgerRel}`);

  const listed = listSpots(base, REV);
  if (!Array.isArray(listed)) return failClosed(out, listed.unsafe);
  const spots = new Map();
  for (const p of listed) {
    const m = SPOT_RE.exec(p);
    if (m) spots.set(Number(m[1]), p);
  }
  const top = to === null ? Infinity : Number(to);
  const inRange = [...spots.keys()].filter((n) => n >= from && n <= top).sort((a, b) => a - b);
  if (!inRange.length) return failClosed(out, `no-spotchecks-in-range:${from}-${to === null ? 'end' : top}`);

  const rounds = new Map();
  let sections = 0;
  let items = 0;
  for (const n of inRange) {
    const rel = spots.get(n);
    const r = REV ? readRev(base, REV, rel) : readFileInside(base, rel);
    if (r.why) return failClosed(out, `spotcheck-${r.why}:${rel}`);
    const parsed = routedSections(r.text);
    rounds.set(n, parsed);
    sections += parsed.sections;
    items += parsed.items.length;
  }

  const findings = [];
  const F = (id, d) => findings.push(`${id} ${d}`);
  for (const d of malformed) F('ROW_MALFORMED', d);

  const seenIds = new Set();
  const covered = new Set();
  const nonOpen = new Map();
  const counts = { open: 0, closed: 0, wontfix: 0 };

  for (const row of rows) {
    const where = `${row.id}@line${row.line}`;
    let bad = false;
    if (!/^[A-Za-z0-9][A-Za-z0-9.-]*$/.test(row.id)) { F('ROW_MALFORMED', `${where}:id`); bad = true; }
    if (seenIds.has(row.id)) { F('ROW_DUPLICATE', where); bad = true; }
    seenIds.add(row.id);
    if (!/^\d+$/.test(row.round) || !/^\d+$/.test(row.item) || Number(row.item) < 1) { F('ROW_MALFORMED', `${where}:round-or-item`); bad = true; }
    const nq = words(row.quote);
    if (nq < 3 || nq > 25) { F('ROW_MALFORMED', `${where}:quote-words=${nq}`); bad = true; }
    if (!/^[a-z][a-z0-9-]*$/.test(row.cls)) { F('ROW_MALFORMED', `${where}:class`); bad = true; }
    if (!['open', 'closed', 'wontfix'].includes(row.status)) { F('ROW_MALFORMED', `${where}:status=${row.status}`); bad = true; }
    const idm = /^R(\d+)-/.exec(row.id);
    if (idm && Number(idm[1]) !== Number(row.round)) { F('ROW_MALFORMED', `${where}:id-round-mismatch`); bad = true; }
    let ans = null;
    if (row.status === 'open') {
      if (row.answer !== '-') { F('ROW_MALFORMED', `${where}:open-row-answer-not-dash`); bad = true; }
    } else if (['closed', 'wontfix'].includes(row.status)) {
      const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(row.answer);
      if (!m) { F('ROW_MALFORMED', `${where}:answer-format`); bad = true; }
      else if (words(m[3]) > 25) { F('ROW_MALFORMED', `${where}:answer-quote-words`); bad = true; }
      else ans = { path: m[1], line: Number(m[2]), quote: m[3] };
    }
    if (bad) continue;
    counts[row.status] += 1;

    const n = Number(row.round);
    const k = Number(row.item);
    if (n < from || n > top || !spots.has(n)) { F('ITEM_ABSENT', `${where}:round-${n}-not-in-range`); continue; }
    const s = rounds.get(n);
    if (k < 1 || k > s.items.length) { F('ITEM_ABSENT', `${where}:round-${n}-item-${k}-of-${s.items.length}`); continue; }
    const hits = s.items.filter((t) => wb(row.quote, t)).length;
    if (hits > 1) { F('QUOTE_AMBIGUOUS', `${where}:round-${n}-item-${k}-hits=${hits}`); continue; }
    if (hits === 0 || !wb(row.quote, s.items[k - 1])) { F('QUOTE_ABSENT', `${where}:round-${n}-item-${k}`); continue; }
    covered.add(`${n}#${k}`);

    if (ans) {
      const p = normalize(ans.path);
      if (isAbsolute(ans.path) || p === '..' || p.startsWith(`..${sep}`) || p === ledgerRel || SPOT_RE.test(p)) {
        F('ANSWER_DEAD', `${where}:answer-path-not-allowed:${ans.path}`);
        continue;
      }
      const at = REV ? readRev(base, REV, p) : readFileInside(base, p);
      if (at.why) { F('ANSWER_DEAD', `${where}:answer-${at.why}:${p}`); continue; }
      const AL = at.text.split('\n');
      if (ans.line < 1 || ans.line > AL.length) { F('ANSWER_DEAD', `${where}:answer-line-${ans.line}-of-${AL.length}`); continue; }
      if (!wb(ans.quote, AL[ans.line - 1])) { F('ANSWER_DEAD', `${where}:answer-quote-not-at-exact-line:${p}:${ans.line}`); continue; }
    }

    if (row.status !== 'open') {
      const key = `${n}#${k}`;
      if (nonOpen.has(key)) { F('ROW_CONTRADICTED', `${where}:second-non-open-on-round-${n}-item-${k}-after-${nonOpen.get(key)}`); continue; }
      nonOpen.set(key, row.id);
    }
  }

  for (const n of inRange) {
    const s = rounds.get(n);
    s.items.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) F('UNLEDGERED', `round-${n}-item-${i + 1}`); });
  }

  if (classes) {
    const by = new Map();
    for (const row of rows) {
      if (!/^[a-z][a-z0-9-]*$/.test(row.cls) || !/^\d+$/.test(row.round)) continue;
      const e = by.get(row.cls) || { n: 0, rounds: new Set() };
      e.n += 1;
      e.rounds.add(Number(row.round));
      by.set(row.cls, e);
    }
    for (const [c, e] of [...by.entries()].sort((a, b) => b[1].rounds.size - a[1].rounds.size || a[0].localeCompare(b[0]))) {
      out.push(`CLASS ${c} rows=${e.n} rounds=${[...e.rounds].sort((a, b) => a - b).join(',')}`);
    }
    for (const [c, e] of [...by.entries()].sort((a, b) => a[0].localeCompare(b[0]))) if (e.rounds.size >= 4) out.push(`RECURRENT ${c} rounds=${e.rounds.size}`);
  }

  for (const f of findings) out.push(`FINDING ${f}`);
  const head = `spotchecks=${inRange.length} sections=${sections} items=${items} rows=${rows.length} `
    + `open=${counts.open} closed=${counts.closed} wontfix=${counts.wontfix}`;
  if (findings.length) {
    out.push(`ROUTED_LEDGER: DRIFT ${head} findings=${findings.length} first=${findings[0].replace(' ', ':')}`);
    return { code: 1, lines: out };
  }
  out.push(`ROUTED_LEDGER: CLEAN ${head}`);
  return { code: 0, lines: out };
}

// ---------------------------------------------------------------- selftest
function selftest() {
  const T = mkdtempSync(join(tmpdir(), 'routed-ledger-st.'));
  const cases = [];
  const add = (name, fn) => {
    let ok = false;
    let why = '';
    try { const v = fn(); ok = v === true; why = v === true ? '' : String(v); } catch (e) { ok = false; why = `threw ${e.message}`; }
    cases.push({ name, ok, why });
  };
  const top = (r) => r.lines[r.lines.length - 1];
  const has = (r, id) => r.lines.some((l) => l.startsWith(`FINDING ${id} `));
  const only = (r, id) => r.lines.filter((l) => l.startsWith('FINDING ')).every((l) => l.startsWith(`FINDING ${id} `));

  const X = join(T, 'x');
  const spotFile = (n) => join(X, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
  const ledgerFile = join(X, 'corpus', 'routed-ledger.md');

  // ---- fixture mirroring the round-68 counter's buildFixture table (deterministic tokens)
  const buildFx = (mut, dir = X) => {
    rmSync(dir, { recursive: true, force: true });
    let tk = 0;
    const word = () => `w${(tk += 1).toString(36)}q`;
    const phrase = (k) => Array.from({ length: k }, word).join(' ');
    const it1 = phrase(6); const it2 = phrase(6); const tableItem = phrase(5);
    const it4 = phrase(6); const it5 = phrase(5); const shared = phrase(4);
    const decoy = phrase(4); const nested = phrase(4); const prose = phrase(5); const fenceLine = phrase(4);
    const a102 = phrase(5); const b102 = phrase(5); const c102 = phrase(5);
    const ansQuote = phrase(3);
    const outsider = phrase(3);

    const s101 = [
      '# Round 101 — spot-check', '', '## 4. Verdicts', '', `- ${decoy}`, '',
      '## 5. Routed defects for the next round', '',
      `- **D1 — ${it1}.**`, `  - ${nested}`, `1. **D2 — ${it2}.**`, '',
      prose, '',
      '| id | what |', '|---|---|', `| D3 | ${tableItem} |`, '',
      '```text', `- ${fenceLine}`, '```', '',
      `- **D4 — ${it4} ${shared}.**`, '',
      `- **D5 — ${it5} ${shared}.**`, '',
      '## 6. Non-author statement', '', `- ${phrase(3)}`, '',
    ].join('\n');
    const s102 = mut === 'second-section'
      ? ['# Round 102 — spot-check', '', '## Routed items', '', `- ${a102}`, `- ${b102}`, '', '## Routed items (amended)', '', `- **D3 — ${c102}.**`, '', '## End', ''].join('\n')
      : mut === 'no-section'
        ? ['# Round 102 — spot-check', '', '## Notes', '', `- ${a102}`, `- ${b102}`, '', '## End', ''].join('\n')
        : ['# Round 102 — spot-check', '', '## Routed items', '', `- ${a102}`, `- ${b102}`, '', '## End', ''].join('\n');

    const rows = [
      { id: 'A1', n: 101, k: 1, q: it1.split(' ').slice(1, 5).join(' '), cls: 'c-101', status: 'closed', answer: `\`notes/answers.md:3\` — "${ansQuote}"` },
      { id: 'A2', n: 101, k: 2, q: it2.split(' ').slice(0, 4).join(' '), cls: 'c-101', status: 'open', answer: '-' },
      { id: 'A3', n: 101, k: 3, q: tableItem.split(' ').slice(1, 4).join(' '), cls: 'c-101', status: 'open', answer: '-' },
      { id: 'A4', n: 101, k: 4, q: it4.split(' ').slice(2, 6).join(' '), cls: 'c-101', status: 'open', answer: '-' },
      { id: 'A5', n: 101, k: 5, q: it5.split(' ').slice(0, 4).join(' '), cls: 'c-101', status: 'open', answer: '-' },
      { id: 'A6', n: 102, k: 1, q: a102.split(' ').slice(0, 3).join(' '), cls: 'c-102', status: 'open', answer: '-' },
      { id: 'A7', n: 102, k: 2, q: b102.split(' ').slice(1, 4).join(' '), cls: 'c-102', status: 'open', answer: '-' },
    ];
    if (mut === 'drop') rows.splice(5, 1);
    if (mut === 'quote-swap') rows[1].q = it4.split(' ').slice(0, 4).join(' ');
    if (mut === 'quote-decoy') rows[3].q = decoy.split(' ').slice(0, 4).join(' ');
    if (mut === 'answer-wrong') rows[0].answer = `\`notes/answers.md:3\` — "${outsider}"`;
    if (mut === 'answer-ledger') rows[0].answer = `\`corpus/routed-ledger.md:3\` — "${ansQuote}"`;
    if (mut === 'answer-eof') rows[0].answer = `\`notes/answers.md:40\` — "${ansQuote}"`;
    if (mut === 'shifted-answer') rows[0].answer = `\`notes/answers.md:4\` — "${ansQuote}"`;
    if (mut === 'dup') rows.push({ ...rows[6] });
    if (mut === 'ordinal') rows.push({ id: 'A9', n: 101, k: 6, q: prose.split(' ').slice(0, 3).join(' '), cls: 'c-101', status: 'open', answer: '-' });
    if (mut === 'nested-as-item') rows.push({ id: 'A8', n: 101, k: 2, q: nested.split(' ').slice(0, 3).join(' '), cls: 'c-101', status: 'open', answer: '-' });
    if (mut === 'prose-as-item') rows.push({ id: 'A10', n: 101, k: 2, q: prose.split(' ').slice(0, 3).join(' '), cls: 'c-101', status: 'open', answer: '-' });
    if (mut === 'long-quote') rows[1].q = phrase(26);
    if (mut === 'one-word-quote') rows[1].q = it2.split(' ')[0];
    if (mut === 'ambiguous-quote') rows[1].q = shared;
    if (mut === 'fence-item') rows.push({ id: 'A11', n: 101, k: 5, q: fenceLine.split(' ').slice(0, 3).join(' '), cls: 'c-101', status: 'open', answer: '-' });
    if (mut === 'contradictory') rows.push({ id: 'A12', n: 101, k: 1, q: it1.split(' ').slice(2, 6).join(' '), cls: 'c-102', status: 'wontfix', answer: `\`notes/answers.md:3\` — "${ansQuote}"` });
    if (mut === 'two-word-quote') rows[1].q = it2.split(' ').slice(0, 2).join(' ');
    if (mut === 'open-with-answer') rows[1].answer = `\`notes/answers.md:3\` — "${ansQuote}"`;
    if (mut === 'closed-dash') rows[0].answer = '-';
    if (mut === 'bad-status') rows[1].status = 'done';
    if (mut === 'id-round-mismatch') rows[6].id = 'R99-D1';
    if (mut === 'round-out-of-range') rows.push({ id: 'A13', n: 103, k: 1, q: it1.split(' ').slice(0, 4).join(' '), cls: 'c-101', status: 'open', answer: '-' });
    if (mut === 'answer-absent') rows[0].answer = `\`notes/nope.md:3\` — "${ansQuote}"`;
    if (mut === 'answer-absolute') rows[0].answer = `\`/${'abs'}/answers.md:1\` — "${ansQuote}"`;
    if (mut === 'answer-dotdot') rows[0].answer = `\`../outside/answers.md:1\` — "${ansQuote}"`;
    if (mut === 'answer-spotcheck') rows[0].answer = `\`corpus/lessons/round-101-verifier-spotcheck.md:9\` — "${it1.split(' ').slice(1, 4).join(' ')}"`;
    if (mut === 'no-section') rows.splice(5, 2);

    mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
    mkdirSync(join(dir, 'notes'), { recursive: true });
    writeFileSync(join(dir, 'corpus', 'lessons', 'round-101-verifier-spotcheck.md'), s101);
    writeFileSync(join(dir, 'corpus', 'lessons', 'round-102-verifier-spotcheck.md'), s102);
    writeFileSync(join(dir, 'notes', 'answers.md'), ['# answers', phrase(4), `answer ${ansQuote} tail`, phrase(4), ''].join('\n'));
    const rowsTxt = rows.map((r) => `| ${r.id} | ${r.n} | ${r.k} | "${r.q}" | ${r.cls} | ${r.status} | ${r.answer} |`);
    if (mut === 'six-cell') rowsTxt.push(`| A20 | 101 | 2 | "${it2.split(' ').slice(0, 3).join(' ')}" | c-101 | open |`);
    if (mut !== 'ledger-absent') {
      writeFileSync(join(dir, 'corpus', 'routed-ledger.md'),
        ['# routed ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rowsTxt, ''].join('\n'));
    }
    return { rows, it1, it2, it4, it5, shared, nested, prose, fenceLine, decoy, tableItem, a102, b102, c102, ansQuote };
  };
  const run = (mut, extra = {}) => { buildFx(mut); return evaluate({ root: X, from: 101, to: 102, ...extra }); };

  // ---- 20 counter mutants (L4 case list)
  add('mutant good: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0', () => {
    const r = run('good');
    return (r.code === 0 && /^ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0$/.test(top(r))) || top(r);
  });
  add('mutant drop: UNLEDGERED exit 1', () => { const r = run('drop'); return (r.code === 1 && has(r, 'UNLEDGERED') && only(r, 'UNLEDGERED')) || top(r); });
  add('mutant quote-swap: QUOTE_ABSENT', () => { const r = run('quote-swap'); return (r.code === 1 && has(r, 'QUOTE_ABSENT')) || top(r); });
  add('mutant quote-decoy: QUOTE_ABSENT', () => { const r = run('quote-decoy'); return (r.code === 1 && has(r, 'QUOTE_ABSENT')) || top(r); });
  add('mutant answer-wrong: ANSWER_DEAD', () => { const r = run('answer-wrong'); return (r.code === 1 && has(r, 'ANSWER_DEAD') && only(r, 'ANSWER_DEAD')) || top(r); });
  add('mutant answer-ledger: ANSWER_DEAD', () => { const r = run('answer-ledger'); return (r.code === 1 && has(r, 'ANSWER_DEAD') && only(r, 'ANSWER_DEAD')) || top(r); });
  add('mutant answer-eof: ANSWER_DEAD', () => { const r = run('answer-eof'); return (r.code === 1 && has(r, 'ANSWER_DEAD') && only(r, 'ANSWER_DEAD')) || top(r); });
  add('mutant dup: ROW_DUPLICATE', () => { const r = run('dup'); return (r.code === 1 && has(r, 'ROW_DUPLICATE') && only(r, 'ROW_DUPLICATE')) || top(r); });
  add('mutant ordinal: ITEM_ABSENT', () => { const r = run('ordinal'); return (r.code === 1 && has(r, 'ITEM_ABSENT') && only(r, 'ITEM_ABSENT')) || top(r); });
  add('mutant nested-as-item: QUOTE_ABSENT', () => { const r = run('nested-as-item'); return (r.code === 1 && has(r, 'QUOTE_ABSENT') && only(r, 'QUOTE_ABSENT')) || top(r); });
  add('mutant prose-as-item: QUOTE_ABSENT', () => { const r = run('prose-as-item'); return (r.code === 1 && has(r, 'QUOTE_ABSENT') && only(r, 'QUOTE_ABSENT')) || top(r); });
  add('mutant long-quote: ROW_MALFORMED', () => { const r = run('long-quote'); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || top(r); });
  add('mutant one-word-quote: ROW_MALFORMED', () => { const r = run('one-word-quote'); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || top(r); });
  add('mutant ambiguous-quote: QUOTE_AMBIGUOUS', () => { const r = run('ambiguous-quote'); return (r.code === 1 && has(r, 'QUOTE_AMBIGUOUS')) || top(r); });
  add('mutant shifted-answer: ANSWER_DEAD', () => { const r = run('shifted-answer'); return (r.code === 1 && has(r, 'ANSWER_DEAD') && only(r, 'ANSWER_DEAD')) || top(r); });
  add('mutant fence-item: QUOTE_ABSENT', () => { const r = run('fence-item'); return (r.code === 1 && has(r, 'QUOTE_ABSENT') && only(r, 'QUOTE_ABSENT')) || top(r); });
  add('mutant second-section: UNLEDGERED, 3 sections 8 items', () => {
    const r = run('second-section');
    return (r.code === 1 && has(r, 'UNLEDGERED') && only(r, 'UNLEDGERED') && /sections=3 items=8 /.test(top(r))) || top(r);
  });
  add('mutant contradictory: ROW_CONTRADICTED', () => { const r = run('contradictory'); return (r.code === 1 && has(r, 'ROW_CONTRADICTED') && only(r, 'ROW_CONTRADICTED')) || top(r); });
  add('mutant no-section: CLEAN 1 section 5 items', () => {
    const r = run('no-section');
    return (r.code === 0 && /^ROUTED_LEDGER: CLEAN spotchecks=2 sections=1 items=5 rows=5 /.test(top(r))) || top(r);
  });
  add('mutant ledger-absent: FAIL-CLOSED exit 2', () => { const r = run('ledger-absent'); return (r.code === 2 && /^ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:/.test(top(r))) || top(r); });

  // ---- parsing
  add('parser: 5 items, fence/prose/nested/table-header excluded', () => {
    const fx = buildFx('good');
    const p = routedSections(readFileSync(spotFile(101), 'utf8'));
    return (p.sections === 1 && p.items.length === 5) || `sections=${p.sections} items=${p.items.length}`;
  });
  add('parser: nested bullet is item 1 text, not an item', () => {
    buildFx('good');
    const p = routedSections(readFileSync(spotFile(101), 'utf8'));
    return (wb(p.items[0], p.items[0]) && p.items[0].includes('  - ')) || p.items[0];
  });
  add('parser: prose after the list is in no item', () => {
    const fx = buildFx('good');
    const p = routedSections(readFileSync(spotFile(101), 'utf8'));
    return p.items.filter((t) => wb(fx.prose, t)).length === 0 || p.items.join('|');
  });
  add('parser: fenced bullet is in no item', () => {
    const fx = buildFx('good');
    const p = routedSections(readFileSync(spotFile(101), 'utf8'));
    return p.items.filter((t) => wb(fx.fenceLine, t)).length === 0 || p.items.join('|');
  });
  add('parser: table header and separator are not items', () => {
    buildFx('good');
    const p = routedSections(readFileSync(spotFile(101), 'utf8'));
    return !p.items.some((t) => /\| id \| what \|/.test(t) || /^\|[-|]+\|$/.test(t)) || p.items.join('|');
  });
  add('parser: two routed sections in one file → 2 sections, ordinals continue', () => {
    buildFx('second-section');
    const p = routedSections(readFileSync(spotFile(102), 'utf8'));
    return (p.sections === 2 && p.items.length === 3) || `sections=${p.sections} items=${p.items.length}`;
  });
  add('parser: deeper sub-heading stays inside the routed section', () => {
    buildFx('good');
    const txt = readFileSync(spotFile(101), 'utf8').replace('| D3 |', '### 5.1 pinned\n\n| D3 |');
    const p = routedSections(txt);
    return (p.sections === 1 && p.items.length === 5) || `sections=${p.sections} items=${p.items.length}`;
  });
  add('parser: prose-only routed section yields 0 items, exit 0', () => {
    rmSync(X, { recursive: true, force: true });
    mkdirSync(join(X, 'corpus', 'lessons'), { recursive: true });
    writeFileSync(spotFile(59), '# Round 59\n\n## Routed defects\n\nNo new defect is routed this round.\n');
    writeFileSync(ledgerFile, ['# l', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ''].join('\n'));
    const r = evaluate({ root: X, from: 59, to: 59 });
    return (r.code === 0 && /sections=1 items=0 rows=0 /.test(top(r))) || top(r);
  });

  // ---- structure and answer confinement
  add('two-word quote → ROW_MALFORMED', () => { const r = run('two-word-quote'); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || top(r); });
  add('open row carrying an answer → ROW_MALFORMED', () => { const r = run('open-with-answer'); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || top(r); });
  add('closed row with "-" answer → ROW_MALFORMED', () => { const r = run('closed-dash'); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || top(r); });
  add('bad status → ROW_MALFORMED', () => { const r = run('bad-status'); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || top(r); });
  add('six-cell row → ROW_MALFORMED', () => { const r = run('six-cell'); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || top(r); });
  add('R-id whose round cell disagrees → ROW_MALFORMED', () => {
    const r = run('id-round-mismatch');
    return (r.code === 1 && r.lines.some((l) => l.startsWith('FINDING ROW_MALFORMED ') && l.includes('id-round-mismatch'))) || top(r);
  });
  add('round outside the range → ITEM_ABSENT', () => { const r = run('round-out-of-range'); return (r.code === 1 && has(r, 'ITEM_ABSENT')) || top(r); });
  add('answer file absent → ANSWER_DEAD', () => { const r = run('answer-absent'); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || top(r); });
  add('absolute answer path → ANSWER_DEAD', () => { const r = run('answer-absolute'); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || top(r); });
  add('answer path with .. → ANSWER_DEAD', () => { const r = run('answer-dotdot'); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || top(r); });
  add('answer pointing into a spot-check → ANSWER_DEAD', () => { const r = run('answer-spotcheck'); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || top(r); });
  add('answer reached through a symlink → ANSWER_DEAD', () => {
    buildFx('good');
    symlinkSync(join(X, 'notes', 'answers.md'), join(X, 'notes', 'link.md'));
    const rows = readFileSync(ledgerFile, 'utf8').replace('`notes/answers.md:3`', '`notes/link.md:3`');
    writeFileSync(ledgerFile, rows);
    const r = evaluate({ root: X, from: 101, to: 102 });
    return (r.code === 1 && r.lines.some((l) => l.startsWith('FINDING ANSWER_DEAD ') && l.includes('answer-symlink'))) || top(r);
  });

  // ---- CLI, ledger confinement, --rev
  const cli = (args, env = {}) => spawnSync(process.execPath, [SELF, ...args], { encoding: 'utf8', env: { ...childEnv(), ...env }, timeout: 180000 });
  add('--to excludes later spot-checks (spotchecks=1)', () => {
    buildFx('good');
    writeFileSync(ledgerFile, readFileSync(ledgerFile, 'utf8').split('\n').filter((l) => !/^\| A[67] \|/.test(l)).join('\n'));
    const r = evaluate({ root: X, from: 101, to: 101 });
    return (r.code === 0 && /spotchecks=1 sections=1 items=5 rows=5 /.test(top(r))) || top(r);
  });
  add('--classes prints CLASS lines, no RECURRENT under 4 rounds', () => {
    buildFx('good');
    const r = evaluate({ root: X, from: 101, to: 102, classes: true });
    return (r.code === 0 && r.lines.some((l) => /^CLASS c-101 rows=5 rounds=101$/.test(l)) && !r.lines.some((l) => l.startsWith('RECURRENT'))) || r.lines.join('/');
  });
  add('RECURRENT fires at 4 distinct rounds', () => {
    rmSync(X, { recursive: true, force: true });
    mkdirSync(join(X, 'corpus', 'lessons'), { recursive: true });
    const rows = [];
    for (const n of [10, 11, 12, 13]) {
      writeFileSync(spotFile(n), `## Routed defects\n\n- **D1 — map drift again in round ${n}.**\n`);
      rows.push(`| R${n}-D1 | ${n} | 1 | "map drift again in round ${n}" | reference-drift | open | - |`);
    }
    writeFileSync(ledgerFile, ['# l', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n'));
    const r = evaluate({ root: X, from: 10, classes: true });
    return (r.code === 0 && r.lines.includes('RECURRENT reference-drift rounds=4')) || r.lines.join('/');
  });
  add('--ledger outside the root → FAIL-CLOSED exit 2', () => { buildFx('good'); const r = evaluate({ root: X, from: 101, to: 102, ledger: '../outside.md' }); return (r.code === 2 && /ledger-escape/.test(top(r))) || top(r); });
  add('symlinked ledger → FAIL-CLOSED exit 2', () => {
    buildFx('good');
    const real = join(T, 'ledger-real.md');
    writeFileSync(real, readFileSync(ledgerFile, 'utf8'));
    rmSync(ledgerFile);
    symlinkSync(real, ledgerFile);
    const r = evaluate({ root: X, from: 101, to: 102 });
    return (r.code === 2 && /^ROUTED_LEDGER: FAIL-CLOSED reason=ledger-symlink:/.test(top(r))) || top(r);
  });
  add('ledger without ## Ledger → FAIL-CLOSED exit 2', () => { buildFx('good'); writeFileSync(ledgerFile, '# nothing\n'); const r = evaluate({ root: X, from: 101, to: 102 }); return (r.code === 2 && /ledger-has-no-Ledger-section/.test(top(r))) || top(r); });
  add('absent root → FAIL-CLOSED exit 2', () => { const r = evaluate({ root: join(T, 'nope'), from: 101 }); return (r.code === 2 && /reason=root-absent/.test(top(r))) || top(r); });
  add('no spot-check in range → FAIL-CLOSED exit 2', () => { buildFx('good'); const r = evaluate({ root: X, from: 50, to: 54 }); return (r.code === 2 && /no-spotchecks-in-range/.test(top(r))) || top(r); });
  add('unreadable --rev → FAIL-CLOSED exit 2', () => { buildFx('good'); const r = evaluate({ root: X, from: 101, to: 102, rev: 'deadbeef' }); return (r.code === 2 && /rev-unreadable/.test(top(r))) || top(r); });
  add('--rev reads committed bytes, not the worktree', () => {
    const fx = buildFx('good');
    const D = join(T, 'rev');
    buildFx('good', D);
    const g = (dir, ...a) => git(dir, a);
    if (g(D, 'init', '-q').status !== 0) return 'git init failed';
    const tl = g(D, 'rev-parse', '--show-toplevel');
    if (tl.status !== 0 || realpathSync(tl.stdout.trim()) !== realpathSync(D)) return 'toplevel mismatch';
    if (g(D, 'add', '-A').status !== 0) return 'git add failed';
    if (g(D, '-c', 'user.name=st', '-c', 'user.email=st@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fx').status !== 0) return 'commit failed';
    // worktree drifts, HEAD stays clean
    const rows = readFileSync(join(D, 'corpus', 'routed-ledger.md'), 'utf8').split('\n').filter((l) => !l.startsWith('| A6 |')).join('\n');
    writeFileSync(join(D, 'corpus', 'routed-ledger.md'), rows);
    const wt = evaluate({ root: D, from: 101, to: 102 });
    const rv = evaluate({ root: D, from: 101, to: 102, rev: 'HEAD' });
    return (wt.code === 1 && rv.code === 0) || `worktree=${wt.code} rev=${rv.code} ${top(rv)}`;
  });
  add('inherited GIT_DIR is not honoured (spawned child reads --root repo)', () => {
    buildFx('good');
    const D = join(T, 'gd');
    buildFx('good', D);
    const stage = (dir) => {
      if (git(dir, ['init', '-q']).status !== 0) return false;
      if (git(dir, ['add', '-A']).status !== 0) return false;
      return git(dir, ['-c', 'user.name=st', '-c', 'user.email=st@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fx']).status === 0;
    };
    if (!stage(D)) return 'commit D failed';
    // D's worktree drifts (drop a row) → any reader of the worktree sees DRIFT; HEAD is CLEAN
    writeFileSync(join(D, 'corpus', 'routed-ledger.md'), readFileSync(join(D, 'corpus', 'routed-ledger.md'), 'utf8').split('\n').filter((l) => !l.startsWith('| A6 |')).join('\n'));
    const F = join(T, 'foreign');
    buildFx('drop', F);
    if (!stage(F)) return 'commit F failed';
    const r = cli(['--root', D, '--rev', 'HEAD', '--from', '101', '--to', '102'], { GIT_DIR: join(F, '.git') });
    const v = (r.stdout || '').trim().split('\n').pop() || '';
    return (r.status === 0 && /^ROUTED_LEDGER: CLEAN /.test(v)) || `exit=${r.status} ${v}`;
  });
  add('symlinked spot-check → FAIL-CLOSED exit 2', () => {
    buildFx('good');
    const sf = spotFile(102);
    const real = join(T, 'spot-real.md');
    writeFileSync(real, readFileSync(sf, 'utf8'));
    rmSync(sf);
    symlinkSync(real, sf);
    const r = evaluate({ root: X, from: 101, to: 102 });
    return (r.code === 2 && /^ROUTED_LEDGER: FAIL-CLOSED reason=spotcheck-symlink:/.test(top(r))) || top(r);
  });
  add('--root that is a symlink → FAIL-CLOSED exit 2', () => {
    buildFx('good');
    const link = join(T, 'root-link');
    try { symlinkSync(X, link); } catch { return 'symlink unavailable'; }
    const r = cli(['--root', link, '--from', '101', '--to', '102']);
    const v = (r.stdout || '').trim().split('\n').pop() || '';
    return (r.status === 2 && /reason=root-symlink/.test(v)) || `exit=${r.status} ${v}`;
  });
  add('usage: unknown argument → exit 64', () => {
    const r = cli(['--bogus']);
    const v = (r.stdout || '').trim().split('\n').pop() || '';
    return (r.status === 64 && v === 'ROUTED_LEDGER: USAGE unknown argument --bogus') || `exit=${r.status} ${v}`;
  });
  add('usage: --root without a value → exit 64', () => {
    const r = cli(['--root']);
    const v = (r.stdout || '').trim().split('\n').pop() || '';
    return (r.status === 64 && v === 'ROUTED_LEDGER: USAGE --root needs a value') || `exit=${r.status} ${v}`;
  });
  add('usage: --from abc → exit 64', () => {
    const r = cli(['--from', 'abc']);
    const v = (r.stdout || '').trim().split('\n').pop() || '';
    return (r.status === 64 && v === 'ROUTED_LEDGER: USAGE --from/--to must be integers') || `exit=${r.status} ${v}`;
  });

  rmSync(T, { recursive: true, force: true });
  const pass = cases.filter((c) => c.ok).length;
  for (const c of cases) process.stdout.write(`CASE ${c.ok ? 'ok' : 'FAIL'} ${c.name}${c.ok ? '' : ` :: ${c.why}`}\n`);
  process.stdout.write(`ROUTED_LEDGER_SELFTEST: ${pass === cases.length ? 'PASS' : 'FAIL'} (${pass}/${cases.length})\n`);
  return pass === cases.length ? 0 : 1;
}

// ---------------------------------------------------------------- cli
export function main(argv) {
  if (argv.includes('--selftest')) return selftest();
  const opts = { root: process.cwd(), rev: null, from: FROM_DEFAULT, to: null, ledger: LEDGER_DEFAULT, classes: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const val = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`);
      i += 1;
      return v;
    };
    try {
      if (a === '--root') opts.root = resolve(val());
      else if (a === '--rev') opts.rev = val();
      else if (a === '--from') opts.from = Number(val());
      else if (a === '--to') opts.to = Number(val());
      else if (a === '--ledger') opts.ledger = val();
      else if (a === '--classes') opts.classes = true;
      else throw new Error(`unknown argument ${a}`);
    } catch (e) { process.stdout.write(`ROUTED_LEDGER: USAGE ${e.message}\n`); return 64; }
  }
  if (!Number.isInteger(opts.from) || (opts.to !== null && !Number.isInteger(opts.to))) {
    process.stdout.write('ROUTED_LEDGER: USAGE --from/--to must be integers\n');
    return 64;
  }
  try {
    const r = evaluate(opts);
    process.stdout.write(`${r.lines.join('\n')}\n`);
    return r.code;
  } catch (e) {
    process.stdout.write(`ROUTED_LEDGER: FAIL-CLOSED reason=internal:${String(e.message).replace(/\s+/g, '_')}\n`);
    return 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === SELF) process.exitCode = main(process.argv.slice(2));
