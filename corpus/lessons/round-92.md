# kumitate round 92 — lesson (seat-route; fresh start, attempt 1)

Frozen at lane commit `596f675366ac5822aac5ea1ffc56b1189b17f65c` (`.ufo/waves/round-92/plan.md`, `probe/oracle92.py`,
`probe/probe92-c1.py`, `probe/index92.tsv`, `probe/sampleA.tsv`, ten pre-data controls, `open/` captures, `fresh/reads.md`).
Wave `.ufo/waves/round-92/w1` (12 seats; spec + validated dispatch `4f3a8d633f2f4770073c51db5f5ee3300997140d`).
Drafted from seat K92ScribeLesson's draft (`.ufo/waves/round-92/K92ScribeLesson/round-92-lesson-draft.md`); the Gate,
verdicts and M92-3 are the L1's.

Claim C1 operability, capability acquisition `seat-route` (contract `kumitate-seat-route-v1`): **HELD under the frozen
predicate and kill rule** — `C92_C1: HELD agree=145/145 A=61/61 C=60/60 W=24/24 last_wave_located=12` twice on the
shipped bytes `cd7ee03dd814da01…6810ccfac` (`.ufo/waves/round-92/close/probe1.txt`, `probe2.txt`), with the
round-92 wave (written after the freeze) as the last `--waves` entry. Discernment caveat on record (M92-3): three
definition-wrong constructions also read HELD on the same predicate.

## Gate

- **admit — `scripts/seat-route.mjs`** (sha256 `cd7ee03dd814da01f6c73ad4113022c2484dea182f95b0a84e07f9b6810ccfac`).
  Built by K92ExecTool (READY `3b8b6ce0…`); L1 integration changes before scoring: whole turn model `?` when provider
  or model is missing (plan text), a bounded linear redaction scan with a code-point cut (K92Sentinel RD-6: the regex
  replace threw `RangeError` above ~5.3 MB), JSON-quoted human-mode tokens (RD-8: a newline in a seat name forged a
  `SEAT_ROUTE:` line), EPIPE-tolerant stdout, and seven selftest arms (30 → 37). Kill clauses: (a) HELD twice at M;
  (b) every non-positive pre-data control UNMET (`controls/table.txt`); (c) no reproduction — K92CriticA ran 1200 unseen
  population transcripts and the 12 live round-92 seats with 0 disagreements, K92Reviewer hand-read 7 transcripts;
  (d) byte grep 0 and the runtime check `close-l1/kill-d-runtime.txt` (strace: one execve, the only round-92 path
  opened is the argv-given `w1-results.json`, which the predicate itself supplies); (e) the receipts' `tool_sha256`
  equals the committed bytes. The K92Mutation survivor family (c01, c04, c06, c12, c13, c14, c17, c19 + a UTF-16 cut
  mutant) is killed 9/9 by the shipped selftest (`close-l1/survivor-remut.txt`).
- **admit — knowledge `corpus/knowledge/seat-route-from-session-transcripts.md`** on S266–S268 (K92ScribeSources;
  sources re-opened by the seat and by the L1, sha256 equal; 21 quotes, 0 mismatches).
- **admit — QUALITY Q86** (revised by the L1 from the scribe draft: the draft's claim that a tool-bytes salt makes a
  visible population held out is false — K92CriticA predicted the C draw 60/60 from the index and the salt).
- **reject — "C is held out"** (plan § Frozen predicate wording). K92CriticA `evidence-predict-c.txt`: the draw is
  reproducible by anyone holding the tool bytes; only the round-92 wave is held out. Kept as a counter finding.
- **reject — constructions x1, x2, x2b, x3 as evidence against C1 under the frozen rule, and as evidence the counter
  discriminates those fields** (both directions recorded). With the round-92 wave: `x2-parseerr0` (parse errors
  never counted), `x3-boolcounts` (counts as booleans), `x2b-redact23` (23-char redaction) and `x1-oracle-glob`
  (executes the oracle via a glob) all read `HELD agree=145/145` (`close-l1/construct-*.txt`). x1 violates clause (d)'s
  "executes" while evading its byte grep; x2/x2b/x3 are wrong only on classes with zero real instances in 23206
  transcripts (or on Python's `0 == False`). The frozen rule excludes "a construction reaches HELD" by design, so C1
  stands; what the counter does not prove is carried by the shipped selftest, not by the counter.
- **reject — the scribe draft's sentence "a build-time lookup table cannot be keyed to a salt that depends on that
  table"** — false for a population the lane enumerates (K92CriticA x6-memo design).

### Sources opened this round (CORPUS.md rule 1)

Captured 2026-11-06 from `raw.githubusercontent.com/can1357/oh-my-pi` at `79fa222e8390aed3494f4bc6746814e6c74c21cf`
(`.ufo/waves/round-92/open/sources-fetch.txt`; pinned bytes equal `main`'s on the same day).

- **S266** `docs/session.md` line 236: "`resolvedModelIsFallback` optionally marks a retry-fallback transition."
- **S267** `packages/coding-agent/src/session/session-entries.ts` line 37: `export const EPHEMERAL_MODEL_CHANGE_ROLE = "fallback";`
- **S268** `packages/ai/src/types.ts` line 1081: `export type StopReason = "stop" | "length" | "toolUse" | "error" | "aborted";`

Rows added 3 (tier A, `mined`), used-by the knowledge entry above; rows touched: none.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M92-1 — "the scorer, not the instrument": five consecutive rounds (r87–r91) scored a capability only on inputs committed before the candidate existed**, and each round a construction reached the full mark while skipping a claimed behaviour (r87 12/12, r88 20/20, r89 30/30, r90 47/47, r91 56/56). | MANIFEST rounds 1274/1285/1292/1332/1391; `round-89/90/91-verifier-spotcheck.md` §2; `.ufo/waves/round-92/fresh/reads.md` | none: Q82, Q84, Q85 each caught one slice and each can fail, but none forbids scoring only pre-frozen inputs | Q86 (below) + this round's design: the round-92 wave transcripts did not exist at freeze. Shown able to fail: `controls/table.txt` (do-nothing 0/133 … one-field ablations 54–132/133 vs positive 133/133). |
| **M92-2 — a printed ratio contradicted its own rows**: `K91Mutation/mutants.txt` prints `KILL RATIO: 7/11`; rows show 6 killed (m01, m03, m04, m05, m06, m09) and 5 survivors (m02, m07, m08, m10, m11). | `.ufo/waves/round-92/K92ScribeLesson/recount-mutants.txt`; r91 spot-check §5.1; `considerthese/2026-11-06.md` idea 1 | none in r91 | Named correction appended to SCORECARD (round-92 correction section) and LOG; this round's K92Mutation tallies are emitted from rows (`emit_mutants.py`, "rows first, then ratios"). |
| **M92-3 (this round) — a frozen counter with blind fields**: the round-92 counter scores fields whose real population has no discriminating member (parse errors 0/23206, a 24-char-run boundary with 1 member, `?` model 0, `final=other` 0) and compares with Python `==` (`0 == False`), so three definition-wrong constructions read HELD 145/145 even with the held-out wave; its C sample, salted by the tool's own bytes over a committed index, is predictable; clause (d) as a byte grep misses a glob delegation and fired on an L1 comment that named the round (removed before scoring). | `K92CriticA/attacks.md` (via `w1/K92CriticA.md`), `K92Mutation/mutants.md` (8/17 oracle mutants survive), `K92Reviewer/review.md` F3, `close-l1/construct-*.txt` | Q85 (class sampling) would have caught it had the frozen counter armed zero-population classes with synthetic members; it was not applied to this counter | Next counter: type-strict comparison, synthetic members for every field class the population lacks, a runtime read check for independence, and a held-out set the author cannot compute (post-freeze inputs only). Routed to round 93; the frozen r92 instruments stay as written. |
| **M92-4 (this round) — test fixtures carried secret-shaped strings**: K92Sentinel's redaction-attack fixtures held fake tokens (AWS doc example key, fake Slack `xoxb-`, fake Stripe `sk_live_`, fake `sk-proj-`), so the first integration commit `d6bbe169` was refused by GitHub push protection (GH013). With the orchestrator's one-time authorization the unpushed commit was abandoned (`jj abandon --restore-descendants`), the tokens replaced by `<FAKE-REDACTED>` (`close-l1/redact-fixtures.py`, `close-l1/redact-fixtures.txt`), and the originals kept OUTSIDE git at `/fast/scratch/kumitate-r92-redacted-originals/` (sha256 in `close-l1/redacted-originals-sha256.txt`). The redacted fixtures no longer reproduce RD-1; RD-1 rests on K92Sentinel's committed report text. | GH013 rejection of `d6bbe169`; `close-l1/redact-fixtures.txt` | none: the wave context forbade printing credential-shaped strings from transcripts but said nothing about synthetic fixtures | Every fixture that needs a secret shape is written with the redaction marker from the start (or assembled at run time from split literals no scanner matches); the round-93 wave context says so, and the L1 greps the commit diff for `AKIA`, `xox[abposr]-`, `sk_live_` before every `jj-lane.sh commit`. |

### Assimilation — `considerthese/2026-11-05.md`, "Self-improvement ideas" item 3 (streak-aware calibration)

The idea: flag at N=3 that "the question, not the answer, should change", e.g. "a post-freeze held-out probe set …
never shown to candidates". Grounded through the lane's own bar: the receipt-bind streak was 4 UNMET when it was
written and 5 at r91 (MANIFEST rows above); `plan.md` § Fresh start cites it and does not re-claim receipt-bind. This
round implemented the held-out half via the post-freeze wave. Two divergences recorded: the C draw is not held out
(see Gate), and the flag fired at N=5, not N=3. `considerthese/2026-11-06.md` (operator, committed `7b948858` before
the freeze) idea 1 is the M92-2 recount; idea 3 (adoption-before-freeze) names this round's own miss: the round-91
spot-check was adopted after the freeze, not before (M8 class, again).

## Routed to round 93

- M92-3 counter defects (above); K92Reviewer F2 (HELD does not check that the last `--waves` entry is the held-out wave;
  this round's receipts show it is) and F1 (oracle falls back on a non-string subagent model, 0 instances).
- K92Scout D1 (`errors` counts attempts, not requests — never report it as "failed requests"), D2/D3 (row order),
  D4 (`fallback` role reused for revert), D5–D8 (`upstreamModel` absent from persisted turns; `upstreamProvider`,
  `retryRecovery.supersededBy`, `session_init.retryFallback` unmodelled) — `K92Scout/recon.md`.
- K92Sentinel RD-1 (the 24-char redaction misses 8 credential families; 0 live exposures today), RD-4/RD-5 (oracle FIFO
  and symlink reads), RD-7 (a >512 MB single line fails closed); K92Connector: `PROVINCE.md:16,57` "content stays out of
  scope" predates this tool (the lane's `inline-dispatch-evidence` already reads transcripts) — a dated amendment is owed.
- Carried from the r91 spot-check §5: receipt-bind survivors m02/m07/m08/m10/m11 and the K91 reviewer/sentinel items stay
  with that capability line; tabi adjacency stays routed to tabi.

## Operator note

None. No L0 question was filed this round.
