# K76ScribeRecord — learning-record draft

Axes: **operability + coverage:omp** (orchestration and tooling).

Text only. No product file, frozen plan, index, judge, or gate was modified. No test/build/gate was executed by this seat. The draft below is for L1 integration; it does not adjudicate either claim.

## Paste-ready lesson: `corpus/lessons/round-76.md`

```markdown
author: kumitate L1
round: 76

# Round 76 — coverage:omp becomes census-derived and registry-bound; operability gains spotcheck-adopt

## Gate

Sources opened for this round's source work:

- **S226 — oh-my-pi `packages/utils/src/dirs.ts` at `v18.15.0`, code, tier A.** Source: `https://github.com/can1357/oh-my-pi/blob/v18.15.0/packages/utils/src/dirs.ts`; local capture `.ufo/waves/round-76/build/L1/dirs-v18.15.0.ts`. Located quote: “Get the custom themes directory (~/.omp/agent/themes).” The captured file's SHA-256 equals the S053 digest recorded in `corpus/SOURCES.md`; measurement and exact digest are in `.ufo/waves/round-76/w1/K76ScribeRecord.md` § Provenance. **ADMIT** — re-grounds the agent-directory names at the installed release, rather than silently treating the earlier release citation as current. [L1 fills: final S226 source/capture-registration receipt and installed-release receipt.] **Flip to reject:** the independently captured release file differs from the recorded S053 content, or the release/install binding cannot be established; do not claim changed upstream behavior from unchanged bytes.
- **REJECT — `merge/kumitate/` assimilation package as a bulk append, own-work, tier B.** Source: the package decision re-opened in `corpus/lessons/round-75-verifier-spotcheck.md` § Spot-check; quote: “forbids a bulk row append”. **Decision:** stays refused under the scoping/proportionality rule; this tooling round does not admit the package wholesale. **Flip:** a dedicated assimilation round that re-grounds the package's entries individually. This is a carried rejection, not a fresh package-size measurement.

Spot-check: pending the non-author closure. The next closure writes `lessons/round-76-verifier-spotcheck.md`; this round does not pre-create that artifact or its map row.

## Mistakes

- **control-fixture-path-shape** · evidence: the pre-data control's first README-row insertion used a `corpus/lessons/...` first cell, which the oracle ignores; its row count stayed `181` (first-attempt history supplied in the seat assignment, not independently preserved in the inspected receipt). The corrected control is recorded in `.ufo/waves/round-76/controls/c2-row-only.txt` at its stated base revision: `README_MAP: DRIFT files=182 rows=182 covered=181 bad=1 first=unpinned:lessons/round-75-verifier-spotcheck.md`. Thus only the corrected `lessons/...` shape demonstrates the row-only half-state. · captured-by: `format-unmapped` covers corpus-shaped cells beginning `knowledge/` or `lessons/`, but not a `corpus/`-prefixed first cell (`scripts/readme-map.mjs` parser); the unchanged row count exposed the bad fixture. · fix: retain the corrected row itself alongside its parse count in the control receipt; [L1 fills: receipt containing the corrected literal README row and its parse count]. The inspected control receipt currently carries the parse count but not the literal inserted row; do not describe that missing evidence as already filed.
- **plan-quotes-receipt (control-token mismatch)** · evidence: the frozen plan's C1 control paragraph requires `STANZA_UNKNOWN_KEY`, while `.ufo/waves/round-76/controls/c1-declare-only.txt` prints `STANZA_KEY_UNKNOWN`; the independent seat receipt `.ufo/waves/round-76/build/K76ReviewFreeze/reproduction.txt`, § C1 declare-only, reproduces `PROXY: FAIL-CLOSED (STANZA_KEY_UNKNOWN)` at the scaffolding revision named there. This is the strongest directly receipt-backed wave mistake available to this draft, not a claim that later seat receipts contain no stronger finding. · captured-by: Q65's byte-for-byte receipt rule, exposed by K76ReviewFreeze's reproduction. · fix: preserve both token spellings verbatim in the report and submit the conflict for canonical judgment without editing the frozen plan or changing the gate to fit prose; [L1 fills: final disposition of the frozen control-token conflict].
```

## README map row

```markdown
| `lessons/round-76.md` | Round-76 method: census-derived OMP coverage, spotcheck-adopt capability, source decisions and control-fixture mistakes | LOG.md round 76; `.ufo/waves/round-76/plan.md` |
```

No row is supplied for `lessons/round-76-verifier-spotcheck.md`.

## Markers left for L1

- `[L1 fills: final S226 source/capture-registration receipt and installed-release receipt.]`
- `[L1 fills: receipt containing the corrected literal README row and its parse count]`
- `[L1 fills: final disposition of the frozen control-token conflict]`

These markers require evidence or disposition, not invented measurements. The draft intentionally leaves claim verdicts and final tool counts to L1.

## Provenance and exact commands

All paths below are absolute at execution unless the command's own `git -C` supplies the root.

Frozen checkout provenance was exercised with:

```sh
bash -c 'set -eu; S=/fast/scratch/hyaku/kumitate-r76/K76ScribeRecord; mkdir -p "$S"; trap '\''rm -rf -- "$S"'\'' EXIT; git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin "$S/lane"; test "$(git -C "$S/lane" rev-parse --show-toplevel)" = "$S/lane"; git -C "$S/lane" checkout -q cabc7aefd5f1562299f757e23207710c12e4ed58; git -C "$S/lane" rev-parse HEAD; sha256sum "$S/lane/.ufo/waves/round-76/build/L1/dirs-v18.15.0.ts"'
```

Observed output:

```text
Cloning into '/fast/scratch/hyaku/kumitate-r76/K76ScribeRecord/lane'...
done.
cabc7aefd5f1562299f757e23207710c12e4ed58
sha256sum: /fast/scratch/hyaku/kumitate-r76/K76ScribeRecord/lane/.ufo/waves/round-76/build/L1/dirs-v18.15.0.ts: No such file or directory
Command exited with code 1
```

The trap cleans the scratch root on this exit. The source capture was not present in the frozen checkout, so its later live-path measurement is **not** presented as freeze-commit evidence. No commit was made.

The supplied live capture was measured separately:

```sh
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/L1/dirs-v18.15.0.ts
```

Observed output, exit 0:

```text
2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/L1/dirs-v18.15.0.ts
```

That equals the S053 digest read verbatim from `corpus/SOURCES.md:66`. The original S053 bytes were not re-fetched or compared with `cmp`; this is digest agreement with the recorded source, not an independent network provenance check. The source quote was located by the read-only search `Get the custom themes directory` in the supplied capture, at the same anchor recorded for S053.

Read-only source/shape inputs: frozen `plan.md`; `corpus/lessons/round-75.md`; `corpus/lessons/round-75-verifier-spotcheck.md`; `corpus/README.md` map rows; `corpus/SOURCES.md` S053; `.ufo/pins/source-captures.json`; `corpus/QUALITY.md` Q48/Q64/Q65; the parser and `format-unmapped` arm in `scripts/readme-map.mjs`; the named control receipts; K76ReviewFreeze's existing reproduction receipt. Existing receipt outcomes were read, not rerun.

Wave sweep: read-only `glob` over `.ufo/waves/round-76/w1` and `build`, followed by `grep` with pattern `mistake|SURVIV|counterexample|defect|FREEZE|wrong|hole`, case-insensitive. At the inspected snapshot, the available substantive seat receipt was `build/K76ReviewFreeze/reproduction.txt`; source captures were also present under `build/L1` and `build/K76ScoutDirsRelease`. The sweep is not a final wave census and proves no absence of future findings.

## Gates, touched surfaces, and limits

- Behavior delivered: lesson text with Gate decisions, exactly the requested pair of mistake entries, and the lesson's README row.
- Gates: source digest agreement observed; reviewer control refusal read as existing evidence. No claim acceptance, source-census, map, mutation, or final-wave verdict was exercised here.
- Touched surface: this report only. Intended L1 targets are `corpus/lessons/round-76.md` and its `corpus/README.md` row.
- Out of scope: executor code, pin adoption, closure artifact/map row, judge, commit, push, deployment, and final numerical claim verdicts.
- Findings: initial control-fixture shape is assignment-provided history; corrected literal row is not in the inspected receipt. Frozen control token disagrees with reproduced output. Source capture is later than the frozen checkout.
- Tools installed/updated: none.
- Artifact path: `.ufo/waves/round-76/w1/K76ScribeRecord.md`.
