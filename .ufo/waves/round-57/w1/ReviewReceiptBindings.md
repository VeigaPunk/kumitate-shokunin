# ReviewReceiptBindings — receipt-binding audit of corpus/knowledge/worker-heartbeat-liveness.md

Item: verify every `receipt:<path>@sha256:` token in
`corpus/knowledge/worker-heartbeat-liveness.md` — path exists, sha256 matches blob,
paths distinct, ≥12 clause lines. Reviewer seat, kumitate round 57, claim C2 (D57 E2
surface). Evidence: `.ufo/waves/round-57/build/ReviewReceiptBindings/` (tokens.txt,
verify-matrix.txt, clause-census.txt, entry-identity.txt, commands.log).

## Revisions verified

- Judged integration tip **R1 = `f0dc6d1160e66af65355bd353665adac22bbf4a9`** (named
  "R1 f0dc6d11" in commit `c42afe1c`, the SCORECARD measured-commit slot fill).
- Working tip **HEAD = `8c6f5b017d149b18134917378cdbed3b492d8e89`** (idempotence re-run
  at bookkeeping tip; D57 5/5).
- The entry blob is byte-identical between R1 and working tree
  (sha256 `ca31a65d53ec2c92…`, see entry-identity.txt); the file exists only at
  R1+ (landed in the R1 commit, `git log -- corpus/knowledge/worker-heartbeat-liveness.md`).

## Findings — none. All checks corroborated.

| Check | Required | Measured | Verdict |
|---|---|---|---|
| Well-formed tokens `receipt:path@sha256:<64hex>` | all `receipt:` occurrences well-formed | 15 occurrences, 15 well-formed, 0 malformed lines | PASS |
| Path exists | every token | 15/15 exist on disk AND as committed blobs at R1 and HEAD (`git cat-file blob <rev>:<path>` exit 0) | PASS |
| sha256 matches blob | every token | 15/15: token hex == sha256(worktree file) == sha256(blob@R1) == sha256(blob@HEAD) (verify-matrix.txt) | PASS |
| Paths distinct | yes | 15 distinct paths of 15 tokens, zero duplicates | PASS |
| Clause lines | ≥12 | 13 lines starting `- ` (L18–26, 30–31, 35–36); 13/13 carry ≥1 token | PASS |
| Probe E2 first-match view (doctrine57-probe.mjs:98-115) | bound==clauses, distinct first-paths | bound=13/13, distinct first-match paths=13/13, hash-miss=0 | PASS |
| Working tree cleanliness | bindings = committed bytes | `git status --porcelain` over entry + all 5 Scout* dirs: empty; blobs tracked (`git ls-files`), not ignored (`check-ignore` exit 1) | PASS |

## Observations (not defects)

1. Probe E2 `l.match(/receipt:.../)` binds only the FIRST token per clause line;
   line 26 ("Observed revisions") carries 3 tokens, so 15 physical tokens vs 13
   probe-counted bindings. My audit verified all 15 against committed blobs at both
   revs — strictly stronger than the frozen arm. Not a defect at R1: the frozen
   semantics are met exactly (bound=13=clauses, distinct=13). If a future clause
   line carried two tokens and the second's blob rotted, E2 would not see it —
   residual blind spot inherent to the frozen counter, out of scope to change.
2. Receipt paths point at sibling seat build dirs (`build/ScoutTemporalHb`,
   `ScoutKafka`, `ScoutK8s`, `ScoutQueue`, `ScoutRabbitmqHb`) — all committed in the
   R1 integration commit, so "bound to committed bytes" holds; seat-build provenance
   is legal evidence per the round contract.
3. Untracked dirs under `build/` from in-flight seats exist; none overlap the 15
   receipt paths (status clean on all receipt-path prefixes).

## Residual risk / gaps

- Scope was binding integrity, not content truthfulness: I verified the blobs
  *exist and hash-match*, not that each blob's text substantiates its clause's
  quote (that is the scout-source-review seats' and D57 E3/SOURCES-row surface).
- Blob content read via `git cat-file` at R1 and HEAD; entry content itself is
  unchanged since R1, so the tokens under audit are exactly the judged bytes.

Verdict: CORROBORATED — the E2 surface holds at the measured revision; no findings.
