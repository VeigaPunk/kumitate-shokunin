# kumitate round 92 — lesson (seat-route, attempt 1) — DRAFT

DRAFT by seat K92ScribeLesson. `## Gate` holds `<L1 fills>` slots only: no admit/reject verdict is
asserted here. Every other row names the command or file it was read from; receipts are under
`.ufo/waves/round-92/K92ScribeLesson/`.

Frozen at lane commit `596f6753…` (plan, `probe/oracle92.py`, `probe/probe92-c1.py`, `probe/index92.tsv`,
`probe/sampleA.tsv`, nine pre-data controls, `open/` captures) — `.ufo/waves/round-92/plan.md`.
Wave `.ufo/waves/round-92/w1` (12 seats: 2 executor, 2 scribe, scout, connector, sentinel, reviewer,
2 critic, mutation-tester; spec + dispatch `4f3a8d63…`). Claim C1 operability, capability acquisition
`seat-route` (contract `kumitate-seat-route-v1`): `<L1 fills: HELD / UNMET (clause …)>`.

## Gate

- **`<L1 fills: admit / reject>` — `scripts/seat-route.mjs`** (built at
  `.ufo/waves/round-92/K92ExecTool/seat-route.mjs`; `READY` sha256 `<L1 fills>`). Fill: candidate sha256,
  the two scored runs' `C92_C1:` lines and their `salt=`/`tool_sha256=` fields, the selftest count, and
  the kill-clause (a)/(e) check that the scored bytes equal the shipped bytes.
- **`<L1 fills: admit / reject>` — QUALITY Q86** (draft: `K92ScribeLesson/quality-criterion-draft.md`).
  Fill: whether the rule as drafted is the one the round measured, and its shown-able-to-fail receipt.
- **`<L1 fills: admit / reject>` — knowledge entry** for the omp transcript surface, citing S266–S268
  (`corpus/knowledge/…`, seat K92ScribeSources' draft). Fill: entry path and cited rows.
- **`<L1 fills: admit / reject>` — construction(s) the seats scored**, with each score and the
  behaviour it skips. The freeze rule does not fire on "a construction reaches HELD" (plan §Kill rule);
  a construction that agrees on the drawn sample has implemented the definitions, and any *other*
  way to reach HELD is a counter finding, not a kill.
- **`<L1 fills: reject>` — any candidate that contradicts a field definition on a real transcript**
  (clause (c)), with the reproduction path and the transcript's sha256.

### Sources opened this round (CORPUS.md rule 1)

The L1 captured three rows on 2026-11-06 under `.ufo/waves/round-92/open/` from
`raw.githubusercontent.com/can1357/oh-my-pi` at `79fa222e8390aed3494f4bc6746814e6c74c21cf`
(`open/sources-fetch.txt`). This seat re-hashed the captures read-only and grepped the quote lines
(`K92ScribeLesson/sources-check.txt`); it did not fetch anything.

- **S266** oh-my-pi `docs/session.md`, § `model_change`: "`resolvedModelIsFallback` optionally marks
  a retry-fallback transition." (`session.md` line 236, sha256 `6a7a2375…f4e29`). Grounds `fallback`
  and the Amendment-44 distinction between the captured route and the answering model.
- **S267** `packages/coding-agent/src/session/session-entries.ts`, `ModelChangeEntry`
  (`session-entries.ts` line 148, sha256 `4035dad3…8f29e`). Grounds `captured` reading `model`,
  `role` and `resolvedModelIsFallback` off the entry.
- **S268** `packages/ai/src/types.ts`: `export type StopReason = "stop" | "length" | "toolUse" |
  "error" | "aborted";` (line 1081) and `errorMessage?: string;` (line 1360), sha256 `22ea739a…5d95c`.
  Grounds `answered`/`errors`/`aborted`, `final` and `last_error`.
- Rows added: 3, tier A, status mined (plan §Frontier step). `<L1 fills: used-by entry path>`.
  Rows touched: none.

## Kill rule (frozen) — `<L1 fills: fired / did not fire>`

Clauses (a)–(e) are quoted in `.ufo/waves/round-92/plan.md`. Evidence the L1 fills: (a) two runs at
M, (b) no non-positive control in `controls/table.txt` reads HELD (verified: the nine non-positive
rows read 0/133 … 132/133, the oracle reads `HELD agree=133/133`), (c) reproductions, (d) the grep of
the shipped bytes for `round-92`/`oracle92`/`probe92`, (e) the two sha256 values.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M92-1 (mined from rounds 87–91; never mined before round 92) — "the scorer, not the instrument": five consecutive rounds stopped on one class, a counter that scores a candidate only on an input set committed before the candidate exists.** Each round's construction read the expected verdict off the frozen probe (or one spelled member of a declared class) and reached the full mark while skipping a claimed behaviour: r87 `cand-a-worktree` 12/12; r88 nine constructions 20/20; r89 `cand-probe-keyed` (computes nothing) and `cand-skip-mode` 30/30; r90 one whole-text strip and two context-gated prefixes 47/47; r91 three token-keyed constructions 56/56. The r89 close names the cause itself: "the root cause is the scorer class, not the instrument". | `corpus/lessons/round-87.md:24-27`; `round-88.md:24-25`; `round-89.md:25,30-31,40`; `round-90.md:42-45`; `round-91.md:70-72`; `K91CriticA/scores.md`; MANIFEST `rounds` indices 1274 (r87), 1285 (r88), 1292 (r89), 1332 (r90), 1391 (r91); non-author §2 of `corpus/lessons/round-{89,90,91}-verifier-spotcheck.md`. Capture: `K92ScribeLesson/streak-evidence.txt`. | **none of Q82/Q84/Q85.** Each *can* fail, and each fired on its own slice: Q82 on the probe-keyed 30/30 (its own `Shown able to fail` is that violation), Q84 on `ctl-r90-roundpath-gated+ref.txt` / `ctl-r90-tmpdir-gated+ref.txt` (`47/56`, eight `FAIL A=PASS B=FAIL`), Q85 on `close-l1/class-sampler.txt` (`26/36`–`34/36` on the three r91 constructions). But Q82 forbids fixture *identity* in paths, Q84 forbids a shared *ambient* token, Q85 forbids a one-fixture *class*: none forbids scoring only on inputs the candidate can read at freeze. | held-out scoring: sample C is drawn at scoring time with salt = sha256 of the candidate's own bytes (so it cannot be pre-computed before the bytes are final), and the round-92 wave is scored too — its transcripts do not exist at freeze (`.ufo/waves/round-92/plan.md` §Claim C1; `probe/probe92-c1.py`). Shown able to fail: `controls/table.txt` — nine non-positive controls read `UNMET` at 0/133, 54/133, 70/133, 102/133, 120/133, 121/133, 126/133, 132/133 while the oracle reads `HELD agree=133/133`; the 132/133 `ctl-noredact` row shows that omitting one field still loses on the drawn sample. Draft criterion: `K92ScribeLesson/quality-criterion-draft.md` (Q86). |
| **M92-2 (mined from r91; verifier §5.1) — a printed ratio contradicted its own rows.** `K91Mutation/mutants.txt` prints `KILL RATIO: 7/11 killed = 64%`; the rows are 6 killed and 5 survivors of 11. | Recount over the committed file (sha256 `c164893b…b83f`) in `K92ScribeLesson/recount-mutants.txt`: `UNMET_rows=6`, `HELD_rows=6` (one is `m00-pristine`), `mutant_rows_excluding_m00=11`, `killed_excluding_m00=6`, `survivors=m02-drop-nofollow m07-read-by-path m08-swallow-failclosed m10-stat-abs m11-remove-close`. The file's own survivor list has five entries, so it contradicts its own ratio. Verifier §5.1 and `considerthese/2026-11-06.md` idea 1 name the same error. | none in r91: the tally was printed, propagated into the report and the SCORECARD round-91 table, and caught by the non-author verifier after the round. | append a named correction (6/11 = 55%) next to the printed line and in the r91 report/SCORECARD table; from round 92 every printed ratio is re-derived from its rows with a committed recount, `recount-mutants.txt` being the template. |

Rows quoted by the recount (source `K91Mutation/mutants.txt`, columns: id, verdict, note):

```
m00-pristine                 HELD  held=56/56   (baseline copy, not a mutant)
m01-drop-nonblock            UNMET held=55/56
m02-drop-nofollow            HELD  held=56/56   SURVIVOR
m03-isfile-to-notisdirectory UNMET held=49/56
m04-gte-cap                  UNMET held=55/56
m05-cap-minus1               UNMET held=55/56
m06-cap-plus1                UNMET held=55/56
m07-read-by-path             HELD  held=56/56   SURVIVOR
m08-swallow-failclosed       HELD  held=56/56   SURVIVOR
m09-token-swap               UNMET held=52/56
m10-stat-abs                 HELD  held=56/56   SURVIVOR
m11-remove-close             HELD  held=56/56   SURVIVOR
```

### Assimilation — `considerthese/2026-11-05.md` (2026-11-05), "Self-improvement ideas" item 3

Idea 3, "streak-aware calibration", proposed tracking claim-level streaks and flagging at N=3 that
"the question, not the answer, should change", naming as the example "a post-freeze held-out probe
set generated by a non-candidate seat and never shown to candidates". The lane's bar is what it
points at: the receipt-bind streak was 4 UNMET in a row when the file was written (r87–r90, after the
r86 HELD) and 5 at r91, and `.ufo/waves/round-92/plan.md` §Fresh start cites the idea by name and does
not re-claim receipt-bind. The mechanism it proposed is this round's counter: sample C is drawn at
scoring time with salt = sha256 of the candidate's own bytes, A is the fixed stratified sample, and
the round-92 wave is scored as held-out input because its transcripts post-date the freeze. Two
divergences are recorded rather than smoothed: (i) the C draw is made by the counter from the visible
`probe/index92.tsv`, so "generated by a non-candidate seat" holds for the wave, not for C; the
hold-out property there comes from the salt, which depends on bytes that are not final until the tool
is. (ii) N=3 fired a round late — the flag would have been raised at r89; the lane acted at N=5.
`considerthese/2026-11-06.md` idea 1 independently re-derived the mutation arithmetic (M92-2), which
is the same "trust no printed ratio" correction.

## Routed to round 93

- `<L1 fills: wave findings>`
- Carry-over from `round-91-verifier-spotcheck.md` §5 that the plan answers as round work (mutation
  correction, survivor list, harm scope, spot-check adoption) — `<L1 fills: which are closed>`; the
  tabi adjacency (`check-receipt-provenance.mjs:53`, RD-2 class) stays routed to tabi.
- Seat-route follow-ups the frozen definitions do not model (omp semantics outside `## Frozen field
  definitions`) — `<L1 fills>`.

## Operator note

`<L1 fills: any L0 question, or "None. No L0 question was filed this round.">`
