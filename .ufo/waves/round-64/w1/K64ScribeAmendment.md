VERDICT: All three drafts are written and each passes a sandbox replication of the frozen check it must satisfy (J8 base-prefix/heading/entry/M7, J7 frontier-line test, `readme-map` bimap CLEAN at `files=156 rows=156 covered=156`); the one plan-level gap found is that README rows alone cannot clear the base `readme-map` DRIFT — `.ufo/pins/readme-map.json` must also gain the three files, which `readme-rows.md` §3 supplies.

## Evidence

Frozen inputs read, not edited: `.ufo/waves/round-64/plan.md`, `probe/jj64-probe.mjs` (J1–J8 bodies), `base/readme-map-before.txt`,
`corpus/knowledge/agent-isolation-substrates.md` (29506 B, sha256 `a769714d…09a2b6`, identical to `6825a514:…`), `PROVINCE.md:21`,
`corpus/README.md:14/188/280/284`, `scripts/readme-map.mjs`, `scripts/jj-seat-demo.sh`, `corpus/lessons/round-63-verifier-spotcheck.md`.

1. Demo re-run by this seat (`bash scripts/jj-seat-demo.sh`, exit 0), 15 keys, quoted condensed:
   `workspaces_after_add=2 seat_gets_base_file=yes seat_has_git_dir=no seat_file_in_default_tree=no
   default_status_clean_after_seat_write=1 seat_snapshot_in_shared_op_log=2 ignore_working_copy_adds_op=no
   rewrite_seat_head_seat_state=fresh rewrite_seat_head_description_seen=rewritten abandon_seat_head_seat_state=stale
   abandon_seat_head_files_on_disk=kept update_stale_recovers=yes absolute_path_write_seen_in_default=1
   workspaces_after_forget=1 seat_dir_after_forget=present` / `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`.
   Two independent runs diffed byte-identical (`DEMO_STABLE: two runs byte-identical`); the amendment's table was then
   compared to the live run: `amendment-keys-equal-live live=15 stated=15`.
2. `node .ufo/waves/round-64/build/K64ScribeAmendment/verify-drafts.mjs` (this seat's verifier, sandbox-only; it mutates
   nothing in the lane), exit 0:
   ```
   DRAFT_PASS j8-base-bytes-are-prefix base=29506B tail=4722B
   DRAFT_PASS j8-amendment-heading
   DRAFT_PASS j8-entry-path-and-M7
   DRAFT_PASS demo-exit exit=0
   DRAFT_PASS amendment-keys-equal-live live=15 stated=15
   DRAFT_PASS j7-province-line len=625
     rows-only  : exit=1 README_MAP: DRIFT files=156 rows=156 covered=153 bad=3 first=unpinned:knowledge/jj-workspace-seat-containment.md
     rows+pins  : exit=0 README_MAP: CLEAN files=156 rows=156 covered=156
   DRAFT_PASS readme-rows-alone-stay-drift
   DRAFT_PASS readme-rows-plus-pins-clean
   DRAFT_VERDICT: PASS
   ```
   J8's three assertions were replicated verbatim from `probe/jj64-probe.mjs:227-230`; the J7 line test from `:210`
   (`l.includes(ENTRY) && /frontier|band|ground|first entry/i.test(l)`); the README arm runs the real
   `scripts/readme-map.mjs` over sandbox `--corpus` copies with the drafted rows spliced after the `lessons/round-63.md` row.
3. Base state, for the before-side: `node scripts/readme-map.mjs` → `README_MAP: DRIFT files=154 rows=153 covered=153
   bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md` exit 1, identical to `base/readme-map-before.txt`;
   `.ufo/pins/readme-map.json` = `version 2 covered 153`, none of the three round-64 paths present.
4. Cross-check against the sibling entry draft `build/K64ScribeEntry/jj-workspace-seat-containment.md`: its
   `## Demo outcomes` has the same 15 keys with 0 value mismatches against the amendment; its `## Located quotes` holds
   11 bullets over S198 (3) / S199 (3) / S200 (5), so my README row's `S198, S199, S200` source cell matches its rows draft.
5. Lane-script citation safety (my amendment cites `scripts/jj-seat-demo.sh`): `node scripts/cite-check.mjs` resolves
   lane `scripts/*` at the src rung (`corpus/lessons/round-8-aggregator-box3-coldrun.md:50 ERROR PIN_MISMATCH …
   sha256(scripts/round-gate.mjs)=…` is a resolution, not an UNRESOLVED). Base cite-check is already
   `VERDICT: FAIL / CITE_CHECK: DRIFT (files=158 tokens=11688 errors=1179 warnings=642)` — carried debt, unchanged by this seat.
6. No tool installed or upgraded; no package manager run (none needed).

## Findings

**K64ScribeAmendment-1 — HIGH (plan text vs `readme-map`'s own rule).** The round-64 maintenance bullet says the base
`readme-map` DRIFT "must read clean at the tip", and the plan's mistake-mined fix is "the round-start gate runs
`readme-map`". A README row is not sufficient: `evaluate()` (`scripts/readme-map.mjs:181-238`) also requires every corpus
file to be listed in `.ufo/pins/readme-map.json` `covered` (`unpinned:<f>`). Proven: rows added, registry unchanged →
`exit=1 README_MAP: DRIFT … bad=3 first=unpinned:knowledge/jj-workspace-seat-containment.md`. The L1 must land
`readme-rows.md` §3 (or `readme-map-covered-additions.json`) with the rows, or the tip opens in DRIFT again.
Reproduce: `node .ufo/waves/round-64/build/K64ScribeAmendment/verify-drafts.mjs` (the two `rows-only` / `rows+pins` lines).

**K64ScribeAmendment-2 — MEDIUM (append-only cannot retract the base's own claim).** J8 requires the base bytes as a
literal prefix, so the entry keeps `…makes that workspace stale. Not demonstrated this round; no table row relies on it.`
at base line 150 and `- … jj workspaces in colocated repos (M7) are not demonstrated here.` at base line 195, while the
appended amendment demonstrates M7. J8 passes regardless. The amendment therefore opens with an explicit two-item
supersede list naming both sentences and their section; any reader who stops before the tail reads a claim round 64
falsifies. This is inherent to the append-only rule, not a counter defect — recorded, not patched.
Reproduce: `git show 6825a51425e91908f019ed65aa2f4209acbd7087:corpus/knowledge/agent-isolation-substrates.md | grep -n 'Not demonstrated'`
→ `150`, and `… | grep -n 'M7) are not'` → `195`.

**K64ScribeAmendment-3 — MEDIUM (J6 compares fixture counts exactly).** J6 (`probe/jj64-probe.mjs:183-205`) compares the
entry's stated keys to the live run by set equality, and two of the 15 values are counts of fixture events
(`seat_snapshot_in_shared_op_log=2`, `default_status_clean_after_seat_write=1`). They were stable across two runs today,
but a jj release that snapshots once more or once less turns a correct entry into a J6 MISS for a reason unrelated to
seat containment. The amendment states this as a limit (as the entry's § Mechanisms preface already does for demo counts);
the counter is frozen, so this is reported, not patched.
Reproduce: `bash scripts/jj-seat-demo.sh | grep -E 'seat_snapshot_in_shared_op_log|default_status_clean_after_seat_write'`.

**K64ScribeAmendment-4 — LOW (row grammar and insertion point).** `loadRows()` (`scripts/readme-map.mjs:132-152`) only
recognises a row whose first cell is a backticked `knowledge|lessons/…` path; a bare path there is `format-unmapped`.
The drafted rows are backticked and were spliced after `corpus/README.md:188` (the `lessons/round-63.md` row, table ends
at :188, `## Known gaps` at :191) — proven to parse by the sandbox run (`rows=156`).
Reproduce: `node scripts/readme-map.mjs --readme <copy> …` as in `verify-drafts.mjs`.

**K64ScribeAmendment-5 — LOW (two stale frontier assertions, both corrected by drafts).** The falsified clause exists in
two frontier texts, not one: `PROVINCE.md:21` (`jj workspaces are not demonstrated`) and `corpus/README.md:284`
(`this host's harness isolation is not demonstrated`, the band's bullet). `province-line.md` replaces :21 and
`readme-rows.md` §2 replaces :284; landing only one leaves the other asserting the pre-round-64 state.

## Artifacts

- `.ufo/waves/round-64/build/K64ScribeAmendment/amendment.md` — the exact bytes to append to
  `corpus/knowledge/agent-isolation-substrates.md` (starts with one blank line, ends with `\n`; 4722 B; heading
  `## Amendment 2026-10-25 — M7 …`, names the entry path and `M7`, carries the 15 measured demo keys).
- `.ufo/waves/round-64/build/K64ScribeAmendment/province-line.md` — the one-line replacement for `PROVINCE.md:21`, between
  `<!-- PROVINCE:BEGIN/END -->` markers.
- `.ufo/waves/round-64/build/K64ScribeAmendment/readme-rows.md` — three coverage-map rows (markers `ROWS:BEGIN/END`),
  the `corpus/README.md:284` frontier bullet (`BULLET:BEGIN/END`), and the pin-registry additions.
- `.ufo/waves/round-64/build/K64ScribeAmendment/readme-map-covered-additions.json` — machine-ready `covered` additions.
- `.ufo/waves/round-64/build/K64ScribeAmendment/verify-drafts.mjs` — sandbox verifier (exit 0 today).
- Scratch: `/tmp/kumitate-r64/K64ScribeAmendment/{demo-run1.txt,demo-run2.txt}` (transient).

## Limits

- No frozen counter was run end to end: `JJ64_HELD` needs the integrated entry, rows, pins and PROVINCE/README edits;
  I replicated only J8's three assertions, J7's frontier-line predicate and the README arm (via the real `readme-map.mjs`),
  and I did not touch J1–J6 (the entry seat's surface) nor J7's `sources-census.sh validate` arm.
- Demo values are this host's `jj 0.45.1-7c41cdeb…`; J5's live fetch was not attempted (not my check) and no URL was opened.
- `cite-check`'s delta from this amendment was not isolated: the gate is at 1179 errors / 642 warnings at base, and the
  amendment is not in the tree. Only the lane-script resolution class was probed (see Evidence 5).
- I did not edit `corpus/`, `PROVINCE.md`, `scripts/`, `.ufo/pins/`, the git index or jj state; nothing was committed.
