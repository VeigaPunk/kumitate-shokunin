CRITIC_C2 tests=14 fatal_now=2

# C2 falsifier — script-layer 86/88 → 88/88 at pinned 31c465f1

## What the attack found (structure of the cheap fake)

`S_sections` after ExecDistinct.patch = `Set(section.file)` over `inFamily === true`
sections of `S*` rows (proxy-check.mjs `layerTerms`, new code). That number is
counted on sections the claims gate **resolved and family-graded** — but NOT on
sections whose anchors are live or whose symbols hit. `probeRow` pushes every
section regardless of `live`/`symbolHit` (claims-check.mjs:389-392), and
`layerTerms` does not read those fields. Consequence: `S=88/88` + `PROXY: MATCH`
is reachable while every anchor is dead and no symbol exists in the file. The
claims gate is the only arm that catches that — so C2's real definition is:
claims MATCH **and** proxy MATCH **and** the S-section file-set equals the
S-member set at the pin. Any verification that stops at the proxy verdict admits
the anchor-less fake.

Second fake: `--src`. Bare `node scripts/claims-check.mjs` resolves the default
origin to `~/Projects/ufo-fsd-alpha` (claims-check.mjs:130-132, selftest line 757)
— the moving operator tree the round is forbidden to read. A MATCH produced
without `--src` is a measurement of the wrong tree, and `S_members` could be 88
there by coincidence or by upstream having advanced again. Third fake: `walkFiles`
(claims-check.mjs:159) counts non-tracked regular files too (`.git`/`.ufo`/
`target`/`node_modules` pruned only); `S_members` is a filesystem count, not a
`git ls-files` count. Verified now: status clean, HEAD pinned — but the L1 must
re-prove it post-integration because the executor works in a sibling tree.

## Verified evidence

- `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`; `status --porcelain` → 0 lines; `test -w scripts` → READONLY (dr-xr-xr-x). Pin is real now.
- `git diff --name-status 964f443e..31c465f1 -- scripts/` → A `omp-route-grammar.mjs`, A `ufo-swarm-registry.mjs`; D `dev-verify.sh`(non-member), D `omp-wave-context.mjs`, `primeagent-recovery-assess.mjs`, `primeagent-refinement-ledger.mjs`, `ufo-refinement-context.mjs`, `ufo-refinement-context.test.mjs`. Frozen lists check out.
- `node .ufo/waves/round-35/baseline/distinct-probe.mjs /fast/scratch/kumitate-r35/src` → `S occ 86 distinct 86`, `R occ 83 distinct 83`; members without section: the 2 added files. So the two added members MUST gain sections; no existing duplicates mask anything.
- Baseline `claims.txt`: 6 errors — 5× `SECTION_FILE_UNRESOLVED` row=S8 (the 5 departed members) + `SECTION_DEAD_ANCHOR` row=R11 `round.rs` anchors 17-20. Baseline `proxy.txt`: `S_sections declared=91 computed=86`, `S_members declared=91 computed=88`, `C2_TOTAL_DRIFT declared=77 computed=78`, `PIN_UNPINNED scripts/sources-check.mjs`.
- SCORECARD S8 cell still declares `63 members`; note head (uncommitted `M corpus/knowledge/remaining-scripts-census.md`, author's own pending state) already re-derives 60 = 63−5+2 and `S_members 88 = S1–S7 28 + S8 60`. MEMBER_COUNT_DRIFT compares declared N vs **distinct headings incl. unresolved** — keeping the 5 dead `## ` headings while declaring 60 would still fire (63≠60), and deleting them while declaring 63 fires too (58≠63).
- S7 note declares 6 members vs historical `wc -l → 9`; live probe files at pin: `fake-omp.mjs`, `probe-redact.mjs`, 3× `probe-token-plan-*.mjs`, `probe-ufo-route-health.mjs` — consistent.
- The 55 modified members span notes beyond the census (ops-watchers, dispatch-shapes, swarm-wave-lifecycle, native-trial-launch, route-probe-cluster, member-claims-gate, live-surface-probe, sighting-wall, kimi-modes-machinery, singleton-and-queue-ownership, queue-and-claim, failure-telemetry per frozen TSV column 3). "Every changed member" is an all-S-rows obligation, not S8-only.

## Numbered falsification tests L1 must run post-integration

1. **Pin re-verified, before every gate run.** `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` must print `31c465f15669f744848bd9f5d56191c5085670f7`, `git status --porcelain` empty, `test -w /fast/scratch/kumitate-r35/src/scripts` fails. Refute: any deviation → the measurement tree is not the pin.
2. **Wrong-tree contamination.** Re-run the executor's verdict commands with `--src` removed: `env -u UFO_SRC node scripts/proxy-check.mjs` (selftest 757 shows the default lands on the operator tree). Refute: identical MATCH without `--src` proves the numbers were measured on the moving tree, not the pin — or that they coincide, which is then unprovable. All recorded evidence MUST carry `--src /fast/scratch/kumitate-r35/src`.
3. **Member-set == section-set (distinct).** `node .ufo/waves/round-35/baseline/distinct-probe.mjs /fast/scratch/kumitate-r35/src` must print `S occ ≥88` with `members without section: []` and no non-member extras. Refute: any member listed, or `occ` > `distinct` inflation hidden by the new Set counting (a duplicated section now scores 0 — occ > distinct is itself evidence of padding).
4. **Proxy verdict.** `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → `PROXY: MATCH (… S=88/88 coverage:script-layer=10 …)` exit 0, no `S_*`/`COVERAGE_SCRIPT`/`AXES_DRIFT`. Refute: any drift kind, or `S=88/88` with `coverage_script<10` (a `no` S row would silently cap it — C1s must stay 8/8).
5. **Claims gate — the arm that kills the anchor-less fake.** `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src` → `CLAIMS: MATCH` exit 0, `SUMMARY: errors=0`. Refute: `SECTION_NO_ANCHOR`/`SECTION_DEAD_ANCHOR`/`SECTION_NO_SYMBOL`/`SECTION_FILE_UNRESOLVED` on ANY S-row note. `PROXY: MATCH` without this line is exactly the cheap fake this review targets (live anchors but wrong behavior is unexaminable; NO anchor is gate-detectable — zero tolerance).
6. **S8 declared count.** Scorecard S8 cell must read `60 members` and distinct `## ` member-section headings in `remaining-scripts-census.md` must equal 60: `grep -c '^## `' corpus/knowledge/remaining-scripts-census.md` (subtract non-member `## ` heads like `## Membership and measurement`). Refute: `MEMBER_COUNT_DRIFT row=S8`.
7. **Departed five: gone as sections, kept as history.** `grep -n '^## \`scripts/\(omp-wave-context\|primeagent-recovery-assess\|primeagent-refinement-ledger\|ufo-refinement-context\)\(\.test\)\?\.mjs\`' corpus/knowledge/*.md` → empty. AND `grep -n '31c465f1'` plus the five filenames must appear in a removal/changelog passage of the note (mirroring the existing round-32 removals block) — `git show 964f443e:<path>` proves they existed. Refute: a departed member still heads a section (UNRESOLVED risk if src drifts), or removals vanish with no prose trail.
8. **Added two: real sections, not glob-farmed stubs.** `grep -n '^## \`scripts/\(omp-route-grammar\|ufo-swarm-registry\)\.mjs\`'` → 1 hit each; `node scripts/claims-check.mjs --row S8 --src …` shows each carries an own-file anchor AND a verbatim symbol (S8's `*.mjs` family admits them automatically — a heading alone is not enough). Refute: `SECTION_NO_ANCHOR`/`SECTION_NO_SYMBOL`, or the section placed under a row whose family does not admit it (`inFamily=false` → excluded from S_sections).
9. **Anchor freshness for the 55 modified members.** For each line of `.ufo/waves/round-35/frozen/s-modified-members-55.tsv`, the member's section anchors must be live at the pin; for members whose anchors predate 964f443e and whose content moved, spot-verify the anchor range still covers the named symbol. Biggest-delta must-checks: `fleet-dispatcher.mjs` (+558/−1163), `ufo-l0-watch.mjs` (+501/−37), `ufo-stale-watchdog.mjs` (+49/−809), `ufo-sighting.mjs` (+233/−217), `ufo-state-retention.mjs` (+141/−341), `collect-omp-native-handoff-lib/base.mjs` (+131/−84). Refute: any dead/stale anchor on an S-row member (gate fires) or an anchor that is live but lands on unrelated code (judge rejects; gate cannot see this — flag it).
10. **Set reconciliation, not fitted numbers.** `S_members 88` must equal an independent enumeration: `git -C /fast/scratch/kumitate-r35/src ls-files 'scripts/*.mjs' 'scripts/*/*' | wc -l` filtered through the LAYER_PATTERNS shape (top-level `*.mjs` + any file under `scripts/<dir>/`) = 88, and `88 = 28 (S1–S7 live) + 60 (S8)` per the note's own derivation. Refute: 88 asserted without the enumeration, or `walkFiles` counting files absent from `git ls-files` (symlinks/untracked would mask member drift).
11. **Stanza/axes/anchors consistency.** Stanza `S_members=88 S_sections=88 coverage_script=10`; `## Axes` row `| coverage:script-layer | 10 |` matches derived; S8 note head `60 members` = S8 cell = distinct section count. Refute: any `AXES_DRIFT`/`COVERAGE_SCRIPT_DRIFT`/`S_SECTIONS_DRIFT`/`S_MEMBERS_DRIFT`, or stanza 88 while the note's own count says otherwise (two authorities disagreeing = premature saturation).
12. **C2_total/C2 recomputed after corpus edits.** The census note is a corpus `.md`; baseline already showed `C2_TOTAL_DRIFT declared=77 computed=78`. `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` must equal the stanza `C2_total`, and `C1`/`C2` yes-cells recomputed. Refute: `C2_DRIFT`/`C2_TOTAL_DRIFT` in the final proxy run.
13. **Pins honest.** `sha256sum scripts/proxy-check.mjs scripts/claims-check.mjs` must equal `pin.proxy-check`/`pin.claims-check` in the stanza (ExecDistinct.patch touches proxy-check → re-pin required); `PIN_UNPINNED scripts/sources-check.mjs` resolved by the registered additive `pin.sources-check` (scorecard prose already reserves it). Refute: `PIN_DRIFT`/`PIN_UNPINNED`, or a re-pin covering a file that was also edited to weaken section rules (diff the patch, not just the hash).
14. **Selftests.** `node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: N/N pass` (baseline 104/104; +3 distinct cases in the patch → ≥107) and `node scripts/claims-check.mjs --selftest` green. Refute: any FAIL line, especially the new duplicate-one/drop-one cases.

fatal_now=2: tests 4 and 5 produce refuting output on the current unintegrated tree (`S=86/88` + DRIFT; 6 claims errors). The rest are post-integration gates.

## Strongest single counterexample

A patch that appends two live sections for the added members but leaves one old
section's anchor dead (or fabricates a section whose anchor points at a comment
block) yields `S=88/88`, `PROXY: MATCH` — and `CLAIMS: DRIFT (SECTION_DEAD_ANCHOR)`.
Only test 5 (and 9 for the semantic residue) rejects it. If the L1 accepts the
proxy line alone, C2 is fake-able. The Rust judge should demand both verdict
lines plus test 3's set equality.
