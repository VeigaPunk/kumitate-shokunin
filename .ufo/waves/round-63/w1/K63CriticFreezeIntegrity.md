VERDICT: The freeze is *nearly* sound — base receipts, pins, counts (14 fixtures, 25/25 selftest, 134 rows) and the "nothing else changed" claim all reproduce — but C1 is **dead as frozen**: the committed control `forged-no-sessions` cannot reproduce from committed bytes (git drops its empty `sessions/` dir), so frozen check I3 MISSes at the freeze and at every later revision; C2 additionally accepts degenerate one-word quotes, and I2's ≥64-seat floor contradicts the plan's own conditional wave 2 (w1 = 40 seats).

## Evidence

Scratch: `/tmp/kumitate-r63/K63CriticFreezeIntegrity`; sandbox = `git clone --no-hardlinks` of the lane (HEAD `b38a206`). Lane untouched (`git status` shows only my build/ + w1/ paths). Full log: `build/K63CriticFreezeIntegrity/repro.txt`.

1. Base receipts reproduce **byte-for-byte** (probes extracted from `b38a206`, run against the sandbox at `dfa6fca8`):
```
$ node inline63-probe.mjs base-clone dfa6fca8f362e9c962f5b940025a2619380b759b; echo exit=$?
INLINE63_UNMET held=0/6 checks=6 rev=dfa6fca8f362e9c962f5b940025a2619380b759b rule=I63 | I1 MISS tool-absent | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS tool-absent;cases=0<10;no-honest-case | I5 MISS row-absent | I6 MISS tip-receipt-absent
exit=1
$ node topology63-probe.mjs base-clone dfa6fca8…; echo exit=$?
TOPOLOGY63_UNMET held=1/7 checks=7 rev=dfa6fca8… rule=T63 | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS province-names-entry=false readme-map-clean=false
exit=1
```
`== base/inline63-base.txt`, `== base/topology63-base.txt`. `readme-map` → `README_MAP: DRIFT files=151 rows=150 covered=150 bad=2 …` exit 1; `proxy-check` → `PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 330: pin.make-dispatch-actual …` exit 2 — both equal `base/readme-map-before.txt` / `base/proxy-before.txt`.
2. The freeze itself, measured: `INLINE63_UNMET held=1/6 … | I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH | I5 MISS row-absent | I6 MISS tip-receipt-absent` exit 1 (`rev=b38a206…`). I1 passes (`INLINE_DISPATCH_SELFTEST: PASS (25/25)` exit 0).
3. Numbers: 14 `expect` files under `controls/inline/` (`git ls-tree -r … | grep -c '/expect$'` → 14); 25/25 selftest cases (plan says 25 ✓); 13 forgery cases carry 13 *distinct* finding ids; `COUNTER_PINS: CLEAN pins=21` exit 0 (17→21 pins, 4 added, 0 removed/changed, no dup keys, sha256 of all four match `sha256sum`); registry rows at base = 134 (`## Registry` parse), `assimilation/reg-ids` 134, `staged-ids` 155, `collisions` = `S195`; `quarantine-slice` = 9 lines; w1 role mix 13 exec + 6 scribe + 1 simplifier = 50%, attack 12/40 = 30%, all 40 names `K63*`.
4. Real-host control re-runs (committed gate, from the freeze archive) match `controls/inline-real-hosts.txt` verbatim: `kengaku r35 build` → `CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)` exit 0; `mori r47 w2` → `CLEAN (seats=37 …)` exit 0; `mori r47 w1` → `DRIFT (seats=42 sessions=42 done=42 reports=41 dead=0)` + `FINDING REPORT_ABSENT:MutPinSemanticCell` exit 1; `tameshi r45 w2` → `DRIFT (seats=36 sessions=35 …)` + `FINDING SESSION_FOREIGN:ScribeScorecard` exit 1.
5. Nothing else moved: `git diff --name-status dfa6fca8 b38a206 | awk '{print $1}' | sort | uniq -c` → `197 A / 1 M`; outside `.ufo/waves/round-63/` only `M .ufo/pins/counter-pins.json` and `A scripts/inline-dispatch-evidence.mjs`. Plan ordering: plan mtime 17:47:12, freeze commit 17:47:33, `w1.ready` 17:53:08 and untracked; `origin/master..dfa6fca8` = 0 (ahead=0 ✓); `SCORECARD.md:1949` declares saturation 9 / N=3 in round 34; Capabilities table last *admitted* row `cite-sources` round 59 (round-60 `dispatch-evidence` is "history only, not an admitted capability", `SCORECARD.md:2905`); round 62 has no `plan.md` and its lesson opens "Declared: none" ✓.
6. Topology controls regenerate: `node gen (unpatched) base-clone dfa6fca8 <out>` → 12/12 `AS-EXPECTED` (c0 `TOPOLOGY63_HELD held=7/7`), so the C2 control suite is re-derivable with one command (fixture revs are ephemeral by construction).
7. `dispatch-evidence` on round 63 w1 → `FINDING PROGRESS_ABSENT` (the plan's premise that the old gate cannot read inline waves ✓). Dispatcher log has `spawned kumitate 63 w1 40` (line 465) and 40 `K63*.jsonl` transcripts exist.

## Findings

**K63CriticFreezeIntegrity-1 — BLOCKER — C1's I3 is unsatisfiable as frozen; the claim fails its own kill rule.**
Attacks: C1 (and the plan's I3 sentence "every case exits as its `expect` file names" and its "A do-nothing lane … reads NOT_A_DISPATCH").
`controls/inline/forged-no-sessions/sessions/` is an **untracked empty directory** (worktree `drwxr-xr-x … sessions`, 8 bytes); git stores no empty dirs, so `git ls-tree -r b38a206 -- …/forged-no-sessions` lists 9 blobs and no `sessions/` member. `inline63-probe.mjs` I3 runs the gate from `git archive`, so the case reads `INLINE_DISPATCH: FAIL-CLOSED sessions-root-absent` + `FINDING SESSIONS_ROOT_ABSENT` **exit 2** while `expect` names `1 / NOT_A_DISPATCH` → `I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH` at `b38a206` and at every descendant. I4 escapes only because it `mkdir -p`s its own empty dir.
Repro: `node /tmp/kumitate-r63/K63CriticFreezeIntegrity/inline63-probe.mjs <clone> b38a2065ab8ac5b198f6569b9013d04411c3d40d` (exit 1, I3 MISS); direct: `node scripts/inline-dispatch-evidence.mjs --root …/forged-no-sessions/lane --round 7 --wave w1 --sessions-root …/forged-no-sessions/sessions --dispatcher-log …/forged-no-sessions/dispatcher.log` → exit 2.
Smallest safe correction (verified in a fixture clone, **not** applied to the lane; patch text in `build/…/patch-forged-no-sessions.md`): commit a zero-byte `…/forged-no-sessions/sessions/.keep` → `held=2/6 … | I2 MISS … | I4 MISS … | I5 MISS row-absent | I6 MISS tip-receipt-absent`, i.e. I3 passes and only the round's real work remains. Gate behaviour is unchanged (it looks only for `**/<Seat>.jsonl`).

**K63CriticFreezeIntegrity-2 — MAJOR — I2's seat floor contradicts the plan's own conditional wave 2.**
Attacks: C1's pass condition vs §Round shape. I2 requires `total < 64 || total > 100 → MISS`; the plan dispatches "Wave 1 (40 seats)" and makes wave 2 run "only if wave 1 yields >= 32 distinct attack items". `w1-dispatch.json` → `counts: {"spawn":40,"resume":0,"total":40}`. If wave 1 yields < 32 distinct attack items the plan permits skipping wave 2, and then total = 40 → I2 MISS *for a reason the plan calls optional*. The claim can therefore fail without any defect in the gate.
Repro: `node -e 'console.log(require("./.ufo/waves/round-63/w1-dispatch.json").counts)'` → `{ spawn: 40, resume: 0, total: 40 }`; read `plan.md` I2 ("sum to between 64 and 100") against §Round shape.

**K63CriticFreezeIntegrity-3 — MAJOR — C2's grounding arm accepts degenerate quotes (do-nothing hole in substance).**
Attacks: T4/T5 ("each found … in that row's capture" / "found in a fresh live fetch"). Nothing sets a lower bound on a quote; any common word satisfies both. Demonstrated with the *honest fixture* of the committed generator whose only change is the quote selection (`- S109 — "the"`, `- S109 — "and"`, one word each): `AS-EXPECTED c0-honest exit=0 expect=HELD :: TOPOLOGY63_HELD held=7/7 checks=7 rev=f8bc5c01… rule=T63`, and all 11 variants still AS-EXPECTED. A lane can enter `multi-agent-coordinator-topologies.md` with six occurrences of "the" in `## Located quotes` and read `TOPOLOGY63_HELD 7/7` without the entry carrying a single grounded claim.
Repro: `node build/K63CriticFreezeIntegrity/gen-degenerate.mjs <lane-clone> dfa6fca8f362e9c962f5b940025a2619380b759b <out>` (patched copy of the frozen generator; `diff` it against `probe/make-topology-controls.mjs` — one line, line 61). Smallest correction: require each quote ≥ N words (or ≥1 clause) in T4/T5 — a *strengthening*, so the ratchet permits it.

**K63CriticFreezeIntegrity-4 — MEDIUM — the shipped gate is the only gate not pinned.**
Attacks: freeze integrity of the object I1/I3 measure. `.ufo/pins/counter-pins.json` pins the two probes and the two control generators but **not** `scripts/inline-dispatch-evidence.mjs`, while every prior shipped gate is pinned (`receipt-attest`, `source-capture`, `source-dupes`, `readme-map`, `receipt-evidence`). A later round can edit the gate (relax `NOT_A_DISPATCH`, keep 25 selftest cases) and `COUNTER_PINS: CLEAN pins=21` still reads clean, while the plan's own convention ("the tool and the stanza travel together", `SCORECARD.md:493`) says otherwise.
Repro: `node -e '…pins.filter(p=>p.path.startsWith("scripts/"))'` → the five above, no `inline-dispatch-evidence`.

**K63CriticFreezeIntegrity-5 — MEDIUM — a committed receipt records a result committed bytes do not produce.**
Attacks: provenance of `controls/inline-receipts.txt` (the plan's "the same words appear in … the receipts' labels"). Its `forged-no-sessions exit=1 want=1 NOT_A_DISPATCH` line came from **worktree mode**, where the untracked empty `sessions/` existed; I3 runs from the archive and gets exit 2 (finding 1). One receipt line is therefore a transcript of a state that is not in the repository.
Repro: `grep forged-no-sessions .ufo/waves/round-63/controls/inline-receipts.txt` vs the archive run in finding 1.

**K63CriticFreezeIntegrity-6 — LOW — `base/census-before.txt` is not re-derivable with one command.**
Its first column reads `kumitate`; the lane's dir form prints `kumitate-shokunin`, `--file` prints `file` — neither is `kumitate`. The plan also attributes "134 rows" to this receipt, but `validate` prints no row count (134 is only obtainable from `census` mode: `file rows 134`). Substance (6× W04, exit 0) reproduces.
Repro: `bash scripts/sources-census.sh validate /home/vgpnk/Projects/shokunin/kumitate-shokunin | head -1` → `kumitate-shokunin\tW04\t…`.

**K63CriticFreezeIntegrity-7 — LOW — the real-host sweep's "every" is false.**
`controls/inline-real-hosts.txt` header: "every completed inline wave on this host". `kake-shokunin r55 w1` has a dispatcher line (`spawned kake 55 w1 40`), a committed `round-55/w1-results.json`, and reads `INLINE_DISPATCH: DRIFT (seats=40 sessions=39 done=38 reports=39 dead=1)` + `FINDING SESSION_FOREIGN:ScribeQuality` + `DEAD ScoutScopeOverlap` — it is omitted. (chousa r49 w1/w2 and kama r41 are spawned too but fail closed on uncommitted dispatch/results, so their exclusion is defensible.) The plan's weaker sentence ("real-data honest controls on other lanes' completed waves") stays true.
Repro: `node scripts/inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kake-shokunin --round 55 --wave w1`.

**K63CriticFreezeIntegrity-8 — LOW — plan sentences a reader cannot re-derive with one command.**
(i) "the last verified capability row is round 59" — the Capabilities table's last row reads `dispatch-evidence` → `round 60`; 59 requires the prose correction at `SCORECARD.md:2905`. (ii) "T2 … exactly 11 cells" — the code tests `c.length !== 13` (11 real cells + the two empty strings from `split('|')`); equivalent, but a sentence↔code diff shows 11 vs 13. (iii) T2's code also rejects `tier === ''`, a condition the plan's T2 sentence does not state. (iv) "Round total 80–100" is prospective. (v) "controls/topology/ … one honest fixture reads HELD 7/7" — re-derivable by one command, but the committed `summary.txt` `rev=` values are ephemeral fixture commits and can never match on re-run. Everything else I checked (14, 25, 32, 64, 100, 10, 6, 7, 25 words, ≥2 rows, 134, 9 quarantine rows, S195, axes 9/10/10/10/10, saturation 9 @ r34, ahead=0, plan-before-ready) re-derives.

**K63CriticFreezeIntegrity-9 — OBSERVATION (not a defect of the freeze) — the plan's own stated limit is already visible in the log.** The `done <lane> <wave> <results path>` lines the gate's `DONE_LOG_ABSENT` arm needs for the three CLEAN real-host controls were appended at 17:11–17:26, hours after those waves ended (kengaku build `done` 14:44:17 without a path; path-bearing line 17:13:58; mori w2 17:26:52). The third record is backfillable by the same session, exactly as C1's "Stated limit" says. No action; a reviewer of C1's I2 should read the `done` line's timestamp, not just its presence.

## Artifacts

- `.ufo/waves/round-63/w1/K63CriticFreezeIntegrity.md` (this report)
- `.ufo/waves/round-63/build/K63CriticFreezeIntegrity/repro.txt` (all commands + verbatim outputs)
- `.ufo/waves/round-63/build/K63CriticFreezeIntegrity/patch-forged-no-sessions.md` (proposed freeze repair, patch text only)
- `.ufo/waves/round-63/build/K63CriticFreezeIntegrity/gen-degenerate.mjs` (one-line patch of the frozen generator, line 61)
- `.ufo/waves/round-63/build/K63CriticFreezeIntegrity/ctl-degenerate/` (12-case receipt incl. `c0-honest … held=7/7`)
- `.ufo/waves/round-63/build/K63CriticFreezeIntegrity/{inline63-probe,topology63-probe}.mjs` (extracted from `b38a206`, sha256 unchanged)
- No tools installed or upgraded; no pacman/uv/npx transaction.

## Limits

- T5's live-fetch arm was not re-run for the *real* C2 rows (they do not exist yet); I only re-ran the fixture path. T5 also cannot distinguish a real source from a lane-controlled URL: the URL is read from the lane-authored row, and no control (`f1`..`f11`) opens a row pointing at a host the lane can edit.
- T6/T7 at a future M, I2/I4/I5/I6 at a future M, and the `--report` dead-seat arm are untested (no committed wave yet). `close/inline63-tip.txt` does not exist, so I6 was only exercised as MISS.
- The harness's role validator (the plan's "labrat, sonic, distiller are refused") is not in the fleet scripts I could find; I checked only that the dispatched payload uses the 10 accepted roles.
- I did not verify the staged-package id-collision guard beyond the committed `reg-ids`/`staged-ids`/`collisions` files, and did not open `merge/kumitate/` itself.
- `git archive` fidelity is the only "committed bytes" reader I exercised; a rev with a submodule or `.gitattributes` export-ignore would change I3's inputs — the lane has none I saw.
