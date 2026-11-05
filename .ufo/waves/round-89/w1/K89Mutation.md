# K89Mutation — mutant battery against `receipt-bind` v3 (round 89, claim C1)

Seat `K89Mutation`, mutation-tester. Build dir
`.ufo/waves/round-89/build/K89Mutation/`. Scratch
`/fast/scratch/hyaku/kumitate-r89/K89Mutation/` (removed at exit; every receipt below is committed
under the build dir, no `/tmp` path is cited).

## 0. Objects and baseline

| object | path | sha256 |
|---|---|---|
| candidate under test | `.ufo/waves/round-89/build/K89ExecInst/receipt-bind-v3.mjs` (copied to `build/K89Mutation/candidate-v3.mjs`) | `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` |
| worktree snapshot (earlier draft of the same file) | `build/K89Mutation/candidate-v3-worktree-snapshot.mjs` | `70dbcd5d02e30c831bc7ba9b80539d7443cb76a0e0d9dad0ad70e1e293384b4a` |
| frozen probe (never edited) | `.ufo/waves/round-89/probe/probe89-c1.mjs` | `ab09dc131b98d9c5bb2a54e9db57b3393184a3a13993bcb7842d535f4d0b0f13` |
| frozen plan (never edited) | `.ufo/waves/round-89/plan.md` | `0a067a9715da81174df10894084179e25a0112c79182356ccb9d4c8e1fd58f2a` |
| frozen control table (never edited) | `.ufo/waves/round-89/controls/table.txt` | `2aa32e6f1d3e1dd4fddc43e2b6285344f32dabcc2b413ae622f6ed2a5955a44d` |

`git status --porcelain .ufo/waves/round-89/probe .ufo/waves/round-89/controls .ufo/waves/round-89/plan.md`
is empty: the frozen artefacts were not touched by this seat.

Baseline (the same two detectors run on the unmutated candidate):

- `receipts/baseline.probe.txt` — `C89_C1: HELD held=30/30`, exit 0 at `--rev 9c3b64e44024869937a827d588fe1b75e6692ef7`.
- `receipts/baseline-adfc2f55.probe.txt` — `C89_C1: HELD held=30/30`, exit 0 at the freeze commit
  `adfc2f55675f760eaf8b59f80033f926500cd951`.
- `receipts/baseline.selftest.txt` — `RECEIPT_BIND_SELFTEST: PASS held=68/68`, exit 0.

So the candidate is at the frozen terminal score before any mutant is scored, and the battery is not
measuring a broken baseline. Mutant scoring used `--rev 9c3b64e…` (lane tip at round open); the
candidate holds 30/30 at the freeze commit too.

## 1. Method

- `mutate.mjs` generates the battery from the candidate: every mutant is an **exact single-site
  replacement** (`find` must occur exactly once — the generator prints `MUTANTS: generated=56
  problems=0`, so no replacement matched zero or two sites), written to `mutants/<id>.mjs` with a
  unified diff `mutants/<id>.diff` and a manifest `mutants/manifest.json`. 49 mutants change one
  behaviour at one site; 7 are explicitly labelled `composite` (two sites) and are never counted as
  single-behaviour evidence. No mutant is byte-identical to the candidate
  (`identicalToCandidate: 0`).
- `run-mutants.sh` scores every mutant twice, in parallel, in its own scratch dir:
  `node .ufo/waves/round-89/probe/probe89-c1.mjs --lane <LANE> --work <scratch>/probe/<id> --rev <REV> --tool mutants/<id>.mjs`
  and `node mutants/<id>.mjs --selftest --work <scratch>/st/<id>`. Receipts:
  `receipts/<id>.probe.txt` (all 30 `ARM` lines + `probe_exit=`), `receipts/<id>.selftest.txt`
  (all `RECEIPT_BIND_SELFTEST arm …` lines + `selftest_exit=`).
- `summarize.mjs` derives `summary.json` (machine) and `summary.txt` / `table.md` (human) from the
  receipts only — no verdict in this report is typed by hand.
- `check-holes.mjs` and `check-external-symlink.mjs` build independent fixtures and run **candidate
  and mutant on the same fixture**, so every surviving mutant's cost is demonstrated, not inferred
  (`receipts/holes.txt`, `receipts/external-symlink.txt`).

Classification: `KILLED` = probe UNMET and selftest FAIL; `PROBE_ONLY` = probe UNMET, selftest PASS;
`COVERAGE_HOLE` = probe HELD 30/30 **and** selftest PASS.

## 2. Totals

```
mutants=56  singles=49  composites=7
KILLED=33   PROBE_ONLY=3   COVERAGE_HOLE=20   (plus the baseline row)
independent probe arms that killed >=1 mutant: 29 of 29 non-A2 arms
mutants killed by an independent arm: 31 of 56;  A2 (selftest) killed 33 of 56
```

`COVERAGE_HOLE=20` is the finding: twenty constructions that each remove or weaken a behaviour
reach `C89_C1: HELD held=30/30` **and** `RECEIPT_BIND_SELFTEST: PASS`. Five of them are composites
whose single-site form is killed only by A2 (the instrument's own selftest), i.e. the probe's
independent arms give **zero** coverage of those five behaviours; the same mutation that removes the
behaviour also deletes the arm that noticed it.

## 3. The battery (all 56 mutants)

`probe` column is the frozen probe's score with `--tool` set to the mutant; `selftest` is the
mutant's own `--selftest`. `+N arms` / `+N cases` abbreviate the full list, which is in
`summary.txt` and `summary.json` per mutant.

| # | mutant | behaviour removed / weakened | probe | selftest | killed by (exact arm / case) | verdict |
|---|---|---|---|---|---|---|
| 1 | bad-digest-unchecked-off | unchecked: a non-64-hex tool_sha256= is counted as a mismatch | UNMET 29/30 | FAIL 67/68 | probe:A2, st:unchecked-bad-digest | KILLED |
| 2 | blob-head | byte source: the blob is read at HEAD instead of the judged revision | UNMET 18/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:default-rev, +8 arms, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 3 | blob-index | byte source: the blob is read from the index, not the judged revision | UNMET 18/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:default-rev, +8 arms, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 4 | blob-worktree | byte source: the blob is read from the worktree on disk | UNMET 13/30 | FAIL 62/68 | probe:clean-r87, probe:unresolved, probe:rev-receipt-wins, +13 arms, probe:A2, st:bom-rev-precedence, st:unresolved-instrument, +4 cases | KILLED |
| 5 | bom-codepoint-swap | BOM strip: the stripped codepoint is wrong (U+FFFE) | UNMET 28/30 | FAIL 67/68 | probe:bom-rev, probe:A2, st:bom-rev-precedence | KILLED |
| 6 | bom-strip-off | BOM strip: a leading U+FEFF is left in the text | UNMET 28/30 | FAIL 67/68 | probe:bom-rev, probe:A2, st:bom-rev-precedence | KILLED |
| 7 | composite-mode-off-and-arm-dropped | SYMLINK_INSTRUMENT refusal + its selftest arm both removed | UNMET 28/30 | FAIL 66/67 | probe:symlink-instrument, probe:A2, st:symlink-instrument-absolute-token | KILLED |
| 8 | dir-missing-token-swap | DIR_UNREADABLE: a missing --dir is reported as RECEIPT_UNREADABLE | UNMET 28/30 | FAIL 66/68 | probe:dir-missing, probe:A2, st:dir-missing, st:json-fail-closed | KILLED |
| 9 | dup-disabled | AMBIGUOUS_FIELD: first-wins parsing, no duplicate refusal | UNMET 27/30 | FAIL 60/68 | probe:duplicate-field, probe:dup-equal-field, probe:A2, st:ambiguous-cmd-differing, st:ambiguous-cmd-equal, +6 cases | KILLED |
| 10 | dup-equal-tolerated | AMBIGUOUS_FIELD: equal-valued duplicates are tolerated | UNMET 27/30 | FAIL 63/68 | probe:duplicate-field, probe:dup-equal-field, probe:A2, st:ambiguous-cmd-equal, st:ambiguous-tool-sha256, +3 cases | KILLED |
| 11 | dup-gt2 | AMBIGUOUS_FIELD: only >2 duplicate lines are ambiguous | UNMET 27/30 | FAIL 60/68 | probe:duplicate-field, probe:dup-equal-field, probe:A2, st:ambiguous-cmd-differing, st:ambiguous-cmd-equal, +6 cases | KILLED |
| 12 | empty-dir-clean | verdict: an empty receipt directory reads CLEAN | UNMET 29/30 | FAIL 66/68 | probe:A2, st:empty-dir-not-clean, st:non-txt-only-is-empty | KILLED |
| 13 | escape-downgraded | ESCAPES_LANE: an escaping token is bound instead of refused | UNMET 27/30 | FAIL 65/68 | probe:escape-relative, probe:escape-inner-dotdot, probe:A2, st:escapes-lane-relative, st:escapes-lane-interior-dotdot, +1 cases | KILLED |
| 14 | escape-negated | ESCAPES_LANE: the membership test is negated | UNMET 9/30 | FAIL 39/68 | probe:detect-r86, probe:detect-r86-renamed, probe:clean-r87, +17 arms, probe:A2, st:clean, st:clean-multi, +27 cases | KILLED |
| 15 | escape-token-swap | ESCAPES_LANE: the escape is reported as UNRESOLVED | UNMET 27/30 | FAIL 65/68 | probe:escape-relative, probe:escape-inner-dotdot, probe:A2, st:escapes-lane-relative, st:escapes-lane-interior-dotdot, +1 cases | KILLED |
| 16 | external-count-off | external tally: an out-of-lane instrument is not counted external | UNMET 28/30 | FAIL 65/68 | probe:escape-relative, probe:A2, st:external-disk, st:external-mismatch, +1 cases | KILLED |
| 17 | external-symlink-instrument-disabled | SYMLINK_INSTRUMENT: a symlinked external instrument is hashed through the link | UNMET 29/30 | FAIL 67/68 | probe:A2, st:symlink-instrument-external | KILLED |
| 18 | git-env-drop-off | GIT_* hardening: inherited GIT_DIR/GIT_INDEX_FILE are honoured | UNMET 29/30 | FAIL 67/68 | probe:A2, st:git-env-canary-ignored | KILLED |
| 19 | isabsolute-disabled | absolute tokens: every token is resolved relative to the lane | UNMET 25/30 | FAIL 62/68 | probe:detect-r86, probe:detect-r86-renamed, probe:escape-relative, +1 arms, probe:A2, st:alias-proc-root-in-lane, st:alias-proc-root-negative, +4 cases | KILLED |
| 20 | limit-fstat-ge | size limit: descriptor check `>` -> `>=` | UNMET 28/30 | FAIL 67/68 | probe:limit-edge, probe:A2, st:receipt-too-large-twin-at-limit | KILLED |
| 21 | limit-lstat-ge | size limit: pre-read check `>` -> `>=` (refuses the exact limit) | UNMET 28/30 | FAIL 67/68 | probe:limit-edge, probe:A2, st:receipt-too-large-twin-at-limit | KILLED |
| 22 | limit-lstat-lt | size limit: pre-read check `>` -> `<` (refuses every small receipt) | UNMET 5/30 | FAIL 20/68 | probe:detect-r86, probe:detect-r86-renamed, probe:clean-r87, +21 arms, probe:A2, st:clean, st:clean-multi, +46 cases | KILLED |
| 23 | mode-check-disabled | SYMLINK_INSTRUMENT: the refusal is disabled | UNMET 28/30 | FAIL 66/68 | probe:symlink-instrument, probe:A2, st:symlink-instrument-120000, st:symlink-instrument-absolute-token | KILLED |
| 24 | mode-literal-swap | SYMLINK_INSTRUMENT: the 120000 literal never matches | UNMET 28/30 | FAIL 66/68 | probe:symlink-instrument, probe:A2, st:symlink-instrument-120000, st:symlink-instrument-absolute-token | KILLED |
| 25 | realpath-abs-off | realpath membership: the token parent directory is not realpath-resolved | UNMET 28/30 | FAIL 66/68 | probe:alias-proc-root, probe:A2, st:alias-proc-root-in-lane, st:alias-proc-root-negative | KILLED |
| 26 | realpath-final-component-followed | realpath membership: the final component is followed (in-lane symlink identity lost) | UNMET 29/30 | FAIL 67/68 | probe:A2, st:symlink-instrument-absolute-token | KILLED |
| 27 | realpath-membership-lexical | realpath membership: membership judged on lexical lane/abs | UNMET 28/30 | FAIL 66/68 | probe:alias-proc-root, probe:A2, st:alias-proc-root-in-lane, st:alias-proc-root-negative | KILLED |
| 28 | rev-bad-default-off | REV_UNRESOLVED: an unresolvable default --rev is not refused up front | UNMET 28/30 | FAIL 67/68 | probe:rev-bad, probe:A2, st:rev-unresolved | KILLED |
| 29 | rev-field-skipped | receipt rev=: the rev= field is never read | UNMET 26/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:bom-rev, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 30 | rev-receipt-ignored | receipt rev=: the receipt's own rev= is discarded | UNMET 26/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:bom-rev, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 31 | symlink-receipt-disabled | SYMLINK_RECEIPT: a symlinked receipt is parsed as a receipt | UNMET 28/30 | FAIL 67/68 | probe:symlink-receipt, probe:A2, st:symlink-receipt | KILLED |
| 32 | unchecked-or-to-and | unchecked: a receipt missing cmd= or tool_sha256= is no longer unchecked | UNMET 28/30 | FAIL 66/68 | probe:unchecked, probe:A2, st:unchecked-no-cmd, st:unchecked-no-digest | KILLED |
| 33 | usage-exit-zero | usage: a bare invocation is no longer a usage error | UNMET 28/30 | FAIL 67/68 | probe:usage, probe:A2, st:usage-bare | KILLED |
| 34 | composite-limit-x2-and-arm-dropped | size limit doubled + the too-large selftest arm removed | UNMET 29/30 | PASS 67/67 | probe:limit-edge | PROBE_ONLY |
| 35 | limit-doubled | size limit: MAX_RECEIPT_BYTES 1048576 -> 2097152 | UNMET 29/30 | PASS 68/68 | probe:limit-edge | PROBE_ONLY |
| 36 | limit-preread-disabled | size limit: the size is judged only after the receipt is opened | UNMET 29/30 | PASS 68/68 | probe:limit-before-read | PROBE_ONLY |
| 37 | composite-bad-digest-and-arm-dropped | non-64-hex tool_sha256= becomes a mismatch + its selftest arm removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 38 | composite-empty-dir-and-arms-dropped | empty-directory-reads-clean + both empty-dir selftest arms removed | HELD 30/30 | PASS 66/66 | — | COVERAGE_HOLE |
| 39 | composite-external-symlink-and-arm-dropped | external-symlink refusal + its selftest arm both removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 40 | composite-git-env-and-arm-dropped | inherited GIT_* honoured + its selftest arm removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 41 | composite-realpath-final-and-arm-dropped | final-component realpath lost + the absolute-token symlink selftest arm removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 42 | contract-string-v2 | contract: the emitted contract id is v2, not v3 | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 43 | digest-lowercase-off | digest: tool_sha256= is not lowercased before comparison | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 44 | lane-not-git-off | LANE_NOT_GIT: a --lane that is not a git repository is accepted | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 45 | limit-fstat-disabled | size limit: the descriptor re-check after open is disabled | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 46 | mode-read-at-head | SYMLINK_INSTRUMENT: mode read at HEAD, not the judged revision | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 47 | nofollow-dropped | TOCTOU: the receipt is opened without O_NOFOLLOW | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 48 | realpath-lane-off | realpath membership: the LANE is not realpath-resolved | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 49 | rev-commit-check-off | receipt rev=: a receipt rev= that is not a commit is not refused | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 50 | root-check-absolute-off | UNRESOLVED: an absolute token naming the lane root is accepted | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 51 | selftest-drop-dup-equal-arm | selftest: the equal-valued duplicate rev= arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 52 | selftest-drop-external-symlink-arm | selftest: the external-symlink SYMLINK_INSTRUMENT arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 53 | selftest-drop-receipt-is-directory-arm | selftest: the RECEIPT_UNREADABLE directory arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 54 | selftest-drop-symlink-instrument-arm | selftest: the SYMLINK_INSTRUMENT arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 55 | selftest-held-tautology | selftest: the PASS verdict is a tautology (every arm counts held) | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 56 | selftest-relax-bom-arm | selftest: the BOM precedence arm accepts any RECEIPT_BIND line | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |

## 4. What the probe has teeth on

Every one of the 29 non-A2 arms killed at least one mutant, so each arm is load-bearing under this
battery. Kill counts (mutants killed by that arm): `bom-rev` 9, `duplicate-field` 8, `limit-edge` 8,
`clean-r87` 7, `rev-receipt-wins` 7, `escape-relative` 6, `default-rev` 5, `symlink-dir` 5,
`oversize` 5, `default-rev-not-head` 5, `index-not-judged` 5, `alias-proc-root` 5,
`symlink-instrument` 5, `abs-in-lane-at-rev` 4, `dup-equal-field` 4, `escape-inner-dotdot` 4,
`unresolved` 3, `worktree-forgery` 3, `untracked-instrument` 3, `sweep` 3, `detect-r86` 3,
`detect-r86-renamed` 3, `rev-receipt-negative` 2, `unchecked` 2, `limit-before-read` 2,
`symlink-receipt` 1, `dir-missing` 1, `rev-bad` 1, `usage` 1. A2 killed 30.

The three `PROBE_ONLY` rows are the strongest positive evidence: the probe kills them while the
instrument's own selftest still passes.

- `limit-doubled` — probe `ARM limit-edge: FAIL edge 1048576 … | over 1048577 exit=0 CLEAN`;
  selftest `PASS held=68/68` (`receipts/limit-doubled.*`). The selftest derives its fixtures from
  `MAX_RECEIPT_BYTES` (`padTo(okA, MAX_RECEIPT_BYTES + 1)`), so it is self-referential and cannot
  detect a wrong constant; only A24 can.
- `limit-preread-disabled` — `ARM limit-before-read: FAIL … FAIL-CLOSED RECEIPT_UNREADABLE (EACCES)`
  while the descriptor size check still fires, so the selftest passes; A25 is the only detector of
  the size-before-read order.
- `composite-limit-x2-and-arm-dropped` — A24 still kills even after the matching selftest arm is
  deleted, which proves A24 does not lean on the selftest.

## 5. The twenty survivors, and why each survives

### 5a. Claimed behaviours weakened and still 30/30 — the serious group

**`realpath-lane-off`** (HELD 30/30, PASS 68/68). The candidate resolves the lane with
`realpathSync(lane)`; the mutant compares the token's real path against the **lexical** lane. A28
still passes because the fixture aliases the *instrument* (`/proc/self/root<lane>/scripts/x.mjs`) and
its real path equals the lexical lane. The unarmed symmetric case is the lane itself being named
through an ancestor alias. Demonstrated on one fixture (`receipts/holes.txt`, check
`lane-through-symlink-forge`):

```
candidate: exit=1 RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=a.txt
mutant:    exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1
```

Fixture: `--lane /proc/self/root<repo>`, receipt `rev=<committed rev>` + the digest of the **dirty
worktree** bytes + `cmd=node <real repo>/scripts/tool.mjs`. The candidate judges the token in-lane
and reads the revision → DRIFT. The mutant judges it outside, hashes the worktree file → **CLEAN,
external=1**. That is exactly the forge `alias-proc-root` exists to refuse, moved to the lane side.
Under a literal reading of the frozen kill rule ("realpath lane membership" is a claimed behaviour),
a construction that drops the lane half and still reaches 30/30 is a kill-rule candidate; under the
narrower reading ("the A28 alias form"), it is a coverage finding. The L1 must adjudicate — this
seat does not.

**`mode-read-at-head`** (HELD 30/30, PASS 68/68). The mode is read with `git ls-tree HEAD` instead
of `receiptRev`. A30 judges at `C`, which *is* HEAD in the probe fixture, so the arm cannot see the
substitution. Demonstrated (`receipts/holes.txt`, `symlink-at-judged-rev-only`): a repo whose judged
revision carries a mode-120000 `scripts/link.mjs` and whose HEAD carries a regular file, receipt
`rev=<symlink rev>` + digest of the link text:

```
candidate: exit=2 RECEIPT_BIND: FAIL-CLOSED SYMLINK_INSTRUMENT … scripts/link.mjs
mutant:    exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
```

The mutant binds `sha256("alpha.mjs")` — the link text — which is precisely the binding A30's
contract text forbids ("hashing the link text would let a receipt bind arbitrary target content").
This one is a claimed behaviour (the mode-120000 refusal) weakened in its revision dimension and
still at the terminal score.

**`realpath-final-component-followed`** (HELD 30/30 via A2 only) and its composite
`composite-realpath-final-and-arm-dropped` (HELD 30/30, PASS 67/67). Replacing
`join(realpathSync(dirname(abs)), basename(abs))` with `realpathSync(abs)` follows the final
component, so an in-lane symlink named by an **absolute** token is resolved to its target and binds
the target's digest instead of reading `SYMLINK_INSTRUMENT`. A30 only uses the relative form
(`node scripts/link-<nonce>.mjs`); the absolute form is tested only by the selftest arm
`symlink-instrument-absolute-token`, and the composite deletes that arm.

**`external-symlink-instrument-disabled`** (HELD 30/30 via A2 only) and
`composite-external-symlink-and-arm-dropped` (HELD 30/30, PASS 67/67). The v3 external-symlink
refusal has no probe arm at all; only `st:symlink-instrument-external` notices it, and the composite
removes that arm.

### 5b. Behaviours the probe never arms, and the selftest does not cover either

- `nofollow-dropped` — `O_NOFOLLOW` removed. No arm; the lstat check precedes the open, so the only
  observable difference is the race. This matches plan limit (d) ("the TOCTOU fix has no arm") and
  is a limit, not a surprise.
- `limit-fstat-disabled` — the descriptor size re-check after `open` disabled. The pre-read `lstat`
  check still refuses oversize receipts, so no single-threaded fixture can see it; only a race can.
  Also plan limit (d), but note it is the *second* size check, not the TOCTOU identity check.
- `contract-string-v2` — `--json` prints `contract=kumitate-receipt-bind-v2`. Demonstrated
  (`receipts/holes.txt`, `json-contract-id`): candidate `contract=kumitate-receipt-bind-v3`, mutant
  `…-v2`, both exit 0. No arm reads the contract id, and the selftest compares the object to its own
  `CONTRACT` constant.
- `digest-lowercase-off` — an upper-case `tool_sha256=` binds in the candidate and is `unchecked` in
  the mutant. Demonstrated (`uppercase-digest`): candidate `CLEAN matched=1`, mutant
  `DRIFT … unchecked=1 first=a.txt`. No arm uses an upper-case digest.
- `lane-not-git-off`, `rev-commit-check-off`, `root-check-absolute-off` — each removes a distinct
  fail-closed token; all three still **fail closed** through a later check, so the verdict changes
  but never becomes CLEAN (`receipts/holes.txt`):
  - `LANE_NOT_GIT` → `REV_UNRESOLVED` for a non-git `--lane`;
  - receipt `rev=` not a commit → `REV_UNRESOLVED` becomes `UNRESOLVED … instrument absent at`;
  - absolute token naming the lane root → same `UNRESOLVED` token, detail `instrument absent at <rev>: null`.
  These are unarmed *token claims*, not safety holes: the mutation is masked by the next refusal.
  The probe therefore cannot tell `LANE_NOT_GIT` from `REV_UNRESOLVED` on this input.

### 5c. The selftest's own assertions — invisible to A2

`selftest-held-tautology` (`held = results.length`) reaches 30/30 and prints `PASS held=68/68`: A2
reads the `PASS` line, nothing else. The four `selftest-drop-*-arm` mutants and
`selftest-relax-bom-arm` reach 30/30 with a shrunken or loosened selftest (`PASS held=67/67` /
`66/66` vs the baseline `68/68`). A2 cannot see an arm count, so the selftest can be weakened
arbitrarily without the probe noticing. This is the round-88 failure mode one level down: the probe
can now see the instrument's behaviour, but not its own evidence.

## 6. Findings about the frozen probe (reported, not edited)

| # | finding | evidence |
|---|---|---|
| F1 | A2 is string-level: `PASS` is the only thing read. A tautological selftest and deleted/loosened arms survive at 30/30. | `receipts/selftest-held-tautology.*`, `receipts/selftest-drop-*` |
| F2 | A30 judges at `C`, which is HEAD, so a mode read at HEAD is indistinguishable from a mode read at the judged rev. | `receipts/mode-read-at-head.probe.txt`, `receipts/holes.txt` |
| F3 | No arm aliases the **lane**; `alias-proc-root` only aliases the instrument. A lane-side realpath removal binds a dirty-worktree forge CLEAN. | `receipts/realpath-lane-off.*`, `receipts/holes.txt` |
| F4 | No arm names an in-lane symlink by an **absolute** token; only the selftest does. | `receipts/realpath-final-component-followed.*`, `composite-realpath-final-and-arm-dropped` |
| F5 | No arm covers an external instrument that is a symlink; only the selftest does. | `receipts/composite-external-symlink-and-arm-dropped.*` |
| F6 | No arm covers: an empty receipt directory, a non-64-hex `tool_sha256=`, inherited `GIT_*`. Their composites all reach 30/30. | `receipts/composite-*.probe.txt` |
| F7 | No arm reads the `contract` id or an upper-case digest. | `receipts/holes.txt` |
| F8 | `LANE_NOT_GIT`, a non-commit receipt `rev=`, and the lane-root token are unarmed: a later refusal masks the token change. All still fail closed. | `receipts/holes.txt` |
| F9 | A24 and A25 are independent of the selftest and have teeth; the limit constant is self-referential in the selftest, so only A24 can catch it. | `receipts/limit-doubled.*`, `receipts/limit-preread-disabled.*` |

`A2`-mediated kills (mutants killed only because the probe runs the mutant's own selftest):
`bad-digest-unchecked-off`, `empty-dir-clean`, `external-symlink-instrument-disabled`,
`git-env-drop-off`, `realpath-final-component-followed` — and the matching composites for all five
survive both detectors. For these five behaviours the probe's **independent** coverage is zero.

## 7. Candidate divergence the integrator must know about

The plan claims v3 adds `SYMLINK_INSTRUMENT` "for a mode-120000 instrument at the judged rev (and
for a disk-read external instrument that is a symlink)". Two different files exist in the lane:

- the worktree `scripts/receipt-bind.mjs` (sha `70dbcd5d…`, the snapshot this seat started from) has
  **no** external-symlink check. `receipts/external-symlink-worktree-snapshot.txt`:
  `digest-of-target 0 RECEIPT_BIND: CLEAN … external=1` and
  `digest-of-link-text 1 RECEIPT_BIND: DRIFT … external=1` — it hashes through the link, which the
  instrument's own docstring called a declared limit.
- `build/K89ExecInst/receipt-bind-v3.mjs` (sha `37201ad0…`, the candidate this battery scored) does
  refuse it: `receipts/external-symlink.txt` shows both digests
  `2 RECEIPT_BIND: FAIL-CLOSED SYMLINK_INSTRUMENT … external instrument is a symlink`.

If the L1 integrates the worktree file as-is instead of the executor's build copy, the
plan-claimed external-symlink refusal is absent and the declared-limit sentence is stale. The
battery's numbers are for the executor copy; the `realpath-lane-off`, `mode-read-at-head` and
`realpath-final-component-followed` findings apply to both copies.

## 8. Limits of this battery

- Single-site literal/expression replacements only; no logic rewrites, no cross-behaviour
  interactions beyond the seven labelled composites. A surviving mutant is a coverage finding, not a
  claim that the instrument is wrong.
- The probe is an output-text oracle; a mutant that prints a verdict it did not compute is outside
  this battery's reach (plan limit a).
- The TOCTOU behaviour cannot be exercised single-threaded; `nofollow-dropped` and
  `limit-fstat-disabled` survive for that reason and are reported as such, not as new holes.
- The battery does not touch the lane's `scripts/`, `corpus/`, `SKILL.md`, `SCORECARD.md`, `LOG.md`,
  the probe, `plan.md` or `controls/`; every artefact is under this build dir and scratch was
  removed after the receipts were copied.

## 9. Reproduction

```sh
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-89/build/K89Mutation
S=/fast/scratch/hyaku/kumitate-r89/K89Mutation
cd "$B"
node mutate.mjs --src candidate-v3.mjs --out mutants
bash run-mutants.sh "$B" "$S" 9c3b64e44024869937a827d588fe1b75e6692ef7
REV=9c3b64e44024869937a827d588fe1b75e6692ef7 node summarize.mjs --build "$B"
node check-holes.mjs --tool "$B/candidate-v3.mjs" --mutants "$B/mutants" --work "$S/holes"
node check-external-symlink.mjs --tool "$B/candidate-v3.mjs" --work "$S/ext"
rm -rf -- "$S"
```

## 10. Tooling

No tool was installed, upgraded or removed; no `pacman` transaction was attempted; no host service
was restarted. Everything ran with the host's `node v24.21.0` and `git`.

## Artefact index (all under `build/K89Mutation/`)

```
candidate-v3.mjs                       candidate scored (executor copy, 37201ad0…)
candidate-v3-worktree-snapshot.mjs     earlier worktree draft (70dbcd5d…)
mutate.mjs                             generator (single-site assertions)
mutants/<id>.mjs  mutants/<id>.diff    the 56 mutants and their diffs
mutants/manifest.json                  find/replace, site count, sha256 per mutant
run-mutants.sh                         scoring driver (frozen probe + own selftest)
summarize.mjs                          receipts -> summary.json / summary.txt / table.md
summary.json  summary.txt  table.md    verdicts, kill lists, aggregates
check-holes.mjs  receipts/holes.txt    7 candidate-vs-mutant behavioural checks
check-external-symlink.mjs             plan-claimed external-symlink behaviour
receipts/<id>.probe.txt                full 30-arm probe output per mutant (+ exit)
receipts/<id>.selftest.txt             full selftest arm list per mutant (+ exit)
receipts/baseline*.txt                 unmutated candidate at both revs
receipts/external-symlink*.txt         executor copy vs worktree snapshot
```
