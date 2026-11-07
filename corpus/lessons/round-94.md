# kumitate round 94 — lesson (`round-gate` declares SOURCES-registered upstream pins; attempt 1)

Frozen at lane commit `73317eca18c3927fc3c92fe492cd882dc4cda953` (committer time `2026-11-06T20:40:25-03:00`):
`.ufo/waves/round-94/plan.md`, counter `probe/probe94-c1.mjs`, control generator `probe/make-controls94.py`,
8 pre-data control receipts (`controls/`), `open/` receipts. Wave `.ufo/waves/round-94/w1` (11 seats; spec +
validated dispatch `791b1fdd`). Integration commit M = `d21decd2c0cf2f320938efd4570196ec19e683b1`
(`scripts/round-gate.mjs` sha256 `158062f8ac7bf51235d78aa90cb12bd38807ea093712e99ffe047490cb36ed33`).

Claim C1 operability (lowest non-retired axis, integer 9 terminal): the lane gate's citation scan resolves
lane → main → origin and otherwise reports `COMMIT_CITED_UNRESOLVED`; round 93's report cites the oh-my-pi pin
`79fa222e` that the lane's own registry declares (S267–S269) and read red. Frozen rule: a token that resolves
nowhere is `declared` iff it prefixes a 40-hex complete URL path segment (split on `/ ? #`) of an `http(s)://`
URL on a non-`rejected` `corpus/SOURCES.md` registry row. Sourced on S271 (gitrevisions `<sha1>`: "a leading
substring that is unique within the repository") and S033 re-opened (GitHub permalinks: the commit id replaces
the branch name in `blob/<id>/<file>`).

Pre-data: `ctl-positive` (L1 reference rule) `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1`; do-nothing
`UNMET a=0/1`; blanket `UNMET b=0/7 c=70/77 d=0/2 e=0/1`; substring, anyline, contains, norejfilter, slashonly
each `UNMET d=1/2`. At M, twice: `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1 tool_sha256=158062f8…`
(`close/probe1.txt`, `close/probe2.txt`).

## Gate

- **admit — `scripts/round-gate.mjs` (integrated `158062f8…`).** K94ExecTool built the rule (READY `341726f3…`,
  selftest 61 → 71; `arm-teeth.txt`: all seven rule-shape forgeries killed by a targeted arm). L1 integration
  added two hardenings and four arms (selftest 75/75): (1) the registry read is bounded and non-blocking
  (`O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, `fstat` on the descriptor, regular file ≤ 8 MiB) after K94Sentinel showed
  the candidate hang 20 s on a FIFO and abort V8 on a `/dev/zero` symlink; (2) one text-mode non-finding line
  `ROUND_GATE  info  COMMIT_CITED_DECLARED  declared=<n> [<tokens>]` after K94CriticB showed a declaration was
  invisible in the mode the checklist runs. Both narrow, never widen, the frozen sentence. Four integration
  mutants killed 4/4 (`close-l1/integration-mutants.txt`).
- **admit — S271** (gitrevisions `<sha1>` entry), opened 2026-11-06: https://git-scm.com/docs/gitrevisions,
  HTTP 200, sha256 `60bfaca3…`; quote (rendered lines 2179–2180, 17 words): "The full SHA-1 object name (40-byte
  hexadecimal string), or a leading substring that is unique within the repository." W04 vs S253 (same page,
  `rev:path` entry) disclosed; different teaching.
- **admit — S272** (oh-my-pi `session/retry-fallback-chains.ts` at `79fa222e…`), opened 2026-11-06 by
  K94ScribeSources and re-fetched by the L1: HTTP 200, sha256 `b5db5299…` (= the r93 auxiliary capture); quote
  (line 188, 9 words): "Fallback selectors walked after the primary; empty explicitly disables fallbacks." Closes
  M93-2; `knowledge/seat-route-retry-fields.md` now cites S272.
- **reject — the drafted second GitHub-permalinks row** (K94ScribeSources draft "S272", same URL as S033). Reason:
  a second row for a page the registry already holds adds a duplicate URL (W04) and no source; the new teaching
  (the commit id sits in the path segment the branch name occupies) is located on the page S033 already names.
  Disposition: S033 re-opened 2026-11-06 (HTTP 200, sha256 `0824dda4…`; quote "replaces main with a specific
  commit ID and the file content will not change", 11 words) and its `used-by` extended. Flip: a page whose
  teaching S033's scope cannot hold.
- **admit — QUALITY Q88** (a round is filed only when the gate at its own M reads CLEAN): shown able to fail on
  r93 (`K94ScribeLesson/receipts/q88-r93-fail.txt`, rc=1) and to pass on r92 (`…/q88-r92-pass.txt`, rc=0).
- **reject — "the frozen counter pins the rule"** (K94CriticA): 7 of 12 wrong-but-plausible gates reach
  `C94_C1: HELD` — `w-len8`, `w-minedonly`, `w-nosplit-q`, `w-col0`, `w-linescan-rejected` (rule clauses the 77
  reports and the fixture never exercise), `w-extra-declared` (clause (a) is membership, not set equality),
  `w-thin512` (clause (c) only sees checks the corpus exercises). Constructions are not kill events under the
  frozen K1–K4; the shipped bytes were checked separately: K94Reviewer's hand review (no blocker) and the
  selftest arms (i)–(xi). Routed: the counter's fixture under-covers five clauses.
- **reject — "declared means the source was opened"** as a gate property (K94CriticB 1b): one well-formed
  fabricated `queued` row silenced round 63's red token and both registry gates stayed CLEAN. The only guard is
  the closure re-opening the URL; recorded in the knowledge entry's self-attestation limit.

### Rows touched (old → new)

- S033 `used-by`: `corpus/lessons/round-38.md` → `corpus/lessons/round-38.md, corpus/knowledge/round-gate-declared-pins.md`.
- S269 `used-by`: `corpus/knowledge/seat-route-retry-fields.md` → `…seat-route-retry-fields.md, corpus/knowledge/round-gate-declared-pins.md` (sources-check `USED_BY_ASYMMETRY`).
- New: S271, S272 (status `mined`, recheck `on-release`).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M94-1 — the previous round's verifier spot-check was adopted after the freeze** (fifth occurrence of the M8 class: r82, r87, r91, r94; r93 did it by hand). The r93 spot-check landed at `a6e4da96` before this round opened; the L1 read it, froze at `73317eca` and dispatched at `791b1fdd` without `spotcheck-adopt --adopt`. | `close-l1/plan-before-ready-r94-at-dispatch.txt`: `PLAN_BEFORE_READY: FAIL … reason=MAP_DRIFT … map_first=uncovered:lessons/round-93-verifier-spotcheck.md` exit 1; adoption landed late at `54add172` (`close-l1/adopt-r93-spotcheck.txt`) | `plan-before-ready.sh` map arm (fires, but only after the freeze exists); `considerthese/2026-11-06.md` idea 3 (prose) | Adopted at `54add172` (map CLEAN). The detector is shown able to fail (the receipt above); the cure is ordering, not detection: run `node scripts/spotcheck-adopt.mjs --check` before writing the freeze commit and adopt into it. Routed r95: a pre-freeze command that exits 1 on an uncovered spot-check, so the freeze cannot be written red. |
| **M94-2 — a red lane gate was filed as a post-filing erratum.** Round 93's own `round-gate` read `COMMIT_CITED_UNRESOLVED … [79fa222e]`; the report appended an erratum ("routed to round 94") instead of repairing the gate or the citation that round, and the erratum itself quotes the full pin, adding a second unresolved token (`K94ScribeLesson/receipts/r93-erratum-vs-bytes.txt`). | fleet `.ufo/reports/round-93/kumitate.md` § Erratum; `K94ScribeLesson/receipts/q88-r93-fail.txt` | Q10 (prose only; no command ties the gate verdict to filing) | QUALITY Q88, shown able to fail (r93 FAIL rc=1, r92 PASS rc=0); this round's own Q88 run is `close/q88-r94.txt`. |

## Verdicts

- C1 operability: **HELD** under the frozen predicate at M (twice), K1–K4 not fired (`close/kill-and-harm.txt`:
  plan/probe/controls/open unchanged since the freeze; harm battery at M — readme-map, sources-check,
  counter-pins, spotcheck-adopt, `round-gate --tracked`, cite-sources CLEAN; census exit 0 with one new W04
  (S271 vs S253, same page, different entry); proxy DRIFT only in the bookkeeping terms `A_wave`/`C2`/`C2_total`
  that every round re-declares at close, as at base).
- Discernment caveat: the counter's real-report clauses separate only the do-nothing and blanket controls; the
  precision of the rule rests on the synthetic fixture and on the selftest arms, and five rule clauses are
  latent in the counter (K94CriticA).

## Routed to round 95

- Counter coverage (K94CriticA): fixtures for a 7-hex token, a `queued` declaring row, a `?plain=1` URL, an
  indented row, a `mined` row whose text says "rejected"; clause (a) as set equality; one fixture where an
  unrelated check is false at BASE.
- K94Sentinel: an unescaped `|` inside a cell shifts the status column (a malformed `rejected` row declares);
  `sources-census` refuses such rows, the gate does not run the census.
- M94-1 structural fix (pre-freeze adoption check).
- Carried from round 94 pre-registration, not taken: M93-3 counter repair (frozen r93 artefact), M93-5
  `--close` probe-receipt requirement, R93-D1 seat-route human-mode redaction, F93 fixtures.

## Assimilation

`considerthese/2026-11-06.md` idea 3 (adoption-before-freeze) is the class M94-1 repeats; mined as the mistake
above, not as a new proposal. shokuknow package: `Assimilation: none` — `ls /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`
lists MCP, failure-detector and isolation themes; none touches gate citation resolution or commit pins.
