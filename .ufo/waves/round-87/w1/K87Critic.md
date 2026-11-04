# K87Critic — adversarial review of C1 `receipt-bind` (round 87, wave 1)

Seat: critic. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Frozen inputs read before any work: `.ufo/waves/round-87/plan.md` and
`.ufo/waves/round-87/probe/probe87-c1.mjs` (both at freeze commit
`25a3a75df123a59c5cf0de944a6d2f067e278f82`; neither was edited).

## Verdict (plain)

**Two seat-constructed controls reach `C87_C1: HELD held=12/12`.** Under the frozen kill
rule in `plan.md` ("Any seat-constructed control that reaches 12/12 is scored the same
way") **C1 is UNMET as measured by the twelve arms.**

- **(a) worktree hash — 12/12.** A tool that binds every lane instrument from the
  *worktree* file instead of `git show <rev>:<path>` passes all twelve arms. **No arm
  distinguishes revision binding from worktree binding.** This is the load-bearing
  counterexample: the claim's own sentence ("…at a judged revision") is not tested.
- **(e) hardcoded round-86 path + honest core — 12/12.** A tool that answers the one
  committed path from a canned line while implementing the contract honestly everywhere
  else also passes. This forges the *detection evidence* (arm `detect-r86`), not the
  capability.
- **(a′) receipt-declared `rev=` precedence — 12/12**, but the frozen arm `rev-bad`
  describes exactly this precedence ("receipts with no `rev=` and an unresolvable
  **default**"), so I do **not** score (a′) as a defect. It is flagged below as a residual
  ambiguity the judge must rule on, and the integrated instrument implements it.

The integrated instrument itself is **not** worktree-bound: `scripts/receipt-bind.mjs`
(untracked, sha256 `b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a`)
hashes `git cat-file blob <rev>:<path>` and passes my revision canary in the direction
that matters. **The defect is in the predicate, not in the candidate** — but the frozen
predicate is what the plan defines as the claim, so the round cannot record C1 as HELD on
this evidence without an explicit ruling.

## Method and disclosure

The lane has no `.ufo/waves/round-87/close/` yet (`ls` at HEAD `25a3a75d…` → ENOENT), so
arms 4–11 (`clean-r87`, `flip-cmd`, `flip-hash`, `unchecked`, `unresolved`, `rev-bad`,
`symlink`) cannot be scored against the real directory at all — every candidate, honest or
not, reads `no-r87-close`. To score them I used the frozen probe **unmodified** with
`--lane` pointed at a scratch clone of the lane at the freeze commit plus ten
contract-shaped round-87 close receipts generated from lane bytes at that commit:

```
git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  /fast/scratch/hyaku/kumitate-r87/K87Critic/lane87
node build/K87Critic/gen-fixture-r87.mjs <clone> 25a3a75df123a59c5cf0de944a6d2f067e278f82
```

Each fixture receipt is `rev= / tool_sha256=<digest of git show rev:path> / cmd=node
scripts/<x>.mjs --selftest / exit=0 / signal=none`; copies are kept in
`build/K87Critic/fixture-r87-close/`. The generator never touches the lane. The probe
binary is byte-identical to the frozen file (its own `git status` shows no modification).

Caveat, disclosed: because the clone path differs from the absolute lane paths inside the
round-86 receipts, the probe reports `external=2` on `detect-r86` where the real lane
reports `external=1` (the two absolute instruments are read from disk instead of from
`git show`). The `matched/mismatched/unchecked` triple the arm asserts is unchanged.

Score command (one per candidate, exit code captured in the transcript header):

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs \
  --lane /fast/scratch/hyaku/kumitate-r87/K87Critic/lane87 \
  --work /fast/scratch/hyaku/kumitate-r87/K87Critic/work \
  --rev 25a3a75df123a59c5cf0de944a6d2f067e278f82 \
  --tool /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Critic/<candidate>.mjs
```

Every construction is a file under `build/K87Critic/` and imports the shared honest core
`core.mjs`; each is a one-hook diff, so the deviation under test is exactly one behaviour.

## Scoreboard

| construction | file | held | exit | arms that FAIL it |
|---|---|---|---|---|
| honest reference (baseline, not a control) | `ref-gitshow.mjs` | **12/12** | 0 | — |
| **(a)** worktree hash | `cand-a-worktree.mjs` | **12/12** | 0 | **none** |
| (a′) receipt `rev=` precedence | `cand-a2-receiptrev.mjs` | **12/12** | 0 | none (sanctioned by `rev-bad` wording) |
| **(b)** path / file-count keyed | `cand-b-pathkeyed.mjs` | 6/12 | 1 | `flip-cmd`, `flip-hash`, `unchecked`, `unresolved`, `rev-bad`, `random-fixture` |
| **(c)** self-satisfying read | `cand-c-selfread.mjs` | 8/12 | 1 | `detect-r86`, `flip-cmd`, `flip-hash`, `random-fixture` |
| **(d)** one-shared-digest ⇒ CLEAN | `cand-d-shared.mjs` | 11/12 | 1 | `detect-r86` |
| **(e)** hardcoded round-86 path + honest core | `cand-e-hardcoded-r86.mjs` | **12/12** | 0 | none |
| (f) any-lane-script digest match (extra) | `cand-f-anyset.mjs` | 10/12 | 1 | `detect-r86`, `flip-cmd` |

Full per-arm lines: `transcript-<candidate>.txt` in the same directory.

## Finding (a): no arm distinguishes revision binding — 12/12

`cand-a-worktree.mjs` is honest in every respect except one hook: the instrument bytes come
from `readFileSync(join(lane, rel))` instead of `git show <rev>:<path>`. It still validates
that `--rev` resolves, so all structural arms hold. Measured: **12/12, exit 0**
(`transcript-cand-a-worktree.txt`).

Why the arms cannot see it: every arm runs against a lane whose worktree **is** the judged
revision, and arm `random-fixture` computes its expected digest with
`git show <rev>:<path>` over the same clean checkout. Worktree bytes and revision bytes are
the same bytes in that condition, so the two tools are observationally identical.

I proved the two tools are *not* equivalent, in a scratch clone that is one commit past the
judged revision (`rev-bind-canary.mjs`, exit 1,
`transcript-rev-bind-canary.txt`):

```
CANARY ref-gitshow.mjs        t1 (judged 25a3a75d): exit=0 CLEAN …            -> OK
CANARY ref-gitshow.mjs        t2 (judged 3e9c374e): exit=1 DRIFT mismatched=1 -> OK
CANARY cand-a-worktree.mjs    t1 (judged 25a3a75d): exit=1 DRIFT mismatched=1 -> INVERTED
CANARY cand-a-worktree.mjs    t2 (judged 3e9c374e): exit=1 DRIFT mismatched=1 -> OK
```

t1 is the decisive direction: a receipt bound to the bytes **at** the judged revision must
read CLEAN; the worktree-bound tool reads the newer bytes and reports DRIFT — a false
positive on a correctly bound receipt. The converse (a receipt bound to today's bytes but
judged at the old revision reads CLEAN) is the false negative that lets a stale receipt
launder itself.

The arms are *accidentally* sensitive to the divergence: on that mutated clone the frozen
probe scores `cand-a-worktree` at **11/12**, killed only by `clean-r87`
(`transcript-probe-mutated-cand-a.txt`; `ref-gitshow` stays 12/12 there,
`transcript-probe-mutated-ref.txt`). The frozen probe never creates that condition — it
always reads the lane as-is — so on the canonical clean checkout at M, (a) is 12/12.

Materiality: the lane's own round-86 receipts bind `rev=19b4e440…` while the lane is at
`25a3a75…`; a worktree-bound tool would verify them against today's checkout. That is the
exact use case of "at a judged revision", and it is untested.

**Kill rule:** (a) is a seat-constructed control at 12/12 → C1 UNMET (rejected-honest-stop)
unless the L1 rules that the predicate defect is recorded and the claim re-scoped.

## Finding (a′): receipt `rev=` precedence — 12/12, intended, residual ambiguity

`cand-a2-receiptrev.mjs` fetches lane bytes at the receipt's own `rev=` when present and
falls back to `--rev` otherwise. 12/12 (`transcript-cand-a2-receiptrev.txt`). The frozen arm
`rev-bad` is written as "receipts with no `rev=` and an unresolvable **default**", which
presupposes exactly this precedence, so (a′) is the plan's intended semantics rather than a
cheat. The canary's t2 shows the consequence: with a receipt that claims `revA` judged at
`revB`, the tool answers CLEAN (`transcript-rev-bind-canary.txt`, line `cand-a2-receiptrev
t2 … INVERTED`). The integrated instrument does the same thing deliberately (header line 17
"a per-receipt `rev=` overrides the default"; code lines 240–245; its own selftest asserts
`rev-per-receipt-overrides`). Judge call: if "at a judged revision" means the operator's
`--rev`, this precedence voids it for any receipt that carries `rev=`; if it means "some
resolvable revision the receipt names", it is satisfied.

## Finding (b): path / file-count keyed — 6/12

`cand-b-pathkeyed.mjs` never reads a receipt body: `round-86` in the directory path answers
the round-86 numbers, anything else answers `CLEAN matched=<.txt count>`. It still passes
`usage`, `selftest`, `detect-r86`, `clean-r87`, `dir-missing`, `symlink` (the shared core
does the structural fail-closed work before the override), and dies on `flip-cmd`,
`flip-hash`, `unchecked`, `unresolved`, `rev-bad`, `random-fixture`
(`transcript-cand-b-pathkeyed.txt`). This is a *stronger* path-keyed control than the
committed `controls/path-keyed.txt` (which scores 3/12 because it lacks usage/selftest) and
it is still nowhere near 12/12.

Load-bearing arms: `flip-cmd`/`flip-hash`/`unchecked`/`unresolved` copy the round-87
directory into a scratch path and change exactly one field, keeping filename and directory
count — a path or count key cannot follow them. `random-fixture` generates a receipt at run
time from a randomly chosen lane script, so no table survives. `rev-bad` is the only arm
that removes the `rev=` field and supplies an unresolvable default.

## Finding (c): self-satisfying read — 8/12

`cand-c-selfread.mjs` compares the receipt's own `tool_sha256=` against itself; the bytes it
resolves never decide the verdict. Killed by `detect-r86` (needs 1 matched / 9 mismatched,
gets 10 matched), `flip-cmd` and `flip-hash` (both must move the verdict and do not), and
`random-fixture` (the flipped digest still reads CLEAN)
(`transcript-cand-c-selfread.txt`). Those four are the only arms that mutate content that a
self-read would have to notice; every structural arm passes, which is why the count is 8.

## Finding (d): one-shared-digest ⇒ CLEAN — 11/12

`cand-d-shared.mjs` answers CLEAN whenever all receipts in a directory carry one identical
`tool_sha256=` and is honest otherwise. Killed by `detect-r86` alone
(`transcript-cand-d-shared.txt`): the round-86 directory is *itself* the
"all ten share one digest" shape, so the construction inverts the one verdict that matters
— the defect is that nine receipts *name* the wrong subject while carrying the right
subject's digest, not that they share a digest. `detect-r86` is load-bearing precisely
because it is the only arm whose correct answer is DRIFT over a homogeneous directory.

## Finding (e): hardcoded round-86 path + honest core — 12/12

`cand-e-hardcoded-r86.mjs` short-circuits only the directory ending in
`.ufo/waves/round-86/close` with the canned line and runs the honest core everywhere else.
Measured: **12/12, exit 0** (`transcript-cand-e-hardcoded-r86.txt`). Note this does not
refute the plan's "a tool that answers from a canned table … scores at most 3/12": that
statement is about a tool that keys *every* verdict. It does show that `detect-r86` alone
cannot distinguish "detects the R86 misnaming" from "knows the committed path" — the
detection evidence is forgeable by any candidate that is otherwise honest. Substance: (e)
**does** implement the claimed capability, so it is a kill-rule hit by the letter and not a
capability counterexample.

## Finding (f) (extra): any-lane-script digest match — 10/12

`cand-f-anyset.mjs` matches whenever the stored digest equals the digest of **any**
`scripts/*.mjs` at the revision, instead of the instrument the receipt names. Killed by
`detect-r86` (the R86 digests are all `counter-receipt.mjs`'s, so all ten "match") and
`flip-cmd` (the named instrument changes, the digest still belongs to another lane script)
(`transcript-cand-f-anyset.txt`). `flip-cmd` is load-bearing here: it is the only arm that
changes the *named subject* while leaving a valid digest in place, i.e. the arm that proves
per-receipt subject binding rather than set membership.

## Cross-check against the round's own instrument

`scripts/receipt-bind.mjs` (untracked in the lane worktree, byte-identical to
`build/K87ExecBind/receipt-bind.mjs`, sha256 `b640ff31…`):

- frozen probe on the clean fixture lane: **12/12, exit 0**
  (`transcript-probe-integrated-candidate.txt`);
- revision canary t1 (receipt bound at the judged revision, worktree ahead): **OK** — it is
  rev-bound (`git cat-file blob <rev>:<path>`, source line 186);
- revision canary t2: **INVERTED** — receipt-declared `rev=` precedence, which the tool
  documents and self-tests (`rev-per-receipt-overrides`; the dirty-worktree cases at source
  lines 497–502 already assert the axis the frozen probe misses)
  (`transcript-canary-integrated-candidate.txt`).

So the candidate has the capability the claim names; the twelve arms cannot certify it. That
is a fixable predicate defect, not a tradeoff in the implementation.

## Impacted axes

- `operability` / C1 capability `receipt-bind`: the after-state as measured by the frozen
  probe is satisfiable without the revision clause → the claim is not proven by its own
  predicate (kill rule → UNMET).
- The round's R86-D1 detection evidence: arm `detect-r86` is forgeable by a hybrid (e),
  so it should not be cited as independent proof that the lane *sees* the misnaming class.
- Nothing else: `usage`, `selftest`, `unchecked`, `unresolved`, `dir-missing`, `symlink`
  and the content-flip arms behaved as designed against every construction (they are the
  reason (b)/(c)/(d)/(f) die).

## Smallest safe correction

Arms are frozen this round, so the correction is for the next probe (round 88), not an edit:

1. **Arm 13 `rev-binding`** — a hermetic two-commit fixture repo built by the probe itself
   (`git init` in `--work`, commit A with `scripts/x.mjs`, commit B with different bytes),
   receipts that carry **no `rev=`** (so the CLI `--rev` is the default), tool run with
   `cwd` = fixture repo:
   - worktree at A, receipt digest = bytes@A, `--rev B` → expect `DRIFT matched=0
     mismatched=1` exit 1 (the worktree must not launder the judged revision);
   - worktree at A, receipt digest = bytes@A, `--rev A` → expect `CLEAN matched=1` exit 0
     (the false-positive direction).
   ~25 lines; kills (a) and leaves the honest core and the integrated instrument at 12/12
   (verified by `rev-bind-canary.mjs`, which implements exactly these two directions and
   exits 1 for (a), 0 for `ref-gitshow` and the integrated instrument).
2. **Optional arm 14 for `detect-r86` isolation** — run the detection over a *copy* of the
   round-86 receipts at a scratch path with the matched receipt's digest flipped, expecting
   `matched=0 mismatched=10` exit 1. Kills pure canned-table tools; it cannot kill a hybrid
   like (e), because (e) is honest on every content it does not hardcode — record that
   limitation instead of claiming A3 proves detection.

## Reproduction and artifacts

All artifacts: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Critic/`

| file | role |
|---|---|
| `core.mjs` | honest `kumitate-receipt-bind-v1` core with three override hooks |
| `ref-gitshow.mjs` | honest baseline (12/12) proving the fixture lane is well-formed |
| `cand-a-worktree.mjs`, `cand-a2-receiptrev.mjs`, `cand-b-pathkeyed.mjs`, `cand-c-selfread.mjs`, `cand-d-shared.mjs`, `cand-e-hardcoded-r86.mjs`, `cand-f-anyset.mjs` | constructions |
| `gen-fixture-r87.mjs`, `fixture-r87-close/` | round-87 close fixture generator + the ten receipts used |
| `rev-bind-canary.mjs` | two-directional revision-binding canary |
| `transcript-*.txt` | probe/canary transcripts with the exact command and exit code in the header |
| `SCORES.md` | scoreboard |

Exact results: (a) 12/12 exit 0; (a′) 12/12 exit 0; (b) 6/12 exit 1; (c) 8/12 exit 1;
(d) 11/12 exit 1; (e) 12/12 exit 0; (f) 10/12 exit 1; honest reference 12/12 exit 0;
integrated candidate 12/12 exit 0; canary exit 1 (inversions as listed); mutated-clone probe
`ref` 12/12 exit 0, `cand-a-worktree` 11/12 exit 1.

Scratch: everything lived under `/fast/scratch/hyaku/kumitate-r87/K87Critic/` (clones
`lane87`, `lane87-mut`, `work/`, `tmp/`); the mutation commit exists only in `lane87-mut`.
Scratch removed after the transcripts and fixture receipts were copied into the build
directory. No commit, push, stash, checkout, reset or `git add` was run in the lane or the
fleet repo; the only commits were in the scratch clone (`git -C <clone>` with inline
`user.name`/`user.email` after asserting `rev-parse --show-toplevel`). No tool installs or
upgrades were needed. No production file was written: the integration point for the
correction is the next round's probe, not `scripts/`.
