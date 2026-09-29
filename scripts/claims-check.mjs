#!/usr/bin/env node
/**
 * claims-check.mjs — the member-claims gate (contract `kumitate-claims-v1`).
 *
 * WHAT IT RE-DERIVES. `SCORECARD.md` carries a 19-row surface registry whose
 * fourth cell is a claim: `yes — <corpus note>` means "the note names every
 * member of this family at internals level". `scripts/proxy-check.mjs` reads
 * that cell as a string (`cells[4].startsWith('yes')`) and never opens the
 * note, so the cheapest fake — flip the cell, or point it at a note that names
 * nothing — passes every arithmetic check (measured in round 13: a renamed
 * member section in `corpus/knowledge/remaining-scripts-census.md` still reads
 * `PROXY: MATCH … coverage=9` exit 0, while the manual probe reads
 * `MEMBER_PROBE: 58/60 ok` exit 1). This tool is that probe as a gate: it
 * resolves each covered row's note(s), derives the note's member sections,
 * and fails on the shapes the family standard names.
 *
 * ROW FORMS. A row is SECTION-FORM when at least one of its notes carries a
 * member section — a `## ` heading whose first backticked token is path-like
 * (contains `/`, or ends `.mjs .js .sh .rs .timer .service .json .md .toml
 * .yml`). Trailing prose after the token is allowed (`## \`cost_ledger.rs\`
 * (737 L) — wire types…`). A row with no member section is TOPIC-FORM and can
 * only be probed weakly (`ROW_NO_SECTIONS`, advisory): its member completeness
 * is prose this tool cannot read, which is recorded in the verdict, never
 * hidden.
 *
 * Findings (text mode prints `CLAIMS  <severity>  <KIND>  row=<ID>  <detail>`)
 *   error NOTE_MISSING             a cell's explicit `knowledge/x.md` has no file
 *         NOTE_AMBIGUOUS           a bare note stem exists in both corpus dirs
 *         NOTE_FOREIGN             no note of the row names any family member
 *         SECTION_FILE_UNRESOLVED  a member heading does not resolve under --src
 *         SECTION_FILE_AMBIGUOUS   a member heading's basename matches >1 file
 *         SECTION_NO_ANCHOR        a member section carries no own-file anchor
 *         SECTION_DEAD_ANCHOR      own-file anchors exist, none is live
 *         SECTION_NO_SYMBOL        no backticked symbol is verbatim in the file
 *         MEMBER_COUNT_DRIFT       `N members` declared, N ≠ distinct sections
 *   warn  ROW_NO_SECTIONS          topic-form row: member completeness unchecked
 *         SECTION_FILE_NOT_MEMBER  section names a file outside the row's patterns
 *         MEMBER_COUNT_SUSPECT     `N files` declared, distinct sections < N
 *
 * ANCHOR SEMANTICS (frozen from round 13's probe, widened where measurement
 * demanded it). A candidate is any `<pathish>:<N>[-<M>]` in the section body —
 * backticked or not, because the runtime notes write them parenthesised and
 * un-backticked (`(lane_overlay.rs:198-241)`,
 * `(scripts/charter-scribe/systemd/charter-scribe.timer:4)`) — where
 * `<pathish>` resolves under `--src` (exact path when it contains `/`, else a
 * unique basename match), PLUS any bare `:<N>[-<M>]`, which the section heading
 * binds to the section's own file. The section passes when ≥1 candidate
 * resolving to its OWN file is live: 1 ≤ a ≤ b ≤ that file's line count and
 * both endpoint lines are non-blank.
 *
 * Verdict line (always the last stdout line)
 *   CLAIMS: MATCH (rows=<n> yes=<n> notes=<n> sections=<n> adv=<n>)
 *   CLAIMS: DRIFT (<KIND> row=<ID> detail; …)   at most 6 findings, then `+N more`
 *   CLAIMS: FAIL-CLOSED (<TOKEN> detail)
 * exit map: 0 match · 1 drift (warnings too under --strict) · 2 fail-closed · 64 usage
 *
 * Zero dependencies (node: builtins only), read-only on every tree it touches,
 * and it never writes a file anywhere. The origin tree is resolved against,
 * never modified: `--src` (default `$UFO_SRC` or the lane's origin checkout)
 * is only ever opened for reading.
 */
import { readFileSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve, basename as pathBasename } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-claims-v1';
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SELF = resolve(HERE, '..');
const DEFAULT_SRC = process.env.UFO_SRC || '/home/vgpnk/Projects/origin-work/ufo-fsd-alpha';

const SCORECARD_FILE = 'SCORECARD.md';
const CORPUS_DIRS = ['corpus/knowledge', 'corpus/lessons'];

/** Frozen derivation patterns (see the header; do not widen them here). */
const RE_REGISTRY_ROW = /^\| (S|R)\d+ \|/;
const RE_CHUNK_HEAD = /^`([^`]+)`/;
const RE_EXT = /\.(?:mjs|js|sh|rs|timer|service|json|md|toml|yml)$/;
const RE_PATHISH = /(?<![\w./:-])([A-Za-z0-9_][\w./-]*):(\d+)(?:-(\d+))?/g;
const RE_BARE = /(?<![\w:.-]):(\d+)(?:-(\d+))?/g;
const RE_SYMBOL = /`([^`\n]+)`/g;
const RE_MEMBERS = /(\d+)\s+members?\b/;
const RE_FILES = /(\d+)\s+(?:files?|`[^`]+`)/;

/** Every finding kind the hermetic suite must fire at least once. */
const FINDING_KINDS = [
  'NOTE_MISSING', 'NOTE_AMBIGUOUS', 'NOTE_FOREIGN',
  'SECTION_FILE_UNRESOLVED', 'SECTION_FILE_AMBIGUOUS',
  'SECTION_NO_ANCHOR', 'SECTION_DEAD_ANCHOR', 'SECTION_NO_SYMBOL',
  'MEMBER_COUNT_DRIFT',
  'ROW_NO_SECTIONS', 'SECTION_FILE_NOT_MEMBER', 'MEMBER_COUNT_SUSPECT',
];
/** Every fail-closed arm the hermetic suite must fire at least once. */
const FAIL_CLOSED_KINDS = [
  'SELF_NOT_A_DIR', 'SCORECARD_MISSING', 'REGISTRY_MISSING', 'SRC_NOT_A_DIR',
  'CORPUS_DIRS_MISSING',
];

const USAGE = `usage: node scripts/claims-check.mjs [options]
       node scripts/claims-check.mjs --selftest
       node scripts/claims-check.mjs -h|--help
contract id: ${CONTRACT}

options
  --self DIR       repo holding SCORECARD.md + corpus/ (default: this repo)
  --scorecard FILE SCORECARD path, relative to --self unless absolute
  --src DIR        origin tree the member files are resolved against
                   (default: $UFO_SRC or ${DEFAULT_SRC})
  --row ID         check only this registry row (repeatable, e.g. --row S8)
  --json           one machine-readable object on stdout
  --strict         promote warn-level findings to failure
  --selftest       run the hermetic fixture suite (touches no live tree)

findings: ${FINDING_KINDS.join(' ')}
exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
`;

/* ------------------------------------------------------------------ helpers */

function readText(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

function statKind(p) {
  try {
    const s = statSync(p);
    return s.isDirectory() ? 'dir' : s.isFile() ? 'file' : 'other';
  } catch { return 'absent'; }
}

/** Recursive relative file list under `root` ('' on an unreadable root). */
/** Never walked: the same prune list `scripts/cite-check.mjs` documents. */
const PRUNE_DIRS = new Set(['.git', '.ufo', 'target', 'node_modules']);

function walkFiles(root, rel = '', out = []) {
  let entries;
  try { entries = readdirSync(join(root, rel), { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) { if (!PRUNE_DIRS.has(e.name)) walkFiles(root, r, out); }
    else if (e.isFile()) out.push(r);
  }
  return out;
}

/** Split a GFM table row into cells, honoring `\|` escapes. */
function splitRowCells(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  const out = [];
  let cur = '';
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (s[i] === '|') { out.push(cur.trim()); cur = ''; continue; }
    cur += s[i];
  }
  out.push(cur.trim());
  return out;
}

/** `fnmatch` for the glob patterns the registry uses (`*.mjs`, `probe-*.mjs`). */
function globMatch(pattern, value) {
  const rx = new RegExp(`^${pattern.split('*').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
  return rx.test(value);
}

/** Backticked tokens of a text. */
function backticks(text) {
  const out = [];
  RE_SYMBOL.lastIndex = 0;
  let m;
  while ((m = RE_SYMBOL.exec(text)) !== null) out.push(m[1]);
  return out;
}

/* ------------------------------------------------------------ registry parse */

/** Registry rows: `{id, family, members, noteCell}` for `| S<n> |` / `| R<n> |`. */
function parseRegistry(scorecardText) {
  const rows = [];
  for (const line of scorecardText.split('\n')) {
    if (!RE_REGISTRY_ROW.test(line)) continue;
    const cells = splitRowCells(line);
    rows.push({
      id: cells[0] ?? '',
      family: cells[1] ?? '',
      members: cells[2] ?? '',
      noteCell: cells[3] ?? '',
      covered: (cells[3] ?? '').trim().startsWith('yes'),
    });
  }
  return rows;
}

/**
 * The note stems a cell claims. A part yields a claimed note when its leading
 * token is note-shaped — an explicit `knowledge/x.md` / `lessons/x.md` path, or
 * a bare stem that resolves. A bare stem that resolves nowhere is prose, not a
 * claim (round-13 S6's cell carries `; the round-11 reading …` after the stem
 * list); an explicit path that resolves nowhere is a broken claim.
 */
function extractNoteStems(noteCell, self) {
  const body = noteCell.includes('—') ? noteCell.slice(noteCell.indexOf('—') + 1) : '';
  const claimed = [];
  const explicit = [];
  const unresolved = [];
  for (const part of body.split(/[·;]/)) {
    const cleaned = part.trim().replace(/`/g, '');
    const tok = cleaned.split(/[:\s]/)[0];
    if (tok === '') continue;
    const rest = cleaned.slice(tok.length).trim();
    // A part asserts a note when it carries a path (`knowledge/x.md`), when the
    // token is the whole part, or when only an annotation (`: 9 of 9 …`) follows.
    // A prose continuation (`; the round-11 reading …`) asserts nothing.
    const asserts = rest === '' || rest.startsWith(':') || /^(knowledge|lessons)\//.test(tok);
    const isExplicit = /^(knowledge|lessons)\/[A-Za-z0-9_.\-]+\.md$/.test(tok);
    const stem = tok.replace(/^(knowledge|lessons)\//, '').replace(/\.md$/, '');
    if (!/^[A-Za-z0-9_.\-]+$/.test(stem)) continue;
    const hits = CORPUS_DIRS
      .map((d) => `${d}/${stem}.md`)
      .filter((rel) => statKind(join(self, rel)) === 'file');
    if (hits.length === 1) { if (!claimed.includes(hits[0])) claimed.push(hits[0]); }
    else if (hits.length > 1 && !claimed.includes(`AMBIGUOUS:${stem}`)) claimed.push(`AMBIGUOUS:${stem}`);
    else if (isExplicit) explicit.push(tok);
    else if (asserts && !unresolved.includes(stem)) unresolved.push(stem);
  }
  return { claimed, explicit, unresolved };
}

/** Family patterns: backticked members-cell tokens naming files or dirs. */
function familyPatterns(membersCell) {
  return backticks(membersCell).filter((t) => !/\s/.test(t) && !t.includes('|')
    && (t.includes('/') || t.includes('*') || RE_EXT.test(t)));
}

function inFamily(patterns, rel) {
  const base = pathBasename(rel);
  for (const p of patterns) {
    if (p.endsWith('/')) {
      const dir = p.replace(/\/$/, '');
      if (rel.startsWith(p) || rel.includes(`/${dir}/`) || base === dir) return true;
      continue;
    }
    if (p.includes('*')) { if (globMatch(p, base) || globMatch(p, rel)) return true; continue; }
    if (p === rel || pathBasename(p) === base) return true;
  }
  return false;
}

/* --------------------------------------------------------------- src resolve */

/** Resolve a pathish token against the origin file index (relative paths). */
function makeResolver(originFiles) {
  const byBase = new Map();
  for (const rel of originFiles) {
    const b = pathBasename(rel);
    if (!byBase.has(b)) byBase.set(b, []);
    byBase.get(b).push(rel);
  }
  return (tok) => {
    if (tok.includes('/')) return originFiles.includes(tok) ? [tok] : [];
    return byBase.get(tok) ?? [];
  };
}

/* -------------------------------------------------------------- row probing */

function sectionBodyChunks(noteText) {
  const parts = noteText.split(/^## /m);
  return parts.slice(1).map((p) => p);
}

function probeRow(row, ctx) {
  const findings = [];
  const out = {
    id: row.id, family: row.family, covered: row.covered,
    form: 'topic', notes: [], sections: [], advisories: 0,
  };
  const add = (severity, kind, detail) => findings.push({ severity, kind, row: row.id, detail });

  const { claimed, explicit, unresolved } = extractNoteStems(row.noteCell, ctx.self);
  for (const tok of explicit) add('error', 'NOTE_MISSING', `${tok} does not exist under corpus/`);
  for (const stem of unresolved) add('error', 'NOTE_MISSING', `${stem} does not resolve to a corpus note`);
  for (const rel of claimed) {
    if (rel.startsWith('AMBIGUOUS:')) add('error', 'NOTE_AMBIGUOUS', `${rel.slice('AMBIGUOUS:'.length)} exists in both corpus dirs`);
    else out.notes.push(rel);
  }
  // Only when the cell asserted nothing at all — an explicit/unresolved/ambiguous
  // part already carries its own finding, and double-reporting muddies the verdict.
  if (out.notes.length === 0 && claimed.length + explicit.length + unresolved.length === 0) {
    add('error', 'NOTE_MISSING', 'the covered cell names no resolvable corpus note');
  }

  const patterns = familyPatterns(row.members);
  const noteTexts = out.notes.map((rel) => readText(join(ctx.self, rel)) ?? '');

  // NOTE_FOREIGN — the row's notes must name at least one member of its family.
  const fileish = () => {
    const toks = [];
    for (const text of noteTexts) {
      for (const t of backticks(text)) toks.push(t);
      for (const m of text.matchAll(/[A-Za-z0-9_][\w./-]*:\d+(?:-\d+)?/g)) toks.push(m[0].split(':')[0]);
      for (const m of text.matchAll(/[A-Za-z0-9_][\w./-]*\.(?:mjs|js|sh|rs|md|json|service|timer|toml|yml)/g)) toks.push(m[0]);
    }
    return toks;
  };
  if (patterns.length > 0 && out.notes.length > 0) {
    const toks = fileish();
    const named = toks.some((t) => patterns.some((p) => {
      if (p.endsWith('/')) return t.startsWith(p) || t.includes(`/${p.replace(/\/$/, '')}/`);
      if (p.includes('*')) return globMatch(p, pathBasename(t)) || globMatch(p, t);
      return t === p || pathBasename(t) === pathBasename(p);
    }));
    if (!named) add('error', 'NOTE_FOREIGN', `no note names any member of ${row.id} (patterns: ${patterns.join(', ')})`);
  }

  // Member sections.
  for (let i = 0; i < out.notes.length; i += 1) {
    const rel = out.notes[i];
    for (const chunk of sectionBodyChunks(noteTexts[i])) {
      const head = RE_CHUNK_HEAD.exec(chunk);
      if (head === null) continue;
      const tok = head[1];
      if (!(tok.includes('/') || RE_EXT.test(tok))) continue;
      const body = chunk;
      const candidates = ctx.resolve(tok);
      if (candidates.length === 0) {
        add('error', 'SECTION_FILE_UNRESOLVED', `${tok} does not resolve under --src`);
        out.sections.push({ note: rel, heading: tok, file: null, anchors: 0, symbols: 0 });
        continue;
      }
      if (candidates.length > 1) {
        add('error', 'SECTION_FILE_AMBIGUOUS', `${tok} matches ${candidates.length} origin files`);
        out.sections.push({ note: rel, heading: tok, file: null, anchors: 0, symbols: 0 });
        continue;
      }
      const own = candidates[0];
      const ownText = readText(join(ctx.src, own));
      const lines = ownText === null ? [] : ownText.split('\n');

      const anchors = [];
      RE_PATHISH.lastIndex = 0;
      let m;
      const bodyNoHead = body.slice(body.indexOf('\n') + 1);
      while ((m = RE_PATHISH.exec(bodyNoHead)) !== null) {
        const resolved = ctx.resolve(m[1]);
        if (resolved.length === 1) anchors.push([resolved[0], Number(m[2]), Number(m[3] ?? m[2])]);
      }
      RE_BARE.lastIndex = 0;
      while ((m = RE_BARE.exec(bodyNoHead)) !== null) anchors.push([own, Number(m[1]), Number(m[2] ?? m[1])]);
      const ownAnchors = anchors.filter((a) => a[0] === own);
      const live = ownAnchors.some(([, a, b]) => a >= 1 && b <= lines.length && a <= b
        && lines[a - 1].trim() !== '' && lines[b - 1].trim() !== '');
      if (ownAnchors.length === 0) add('error', 'SECTION_NO_ANCHOR', `${own} — section carries no own-file anchor`);
      else if (!live) add('error', 'SECTION_DEAD_ANCHOR', `${own} — own-file anchors ${ownAnchors.map((a) => a.slice(1).join('-')).join(',')} are dead`);

      const symbols = backticks(bodyNoHead).filter((t) => !/[/\\:.\s]/.test(t) && t.length >= 3);
      const symbolHit = symbols.some((s) => lines.some((l) => l.includes(s)));
      if (!symbolHit) add('error', 'SECTION_NO_SYMBOL', `${own} — no backticked symbol is verbatim in the file`);

      const fam = inFamily(patterns, own);
      if (!fam) add('warn', 'SECTION_FILE_NOT_MEMBER', `${own} is outside ${row.id}'s declared members`);

      out.sections.push({
        note: rel, heading: tok, file: own,
        anchors: ownAnchors.length, live, symbols: symbols.length, symbolHit, inFamily: fam,
      });
    }
  }

  if (out.sections.length > 0) out.form = 'section';
  else add('warn', 'ROW_NO_SECTIONS', `${row.id} has no member section — member completeness unchecked`);

  // Integer arm — only for section-form rows.
  if (out.form === 'section') {
    const distinct = new Set(out.sections.map((s) => s.file ?? s.heading)).size;
    const declaredMembers = RE_MEMBERS.exec(row.members);
    const declaredFiles = RE_FILES.exec(row.members);
    if (declaredMembers !== null && distinct !== Number(declaredMembers[1])) {
      add('error', 'MEMBER_COUNT_DRIFT', `declared ${declaredMembers[1]} members, found ${distinct} distinct sections`);
    } else if (declaredMembers === null && declaredFiles !== null && distinct < Number(declaredFiles[1])) {
      add('warn', 'MEMBER_COUNT_SUSPECT', `declared ${declaredFiles[1]}, found ${distinct} distinct sections`);
    }
  }

  out.advisories = findings.filter((f) => f.severity === 'warn').length;
  out.findings = findings;
  return { row: out, findings };
}

/* ------------------------------------------------------------------ modes */

function summarize(findings, strict) {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warn').length;
  return { errors, warnings, drift: errors > 0 || (Boolean(strict) && warnings > 0) };
}

function renderVerdict(verdict, totals, findings, strict) {
  if (verdict === 'MATCH') {
    return `CLAIMS: MATCH (rows=${totals.rows} yes=${totals.yes} notes=${totals.notes}`
      + ` sections=${totals.sections} adv=${totals.warnings})`;
  }
  if (verdict === 'DRIFT') {
    const shown = findings.filter((f) => f.severity === 'error' || Boolean(strict));
    const parts = shown.slice(0, 6).map((f) => `${f.kind} row=${f.row} ${f.detail}`);
    if (shown.length > parts.length) parts.push(`+${shown.length - parts.length} more`);
    return `CLAIMS: DRIFT (${parts.join('; ')})`;
  }
  return null;
}

function failClosed(opts, token, detail, started) {
  const body = {
    contract: CONTRACT, mode: 'check',
    self: opts.self, scorecard: opts.scorecard, src: opts.src,
    options: { row: opts.row, strict: Boolean(opts.strict), json: Boolean(opts.json) },
    rows: [],
    findings: [{ severity: 'error', kind: token, row: '-', detail }],
    totals: { rows: 0, yes: 0, notes: 0, sections: 0, errors: 1, warnings: 0, adv: 0 },
    verdict: 'FAIL-CLOSED', fatal: { kind: token, detail }, durationMs: Date.now() - started,
  };
  if (opts.json) process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  else process.stdout.write(`CLAIMS  fail-closed  ${token}  ${detail}\nCLAIMS: FAIL-CLOSED (${token} ${detail})\n`);
  return 2;
}

function runCheck(opts, started) {
  if (statKind(opts.self) !== 'dir') return failClosed(opts, 'SELF_NOT_A_DIR', `--self ${opts.self} is ${statKind(opts.self)}`, started);
  const scorecardPath = opts.scorecard.startsWith('/') ? opts.scorecard : join(opts.self, opts.scorecard);
  const scorecardText = readText(scorecardPath);
  if (scorecardText === null) return failClosed(opts, 'SCORECARD_MISSING', `--scorecard ${scorecardPath} is ${statKind(scorecardPath)}`, started);
  for (const d of CORPUS_DIRS) {
    if (statKind(join(opts.self, d)) !== 'dir') return failClosed(opts, 'CORPUS_DIRS_MISSING', `${d} is ${statKind(join(opts.self, d))} under --self`, started);
  }
  const registry = parseRegistry(scorecardText);
  if (registry.length === 0) return failClosed(opts, 'REGISTRY_MISSING', 'no `| S<n> |` / `| R<n> |` rows in the scorecard', started);
  if (statKind(opts.src) !== 'dir') return failClosed(opts, 'SRC_NOT_A_DIR', `--src ${opts.src} is ${statKind(opts.src)}`, started);

  const known = new Set(registry.map((r) => r.id));
  const unknown = opts.row.filter((id) => !known.has(id));
  if (unknown.length > 0) {
    process.stdout.write(`claims-check: ROW_UNKNOWN --row ${unknown.join(',')} is not a registry row (${[...known].join(' ')})\n${USAGE}`);
    return 64;
  }
  const filtered = opts.row.length > 0 ? registry.filter((r) => opts.row.includes(r.id)) : registry;

  const ctx = { self: opts.self, src: opts.src, resolve: makeResolver(walkFiles(opts.src)) };
  const rows = [];
  const findings = [];
  for (const row of filtered) {
    if (!row.covered) { rows.push({ id: row.id, family: row.family, covered: false, form: 'uncovered', notes: [], sections: [], advisories: 0 }); continue; }
    const probed = probeRow(row, ctx);
    rows.push(probed.row);
    findings.push(...probed.findings);
  }

  const totals = {
    rows: filtered.length,
    yes: filtered.filter((r) => r.covered).length,
    notes: rows.reduce((n, r) => n + (r.notes?.length ?? 0), 0),
    sections: rows.reduce((n, r) => n + (r.sections?.length ?? 0), 0),
    errors: 0, warnings: 0, adv: 0,
  };
  const sum = summarize(findings, opts.strict);
  totals.errors = sum.errors;
  totals.warnings = sum.warnings;
  totals.adv = sum.warnings;
  const verdict = sum.drift ? 'DRIFT' : 'MATCH';

  if (opts.json) {
    process.stdout.write(`${JSON.stringify({
      schema: CONTRACT, contract: CONTRACT, mode: 'check',
      self: opts.self, scorecard: scorecardPath, src: opts.src,
      options: { row: opts.row, strict: Boolean(opts.strict), json: true },
      rows, findings, totals, verdict, durationMs: Date.now() - started,
    }, null, 2)}\n`);
  } else {
    const lines = [`ROWS: ${totals.rows}  YES: ${totals.yes}  NOTES: ${totals.notes}  SECTIONS: ${totals.sections}`];
    for (const r of rows) {
      lines.push(`ROW ${r.id.padEnd(4)} form=${r.form.padEnd(9)} notes=${r.notes.length} sections=${r.sections.length} adv=${r.advisories}`);
    }
    for (const f of findings) lines.push(`CLAIMS  ${f.severity.padEnd(5)} ${f.kind.padEnd(24)} row=${f.row}  ${f.detail}`);
    lines.push('SUMMARY: errors=' + totals.errors + ' warnings=' + totals.warnings);
    lines.push(renderVerdict(verdict, totals, findings, opts.strict));
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  return verdict === 'MATCH' ? 0 : 1;
}

/* --------------------------------------------------------------- selftest */

const FIXTURE_FILES = {
  'scripts/a.mjs': ['#!/usr/bin/env node', '// fixture A', 'const ALPHA_MARK = 1;', 'export default ALPHA_MARK;', '', ''],
  'scripts/b.mjs': ['#!/usr/bin/env node', 'const BETA_MARK = 2;', 'export default BETA_MARK;', '// end of fixture B (4 non-blank lines)'],
  'scripts/dup.mjs': ['const DUP_ONE = 1;', ''],
  'crates/ufo-core-runtime/src/dup.mjs': ['const DUP_TWO = 2;', ''],
  'crates/ufo-core-runtime/src/c.rs': ['pub fn c() -> u8 {', '    // GAMMA_MARK', '    3', '}', ''],
};

function fixtureSrc(root) {
  for (const [rel, lines] of Object.entries(FIXTURE_FILES)) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, lines.join('\n'));
  }
}

function fxNote(root, rel, body) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
}

const FX_GREEN_NOTE = '## `scripts/a.mjs`\n\nAnchors `ALPHA_MARK` at `scripts/a.mjs:3`.\n';
const FX_GREEN_ROWS = [
  '| # | Family | Members (origin tree) | Corpus note |',
  '|---|---|---|---|',
  '| S1 | fixture family | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |',
  '| R1 | fixture family | `scripts/b.mjs` (4 L) | yes — `knowledge/fx-b.md` |',
];

function fxRepo(root, { rows = FX_GREEN_ROWS, notes = [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']], extra = [] } = {}) {
  mkdirSync(join(root, 'corpus/knowledge'), { recursive: true });
  mkdirSync(join(root, 'corpus/lessons'), { recursive: true });
  for (const [rel, body] of notes) fxNote(root, rel, body);
  for (const [rel, body] of extra) fxNote(root, rel, body);
  writeFileSync(join(root, SCORECARD_FILE), ['# Fixture scorecard', '', ...rows, ''].join('\n'));
}

function runClaims(args) {
  const r = spawnSync(process.execPath, [TOOL_FILE, ...args], { encoding: 'utf8', timeout: 60_000 });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function verdictLine(run) {
  const lines = run.stdout.trim().split('\n');
  return lines.length > 0 ? lines[lines.length - 1] : '';
}

function kinds(run) {
  return run.stdout.split('\n')
    .filter((l) => l.startsWith('CLAIMS  '))
    .map((l) => l.trim().split(/\s+/)[2]);
}

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-claims-selftest-'));
  const results = [];
  const observed = new Set();
  const failClosedSeen = new Set();
  const check = (label, fn) => {
    let r;
    try { r = fn(); } catch (err) { r = { ok: false, detail: `threw ${err && err.message}` }; }
    for (const k of r.kinds ?? []) observed.add(k);
    for (const k of r.failClosed ?? []) failClosedSeen.add(k);
    results.push({ label, ok: Boolean(r.ok), detail: r.detail ?? '' });
  };
  const mk = (name, opts) => { const p = join(tmp, name); mkdirSync(p, { recursive: true }); fxRepo(p, opts); fixtureSrc(join(tmp, `${name}-src`)); return { self: p, src: join(tmp, `${name}-src`) }; };
  const args = ({ self, src }, extra = []) => ['--self', self, '--src', src, ...extra];
  const ok = (run, status, needle, kindList) => {
    const k = kinds(run);
    return {
      ok: run.status === status && verdictLine(run).includes(needle)
        && (kindList === undefined || JSON.stringify(k) === JSON.stringify(kindList)),
      detail: `exit=${run.status} last=${verdictLine(run).slice(0, 90)} kinds=[${k.join(',')}]`,
      kinds: k,
    };
  };

  try {
    // green baseline
    const green = mk('green');
    check('green fixture → MATCH, exit 0, no findings, exact totals', () => {
      const r = runClaims(args(green));
      return {
        ok: r.status === 0 && kinds(r).length === 0
          && verdictLine(r) === 'CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=2 adv=0)',
        detail: `exit=${r.status} last=${verdictLine(r)}`,
      };
    });

    // NOTE_MISSING / NOTE_AMBIGUOUS / NOTE_FOREIGN
    const missing = mk('missing', { rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/nope.md` |'] });
    check('NOTE_MISSING: explicit knowledge/nope.md', () => ok(runClaims(args(missing)), 1, 'CLAIMS: DRIFT', ['NOTE_MISSING', 'ROW_NO_SECTIONS']));

    const ambig = mk('ambig', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — fx-a |'],
      extra: [['corpus/lessons/fx-a.md', FX_GREEN_NOTE]],
    });
    check('NOTE_AMBIGUOUS: stem in both corpus dirs', () => ok(runClaims(args(ambig)), 1, 'CLAIMS: DRIFT', ['NOTE_AMBIGUOUS', 'ROW_NO_SECTIONS']));

    const foreign = mk('foreign', { rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-b.md` |'] });
    check('NOTE_FOREIGN: note names no member of the row', () => ok(runClaims(args(foreign)), 1, 'CLAIMS: DRIFT', ['NOTE_FOREIGN', 'SECTION_FILE_NOT_MEMBER']));

    // section arms
    const unres = mk('unres', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/missing.mjs`\n\n' + 'The member `scripts/a.mjs` is named in prose.\n\n' + '`ALPHA_MARK` at `scripts/missing.mjs:1`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_FILE_UNRESOLVED: heading does not resolve', () => ok(runClaims(args(unres)), 1, 'CLAIMS: DRIFT', ['SECTION_FILE_UNRESOLVED']));

    const ambigSec = mk('ambigsec', { notes: [['corpus/knowledge/fx-a.md', '## `dup.mjs`\n\n' + 'The member `scripts/a.mjs` is named in prose.\n\n' + '`DUP_ONE` at `dup.mjs:1`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_FILE_AMBIGUOUS: basename matches two files', () => ok(runClaims(args(ambigSec)), 1, 'CLAIMS: DRIFT', ['SECTION_FILE_AMBIGUOUS']));

    const noAnchor = mk('noanchor', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\nThe symbol `ALPHA_MARK` lives there.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_NO_ANCHOR: symbol but no own-file anchor', () => ok(runClaims(args(noAnchor)), 1, 'CLAIMS: DRIFT', ['SECTION_NO_ANCHOR']));

    const dead = mk('dead', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:99`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_DEAD_ANCHOR: anchor out of range', () => ok(runClaims(args(dead)), 1, 'CLAIMS: DRIFT', ['SECTION_DEAD_ANCHOR']));

    const noSymbol = mk('nosymbol', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\nSee `ABSENT_SYMBOL` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_NO_SYMBOL: backticked symbol absent from the file', () => ok(runClaims(args(noSymbol)), 1, 'CLAIMS: DRIFT', ['SECTION_NO_SYMBOL']));

    // integer arms
    const drift = mk('memberdrift', {
      rows: ['| S1 | f | 2 members: `scripts/a.mjs` + `scripts/b.mjs` | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE]],
    });
    check('MEMBER_COUNT_DRIFT: declared 2 members, 1 distinct section', () => ok(runClaims(args(drift)), 1, 'CLAIMS: DRIFT', ['MEMBER_COUNT_DRIFT']));

    const suspect = mk('suspect', {
      rows: ['| S1 | f | 3 files (`scripts/a.mjs`) | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE]],
    });
    check('MEMBER_COUNT_SUSPECT: declared 3 files, 1 section → warn, exit 0', () => ok(runClaims(args(suspect)), 0, 'CLAIMS: MATCH', ['MEMBER_COUNT_SUSPECT']));

    const foreignSec = mk('foreignsec', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE + '\n## `crates/ufo-core-runtime/src/c.rs`\n\n`GAMMA_MARK` at `crates/ufo-core-runtime/src/c.rs:2`.\n']],
    });
    check('SECTION_FILE_NOT_MEMBER: section outside the row patterns → warn', () => ok(runClaims(args(foreignSec)), 0, 'CLAIMS: MATCH', ['SECTION_FILE_NOT_MEMBER']));

    const topic = mk('topic', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', 'Prose about `scripts/a.mjs` with no member section.\n']],
    });
    check('ROW_NO_SECTIONS: topic-form row → warn, exit 0', () => ok(runClaims(args(topic)), 0, 'CLAIMS: MATCH', ['ROW_NO_SECTIONS']));

    const topicStrict = runClaims(args(topic, ['--strict']));
    check('--strict promotes ROW_NO_SECTIONS → DRIFT exit 1', () => ok(topicStrict, 1, 'CLAIMS: DRIFT', ['ROW_NO_SECTIONS']));

    // drop-one arms
    const dropped = mk('dropped', {
      rows: ['| S1 | f | 2 members: `scripts/a.mjs` + `scripts/b.mjs` | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', 'prose only\n']],
    });
    check('drop-one: a deleted member section → MEMBER_COUNT_DRIFT', () => ok(runClaims(args(dropped)), 1, 'CLAIMS: DRIFT', ['MEMBER_COUNT_DRIFT']));

    const renamed = mk('renamed', {
      rows: ['| S1 | f | 2 members: `scripts/a.mjs` + `scripts/b.mjs` | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n\n## `scripts/a-renamed.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n']],
    });
    check('drop-one: a renamed member heading → SECTION_FILE_UNRESOLVED', () => ok(runClaims(args(renamed)), 1, 'CLAIMS: DRIFT', ['SECTION_FILE_UNRESOLVED']));

    // --row, --json
    const twoRows = mk('tworow', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |', '| S2 | f | `scripts/b.mjs` (4 L) | yes — `knowledge/fx-missing.md` |'],
    });
    const rowFiltered = runClaims(args(twoRows, ['--row', 'S1']));
    check('--row S1: the other row\'s NOTE_MISSING is not reported', () => {
      const base = ok(rowFiltered, 0, 'CLAIMS: MATCH', []);
      return {
        ok: base.ok && rowFiltered.stdout.includes('ROW S1') && !rowFiltered.stdout.includes('ROW S2'),
        detail: `${base.detail} rows=[${rowFiltered.stdout.split('\n').filter((l) => l.startsWith('ROW ')).join('|')}]`,
        kinds: base.kinds,
      };
    });

    const jsonRun = runClaims(args(twoRows, ['--json']));
    check('--json totals equal the text totals', () => {
      const j = JSON.parse(jsonRun.stdout);
      const t = runClaims(args(twoRows));
      const m = /SUMMARY: errors=(\d+) warnings=(\d+)/.exec(t.stdout);
      return {
        ok: j.totals.errors === Number(m[1]) && j.totals.warnings === Number(m[2]) && j.verdict === 'DRIFT' && j.schema === CONTRACT,
        detail: `json=${j.totals.errors}/${j.totals.warnings} text=${m[1]}/${m[2]} verdict=${j.verdict}`,
      };
    });

    // fail-closed arms
    const fc = (name, extra, token) => {
      const g = mk(name);
      const run = runClaims(['--self', g.self, '--src', g.src, ...extra]);
      return { run, token };
    };
    const arms = [
      fc('fc-self', ['--scorecard', SCORECARD_FILE, '--self', '/nonexistent'], 'SELF_NOT_A_DIR'),
      (() => { const g = mk('fc-card'); const r = runClaims(['--self', g.self, '--src', g.src, '--scorecard', 'missing.md']); return { run: r, token: 'SCORECARD_MISSING' }; })(),
      (() => { const g = mk('fc-reg'); writeFileSync(join(g.self, SCORECARD_FILE), '# no registry\n'); const r = runClaims(['--self', g.self, '--src', g.src]); return { run: r, token: 'REGISTRY_MISSING' }; })(),
      (() => { const g = mk('fc-src'); const r = runClaims(['--self', g.self, '--src', '/nonexistent']); return { run: r, token: 'SRC_NOT_A_DIR' }; })(),
      (() => { const g = mk('fc-corpus'); rmSync(join(g.self, 'corpus/lessons'), { recursive: true }); const r = runClaims(args(g)); return { run: r, token: 'CORPUS_DIRS_MISSING' }; })(),
    ];
    for (const arm of arms) {
      check(`${arm.token}: fail-closed exit 2`, () => ({
        ok: arm.run.status === 2 && verdictLine(arm.run).includes(`FAIL-CLOSED (${arm.token}`),
        detail: `exit=${arm.run.status} last=${verdictLine(arm.run).slice(0, 90)}`,
        failClosed: [arm.token],
      }));
    }

    // usage
    check('ROW_UNKNOWN: unknown --row is a usage refusal, exit 64', () => {
      const g = mk('row-unknown');
      const r = runClaims(args(g, ['--row', 'Z9']));
      return { ok: r.status === 64 && r.stdout.includes('usage:') && r.stdout.includes('ROW_UNKNOWN'), detail: `exit=${r.status}` };
    });
    check('symbol threshold: a 2-char backticked token does not count as a symbol', () => {
      const g = mk('short-sym', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`AB` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
      const r = runClaims(args(g));
      return { ok: r.status === 1 && kinds(r).join(',') === 'SECTION_NO_SYMBOL', detail: `exit=${r.status} kinds=[${kinds(r).join(',')}]` };
    });
    check('anchor liveness boundary: the last non-blank line is live, one past it is dead', () => {
      const g = mk('boundary', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:4`.\n']] });
      const live = runClaims(args(g));
      const past = mk('boundary-past', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:5`.\n']] });
      const dead = runClaims(args(past));
      return {
        ok: live.status === 0 && dead.status === 1 && kinds(dead).join(',') === 'SECTION_DEAD_ANCHOR',
        detail: `lastline exit=${live.status} past-eof exit=${dead.status} kinds=[${kinds(dead).join(',')}]`,
      };
    });
    check('unknown flag → usage exit 64', () => {
      const g = mk('usage');
      const r = runClaims(['--bogus']);
      return { ok: r.status === 64 && r.stdout.includes('usage:'), detail: `exit=${r.status}` };
    });
    check('--self without a value → usage exit 64', () => {
      const r = runClaims(['--self']);
      return { ok: r.status === 64, detail: `exit=${r.status}` };
    });
    check('-h prints usage, exit 0', () => {
      const r = runClaims(['-h']);
      return { ok: r.status === 0 && r.stdout.includes('contract id:'), detail: `exit=${r.status}` };
    });

    // hermeticity is asserted structurally: every fixture root is under tmpdir(),
    // and the acceptance run proves it from outside by poisoning the env
    // (`UFO_SRC=/nonexistent … --selftest` → PASS). A case that re-entered
    // `--selftest` here would recurse, so it is deliberately absent.
    check('fixture roots are all under tmpdir() (no live tree in reach)', () => ({
      ok: tmp.startsWith(`${tmpdir()}/`),
      detail: `tmp=${tmp} startsWith(tmpdir())=${tmp.startsWith(tmpdir())}`,
    }));
    check('the row summary and the verdict agree on sections/notes/adv (kind-blind mutants fail here)', () => {
      const g = mk('totals', { notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE], ['corpus/knowledge/fx-b.md', 'prose only about `scripts/b.mjs`, no section\n']] });
      const r = runClaims(args(g));
      const row = r.stdout.split('\n').find((l) => l.startsWith('ROW R1 ')) ?? '';
      return {
        ok: r.status === 0 && verdictLine(r) === 'CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=1 adv=1)'
          && row.includes('form=topic') && row.includes('sections=0') && row.includes('adv=1'),
        detail: `exit=${r.status} last=${verdictLine(r)} row=${row.trim()}`,
      };
    });
    check('heading with trailing prose still counts as a member section', () => {
      const g = mk('trailing', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs` (6 L) — fixture A\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
      const r = runClaims(args(g));
      return { ok: r.status === 0 && r.stdout.includes('form=section'), detail: `exit=${r.status} last=${verdictLine(r).slice(0, 60)}` };
    });
    check('un-backticked parenthesised anchor counts (runtime-note house style)', () => {
      const g = mk('paren', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\nThe mark `ALPHA_MARK` (scripts/a.mjs:3) is set.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
      const r = runClaims(args(g));
      return { ok: r.status === 0, detail: `exit=${r.status} last=${verdictLine(r).slice(0, 60)}` };
    });

    // coverage of the kind table itself
    const missingKinds = FINDING_KINDS.filter((k) => !observed.has(k));
    const missingArms = FAIL_CLOSED_KINDS.filter((k) => !failClosedSeen.has(k));
    check('every finding kind fired by the suite', () => ({ ok: missingKinds.length === 0, detail: `unfired=[${missingKinds.join(',')}]` }));
    check('every fail-closed arm fired by the suite', () => ({ ok: missingArms.length === 0, detail: `unfired=[${missingArms.join(',')}]` }));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    if (!r.ok) process.stdout.write(`FAIL ${r.label}\n     ${r.detail}\n`);
  }
  process.stdout.write(`CLAIMS_SELFTEST: ${results.length - failed.length}/${results.length} pass\n`);
  process.stdout.write(`VERDICT: ${failed.length === 0 ? 'PASS' : 'FAIL'}\n`);
  return failed.length === 0 ? 0 : 1;
}

/* ------------------------------------------------------------------- argv */

function parseArgs(argv) {
  const opts = { self: DEFAULT_SELF, scorecard: SCORECARD_FILE, src: DEFAULT_SRC, row: [], json: false, strict: false, selftest: false, help: false };
  const need = (flag, v) => {
    if (v === undefined || v.trim() === '' || v.startsWith('-')) {
      process.stdout.write(`claims-check: ${flag} needs a value\n${USAGE}`);
      process.exit(64);
    }
    return v;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--self') { opts.self = resolve(need(a, argv[++i])); continue; }
    if (a === '--scorecard') { opts.scorecard = need(a, argv[++i]); continue; }
    if (a === '--src') { opts.src = resolve(need(a, argv[++i])); continue; }
    if (a === '--row') { opts.row.push(need(a, argv[++i])); continue; }
    if (a === '--json') { opts.json = true; continue; }
    if (a === '--strict') { opts.strict = true; continue; }
    if (a === '--selftest' || a === '--self-test') { opts.selftest = true; continue; }
    if (a === '-h' || a === '--help') { opts.help = true; continue; }
    process.stdout.write(`claims-check: unsupported argument: ${a}\n${USAGE}`);
    process.exit(64);
  }
  return opts;
}

const TOOL_FILE = fileURLToPath(import.meta.url);

function main() {
  const started = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { process.stdout.write(USAGE); process.exit(0); }
  if (opts.selftest) process.exit(selfTest());
  process.exit(runCheck(opts, started));
}

main();