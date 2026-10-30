# K70ReviewCounterR9 — round-70 C1 replay isolation (operability), counter review for R9

Seat: K70ReviewCounterR9 (review, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.
Frozen plan read: `.ufo/waves/round-70/plan.md` (freeze commit 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a, "round-70: freeze replay isolation claim and negative baseline").
Frozen counter read: `.ufo/waves/round-70/probe/replay70-probe.mjs`. Frozen r69 sources read:
`.ufo/waves/round-69/probe/c1-controls.sh`, `.ufo/waves/round-69/probe/c2-controls.sh` — read-only,
never executed. Candidate `build/K70ExecRunner/control-replay.mjs` was NOT present when inspected
(`build/` held only `K70ExecFixtureTests/`, `K70ExecTransform/`, and attack-seat dirs; only a stale
scratch dir `K70ExecRunner/` exists under the round scratch root), so this review targets the frozen
counter and the implementation contract, per the seat scope: existing-output refusal.

No production file, no other seat's artifact, no commit, no push, no git mutation in the lane.
Fixtures were built only under my own scratch (`/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR9/`),
git `-C` was explicit, `rev-parse --show-toplevel` verified equal to the fixture before first commit.
One fixture repo, two commits, object sharing via `.git/objects/info/alternates` (read-only; no clone,
no lane write). Scratch cleaned after receipts were copied to this seat's build dir. No tools
installed or updated (node/git already present; pacman untouched).

## Verdict

Concrete defect in the frozen R9 check, reproduced end-to-end with the real frozen probe: a
`control-replay` implementation with **zero existing-output protection** scores **R9 PASS** and
**REPLAY70_HELD 10/10**. The R9 check cannot attribute a non-zero exit to the existing-output
condition, so it passes on any refusal — or crash — for any reason. This is distinct from sibling
`K70AttackReceiptOverwrite` finding F4 (tool performs *other writes* before the exclusive-create
refusal): here **no side effect at all is required**; R9's two terms are satisfied by a wrong-reason
refusal alone. Both findings stand independently; together they show R9 verifies almost nothing
beyond the literal byte content of the pre-existing file.

## F1 — R9 cannot attribute "refusal" to the existing-output condition (defect, demonstrated)

Counter code (frozen, `.ufo/waves/round-70/probe/replay70-probe.mjs`):

- Line 37: `const existing=path.join(root,'existing.txt');fs.writeFileSync(existing,'do-not-overwrite\n');`
- Line 38: `const collision=run(['--lane',lane,'--family','c1','--mode','donothing','--out',existing,'--work',root]);`
- Line 39: `check('R9',collision.status!==0&&fs.readFileSync(existing,'utf8')==='do-not-overwrite\n','existing output preserved');`

Weakness, term by term:

1. `collision.status!==0` (line 39) accepts **any** non-zero exit for **any** reason. There is no
   stdout/stderr marker requirement — contrast R2 (line 26), which regexes `st.stdout` for
   `CONTROL_REPLAY_SELFTEST: PASS` — and no exit-code value pin — contrast R8 (line 36), which
   requires exactly `status===64`. A refusal, a usage error, and an uncaught exception are
   indistinguishable to R9.
2. The R9 invocation passes `--work root` (line 38), and `root` is **non-empty by construction** at
   that point: it holds `tree/` (extracted archive), `result-0..4.txt`, `work-0..4/`, and
   `existing.txt` itself. Any tool that validates an empty work root exits non-zero here without
   ever inspecting `--out`.
3. The plan's contract requires "output creation exclusive" (plan.md, Implementation contract).
   Nothing in R9 enforces that property on a tool whose only gate is the work-root shape.

Demonstration (commands and observed outcomes; receipts in
`build/K70ReviewCounterR9/receipt-probe-stubA-held10.txt`, `receipt-probe-stubB-held10.txt`):

- `stubA-no-output-protection.mjs` (this seat's build dir) has **no** existing-output protection —
  it writes `--out` unconditionally — and refuses (exit 64) whenever the supplied `--work` root is
  non-empty. Standalone observation, empty work root + pre-existing output file:

  ```
  node stubA-no-output-protection.mjs --lane $S/fx --family c1 --mode donothing --out $S/standalone/outA.txt --work $S/standalone/wA
  exit=0
  outA content after: LEDGER69_UNMET held=0/1 (stubA receipt)     <- clobbered
  ```

- Frozen probe on the fixture commit carrying stubA (rev 865d90f1bdd136ce550448f6f47271887c8d3c28,
  base 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 + stub + registry/pin rows):

  ```
  env -u NODE_OPTIONS TMPDIR=$S/tmp node .ufo/waves/round-70/probe/replay70-probe.mjs $S/fx 865d90f1bdd136ce550448f6f47271887c8d3c28
  REPLAY70_HELD held=10/10 checks=10 ... live=no-live(vacuous-declared)
  R1 PASS ... R8 PASS ... R9 PASS existing output preserved ... R10 PASS
  probe exit=0
  ```

  stubA's R9 run exited 64 with `REFUSE(work-root-not-empty): ...` — the existing-output file was
  never consulted. The tool would clobber any existing `--out` whenever the work root is empty, yet
  the predicate reports R9 PASS and HELD.

- Control: `stubB-strict-refuse.mjs` refuses iff `--out` exists (exclusive create `wx`, exit 1) and
  is otherwise identical. Standalone: `exit=1`, `REFUSE(output-exists): ...`, content preserved.
  Frozen probe on its fixture commit (rev 28614bb4cc9e20c863d0cad6a4edb78a0d7dba82):
  `REPLAY70_HELD held=10/10`, R9 PASS, exit 0.

The predicate emits **identical** verdicts for a clobbering tool and a conforming tool on the R9
axis; R9 as frozen provides no signal distinguishing them.

## F2 — refusal-path work-root cleanup term present in R3–R7, absent in R9 (minor, inspection)

- R3–R7 (line 34) require `... && fs.readdirSync(work).length===0` — the tool's private work child
  must be reclaimed. Line 39 (R9) has no analogous term over the supplied work root after the
  collision run: a tool that creates its mkdtemp child and abandons it on the refusal path still
  passes R9.
- Scoped against sibling `K70AttackReceiptOverwrite` F4, which already demonstrated the broader
  blind spot (a tool clobbering a *live r69 receipt before* the exclusive-create refusal still gets
  R9 PASS). F2 is the same class, noted only as predicate-coverage inconsistency (the term exists
  at line 34 and was dropped at line 39); not re-demonstrated, to avoid double-counting.

## Bounded justification — what the frozen R9 does verify

For a tool whose only non-zero exit on the exact R9 argv shape is the existing-output refusal, the
two terms are sufficient: non-zero exit + byte-equal content prove the pre-existing file survived.
The plan's literal claim — "R9 existing output is unchanged after refusal" — is exactly what the
counter measures; the defect is the unqualified reading of "refusal". No candidate existed to check
against the contract's exclusive-creation duty, so this review cannot say whether the eventual
candidate is conforming — only that the counter would not catch a non-conforming one.

## Freeze and integrity checks (observed)

- `git cat-file -t 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` → `commit` (the freeze commit named by
  the assignment). `git diff 3dbe7e6e HEAD` over `plan.md` and `probe/replay70-probe.mjs` → empty;
  worktree clean for both. Plan and counter bytes are the frozen ones reviewed here.
- `base/` gained one post-freeze file, `band-control.json` (campaign band pin: r70 dispatch total 64
  PASS, `dispatch_observed: false`) — no counter bytes changed; irrelevant to R9.
- Frozen scripts verified byte-equal to the base commit:
  `c1-controls.sh` sha256 01efd6dde4c9…aeda12 (live == `git show 78b98d76:…`), `c2-controls.sh`
  sha256 679b7d9619ab…a66f4 (live == base) — freeze integrity holds; not modified by this seat.
- Plan pointer "scratch-before offending source … r69 c2 line 80" verified: c2-controls.sh line 80
  is `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt` — the known unused
  fixed temporary write the contract tells the candidate to remove.

## Commands observed (summary)

- `sha256sum plan.md`; `git diff 3dbe7e6e..HEAD -- plan.md probe/ base/`; frozen-script sha256
  comparison vs `git show 78b98d76:` → all reported above.
- Fixture build: `git init $S/fx`; alternates to lane objects; `git -C $LANE archive 78b98d76
  scripts corpus SKILL.md SCORECARD.md .ufo/pins .ufo/waves/round-69/probe
  .ufo/waves/round-69/controls | tar -x -C $S/fx`; `git -C $S/fx rev-parse --show-toplevel` →
  `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR9/fx` (verified before first commit); two
  commits (stubA rev 865d90f1…, stubB rev 28614bb4…) via explicit `git -C $S/fx`.
- Standalone stub observations (quoted under F1).
- Two frozen-probe runs (quoted under F1); both `REPLAY70_HELD held=10/10`, exit 0.
- Cleanup: receipts copied to `build/K70ReviewCounterR9/` first; scratch removed after the report.

## Residual risk and verification gaps

- No candidate existed at review time (`build/K70ExecRunner` absent). If a later candidate happens
  to refuse on non-empty work roots, R9 will pass for the wrong reason; if it refuses only on
  existing output, R9 passes rightly — the counter cannot tell. A strict reading of the contract
  ("output creation exclusive") is the only guard, and it is unenforced on this axis.
- Both probe runs report `live=no-live(vacuous-declared)`: the stubs synthesize receipts and never
  exercise the live c2 forgecapture arm, which remains network-dependent per the plan (failure is
  reported, never waived). The `preserved=true` terms in R3–R7 inherit the sibling F1/F3 caveats
  (archive-copy hashing; top-level-file snapshot) — out of this seat's R9 scope, not re-audited.
- I did not wait for or poll the executor seat; this review is bounded to the frozen counter and
  contract, per the seat spec ("avoid repeated broad round audit").
- Any remediation (attributing the R9 exit to the output collision, e.g. a pinned refusal code or a
  stdout marker, plus a work-root cleanup term) would change the frozen predicate; per the
  assignment the predicate must not be amended after scoring. Reported for the close sequence and
  for L1's integration notes, not for in-round edit.

## Artifacts (this seat's private build dir, `build/K70ReviewCounterR9/`)

- `stubA-no-output-protection.mjs` — wrong-reason-refusal demonstrator (clobbers existing `--out`).
- `stubB-strict-refuse.mjs` — strict control (refuses iff `--out` exists).
- `receipt-probe-stubA-held10.txt`, `receipt-probe-stubB-held10.txt` — frozen-probe outputs.
- `fixture-rev-stubA.txt`, `fixture-rev-stubB.txt` — fixture commit revs (fixture lived in scratch,
  since removed; reproducible from the stubs + base 78b98d76 + the procedure above).
- `standalone-stubA-clobbered-out.txt`, `standalone-stubB-preserved-out.txt` — standalone evidence.
