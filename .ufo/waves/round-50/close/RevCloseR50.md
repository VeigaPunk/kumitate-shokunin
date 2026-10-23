# RevCloseR50 — repairs50-probe counter review (rule R50)

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin` @ `ab3c64e9aaaff80faf3a2c93743287e44def4084`
(master/HEAD; tree `babbc923`, corpus `d1aa4177`, lessons `ea1974d7`).
Fleet `/home/vgpnk/Projects/shokunin`. Read-only review; lane never edited, no git write
commands, `.ufo/state` untouched. All mutations were built in `/tmp/r50` or as fabricated
commit objects (never committed, never referenced by a branch).

## 1. Re-run verdict (verbatim)

```
run-at: 2026-10-23 (this session)
  R1 PASS gate-ledger
  R2 PASS REOPEN50: HOLD source=https://raw.githubusercontent.com/containers/bubbl
  R3 PASS REOPEN50: HOLD source=https://raw.githubusercontent.com/strace/strace/v7
  R4 PASS files=3 distinct=3 held=3 span_s=876
  R5 PASS swept
  R6 PASS sections
  R7 PASS exit=0
  R8 PASS erratum
REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=ab3c64e9aaaff80faf3a2c93743287e44def4084 rule=R50
exit=0
```

Byte-for-byte identical to the committed receipt `close/R50-ab3c64e9.txt` (its own
`run-at=2026-10-23T23:01:35Z`). held=8/8, exit 0. **Reproduced.**

## 2. R4 receipt hashes + span (verified independently, not via probe)

`sha256sum` of the three committed `ReRunB49-*.txt` blobs:

| file | blob sha1 (tree) | body sha256 | `run-at` prelude | ORACLE |
|---|---|---|---|---|
| `ReRunB49-1.txt` | `3e2e2598…` | `aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6` | `2026-10-23T20:43:09Z` | `ORACLE_HELD held=6/6` |
| `ReRunB49-2.txt` | `0912d1a7…` | `96a01c840f91df0bcef0a065137aa9ace8067d832808fe67b6c1b2c34fb136ee` | `2026-10-23T20:45:54Z` | `ORACLE_HELD held=6/6` |
| `ReRunB49-3.txt` | `d737d9f2…` | `e59ff9af0562e25a29f80d6ea9762be06feb16c78cb623277e41cfba10f368da` | `2026-10-23T20:57:45Z` | `ORACLE_HELD held=6/6` |

- **span** = `20:57:45 − 20:43:09` = **876 s** (≥ 300 required). Recomputed via `Date.parse`
  and a datetime diff — both give 876.
- **distinct** = 3 (three unique body sha256s).
- All three carry `oracle_sha256=c3929a97…211e5`, `rev=0526f898` (the B49 instrument pin).
  These match the sha256s recorded in the round-50 lesson M2.
- **Limit confirmed (documented, not new):** the three bodies differ only in prelude;
  `oracle_sha256`/rev are identical. See §4 FORGE row.

## 3. Committed-blob checks run

| check | method | result |
|---|---|---|
| R1 `## Gate` ledger is in the *committed* `corpus/lessons/round-49.md` | `git rev-parse ab3c64e9:corpus/lessons/round-49.md` → blob `4c453870`; `cat-file -p` shows `## Mistakes`(7) `## Frontier — SOURCES`(35) `## Gate`(47) with `### candidates`/`### admitted`/`rejected`/`spot-check` | HELD |
| R6 sections in committed `corpus/lessons/round-50.md` | blob `79b30a12`; `## Mistakes`, `## Frontier`, `## Gate` all present | HELD |
| R2/R3 receipts committed | `ReopenS095.md`=`006ebf1f`, `ReopenS098.md`=`b8505e52`; first lines `REOPEN50: HOLD …`, contain pinned `sha256=2cb77df2…` / `c16859e0…` | HELD |
| R5 committed `SKILL.md` `fa05e905` | `grep -c 'all eleven'` = **0**; `Twelve are` present at :589 | HELD |
| R7 live census | `sources-census.sh validate --root … kumitate` → exit 0 (W04 warnings only, which never change status) | HELD |
| R8 fleet erratum committed | `git -C fleet show master:.ufo/reports/round-49/kumitate.md` → `## Erratum (round 50; append-only)` :123, contains `01b70bb0` `923a172` `c432cc9` `16/16` `15/15` `64b92866` | HELD |

## 4. Per-check cheapest-MISS attack (sim.mjs over real + mutant bytes)

`R# MISS x` = the mutant flips the gate off; `FORGE` = a forged/absent input still PASSES
(residual risk). Probed end-to-end where noted; otherwise the exact probe regex/logic was
run in `/tmp/r50/sim.mjs` against real and mutated blob text.

- **R1** (`## Gate` ledger in l49): MISS on no-`##Gate`, on deleting the literal word
  `rejected`, on empty file, on a bare `## Gate` with no keywords.
  **End-to-end:** fabricated commit `8889dc53` (l49 `## Gate`..EOF stripped, all else
  identical) → `R1 MISS no ## Gate`, `LEDGER_UNMET held=7/8`, exit 1. **MISS verified live.**
- **R2/R3** (REOPEN receipts): MISS on absent blob, wrong `sha256`, garbage first line.
  **FORGE:** any file whose first non-blank line is `REOPEN50: HOLD|DRIFT …` and whose body
  contains the *literal* pinned `sha256=` string passes — the check never re-hashes the
  named source body. A receipt asserting HOLD with a fabricated body would pass.
- **R4** (three spaced receipts): MISS on 2 files, duplicate bodies, span<300, missing
  `run-at`, missing `ORACLE_HELD held=6/6`. **FORGE (documented M2 limit):** one real body
  with three rewritten `run-at=` preludes → `PASS … span_s=600 body_distinct=1` — the check
  hashes each file's *whole text*, so prelude edits make blobs "distinct" without re-running
  the oracle. Receipts are attestation, not temporal proof.
- **R5** (`all eleven` swept / `Twelve` present): MISS on restoring `all eleven`; MISS on
  deleting `Twelve`. Forgivable only by a vacuous SKILL.md containing neither phrase —
  but that also drops `Twelve`, so it still MISSes. Sound.
- **R6** (l50 `## Mistakes`+`## Gate`): MISS on dropping either heading. **FORGE:** a file
  containing only the two bare headings passes — no content/ledger keywords required.
- **R7** (live census): MISS whenever the census validator exits non-zero. Not a committed
  input — reads live `corpus/SOURCES.md`; cannot be satisfied by a stale blob.
- **R8** (fleet erratum): MISS if `## Erratum` absent or any of the six required tokens is
  dropped. Reads committed fleet `master:` bytes; a forged working copy does not satisfy it.

## 5. Named list — checks that PASS on a forged/absent input

- `R2`/`R3`: **forgeable** — gate is regex-on-first-line + literal `sha256=` substring, no
  re-hash of the cited source body.
- `R4`: **forgeable within the documented limit** — prelude-only replay of one body yields
  three "distinct" time-spaced receipts (acknowledged in lesson M2 / QUALITY Q39).
- `R6`: **forgeable** — heading-presence only; a two-line file with `## Mistakes` + `## Gate`
  satisfies it.

Absent-input (non-forged) MISSes are all sound — every check fails when its blob is absent.

## 6. Verdict

The counter holds at the measured commit, is reproduced verbatim, every check demonstrably
reads the committed blob it claims to (R1 proven end-to-end via fabricated commit
`8889dc53`), and each has a real MISS trigger. The three forgeable surfaces are either
explicitly documented as limits (R4) or are weak-substring receipts whose *target* (the
S095/S098 upstream bodies) is independently pinned by hash in the ledger — acceptable for a
closure audit, not a cryptographic gate.

VERDICT: HOLD
