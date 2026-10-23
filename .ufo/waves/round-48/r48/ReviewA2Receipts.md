RESULT ReviewA2Receipts verdict=SOUND_R47-1_SATISFIED

# ReviewA2Receipts — R47-1 receipt soundness

Review of `.ufo/waves/round-48/build/a2-rerun-{1,2,3}.txt` (the round-48 attempt-1 ExecA2Reruns inheritance:
three concurrent re-runs of the round-47 A2 counter at `f00cf278`, scored 11:52–11:56Z 2026-10-23).
Read-only review; lane repo and receipts untouched. No `lsp` device in this seat's inventory — all
cross-checks are direct `git` object reads and file hashes; nothing below is LSP-backed. No installs
(none needed).

## Verdict

**Yes — committed-quality receipts; R47-1 is satisfied.** All four assigned checks pass under
independent re-verification (not quoting the seat's own claims): probe identity, scripts equality,
the held triple, and load-trailer coherence. The receipts are self-verifying (each carries `cmd=`,
`probe_sha256=`, `probe_git_sha256=`, `scripts_diffstat_269dadb6_f00cf278=`) and their file digests
match the digests ExecA2Reruns.md §2 declared for them — bytes unchanged since written:

| file | lines | sha256 (re-measured, matches declared) | held |
|---|---|---|---|
| a2-rerun-1.txt | 11 | `2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630` | 3/5 |
| a2-rerun-2.txt | 11 | `e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba` | 3/5 |
| a2-rerun-3.txt | 11 | `9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507` | 4/5 |

## Check 1 — probe_sha256 == the round-47 A2 probe: VERIFIED

`1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057`, identical in all three receipts'
`probe_sha256` and `probe_git_sha256` fields. Re-measured three ways:

- `sha256sum` of the working-tree `.ufo/waves/round-47/probe/caproute-probe.mjs` = `1b438de2…a057`;
- `git show f00cf278:.ufo/waves/round-47/probe/caproute-probe.mjs` = `1b438de2…a057`;
- `git show e42eba65:.ufo/waves/round-47/probe/caproute-probe.mjs` = `1b438de2…a057`.

Probe history (`git log --follow` to `f00cf278`): `cac4300` A0 freeze → `796b49b` A1 freeze →
`8de35e7` A2 freeze, then untouched. So `1b438de2` **is** the frozen A2 counter bytes — the same
counter that decided round-47 C1, run unchanged as R47-1 requires.

**Doc-note (not a defect):** at `269dadb6` the probe blob is `35f3ad08…` (A1-era), because the A2
freeze `8de35e7` landed *after* the C1 commit. `probe_git_sha256` in the receipts is the blob at the
*scored* rev `f00cf278` — correct as recorded. A verifier hashing the probe at `269dadb6` would see a
different digest; that is expected, not tampering. R47-1 requires the *counter* unchanged and the
*scripts* equal — both hold; the counter is invoked from the working tree, not extracted from the
scored rev (same pattern as every round-47 control run).

## Check 2 — scripts_diffstat_269dadb6_f00cf278 == []: VERIFIED

- `git diff --stat 269dadb6 f00cf278 -- scripts/` → empty; `--name-only` → empty (exit 0).
- `git merge-base 269dadb6 f00cf278` = `269dadb6` — `f00cf278` is a descendant of the r47 C1 commit.
- Whole-tree `269dadb6..f00cf278` = 45 files, 3058+/5−, all `.ufo/`, `LOG.md`, `SCORECARD.md`,
  `corpus/` — zero `scripts/` entries, matching the seat's §0 claim.
- Commit subjects confirm roles: `269dadb6` = "round-47: C1 commit — five child sites … routed
  through cap-run via cap-spawn"; `f00cf278` = "round-47 verifier spot-check".

The receipt's claim is stronger than the assigned "five scripts": the **entire `scripts/` tree** is
byte-identical between the C1 commit and the scored rev — covering all five site scripts
(kimi-census, sources-check, claims-check, anchor-truth, plus cap-run/cap-spawn). A score at
`f00cf278` is a score of the same candidate code round 47 scored at `269dadb6`.

## Check 3 — held lines 3/5, 3/5, 4/5: VERIFIED

Receipt CAPROUTE_PROBE lines read exactly `held=3/5`, `held=3/5`, `held=4/5`, all
`rev=f00cf278… base=0bd8be60 rule=A2` — `base=0bd8be60` matches the probe's `BASE` constant
(`0bd8be60d9150030a2eee8344a2e70b65f6eb4f4`). This multiset reproduces the round-47 IRC-quoted triple
at `corpus/lessons/round-47.md:105-107` (MutRouteAT802 3/5, MutRouteK488 3/5, MutRouteCC879 4/5) —
exactly what the addendum records ("reproduce 3/5,3/5,4/5 at f00cf278"). The quotation is now backed
by committed bytes; R47-1's defect (re-runs existed only as chat quotes) is repaired.

Semantics note: the receipts reproduce the **held counts**, not the per-site labels of the quotes —
different sites MISS with different n/base_n across runs (K488/SC549/AT802 in run 1; SC549/CC879/AT802
in runs 2–3). That is the honest expectation for the non-deterministic A2 counter and is itself the
R47-5 defect on committed evidence: in all 15 SITE lines `uncapped_direct=0`, `gate_exit=0`,
`cases==base_cases` (54/54, 46/46, 47/47, 44/44), yet `n < base_n` at three of five sites per run
with reasons `no_cap_run_ancestor`/`no_capped_scope_ancestor` — parser record-loss, not absent
routing. The per-run variation (different sites losing 1–3 execs each run) is mutually inconsistent
in the right way — fresh runs, not a copy-paste.

## Check 4 — load1 trailers internally consistent: VERIFIED

| | run 1 | run 2 | run 3 |
|---|---|---|---|
| start | 11:52:41Z | 11:52:41Z | 11:52:41Z |
| end | 11:56:29Z | 11:56:27Z | 11:56:31Z |
| load1_start | 22.06 | 22.06 | 22.06 |
| load1_end | 54.49 | 54.97 | 54.49 |

- Identical start second and identical load1_start across all three = one concurrent launch (as the
  seat claimed: `for k in 1 2 3; do ./run-k.sh $k & done; wait`). Consistent, not fabricated — three
  forged runs would be tempted to differ here.
- Durations 226–230 s each, all well under the `timeout -k 10 3000` bound in `cmd=`; end times within
  4 s of each other — coherent for three overlapping runs of the same probe.
- load1_end cluster 54.49–54.97, ~2.5× the start value: matches the seat's explanation (sibling
  wave-1 probe load) and the addendum's "load1 22→54". A decayed 1-minute average after peers stop is
  plausible and stays within a 0.5 band across the three samples.
- `exit=1` in all three is the probe's own contract (probe:295-296: exit 0 iff `held=5/5`, 1
  otherwise, 2 cannot-evaluate) — consistent with `held<5/5`; no exit-2/timeout ambiguity.
- Caveat (recorded, not disqualifying): the trailer block (`exit=`, `start/end`, `load1_*`, `cmd=`,
  `probe_*`, `scripts_diffstat`) is appended by the seat's own `run-k.sh` wrapper, i.e. self-reported.
  Every field checkable post-hoc — exit-code semantics, probe digests, diffstat, rev topology — I
  re-derived and all match. `load1` is a point-in-time observation that cannot be re-derived; its
  internal coherence plus the addendum's independent restatement make it trustworthy as recorded.

## Committed-status note

`git status --porcelain` shows `.ufo/waves/round-48/build/` as untracked (`??`): the receipts are
**landed wave-record files**, not git objects — consistent with the attempt-2 inheritance model (the
L1 is the sole lane integrator; seats deliver files only). "Committed-quality" = complete,
self-describing, tamper-evident (digests declared and re-verified), reproducible-stated artifacts in
the wave record — that bar is met. If a consumer needs them as git objects, that is the L1's
integration step at close, not a defect of these files.

## Findings

- **F1 (sound):** R47-1 verified — the three re-runs are committed receipts: correct A2 counter
  (`1b438de2`), scored rev whose `scripts/` equal the C1 commit `269dadb6`'s (empty diffstat,
  verified), held triple 3/5/3/5/4/5 reproducing the round-47 falsify readings, coherent load/timing
  trailers. The receipts also double as committed evidence of the R47-5 parser defect (n < base_n
  with zero uncapped children, varying per run).
- **F2 (no defects found):** no finding rises to actionable severity. The two notes above —
  `probe_git_sha256` is at the scored rev, not `269dadb6`; trailers are seat-generated — are
  documentation caveats for downstream readers, both consistent with how the probe is actually
  invoked and how the wave records receipts.

## Residual risk / verification gaps

- Load1 values are unreproducible post-hoc observations; trusted on internal coherence only.
- The per-site n/base_n shortfalls are the counter's known instability, so these receipts cannot (and
  do not claim to) prove routing held — they prove the *counter reading* reproduced. The fixed F48
  counter's `stab-r47-f00cf278-*.txt` receipts (held=5/5) are the complement; both readings are
  committed, which is exactly the comparison R47-1 wanted on record.
- Scope boundary: these receipts say nothing about the round-48 r48 site set (RG742/SP491/SP519/
  SP1592); nothing here bears on C1's `held=4/4` target.
