# K85ExecPins — integration accounting for `counter-receipt` v2 (round 85)

Seat: executor (accounting + receipts). Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Measured revisions: freeze `9db0c6b5eb9111cfc5581006ba976ca2cd112792` (lane HEAD at measurement),
repair `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`, base `a5d3e7549501ae76dbd86a6f81c5e858f1f92446`.
**No production file was edited, no gate was run on the shared tree, no commit/push, no installs.**
Every gate reading below was taken in an isolated `git archive` of the named revision under
`/fast/scratch/hyaku/kumitate-r85/K85ExecPins/` (scratch deleted after the receipts were copied).
Receipt index with commands/exits: §Receipts.

The frozen predicate is untouched: this seat judges its own contract only through the accounting below.

---

## 0. Headline measurements (frozen tree)

| term | declared `SCORECARD.md` | computed @ `9db0c6b` | state |
|---|---|---|---|
| A | `:294` = **908** | **913** (`+5`) | `A_DRIFT`, exit 1 |
| C | `:295` = **44** | **44** | match |
| C2 / C2_total | `:298`/`:299` = 214 / 214 | 214 / 214 | match |
| operability (derived) | `## Axes` row = 9 | `floor(10×957/960)` = **9** | match |
| `pin.counter-receipt` | `:354` = `190a4c1f…` | `190a4c1f…` | match |
| v1 pins | 6 keys | `pins=6 match` | match |

Commands (all at `9db0c6b`, outputs verbatim in `build/K85ExecPins/receipts/counts-frozen.txt`):

```
git ls-tree -r --name-only 9db0c6b5eb9111cfc5581006ba976ca2cd112792 | grep -E '\.(mjs|js|sh|py)$' | wc -l   # 913
git show 9db0c6b5eb9111cfc5581006ba976ca2cd112792:SKILL.md | grep -c '^\s*- \['                              # 44
git show 9db0c6b5eb9111cfc5581006ba976ca2cd112792:corpus/README.md | grep -cE '^\| `(knowledge|lessons)/'   # 214
git ls-tree -r --name-only 9db0c6b5eb9111cfc5581006ba976ca2cd112792 -- corpus/knowledge corpus/lessons | grep -c '\.md$'  # 214
git show 9db0c6b5eb9111cfc5581006ba976ca2cd112792:scripts/counter-receipt.mjs | sha256sum                    # 190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0
```

`A` is the proxy's own walk, not a shell heuristic: `RE_RUNNABLE` (`scripts/proxy-check.mjs:601`) over
`walkFiles(self)` (`:758-780`, prunes only `.git`, `lstat`-type files, no ignore list) — `deriveTerms`
`:977-979`. Composition at `9db0c6b`: **35** under `scripts/` + **878** under `.ufo/` = 913.

---

## 1. Findings

### F1 (high, attributable to the freeze commit) — the frozen tree reads `A_DRIFT`, exit 1

```
$ node scripts/proxy-check.mjs --strict          # archive of 9db0c6b, --src = pin clone 31c465f1
PROXY  error  A_DRIFT  A: declared=908 computed=913 delta=+5
PROXY: DRIFT (A_DRIFT term=A declared=908 computed=913 delta=+5; src-rev=31c465f15669; source=snapshot)
exit=1
```

- The repair commit is green: same command in an archive of `6663b3b` →
  `PROXY: MATCH (A=908 C=44 operability=9; … C2=214/214 …; pins=6 match; src-rev=31c465f15669; source=snapshot)`, exit 0.
  `plan.md:7` therefore holds for `6663b3b`, **not** for the freeze.
- Cause is exactly the five runnable files the freeze commit added under `.ufo/waves/round-85/`
  (`build/K85ExecPins/receipts/a-delta.txt`): `probe/probe85-c1.mjs`, `controls/content-variation.mjs`,
  and the three control tool copies `controls/{base,noreader,stub}/scripts/counter-receipt.mjs`.
  The control `.txt` receipts are not runnable and do not count.
  `git show --stat 9db0c6b` shows `SCORECARD.md` was **not** touched by the freeze, so `A=908` is the
  pre-freeze declaration.
- This is the known `A` class (`SCORECARD.md:403-407`, Q26: `A` counts every runnable file in the lane
  tree "including throwaway round probes"), and the plan deliberately did **not** re-baseline it
  (`plan.md:94-96`: the exclusion is pre-registered for round 86, `SCORECARD.md:4059-4070`).
  It is **not** a C1 defect: the frozen predicate runs only `scripts/counter-receipt.mjs`, and the five
  files are probe/control fixtures for that predicate.
- Consequence for L1: at the integration/close tip `A` **must be re-derived and the stanza updated with a
  receipt** (a measured re-baseline, `SCORECARD.md:294`), or the close discloses `PROXY: DRIFT (A_DRIFT …)`.
  The round-86 amendment command in `SCORECARD.md` (`git ls-tree … | grep -v '^\.ufo/' | wc -l` → 35) may
  not be applied as an in-place exclusion this round.

### F2 (medium, inherited) — `README_MAP` is red at the frozen tree

```
$ node scripts/readme-map.mjs
README_MAP: DRIFT files=214 rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md
exit=1
```

The repair commit added the `corpus/README.md` row for `corpus/lessons/round-84-verifier-spotcheck.md`
(C2 214) but not the second half the gate requires, `.ufo/pins/readme-map.json` `covered`
(`covered=213`; the missing member is that note). Rule: `scripts/readme-map.mjs:48-57` (`unpinned:<path>`).
`pin.readme-map` (`SCORECARD.md:340`) hashes the *script*, so the pin still matches — the gate verdict is
red independently. Not caused by the v2 edit; it is the eleventh instance the `spotcheck-adopt` row exists
for. Any new corpus note this round adds a second `unpinned` file unless **both** halves land
(README row + `covered` entry).

### F3 (accounting hazard) — `A` is worktree-live while the wave writes

`A` walks the working tree, not a revision. During this seat's measurement the lane had **17 untracked**
runnable files under `.ufo/waves/round-85/build/K85{ExecFixture,ExecHistory,Mutation}/` (the mutation
battery's tool copies), and the count was still rising. Mid-wave `A` therefore reads 913 + (uncommitted
runnable files) and is not a stable measurement; only a committed tip (or a `git archive` of it) is.
Do not "correct" A from a mid-wave reading.

---

## 2. (1) Pins whose file the v2 edit touches — and only those

`kumitate-gate-pins-v1` holds 29 keys (`SCORECARD.md:325-355`), `kumitate-proxy-v1` holds 6
(`:318-323`); 35 pin lines total. The v2 contract edits exactly one file, `scripts/counter-receipt.mjs`.

| pin key | file | stanza line | map line | recompute command | at `9db0c6b` |
|---|---|---|---|---|---|
| `pin.counter-receipt` | `scripts/counter-receipt.mjs` | `SCORECARD.md:354` | `scripts/proxy-check.mjs:576` | `sha256sum scripts/counter-receipt.mjs` | `190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0` (matches) |
| `pin.proxy-check` (v1) | `scripts/proxy-check.mjs` | `:321` | `:541` | `sha256sum scripts/proxy-check.mjs` | unchanged **unless** the proxy source is edited |
| `pin.counter-pins` | `scripts/counter-pins.mjs` | `:337` | `:559` | `sha256sum scripts/counter-pins.mjs` | unchanged unless that script is edited |
| `pin.readme-map` | `scripts/readme-map.mjs` | `:340` | `:562` | `sha256sum scripts/readme-map.mjs` | unchanged unless that script is edited |

- The proxy never rewrites its own stanza (`scripts/proxy-check.mjs:214`), so the new hash is pasted by hand
  at `SCORECARD.md:354` **in the same commit as the new tool bytes**.
- Missed re-pin is an `error`-severity finding even without `--strict`:
  `PROXY  error  GATE_PIN_DRIFT  pin.counter-receipt: declared=190a4c1f… computed=<new>`
  (`compareGatePins`, `scripts/proxy-check.mjs:1165-1183`, detail at `:1178`), exit 1.
- `.ufo/pins/counter-pins.json` does **not** bind this tool (45 entries, zero paths/names containing
  `counter`); `node scripts/counter-pins.mjs` → `COUNTER_PINS: CLEAN pins=45`, exit 0. No registry edit is
  required, and editing the registry would not move any pin hash.
- **Do not add a new `scripts/*.mjs`.** An unpinned `scripts/*.mjs` is `PIN_UNPINNED` (warn;
  `scripts/proxy-check.mjs:1184-1200`) which `--strict` promotes to exit 1 (`summarize`, `:1245-1250`);
  pinning it would require editing `proxy-check.mjs`'s `GATE_PINS` map (`:547-577`) and therefore
  re-pinning `pin.proxy-check`. Implement v2 in place.

---

## 3. (2) Stanza keys the edit can move, with the counting command for each

| key | `SCORECARD.md` | declared | @ `9db0c6b` | counting command | moves when |
|---|---|---|---|---|---|
| `A` | `:294` | 908 | **913** | `git ls-tree -r --name-only <rev> \| grep -E '\.(mjs\|js\|sh\|py)$' \| wc -l` | **any** committed runnable file, anywhere: `scripts/`, `.ufo/waves/<N>/{probe,controls,build}/**` |
| `C` | `:295` | 44 | 44 | `grep -c '^\s*- \[' SKILL.md` (GNU `\s`; equivalently `grep -cE '^[[:space:]]*- \['`) | a `- [` line added/removed in `SKILL.md`; rewriting item `:760` in place keeps 44 |
| `C2` | `:298` | 214 | 214 | ``git show <rev>:corpus/README.md \| grep -cE '^\| `(knowledge\|lessons)/'`` | a new README map row |
| `C2_total` | `:299` | 214 | 214 | `git ls-tree -r --name-only <rev> -- corpus/knowledge corpus/lessons \| grep -c '\.md$'` | a new note under `corpus/knowledge` or `corpus/lessons` |
| `pin.counter-receipt` | `:354` | `190a4c1f…` | `190a4c1f…` | `sha256sum scripts/counter-receipt.mjs` | any byte change to the tool (**the v2 edit**) |
| operability (derived) | `## Axes` `:366` | 9 | 9 | `node -e "console.log(Math.floor(10*((A+C)/(A+C+3))))"` | only if `A+C < 27` — unreachable here (957/960 ⇒ 9) |

- The v2 edit alone moves exactly **one** stanza value: `pin.counter-receipt`. `A` moves only if the
  integration commit adds runnable files (seat `build/` copies count; `C2`/`C2_total` move only if corpus
  notes/rows are added).
- **Term-neutral surfaces (do not re-baseline for them):** `corpus/QUALITY.md` Q78 appends after `:1307`
  and moves no proxy term — no gate reads `QUALITY.md` (`grep -rln 'QUALITY.md' scripts/` is empty) — but
  `scripts/cite-check.mjs:314-316` scans all of `corpus/**/*.md`, so Q78 can move cite-check counts only.
  Likewise `corpus/SOURCES.md` rows S245/S246 are outside `A` (not runnable), `C` (`SKILL.md` only),
  `C1` (SCORECARD `| S### |`/`| R### |` rows only, `:603`), `C2` (README rows) and `C2_total`
  (`knowledge`/`lessons` `.md` only, `listCorpusNotes`, `:771-781`).
- `S_members/S_sections/R_*/C1k/K_*/O_*` come from the origin tree, the scorecard and the kimi/omp roots;
  the lane's own tool bytes cannot move them.

---

## 4. (3) `SKILL.md` rows and checklist items naming the v1 contract

Two lines exist (case-insensitive `grep -in 'counter.receipt' SKILL.md`; nothing else matches):

1. `SKILL.md:607` — gate-registry row, quoted verbatim:

   > `| counter-receipt | gate | `node scripts/counter-receipt.mjs --receipt FILE` → `COUNTER_RECEIPT: CLEAN` (0 clean), `DRIFT` (1 failed), `FAIL-CLOSED` (2 could-not-evaluate), `USAGE` (64 could-not-evaluate); `kumitate-counter-receipt-v1` reconciles one arm-form counter transcript's denominator, unique names, prefix, ok/FAIL counts, verdict and ordering; never executes receipt bytes; read-only input, owner kumitate L1 | `node scripts/counter-receipt.mjs --selftest --work DIR` — self-invocation CLI fixtures assert exit + finding; writes only explicit scratch, removed on exit | `SCORECARD.md` `kumitate-gate-pins-v1` `pin.counter-receipt`; `corpus/knowledge/counter-transcript-reconciliation.md`; Q77 |`

2. `SKILL.md:760` — the round-84 checklist item (the `C`-counted line, quoted verbatim):

   > `- [ ] Counter-receipt reconciliation (round 84; grammar and limits in `corpus/knowledge/counter-transcript-reconciliation.md`; actual task judges the unchanged r83 red and repair receipts) — `node scripts/counter-receipt.mjs --selftest` → exit 0 + `COUNTER_RECEIPT_SELFTEST: PASS``

Both must be rewritten **in place** when the contract becomes v2 (`--receipt FILE [--src COUNTER.mjs]`,
`RECEIPT:`/`SOURCE:` lines, the stated precedence, exit 64 `USAGE`): in-place keeps `C=44`; a new item
would move `C` 44 → 45 and force `SCORECARD.md:295`.

`SKILL.md:760` is executed, not prose: `surface-probe --checklists` parses
`^\s*- \[ \] <label> — `<command>` → exit <n> + `<expected substring>$`
(`scripts/surface-probe.mjs:17-28`; unparsable item = `CHECKLIST_GRAMMAR`, counted failed, `:1058`).
Keep the label/backticked-command/`→ exit 0 + \`…\`` shape and a substring the v2 selftest actually prints
(v1's summary is `COUNTER_RECEIPT_SELFTEST: PASS held=n/n`, `scripts/counter-receipt.mjs:121`, so
`COUNTER_RECEIPT_SELFTEST: PASS` survives either headline form). The tool is not hardcoded in
`surface-probe.mjs` (`grep 'counter-receipt' scripts/` → only `counter-receipt.mjs` and
`proxy-check.mjs:576`).

---

## 5. (4) Every lane surface that consumes `counter-receipt`

| surface | file:line | role |
|---|---|---|
| gate pin | `scripts/proxy-check.mjs:576` | hashes `scripts/counter-receipt.mjs`; `GATE_PIN_DRIFT` on drift |
| frozen predicate | `.ufo/waves/round-85/probe/probe85-c1.mjs:23` | `join(lane,'scripts','counter-receipt.mjs')`, 20 arms |
| same-path control | `.ufo/waves/round-85/controls/content-variation.mjs:25` | 3-arm content-variation control |
| gate registry | `SKILL.md:607` | declares the gate row and the v1 contract name |
| checklist item | `SKILL.md:760` | `--selftest` assertion, executed by `surface-probe --checklists` |
| contract note | `corpus/knowledge/counter-transcript-reconciliation.md:3,18` | v1 grammar/limits; `recheck:` command at `:3` |
| corpus map row | `corpus/README.md:341` | maps that note (`C2`) |
| quality rule | `corpus/QUALITY.md:1287` (command block `:1296`) | Q77 cites `--receipt FILE` |

Non-consumers verified: `grep -rn 'counter-receipt' scripts/` returns only the tool itself and
`proxy-check.mjs:576`; `grep -rn 'counter-receipt' .ufo/pins/` returns nothing; the `counter-pins`
registry has no entry for it. The three `.ufo/waves/round-85/controls/*/scripts/counter-receipt.mjs`
copies are fixtures, not consumers.

---

## 6. Integration sequence L1 can run as-is

1. Land v2 bytes **in place** at `scripts/counter-receipt.mjs` (no new `scripts/*.mjs`).
2. `sha256sum scripts/counter-receipt.mjs` → replace `SCORECARD.md:354` in the same commit.
3. Re-derive `A` at the integration tip:
   `git ls-tree -r --name-only <tip> | grep -E '\.(mjs|js|sh|py)$' | wc -l`.
   Expected ≥ 913 (every committed seat `build/**.mjs` adds one). If it is not 908, update
   `SCORECARD.md:294` to the measured value **with a receipt** and disclose it; the `.ufo/` exclusion is
   pre-registered for round 86 only (`SCORECARD.md:4059-4070`).
4. `grep -c '^\s*- \[' SKILL.md` → 44 if `:760`/`:607` are rewritten in place; update `SCORECARD.md:295`
   only if it moved.
5. Only if a corpus note/row is committed: update `:298`/`:299`, add the README row **and** the
   `.ufo/pins/readme-map.json` `covered` entry (F2 shows the half-adopt failure mode).
6. `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`; `node scripts/counter-pins.mjs` →
   `COUNTER_PINS: CLEAN pins=45`; `node scripts/readme-map.mjs` → `README_MAP: CLEAN` only after F2's
   missing `covered` entry lands (today it reads the DRIFT line above).
7. Run the frozen predicate once at the integrated tree:
   `node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <lane> --work /fast/scratch/hyaku/kumitate-r85/L1/probe`.

---

## 7. Risks / blockers (no contract bug found; no shortcut taken)

- **F1 is a disclosure obligation, not a probe failure.** Any close that prints `PROXY: MATCH` must first
  re-declare `A` at the measured tip; otherwise the verdict is `DRIFT (A_DRIFT…)`. Fitting `A` by adding a
  `.ufo` exclusion is the pre-registered round-86 change and may not be used now.
- **Re-pin atomicity.** Tool bytes and `SCORECARD.md:354` must land together; otherwise `GATE_PIN_DRIFT`
  (error, exit 1) fires even in default mode.
- **F2 must be disclosed, not attributed to v2**: `README_MAP: DRIFT … first=unpinned:lessons/round-84-verifier-spotcheck.md`
  already holds at `9db0c6b`. Repair needs both halves.
- **F3**: do not measure `A`/run the proxy while the wave's untracked `build/**/*.mjs` files exist; use a
  committed tip or `git archive`.
- **Unverified by this seat (by contract):** the probe's own score, the v2 implementation's semantics, and
  any live OMP/kimi drift beyond the pin `src-rev=31c465f15669` recorded above. No blocker was hit: the
  origin pin clone, `~/.kimi-code` and `~/.omp/agent` were all readable, so the proxy recompute was complete.

---

## 8. Receipts (durable copies in `build/K85ExecPins/receipts/`)

| file | command (revision) | exit |
|---|---|---|
| `proxy-frozen-strict.txt` | `node scripts/proxy-check.mjs --strict` in `git archive 9db0c6b…` (pin src `31c465f15669`) | 1 (`A_DRIFT 908/913`) |
| `proxy-frozen-strict.json` | same, `--strict --json` (terms: A 913, C 44, C1 19/19, C2 214/214, S 88/88, R 92/92, K 55/55, pins 6/6, errors 1, warnings 0) | 1 |
| `proxy-repair-strict.txt` | `node scripts/proxy-check.mjs --strict` in `git archive 6663b3b…` | 0 (`PROXY: MATCH`) |
| `readme-map-frozen.txt` | `node scripts/readme-map.mjs` in `git archive 9db0c6b…` | 1 (`unpinned:lessons/round-84-verifier-spotcheck.md`) |
| `counter-pins-frozen.txt` | `node scripts/counter-pins.mjs` in `git archive 9db0c6b…` | 0 (`CLEAN pins=45`) |
| `counts-frozen.txt` | the A/C/C2/C2_total/pin commands of §0 | — |
| `a-delta.txt` | `git diff --name-status a5d3e754… 9db0c6b…` filtered to runnable extensions (the 5 files behind `+5`) | — |

No installs or upgrades were performed; no tool version changed. Scratch
`/fast/scratch/hyaku/kumitate-r85/K85ExecPins/` was removed after the copies above; all other
`/fast/scratch/hyaku/kumitate-r85/*` directories belong to sibling seats and were not touched.
