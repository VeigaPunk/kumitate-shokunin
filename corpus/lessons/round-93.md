# kumitate round 93 — lesson (`seat-route` v1 → v2; capability upgrade, attempt 1)

Frozen at lane commit `b6204949e3bb17df9d6cf0cc3f59ea0c4b362061` (committer time `2026-11-06T17:53:14-03:00` =
`20:53:14Z`): `.ufo/waves/round-93/plan.md`, `probe/oracle93.py`, `probe/probe93-c1.py`, 16 fixtures
(`probe/make-fixtures93.py`), 15 pre-data controls (`controls/table.txt`), `open/` captures. Wave
`.ufo/waves/round-93/w1` (13 seats; spec + validated dispatch `3b82a316`). The `--after` literal
`2026-11-06T21:40:00.000Z` lies 46 min 46 s after the freeze (kill clause (f) cannot fire). Drafted from
K93ScribeLesson (`.ufo/waves/round-93/K93ScribeLesson/`); Gate, verdicts and Q87 are the L1's.

Claim C1 operability, capability upgrade `seat-route` v1 → v2 (contract `kumitate-seat-route-v2`): `errors` →
`error_attempts` (one persisted error row per failed attempt, K92Scout D1) plus `recovered_attempts`,
`superseded_by` (`retryRecovery.supersededBy`), `upstream` (`upstreamProvider` of served turns), `resolved` and
`chain` (first `session_init`), `flag_hops` and `revert_hops` (the reused `fallback` role, D4). Pre-data: positive
control `HELD agree=221/221`; do-nothing and the shipped v1 `UNMET agree=0/221`; twelve one-field ablations
`UNMET` 0..220/221; four ablations are caught only by the synthetic F set (`flagtruthy`, `parseerr0`,
`redact23`, `upstreamall`) — stated in the plan's Q86 field table.

## Gate

- **admit — `scripts/seat-route.mjs` v2** (integrated sha256 `7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8`).
  Built by K93ExecTool (READY `f86bde98…`, rev 3: rev 2 `98a5a3a3…` was attacked by most seats; rev 3 fixed the
  K93Reviewer/K93CriticB `errorMessage: null` → `""` defect, the JS-vs-Python trim class, and the non-string
  `subagent:` model fall-through, each named in `w1/K93ExecTool.md`). L1 integration changes only the selftest:
  `recovered-attempts` made asymmetric (two exact `recovered` rows vs one `Recovered`) and a new
  `superseded-by-lone-nonobject` arm — they kill K93Mutation's counter-only M01 and survivor M02
  (`.ufo/waves/round-93/close-l1/survivor-remut.txt`: `ROWS_KILLED=3 of 3`, selftest 63/63 on the shipped bytes).
  Kill clauses at M: see LOG.md round 93 and `close/` receipts.
- **admit — knowledge `corpus/knowledge/seat-route-retry-fields.md`** on S267/S268/S269/S270. Quotes re-opened:
  K93ScribeSources re-fetched the three pinned files (`refetch.txt`, sha256 equal to `open/sources-fetch.txt`);
  the L1 fetched the same pin before the freeze (`open/`), sha256 `1059a80e…` (turn-recovery.ts), `22ea739a…`,
  `4035dad3…`. Located quotes: turn-recovery.ts:1061 `entry.message.retryRecovery = retryRecovery;`;
  types.ts:1262 "How an automatic retry recovered or ultimately settled a failed attempt." Mismatches 0.
- **admit — QUALITY Q87** (filed reports are corrected by appending): shown able to fail on r92 and r79
  (`K93ScribeLesson/receipts/report-append-check-rewrite.txt`, `…-erratum-rewrite.txt`, rc=1) and to pass on r82
  (`…-append-kumitate.txt`, rc=0).
- **admit — PROVINCE amendment 2026-11-06** (seat transcripts are read by content by `seat-route`, read-only and
  redacted; the depth-1 readdir+lstat bound for `~/.omp/agent` members stands). Closes r92 spot-check §5 item 5.
- **reject — "`RUNTIME: CLEAN` shows the tool does not delegate to the oracle"**. K93ExecRuntime x7 (TracerPid-aware:
  traced → v1, untraced → oracle) reads `C93_C1: HELD 221/221` with `RUNTIME: CLEAN`; x5 (relative path) and x6
  (symlink alias) read a fixture with `RUNTIME: CLEAN`; K93CriticA `t-embed.py` (base64 oracle executed in-process)
  HELD and byte-grep clean; K93CriticB five evasions CLEAN. The clause traces one invocation and matches literal
  strace strings. Not a kill event under the frozen rule (constructions are excluded by design); a counter
  finding routed to round 94.
- **reject — "H is a held-out set no author can compute"** as stated. Nothing committed at the freeze names H (the
  pool was empty: CriticA, CriticB), but K93CriticB forged 60 transcripts in a scratch sessions root and the
  frozen counter scored them as H (`h_forge2.receipt.txt`); mtime touch evicts members. H is post-freeze, not
  provenance-checked. The M run's H items are cited by path in the receipt for the closure to check.
- **reject — K93Scout D1 ("`superseded_by` contradicts omp") as kill-(c) material**: the values are correct
  (26 582 recovered rows all carry `supersededBy`, 785 superseded rows none); the field's NAME reads as the
  upstream `superseded` status while it lists the successor. Routed as naming.

### Sources opened this round (CORPUS.md rule 1)

Captured 2026-11-06 from `raw.githubusercontent.com/can1357/oh-my-pi` at `79fa222e8390aed3494f4bc6746814e6c74c21cf`
(`git ls-remote … refs/heads/main` returned that commit; `open/sources-fetch.txt`).
- **S269 (new)** turn-recovery.ts — https://github.com/can1357/oh-my-pi/blob/79fa222e8390aed3494f4bc6746814e6c74c21cf/packages/coding-agent/src/session/turn-recovery.ts,
  accessed 2026-11-06; quote (turn-recovery.ts:939-940, 16 words): "Durably record a terminal empty error turn
  (`stopReason: "error"` with no substantive content) that `#persistSessionMessageIfMissing` skipped".
- **S270 (new, own-work)** host transcript routing-field census, `K93ScribeSources/census.py --list sample-paths.txt`
  (1500 pinned paths), accessed 2026-11-06; quote (`census.txt:26-28`): "flag_hops=941 revert_hops=17
  role_fallback_rows=958".
- **S267, S268 (re-opened, used-by changed)**: `corpus/knowledge/seat-route-from-session-transcripts.md` →
  `corpus/knowledge/seat-route-from-session-transcripts.md, corpus/knowledge/seat-route-retry-fields.md`
  (old → new, both rows). Status/recheck unchanged.
- Auxiliary capture, not a row: `retry-fallback-chains.ts` (home of `RetryFallbackRole`, lines 185–190),
  `K93ScribeLesson/rbchains.ts`, sha256 `b5db5299…` (see M93-2).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M93-1 — a filed report was rewritten in place** (r92). | fleet `cfb99a19` → `6982c483` on `.ufo/reports/round-92/kumitate.md`: `git diff --numstat` → `4 4` | PROTOCOL §Round-robin (corrections by erratum) — prose only, no check | Q87 + `report-append-check.sh`; shown able to fail (r92, r79 rc=1) and pass (r82 rc=0). This round's report is committed once and never rewritten. |
| **M93-2 — a field citation pointed at the use site, not the type's home.** plan.md cites `session-entries.ts 277–300` for `retryFallback.chain`; the interface carrying `chain` is in `retry-fallback-chains.ts:185–190`. | `grep -n RetryFallbackRole .ufo/waves/round-93/open/session-entries.ts` → `14:import type …`, `300:` | CORPUS.md rule 1 (open what you cite) — not applied to type imports | the knowledge entry cites the auxiliary capture for the chain's meaning; a row for retry-fallback-chains.ts is routed to round 94. Not shown able to fail (no check) — unfixed. |
| **M93-3 — the counter's runtime clause (kill d) is a literal-string, single-invocation trace.** | K93ExecRuntime `verdict.md` (x5/x6/x7 CLEAN, x7 HELD), K93CriticB `findings.md`, K93CriticA `rcpt-embed.txt` | Q86 "a critic seat tries a per-field ablation" — covers fields, not the independence clause; L1 freeze review — none | routed: trace every invocation, `realpath` + inode match, traced-vs-untraced stdout identity, exempt the tool's own path, read-only H/A copies with a sha manifest. Unfixed this round (the counter is frozen). |
| **M93-4 — a seat ended without its `w1/<Seat>.md` trailer** (r92 debt 3 repeated: K93Scout). | `.ufo/waves/round-93/w1/K93Scout.md` is the L1's extraction from `w1-results.json` (labelled) | the wave context line "write your trailer" — instruction only | routed: a close check that counts `w1/*.md` against `w1-results.json` seats. |

### Assimilation — `considerthese/2026-11-06.md` idea 3 (adoption-before-freeze)

Performed: `spotcheck-adopt --adopt corpus/lessons/round-92-verifier-spotcheck.md` → `ADOPTED … wrote=both`,
`README_MAP: CLEAN files=237`, then `--check` → `SPOTCHECK_COVERAGE: CLEAN spotchecks=59 uncovered=0` exit 0,
before the freeze commit `b6204949` (which carries the adoption bytes: `corpus/README.md`, `.ufo/pins/readme-map.json`).
shokuknow package: `Assimilation: none` (K93Connector: no staged transcript/routing theme fits; `w1/K93Connector.md`).

## Routed to round 94

- M93-3 counter repairs (above); K93Mutation M01/M02 class (selftest arms now kill both; the frozen F set still
  masks M02 — add a lone-string `supersededBy` fixture to the next counter).
- K93CriticA HELD constructions with no discriminating member: `t-captured-last`, `t-captured-skip-nonstring`,
  `t-resolved-empty-null` → proposed fixtures F93CapturedTwice / F93CapturedNonStr / F93ResolvedEmpty.
- Oracle-vs-text gaps (CriticA, Reviewer): Python `json` accepts `NaN` rows; invalid UTF-8 (oracle parse error vs
  tool U+FFFD); the plan is silent on a non-string `subagent:` model (oracle and rev-3 tool fall through).
- K93Scout D2: plan takes the FIRST `session_init`, omp's reader takes the LAST (0 of 26 875 files differ today).
- K93Sentinel R93-D1: `resolved`/`chain`/`upstream`/`superseded_by` print harness values unredacted (observed values
  are model identities only); S3a/S3b human-mode rendering forgery (newline/`key=value` in untrusted values; rev 3
  escapes seat names, `human-escape` arm); RD-1 reproduced with a non-secret token on v1 and v2 (`rd1-repro.txt`).
- K93ExecRetro: 2 CONTRADICTED + 5 UNDERSTATE seat-status statements in r85–r92 reports (`contradictions.md`);
  reports from round 93 quote `seat-route` output instead of prose.

## Operator note

None. No L0 question filed.
