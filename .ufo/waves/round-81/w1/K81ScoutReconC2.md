# K81ScoutReconC2 — the OMP shape-receipt surface (`kumitate-omp-shape-v2`)

Seat: K81ScoutReconC2 — recon only; nothing in this lane was edited, no git/jj mutation was run.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (base tip at open `77c7a8b3`).
Measurement window: **2026-11-04T09:45Z … 09:59Z**. The tree moved under this seat: commits
`f8783f4b` (freeze), `2ac1f34d` (wave spec), `d140f288` (scaffolding) landed during the window, and
`omp-census.mjs` and `probe81-c2.mjs` were both rewritten inside it. Every number below names the
blob it was measured against; §0.1 is the movement log.
Captures: `.ufo/waves/round-81/w1/K81ScoutReconC2-captures/` (20 files, indexed at the end).
Tooling: none installed or upgraded (nothing was needed).

---

## 0. Bottom line

1. **The claim holds at the final instant.** The frozen counter reads `C81_C2: HELD held=15/15`
   (`probe81-c2-run3.txt`) against `omp-census.mjs` `405cf5d4`, `proxy-check.mjs` `9ce56643`,
   receipt `8b6aaa79`, and the four pins this surface touches (`pin.proxy-check`, `pin.omp-census`,
   `pin.omp-shape`, `pin.ready-handoff`) matching their files (`final-state.txt`).
2. **`captured_at` cannot reach a score.** The proxy's O terms are fed only by `entries[]`
   (`shapeFromFile` returns `.entries`, `proxy-check.mjs:1313` → `:1378`). Runtime witness: 31 term
   keys, none age-shaped, `coverage_omp=10` on a 45-day-old receipt (`proxy-backdated.json`).
3. **It does reach a gate.** `pin.omp-shape` hashes the receipt's whole bytes
   (`proxy-check.mjs:710-711`, `:1164-1180`), so editing `captured_at` alone turns the proxy into
   `GATE_PIN_DRIFT` / exit 1 unless the pin is edited in the same change. That is tamper detection,
   not an age score — the plan's wording is exact, but the coupling deserves to be written down.
4. **The one live capability hole is upstream of the tool.** `SKILL.md:756` (the round-81 checklist
   item) is green on a receipt that the tool rejects: the pipe discards the exit code and
   `grep -q "age_days="` matches the `SHAPE_STALE` line itself (`checklist-756-stale.txt`). The same
   pipeline also makes the tool die with an uncaught `EPIPE` stack (`omp-census.mjs:910`).
5. **The suite cannot see the class of defect that arm 06 caught.** `--selftest` never spawns the
   CLI (zero `spawn` calls) and its `capture()` shim calls `runShape(..., argv.maxAge)` directly
   (`omp-census.mjs:536-546`), so the in-flight `--max-age` dispatch bug passed 97/97 and a revert of
   `main():903` would pass 97/97 again.
6. **Two smaller live gaps:** `--selftest --work <missing>` dumps an ENOENT stack (`omp-census.mjs:531`);
   the docs still assert the v1 contract in three places (`corpus/knowledge/omp-agent-root.md:180-200`,
   `SKILL.md:610`, `:754`).
7. **The post-freeze counter edit is disclosed, not silent.** `git diff` shows 15 lines / 4 hunks
   changed in `probe81-c2.mjs` after the freeze commit, and `plan.md` §Amendment 1 names all four
   plus the tool defect. My independent runs at 09:52Z and 09:54Z (9/15) reproduced exactly those
   four, before the amendment was written — the erratum is corroborated, not merely asserted.

### 0.1 Movement log (why two different counts exist)

| instant (UTC) | omp-census | proxy-check | probe81-c2 | counter |
|---|---|---|---|---|
| 09:52:14 | `f19cb1b3` | `fa79c279` | `10e177d5` (committed) | **9/15** (`probe81-c2-run.txt`) |
| 09:54:38 | `f19cb1b3` | `9ce56643` | `10e177d5` | **9/15** (`probe81-c2-run2.txt`) |
| 09:55:03 | — | — | `886991f2` (worktree edit, mtime) | — |
| 09:55:29 | `405cf5d4` | `9ce56643` | `886991f2` | **15/15** (`probe81-c2-run3.txt`) |
| 09:55:54 | `405cf5d4` | `9ce56643` | `886991f2` | proxy `MATCH`, receipt CLEAN, compare IN_SYNC (`final-state.txt`) |

The four hunks (`git diff` retained in `hashes.txt`): `chmodSync` in `materialise()`; `--lane` →
`--self` in arms 11 and 12; `mkdirSync` for the arm-14 work dir. All four are §Amendment 1 items 2–4.
Amendment item 5 (`main()` dropped `parsed.maxAge`) is the tool-side fix that took `f19cb1b3` →
`405cf5d4`.

---

## 1. Surface map (line numbers at `405cf5d4` / `9ce56643`)

| symbol | file:line | what it does |
|---|---|---|
| `SHAPE_CONTRACT`, `LEGACY_SHAPE_CONTRACT` | `scripts/omp-census.mjs:166-167` | `kumitate-omp-shape-v2` / `…v1` |
| `validateShape` | `:170-192` | exact key set (`captured_at,contract,entries` for v2; `contract,entries` for v1), `ISO_SECOND` + `Date.parse` on `captured_at`, sorted unique entries `{kind,mode,name}`, no `/ \ NUL`, kind ∈ file/dir/symlink, mode ∈ 0…0o777 |
| `readShapeDoc` | `:197-208` | only file reader of the receipt; `SHAPE_NOT_FOUND` / `SHAPE_INVALID`; never follows a name |
| `shapeFromFile` | `:211-213` | `readShapeDoc(file).entries` — **drops `contract` and `captured_at`** |
| `receiptAgeDays` | `:216-219` | `floor((now − Date.parse(captured_at))/86400000)` |
| `snapshot` | `:221-236` | `readShape` → `captured_at` (ms stripped) → `validateShape` → `writeFileSync(tmp,{flag:'wx',mode:0o600})` → `renameSync` |
| `compareShape` | `:242-286` | shape-only diagnostic; `agent.db-{shm,wal,journal}` transient; exit 0/1/2 |
| `runShape` | `:463-494` | v1 → `SHAPE_VERSION` exit 2; `age<0` → `SHAPE_CLOCK` exit 2; `--max-age` → `SHAPE_STALE` exit 1; verdict line carries `captured=<date> age_days=<n>` |
| CLI dispatch | `:903` | `runShape(parsed.shape, io, note, parsed.maxAge)` — the 4th argument is the round-81 fix |
| flag parse/validate | `:410-414`, `:432-433` | `--max-age N` and `--max-age=N`; non-negative integer; `--shape` only |
| proxy import | `scripts/proxy-check.mjs:331` | `{ …, censusEntries, shapeFromFile }` |
| proxy read | `:1312-1316` | `shapeFromFile(opts.ompShape)`; failure → `OMP_SHAPE_*` fail-closed |
| proxy O source | `:1378` | `censusEntries(shape, ompNoteText)` |
| proxy default path | `:375`, `:3383` | `.ufo/pins/omp-shape.json` when neither `--omp-shape` nor `--omp-live`/`--omp-root` |
| gate pin | `:553`, `:710-711`, `:1164-1180` | `pin.omp-shape` → `sha256File` over the whole receipt file |
| disclosure | `:1284`, `:1423`, `:1453` | `source: 'snapshot'|'live'`, `source=snapshot` in the verdict tail |

---

## 2. Every path that reads the receipt, and what reaches `terms`

| # | path | read | fields consumed | destination |
|---|---|---|---|---|
| 1 | `omp-census.mjs:198` (`readShapeDoc`) | `readFileSync(file,'utf8')` | whole doc, validated | the only parser |
| 2 | `omp-census.mjs:465` (`--shape`) | via (1) | `contract`, `captured_at`, `entries` | verdict line + exit |
| 3 | `omp-census.mjs:244` (`--compare`) | via `shapeFromFile` | `entries` only | `OMP_SHAPE_COMPARE` (non-scoring) |
| 4 | `omp-census.mjs:722-723` (selftest) | `readShapeDoc` | all three | suite assertions |
| 5 | `proxy-check.mjs:1313` | via `shapeFromFile` | `entries` only | → `censusEntries` `:1378` |
| 6 | `proxy-check.mjs:1168` | `sha256File` | **raw bytes** | `GATE_PIN_DRIFT` finding |
| 7 | `probe81-c2.mjs:71` (`entriesFor`) | `JSON.parse(readFileSync(...))` | `entries` | fixture material |
| 8 | `probe81-c2.mjs:197-200` (arm 13) | raw bytes + `SCORECARD.md` regex | `pin.omp-shape` digest, `contract` | arm 13 |
| 9 | round-77 `probe77.mjs`/`probe77-v1.mjs`, round-78 `probe78-c2.mjs`, round-80 `probe80-c2.mjs` | historical | — | frozen at their rounds; not re-scored |

Field routing:

| field | reaches a `terms` key? | where it goes |
|---|---|---|
| `entries[].name` | **yes** | `censusEntries` (`omp-census.mjs:338-386`) → `O_members`, `O_findings`, `O_bound` |
| `entries[].kind`, `entries[].mode` | **yes** | same → `O_findings` (KIND/MODE findings) |
| derivations | **yes** | `deriveTerms` `proxy-check.mjs:998-1001` → `C1o C1o_total O_members O_findings O_bound coverage_omp` = `floor(10·C1o/C1o_total·(O_members−O_findings)/O_members)` |
| `contract` | no | validation branch only (`:172-173`; `runShape` `:469` refuses v1; proxy accepts v1 by design) |
| `captured_at` | **no** | (a) `--shape` disclosure + `SHAPE_CLOCK`/`SHAPE_STALE`; (b) the byte digest of `pin.omp-shape` → `GATE_PIN_DRIFT`, i.e. the **verdict**, never a term |

Runtime witnesses: `proxy-terms.txt` (receipt age 0) and `proxy-backdated.json` (same entries,
`captured_at` 45 days old) both read `O_members=65 O_findings=0 O_bound=35 coverage_omp=10`,
31 term keys, `[]` age-like keys. Both runs used a scratch copy of `SCORECARD.md` with the
`pin.ready-handoff` line removed — at that instant that key was declared but unregistered, and the
real scorecard failed the whole run closed (`proxy-json.err`: `GATE_PIN_KEY_UNKNOWN: line 352`).
No other byte of the copy differs. The final instantaneous run against the real tree is `MATCH`
(`final-state.txt`).

---

## 3. What `captured_at` can and cannot prove

**Written by:** `snapshot()` (`omp-census.mjs:221-236`) from `new Date()` at write time, into a
three-key JSON document with no signature, no digest of `entries`, no host identity and no root
path. The file is staged and renamed, but nothing binds the instant to the content.

**Can prove:** that *someone writing this file* claimed that instant; and, once committed, that the
claim is no older than the commit that carries it (git's clock, a different clock). It gives a
closure a *relative* freshness reading (`age_days`) and one cheap guard (`SHAPE_CLOCK` for a future
instant, which no honest clock produces).

**Cannot prove:** that the entries matched the live root at that instant; that the writer read the
root at all; that the clock is right (no NTP/attestation anchor); that a previous `captured_at` was
not simply overwritten.

**What a forger needs** (all cheap, because everything lives in one repo):

1. write access to `.ufo/pins/omp-shape.json` (ordinary tracked file, `0600`, no seal);
2. set `captured_at` ≤ now, in the `YYYY-MM-DDTHH:MM:SSZ` shape, and keep the key set exact;
3. recompute `pin.omp-shape` in `SCORECARD.md` (`sha256sum` of the new bytes) — a second file, same
   commit;
4. avoid or omit `--max-age` (it is opt-in and no gate passes a bound);
5. accept that the only residual evidence is the commit itself: date, diff, and the fact that a
   re-capture of an unchanged root *always* changes the bytes (see F8), so the pin churn looks
   normal.

**Who would believe it:** `omp-census.mjs --shape` (age disclosure and `SHAPE_STALE`), and any
human or closure reading that line — including `SKILL.md:756`, which is green either way (F2).
`proxy-check.mjs` does not believe it in the sense that matters: it never parses the field, and the
pin catches only an *uncoordinated* edit (receipt changed, pin not). A coordinated edit of receipt +
pin passes `MATCH` and the age gate; git history is the only witness left. This is exactly the
Terraform-lock-file model the lane cites (S234: the snapshot is trusted only through its bytes), and
it has the same limit: the bytes are trusted as *bytes*, not as an observation.

---

## 4. Consumers of the receipt and their v2 cutover

| consumer | path:line | what it reads | v2 cutover | note |
|---|---|---|---|---|
| `omp-census --shape` | `:465` | all three fields | **clean** | refuses v1 (`SHAPE_VERSION`), gates age |
| `omp-census --snapshot` | `:221` | writes v2 | **clean** | not byte-idempotent across seconds (F7) |
| `omp-census --compare` | `:242` | `entries` via legacy-tolerant reader | **clean, by design** | v1 receipt still compares (arm 04) |
| `omp-census --selftest` | `:526-…` | fixtures | **clean** | 97/97 (`omp-census-selftest.txt`); blind to CLI dispatch (F1) |
| `proxy-check` O terms | `:1313`, `:1378` | `entries` only | **clean by construction** | v2 acceptance is runtime-proven (`proxy-backdated.json`) but *untested in-repo* (F4) |
| `proxy-check` gate pin | `:553`, `:1168` | bytes | **clean** | pin re-measured in-flight; matches at 09:55:54 |
| `SCORECARD.md` pins | `:330-331` | `pin.omp-census`, `pin.omp-shape` | **in-flight, converged** | at 09:51:47 both were stale; at 09:55:54 both match |
| `SKILL.md:745` checklist | — | greps `OMP_CENSUS: CLEAN (source=snapshot` | **clean** | v2 prints that prefix |
| `SKILL.md:756` checklist | — | `--max-age 30 \| grep -q age_days=` | **broken as an instrument** | green on a stale receipt (F2) |
| `SKILL.md:610`, `:754` labels | — | prose | **stale** | still say `kumitate-omp-shape-v1` (F5) |
| `corpus/knowledge/omp-agent-root.md` | `:180-200` | prose | **stale, contradicts v2** | "only `contract` and `entries` … no timestamp" (F5) |
| `corpus/knowledge/snapshot-bound-derived-scores.md` | `:35` | prose | **stale hash** | still names `84e41b9f…` as the capture (F5) |
| `probe81-c2` (this round) | `:71`, `:197` | entries / bytes | **clean after Amendment 1** | F10 |
| round-77/78/80 counters | `.ufo/waves/round-7*/probe/*` | v1 shapes | **historically frozen** | correct to leave UNMET if re-run; no live checklist points at them |

---

## 5. Findings

Severity: blocker > high > medium > low > info. `LIVE` = true at `405cf5d4`/`9ce56643`.

**F1 — `LIVE`, medium — the 97-case suite cannot catch a CLI-dispatch regression.**
`scripts/omp-census.mjs:536-546` (`capture()`) calls `runShape(argv.shape, ioCapture, …, argv.maxAge)`
directly, and the file contains **zero** `spawn` calls (`grep -c spawnSync scripts/omp-census.mjs` →
0), so no case traverses `parseArgs` → `main()` → `runShape`. That is how `main():903` shipped
without `parsed.maxAge` while the suite read 97/97 (`omp-census-selftest.txt`), and it is why the
Amendment-1 item-5 fix has no regression test: reverting the 4th argument re-passes all 97.
Fix shape: one case that spawns the CLI (as the probe does) asserting `SHAPE_STALE`/exit 1, or a
`--selftest` arm that dispatches through `main()`'s parsed argv.

**F2 — `LIVE`, medium — the round-81 checklist item is green on a receipt the tool rejects.**
`SKILL.md:756` runs `node scripts/omp-census.mjs --shape … --max-age 30 | grep -q "age_days=" && echo
age-disclosed`. On a 45-day receipt the tool prints `SHAPE_STALE age_days=45 max_age=30` and exits 1;
`grep -q` matches inside that very line and the pipeline reports success → `age-disclosed`,
`checklist_exit=0` (`checklist-756-stale.txt`). The item also makes the tool die with an uncaught
`EPIPE` (`omp-census.mjs:910`, `io.out` has no error handler) because the reader exits first.
Fix shape: assert the exit code (`bash -o pipefail` still fails only on the tool's status, so
`! … | grep -q SHAPE_STALE` or `--max-age 30 >/dev/null`), and handle `EPIPE` in `io`.

**F3 — `LIVE`, low — `--selftest --work <missing>` is an uncaught ENOENT.**
`scripts/omp-census.mjs:530-531`: `mkdtempSync(join(base, 'omp-census-selftest-'))` with no
`mkdirSync(base)`. Repro: `node scripts/omp-census.mjs --selftest --work /…/absent-selftest2` →
`ENOENT … mkdtemp`, Node stack, `EXIT=1`, no `VERDICT` line (`state-3.txt`). Every other CLI path in
this tool fails with a named token and a mapped exit; this one does not. The probe now creates the
dir itself (Amendment 1 item 4), so the arm passes and the tool-side rough edge stays.

**F4 — `LIVE`, low — the proxy does not name v2 anywhere.**
`grep -c "kumitate-omp-shape-v2" scripts/proxy-check.mjs` → **0**; `…-v1` → 4 (`:61` comment,
`:2644`, `:2803`, `:2831` fixtures). Every proxy fixture is a v1 document
(`.ufo/waves/round-81/w1/K81ScoutReconC2-captures/proxy-selftest.txt` → 163/163 pass), so the
proxy's acceptance of v2 rests on `validateShape`'s legacy branch plus external probing, not on its
own suite. Today it works (my `--omp-shape` v2 run read 65 entries; probe arm 11 reads
`coverage_omp=10`), but a future tightening of the reader would be caught only outside the file that
would break.

**F5 — `LIVE`, low — three documents still assert v1.**
`corpus/knowledge/omp-agent-root.md:180-200` says the receipt carries "only `contract` and
`entries` … no content, no root path, no timestamp" — three statements now false;
`SKILL.md:610` and `SKILL.md:754` label the contract `kumitate-omp-shape-v1`;
`corpus/knowledge/snapshot-bound-derived-scores.md:35` still names `84e41b9f…` as the capture.
`SKILL.md:745` was updated to v2, so the cutover is half-done. Measured at 09:58Z with `SKILL.md`
itself still `M` in the worktree, i.e. the L1 was editing it during this window — re-check before
the close; `corpus/knowledge/omp-agent-root.md` and `…/snapshot-bound-derived-scores.md` were
unmodified then.

**F6 — `LIVE`, low — `receiptAgeDays` is a footgun for legacy docs.**
`omp-census.mjs:216-219` returns `NaN` when `captured_at` is absent (`Math.floor(NaN)`), and the
function is exported. The only caller (`:477`) is guarded by the v2 check at `:469`, so nothing is
wrong today; a second consumer would silently get `NaN`, and `NaN > maxAge` is `false` — i.e. a
stale legacy receipt would *pass* a gate.

**F7 — `LIVE`, info — `--snapshot` is no longer byte-idempotent.**
Two captures of an identical root differ (the second-resolution `captured_at`), so a re-capture
always changes `pin.omp-shape`. The suite's `snapshot-roundtrip` case only passes because it injects
a fixed `NOW` (`omp-census.mjs:709-721`). Operationally this means "re-snapshot must be byte-equal to
the committed receipt" is no longer a valid check; the valid check is `--compare` + the pin.

**F8 — `LIVE`, info — `age_days` counts whole days.** `floor()` at `:219`: a 23h59m-old receipt reads
`age_days=0`, so `--max-age 0` accepts it. Documented as "whole days" (`:215`); noting it because a
`--max-age 0` checklist item would look stronger than it is.

**F9 — `LIVE`, info — cross-claim coupling of the discriminating arm.**
Arms 11/12 spend a whole-gate `verdict=MATCH`. At 09:51:47Z the proxy was FAIL-CLOSED
(`GATE_PIN_KEY_UNKNOWN: line 352: pin.ready-handoff …`, `proxy-json.err`) because C1's pin had landed
in `SCORECARD.md` before the key was registered in `GATE_PINS`; at 09:54 the registration was in
(`proxy-check.mjs:575`) but `pin.proxy-check` was still stale, so the run read `DRIFT`. C2's
frozen counter therefore cannot be HELD while any other pin, stanza or axis in the lane is red — a
property of the arm design, worth stating in the lesson so a future C2 does not read "UNMET" as a
receipt defect.

**F10 — `PROCESS`, disclosed — the frozen counter was edited after its freeze commit.**
`git show HEAD:.ufo/waves/round-81/probe/probe81-c2.mjs | sha256sum` → `10e177d5…` (commit
`f8783f4b`); worktree → `886991f2…`; `git diff` = 15 lines / 4 hunks (chmod in `materialise`,
`--lane`→`--self` ×2, `mkdirSync` for arm 14). `plan.md:122-…` §Amendment 1 names all four and the
tool defect, "append-only; written before any verdict". My two pre-amendment runs read **9/15**
(`probe81-c2-run.txt`, `probe81-c2-run2.txt`) and fail exactly arms 04, 06, 10, 11, 12, 14 — i.e.
the amendment is independently corroborated. The remaining obligation from the plan's freeze rule is
the round lesson's `## Mistakes` entry (not yet written at 09:56Z).

**F11 — info — the receipt's git anchor landed mid-recon.** At 09:47Z `.ufo/pins/omp-shape.json` was
uncommitted (`git status` → ` M`), so nothing could anchor its `captured_at`; `d140f288` then landed
it (`git log -1 --oneline -- .ufo/pins/omp-shape.json` → `d140f288 … omp shape receipt v2 with
captured_at …`), and at 09:55:54 it is clean. The only receipt-adjacent uncommitted change is the
probe (F10). Timeline recorded because a `captured_at` read before the landing commit has no
external witness at all.

---

## 6. Re-derivation (exact one-line after-state commands)

Claim (the whole of C2):

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2 --lane . | tail -1
# → C81_C2: HELD held=15/15 tool=/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/omp-census.mjs
```

Per finding:

| finding | one line |
|---|---|
| receipt is v2 + age 0 | `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` → `… captured=2026-11-04 age_days=0`, exit 0 |
| staleness gate fires | `node scripts/omp-census.mjs --shape <45d-receipt> --max-age 30` → `SHAPE_STALE age_days=45 max_age=30`, exit 1 |
| future instant refused | `node scripts/omp-census.mjs --shape <future-receipt>` → `SHAPE_CLOCK …`, exit 2 |
| v2 without `captured_at` refused | `node scripts/omp-census.mjs --shape <no-captured>` → `SHAPE_INVALID`, exit 2 |
| age cannot score | `node scripts/proxy-check.mjs --json --self . --omp-shape <45d-receipt> \| jq '.terms.coverage_omp'` → `10` (and `keys \| map(select(test("age\|captured\|stale")))` → `[]`) |
| receipt pinned | `sha256sum .ufo/pins/omp-shape.json` = `grep -o 'pin.omp-shape=[0-9a-f]*' SCORECARD.md` |
| F1 (suite blind to dispatch) | `grep -c spawnSync scripts/omp-census.mjs` → `0` |
| F2 (checklist tautology) | `node scripts/omp-census.mjs --shape <45d-receipt> --max-age 30 \| grep -q age_days= && echo age-disclosed` → `age-disclosed`, exit 0 |
| F3 (work-dir crash) | `node scripts/omp-census.mjs --selftest --work /nonexistent/x` → `ENOENT`, exit 1 |
| F4 (proxy names v1 only) | `grep -c kumitate-omp-shape-v2 scripts/proxy-check.mjs` → `0` |
| F10 (probe edit) | `git diff -- .ufo/waves/round-81/probe/probe81-c2.mjs` |

---

## 7. Not checked / remaining unknowns

- **No live-root drift study.** `--compare` read `IN_SYNC entries=65` at 09:51Z and 09:55Z; I did not
  vary the live root (`~/.omp/agent`) myself, so "the receipt still describes this host" is a
  two-instant observation, not a proof of stability across the round.
- **`git` clock anchoring is untested.** I did not compare `captured_at` to the landing commit's
  author/committer date, because the v2 receipt did not land in a commit during my window; the claim
  in §3 that the commit date is the only external anchor is a structural reading of `snapshot()`, not
  a measurement of a landed commit.
- **EPIPE behaviour on the other checklist pipelines** (e.g. `SKILL.md:745`) was reasoned from where
  `grep -q` matches, not measured per item.
- **Round-77/78/80 frozen counters** were not re-run; I only recorded that they still read the v1
  key set and that no live checklist points at them.

---

## Capture index (`.ufo/waves/round-81/w1/K81ScoutReconC2-captures/`)

| file | what it holds |
|---|---|
| `final-state.txt` | 09:55:54Z: five hashes, `git status`, all four pins, receipt CLEAN, compare IN_SYNC, proxy `MATCH` |
| `hashes.txt` | first pin/tool hash comparison (09:51:47Z), including the then-stale `pin.omp-shape` |
| `state-2.txt` | 09:54:26Z: `omp-census` still `f19cb1b3`, 45-day + `--max-age 30` → exit **0** |
| `state-3.txt` | 09:55:26Z: `omp-census` `405cf5d4`, same command → `SHAPE_STALE` exit **1**; work-dir crash |
| `shape-and-compare.txt` | committed receipt through `--shape`, `--max-age 0`, `--compare` |
| `omp-census-selftest.txt` | `VERDICT: PASS (97 cases)`, exit 0 |
| `probe81-c2-run{,2,3}.txt` | the counter at 9/15, 9/15, 15/15 with per-arm detail |
| `counter-final.txt` | 09:58:47Z re-run → `C81_C2: HELD held=15/15`, exit 0 |
| `checklist-756-stale.txt` | `SKILL.md:756` command green on a stale receipt + EPIPE stack |
| `skill-756-check.txt` | the same item on the committed (fresh) receipt |
| `proxy-json.txt` / `.err` | 09:51Z FAIL-CLOSED `GATE_PIN_KEY_UNKNOWN: line 352: pin.ready-handoff` |
| `proxy-json-2.txt` / `.err` | 09:54Z `DRIFT` with `C2_DRIFT, C2_TOTAL_DRIFT, PIN_DRIFT` |
| `proxy-terms.txt` / `.err` | 31 terms keys, no age key, `coverage_omp=10` (age 0) |
| `proxy-backdated.json` | 45-day receipt → `coverage_omp=10`, exit 1 from open-state debt only |
| `proxy-selftest.txt` | `PROXY_SELFTEST: 163/163 pass`, `VERDICT: PASS` |
