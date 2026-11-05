# K89Labrat — the frozen 30-arm probe cannot tell a verdict oracle from a binding instrument

Seat K89Labrat (probe-aware-overfit critic). Round 89, claim C1 `receipt-bind` v3.
Lane `kumitate-shokunin`, base `a5d2503393fc5646acb6468888d8b12a445bf62d`, freeze `adfc2f55`.
Every path below is relative to the lane root unless it starts with `/`.

## Verdict

**HOLDS.** A candidate that implements *none* of `kumitate-receipt-bind-v3` — no receipt read,
no `git cat-file`, no digest, no rev, no lane, no size — reaches **30/30** on the frozen
`probe89-c1.mjs`, at four independent runs over three nonce draws and two judged revisions.

Consequence under the frozen kill rule, stated without softening: this is a seat-constructed
control that skips every claimed behaviour by construction, so **C1 is UNMET** and round 89 is a
rejected-honest-stop for the third consecutive round on this capability. The rule and the plan's
own Limit (a) collide; see §6 — I report the collision, I do not resolve it.

The frozen probe was not edited: `sha256 = ab09dc131b98d9c5bb2a54e9db57b3393184a3a13993bcb7842d535f4d0b0f13`
before (`build/K89Labrat/probe-sha256-before.txt`) and after (`…/probe-sha256-after.txt`), and
`git status --porcelain .ufo/waves/round-89/probe/ plan.md .ufo/waves/round-89/controls/` is empty.

## 1. The two candidates

| candidate | sha256 | reads at run time | implements |
|---|---|---|---|
| `build/K89Labrat/labrat-probe-aware.mjs` | `25bf5873e14747e05b9b2636ca9486dcee23361c28849f7f901398f4b634da16` | the frozen probe source; `.git/logs/HEAD`; `.git/index`; the `--dir` path | nothing |
| `build/K89Labrat/labrat-label-only.mjs` | `7585a53ff00741bbf5fbdc5b571aa8a7f410bf618d2a31cfd199b1ad9022914f` | the `--dir` path only | nothing |

Both are ~200 / ~120 lines, of which the verdict table is most of it. Code-only capability audit
(`build/K89Labrat/capability-audit.txt`, comment lines stripped): `cat-file` 0, `createHash` 0,
`spawnSync` 0, `child_process` 0, `realpath` 0, `lstat` 0, `O_NOFOLLOW` 0, `truncateSync` 0,
`1048576` 0, in **both** files. The only `readFileSync` calls are the probe source, the two `.git`
metadata files, and (in the `sweep` arm only) the probe's own 33 small fixture receipts.

How a verdict is produced, in full:

1. `--dir` is passed by the probe as `<label>-<nonce>`; the label is a **source constant** of the
   probe (`mk(name)` → `` `${name}-${NONCE}` ``), the nonce is appended at run time.
   `build/K89Labrat/fixture-labels.txt` maps all 30 arms to the labels the probe hands over.
2. The candidate strips the 12-hex suffix and looks the label up in a table transcribed from the
   probe's own `arm(...)` conditions.
3. It prints the line and the exit code the probe is about to assert.

`.git` is read but never used for a verdict: `logs/HEAD` and `index` only confirm the nonce the
path already leaks (`build/K89Labrat/git-read-proof.txt` shows both paths exercised, and shows the
probe read is on the hot path — with no probe in any ancestor the candidate fails closed INTERNAL).

## 2. Probe receipts — final lines

| run | receipt | nonce | rev | final line |
|---|---|---|---|---|
| label-only | `build/K89Labrat/probe-label-only.txt` | `20422b06a0f0` | `a5d2503…` | `C89_C1: HELD held=30/30`, exit 0 |
| label-only | `build/K89Labrat/probe-label-only-run2.txt` | `b8fd55ebf2e4` | `a5d2503…` | `C89_C1: HELD held=30/30`, exit 0 |
| probe-aware | `build/K89Labrat/probe-probe-aware.txt` | `4dea79cef35d` | `a5d2503…` | `C89_C1: HELD held=30/30`, exit 0 |
| probe-aware | `build/K89Labrat/probe-probe-aware-headrev.txt` | `a9c2b5113f93` | `9c3b64e…` (lane HEAD) | `C89_C1: HELD held=30/30`, exit 0 |

Command (the frozen predicate, `--tool` added):

```
node .ufo/waves/round-89/probe/probe89-c1.mjs \
  --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --work /fast/scratch/hyaku/kumitate-r89/K89Labrat/run-probe-aware-final \
  --rev a5d2503393fc5646acb6468888d8b12a445bf62d \
  --tool /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-89/build/K89Labrat/labrat-probe-aware.mjs
```

Both transcripts are complete (30 `ARM` lines + the `C89_C1` line). The second revision is not a
different draw of the same thing: the candidate ignores `--rev` entirely and still scores 30/30,
including `sweep`, whose `matched` it derives from the fixture directory listing the probe wrote.

## 3. Why it holds — the arm-level reason

There is **no arm whose expected output is a function of the judged blob that the candidate must
compute.** Every one of the 30 arms falls into one of two classes:

- **29 arms — the expected verdict is a public constant of the probe source.** `CLEAN matched=1`,
  `DRIFT matched=0 mismatched=1`, `FAIL-CLOSED <TOKEN>`; the numbers `1`, `9`, `11`, `0`, `1` and
  every token are literals in `probe89-c1.mjs`. This includes all five revision-binding arms the
  round added to defeat rounds 87–88: `default-rev-not-head` (A21), `index-not-judged` (A22),
  `abs-in-lane-at-rev` (A23) are all `isClean(r, 1, 0)`; `worktree-forgery` (A12) and
  `rev-receipt-negative` (A14) are all `isDrift(r, 0, 1, 0)`. The fixture makes HEAD, the index and
  the worktree disagree — but the *answer* does not depend on which one wins, because the expected
  answer is written in the source.
- **1 arm — `sweep` (A20) — the only non-constant expectation.** `matched` is the number of
  `scripts/*.mjs` at the rev, and `first=` is the flipped receipt. Both are recovered from the
  probe's own fixture directory: count `s-*.txt`, then find the one whose `tool_sha256` is
  `3`×64. Neither requires opening the lane at the rev. The probe even prints the count it
  computed (`scripts=33`) after the arm runs, so the two numbers agree by construction.

The three v3 arms that v2 fails are the sharpest illustration. `alias-proc-root` expects
`external=0`; `bom-rev` expects `CLEAN matched=1`; `symlink-instrument` expects
`FAIL-CLOSED SYMLINK_INSTRUMENT`. All three are constants. A candidate needs no realpath
resolution, no BOM handling and no mode-120000 check to produce them.

The probe does have teeth — but only against overfits that are *not* label-aware. Round-88's
`c88-nogit-overfit`, which keyed on `.git/logs/HEAD` and public body constants, scores 17/30
(`controls/table.txt`). The defeat here is specifically the **arm label in the fixture path**,
which the run-time nonce does not cover: the plan's §"The thirty arms" says "every fixture body,
directory name, commit message and outside-directory name is drawn at run time from a 12-hex
nonce". The *bodies*, *commit messages* and *outside-directory names* are drawn; the **directory
name is `<arm-label>-<nonce>`** — the label is a source constant, and it is the only thing the
candidate reads.

## 4. Proof the verdicts are uncomputed (two-sided)

`build/K89Labrat/discriminate.txt` — one fixture repository under the seat scratch
(`git -C "$D" init -q`, `rev-parse --show-toplevel` asserted equal to `$D` before the first
commit), three commits plus a dirty worktree, then the *same* receipt directory given to the
committed v2 instrument and to both oracles:

- **D1** receipt `tool_sha256=` 64 nines, `cmd=` a real in-lane instrument at C:
  v2 → `DRIFT matched=0 mismatched=1` exit 1; both oracles → `CLEAN matched=1` exit 0.
- **D2** a fully correct receipt in a directory labelled `novel-<nonce>` (a label the probe never
  draws): v2 → `CLEAN matched=1` exit 0; both oracles → `FAIL-CLOSED INTERNAL unknown fixture
  label` exit 2.

Same bytes, opposite verdicts in both directions. The oracle's output is a function of the
directory name and nothing else.

## 5. Smallest safe correction — measured, not asserted

`build/K89Labrat/make-labelless-probe.mjs` copies the frozen probe and changes exactly three
lines: `mk(name)` → `mk()` drawing `randomBytes(6).toString('hex')`, and the two explicit
`join(fixRoot, …)` fixture names lose their labels. Nothing else changes — same arms, same
assertions, same bodies, same commits, same nonce. The frozen file is opened read-only and its
sha256 re-checked in the same process. Diff: `build/K89Labrat/labelless-probe.txt`
(repaired copy sha256 `74532a8a…`).

Scores under that copy (`build/K89Labrat/labelless-*.txt`):

| tool | frozen probe | labelless probe | failing arms under labelless |
|---|---|---|---|
| committed v2 (`base-v2-at-rev.mjs`, `1f11f124…`) | 27/30 | **27/30** | identical: `alias-proc-root`, `bom-rev`, `symlink-instrument` |
| `labrat-probe-aware.mjs` | 30/30 | **4/30** | every arm but `usage`, `selftest`, `detect-r86`, `dir-missing` |
| `labrat-label-only.mjs` | 30/30 | **4/30** | same four |

The repair is behaviour-preserving for a real instrument and fatal to the oracle. That is the
smallest change that closes *this* construction.

It does **not** close Limit (a). With random labels a candidate can still read the probe source
and correlate other observable fixture features to the arm (file counts, a symlink in the
directory, a 1 048 576-byte file) and pick the constant answer. Label removal raises the cost from
"read one path component" to "reconstruct the arm from the fixture's shape"; it does not make the
expected verdict a function of the judged blob.

## 6. The rule/limit collision (for the L1, not decided here)

Plan §Limits (a): "The probe is an output-text oracle: it reads the instrument's verdict lines, so
an implementation that prints a verdict it did not compute is out of its reach; the instrument's
bytes are the judged object and the wave's mutation seats attack them."

Plan §Kill rule: "Any control … that reaches 30/30 makes C1 UNMET … A seat-constructed control is
a tool that skips a claimed behaviour … by construction."

Both are frozen. My control is exactly the class Limit (a) declares unobservable, and it is
exactly the class the kill rule rejects. Under the letter of the kill rule the verdict is UNMET;
under Limit (a) the probe was never able to test it. The two cannot both govern. Either the kill
rule is scoped to controls that compute a verdict from bytes they read (in which case Limit (a)
must be recorded as stated non-coverage, and this report is a limit note, not a kill), or the
probe must stop being an output-text oracle. The L1 has to pick; this seat only measured which
way the evidence points: **no candidate can be admitted under the current pair**, because any
candidate at 30/30 can be paired with an oracle at 30/30 that skips the behaviour, and the probe
source is readable from inside the lane.

## 7. Impacted axes

- Operability (the claim axis): C1 does not move; the capability row does not enter the table.
- Nothing else is touched: no instrument, no corpus, no pin, no `LOG.md`/`SCORECARD.md`.

## 8. Tooling and scratch

- No tool installed or upgraded; host `node v24.21.0`, `git 2.56.0` used as-is.
- Scratch `/fast/scratch/hyaku/kumitate-r89/K89Labrat` held every fixture (each `git -C "$D"`
  named explicitly, toplevel asserted before the first commit); it is removed before this seat
  yields. No `/tmp` path is cited anywhere.
- Every mutating git call was on a fixture under that scratch; the lane was only read
  (`git show`, `git ls-tree`, `git status`, `git rev-parse`).
