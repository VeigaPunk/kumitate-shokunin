#!/usr/bin/env node
/**
 * kimi-census.mjs — the Kimi Code CLI substrate census gate
 * (contract `kumitate-kimi-census-v1`).
 *
 * WHAT IT RE-DERIVES. `~/.kimi-code` is the installation the fleet's lanes run
 * on, and its shape is a frozen fact: the K1–K5 member rules in `SCORECARD.md`
 * were derived from this tree read live — round 35 adds root `mcp.json` to K1,
 * bringing the live member total to 53 (round 40 counts `skills/` live at 7; round 42 adds `locks/`).
 * Prose cannot keep that honest — an upgrade can drop `bin/fd`, a new lane file
 * or plugin can appear undeclared, a secret path can loosen, a state dir can
 * vanish. This gate resolves the frozen member set against the tree at
 * measurement time and fails on exactly the shapes the rules name:
 *
 *   MEMBER_MISSING  a declared member is absent, or resolves with a kind other
 *                   than the one declared, or an enumerable dir dropped a
 *                   declared child.
 *   UNLISTED        an undeclared child sits directly under an enumerable dir —
 *                   and since round 20 that includes the ROOT, which K1–K5 now
 *                   exhausts. Root enumeration is the frozen rule, not a flag.
 *   SHAPE_DRIFT     a shape-only member's pin fails: a mode lacks its declared
 *                   floor bits, or the kind pin fails.
 *
 * MEMBER RULES (frozen; the counts are read live and total 53 on the recon
 * tree — `agents/secondary/` = 18 lane files, `skills/` = 7 entries).
 *   K1 = `config.toml`, `tui.toml`, the `config.toml.*.bak` drift chain as ONE
 *        member, and root `mcp.json` (shape-only, mode floor 0400).
 *   K2 = the 18 files under `agents/secondary/` (counted live, names not
 *        gated), the 7 entries under `skills/` (counted live), plus
 *        `plugins/installed.json` and the `plugins/managed/kimi-webbridge`
 *        tree as one presence-only member.
 *   K3 = `locks/` (mode floor 0700), `sessions/`, `session_index.jsonl`,
 *        `workspace-trust/`, `telemetry/`, `logs/kimi-code.log`,
 *        `file-history/`, `user-history/`, `cache/`, `search-index/`;
 *        members are shape-only and descendants are never enumerated.
 *   K4 = `bin/kimi`, `bin/fd`, `updates/`, `server/`, `server.token`,
 *        `device_id`, `region`, `credentials/`, `oauth/` — directories count as
 *        one member each.
 *   K5 = `workspaces.json`, `tui.toml.bak`, `rc-qrcode.png` — the round-20
 *        root-residue family: three root files pinned by presence + kind only,
 *        never by content. `workspaces.json` is the anchor member (the K3 `wd_*`
 *        session-key scheme reads it), so it is gated like any other file.
 *
 * SHAPE-ONLY POLICY (enforced in code, not by convention). `locks/`,
 * `mcp.json`, `credentials/`, `oauth/` and `server.token` are shape-only
 * members: the gate calls `lstatSync` on them (kind + mode bits) and NEVER
 * opens or reads them — no `readFileSync`, no `readdirSync` inside them, no
 * content in any output.
 * The file-kind pin is deliberately `leaf` (any non-directory inode) rather
 * than `isFile`, so the hermetic suite can build a FIFO / dangling symlink at
 * `server.token` and prove stat-only enforcement: a read of a FIFO would block
 * the gate forever and a followed symlink would read `ENOENT`. Secret-file
 * mode pins are floors (`mode & floor === floor`). Secret directories also
 * reject permission bits beyond their declared mode floor, except where a
 * per-member ceiling explicitly preserves a wider existing mode (`oauth/`).
 * Secret directories must be owned by the running uid. `locks/` and
 * `credentials/` have a 0700 floor; mcp.json's floor is 0400, and
 * server.token stays 0600. The live `oauth/` is 0755, not 0700.
 *
 * ENUMERABLE DIRS. Only a dir whose complete child set is declared by the
 * member rules is enumerated: `agents/secondary/` and `skills/` by live child
 * count (names not gated — a rename is not a finding), `plugins/` and
 * `plugins/managed/` by declared child name, and the tree ROOT by declared
 * child name. The root became enumerable in round 20, once K5 declared the
 * three residue files that made K1–K4 non-exhaustive there; there is no flag
 * to turn the arm off (an escape hatch would leave the freeze unverifiable),
 * so an undeclared root child is `UNLISTED` and exit 1. The arm exempts the
 * `config.toml.*.bak` drift-chain generations, because the K1 chain member
 * already accounts for them as ONE member with its generation count reported
 * as info — gating them by name would double-report a single member — and it
 * exempts nothing else: the verify path is read-only and creates nothing under
 * the root.
 *
 * Verdict line (always the last stdout line)
 *   KIMI_CENSUS: CLEAN (members=<n> checked=<n> chain=<n> info=<n>)
 *   KIMI_CENSUS: DRIFT (<KIND> <id>; …)            at most 6 findings, then `+N more`
 *   KIMI_CENSUS: FAIL-CLOSED (<TOKEN> <detail>)
 * `members` is the live member-slot total (counted dirs contribute their live
 * child count, absent/wrong-kind members contribute 0); `checked` is the subset
 * that resolved with its declared kind and passed its shape pins.
 * exit map: 0 clean · 1 drift · 2 fail-closed · 64 usage (refusals → stderr)
 *
 * Zero dependencies (node: builtins only), single file, and the verify path
 * spawns no subprocess and writes no file anywhere. The probe is read-only on
 * every tree it touches; the only writes in this file build the hermetic
 * fixtures under a `mkdtemp` root in `--selftest`.
 * ROUND 34 (2026-10-19): `skills/` grew a 6th child (`cursor-lane`, a real dir);
 * counting rule unchanged, tripwire re-pinned after the drift was captured
 * whole and dispositioned. Round 35 adds root `mcp.json` to K1 as a
 * shape-only, stat-only member with a 0400 mode floor.
 * ROUND 40 (2026-10-22): `skills/` grew a 7th child (`kimi-webbridge`, a real
 * dir with `SKILL.md` + `references/`; the other five are symlinks, and round
 * 34's `cursor-lane` is the first real dir); counting rule unchanged, tripwire
 * re-pinned 6 → 7 after the drift was captured whole and dispositioned. Live
 * member total 51 → 52; `FROZEN.K2` moves 26 → 27, K1/K3/K4/K5 unchanged.
 * ROUND 42 (2026-10-22): `locks/` is the K3 session-lock state root; member
 * total 52 → 53 and `FROZEN.K3` moves 9 → 10. The census stats `locks/` only;
 * it never enumerates `locks/sessions/` or reads lock-file contents.
 */
import {
  lstatSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, chmodSync,
  rmSync, symlinkSync, realpathSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-kimi-census-v1';
const DEFAULT_ROOT = join(homedir(), '.kimi-code');
const TOOL_FILE = fileURLToPath(import.meta.url);

/** The drift chain glob: `config.toml.bak` is the newest generation too. */
const RE_CHAIN = /^config\.toml(\..+)?\.bak$/;

/** The frozen member set (see the header). Order is K1 → K5, file order. */
const MEMBERS = [
  { id: 'config.toml', family: 'K1', path: 'config.toml', kind: 'file' },
  { id: 'tui.toml', family: 'K1', path: 'tui.toml', kind: 'file' },
  { id: 'config.toml.*.bak', family: 'K1', path: 'config.toml.*.bak', kind: 'chain' },
  { id: 'mcp.json', family: 'K1', path: 'mcp.json', kind: 'file', secret: true, modeFloor: 0o400 },

  { id: 'agents/secondary/', family: 'K2', path: 'agents/secondary', kind: 'dir', counted: 18 },
  { id: 'skills/', family: 'K2', path: 'skills', kind: 'dir', counted: 7 },
  { id: 'plugins/installed.json', family: 'K2', path: 'plugins/installed.json', kind: 'file' },
  { id: 'plugins/managed/kimi-webbridge', family: 'K2', path: 'plugins/managed/kimi-webbridge', kind: 'dir' },

  { id: 'locks/', family: 'K3', path: 'locks', kind: 'dir', secret: true, modeFloor: 0o700 },
  { id: 'sessions/', family: 'K3', path: 'sessions', kind: 'dir' },
  { id: 'session_index.jsonl', family: 'K3', path: 'session_index.jsonl', kind: 'file' },
  { id: 'workspace-trust/', family: 'K3', path: 'workspace-trust', kind: 'dir' },
  { id: 'telemetry/', family: 'K3', path: 'telemetry', kind: 'dir' },
  { id: 'logs/kimi-code.log', family: 'K3', path: 'logs/kimi-code.log', kind: 'file' },
  { id: 'file-history/', family: 'K3', path: 'file-history', kind: 'dir' },
  { id: 'user-history/', family: 'K3', path: 'user-history', kind: 'dir' },
  { id: 'cache/', family: 'K3', path: 'cache', kind: 'dir' },
  { id: 'search-index/', family: 'K3', path: 'search-index', kind: 'dir' },

  { id: 'bin/kimi', family: 'K4', path: 'bin/kimi', kind: 'file' },
  { id: 'bin/fd', family: 'K4', path: 'bin/fd', kind: 'file' },
  { id: 'updates/', family: 'K4', path: 'updates', kind: 'dir' },
  { id: 'server/', family: 'K4', path: 'server', kind: 'dir' },
  { id: 'server.token', family: 'K4', path: 'server.token', kind: 'file', secret: true, modeFloor: 0o600 },
  { id: 'device_id', family: 'K4', path: 'device_id', kind: 'file' },
  { id: 'region', family: 'K4', path: 'region', kind: 'file' },
  { id: 'credentials/', family: 'K4', path: 'credentials', kind: 'dir', secret: true, modeFloor: 0o700 },
  { id: 'oauth/', family: 'K4', path: 'oauth', kind: 'dir', secret: true, modeFloor: 0o700, modeCeiling: 0o755 },

  { id: 'workspaces.json', family: 'K5', path: 'workspaces.json', kind: 'file' },
  { id: 'tui.toml.bak', family: 'K5', path: 'tui.toml.bak', kind: 'file' },
  { id: 'rc-qrcode.png', family: 'K5', path: 'rc-qrcode.png', kind: 'file' },
];

/** Enumerable dirs: counted-live (names not gated) or declared-child-name. */
const ENUMERABLE = [
  { dir: 'agents/secondary', childCount: 18 },
  { dir: 'skills', childCount: 7 },
  { dir: 'plugins', children: ['installed.json', 'managed'] },
  { dir: 'plugins/managed', children: ['kimi-webbridge'] },
];

const FAMILIES = ['K1', 'K2', 'K3', 'K4', 'K5'];
/** The frozen K-block counts, reported for callers comparing rounds 19/20/35/40/42. */
const FROZEN = { K1: 4, K2: 27, K3: 10, K4: 9, K5: 3 };

const FINDING_KINDS = ['MEMBER_MISSING', 'UNLISTED', 'SHAPE_DRIFT'];
const FAIL_CLOSED_KINDS = ['KIMI_ROOT_MISSING'];

const USAGE = `usage: node scripts/kimi-census.mjs [verify] [options]
       node scripts/kimi-census.mjs --selftest
       node scripts/kimi-census.mjs -h|--help
contract id: ${CONTRACT}

verbs
  verify           the default verb: census ~/.kimi-code against the frozen
                   K1–K5 member rules (53 members) and print one verdict line

options
  --root DIR       installation root to census (default: ~/.kimi-code)
  --json           one machine-readable object on stdout
  --selftest       run the hermetic fixture suite (touches no live tree)
  -h, --help       this text

root enumeration is the frozen rule, not a flag: with K5 declared, K1-K5
exhausts the root, so an undeclared root child is UNLISTED (exit 1). The
config.toml.*.bak drift-chain generations are exempt — the K1 chain member
accounts for them as one member, never gated by name. There is no --root-enum.

findings: ${FINDING_KINDS.join(' ')}
secrecy : locks/ mcp.json, credentials/ oauth/ server.token are stat-only (kind+mode pins, plus uid for dirs; never read)
exit map: 0 clean · 1 drift · 2 fail-closed · 64 usage
`;

/* ------------------------------------------------------------------ helpers */

/**
 * Kind of an inode WITHOUT following a symlink. `absent` covers every stat
 * failure (ENOENT and EACCES alike): a member we cannot stat is not a member we
 * can vouch for, and callers distinguish root-level unreadability separately.
 */
function lstatKind(p) {
  try {
    const s = lstatSync(p);
    if (s.isDirectory()) return 'dir';
    if (s.isFile()) return 'file';
    if (s.isSymbolicLink()) return 'symlink';
    if (s.isFIFO()) return 'fifo';
    if (s.isSocket()) return 'socket';
    return 'other';
  } catch { return 'absent'; }
}

/** lstat metadata for secret shapes only; never follows links or opens content. */
function statInfo(p) {
  try { return lstatSync(p); } catch { return null; }
}

/** Non-hidden child names of a dir; `null` when it cannot be listed. */
function listChildren(p) {
  try { return readdirSync(p).filter((n) => !n.startsWith('.')).sort(); } catch { return null; }
}

/** Non-directory inode kinds — the secret-file kind pin (see the header). */
function isLeaf(kind) { return kind !== 'absent' && kind !== 'dir'; }

const oct = (n) => `0${n.toString(8).padStart(3, '0')}`;

/**
 * Root-level names the frozen member set declares. Derived from MEMBERS so the
 * rule lives in one place; the chain contributes its literal prefix because the
 * generation names are matched by `RE_CHAIN`, not listed.
 */
function declaredRootNames() {
  const names = new Set();
  for (const m of MEMBERS) {
    if (m.kind === 'chain') { names.add('config.toml'); continue; }
    names.add(m.path.split('/')[0]);
  }
  return names;
}

/* ------------------------------------------------------------------- verify */

/**
 * The one derivation. Read-only: lstat on members, readdir on enumerable dirs
 * and on the root (to prove it is readable, to count the drift chain, and to
 * enumerate the root against the K1–K5 declared set — the round-20 rule).
 * Returns `{ ok: true, ... }` or the fail-closed arm `{ ok: false, kind, detail }`.
 */
function verify(root, runningUid = process.getuid()) {
  const findings = [];
  const infos = [];
  const err = (kind, id, detail) => findings.push({ severity: 'error', kind, id, detail });

  const rootKind = lstatKind(root);
  if (rootKind === 'absent') return { ok: false, kind: 'KIMI_ROOT_MISSING', detail: `--root ${root} is absent` };
  if (rootKind !== 'dir') return { ok: false, kind: 'KIMI_ROOT_MISSING', detail: `--root ${root} is a ${rootKind}, not a directory` };
  let rootChildren;
  try { rootChildren = readdirSync(root); } catch (e) {
    return { ok: false, kind: 'KIMI_ROOT_MISSING', detail: `--root ${root} is unreadable (${e && e.code})` };
  }

  const famTotals = Object.fromEntries(FAMILIES.map((f) => [f, { members: 0, checked: 0 }]));
  const rows = [];
  let chainCount = 0;

  for (const m of MEMBERS) {
    const fam = famTotals[m.family];
    const abs = join(root, m.path);

    if (m.kind === 'chain') {
      const gens = rootChildren.filter((n) => RE_CHAIN.test(n)).sort();
      chainCount = gens.length;
      const present = gens.length > 0;
      fam.members += present ? 1 : 0;
      fam.checked += present ? 1 : 0;
      if (!present) err('MEMBER_MISSING', m.id, `${m.path} has no generation under ${root}`);
      rows.push({ id: m.id, family: m.family, path: m.path, kind: m.kind, declared: 1, live: present ? 1 : 0, generations: gens.length, state: present ? 'ok' : 'missing' });
      infos.push({ kind: 'CHAIN', id: m.id, detail: `generations=${gens.length} (reported as info, never gated)` });
      continue;
    }

    const kind = lstatKind(abs);
    let live = 1;
    let checked = 1;
    let state = 'ok';

    if (kind === 'absent') {
      state = 'missing'; live = 0; checked = 0;
      err('MEMBER_MISSING', m.id, `${m.path} is absent under ${root}`);
    } else if (m.counted !== undefined) {
      if (kind !== 'dir') {
        state = 'kind'; live = 0; checked = 0;
        err('MEMBER_MISSING', m.id, `${m.path} is declared dir, live ${kind}`);
      } else {
        const kids = listChildren(abs) ?? [];
        live = kids.length;
        checked = kids.length;
        if (kids.length !== m.counted) {
          state = 'count';
          const delta = kids.length > m.counted
            ? `an undeclared child appeared`
            : `a declared child is gone`;
          err(kids.length > m.counted ? 'UNLISTED' : 'MEMBER_MISSING', m.id,
            `${m.path} has ${kids.length} children, ${m.counted} declared — ${delta} (names not gated)`);
        }
        infos.push({ kind: 'COUNT', id: m.id, detail: `children=${kids.length} (counted live, names not gated)` });
      }
    } else {
      const expectedOk = m.secret
        ? (m.kind === 'dir' ? kind === 'dir' : isLeaf(kind))
        : kind === m.kind;
      if (!expectedOk) {
        state = 'kind'; live = 0; checked = 0;
        const detail = `${m.path} is declared ${m.kind}, live ${kind}`;
        if (m.secret) err('SHAPE_DRIFT', m.id, `${detail} — the shape pin requires ${m.kind === 'dir' ? 'a directory' : 'a non-directory leaf'}`);
        else err('MEMBER_MISSING', m.id, detail);
      }
    }

    // Secret shape pins: kind (above), mode, and directory owner. Stat only.
    if (m.secret && kind !== 'absent') {
      const stat = statInfo(abs);
      const mode = stat === null ? null : stat.mode & 0o777;
      const kindOk = m.kind === 'dir' ? kind === 'dir' : isLeaf(kind);
      const lacksFloor = mode === null || (mode & m.modeFloor) !== m.modeFloor;
      const modeCeiling = m.modeCeiling ?? m.modeFloor;
      const beyondCeiling = m.kind === 'dir' && mode !== null
        && (mode & (0o777 ^ modeCeiling)) !== 0;
      const wrongOwner = kindOk && m.kind === 'dir' && stat !== null && stat.uid !== runningUid;
      if (kindOk && (lacksFloor || beyondCeiling || wrongOwner)) {
        state = state === 'ok' ? 'shape' : state;
        if (checked === 1) checked = 0;
        if (lacksFloor) {
          err('SHAPE_DRIFT', m.id, `${m.path} mode ${mode === null ? 'unknown' : oct(mode)} lacks the ${oct(m.modeFloor)} floor`);
        } else if (beyondCeiling) {
          err('SHAPE_DRIFT', m.id, `${m.path} mode ${oct(mode)} has permissions beyond the ${oct(modeCeiling)} secret-directory limit`);
        }
        if (wrongOwner) err('SHAPE_DRIFT', m.id, `${m.path} owner does not match the running uid`);
      }
      rows.push({ id: m.id, family: m.family, path: m.path, kind: kindOk ? 'leaf-or-dir' : kind, declared: 1, live, checked, secret: true, modeFloor: oct(m.modeFloor), mode: mode === null ? null : oct(mode), state });
      fam.members += live; fam.checked += checked;
      continue;
    }

    rows.push({ id: m.id, family: m.family, path: m.path, kind, declared: m.counted ?? 1, live, checked, state });
    fam.members += live;
    fam.checked += checked;
  }

  // Enumeration, pass 2: declared-child-name dirs. A declared child that is
  // itself a member path is owned by the member pass — never double-reported.
  const memberPaths = new Set(MEMBERS.filter((m) => m.kind !== 'chain').map((m) => m.path));
  const enumerables = [];
  for (const e of ENUMERABLE) {
    if (e.children === undefined) continue;
    const abs = join(root, e.dir);
    const kids = lstatKind(abs) === 'dir' ? (listChildren(abs) ?? []) : null;
    enumerables.push({ dir: e.dir, declared: e.children, live: kids });
    if (kids === null) continue;
    for (const n of kids) {
      if (!e.children.includes(n)) {
        err('UNLISTED', `${e.dir}/${n}`, `${e.dir}/${n} is not a declared child of ${e.dir}/ (declared: ${e.children.join(', ')})`);
      }
    }
    for (const n of e.children) {
      const rel = `${e.dir}/${n}`;
      if (!kids.includes(n) && !memberPaths.has(rel)) {
        err('MEMBER_MISSING', rel, `${rel} is absent from ${e.dir}/ (declared child)`);
      }
    }
  }

  // Root enumeration (round 20): K1–K5 exhausts the root, so the root is an
  // enumerable dir and an undeclared child of it is UNLISTED. Drift-chain
  // generations are exempt — the K1 chain member above already accounts for
  // them as ONE member and gates them by presence, never by name — and nothing
  // else is exempt: this pass creates no file anywhere.
  const declared = declaredRootNames();
  const strays = rootChildren.filter((n) => !declared.has(n) && !RE_CHAIN.test(n)).sort();
  for (const n of strays) {
    err('UNLISTED', n, `${n} sits at the root and is not declared by the frozen K1–K5 set`);
  }
  infos.push({
    kind: 'ROOT_ENUM', id: '-',
    detail: `root children=${rootChildren.length} declared=${declared.size} chain=${chainCount} strays=${strays.length} (root enumerated against K1–K5; drift-chain generations exempt)`,
  });

  const totals = {
    members: FAMILIES.reduce((n, f) => n + famTotals[f].members, 0),
    checked: FAMILIES.reduce((n, f) => n + famTotals[f].checked, 0),
    errors: findings.length,
    info: infos.length,
    chain: chainCount,
    frozen: FROZEN,
    families: famTotals,
    rootEnum: { children: rootChildren.length, declared: declared.size, strays: strays.length },
  };
  return { ok: true, findings, infos, rows, enumerables, strays, totals };
}

/* ------------------------------------------------------------------ render */

function renderVerdict(verdict, findings, totals) {
  if (verdict === 'CLEAN') {
    return `KIMI_CENSUS: CLEAN (members=${totals.members} checked=${totals.checked} chain=${totals.chain} info=${totals.info})`;
  }
  const parts = findings.slice(0, 6).map((f) => `${f.kind} ${f.id}`);
  if (findings.length > parts.length) parts.push(`+${findings.length - parts.length} more`);
  return `KIMI_CENSUS: DRIFT (${parts.join('; ')})`;
}

function failClosed(opts, token, detail, started) {
  if (opts.json) {
    process.stdout.write(`${JSON.stringify({
      schema: CONTRACT, contract: CONTRACT, mode: 'verify', root: opts.root,
      options: { json: true, rootEnumeration: 'always-on (frozen)' },
      findings: [{ severity: 'error', kind: token, id: '-', detail }],
      totals: { members: 0, checked: 0, errors: 1, info: 0, chain: 0 },
      verdict: 'FAIL-CLOSED', fatal: { kind: token, detail }, durationMs: Date.now() - started,
    }, null, 2)}\n`);
  } else {
    process.stdout.write(`KIMI_CENSUS: FAIL-CLOSED (${token} ${detail})\n`);
  }
  process.stderr.write(`kimi-census: ${token} ${detail}\n`);
  return 2;
}

function runVerify(opts, started) {
  const v = verify(opts.root);
  if (!v.ok) return failClosed(opts, v.kind, v.detail, started);

  const verdict = v.findings.length === 0 ? 'CLEAN' : 'DRIFT';
  if (opts.json) {
    process.stdout.write(`${JSON.stringify({
      schema: CONTRACT, contract: CONTRACT, mode: 'verify', root: opts.root,
      options: { json: true, rootEnumeration: 'always-on (frozen)' },
      members: v.rows, enumerables: v.enumerables, rootStrays: v.strays,
      findings: v.findings, infos: v.infos, totals: v.totals, verdict,
      durationMs: Date.now() - started,
    }, null, 2)}\n`);
  } else {
    const lines = [`KIMI_ROOT: ${opts.root}`];
    for (const f of FAMILIES) {
      lines.push(`FAMILY ${f}  members=${v.totals.families[f].members}  checked=${v.totals.families[f].checked}  frozen=${FROZEN[f]}`);
    }
    for (const i of v.infos) lines.push(`INFO  ${i.kind}  ${i.id}  ${i.detail}`);
    for (const f of v.findings) lines.push(`CENSUS  ${f.severity}  ${f.kind}  ${f.id}  ${f.detail}`);
    lines.push(`TOTALS: members=${v.totals.members} checked=${v.totals.checked} errors=${v.totals.errors} info=${v.totals.info} chain=${v.totals.chain}`);
    lines.push(renderVerdict(verdict, v.findings, v.totals));
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  return verdict === 'CLEAN' ? 0 : 1;
}

/* ---------------------------------------------------------------- selftest */

const FIXTURE_CHAIN = 3;

/** Build a fixture tree holding all 53 members, shape-clean. */
function fixtureTree(root, { chain = FIXTURE_CHAIN } = {}) {
  for (const m of MEMBERS) {
    if (m.kind === 'chain') continue;
    const abs = join(root, m.path);
    if (m.kind === 'dir') {
      mkdirSync(abs, { recursive: true });
      chmodSync(abs, m.modeCeiling ?? m.modeFloor ?? 0o755);
    } else {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, 'fixture\n');
      chmodSync(abs, m.modeFloor ?? 0o644);
    }
  }
  for (let i = 0; i < chain; i += 1) {
    writeFileSync(join(root, `config.toml.fixture-${String(i).padStart(2, '0')}.bak`), 'x\n');
  }
  for (const e of ENUMERABLE) {
    if (e.childCount === undefined) continue;
    for (let i = 0; i < e.childCount; i += 1) {
      const name = `${e.dir.split('/').pop()}-lane-${String(i).padStart(2, '0')}`;
      if (e.dir === 'skills') mkdirSync(join(root, e.dir, name));
      else writeFileSync(join(root, e.dir, `${name}.md`), 'x\n');
    }
  }
}

function runGate(args, timeout = 30_000) {
  const r = spawnSync(process.execPath, [TOOL_FILE, ...args], { encoding: 'utf8', timeout });
  return { status: r.status, signal: r.signal, stdout: r.stdout ?? '', stderr: r.stderr ?? '', error: r.error };
}

function lastLine(run) {
  const lines = run.stdout.trim().split('\n');
  return lines.length > 0 ? lines[lines.length - 1] : '';
}

function kinds(run) {
  return run.stdout.split('\n').filter((l) => l.startsWith('CENSUS  ')).map((l) => l.trim().split(/\s+/)[2]);
}

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-kimi-census-selftest-'));
  const results = [];
  const observed = new Set();
  const failClosedSeen = new Set();
  let passed = 0;

  const check = (label, fn) => {
    let r;
    try { r = fn(); } catch (err) { r = { ok: false, detail: `threw ${err && err.message}` }; }
    for (const k of r.kinds ?? []) observed.add(k);
    for (const k of r.failClosed ?? []) failClosedSeen.add(k);
    results.push({ label, ok: Boolean(r.ok), detail: r.detail ?? '' });
  };
  const mk = (name) => { const p = join(tmp, name); mkdirSync(p, { recursive: true }); fixtureTree(p); return p; };
  const clean = (run, needle, kindList) => {
    const k = kinds(run);
    return {
      ok: run.status === 0 && lastLine(run).includes(needle)
        && (kindList === undefined || JSON.stringify(k) === JSON.stringify(kindList)),
      detail: `exit=${run.status} last=${lastLine(run).slice(0, 100)} kinds=[${k.join(',')}]`,
      kinds: k,
    };
  };
  const drift = (run, kind, members) => {
    const k = kinds(run);
    return {
      ok: run.status === 1 && lastLine(run).startsWith('KIMI_CENSUS: DRIFT')
        && k.includes(kind) && (members === undefined || lastLine(run).includes(`members=${members}`) || run.stdout.includes(`members=${members}`)),
      detail: `exit=${run.status} last=${lastLine(run).slice(0, 100)} kinds=[${k.join(',')}]`,
      kinds: k,
    };
  };

  try {
    // 1. green baseline — the frozen 53, exact verdict line
    const green = mk('green');
    check('green fixture → CLEAN exit 0, members=53 checked=53 chain=3 info=4', () => {
      const r = runGate(['--root', green]);
      return {
        ok: r.status === 0 && kinds(r).length === 0
          && lastLine(r) === 'KIMI_CENSUS: CLEAN (members=53 checked=53 chain=3 info=4)',
        detail: `exit=${r.status} last=${lastLine(r)}`,
      };
    });

    // 2. per-family frozen counts: round-42 K3 adds locks/ to the prior 9
    check('--json families read 4/27/10/9/3 and members=53', () => {
      const r = runGate(['--root', green, '--json']);
      const j = JSON.parse(r.stdout);
      const f = j.totals.families;
      const ok = j.schema === CONTRACT && j.verdict === 'CLEAN' && j.totals.members === 53
        && f.K1.members === 4 && f.K2.members === 27 && f.K3.members === 10 && f.K4.members === 9
        && f.K5.members === 3 && f.K5.checked === 3
        && j.members.length === 30
        && j.totals.frozen.K1 === 4 && j.totals.frozen.K2 === 27 && j.totals.frozen.K3 === 10
        && j.totals.frozen.K4 === 9 && j.totals.frozen.K5 === 3
        && j.totals.rootEnum.declared === 27 && j.totals.rootEnum.strays === 0 && j.rootStrays.length === 0;
      return { ok, detail: `members=${j.totals.members} K1=${f.K1.members} K2=${f.K2.members} K3=${f.K3.members} K4=${f.K4.members} K5=${f.K5.members} rows=${j.members.length} strays=${j.totals.rootEnum.strays}` };
    });

    check('--json totals agree with the text verdict', () => {
      const j = JSON.parse(runGate(['--root', green, '--json']).stdout);
      const t = runGate(['--root', green]);
      return {
        ok: j.totals.members === 53 && lastLine(t).includes(`members=${j.totals.members}`)
          && lastLine(t).includes(`checked=${j.totals.checked}`) && j.verdict === 'CLEAN',
        detail: `json=${j.totals.members}/${j.totals.checked} text=${lastLine(t).slice(0, 70)}`,
      };
    });

    // 3. MEMBER_MISSING arms
    const drop = mk('drop-file');
    rmSync(join(drop, 'bin/fd'));
    check('MEMBER_MISSING: a deleted member file (bin/fd)', () => {
      const r = runGate(['--root', drop]);
      return drift(r, 'MEMBER_MISSING', 52);
    });

    const kindFlip = mk('kind-flip');
    rmSync(join(kindFlip, 'session_index.jsonl'));
    mkdirSync(join(kindFlip, 'session_index.jsonl'));
    check('MEMBER_MISSING: a member with the wrong kind (file → dir)', () => {
      const r = runGate(['--root', kindFlip]);
      return { ...drift(r, 'MEMBER_MISSING'), ok: drift(r, 'MEMBER_MISSING').ok && r.stdout.includes('declared file, live dir') };
    });

    const dropDir = mk('drop-dir');
    rmSync(join(dropDir, 'telemetry'), { recursive: true });
    check('MEMBER_MISSING: a deleted member directory (telemetry/)', () => drift(runGate(['--root', dropDir]), 'MEMBER_MISSING', 52));

    const dropBucket = mk('drop-bucket');
    rmSync(join(dropBucket, 'skills', 'skills-lane-04'), { recursive: true });
    check('MEMBER_MISSING: an enumerable dir lost a declared child (skills/ 6 of 7)', () => {
      const r = runGate(['--root', dropBucket]);
      return { ...drift(r, 'MEMBER_MISSING', 52), ok: drift(r, 'MEMBER_MISSING', 52).ok && r.stdout.includes('6 children, 7 declared') };
    });
    const extraSkill = mk('extra-skill');
    mkdirSync(join(extraSkill, 'skills', 'skills-lane-07'));
    check('UNLISTED: an 8th child under skills/', () => {
      const r = runGate(['--root', extraSkill]);
      return {
        ...drift(r, 'UNLISTED', 54),
        ok: drift(r, 'UNLISTED', 54).ok && r.stdout.includes('skills/') && r.stdout.includes('8 children, 7 declared'),
      };
    });

    const noChain = mk('no-chain');
    for (const n of readdirSync(noChain)) if (RE_CHAIN.test(n)) rmSync(join(noChain, n));
    check('MEMBER_MISSING: the drift chain vanished entirely (presence is gated)', () => drift(runGate(['--root', noChain]), 'MEMBER_MISSING', 52));

    // 4. UNLISTED arms
    const newLane = mk('new-lane');
    writeFileSync(join(newLane, 'agents/secondary/sec-fast-tp9-ds-flash.md'), 'x\n');
    check('UNLISTED: a 19th lane file under agents/secondary/', () => {
      const r = runGate(['--root', newLane]);
      return { ...drift(r, 'UNLISTED', 54), ok: drift(r, 'UNLISTED', 54).ok && r.stdout.includes('19 children, 18 declared') };
    });

    const newPlugin = mk('new-plugin');
    writeFileSync(join(newPlugin, 'plugins/rogue.json'), '{}\n');
    check('UNLISTED: an undeclared child directly under plugins/', () => {
      const r = runGate(['--root', newPlugin]);
      return { ...drift(r, 'UNLISTED'), ok: drift(r, 'UNLISTED').ok && r.stdout.includes('plugins/rogue.json') };
    });

    const newManaged = mk('new-managed');
    mkdirSync(join(newManaged, 'plugins/managed/other-plugin'));
    check('UNLISTED: an undeclared child under plugins/managed/', () => {
      const r = runGate(['--root', newManaged]);
      return { ...drift(r, 'UNLISTED'), ok: drift(r, 'UNLISTED').ok && r.stdout.includes('plugins/managed/other-plugin') };
    });

    const dropManaged = mk('drop-managed');
    rmSync(join(dropManaged, 'plugins/managed/kimi-webbridge'), { recursive: true });
    check('MEMBER_MISSING: the managed webbridge tree removed', () => drift(runGate(['--root', dropManaged]), 'MEMBER_MISSING'));

    // 5. SHAPE_DRIFT arms
    const looseDir = mk('loose-dir');
    chmodSync(join(looseDir, 'credentials'), 0o500);
    check('SHAPE_DRIFT: credentials/ below its 0700 floor', () => {
      const r = runGate(['--root', looseDir]);
      return { ...drift(r, 'SHAPE_DRIFT'), ok: drift(r, 'SHAPE_DRIFT').ok && r.stdout.includes('mode 0500 lacks the 0700 floor') };
    });

    const looseLocks = mk('locks-mode-floor');
    chmodSync(join(looseLocks, 'locks'), 0o500);
    check('SHAPE_DRIFT: locks/ below its 0700 floor', () => {
      const r = runGate(['--root', looseLocks]);
      return { ...drift(r, 'SHAPE_DRIFT'), ok: drift(r, 'SHAPE_DRIFT').ok && r.stdout.includes('locks mode 0500 lacks the 0700 floor') };
    });
    const overpermissiveLocks = mk('locks-mode-overpermissive');
    chmodSync(join(overpermissiveLocks, 'locks'), 0o777);
    check('SHAPE_DRIFT: locks/ rejects group and other bits beyond its 0700 floor', () => {
      const r = runGate(['--root', overpermissiveLocks]);
      return {
        ...drift(r, 'SHAPE_DRIFT'),
        ok: drift(r, 'SHAPE_DRIFT').ok
          && r.stdout.includes('locks mode 0777 has permissions beyond the 0700 secret-directory limit'),
      };
    });

    check('SHAPE_DRIFT: locks/ owner must match the running uid', () => {
      const r = verify(green, process.getuid() ^ 1);
      const ownerFinding = r.findings.find((finding) => finding.id === 'locks/' && finding.kind === 'SHAPE_DRIFT');
      return {
        ok: ownerFinding !== undefined && ownerFinding.detail.includes('owner does not match the running uid'),
        detail: `locksFinding=${JSON.stringify(ownerFinding)}`,
      };
    });

    const looseFile = mk('loose-file');
    chmodSync(join(looseFile, 'server.token'), 0o400);
    check('SHAPE_DRIFT: server.token below its 0600 floor (checked counts the failure)', () => {
      const r = runGate(['--root', looseFile]);
      return { ...drift(r, 'SHAPE_DRIFT'), ok: drift(r, 'SHAPE_DRIFT').ok && r.stdout.includes('mode 0400 lacks the 0600 floor') && r.stdout.includes('checked=52') };
    });

    const secretKind = mk('secret-kind');
    rmSync(join(secretKind, 'credentials'), { recursive: true });
    writeFileSync(join(secretKind, 'credentials'), 'not a dir\n');
    check('SHAPE_DRIFT: credentials/ replaced by a file (kind pin)', () => {
      const r = runGate(['--root', secretKind]);
      return { ...drift(r, 'SHAPE_DRIFT'), ok: drift(r, 'SHAPE_DRIFT').ok && r.stdout.includes('a directory') };
    });

    const tokenDir = mk('token-dir');
    rmSync(join(tokenDir, 'server.token'));
    mkdirSync(join(tokenDir, 'server.token'));
    check('SHAPE_DRIFT: server.token replaced by a directory (leaf pin)', () => {
      const r = runGate(['--root', tokenDir]);
      return { ...drift(r, 'SHAPE_DRIFT'), ok: drift(r, 'SHAPE_DRIFT').ok && r.stdout.includes('non-directory leaf') };
    });

    // 6. secrecy: the gate must stat and never read
    check('secrecy: fixtures are shape-clean with a 0600 leaf token (mode floor passes)', () => {
      const r = runGate(['--root', green]);
      return clean(r, 'KIMI_CENSUS: CLEAN');
    });

    const fifo = mk('secret-fifo');
    rmSync(join(fifo, 'server.token'));
    const mkfifo = spawnSync('mkfifo', ['-m', '600', join(fifo, 'server.token')], { encoding: 'utf8' });
    check('secrecy: server.token is a FIFO → still CLEAN, no read (would block forever)', () => {
      if (mkfifo.status !== 0) return { ok: false, detail: `mkfifo unavailable (status=${mkfifo.status} ${mkfifo.error?.code ?? ''}) — the anti-read arm cannot be built here` };
      const r = runGate(['--root', fifo], 10_000);
      return {
        ok: r.status === 0 && lastLine(r).startsWith('KIMI_CENSUS: CLEAN') && r.signal === null,
        detail: `exit=${r.status} signal=${r.signal} last=${lastLine(r).slice(0, 70)}`,
      };
    });

    const dangling = mk('secret-symlink');
    rmSync(join(dangling, 'server.token'));
    symlinkSync('/nonexistent-secret-target', join(dangling, 'server.token'));
    check('secrecy: a dangling symlink token is never followed (lstat-only → CLEAN)', () => {
      const r = runGate(['--root', dangling]);
      return clean(r, 'KIMI_CENSUS: CLEAN');
    });

    const canary = mk('secret-redact');
    const canaryFile = 'canary-token.json';
    writeFileSync(join(canary, 'credentials', canaryFile), '{}\n', { mode: 0o600 });
    check('secrecy: a canary inside credentials/ is never listed (no readdir, no read)', () => {
      const r = runGate(['--root', canary, '--json']);
      const leak = r.stdout.includes(canaryFile) || r.stderr.includes(canaryFile);
      return {
        ok: r.status === 0 && !leak && lstatKind(join(canary, 'credentials', canaryFile)) === 'file',
        detail: `exit=${r.status} canary-leak=${leak} (fixture name must not contain the needle: root=${canary})`,
      };
    });

    // 7. info arms never fail the gate
    const moreChain = mk('more-chain');
    for (let i = 0; i < 3; i += 1) writeFileSync(join(moreChain, `config.toml.extra-${i}.bak`), 'x\n');
    check('info: a growing drift chain is reported (chain=6) and never gated → CLEAN', () => {
      const r = runGate(['--root', moreChain]);
      return { ...clean(r, 'chain=6 info=4'), ok: clean(r, 'chain=6 info=4').ok && r.stdout.includes('generations=6') };
    });

    check('root enum: drift-chain generations are never double-reported as root strays', () => {
      const r = runGate(['--root', moreChain, '--json']);
      const j = JSON.parse(r.stdout);
      const chainNamed = j.rootStrays.some((n) => n.endsWith('.bak'));
      return {
        ok: r.status === 0 && j.verdict === 'CLEAN' && j.totals.chain === 6
          && j.totals.members === 53 && j.totals.rootEnum.strays === 0 && !chainNamed
          && j.totals.families.K1.members === 4,
        detail: `exit=${r.status} chain=${j.totals.chain} members=${j.totals.members} strays=${j.totals.rootEnum.strays} rootStrays=[${j.rootStrays.join(',')}] K1=${j.totals.families.K1.members}`,
      };
    });
    const presentLocks = mk('root-locks-present');
    mkdirSync(join(presentLocks, 'locks', 'sessions'));
    check('K3 locks/ present => CLEAN and counted as one declared root directory', () => {
      const r = runGate(['--root', presentLocks]);
      const j = JSON.parse(runGate(['--root', presentLocks, '--json']).stdout);
      const member = j.members.find((m) => m.id === 'locks/');
      return {
        ok: r.status === 0 && lastLine(r).includes('members=53 checked=53')
          && j.verdict === 'CLEAN' && member?.kind === 'leaf-or-dir' && member.state === 'ok'
          && member.live === 1 && member.modeFloor === '0700' && member.mode === '0700'
          && j.totals.families.K3.members === 10
          && j.totals.rootEnum.declared === 27 && j.rootStrays.length === 0,
        detail: `exit=${r.status} member=${JSON.stringify(member)} declared=${j.totals.rootEnum.declared}`,
      };
    });

    const absentLocks = mk('root-locks-absent');
    rmSync(join(absentLocks, 'locks'), { recursive: true });
    check('MEMBER_MISSING: absent K3 locks/ is named, not treated as an unlisted root child', () => {
      const r = runGate(['--root', absentLocks]);
      return {
        ok: r.status === 1 && kinds(r).includes('MEMBER_MISSING')
          && r.stdout.includes('locks is absent under') && r.stdout.includes('members=52 checked=52')
          && !kinds(r).includes('UNLISTED'),
        detail: `exit=${r.status} kinds=[${kinds(r).join(',')}] last=${lastLine(r)}`,
        kinds: kinds(r),
      };
    });
    const fileLocks = mk('root-locks-file');
    rmSync(join(fileLocks, 'locks'), { recursive: true });
    writeFileSync(join(fileLocks, 'locks'), 'not a directory\n');
    check('SHAPE_DRIFT: K3 locks/ replaced by a file is named', () => {
      const r = runGate(['--root', fileLocks]);
      const d = drift(r, 'SHAPE_DRIFT');
      return {
        ...d,
        ok: d.ok && r.stdout.includes('locks is declared dir, live file')
          && r.stdout.includes('shape pin requires a directory'),
      };
    });


    // 7b. the round-20 root enumeration arm — the frozen rule, no flag
    const stray = mk('root-stray');
    writeFileSync(join(stray, 'notes.txt'), 'x\n');
    check('UNLISTED: a planted undeclared root child → exit 1, and it is not counted as a member', () => {
      const r = runGate(['--root', stray]);
      const j = JSON.parse(runGate(['--root', stray, '--json']).stdout);
      return {
        ok: r.status === 1 && kinds(r).includes('UNLISTED') && r.stdout.includes('notes.txt sits at the root')
          && r.stdout.includes('not declared by the frozen K1–K5 set')
          && j.rootStrays.length === 1 && j.rootStrays[0] === 'notes.txt'
          && j.totals.members === 53 && j.totals.rootEnum.strays === 1,
        detail: `exit=${r.status} kinds=[${kinds(r).join(',')}] strays=${JSON.stringify(j.rootStrays)} members=${j.totals.members}`,
        kinds: kinds(r),
      };
    });
    const presentMcp = mk('root-mcp-json-present');
    check('K1 mcp.json present => CLEAN, shape-only member (mode floor 0400)', () => {
      const r = runGate(['--root', presentMcp]);
      const j = JSON.parse(runGate(['--root', presentMcp, '--json']).stdout);
      const member = j.members.find((m) => m.id === 'mcp.json');
      return {
        ok: r.status === 0 && kinds(r).length === 0 && j.verdict === 'CLEAN'
          && member?.state === 'ok' && member.kind === 'leaf-or-dir' && member.modeFloor === '0400',
        detail: `exit=${r.status} verdict=${j.verdict} member=${JSON.stringify(member)}`,
      };
    });
    const absentMcp = mk('root-mcp-json-absent');
    rmSync(join(absentMcp, 'mcp.json'));
    check('MEMBER_MISSING: absent root mcp.json is a declared K1 member', () => {
      const r = runGate(['--root', absentMcp]);
      return {
        ok: r.status === 1 && kinds(r).includes('MEMBER_MISSING')
          && r.stdout.includes('mcp.json is absent') && r.stdout.includes('members=52 checked=52'),
        detail: `exit=${r.status} kinds=[${kinds(r).join(',')}] last=${lastLine(r)}`,
        kinds: kinds(r),
      };
    });
    const fifoMcp = mk('root-mcp-json-fifo');
    rmSync(join(fifoMcp, 'mcp.json'));
    const mkfifoMcp = spawnSync('mkfifo', ['-m', '400', join(fifoMcp, 'mcp.json')], { encoding: 'utf8' });
    check('K1 mcp.json FIFO => CLEAN without opening it (a read would block)', () => {
      if (mkfifoMcp.status !== 0) return { ok: false, detail: `mkfifo unavailable (status=${mkfifoMcp.status} ${mkfifoMcp.error?.code ?? ''}) — the anti-read arm cannot be built here` };
      const r = runGate(['--root', fifoMcp], 10_000);
      return {
        ok: r.status === 0 && r.signal === null && r.error === undefined
          && lastLine(r).startsWith('KIMI_CENSUS: CLEAN') && kinds(r).length === 0,
        detail: `exit=${r.status} signal=${r.signal} error=${r.error?.code ?? ''} last=${lastLine(r).slice(0, 70)}`,
      };
    });
    const dirMcp = mk('root-mcp-json-dir');
    rmSync(join(dirMcp, 'mcp.json'));
    mkdirSync(join(dirMcp, 'mcp.json'));
    check('SHAPE_DRIFT: root mcp.json replaced by a directory (non-directory leaf pin)', () => {
      const r = runGate(['--root', dirMcp]);
      const d = drift(r, 'SHAPE_DRIFT');
      return {
        ...d,
        ok: d.ok && r.stdout.includes('mcp.json is declared file, live dir')
          && r.stdout.includes('non-directory leaf'),
      };
    });

    check('UNLISTED: a hidden root child is gated too (the root arm reads the raw listing)', () => {
      const hidden = mk('root-hidden-stray');
      writeFileSync(join(hidden, '.stray'), 'x\n');
      const r = runGate(['--root', hidden]);
      return {
        ok: r.status === 1 && kinds(r).includes('UNLISTED') && r.stdout.includes('.stray'),
        detail: `exit=${r.status} kinds=[${kinds(r).join(',')}]`,
        kinds: kinds(r),
      };
    });

    check('the removed --root-enum flag is refused — root enumeration has no escape hatch (exit 64)', () => {
      const r = runGate(['--root', green, '--root-enum']);
      return {
        ok: r.status === 64 && r.stderr.includes('unsupported argument: --root-enum') && r.stdout === '',
        detail: `exit=${r.status} stderr=${r.stderr.split('\n')[0].slice(0, 60)}`,
      };
    });

    check('root enum is orthogonal to counted-dir drift (both arms fire on one run)', () => {
      const both = mk('root-and-count');
      writeFileSync(join(both, 'agents/secondary/sec-fast-tp9-ds-flash.md'), 'x\n');
      writeFileSync(join(both, 'scratchpad.txt'), 'x\n');
      const r = runGate(['--root', both]);
      const listed = r.stdout.split('\n').filter((l) => l.startsWith('CENSUS  error  UNLISTED')).map((l) => l.split(/\s+/)[3]);
      return {
        ok: r.status === 1 && listed.includes('scratchpad.txt') && listed.some((x) => x.startsWith('agents/secondary'))
          && r.stdout.includes('19 children, 18 declared') && r.stdout.includes('strays=1'),
        detail: `exit=${r.status} listed=[${listed.join(',')}]`,
        kinds: kinds(r),
      };
    });

    // 7c. K5 — the round-20 root-residue family, file-kind pins
    for (const name of ['workspaces.json', 'tui.toml.bak', 'rc-qrcode.png']) {
      const k5 = mk(`k5-drop-${name}`);
      rmSync(join(k5, name));
      check(`MEMBER_MISSING: the K5 member ${name} removed (53 → 52)`, () => {
        const r = runGate(['--root', k5]);
        return {
          ...drift(r, 'MEMBER_MISSING', 52),
          ok: drift(r, 'MEMBER_MISSING', 52).ok && r.stdout.includes(`${name} is absent under`)
            && !kinds(r).includes('UNLISTED'),
          detail: `exit=${r.status} last=${lastLine(r).slice(0, 90)} kinds=[${kinds(r).join(',')}]`,
          kinds: kinds(r),
        };
      });
    }

    const k5Kind = mk('k5-kind-flip');
    rmSync(join(k5Kind, 'workspaces.json'));
    mkdirSync(join(k5Kind, 'workspaces.json'));
    check('MEMBER_MISSING: workspaces.json declared file, live dir (K5 kind pin)', () => {
      const r = runGate(['--root', k5Kind]);
      return {
        ...drift(r, 'MEMBER_MISSING', 52),
        ok: drift(r, 'MEMBER_MISSING', 52).ok && r.stdout.includes('workspaces.json is declared file, live dir'),
        detail: `exit=${r.status} last=${lastLine(r).slice(0, 90)}`,
        kinds: kinds(r),
      };
    });

    check('K5 is presence + kind only: content changes are never a finding (CLEAN)', () => {
      const edited = mk('k5-content');
      writeFileSync(join(edited, 'workspaces.json'), '{"wd_changed_000000000000":"/tmp/changed"}\n');
      writeFileSync(join(edited, 'rc-qrcode.png'), 'not-a-png-at-all\n');
      const r = runGate(['--root', edited]);
      return { ...clean(r, 'members=53'), detail: `exit=${r.status} last=${lastLine(r).slice(0, 80)}` };
    });

    // 8. fail-closed arm
    check('KIMI_ROOT_MISSING: --root /nonexistent → exit 2, no scored zero', () => {
      const r = runGate(['--root', '/nonexistent']);
      return {
        ok: r.status === 2 && lastLine(r).startsWith('KIMI_CENSUS: FAIL-CLOSED (KIMI_ROOT_MISSING')
          && r.stderr.includes('KIMI_ROOT_MISSING') && !lastLine(r).includes('members='),
        detail: `exit=${r.status} last=${lastLine(r).slice(0, 80)}`,
        failClosed: ['KIMI_ROOT_MISSING'],
      };
    });

    const unreadable = mk('root-unreadable');
    chmodSync(unreadable, 0o000);
    check('KIMI_ROOT_MISSING: an unreadable root → exit 2 (fail-closed, never a zero)', () => {
      const r = runGate(['--root', unreadable]);
      return {
        ok: r.status === 2 && lastLine(r).includes('FAIL-CLOSED (KIMI_ROOT_MISSING') && r.stdout.includes('unreadable'),
        detail: `exit=${r.status} last=${lastLine(r).slice(0, 90)}`,
        failClosed: ['KIMI_ROOT_MISSING'],
      };
    });
    chmodSync(unreadable, 0o700);

    check('--json fail-closed carries the same token and no totals', () => {
      const r = runGate(['--root', '/nonexistent', '--json']);
      const j = JSON.parse(r.stdout);
      return {
        ok: r.status === 2 && j.verdict === 'FAIL-CLOSED' && j.fatal.kind === 'KIMI_ROOT_MISSING' && j.totals.members === 0,
        detail: `exit=${r.status} verdict=${j.verdict} fatal=${j.fatal && j.fatal.kind}`,
        failClosed: ['KIMI_ROOT_MISSING'],
      };
    });

    // 9. usage arms
    check('unknown flag → usage refusal on stderr, exit 64', () => {
      const r = runGate(['--bogus']);
      return { ok: r.status === 64 && r.stderr.includes('usage:') && r.stdout === '', detail: `exit=${r.status} stdout=${JSON.stringify(r.stdout.slice(0, 20))}` };
    });
    check('--root without a value → usage exit 64', () => {
      const r = runGate(['--root']);
      return { ok: r.status === 64 && r.stderr.includes('needs a value'), detail: `exit=${r.status}` };
    });
    check('unknown positional verb → usage exit 64', () => {
      const r = runGate(['census']);
      return { ok: r.status === 64, detail: `exit=${r.status}` };
    });
    check('the explicit `verify` verb is accepted', () => {
      const r = runGate(['verify', '--root', green]);
      return clean(r, 'KIMI_CENSUS: CLEAN');
    });
    check('-h prints usage with the contract id, exit 0', () => {
      const r = runGate(['-h']);
      return { ok: r.status === 0 && r.stdout.includes(`contract id: ${CONTRACT}`), detail: `exit=${r.status}` };
    });

    // 10. hermeticity structure
    check('every fixture root lives under tmpdir() (no live tree in reach)', () => ({
      ok: tmp.startsWith(`${tmpdir()}/`) && !green.startsWith(homedir() + '/.kimi-code'),
      detail: `tmp=${tmp}`,
    }));
    check('the default root is the one the frozen rules name (~/.kimi-code)', () => ({
      ok: DEFAULT_ROOT === join(homedir(), '.kimi-code'),
      detail: `DEFAULT_ROOT=${DEFAULT_ROOT}`,
    }));

    // 11. the arm tables themselves
    const missingKinds = FINDING_KINDS.filter((k) => !observed.has(k));
    const missingArms = FAIL_CLOSED_KINDS.filter((k) => !failClosedSeen.has(k));
    check('every finding kind fired by the suite', () => ({ ok: missingKinds.length === 0, detail: `unfired=[${missingKinds.join(',')}]` }));
    check('every fail-closed arm fired by the suite', () => ({ ok: missingArms.length === 0, detail: `unfired=[${missingArms.join(',')}]` }));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  passed = results.length - failed.length;
  for (const r of results) {
    if (!r.ok) process.stdout.write(`FAIL ${r.label}\n     ${r.detail}\n`);
  }
  process.stdout.write(`KIMI_CENSUS_SELFTEST: ${passed}/${results.length} pass\n`);
  process.stdout.write(`VERDICT: ${failed.length === 0 ? 'PASS' : 'FAIL'}\n`);
  return failed.length === 0 ? 0 : 1;
}

/* ------------------------------------------------------------------- argv */

function parseArgs(argv) {
  const opts = { root: DEFAULT_ROOT, json: false, selftest: false, help: false };
  const need = (flag, v) => {
    if (v === undefined || v.trim() === '' || v.startsWith('-')) {
      process.stderr.write(`kimi-census: ${flag} needs a value\n${USAGE}`);
      process.exit(64);
    }
    return v;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === 'verify') continue;
    if (a === '--root') { opts.root = resolve(need(a, argv[++i])); continue; }
    if (a === '--json') { opts.json = true; continue; }
    if (a === '--selftest' || a === '--self-test') { opts.selftest = true; continue; }
    if (a === '-h' || a === '--help') { opts.help = true; continue; }
    process.stderr.write(`kimi-census: unsupported argument: ${a}\n${USAGE}`);
    process.exit(64);
  }
  return opts;
}

function main() {
  const started = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { process.stdout.write(USAGE); process.exit(0); }
  if (opts.selftest) process.exit(selfTest());
  process.exit(runVerify(opts, started));
}

/** Entrypoint guard: an `await import()` of this module must not print. */
const isEntry = (() => {
  if (process.argv[1] === undefined) return false;
  const invoked = resolve(process.argv[1]);
  if (invoked === TOOL_FILE) return true;
  try { return realpathSync(invoked) === TOOL_FILE; } catch { return false; }
})();

if (isEntry) main();