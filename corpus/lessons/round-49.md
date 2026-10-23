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

## Gate

*Round-50 addendum (routed defect R50-2). The r49 close carried no `## Gate` ledger, so the non-author spot-check
(`corpus/lessons/round-49-verifier-spotcheck.md` §3) had no ledger to sample. This section records r49's
source/entry decisions as they stand and updates the two held re-opens with the round-50 receipts; no cell above it
is rewritten.*

### candidates

- **S095** — bubblewrap 0.13.1 manual, `https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`:
  re-open assigned by `.ufo/waves/round-49/r49-spec.json:237-243`; recorded body sha256
  `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`. Disposition **HOLD** (body hash matches, the
  filesystem-order and tmpfs semantics still hold). Receipt: `.ufo/waves/round-50/r50/ReopenS095.md`. Locator caveat
  in that receipt: the row's cited `bwrap.xml:253-255` is the `--sync-fd` entry and `:410-416` ends at the `--tmpfs`
  term before its description; ordering reads at `:260-263`, `--tmpfs` text at `:416-418` in the same unchanged body.
- **S098** — strace(1) 7.2 manual, `https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in`: re-open
  assigned by `r49-spec.json:246-252`; body sha256
  `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`. Disposition **HOLD** (`:832-835` default
  alignment column 40; `:148-158` unfinished/resumed markers). Receipt: `.ufo/waves/round-50/r50/ReopenS098.md`.
- **S099** — Linux man-pages `proc_pid_mountinfo(5)`,
  `https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html`, opened 2026-10-23, body sha256
  `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f`.

### admitted

- **S099** — tier A, status `mined`, located quote (15 words): "This file contains information about mounts in the
  process's mount namespace (see mount_namespaces(7))." (DESCRIPTION ¶1; the mount point is field (5) of a record
  line). Used by `scripts/bind-oracle.mjs`, `corpus/knowledge/counter-amendment-discipline.md`, this lesson.
- **S095 and S098 — HOLD, no row-cell change.** These are re-open dispositions for existing `mined` rows, not new
  admissions; the flip condition the r49 hold named ("commit the re-open result with the verified body hash and
  located passages") is met by the receipts above, and both rows keep `mined` / `on-release`.

### rejected

- **No SOURCES row was rejected this round.** The two rejections r49 records are counter controls, not source rows:
  the doctored C2 receipt under D49 (`UNMET … hash-mismatch`, exit 1) and instrument mutants K4–K6 under B49
  (`MISSING` / `EXTRA` / `CONTROL_VISIBLE`, each exit 1). Round 50 re-ran the B49 instrument three times
  (`.ufo/waves/round-50/ReRunB49-{1,2,3}.txt`, each `ORACLE_HELD held=6/6`) without changing those control verdicts.

### spot-check

The non-author `corpus/lessons/round-49-verifier-spotcheck.md` §3 **agrees** with S099's tier-A/`mined` admission,
the doctored-receipt rejection and the K4–K6 rejections, and **disagrees** with the report's "discernment —
improved" because this ledger was absent at r49 close. Round 50 accepts the disagreement (the absence was real) and
treats this addendum as repair, not as retroactive evidence that the verifier saw it: the verifier's disagreement
stands as the finding, and the r49 report carries only an append-only erratum naming the post-filing commits.
