# kumitate round 93 — lesson (seat-route v1 → v2; capability upgrade, attempt 1)

Frozen at lane commit `b6204949e3bb17df9d6cf0cc3f59ea0c4b362061` (committer time `2026-11-06T17:53:14-03:00` =
`20:53:14Z`; `.ufo/waves/round-93/plan.md`, `probe/oracle93.py`, `probe/probe93-c1.py`, 16 fixtures, 15
pre-data controls, `open/` captures). Instrument hashes at the freeze: plan `12ade9e1…`, oracle `7b2b2e08…`,
counter `e3ef62ea…`, fixtures dir `probe/fixtures/` (16 `*.jsonl`), controls table `controls/table.txt`.
Wave `.ufo/waves/round-93/w1` (13 seats; spec `56580086…`, dispatch `6eb7b4e5…`). The `--after` literal
`2026-11-06T21:40:00.000Z` lies 46 minutes 46 seconds after the freeze, so no H member exists while the
contract, oracle and counter are written (plan § Frozen predicate; kill clause (f)).
Drafted from seat K93ScribeLesson's drafts (`.ufo/waves/round-93/K93ScribeLesson/`); this file is the draft —
the Gate, the verdicts and Q87 belong to the L1.

Claim C1 operability, capability upgrade `seat-route` v1 → v2 (contract `kumitate-seat-route-v2`). The v2
record renames `errors` → `error_attempts` (D1: one persisted error row per failed **attempt**, not per
request) and reads five surfaces v1 ignored: the error turn's `retryRecovery` (D7), the served turn's
`upstreamProvider` (D6), the first `session_init`'s `resolvedModel` and `retryFallback.chain` (D8), and the
`model_change` role/flag pair that separates a fallback hop from the revert-to-primary hop (D4).
Pre-data state (frozen, before any candidate existed): positive control `HELD agree=221/221`; do-nothing, the
shipped v1, and the `errname`/`v1names`/`typeloose` ablations `UNMET agree=0/221`; the remaining one-field
ablations `13, 22, 173, 188, 218` and `220` (four fields) — all twelve `UNMET` (`controls/table.txt`);
four ablations are caught only by the synthetic F set and are stated, not hidden (`flagtruthy`, `parseerr0`,
`redact23`, `upstreamall` — each `220/221`; plan § Q86 field table). The candidate became final at 18:00 (-03:00):
`K93ExecTool/READY` names sha256 `98a5a3a3…`, the builder's selftest reads `SEAT_ROUTE_SELFTEST: PASS
held=54/54`, and its seat-form score (pre-freeze `--after 18:47:06Z`, r91+r92 waves) reads
`C93_C1: HELD agree=221/221 … RUNTIME: CLEAN` only when the tool is copied outside `.ufo/waves/round-93/`
(`K93ExecTool/score1-clean.txt`: the same bytes scored from the seat dir read `RUNTIME: VIOLATION` on the
tool's own open, `score1.txt`/`score2.txt`). Those are builder receipts, not the Gate; the frozen M predicate
runs from the lane root at `scripts/seat-route.mjs` with `--after 2026-11-06T21:40:00.000Z` and the r93 wave.

## Gate

<!-- Skeleton. The L1 fills every `<L1: …>` from the close receipts; nothing below is a verdict until filled. -->

- **admit/reject — `scripts/seat-route.mjs` v2** (sha256 `<L1: tool_sha256 in both M receipts>`). Built by
  K93ExecTool (READY `<L1: sha>`); L1 integration changes `<L1: each change and the defect it closes>`.
  Kill clauses: (a) HELD twice with `RUNTIME: CLEAN` (`<L1: close/probe1.txt, close/probe2.txt>`; scored
  from the lane root — see Routed on the seat-dir self-open); (b) every non-positive control UNMET and the
  positive HELD (`controls/table.txt`, committed at the freeze);
  (c) `<L1: reproduction receipts, if any>`; (d) byte grep `round-93|oracle93|probe93|fixtures` = 0 on the
  shipped bytes and `RUNTIME: CLEAN` with only the argv results file under `round-93/` (`<L1: path>`);
  (e) `tool_sha256` in both receipts = `sha256sum scripts/seat-route.mjs` at M (`<L1: sha>`);
  (f) freeze committer time `2026-11-06T17:53:14-03:00` < `--after` `2026-11-06T21:40:00.000Z`
  (`git show -s --format=%cI b6204949`, verified at the freeze).
- **admit/reject — knowledge `corpus/knowledge/seat-route-retry-fields.md`** on S267/S268/S269 (draft:
  `K93ScribeLesson/knowledge-seat-route-retry-fields.md`). `<L1: quotes re-opened, mismatch count>`.
- **admit/reject — QUALITY Q87 (proposed)**: a filed report is corrected by an appended erratum, and a
  correction commit that deletes filed bytes fails a deleted-column check. Draft text is the M93-1 fix; the
  show-able-to-fail receipt is `K93ScribeLesson/receipts/report-append-check-*.txt`.
- **admit/reject — PROVINCE amendment 2026-11-06** (draft `K93ScribeLesson/province-amendment.md`): seat
  transcripts are read by content by `seat-route`, read-only and redacted, while the depth-1 readdir+lstat
  bound for `~/.omp/agent` members stands. Closes the r92 spot-check §5 item 5 / K92Connector finding.
- **reject — `<L1: each attack or construction finding, both directions>`**.

### Sources opened this round (CORPUS.md rule 1)

Captured 2026-11-06 from `raw.githubusercontent.com/can1357/oh-my-pi` at `79fa222e8390aed3494f4bc6746814e6c74c21cf`
(`open/sources-fetch.txt`, sha256 `98121e73…`; the pin is `main` on the same day). Capture hashes equal the
round-92 captures on the same pin for the two re-opened files.

- **S267** `packages/coding-agent/src/session/session-entries.ts` — re-opened, sha256 `4035dad3…`; line 14
  imports `RetryFallbackRole` from `./retry-fallback-chains`; line 37
  `export const EPHEMERAL_MODEL_CHANGE_ROLE = "fallback";`; lines 148–156 `ModelChangeEntry` (`model`, optional
  `role`, `resolvedModelIsFallback` at 155); line 292 `resolvedModel?: string;`; line 300
  `retryFallback?: RetryFallbackRole;`.
- **S268** `packages/ai/src/types.ts` — re-opened, sha256 `22ea739a…`; line 1262 "How an automatic retry
  recovered or ultimately settled a failed attempt." (11 words); `AssistantRetryRecovery` at 1263–1284 with
  `status: "recovered"` (1266) and `status: "superseded"` (1280), `supersededBy` present only on the recovered
  arm; `retryRecovery` at 1324; `upstreamProvider` at 1333 with the comment at 1326–1332.
- **S269 (new row)** `packages/coding-agent/src/session/turn-recovery.ts` — sha256 `1059a80e…`; the writer at
  1035–1062 sets `retryRecovery` on the error entry (`recovered` + `supersededBy {timestamp, responseId?,
  provider, model}`, else `superseded`); a fallback hop writes the flag
  (`appendModelChange(candidateSelector, EPHEMERAL_MODEL_CHANGE_ROLE, true)` at 2261; the Fireworks base at
  2550); the revert-to-primary hop writes the same role **without** the flag
  (`appendModelChange(primarySelector, EPHEMERAL_MODEL_CHANGE_ROLE);` at 2617).
- Auxiliary capture, not yet an S row: `packages/coding-agent/src/session/retry-fallback-chains.ts` (the home
  of `RetryFallbackRole`), same pin, sha256 `b5db5299…`, capture `K93ScribeLesson/rbchains.ts`; lines 185–190
  define `primary` and `chain`, the comment reads "Fallback selectors walked after the primary; empty
  explicitly disables fallbacks." (10 words).

Rows to add: 1 (S269, tier A, `mined`), used-by `corpus/knowledge/seat-route-retry-fields.md`; rows touched:
none. Draft state: K93ScribeSources drafts the row, the L1 lands it.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M93-1 — a filed report was rewritten in place** (the r92 defect, carried because r93 must not repeat it). Twenty seconds after filing, `6982c483…` replaced 4 lines of `.ufo/reports/round-92/kumitate.md` filed by `cfb99a19…` — the hashes of an unpushed commit and of the upstream pin moved to "by reference" — so the path's history no longer holds the bytes as filed. Class: a correction to a filed artifact that deletes filed bytes destroys the amendment history the artifact exists to carry, and a reader of the correction cannot tell what was filed. | fleet commits `cfb99a19abbc01361688daa2cbfe0c3abe44f0f4` → `6982c4833528eaf252e40f1ddc65da7856a0cfb8` on `/home/vgpnk/Projects/shokunin/.ufo/reports/round-92/kumitate.md`; `git diff --numstat cfb99a19 6982c483 -- .ufo/reports/round-92/kumitate.md` → `4	4	.ufo/reports/round-92/kumitate.md` (`K93ScribeLesson/receipts/numstat-rewrite.txt`, full diff `receipts/rewrite-diff-full.txt`) | r92 verifier spot-check §1 ("filed report rewritten in place", NOTE (defect, status-neutral)) and §5 routed item 2; PROTOCOL §Round-robin states the rule but no instrument checked it | Corrections append (`## Erratum` …), never rewrite; and the rule is now mechanical: `K93ScribeLesson/report-append-check.sh <repo> <filed> <correction> <path>` exits 1 when the numstat deleted column is > 0. **Shown able to fail** (receipts in `K93ScribeLesson/receipts/`): the r92 pair reads `REPORT_APPEND_CHECK … added=4 deleted=4` / `VERDICT: REWRITE` rc=1; a kumitate report corrected by an appended erratum — round-82 `dcd100cc…` → `8d0aab68…` ("round-82: kumitate report — append-only erratum …") — reads `added=18 deleted=0` / `VERDICT: APPEND-ONLY` rc=0; the round-79 commit *named* erratum (`cbb52bd6…` → `59aa9ae8…`) reads `added=6 deleted=4` / `VERDICT: REWRITE` rc=1, so the check tests bytes, not the commit message; a same-rev pair reads `ERROR: no diff …` rc=2 (fail-closed, so a green reading is not the only possible one). Raw numstat pasted: `4	4	.ufo/reports/round-92/kumitate.md`, `18	0	.ufo/reports/round-82/kumitate.md`, `6	4	.ufo/reports/round-79/kumitate.md`. |
| **M93-2 (this round, found while drafting the knowledge entry) — a field citation pointed at the use site, not the type's home**. Plan § D8 and the change text cite `session-entries.ts 277–300` for `retryFallback.chain`; that file imports `RetryFallbackRole` (line 14) and declares the field (line 300), but the interface carrying `chain` lives in `packages/coding-agent/src/session/retry-fallback-chains.ts:185–190`. No reading is affected (the frozen definition takes "the list's string items in order" and `oracle93.py` is executable), but an entry citing S267 for the chain's *meaning* would over-claim its source. | `grep -n RetryFallbackRole .ufo/waves/round-93/open/session-entries.ts` → `14:import type …` and `300: retryFallback?: RetryFallbackRole;`, no definition; fetched capture `K93ScribeLesson/rbchains.ts` sha256 `b5db5299…`, lines 185–190 | K93ScribeLesson (source line capture `receipts/source-lines.txt`) | The v2 entry cites S267 for the field's presence and the fetched file for the type, marked as not-yet-a-row; routed: add an S row for `retry-fallback-chains.ts` if the lane wants the chain semantics sourced. |

### Assimilation — `considerthese/2026-11-06.md` "Self-improvement ideas" item 3 (adoption-before-freeze)

The idea: when a verifier spot-check lands the same day as a freeze, verify `plan-before-ready` / map coverage
for that file before calling the freeze clean — M8 was a repeated class (r82/r87/r91). This round performed
it: the round-92 spot-check was adopted before the freeze (`plan.md`: "Round-92 spot-check adopted before
this freeze (`spotcheck-adopt --adopt` → `wrote=both`, `SPOTCHECK_COVERAGE: CLEAN spotchecks=59 uncovered=0`;
considerthese/2026-11-06.md idea 3"), and the freeze commit `b6204949` message records "… r92 spotcheck
adopted". Divergence recorded: no standalone adoption receipt lives in `open/` (that directory holds only
`census-start.txt`), so the reading is quoted from the plan rather than re-runnable from a committed
transcript — routed below as a small gap in the receipt discipline this idea is meant to enforce.
`considerthese/2026-11-06.md` item 4 (a class-diversity note in the plan) is met by the Q86 field table's
per-field distinct counts and the named F-set-only ablations.

## Routed to round 94

- **M93-2**: add a SOURCES row for `packages/coding-agent/src/session/retry-fallback-chains.ts` (the
  `RetryFallbackRole` home) if the lane wants the chain's semantics sourced, or keep the auxiliary capture
  reference in the entry only.
- **Counter properties read at the freeze (not defects found by execution)** — `probe93-c1.py` at
  `b6204949`: `LIVE_S = 900` makes `score_files` skip any transcript whose mtime is < 900 s old
  (`SKIP … live-or-vanished`), so an H member touched within 15 minutes of scoring silently drops out of the
  H count; score after quiescence, or read a shrinking H pool as a timing reading, not a candidate defect.
  `runtime_check` ignores `execve` lines ending in `ENOENT` and flags only a second successful exec, so a
  tool that delegates through `sh` is caught by the second-exec rule, not by the round-93 path rule.
  `thin_fields` counts distinct values over all sets including F while the receipt prints `distinct_all` and
  `distinct_real` separately; the four F-only ablations are the fields with `distinct_real = 1`.
- **Runtime clause vs tool location**: `runtime_check` flags any opened path under `/.ufo/waves/round-93/`
  other than the argv results file, and `node` opens the tool's own script path — so a candidate scored in
  place from `K93ExecTool/` reads `RUNTIME: VIOLATION` on itself. The builder's receipts show both sides:
  `score1.txt`/`score2.txt` (`RUNTIME_FINDING open …/K93ExecTool/seat-route.mjs`, `RUNTIME: VIOLATION
  findings=1`) and `score1-clean.txt` on the same bytes copied outside the round dir (`cmd=… --tool
  /fast/scratch/hyaku/kumitate-r93/K93ExecTool/score-tool.mjs`, `RUNTIME: CLEAN findings=0`; `tool_sha256`
  `98a5a3a3…` identical in all three). Not a kill at M (the tool is `scripts/seat-route.mjs`, outside
  `round-93/`), but the M run must be from the lane root; a future counter should exempt the tool's own
  path or state the rule.
- **Adoption receipt**: the r93 `SPOTCHECK_COVERAGE: CLEAN spotchecks=59 uncovered=0` reading exists only as
  a plan quote and the freeze commit message; commit the command output under `open/` next round so the
  assimilation claim is checkable without the plan.
- **r92 spot-check §5**: item 4 (RD-1 no longer reproduces from committed non-secret fixtures) and item 6
  (checklist reds 738/757, operator/host-bound) stay with their capability lines; item 3 (missing
  `w1/K92Reviewer.md` trailer) is a trailer rule this round enforces (`K93ScribeLesson.md` written).
- If Q87 is admitted, move `report-append-check.sh` into `scripts/` with a selftest and a checklist row
  (fleet-repo report commits included, not only lane reports). Run it once over the historical report corpus
  as a baseline: the sampled kumitate errata are not uniformly append-only — round-82 `8d0aab68` reads
  `18	0` (clean) while round-79 `59aa9ae8` reads `6	4` despite its "erratum" subject
  (`receipts/numstat-*kumitate.txt`); the rule is about bytes, not commit messages, and the historical
  readings should be recorded, not retro-corrected.
- `<L1: carry the wave's routed items (CriticA/B, Reviewer, Mutation, Sentinel, Connector, Harmony, Runtime, Retro)>`.

## Operator note

None. No L0 question was filed at draft time.
