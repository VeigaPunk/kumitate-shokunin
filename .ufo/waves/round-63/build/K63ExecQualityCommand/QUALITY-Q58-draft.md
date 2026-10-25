# Q58 draft — for the L1 to paste into `corpus/QUALITY.md` (I do not edit corpus/)

Highest existing id is Q57 (`corpus/QUALITY.md:945`), so this is Q58. The script must be integrated at
`scripts/plan-before-ready.sh` (byte-identical copy of
`.ufo/waves/round-63/build/K63ExecQualityCommand/plan-before-ready.sh`); the commands below use that path.

- **Q58 — a round's `plan.md` is committed before that round's first wave marker, and the command that
  says so exits 0 for a closed round.** Grounding: `corpus/lessons/round-62-verifier-spotcheck.md`
  §Verdict (routed defect 1) — round 62 read "the dispatched prompt contains no claim sentences" as "no
  claims declared" and filed a zero-claim round; it committed no `.ufo/waves/round-62/plan.md` at all,
  while `.ufo/waves/round-62/w2-dispatch.json` is committed at
  `6d8faede281e509a2201de504ffcb0f7781256fe`. Nothing in the lane could fail on that until this command
  existed. Measured at lane tip `b38a2065ab8ac5b198f6569b9013d04411c3d40d` (2026-10-25):
  `--round 62` → exit 1 `reason=NO_PLAN`.
  - **Who checks.** The lane L1 before it commits a wave's `.ready`, and again at close; the non-author
    closure re-runs the command at the round's tip revision and pastes the full verdict line.
  - **Field.** `.ufo/waves/round-<N>/plan.md` committed; the oldest commit that adds it is an
    ancestor-or-equal of the oldest commit that adds a top-level `.ufo/waves/round-<N>/*.ready`
    (fallback, only when no `.ready` was ever added: a top-level `*-dispatch.json`), and its committer
    time is `<=` that marker's. Pathspecs are glob-restricted (`:(glob)`) so a nested fixture marker
    under `controls/` can never stand in for the round's marker.
  - **Command.** `bash scripts/plan-before-ready.sh --round <N> --rev <tip>` → one line
    `PLAN_BEFORE_READY: PASS rev=<tip> round=<N> ... plan=<sha> marker=<sha>` and exit 0. Self-test of the
    command itself: `bash scripts/plan-before-ready.sh --selftest` →
    `PLAN_BEFORE_READY_SELFTEST: PASS (10/10)` exit 0. Standing sweep: `bash scripts/plan-before-ready.sh --all`.
  - **Fails when.** Exit 1: `NO_PLAN` (a marker is committed and the plan never was — round 62),
    `PLAN_NOT_ANCESTOR` (the marker commit precedes the plan commit — the wrong-order fixture), or
    `PLAN_CT_AFTER_MARKER`. Exit 2 is **not** a pass for a closed round: `NO_MARKER` means the round
    committed no wave marker at all, so the ordering was never demonstrated (round 63 at `b38a206`
    reads `NA reason=NO_MARKER` until wave 1's `.ready` is committed).
  - **Shown able to fail.** `--round 62 --rev dfa6fca8` → exit 1, `reason=NO_PLAN`, marker
    `6d8faede281e509a2201de504ffcb0f7781256fe`; wrong-order fixture (`.ready` commit `59a40c84` then
    plan commit `34a9aee0`) → exit 1 `reason=PLAN_NOT_ANCESTOR`; `--all` at `b38a206` → exit 1 with
    `failed=35,36,37,38,39,40,62`.
  - **Epoch.** The first round with a committed `plan.md` is round 41 (`34fccc170c73264faf5c27aaf7650d3419765ae0`);
    rounds 35-40 predate the convention and `--all` reports them `NO_PLAN` by design. The criterion
    applies from round 41 onward; a pre-41 round is not re-judged.
  - **Limit.** A plan and a marker committed together (round 50: `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`
    adds both `plan.md` and `r50-dispatch.json`) reads PASS, which cannot distinguish a pre-dispatch
    freeze from a same-commit write after dispatch; pair it with the round's `base/` freeze receipt and
    with C1's `inline-dispatch-evidence` gate, which binds seats to records the lane does not author.
    Committer time is lane-controlled and is a secondary arm only — the ancestry test is the real one. A
    history rewrite that makes the plan an ancestor of the marker is invisible to ordering alone, so the
    closure must pin the tip hash it judged.
