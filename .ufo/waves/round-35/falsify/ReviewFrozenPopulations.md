ATTACK frozen-populations verdict=holds defects=0

# Target
Frozen populations `.ufo/waves/round-35/frozen/{s-modified-members-55.tsv,s-added-2.txt,s-deleted-5.txt}`
and baseline outputs `.ufo/waves/round-35/baseline/*` vs C1/C2/C3. Scratch: `/fast/scratch/kumitate-r35/w/ReviewFrozenPopulations/`.
No lane files edited; no tools installed.

# 1. Independent rebuild from the pinned clone — exact
Member pattern = proxy-check.mjs `LAYER_PATTERNS` (`scripts/*.mjs` + `scripts/<dir>/**`).
```
$ git -C /fast/scratch/kumitate-r35/src diff --name-status 964f443e 31c465f1 -- scripts/
-> 69 entries: 2 A, 6 D, 61 M   (renames: 0; -M and --no-renames agree)
```
Applying the pattern: A=2, D=5, M=55. Set comparison against the frozen files:
```
A match True   D match True   M match True
```
Excluded by the pattern (not defects): M `gates.sh self-iter.sh smoke.sh
ufo-night-watchdog-lib.sh ufo-night-watchdog.sh ufo-sighting`; D `dev-verify.sh`.
numstat column: `git diff --numstat` vs TSV `+N/-M` → **55/55 exact, 0 mismatches**.
Member-set delta at the pin: base 91 → pin 88; `base-pin` == `s-deleted-5.txt`,
`pin-base` == `s-added-2.txt` (both True). Pin member count re-derived from
`ls-tree` = 88.

# 2. Baseline reproduction on master-tree — exact except one environment-bound row
All with `--src /fast/scratch/kumitate-r35/src`:
- **proxy**: byte-identical body (7 findings incl. `S_SECTIONS_DRIFT 91→86`, `C2_total 77→78`, `PROXY: DRIFT`); `--json` → **0 term mismatches**, identical `findings[]`, pins 6/6.
- **distinct**: `S occ 86 distinct 86`, `R occ 83 distinct 83`, `S members without section: [omp-route-grammar.mjs, ufo-swarm-registry.mjs]` — identical.
- **mutation (`.ufo/waves/round-35/mutate-distinct.sh.txt`)**: `MUTATION_BASELINE S_sections=86 R_sections=83` … `MUTATION_KILLS 0/2` — identical.
- **claims**: body diff vs `baseline/claims.txt` is only the harness `exit=1` line (`rows=19 yes=19 notes=27 sections=178`, `errors=6 warnings=6`, same six findings).
- **kimi-census**: identical (`K1 3`, `members=50 checked=50`, `DRIFT (UNLISTED mcp.json)`, exit 1); `--selftest` 45/45.
- **sources**: identical (`rows=20 … CLEAN`). **proxy --selftest**: 104/104.
- **checklists**: 7/13 vs baseline 9/13. Not a defect: master-tree is a plain copy
  (`round-gate` → `FAIL-CLOSED (NOT_A_GIT_WORKTREE)`) and lacks
  `/fast/scratch/kumitate-r35/.ufo/reports` (`REPORTS_DIR_MISSING`); items 623/624
  return exit 2, which `SKILL.md:632-634` defines as a tool/environment fault.
  The baseline was captured inside the lane worktree at base; it is not
  reproducible from the frozen tree alone. [Observed; no claim depends on it.]

# 3. Lane gates reproduce the declared round-end lines — exact
Run in the lane against the pin:
```
PROXY  MATCH: A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10;
S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9;
K=51/51 coverage:kimi-layer=10; pins=6; only finding PIN_UNPINNED (sources-check.mjs)
CLAIMS  MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)  errors=0 warnings=6
KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)
SOURCES_CHECK: CLEAN (rows=28 …)
PROXY_SELFTEST: 107/107   (baseline 104/104)
CHECKLIST: 12/13 pass — only SKILL.md:620 (live sighting surface)
```
Mutation on the lane: `before=88 after=87 killed=yes` / `before=83 after=82 killed=yes`
/ `MUTATION_KILLS 2/2` — matches C1 exactly.

# 4. C1 mechanism verified in code, not just by number
- `scripts/proxy-check.mjs:593-605` (lane): `sections = {S:new Set(), R:new Set()}`,
  `:600 sections[layer].add(s.file)`, `:605 S_sections: sections.S.size`.
- Master same function: `:599 S_sections: sections.S` (Σ occurrences).
  Pre-change occurrence==distinct (86/86), so copy+drop nets 0 occurrences → 0 kills;
  post-change the Set drops 88→87 → kill. The mutation genuinely discriminates.

# 5. C2 structure verified
- `remaining-scripts-census.md`: 63 → 60 member `##` headings; headings added for
  both `s-added-2.txt` members; each of the 5 departed names appears exactly once in
  `## Departed members (re-census 31c465f1, 2026-10-20)` (`:814`) and no longer as a
  `##` heading. 60 table rows ↔ 60 headings, set difference empty both ways.
- 36 member sections changed body — exactly the number in `LOG.md:1601-1602`;
  all 60 lane S8 sections are `live=true`, `symbolHit=true`, `inFamily=true` under
  claims-check (master: 58 live + 5 dead).
- `SCORECARD.md:132` arithmetic holds: 88 − 28 live S1–S7 = 60. Measured S1–S7
  in-family = 28 (S1 1, S2 7, S3 2, S4 5, S5 2, S6 5, S7 6); 28 + 60 = 88 = S_members,
  no overlap, no duplicate section.
- C2/T2: `corpus/README.md` 79 rows ↔ 79 note files, bijective (0 unresolved rows,
  0 files without a row). Baseline was 77 rows/78 files because
  `lessons/round-34-verifier-spotcheck.md` landed without a row — the reported
  `C2_TOTAL_DRIFT 77→78` and its round-35 repair are correct and measured.
- "209 anchors" is a fidelity-runner metric scoped in `build/ExecS8Fidelity.md:1-2`
  to pre-fix non-ok references; it is not recomputable from the final tree.
  I did not falsify it; the final note carries 498 own-file anchors, all gate-live.
  [INFERENCE: pre-fix corpus not re-run.]
- Frozen TSV provenance column: all 55 rows list ≥1 note that carries a
  `## \`<member>\`` section (0 rows without one); every listed note exists and
  mentions the member (two live-surface/native-judge mentions are anchored forms
  such as `scripts/fleet-dispatcher.mjs:14387-14456`, which my strict backtick-exact
  check initially mis-flagged — verified by hand at
  `corpus/knowledge/live-surface-probe.md:29` and `native-judge-pipeline.md:149`).

# 6. C3 verified
- `scripts/kimi-census.mjs:108` mcp.json `{kind:'file', secret:true, modeFloor:0o400}`;
  shape-only policy at `:43-51`; imports (`:88`) contain no `readFileSync`; the
  derivation uses `lstatKind`/`listChildren` only. Mode floor is `mode & floor === floor`.
- Live: baseline `K1 3`, `members=50 checked=50`, `DRIFT (UNLISTED mcp.json)`,
  `strays=1`; lane `K1 4`, `51/51`, `CLEAN`, `strays=0`, no content read.
- proxy `K_MEMBER_RULES` (`scripts/proxy-check.mjs:352`) carries the same
  `mcp.json` row; `K_members=51 K_sections=51 coverage_kimi=10` reproduce.

# Defects
None. The frozen populations, baseline proxy/claims/kimi/sources/distinct/mutation
outputs, and the C1/C2/C3 end-state numbers all reproduce exactly from the pinned
clone. The single non-reproducing baseline row (checklist 623/624) is an environment
fault by the checklist's own definition, not a measured claim.

Residual unknowns: (a) the 209-anchor pre-fix metric (needs the fidelity clone's
pre-edit state); (b) time-of-run snapshot — lane gates were read while the L1 may
still integrate, but all outputs matched the declared round-end line exactly.
