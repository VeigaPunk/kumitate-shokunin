RESULT CritSeparabilityTip rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=separable risks=8

Scope: does each round-42 claim verify without the other, measured on four trees built from bytes of a0a07bae (repaired base) and c9a084bf (measured commit). The verdict covers only the C1-versus-C2 relation. Each claim on its own also needs routed-defect bytes or shared lesson bytes; those are listed below as risks, not as C1/C2 coupling.

## Trees (scratch clones under /fast/scratch/hyaku/kumitate-r42/falsify/CritSeparabilityTip; builder build-trees.mjs, runner run-battery.sh)

| tree | contents | scratch HEAD |
|---|---|---|
| T0 | a0a07bae as committed | a0a07bae9236311314f12e3cec8d3666049d0dbc |
| T1 | T0 + C1 files: scripts/gate-mutants.mjs, SKILL.md (registry row, checklist 18–19), stanza A=10 C=19, Axes operability row, `gate-mutants` capability row, S039/S040/S043 | 362fa5817727 |
| T2 | T0 + C2 files: scripts/kimi-census.mjs, knowledge/kimi-session-state.md, the one `locks/` line in proxy-check.mjs K_MEMBER_RULES, stanza K=53/53, pin.kimi-census and pin.proxy-check re-pinned, Axes kimi row, S041/S042/S044/S045 | 32f1df162347 |
| T3 | T0 + both | dacee08323a5 |

The trees leave out the routed-defect bytes (the cite-check, wave-census and anchor-truth edits, the gate-pins block in proxy-check.mjs) and the shared round-42 lesson, README row, LOG and QUALITY. These diagnostic variants add them back:
- T1W is T1 plus c9a084bf's wave-census.mjs (R41-6).
- T1R and T3R are T1 and T3 plus c9a084bf's wave-census.mjs and cite-check.mjs (R41-6 and R41-3).
- T1L, T2L and T3L are T1, T2 and T3 plus lessons/round-42.md, its README row and stanza C2=C2_total=94.

All runs used `--src /fast/scratch/hyaku/kumitate-pin/src` and the live ~/.kimi-code. The proxy and census runs on the four trees and M ran in the same minute, 21:01:04Z–21:01:05Z.

## Proxy `--json` terms (21:01:04Z)

| tree | verdict / warns | A | C | op | K_members | K_sections | coverage_kimi | C2/C2_total | strict |
|---|---|---|---|---|---|---|---|---|---|
| T0 | MATCH / 3 | 9 | 17 | 8 | 52 | 52 | 10 | 93/93 | exit 1 (3 PIN_UNPINNED) |
| T1 | MATCH / 4 | 10 | 19 | 9 | 52 | 52 | 10 | 93/93 | exit 1 (+ gate-mutants.mjs unpinned) |
| T2 | MATCH / 3 | 9 | 17 | 8 | 53 | 53 | 10 | 93/93 | exit 1 |
| T3 | MATCH / 4 | 10 | 19 | 9 | 53 | 53 | 10 | 93/93 | exit 1 |
| M (c9a084bf) | MATCH / 0 | 10 | 19 | 9 | 53 | 53 | 10 | 94/94 | exit 0 |

Against T0, T1 differs only in A, C, operability and one PIN_UNPINNED. T2 differs only in K_members and K_sections. T3 is exactly their union, and pins read 6/6 match in all four trees. This is the no-harm pass condition from CritSeparability (b237e3f).

## Census, selftests, sources

- `kimi-census`: T0 and T1 read `DRIFT (UNLISTED locks)`, exit 1, `declared=26 strays=1`. T2 and T3 read `CLEAN (members=53 …)`, exit 0, `declared=27 strays=0`. C2 verifies without C1, and C1 does not touch the census.
- Census `--selftest`: 48/48 on T0 and T1, 52/52 on T2 and T3. `proxy-check --selftest`: 116/116 PASS on all four trees.
- `sources-check`: T0 CLEAN (rows=38). T1, T2 and T3 read DRIFT (USED_BY_MISSING): S039 and S040 (C1) and S041 (C2) name `corpus/lessons/round-42.md` as used-by. With the lesson added (T1L, T2L, T3L) all three read CLEAN, at rows 41, 42 and 45, and the proxy stays MATCH at C2=94/94.

## Battery (`node scripts/gate-mutants.mjs --jobs 2`; valid runs 21:13–21:17Z)

| tree | result |
|---|---|
| T0 (`--rev HEAD` with M's gate) | ERROR exit 2: control wave-census 26/26 < floor 31 |
| T1 | ERROR exit 2: the same control floor; 0 mutants run |
| T2 (`--rev HEAD` with M's gate) | ERROR exit 2: the same |
| T3 | ERROR exit 2: the same |
| T1 `--target cite-check` | SURVIVED exit 1: 16/16 frozen killed; guard-outer-ne-1 and guard-outer-eq-undefined drift 73/73 |
| T1W (+ R41-6 wave-census) | SURVIVED exit 1: frozen=41/41; the same two guard extras drift |
| T1R (+ R41-6 + R41-3) | CLEAN exit 0: 43/43, frozen=41/41, leftovers=0 |
| T3R (both claims + R41-6 + R41-3) | CLEAN exit 0: 43/43, frozen=41/41 |
| M | CLEAN exit 0: 43/43, frozen=41/41, ~45 s at --jobs 2 |

C1's battery result is the same with and without C2 (T1R equals T3R), and C2 never reads the battery. So the two claims are separable. C1's battery does not verify on the strict C1-only tree, though: it needs the routed wave-census and cite-check bytes.

## Risks

1. **C1 cannot reach its CLEAN without R41-6.** The gate hardcodes `MIN_CONTROL_CASES wave-census: 31` (gate-mutants.mjs:27). The base suite has 26 cases and WC27–WC31 come from the routed sentinel fix, so the strict C1 tree exits 2 before running any mutant. The plan's touch list for C1 ("gate-mutants.mjs, two SKILL checklist items, its registry row") is incomplete.
2. **C1 cannot reach its CLEAN without R41-3.** The two manifest extras (gate-mutants.mjs:121–122) drift at base cite-check bytes (73/73 against control 75), so T1W exits 1 even with frozen=41/41. The frozen 41 ids alone pass on T1W, but the gate's exit rests on the routed guard fix.
3. **Both claims need the shared lesson.** S039, S040 and S041 list `lessons/round-42.md` as used-by, so sources-check reads DRIFT in every partial tree. Adding the lesson also moves C2_total 93 → 94, which needs a README row and a stanza re-pin. Neither claim can land its sources acceptance without that shared, non-claim edit.
4. **`--strict` is DRIFT in all four trees.** C1 raises PIN_UNPINNED from 3 to 4. The measured strict exit 0 comes only from the R41-2 `kumitate-gate-pins-v1` block, so the "`--strict` exit 0" in C1's receipt is not C1's to claim.
5. **`pin.proxy-check` is one shared value.** C2's single K_MEMBER_RULES line gives proxy-check sha 61c3d2a34f22 in T2 and T3. R41-2's block gives 4c2819b02ded at M. Each patch's own pin is wrong after the merge, so whoever writes proxy-check.mjs last must re-pin.
6. **The plan's separability sentence is false for C2.** C2 also touches `scripts/proxy-check.mjs` (the `locks/` rule), the stanza K terms, both pins and the Axes kimi row. Amendment A2 records the K_MEMBER_RULES edit, but plan.md:64 still reads "C2 touches kimi-census.mjs and one knowledge section".
7. **Under host thread pressure the battery's environment faults look like gate verdicts (operability).** The gate caps children at uid-wide threads + 256 (gate-mutants.mjs:299–311). With other seats live (about 1000 to 1300 threads), several of my runs went wrong in ways that are not the gate's real answer:
   - `spawn /usr/bin/prlimit EAGAIN`, reported as a control FAIL;
   - cite-check mutants timing out at 60 s;
   - a false `CONTROL cite-check FAIL … cases=68/75`;
   - a node `uv_thread_create` abort.

   All of these first runs used a runner capped at threads + 64, then `--jobs 1`; every one is kept as `*.txt.<n>` in the scratch directory. With +400 headroom and `--jobs 2` every run was deterministic. A checklist runner on a busy host can therefore read exit 2 for reasons that have nothing to do with the code. The `proxy-check --selftest` also read 65/116 under that pressure and 116/116 once headroom was available.
8. **`--rev` cannot measure any pre-round-42 revision as a whole.** `--rev a0a07bae` and `--rev` of the C2-only tree both exit 2 at the floor, which matches the lesson's Open limits. Only `--target cite-check` measures old bytes. The C1 claim's "able to fail on real code" evidence is therefore cite-check-only.

## Answer

- **C1 without C2: verifies.** The terms reach `{"A":10,"C":19,"operability":9}` on T1 with K unchanged, and the battery is CLEAN 43/43 on T1R. That holds only with the R41-6 and R41-3 bytes and the shared lesson (risks 1–3).
- **C2 without C1: verifies.** On T2 the census is CLEAN, exit 0, strays=0, and K is 53/53 with coverage_kimi 10 and the operability terms unchanged. The sources gate needs the shared lesson (risk 3).
- **Merged:** T3 equals the union of T1 and T2 on every term. T3R equals T1R on the battery.

Installs or updates: none. Processes left over after every run: 0 under this seat's directory. Scratch TMPDIR was `…/CritSeparabilityTip/tmp`; the last check found 0 temp dirs left.
