# K85Review — adversarial falsification of C85_C1 (round 85)

Seat: reviewer. Lane-author advice, not the non-author closure; no production, plan,
probe, control, SCORECARD, LOG, corpus or peer-subtree file was edited. All runs are
read-only over the lane; scratch is `/fast/scratch/hyaku/kumitate-r85/K85Review/`
(deleted before yield), receipts are durable in `build/K85Review/receipts/`.

- Measured revision: `9db0c6b5eb9111cfc5581006ba976ca2cd112792` (lane freeze commit).
  The worktree carries sibling-side uncommitted `SCORECARD.md`/`.ufo/pins/readme-map.json`
  changes that I did not touch; `scripts/counter-receipt.mjs` is still v1
  (`sha256=190a4c1f…254ec0`).
- Frozen inputs, re-hashed: probe `6e7b1eb7…53ec94`, plan `6a20a833…1c1f4d`,
  content-variation `08beaba3…7d0cb7`; `git diff 9db0c6b5 --` over plan/probe/controls is
  empty. Node `v24.21.0` (one runtime, `process.execPath`), kernel `7.2.11-arch1-1`.
- Candidate: `build/K85ExecGate/counter-receipt.mjs`
  `sha256=7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`.

## Verdict summary

| question | verdict |
|---|---|
| Frozen predicate at the candidate | **HELD, 20/20, exit 0** (two independent runs on different nonces; staged byte-identical copy). L1 must still run it at the integrated tree. |
| Three committed controls reproducible | **Yes, six for six line-for-line**; base 1/20, stub 0/20, no-reader 1/20; cv 0/3 each. No mismatch. |
| 20/20 without reading the receipt | **Impossible**: a tool with zero filesystem calls caps at **2/20** (measured). The nonce+sha256 assertion does close round-84's no-read class. |
| 20/20 while the *verdict* never depends on the bytes | **Achievable**: basename-keyed verdict + bytes read only for `bytes=`/`sha256=` scores **20/20**; the source need not be opened at all (4/4 `--src` arms from a canned string). |
| Do the frozen controls exclude that class | **cv excludes the stateless variant (0/3) but not a stateful one: 20/20 + 3/3 measured.** This contradicts the "cv is the read-dependence discriminator" conclusion (K85Sentinel S7) as a sufficient condition. |
| Kill rule | Not fired by the three committed controls. My constructed controls do reach 20/20, so the reading of "any control" (`plan.md:32-33`, which forbids narrowing after data) is an L1 decision, not mine. |

**Bottom line.** The frozen predicate is satisfiable and the candidate satisfies it with a
sincere parser; round-84's no-read class is genuinely closed (zero-read ceiling 2/20).
What the 20/20 does not establish is that the *verdict* came from the bytes: a path-keyed
reader scores 20/20 without opening `--src`, and a position-keyed reader also passes cv
(3/3). L1 must weigh those two measured facts against the kill rule's "any control
reaching 20/20"; I neither narrow the rule nor decide the closure.

## 1. Control re-derivation (sub-question 1)

Commands are `node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <target> --work
/fast/scratch/hyaku/kumitate-r85/K85Review/p-<tag>` and the same shape for
`.ufo/waves/round-85/controls/content-variation.mjs`. Full command lines, timestamps and
revision are in `build/K85Review/receipts/<tag>.txt`.

| target | probe exit | probe last line | matches committed |
|---|---|---|---|
| `controls/base` | 1 | `C85_C1: UNMET held=1/20` | yes (`base.txt`) |
| `controls/stub` | 1 | `C85_C1: UNMET held=0/20` | yes (`stub.txt`) |
| `controls/noreader` | 1 | `C85_C1: UNMET held=1/20` | yes (`noreader.txt`) |

| target | cv exit | cv last line | matches committed |
|---|---|---|---|
| `controls/base` | 1 | `CONTENT_VARIATION: UNMET held=0/3 distinct_sha=true` | yes |
| `controls/stub` | 1 | `CONTENT_VARIATION: UNMET held=0/3 distinct_sha=false` | yes |
| `controls/noreader` | 1 | `CONTENT_VARIATION: UNMET held=0/3 distinct_sha=false` | yes |

Also measured: the frozen predicate on the lane at HEAD (v1 tool) is
`C85_C1: UNMET held=1/20`, exit 1 (`receipts/probe-lane-HEAD.txt`) — the claim is not
prematurely satisfied. Base control is byte-identical to
`git show a5d3e754…:scripts/counter-receipt.mjs` (sha `190a4c1f…`). **No mismatch with any
committed receipt → no finding here.**

## 2. Attacks and their scores (sub-question 2)

All attempts are committed under `build/K85Review/attempts/`; none is a candidate tool.
Full receipts: `probe-att-*.txt`, `cv-att-*.txt`, `cvr-*`.

| attempt (sha256) | what it does | probe | cv | cv-random |
|---|---|---|---|---|
| `noread` `33a78f68…679215` | no filesystem calls of any kind; keys on argv/absence and the basename; canned answers | **2/20 exit 1** | 0/3 exit 1 | 0/12 exit 1 |
| `pathkeyed` `c53c78d8…2061b5` | verdict/rows/held/findings and the `SOURCE:` line keyed on the basename; reads the file **only** for `bytes=`/`sha256=`; never opens `--src` | **20/20 exit 0** | **0/3 exit 1** | 0/12 exit 1 |
| `stateful` `e7c15a59…3566dc` | as `pathkeyed`, plus a call-position table (state file beside the receipt) for an unknown path | **20/20 exit 0** | **3/3 exit 0** | 6/12 exit 1 |
| `prose-arity` `e6a44e06…522cf` | `pathkeyed` with the other plausible `SOURCE_ARITY` reading | 19/20 exit 1 | — | — |
| `prose-held` `71da8221…607e9` | `pathkeyed` with `held=0/0` where the probe wants `-/-` | 18/20 exit 1 | — | — |

- The zero-read ceiling is **2/20**: only `usage` (no path at all) and `missing` (whose
  expected `RECEIPT` line is the constant `bytes=0 rows=0 held=-/- … sha256=-`) are
  reproducible without reading. Every other arm needs the nonce-bearing bytes for the
  digest, so a canned/label-keyed no-reader cannot pass — exactly the property round 84
  lacked.
- Reaching 20/20 nonetheless does not require the *judgment* to come from the bytes. The
  fixture basenames are in `argv`, and the probe's per-arm `code`, `token`, `rows`,
  `heldCount` and `sourceLine` are table literals (`probe85-c1.mjs:31`), used verbatim at
  `:81`; only `bytes` and `sha256` are computed (`:79-80`). The plan's sentence
  (`plan.md:26`) calling the line "input-derived (bytes, rows, held, finding, sha256)"
  is true for two of those five fields. Measured consequence: `pathkeyed` scores 20/20.
- The source half is weaker still: the `SOURCE:` line carries no digest, so a tool that
  never opens `--src` prints all four `--src` arms (it is 4/4 in `pathkeyed`). This
  confirms K85Sentinel S8 and sharpens K85Mutation M03 (18/20 with a canned source):
  a *consistently* canned source is 20/20.
- Cross-over demonstration, created in scratch only: a red body (`X arm a FAIL / X: UNMET
  held=0/1`) saved under the fixture name `clean.txt` → candidate `DRIFT ARM_FAILED`
  (`receipts/crossover-candidate.txt`); `pathkeyed` `COUNTER_RECEIPT: CLEAN`,
  `rows=2 held=2/2`, and the *real* sha256 of the red file
  (`receipts/crossover-pathkeyed.txt`). The probe never serves such a cross-over arm, so
  it cannot see the difference.
- The same-path content-variation control is served in a fixed order (clean-2, red-1,
  clean-3) on one path (`controls/content-variation.mjs`), and only `bytes=`/`sha256=`
  must be real. `stateful` therefore answers 0/1/0 by call position and scores
  **3/3, exit 0** while its verdicts never read the body. This is a plain disagreement
  with K85Sentinel S7's conclusion that cv "does [establish read-dependence]": it does for
  a stateless cheat, not for a position-keyed one.
- Hardening proposal (non-frozen; not evidence for this round): serve a random body per
  invocation and assert against the body actually written —
  `attempts/content-variation-random-proposal.mjs`. Measured 12 runs: candidate **12/12**
  exit 0, `pathkeyed` **0/12**, `stateful` **6/12** (1-(1/3)^12 power against a
  position-keyed answer). A single probe-side cross-over arm would similarly have turned
  `pathkeyed`'s 20/20 into 19/20.
- Boundary check on the nonce: a spawned child cannot read the probe's heap here —
  `/proc/<ppid>/maps` readable, `/proc/<ppid>/mem` open → `EACCES`, `ptrace_scope=1`
  (`receipts/parentmem.txt`). So "canned cannot match" holds on this host; it is a host
  policy (`ptrace_scope=0` would be a different answer), not a probe guarantee.

## 3. Candidate recount (sub-question 3)

`build/K85ExecGate/counter-receipt.mjs` exists (16 845 B, sha `7659be6e…508bc1`). I copied
it byte-identically into a scratch lane at `scripts/counter-receipt.mjs` and ran the frozen
harnesses:

- probe: `C85_C1: HELD held=20/20`, exit 0, twice on different per-run nonces
  (`receipts/probe-att-candidate.txt`, `probe-att-candidate-rerun.txt`);
- content-variation: `CONTENT_VARIATION: HELD held=3/3 distinct_sha=true`, exit 0;
- random-order proposal: 12/12, exit 0;
- `--selftest --work <my scratch>`: `COUNTER_RECEIPT_SELFTEST: PASS held=60/60`, exit 0;
- real task: r83 `c1-probe` → `DRIFT ARMS_TOTAL` exit 1, `bytes=5573 rows=28 held=27/27`;
  r83 `c1-repair` → `CLEAN` exit 0, `5729/28/28`; r83 `c2-probe` → `CLEAN` exit 0,
  `2678/16/16`; the sha values match `sha256sum` of the committed files;
- r84 `history-red.txt` → `FAIL-CLOSED SUMMARY_COUNT` exit 2, `bytes=224`, sha
  `78729d6f…c7b9`; `history-repair.txt` → same token exit 2, `bytes=214`, sha
  `1878cabc…e5e0` (see F3);
- read-only/never-execute: canary receipt with a `command: …writeFileSync…` line → `CLEAN`,
  canary absent, receipt sha and byte count unchanged (`receipts/canary.txt`); source
  screen found no fixture-name keys, no `eval`/`new Function`/`vm`, and no writes on the
  CLI path (only `--selftest` writes).

The candidate is **not** one of my cheats: it parses the bytes and derives the token from
them. No red arm, no attribution defect observed at the candidate.

## 4. Findings, by severity

### F1 — HIGH (measurement): the 20-arm table is name-separable; only 2 of 5 `RECEIPT` fields are input-derived

Evidence: `probe85-c1.mjs:31` (all `code`/`token`/`rows`/`heldCount`/`sourceLine` literals),
`:79-81` (only `bytes`/`sha256` computed); `attempts/pathkeyed` 20/20 + cv 0/3
(`probe-att-pathkeyed.txt`, `cv-att-pathkeyed.txt`); cross-over above. Consequence: a
20/20 run proves the tool read the file to hash it, not that its verdict came from the
file. This replicates and extends K85Sentinel S7 (same class, independently measured);
the plan's "input-derived … (bytes, rows, held, finding, sha256)" wording overstates the
mechanism. This is a limit of the frozen predicate, not a defect in the candidate, and it
does **not** re-open round-84's exact class: zero-read is capped at 2/20. The parallel
seat K85Cheat measures the sharper version: reading only the 21-byte nonce line and
replaying a copied table is already 20/20 (their `receipts/probe-c.txt`), so the read
barrier is one metadata line, not the arm rows.

### F2 — HIGH (control-class gap): the frozen control set is satisfied by a position-keyed tool

Evidence: `attempts/stateful` → probe 20/20 exit 0, cv 3/3 exit 0 (receipts above). The
tool's verdicts never depend on the body; it reads bytes only for the two derived fields
and keys position from a state file beside the receipt (the contract forbids the write,
but nothing measures read-only either). The proposed random-order control separates it
(6/12) and the candidate passes 12/12. Q78's class list (`plan.md:70-72`: absent,
constant, label-keyed no-reader, same-path content variation) does not name position/state
keying or a path-keyed partial reader. Recommendation (round 86, pre-registered; do not
change this round's artifacts): add the two classes to Q78 and the cross-over + random
order to the control suite. K85Cheat's parallel `control-d` reaches the same 20/20 + 3/3
with a nonce read plus an honest fallback (a real parser outside the 20 fixture names);
`stateful` shows the hybrid does not even need a parser when the cv order is fixed. If L1
reads `plan.md:32` "any control reaching 20/20" literally, my constructed controls are a
kill-rule event; the rule says "never narrowed", so that reading cannot be dismissed by
redefining "control" after the fact. I state the measurement and leave the classification
to L1.

### F3 — HIGH (plan text defect, independently confirmed by three peer seats): the r84 real-task expectation is unsatisfiable as written

`plan.md:67` says r84 `close/history-red.txt` and `history-repair.txt` → DRIFT/CLEAN.
Those are 4-line tool transcripts (`rev=`, `command=`, `COUNTER_RECEIPT: …`, `exit=`), not
arm receipts: any literal `--receipt` run is `FAIL-CLOSED SUMMARY_COUNT`, exit 2 (measured,
receipts `real-history-*.txt`; K85Sentinel S3, K85Mutation's contract finding, and
K85ExecGate's note 1 agree). The `command=` lines name the r83 receipts, which do give the
stated DRIFT/CLEAN (measured). Historical bytes were not rewritten; this is plan wording to
disclose, not a reason to score C1 red.

### F4 — MEDIUM (contract prose under-specification): three arms rest on conventions absent from the frozen contract

- `held=-/-` is not in the contract (`"held=<h>/<d>"`, `plan.md:52`): a literal
  `held=0/0` implementation is spec-faithful and scores **18/20**
  (`attempts/prose-held`, red on `no-summary`, `missing`).
- The `SOURCE_ARITY`/`SOURCE_DECLARED` boundary is named but not defined; the alternative
  reading (`declared != receipt` first) scores **19/20** (red on `src-declared`)
  (`attempts/prose-arity`).
The probe is frozen and visible, so this is implementable, but a prose-only implementer can
lose 1-3/20 while being contract-faithful. Pin both in v3 text (or in Q78's neighbouring
row), not in this round's frozen files. K85ExecGate's ambiguity notes 3-4 acknowledge the
conventions but do not quantify the cost; these two runs quantify it.

### F5 — MEDIUM (coverage of the contract, not of the claim): the denominator leaves several contract clauses unexercised

`SOURCE_UNREADABLE`, `SOURCE_ARMS_EMPTY`, `--selftest`/`--work`, unknown/duplicate CLI
shapes (only no-arg `usage` is probed), and "never executes receipt bytes" are contract
clauses with zero probe arms; a tool could omit them and still score
20/20 + 3/3. The candidate implements them and I verified the selftest and the canary, but
that is candidate-side evidence, not the frozen measure. Given the round's coverage axis,
the closure should say so rather than imply the 20 arms cover the contract.

### F6 — MEDIUM (integration obligations, L1-owned): a pinned gate changes bytes, and the lane docs still describe v1

- `SCORECARD.md:354` `pin.counter-receipt=190a4c1f…` is the v1 sha (verified against
  `scripts/counter-receipt.mjs`); `scripts/proxy-check.mjs:576` binds the key. The
  candidate sha is `7659be6e…`; integrating it without re-pinning yields
  `GATE_PIN_DRIFT` under `--strict` (K85ExecPins §2 reaches the same conclusion).
- `SKILL.md:607` and `:760`, and `corpus/knowledge/counter-transcript-reconciliation.md`,
  document the v1 one-line contract; v2 adds `RECEIPT:`/`SOURCE:` and `--src`.
- `corpus/QUALITY.md` has no `Q78` yet (`grep -n Q78` empty); the plan's new criterion is
  still to land. These are closure edits, not seat edits.

### F7 — LOW (control construction): the committed no-reader's 1/20 is not the class ceiling

The committed `noreader` misses `usage` because it labels from `--receipt` and the probe
invokes it with no args; my `noread` variant adds that arm and scores **2/20** (and still
0/3, 0/12). The plan's "1/20" is accurate for the committed file but understates the
zero-read ceiling by one; record 2/20 as the class maximum in round 86 so the margin
(2 vs 20) is not accidentally reported as 1 vs 20.

### F8 — INFO (provenance): "controls before data" is same-commit

Plan, probe and all six control receipts/receipts-tools enter in the single freeze commit
`9db0c6b5`; no later commit altered them (diff empty). The temporal claim "committed before
the probe's first work-tree run" is not distinguishable from the commit graph, but the
receipts reproduce exactly now, which is the property that matters.

## 5. Causal separability of the 20 arms from the three controls (sub-question 4)

Arms a committed control can pass, named exactly:

- **`usage`** — passed by `controls/base` (and by any tool that prints the one-line
  `COUNTER_RECEIPT: USAGE` and exits 64). No filesystem interaction, so it is not
  read-discriminating.
- **`missing`** — passed by `controls/noreader` purely from the visible basename; it need
  not stat the path. Also not read-discriminating.
- **No other arm** is passed by base, stub or no-reader (verified arm-by-arm in the three
  receipts); the other 18 require the real nonce-bearing bytes for `bytes=`/`sha256=`.

So the table is separable from *the three controls* (0-1 each, versus 20), but it is **not
separable from the fixture name**: all 20 arms' verdict fields are name-determined, and
`pathkeyed` passes all 20. The 20 arms are therefore a sound anti-*no-reader* instrument
(round-84 class closed at 2/20) and an unsound anti-*partial-vacuity* instrument. cv is
stronger but still position-separable; the randomized-order variant closes both measured
classes (12/12 candidate, 6/12 stateful, 0/12 pathkeyed), and the cross-over demo shows
the same discrimination for path-keying.

## 6. Bounds of this review

- No build/lint/tests on the shared tree; only the frozen probe, the frozen cv, and the
  candidate CLI on explicit paths. No git/jj mutation, no installs, no production edits.
  S245/S246 unused here (no source claim).
- I did not re-derive K85Sentinel's parser-edge findings (unanchored `arm('` substring,
  FIFO/size liveness, non-decimal `ARMS =` values) or K85Mutation's survivor list; they are
  orthogonal to the four assigned questions. I did confirm the candidate's main path and
  the aggregate scores they rely on are reproducible from the candidate bytes I measured.
- No resume/continuity path exists in C1's predicate or contract; `resume_continuity_v1`
  is not applicable to this claim. No saturation claim beyond `held=20/20`.
- `--src` was only exercised through the probe's 4 arms and the selftest; the source
  extraction semantics beyond that are K85Sentinel's scope.

## 7. Receipts index (`build/K85Review/receipts/`)

`probe-base|stub|noreader`, `cv-base|stub|noreader`, `probe-lane-HEAD`,
`probe-att-noread`, `cv-att-noread`, `cvr-noread`, `probe-att-pathkeyed`,
`cv-att-pathkeyed`, `cvr-pathkeyed`, `probe-att-stateful`, `cv-att-stateful`,
`cvr-stateful`, `probe-att-prose-arity`, `probe-att-prose-held`,
`probe-att-candidate`, `probe-att-candidate-rerun`, `cv-att-candidate`,
`cvr-candidate`, `real-c1-probe`, `real-c1-repair`, `real-c2-probe`,
`real-history-red`, `real-history-repair`, `selftest-recount`, `canary`,
`crossover-candidate`, `crossover-pathkeyed`, `parentmem`. Every file names seat,
revision, command, start/finish and exit, then the verbatim output. Scored table:
`build/K85Review/SCORES.md`.

Scratch `/fast/scratch/hyaku/kumitate-r85/K85Review/` is deleted before yield; the
receipts above are the durable copy.
