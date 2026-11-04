# K82ScoutReconC2 — consumers of `OMP_SHAPE_COMPARE` and receipt-age exposure

Read-only recon at the round-82 work revision (worktree on `63b12695` + sibling edits: `M SKILL.md`,
`M corpus/QUALITY.md`, `M scripts/ready-handoff.mjs` were already present when I started; I touched
none of them). **SKILL.md line numbers are as read at 10:58Z**; between that read and this write a
sibling (uncommitted) inserted a round-82 compare-age checklist item, moving the round-81 age item
756→757, and added `--max-age DAYS` to the registry row at 617. Table row 3 below states both states.
Nothing in the lane was written except this file. Scratch
`/fast/scratch/hyaku/kumitate-r82/K82ScoutReconC2/` was created for three fixture copies and removed
(`rm -rf` returned 0, `ls` then ENOENT). No tool was installed or upgraded.

## 0. The line today (producer)

`scripts/omp-census.mjs:309` emits, and `:257` builds the stamp:

```
OMP_SHAPE_COMPARE: IN_SYNC|DRIFT entries=<live> receipt=<n> added=<a> removed=<r> changed=<c>
  [first=<name>] transient=<t> receipt_captured=<YYYY-MM-DD|absent> age_days=<n|absent>
```

Measured (`node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json`, exit 0):

```
OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-11-04 age_days=0
```

Gate lines on the same prefix (`:260`, `:264`, `:268`):

```
OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=<n>   exit 2
OMP_SHAPE_COMPARE: SHAPE_CLOCK age_days=<negative> max_age=<n>             exit 2
OMP_SHAPE_COMPARE: SHAPE_STALE_RECEIPT entries=<n> age_days=<n> max_age=<n> exit 1
```

Round-82 diff (`git show 63b12695 -- scripts/omp-census.mjs`) is exactly: `compareShape` gains
`maxAge`, the stamp, the three gates; `USAGE` gains `--compare … [--max-age DAYS]` (`:414`);
`parseArgs` relaxes `--max-age` to shape-or-compare; `main` passes `parsed.maxAge` (`:965`); seven
selftest arms added: six `check()` cases at `:810-825` (age disclosed, backdated 45-day, stale gate,
passing gate, v1-absent, v1-gated) plus the CLI-dispatch case at `:827-836`. No other script in the lane shells
`omp-census --compare` (`grep -rn "omp-census" scripts/*.mjs` → only `omp-census.mjs` itself and
`proxy-check.mjs:331`, which imports `shapeFromFile` for the *entries*, not the line).

## 1. Consumer table

| # | Consumer (path:line) | Parsing style | Reads the compare line? | Breaks on an appended field? |
|---|---|---|---|---|
| 1 | `scripts/omp-census.mjs:309` | producer (`io.out` template) | emits | n/a |
| 2 | `scripts/omp-census.mjs:757,808,810-825,847,853,857,865,889` | `check(..., {has:[...],lacks:[...]})` → `includes()` per needle + exact exit | yes (selftest) | **no** — `:808`'s needle ends at `changed=0`, a substring today and after the suffix |
| 3 | `SKILL.md:754` (live comparison) executed by `scripts/surface-probe.mjs:1070-1072` | SKILL GFM task grammar (`surface-probe.mjs:21-23`): `"<command>" → exit N + "<substring>"`; match is `output.includes(item.expect)` + exit ∈ set | yes | **no** — substring `OMP_SHAPE_COMPARE: IN_SYNC`, expected exit 0. Row's own prose still says "contract `kumitate-omp-shape-v1` receipt" (stale label, not a parser) |
| 3b | `SKILL.md:756` (round-82 compare-age item, worktree, uncommitted) | same runner; command is `--selftest`, expected exit 0 + `VERDICT: PASS` | no verdict-line text; exit only | **no** |
| 3c | `SKILL.md:757` (round-81 shape age item, worktree; was 756 at my first read) | same runner; `--shape … --max-age 30 >/dev/null && echo age-disclosed`, expected exit 0 + `age-disclosed` | indirectly (its exit is `--shape`'s age verdict) | **no** — but this is the date-dependent alarm, see §4 |
| 4 | `scripts/surface-probe.mjs:1091` | prints `substring=hit|miss`, `expected=<exits>` | yes (aggregator) | no |
| 5 | `.ufo/waves/round-82/probe/probe82-c2.mjs:109` `want()`, arms `:114-121,150-158`, `:160` | `r.out.includes(needle)` per needle + exact exit | yes (frozen counter) | **no** — all needles are substrings; `arm('compare-v1-captured-absent')` matches `captured=absent` inside `receipt_captured=absent` |
| 6 | `.ufo/waves/round-81/probe/probe81-c2.mjs:124,168` | `includes()` / unanchored regex `IN_SYNC entries=N receipt=N added=0 removed=0 changed=0` | yes | **no** |
| 7 | `.ufo/waves/round-80/probe/probe80-c2.mjs:240` | `/OMP_SHAPE_COMPARE: DRIFT/`, `/added=3/` regexes | yes | **no** |
| 8 | `.ufo/waves/round-78/probe/probe78-c2.mjs:95` | **full-line equality**: `line === 'OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0'` | yes (frozen, revision-bound) | **YES** — any appended field defeats it. `:104` (`/^OMP_SHAPE_COMPARE: DRIFT /`) is prefix-only and survives. Historical instrument; run at M it is expected to fail closed (round-81 review reads `exit 2`) |
| 9 | `scripts/receipt-evidence.mjs:188-191` | re-runs the receipt's recorded argv inside `git archive <rev>` and compares `body.exit` **and sha256(stdout)** | structurally (any receipt whose argv is `--compare`) | **YES, by construction** — a receipt minted at rev X reproduced at rev Y differs the moment the line gains a field. Safe only because the tool is extracted at the receipt's own rev; new-suffix receipts must be minted at M |
| 10 | `scripts/proxy-check.mjs:331` (`import { shapeFromFile }`) + `:553` (`'pin.omp-shape'`) | reads `doc.entries` only; never reads `captured_at` (`grep -n captured_at scripts/*.mjs` → only `omp-census.mjs`) | **no** | no (and age-blind in both directions) |
| 11 | `corpus/knowledge/shape-receipt-live-drift.md:13` | fenced grammar template in prose | documents | no — but already stale: omits `transient=<t>` (round 79) and now `receipt_captured=/age_days=` (round 82). Its `:9` caveat ("capture-time evidence, not present-tense") is the right frame for the new stamp |
| 12 | `SCORECARD.md:1966` (`omp-shape-compare` row) | prose + a quoted round-78 line | documents | no — historical quote |
| 13 | `SKILL.md:617` (omp-census registry row) | documents usage. As committed at `63b12695` it reads `--compare FILE [--root DIR]` and **omits `[--max-age DAYS]`**; the current worktree row (sibling edit, uncommitted) adds `compare FILE [--root DIR] [--max-age DAYS]` and the `receipt_captured=<date> age_days=<n>` disclosure | documents | no — the doc gap is closed in the worktree, opened at the scaffolding commit (which touched no SKILL row: `git show 63b12695 --stat` = plan, probe82-c1, omp-census, ready-handoff) |
| 14 | Committed receipts quoting the pre-suffix line: `.ufo/waves/round-81/close/census-shape.txt:3`, `.ufo/waves/round-80/close/census-compare.txt`, `.ufo/waves/round-79/close/census-shape.txt`, `.ufo/waves/round-82/controls/c2-base.txt`, plus round-78/79/80/81 build artifacts | immutable quotes of their own run | historical evidence | not parsers. Re-running their argv at M produces the suffix and differs — only consumer #9 re-runs, and it extracts their rev |
| 15 | `scripts/report-receipt-diff.mjs` | `grep -n "OMP_SHAPE\|receipt line"` → none; it matches `TALLY_CHECKS_MISMATCH`/pointers, not verdict lines | no | no |

Anchoring risk is confined to #8 (full-line `===`) and #9 (byte digest). Everything else is
substring/regex + exit, so the appended stamp is backward-compatible for every live consumer.

## 2. Receipt age at run time

| Reading | Command | Value |
|---|---|---|
| `captured_at` | `node -e` on `.ufo/pins/omp-shape.json` | `2026-11-04T09:45:44Z` |
| run instant | `date -u +%Y-%m-%dT%H:%M:%SZ` | `2026-11-04T10:58:58Z` |
| exact age | `(Date.now() - Date.parse(captured_at))/86400000` | **0.05086 d** (1 h 13 m 14 s) |
| disclosed age | `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` | `age_days=0` (`receiptAgeDays` floors, `:216-219`) |
| receipt shape | — | v2, 65 entries, sha256 `8b6aaa79e24fc56f39afdff6488aadeffe909f4e58f6de03f32901333263dae7` = `SCORECARD.md:331` `pin.omp-shape` |

Would any consumer notice a stale receipt? **Only if it opts into `--max-age`.** Nothing in the
lane passes `--max-age` on `--compare`; the one in-lane opt-in is `SKILL.md:757` (756 before the sibling insert)
(`--shape .ufo/pins/omp-shape.json --max-age 30 >/dev/null && echo age-disclosed`). The score path
(`proxy-check.mjs` → `coverage_omp`) never reads `captured_at`, so a receipt can never be "too old"
for the score.

## 3. Custody chain of `captured_at`

**Writer.** `snapshot()` — `scripts/omp-census.mjs:221-240`. `captured_at = new Date().toISOString()`
sliced to whole seconds (`:225`); entries read from the live root; bytes staged at
`${file}.<uuid>.tmp` with `flag:'wx', mode:0o600` and `renameSync`d into place (`:231-232`). The only
code path in the lane that writes the field.

**Relabel routes (no code, just file access).**
- `validateShape` (`:168-190`) accepts any `captured_at` that matches `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$`
  and parses — past or future, with no monotonicity, no binding to entry content, commit date, or a
  digest. `readShapeDoc` (`:196-212`) therefore accepts a hand-edited label over stale entries.
- Only clock guard: `runShape` refuses a future label (`SHAPE_CLOCK`, `:498-501`); `compareShape`
  refuses one only when `--max-age` is supplied (`:263-265`).

**This has already happened at least once, and the committed bytes cannot tell which way.** Commit
`d140f288` (round-81 scaffolding) is a 2-insertion/1-deletion diff on the receipt: `contract` v1→v2 and
one `captured_at` line. The `entries` array is byte-identical to the round-80 v1 receipt
(`git show 6d03402f:.ufo/pins/omp-shape.json` sha256 `84e41b9f…`; deep-compare of the two `entries`
arrays → `true`). No `OMP_SNAPSHOT: WROTE` receipt naming `.ufo/pins/omp-shape.json` exists in any
round-8x artifact (`grep -rn "OMP_SNAPSHOT.*\.ufo/pins/omp-shape.json" .ufo/waves/round-8*` → empty),
and round-81's close sweep recorded no capture of the pin. **A hand relabel and a re-snapshot of an
unchanged root produce the identical 2-line diff**, so the committed evidence cannot distinguish
"label written at capture" from "label written over an older capture". The file mtime
(`2026-11-04 06:45:44.209 -0300` = `09:45:44Z`) matches the label to the second, which is consistent
with either. The disclosed age is therefore **unwitnessed**: it is at best a capture instant, at worst
a relabel instant, and no artifact in the lane records which.

**What would catch a relabel.**
- `pin.omp-shape` (`SCORECARD.md:331`) is the sha256 of the receipt's bytes, checked by
  `proxy-check.mjs:553` (`GATE_PIN_DRIFT`). Verified: current `sha256sum` = the pin. This catches an
  edit that does not also move the pin — an accidental or uncoordinated relabel.
- It cannot catch a coordinated relabel: the pin and the receipt are lane-tracked files written in
  one L1 commit, which is exactly the `d140f288` shape. No tool compares `captured_at` to the git
  commit date or to any external timestamp.

## 4. What changes at 90 days (measured on scratch copies of the pin)

| Consumer / command | 90-day result | Verdict changes? |
|---|---|---|
| `--compare` (no gate) | `… IN_SYNC entries=65 … age_days=90`, **exit 0** | **silently no** — the only difference is the disclosed age |
| `--compare --max-age 30` | `OMP_SHAPE_COMPARE: SHAPE_STALE_RECEIPT entries=65 age_days=90 max_age=30`, **exit 1** | loud, by design |
| `--shape` (no gate) → `proxy-check --omp-shape` | receipt accepted; `coverage_omp=10`, `source=snapshot` (identical to the same run on the current pin) | **silently no** — age never scores |
| `SKILL.md:757` checklist (`--shape … --max-age 30 && echo age-disclosed`; was 756) | exit 1, `age-disclosed` absent → `substring=miss` | **yes — the only in-lane verdict that flips.** It flips at **31 days** (2026-12-05), long before 90; the pinned receipt has no refresh in the plan, so this item goes red on any checklist run after 2026-12-04 unless the receipt is re-captured |
| `probe82-c2` (frozen) | age-invariant: every arm builds its own fixture; `score-unchanged` (`:135`) rewrites the pin copy to 45 days | no — the frozen predicate cannot detect a stale pin |

Fixture commands (all copies under my scratch, never the lane file):

```
node -e '…' "$S"   # legacy.json = {contract:v1, entries}; old90.json = pin w/ captured_at -90d; future.json = pin w/ 2099
node scripts/omp-census.mjs --compare $S/legacy.json --max-age 1   # SHAPE_AGE_UNKNOWN, exit 2
node scripts/omp-census.mjs --compare $S/old90.json                # IN_SYNC … age_days=90, exit 0
node scripts/omp-census.mjs --compare $S/old90.json --max-age 30   # SHAPE_STALE_RECEIPT … exit 1
node scripts/omp-census.mjs --compare $S/future.json               # IN_SYNC … age_days=-26356, exit 0
node scripts/omp-census.mjs --compare $S/future.json --max-age 1   # SHAPE_CLOCK age_days=-26356, exit 2
node scripts/proxy-check.mjs --omp-shape $S/old90.json --json      # terms.coverage_omp=10, source=snapshot
```

The last proxy run reports overall `DRIFT` on the current tree (`A_DRIFT,C_DRIFT,C2_DRIFT,C2_TOTAL_DRIFT,GATE_PIN_DRIFT×2`)
identically with the default receipt — that is the mid-wave scaffolding drift (suite 98→105, pins not
re-measured), not an age effect.

## 5. Findings worth routing

1. **Custody (high).** `captured_at` is writable prose and no artifact witnesses it. The lane's own v2
   label was added over `entries` byte-identical to the round-80 v1 capture (`d140f288`, 2-line diff),
   and no `OMP_SNAPSHOT` receipt names the pin in any round-8x artifact — a relabel and a re-snapshot
   of an unchanged root are indistinguishable from the committed bytes. `--max-age` gates the label,
   not the observation; the disclosed age is unwitnessed. Recording that limit beside the `:9`
   caveat in `corpus/knowledge/shape-receipt-live-drift.md` is the honest framing.
2. **Asymmetry (medium).** A future-dated receipt is refused by `--shape` unconditionally
   (`SHAPE_CLOCK`) but accepted by `--compare` without `--max-age` (`exit 0`, `age_days=-26356`).
   Only the gated path fails closed. This is disclosed, not hidden: the sibling's new
   `corpus/knowledge/receipt-age-on-the-compare-path.md` states it ("without a bound the negative age
   prints and the compare grades"), so the flag is a design choice to ratify, not an undocumented bug.
3. **Latent red (medium).** `SKILL.md:757` (`--shape --max-age 30`; 756 at my first read) is date-dependent: it passes today
   at age 0 and fails on any checklist run after 2026-12-04 unless the receipt is re-captured. The
   plan contains no re-capture step for the pin.
4. **Docs converged except two labels (low).** The committed scaffolding touched no SKILL row
   (`63b12695 --stat`), but the worktree now closes the `:617` usage gap (adds `--max-age DAYS` and the
   stamp) and adds a round-82 compare-age item at `:756`. Still stale at this read: `SKILL.md:754`
   labels the receipt contract v1, and `corpus/knowledge/shape-receipt-live-drift.md:13`'s grammar
   template omits `transient=` and the stamp (the new `receipt-age-on-the-compare-path.md` covers the
   compare path). Doc drift, not parser risk.
5. **Naming (low).** The same concept prints as `captured=` on `--shape` (`:516`) and
   `receipt_captured=` on `--compare` (`:257`), both day-granular (`slice(0,10)`), while `age_days` is
   whole days. Two spellings for one field invites a future exact-match bug — `probe82-c2:119` already
   matches `captured=absent` only because it is a substring of `receipt_captured=absent`.
6. **Preserved risk (informational).** Full-line equality exists in exactly one place,
   `probe78-c2.mjs:95`; it is frozen and revision-bound, so the suffix is safe for every consumer that
   can run today. `receipt-evidence.mjs` byte-compares at the receipt's own rev — so the round-82
   close receipts must be minted at M, never back-filled from a pre-change run.

## 6. Remaining unknowns

- The instant the 65 entries were actually observed: v1 carried no label, the v2 label is unwitnessed,
  and no snapshot receipt names the pin. Bounded above by `6d03402f` (round-80 commit).
- Whether the round-82 close will re-capture the pin: the frozen C2 text does not require it, so the
  age will keep accruing from the `d140f288` label.
- `receiptAgeDays` uses the process clock only; no NTP/host-clock binding is checked beyond the
  negative-age guard, so a host-clock skew backwards yields a negative age that only a gated
  `--compare` or `--shape` refuses.
