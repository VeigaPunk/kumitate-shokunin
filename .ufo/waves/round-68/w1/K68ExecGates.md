# Seat K68ExecGates — five-gate base run (round 68, w1)

VERDICT: Four of the five governance gates plus kimi-census and plan-before-ready were measured at the base revision; two are RED at base — `readme-map` (declared in the plan, repaired at the freeze) and `proxy-check` (NOT declared anywhere in the round-68 plan, still RED at the freeze commit, six error terms, structurally un-greenable because its `A` term counts wave build artifacts).

## Evidence

Base worktree = `git -C kumitate-shokunin archive d23892ad44b41e1af63b3edb949d265ca1dd812d | tar -x -C $S/base` (scratch,
deleted). Every reading below is reproduced in `build/K68ExecGates/base-gates.txt` (driver: label, exact
`CMD:` with cwd, `EXIT:`, verbatim output). Lane HEAD during the run: `39f61816d4ee7a8d401df42c1818c91a9c537bce`.

| # | command (cwd = base extraction unless stated) | exit | verdict line |
|---|---|---|---|
| G1 | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` (cwd = lane) | 0 | `kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` + six `W04` |
| G1b | same script `--root <base extract> --file <base>/corpus/SOURCES.md` | 0 | identical six `W04`, `file	ok	…/base/corpus/SOURCES.md` |
| G2 | `node scripts/sources-check.mjs` | 0 | `SOURCES_CHECK: CLEAN (rows=145 tiers=A:122,B:15,C:8 status=queued:13,mined:113,rejected:19 entries_with_source=22 legacy=38)` |
| G3 | `node scripts/source-capture.mjs` | 0 | `SOURCE_CAPTURE: CLEAN captures=38 exemptions=107` |
| G4 | `node scripts/readme-map.mjs` | **1** | `README_MAP: DRIFT files=163 rows=161 covered=161 bad=4 first=uncovered:lessons/round-66-verifier-spotcheck.md` (notes: uncovered r67, unpinned r66, unpinned r67) |
| G5 | `node scripts/proxy-check.mjs` | **1** | `PROXY: DRIFT (A_DRIFT term=A declared=351 computed=543 delta=+192; C2_DRIFT 156/161 +5; C2_TOTAL_DRIFT 156/163 +7; K_MEMBERS_DRIFT 49/53 +4; K_SECTIONS_DRIFT 49/53 +4; AXES_DRIFT coverage row=10 derived=9; PIN_UNPINNED scripts/harm-matrix.mjs; PIN_UNPINNED scripts/routed-ledger.mjs; src-rev=31c465f15669)` |
| G6 | `node scripts/kimi-census.mjs` | 0 | `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=10 info=4)` |
| G7 | `bash scripts/plan-before-ready.sh --round 68` (cwd = lane, HEAD) | 0 | `PLAN_BEFORE_READY: PASS rev=39f61816… round=68 plan=39f61816… marker=39f61816… marker_kind=dispatch marker_path=.ufo/waves/round-68/w1-dispatch.json map=CLEAN files=163 rows=163 covered=163` |
| G7b | same, `--rev d23892ad44b41e1af63b3edb949d265ca1dd812d` | 2 | `PLAN_BEFORE_READY: NA … reason=NO_PLAN_NO_MARKER plan=- marker=- map=SKIP reason=NO_PLAN` |

Inheritance comparison, `git archive 39f61816` extraction (`build/K68ExecGates/freeze-gates.txt`):
`SOURCES_CHECK: CLEAN` exit 0 · `SOURCE_CAPTURE: CLEAN` exit 0 · `README_MAP: CLEAN files=163 rows=163 covered=163` exit 0 ·
`PROXY: DRIFT (A … 351/548 +197; C2 156/163 +7; C2_total 156/163 +7; K_members 49/53; K_sections 49/53; PIN_UNPINNED×2)` exit 1.

Determinism / portability: `readme-map` and `proxy-check` re-run at base give byte-identical verdicts (`DETERMINISTIC`) and read
identically from `cwd=/` (`readme-map` rc=1, `sources-check` rc=0) — the gates derive their lane from their own path. G1 is
byte-identical to the committed `base/census-before.txt` (`diff` → `IDENTICAL`), so the plan's "six carried W04" holds.

Two base readings the round-68 plan does not name, both measured twice:

- `node scripts/surface-probe.mjs --checklists` at base → `CHECKLIST: 26/33 pass`, `VERDICT: FAIL`, exit 1. Archive-shape
  reds: `SKILL.md:712, 713, 714, 720, 726, 728, 733`; clone-shape reds: `712, 713, 714, 724, 726, 728, 733`. A first run of the
  same command on the same archive read `CHECKLIST: 25/33 pass` (8 reds; only its last 12 stdout lines were kept and no receipt
  was saved, so that run's extra red is unidentified) — the count moves run-to-run. Receipts `checklists-base.txt`,
  `checklists-base-clone.txt` cover the two 26/33 runs.
- `node scripts/gate-mutants.mjs` on base revision d23892ad is **not reproducible** — four runs, three outcomes, same bytes
  (`scripts/wave-census.mjs` = `sha256 76447250f9de…` everywhere): `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41)`
  exit 0 in 45.7 s; `GATE_MUTANTS: ERROR (mutants=43 killed=39 frozen=37/41 … unstable=3 timeout=1)` exit 2 in 102.9 s;
  `GATE_MUTANTS: ERROR (mutants=0 killed=0 frozen=0/41 … control-fail=1)` exit 2 in 2.5 s (a `git clone --shared` of the same
  revision, where `CONTROL wave-census FAIL exit=1 cases=31/32` while standalone `wave-census --selftest` reads `32/32 pass`
  in both the clone and the archive). Receipts: `gate-mutants-base-archive.txt` (ERROR), `gate-mutants-base-archive-full.txt`
  (CLEAN), `gate-mutants-base-clone.txt` (ERROR), `checklists-base.txt:32` (a PASS 41/41 inside the checklist run).

## Findings

**K68ExecGates-1 — `proxy-check` is RED at the base revision and still RED at the freeze commit; round 68's plan never names it.**
Severity: high (a standing gate the lane's own checklist requires green, `SKILL.md:714`). Attacks: the claim that the round
opens on a measured, reconciled base — the plan's only "before" readings are the census and the readme-map drift.
Reproduce: `S=$(mktemp -d /fast/scratch/…); git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive d23892ad | tar -x -C "$S";
cd "$S" && node scripts/proxy-check.mjs; echo $?` → `PROXY: DRIFT (…)` exit 1; repeat with `git archive 39f61816` → `PROXY:
DRIFT` exit 1 (A 351/548). The last round receipt carrying a `PROXY:` verdict is the round-64 base
(`.ufo/waves/round-64/base/proxy-before.txt`: `PROXY: DRIFT (C2_TOTAL_DRIFT 153/154 +1; AXES_DRIFT coverage 10/9) exit=1`),
so the `A` term has been drifting unrecorded since round 64 (351 → 543 at base → 548 at freeze). Repair is an L1 decision;
the numbers cannot be re-pinned by a wave seat (see -2).

**K68ExecGates-2 — the `A` term counts wave build artifacts, so re-pinning it green is impossible while rounds ship scripts.**
Severity: high (structural; blocks -1's obvious repair). `A` is "files under `--self` named `*.mjs|*.js|*.sh|*.py`", walked by
`walkFiles` which prunes only `.git` (`scripts/proxy-check.mjs:694-704`, derivation at `:158-166`). At base 512 of the 543
counted files live under `.ufo/waves/` (94 %); rounds 63–66 alone contribute 138/92/102/86 committed scripts.
Reproduce the sensitivity: copy the base extraction and add five dummy `.mjs` files under
`.ufo/waves/round-99/build/DummySeat/` → `A_DRIFT declared=351 computed=548 delta=+197` (was 543), i.e. +1 per committed
build script. Receipt: `build/K68ExecGates/proxy-a-attack.txt`. Any re-pin therefore freezes a number that the next wave moves;
a wave-build-excluding count (or a declared-tolerance term) is the strengthening change to propose.

**K68ExecGates-3 — `readme-map` RED at base is real and is repaired exactly at the freeze commit (inherited-repair, confirmed).**
Severity: info (declared in the plan as the R56-V3 fifth recurrence). Base: `README_MAP: DRIFT files=163 rows=161 covered=161
bad=4` exit 1; freeze: `README_MAP: CLEAN files=163 rows=163 covered=163` exit 0. Reproduce: the two `node scripts/readme-map.mjs`
runs in the table above. No action for a wave seat.

**K68ExecGates-4 — the lane's own executable checklist is RED at base and its count is not reproducible run-to-run; `gate-mutants` alone yields exit 0 and exit 2 on identical bytes.**
Severity: high for operability (the round's "did the lane open green" question has no stable answer). Red items at base:
`SKILL.md:714` (proxy, -1), `:733` (readme-map, -3), `:726` `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=30
findings=6)` — host-side residue written today (`agent.db.pre-kimi58-unblock-20261027`, `config.yml.pre-kfc-roles-20261027`,
`lsp.json` …), i.e. the gate reads the live agent root and goes red whenever any agent edits it; `:728` `CAP_RUN_SELFTEST:
11/12 pass`; `:724` `gate-mutants`, which oscillates (below); `:712/:713` `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING)` and
`:720` `anchor-truth` exit 2 — tree-shape artifacts when `.ufo/reports` or git history are absent from the extraction.
Reproduce: `cd <base tree> && node scripts/surface-probe.mjs --checklists` → `VERDICT: FAIL` exit 1 (26/33; 25/33 on an
earlier run of the same tree). The substantive defect is `gate-mutants`: at one revision with identical `wave-census.mjs`
bytes it read `CLEAN frozen=41/41` exit 0 (45.7 s), `ERROR … unstable=3 timeout=1` exit 2 (102.9 s) and `ERROR …
control-fail=1` exit 2 (a clone, 2.5 s). The slow run's 102.9 s against the clean run's 45.7 s under load1 7–10 points at
timeout/unstable classification under load, not at the tree; the control-fail outcome (31/32) is unexplained. Because
`SKILL.md:724` gates on exit 0, a checklist closure can read red for a reason unrelated to any code change.

**K68ExecGates-5 — gate 1 is not in the lane and cannot express a frozen-revision reading in its prescribed form.**
Severity: medium (operability of the gate set itself). `sources-census.sh` lives at the fleet root
(`/home/vgpnk/Projects/shokunin/scripts/`), not under the lane's `scripts/` (which has `kimi-census`, `omp-census`,
`wave-census` only), and `validate --root <fleet> kumitate` resolves the lane directory from the conf, i.e. it reads the LIVE
worktree — so a lane-only clone cannot run the five-gate set and the prescribed command cannot score a frozen revision. I
therefore also ran the revision-bound form (`--file <extract>/corpus/SOURCES.md`, G1b) and it agrees with G1 here (six W04,
exit 0). `README.md` is 14 lines and names no gate run at all; the only command inventory is `SKILL.md`'s 33-item checklist.
Reproduce: `ls kumitate-shokunin/scripts | grep -c census` → 3, none of them `sources-census`; `grep -in gate kumitate-shokunin/README.md` → no hits.

**K68ExecGates-6 — `plan-before-ready` PASSes at HEAD through the `*-dispatch.json` fallback, not through a `.ready` marker, and reads NA at the base revision.**
Severity: low (the verdict is correct under the gate's documented fallback; the plan's sentence is what is imprecise).
`git log --diff-filter=A -- ':(glob).ufo/waves/round-68/*.ready'` prints nothing — no `.ready` was ever committed for round 68 —
and G7's verdict names `marker_kind=dispatch marker_path=.ufo/waves/round-68/w1-dispatch.json`. The plan says "Committed before
the first `.ready` marker (QUALITY Q58: … → PASS)"; Q58's stated ordering is `.ready`-first with dispatch only as fallback, so
the sentence describes a check the gate did not perform. At the base revision the command is `NA … reason=NO_PLAN_NO_MARKER`
exit 2, which is the correct "nothing to judge" reading, not a pass. Reproduce: the two G7/G7b rows above. No action needed
unless the L1 wants the plan's evidence sentence tightened.

## Artifacts

- `.ufo/waves/round-68/build/K68ExecGates/base-gates.txt` — G1..G7b, exact `CMD:`/`EXIT:`/verbatim output.
- `.ufo/waves/round-68/build/K68ExecGates/proxy-a-attack.txt` — A-term sensitivity (+5 dummy `.mjs` → delta +5) and the script census (543 total / 512 under `.ufo/waves` at base; 548/517 at freeze).
- `.ufo/waves/round-68/build/K68ExecGates/checklists-base.txt` — `surface-probe --checklists` in the base archive (26/33, exit 1); `checklists-base-clone.txt` — same in the `git clone --shared` at d23892ad (26/33, with the 712/713 `REPORTS_DIR_MISSING` bodies).
- `.ufo/waves/round-68/build/K68ExecGates/gate-mutants-base-clone.txt` — clone shape: `GATE_MUTANTS: ERROR … control-fail=1`
  exit 2, with `CONTROL wave-census FAIL … cases=31/32`; `gate-mutants-base-archive.txt` — archive shape: `GATE_MUTANTS: ERROR
  (mutants=43 killed=39 frozen=37/41 … unstable=3 timeout=1)` exit 2; `gate-mutants-base-archive-full.txt` — same archive,
  `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41)` exit 0.
- Scratch `/fast/scratch/hyaku/kumitate-r68/K68ExecGates/` deleted on exit (base archive, freeze archive, clone, attack tree, all receipts copied into the build dir above).

## Limits

- Gate 1 was run against the live lane (prescribed form) and against the base extraction (`--file`); I did not build a
  `shokunin.conf`-shaped fixture tree, so `--root`-form scoring of a frozen revision is unmeasured beyond `--file`.
- The root cause of the `gate-mutants` oscillation is not identified: four runs at one revision gave PASS 41/41, CLEAN 41/41,
  ERROR `unstable=3 timeout=1` and ERROR `control-fail=1`. The mutant ids behind `unstable`/`timeout` were not captured (the
  ERROR receipt only carries the summary line); the next probe is a full-capture rerun on the error path plus the control's
  failing case name, and a load-controlled rerun to test the timeout hypothesis.
- The checklist run in the archive shape cannot judge `:712/:713/:720` (they need `.git` and `.ufo/reports`); those three are
  method artifacts of the extraction, which is why the clone run is reported alongside.
- `CAP_RUN_SELFTEST: 11/12` failing case name not extracted; `OMP_CENSUS` findings were read from the gate's own lines, not
  audited against the agent root.
- No `--strict`/`--selftest` arms of the five gates were run beyond what the checklist run invoked; no tool was installed
  (node/git/bash already present), so nothing to record under the tooling directive.
- The proxy re-pin, the checklist repairs and the plan's evidence sentence are L1 integration decisions; this seat wrote no
  lane file outside `build/K68ExecGates/` and this report.
