#!/usr/bin/env node
/**
 * doctrine56-probe.mjs — FROZEN counter for kumitate round 56, claim C2 (rule `D56`).
 *
 *   node .ufo/waves/round-56/probe/doctrine56-probe.mjs <lane> <rev>
 *
 * Counter for the sixth sourced entry of the durable-execution research line
 * (frontier band, PROVINCE.md): visibility lease / ack deadlines — the
 * outstanding-but-claimable slot under at-least-once, covering the SQS
 * visibility-timeout lease (S114, tier A), Pub/Sub lease management /
 * renewable modifyAckDeadline (S113, tier A) and JetStream ack-wait redelivery
 * (S115, tier A). S116 (Temporal Visibility) was opened and rejected.
 * Freeze history: v1 is the first version of this rule; it mirrors rule D55
 * (round 55) with the entry and row ids changed. Frozen AND executed at base
 * before any data seat ran (base/doctrine56-base.txt, QUALITY Q43), with a
 * scratch-HELD witness of a synthetic conformant post-state committed at
 * freeze (witness/scratch-held-doctrine.txt, lesson M5).
 *
 * Scores five checks over the committed bytes of <rev> (extracted with `git
 * archive`, never the working tree):
 *   E1  corpus/knowledge/visibility-lease-ack-deadlines.md exists at rev; its
 *       provenance trio (`source:` citing S113 with a cloud.google.com URL and
 *       the companion rows S114/S115, `verified-at:`, `recheck:`) appears
 *       within its first five lines.
 *   E2  >=12 clause lines (lines starting with `- `), each carrying a
 *       `receipt:<repo-path>@sha256:<64hex>` binding whose path is DISTINCT
 *       across the clause set and exists at rev as a blob with a matching
 *       sha256.
 *   E3  corpus/SOURCES.md at rev carries rows S113, S114 and S115 with status
 *       `mined` and a used-by cell naming
 *       corpus/knowledge/visibility-lease-ack-deadlines.md; and the capture
 *       registry `.ufo/pins/source-captures.json` at rev pins S113..S116.
 *   E4  `node scripts/sources-check.mjs` against the extracted tree prints
 *       `SOURCES_CHECK: CLEAN` exit 0.
 *   E5  the live census `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
 *       validate --root /home/vgpnk/Projects/shokunin kumitate` exits 0 (R51-4
 *       class: live-only, recorded as a limit).
 *
 * Predicate DOCTRINE56_HELD = held=5/5, exit 0. Any other reading is
 * `DOCTRINE56_UNMET held=<k>/5` exit 1. A crash or an unreadable extraction is
 * exit 2 (never a score). Frozen at `.ufo/waves/round-56/plan.md` § C2 before
 * any data seat ran.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the
 * round report —
 * DOCTRINE56_HELD — node .ufo/waves/round-56/probe/doctrine56-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE56: DOCTRINE56_HELD held=5/5 checks=5 rev=<rev> rule=D56" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'D56';
const ENTRY = 'corpus/knowledge/visibility-lease-ack-deadlines.md';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('DOCTRINE56: USAGE node doctrine56-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`DOCTRINE56: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('DOCTRINE56: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });

const T = mkdtempSync(join(tmpdir(), 'd56-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`DOCTRINE56: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    process.exit(2);
  }
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };

  // E1 — entry exists, provenance trio within first five lines
  {
    const entry = readT(ENTRY);
    if (!entry) { hold('E1', false, 'entry-absent'); }
    else {
      const head = entry.toString('utf8').split('\n').slice(0, 5).join('\n');
      const ok = /source:\s*[^\n]*S113[^\n]*cloud\.google\.com[^\n]*S114[^\n]*S115/.test(head)
        && /verified-at:/.test(head) && /recheck:/.test(head);
      hold('E1', ok, ok ? 'trio' : `head=${JSON.stringify(head.slice(0, 160))}`);
    }
  }
  // E2 — >=12 clause lines, each with a DISTINCT receipt path whose blob at rev hashes to the token
  {
    const entry = readT(ENTRY);
    if (!entry) { hold('E2', false, 'entry-absent'); }
    else {
      const lines = entry.toString('utf8').split('\n').filter((l) => l.startsWith('- '));
      const tokens = lines.map((l) => l.match(/receipt:([^\s@]+)@sha256:([0-9a-f]{64})/));
      const bound = tokens.filter(Boolean).length;
      const paths = new Set(tokens.filter(Boolean).map((m) => m[1]));
      let hashMiss = 0;
      for (const m of tokens) {
        if (!m) continue;
        const blob = readT(m[1]);
        if (!blob || sha(blob) !== m[2]) hashMiss += 1;
      }
      const ok = lines.length >= 12 && bound === lines.length && paths.size === bound && hashMiss === 0;
      hold('E2', ok, `clauses=${lines.length} bound=${bound} distinct=${paths.size} hash-miss=${hashMiss}`);
    }
  }
  // E3 — SOURCES rows mined+used-by; capture registry pins the four ids
  {
    const src = readT('corpus/SOURCES.md');
    const regRaw = readT('.ufo/pins/source-captures.json');
    let ok = Boolean(src && regRaw);
    const detail = [];
    if (src) {
      for (const id of ['S113', 'S114', 'S115']) {
        const row = src.toString('utf8').split('\n').find((l) => l.startsWith(`| ${id} |`));
        const cells = row ? row.split('|').map((c) => c.trim()) : [];
        const good = cells[8] === 'mined' && cells[11] && cells[11].includes(ENTRY);
        if (!good) detail.push(`${id}:${cells[8] || 'missing'}`);
        ok = ok && good;
      }
    }
    if (regRaw) {
      try {
        const reg = JSON.parse(regRaw.toString('utf8'));
        for (const id of ['S113', 'S114', 'S115', 'S116']) {
          const c = reg.captures.find((x) => x.sourceId === id);
          const b = c && readT(c.path);
          if (!c || !b || sha(b) !== c.sha256) { detail.push(`${id}:pin-miss`); ok = false; }
        }
      } catch { detail.push('reg:parse'); ok = false; }
    }
    hold('E3', ok, detail.length ? detail.join(',') : 'rows+pins');
  }
  // E4 — sources-check CLEAN on the extracted tree
  {
    const r = spawnSync(process.execPath, [join(T, 'scripts/sources-check.mjs')],
      { cwd: T, encoding: 'utf8', timeout: 120_000, maxBuffer: 16 << 20 });
    const last = `${r.stdout || ''}`.trim().split('\n').pop() || '';
    hold('E4', r.status === 0 && /SOURCES_CHECK: CLEAN/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // E5 — live census exit 0 (live-only; recorded as a limit)
  {
    const r = spawnSync('/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
      ['validate', '--root', '/home/vgpnk/Projects/shokunin', 'kumitate'],
      { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 << 20 });
    hold('E5', r.status === 0, `exit=${r.status}`);
  }
} catch (e) {
  process.stderr.write(`DOCTRINE56: FAIL-CLOSED ${e && e.stack ? e.stack.split('\n')[0] : e}\n`);
  process.exit(2);
} finally {
  rmSync(T, { recursive: true, force: true });
}
if (checks.length === 0) {
  process.stdout.write(`DOCTRINE56: DOCTRINE56_UNMET held=0/0 checks=0 rev=${rev} rule=${RULE} | hold-call-deleted\n`);
  process.exit(1);
}
const held = checks.filter((c) => c.ok).length;
const parts = checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail}`}`).join(' | ');
process.stdout.write(`DOCTRINE56: ${held === checks.length ? 'DOCTRINE56_HELD' : 'DOCTRINE56_UNMET'} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} | ${parts}\n`);
process.exit(held === checks.length ? 0 : 1);
