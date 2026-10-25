VERDICT: C1 cannot verify as frozen — P2 demands >= 8 distinct finding ids while the frozen control set exercises 6 and the v1 contract defines 7, so the honest lane and both forgeries tie at `held=4/5 | P2 MISS ids=6`; with only that floor relaxed in a scratch copy all three read 5/5, which shows P1–P5 have no discriminating power between a receipt-diffing tool and a 60-line text matcher.

## Evidence

Seat: K64CriticC1Predicate. Lane read-only; sandbox clone `/tmp/kumitate-r64/K64CriticC1Predicate/sandbox`
(`git clone --no-hardlinks <lane>`, HEAD `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`); every fixture commit built with
`git -C <sandbox> write-tree` + `commit-tree -p dd1a3e6f…` (no lane index, no jj, no checkout).

E1 do-nothing story (lane rev, frozen probe, no tool at base):
`RECEIPT64_UNMET held=0/5 checks=5 rev=6825a51425e91908f019ed65aa2f4209acbd7087 rule=R64 | P1 MISS tool-absent | P2 MISS tool-absent | P3 MISS tool-absent | P4 MISS tool-absent | P5 MISS report-not-given` — exit 1. **A do-nothing lane is really 0/5.**

E2 honest fixture `90dfce3a7526ca14c865c9ef9094404626b2451b` (lane's honest tool + `.ufo/waves/round-64/close/receipt64-close.txt` = `RECEIPT64_HELD held=5/5 checks=5 rev=dd1a3e6f… rule=R64` + honest report):
`RECEIPT64_UNMET held=4/5 checks=5 rev=90dfce3a7526ca14c865c9ef9094404626b2451b rule=R64 | P2 MISS ids=6` — exit 1.

E3 expect-file-oracle forgery `47bbb0c8ac9cca974e3908c2431695974b49eaa6` (no round-64 receipt; report is
`report-lying-r64.md`, whose own text says every number is invented):
`RECEIPT64_UNMET held=4/5 checks=5 rev=47bbb0c8ac9cca974e3908c2431695974b49eaa6 rule=R64 | P2 MISS ids=6` — exit 1.

E4 receipt-blind forgery `751fa73772636b0e0bc35e35fcdbb918f6ee8779` (never opens `.ufo/waves/round-N/{base,close}`):
`RECEIPT64_UNMET held=4/5 checks=5 rev=751fa73772636b0e0bc35e35fcdbb918f6ee8779 rule=R64 | P2 MISS ids=6` — exit 1.

E5 same three revisions through a **scratch copy** of the probe with only line 61 `seen.size < 8` → `< 6`:
```
RECEIPT64_HELD held=5/5 checks=5 rev=90dfce3a7526ca14c865c9ef9094404626b2451b rule=R64   (honest)
RECEIPT64_HELD held=5/5 checks=5 rev=47bbb0c8ac9cca974e3908c2431695974b49eaa6 rule=R64   (oracle)
RECEIPT64_HELD held=5/5 checks=5 rev=751fa73772636b0e0bc35e35fcdbb918f6ee8779 rule=R64   (blind)
```
The floor is the only thing refusing the forgeries, and it refuses the honest lane identically.

E6 control census: `for f in controls/receipt/*/expect; do sed -n 2p $f; done | tr , '\n' | grep -vx CLEAN | sort -u`
→ `HASH_DEAD PLACEHOLDER RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT TALLY_UNRECEIPTED` (6).
`grep -oE "add\('[A-Z_]+'" scripts/report-receipt-diff.mjs | sort -u` → 7 ids (`+ HASH_ORPHAN`).
`grep -n 'seen.size' probe/receipt64-probe.mjs` → `61:  if (seen.size < 8) bad.push(...)`.

E7 honest tool vs all 16 frozen cases, same harness as P2: 16/16 `OK` (`cases=16 mismatches=0`), incl. `c0-honest 0 CLEAN`, `c15-honest-two-receipts 0 CLEAN`, `c12-r60-shape 1 PLACEHOLDER,TALLY_UNRECEIPTED`. Both forgeries also match 16/16 (their only P2 complaint is `ids=6`).

E8 P5 vacuity: honest tool at freeze rev `dd1a3e6f…` with `report-silent-r64.md` (no tally, no receipt path) and **no round-64 receipt anywhere**: probe prints `RECEIPT64_UNMET held=4/5 … | P2 MISS ids=6` — i.e. P5 **held**.
Same bytes family, honest tool vs `report-lying-r64.md`: `REPORT_RECEIPT: DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` / `RECEIPT_MISSING .ufo/waves/round-64/close/receipt64-close.txt` / `TALLY_UNRECEIPTED RECEIPT64_HELD held=5/5` exit 1.

E9 token grammar: `grep -o '__[A-Z][A-Z0-9_]*__' report-shorttoken-r64.md` → `__X__ __AB__ __ABC__`; tool prints one line, `PLACEHOLDER __ABC__` (the tool's regex needs 3+ chars after `__`; the probe's independent count does not).

E10 P3 semantics re-run by hand at `dd1a3e6f…`: r60 (`git show 7b0581ed:.ufo/reports/round-60/kumitate.md`) → `DRIFT PLACEHOLDER,TALLY_UNRECEIPTED`, six `PLACEHOLDER` lines, `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10`, exit 1; r63 (`8fd46e61`) → `CLEAN`, exit 0. Matches the plan's words.

E11 three accepted lies (honest tool, fixtures under the build dir):
`.ufo/waves/round-8/close/p-tip.txt` cited in a `--round 9` report → `REPORT_RECEIPT: CLEAN`, exit 0.
`7b0581ed63a46ac1961b1ecf98ec0caf561ccd9b` (a fleet-only commit) cited with `--fleet` → `CLEAN`, exit 0.
receipt `NOTE: X9_HELD was NOT reached; held=3/3 is the plan target, not a result` satisfying report `X9_HELD held=3/3` → `CLEAN`, exit 0.

## Findings

**K64CriticC1Predicate-1 — critical — P2 is unmeetable; C1 cannot verify as declared.** `seen.size >= 8` (probe:61) against 6 exercised ids and a 7-id contract. Honest lane = 4/5 (E2). Even adding a case for `HASH_ORPHAN` reaches 7, because `HASH_ORPHAN` needs a git repo at `--lane` and a P2 case lane is a plain directory inside a `git archive | tar -x` tree (every hash there is `HASH_DEAD`). Repro: `node .ufo/waves/round-64/probe/receipt64-probe.mjs <sandbox> 90dfce3a7526ca14c865c9ef9094404626b2451b --report .ufo/waves/round-64/build/K64CriticC1Predicate/report-honest-r64.md`.

**K64CriticC1Predicate-2 — high — the 16 cases cannot discriminate receipt-reading; a receipt-blind tool matches all 16.** Every non-CLEAN case alters the *report*; the lane fixture is byte-identical in all 16 (`p-base.txt`/`p-tip.txt`/`q-tip.txt`). No case holds report bytes fixed and changes the receipt, so the tool's only receipt-dependent finding (`TALLY_UNRECEIPTED` vs `CLEAN`) is never isolated. `forge-blind.mjs` derives every id from report text plus a 2-label blacklist (`Y9_HELD`, `DISPATCH60_HELD`) copied from the fixtures: 16/16 match (E7), r60/r63 correct, P5 CLEAN. Repro: `node /tmp/kumitate-r64/K64CriticC1Predicate/mini.mjs .ufo/waves/round-64/build/K64CriticC1Predicate/forge-blind.mjs`.

**K64CriticC1Predicate-3 — high — P2 hands the answer to the tool under test.** P2 passes `--report <case>/report.md` and the answer `expect` sits in the same directory; `forge-oracle.mjs` reads it and matches 16/16. The case *names* also encode the ids (`c4-tally-overstated`, `c11-hash-dead`), so a basename map suffices without reading the file. P4 does not cover this: it runs two literal constant stubs, never the tool under test, so the plan's named attack ("what if the real tool detects it is run from the probe's temp dir") is unrefused.

**K64CriticC1Predicate-4 — high — P1 is a bare print.** Both forgeries' `--selftest` is one line, `process.stdout.write('REPORT_RECEIPT_SELFTEST: PASS (20/20)\n')`, and P1 held for both (E3/E4 list only P2 as MISS). P4 never invokes `--selftest`, so nothing ties the printed N to executed cases. Repro: `node <forge> --selftest; echo $?` → `PASS (20/20)`, 0.

**K64CriticC1Predicate-5 — high — P5 is vacuous and self-satisfiable.** A round-64 report that states no result at all reads CLEAN with zero round-64 receipts (E8); and the fabricated `report-lying-r64.md` reads CLEAN under both forgeries while the honest tool refuses it. P5 therefore measures "the lane can write a report its own tool likes", not "the report agrees with the receipts". The lane owns both the tool and the report.

**K64CriticC1Predicate-6 — medium — the token grammar is narrower than the probe's own "independent" count.** Tool `__[A-Z][A-Z0-9_]{2,}__` vs probe `__[A-Z][A-Z0-9_]*__`: `__X__` and `__AB__` escape (E9). P3 cannot see this because r60's six tokens all have 3+ chars, so `ph !== indep` is a tautology on the single input where the two grammars agree. Repro: `node scripts/report-receipt-diff.mjs --lane <sandbox> --round 64 --report .ufo/waves/round-64/build/K64CriticC1Predicate/report-shorttoken-r64.md --rev dd1a3e6f…`.

**K64CriticC1Predicate-7 — medium — off-round receipt citations are invisible.** `RECEIPT_PATH(round)` is round-scoped, so `.ufo/waves/round-8/close/p-tip.txt` in a round-9 report is never scanned and the report reads CLEAN (E11). A report can launder another round's evidence for free. Repro: `cp -r controls/receipt/c0-honest /tmp/x && printf '\nsee `.ufo/waves/round-8/close/p-tip.txt`\n' >> /tmp/x/report.md && node scripts/report-receipt-diff.mjs --lane /tmp/x/lane --round 9 --report /tmp/x/report.md`.

**K64CriticC1Predicate-8 — medium — a negating receipt line satisfies a tally.** The matcher is `l.includes(label) && /held=x\/y\b/` on one line, so `NOTE: X9_HELD was NOT reached; held=3/3 is the plan target` receipts `X9_HELD held=3/3` (E11). Adjacent to the declared limit ("a receipt the lane itself wrote is trusted"), but it is a mis-parse of what was written, not trust. Repro: same shape as -7 with `close/neg.txt`.

**K64CriticC1Predicate-9 — low — a fleet-only hash is accepted as lane evidence.** `HASH_ORPHAN` is guarded by `inLane`, so a 40-hex that resolves only in the fleet is silently accepted (`--fleet` default is `dirname(--lane)` when it has `.git`, so P2 cannot exercise this id at all). Repro: append `7b0581ed63a46ac1961b1ecf98ec0caf561ccd9b` to a c0-honest copy, run with `--fleet /home/vgpnk/Projects/shokunin` → `CLEAN`.

**K64CriticC1Predicate-10 — calibration — attack REFUSED: the controls were not written to match a broken tool.** The generator does not import the tool, and the honest tool matches all 16 `expect` files exactly (E7), including the three CLEAN cases. This attack found nothing; the freeze is self-consistent on that axis.

**K64CriticC1Predicate-11 — calibration — P3 is rev-insensitive and therefore not evidence of round-64 work.** Rounds 60/63 receipts exist at every revision, so P3 holds at any rev where the tool is present — including `dd1a3e6f` itself (E8). It is a tool-regression check on old data, not a measurement of the claimed work.

**K64CriticC1Predicate-12 — correction (proposal, not applied).** Do not lower `seen.size < 8` (a relaxation). Strengthen to 8 ids: `RECEIPT_OFFROUND` and `TALLY_NEGATED`, each with one control case (`c16`, `c17`), both exercisable through P2's fixed argv and both demonstrated accepted lies (-7, -8). Full sketch and risks: `.ufo/waves/round-64/build/K64CriticC1Predicate/proposal-P2-reachability.md`. If any seat's verdict is already recorded under R64, the plan's no-retroactive-change rule makes the honest outcome **C1 UNMET**.

## Artifacts

- `.ufo/waves/round-64/build/K64CriticC1Predicate/forge-blind.mjs` — receipt-blind forgery (matches 16/16 controls).
- `.ufo/waves/round-64/build/K64CriticC1Predicate/forge-oracle.mjs` — expect-file oracle forgery (matches 16/16).
- `.ufo/waves/round-64/build/K64CriticC1Predicate/report-lying-r64.md`, `report-honest-r64.md`, `report-silent-r64.md`, `report-shorttoken-r64.md`.
- `.ufo/waves/round-64/build/K64CriticC1Predicate/proposal-P2-reachability.md`.
- Scratch: `/tmp/kumitate-r64/K64CriticC1Predicate/{sandbox,mini.mjs,probe-threshold6.mjs,r60.md,r63.md,xcheck.mjs}`.
- Sandbox commits (in `/tmp` only, never in the lane): honest `90dfce3a7526ca14c865c9ef9094404626b2451b`, oracle `47bbb0c8ac9cca974e3908c2431695974b49eaa6`, blind `751fa73772636b0e0bc35e35fcdbb918f6ee8779`. Recipe: `git clone --no-hardlinks <lane> $S/sandbox`; copy the tool to `scripts/report-receipt-diff.mjs`; `git -C $S/sandbox add -A`; `T=$(git -C $S/sandbox write-tree)`; `git -C $S/sandbox -c user.name=K64CriticC1Predicate -c user.email=critic@example.invalid commit-tree $T -p dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef -m <label>`.

## Limits

- No verdict at the L1's real tip: the round-64 report does not exist yet, so P5 was measured against my own fixtures (honest, silent, lying, short-token), not the filed report.
- The floor-6 probe is a scratch diagnostic copy, never a verdict; the frozen counter was run unmodified for E1–E4, E8.
- I did not attack J64/C2, the jj demo, or any other check; C1 only.
- I did not measure whether the two proposed ids keep r60/r63 CLEAN (implementation not written); the proposal states that re-run as an integration gate.
- No tools installed; no pacman; no network fetches.
