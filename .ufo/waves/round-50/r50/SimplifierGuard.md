# SimplifierGuard — kumitate round 50 (seat report)

**Question.** Is extending `bad()` with `/tmp` the minimal correct fix vs (B) wholesale refusal of
every sandbox-managed mount point, or (C) reordering argv so binds precede tmpfs? Evaluate all three
against bwrap argument-order semantics; recommend the boring correct one.

**Verdict.** Option A — exact-match `/tmp`, post-realpath, inside the existing `bad()` — is the
minimal correct fix and is what the integrated bytes now do. B either collapses into A or over-refuses
(breaks the runner's own selftest and the frozen G3 arm). C is unsound on three independent grounds.
Keep A; do not widen the list (plan limit (a) already records that `--bind /etc /etc` stays legal).

## 1. Reviewed bytes and provenance

- HEAD `6927903f99bbc26e397aa47387aa76950f42b3a5`; guard landed in `378b6e7` ("round-50: freeze guard
  and closure corrections", 13+/11− in `scripts/cap-run.mjs`). Before-state `ff40d7d` (r49 tip, the
  plan's control rev) refused `/` exact plus `/proc|/sys|/dev|/run` by prefix — `/tmp` was absent.
  That matches `corpus/lessons/round-47.md:74-79` (ReviewCapRunV2 F1 + SentinelCapSpawn 1): the r47
  list was `/`, `/proc`, `/sys`, `/dev`, `/run`; `/tmp` was an omission the r49 ScoutCapRunVisibility
  finding caught, not a design choice the guard would contradict.
- Integrated predicate (`scripts/cap-run.mjs:130-131` at HEAD):
  ```js
  const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
  if (bad(r) || bad(resolve(v))) usage(`--bind refuses ${JSON.stringify(v)} (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them)`);
  ```
  with `r = realpathSync(v)` (source) and `resolve(v)` (destination; `--bind` is single-dir bound onto
  itself, so both sides name the same path through different alias classes). New selftest arm:
  `[...lim(), '--bind', '/tmp', '--', 'true']` in the usage loop (`cap-run.mjs:317`).

## 2. bwrap argument-order semantics (S095)

`bwrap.xml` v0.13.1 fetched; body sha256
`2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da` — matches the S095 re-open pin.
Key sentences (same source): "Filesystem related options. … These are applied in the order they are
given as arguments." `--bind SRC DEST` = "Bind mount the host path SRC on DEST"; `--tmpfs DEST` =
"Mount new tmpfs on DEST". So a `--bind` placed *after* `--tmpfs /tmp` stacks host `/tmp` (rw) on top
of the fresh tmpfs; placed *before*, it is itself masked by the later tmpfs. cap-run's argv
(`cap-run.mjs:184-188`) is `--ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run --bind
cwd cwd …caller binds…` — the runner's own cwd bind deliberately follows the tmpfs mounts so that
workspaces living under `/tmp` (the selftest's `mkdtemp`, the probes' fixtures) stay visible.

Empirical confirmation (host bwrap 0.13.1, scratch dirs, cleaned up):

| case | argv order | result |
|---|---|---|
| 1 | `--bind D D` **before** `--tmpfs /tmp` | `ls D` → "No such file or directory", rc=2 — caller bind silently masked |
| 2 | `--bind D D` **after** `--tmpfs /tmp` (subdir) | `visible`, rc=0 — deliberate shadowing works |
| 3 | `--tmpfs /tmp` then `--bind /tmp /tmp`, child `touch /tmp/<nonce>` | **HOST FILE APPEARED** (leak), child rc=0 |
| 4 | `--tmpfs /tmp`, no bind, child `touch /tmp/<nonce>` | no host file — tmpfs isolation intact |

Case 3 is the pre-guard hole (matches `controls/CtlExposure-base-ff40d7d.txt`); case 4 is G8.

## 3. The three options

**A — `/tmp` exact, post-realpath (adopted).** One token in an existing predicate + comment/doc
updates + one usage arm; no new convention, no argv change. Match shape is principled, not accidental:
`/tmp` and `/` are refused *exact* because they are plain directory trees the runner replaces
(`--tmpfs /tmp`, `--ro-bind / /`) — only the mount point itself defeats the advertised property, while
subdir binds reveal nothing else from host `/tmp`. `/proc`, `/sys`, `/dev`, `/run` are refused *by
prefix* because any subpath is a kernel/runtime interface (host sockets under `/run/user/<uid>`,
sysctls under `/proc/sys`, cgroupfs under `/sys/fs/cgroup`), not ordinary content. Alias handling:
`realpathSync` on the source collapses `//tmp`, `/tmp/`, `/tmp/.`, `/tmp/../tmp`, `/tmp/./` (verified:
all → `/tmp`); `resolve(v)` collapses the same lexical forms on the destination. Frozen G2 tests
`{/tmp, /tmp/, /tmp/., /, /run, /proc/self, rel, nonexistent}` — the four `/tmp`-adjacent forms are
covered by the collapse, two of them explicitly.

**B — wholesale refusal of every sandbox-managed mount point.** As literally stated (prefix-match
`/tmp` too) it refuses `--bind /tmp/cap-run-selftest.XXXX` — the runner's own selftest cwd
(`mkdtempSync(join(tmpdir(), …))`), the frozen probe's G3 fixture, bind-oracle, and every wave seat
scratch dir. It would force all callers to move scratch outside `/tmp`: exactly the second convention
a simplifier must not create. Implemented with per-path match shapes it *is* option A — the list
already covers all five managed points plus `/`. B adds no separable move.

**C — reorder argv so binds precede tmpfs.** Unsound three times over. (i) Empirics case 1: any
`/tmp`-subdir bind is silently masked — breaking the selftest (cwd under `/tmp`), G3, and every
`/tmp`-workspace caller; the runner's cwd bind *must* follow the tmpfs mounts, so "all binds first"
cannot be implemented without breaking the core contract. (ii) A masked caller bind is a silent lie —
the caller asked for a read-write host dir and got an empty tmpfs path with exit 0; contract
violations must be loud (`CAP_RUN: USAGE`, exit 64), not silent. (iii) It does not even close the
hole: `--bind /tmp /elsewhere` still exposes host `/tmp` read-write at a different destination —
reordering hides the `/tmp` view, not the data flow. Strictly dominated by A.

## 4. Deletion/weight candidates examined (retention judgments)

- `p === '/'` — not redundant: the prefix regex covers only `/proc|/sys|/dev|/run`; `/` needs its own
  arm (r47 SentinelCapSpawn 1: `--bind /` re-opened the read-only root). Keep.
- Double check `bad(r) || bad(resolve(v))` — not redundant: `r` (realpath) kills symlink-aliased
  sources, `resolve(v)` (lexical) kills `..`/dot forms; each covers a class the other misses. Keep.
- Table-driven refactor (shared "managed points" list for argv + refusal) — rejected: five literal
  entries, two different match shapes, one consumer each; a table is abstraction without a caller.
  The r47 comment + header line carry the coupling (S095). Boring choice is the literals as they are.
- Widening to `/etc`, `/usr`, … — explicitly not claimed (plan limit (a)); an explicit bind of a host
  config tree is loud, auditable caller intent, unlike `--bind /tmp` which silently voids an
  advertised property. The refusal list should stay "mount-point identity", not a path blacklist.

## 5. Evidence index

- `node scripts/cap-run.mjs --selftest` at HEAD: `CAP_RUN_SELFTEST: 12/12 pass`, `VERDICT: PASS`,
  exit 0 — includes the new `--bind /tmp` usage arm (narrow existing check for retained behavior).
- `git diff ff40d7d..6927903 -- scripts/cap-run.mjs` = the A-delta exactly (bad() token, comment,
  two header lines, one selftest arm); nothing else moved.
- bwrap.xml sha256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da` (verified).
- Empirical table in §2; all scratch dirs/marker files removed (incl. one stray
  `/tmp/r50proof-sg-marker` from a misnamed first attempt, removed on redo).
- No tool installs (none needed). Lane repo untouched; all runs read-only or scratch.

## 6. Residuals and tradeoffs (recorded, not hidden)

1. Destination-side symlink aliasing: `resolve(v)` is lexical; a destination whose final component is
   a symlink resolving to `/tmp` inside the child would pass the parser. Low risk (the child's `/tmp`
   is the fresh tmpfs; the dest must exist in the child's view) and outside the frozen G2 set. Named
   for SentTmpPath/SentArgv; not fixed here — fixing would add a second resolution context for a
   class with no known caller.
2. `//tmp` is covered by realpath/resolve collapse but is absent from the frozen G2 list — acceptable
   limit: the collapse is POSIX-path behavior, not guard logic.
3. The counter's G2/G3 pin option A's semantics; any future widening (e.g. `/etc`) needs a new frozen
   counter, not a silent regex edit — consistent with the r42 predicate-freezing rule.

Overlap note: SentTmpPath (variant table), SentArgv (bypass hunt), RevRefusalConsistency (design
verdicts), RevMountOrigin (r47 F1 history), ExecBindGuardPatch/MutGuard (diff + mutants) work the
same bytes; §1's provenance and §2's case 1 answer the reorder question those seats may assume.
