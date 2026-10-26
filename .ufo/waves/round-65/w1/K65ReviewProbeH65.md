VERDICT: The H65 counter matches the plan's five sentences almost line-for-line, but it does not measure the tool: a 67-line stub that reads the counter's own answer key (controls `spec.json` + `base/harm-pair*-freeze.txt`) from the archive it is executed from scores **HARM65_HELD held=5/5**, and a 26-line canned stub already passes H3.

## Evidence

All runs: lane copy `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /tmp/kumitate-r65/K65ReviewProbeH65/lane` (`toplevel` verified, every commit `-C <clone>` with per-call identity), the frozen probe run as
`node .ufo/waves/round-65/probe/harm65-probe.mjs /tmp/kumitate-r65/K65ReviewProbeH65/lane <rev>`; each stub placed at `scripts/harm-matrix.mjs` in its own commit on branch `k65attack` in the clone. The lane, the probe and the controls were never edited.

| subject at `<rev>` | verdict line (verbatim) | exit |
|---|---|---|
| do-nothing stub `b9f16ddbaa524d4a66a573cedba6fcdee968e043` | `HARM65_UNMET held=0/5 checks=5 rev=b9f16ddbaa524d4a66a573cedba6fcdee968e043 rule=H65 \| H1 MISS selftest exit=0 line=none \| H2 MISS case-01-honest-held:got exit=0 rows=[]; … \| H3 MISS A exit=0 harm=[]; B exit=0 bad=0 repaired=[] \| H4 MISS real-tool-passes-H2=false stubs-that-passed=0 \| H5 MISS summary=HARM_MATRIX: CLEAN gates=1 … exit=0` | 1 |
| canned pairs (4 hand-written rows) `64c99d3286f862251fab99ae1c54a8e2f3be9de0` | `HARM65_UNMET held=2/5 checks=5 rev=64c99d3… \| H1 MISS selftest exit=0 line=none \| H2 MISS case-01…rows=[] \| H4 MISS real-tool-passes-H2=false stubs-that-passed=0` → **H3 and H5 passed** | 1 |
| blind echo (no gate ever runs) `4767ad21395901e2992c24fee168b970eabb58f6` | `HARM65_HELD held=5/5 checks=5 rev=4767ad21395901e2992c24fee168b970eabb58f6 rule=H65` | **0** |
| blind echo reporting 14 of 20 registry gates `2726e5cbbd46249029c0aa2b92f654719e0052c4` | `HARM65_HELD held=5/5 checks=5 rev=2726e5cbbd46249029c0aa2b92f654719e0052c4 rule=H65` | **0** |
| honest tool, freeze `2ca91a0c81542cad5f731049aa55dd2f99ade98d` | `HARM65_HELD held=5/5 checks=5 rev=2ca91a0c81542cad5f731049aa55dd2f99ade98d rule=H65` (frozen receipt `base/harm65-at-freeze.txt` reproduces identically; my own run: exit 0, `real 5m1.546s`, `user 52m23s`) | 0 |

Fixture facts I measured at `2ca91a0`: registry `scripts/harm-matrix-gates.json` = **20** gates; `scripts/harm-cases.json` = **26** cases (receipt: `HARM_MATRIX_SELFTEST: PASS (26/26)`); controls = 16 dirs, **9** distinct ids, **9** exit-0 cases (matches plan's "16 at freeze", ">= 8 (9 at freeze)", ">= 2").

Plan vs code, sentence by sentence (H1..H5): thresholds 20 / 14+8+2 / — / — / 14 all present at probe lines 115, 92-105, 183; both pairs are full 40-hex at 36-37; "exactly readme-map and proxy-check" is an exact set at 143; H2's non-vacuity clause is `realH2ok` at 175. Two real disagreements: H5's "over the full registry" is coded as `gates >= 14` (183) — 14 of 20 accepted; H4's "each run through the same H2 + H3 harness" is not coded (172, see below).

Replace refs are not content pins (`git archive` honours them):
```
$ git -C D replace $C1 $C2 ; git -C D archive "$C1" | tar -xO f   →  B        # C1's tree says A
$ git -C D show "$C1:f"                                            →  B
$ git -C D rev-parse --verify "$C1^{commit}"                       →  3163df3995…   # C2's hash, C1=57592833…
```
The probe's fixture identity is visible to its subject (probe:63 `tmp('harm65.fx.')`, probe:38 `user.name=harm65-probe`):
`ident=harm65-probe <harm65@invalid>|b` from a fixture built exactly as `build()` does.

## Findings

**K65ReviewProbeH65-1 — HIGH — the counter reads HELD for a tool that never runs a gate.** H1/H2/H3/H5 are all satisfied by text the subject can read about itself: `archive()` (probe:50-54) extracts M, `TOOL` runs from `<A>/scripts/`, and `HERE/..` therefore reaches `.ufo/waves/round-65/controls/harm/case-*/spec.json` (H2's `expect`) and `.ufo/waves/round-65/base/harm-pair*-freeze.txt` (H3's rows). `stub-blind-echo.mjs` matches a fixture by its committed bytes + `gates.json`, echoes `expect.rows`/`exit`, prints `PASS (20/20)` for H1 and `HARM_MATRIX: CLEAN gates=20 … harm=0` for H5, and scores 5/5 exit 0. Plan H2's premise ("the probe builds each fixture repository itself") holds, but the answer key travels with the subject, so building fixtures adds no blindness. Repro: copy lane → cp `build/K65ReviewProbeH65/stubs/stub-blind-echo.mjs` over `scripts/harm-matrix.mjs` → commit in the clone → run the probe at that rev. Fix: P2+P3 in `build/K65ReviewProbeH65/probe-h65-strengthening.md`.

**K65ReviewProbeH65-2 — HIGH — H3 is text-only and is passed by four hand-written lines; it verifies the history, not the tool.** `h3` (136-148) parses gate name and id only; it never checks the `base=`/`tip=` cells or any text against the probe's own gate run, so a tool that classifies nothing but knows the two published pairs passes. `stub-canned-pairs.mjs` (2 rows per pair, no git read, no gate run) yields H3 pass, whole counter 2/5. This is the ratchet's own class ("a masked verdict") reaching HELD on the two checks H5 also passes. Fix P3: require `base=`/`tip=` cells to equal `CLEAN`/`NOT_CLEAN` derived from the probe's direct runs, for the two named pairs **and** >= 2 pairs sampled at run time from `git rev-list --first-parent` that appear in no committed receipt (the reversed pair is not enough — a cheat can swap pair A's two `*_text` values).

**K65ReviewProbeH65-3 — HIGH — H5 is self-reporting and its floor is not the registry (plan/code disagreement).** `bad` (182) is computed from the tool's own summary numbers, so `exit` 0 "exactly when harm + harm_absent + new_red = 0" is only internal consistency; the rows are never intersected with the summary, so a masked verdict (HARM rows, `harm=0`) passes. And `Number(m[2]) >= 14` (183) accepts 14 of the registry's 20 gates, while plan C1 H5 says "over the full registry": `stub-blind-echo-gates14.mjs` scores 5/5. Fix P4: `rowIds === registry ids`, `gates === regIds.length - ABSENT_BOTH`, per-id counts and the `CLEAN|HARM` word recomputed from the rows.

**K65ReviewProbeH65-4 — MEDIUM — H4's H3 leg does not use the H3 harness, and no canned-stub control exists.** Line 172 calls `spawnSync(s[0], [...s.slice(1)])` with no `--lane/--base/--tip`, so `rowsOf` sees no HARM_ROW and every stub "misses" H3 for free; H4 therefore only proves that a tool printing no rows fails, which needs no counter. Plan H4 says "each run through the same H2 + H3 harness". Fix P6/P3: add the canned stub to `stubs` and invoke it through `matrixRun` — with today's code it would pass and H4 would (correctly) fail.

**K65ReviewProbeH65-5 — MEDIUM — the pair hashes pin names, not bytes: `refs/replace` redirects both the tool's view and the probe's direct runs.** `git archive` honours replace refs (evidence above), so a lane `.git` carrying `refs/replace/<pair>` makes H3's "direct runs ... independent of the tool" read fabricated trees; the tool's sandbox (`git clone`, lane → tmp) does not inherit `refs/replace`, so the two legs read different histories and only a lying tool can reconcile them. A rewritten/force-pushed branch is safe (fail-closed: `archive` → null → H3 MISS), a replace ref is not. Fix P1 (`GIT_NO_REPLACE_OBJECTS=1` + refuse to score when `for-each-ref refs/replace` is non-empty).

**K65ReviewProbeH65-6 — LOW — H2's `expect` is bound to nothing.** `controls/harm/MANIFEST.sha256` is verified by no code (`grep -rn 'MANIFEST.sha256' scripts/ .ufo/waves/round-65/probe/ SKILL.md` → no hits); `counter-pins` pins the manifest's bytes only, not each `case-*/spec.json`, and `scripts/harm-cases.json` is pinned nowhere (only `gen-harm-cases.mjs` is). A tool paired with edited specs passes H2 with no echo at all. Fix P6.

**K65ReviewProbeH65-7 — LOW — H1's floor is 20 while the case file holds 26 and is not tied to it.** `PASS (20/20)` is accepted (my blind stub prints exactly that); `n >= 20` lets six cases be deleted or skipped. Plan says only "n >= 20", so this is a plan weakness, not a code/plan disagreement — strengthen with `n === cases.length` (P5).

**K65ReviewProbeH65-8 — LOW — H2 and H3 parse rows differently.** `runCase` (84) returns the raw line when the regex misses; `rowsOf` (135) returns `null` and drops it. A tool can emit a `HARM_ROW` without `base_text` and be compared verbatim in H2 while the same line vanishes in H3.

**K65ReviewProbeH65-9 — LOW — two plan phrases are not measured by H2.** "each altering one thing" and the `spec.json`'s `expect.summary` are never read (H2 uses only `expect.exit`/`expect.rows`); a control set that does not alter anything (base == tip) passes as long as the declared rows match.

Answers to the seat's three questions: the pairs **are** pinned by full hashes (so history rewrite degrades to MISS), but see F5 for replace refs; the direct cross-check **is** independent of the tool (it runs `scripts/readme-map.mjs` and `scripts/proxy-check.mjs --strict` from a `git archive` of each revision) but covers only 2 gates at 2 pairs and shares the lane's object namespace; the probe's fixture identity **is** detectable by the subject (author `harm65-probe`, `/tmp/harm65.fx.*`, root `gates.json`, commits `b`/`t`) — and special-casing is unnecessary, because F1's answer key is readable.

## Artifacts
- `.ufo/waves/round-65/build/K65ReviewProbeH65/stubs/stub-do-nothing.mjs`, `stub-canned-pairs.mjs`, `stub-blind-echo.mjs`, `stub-blind-echo-gates14.mjs`
- `.ufo/waves/round-65/build/K65ReviewProbeH65/scores.txt` (the five verbatim verdict lines)
- `.ufo/waves/round-65/build/K65ReviewProbeH65/probe-h65-strengthening.md` (patch text P1..P6, each monotone)
- scratch: `/tmp/kumitate-r65/K65ReviewProbeH65/lane` (clone, branch `k65attack`), revs `b9f16dd…`, `64c99d3…`, `8042665…`(v1), `4767ad2…`, `2726e5c…`
- No tool installs; nothing run from OMP binaries; lane git index/jj state untouched.

## Limits
- My own honest-tool run at `2ca91a0` finished: HELD 5/5, exit 0, `real 5m1.546s` — the same line as `base/harm65-at-freeze.txt`. On this loaded host the whole counter costs ~5 min; `matrixRun`'s 900 s cap (probe:150) over 20 gates x 2 revisions at `--timeout 120` is ~3x headroom, so a false MISS from the host is possible at higher load but was not observed.
- P3's sampled-pair closure and P4's registry pin are designed, not executed; I did not run a patched probe, so no patched score is claimed.
- I did not attack C2/O65, the base receipts, or the 16 control specs' semantics (whether each truly alters one thing).
