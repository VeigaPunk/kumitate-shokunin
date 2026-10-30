# K70ReviewCounterR4 — c1 autoledger replay requirement + generated-open row baseline review

Seat: K70ReviewCounterR4 (reviewer, leaf). Scope: c1 `autoledger` real behavioral requirement and the
generated-open row baseline only. No production files touched; no candidate modified (none present —
see Verification status).

## Inputs read (absolute paths, with observed digests)

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/plan.md` (frozen, plan sha per assignment `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/probe/replay70-probe.mjs` (R4 gate lines: family/mode table, `label='LEDGER69_UNMET'` for c1, `text.includes(label) && text.includes('CONTROL-PASS '+mode) && preserved && fs.readdirSync(work).length===0`, `r.status===0`)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/c1-controls.sh` — frozen control, sha256 `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12`
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/controls/c1-autoledger.txt` — baseline receipt, sha256 `0fd37a31f209c91857f5dc4824a555a6373b796ebabbb0270303ec56338cfccf`
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-70.md` (Gate: quote line 24 of c2; "line 80 writes the unused fixed temporary file" — **c2-only**)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/ledger69-probe.mjs` lines 77–78 (`CHILD_ENV` allow-list `PATH,TMPDIR`; `mkdtempSync(join(tmpdir(),'ledger69.'))` — honors TMPDIR)

Commands observed: `sha256sum`, `grep -n`, `sed -n`, `cat`, `git -C … rev-parse/status` (read-only). Lane HEAD observed `1e00955a657a5b955992e23915143e7b3e261bb4`. No installs performed (node/python3/git already present; nothing to record).

## Restated requirement (what a faithful c1 autoledger replay must do)

From the frozen script + probe + plan contract, a correct `control-replay.mjs --family c1 --mode autoledger`
run must, with zero mutation outside its private work root:

1. Refuse unexpected frozen bytes: private copy of `c1-controls.sh` is generated only after its bytes match `git -C <lane> show 78b98d762ccf3e3a0961f94c4042eaabd2bcb706:.ufo/waves/round-69/probe/c1-controls.sh`.
2. Substitute the assignments `LANE` (line 18), `PROBE` (line 19), `W` (line 20), `S` (line 21) exactly once each, so `W` no longer targets the frozen receipt dir `.ufo/waves/round-69/controls` and `S` is a unique mkdtemp child under the supplied `--work` root.
3. Regenerate the synthetic fixture byte-faithfully (lines 27–41 skeleton; lines 43–70 python-generated OPEN rows), commit it in isolation, run the frozen `ledger69-probe.mjs` against it, and reproduce `LEDGER69_UNMET` with probe exit 1.
4. Compose `--out` exclusively (no overwrite; R9) from the receipt text **plus** the `CONTROL-PASS autoledger` marker, then reclaim the work child so `--work` reads empty (probe R4).
5. Exit 0 only on the real `LEDGER69_UNMET*` + `RC=1` branch (lines 79–81).

## Findings

### F1 — Requirement-text gap: c1's fixed TMPDIR write is not covered by the stated substitution set (defect, requirement level)

Plan implementation contract says: "substitute LANE/PROBE/W/S assignments exactly once, remove the known
unused fixed temporary write". The lesson Gate locates the *unused fixed temporary write at c2 line 80* —
c1-controls.sh has **no unused fixed write**; every c1 write is used. So a literal reading of the contract
under-transforms family c1: line 75

```
TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node "$PROBE" "$S/fx" "$REV" > "$W/c1-$MODE.txt" 2>&1 || RC=$?
```

would survive with its fixed `TMPDIR=/fast/scratch/hyaku/kumitate-r69` prefix intact. Observed consequence,
not hypothetical: `ledger69-probe.mjs:78` does `mkdtempSync(join(tmpdir(),'ledger69.'))` and its child
env (line 77) propagates TMPDIR, so each replay writes scratch under the **shared fixed fleet path**
`kumitate-r69/` — outside the supplied private work root, colliding with parallel seats (wave has
`K70AttackConcurrent` plus 3 other live c1/c2 replay runs at minimum) and violating the seat bound
"copies require private W/S and no frozen output paths". Requirement must add, for family c1: neutralize
the fixed TMPDIR prefix on the probe-invocation line (point it inside the same private mkdtemp child),
or scrub `HYAKU_SCRATCH` from the child env and substitute the whole line. Without this, R4 can PASS
mechanically while the implementation still writes to a frozen shared path — an operability defect the
probe does not catch (probe R4 only checks `--work` emptiness, not TMPDIR hygiene).

### F2 — Generated-open row baseline: fixture inputs must be pinned to base-rev bytes, not live lane (defect-risk with silent drift)

The autoledger row generator (lines 45–69) reads the spotchecks **as copied into the fixture** at lines
27–30 from `$LANE` live, and the probe-under-test is copied at line 27 from `$LANE/scripts/routed-ledger.mjs`.
The baseline receipt encodes exactly this input census: `rows=39 open=39 closed=0 wontfix=0`,
`first=QUOTE_ABSENT:A63x4@line27`, `L3 … unledgered:55#3,56#1,56#2,56#3`, `rule=L69 seed=1d4747620eb3002d`.
If the private copy substitutes `LANE` to anything other than a base-`78b98d76…` archive tree (e.g. leaves
it on the live lane, observed HEAD `1e00955a…`), any later edit to `corpus/lessons/round-5x-…-spotcheck.md`
or `routed-ledger.mjs` silently changes the generated rows (quotes at line 66 are derived from item first
words) and possibly the verdict detail — while R4's substring gate still passes. Faithful-replay requirement
must state: all four substituted paths, especially `LANE`, resolve against the frozen archive tree / `git
show 78b98d76…` bytes. This is the "real behavioral requirement" behind R4: reproduce the r69 control's
input census, not merely its two output substrings.

### F3 — `--out` composition must include the stdout-only CONTROL-PASS marker (requirement clarification)

Frozen c1-controls.sh writes probe output to `$W/c1-autoledger.txt` (line 75), appends `control=…` (line 77),
then emits `CONTROL-PASS autoledger` **to stdout only** (line 80). Confirmed: baseline receipt
`c1-autoledger.txt` contains no CONTROL-PASS line. The probe requires both `LEDGER69_UNMET` and
`CONTROL-PASS autoledger` inside the `--out` file. Therefore the implementation cannot just copy the
private W receipt; it must capture the private script's stdout (receipt cat + PASS line) or append the
PASS line explicitly. An implementer that copies only the W file fails R4 despite a faithful replay.

### F4 — R4 substring gate is necessary, not sufficient (bounded justification, disclosed limit)

`text.includes('LEDGER69_UNMET') && text.includes('CONTROL-PASS autoledger')` is satisfiable by a stub that
prints both strings without executing the frozen probe. Plan anticipates this: "seats attack this and
implementation-forgery controls, with limits disclosed rather than changing this predicate after scoring",
and "no semantic-remediation or universal forgery-resistance claim is made". Bounded justification: keep
the predicate frozen; the honest operability claim rests on (a) F1/F2 genuine-execution requirements,
(b) attack seats (K70AttackPrintStub, K70AttackConcurrent, K70AttackReceiptOverwrite observed in
`build/`) probing forgery, (c) R10 tool pin. Do not amend R4 after scoring.

### F5 — Fixture commit rev is not byte-reproducible (bound to state, not a defect)

Line 72 pins `user.name/user.email/gpgsign` but not the committer timestamp, so the fixture `REV` (baseline
`ca1cf2a55f8314cca9bd8630775796b1b252c1b0`) cannot recur; replay receipts will carry a different
`rev=` and `control=autoledger exit=1 rev=…` line. Reproduction claim is therefore behavioral — `LEDGER69_UNMET`,
probe exit 1, row census 39/39 open, PASS branch — never byte-equality with the baseline receipt. Anyone
asserting byte-identical replay receipts would be overclaiming.

### F6 — Environment scrub is genuinely required for the fixture git ops (justification with pointer)

Fixture git commands run cwd-relative with no `-C`: `git init -q` (line 24), `git add -A` / `git -c … commit`
(lines 71–72), `git rev-parse HEAD` (line 73), all under `cd "$S/fx"` (line 23). The r70 probe spawns the
tool with `cwd:<archive-tree>` and an inherited environment; on this jj/git-colocated fleet an inherited
`GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` would redirect the fixture commit into the wrong repository
or fail it. Contract clause "use explicit fixture-root git arguments and scrub inherited repository
environment" is load-bearing; the scrub list should cover at least `GIT_DIR`, `GIT_WORK_TREE`,
`GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, mirroring the allow-list
pattern already proven in ledger69-probe.mjs:77 (`PATH, TMPDIR` only).

## Residual risk / verification gaps

- Candidate implementation absent at review time: `scripts/control-replay.mjs` does not exist in the lane
  (observed `ls: cannot access …`), and `build/K70ExecRunner` is absent (observed). F1–F6 are requirement-level
  findings to re-check against the landed candidate; no implementation line was reviewed.
- R9 ordering: exclusive `--out` creation should precede any replay work so refusal is zero-mutation
  (probe only asserts content-unchanged + nonzero exit; either ordering passes, early refusal is the
  honest shape per r69 lesson "refuse an existing output").
- Receipt copy-out before cleanup and `readdirSync(work).length===0` are jointly satisfiable only if the
  mkdtemp child itself is removed after copy-out; the frozen script does not self-clean (it relies on
  `rm -rf "$S"` at line 22 before, not after). Implementation must own final removal.

## Verdict

Requirement set for c1 autoledger is **satisfiable but under-specified in two places that the mechanical
gate cannot detect**: F1 (fixed TMPDIR write outside the substitution set — concrete defect in the plan
wording, family c1) and F2 (live-lane source drift vs. the generated-open row baseline). Both are
operability defects with exact pointers; both must be closed in `scripts/control-replay.mjs` behavior,
not by predicate amendment.
