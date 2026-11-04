# K88Scout — round 88 recon and planning data-walk (read-only)

Seat K88Scout (scout, leaf). I committed nothing, staged nothing and changed no history. Lane HEAD while I worked: `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`. The worktree was dirty only in `.ufo/waves/round-88/w1*`. Artifacts are in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Scout/`. The scratch root `/fast/scratch/hyaku/kumitate-r88/K88Scout` was removed before yield. Tools installed or updated: none.

Instruments:
- v2: `scripts/receipt-bind.mjs` at `0ff3562f15c18d0ca01dc6a76c9f827d30c26950`, sha256 `098a6713e663cbb9444ea6ec1da503cbf4bba5690c492b5ec9e73f9ee6cace4d`. The worktree bytes and `git show 0ff3562f:scripts/receipt-bind.mjs` give the same digest.
- v1: `git show 7ac24afa477a44304a3b125e320ef86929218189:scripts/receipt-bind.mjs`, extracted to `build/K88Scout/receipt-bind-v1.mjs`, sha256 `b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a`.

## Observed facts

### (1) v1 and v2 over every committed close dir (41 dirs, rounds 45–87), `--rev 0ff3562f…`

Command for each round N and each version (driver `walk.sh`, copied below; cwd scratch, `--lane` explicit):
`node <tool> --dir /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-N/close --rev 0ff3562f15c18d0ca01dc6a76c9f827d30c26950 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`.
There is one receipt per round per version (`build/K88Scout/walk/r<N>-v1.txt`, `r<N>-v2.txt`, 82 files), plus the TSV `walk/table.tsv`.

**Result: v1 and v2 disagree on 0 of 41 rounds.** Every exit code and every verdict line is byte-identical, so the walk shows no v2 harm on history.

| round | v1 exit | v1 verdict line | v2 exit | v2 verdict line | v1 vs v2 |
|---|---|---|---|---|---|
| 45 | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED census-close.txt rev="9e3e3ed973371c6a258657d9eb402ee78ea03427 date=2026-10-23T07:29:27Z" is not 40 lowercase hex` | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED census-close.txt rev="9e3e3ed973371c6a258657d9eb402ee78ea03427 date=2026-10-23T07:29:27Z" is not 40 lowercase hex` | same |
| 46 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=11 external=0 first=census-close.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=11 external=0 first=census-close.txt` | same |
| 47 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=c1-a2.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=c1-a2.txt` | same |
| 48 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=11 external=0 first=H1Tip-run1-2.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=11 external=0 first=H1Tip-run1-2.txt` | same |
| 50 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=Census-end.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=Census-end.txt` | same |
| 51 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=A51-cd7f69d3.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=A51-cd7f69d3.txt` | same |
| 52 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=FINAL-attest52-R1.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=FINAL-attest52-R1.txt` | same |
| 53 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=6 external=0 first=FINAL-attest53-R1.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=6 external=0 first=FINAL-attest53-R1.txt` | same |
| 54 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=23 external=0 first=FINAL-attest54-R1.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=23 external=0 first=FINAL-attest54-R1.txt` | same |
| 55 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=FINAL-attest55-R1.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=FINAL-attest55-R1.txt` | same |
| 56 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=FINAL-attest56-R2.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=FINAL-attest56-R2.txt` | same |
| 57 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=12 external=0 first=FINAL-attest57-R1.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=12 external=0 first=FINAL-attest57-R1.txt` | same |
| 58 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=FINAL-attest58-R1.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=FINAL-attest58-R1.txt` | same |
| 59 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=5 external=0 first=census-after.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=5 external=0 first=census-after.txt` | same |
| 60 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=dispatch60-tip.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=dispatch60-tip.txt` | same |
| 61 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=8 external=0 first=a2-repro-c1-fabrication.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=8 external=0 first=a2-repro-c1-fabrication.txt` | same |
| 62 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=0 external=0 first=-` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=0 external=0 first=-` | same |
| 63 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=6 external=0 first=census-after.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=6 external=0 first=census-after.txt` | same |
| 64 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=9 external=0 first=census-after.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=9 external=0 first=census-after.txt` | same |
| 65 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=11 external=0 first=census-after.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=11 external=0 first=census-after.txt` | same |
| 66 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=2 external=0 first=ledger66-freeze-harness.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=2 external=0 first=ledger66-freeze-harness.txt` | same |
| 68 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=2 external=0 first=deprec68-final.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=2 external=0 first=deprec68-final.txt` | same |
| 69 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=6 external=0 first=census-after.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=6 external=0 first=census-after.txt` | same |
| 70 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=census-end.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=7 external=0 first=census-end.txt` | same |
| 71 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=census-end.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=4 external=0 first=census-end.txt` | same |
| 72 | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED census-end.txt rev="<pre-close worktree> label=census at round-72 end (fleet validator, lane kumitate)" is not 40 lowercase hex` | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED census-end.txt rev="<pre-close worktree> label=census at round-72 end (fleet validator, lane kumitate)" is not 40 lowercase hex` | same |
| 73 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=5 external=0 first=census-end.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=5 external=0 first=census-end.txt` | same |
| 74 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=12 external=0 first=blob-identity.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=12 external=0 first=blob-identity.txt` | same |
| 75 | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED c1-mutants.txt rev="2c7b7203b658959b4fff87f80a4166d7b55c7190 date=2026-11-04T01:42:07-03:00 live=exercised label=C1_DROP_UNITS" is not 40 lowercase hex` | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED c1-mutants.txt rev="2c7b7203b658959b4fff87f80a4166d7b55c7190 date=2026-11-04T01:42:07-03:00 live=exercised label=C1_DROP_UNITS" is not 40 lowercase hex` | same |
| 76 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=25 external=0 first=adopt-selftest.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=25 external=0 first=adopt-selftest.txt` | same |
| 77 | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED adopt-selftest.txt rev="e47266ae093e6f4ba6b30507606c6b7f2b70903f cmd=node scripts/spotcheck-adopt.mjs --selftest" is not 40 lowercase hex` | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED adopt-selftest.txt rev="e47266ae093e6f4ba6b30507606c6b7f2b70903f cmd=node scripts/spotcheck-adopt.mjs --selftest" is not 40 lowercase hex` | same |
| 78 | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED proxy.txt rev="working-tree" is not 40 lowercase hex` | 2 | `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED proxy.txt rev="working-tree" is not 40 lowercase hex` | same |
| 79 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=12 external=0 first=blob-identity.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=12 external=0 first=blob-identity.txt` | same |
| 80 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=22 external=0 first=anchor-truth.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=22 external=0 first=anchor-truth.txt` | same |
| 81 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=21 external=0 first=anchor-truth.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=21 external=0 first=anchor-truth.txt` | same |
| 82 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=20 external=0 first=anchor-truth.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=20 external=0 first=anchor-truth.txt` | same |
| 83 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=29 external=0 first=anchor-truth.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=29 external=0 first=anchor-truth.txt` | same |
| 84 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=25 external=0 first=anchor-truth.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=25 external=0 first=anchor-truth.txt` | same |
| 85 | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=9 external=0 first=c1-probe.txt` | 1 | `RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=9 external=0 first=c1-probe.txt` | same |
| 86 | 1 | `RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt` | 1 | `RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt` | same |
| 87 | 0 | `RECEIPT_BIND: CLEAN matched=12 mismatched=0 unchecked=0 external=1` | 0 | `RECEIPT_BIND: CLEAN matched=12 mismatched=0 unchecked=0 external=1` | same |

What the table shows (counted from `walk/table.tsv`):
- **35 rounds read DRIFT:**
  - 33 are all-`unchecked` receipts from the era before `cmd=`/`tool_sha256=` (matched=0 mismatched=0).
  - r62 is an empty `.txt` set (`unchecked=0 first=-`).
  - r86 reads `DRIFT matched=1 mismatched=9 unchecked=0 external=1`, the known round-86 defect.
- **5 rounds read `FAIL-CLOSED REV_UNRESOLVED`:** 45, 72, 75, 77 and 78. Each has a malformed `rev=` line (`rev=<sha> date=…`, `rev=<pre-close worktree> label=…`, `rev=<sha> cmd=…`, `rev=working-tree`), which is refused before any field check. **Inference:** in those rounds, precedence hides any later AMBIGUOUS/ESCAPES finding. The census below shows none exists in close dirs.
- **1 round reads CLEAN:** r87, `matched=12 mismatched=0 unchecked=0 external=1`.

Preview runs (v2 at 0ff3562f; these are not history):
- `round-88/controls/` → `RECEIPT_BIND: CLEAN matched=17 mismatched=0 unchecked=0 external=0`, exit 0 (`preview-v2-r88-controls.txt`).
- `round-88/open/` → `DRIFT matched=1 mismatched=0 unchecked=2 external=0 first=census-start.txt`, exit 1 (`preview-v2-r88-open.txt`). `open/` is not the close battery.

The committed control tallies are 0,0,2,2,4,8,8,8,11,11,11,12,12,14,15,16,16 out of 20, so the maximum is 16/20. This matches the brief.

### (2) Census of committed receipts (close, controls, build), at HEAD `8e4ea5f6`

Command: `python3 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Scout/census.py /home/vgpnk/Projects/shokunin/kumitate-shokunin 8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`. Receipt: `build/K88Scout/census.txt`, exit 0.
- Scope: every committed `*.txt` under `.ufo/waves/round-N/{close,controls,build}/`, recursive, read with `git ls-tree -r -l` and `cat-file --batch`.
- Fields are counted with v2's own rule, `^key=(.*)$` multiline (`scripts/receipt-bind.mjs:250`).

| check | count | paths |
|---|---|---|
| scope | 5362 receipts (build 4630, close 439, controls 293) | — |
| `cmd=` token 2 classes | relative 67, absolute in lane 26, absolute external 4, flag 3 | — |
| relative token 2 starting `../` | **0** | — |
| relative token 2 resolving outside the lane (any form) | **0** | — |
| duplicate `cmd=`/`rev=`/`tool_sha256=` | **4 receipts (6 field rows), all in build/** | `round-57/build/MutA57DropCheck/RUNLOG.txt` (cmd ×6); `round-65/build/K65ExecHarmNormalize/logs/h1h2-frozen.txt` (rev ×2); `round-65/build/K65ExecHarmNormalize/logs/h1h2-patched.txt` (rev ×2); `round-87/build/K87ExecBind/receipts/rehearsal-close-dir.txt` (cmd, rev, tool_sha256 ×11 each: eleven receipts concatenated) |
| size > 1048576 bytes | **3, all in build/** | `round-59/build/SentinelBounds/12-mtime-survey.txt` (1564900); `round-64/build/K64ExecProxyRepair/receipts/13-manifest-before.txt` (1899476); `…/15-manifest-after.txt` (1899476) |
| symlinked receipt (extra) | 2, both deliberate fixtures | `round-64/build/K64ExecReceiptForge/cases/k15-receipt-symlink/…/p-tip.txt`; `round-64/controls/receipt/k15-receipt-symlink/…/p-tip.txt` |
| per section | close: dup 0 / big 0 / escape 0; controls: 0 / 0 / 0; build: 4 / 3 / 0 | — |

The four new v2 boundaries have no hits in any committed close dir or controls dir. That is why the history walk cannot separate v1 from v2: it is evidence of *no harm*, not evidence of *discrimination*, and the frozen arms carry the discrimination. If the build-dir hits were ever bound as a directory, they would fail closed (`AMBIGUOUS_FIELD` or `RECEIPT_TOO_LARGE`). `rehearsal-close-dir.txt` is the obvious one: it is a concatenated transcript, not one receipt.

Two other counts from the same pass (eval, not receipted):
- 107 receipts carry the attest JSON dialect (`"argv":` + `"stdout_sha256"`). 0 of them are in close dirs.
- 51 receipts carry the receipt-bind pair `cmd=` + `tool_sha256=`. 22 are in close dirs, which is the r86 10 + r87 12.
- **0 receipts carry both dialects.** This is used in candidate 8.

### (3) Round-89 pre-registration candidates 4–8 (`SCORECARD.md:4269-4281`)

**Candidate 4: `spotcheck-adopt --check` conflation (`SCORECARD.md:4277-4278`).**
- The conflation itself looks already repaired. `scripts/spotcheck-adopt.mjs:207-217` prints two separate readings:
  - `SPOTCHECK_COVERAGE: …` at `:211-215`;
  - `MAP: CLEAN|DRIFT first=…` at `:216`.
- The exit depends on coverage only: `:217` `exit: paths.length === 0 || uncovered.length > 0 ? 1 : 0`.
- Selftest `check-map-only-drift` (`:309-311`) asserts `SPOTCHECK_COVERAGE: CLEAN … uncovered=0` + `MAP: DRIFT first=uncovered:knowledge/late.md`, exit 0.
- The split landed in `6d03402f` ("round-80: scaffolding — spotcheck-adopt v3 two-reading split"). Rounds 85, 87 and 88 still carry it as open (`SCORECARD.md:4091-4094`, `:4213-4214`, `:4277`). The candidate text is stale.
- Today's live run: `node scripts/spotcheck-adopt.mjs --lane <LANE> --check` → `SPOTCHECK_COVERAGE: CLEAN spotchecks=54 uncovered=0` / `MAP: CLEAN`, exit 0 (`build/K88Scout/cand4-spotcheck-check.txt`).
- **Red today on the same tool:** `node scripts/spotcheck-adopt.mjs --selftest` → `SPOTCHECK_ADOPT_SELFTEST: FAIL (33/34)`, exit 1, twice (`cand4-spotcheck-selftest.txt`, `cand4-spotcheck-selftest-rerun.txt`). The failing case is `check-map-orphan` (`:313-318`), which expects `MAP: DRIFT first=orphan-row:knowledge/ghost.md`.
  - In a scratch clone with one debug `console.error` added, the actual text is `"SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=outside-map:knowledge/ghost.md"`, exit 0.
  - Cause: `readme-map.mjs` gained `outside-map:` in `19b4e440` (round 86, `scripts/readme-map.mjs:50,65,202`). The fixture appends the ghost row at EOF, outside `## Coverage map`.
  - K86Connector already reported this (`.ufo/waves/round-86/w1/K86Connector.md:79-80,109`), and it is still unrepaired at HEAD.
- Proposal: replace candidate 4 with this second-order selftest red (one fixture fix), not the conflation.

**Candidate 5: `K_findings` double penalty (`SCORECARD.md:4278`; origin `:616-617`, `:4089-4090`).**
- Formula: `scripts/proxy-check.mjs:839-842` `kCoverage(covered,total,sections,members,findings)` = `floor(10 × covered/total × sections/members × (members − findings)/members)`.
- `members` is the live census count (`:964` `const members = kimi.members`). `findings` is `kimi.findings.length` (`:972-973`).
- A missing member therefore costs twice:
  - it leaves `K_members` (55→54), and with it `K_sections`;
  - its census finding also subtracts from the numerator, `(54−1)/54`.
- The measured case is in the stanza docs: "a missing member: `54/1 ⇒ 9`" (`SCORECARD.md:362`). The selftest arm `kimi-members-added` sets members and findings together (`proxy-check.mjs:2292`).
- **Inference (arithmetic, not run):** at 55 members, one finding on a present member gives 10·54/55 = 9.82 and a missing member gives 10·53/54 = 9.81. Both floor to 9. The double count is visible in the fraction, but at this size it cannot move the integer. A round-89 claim needs a fixture where the floors differ, or it needs to argue on the term rather than the integer.

**Candidate 6: `POINTER_DEAD` precision (`SCORECARD.md:4279`; origin `:612-614`, `:4095-4097`).**
- Token class: `scripts/report-receipt-diff.mjs:60` `POINTER_PATH = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\.(?:txt|json|jsonl|md|mjs|js|sh|py|html|tsv|csv|log)$/`. Every backticked prose span matching it becomes a pointer (`:233-236`).
- Bases are only the lane root, the report dir and `.ufo/waves/round-N` (`:238-240`). With `--rev`, a pointer must be an exact tree member under one of those bases (`:252-254`). A miss is reported at `:257`.
- Measured: `report-receipt-diff` was run over all 11 round-87 `w1/*.md` reports at `--rev 7ac24afa…`, and each POINTER_DEAD token was classified against `git ls-tree -r 7ac24afa`. Receipt: `cand6-pointer-dead-r87-w1.txt`, driver `pd.sh`.
- Of **189 POINTER_DEAD** findings, **166 name a file that exists in the tree under a longer path**:
  - 131 bare basenames such as `selftest.txt` ×7, `c1-probe.txt` ×6, `counter-receipt.mjs` ×3;
  - 10 `round-86/…` paths missing the `.ufo/waves/` prefix;
  - 20 seat-relative paths such as `receipts/…` and `repro/…`.
- **23 are absent from the tree:**
  - prose examples (`example-not-real.md`, `f.txt`, `scripts/x.mjs`, `base.mjs`, `statement.md`);
  - runtime or fleet names (`audit-env.sh`, `l0-watch-state.json`, `fleet-dispatcher.mjs`, `sources-census.sh` ×4, `MANIFEST.json`, `CORPUS.md`);
  - elided `.../build/…` paths (7).
- So the dominant imprecision is **resolution base / basename shorthand (≈88%)**, not prose examples (≈12%). K87Scout found the cite-check counterpart exemptions at `scripts/cite-check.mjs:386-391,428,443` (`.ufo/waves/round-87/build/K87Scout/cand3-pointer-dead-precision.md:19-34`).

**Candidate 7: `cite-check` debt count today (`SCORECARD.md:4279`; previous `:4202` 2289, `:4217`).**
- Command: `node scripts/cite-check.mjs --self <LANE> --fleet /home/vgpnk/Projects/shokunin` at HEAD `8e4ea5f6` → `CITE_CHECK: DRIFT (files=228 tokens=14800 errors=2343 warnings=955)`, `VERDICT: FAIL`, exit 1 (`build/K88Scout/cand7-cite-check.txt`, tool_sha256 `7484274f…` = `pin.cite-check`).
- The debt is **2343 errors today**, up 54 from the 2289 that round 86 recorded and up 39 from K87Scout's 2304. The scanned set grew from 225 to 228 files.
- By kind: UNRESOLVED 1903, LINE_OOR 232, PIN_MISMATCH 139, REV_UNKNOWN 69.
- 1017 of the 1903 UNRESOLVED are round-relative wave-path tokens: `close/` 490, `build/` 112, `open/` 108, `controls/` 74, `base/` 66, `w1/` 53, `final/` 43, `probe/` 39, `falsify/` 32.
  - Root cause in code: `scripts/cite-check.mjs:121` `EXCLUDE_DIRS = new Set(['node_modules','.git','target','.ufo'])`, so `.ufo/waves` is never indexed. This matches K87Scout's root cause (`.ufo/waves/round-87/build/K87Scout/cand4-cite-check-red.md:29-33`).
- Top files: `corpus/QUALITY.md` 84, `corpus/knowledge/queue-summary.md` 75, `corpus/lessons/round-79.md` 65.

**Candidate 8: `receipt-evidence` overlap (`SCORECARD.md:4280-4281`).**
- `scripts/receipt-evidence.mjs` property 2, REPRODUCTION (`:15-19`), re-runs a receipt's JSON `body.argv` inside a `git archive` of the judged rev and compares exit and stdout/stderr sha256 (`:186-193`).
- It requires the attest JSON body shape (`argv`, `nonce`, `exit`, `stdout_sha256`, `stderr_sha256`; `:177-181`) and an attest ledger (`:170-174`). It never reads `cmd=` or `tool_sha256=`, and it never hashes the named instrument.
- `receipt-bind` (v2, `scripts/receipt-bind.mjs:249-306`) reads only the text pair `cmd=` token 2 + `tool_sha256=` and compares it to `git cat-file blob <rev>:<path>`, without executing anything.
- Census: 107 committed receipts are in the attest dialect (0 in close dirs), 51 are in the receipt-bind dialect (22 in close dirs), and **0 carry both**.
- The two gates bind disjoint receipt sets in different senses: execution-reproduction versus static subject digest. A future claim must name which one it strengthens. The overlap the revenger argues is conceptual, not shared input.

## Inference / gaps
- On history, the v1/v2 walk cannot show discrimination, because no close dir contains any v2 boundary case (census rows above). Only the frozen probe arms carry C1's evidence.
- The 6 REV_UNRESOLVED rounds stop at the first malformed `rev=`. The walk does not show what v2 would say about later receipts in those dirs. The census covers it statically: close dirs have 0 dup, 0 oversize and 0 escape.
- The `walk/r<N>-v1.txt` receipts name `build/K88Scout/receipt-bind-v1.mjs` as their instrument. That file is untracked, so at 0ff3562f it is UNRESOLVED. If the L1 ever binds `build/K88Scout/walk/`, it must do so at a revision that contains the build dir. `census.txt` likewise names the build-dir `census.py`.
- Diagnostic disclosure: candidate 4's actual text came from a `git clone --shared` scratch copy where I inserted one `console.error` with `node -e`. The lane was not touched, and the clone was removed with the scratch root.

- **The target moved under me.** By the end of the seat, `git status` showed `M scripts/receipt-bind.mjs`: 65 lines added, worktree sha256 `1f11f124198fdb894265dc69a75efeca5fbf43d931209d227b2bc1b29e5880ea`. I did not make that edit; it came from another writer. All 41 `walk/r<N>-v2.txt` receipts recorded the on-disk digest at run time, `098a6713…` (= 0ff3562f), so the v1/v2 table measures the committed target. The two `preview-v2-*` receipts record the HEAD blob digest (`098a6713…`), but they ran from the worktree path and I cannot prove which bytes executed. Treat them as informational.

## Artifacts (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Scout/`)
- `walk/table.tsv`, `walk/r<N>-v{1,2}.txt` ×82
- `receipt-bind-v1.mjs`
- `census.py`, `census.txt`
- `preview-v2-r88-open.txt`, `preview-v2-r88-controls.txt`
- `cand4-spotcheck-check.txt`, `cand4-spotcheck-selftest.txt`, `cand4-spotcheck-selftest-rerun.txt`
- `cand6-pointer-dead-r87-w1.txt`, `cand7-cite-check.txt`
- `walk.sh`, `pd.sh`, `rc.sh` (drivers, copied from scratch)
