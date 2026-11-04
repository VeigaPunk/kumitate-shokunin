# Candidate 3 — `POINTER_DEAD` precision: prose examples flagged as dead paths

Seat K87Scout, read-only. Fixture lane under scratch (`rrd/`), `report-receipt-diff.mjs` copied from the
freeze; no receipts committed.

## Token class and code lines (`scripts/report-receipt-diff.mjs`)

- `:60` `POINTER_PATH = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\.(?:txt|json|jsonl|md|mjs|js|sh|py|html|tsv|csv|log)$/`
  — any single backticked token whose final extension is in this list. No slash is required, no
  `.`-prefixed exemption, no list of runtime names.
- `:160` `const prose = unfence(text);` — fenced blocks are removed, inline backticks are NOT.
- `:233-236` extraction loop: every inline backtick span passing `POINTER_PATH` (after stripping `:N`/`:N-M`
  at `:235`, and excluding receipt-shaped and `base|close/…` spans at `:236`) becomes a pointer.
- `:238-241` bases: the lane root, the report's directory, and `.ufo/waves/round-N`; a pointer passes if it
  exists in any one of them.
- `:257` `if (!found) add('POINTER_DEAD', …)`.
- `:21` header documents the class as "a backticked repo-path pointer".

So a prose example written as `` `name.ext` `` is a pointer. The cite-check gate has the counterpart
exemptions (`scripts/cite-check.mjs:386-391` the three exemption namespaces, `:428` `exemptionShape`, `:443`
the `runtime-artifact` message); report-receipt-diff has none.

## Measured

Command: `node <rrd>/scripts/report-receipt-diff.mjs --lane <rrd> --round 9 --report <report>`

| backticked token in prose | verdict |
|---|---|
| `example-not-real.md` | `POINTER_DEAD example-not-real.md` |
| `audit-env.sh`, `summary.txt`, `l0-watch-state.json`, `plan.md` | all four `POINTER_DEAD` (exit 1) |
| `f.txt` (exists in the lane) | clean |

Those four names are exactly the runtime/run-state names cite-check exempts as adjudicated non-citations
(`cite-check.mjs:386-391`; `fp-exempt.md` fixture at `:1800-1803`). So the two gates disagree on the same
shape.

Inference, not measured: a bare extension list in backticks such as `` `.mjs/.rs/.sh/.js` `` does not match
`:60` (the final segment would need a character before `.js` after a `/`). I did not run it.

## Round-88 pre-registration candidate

A claim would have to measure: over the committed round reports, the count of `POINTER_DEAD` findings whose
token is an example (fenced-off or prose-named) rather than a cited artefact; and the count of
`POINTER_DEAD` that cite-check's exemption classes would have absorbed. Today's shape reproduces with the
four fixtures above.
