VERDICT: 70 single-literal mutants of `scripts/report-receipt-diff.mjs` were run against the tool's own selftest and the 16 frozen control cases — 36 die at the selftest, 1 at the controls, 33 survive, the frozen counter kills only 1 of those 33, and the frozen P2 floor (`>= 8` distinct ids) is unsatisfiable because the contract emits exactly 7 ids, so `RECEIPT64_HELD` can never be held; 27 survivors are killed by a verified selftest patch (41 added lines, 49/49 green) and 5 are proven equivalent.

## Evidence

Base: lane `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`; tool sha256 `35a5a1249bcb7521880824feb5d20c5e865ce0d8c21659b3dc15f91a7c271fae` (identical in lane and in my copy).

```
$ node work/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (20/20)              exit=0
$ node mutants.mjs . .../controls/receipt           # 70 mutants x (selftest + 16 controls)
TOTAL 70 | KILLED-SELFTEST 36 | KILLED-CONTROLS 1 | SURVIVOR 33 | BUILD-ERROR 0
SURVIVORS: M02,M03,M04,M06,M08,M09,M10,M12,M13,M15,M16,M17,M25,M29,M31,M34,M39,M43,M44,M45,M46,M47,M48,M52,M60,M61,M62,M63,M64,M67,M68,M69,M70
```
Controls invocation = the frozen P2 invocation: `node <tool> --lane <case>/lane --round 9 --report <case>/report.md`; every one of the 16 cases matched its `expect` under the pristine tool (control-parity mismatches=0).

Frozen counter, pristine tool, real lane, real data (read-only):
```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs "$PWD" dd1a3e6f... --report work/p5-clean.md --fleet /home/vgpnk/Projects/shokunin
RECEIPT64_UNMET held=4/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6     exit=1
```
Survivors re-run through the same frozen counter on a throwaway clone of the lane (full history, `git clone --no-hardlinks`, one commit per mutant; P1..P5, `--report p5-clean.md`):
```
BASELINE RECEIPT64_UNMET held=4/5 checks=5 rev=dd1a3e6f... rule=R64 | P2 MISS ids=6
M17 KILLED-COUNTER ... held=3/5 ... | P2 MISS ids=6 | P3 MISS r60-tally-line-absent
COUNTER-KILLED 1/33: M17
```
Patch verification (each mutant literal applied to the extended selftest, must fail the named case):
```
$ node selftest-kill.mjs .
M02 KILLED(section-literal-truncated-landed) ... M70 KILLED(hash-in-word-not-hash)
M31 EQUIVALENT(...) M52 EQUIVALENT(...) M60 EQUIVALENT(...) M61 EQUIVALENT(...) M62 EQUIVALENT(...)
EXTENDED-SELFTEST REPORT_RECEIPT_SELFTEST: PASS (49/49) exit=0
RESOLVED 32/32
```
Patched tool re-measured by the frozen counter (fixture commit `432a0711dcdc470874fc80c0af54ff1c2e62726a`):
```
RECEIPT64_UNMET held=4/5 checks=5 rev=432a0711... rule=R64 | P2 MISS ids=6      exit=1
```
i.e. the patch adds no regression; P2's floor is the only remaining MISS.

## Findings

**K64ExecReceiptMutants-1 — critical, attacks the frozen predicate (P2), not the tool.** P2 requires `seen.size >= 8` distinct finding ids, but the contract in the tool emits exactly 7 (`grep -o "add('[A-Z_]*'" scripts/report-receipt-diff.mjs | sed "s/add('//;s/'//" | sort -u` → `HASH_DEAD HASH_ORPHAN PLACEHOLDER RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT TALLY_UNRECEIPTED`), and the 16 frozen controls exercise 6 (all but `HASH_ORPHAN`). No control set can reach 8, so `RECEIPT64_HELD` is unreachable at every revision, including the tip. Reproduce: the probe command above at `dd1a3e6f` → `RECEIPT64_UNMET held=4/5 ... | P2 MISS ids=6`; `cat .ufo/waves/round-64/controls/receipt/*/expect | grep -v '^[0-9]*$' | grep -v CLEAN | tr ',' '\n' | sort -u` → 6 ids. This is a frozen-counter defect: reported, not patched by me.

**K64ExecReceiptMutants-2 — high, attacks the tool's falsifier surface.** 33/70 mutants survive (selftest + controls) and the frozen counter kills only M17 (P3's `held=10/10` needs a two-digit y). The tool's own selftest therefore certifies a tool that has lost its ASCII-arrow arm, its `#{1,6}` width, its `**` arm, its `\b` boundaries, its `some`→`every`, its exit codes and its rev handling. Reproduce: `node mutants.mjs . <controls> --only M03` → `M03 SURVIVOR ... 20/20 ... 0bad`.

**K64ExecReceiptMutants-3 — high, exit-code contract unexercised.** M46 (usage 64→1), M47 (rev fail-closed 2→1), M48 (report fail-closed 2→1), M67 (rev-verify guard removed) survive P1..P5: nothing in the counter invokes the CLI in a failing arm. A tool that exits 1 where the header contract says 64/2 passes the claim. Reproduce: `node survivors-probe.mjs ...` → `M46 SURVIVOR-COUNTER`, `M67 SURVIVOR-COUNTER`.

**K64ExecReceiptMutants-4 — medium, tip resolution.** M43 (`tip = rev`, HEAD fallback dropped) and M44 (`tip` ignores `rev`) survive both harnesses: every control lane is a non-repo with no live hashes, and the selftest always passes an explicit `rev`. With M44 a report is judged against the worktree HEAD instead of the measured revision — exactly the "diff at a revision" property the contract names. Reproduce: `--only M43,M44`.

**K64ExecReceiptMutants-5 — medium, hash resolution.** M45 (`cat-file -e <h>` without `^{commit}`) survives: a blob/tree hash counts as "resolved" and is then reported `HASH_ORPHAN` instead of `HASH_DEAD`. No harness puts a non-commit object in a report. Reproduce: `--only M45`.

**K64ExecReceiptMutants-6 — medium, round scoping one-sided.** M39 (`RECEIPT_PATH` accepts `round-\d+`) survives; the mutant is *stricter* (it flags a cited previous-round receipt as `RECEIPT_MISSING`), so the frozen controls cannot see it. Direction matters: this is noise, not a relaxation, but the round-scoped receipt directory is only half-tested. Reproduce: `--only M39`.

**K64ExecReceiptMutants-7 — low, substring weakenings.** M12/M13/M25/M34/M70 (dropped `\b`), M15 (leading `\b`), M16 (`\s+`→single space) survive: every fixture token is space-delimited and exactly 40 hex, so boundary-free matching is indistinguishable. Reproduce: `--only M12,M13,M15,M16,M25,M34,M70`.

**K64ExecReceiptMutants-8 — low, mechanism behind -1.** The frozen control lanes carry no git repository, so any hash in a control report is `HASH_DEAD` by construction and `HASH_ORPHAN` cannot be exercised by any control. That caps the control id set at 6 independently of how many cases are added.

Equivalences (proven, no case written): M31 (`slice(1)` drops only the `## SHONEN` heading line, which cannot match `/^\s*[-*]\s*\[[x~ ]\]/`), M52 (P1 reads the `PASS (N/N)` line; a red run prints `FAIL` and already fails P1 whatever the exit code), M60 (`fleet` is read only when the lane is not a repo, and a non-repo lane has no ancestor `.git`; divergence needs a broken `.git` dir), M61 (`git ls-tree` on a bad rev exits 128 with `stdout=""` — verified — so skip-vs-empty-loop is the same set), M62 (`ls-tree -r` lists only blobs `git show` can read).

## Artifacts

- `.ufo/waves/round-64/build/K64ExecReceiptMutants/work/report-receipt-diff.mjs` — byte copy of the subject (sha256 above).
- `.../work/mutants.mjs` + `.../work/muts/mut-M*.mjs` — the 70-mutant battery, one single literal each.
- `.../work/mutant-results.json`, `.../work/mutant-table.md` — id, mutation, killed-by, survivor-verdict table (70 rows).
- `.../work/survivors-probe.mjs`, `.../work/survivor-probe-results.json` — survivors through the frozen counter on a lane clone.
- `.../work/selftest-kill.mjs`, `.../work/selftest-kill-results.json` — proof each new case kills its mutant.
- `.../work/report-receipt-diff.selftestplus.mjs` — full-file draft (pristine + 41 added lines).
- `.../work/selftest-additions.patch` — unified diff to integrate (selftest only; no behaviour change).
- `.../work/control-parity.mjs` — extended tool vs the 16 frozen controls (mismatches=0).
- `.../work/p5-clean.md` — the report fixture used for P5 in the clone runs.
- Scratch: `/tmp/kumitate-r64/K64ExecReceiptMutants/` (two throwaway lane clones, `clone.*`, `clone2.*`).
- Tooling: none installed; `node v24.21.0`, `git` already present. No pacman.

## Limits

- Only `scripts/report-receipt-diff.mjs` was mutated; `scripts/jj-seat-demo.sh` (C2) and the counters themselves were not mutated (other seats' subjects; the counters are frozen).
- The 16 controls were read and run, never edited; the proposed cases are selftest text only, so the P2 ratchet still needs controls that add `HASH_ORPHAN` (finding -8) — that is the L1's integration decision.
- P4 stubs and the `--fleet` external-repository arm were not mutated; the fleet repo is read-only for this seat.
- Equivalences are arguments over reachable inputs (documented per mutant), not exhaustive proofs; M60/M61 rest on the measured `git` behaviours cited above.
- The counter re-runs used a `git clone` of the lane in `/tmp`; the lane's git index, jj state and worktree were never written.
