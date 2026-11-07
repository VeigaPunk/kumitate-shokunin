# Round 94 — lesson draft: Mistakes + QUALITY Q88 (K94ScribeLesson)

Draft by seat `K94ScribeLesson`. The L1 owns `## Gate`, the verdicts, the assimilation line and the final
Q88 bytes; this file supplies one mined mistake with its captured-by analysis and one criterion draft whose
check was run to failure and to pass. Clock: all runs 2026-11-06 (UTC receipts under `receipts/`); lane
detached at `54add172b5613e98e32d8761c2efd549e240baf2`; the freeze commit is
`73317eca18c3927fc3c92fe492cd882dc4cda953`.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M94-2 (provisional number; M94-1 is the lane's plan-before-ready receipt defect) — a red lane gate was filed as a post-filing erratum.** Round 93's report cites the upstream oh-my-pi pin `79fa222e…` (declared by the lane's own registry rows S266–S269); the round's own gate read `COMMIT_CITED_UNRESOLVED … [79fa222e]`, and the lane appended an erratum ("the gate's citation scan does not distinguish external pins — routed to round 94") instead of repairing the gate or the citation in that round. | Fleet `/.ufo/reports/round-93/kumitate.md` § Erratum (appended after filing), lines 122–127: `node scripts/round-gate.mjs --round 93 --main-repo /home/vgpnk/Projects/shokunin` reads `COMMIT_CITED_UNRESOLVED cited=10 unresolved=1 [79fa222e]` … "the gate's citation scan does not distinguish external pins — routed to round 94 with M93-5." Lane `.ufo/waves/round-94/open/round-gate-r93-before.txt`: `COMMIT_CITED_UNRESOLVED cited=11 unresolved=2 [79fa222e 79fa222e8390aed3494f4bc6746814e6c74c21cf]`, `ROUND_GATE: DRIFT`, `exit=1` at `a6e4da96`. Re-run at the round's M `2f8475cd` by this seat: `receipts/q88-r93-fail.txt` (`Q88: FAIL … rc=1`). | **Q10** — "the round record passes the lane's own `scripts/round-gate.mjs` before close" — plus QUALITY *How to apply* step 5: "`… --round <N> … --main-repo .` → `ROUND_GATE: CLEAN`". Both are prose and neither has a command; Q10's second sentence glosses only a `##`-section *parse* failure ("A `##`-section record that the gate cannot parse is DRIFT"), so a citation red was read as a limitation of the gate rather than a Q10 failure. Q87 (append-only corrections) governed how the erratum was written, not whether the gate could be red. | Q88 below: the gate's exit at the round's own M is the criterion, so a red gate cannot be filed at all. Round 94 repairs the underlying gate (C1 declared-pin rule) and the r93 erratum becomes history, not a clearance. |

Why this is the mistake and not "the gate was wrong": the gate was wrong too (it could not tell an upstream
pin from a lane commit), but the round still had three in-round repairs available — extend the gate, cite
S269 instead of the bare pin, or drop the short token from the report — and it chose a fourth, filing red
and routing the repair. The defect is the disposition ("known erratum"), not the gate's blind spot alone.

## QUALITY Q88 — draft (append after Q87; next free number)

### Q88 — a round is filed only when the lane gate at its own integration commit reads CLEAN for it (round 94)

- **Rule.** Let `M` be the revision the report names as its integration commit. Extract the lane's gate
  bytes at `M` (`git -C <lane> archive <M> scripts`) and run that gate for the round with the fleet reports
  dir, the main repo and the origin: it must exit 0 with `ROUND_GATE: CLEAN`. A cited token the gate cannot
  resolve is repaired **before filing** — resolved in lane/main/origin, declared by a `corpus/SOURCES.md`
  registry row (the round-94 declared-pin rule), or removed from the report. An erratum appended after
  filing that explains a red gate does not satisfy the criterion; the gate's verdict at `M` is what binds.
- **Grounding.** r93 filed with `COMMIT_CITED_UNRESOLVED cited=11 unresolved=2 [79fa222e 79fa222e8390…]` at
  `M = 2f8475cd` (exit 1) and appended an erratum instead of repairing the citation or the gate that round —
  fleet `.ufo/reports/round-93/kumitate.md` § Erratum; lesson M94-2 above; `receipts/q88-r93-fail.txt`.
  Q10 already states the rule in prose ("the round record passes the lane's own `scripts/round-gate.mjs`
  before close") and *How to apply* step 5 already prints the close command expecting `ROUND_GATE: CLEAN`,
  but Q10's gloss is parse-only and no command ties the verdict to filing, so the citation red was
  dispositioned as a gate limitation. Q88 is Q10 made mechanical for the citation class, not a second
  doctrine.
- **Who checks.** The L1 before filing (one local command, ~1 s); the closure re-runs the same command at
  `M` from the fleet history of the report path.
- **Command.** `bash .ufo/waves/round-94/K94ScribeLesson/q88-gate-at-m.sh <round> <M> [lane] [fleet] [origin]`
  → `Q88: PASS` exit 0 / `Q88: FAIL` exit 1 (a usage/extraction failure is exit 2). Defaults are the live
  lane, fleet and origin. The script archives `scripts/` at `M`, runs the archived gate against the live
  lane's object DB, prints the gate line and the archived gate's sha256.
- **Fails when.** The gate at `M` exits non-zero for that round, or the round's report was filed with a red
  gate and the erratum is the only repair.
- **Shown able to fail.** `receipts/q88-r93-fail.txt`: round 93 at `M = 2f8475cdeca3aab569234537cd75d9f332aac6bc`,
  `COMMIT_CITED_UNRESOLVED cited=11 unresolved=2 [79fa222e 79fa222e8390aed3494f4bc6746814e6c74c21cf]`,
  `ROUND_GATE: DRIFT`, `Q88: FAIL … rc=1`, gate sha256 `09d4d792…`. `receipts/q88-r92-pass.txt`: round 92
  at `M = 7a8afb5fa02975e75cb2f33faf6d211a9680fc92`, `ROUND_GATE: CLEAN (round=92 … errors=0)`,
  `Q88: PASS … rc=0`, same gate sha256. The pair differs only in the round's citation set, so the check
  reads the report, not the gate version.
- **Limit.** It judges a round by the gate it could run at `M`: the round-94 fix does not retroactively
  clear r93 under its own `M` (that is intended — the frozen predicate keeps r93's historical reading and
  only the *new* gate reads it green). The archived gate is handed `--repo <lane>` (the live worktree):
  object probes are identical for commits reachable from `M`, but `COMMIT_MISSING` is a last-1000-subjects
  convention check, so a round older than 1000 commits can fail on that kind alone — the printed gate line
  names the kind, and a checker that binds citation identity should read the kind, not only the exit. The
  check cannot see a hex token the gate never extracts (outside backticks, shorter than 7 or longer than 40
  hex, or >40-hex digests). It inherits the gate's own limits (a registry pin declares a token without any
  network proof the pin exists upstream).

## Handoff to the L1

1. **Numbering.** `### Q88` is free (`grep -c '### Q88' corpus/QUALITY.md` → 0); Q87 is the last criterion.
2. **Script home.** `q88-gate-at-m.sh` is a wave instrument this round (same standing as Q87's
   `report-append-check.sh`). If the L1 registers it in `scripts/`, the README map, the proxy counts and a
   `COUNTER_PINS`-style pin move in the same change; otherwise cite it by seat path as Q87 does.
3. **Q10 cross-reference.** Q88 is admitted as the command for Q10's existing clause; if the L1 prefers,
   append a one-line "Q88 gives Q10 its command" note to Q10 rather than restating the rule.
4. **Do not weaken the `--repo` note.** The instrument's header explains why the archived gate is handed the
   live lane; removing that makes the older-round reading look exact when only the citation verdict is.
