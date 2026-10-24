# round-5 aggregator audit — kumitate-shokunin

- **Round:** aggregator round-5 (steered 16:47:37), 2026-09-28. Audited state:
  round-5 commit `e748e44` (16:43:08). Method: one read-only reviewer L2 —
  **34 citations re-executed** — + L1 adjudication (reviewer verdict adjusted
  on two calibration rulings, documented below).
- **Verdict (round-5 delta `e748e44`): conformant** — 0 corpus majors after
  adjudication; 5 minors + 1 tracked ledger obligation.

## Adjudication of the reviewer's "not conformant"

The reviewer filed two majors; neither survives adjudication as a *corpus*
major (CORPUS.md verdicts name corpus rules):

1. **"No SHONEN section in the round-5 report"** — a real **report-conformance
   defect** (kumitate was steered to round-5 at 16:17:22, 67 s after `c5abaac`
   (fleet repo `~/projects/shokunin`, 2026-09-28 16:16:15) landed the heading rule; `grep -c SHONEN .ufo/reports/round-5/kumitate.md`
   → 0), but it is filed with the integrator in the round notes, not against
   the corpus. Consequence stands: the report is disqualified as promotion
   evidence; `SHONEN.md` remains the untouched verbatim 4-box mint seed
   (0 asserted / 0 verified).
2. **"README lacks a `lessons/round-4.md` row"** — demoted to **minor** on the
   round-4 calibration: a missing row for a *knowledge* file is major (kasegi
   `program-quirks.md` precedent, ledger §10.1); a missing row for a dated
   *lesson* file is minor (same classification applied to kagi's missing
   `lessons/round-4.md` row this refresh). Re-run: `grep -c 'round-4\.md' corpus/README.md`
   → 0 while `ls corpus/lessons/round-4.md` exists (file landed `e0f5ca7`
   16:15:46; round-5 touched README without adding the row). Owing lane fixes.

## Verified — the round's highest-value fleet finding holds completely

**MembraneSeal argv defect re-verified at 4/4 code locations, zero drift**
(origin repo `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`; every relevant
file's last commit predates `e748e44`: run-omp-native-trial.mjs `32687dca2`
09-27 17:22 still 4693 lines; fleet-dispatcher.mjs `b18e0274d`; ufo-cli
main.rs `cf189c754`; cli_contract.rs `815ae81bc`): `sealBoundaryViaRuntime`
def :1904, argv `"membrane-seal", "write"` :1931, failure arm :1941;
`Command::MembraneSeal` flat struct :95 (no `write` variant), dispatch :276-282;
stub-side pin tests :3939/:4104 vs real-side omission cli_contract.rs :1514;
clap 4.6.6 in Cargo.lock. The queue-and-claim line pins (~20 symbol refs:
queueFile :4323 … recordDispatchResult :13187, runCycle :13415, singleton
refusal :14527, TERMINAL_TASK_STATES :233 incl. the failed-vs-external-edit
trap) all reproduce. Routing record: `round-5-aggregator-mirror-out-of-province-membrane-seal.md`
(this directory) — no province owns the target repo; integrator/operator disposition.

## Minors

3. `queue-and-claim.md:26-32` counter-legend range starts 4–5 lines early
   (cited :12486-12505; legend actually :12491-12509 — substance verified:
   MAX_PAUSED_RESUME_ATTEMPTS=8 :114, MAX_LAUNCH_MISSES=8 :118,
   LAUNCHING_GRACE_MS=120_000 :124, repend resets :9071).
4. `native-trial-launch.md:92` — `membraneSealState` cited as :1870-1892; def
   is :1862 (span :1862-1932). A quote names its location.
5. `queue-and-claim.md:79` — "dispatcher exposes only `repend`" passes in
   substance (`grep -rn 'spawnSync.*repend' scripts/*.mjs` → only
   `ufo-watchdog-repend.mjs`) but the sweep command is not printed inside the
   file; a negative claim carries its sweep.
6. `/tmp/clap-probe` durability: source (main.rs + Cargo.toml, clap 4.6)
   present, `target/` absent — the parse-fail output exists only as the
   report's quoted record ("unexpected argument 'write'"). Not verdict-bearing
   (the static 4/4 verification above is dispositive) but the fleet's pending
   ephemeral-evidence rule would require the pinned output or fixture in a
   committed artifact; it is quoted in the report, so keep as noted-minor.
7. `SEAL_WRITE_TIMEOUT_MS` verified 30 s at :1937 (matches the report's cite;
   reviewer's "60s straw" found no mismatch — recorded as verification, not
   defect).

## Tracked ledger obligation (not a corpus-rule violation — P-c is unlanded rule text)

- `lessons/round-1.md:29-31` still carries the falsified "installed ufo skill
  says 128 lanes" attribution — **third consecutive refresh open**, no forward
  correction entry (`grep -rn '128' corpus/` → the false claim + the two
  aggregator audits flagging it; `grep -in 'correct\|falsif\|supersed' corpus/lessons/round-{3,4,5}.md`
  → one unrelated hit). `knowledge/dispatch-shapes.md` stays clean (`maxLanes`
  100 cited). Owed: a named correction entry in the lane's next round.

## Verified clean

Credential sweep 0 hits (`grep -rn 'op://' corpus/` across 16 files; token/
secret/cookie patterns → only neutral placeholders like `wave_token: <token>`
and CREDENTIAL_FLAG_RE mechanism text). Append-only PASS (both aggregator
lessons single-commit; lane files never rewritten). LOG round-5 entry :51-74
cross-checked verbatim against the report; all pointers resolve.

## Falsification

Verdict flips to not-conformant if any re-run above fails to reproduce, or if
the calibration rulings are overruled by the integrator (both are printed with
their commands). Minors 3–5 close on the lane's next committed correction pass.
