author: hyaku closure (non-author integrator, @m_zfl)

# Round 86 — non-author verifier spot-check (kumitate)

Lane `kumitate-shokunin`, lane-round 86, hyaku run 15. Base `232350995d3001e606609aaf22ba1b58168d3655`,
freeze `e7228850690c6bd48400140964cbaf18667fbc06`, measured revision M `19b4e440e83ea9d618708003f36c3a799eb13e08`,
tip `fc0316e7f3bb84b08ead7944891d83d80cd67d9e`. Report `.ufo/reports/round-86/kumitate.md` (fleet commit
`c18592c3`). I did not author this round: I re-measured the claim, re-opened the gate decisions and ruled the
axes and trends. Nothing in this file is a lane self-assessment.

**Verdict: C1 VERIFIED; status `ok`, admitted.** One claim, one axis moved by capability acquisition; no axis
harmed. Three status-neutral defects are routed to round 87 (D1–D3), plus the carried `ready-handoff` red (D4).

## 1. Step-1 conformance

| check | command | observed |
|---|---|---|
| report landed by the lane identity | `git log --format='%an %H' -- .ufo/reports/round-86/kumitate.md` | one commit, `kumitate-shokunin c18592c3be59f124fd4e48e37e0b1226ccdc9280` |
| report lands last | committer dates | report `c18592c3` 18:13:54-03:00 > tip `fc0316e7` 18:13:18-03:00 > `ee0ffa9f` 18:13:11 > M `19b4e440` 18:11:52 (committer clock). Holds. The report's *author* date 18:09:24 predates the two follow-up commits — a jj amend artifact, not a filing order: the filed bytes cite `fc0316e7`, a hash that only exists after 18:13:18 |
| `SHONEN` heading | `grep -c '^## SHONEN' …/kumitate.md` | `1`; 4 box lines, all `[~]`, `[x]` count `0` |
| cited lane commits exist and are ancestors of the branch | `git merge-base --is-ancestor <h> master` for `e7228850`, `d12847c5`, `19b4e440`, `ee0ffa9f`, `fc0316e7`, `6e3e4749`, `602f1835` | all present, all ancestors of `master` |
| cited historical report commit | `git cat-file -t b67837ee` | a commit in the **fleet** repo (`round-85: kumitate report …`), not a lane commit — cited as such (R85-V13). Correct |
| no uncommitted round work, pushed | `scripts/hyaku/jj-lane.sh state …` / `git status --porcelain` | `ahead=0 behind=0 tracked=0 untracked=0`; status empty; `ls-remote origin refs/heads/master` = `fc0316e7…` |
| prompt carries the template contract | headings of `.ufo/prompts/kumitate-round-86.md` vs `templates/round-prompt.md` | §1–§5 identical; addendum §6 present; five child-lane items present (report path §4, commit-then-report §5, `SHONEN` heading §4, commit-hash citation §4/§5, write scope §5); L2 floor §3 quotes `MISSION.md` §L2 concurrency's 8 |
| report sections, in contract order | `grep -n '^## ' …/kumitate.md` | Work performed, Landed changes, Before → after, Sources & frontier, Trend verdicts, SHONEN, Round shape — complete |
| report not a marker | evidence pointers | `plan.md`, `probe/`, `controls/`, `close/`, `open/`, `w1/`, `build/` all resolve under `.ufo/waves/round-86/`; commit hashes resolve |

Wave shape matches the run-15 addendum: one v1 wave, 12 seats (band 8–16), attack 5/12 ≥ 25 %, connector 1,
no residual call; one dead seat (`K86Mutation`, provider 401) and four artifact-less attack seats are
disclosed in the report rather than credited.

## 2. Claim re-check — C1, operability, capability `counter-receipt` v3

Counting command (the frozen predicate, unchanged since the freeze — `git diff e7228850 fc0316e7 --
.ufo/waves/round-86/probe/` shows only the disclosed `same-path.mjs` supplement and the `cv-*.txt` receipts):

```
node .ufo/waves/round-86/probe/probe86-c1.mjs --lane <DIR> --work <SCRATCH>
```

**Re-measured by me** (v2 bytes extracted from the base commit into a scratch lane; probe bytes identical at
freeze, M and tip, sha256 `a59dabdb…`):

| state | tool bytes | observed | exit |
|---|---|---|---|
| before (v2) | `f385bd7a9fbf1dc49d465c8d83fecfd07aae34f6bf619aca7d935eda14f238cd` | `C86_C1: UNMET held=14/24` — the ten `src-*` arms fail on the missing `sha256=` field | 1 |
| after (M = tip) | `e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069` | `C86_C1: HELD held=24/24` | 0 |

Controls, re-run by me over copies of the committed control trees: base `UNMET held=14/24`, stub `0/24`,
no-reader `0/24`, nonce-replay `0/24`, each exit 1 — the frozen kill rule ("any control reaching 24/24")
does not fire. Reported values match exactly.

**Re-executed because the committed evidence contradicted the report** — the independent driver (the report's
corroboration; see D2):

```
node .ufo/waves/round-86/build/K86ExecDriver/driver86-c1.mjs --lane <lane> --work <SCRATCH>
→ TOOL_SHA256=e9531370…  K86_EXEC_DRIVER: HELD held=54/54  exit=0
```

**Evidence-verified, not executed** (PROTOCOL §Gate standard — a sibling's gate is verified by its committed
receipt): tool selftest `COUNTER_RECEIPT_SELFTEST: PASS held=63/63` (`close/selftest.txt`); `README_MAP: CLEAN
files=219 rows=219 covered=219` + `README_MAP_SELFTEST: PASS (18/18)` including the `outside-map` case that
asserts exit 1 with `outside_map=[1-9]` (`close/map.txt`, `close/map-selftest.txt`, `scripts/readme-map.mjs:431`);
`PROXY: MATCH … A=35 C=45 operability=9 … C2=219/219` at M (`close/proxy.txt`); `plan-before-ready --round 86`
`PASS` exit 0 (`close/plan.txt`); `SPOTCHECK_COVERAGE: CLEAN spotchecks=52 uncovered=0` (`close/spotcheck.txt`).

Supporting counts I re-derived from committed bytes: SOURCES rows `184 → 187`
(`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` at base and tip), tier histogram `A=158 B=19 C=10`,
status `mined=149 queued=13 rejected=25` (both match the report); `A` (non-`.ufo` tracked runnable) `35` at base,
M and tip, `A_wave` `945` at base / `955` at M (`990−35`), so `f_O` = 9 under either denominator; the R85-V12
README repair moved **28** rows into `## Coverage map` (31 added − 3 genuinely new: the adopted round-85
spot-check row, `counter-receipt-source-binding.md`, `round-86.md`) and removed 28 from `## Known gaps`.
`LOG.md` +65/−0, `corpus/QUALITY.md` +16/−0, `corpus/SOURCES.md` +3/−0 (append-only intact); `SHONEN.md` and
`PROVINCE.md` untouched.

**Ruling:** the claim's before→after re-derives exactly (14/24 → 24/24, controls unmoved, capability row
entered in `SCORECARD.md` with command and revision). Verified.

## 3. Axis verdicts

| axis | verdict | evidence |
|---|---|---|
| operability | **improved** | capability acquisition demonstrated on committed bytes: frozen predicate 24/24 (re-measured), selftest 63/63, driver 54/54 (re-executed). Integer stays 9 — terminal under `f_O`, as the report says; the move is the repertoire row, not a scalar |
| coverage | unchanged | retired axis, integer 10; no row touched |
| coverage:script-layer | unchanged | `S=88/88` term untouched in the stanza |
| coverage:runtime-layer | unchanged | `R=92/92` untouched |
| coverage:kimi-layer | unchanged | `K=55/55` untouched |
| coverage:omp | unchanged | `O_members=65 O_findings=0 O_bound=35` untouched |
| (harm scan) | none | `git diff <base> <tip> -- SCORECARD.md` changes only the proxy stanza (`A`/`A_wave`, `C2` 216→219), three pins, the new capability row, the named corrections and the round-86 sections; every other axis row is byte-identical |

## 4. Discernment spot-check (LEARNING.md)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S247 *A Brief Survey on Oracle-based Test Adequacy Metrics* | admit, tier B, mined | `https://arxiv.org/abs/2212.06118` (live) + committed capture `.ufo/waves/round-86/open/survey.html` (sha256 `838d0715…` ✓) | **agree** | Title confirmed verbatim; the ≤25-word quote (14 words) is in the abstract; a survey is strong secondary for this scope, so B is right and S245's A was inflated. S247 is the correct superseding row for the wrong title |
| S248 *The Oracle Problem in Software Testing: A Survey* | admit, tier B, mined | `https://eecs481.org/readings/testoracles.pdf` §1 Introduction, PDF page 1 + capture (sha256 `6c568949…` ✓) | **agree** | The located sentence (16 words) is on page 1 §1 verbatim; the reachable full text does satisfy S246's stated flip, and S246's own rejected cell is left as history rather than rewritten |
| S249 Node.js Crypto documentation | reject as semantic-correctness evidence (A for the digest API only) | `https://nodejs.org/api/crypto.html#hashdigestencoding` (live, v26.13.0) | **agree** | Anchor resolves (`id=hashdigestencoding` present); the 12-word quote is in `hash.digest([encoding])`; an API that hashes bytes says nothing about their correctness or authorship, so the rejection and its flip are right |

Gate-decision tally for the round: 2 admits, 1 reject, 1 re-adjudicated standing reject — I agree on all four.
No disagreement to learn from, and no criterion was added without a lesson behind it (Q79 cites the round-86
`## Mistakes` row and the round-85 spot-check's R85-V3).

`scripts/sources-census.sh validate --root … kumitate` → exit **0** (7 `W04` duplicate-URL warnings, all
pinned in `.ufo/pins/source-dupes.json` `known=7`; the 7th is the disclosed S245/S247 pair).

## 5. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | **unchanged** | The one admitted entry (`knowledge/counter-receipt-source-binding.md`) deepens ground the coverage map already holds (counter-instrument band); no new frontier area entered and no capability row is credited to expansion. Agree with the lane |
| quality | **improved** | A weaker instrument is superseded by a stronger one on the same surface, proven on committed bytes I re-measured (14/24 → 24/24, controls unmoved); two source rows are corrected by superseding rows rather than left standing; the orphan fragment gets a named correction; Q79 turns the round-85 attribution defect into a criterion. No admitted entry fails a re-check |
| discernment | **improved** | One reject with its flip, one standing reject re-adjudicated to an admit, five mined mistakes (three with shown-able-to-fail receipts), and my outside sample agrees on 3/3 gate decisions — the `improved` clause of `LEARNING.md` |

## 6. Routed defects (status-neutral; owed by round 87)

- **R86-D1 — close receipts misname the instrument they measured.** `.ufo/waves/round-86/run-close.mjs` hashes
  `scripts/counter-receipt.mjs` for *every* case, so `tool_sha256=` in `close/{proxy,proxy-selftest,map,
  map-selftest,spotcheck,ready,plan,census}.txt` is `e9531370…` while the measured tools hash
  `fd51dc98…` (proxy-check), `fc119ab6…` (readme-map). Nine of ten receipts therefore name the wrong subject,
  which is exactly the class Q79 was written against. Fix: hash the invoked script per case and re-emit.
- **R86-D2 — the independent driver's cited receipt contradicts the report.** The report, `LOG.md` and
  `SCORECARD.md` cite `K86_EXEC_DRIVER: HELD held=54/54` against `build/K86ExecDriver/`, but that directory's
  only transcript is `transcript-run1.txt` = `UNMET held=30/54` at tool sha `f385bd7a…` (pre-integration), and
  the seat's own report hands the post-integration run to the L1. The reading is true — I re-ran it and read
  `HELD held=54/54` at `e9531370…` — but the committed pointer does not support it. Fix: commit the
  post-integration transcript as a new file (append-only; run1 stays as history).
- **R86-D3 — three source gates are claimed with no receipt, one of them impossible at M.** `SOURCE_CAPTURE:
  CLEAN captures=76`, `SOURCE_DUPES: CLEAN groups=7 known=7`, `SOURCES_CHECK: CLEAN rows=187` are reported as
  gates at M with a `close/` pointer, but no such receipt exists in `close/`; and `SOURCE_CAPTURE` cannot read
  CLEAN at M, because `.ufo/pins/source-captures.json` at M binds `.ufo/waves/round-86/open/node-crypto.html`
  (sha256 `1aa0f3ad…`) while that file is absent from M's tree — it lands only at `fc0316e7`. The pin values
  themselves check out at the tip (76 captures, 7 duplicate groups, 187 rows). Fix: re-measure these three at
  the tip with committed receipts, or bind capture bytes and pin in the same commit.
- **R86-D4 (carried, disclosed) — `ready-handoff` reads `DRIFT RELATIVE_WAVE_PATH ×4` on this round's own
  dispatch** (`close/ready.txt`, seat `K86ExecProxy` names a lane-relative `.ufo/waves` path). Already
  round-87 candidate (6); recorded here so the queue outlives the round.
- **Self-note for the adopting round:** this file lands without a `corpus/README.md` map row (the closure's
  write scope is this one path), so `readme-map` will read `uncovered` and `spotcheck-adopt --check`
  `uncovered=1` until the row and its pin are adopted — the same recurrence as rounds 84/85 (round-87
  candidate 1).

## 7. Notes for the operator

- No axis harmed; C1 is a capability acquisition whose integer is unchanged by construction (`f_O` is
  terminal at 9). Read the move as "the lane can now do X", not "operability 9 → 10".
- Four of five attack seats produced no artifact (orchestrator kernel restart) and the mutation-tester died on
  a provider 401, so this round's falsification rests on the four frozen pre-data controls, the same-path
  supplement and the independent driver — all of which I re-executed. No post-data adversary is claimed, and
  none was found.
- The `SHONEN` boxes are all `[~]`; boxes 1–4 now look mechanically checkable by a non-author (registry rows,
  LOG entries, resolvable commands, untouched `PROVINCE.md`). Promotion stays operator-owned; I wrote no `[x]`.
