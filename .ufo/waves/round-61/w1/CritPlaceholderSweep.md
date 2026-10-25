# CritPlaceholderSweep — round 61 / w1 (placeholder sweep)

**Verdict: FAIL — 2 live placeholders remain in the committed tree, both in `SCORECARD.md`.**
Also, one of the two lines would still be false after the placeholder is filled in, because the receipt it cites contradicts it.

Sweep artifact: `.ufo/waves/round-61/build/CritPlaceholderSweep/sweep.txt`.

## Method
- Pattern `__TIP__|__MEASURED__|__COMMITS__|PLACEHOLDER|TODO: implement|FIXME`, globs `*.md *.mjs *.json *.tsv`, with `.git` and `node_modules` excluded.
- Committed tree: `git grep … HEAD` at `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` ("round-61: record real round-60 tip receipts").
- Working tree: the assigned `grep -rnE …` command. It returns the same 20 hits. The only untracked paths are `.ufo/waves/round-61/build/` and `w1/`, and neither had hits at sweep time.
- Wider check: the same pattern over every *other* file type at HEAD returned 0 hits. `.ufo/waves/round-60/close/` (any file type) returned 0 hits.

## Hits (20 total, classified)
**Live placeholders (2).** Both were introduced in `165b830` ("round-61: land round-60 close work + wave evidence") and are still unfilled at HEAD:
- `SCORECARD.md:2833`: "After: at the measured revision `__MEASURED__` → `DISPATCH60_HELD held=10/10 checks=10` exit 0 (`close/dispatch60-tip.txt`)"
- `SCORECARD.md:2847`: "`DOCTRINE60_HELD held=6/6 checks=6` exit 0 at the measured revision `__MEASURED__` (`close/doctrine60-tip.txt`)"

**Meta mentions (18).** These are specs, quoted findings or grep commands that name a token. None is an unfilled placeholder:
- `corpus/lessons/round-60-verifier-spotcheck.md:26,43,171,172` describe the R60-V2 defect.
- `.ufo/waves/round-61/build-spec.mjs:34,57,144` say what this round must check for.
- `w1-spec.json:10,46,184`, `w1-dispatch.json:366,386,461` and `w1-plan.json:371,391,466` are the same three seat prompts in each of the three files.
- `.ufo/waves/round-36/build/SimplSurface.md:24,82` contain a `FIXME` grep command and its result.
- `.ufo/waves/round-38/build/Prose04.md:2` and `.ufo/waves/round-38/evidence/review-decisions.json:992` use the identifier `PLACEHOLDER_STATUSES`.

## Counterexample (calibration)
The `be4a820` commit added the real receipts but did not touch `SCORECARD.md`. Those receipts do not back line 2833:
- `.ufo/waves/round-60/close/dispatch60-tip.txt` contains `DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60` and `exit=1`. Checks A7 (`MISS row-absent`) and A10 (`MISS exit=2 DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent`) both missed.
- `SCORECARD.md:2833` claims `DISPATCH60_HELD held=10/10` exit 0 and cites that same file.

So substituting `a745a3b0` for `__MEASURED__` would remove the token but leave a claim that its own receipt contradicts. That is the Q53 mismatch between a claimed score and its receipt. The lane's own text at line 2829 already says `a745a3b0` gives `held=8/10`.

Line 2847 is consistent with its receipt. `doctrine60-tip.txt` contains `DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=a745a3b0… rule=D60` and `exit=0`.

## Impacted axes
- **Q52 (citations name real objects):** both lines fail it at HEAD. This is R60-V2 still open on the scorecard itself.
- **Q53 (claim equals receipt):** line 2833 fails it whatever value the placeholder gets.
- **C1 operability claim:** the "after" state of `held=10/10` has no committed receipt. The only committed tip receipt is 8/10.

## Smallest safe correction
- **Line 2847:** replace `__MEASURED__` with `a745a3b0`, which `doctrine60-tip.txt` supports.
- **Line 2833:** run the dispatch probe at a revision where A7 and A10 actually hold. That would be after the capabilities-row fix and with the wave dispatch record committed. Commit that receipt, then cite that hash. If no such revision exists, restate the "after" result as `DISPATCH60_UNMET held=8/10` exit 1 at `a745a3b0`.
- Do not just substitute a hash into line 2833 to clear the token.

I made no edits outside this report and `sweep.txt`. I installed no tools.
