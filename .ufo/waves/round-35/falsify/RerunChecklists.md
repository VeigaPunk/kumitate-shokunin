ATTACK checklist 9/13 -> 12/13 (item 620 causes) verdict=partial defects=2

Axes attacked: **operability** (does the count reproduce, item by item) and
**coverage** (is every printed cause of the one red item attributed correctly).
Source pin used everywhere: `/fast/scratch/kumitate-r35/src` @ 31c465f1
(read-only); writable copies in `/fast/scratch/kumitate-r35/w/RerunChecklists/`.
No tool installs were needed. No lane file was modified.
## Item verdicts (SKILL.md lines as parsed by the probe)

| item | label | lane (round-35 tree) | master-tree | master clone (proper env) |
|---|---|---|---|---|
| 618 | Citation gate verdict | PASS | PASS | PASS |
| 619 | Citation gate hermetic suite | PASS | PASS | PASS |
| 620 | Live sighting-surface conformance | **FAIL** | **FAIL** | **FAIL** |
| 621 | Surface-probe hermetic suite | PASS | PASS | PASS |
| 622 | Round-gate hermetic suite | PASS | PASS | PASS |
| 623 | Round-close artifact audit | PASS | FAIL exit=2 | PASS |
| 624 | Filed-report tracking | PASS | FAIL exit=2 | PASS |
| 625 | Proxy recompute | PASS | FAIL | FAIL |
| 626 | Proxy-check hermetic suite | PASS | PASS | PASS |
| 627 | Member-claims gate | PASS | FAIL | FAIL |
| 628 | Kimi-substrate census | PASS | FAIL | FAIL |
| 629 | Sources-registry gate | PASS | PASS | PASS |
| 630 | Sources-check hermetic suite | PASS | PASS | PASS |
| | **totals** | **12/13** | 7/13 | **9/13** |

The lane result reproduced **exactly, twice**:
`cd <lane> && UFO_SRC=/fast/scratch/kumitate-r35/src node scripts/surface-probe.mjs --checklists`
→ `CHECKLIST: 12/13 pass`, only `SKILL.md:620` red (exit=1, substring miss).

The 9/13 baseline reproduced exactly in a writable master clone laid out as the
lane (`master-main/kumitate-shokunin`, `master` checked out, fleet
`.ufo/reports` copied and git-tracked in a `master-main` repo):
→ `CHECKLIST: 9/13 pass`, red = 620, 625, 627, 628 — byte-for-byte the same
item set as `.ufo/waves/round-35/baseline/checklists.txt:5,10,12,13,17`
(9/13 at 2026-10-20T21:11). The read-only `master-tree` copy reads 7/13 only
because items 623/624 exit 2 `NOT_A_GIT_WORKTREE` / `REPORTS_DIR_MISSING`
(the SKILL's own "tool/environment fault" class), not because the baseline is
wrong.
**C1/C2 claim "9/13 -> 12/13" holds.**

Lane gates behind the flips also reproduce: `PROXY: MATCH (… C1=19/19 C2=79/79
coverage=10; S=88/88; R=83/92; K=51/51; pins=6 match)` exit 0;
`CLAIMS: MATCH (rows=19 yes=19 …)` exit 0;
`KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)` exit 0.

## Item 620 — printed causes, confirmed against the pin

Command (lane): `UFO_SRC=/fast/scratch/kumitate-r35/src node scripts/surface-probe.mjs`
→ `SURFACE_PROBE: DRIFT`, exit 1, three errors + one non-gating warn:
```
ERROR SCRIPT_DIGEST_MISMATCH [sighting/DIGEST_CONCAT] sha256:f17d1547…68da9 != manifest.scriptDigest "sha256:b36559d0…be30c4"
ERROR VERB_UNDECLARED        [sighting/VERB_DISPATCH] dispatched in scripts/ufo-sighting.mjs but undeclared in the manifest: surface
WARN  ERROR_CODE_OFF_MANIFEST … (non-gating)
ERROR SURFACE_UNREACHABLE    [dispatcher/STATUS_REACH] status exited 1
totals surfaces=2 checks=12 passed=7 errors=3 warnings=1
```
Against a **writable** copy of the same pin
(`node scripts/surface-probe.mjs --src /fast/scratch/kumitate-r35/w/RerunChecklists/src31c465f1`):
`SURFACE_PROBE: DRIFT`, exit 1, **two** errors; `checks passed=10/12`; all
three `STATUS_*` checks pass. So the first two causes are pin-real and the
third is a read-only-tree artifact:

1. **DIGEST_CONCAT (confirmed; upstream, not a round-35 change).**
   `git -C <lane> diff master -- scripts/surface-probe.mjs` is empty — the probe
   is byte-identical to master. It sorts libs
   (`scripts/surface-probe.mjs:294-298`) and concatenates shim → module →
   sorted libs (`:300`, rule stated `:38-43`). The pin hardcodes the lib order
   `base, argv, observe, surface` (`/fast/scratch/kumitate-r35/src/scripts/ufo-sighting-lib/surface.mjs:15-20`, digest built `:31-45`).
   Recomputed: manifest order `base→argv` = `b36559d0…` = manifest.scriptDigest;
   probe order `argv→base` = `f17d1547…`. Same hardcoded order and same
   absence of `surface` in the base commit 964f443e — long-standing, not
   introduced by the pin either.
2. **VERB_UNDECLARED `surface` (confirmed; upstream).** Manifest has 12 verbs
   (`open … resume`) and extras `[register, twin, help]`; the `surface` arm
   exists at `/fast/scratch/kumitate-r35/src/scripts/ufo-sighting.mjs:4484`
   (`if (command === "surface")`) and the manifest's own usage prints
   `ufo-sighting surface --json` (`surface.mjs:265`). The probe's verb rule has
   no meta-verb exemption (`scripts/surface-probe.mjs:617`), so the red is real
   and upstream-owned. Present at 964f443e too.
3. **SURFACE_UNREACHABLE (printed, but not in the round record).**
   `cd /fast/scratch/kumitate-r35/src && node scripts/fleet-dispatcher.mjs status`
   → exit 1, `{"code":"EACCES","command":"status","error":"EACCES: permission
   denied, mkdir '/fast/scratch/kumitate-r35/src/.ufo'",…}`. Cause is upstream
   `assertLedgerPath()`: `mkdirSync(dirname(LEDGER_PATH))`
   (`fleet-dispatcher.mjs:90,462`). In a writable copy the same command exits 0
   and the probe's `STATUS_REACH/SHAPE/QUEUE_SCHEMA` all pass. This error is
   therefore an artifact of probing the read-only clone, not upstream manifest
   drift.

## Defects

**D1 — cause record incomplete (coverage).**
`LOG.md:1627-1628` records item 620 as red for
"upstream manifest omits the `surface` verb; lane probe hashes libs in sorted
order" — two causes. The probe prints **three** errors; the unnamed
`SURFACE_UNREACHABLE`/`STATUS_REACH` is the read-only-`--src` EACCES above and
does not exist against a writable copy. Minimal fix: append
"and `status` exits 1 against a read-only `--src` (EACCES mkdir `<src>/.ufo`,
upstream `assertLedgerPath`); passes on a writable copy" to the recorded cause.

**D2 — probe header documents `status` as read-only; it is not.**
`scripts/surface-probe.mjs:56-58` states status is "a read-only lock-free
projection by design (`fleet-dispatcher.mjs:14387-14415`)". Observed at the
pin: a writable run creates `<src>/.ufo/` (mkdirSync at
`fleet-dispatcher.mjs:462` via `LEDGER_PATH`, `:90`), and a read-only tree
fails with EACCES. Minimal fix: reword `:57-58` to note the status arm
materialises `<src>/.ufo` and needs a writable `--src` (or point the header at
`assertLedgerPath`). This is the mechanism behind D1.

Neither defect changes the count: item 620 is red under both `--src` modes, and
the two named upstream causes alone keep it red. No lane-introduced drift was
found in any of the 13 items.

## Remaining unknowns
- Upstream's normative lib order: its comment says "fixed order", the frozen probe rule says sorted; only upstream can settle which is right.
- Whether the intended contract allows recomputing over declared `digestInputs` order (clears DIGEST_CONCAT only) — gate-semantics change, untested.
- `master-tree`'s 7/13 is an environment artifact (no `.git`, no `../.ufo/reports`), not evidence against the recorded 9/13.
