VERDICT: `omp65-probe.mjs` implements O1-O8 recognisably, the honest 8/8 path exists and the base/control receipts reproduce, but four forgeries pass at 8/8 (a probe that measures nothing, rows pinned by an anchor mention, a "capture" outside the revision, and a PROVINCE line outside Frontier) and two honest-looking entries fail (12-of-15 measurement keys; a header triple on lines 6-8) — the plan's own words are the source of at least one of those failures.

## Evidence

All runs are `node .ufo/waves/round-65/probe/omp65-probe.mjs <clone> <rev>` unless noted; fixture = `git clone --no-hardlinks` of the lane at 2ca91a0c (all git writes `-C <clone>`); the lane was never written.

- Probe determinism (3 runs, lane copy): byte-identical 15 keys, `real_version=18.12.6`, `real_bytes=256702432`, exit 0, 0.51-0.55 s. See `build/K65ReviewProbeO65/receipts.txt` §1.
- Frozen before-receipt reproduces verbatim: `OMP65_UNMET held=0/8 … | O1 MISS entry-absent | … | O8 MISS no-amendment-heading,…` EXIT=1 (= `base/omp65-base.txt`).
- Do-nothing control reproduces: `bash …/omp-donothing-control.sh <lane> 47fe2383 …/omp65-probe.mjs` → `OMP65_UNMET held=1/8 … rev=fd16e02cf4014666e01b61b08821626942a9b24d rule=O65 | O1 MISS trio source=true verified-at=false recheck=true ids=1 | …` EXIT=0 (only O8 passes, as the plan says).
- Hand-made honest entry (4 rows S201-S204, 4 real captures whose live fetch is byte-identical, 7 bullets, all 15 keys, PROVINCE line, README row + readme-map pin, appended amendment): `OMP65_HELD held=8/8 checks=8 rev=976982ef6a80bdc62dcc7dbe11b8736cc823a638 rule=O65` EXIT=0. So O1-O8 are jointly satisfiable and there is no false negative for backticks, inner double quotes, hyphens, an em dash inside a quote, a quote ending mid-sentence, or `=` inside a value (M0 HELD; M5 MISS reason `real_version:stated=18.12.6=x:live=18.12.6` proves the full value is captured).
- Mutant verdicts: HONEST 8/8; M0 8/8; M1 8/8; M2 8/8; M3 6/8 (`O4 MISS S204:quote-not-in-capture`, `O5 MISS S204:quote-not-live`); M4 8/8; M5 7/8; M6 8/8; M7 7/8; M8 7/8 (only O7); M9 8/8; M10 7/8 (`O8 MISS no-amendment-heading`); M11 7/8 (`O6 MISS real_sha256:stated-not-live`); M12 8/8. Revs and full lines in `receipts.txt` §3.

## Findings

**K65ReviewProbeO65-1 — HIGH — O3 accepts a "capture" that is not in the revision.** `rd()` is `readFileSync(join(T, rel))` (`omp65-probe.mjs:55`): `path.join` normalises `..`, so a committed pin can read a host file outside the `git archive` temp dir. M12 sets S204's pin to `../kumitate-r65/K65ReviewProbeO65/live/S204.ts` (a /tmp file, absent from the revision) and the counter prints `OMP65_HELD held=8/8` — plan O3 says "a committed capture".
Repro: `git -C <clone> checkout --detach 976982ef6a80bdc62dcc7dbe11b8736cc823a638 && bash build/K65ReviewProbeO65/build-fixture.sh <clone> M12-pin-escapes-archive && node …/omp65-probe.mjs <clone> $(git -C <clone> rev-parse HEAD)`. Patch: `proposals.md` P1.

**K65ReviewProbeO65-2 — HIGH — O6 measures self-consistency, not the host: a probe that measures nothing passes.** O6 runs the archive's own `scripts/omp-binary-probe.sh` (`:201`) and compares its `OMP_BIN:` keys with the entry. M1 replaces that script with 15 `echo` lines and edits the body to claim `omp/18.12.3` and `lit_2026_07_28=4`; verdict `OMP65_HELD held=8/8`. This is the assigned forgery "Host measurements copied from the probe but the body claims something else" — accepted as declared (the plan's limit covers wrong-but-grounded entries), but a probe that never reads `omp.real` is outside that limit.
Repro: the M1 stage of `build-fixture.sh`. Patch: `proposals.md` P3.

**K65ReviewProbeO65-3 — HIGH — "rows pinned to the installed version" is a whole-row substring test.** `pinned` tests `rows.get(id).includes('/v18.12.6/')` (`:210`), not the URL cell. M6 rewrites all four row URLs to the moving `main` branch and puts `/v18.12.6/` only in the anchor cell → `OMP65_HELD held=8/8`, although plan O6 says "their URL carries `/v<real_version>/` or the release commit". The plan's ground ("rows opened this round at the tag of the installed release") is therefore not enforced.
Repro: M6 stage. Patch: `proposals.md` P4.

**K65ReviewProbeO65-4 — HIGH (false negative) — the plan's ">= 12 bullets" loses to the code's set equality.** `:197` requires `>= 12`, then `:205` requires every live key to be stated, so an entry stating exactly 12 of the 15 probe keys MISSES: M7 → `O6 MISS lit_2025_03_26:stated=undefined:live=2;collab_hosts_literal:…;docs_phrase_never_replayed:…`. The plan sentence is internally split (">= 12" vs "set equal"); the code takes the strict half and an honest scribe reading the first half fails. Live consequence: `build/K65ScribeEntryB/omp-installed-release-mcp-runtime.md` states 22 keys and would MISS with 7 `stated-not-live` reasons (its extras: `real_sha256`, `lit_2025_06_18`, `decl_2025_11_25`, `changelog_versions`, `changelog_installed`, `docs_heading_collab`, `docs_heading_lifecycle`) — verified in kind by M11 (`O6 MISS real_sha256:stated-not-live`). No counter change is possible without relaxing a check, so the L1 must land an entry that lists exactly the 15 keys and say so in the report.

**K65ReviewProbeO65-5 — MEDIUM (false negative) — O1's window (14 lines) is not the lane gate's window (5 lines).** `omp65-probe.mjs:76` reads `slice(0, 14)`; `scripts/sources-check.mjs:369` reads `slice(0, 5)`, and O7 runs that gate. M8 puts four `source:` lines in front (`verified-at:` line 5, `recheck:` line 6) → O1 PASS, `OMP65_UNMET held=7/8 … | O7 MISS … sources-check-clean=false` (`HEADER_INCOMPLETE … recheck: in first 5 lines`). Live consequence: `build/K65ScribeEntryA/omp-installed-release-mcp-runtime.md` has six `source:` lines 1-6, `verified-at:` line 7, `recheck:` line 8 — as written it fails O7 while satisfying O1's words. `proposals.md` P6.

**K65ReviewProbeO65-6 — MEDIUM — O3/O4 do not bind a capture to its row's URL.** The pin supplies only a path; O4 checks quotes against that file and O5 against the live URL. M2 points S204's pin at the S203 patch capture while the row's URL stays `…/v18.12.6/…/client.ts`, and quotes a string present in both (`transport.setProtocolVersion?.(result.protocolVersion)`) → `OMP65_HELD held=8/8`. This is the assigned forgery "rows whose URL contains /v18.12.6/ but whose captures are of another file" — accepted. Contrast M3 (a quote lifted from another row's capture) is correctly caught by O4 and O5.
Repro: M2 / M3 stages. Patch: `proposals.md` P2.

**K65ReviewProbeO65-7 — MEDIUM — O7's PROVINCE check is a keyword substring with no section membership.** `:222` accepts any line containing the entry path and `/frontier|band|ground|first entry|advanced/i`. M4 names the entry under `### Adjacent — reported, never absorbed` as "background only; not absorbed, not entered" (`background` contains `ground`) → `OMP65_HELD held=8/8`. Plan O7 says "on a frontier line". Patch: `proposals.md` P5.

**K65ReviewProbeO65-8 — LOW — O8 accepts an amendment that contradicts the entry.** M9 appends `## Amendment 2026-10-25 — Version skew, corrected` stating the entry "is withdrawn … the installed release negotiates `2026-07-28`" → `OMP65_HELD 8/8`. Within the plan's declared limit ("cannot tell a sound entry from a well-grounded wrong one"), but it belongs on the ratchet list. (The append-only rule itself is sound: M10 demoting the heading to a bullet reads `O8 MISS no-amendment-heading`; the base prefix comparison is exact bytes at `:243`.)

**K65ReviewProbeO65-9 — LOW — the "entry body names lit_2026_07_28 and real_version" check is vacuous.** `:214` tests `text.includes(...)` over the whole file, and the `## Host measurements` bullets themselves contain both strings, so the sub-check is satisfied by the measurement list alone (true in every HELD mutant, including M1's contradicting body).

**K65ReviewProbeO65-10 — LOW — diagnostics/traps in O2.** `:108` rejects `c.length !== 13` and prints `NF=13` while plan O2 says "exactly 11 cells" (13 split fields = 11 cells, so the rule is right and the message reads as an off-by-two); a row written without outer pipes (11 parts) is rejected. `:112` (`usedBy.includes(ENTRY)`) requires the full repo-relative path, while the plan says only "a `used-by` cell naming the entry" — a stem-only cell fails. Neither is a hole; both will cost a scribe a round trip.

**K65ReviewProbeO65-11 — LOW — the do-nothing control cannot fail and is not reproducible from frozen bytes.** `probe/omp-donothing-control.sh:26` ends `node "$PROBE" … || true`, so the script exits 0 even if the counter regressed to 8/8 (only the receipt text would show it); its input is `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/omp-host-harness-protocol-skew-2026-10-27.md`, a mutable file outside the lane, so `base/omp65-donothing.txt`'s exact MISS text is not reproducible from the freeze commit; and its header comment claims it adds "a README row", which the code never does (hence `readme-map-clean=false` in its own receipt). Patch: `proposals.md` P7.

**Not findings (checked, sound):** O5's "unreachable = MISS" (`:173` pushes `live-unreachable`, and the bullet loop cannot skip a row whose fetch failed); O4's bullet regex `:144` (`[—-]`, greedy `"(.+)"`) and the 25-word rule (`:155`); O8's prefix equality; O2's "absent at the base revision" (`:106`); O2's URL/tier/status/opened cells (13-field mapping matches the registry header); the base `git show` fallback (`:97`) is safe on any clone that contains 47fe2383.

## Artifacts

- `.ufo/waves/round-65/w1/K65ReviewProbeO65.md` (this report)
- `.ufo/waves/round-65/build/K65ReviewProbeO65/honest-entry.md` — the 8/8 hand-made entry
- `.ufo/waves/round-65/build/K65ReviewProbeO65/build-fixture.sh` — clones, stages HONEST + M0-M12, commits with fixture identity
- `.ufo/waves/round-65/build/K65ReviewProbeO65/mutants/*.patch` — 14 exported states (HONEST + M0-M12)
- `.ufo/waves/round-65/build/K65ReviewProbeO65/receipts.txt` — every command and verdict line
- `.ufo/waves/round-65/build/K65ReviewProbeO65/proposals.md` — P1-P7 strengthening diffs (not applied; the counter is frozen)

## Limits

- I did not run a network-failure case for O5 (code-read only) and did not exercise `--entry`/`--opened` overrides.
- The >14-source-line truncation of `ids` (`:76`) is code-read, not run: citations below line 14 would be dropped from O2/O3/O4.
- M12's escaping pin uses a file in my /tmp scratch (deleted afterwards); the mechanism (path normalisation) is general, the specific path is not portable. To re-run it: `mkdir -p /tmp/kumitate-r65/K65ReviewProbeO65/live && cp <clone>/.ufo/waves/round-65/build/K65ReviewProbeO65/capture/S204.ts /tmp/kumitate-r65/K65ReviewProbeO65/live/S204.ts` before staging M12.
- I did not verify the scribes' own pin/row files beyond the two predicates I cite (draft A header lines, draft B key set); row/capture correctness for S205/S206 remains theirs.
- The lane working tree was being edited by sibling seats during this review (an `S201` row appeared at `corpus/SOURCES.md:12` in one read and was gone minutes later); every claim above is against a clone of 2ca91a0c, never the worktree.
- No tool was installed; no lane, fleet, `.ufo/state`, pins or index bytes were written outside my report/build paths.
