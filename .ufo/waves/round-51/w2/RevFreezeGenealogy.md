# RevFreezeGenealogy — kumitate round 51, wave 2

Seat: `kumitate-r51.OutsideChameleon` (independent leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`,
read-only except this report. No git/jj mutation, no installs, no runnable files created in the lane; all
extractions ran under `/tmp` (`mktemp -d`), all removed.

## What I attacked

The freeze genealogy: the eight addendum repairs named in `.ufo/waves/round-51/plan.md` § `## Freeze repair
addendum` (items 1–8), the eight commit hashes in my ticket, and the two claim predicates
(`ATTEST_HELD` / A51 v3r6, `DOCTRINE_HELD` / D51) as measured by the frozen counters at the declared
measured lane tip `7d88faa733c5621da1cac174515e4a7d7d8896ea` and at `HEAD` (`3304a56`).

```text
$ git log --oneline -1
3304a56 round-51: w2 dispatch evidence (spec, dispatch, taskCall, registry with agentIds)
$ git merge-base --is-ancestor <c> HEAD   # for 06ecbf4,1fd8ace,3ed875d,8c07e88,8fd3cde,4b8da21,779b16e,cbca45c,8f3c692
all nine: ancestor-of-tip OK
$ git rev-parse HEAD:.ufo/waves/round-51/probe/attest51-probe.mjs cbca45cc:... same path
ec418fe4dfc5502d0a6b24ea6f661ad0946fe798   (both)
$ git diff --stat cbca45cc..HEAD -- .ufo/waves/round-51/probe/ .ufo/waves/round-51/plan.md
 .ufo/waves/round-51/plan.md | 11 ++++++++---      # probe bytes untouched after the last repair
```

## Predicate readings (measured, not restated)

```text
$ node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa7
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=7d88faa733c5621da1cac174515e4a7d7d8896ea rule=D51 |
  D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS |
  D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
exit=1
# identical reading at HEAD (3304a56): DOCTRINE_UNMET held=2/5
$ node .ufo/waves/round-51/probe/doctrine51-probe.mjs ... c90b9de9
DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 rev=c90b9de9... rule=D51 | D1 MISS entry-absent
exit=1

$ node .ufo/waves/round-51/probe/attest51-probe.mjs ... 7d88faa7
ATTEST51: ATTEST_UNMET held=7/9 checks=9 rev=7d88faa7 rule=A51 version=v3 | A1 PASS |
  A2 MISS attest-run-3.txt:absent | A2c PASS | A3 PASS | A3c PASS | A4 MISS attest-run-3.txt:absent;prior-files=162 |
  A4c PASS | A3d PASS | A5 PASS
exit=1
$ node ... attest51-probe.mjs ... c90b9de9
ATTEST51: ATTEST_UNMET held=0/9 checks=9 ... | A1 MISS ... | A3d MISS tool absent | A5 MISS tool or SCORECARD absent
exit=1
```

The base readings match the addendum's declared before-state (`0/9`, `0/5`). The pre-close A51 reading is
**7/9**, not 8/9: A4's loop also requires `attest-run-3.txt`, so A2 and A4 both MISS on the same absent
artifact (expected per ticket; not a finding, recorded so the reading is not mis-counted). A2c/A3c/A3d/A4c
all PASS at the measured tip, so the repair arms are live and discriminating as arms.

## Per-commit fidelity

| Commit | Addendum item | Files touched | Kind | Fidelity |
|---|---|---|---|---|
| `1fd8aceb` | 1 | `probe/attest51-probe.mjs` only (2+/1−) | comment-only | **Matches at code level**; replacement sentence narrows the documented A4 sweep scope (G-6) |
| `3ed875d3` | 2 | probe (1 line) + `base/attest-base.txt`, `base/doctrine-base.txt` | semantic, one expression | **Exact**: `c[9]/c[12]` → `c[8]/c[11]`, verified against `sources-check.mjs` schema (G-8 prose nit) |
| `8c07e880` | 3 (also 4, 5) | probe, `plan.md` (+items 1–5), `base/attest-base-v3.txt` | semantic, additive | **Arms match item 3**; contains three unnamed edits (G-7) |
| `8fd3cde1` | 6 | probe (+3), `base/attest-base-v3r4.txt` | semantic, additive | **Matches**: genuine sidecar copied to the tampered target |
| `4b8da216` | 7 | probe (+A4c, header), `plan.md` (§C1 + items 6–7), `base/attest-base-v3r5.txt` | semantic, additive | **Arm matches**; item-7 text repaired only partially at this commit (G-5) |
| `779b16e` | (7 residue; unnamed by addendum) | `plan.md` only | prose | Changes what it says, but cites an artifact that does not exist (G-3) |
| `cbca45cc` | 8 | probe (+A3d), `plan.md` (§C1 + item 8), `base/attest-base-v3r6.txt` | semantic, additive | **Matches**: digest-only corruption, sidecar recomputed, expects REPLAY exit 1; declared order ≠ emitted order (G-9) |
| `8f3c692b` | none (item 4 + new claim) | `plan.md` only | prose, contract semantic | Ledger wording matches item 4; **digest-recipe edit is unauthorized by any item** (G-4) |

Repair-1 premise verified directly:

```text
$ git show 06ecbf4:.../attest51-probe.mjs > /tmp/v1.mjs && node --check /tmp/v1.mjs
/tmp/v1.mjs:20
 *       receipt corpus file under .ufo/waves/round-4*/** at rev (the sweep prints what it
                                                       ^^
SyntaxError: Unexpected token '**'
$ node --check /tmp/v2.mjs      # blob from 1fd8aceb: clean, no output
```

Repair-2 index fix verified against the checker's own schema, not its docs:
`sources-check.mjs:274 status: trim(fields[8])`, `:277 usedBy: trim(fields[11])`; `:359`
`const hasSourceHeader = lines[0]?.startsWith('source:') === true;`.

Predicate labels never changed (`git grep -o` per commit): `ATTEST_HELD` and `DOCTRINE_HELD` are present in
the probes at every commit `06ecbf4, 1fd8ace, 3ed875d, 8c07e88, 8fd3cde, 4b8da21, 779b16e, cbca45c, 8f3c692`.

Addendum items 4 and 5 (no commit hash) were checked against the shipped instrument
`scripts/receipt-attest.mjs` (sha256 `44919763…`, matches `SCORECARD.md:322`): the ledger exemption is
implemented at `:352-371` ("nonce reused by a DIFFERENT attested record", self/byte-identical exempt);
the digest recipe is semantic re-canonicalization at `:96-109` (`digestOf` = delete `digest`, sort keys
recursively, `JSON.stringify`); the only `spawnSync` uses are the attested command (`:192`) and the
selftest self-call (`:402`) — no digest binary is spawned, matching item 5's claim at `:63`.

## Findings by severity

### G-1 — BLOCKER: `DOCTRINE_HELD` is false at the measured tip (2/5), by three independent arms

**Evidence (above):** `DOCTRINE_UNMET held=2/5` at both `7d88faa7` (declared measured tip) and `HEAD`.
The entry `corpus/knowledge/invocation-attestation.md` is title-first, so:

```text
$ awk 'NR<=12{printf "%2d|%s\n", NR, $0}' <extracted tree>/corpus/knowledge/invocation-attestation.md
 1|# Invocation attestation — why receipts are built the way they are
 2|
 3|source: S100 https://man7.org/linux/man-pages/man2/clock_gettime.2.html ...
 9|verified-at: 2026-10-23
10|recheck: 180d
$ (cd <tree> && node scripts/sources-check.mjs)
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1  non-legacy knowledge file lacks source: header
SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)   exit=1
```

Mechanism, three separate defects:

- **D4**: `scripts/sources-check.mjs:359` requires `lines[0].startsWith('source:')`; line 1 is an H1.
- **D1**: probe takes `text.split('\n').slice(0, 5)`; the S101 URL (line 6), `verified-at:` (line 9) and
  `recheck:` (line 10) all fall outside the window — the trio cannot satisfy a title-first layout.
- **D2**: 12 clause lines, only 5 carry a `receipt:…@sha256:…` binding (`grep -c receipt:` = 6, one of
  which is on a continuation line); D2 requires every clause bound (`bound>=12`). `hash-miss=0`, so the
  five present bindings are correct — the defect is coverage, not hash integrity.

This is the same defect class the freeze already repaired once: seat `ScribeLesson` documented the exact rule
(`w1/ScribeLesson.md:100`: "a title-first entry fails D4 with `ENTRY_HEADER_REQUIRED` … `sources-check.mjs:359`
requires `lines[0].startsWith('source:')`"), and the V1-constraint note records that 5/5 is reachable only
with "`source:` line 1, `verified-at:` line 2, `recheck:` line 3". The integrated entry at the measured tip
does not have that shape. Note the gate asymmetry: D5 (live census) exits 0 while D4 (lane checker) is DRIFT,
so H4 cannot catch this.

**Fix site:** the entry, not the counters (they are frozen and already behave correctly). Needed: `source:`
as line 1, `verified-at:`/`recheck:` within the first 5 lines, and ≥12 clause lines each carrying a valid
`receipt:<path>@sha256:<64hex>` binding. No seat may edit `corpus/`; this is the L1's call.

### G-2 — HIGH: A3's committed doctored control has no sidecar, so A3 tests the ENOENT class, not the declared M2 forgery

The counter's own docstring (`attest51-probe.mjs`, A3 bullet) says the control is "run-2's receipt with only
the `run-at:` prelude rewritten, **sidecar untouched** — the lesson-M2 forgery". The committed bytes have no
sidecar at all:

```text
$ git ls-tree -r --name-only 7d88faa7 -- .ufo/waves/round-51/receipts/
.ufo/waves/round-51/receipts/attest-run-1.txt
.ufo/waves/round-51/receipts/attest-run-1.txt.sha256
.ufo/waves/round-51/receipts/attest-run-2-replayed.txt        <-- no .sha256
.ufo/waves/round-51/receipts/attest-run-2.txt
.ufo/waves/round-51/receipts/attest-run-2.txt.sha256
.ufo/waves/round-51/receipts/run-1.out
$ node scripts/receipt-attest.mjs verify .../attest-run-2-replayed.txt ; echo exit=$?
receipt-attest: sidecar .../attest-run-2-replayed.txt.sha256 is absent (ENOENT): the receipt bytes are not vouched for
RECEIPT: TAMPERED
exit=1
```

The nonce does equal run-2's (`f95078d001c850abec0f9c0be449318f` in both files), so the ledger rationale of
addendum item 4 is intact; but A3 passes on missing-sidecar, exactly the class item 6 rejected for A3c. The
discriminating class is still covered by A3c (genuine sidecar copied, prelude rewritten) and A3d (digest
corrupted, sidecar recomputed), both PASS at tip — so the predicate is not weakened to a print-stub, but the
A3 arm's published description is false about its own bytes. Repair site: add `attest-run-2-replayed.txt.sha256`
containing the **genuine** run-2 sidecar (the M2 forgery shape), or amend the docstring and plan claim.

### G-3 — MEDIUM: `779b16e` cites `build/ExecForgerControl/`, which does not exist

```text
$ ls build
ls: cannot access 'build': No such file or directory
$ find . -type d -name ExecForgerControl
(no output)
$ grep -n ExecForgerControl .ufo/waves/round-51/plan.md
83:  `build/ExecForgerControl/` and `w1/CritC1.md`.
```

The forger evidence does exist, but elsewhere: `w1/CritC1.md` (v2-arm control, 4/4 clear table) and the v3r5
9-arm-era reading `ATTEST_UNMET held=5/8` is quoted at `w1/RevPlan.md:318` and referenced at
`w1/RevCounterA.md:127`. `779b16e` is also not named by any addendum item; it is an unnamed plan edit whose
new sentence points at absent evidence. Low blast radius (the reading is recoverable) but it is a false
citation inside the frozen plan.

### G-4 — MEDIUM: `8f3c692b` rewrites the frozen digest recipe with no addendum item authorizing it

`8f3c692b` changes §C1's definition from "sha256 over the JSON line with the `digest` field removed" to
"parse, drop the field, sort keys recursively, one-line `JSON.stringify` (semantic re-canonicalization, NOT
textual excision — RevInstrumentContract F3)", plus the item-4 ledger wording. The ledger half is covered by
addendum item 4; the canonicalization half is covered by **no item**, and the addendum declares itself
"append-only; supersedes the freeze bytes it names". The new text is *true* of the shipped instrument
(`receipt-attest.mjs:96-109`) and of the A4c twin crafting — but a frozen contract definition was changed
post-freeze without a named repair, which is precisely the silent semantic drift the addendum exists to
prevent. Fix: append a ninth named item (or a cross-reference) recording the F3 clarification, or revert the
sentence to the instrument-accurate wording with an item cite.

### G-5 — MEDIUM-LOW: `4b8da216` does not fully do what addendum item 7 says at its own commit

Item 7 claims v3r5 "rewrites the body arithmetic to eight checks". At `4b8da216` the `ATTEST_HELD`/`held=8/8`
line was rewritten, but the same §C1 still read `Before (control): … expected ATTEST_UNMET held=0/5` and kept
the falsified "a stub cannot clear A1/A3" claim. Those were repaired only in `779b16e` (23:17) and then
re-arithmeticized in `cbca45cc`. Result at tip is correct; the commit-level description is aspirational.
Recorded because a seat auditing at `4b8da216` would see a doc/counter mismatch (counter 8 checks, plan
before-line 5).

### G-6 — LOW: repair 1 ("comment-only") changes a documented semantic claim, and the replacement understates the sweep

```text
- *       receipt corpus file under .ufo/waves/round-4*/** at rev (the sweep prints what it
+ *       receipt corpus file under .ufo/waves/ (round-48/49/50 receipt corpora) at rev (the
+ *       sweep prints what it
```

The code (`attest51-probe.mjs:232-244`) walks **every** directory under `.ufo/waves/` except `round-51` and
collects `receipt|ReRun|L1-score` files — `prior-files=162` at tip. Plan §C1 body says "r49/r50 receipt
files". So the comment, the plan, and the code state three different scopes; the code is the strictest, so no
false PASS is possible, but the "comment-only" repair introduced a scope claim that is not what executes.

### G-7 — LOW: `8c07e880` carries unnamed edits beyond item 3

- A5 failure branch lost `a5ok = false` (the only non-comment code change outside the new arms).
  Provably inert: `a5ok` is recomputed at the end as `a5d.length === 2 && a5d[0] === 'pin match' &&
  /proxy MATCH/.test(a5d[1])`, and the failure message pushed is `proxy exit=…`/`pin …!=…`, neither of which
  matches; no input can flip the result.
- The verdict line gained ` version=${VERSION}` — an observable output-format change, not named by item 3
  ("predicate label and kind unchanged" does hold; the label is unchanged).
- `copyFileSync` imported but unused until `8fd3cde1`; A2c's `outOk` OR-chain repeats the same
  `sha(Buffer.from(nonce,'utf8'))` predicate three times (`Buffer.from(string)` defaults to utf8) — dead
  expressions, no semantic effect.

### G-8 — INFO: item 2's mechanism prose is imprecise (the index fix is exact)

v1 tested `c[9] === 'mined' && c[12].includes(ENTRY)`; by the checker's schema `c[9]` is the `opened` date
and `c[12]` is the empty field after the trailing pipe, so D3 was **always false**, not "mutually exclusive
with D4". The conclusion in item 2 ("`DOCTRINE_HELD` was unpassable as frozen") is right; the stated
mechanism is not. The repaired indexes `c[8]`/`c[11]` are correct (`D3 PASS` at tip).

### G-9 — INFO: declared check sequence ≠ emitted sequence (set equal)

Item 8 declares `A1, A2, A2c, A3, A3c, A3d, A4, A4c, A5`; the counter emits
`A1, A2, A2c, A3, A3c, A4, A4c, A3d, A5` (A3d appended after A4c). Membership and count (9) are identical;
only the order differs, which matters only to an auditor comparing sequences positionally.

### G-10 — INFO: pre-close A51 is 7/9, not 8/9

`A4` fails on `attest-run-3.txt:absent` exactly as `A2` does; the ticket's "A2 will MISS" understates the
pre-close reading by one check. Same cause, not a second defect.

## Residual risk

- **A2c is an execution-evidence arm, not an execution proof.** It checks argv-tail = nonce and
  `stdout_sha256 = sha(nonce)`, both derivable from argv for the fixed `printf %s <nonce>` command. The
  addendum's claim is deliberately narrower ("a stub that only prints verdict strings cannot …"), so the
  claim survives; a stub that *reads its own argv* and computes `sha(nonce)` could still satisfy A2c without
  running the command. The real execution binding rests on A3c/A3d/A4c needing genuine receipt bytes.
- **The forger control is measured against a superseded arm set.** The only quoted reading is `held=5/8` at
  v3r5 (`w1/RevPlan.md:318`); no committed 9-arm forger reading exists. `≤5/9` after A3d is inference, not
  measurement — the direction is safe (A3d only adds a check), but no seat has run it at v3r6.
- **D2's coverage rule is enforced but hollow-friendly elsewhere** (`w1/RevCounterD.md` F-1): 12 identical
  clauses binding one blob pass. The current entry fails for the opposite reason (5/12 bound), so this
  residual does not affect G-1's verdict.
- **D4 trusts the rev's own `scripts/sources-check.mjs`** (no pin check; `w1/RevCounterD.md` F-6). Unchanged
  by the freeze chain and not repaired by any item.

## Verification gaps (explicit)

- No 9-arm (`v3r6`) reading of forger rev `9cb611b7` exists in the lane; the `5/8` figure is from v3r5.
- `build/ExecForgerControl/` cannot be inspected because it does not exist (G-3); the control transcript is
  only in `w1/CritC1.md` / `w1/RevPlan.md`.
- I did not independently re-open S100/S101 source bodies (out of this ticket's scope; D2 hash checks pass).
- Timing: the base files' `run-at` values coincide with each introducing commit's committer timestamp
  (v3r5 `02:17:09Z` vs commit committer `23:17:10 −0300`), i.e. measured immediately pre-commit; author
  dates are earlier because the chain was re-based, as the addendum states. No timestamp anomaly to report.

## Commands run (all read-only; scratch trees under /tmp, removed)

`git log`, `git show <c> --stat`, `git show <c>:<path>`, `git diff --stat`, `git rev-parse`, `git ls-tree`,
`git grep`, `git merge-base --is-ancestor`, `git archive | tar -x`, `node --check`,
`node .ufo/waves/round-51/probe/attest51-probe.mjs …`, `node .ufo/waves/round-51/probe/doctrine51-probe.mjs …`,
`node scripts/sources-check.mjs` (inside /tmp extraction), `node scripts/receipt-attest.mjs verify …`
(inside /tmp extraction), `ls`, `find`, `awk`, `grep`.

No files were created in the lane other than this report; no installations or updates were performed.

Report: .ufo/waves/round-51/w2/RevFreezeGenealogy.md
