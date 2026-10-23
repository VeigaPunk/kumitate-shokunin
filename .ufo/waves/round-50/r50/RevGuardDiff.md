# RevGuardDiff

Verdict: **SOUND** — the landed guard diff (5b0de26 → 378b6e7, `scripts/cap-run.mjs`) and
ExecBindGuardPatch's scratch diff are correct on every reviewed dimension; one residual
saturation gap (caller cwd = /tmp) is recorded below as F1. It is outside the diff's stated
contract and outside every frozen check, so it does not flip the verdict.

Provenance: the guard was already committed at `378b6e7` ("round-50: freeze guard and closure
corrections", 2026-10-23 17:44:27 -0300) before wave dispatch (`6927903`); base 5b0de26 line 129
was `const bad = (p) => p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);` — `/tmp` absent,
so `--bind /tmp` was accepted and unmasked host /tmp after `--tmpfs /tmp` (cap-run.mjs:190 appends
caller binds after the tmpfs mounts). ExecBindGuardPatch.md landed at 17:47 and is reviewed below
alongside the landed bytes. Working tree == HEAD for scripts/ (clean `git status --porcelain`);
all line refs are to `scripts/cap-run.mjs` at 378b6e7 (sha256 64fafb421a5fd70f…, = SCORECARD.md:318
`pin.cap-run`, verified).

## Line-by-line review of the landed diff (5 hunks)

1. **Guard placement — correct.** :131-132 sit inside the `--bind` arm of `parseArgs`, after the
   existence/is-directory gate (:128-130) and before `o.bind.push` (:133); `parseArgs` completes
   before any bwrap spawn, so a refused bind can never reach argv (bwrap argv build is :188-191).
   Nothing runs on refusal: `usage()` exits 64 before `o.bind` is mutated.
2. **realpath coverage — correct and non-redundant.** `r = realpathSync(v)` (:129) collapses
   symlinks, so a symlink alias pointing *into* /tmp is refused via `bad(r)`; `bad(resolve(v))`
   covers the alias-*at*-tmp shape: if host `/tmp` itself were a symlink, `r` would be the target
   (allowed by the list) but the destination is still `resolve(v)='/tmp'` and is refused. The two
   checks are therefore complementary, not redundant. Exact-match `p === '/tmp'` (:131) vs a
   prefix rule is the right call: `/tmp/<subdir>` binds must stay legal — probe G3 and the
   selftest bind arm (:356-367, mkdtemp root) both depend on it, and plan.md:97 says whole-point
   only. Ordering realpath-before-check is what makes the symlink case safe (verified empirically,
   below).
3. **Message text — consistent.** :132 emits `CAP_RUN: USAGE --bind refuses <v> (root, /tmp,
   /proc, /sys, /dev and /run stay as the sandbox mounts them)` — matches the new list, stays in
   the `CAP_RUN: USAGE` class/exit 64, and both matchers (`/^CAP_RUN: USAGE /` in selftest :319
   and probe G2) accept it. Comment at :125-127 and header :16-21/:85-87 updated to the same
   list; no stale text remains (grepped).
4. **Selftest arm position — correct.** `[...lim(), '--bind', '/tmp', '--', 'true']` added at :317
   inside the existing usage-arm loop (:313-320); the loop already asserts exit 64 + the USAGE
   prefix, so the new arm is exercised by G4. Diff shows a pure one-line replacement: no prior
   arm removed (`/`, `/run`, `/proc/self`, `rel`, nonexistent, `--bogus`, budget/env/verdict arms
   all intact).
5. **No regression — none found.** `--bind` of mkdtemp subdirs of /tmp still allowed (selftest
   12/12 below); cap-spawn passthrough (:35 `argv.push('--bind', d)`) callers bind
   `[tmp]`-mkdtemp roots (anchor-truth.mjs:807, round-gate.mjs:762, sources-check.mjs:870,
   surface-probe.mjs:1615), `[root]` (sources-check.mjs:557), `[cacheRoot]`/`[stateRoot]`
   (surface-probe.mjs:500/:536) — none is a refused path.

### ExecBindGuardPatch.md (landed report) vs landed bytes

Its scratch diff (against pre-guard 269dadb) contains exactly the two code hunks — `bad()` line
and usage-message line, plus the selftest arm — and omits the landed diff's three comment hunks
(:3 contract line, :15-21 WHY paragraph, :84-87 S095 note). Hash bridge proves equivalence:

- `git show 269dadb:scripts/cap-run.mjs | sha256sum` → `d8acc6debd101b0a…` (matches its
  `cap-run.mjs.before`).
- Applying its three substitutions to those bytes → `6e78b1b3465960c9…` (matches its patched
  hash, reproduced byte-exact).
- `diff` landed-378b6e7 vs that patched file → **comment lines only**, zero code deltas.

Its claimed scratch selftest 12/12 VERDICT: PASS is consistent with my own run of the landed
bytes. Note its OOM line says `exit=137` vs landed `exit=143` — same check (SIGKILL of the
allocating child), cgroup-timing-dependent signal reporting, not a diff concern.

## Empirical evidence (scratch copies; lane untouched; scratch dirs cleaned)

- Variants, all `exit=64` with the new USAGE line: `/tmp`, `/tmp/`, `/tmp/.`, `/tmp/../tmp`,
  `//tmp`, `/`, `/run`, `/proc/self`, and a scratch symlink alias → /tmp (refused via
  `bad(r)`; the message quotes the alias path, proving realpath ordering).
- `node scripts/cap-run.mjs --selftest` at 378b6e7: `CAP_RUN_SELFTEST: 12/12 pass`,
  `VERDICT: PASS`, exit 0.
- Frozen counter at the diff rev: `node .ufo/waves/round-50/probe/bindguard50-probe.mjs
  <lane> 378b6e7` → `G1-G8 all PASS`, `BINDGUARD50: GUARD_HELD held=8/8 … caprun_sha256=64fafb42…`,
  exit 0.
- Positive control: scratch cwd + `--bind <mkdtemp-under-/tmp>` → exit 0, host `out.txt` written,
  child `/tmp/<m>` write **absent** on host.

## Findings

- **F1 (moderate, residual — the guard's known limit, not a defect of this diff):** cap-run
  unconditionally appends `--bind <cwd> <cwd>` after `--tmpfs /tmp` (:190). A caller whose cwd is
  exactly /tmp re-exposes host /tmp read-write with *no* `--bind` flag — the same bug class C1
  closes, reachable via the cwd route. Reproduced: `(cd /tmp && cap-run --mem 128 --tasks 16
  --budget 20 -- node -e "…writeFileSync('/tmp/<m>','x')")` → exit 0, host file present; control
  with scratch cwd → host file absent. Neither the selftest nor probe G2/G8 exercises cwd=/tmp
  (both run from mktemp scratch dirs), so GUARD_HELD does not cover it. Acceptable limit *for the
  frozen predicate* (the counter is frozen; changing it needs a new counter); recommend recording
  in QUALITY.md as candidate hardening: refuse when `realpathSync(process.cwd())` is a refused
  mount point, same USAGE class. Lane callers today never cwd=/tmp.
- **F2 (informational):** the executor's report diff omits the three landed comment hunks; code
  hunks proven equivalent by the hash bridge above. Landed bytes are the complete record.
- **F3 (informational):** symlink-alias-to-/tmp is covered by neither suite (selftest arm is the
  literal string; probe G2 has `/tmp/`, `/tmp/.` but no alias). My empirical run closes the gap
  for this round; adding a temp-symlink arm is cheap future coverage.
- **F4 (positive):** decision `bad(r) || bad(resolve(v))` + exact-match + realpath-first is the
  boring correct design per bwrap argument-order semantics (S095); the argv-order alternative
  (binds before tmpfs) would silently mask subdir binds and was rightly not taken.

## Residual risk and verification gaps

- cwd=/tmp route (F1) is live until a follow-up guard; every other route to host-/tmp rw via the
  `--bind` surface is refused, and the sandbox-managed set (`/`, `/tmp`, `/proc`, `/sys`, `/dev`,
  `/run`) is fully enumerated in `bad()`.
- A host mount *under* /tmp (e.g. /tmp/sub being a real host mount) bound by path would still
  re-expose it — bwrap-side reality, unenumerable without reading mountinfo (S099); out of scope
  here and unchanged by the diff.
- G2's refusal list is a fixed literal set; the probe cannot see caller-side cwd or future path
  shapes. That is the accepted limit of the frozen predicate, not a gap in this diff.

Tooling record: nothing installed or upgraded (host node v24.21.0, git, bwrap 0.13.1 sufficed).
All runs were read-only on the lane (`git archive`/`git show` into mktemp scratch); no git/jj
mutation anywhere.
