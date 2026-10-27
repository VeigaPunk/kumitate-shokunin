# K66ExecSkillChecklist — checklist + harm run (round 66 w1)

VERDICT: At the freeze the lane's own checklist runs **27/33 pass** in a fresh clone (six red: two only because `round-gate`'s default reports dir is derived from the checkout's *parent*), the drafted routed-ledger item is executed by the frozen runner and passes (`SKILL.md:740`, `substring=hit`), and the base→tip harm matrix is **CLEAN, 36 gates, 0 harm, 2 CARRIED_MOVED** (exit 0).

## Evidence

All runs in a `git clone --shared` of the lane at `/fast/scratch/hyaku/kumitate-r66/K66ExecSkillChecklist/lane`, `TMPDIR=/fast/scratch/hyaku/kumitate-r66/K66ExecSkillChecklist/tmp`, `git -C lane rev-parse HEAD` = `621212bac37f8249c72ac982d1d6534cb8d60701`.

**(1) Frozen checklist, unmodified clone** — `node scripts/surface-probe.mjs --checklists` → exit 1 (`checklists-freeze.txt`):

```
CHECKLIST  FAIL SKILL.md:712 exit=2 expected=0 substring=miss wall=0.023 load1=4.97 — Round-close artifact audit
  | ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r66/K66ExecSkillChecklist/.ufo/reports is absent
CHECKLIST  FAIL SKILL.md:713 exit=2 expected=0 substring=miss wall=0.021 load1=4.97 — Filed-report tracking
  | ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir .../.ufo/reports is absent
CHECKLIST  FAIL SKILL.md:714 exit=1 expected=0 substring=miss wall=0.090 load1=4.97 — Proxy recompute ...
  | PROXY: DRIFT (A_DRIFT term=A declared=351 computed=460 delta=+109; C2_DRIFT term=C2 declared=156 computed=160 delta=+4; C2_TOTAL_DRIFT ...; K_MEMBERS_DRIFT ...; K_SECTIONS_DRIFT ...; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
CHECKLIST  FAIL SKILL.md:717 exit=1 expected=0 substring=miss ... | KIMI_CENSUS: DRIFT (MEMBER_MISSING search-index/)
CHECKLIST  FAIL SKILL.md:726 exit=1 expected=0 substring=miss ... | OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=28 findings=2)
CHECKLIST  FAIL SKILL.md:728 exit=1 expected=0 substring=miss wall=8.070 ... | CAP_RUN_SELFTEST: 11/12 pass
CHECKLIST_SKIPPED: 0
CHECKLIST: 27/33 pass
VERDICT: FAIL
```

**(1) Draft item added** as the last item of `## Verifiable checklist` (after `SKILL.md:739`; patch: `routed-ledger-checklist-item.patch`), then `--checklists` → exit 1, `checklists-with-draft-item.txt`:

```
CHECKLIST  PASS SKILL.md:740 exit=0 expected=0 substring=hit wall=0.050 load1=7.21 — Routed-ledger self-test suite (round 66; contract `kumitate-routed-ledger-v1`; 33 hermetic cases; the real run over the spot-check routed sections is the registry row's command, --rev M --from 55 --to 65 --classes)
CHECKLIST_SKIPPED: 0
CHECKLIST: 28/34 pass
VERDICT: FAIL
```

Direct receipt of the item's expected substring (`routed-ledger-selftest.txt`): `ROUTED_LEDGER_SELFTEST: PASS (33/33)` exit 0. Real run at the freeze (`routed-ledger-real-run-freeze.txt`): `ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md` exit 2 (data not written yet — expected).

**(2) Harm matrix** — `node scripts/harm-matrix.mjs --base 8d557f85312de4fcc82e09ff735d21436bc3746d --tip 621212bac37f8249c72ac982d1d6534cb8d60701 --lane <clone>` → **exit 0** (`harm-matrix-exit.txt`), `harm-matrix-base-tip.txt`:

```
HARM_MATRIX: CLEAN gates=36 held=29 repaired=1 carried=4 moved=2 new=0 gone=0 harm=0 harm_absent=0 new_red=0 unmeasured=0 ancestor=yes registry=d9375275ee2b base=8d557f85312d tip=621212bac37f
```

Every non-HELD row (verbatim, with the row's own `[exit=N]`; run exit 0):

```
HARM_ROW gate=readme-map base=NOT_CLEAN tip=CLEAN id=REPAIRED base_text="README_MAP: DRIFT files=160 rows=159 covered=159 bad=2 first=uncovered:lessons/round-65-verifier-spotcheck.md [exit=1]" tip_text="README_MAP: CLEAN files=160 rows=160 covered=160"
HARM_ROW gate=proxy-check base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED_MOVED base_text="PROXY: DRIFT (A_DRIFT term=A declared=351 computed=455 delta=+104; C2_DRIFT term=C2 declared=156 computed=159 delta=+3; ... [exit=1]" tip_text="PROXY: DRIFT (A_DRIFT ... computed=460 delta=+109; C2_DRIFT ... computed=160 delta=+4; ...)"
HARM_ROW gate=cite-check-fleet-dot base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED_MOVED base_text="CITE_CHECK: DRIFT (files=164 tokens=12311 errors=1667 warnings=821) [exit=1]" tip_text="CITE_CHECK: DRIFT (files=164 tokens=12313 errors=1667 warnings=821)"
HARM_ROW gate=kimi-census base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED base_text="KIMI_CENSUS: DRIFT (MEMBER_MISSING search-index/) [exit=1]" tip_text="KIMI_CENSUS: DRIFT (MEMBER_MISSING search-index/) [exit=1]"
HARM_ROW gate=omp-census base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED base_text="OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=29 findings=3) [exit=1]" tip_text="OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=29 findings=3) [exit=1]"
HARM_ROW gate=cap-run-selftest base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED base_text="CAP_RUN_SELFTEST: 11/12 pass [exit=1]" tip_text="CAP_RUN_SELFTEST: 11/12 pass [exit=1]"
HARM_ROW gate=bind-oracle base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED base_text="BIND_ORACLE: CONTROL_VISIBLE visible=1 paths=R/control [exit=1]" tip_text="BIND_ORACLE: CONTROL_VISIBLE visible=1 paths=R/control [exit=1]"
```

**(3) Location dependence, one tree, two invocations** (clone at the freeze):

```
$ node scripts/round-gate.mjs --reports-dir .ufo/reports
ROUND_GATE: CLEAN (round=33 lane=kumitate checks=10 errors=0 warnings=0)            exit 0
$ node scripts/round-gate.mjs
ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r66/K66ExecSkillChecklist/.ufo/reports is absent   exit 2
```

## Findings

**K66ExecSkillChecklist-1 — high, operability — two checklist items cannot pass outside a checkout whose parent is the fleet root.** What it attacks: SKILL.md's "Every item is read-only, runs from this repo's root" and any `git archive`-based checklist measurement (the plan measures every predicate over `git archive M`). Cause: `scripts/round-gate.mjs:154-155` `DEFAULT_MAIN_REPO = resolve(HERE,'..','..')` ⇒ `<checkout-parent>/.ufo/reports`; in a clone/worktree/archive that sibling does not exist. Reproduce: clone the lane at `621212ba`, `git -C <clone> checkout --detach 621212ba`, `node scripts/surface-probe.mjs --checklists` → `SKILL.md:712`/`:713` `exit=2 substring=miss`; then `node scripts/round-gate.mjs --reports-dir .ufo/reports` → `ROUND_GATE: CLEAN` exit 0 on the same tree. Fix proposed for the L1 (not applied; `scripts/` is not mine): `round-gate-reports-dir-proposal.md`, option (a) — pass `--reports-dir .ufo/reports` in the item text.

**K66ExecSkillChecklist-2 — medium, operability — the drafted checklist item is not freestanding: it adds a *new* red proxy term.** The proxy's `C` term counts executed checklist items (`^\s*- \[` lines) and `SCORECARD.md:289` declares `C=33`; my single added item moves the computed value to 34. Reproduce: `node scripts/proxy-check.mjs --strict` in the clone → `PROXY: DRIFT (… ; C_DRIFT term=C declared=33 computed=34 delta=+1; …)` exit 1, whereas the same run without the item has no `C_DRIFT` at all (`grep -c C_DRIFT checklists-freeze.txt` → 0; `…/checklists-with-draft-item.txt` → 2). So the item may only land together with the SCORECARD `C` bump in the same revision, or `--strict` gains a fresh error on top of the carried drift.

**K66ExecSkillChecklist-3 — medium, coverage — the round's new gate is invisible to the harm battery.** `git show 621212ba:scripts/harm-matrix-gates.json | grep -c routed-ledger` → **0** (36 gates, including a `*-selftest` row for every other gate), and `git show 621212ba:SKILL.md | grep -c routed-ledger` → 0 too. Attacks: the claim "every claim verifies and no axis is harmed" — a `routed-ledger` regression at a future tip reads `ABSENT_BOTH` and is never counted. Reproduce: `node -e 'const j=require("./scripts/harm-matrix-gates.json");console.log((j.gates||j).filter(g=>/routed-ledger/.test(g.id)).length)'` → 0. Not fixable by me (registry + L6 homes belong to the L1).

**K66ExecSkillChecklist-4 — low/medium, claim wording — the freeze commit *moves* two carried red readings.** `proxy-check` is `CARRIED_MOVED` (A 455→460 +5, C2 159→160 +1) and `cite-check-fleet-dot` is `CARRIED_MOVED` (tokens 12311→12313), i.e. the plan's "carried (D4)" is, in the frozen tool's vocabulary, moved by `621212ba` itself (`readme-map` is `REPAIRED` in the same commit). Reproduce: `node scripts/harm-matrix.mjs --base 8d557f85 --tip 621212ba --only proxy-check,cite-check-fleet-dot --lane <clone>`.

**K66ExecSkillChecklist-5 — low, host environment — `cap-run`'s hermetic suite is 11/12 on this host, at both revisions.** The failing arm is the usage arm, not a sandbox arm: `FAIL  usage arms exit 64 with CAP_RUN: USAGE (symlink source -> /tmp:exit=1,child=false,host=false)` (`cap-run-selftest.txt:1`). Checklist item 24 (`SKILL.md:728`) can therefore never pass here, and its stated precondition ("needs `systemd-run --user` and unprivileged bwrap") does not name the `/tmp`-symlink refusal that actually fails. Reproduce: `node scripts/cap-run.mjs --selftest`.

**K66ExecSkillChecklist-6 — low, documentation coherence — the checklist's own item count is prose the runner never checks.** Adding item 34 leaves `SKILL.md:691` ("Thirty-three items") stale while `--checklists` prints `CHECKLIST: 28/34 pass` with no `CHECKLIST_GRAMMAR`-class finding for the mismatch. Whoever lands the routed-ledger item must also bump that sentence; nothing will tell them.

**K66ExecSkillChecklist-7 — note, host-live readings — the two census items are host-state, and the host moved during the wave.** `kimi-census` is `MEMBER_MISSING search-index/` and `omp-census` reported `entries=28 findings=2` in the checklist run at 03:31 but `entries=29 findings=3` in the harm run at ~03:41 — the same gate, the same host, different findings twelve minutes apart. Neither is a tree harm (both `CARRIED`), but a report that quotes either as a stable number is quoting a live host.

## Artifacts

Build dir `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecSkillChecklist/`:
`checklists-freeze.txt` (33-item run), `checklists-with-draft-item.txt` (34-item run), `routed-ledger-checklist-item.patch` (the draft item + insertion point), `routed-ledger-selftest.txt` (`PASS (33/33)`), `routed-ledger-real-run-freeze.txt` (`FAIL-CLOSED ledger-absent`), `harm-matrix-base-tip.txt` + `harm-matrix-exit.txt` (36 rows + summary + exit 0), `cap-run-selftest.txt`, `round-gate-reports-dir-proposal.md`.
Report: `.ufo/waves/round-66/w1/K66ExecSkillChecklist.md`. Scratch `/fast/scratch/hyaku/kumitate-r66/K66ExecSkillChecklist` deleted on exit (no citable path left behind).

## Limits

- I measured the checklist in a `git clone --shared` at the freeze, not in an sdist/`git archive`; the archive case is inferred from finding 1's cause (`HERE`-derived default), not run.
- The harm run's absolute numbers are this host's: `kimi-census`, `omp-census`, `cap-run-selftest` and `bind-oracle` are red at both revisions for host reasons; I did not try to make them green.
- I did not run the full checklist against the lane worktree (in situ, where items 6/7 pass); the explicit-`--reports-dir` run is the evidence I used instead.
- The draft item exercises only `--selftest`; its real-run behaviour depends on `corpus/routed-ledger.md`, which does not exist yet, so the item currently passes while the gate is data-less — by design of the existing items, but worth knowing.
- Nothing in `scripts/`, `SCORECARD.md`, `SKILL.md`, `corpus/`, `.ufo/pins/` was edited in the lane; the only SKILL.md edit was inside the scratch clone, and no git write occurred outside that clone.
