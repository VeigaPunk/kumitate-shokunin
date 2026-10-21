REVIEW numbers-c2 r5=4 r7=5 distinct=92 score=10

## Target measured

- Lane tree: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (jj-colocated), HEAD
  `0614092e0804aaca06642cb3a263a05c1cacc98e` plus the round-36 integration working set.
- Measurement instant: `2026-10-21T05:33:31Z`. The tree was still being integrated (SCORECARD.md
  hash moved twice inside my window); the two corpus notes were already final and byte-identical
  to the executor scratch deliveries (`sha256` lane == scratch for both notes):
  `native-admission-detail.md b0188e28b1e07b25…`, `local-ship.md 5c9157f2acc3ecd6…`.
- Origin: `/fast/scratch/kumitate-r36/src`, detached at `31c465f15669f744848bd9f5d56191c5085670f7`,
  mode `dr-xr-xr-x`; never written. `R_members` at the pin = **88** runtime `*.rs` + **4** CLI
  `*.rs` = **92**; each of the nine R5/R7 basenames occurs exactly once there (no ambiguity).

## Assigned commands and outputs

```
$ node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --row R7 --strict
ROWS: 2  YES: 2  NOTES: 2  SECTIONS: 9
ROW R5   form=section   notes=1 sections=4 adv=0
ROW R7   form=section   notes=1 sections=5 adv=0
SUMMARY: errors=0 warnings=0
CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0)
exit=0
```

Per-section JSON (`--json`, same command): all 9 resolve to their own member file with
`live=true`, `symbolHit=true`, `inFamily=true`; anchors/symbols = rules 4/30, admission_text 11/41,
seats 13/23, text 11/24; local_ship 11/11, bounded_fs 6/6, bounded_fs_tests 5/5, fs_durability 9/9,
local_ship_tests 11/11.

```
$ node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src --json
verdict=DRIFT  R=92/92  coverage:runtime-layer=10
terms: R_members=92 R_sections=92 coverage_runtime=10 coverage_script=10
srcRev=31c465f15669f744848bd9f5d56191c5085670f7
findings: C2_TOTAL_DRIFT C2_total declared=80 computed=81
          PIN_DRIFT pin.surface-probe declared=148cbf85… computed=c298d168…
          PIN_DRIFT pin.proxy-check  declared=5852fefd… computed=3f1b7c7b…
          AXES_DRIFT coverage declared=10 derived=9
          warn PIN_UNPINNED scripts/sources-check.mjs (pre-existing)
```

The C2 segment itself is exactly the target (`R=92/92 coverage:runtime-layer=10`, stanza
`SCORECARD.md:292-295` declares `R_members=92`, `R_sections=92`, `coverage_runtime=10`; axes row
`SCORECARD.md:316` declares 10). The DRIFT verdict comes only from C1-owned integration residue
listed under Findings.

## Independent re-derivation

- Same gate code, independent run (`probeSections` imported by my own script): distinct in-family
  R sections **83 → 92**; in-family occurrences 92 (no in-family duplicate), so
  `R_sections == occurrences == 92`.
- My own resolver (independent of the gate: first backticked token of every `## ` heading on the
  row's note, `.rs` basename resolved against the 92 pin members): baseline 84 (83 in-family gate
  terms plus one out-of-family R9 section, see below) → lane **92**, `perRow` =
  R1 8, R2 12, R3 5, R4 6, R5 4, R6 4, R7 5, R8 4, R9 4, R10 2, R11 41. Every other row's count is
  unchanged from `0614092`.
- Pre-existing duplicate (unchanged, counted once by file identity): `local_ship_tests.rs` is
  sectioned in R9 (`test-inventories`) as well as now in R7 — the R9 section predates round 36
  (it is one of the three pre-existing `SECTION_FILE_NOT_MEMBER` warnings). `loop_driver_tests.rs`
  (R2+R9) and `distill_tests.rs` (R6+R9) were already duplicated.

## Only-added / none-disappeared proof

- `git diff --numstat`: `46 0 corpus/knowledge/native-admission-detail.md`,
  `79 0 corpus/knowledge/local-ship.md` — **pure append, zero deletions**.
- Heading delta (`git show 0614092:<note>` vs tree): `native-admission-detail.md` +4 headings,
  −0 (`:71 :82 :95 :106`); `local-ship.md` +5 headings, −0 (`:203 :221 :235 :249 :266`). The
  pre-existing `` ## `bounded_fs` (155 lines) + `fs_durability` (277 lines) `` heading is untouched
  (it is not gate-visible because its first token has no extension), so no section was renamed away.
- Gate section set: baseline 83 distinct, lane 92 distinct; `removed = ∅`;
  `added` is exactly the nine files
  `native_admission_{rules,text}.rs`, `native_seats.rs`, `native_text.rs`,
  `bounded_fs{,_tests}.rs`, `fs_durability.rs`, `local_ship{,_tests}.rs`.
- No other R-row note was touched (`git diff --stat -- corpus/` lists only the two notes plus two
  C1-owned files: `corpus/README.md`, `corpus/knowledge/live-surface-probe.md`).

## Anchor → symbol-on-line cross-check (FIDELITY v1 pairing, frozen rule)

My own implementation of the frozen pairing (right span starting ≤14 chars after the anchor, else
left span ending ≤14 before; paired span not an anchor, not path-like, ≥3 chars, not
punctuation/digits; **same note line**) over the 9 new sections:

```
TOTAL anchors=80 ok=80 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
```

(per section: rules 4/4, admission_text 11/11, seats 12/12 — one anchor is bare `:N` in a line
whose left span is path-like, counted as ok —, text 11/11; local_ship 11/11, bounded_fs 6/6,
bounded_fs_tests 5/5, fs_durability 9/9, local_ship_tests 11/11.)

Contract-relevance note: if pairing is allowed to cross a newline, `local-ship.md`'s
`` `:124-128` `` pairs with the *next line's* `tmp_guard_cleans_on_drop_but_not_after_disarm`
instead of its same-line left neighbor, producing one spurious `elsewhere` (nonok=1). The frozen
"same note line" clause is load-bearing; the delivered text is CLEAN only under it. Verify the
fidelity executor enforces it.

Gate-vs-fidelity anchor count: the claims gate reports 13 own anchors for `native_seats.rs` while
the backticked-span walk sees 12 — `RE_BARE` (`scripts/claims-check.mjs:103`) matches the Rust
format specifier `{:02}` in `` `{role}-{:02}` `` as a bare `:02` anchor at lines 2-2 (and line 2 of
that file is non-blank, so it would even satisfy the `live` test on its own). Harmless for
FIDELITY (its anchor set is backticked spans), but it is a latent false anchor in the registry
gate; if anchor semantics are ever shared, exclude `{…:N}` format specifiers.

Delivered-implementation cross-check (WIP, uncommitted `ExecClaimsFidelity` lane, claims-check sha
`d17adc39…`): `--fidelity --self <lane> --src <pin>` reads
`FIDELITY note=corpus/knowledge/local-ship.md anchors=42 ok=42 … nonok=0` and
`FIDELITY note=corpus/knowledge/native-admission-detail.md anchors=38 ok=35 … noid=3 nonok=0` —
the same 80 anchors as my walk, nonok=0 for the nine new sections. That script's global
`nonok=371` is the remaining C1 burn-down on other notes, not this item.

## Findings (by severity)

1. **medium — C1-owned, blocks the wave's `PROXY: MATCH`; C2 untouched.** `C2_total` declared 80
   (`SCORECARD.md:289`) vs computed **81**: the new untracked `corpus/knowledge/pinned-evidence.md`
   enters `listCorpusNotes` (`scripts/proxy-check.mjs:1199`) → `C2Total = notes.length`
   (`scripts/proxy-check.mjs:905`); `ls corpus/*/*.md` = 81, README rows `C2` stay 80. Knock-on
   `AXES_DRIFT coverage 10 vs 9`. Fix: declare `C2_total=81` or stop counting the new note (the
   aggregate drift pre-existed as 79-vs-80; the re-declaration to 80 was overtaken).
2. **medium — C1-owned.** Pin lines lag the integrated scripts: `pin.surface-probe`
   (`SCORECARD.md:302`) declares `148cbf85…`, computed `sha256(scripts/surface-probe.mjs)` =
   `c298d168…`; `pin.proxy-check` (`SCORECARD.md:304`) declares `5852fefd…`, computed
   `sha256(scripts/proxy-check.mjs)` = `3f1b7c7b…` at 05:33:31Z and `5140a37d…` at 05:34:51Z — the
   proxy script re-emitted during this review. Re-pin only after the C1 script set stops moving
   (`SCORECARD.md` itself was stable at `fcf77449…` across both instants).
3. **low — pre-existing, not introduced here.** Full `--strict` registry exits 1 on four warnings
   that also exist at `0614092`: `S2 scripts/ufo-mission-result.mjs` and R9
   `loop_driver_tests.rs`/`local_ship_tests.rs`/`distill_tests.rs` out-of-family. Baseline had six
   warnings (these four + `ROW_NO_SECTIONS` for R5 and R7); the lane has four — both R5/R7
   advisories retired, **no new advisory**. The scoped R5/R7 run is the one in the claim and exits 0.
4. **low — gate anchor scanner, latent (not a C2 defect).** `RE_BARE`
   (`scripts/claims-check.mjs:103`) reads the Rust specifier `{:02}` in `` `{role}-{:02}` `` as bare
   anchor `:02` (lines 2-2 of `native_seats.rs`, non-blank), so the gate counts 13 where 12
   backticked anchors exist. No finding fires today, but a section whose only "anchor" were a
   format specifier would pass `SECTION_NO_ANCHOR`/`DEAD` falsely; exclude `{…:N}` if shared.
5. **info — coverage of this review.** `scripts/claims-check.mjs` was still the baseline blob
   `e9a21b44…` at measurement (`pin.claims-check`, `SCORECARD.md:305`, matches it), so the
   `--fidelity`/`--pin` claims arm was not in the tree and my runs exercised the pre-fidelity parser.
   C2's section counting is unaffected by that arm, but re-run the two commands once it lands.
6. **info.** `.ufo/pins/fidelity-ratchet.json` sets every note ceiling and `total` to `0` — that is
   CLEAN-enforcement, not a burn-down ratchet; if intended, say so (it makes any future nonok a
   hard failure in every note), otherwise it records no baseline. Not my axis.

## Residual risk / gaps

- Uncommitted integration snapshot (`SCORECARD.md fcf77449…`); re-run both commands if L1 rewrites either note or the stanza.
- Anchor numbers cross-checked against the WIP fidelity implementation (`d17adc39…`), not the delivered gate; only `--fidelity` on the integrated tree is citable as the sweep.
