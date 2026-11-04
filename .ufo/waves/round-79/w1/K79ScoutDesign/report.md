# K79ScoutDesign — C2 design recon: `report-receipt-diff` v4 (`POINTER_DEAD`)

Read-only seat. No lane bytes were edited, no git/jj state was touched; every write is under
`.ufo/waves/round-79/w1/K79ScoutDesign/` (this report + receipts) and scratch
`/fast/scratch/hyaku/kumitate-r79/K79ScoutDesign/` (removed before yield).

## 0. Pinned evidence and a moving target

The executor (`K79ExecRepairs`) was editing `scripts/report-receipt-diff.mjs` **while this recon ran**.
Three worktree snapshots of that file differ materially. Every v4 statement below is pinned:

| role | bytes | sha256 | receipt |
|---|---|---|---|
| v3 (committed) | `git show HEAD:scripts/report-receipt-diff.mjs`, lane HEAD `8a733ab0` (508 lines, contract line 4 = `…-v3`) | `23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927` | `v3-head.sha256`, `v3-on-r78.txt` |
| v4 (in-flight, 04:54:56−03:00) | worktree copy, 570 lines | `cd94e8aa96a61d7ee0fb9993e4a00e21d1348030880afbe8ed07b6b91195ca2e` | `v4-live2.sha256`, `v4-on-r78.txt`, `probe-live2.txt` |
| frozen counter | `.ufo/waves/round-79/probe/probe79-c2.mjs` @ `8a733ab0` (Amendment 2) | `00a0f15ff475e4696eec742dd2bc96b545c746f185bb985afbed6ad972594676` | `probe-live2.txt` |

Earlier snapshots (`82f9f347…`) accepted directories, symlinks and `..` tokens; those holes were closed
between 04:51 and 04:55. A reader re-deriving this report must re-hash the file first. The plan
(`.ufo/waves/round-79/plan.md`, `8a733ab0`) is authoritative: **Amendment 2** supersedes the
Amendment-1 after-state ("10 `POINTER_DEAD`, first `close/proxy-json.txt`") with **four non-receipt dead
pointers** and no double reporting.

## 1. v3 map — what exists at HEAD (`8a733ab0`)

### 1.1 Findings sink and the 12 existing ids

`const add = (id, detail) => findings.push({ id, detail });` — `report-receipt-diff.mjs:154`.
Add sites at HEAD: `PLACEHOLDER:158`; `SECTION_MISSING:160`; `SECTION_EMPTY:162`; `SECTION_ORDER:164`;
`SHONEN_COUNT:166,175`; `RECEIPT_MISSING:207,210,216,220`; `RECEIPT_EMPTY:211,217,221`;
`TALLY_UNRECEIPTED:242`; `TALLY_CHECKS_MISMATCH:244`; `HASH_FOREIGN:262`; `HASH_DEAD:263`;
`HASH_ORPHAN:264`. Twelve ids, one sink, output order = insertion order.

### 1.2 How receipt tokens are matched

- Full form — `:56`: ``const RECEIPT_PATH = (round) => new RegExp(`\\.ufo/waves/round-${round}/(?:base|close)/[A-Za-z0-9._*/-]*`, 'gi')``.
  **Unanchored**, so the path may sit anywhere in the text, and **not backtick-scoped**.
- Round-relative form — `:196`: ``const REL_RECEIPT = /(?<![\w./-])(?:base|close)\/[A-Za-z0-9._*/-]+/g;`` —
  case-sensitive; a bare `close/x.txt` is bound to `.ufo/waves/round-<N>/close/x.txt`.
- `cited()` `:198-202` unions both and normalises; `stripPunct` `:197` drops `[.,;:]`;
  `isPath` `:203` rejects `..`; `matchSpec` `:204` handles directory and glob citations.
- Receipt bodies come from `walkWorktreeReceipts` `:111-131` (worktree, `lstat().isFile()` only) or
  `git ls-tree -r -z <rev> -- .ufo/waves/round-N/{base,close}` `:183` + `git cat-file blob` `:188`,
  with `^(100\d{3}) blob` `:186` **excluding symlinks (120000) and gitlinks (160000)**.

Measured gap (`regex-map.txt`): the filed r78 report contains **157 backticked tokens in prose, 40
distinct pointer-shaped ones**; v3 looks at 12 (all receipt-shaped) and 28 are invisible to it, four of
which are dead. That is the whole of the capability gap.

### 1.3 Prose / fence handling

`unfence()` `:97-101` blanks fenced blocks (` ``` `/`~~~`, indentation allowed) and HTML comments while
keeping newlines; headings, sections, `SECTION_*`, `SHONEN_COUNT` run on that copy. Tallies alone run on
`scan()` `:78` / `claimLines()` `:87` (NFKC, confusable folding, digit folding), i.e. formatting is
neutralised for verdicts but fences are still text. Measured: the r78 report has **no fence-only
backticked tokens** (all ten Amendment-1 pointers occur in prose), so a prose-only pointer pass loses
nothing on the real report.

### 1.4 `--rev` resolution

CLI `:484-490`: `--rev` → `git rev-parse --verify <rev>^{commit}`; missing value, leading `-`, or an
unverifiable rev → `REPORT_RECEIPT: FAIL-CLOSED rev-unreadable …`, **exit 2**. Receipt bytes come from
the rev tree only; the worktree is used only when `--rev` is absent (`:180-193`).

### 1.5 Render and exit codes

`render()` `:269-273`: no findings → `REPORT_RECEIPT: CLEAN (…)` exit 0; otherwise
`REPORT_RECEIPT: DRIFT <ids> (<meta>)` plus one line per finding, exit 1. CLI `:505-507`. Usage
exit 64 (`:478-481`), fail-closed exit 2 (`:485,:487,:491,:495,:498`).

## 2. Where a `POINTER_DEAD` pass fits (v4 as it stands, `cd94e8aa`)

| what | line (v4 live2) |
|---|---|
| contract line → v4 | `:4` |
| `POINTER_DEAD` documented | `:21-22` |
| `POINTER_PATH`, `POINTER_SCHEME` | `:60`, `:61` |
| `diffReport({ … reportPath … })` | `:156` |
| receipt-relative suppression (`REL_SHAPED`) | `:231` |
| pointer set + extraction | `:232-236` |
| bases lane → report dir → round base | `:238-240` |
| rev tree (`git ls-tree -r --name-only -z`) | `:242-246` |
| resolution + `(escape)` + `POINTER_DEAD` | `:247-257` |
| CLI threads `reportPath: resolve(report)` | `:565` |
| selftest (125 → 144 cases) | `:311`, pointer cases `:512-530`, renamed `:480` |

Placement after the receipt loop (`:224-225`) and before the tally pass (`:259`) is correct: the pass needs
only `text`/`prose`, `lane`, `round`, `reportPath`, `rev`, and `RECEIPT_PATH`/`REL_RECEIPT` are already in
scope. **No importer of `diffReport` exists outside the round-64 build copies** (`grep -rn diffReport`
finds only `.ufo/waves/round-64/build/…` historical snapshots), so the added optional `reportPath`
parameter is safe.

## 3. Answers with evidence

### (a) What v3 resolves, and what it cannot

v3 resolves exactly two syntactic classes — `.ufo/waves/round-<N>/{base,close}/…` (`:56`) and a bare
`(base|close)/…` (`:196`) — and only against the round's `base`/`close` trees. It cannot resolve:
`corpus/knowledge/*.md`, `corpus/lessons/*.md`, `SOURCES.md`, `plan.md`, `probe/*`, `controls/*`,
`build/*`, `w1-results.json`, `SKILL.md`, `SCORECARD.md`, hashes, URLs, or any path with a `:line`
selector. Observed on the filed r78 report (`v3-on-r78.txt`, exit 1):

```
REPORT_RECEIPT: DRIFT RECEIPT_MISSING (round=78 rev=worktree bytes=11689 report_sha256=f690710edfac)
RECEIPT_MISSING .ufo/waves/round-78/close/proxy-json.txt
RECEIPT_MISSING .ufo/waves/round-78/close/omp-census-selftest.txt
RECEIPT_MISSING .ufo/waves/round-78/close/mutants-c2.txt
RECEIPT_MISSING .ufo/waves/round-78/close/proxy-selftest.txt
RECEIPT_MISSING .ufo/waves/round-78/close/census-selftest.txt
RECEIPT_MISSING .ufo/waves/round-78/close/proxy-check.txt
```

The four non-receipt dead pointers (`amended-plan-observed.md`, `SOURCES.md`,
`knowledge/kimi-plane-single-derivation.md`, `knowledge/shape-receipt-live-drift.md`) produce **nothing**
under v3 — that is the gap C2 closes.

### (b) Extraction grammar v4 needs

As implemented at `:60-61,232-236` and confirmed by `attack-live2.txt`:

1. **Scope**: single-backtick spans on one line, in the *prose* copy (`unfence`), i.e. fences and HTML
   comments are examples, not claims. `regex-map.txt` shows r78 loses nothing.
2. **Shape** (`POINTER_PATH` `:60`): ``^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\.(?:txt|json|jsonl|md|mjs|js|sh|py|html|tsv|csv|log)$``.
   - leading `./` works (`.` is a legal segment; verified: `` `./corpus/knowledge/a.md` `` → CLEAN);
   - leading `/`, `~`, `<`, `$`, `*`, whitespace, `(`, `)`, `=`, `…` cannot match — this is what excludes
     commands (`node probe.mjs <lane>`), formulas (`K_sections/K_members`), globs (`.ufo/pins/*`),
     hashes and prose words;
   - **absolute paths are not pointers** (no evidence pointer can be a host path).
3. **Selector strip** (`:235`): ``.replace(/:\d+(?:-\d+)?$/, '')`` — `x.md:12` and `x.md:949-950` resolve
   as `x.md`; a dead token reports the stripped path; `x.md:1:2` is not a selector and stays
   non-pointer (asserted by the `pointer-exact-grammar` selftest case `:530`).
4. **Scheme skip** (`:61`): `https?|agent|skill|xd|proc|local|artifact|history|issue|pr|mcp|ssh` with
   `://`. Verified `https://example.com/x.md` is not counted (`attack-live2.txt`; probe arm
   `url-ignored`).
5. **Receipt-shaped tokens are not pointers** (`:236`): `RECEIPT_PATH(round)` for the full form and
   `REL_SHAPED` `:231` for `(base|close)/…` — see (d).
6. **Dedupe/order**: `pointers` is a `Set` of selector-stripped refs (`:232`), so repeated mentions and
   different selectors of the same path yield one finding, in first-mention (document) order.

### (c) Resolution bases and precedence

`:238-240` — `pointerBases = [resolve(lane), dirname(resolve(reportPath)), resolve(lane, '.ufo/waves/round-N')]`,
evaluated with `.some()` (`:248`), so **lane root wins, then the report's own directory, then the round
directory**. There is no output record of *which* base matched; precedence is observable only through
which token resolves, so the Amendment-1 requirement "the resolution record names the round base" is not
(and, after Amendment 2, need not be) satisfied — arm 5 only requires `REPORT_RECEIPT: CLEAN`.

- Worktree mode: `lstatSync(path).isFile()` (`:255`) — a directory, symlink, special file or missing path
  is dead; `..` segments are dead before any filesystem call (`:251,:257`, detail `… (escape)`).
- `--rev` mode (`:242-246,:253`): membership only in `git ls-tree -r --name-only -z <rev>` names, mapped
  back with `relative(resolve(lane), resolve(base, ref))`; **no worktree fallback**. A report directory
  outside the lane therefore contributes no rev path (its `relative` starts with `..`), which is right.

### (d) How a receipt-shaped token avoids a double report

Two suppressions, both evaluated on the selector-stripped ref:

- full form for **this** round (`.ufo/waves/round-N/{base,close}/…`) → `RECEIPT_PATH(round)` `:236`;
- round-relative `base/…` or `close/…` → `REL_SHAPED` `:231` (`^(?:base|close)\/[A-Za-z0-9._*/-]+$`).

The v3 receipt pass remains the only reporter for those tokens: `RECEIPT_MISSING` when absent,
`RECEIPT_EMPTY` when blank, nothing when present. Measured on r78 (`v4-on-r78.txt`): the same six
`RECEIPT_MISSING` lines v3 emits, unchanged and in the same order, plus four `POINTER_DEAD` lines; no
token carries both ids. Probe arm `receipt-no-duplicate` and selftest
`pointer-receipt-shaped-not-duplicated` `:518` / `pointer-receipt-no-duplicate` `:527` hold this.

*Tension resolved by Amendment 2.* Amendment 1's prose ("with **10** `POINTER_DEAD` lines, first
`close/proxy-json.txt`") and its no-double-report rule cannot both hold: the six relative `close/…`
tokens are bound by `REL_RECEIPT` at v3 `:196`. Amendment 2 (`8a733ab0`) picked no-double-report and
re-cut arm 2 to the four non-receipt pointers; the frozen probe now asserts that
(`probe79-c2.mjs:114-127`). Anyone re-deriving the after-state from Amendment 1 alone will read the
wrong number.

### (e) Three lazy v4s that pass the frozen arms without resolving

1. **A literal table of the probe's own fixtures.** The probe is public and frozen; its tokens are fixed
   (`corpus/knowledge/a.md`, `…/dead.md`, `close/x.txt`, `scripts/proxy-check.mjs`,
   `corpus/knowledge/report-evidence-pointers.md`, `.ufo/waves/round-79/close/absent.txt`), and arm 2's
   wanted lines are two fixed strings (`probe79-c2.mjs:121`). An implementation that returns `dead` for
   exactly `{corpus/knowledge/dead.md, amended-plan-observed.md, SOURCES.md, knowledge/*-…}` and clean
   otherwise passes all 12 arms. Teeth: an **unseen** fixture (the probe cannot be changed now), e.g. my
   `base-bases.txt` fixture, plus a source grep for probe fixture literals.
2. **A worktree fallback under `--rev`.** Arm 7 asserts `corpus/knowledge/report-evidence-pointers.md` is
   dead at `BASE_REV` — but that note is currently absent from the worktree too
   (`git cat-file -e 5019803b:corpus/knowledge/report-evidence-pointers.md` → 128; `ls` → ENOENT), so
   resolving the worktree first is indistinguishable today. Proved with a mutant
   (`v4-wt-fallback.mjs`, one line: `existsSync(path) || tree membership`): **12/12 today**
   (`probe-mutant-wt-fallback.txt`), **10/12 once the note exists** in the worktree
   (`probe-note-v4-wt-fallback.txt`: `arm rev-mode FAIL exit=0 dead=`), where the honest build still reads
   12/12 (`probe-note-v4-inflight.txt`). Arm 7 is therefore **order-dependent**: it only bites after the
   scribe lands the note. Until then, the only teeth are the author's own selftest case
   `pointer-rev-no-worktree-fallback` `:526`.
3. **Lane-root-only resolution (round base dropped).** Arm `round-scoped` cites `close/x.txt`, which is
   receipt-shaped and satisfied by the *receipt* pass, so a v4 with no round base still reads
   `REPORT_RECEIPT: CLEAN` there. Proved with the mutant `v4-lane-only.mjs` (round base removed):
   **12/12 on the probe** (`probe-mutant-lane-only.txt`), while my independent fixture — a report citing
   `probe/p79.json` where only `<lane>/.ufo/waves/round-79/probe/p79.json` exists — reads
   `POINTER_DEAD probe/p79.json` on the mutant and `CLEAN` on the honest build (`base-bases.txt`).

Bonus (a fourth, now closed): resolution by bare `existsSync` accepted **directories, symlinks and `..`
escapes** — the `82f9f347` snapshot passed all 12 arms with those holes. Current bytes use
`lstatSync().isFile()` and an explicit `..` guard, and my attack fixtures read dead (`attack-live2.txt`).

### (f) No second method: do `cite-check.mjs` / `claims-check.mjs` already resolve report pointers?

**No.** Receipt `grep-cite-check.txt`.

- `scripts/cite-check.mjs:3-6` — *"mechanical citation re-verifier for the kumitate-shokunin docs.
  Re-resolves every path / line / symbol / pin citation written in `SKILL.md` and `corpus/**/*.md`
  against the live trees."* `listDocs()` `:311-318` collects exactly `SKILL.md` + `corpus/**/*.md`; the
  CLI (`USAGE`, `:227-236`) offers `--src --self --fleet --json --strict --symbols --all --selftest
  --integrations` and **no `--report`** (`grep -n -- '--report' scripts/cite-check.mjs` → no match). Its
  only pointer into the reports tree is the fleet-doc fallback `findFleetDoc()` `:861-871`
  (`.ufo/reports/**` searched for a *doc name cited by a doc*), not a report reader.
- `scripts/claims-check.mjs:3-16` — the member-claims gate: re-derives the `SCORECARD.md` registry and
  resolves each row's `<pathish>` under `--src` (`:45`, resolver `makeResolver` `:260`); CLI `:1316-1320`
  has `--self/--src` only, no `--report`. Its `grep -n '\breport'` hits are prose ("reported, never
  double-reported", SCORECARD row wording), not a report input.

So `report-receipt-diff` is the one report gate, and v4 is the right place for the capability.

## 4. The r78 report, measured

| instrument | verdict |
|---|---|
| v3 @ HEAD (`v3-on-r78.txt`) | exit 1, ids `RECEIPT_MISSING`, 6 lines (above) |
| v4 @ `cd94e8aa` (`v4-on-r78.txt`) | exit 1, ids `RECEIPT_MISSING,POINTER_DEAD`; same 6 receipt lines + 4 pointer lines: `amended-plan-observed.md`, `SOURCES.md`, `knowledge/shape-receipt-live-drift.md`, `knowledge/kimi-plane-single-derivation.md` |
| frozen probe, v4 (`probe-live2.txt`) | `C79_C2: HELD held=12/12`, exit 0; selftest arm `PASS (144/144)` |
| frozen probe, v3 (`probe-base-v3.txt`) | `HELD held=9/12`, exit 1 — fails `r78-pointers`, `fixture-missing`, `rev-mode` |

The four dead pointers are exactly Amendment 2's list, so the claim's after-state is reachable on real
bytes, and the base control is red.

## 5. Residual defects found in the current v4 bytes (not arm-covered)

1. **`--rev` accepts a symlink as a resolved pointer.** Worktree mode rejects it (`lstatSync().isFile()`),
   rev mode counts any `ls-tree -r --name-only` entry, and `--name-only` lists mode `120000`. Measured
   (`revlink.txt`): same fixture, same token — `worktree … POINTER_DEAD link.md` vs
   `rev … REPORT_RECEIPT: CLEAN`; `git ls-tree` shows `120000 blob … link.md`. v3's receipt pass excludes
   symlinks by matching `^(100\d{3}) blob` (`:186`); the pointer pass in rev mode should read
   `git ls-tree -r -z <rev>` and keep only `100xxx` blobs (same one-line shape, also excludes gitlinks).
   Header text `:21-22` claims "absent from the lane … `--rev` checks only membership", which is true but
   inconsistent with the worktree's own rule.
2. **The extension allow-list is narrow and undocumented.** `deploy/a.yaml`, `a.yml`, `cfg/a.toml`,
   `patch/a.diff`, `shots/a.png` are all invisible (`attack-live2.txt`), yet the header describes the
   finding as covering "a backticked repo-path pointer" without a limit. Either extend the list
   (`yaml|yml|toml|ini|diff|patch|ndjson|receipt|png|gif|pdf|svg`) or add an explicit "Declared limit"
   line, as v3 does for its own residual list (`:32-37`).
3. **Receipt-relative suppression is wider than the receipt pass's own binding.** `REL_SHAPED` (`:231`) is
   case-sensitive and anchored, so a report-relative `close/notes.txt` that means a sibling directory of
   the report is silently skipped, while v3's `REL_RECEIPT` (case-sensitive too, `:196`) still claims it
   against `.ufo/waves/round-N/close/notes.txt` and can emit a `RECEIPT_MISSING` for a file the author
   never meant as a receipt. Pre-existing v3 behaviour, inherited (not introduced) by v4; worth a declared
   limit, no arm covers it.
4. `throw new Error('pointer tree unreadable: <rev>')` on `ls-tree` failure would escape as a node stack
   trace instead of the file's `FAIL-CLOSED … exit 2` contract. Unreachable through the CLI today (the
   rev is verified at `:547-550`), reachable through the exported `diffReport`. Cheap to return a finding
   or let the caller map it.

None of 1–4 blocks the 12 frozen arms; they are the difference between "passes the counter" and "the
capability the report claims".

## 6. Landing checklist for the C2 executor

- [x] Constant + selector + scheme + receipt suppression at `:60-61,231-236`; bases `:238-240`; rev
      membership `:242-246`; `..`/isFile/escape `:251-257`; `reportPath` threaded at `:156,:565`.
- [x] `POINTER_DEAD` documented in the header contract (`:4,:21-22`).
- [x] Selftest 144/144 ≥ 125 (`selftest-live2.txt`), including selector dedupe, scheme skip, all three
      bases, rev no-fallback, receipt no-duplicate, prose-only.
- [ ] Fix rev symlink/gitlink acceptance (defect 1) — `ls-tree -r -z` + mode filter.
- [ ] Declare or extend the extension allow-list (defect 2); declare the receipt-relative limit
      (defect 3).
- [ ] Run the frozen probe **after** `corpus/knowledge/report-evidence-pointers.md` lands, so arm 7 is
      not read off a blind state (see (e)2).
- [ ] Do not commit `report-receipt-diff.mjs` until `node scripts/report-receipt-diff.mjs --selftest`
      reads PASS on the committed bytes; `proxy-check` pins the file by key only
      (`scripts/proxy-check.mjs:562`, `pin.report-receipt-diff`) — no content re-pin is needed.

## 7. Remaining unknowns

- The live file may have moved past `cd94e8aa` while this report was written; I did not re-run after
  04:54:56. The probe was run against a scratch clone carrying the snapshot, never against the dirty
  live worktree.
- I did not verify `receipt-no-duplicate` against a **rev-mode** receipt citation; the code path is shared
  (`RECEIPT_PATH` runs before the rev branch), so it is [INFERENCE], not measured.
- Amendment 2's base control claims `ids=RECEIPT_MISSING,HASH_DEAD`; my v3 run over the lane worktree
  reads `RECEIPT_MISSING` only. The difference is the control's `git archive` (no `.git`, so hash
  resolution fails) — [INFERENCE]; the control receipt itself is pre-data and not re-derived here.

## 8. Tooling / scratch disclosure

No tool was installed or upgraded (pacman is paused; nothing was needed). Scratch root
`/fast/scratch/hyaku/kumitate-r79/K79ScoutDesign/` held the clone, snapshots, fixtures and receipts and
was deleted before yield; all receipts were copied into this report directory first.
