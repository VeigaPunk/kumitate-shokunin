VERDICT: 42 single mutants of the C2 entry/rows/pins/demo (plus pristine baseline) against frozen JJ64 at 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8: 39 killed, 3 survived — entry `source:`-line URL swap and used-by pollution with a REAL path are genuine counter holes (both score `JJ64_HELD held=8/8` live on a falsified entry); one-quote-bullet deletion survives by threshold design; counter is frozen, holes reported not patched.

## Evidence

Sandbox: `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin $C` → `/tmp/kumitate-r64/K64R2MutateEntry/clone.tS9O`, `git -C $C checkout 2ed8a5f8...`, `git -C $C rev-parse --show-toplevel` = `$C` (verified). Mutants committed in-clone only, `-c user.name=fixture -c user.email=fixture@example.invalid`; per run: mutate → sha256 → commit → probe → `git reset -q --hard 2ed8a5f8...` → sha256(before)==sha256(after)==pristine asserted by harness (42/42 passed). Probe: `node .ufo/waves/round-64/probe/jj64-probe.mjs $C <mutant-rev> [--no-live]`.

Baseline (rev 2ed8a5f8..., lane itself, live): `JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64` exit=0. Same in clone. No-live: `JJ64_UNMET held=7/8 ... | J5 MISS live-fetch-skipped` exit=1 — J5 skip is by design, so every no-live row below carries that known MISS; "arms" = MISS arms beyond it. 52 runs total (results.tsv has every full verdict line + mutant rev).

| mutants (no-live) | mutation | arms beyond J5-skip | held |
| --- | --- | --- | --- |
| F01–F21 (21) | flip each Demo outcomes value | J6 `<k>:stated=<v'>:live=<v>` | 6/8 UNMET |
| D1 | delete `- workspaces_after_add=2` | J6 `stated=undefined:live=2` | 6/8 |
| IK1 | add `- zz_invented_key=fabricated` | J6 `stated-not-live` | 6/8 |
| LK1 (live) | demo script prints 22nd key `extra_live_key` | J6 `stated=undefined:live=bonus` | 6/8 n-l; 7/8 live |
| QW1 | S200 quote `multiple`→`several` | J4 `quote-not-in-capture`; live also J5 `quote-not-live` | 6/8 both |
| Q26 | S200 quote extended to 26 words (real doc continuation) | J4 `over-25-words` ONLY (quote is contiguous in capture+live; J5 passes live) | 6/8 n-l; 7/8 live |
| RC1 | drop `recheck:` line | J1 `recheck=false` | 6/8 |
| VA1 | `verified-at: 2026-10-25`→`2026-10-24` | J1 `verified-at=false` | 6/8 |
| UB1 | S200 used-by cell → `unused` | J2 `used-by-lacks-entry` + J7 `census-exit=1` | 5/8 both |
| PS1 | S198 pin sha256 flipped | J3 `hash-or-size` + J4 (all 4 S198 quotes) | 5/8 both |
| CB1 | S198 capture bytes `log`→`lag` | J3 `hash-or-size` + J4 | 5/8 both |
| PD1 | S198 pin binding deleted | J3 `unbound` + J4 | 5/8 both |
| PV1 | PROVINCE entry path → `REDACTED` | J7 `province-names-entry=false` | 6/8 |
| SI1 | substrates edited in place (M7 word) | J8 `base-bytes-not-a-prefix,no-amendment-heading` | 6/8 |
| AH1 | amendment heading deleted | J8 `no-amendment-heading` | 6/8 |
| DS1 | entry `source: S199` line deleted | J4 `S199:not-a-source`×3 (J2 passes: 2 ids ≥ 2) | 6/8 |
| ST1 | S199 row status `mined`→`open` | J2 `status=open` + J7 `census-exit=1` | 5/8 |
| OD1 | S198 row opened → `2026-10-24` | J2 `opened=2026-10-24` | 6/8 |
| UB2 | S200 used-by appends forged nonexistent path | **J2 PASSED** (loose `includes`); killed only by J7 `census-exit=1` | 6/8 |
| EU1 | entry `source:` URL v0.46.0→v0.45.1 | **none** — hole | 7/8 n-l; **live HELD 8/8** |
| UB3 | S200 used-by appends REAL existing path | **none** — hole | 7/8 n-l; **live HELD 8/8** |
| QB1 | delete one S198 quote bullet (4→3) | **none** — threshold survivor | 7/8 n-l; live HELD 8/8 |

Killed-verdict specimens (verbatim): F09 `JJ64_UNMET held=6/8 checks=8 rev=b373d6b5a7c209ec0e68a09ed5bcf2d823b13f50 rule=J64 | J5 MISS live-fetch-skipped | J6 MISS rewrite_seat_head_seat_state:stated=stale:live=fresh` exit=1. EU1 live: `JJ64_HELD held=8/8 checks=8 rev=7a985218a32af1972a8b514b746fbf74c7fe7aa9 rule=J64` exit=0. UB3 live: `... rev=baceeb666f2421bd5274d605cf6c1d8a140b2a2f ...` exit=0. QB1 live: `... rev=908f62fd056398ee47e1594bd9dd19bac1f873df ...` exit=0. Q26 live: `JJ64_UNMET held=7/8 ... | J4 MISS S200:over-25-words` exit=1.

## Findings

1. **K64R2MutateEntry-1 (high, counter hole — survives live).** J2/J5 never read the entry's own `source:`-line URLs: swapping the entry's S198 URL to a different real page (v0.45.1) leaves `JJ64_HELD held=8/8` (rev 7a985218a32a...). The entry's stated provenance is falsified while HELD; J5 fetches the registry row URL, not the entry's claim. Repro: in a clone of 2ed8a5f8..., replace `https://docs.jj-vcs.dev/v0.46.0/technical/concurrency/` with `https://docs.jj-vcs.dev/v0.45.1/technical/concurrency/` in `corpus/knowledge/jj-workspace-seat-containment.md` line 1, commit, run `node .ufo/waves/round-64/probe/jj64-probe.mjs <clone> HEAD`. Cheapest fix (counter frozen — for the L1/rule v2): J2 additionally requires each head `source:` line's URL substring to occur in that row's source cell (or J5 to fetch the entry-stated URL).
2. **K64R2MutateEntry-2 (high, counter hole — survives live).** J2's used-by check is `usedBy.includes(ENTRY)`; appending a real corpus path (`, corpus/knowledge/agent-isolation-substrates.md`) to S200's used-by cell forges a cross-entry ground claim and stays `JJ64_HELD held=8/8` live (rev baceeb666f24...). The census (J7) accepts it because the path exists — UB2 shows the census catches only nonexistent-path pollution. Repro: cell-edit SOURCES.md row `| S200 |` used-by as above, commit, live probe. Fix sketch: J2 splits used-by on `,` and requires every element to be a corpus file whose own text cites this entry back (or exact-set equality with citing files).
3. **K64R2MutateEntry-3 (low, threshold semantics — survivor).** Deleting one of S198's four located-quote bullets stays HELD 8/8 live (rev 908f62fd0563...): J4 checks >= 4 bullets and >= 1 per cited row, so grounding can silently thin from 13 bullets to 12. Entry becomes less grounded, not false — recorded as coverage finding, no contract change sought.
4. **K64R2MutateEntry-4 (medium, defense-in-depth fact).** Row-cell mutations are double-caught: J2 fires AND J7's `sources-census.sh validate` exits 1 (UB1, ST1, UB2 all show `census-exit=1` at otherwise-clean arms). The census is an independent net for registry tampering — but per finding 2 it validates existence, not claim truth.
5. **K64R2MutateEntry-5 (info).** Q26: the 25-word cap is the sole catcher for padded quotes; a 26-word quote whose extra words are the document's own next words still matches capture and live fetch, so only J4's count arm kills (live 7/8, `J4 MISS S200:over-25-words`).
6. **K64R2MutateEntry-6 (info, probe mechanics).** SI1 fired two J8 arms because the in-place edit shortens the file, shifting the tail slice `now.subarray(baseBytes.length)` so the heading regex also misses — an artifact of byte-prefix checking, still a correct kill. LK1 (mutated demo inside the archive) confirms J6 re-runs the archived demo, not the lane's.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/w2/K64R2MutateEntry.md` (this report)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64R2MutateEntry/results.tsv` — all 52 runs: mutid, mode, mutation, mutant rev, before/after sha256 prefixes, exit, full verdict line. Zero `.mjs/.js/.sh/.py` files added to the build dir; no lane or mutant tree copies kept.

## Limits

- Live arms exercised on 9 of 52 runs (pristine + QW1, Q26, PS1, UB1, LK1, EU1, QB1, UB3); the other 33 mutants are no-live verdicts (J5 skipped by design in that mode). All three row URLs fetched successfully (HTTP 200) on 2026-10-25.
- Mutations were single-point and confined to the entry, its rows S198–S200, pins, captures, PROVINCE line, amendment, and one demo-script key emission; no multi-mutant combinations, no C1/receipt-diff work (not assigned), no attack on PROVINCE beyond the named line.
- Frozen probe, controls, and counters were executed read-only; the two holes are reported with fix sketches, not patched anywhere.
- Restoration evidence: clone `git status --porcelain` = 0 lines, clone HEAD = lane HEAD = 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8, and byte-identical `cmp` on all 7 touched files against the lane (entry, SOURCES.md, pins, PROVINCE.md, substrates, S198 capture, demo script).
