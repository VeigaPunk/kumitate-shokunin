# K80ScoutFreeze — round-80 freeze-integrity recon (read-only)

Seat: `K80ScoutFreeze`. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Revisions: base `1968689f9097f839457e242b41f83879e99af58e`; freeze `c6a7ebd3bd01ec34b2f9349a6756886c5dd85982`;
scaffolding `6d03402fddf44cc9797ec590f0f888e933db4677`; HEAD was `ed64ddca` when the recon opened and
`509afb1d6ec5fc854c1398ae0060d6298ed621d1` when it closed — the lane moved under the recon (a corpus
increment committed, then seat outputs appeared untracked).

Nothing in the lane was edited by this seat. Every script and fixture lived under
`/fast/scratch/hyaku/kumitate-r80/K80ScoutFreeze` (deleted at yield). Receipts are in
`.ufo/waves/round-80/w1/K80ScoutFreeze/` (`*.txt`; no runnable file was written into the lane).

## 0. Verdict in one screen

| Check | Result |
|---|---|
| Counters byte-identical to the freeze commit; scaffolding did not touch them | **HOLDS** |
| Open-state claims re-derive at base `1968689f` | **HOLDS** (live-root churn caveat, §2) |
| Base readings below target | **HOLDS**: C1 `6/13`, C2 `4/12` (`--lane` at base) |
| SCAF readings | **HOLDS**: C1 `13/13`, C2 `12/12`, both exit 0 |
| A do-nothing implementation cannot pass | **HOLDS**: base 6/13 & 4/12; constant printer 2/13 |
| Plan's after-state values re-derive at the measured revision | **DOES NOT HOLD** — `spotchecks=47` (measured 46) and `PROXY: MATCH (… C2=197/197 …)` (measured red at both committed HEAD and the worktree) |
| Frozen arm set discriminates the claimed deltas | **PARTIAL** — 2 of 13 C1 arms are vacuous (pass at base), 1 arm measures the lane, 1 claimed arm behaviour is ungated |

Twelve FREEZE-FIX items are listed in §4. Nothing here is an approval.

## 1. Freeze byte integrity — HOLDS

```
$ git show c6a7ebd3:.ufo/waves/round-80/probe/probe80-c1.mjs | sha256sum
9cbd0281d835f68107567891f5a3492b4a0620b6005704d4b0f86756d97c0139  -
$ git show c6a7ebd3:.ufo/waves/round-80/probe/probe80-c2.mjs | sha256sum
ad514cf410c6065601157f96933958e95e72193002f54fefe7af1061e690b470  -
$ sha256sum <lane>/.ufo/waves/round-80/probe/probe80-c1.mjs <lane>/.ufo/waves/round-80/probe/probe80-c2.mjs
9cbd0281…0139  …/probe80-c1.mjs
ad514cf4…b470  …/probe80-c2.mjs
```

`git show --stat c6a7ebd3..6d03402f` touches seven files (`.ufo/pins/omp-shape.json`,
`.ufo/pins/readme-map.json`, `SCORECARD.md`, `SKILL.md`, `corpus/README.md`,
`scripts/proxy-check.mjs`, `scripts/spotcheck-adopt.mjs`) — **none** under
`.ufo/waves/round-80/probe/`, and `git log -- .ufo/waves/round-80/probe/` lists only the freeze
commit. Receipt: `probe-integrity.txt`.

## 2. Open-state re-derivation at base `1968689f` — HOLDS

Archive: `git archive 1968689f | tar -x -C <scratch>/base`; the base tools were run with the base
archive as their own lane. Receipt: `open-state.txt`.

| Plan §Open-state claim | Re-derived command | Observed | Exit |
|---|---|---|---|
| proxy DRIFT with three named findings | `node base/scripts/proxy-check.mjs` | `C2_TOTAL_DRIFT 194/195; O_MEMBERS_DRIFT 64/65; AXES_DRIFT 10/9` | 1 |
| spotcheck map red for the r79 lesson | `node base/scripts/spotcheck-adopt.mjs --lane <base> --check` | `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=1 first=corpus/lessons/round-79-verifier-spotcheck.md` | 1 |
| conflation (`uncovered=0 first=oracle`) | same tool, `--lane <live lane>` | at first run: `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=0 first=oracle`; later, after the scaffolding adoption: `CLEAN … uncovered=0` | 1 / 0 |
| omp census clean | `node base/scripts/omp-census.mjs` | `OMP_CENSUS: CLEAN (entries=65 findings=0 bound=35/35)` | 0 |
| shape compare drifts by the operator backup | `node base/scripts/omp-census.mjs --compare base/.ufo/pins/omp-shape.json` | `DRIFT entries=65 receipt=64 added=1 first=config.yml.pre-rebalance2-20261104` | 1 |
| kimi census clean | `node base/scripts/kimi-census.mjs` | `KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)` | 0 |
| sources census clean, six W04 | `node base/scripts/sources-check.mjs`; `node base/scripts/source-dupes.mjs` | `SOURCES_CHECK: CLEAN (rows=171 …)`; `SOURCE_DUPES: CLEAN groups=6 known=6` | 0 / 0 |

Live-root caveat, observed not inferred: earlier in the same session the same census read
`OMP_CENSUS: CLEAN (entries=69 …)` and `OMP_SHAPE_COMPARE: DRIFT entries=69 receipt=64 added=3 …
transient=2`; minutes later it read 65 / `added=1 transient=0`, stable across four samples. The live
root churns at second granularity under the fleet's own agents — the premise C2 is built on.

## 3. Counter readings

Receipts: `counters.txt`, `c1-base.txt`, `c2-base.txt`, `c1-scaf.txt`, `c2-scaf.txt`, `stub.txt`.

| Counter | `--tool` | `--lane` | Held | Exit |
|---|---|---|---|---|
| C1 | base archive | base archive | `6/13` | 1 |
| C1 | base archive | live lane (default) | `6/13` | 1 |
| C1 | SCAF archive `6d03402f` | SCAF archive | **`13/13`** | 0 |
| C1 | live lane | live lane | `13/13` | 0 |
| C2 | base archive | base archive | `4/12` | 1 |
| C2 | base archive | live lane (default) | `5/12` | 1 |
| C2 | SCAF archive `6d03402f` | SCAF archive | **`12/12`** | 0 |
| C2 | live lane | live lane | `12/12` | 0 |

- C1 base re-derives arm-for-arm identical to `open/c1-base.txt` (`diff` of the arm lines: empty).
- C2 base with `--lane base` has the same PASS set `{4,6,7,11}` and the same `held=4/12` as
  `open/c2-base.txt`, but **detail lines differ** (the frozen transcript carries `A_DRIFT` in arms
  4/7 and `census_exit=2` in arm 9; the re-run does not) — see F4.
- Constant printer: a stub `spotcheck-adopt.mjs` that prints both lines and exits 0 scores `2/13`
  (arms 1 and 13). The frozen control's stub scored `3/13` because it also faked
  `SPOTCHECK_ADOPT_SELFTEST: PASS (26/26)` to satisfy arm 12. No do-nothing implementation reaches
  either target.

## 4. FREEZE-FIX items (flaws, not approvals)

**F1 — plan value does not re-derive: `spotchecks=47`.** §C1 after-state claims
`SPOTCHECK_COVERAGE: CLEAN spotchecks=47 uncovered=0`. Measured at SCAF bytes and at the live lane:
`spotchecks=46 uncovered=0` (twice, `c1-scaf.txt`, `lane-state.txt`). The correction exists only in an
**uncommitted** worktree "Amendment 1" (§5); committed bytes still say 47. The plan's own freeze rule
("a post-freeze defect is answered with a named erratum in the round lesson, never a silent edit") is
not met by an uncommitted plan edit.

**F2 — plan cites paths that do not exist.** §Controls names `controls/c1-base.txt` and
`controls/c2-base.txt`. `controls/` contains only `c1-stub.txt` and `c2-stub.txt`; the base
transcripts are `open/c1-base.txt` and `open/c2-base.txt` (confirmed by `git ls-tree` at the freeze
commit). A closure following the plan's path gets ENOENT.

**F3 — the open receipt set is 5/6 frozen.** `open/sources-census.txt` is cited by §Open-state but is
absent from the freeze commit's tree; it was committed later, in `509afb1d`. The "frozen before the
wave" property covers the other five `open/` files, not this one.

**F4 — the base controls are lane-state dependent and the receipts do not say so.** C2's fixtures are
materialised from the **lane's** receipt (`root65` = receipt, `root68` = receipt + 3), so
`--tool base` with the live lane reads `5/12` today (arm 8 flips because the lane receipt is now 65
instead of 64) while `--lane base` reads the frozen `4/12`. The frozen `open/c2-base.txt` does not
record which `--lane` produced it, and its own details (A_DRIFT, census_exit=2) no longer reproduce.
The same class affects C1 arm 13, which runs against `--lane`: the frozen transcript records the
lane's then-state (`uncovered=1 first=…round-79…`), today's records `uncovered=0 first=oracle`.

**F5 — two C1 arms are vacuous (they assert a label the base already emits).** Arms 9
(`adopt-duplicate-refused`) and 11 (`rollback-clean`) pass **at base** with the identical token
`REFUSED_ORACLE` and byte-identity. Base and v3 carry the same duplicate-row guard
(`/^(format-unmapped|duplicate-row):/ → refuse()`), and base already implements journal recovery
(`recover()`, `REFUSED_JOURNAL_FOREIGN`), so neither arm tests a v3 delta. Arm 11 additionally never
asserts "journal retired" (the plan's own arm text): its predicate is `exit 2` + exact token + hashes
unchanged. Five of thirteen C1 arms pass at base (`{6,7,9,10,11}`); 6, 7 and 10 are legitimate
preservation arms, 9 and 11 are not.

**F6 — C1 arm 13 measures the lane, not the tool.** `live-lane-clean` invokes the tool against
`--lane`, so a constant printer that emits the coverage line and exits 0 passes it (my stub did). It
catches a red lane; it contributes no discrimination against a stub.

**F7 — plan/counter drift on arm 12's threshold.** Plan says `n ≥ 25`; the counter requires
`Number(m[2]) >= 26`. Measured `28/28`. Stricter than the plan, so no false pass, but plan text and
frozen code disagree.

**F8 — a claimed arm behaviour is ungated.** Plan arm 12 says `live-opt-in-clean` runs "against the
real live root". The counter does not: it sets `OMP_AGENT_ROOT: root65` (a fixture). The plan's
after-state claim that `--omp-live` on the live root reads `O_members=65` (`source=live`) is therefore
asserted by no arm. I probed it once — `source=live`, `O_members=65`, `O_findings=0`, `O_bound=35` —
true at that moment, but the live root read 69 entries earlier in the same session.

**F9 — the C2 after-state does not re-derive at the measured revision.** At committed HEAD
(`509afb1d`) bytes the proxy reads `C2 declared=195 computed=197` → `DRIFT`, exit 1, `source=snapshot`;
the stanza in that commit says 195 while the commit message claims "stanza C2 re-measure 197"
(`head-bytes.txt`). At the worktree, a seat has since re-measured the stanza to 198 and an untracked
`corpus/lessons/round-80.md` row exists, so the reading is `C2 198/198` **and**
`A_DRIFT declared=886 computed=889` → `DRIFT`, exit 1 (`lane-a-drift.txt`). Neither state matches the
plan/amendment's `PROXY: MATCH (… C2=197/197 …)`. The O terms themselves do re-derive in both states:
`O_members=65 O_findings=0 O_bound=35 coverage_omp=10 source=snapshot` with
`OMP_AGENT_ROOT=/nonexistent`.

**F10 — a seat wrote runnable files into the lane tree, moving A.** Three untracked runnable files
exist under `.ufo/waves/round-80/w1/K80LabratC2/`: `materialize.mjs`, `run-matrix.sh`,
`summarize.mjs`. A counts `*.mjs|*.js|*.sh|*.py` under `--self` (proxy-check derivation header), so
A moved 886 → 889 and the closure cannot read MATCH until they are removed or the stanza is
re-measured. This is exactly what the round rule forbids ("put every script you write in scratch,
never in the lane tree"). They are not this seat's files and were not touched.

**F11 — the stub controls are not re-derivable.** `controls/*-stub.txt` are transcripts only; the stub
programs are not committed. My reconstruction of the C1 stub scores `2/13`, not the recorded `3/13`
(the recorded stub must also have emitted a fake `SPOTCHECK_ADOPT_SELFTEST: PASS (26/26)`). The
constant-JSON C2 stub (`1/12`) was not reproduced for the same reason.

**F12 — receipt legibility.** `open/c2-base.txt` arm 1 records `O_members=67` — the counter's
receipt+3 fixture — while the plan prose speaks of the live root's 65. The same command now reads 68
because the lane receipt is 65. A reader cannot tell which `O_members` each line denotes.

## 5. Live-lane hazards the close must handle

- **The plan is being amended in the worktree.** `.ufo/waves/round-80/plan.md` is `M` against HEAD
  with a 17-line "Amendment 1" appended (`plan-amendment.txt`); the committed plan is identical to
  the freeze commit. The amendment itself is honest and corrects `47 → 46`, but it is uncommitted, so
  committed-bytes re-derivation still sees the wrong number.
- **The stanza is being re-measured in the worktree.** `SCORECARD.md` is `M`; the worktree declares
  `C2=198 C2_total=198`, HEAD declares 195, and the `509afb1d` message says 197. Three different
  values for one term across three surfaces.
- **HEAD moved during the recon** (`ed64ddca → 509afb1d`), and `509afb1d` rewrote
  `.ufo/pins/readme-map.json` (398 lines) and `.ufo/pins/source-captures.json` (1142 lines) — two
  pins changed after the freeze and after dispatch. Not a rule breach by itself, but "frozen plan and
  counters" coexists with a movable scorecard and movable pins.
- **A is a moving target while the wave writes.** The close receipt must be taken after the last file
  lands and after the `K80LabratC2` scripts are removed (F10), or the stanza must be re-measured to
  the final A.

## 6. What re-derives cleanly (positive evidence)

- Counters frozen and untouched; SCAF does not edit `probe/`.
- Open state at base: all seven readings reproduce (three named proxy findings, `uncovered=1`, the
  conflation, `65/0/35`, `added=1 first=config.yml.pre-rebalance2-20261104`, kimi `55/55`, sources
  `171` rows / six duplicate groups).
- SCAF: C1 `13/13`, C2 `12/12`, exit 0; the discriminating arms (C1 2/3/5/8; C2 1/2/3/5) all fail at
  base and pass at SCAF.
- Receipt: 65 entries, sha256 `84e41b9f5167479f2d806686ee702db49d0ebd0a83e6bcb28bd444d50eb0c435`,
  equal to `pin.omp-shape` in `SCORECARD.md` and to the blob at `6d03402f`;
  `omp-census --compare` → `IN_SYNC entries=65 receipt=65`, exit 0.
- Wave shape: `w1/swarm-registry.json` has 13 members (scout 2, executor 3, scribe 2, connector 1,
  critic 1, reviewer 2, mutation-tester 1, revenger 1); attack = 4/13 = 31 % ≥ 25 %; the C2 probe
  rides `revenger` (`K80LabratC2`) — amendment item 3 re-derives.

## 7. Remaining unknowns

- Whether the worktree amendment and the 198 stanza will be committed (not this seat's call).
- The exact fleet `sources-census.sh` invocation: I used the lane's `source-dupes.mjs` (`groups=6`)
  and `sources-check.mjs` (`rows=171`), which agree with the six W04 lines in the receipt but are not
  the same instrument.
- The frozen stub programs' bytes (F11), so `3/13` and `1/12` cannot be re-derived exactly.
- The close-time A and C2 values: both depend on whether `K80LabratC2`'s three scripts are removed and
  whether the r80 lesson row is committed with a matching stanza.

## 8. Tooling

No tool was installed, upgraded or changed. No package manager was invoked. Scratch root
`/fast/scratch/hyaku/kumitate-r80/K80ScoutFreeze` was removed before yield; the receipts cited above
were copied into this report directory first.
