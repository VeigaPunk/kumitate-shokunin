# K81ConnOverlap — round 81 w1, sibling-overlap scan (read-only)

Seat: connector, sibling-overlap. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
(base tip `77c7a8b3`, lane branch `master` at `2ac1f34d` = round-81 freeze + w1 spec/ready).
Scope of writes: this report and `w1/K81ConnOverlap-captures/` only. No sibling file touched,
no git/jj mutation, no subagent. Scratch (`/fast/scratch/hyaku/kumitate-r81/K81ConnOverlap.Xlvujh`)
was removed before yield; nothing below cites it except the two repro commands, which recreate it.

All captured output is under `w1/K81ConnOverlap-captures/`. Every number below names its capture.

---

## 0. What was executed (and what this is a snapshot of)

This scan ran at 06:50–06:56 on 2026-11-04, **mid-wave**: executors for C1/C2 were still landing
(`git status` showed `scripts/ready-handoff.mjs` untracked and `scripts/omp-census.mjs` modified,
plus dirty pins). The counter lines below are pinned to that instant and are **not** a claim tally;
the verifier re-runs at M. What is stable regardless of when the wave lands is §3–§6.

| command | exit | capture |
|---|---|---|
| `node scripts/ready-handoff.mjs --round 81 --wave w1 --lane .` | 0 | `ready-live.txt` — `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 …` |
| `node scripts/ready-handoff.mjs --selftest` | 0 | `ready-selftest.txt` — `READY_HANDOFF_SELFTEST: 31/31 pass` / `VERDICT: PASS` |
| `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` | 0 | `shape-v2.txt` — `captured=2026-11-04 age_days=0` |
| `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` | 0 | `compare.txt` — `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 … transient=0` |
| `node scripts/omp-census.mjs --shape … --max-age 30` (45-day receipt) | 0 (**wrong**) | `maxage-stale-repro.txt` — see §6.1 |
| `node scripts/omp-census.mjs --selftest` | 0 | `census-selftest.txt` — `VERDICT: PASS (97 cases)` |
| `node scripts/omp-census.mjs --selftest --work <absent dir>` | 1 | `census-selftest-work-enoent.txt` — see §6.4 |
| `node .ufo/waves/round-81/probe/probe81-c1.mjs --set c1 --tool .` | 1 | `probe-c1.txt` — `C81_C1: UNMET held=15/16` |
| `node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2 --tool .` | 1 | `probe-c2.txt` — `C81_C2: UNMET held=8/15` |
| `node scripts/proxy-check.mjs` | 1 | `proxy.txt` — `PROXY: DRIFT …` incl. `PIN_UNPINNED term=scripts/ready-handoff.mjs` |
| `git merge-base --is-ancestor 89cbd998… <base>` / `… refs/heads/master` | 0 / 0 | `tabi-adjacency-pin.txt` |

Repo layout read-only: `git rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/kumitate-shokunin`;
`refs/heads/master` → `2ac1f34d9f6e7322602ae930f071dcf292d7dae5`; `.git` is a real directory and `.jj`
exists (jj-colocated). `git status --porcelain` was read only.

---

## 1. The sweep was widened, and why

The seat names `*-shokunin/scripts/`, but only **two** of the 20 siblings keep instruments there
(`grep-01-inventory.txt`):

- 21 `*-shokunin` dirs total (20 siblings + this lane). `scripts/`: `kake` 38 files, `tabi` 64,
  `kumitate` 36. `tools/`: `chousa` 26, `kaidoku` 439, `kama` 141, `kotodama` 383, `mado` 26,
  `mori` 130, `souji` 156, `tameshi` 75, `tsukuroi` 121. The remaining nine siblings carry no
  instrument directory at all (`audio`, `game-dev-2d`, `game-dev-3d`, `kagi`, `kasegi`, `kengaku`
  — whose `grader.py` sits at the repo root — `kotoba`, `lore`, `revenger`).
- **Deviation, stated:** I widened every pattern to `*/tools` (and `scripts/`), because a
  scripts-only grep would have missed 9 of the 11 instrument-bearing siblings — including every
  `captured_at`/`age_days` precedent in §4.

---

## 2. The grep commands (verbatim, with exit codes)

Transcripts: `grep-01-inventory.txt` … `grep-06-cross-repo.txt`. All read-only, all exit 0
(the `exit=$?` line inside each file is `grep`'s).

```sh
# 1 — inventory: which siblings have an instrument directory
ls -d *-shokunin/ | wc -l                      # 21
for d in *-shokunin; do [ -d "$d/scripts" ] && echo "$d/scripts: $(ls "$d/scripts" | wc -l)"; done
for d in *-shokunin; do [ -d "$d/tools" ]   && echo "$d/tools: $(find "$d/tools" -type f | wc -l)"; done

# 2 — .ready / handoff / dispatch producers and readers in sibling scripts/
grep -rInE '\.ready\b|ready-file|readyFile|handoff|dispatch' --include='*' */scripts/ \
  | grep -v '^kumitate-shokunin/' | grep -iE '\.ready|handoff'

# 3 — the `.ready` file class across every sibling instrument dir
grep -rIn '\.ready' kake-shokunin/scripts tabi-shokunin/scripts */tools

# 4 — receipt age / TTL / staleness / capture-instant conventions
grep -rInE 'age_days|captured_at|max-age|max_age|SHAPE_STALE|snapshot.*contract|contract.*snapshot' \
  --include='*.mjs' --include='*.py' --include='*.sh' --include='*.js' \
  kake-shokunin/scripts tabi-shokunin/scripts */tools

# 5 — dispatch admission surfaces (attack share / band / planner / connector / preflight)
grep -rIn -iE 'attack.?share|connector|planner|band[^a-z]|admission|preflight|pre-dispatch|godspeed' \
  --include='*.mjs' --include='*.py' --include='*.sh' kake-shokunin/scripts tabi-shokunin/scripts */tools

# 6 — does any sibling read another lane's repo (harm vector)?
grep -rInE 'shokunin/\*|\.\./[a-z0-9-]+-shokunin|Projects/shokunin/[a-z0-9-]+-shokunin' \
  --include='*.mjs' --include='*.py' --include='*.sh' kake-shokunin/scripts tabi-shokunin/scripts */tools
```

Matches that matter, `repo:file:line`:

**`.ready` handling (2, 3).** The file class is claimed by exactly one sibling:
`kake-shokunin/scripts/doc_quote_truth.py:28` — "`*-spec.json`, `swarm-registry.json` and
`*.ready*` are never receipts"; `:97` the same glob in `ARTIFACT_GLOBS`; `:164` the mutant class
"Dispatcher artifacts are never receipts (B5 `*.ready*`)"; `:826` a selftest fixture
`.ufo/waves/round-75/controls/probe.ready.txt`. Everything else matches browser `document.readyState`
(`tabi-shokunin/scripts/chrome-cdp-loopback-round{44..61}.mjs`, `webview2-cdp-loopback-round48..55.mjs`)
or an unrelated `o.ready` field (`webmcp-invoke-round17/18/19.mjs:1538/2335/2507`). **No sibling
validates a handoff `.ready`'s contents.** Kake's rule is the precedent that matters: a `.ready`
is a *dispatcher artifact*, never a receipt — which is precisely the province `ready-handoff`
claims, and it claims it without contradicting kake (different repos, no shared file).

**Pre-dispatch admission (5).** No sibling has one. The nearest neighbours are post-hoc:
`tabi-shokunin/scripts/check-frontier-admission.mjs:2,66` (`--rev … --since YYYY-MM-DD`, coverage
admission of a *committed* frontier), `tabi-shokunin/scripts/check-s106-evidence.mjs:2,27`
(routed source-evidence admission), `kake-shokunin/scripts/instrument_receipts.py:61,376`
("`--write` is never admission evidence"). Nothing reads a handoff before the orchestrator takes it.

**Age / TTL / capture instant (4).** Six independent conventions, none of them kumitate's:
`tsukuroi-shokunin/tools/measure-update-recheck.py:50` (`STAMP = ^\d{4}-…Z$`), `:107-118`
(strict `captured_at` + calendar validity), `:290-310` (`R15-C2-CAPTURE-LINK`: a disclosure
instant must equal the observation instant and be bounded *below*);
`tsukuroi-shokunin/tools/check-boot-chain.py:125` (`captured_at` in `TOP_KEYS`);
`chousa-shokunin/tools/research-gate.sh:3686-3716` (`--as-of` freshness: `asof_days` vs `due_days`,
`freshness=current|overdue|event`);
`souji-shokunin/tools/impl-05.sh:158-174` and `souji-verify.impl-11.sh:331-391` (`age_days` vs
`STALE_DAYS`); `kake-shokunin/scripts/receipt_replay.py:19-25` (stamp must not postdate REV's
committer time). Shape/snapshot receipts: `kake-shokunin/scripts/receipt_replay.py:2` (digest-pinned
frozen populations), `kumitate`'s own `.ufo/pins/omp-shape.json` (nothing sibling).

**Cross-repo readers (6).** `tabi/shokunin` and `kaidoku` hardcode **their own** lane root
(`tabi-shokunin/scripts/measure-c1-round40.mjs:6`, `kaidoku-shokunin/tools/round-28/collect-c1.py:21`,
…). The one gate that resolves *other* repos by name is
`tabi-shokunin/scripts/check-adjacency.mjs:46-49` — see §5.

---

## 3. Boundary table — `ready-handoff` against this lane's existing gates

Read: the six named gates plus `round-gate.mjs` (the lane's other pre-check).

| gate (contract / locus) | what it proves | what `ready-handoff` adds that it does not | duplicate? |
|---|---|---|---|
| `scripts/plan-before-ready.sh:1-30` (`PLAN_BEFORE_READY`) | the round's `plan.md` commit is an ancestor of, and not later than, the first committed `*.ready` / `*-dispatch.json` (`:295,317`), and `readme-map` is GREEN inside `git archive PLAN` | content admission of the handoff *before* it is taken. Says nothing about time; proved at `2ac1f34d` this round. | **No.** Orthogonal axes (history order vs payload content). Note it *already treats `.ready` as a first-class committed object* — the new gate does not change that meaning, it only judges it. |
| `scripts/make-dispatch-actual.mjs:1-30` (faithful translation) | registry + settle output → `dispatch-actual.json` + `launcher-progress.tsv`, then re-runs `dispatch-evidence` on exactly what it wrote. Post-dispatch, launcher world. | nothing overlapping. | **No.** Different world (launcher, not inline). |
| `scripts/wave-census.mjs:1-25,57` (`kumitate-wave-census-v1`) | census of the *committed* `<wave>-dispatch.json`: seats, roles, attack count, reports present/absent, `--expect`; parses the `Report:` trailer with `RE_REPORT` (`:57`) and refuses a `..` trailer (WC21, `:450-451`). Post-commit. | pre-dispatch admission of the same payload, so a malformed wave never spawns. | **Partial — shared surface: the `Report:` trailer grammar.** The new rule at `ready-handoff.mjs:174-183` is a *different* rule (relative-trailer + `taskCall.context` disclosure) over the same line, with its own regex. Two grammars for one field in one lane. Flagged, not fatal: keep them distinct by intent, or make one cite the other; do not let them drift. |
| `scripts/dispatch-evidence.mjs:1-20` (`kumitate-dispatch-evidence-v1`) | the *actual* dispatch: launcher progress + actual record + seat reports; `NOT_A_DISPATCH` for a registry with no session ids; dead seats named, never credited. Post-dispatch. | nothing overlapping. | **No.** |
| `scripts/inline-dispatch-evidence.mjs:1-25,254-255` (`kumitate-inline-dispatch-evidence-v1`) | binds an inline wave to harness transcripts + the dispatcher log; reads `<wave>.ready` (`:254`) for **lane identity only** → `READY_MISMATCH`. Post-dispatch, transcript-bound. | pre-dispatch judgment of the *whole* handoff (all 5 keys, band, attack share, connector cap, planner refusal, artifact keys, godspeed lead, lane-root, trailer, dispatch containment). | **Partial — shared surface: `.ready` lane identity.** Deliberate defence in depth: the post-hoc check is the one bound to the harness, and must survive independently. Not a duplicate to delete. |
| `scripts/report-receipt-diff.mjs:1-30` (`…-v4`) | the *report* against the committed receipts: tallies, `POINTER_DEAD`, `HASH_*`, `RECEIPT_*`, required sections. Post-report. | nothing textual. Its pointer check only sees backticked repo paths in prose, never a dispatch trailer. | **No.** |
| `scripts/round-gate.mjs:1-20` (`kumitate-round-gate-v1`) | lane-local pre-check of the fleet round-close contract (report conforms, cited child commits are ancestors of lane HEAD). Pre-*file*, post-round. | nothing. | **No.** |

**Verdict on duplication.** `ready-handoff` is the lane's only **pre-dispatch content** gate;
every neighbour is post-hoc (post-commit, post-spawn, post-report). No duplicate claim exists and
none is created. Two surfaces are shared and should be named as such in the lesson: the `Report:`
trailer (with `wave-census.mjs:57`) and `.ready` lane identity (with `inline-dispatch-evidence.mjs:254`).
The instrument also carries **one rule beyond the frozen 16 arms** — `REPORT_TRAILER`
(`ready-handoff.mjs:174-183`, `:319`) — which the probe's clean fixture does not satisfy (§6.2).
That is the concrete evidence that a shared surface already drifted once.

---

## 4. Sibling patterns worth adopting (with the change each implies)

Ranked by what the frozen claim actually needs. A1–A2 are C2 (coverage:omp); A3–A4 are C1 (operability).

| # | sibling pointer | pattern | what it would change here |
|---|---|---|---|
| A1 | `chousa-shokunin/tools/research-gate.sh:3686-3716` (docs `:685`) | freshness computed against a **supplied** `--as-of` date (`asof_days` vs `due_days`, `freshness=current\|overdue\|event`), not the host clock | C2's `age_days` is wall clock: `omp-census.mjs:215-219` `receiptAgeDays(doc, now = Date.now())`. The plan's after-state — "the closure re-derives it with one command" — is only true **on the capture day**; tomorrow the same command prints a different `age_days`. `--as-of DATE` (or honouring `SOURCE_DATE_EPOCH`) makes the disclosure reproducible. Routed, not in-round: it widens the frozen surface. |
| A2 | `kake-shokunin/scripts/receipt_replay.py:19-25`; `tsukuroi-shokunin/tools/measure-update-recheck.py:290-310` | a capture instant is bounded **above by the artifact's own committed time**, and cross-linked to a second record (`R15-C2-CAPTURE-LINK`), not merely "not in the future of the reader" | `SHAPE_CLOCK` (`omp-census.mjs:473-476`) refuses only `age < 0` against `Date.now()`. A receipt whose `captured_at` is today's date but whose bytes were written months ago is undetectable, and a receipt judged at two dates yields two verdicts. Kake's rule (≤ REV committer time) is stable for every reader. Routed. |
| A3 | `kumitate-shokunin/scripts/proxy-check.mjs:569` — `'pin.report-receipt-diff': … // proxy-check PIN_UNPINNED: no pin key covered this file`; stanza `SCORECARD.md:325` (`<!-- kumitate-gate-pins-v1`) | a gate script must carry a `pin.<name>` entry in the `PIN_MAP` **and** a line in the stanza, or `PIN_UNPINNED` fires forever | `scripts/ready-handoff.mjs` has neither: `proxy.txt` line 1 is `PROXY  warn  PIN_UNPINNED  scripts/ready-handoff.mjs has no pin.<name> key …`. The round-79 precedent (`report-receipt-diff`) is the exact recipe. **This is the C1 gap a closure would trip on.** |
| A4 | `kake-shokunin/scripts/instrument_receipts.py:61,376` | "`--write` is never admission evidence" | `ready-handoff` already complies by construction — every `writeFileSync` sits inside the `--selftest` fixture builder (`ready-handoff.mjs:223-241,287-402`); the normal path only reads. The *rule* is not stated in its header, and a future `--write` mode would let the gate author its own evidence. One header sentence. |
| A5 | `souji-shokunin/tools/impl-05.sh:171` `age=%sd` vs `souji-verify.impl-11.sh:375` `age_days=%s` | the failure mode of two spellings for one number in one lane | kumitate prints `age_days=` only (`omp-census.mjs:481,492`). Keep it single; do not let the `--as-of` addition (A1) introduce an `age=`. |

**Explicitly rejected adoptions.**

- `tabi-shokunin/scripts/pstack-seat.mjs:22-26` / `user-seat.mjs:22-26` — a closed seat/round
  grammar (`s01…s32`, `r01…r10`). Kumitate's seat names carry semantics (`K81ConnOverlap`), and
  the population is already bounded by BAND plus `SEAT_NAME` CamelCase ≤32
  (`ready-handoff.mjs:160-161`). Porting the grammar would forbid the descriptive names the
  round relies on.
- `tsukuroi-shokunin/tools/measure-update-recheck.py:315` `snapshot_sha256` inside the receipt —
  the lane already pins the receipt *bytes* externally (`pin.omp-shape`, `proxy-check.mjs:552`,
  `.ufo/pins/omp-shape.json`). A second in-document digest duplicates the pin without adding a
  reader.

---

## 5. Which sibling this round can harm

Exactly one, and only conditionally: **`tabi-shokunin`**, via its sibling-adjacency gate.

- `tabi-shokunin/scripts/check-adjacency.mjs:46-49` resolves siblings as `<fleet>/<lane>-shokunin`
  and requires each to be "exactly a git toplevel whose absolute git dir is `<dir>/.git`" and a
  **non-symlink directory**. `:62-67` reads the map only from `git cat-file blob` at pinned commits;
  `:76-80` a sibling pin is `<lane>-shokunin@<40-hex>:<path>:<line>` and that commit must be
  **reachable from the sibling's lane tip** (`refs/heads/master`, then `refs/heads/main`).
- The map carries one kumitate row: `tabi-shokunin/corpus/adjacency.tsv:10` —
  `kimi-webbridge-plugin-internals  kumitate  kumitate-shokunin@89cbd998ff956965634b14368231c6d117d6437e:SCORECARD.md:1723`.
- Measured now (`tabi-adjacency-pin.txt`): `89cbd998` is an ancestor of **both** the base tip
  `77c7a8b3` and `refs/heads/master` (`2ac1f34d`); `.git` is a real directory, non-symlink;
  `.jj` is present but irrelevant to the gate as written. **No harm today.**

The hazard is therefore *history*, not content: any operation that abandons `89cbd998`
(a jj rebase/amend/abandon over the round-70 repin commit, or a squash of it into a new commit)
makes tabi's gate fail with a sibling-ref-unreachable finding, and nothing in kumitate would
notice. Round 81's own rule already forbids it ("the L1 is the only writer", seats never commit),
so the constraint to carry into the closure is one sentence: **append to `master`; never rewrite
`89cbd998`'s ancestry.** Secondary standing constraint: converting `kumitate-shokunin/.git` to a
*gitfile* (a jj workspace layout) would fail tabi's `:46-49` lane check. C1/C2 add two scripts and
change one — no layout exposure this round.

No other sibling reads kumitate: `grep -rIl 'kumitate'` returns only kake wave evidence and
report markdown (`.ufo/waves/**`, `corpus/lessons/**`), no executable gate, and every cross-repo
reader in §2 pins **its own** lane root.

---

## 6. Contradictions observed at scan time (freeze divergences → named errata)

Stated as measured, not smoothed. Each is a post-freeze defect under the plan's own rule
("answered with a named erratum in the round lesson, never a silent edit").

**6.1 `--max-age` is dead on the CLI (real instrument defect).**
`scripts/omp-census.mjs:903` — `if (parsed.shape !== null) return runShape(parsed.shape, io, note);`
drops `parsed.maxAge`. `runShape` (`:463-494`) implements the gate correctly, and the 97-case
selftest exercises it through `capture()` (`:543`) which *does* pass `argv.maxAge` — so the suite
is green while the CLI is a no-op. Reproduction (recreatable; writes only scratch):
`--shape` a valid v2 receipt backdated 45 days with `--max-age 30` (and `--max-age 0`, and the
`--max-age=30` / `--shape=` forms) → `OMP_CENSUS: CLEAN (… captured=2026-09-20 age_days=45)` exit 0,
no `SHAPE_STALE`. Capture: `maxage-stale-repro.txt`. Frozen arms 6 (`max-age-stale`) and 7 inherit
this; arm 7 passes only because it expects CLEAN.

**6.2 Arm 1 is unsatisfiable with the frozen fixture.**
`probe81-c1.mjs:67` builds `context = "Every path is under ${lane}. Scratch root: …"` — it omits the
"relative to / write it at" sentence that `ready-handoff.mjs:180-183` requires whenever a seat
carries a relative `Report:` trailer (`:64` writes one for all seats). Result in `probe-c1.txt`:
`arm clean-fixture-ready FAIL … DRIFT REPORT_TRAILER (10 seat(s) …)`, while `arm round-81-live-ready
PASS` (the live dispatch's context does carry the sentence). The instrument's own fixture
(`ready-handoff.mjs:237`) carries it too — i.e. the frozen probe and the instrument disagree, and
`REPORT_TRAILER` is a 17th rule beyond the frozen 16.

**6.3 `materialise()` loses file modes, so arms 4 and 10 cannot pass.**
`probe81-c2.mjs:77-84`: directories get `mkdirSync(…, { mode: e.mode })`, files get
`writeFileSync(join(root, e.name), '')` with **no mode and no chmod** — so file modes come from
umask. `--compare` treats permission bits as a CEILING (see the census header's recorded decision),
so `probe-c2.txt` shows `arm compare-v1-accepted FAIL … changed=53 first=agent.db` and the same for
`compare-v2`. The instrument is not at fault: a snapshot→compare roundtrip on the live root is
`IN_SYNC … changed=0 transient=0` (`shape-v2.txt`, `compare.txt`).

**6.4 `--selftest --work DIR` fails closed on an absent DIR.**
`omp-census.mjs:530` `mkdtempSync(join(base, 'omp-census-selftest-'))` needs `base` to exist;
`ready-handoff.mjs:421` mkdirs it. `probe81-c2.mjs:205` passes `join(work,'selftest')`, which does
not exist → `ENOENT` → `probe-c2.txt` `arm selftest FAIL … out=Node.js v24.21.0`. Capture:
`census-selftest-work-enoent.txt` (exit 1). Without `--work` the suite passes (97 cases,
`census-selftest.txt`).

**6.5 Text drift in the frozen arm list.** The plan's arm 16 reads "`selftest` (30/30)"; the landed
instrument prints `READY_HANDOFF_SELFTEST: 31/31 pass` (`ready-selftest.txt`). Cosmetic, but it is a
frozen-text mismatch and the probe asserts behaviour, not the count, so it stays green.

**6.6 Counter state at this instant (not a tally).** `C81_C1: UNMET held=15/16` (`probe-c1.txt`) —
the single miss is 6.2. `C81_C2: UNMET held=8/15` (`probe-c2.txt`) — misses are 6.1 (arm 6),
6.3 (arms 4, 10), 6.4 (arm 14), plus arm 13 `receipt-pinned` (pin not yet re-baselined) and arms
11/12 (blocked by the open `C2_TOTAL_DRIFT`/`PIN_UNPINNED` proxy state, `proxy.txt`). None of these
is a claim about M.

---

## 7. ONE bounded proposal (connector return)

**Evidence.** §6.1: `omp-census.mjs:903` omits `parsed.maxAge`, so the C2 staleness gate never runs
on the CLI; the selftest cannot see it because it bypasses `main` (`:543`); frozen arms 6 and 7 sit
on the dead path (`probe-c2.txt`); `--max-age` is the only *new* gate behaviour C2 claims besides the
age disclosure.

**Affected axes.** coverage:omp (arms 6, 7, 14 move from fail to pass) and operability (a gate that
is wired to its flag is the whole point of round 81's axis). No score term moves: arm 11
(`stale-does-not-score`) and arm 12 (`proxy-terms-unchanged`) are untouched, so coverage:omp's
declared 10 is not re-priced.

**Proposed move (one edit, two lines).** In `scripts/omp-census.mjs`:
1. `:903` → `return runShape(parsed.shape, io, note, parsed.maxAge);`
2. `:529` → `mkdirSync(base, { recursive: true })` before `mkdtempSync`, matching
   `ready-handoff.mjs:421`, so `--selftest --work DIR` works on an absent DIR.

That is the minimal freeze-compliant repair: it restores behaviour the frozen arms already
describe, adds no rule, and changes no output line on any path that already works.

**Risks.** (a) It makes arm 6 pass, which means the gate now actually refuses a stale receipt —
the round must re-measure the committed receipt with `--max-age` *absent* for the after-state line,
or with a window that the real receipt meets, or the round's own `READY`/CLEAN line flips.
(b) The A1/A2 patterns (deterministic age, commit-time upper bound) are *not* part of this move;
if they land instead, `age_days` changes semantics and arm 2's `age_days=0` assertion must be
re-derived. Keep them routed to round 82.
(c) A one-line fix to a line the mutation-tester may already have targeted can read as
"symptom repair"; the paired justification is that the selftest's `capture()` bypasses `main`,
so the *coverage* hole (the suite never enters the CLI path) is what should be named in the lesson,
not just the dropped argument.

**Verification (exactly these, after the edit).**
```sh
node scripts/omp-census.mjs --selftest                       # expect VERDICT: PASS (97 cases), exit 0
node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json # expect captured=… age_days=0, exit 0
node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2 --tool .   # expect arms 6,7,14 PASS
node scripts/proxy-check.mjs                                 # expect coverage:omp still 10 (no term added)
```
and, for §6.3/§6.2, re-run `probe81-c2 --tool <base archive>` to confirm the base still fails the
same arms (no accidental widening of the base's score).

---

## 8. Handoff to the verifier

- Re-run §0 at M; my captures pin 06:50–06:56 and are superseded by any later state.
- §6.1 is a **real** defect with a reproduction that does not depend on my scratch dir
  (`--shape` a backdated copy of `.ufo/pins/omp-shape.json` with `--max-age`).
- §6.2/§6.3/§6.4 are frozen-counter defects: the *counter* must be answered by erratum, and the
  instrument is only at fault in 6.4 (mkdir). Do not "fix" 6.3 by loosening the instrument's
  permission ceiling — the ceiling is the correct rule and the live roundtrip proves it
  (`compare.txt`).
- §3's two shared surfaces (`Report:` trailer, `.ready` lane identity) want a sentence each in the
  round lesson; they are the only places a future round could create a genuine duplicate.
- §5's one-sentence constraint (append to `master`, never rewrite `89cbd998`'s ancestry) belongs in
  the closure, because the harm lands in tabi, not here.
