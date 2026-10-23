# Round 49 — lesson

Lane: kumitate. Round 49 (hyaku run 5). Freeze `8237be86e2dc04e90e51b66b62bdffe770196d27`, C1 `0526f898`, C2
`589d25e4`. Plan `.ufo/waves/round-49/plan.md`. Counters `probe/bindoracle49-probe.mjs` (rule B49) and
`probe/doctrine49-probe.mjs` (rule D49), both committed before any data seat ran.

## Mistakes

- **M1 — a frozen predicate's mechanism was declared before the host was measured.** Class: plan-vs-build drift in a
  *mechanism sentence* (the predicate's wording survived, its stated mechanism did not). The plan's § C1 Limits (2)
  said EXTRA compares against a fixed base-mount allowlist (`/`, `/proc`, `/dev`, `/tmp`, `/run`, `/sys`, the cwd).
  Built and measured, that allowlist is host-specific and wrong: the sandbox child inherits every host mount through
  the root read-only bind, so the live run read `EXTRA extra=25` on a healthy runner (and 31 on the first, coarser
  variant) and the suite read `4/7 pass`, `VERDICT: FAIL`, exit 1 — receipt
  `.ufo/waves/round-49/r49/Mistake-fixed-allowlist.txt`. Captured by: selftest arm A1 ("a live run must read
  `HELD binds=3 observed=3 absent=1`") — an arm that asserts a healthy runner is HELD turns any host-specific
  allowlist red on the first run. Fix: EXTRA is compared against the *parent process's* mount set (a fresh mount
  namespace starts as a copy of its parent's) plus host paths that exist and are not directories (cap-run's
  `--dev /dev` recreates device nodes as mounts). Shown able to fail: the fixed-allowlist bytes read `A1 FAIL … EXTRA
  extra=25` (receipt above, exit 1); the shipped bytes read `7/7 pass`, `VERDICT: PASS` at `0526f898`
  (`r49/L1-score-0526f898.txt`, K2 PASS). The plan is not rewritten; this lesson and the report's disclosure carry
  the difference, and the counter's K5 mutant (`EXTRA extra=1` for `--bind /etc /etc`) is what the shipped rule is
  judged by.
- **M2 — the plan's freeze row and the round's own repair list disagreed about when a pin must land.** Class:
  deferred-decision drift (the bind-oracle has a registry row but no `pin.bind-oracle` in the gate-pins block).
  Evidence: `SKILL.md` § Gate registry's bind-oracle row vs `scripts/proxy-check.mjs:461-470` `GATE_PINS`. Captured
  by: the r48-closure question "same question for the cap-spawn helper change's pin" — the round answered it for
  cap-spawn (already pinned in r48) and left bind-oracle unpinned. Fix: recorded as a round-50 routing item with the
  reason (the instrument is cited by content hash in the counter and every receipt, so the pin adds drift surface
  without adding a measurement this round; the gate-pins block is re-pinned as a family, and a mid-round add would
  need its own H3 run). Shown able to fail: `node scripts/proxy-check.mjs --strict` at the close commit reads MATCH
  with pins=7 and no `PIN_UNPINNED` for bind-oracle — i.e. the block does not currently detect the absence, which is
  exactly why the routing item exists rather than a silent omission.

## Frontier — SOURCES

- **S099 admitted** — Linux man-pages `proc_pid_mountinfo(5)`,
  `https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html` (man-pages 6.19, 2026-02-08; page rendered
  2026-09-09), opened 2026-10-23, body sha256 `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f`,
  tier A, status mined. Located quote (15 words): "This file contains information about mounts in the process's mount
  namespace (see mount_namespaces(7))." Locators: DESCRIPTION paragraph 1 (mount point is field (5) of the record
  line). Used by `scripts/bind-oracle.mjs` and `corpus/knowledge/counter-amendment-discipline.md`.
- **Re-opened, no cell changed**: S095, S098 (both `mined`, `on-release`; re-open receipts in the round report; no
  status/recheck/used-by edit was needed because both still teach what their rows say).
- **Rejected this round**: none.
