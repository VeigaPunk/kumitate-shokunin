# K89ScoutRecon — independent recon of the base instrument on the ten new arm inputs

Round 89 (hyaku run 15), seat `K89ScoutRecon`, read-only reconnaissance. No lane file was edited;
every artefact below lives in `.ufo/waves/round-89/build/K89ScoutRecon/` and every fixture lived
under `/fast/scratch/hyaku/kumitate-r89/` (removed before yield).

**Instrument judged.** `git cat-file blob a5d2503393fc5646acb6468888d8b12a445bf62d:scripts/receipt-bind.mjs`
→ `build/K89ScoutRecon/base-receipt-bind-v2.mjs`, sha256
`1f11f124198fdb894265dc69a75efeca5fbf43d931209d227b2bc1b29e5880ea` (matches `controls/table.txt`
line 1). The **lane worktree copy is dirty** (`git status --porcelain` → ` M scripts/receipt-bind.mjs`,
sha256 `cd88f7ed98a850faacf5dde664c552e6f556ce41d0706bb68a5eb6400a390b45`, header says v3): that is
a sibling's uncommitted candidate and was **not** used as the base for any run below.

Fixtures were written from scratch (`build/K89ScoutRecon/recon89.mjs`); probe89-c1.mjs was neither
imported, copied nor edited.

## Method

```
node recon89.mjs --tool ./base-receipt-bind-v2.mjs --out recon89-raw.txt        # 10 arms, 12 runs
node probe89-c1.mjs --lane <lane> --work <scratch> --rev a5d2503… --tool ./base-receipt-bind-v2.mjs
```

Fixture repo (drawn from a 12-hex nonce): commit **A** = body A, commit **B** = body B, commit **C**
(HEAD) = body C **plus a committed mode-120000 instrument**, index staged with body **S**, worktree
dirty with body **W**, an untracked instrument. `git -C <repo> rev-parse --show-toplevel` was
asserted equal to the fixture dir before the first commit (printed in every receipt as
`FIXTURE: repo=… A=… B=… C=… ok=true`).

Cross-check: the frozen probe scores this exact base blob `C89_C1: UNMET held=27/30`, failing
exactly `alias-proc-root`, `bom-rev`, `symlink-instrument` — byte-for-byte the row
`base-v2-at-rev` in `controls/table.txt`. Receipt: `probe-base-receipt.txt`.

## Ten raw verdicts (base v2 at a5d2503)

Raw lines as printed by the instrument; exit code after `exit=`.

| # | input | run | exit | raw verdict line | plan's arm expectation | per-input verdict |
|---|---|---|---|---|---|---|
| 1 | `default-rev-not-head` | no `rev=`, `--rev A`, HEAD=C | 0 | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0` | CLEAN matched=1 | **correct** |
| 2 | `index-not-judged` | no `rev=`, `--rev B`, index=S, HEAD=C | 0 | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0` | CLEAN matched=1 | **correct** |
| 3 | `abs-in-lane-at-rev` | absolute in-lane token, `rev=A`, worktree dirty | 0 | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0` | CLEAN matched=1 | **correct** |
| 4a | `limit-edge` | exactly 1048576 bytes | 0 | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0` | CLEAN matched=1 | **correct** |
| 4b | `limit-edge` | 1048577 bytes | 2 | `RECEIPT_BIND: FAIL-CLOSED RECEIPT_TOO_LARGE …/r.txt is 1048577 bytes (limit 1048576)` | FAIL-CLOSED RECEIPT_TOO_LARGE | **correct** |
| 5 | `limit-before-read` | 1 GiB sparse, mode 0000 | 2 | `RECEIPT_BIND: FAIL-CLOSED RECEIPT_TOO_LARGE …/r.txt is 1073741824 bytes (limit 1048576)` | FAIL-CLOSED RECEIPT_TOO_LARGE | **correct** (size judged before any read; the unreadable file is never opened) |
| 6 | `escape-inner-dotdot` | `scripts/../../<outside>/ext2-<nonce>.mjs` | 2 | `RECEIPT_BIND: FAIL-CLOSED ESCAPES_LANE r.txt relative instrument resolves outside the lane: scripts/../../outside-…/ext2-….mjs` | FAIL-CLOSED ESCAPES_LANE | **correct** (by resolution, not by token text) |
| 7a | `dup-equal-field` | `rev=B` twice | 2 | `RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 rev= lines` | FAIL-CLOSED AMBIGUOUS_FIELD | **correct** |
| 7b | `dup-equal-field` | `tool_sha256=` twice, equal | 2 | `RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 tool_sha256= lines` | FAIL-CLOSED AMBIGUOUS_FIELD | **correct** |
| 8 | `alias-proc-root` | `node /proc/self/root<lane>/scripts/<instr>`, `rev=A`, digest = dirty worktree W | 0 | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1` | DRIFT matched=0 mismatched=1 unchecked=0 external=0 | **FAIL-OPEN** — the worktree forge is hashed from disk and counted `external=1`, so the dirty bytes bind CLEAN without the revision ever being read |
| 9 | `bom-rev` | `\uFEFF` + `rev=A` + A's digest, `--rev C` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=r.txt` | CLEAN matched=1 | **false positive** — an honest receipt is reported as drift because `^rev=` never matches behind U+FEFF |
| 10 | `symlink-instrument` | committed mode-120000 instrument at C, digest = sha256(link text) | 0 | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0` | FAIL-CLOSED SYMLINK_INSTRUMENT | **FAIL-OPEN** — `cat-file blob` returns the link text, so the receipt binds `sha256(<target string>)` while the executed content is the target's |

Totals: **7 of 10 inputs correct** on base v2 (9 of 12 runs, the two two-run arms both correct);
2 fail-open (`alias-proc-root`, `symlink-instrument`), 1 false positive (`bom-rev`). Receipts: `recon89-raw.txt`, `recon89-run.log`.

## Is each arm's expected verdict right?

Yes, all ten. Each expectation is exactly what `kumitate-receipt-bind-v3` requires, and each is
distinguishable from the base's behaviour by the run above (no arm expectation is vacuously
satisfied by v2 except the eight that encode behaviour v2 already has). The two fail-opens and the
one false positive are the three arms the plan already predicts the base fails; they are not
disagreements with the plan.

Two expectations deserve the caveats the plan already records, and my runs confirm the caveats are
live rather than hypothetical: `bom-rev` (plan limit b: a stricter fail-closed-BOM implementation
would read UNMET — the arm pins one repair, not "any safe behaviour"), and `limit-before-read`
(plan limit c: it proves the size is judged before a read is attempted, which my mode-0000 fixture
shows directly, not that no read is ever attempted for a readable oversize file).

## Disagreement list against `plan.md`

**Arm expectations: none.** All ten are right and none contradicts base behaviour it claims.

**One disagreement with the plan's stated fixture rationale (a finding, not an arm defect).**
The plan says every fixture "directory name … is drawn at run time from a 12-hex nonce, so no
construction can key on a path (`/probe88/`)". That is false for the *arm* component of the name:
`probe/probe89-c1.mjs:119-120` builds every fixture directory as `` `${name}-${NONCE}` `` and
`name` is the literal arm name — `mk('default-rev-not-head')` (line 378), `mk('index-not-judged')`
(385), `mk('abs-in-lane-at-rev')` (392), `mk('limit-edge-ok'/'limit-edge-over')` (400-401),
`mk('limit-before-read')` (415), `mk('escape-inner-dotdot')` (428), `mk('alias-proc-root')` (454),
`mk('bom-rev')` (462), `mk('symlink-instrument')` (470), and the same for the twenty v2 arms. The
nonce randomises the suffix; the arm identity stays in the path, in a committed, frozen, public
file. A construction that never reads a revision, hashes a byte or parses a field can therefore
dispatch on `basename(--dir)`.

Also constant, and probe-keyed: the A28 alias literal `/proc/self/root` (line 455), the A30
instrument name prefix `link-` (lines 169, 471), the A20 flipped digest `'3'.repeat(64)` (line 369),
and the `close` basename of the round-86 receipt directory used by A3.

## Which of the ten inputs a *textual* implementation gets wrong

Under the strict reading ("no realpath, no resolution"): **two of ten** —

- `escape-inner-dotdot` — an escape check on the raw token text (reject only a leading `../`, or
  test a textual prefix) accepts `scripts/../../<outside>/x.mjs` as lane-relative; the round-88
  controls `c88-f4-textual-escape` and `c88-sentinel-ctl-escape-prefix` are exactly this and read
  26/30 failing this arm (`controls/table.txt`). Base v2 is correct here precisely because it
  resolves before it compares (`laneRel(lane, resolve(lane, instrument))`).
- `alias-proc-root` — lexical lane membership puts `/proc/self/root<lane>/…` outside the lane and
  hashes the worktree. Base v2 *is* the textual implementation for membership and its run above is
  the evidence (CLEAN, `external=1`).

If the same "judge the text you were handed" posture is extended from paths to bytes, **two more**:

- `symlink-instrument` — hashing the blob text instead of reading the git mode; base v2 is the
  evidence (CLEAN, `matched=1`).
- `bom-rev` — a `^rev=` line parser that does not strip U+FEFF; base v2 is the evidence (false
  DRIFT).

The remaining six (`default-rev-not-head`, `index-not-judged`, `abs-in-lane-at-rev`, `limit-edge`,
`limit-before-read`, `dup-equal-field`) are not path- or byte-textuality questions at all; a textual
implementation gets them right, as base v2 does.

## Cheapest probe-aware overfit against the frozen probe

Two constructions were built and scored; both reach the terminal score while skipping claimed
behaviour.

**O1 — arm-name dispatch (implements nothing).** `build/K89ScoutRecon/overfit-armname.mjs` (110
lines) never reads a revision, never hashes an instrument, never resolves a path, never parses a
receipt field. It strips the `-<12 hex>` suffix from `basename(--dir)` and prints the verdict line
that arm asserts (plus `readdir` on the sweep directory to count `s-*.txt` and to find the
`tool_sha256=3…3` receipt for `first=`). Scored by the frozen probe:

```
C89_C1: HELD held=30/30     exit 0        (build/K89ScoutRecon/probe-overfit-receipt.txt)
```

Every one of the thirty arms is satisfiable this way, because every arm's expected line is a
constant except `sweep`'s two counts and `first=`, which the receipt directory itself supplies.
This is the cheapest overfit that exists against probe89-c1: no git, no crypto, no lane.

**O2 — constant-keyed patches on the real v2 (the plausible seat construction).**
`build/K89ScoutRecon/overfit-constants-v2.mjs` = base v2 + (i) strip one leading U+FEFF — the
claimed behaviour, kept honestly — (ii) strip the literal `/proc/self/root` prefix instead of
realpath membership, (iii) refuse an in-lane instrument whose basename starts with `link-` instead
of reading the git mode. Scored:

```
C89_C1: HELD held=30/30     exit 0        (build/K89ScoutRecon/probe-overfit-constants-receipt.txt)
```

It passes A28 and A30 by keying on the probe's constants while skipping both behaviours generally.
Discrimination fixtures outside the probe path (`build/K89ScoutRecon/discrim89.mjs`,
`discrim89-receipt.txt`; v3 contract vs observed):

| fixture | v3 contract | base v2 | O2 (30/30) |
|---|---|---|---|
| D1 lane named through a **symlinked parent** (not `/proc/self/root`), receipt binds dirty worktree at A | `DRIFT matched=0 mismatched=1 external=0` | `CLEAN matched=1 external=1` | `CLEAN matched=1 external=1` |
| D2 committed mode-120000 instrument named **`alias-<nonce>.mjs`** (no `link-` prefix) | `FAIL-CLOSED SYMLINK_INSTRUMENT` | `CLEAN matched=1` | `CLEAN matched=1` |

So O2 reaches 30/30 without implementing realpath lane membership or mode-120000 detection at all —
the two behaviours A28/A30 are supposed to prove. (O1 is not even reachable outside the probe: it
prints `FAIL-CLOSED INTERNAL no arm named …` on both D1 and D2, which is the honest signature of a
pure name overfit.)

**Per-arm overfit surfaces** (what a construction could key on instead of implementing the arm):
`usage` → exit 64 + the string `USAGE`; `selftest` → print `RECEIPT_BIND_SELFTEST: PASS`;
`detect-r86`/`detect-r86-renamed` → `DRIFT 1/9/0/0` (dir basename `close` or the arm-named copy);
`clean-r87` → `CLEAN matched=11`; `unchecked` → `DRIFT 0/0/1/0`; `unresolved`, `untracked-instrument`
→ `UNRESOLVED`; `dir-missing` → `DIR_UNREADABLE` (the directory really is absent); `rev-bad` →
`REV_UNRESOLVED`; `symlink-receipt` → `SYMLINK_RECEIPT`; `rev-receipt-wins`, `default-rev`,
`default-rev-not-head`, `index-not-judged`, `abs-in-lane-at-rev`, `limit-edge-ok`, `undersize`,
`dup-none`, `real-dir`, `bom-rev` → `CLEAN matched=1 … external=0`; `escape-absolute` → `CLEAN
matched=1 external=1`; `worktree-forgery`, `rev-receipt-negative`, `alias-proc-root` →
`DRIFT 0/1/0/0`; `escape-relative`, `escape-inner-dotdot` → `ESCAPES_LANE`; `link-dir` →
`SYMLINK_DIR`; `oversize`, `limit-edge-over`, `limit-before-read` → `RECEIPT_TOO_LARGE`;
`dup-*` → `AMBIGUOUS_FIELD`; `sweep` → count `s-*.txt` and locate the `tool_sha256=3{64}` line;
`symlink-instrument` → `SYMLINK_INSTRUMENT`.

**Why this matters for the claim.** The frozen kill rule says any seat-constructed tool that skips a
claimed behaviour and reaches 30/30 makes C1 UNMET. O1 is such a tool (it skips all of them) and
reads 30/30 exit 0; O2 is such a tool for two of the three v3 behaviours and reads 30/30 exit 0.
Both were scored with the unmodified frozen probe. I report this as a **defect in the probe's
fixture naming and constant surface**, not as an edit request — the probe is frozen and I did not
touch it. It is also the same class as round 88's loss: the scorer's fixtures make the construction
space narrower than the contract. Under the rule as written, C1 is UNMET while probe89-c1 stands;
the L1/critic seats own that decision, not this seat.

## Limits of this recon

- One host (`/proc/self/root` → `/`, verified), one git (2.56.0), node v24.21.0; the A28 fixture is
  live here, so `alias-proc-root` is genuinely exercised rather than inert.
- The base's behaviour is characterised on these ten inputs only; I did not re-derive the other
  twenty arms except through the probe cross-check (27/30) and the two overfit runs.
- D1 uses a symlinked parent directory, not a bind mount: it shows that the `/proc/self/root` prefix
  strip does not generalise, which is all the kill-rule question needs; it does not measure how a
  realpath implementation behaves under a bind mount (untested, not claimed).
- Tooling: nothing installed or upgraded; no pacman, no network. Scratch removed
  (`/fast/scratch/hyaku/kumitate-r89/K89ScoutRecon*` absent at yield); every receipt cited above is
  in `build/K89ScoutRecon/`.

## Artefacts

| path (under `.ufo/waves/round-89/build/K89ScoutRecon/`) | what |
|---|---|
| `base-receipt-bind-v2.mjs` | the base blob at a5d2503, sha256 `1f11f124…880ea` |
| `recon89.mjs`, `recon89-raw.txt`, `recon89-run.log` | the ten-arm independent recon and its raw output |
| `probe-base-receipt.txt` | frozen probe on the base blob: `UNMET held=27/30` |
| `overfit-armname.mjs`, `probe-overfit-receipt.txt` | O1: 30/30, implements nothing |
| `overfit-constants-v2.mjs`, `probe-overfit-constants-receipt.txt` | O2: 30/30, two behaviours skipped |
| `discrim89.mjs`, `discrim89-receipt.txt` | D1/D2: what O2 (and base v2) still gets wrong |
