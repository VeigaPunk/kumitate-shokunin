RESULT CtlGlossaryEntry rev=a2e5b54c verdict=rejects rejecting_items=K5

Control object built in scratch only: /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlGlossaryEntry/fake-entry/
  A glossary.md (58 lines) — M1–M7 correct-sounding paragraphs, source ids S062–S074, E3-style header,
    E1 non-restatement section, sibling-seat citation. No decision table, no demo receipt, no control.
  B glossary-restated-table.md — A + 4-row table, operative guard column = round-44 command.
  C glossary-annotated-table.md — B, round-45 phrases moved to a note column only.
  D glossary-plus-two-rows.md — A + exactly two rows in round-45 wording, M id + source locator, no demo.

Scored with the frozen checklist plan.md:131-142 (K1–K5), one line per item. Commands and outputs:
  $ systemd-run --user --scope --quiet -p MemoryMax=1G -p TasksMax=64 timeout -s KILL 120 python3 k5check2.py <fixtures>
  glossary.md: rows=0                      (table ABSENT)
  glossary-restated-table.md: row1 r45=False r44=True  cell='`env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE` ...'
  glossary-restated-table.md: row2 r45=False r44=True  cell='`--clearenv`'
  glossary-annotated-table.md: row1 r45=False r44=True (r45 phrase present only in the note column)
  glossary-plus-two-rows.md: row1 r45=True r44=False cell='the seat shell starts with `unset $(git rev-parse --local-env-vars)` ...'
  glossary-plus-two-rows.md: row2 r45=True r44=False cell='bwrap spawned under `env -i PATH=… HOME=…` ...'
  rc=0

K1 — PASS on A, vacuously: zero decision-table rows, so "every row names a mechanism and a demo
  receipt with its control, or a source locator" has no instance. K1 therefore cannot reject the
  no-decision shape; the seven mechanism paragraphs are prose, not rows.
K2 — PASS on A, vacuously: the entry cites no demo, so "every demo the entry cites shows the effect
  and its control does not" has no instance. M5/M6 describe effects with no receipt and no control.
K3 — neutral: A cites S062–S074, which engages the re-open of the real rows; quote truth belongs to
  the falsify seats, not to this control. Nothing in K3 tests the no-decision shape.
K4 — PASS on A: it carries the E1 non-restatement section (omp-task-contract.md:90-102,
  pinned-evidence.md:98-101, lessons/round-44.md:129,138) and names the six demo seats.
K5 — FAIL, and it is the only rejecting item: A has zero rows, B's rows restate round-44 practice
  unchanged, so "at least two rows change a lane practice relative to round-44 practice" is false.

K5 restatement test (explicit answer to the item): a table restating practice unchanged does NOT
  pass K5 as written against the round-44 baseline, because the baseline is textual and fixed:
    .ufo/waves/round-44/controls-spec.json context, 14 words: "made with GIT_DIR, GIT_WORK_TREE and
    GIT_INDEX_FILE unset: env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE"
    .ufo/waves/round-44/controls/SentinelSandboxEscape.md:7 counter argv carries `--clearenv` with no
    spawn env; :29 remediation is to spawn bwrap with an explicitly minimal environment.
  Round-45 contract changes both (a2-control-dispatch.json context: "start your shell with
  `unset $(git rev-parse --local-env-vars)`"; K5 line 142: `env -i` in front of bwrap). Restated rows
  keep the round-44 tokens, hence r45=False r44=True, hence K5 fails.

Counterexample that matters (object D): a glossary plus two rows transcribed from the round-45
  contract passes ALL of K1–K5 on a literal reading. K1 by its "or a source locator" alternative,
  K2 vacuously (D cites no demo), K3 untouched, K4 by the non-restatement section, K5 by the two
  round-45 rows. So the frozen checklist admits the mori r33 shape after a two-row paste, while
  plan § C1 promises each mechanism "a sandbox demonstration with a do-nothing control". Empty or
  absent build/Demo*.md is invisible to K1–K5. Plan F3 has the same disjunction ("a demo or source
  locator") and does not close it.

Second, narrower gaming surface: C shows K5 is satisfiable by keyword if checked file-wide rather
  than per operative cell — "git rev-parse --local-env-vars", "15 names" and "env -i" are in the file
  while every operative cell stays round-44. A reviewer must read the operative column.

Impacted axes: coverage (PROVINCE frontier band, C1). False provenance risk on the C1 verdict: with
  K5 alone as the practice test, `unprovable-but-better` is reachable by an entry whose demo
  coverage is empty although the plan claims it.

Smallest safe correction: re-quantify K2 from demos cited to mechanisms named —
  "every mechanism a decision-table row names is cited by a demo receipt in build/ whose do-nothing
  control shows a different result" — and require the two K5 rows to carry a demo receipt rather
  than a source locator alone. That fails object D at its first two rows and leaves A/B/C rejected
  by K5 as before.

Hygiene: no tool installed or updated; no lane write except this report; no git or jj mutation; all
  runs under the systemd-run scope, none over 1G / 64 tasks; pgrep -af a2-CtlGlossaryEntry returns
  nothing after the runs; temp files are the four fixtures plus two checker scripts (few KiB).
