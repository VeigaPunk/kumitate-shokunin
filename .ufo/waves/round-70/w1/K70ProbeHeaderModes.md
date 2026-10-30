# K70ProbeHeaderModes — round-70 C1 replay, header-mode enum/pair probe

Seat: K70ProbeHeaderModes (probe, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.
Frozen plan read: `.ufo/waves/round-70/plan.md`. Frozen counter read: `.ufo/waves/round-70/probe/replay70-probe.mjs`.
Originals `.ufo/waves/round-69/probe/c1-controls.sh` / `c2-controls.sh` were **read, never executed** (they cannot be: they write frozen receipt paths and would need mutation).

## Frozen-input verification (observed)

```
$ sha256sum .ufo/waves/round-70/plan.md
e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b
$ git show 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a:.ufo/waves/round-70/plan.md | sha256sum
e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b   # working plan == frozen 3dbe7e6e
$ sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs
63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1
$ sha256sum .ufo/waves/round-69/probe/c1-controls.sh .ufo/waves/round-69/probe/c2-controls.sh
01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12  c1-controls.sh
679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4  c2-controls.sh
```

Candidate status: `ls scripts/control-replay.mjs` → **absent** (L1-only production path not yet implemented). Therefore, per seat spec, the edge was exercised against a **synthetic reproduction, mechanism-only, not candidate verification**.

## Artifacts (all under `build/K70ProbeHeaderModes/`, sha256)

| file | sha256 |
|---|---|
| `probe-header-modes.mjs` | 5ff89520f5a925c86056dcad5da0672868fea66076e90ace79b46563233327ab |
| `synthetic-header-edge.mjs` | 7673a0f8f3db6bd9354cea3cb0ae9a4e1b185329dc377cd7d769cae65d7a0cb2 |
| `calibration-bad-header.mjs` | 4b55c1ce370b26fbb48198b129a0859644e2e9991b10fc226ab42a678d1370 |
| `header-modes-receipt.txt` / `header-modes-results.json` (mechanism run) | e6e9abce767439193a923dda0358c46c86af0e68eeb6067d3b237de7b6ae2733 / 0610843d787a1db04e0d650b26ca6f8b42c0978d01f24bdf6ca9cf913838828f |
| `candidate-absent/header-modes-*` (candidate-path run) | receipts inside subdir |
| `calibration-bad/header-modes-*` (negative calibration) | receipts inside subdir |

## Probe design

`probe-header-modes.mjs TOOL [LANE] [--out-dir DIR] [--tag LABEL]` — isolated, runs the tool under test in a per-case mkdtemp sandbox under `/fast/scratch/hyaku/kumitate-r70/K70ProbeHeaderModes/` with a minimal env (`PATH/HOME/TMPDIR/HYAKU_SCRATCH` only), 300 s timeout, receipts copied to `--out-dir` before scratch cleanup. Mode is derived from TOOL: lane `scripts/control-replay.mjs` ⇒ `candidate`, anything else ⇒ `mechanism-only` (printed in the receipt; nothing here is candidate verification).

Scored expectations (89), all derived from the frozen plan's implementation contract and the frozen counter:

- **HM-S00** — `--selftest`: exit 0 and stdout line `CONTROL_REPLAY_SELFTEST: PASS` (R2 surface).
- **HM-V01..V05** — the five valid pairs `(c1,donothing) (c1,autoledger) (c2,donothing) (c2,autoorigin) (c2,forgecapture)`: exit 0; receipt contains the family label (`LEDGER69_UNMET`/`DEPREC69_UNMET`) and `CONTROL-PASS <mode>`; `--work` root reclaimed (0 entries); no stray files in the sandbox.
- **HM-I001..I075** — every invalid pair usage: 8 family strings outside the exact enum {`junk`,`C1`,`c3`,`""`,`"c1 "` trailing space,`" c1"` leading space,`c11`,`C2`} × 8 mode strings {`donothing`,`autoledger`,`autoorigin`,`forgecapture`,`junk`,`""`,`DONOTHING`,`Autoledger`} = 64, plus exact families crossed with out-of-set modes (c1: 6, c2: 5) = **75 total**: exit **exactly 64**, no `--out` created, `--work` untouched, usage diagnostic emitted.
- **HM-U01..U06** — structural: bare invocation, missing `--family`/`--mode`/`--out`/`--work`, unknown flag `--frobnicate`: exit 64. (The frozen counter's R8 exercises only `--family junk`; this is the wider usage surface.)
- **HM-X1/X2** — exclusive creation (R9 coupling): valid pair and invalid pair each against a pre-existing sentinel `--out`: refusal (nonzero / 64 respectively) with sentinel bytes unchanged.

Informational, no expectation (contract unspecified), HM-N1..N3: duplicated `--family`, `--selftest` plus extra args, equals-form `--family=c1`.

## Observed results

**1. Mechanism run** (synthetic header model; not candidate verification):

```
$ HYAKU_SCRATCH=/fast/scratch/hyaku TMPDIR=/fast/scratch/hyaku/kumitate-r70/K70ProbeHeaderModes \
  node probe-header-modes.mjs ./synthetic-header-edge.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --out-dir . --tag mechanism-only-r2
HEADER_MODES_PROBE tool=…/synthetic-header-edge.mjs mode=mechanism-only sha256=7673a0f8…
HEADER_MODES_HELD held=89/89 mode=mechanism-only tag=mechanism-only-r2
probe exit=0
```

All 89 scored expectations pass: selftest line present; 5 valid pairs exit 0 with labelled receipts (196 B each) and reclaimed work dirs; all 75 invalid pairs and 6 structural errors exit exactly 64 with a stderr usage line, no output file, empty work root; both sentinel cases refuse without touching bytes. Informational (synthetic's strict choice, recorded not scored): duplicate flag → 64, `--selftest`+args → 64, equals-form → 64. Synthetic's exclusive-refusal exit is 73 (EX_CANTCREAT); X1 requires only nonzero.

**2. Candidate-absent run** (probe pointed at the lane candidate path today):

```
$ node probe-header-modes.mjs …/kumitate-shokunin/scripts/control-replay.mjs … --out-dir candidate-absent --tag candidate-absent-r1
HEADER_MODES_UNMET held=1/89 mode=candidate tag=candidate-absent-r1   (tool_sha256=<tool-absent>)
```

All cases fail with node ENOENT (status 1). One expectation is satisfiable by accident: HM-X1 (valid pair vs sentinel requires only "nonzero exit + intact sentinel"), which a missing binary also produces. **Limit:** X1 is therefore necessary-but-not-sufficient evidence of exclusive creation; it must be read together with the valid-pair cases (V01–V05), which a missing/absent tool cannot satisfy.

**3. Negative calibration** (deliberately sloppy double that accepts any family/mode and always writes a receipt):

```
$ node probe-header-modes.mjs ./calibration-bad-header.mjs … --out-dir calibration-bad --tag calibration-bad-r1
HEADER_MODES_UNMET held=1/89 …        (probe exit=1; 88 MISS across valid-pair/invalid-pair/structural/exclusive kinds)
```

The probe is non-vacuous: it rejects an implementation that ignores the enum. (The single hold is HM-S00, because the double fakes the selftest line — a selftest forgery the probe by itself cannot distinguish; that is the R2-seat/selftest-audit surface, out of scope here.)

## Findings for the candidate (L1)

1. Contract the candidate must satisfy, now executable: re-run `node probe-header-modes.mjs <lane>/scripts/control-replay.mjs <lane> --out-dir <private>` after implementation; target HEADER_MODES_HELD 89/89. forgecapture and the valid pairs run real control bodies under this probe, so network-dependent failure of the live arm is reported as a miss, never waived (plan: "failure is reported, never waived").
2. Frozen-counter gap this probe closes: R8 tests a single invalid family with all other flags missing. Nothing in the frozen counter exercises cross-family modes (`c1|autoorigin`, `c2|autoledger`), case/whitespace family variants, empty values, duplicate flags, equals-forms, or exclusive-creation refusal with a *valid* pair — all covered here.
3. Unspecified surface the candidate must pin down (any consistent choice scores; recommend strictest): duplicate flag, equals-form, `--selftest` with extra args, and the exact nonzero exit for exclusive-refusal (64 vs 73). The synthetic demonstrates the strict reading (64 for all usage errors, 73 for creation refusal).

## Risks / limits

- **Mechanism-only:** no candidate existed at run time; results demonstrate the edge mechanism and probe mechanics, and do NOT verify `scripts/control-replay.mjs`.
- X1 accidental-pass-with-absent-tool limitation (above) — read X1 only with V01–V05.
- The probe checks receipt *content markers* for valid pairs (labels + `CONTROL-PASS`), matching the frozen counter's own R3–R7 string checks; it is not a control-execution audit (sibling seats attack that surface).
- Frozen bytes untouched: no writes anywhere outside `build/K70ProbeHeaderModes/`, the w1 report, and scratch. `git status --porcelain` filtered on non-seat paths: clean. Scratch `/fast/scratch/hyaku/kumitate-r70/K70ProbeHeaderModes/` contains 0 entries after runs (probe reclaims its run root in `finally`).

No tools installed; none needed (node v24.21.0 present).
