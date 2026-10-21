ATTACK gate-selftests-round-records verdict=holds defects=1

Scope: all seven `--selftest` suites, `--round 32|34|35`, the SCORECARD pin
block, and the round-35 records. Commands ran from
`/home/vgpnk/Projects/shokunin/kumitate-shokunin`; mutation only on a copy under
`/fast/scratch/kumitate-r35/w/KumitateR35.RerunSelftestsGates/`. No lane file was
modified except this report. No tool installed or updated.

## Gate suites — held

`node scripts/<gate>.mjs --selftest`, true exit code: cite-check 62/62 rc0;
surface-probe 42/42 rc0; round-gate 60/60 rc0; proxy-check 107/107 rc0;
kimi-census 48/48 rc0; sources-check 46/46 rc0; claims-check 39/39 rc0.
Poisoned env (`env -i PATH=<node-dir>:/usr/bin:/bin HOME=/tmp/nonexistent-home
UFO_SRC=/nonexistent`) → all seven still PASS, so no suite needs the live
`~/.kimi-code` or live origin checkout. Master comparison: master proxy
`104/104`, master kimi-census `45/45`; +3 each as recorded.

## Round gates — held

`--round 32` → `CLEAN (checks=10 errors=0)` rc0; `--round 34` → same rc0;
`--round 35` → `DRIFT (checks=5 errors=2)` rc1 with findings exactly
`REPORT_MISSING` + `COMMIT_MISSING`; the SCORECARD-row, planned-round and
LOG-entry checks are ok. Matches the pre-landing expectation. round-gate takes
no `--src` (usage exit 64, no upstream read) — one documented exception to the
brief's "pass --src to every gate". `surface-probe --checklists` →
`CHECKLIST: 12/13 pass` FAIL rc1; sole red `SKILL.md:620` "Live sighting-surface
conformance"; `grep -c '^- \[ \]' SKILL.md` → 13 = C=13.

## Pins — held

Programmatic sha256 vs the v1 stanza: 6/6 MATCH (cite `40573448`, surface
`148cbf85`, round-gate `f890e277`, proxy `e58c0801`, claims `e9a21b44`, kimi
`7818970b`). `sources-check` deliberately unpinned; `PIN_UNPINNED` and
`--strict` rc1 are the documented round-34 decision, not drift.

## C1 — independently reproduced (held)

Baseline on my unmutated copy: `PROXY: MATCH (… S=88/88 coverage:script-layer=10;
R=83/92 coverage:runtime-layer=9; K=51/51; pins=6 match)`.
My harness (not the wave script) duplicated `scripts/fleet-dispatcher.mjs` into
`successor-chain.md`, dropped `scripts/check-hand-authored-sets.mjs` from
`remaining-scripts-census.md`, duplicated `loop_driver.rs`, dropped `axes.rs`:

- round-35 proxy on mutant: `PROXY: DRIFT (S_SECTIONS_DRIFT term=S_sections
  declared=88 computed=87 delta=-1; R_SECTIONS_DRIFT term=R_sections
  declared=83 computed=82 delta=-1; …)` rc1 → 2/2 kills.
- master proxy on the same mutant: no S/R finding (S 88→88, R 83→83), only the
  unrelated master `K_MEMBERS_DRIFT` (50) → 0/2 kills.
- The fixtures assert exact verdict strings: `proxy-check.mjs:1555,1564,1573`.

## C2 — counts re-run at 31c465f1 (held)

Clone HEAD `31c465f15669f744848bd9f5d56191c5085670f7`; 70 top-level mjs + 18
nested = S_members 88. `claims-check --src <clone> --row S8` → `MATCH (rows=1
yes=1 notes=1 sections=60 adv=0)`; `SCORECARD.md:132` cell = 60 members; the
note holds exactly 60 `## \`scripts/` sections. Both new members exist at the
pin (207 L / 173 L) and anchors are real: `scripts/omp-route-grammar.mjs:88`
`parseRoute`, `:31` `MAX_CHAIN_LENGTH`. The note's debt is exactly 42 cite
errors at the pin (30 UNRESOLVED, 11 LINE_OOR, 1 PIN_MISMATCH), matching
`ExecS8Fidelity.md` and LOG. Upstream deleted 6 paths, 5 of them `*.mjs`
(`dev-verify.sh` is not a layer member) → "deleted 5 S8 members" is correct.

## C3 — re-run (held)

Lane census `CLEAN (members=51 checked=51 chain=7 info=4)` strays=0; master
census live `DRIFT (UNLISTED mcp.json)` members=50 strays=1 — the "before"
reproduces. strace over open/openat/openat2/stat/newfstatat/lstat/statx:
0 opens of `mcp.json`, 2 `statx` (regular 0644, size 249) → shape-only, no
content read. Binding heading `corpus/knowledge/kimi-mcp-plane.md:21`
`` ## `~/.kimi-code/mcp.json` ``; `FROZEN.K1` 3→4 at `kimi-census.mjs:522`;
absent/FIFO/dir/mode-floor arms at `:717-751` make "CLEAN without opening"
testable.

## Records vs live — held

`LOG.md:1576` bullet / `:1627` "Not fixed" and `SCORECARD.md:399-401` quote the
exact live strings I re-measured (proxy, claims, sources, census); `adv=6` is
the six warnings, all pre-existing (S2's warning reproduces on master's
claims-check). Lesson "9/13 at open" vs "12/13 now" is consistent with item 620
being the only red left.

## Defect

1. `scripts/proxy-check.mjs.orig` — untracked scratch copy inside the measured
   tree. Command/output: `git check-ignore -v scripts/proxy-check.mjs.orig` →
   rc1 (not ignored); `ls -l` → 121144 B mode 0755; `git status` → `??`;
   `node scripts/proxy-check.mjs.orig --selftest` → `ERR_UNKNOWN_FILE_EXTENSION`
   (it cannot even run). `git add -A` would land it in the round commit.
   Already flagged at `.ufo/waves/round-35/falsify/CriticC1Final.md:66`;
   independently confirmed here. Minimal fix: `rm scripts/proxy-check.mjs.orig`
   before the work commit (or move it to `.ufo/waves/round-35/` as `.txt`). No
   scored term moves (A glob is `*.mjs`; A=7 live; zero `.mjs` outside `scripts/`).

## Notes (not defects)

- Round-end gloss "item 620 red, upstream": item 620 has two independent errors
  — upstream `VERB_UNDECLARED surface` and the lane's `DIGEST_CONCAT` ordering
  (per-file digests pass). `SCORECARD.md` `## Limits` and LOG state both; if the
  one-liner is published verbatim it should say "partly upstream". [INFERENCE]
  the "sorted order" diagnosis is the record's (`SCORECARD.md` `## Planned`
  item 3), consistent with `DIGEST_PER_FILE` ok + `DIGEST_CONCAT` fail but not
  re-derived.
- Checklist item 618 accepts exit `0|1`, so it passes while `CITE_CHECK` is
  `DRIFT (errors=461)` at the pin: documented "verdict" semantics, not counted
  as a claim failure, but non-discriminating for corpus health.
