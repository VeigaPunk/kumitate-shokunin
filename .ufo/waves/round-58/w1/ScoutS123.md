# ScoutS123 — round 58, w1

Axes: operability, coverage.
Measured integration revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1).
Scope: S123 source reopening and the three LangGraph quotes only; this is not a round verdict.

## Source fetch

- URL: https://docs.langchain.com/oss/python/langgraph/checkpointers
- Access date: `2026-10-24` (`accessed_at=2026-10-24T22:43:27Z`).
- Observed result: curl exit `0`, empty stderr, effective URL unchanged, `http_code=200`; response headers also began `HTTP/2 200`.
- Fresh capture: `body.html`, 1,285,044 bytes, sha256 `848d8ed5d7f414ce2a1f6e1927060045dc48137714f1eeb8cf94729c2a53ca4c`.
- Prior capture: `ScoutLangGraph/body.html`, 1,285,044 bytes, sha256 `7effcf4dce8f2da1715281d68afa670ddbc10a3827fa9cdada921c5f5dc09ac0`. This is the S123 body hash recorded in R1's `corpus/knowledge/failure-recovery-replay.md`.

The fresh and prior bodies are not byte-identical (their sha256 values differ). This check corroborates the three quoted passages in both; it does not claim whole-page byte identity.

## Quote verification

The three expected quotes were read from R1 with read-only `git show` (`r1-entry.*`, exit `0`, empty stderr). The verifier decoded both HTML byte streams as UTF-8, used Python stdlib `HTMLParser` with script/style content excluded, normalized whitespace, and searched for each exact quote. Inline markup therefore does not break a prose quote; raw-contiguous counts were also recorded separately.

1. §Checkpoints, 15 words: “The state of a thread at a particular point in time is called a checkpoint.”
   - Fresh capture: **PASS**, normalized count 1; prior capture: **PASS**, normalized count 1. Raw-contiguous count was 2 in each body.
2. §Checkpoints, 20 words: “A checkpoint is a snapshot of the graph state saved at each super-step and is represented by a StateSnapshot object”
   - Fresh capture: **PASS**, normalized count 1; prior capture: **PASS**, normalized count 1. Raw-contiguous count was 0 because `super-step` and `StateSnapshot` are wrapped in inline HTML elements; the exact prose was present after HTML decoding.
3. §Super-steps, 8 words: “you can only resume execution from a checkpoint”
   - Fresh capture: **PASS**, normalized count 1; prior capture: **PASS**, normalized count 1. Raw-contiguous count was 2 in each body.

Observed verifier result: exit `0`, empty stderr, and `RESULT: PASS quotes=3 captures=2 misses=0`.

## Tier judgment

**Tier A.** This is LangChain's official first-party LangGraph documentation and directly specifies checkpoint snapshots, super-step boundaries, and resume semantics. It is a primary source for the S123 claim.

## Finding and evidence

All three R1 LangGraph quotes were independently corroborated in both the newly fetched bytes and `.ufo/waves/round-58/build/ScoutLangGraph/body.html`. No missing quote was observed.

Full evidence is under `.ufo/waves/round-58/build/ScoutS123/`:

- `fetch.command.txt`, `fetch.stdout.txt`, `fetch.stderr.txt`, `fetch.exit.txt`, `headers.txt`, `access-date.txt`, `body.html`
- `r1-entry.command.txt`, `r1-entry.stdout.txt`, `r1-entry.stderr.txt`, `r1-entry.exit.txt`
- `r1-lesson.command.txt`, `r1-lesson.stdout.txt`, `r1-lesson.stderr.txt`, `r1-lesson.exit.txt`
- `verify_quotes.py`, `verify-quotes.command.txt`, `verify-quotes.stdout.txt`, `verify-quotes.stderr.txt`, `verify-quotes.exit.txt`

No production files were changed, no commits or other git/jj mutations were made, no seats or subagents were dispatched, and no tools were installed.

Report: .ufo/waves/round-58/w1/ScoutS123.md
