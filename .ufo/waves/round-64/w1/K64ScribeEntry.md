VERDICT: Draft C2 entry written and mechanically checked against the frozen probe's own regexes — J1, J2 (simulated over drafted registry rows), J3 (pin hashes), J4, J5 (live re-fetch), J6 (demo re-run, set-equal) and J8's amendment heading all pass; J7 depends on L1's PROVINCE/readme-map integration, not on this file.

## Evidence

Demo, run from the lane (`bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/jj-seat-demo.sh`), exit 0, verbatim:

```
JJ_SEAT: workspaces_after_add=2
JJ_SEAT: seat_gets_base_file=yes
JJ_SEAT: seat_has_git_dir=no
JJ_SEAT: seat_file_in_default_tree=no
JJ_SEAT: default_status_clean_after_seat_write=1
JJ_SEAT: seat_snapshot_in_shared_op_log=2
JJ_SEAT: ignore_working_copy_adds_op=no
JJ_SEAT: rewrite_seat_head_seat_state=fresh
JJ_SEAT: rewrite_seat_head_description_seen=rewritten
JJ_SEAT: abandon_seat_head_seat_state=stale
JJ_SEAT: abandon_seat_head_files_on_disk=kept
JJ_SEAT: update_stale_recovers=yes
JJ_SEAT: absolute_path_write_seen_in_default=1
JJ_SEAT: workspaces_after_forget=1
JJ_SEAT: seat_dir_after_forget=present
JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
```

Determinism: two consecutive runs diffed byte-identical (`diff run1.txt run2.txt` → `RUNS_IDENTICAL`, `grep -c '^JJ_SEAT: '` → 15), both exit 0.

Live sources fetched 2026-10-25 with the probe's UA (all exit 0, sizes = pinned bytes):
`docs.jj-vcs.dev/latest/technical/concurrency/` 48988 B; `firefox-source-docs.mozilla.org/contributing/jujutsu.html` 53233 B; `docs.jj-vcs.dev/latest/working-copy/` 47694 B.

Mirror of the frozen probe's own code paths (same `norm()`, same regexes, read from `.ufo/waves/round-64/probe/jj64-probe.mjs:79-178`), run against the draft:

```
J1 true true true ids S198,S199,S200
J3 S198 pin-ok 48988 / S199 pin-ok 53233 / S200 pin-ok 47694
J4 bullets=11 per-row=S198:3,S199:3,S200:5 bad=none
J5 (fresh curl of all three URLs) bad=none
J6 exit=0 stated=15 live=15 diffs=0
J8 heading=true names-entry=true M7=true   (amendment block, appended text only)
```

Registry rows (drafted, not installed) validated by the census in a full-tree simulation (`tar` copy of the lane minus `.git`/`.jj` into `/tmp/kumitate-r64/K64ScribeEntry/sim`, draft `corpus/SOURCES.md` + entry in place):
`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /tmp/kumitate-r64/K64ScribeEntry/sim/corpus/SOURCES.md` → `file	ok	…/sim/corpus/SOURCES.md`, `EXIT=0`, six W04 warnings (same six as the base lane).

Host versions: `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, `git version 2.56.0`, `v24.21.0`. No tool was installed or upgraded.

## Findings

**K64ScribeEntry-1 — MEDIUM (integration ordering).** The three drafted rows name `corpus/knowledge/jj-workspace-seat-containment.md` in `used-by`, and the census resolves `used-by` against the tree, so rows committed before the entry make `validate` exit 1 with `E11 S198/S199/S200 missing used-by …`. Both must land in one commit. Reproduce: `cp -r lane/corpus /tmp/c; cp draft/SOURCES.draft.md /tmp/c/SOURCES.md; bash scripts/sources-census.sh validate --file /tmp/c/SOURCES.md` → three `E11 … missing used-by corpus/knowledge/jj-workspace-seat-containment.md` lines, exit 1 (observed); with the entry present in a full-tree copy the same command reads `ok`, exit 0.

**K64ScribeEntry-2 — MEDIUM (J6 cannot see a semantic break).** The demo derives `seat_snapshot_in_shared_op_log` by counting `grep -c 'snapshot working copy'` over the op log (`scripts/jj-seat-demo.sh:33`). A jj release that renames that operation description flips the key to `0`; the entry would then state `0`, the demo prints `0`, and J6 stays green while the mechanism claim ("the seat's snapshot lands in the shared log") is false. J6 compares the entry with the demo, never with jj. This is the plan's declared hole ("cannot tell a sound entry from a well-grounded wrong one"); the only guard is the entry's `recheck: 90d` line.

**K64ScribeEntry-3 — LOW (J1's 14-line window).** J1 reads only `text.split('\n').slice(0, 14)` for `source:`/`verified-at:`/`recheck:`. My entry puts all three on lines 1–5 (safe), but any house-style entry with a preamble longer than nine lines would MISS J1 for a reason unrelated to its content. Reproduce: `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> <M> --no-live` against an entry whose metadata starts at line 15.

**K64ScribeEntry-4 — MEDIUM (J3 needs the capture committed, not just pinned).** J3 reads the capture from inside `git archive M`; a pin whose `path` is not committed reads `capture-absent`. My three captures sit under `.ufo/waves/round-64/build/K64ScribeEntry/captures/` with the hashes in `source-captures.fragment.json`, so L1 must commit both the files and the merged pin entries. Reproduce: `sha256sum .ufo/waves/round-64/build/K64ScribeEntry/captures/*.html` and compare with the fragment (match verified: `5e2f7576…`, `abbe47cf…`, `947d0c56…`).

**K64ScribeEntry-5 — LOW (two keys are fixture counts).** `seat_snapshot_in_shared_op_log=2` and `default_status_clean_after_seat_write=1` are counts inside one fresh fixture and J6 compares them as exact strings, so any edit to the demo's fixture invalidates the entry text. Two runs are byte-identical, so this is coupling, not flakiness; the entry states it in `## Limits`.

**K64ScribeEntry-6 — LOW (quote-mining hazard, hit and fixed).** Rendered docs insert whitespace around inline code: the S199 sentence ends `… manually update with jj workspace update-stale .` (space before the full stop) after tag stripping, so a quote ending at that code token with a period fails J4/J5. First draft failed exactly there (`S199 NOT-IN-CAPTURE`); dropping the terminal period made it pass. Other scribes quoting jj docs will hit this.

**K64ScribeEntry-7 — INFO (claim narrowed, as the plan declares).** The staged sentence "the seat does not go stale" is false as a general claim: `rewrite_seat_head_seat_state=fresh` (describe) against `abandon_seat_head_seat_state=stale` (abandon) on the same checked-out commit. The draft states the narrowed claim and names the demo key for each half; nothing in the frozen counter or controls is wrong.

## Artifacts

- `.ufo/waves/round-64/build/K64ScribeEntry/jj-workspace-seat-containment.md` — the entry draft (116 lines), install target `corpus/knowledge/jj-workspace-seat-containment.md`.
- `.ufo/waves/round-64/build/K64ScribeEntry/sources-rows.draft.md` — the three registry rows (S198 concurrency, S199 firefox, S200 working-copy), 11 cells each.
- `.ufo/waves/round-64/build/K64ScribeEntry/source-captures.fragment.json` — pin fragment (sourceId/path/sha256/bytes/captured) for `.ufo/pins/source-captures.json`.
- `.ufo/waves/round-64/build/K64ScribeEntry/captures/{jj-technical-concurrency,firefox-jujutsu-contributing,jj-working-copy}.html` — byte-identical live fetches.
- `.ufo/waves/round-64/build/K64ScribeEntry/amendment-draft.md` — append-only `### Amendment 2026-10-25 — M7 demonstrated (round 64)` block for `corpus/knowledge/agent-isolation-substrates.md` (names the entry path and M7; heading matches J8's regex).
- `/tmp/kumitate-r64/K64ScribeEntry/{run1.txt,run2.txt,Sources.draft.md,sim/}` — scratch.

## Limits

- J2/J7 were simulated, not executed by the frozen probe: the probe needs a committed revision, and I may not install rows or entries. My J2 mirror re-implements the probe's `cells()`/destructure exactly (`cells=13` for each row); J7's `PROVINCE.md` frontier line and `readme-map` cleanliness are L1 work and were not checked.
- J3's hash check was run against the files on disk, not through `git archive` (nothing is committed yet).
- J5 was checked with a separate fresh `curl` at 2026-10-25; the probe re-fetches with its own UA at scoring time, so a page change between now and then re-opens the rows.
- No concurrency was exercised: the demo drives two workspaces sequentially, so no operation-log merge conflict is produced and nothing here measures parallel writers.
- The entry deliberately marks its inference (`[INFERENCE]`) about the seat's commit id moving under a description rewrite; the demo prints the description only.
- I edited nothing outside `.ufo/waves/round-64/build/K64ScribeEntry/` and `/tmp/kumitate-r64/K64ScribeEntry/`; the frozen plan, probe, controls and base receipts were read only.
