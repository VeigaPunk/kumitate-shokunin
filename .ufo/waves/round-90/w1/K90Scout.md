# K90Scout — round-90 reconnaissance: every lane file the `receipt-bind` v4 bump and the round-90 close touch

Seat: K90Scout (scout). Read-only on the lane; no lane file written by this seat.
Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, base `7218699cfbdec702ba42f35ceac0a8e52d1bd564`, lane HEAD `b67fa9639ca6537b92021ea938f769ff1ed6c883`.
Receipts (committed under the seat dir): `.ufo/waves/round-90/K90Scout/touchpoints.txt`, `round89-gate.txt`, `counts.txt`.
No tool installed or upgraded (nothing needed).

## 1. Touchpoints (`K90Scout/touchpoints.txt`)

`grep -rn 'receipt-bind' <lane> --include='*.md' --include='*.mjs' --include='*.json' --include='*.sh' -l`
(excluding `.git` and `.ufo/waves/round-5x..8x`) returns 42 files; the 15 **live** ones are
`scripts/receipt-bind.mjs`, `scripts/proxy-check.mjs`, `SKILL.md`, `SCORECARD.md`, `LOG.md`,
`corpus/QUALITY.md`, `corpus/README.md`, `corpus/knowledge/receipt-lane-membership-and-link-binding.md`,
`corpus/knowledge/receipt-subject-binding.md`, `corpus/lessons/round-87{,-verifier-spotcheck}.md`,
`corpus/lessons/round-88{,-verifier-spotcheck}.md`, `corpus/lessons/round-89{,-verifier-spotcheck}.md`
plus the round-90 wave tree (`.ufo/waves/round-90/**`).

Lines naming the **v3 contract** `kumitate-receipt-bind-v3`:

```
scripts/receipt-bind.mjs:5: * Contract: kumitate-receipt-bind-v3 (round 89; v2 round 88, v1 round 87, capability `receipt-bind`).
scripts/receipt-bind.mjs:85:const CONTRACT = 'kumitate-receipt-bind-v3';
SKILL.md:646:| receipt-bind | gate | … contract `kumitate-receipt-bind-v3` (round 89; v2 round 88, v1 round 87, routed defect R86-D1: …
SKILL.md:763:- [ ] Receipt-subject binding (round 87, v2 round 88, v3 round 89; contract `kumitate-receipt-bind-v3`; …
LOG.md:3050:Claim: C1 operability, capability acquisition `receipt-bind` v3 (contract `kumitate-receipt-bind-v3`),
SCORECARD.md:4348:acquisition `receipt-bind` v3 (contract `kumitate-receipt-bind-v3`). The stagnation nudge is active
corpus/knowledge/receipt-lane-membership-and-link-binding.md:1:… (contract `kumitate-receipt-bind-v3`)
```

Lines naming the **v3 sha** `37201ad0…`:

```
LOG.md:3066:Landed instrument: `scripts/receipt-bind.mjs` v3, sha256 `37201ad0…` …
SCORECARD.md:338:pin.receipt-bind=37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3
SCORECARD.md:4365:instrument integrates at the seat candidate `37201ad0…` (selftest 59 → 68 arms). …
corpus/lessons/round-89.md:22:The L1 integrated the wave's v3 candidate (`scripts/receipt-bind.mjs`, sha256 `37201ad0…`, …
corpus/lessons/round-89-verifier-spotcheck.md:49:| instrument bytes at the judged rev | … | `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` = `pin.receipt-bind` … | yes |
```

## 2. Every consumer of `pin.receipt-bind`

```
SCORECARD.md:338:pin.receipt-bind=37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3
scripts/proxy-check.mjs:561:  'pin.receipt-bind': 'scripts/receipt-bind.mjs', // round 87: receipt-to-instrument binding gate (R86-D1)
scripts/counter-pins.mjs:51: * pin: SCORECARD.md `kumitate-gate-pins-v1` (`pin.counter-pins`).   # no receipt-bind text
grep -n 'receipt-bind' .ufo/pins/*.json   -> exit 1 (no hit)
```

Facts that matter for the bump:
- The **only sha-carrying** consumer is `SCORECARD.md:338` (the `kumitate-gate-pins-v1` HTML-comment stanza that opens at `SCORECARD.md:326`). `proxy-check.mjs:561` maps key → path only, so **line 561 needs no edit**; `SCORECARD.md:338` must move to the v4 digest or `proxy-check --strict` reads `GATE_PIN_DRIFT`.
- `counter-pins.mjs` reads **its own registry** `.ufo/pins/counter-pins.json` (`DEFAULT_REGISTRY`, line 62) — `receipt-bind` is **not** in it (grep exit 1), so **no counter-pins registry edit is needed** for the v4 bump.
- `SCORECARD.md` also quotes `pin.receipt-bind` re-pinned at `:4324` (r88) and `:4386` (r89) — historical, do not edit.

## 3. Round-89 inherited gate defects (`K90Scout/round89-gate.txt`)

`node scripts/round-gate.mjs --round 89` **in the lane worktree** prints `ROUND_GATE: CLEAN (round=89 lane=kumitate checks=10 errors=0 warnings=0)` — because the worktree already carries an **uncommitted** round-90 repair (`git status`: ` M LOG.md`, ` M SCORECARD.md`). The defects are only visible at base, reproduced read-only in a scratch clone of `7218699c`:

```
ROUND_GATE  error  REPORT_MISSING  <scratch>/.ufo/reports/round-89/kumitate.md          # scratch artifact, not a lane defect
ROUND_GATE  error  SCORECARD_ROW_MISSING  no table row starting "| 89 |" in <repo>/SCORECARD.md
ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 89
ROUND_GATE  error  LOG_ENTRY_MISSING  no "- YYYY-MM-DD — round 89" line in <repo>/LOG.md
ROUND_GATE: DRIFT (round=89 lane=kumitate checks=5 errors=3 warnings=1)
```

Exact quoted lines per finding (from `scripts/round-gate.mjs:413-441`):
`SCORECARD_ROW_MISSING` → `no table row starting "| 89 |" in <repo>/SCORECARD.md`; `LOG_ENTRY_MISSING` → `no "- YYYY-MM-DD — round 89" line in <repo>/LOG.md`; `SCORECARD_PLAN_MISSING` → `## Planned names no round later than 89`.
Base confirms all three are absent: `git show 7218699c:SCORECARD.md | grep -nE '^\|[[:space:]]*89[[:space:]]*\|'` → rc=1; `git show 7218699c:LOG.md | grep -nE '^- [0-9]{4}-[0-9]{2}-[0-9]{2} — round 89'` → rc=1.
The **uncommitted worktree repair** already closes them: `SCORECARD.md` gains a `| 89 |` row (at `:474`) plus `## Planned → Round 90 — declared claim` (`:580`); `LOG.md` gains the `- 2026-11-04 — round 89 …` bullet plus `## Round 90 — receipt-bind v4 …`. **These two modified files are the round-90 close's responsibility to commit; they are the only lane-tracked modifications in the tree.**

## 4. The two counts the report must cite (`K90Scout/counts.txt`)

```
$ cd <lane> && grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
197
$ git -C <lane> show 7218699cfbdec702ba42f35ceac0a8e52d1bd564:corpus/SOURCES.md | grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'
197
```

Both are **197** (worktree == base: no S-row has been added yet this round). The naive `grep -c '^| ' SCORECARD.md` = 272 is a different quantity and must not be cited as the SOURCES row count. Highest id present is **S259** (row at `corpus/SOURCES.md:214`), so the round-90 frontier rows must be **S260+**. The `## Registry` section is `corpus/SOURCES.md:10`; other sections are `## Paths` (:216), `## Search log` (:248), `## Leads (unopened)` (:331).

## 5. The v3 constants in `scripts/receipt-bind.mjs` at base

```
$ git -C <lane> show 7218699c:scripts/receipt-bind.mjs | grep -n 'CONTRACT\|v3 boundaries\|PASS held'
44: * v3 boundaries (round 89; the round-88 reviewer's MED/LOW-MED rows and the sentinel's TOCTOU row):
85:const CONTRACT = 'kumitate-receipt-bind-v3';
100:contract ${CONTRACT}
224:      contract: CONTRACT, mode: 'bind', ok: false, verdict: 'FAIL-CLOSED', token, detail,
384:      contract: CONTRACT, mode: 'bind', ok: clean, verdict: clean ? 'CLEAN' : 'DRIFT',
592:    const ok = r.status === 1 && obj !== null && obj.contract === CONTRACT && obj.ok === false &&
686:    out(`RECEIPT_BIND_SELFTEST: PASS held=${held}/${results.length}\n`);
```

**The literal `68` does NOT occur in the base instrument** (`git show 7218699c:scripts/receipt-bind.mjs | grep -c '68'` → **0**). The arm count is a runtime fact: line 686 prints `held=${held}/${results.length}`. Measured at base from a scratch clone: `node scripts/receipt-bind.mjs --selftest --work <scratch>` → `RECEIPT_BIND_SELFTEST: PASS held=68/68` (68 `RECEIPT_BIND_SELFTEST arm` lines). The literal `68` is quoted only in *other* lane files (`LOG.md:3070,3091`; `SCORECARD.md:4365,4383`; `corpus/lessons/round-89.md:23`; `corpus/lessons/round-89-verifier-spotcheck.md:50,68,96`). The frozen probe enforces it as `const SELFTEST_FLOOR = 68;` at `.ufo/waves/round-90/probe/probe90-c1.mjs:71` — v4 must print `held=N/N` with **N ≥ 68** (76 expected per the plan) and no `RECEIPT_BIND_SELFTEST arm … FAIL` line (`probe90-c1.mjs:222-225`).

Base instrument sha verified: `git show 7218699c:scripts/receipt-bind.mjs | sha256sum` → `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` = the pinned `pin.receipt-bind`. Frozen probe sha (unchanged): `70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694`.

## 6. The v4 change surface inside the instrument (base line numbers)

- `scripts/receipt-bind.mjs:289` — `text = text.replace(/^\uFEFF/, '');` — the **only** invisible-character handling in v3 (file-leading BOM, once). This is the line the v4 prefix-normalisation subsumes.
- `scripts/receipt-bind.mjs:290-296` — the `field(key)` helper: `new RegExp(\`^${key}=(.*)$\`, 'gm')` anchored at line start, so any prefixed field line is invisible to it and a prefixed duplicate is never counted → the K89-V1 hole. v4 must strip a bounded leading prefix set (U+FEFF, U+200B, U+200C, U+200D, U+200E, U+00A0) **per field line** before matching, so a prefixed duplicate is `AMBIGUOUS_FIELD` while an all-prefixed receipt still parses.
- `scripts/receipt-bind.mjs:517-519` — the v3 BOM selftest arms (`rcBom`, `rcBomRev`); v4 grows 68 → 76 arms (six prefixed-duplicate arms + the two all-prefixed parse twins).
- `scripts/receipt-bind.mjs:44` — the `v3 boundaries (round 89 …` header block; v4 adds its own boundary block.
- `scripts/receipt-bind.mjs:5, 85` — the contract string and constant → `kumitate-receipt-bind-v4`.

## 7. The round-90 close file set

The round-89 close produced **19** receipts in `.ufo/waves/round-89/close/` (`bind.txt bind-selftest.txt bind-final.txt bind-after-checklists.txt proxy.txt proxy-selftest.txt checklists.txt map.txt map-selftest.txt selftest.txt plan.txt ready.txt census.txt source-capture.txt sources-check.txt spotcheck.txt twin.txt probe1.txt probe2.txt`); `.ufo/waves/round-90/close/` **does not exist yet**. The round-89 close commit `082f01a4` touched only `LOG.md` (+14) and `SCORECARD.md` (+49) besides the receipts; the round-89 integration commit `7a8afb5f` touched `scripts/receipt-bind.mjs` (+126), `SKILL.md` (4), `SCORECARD.md`, `LOG.md`, `corpus/QUALITY.md` (+34), `corpus/README.md` (+3), `corpus/SOURCES.md` (+5), `corpus/lessons/round-89.md` (+100), `corpus/knowledge/omp-agent-root.md`, `scripts/omp-census.mjs`, `scripts/spotcheck-adopt.mjs`, and three pin registries (`.ufo/pins/{counter-pins,readme-map,source-captures}.json`).

Round-90 close checklist derived from the above (H1–H5 of the plan):
`scripts/receipt-bind.mjs` · `SCORECARD.md:338` (pin) + a `| 90 |` row + the `## Planned`/`## Round 90` blocks · `LOG.md` (`- YYYY-MM-DD — round 90` bullet + section) · `SKILL.md:646` (gate row) + `SKILL.md:763` (checklist: contract v4, 76 cases, 47 arms) · `corpus/SOURCES.md` (new S260+ rows) · `corpus/knowledge/receipt-lane-membership-and-link-binding.md` (contract v4; **`recheck:` 64/64 → 76/76**, K89-V6) · `corpus/lessons/round-90.md` (new; `## Mistakes`) · `corpus/README.md` (one map row per new corpus file — `scripts/readme-map.mjs` enforces 1:1, 228 map rows now) · `.ufo/pins/readme-map.json` `covered[]` + `.ufo/pins/source-captures.json` · `.ufo/waves/round-90/close/*.txt`.

## 8. Findings the report should carry (not in the seat brief)

1. **`SKILL.md:763` and `corpus/knowledge/receipt-lane-membership-and-link-binding.md:3` both still quote the stale `64/64` / "64 cases"** while the instrument prints `68/68` — this is the routed defect **K89-V6**, and it is *also* inside the file the v4 bump must edit. The v4 bump and the K89-V6 correction land in the same file: the recheck must become `76/76` (v4), which supersedes the pending 68/68 correction. The append-only correction must therefore carry the **final v4 count**, not 68/68, or the entry drifts twice.
2. **`counter-pins.mjs` does not consume `pin.receipt-bind`** — the pin registry is `.ufo/pins/counter-pins.json` and has no receipt-bind entry. Only `SCORECARD.md:338` carries the sha. Any report that lists "counter-pins registry re-pin" as a v4 touchpoint is wrong.
3. **The `68` arm-count string is not in the instrument** (grep count 0). The report must cite the *measured* `PASS held=68/68` from a receipt, not a source line; the only source line is `receipt-bind.mjs:686` (`held=${held}/${results.length}`). Citing "line 686 holds the string 68" would be a false provenance claim.
4. **The round-89 gate defects are already repaired but UNCOMMITTED** in the lane worktree (` M LOG.md`, ` M SCORECARD.md`). The round-90 close must commit them or the gate defect is inherited again at the next round open.
5. `proxy-check.mjs:561` needs **no** edit (path-only map); only `SCORECARD.md:338` carries a digest.
6. `SKILL.md` currently has **30** gate rows (`grep -cE '^\| [a-z0-9-]+ \| gate \|' SKILL.md` → 30) over **30 distinct gate files** (29 under `scripts/`, one under `.ufo/waves/round-71/probe/`), but the `SKILL.md:589` prose still says "Twenty-nine gate rows over twenty-eight gate files (round 87 adds `receipt-bind`)". The v4 bump does not add a gate, so the prose stays stale — flag it, do not silently renumber.
7. The probe's 47 arms = 41 literal `arm('…')` call sites + 6 loop-generated `dup-*` arms (`probe90-c1.mjs:626-627`), i.e. the eight K89-V1 classes are 6 duplicate arms + 2 parse twins.

## 9. Commands that matter (all read-only; lane untouched)

```
grep -rn 'receipt-bind' <lane> --include='*.md' --include='*.mjs' --include='*.json' --include='*.sh' -l
grep -n 'pin.receipt-bind' SCORECARD.md scripts/proxy-check.mjs scripts/counter-pins.mjs
grep -rn 'receipt-bind' .ufo/pins/*.json                       # exit 1
node scripts/round-gate.mjs --round 89                          # CLEAN in worktree; DRIFT at base (scratch clone)
git show 7218699c:SCORECARD.md | grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'   # 197
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md                    # 197
git show 7218699c:scripts/receipt-bind.mjs | grep -n 'CONTRACT\|v3 boundaries\|PASS held'
git show 7218699c:scripts/receipt-bind.mjs | grep -c '68'    # 0
sha256sum .ufo/waves/round-90/probe/probe90-c1.mjs            # 70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694
```

Scratch (`/fast/scratch/hyaku/kumitate-r90/K90Scout/`, incl. a read-only `git clone --shared` of the lane at base) removed before yielding. No lane file written by this seat; `git status` shows only the pre-existing ` M LOG.md`, ` M SCORECARD.md` and the untracked round-90 wave directories.
