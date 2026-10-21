SOURCE_ROW status=queued tier=A quote_words=15

# ScribeSrcUpstreamRange — round 35 frontier step (C2 re-census source row)

Scope: one registry row for the upstream change record behind claim C2 (script-layer re-census at 31c465f1). Registry not edited. Report only.

## Draft row (for integration owner; id S021 = next unused, registry last row is S020)

```
| S021 | upstream scripts/ change set 964f443e..31c465f1 — own-work: git -C /fast/scratch/kumitate-r35/src diff --name-status 964f443e 31c465f1 -- scripts, counted by status letter | own-work | A | upstream script-layer change set for the C2 re-census at 31c465f1 (member scope, not raw file count) | stdout of that diff: 2 A, 6 D, 61 M; range head 31c465f1 committed 2026-10-20 07:25:51 -0300 | Range 964f443e..31c465f1 changes scripts/ as 2 added, 6 deleted, 61 modified files; the frozen member set is 2 added, 5 deleted, 55 modified (the extra D is scripts/dev-verify.sh; the 6 extra M are shell and extensionless files absent from s-modified-members-55.tsv), so C2 counts members, not files | queued | 2026-10-20 | 30d | — |
```

Row fields:
- source: own-work command above (no `|` in any cell; validated, see below).
- kind `own-work`, tier `A` (lane's own re-runnable gate output, per contract tier A definition), scope = upstream scripts/ change set, anchor = diff stdout + range head commit.
- access date: 2026-10-20 (commands run this session; host clock 2026-10-20).
- status `queued`, not `mined`. Reason: contract rule "mined = cited by >=1 path in used-by". `corpus/knowledge/remaining-scripts-census.md` exists (86156 bytes) but cites only the 2026-10-14 base census and contains no S021 reference (`grep -nE 'S0[0-9]{2}'` hits only S8 member rows). Writing `mined` plus that used-by path now would make the row fail the contract's own census check. Flip: once that knowledge entry cites S021, set status=mined and used-by=corpus/knowledge/remaining-scripts-census.md (contract rule 2 logs the old->new change in the round lesson Gate).

## Quote (<=25 words, verbatim, with location)

`routing: grammar admits org-prefixed model ids (provider/org/model; per-component charset, no ./..) in parseRoute + build.rs` — 15 words.
Location: stdout line 1 of `git -C /fast/scratch/kumitate-r35/src log --oneline 964f443e..31c465f1 -- scripts crates/ufo-core-runtime/src crates/ufo-cli/src` (range head commit 31c465f15669f744848bd9f5d56191c5085670f7).

## Commands run and observed output

1. `git -C /fast/scratch/kumitate-r35/src log --oneline 964f443e..31c465f1 -- scripts crates/ufo-core-runtime/src crates/ufo-cli/src`
   Output: 35 commit lines (counted by hand from the stdout above; no wc run), newest first; line 1 `31c465f routing: grammar admits ...` (quoted above); oldest in range `c90bbcf operator: swarm wave band 16-32 ...`.
2. `git -C /fast/scratch/kumitate-r35/src diff --name-status 964f443e 31c465f1 -- scripts | awk '{print $1}' | sort | uniq -c`
   Output: `2 A`, `6 D`, `61 M`.
3. `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` / `log -1 --format='%H %cI %s' 31c465f1` -> `31c465f15669f744848bd9f5d56191c5085670f7`, committed `2026-10-20T07:25:51-03:00`.
4. Name-status listing of A/D: A = `scripts/omp-route-grammar.mjs`, `scripts/ufo-swarm-registry.mjs`; D = `scripts/dev-verify.sh`, `scripts/omp-wave-context.mjs`, `scripts/primeagent-recovery-assess.mjs`, `scripts/primeagent-refinement-ledger.mjs`, `scripts/ufo-refinement-context.mjs`, `scripts/ufo-refinement-context.test.mjs`.
5. `git ls-tree -r --name-only 964f443e -- scripts | wc -l` = 101; at 31c465f1 = 97. `.mjs` entries: 83 -> 80.
6. Frozen population cross-check (lane files, read-only):
   - `.ufo/waves/round-35/frozen/s-added-2.txt` = the 2 A files above (match).
   - `.ufo/waves/round-35/frozen/s-deleted-5.txt` = 5 files: all D entries except `scripts/dev-verify.sh` (match, 5 of 6).
   - `.ufo/waves/round-35/frozen/s-modified-members-55.tsv` = 55 lines; set difference against the 61 upstream M files: frozen-M not in diff-M = 0; diff-M not in frozen = 6 (`scripts/gates.sh`, `scripts/self-iter.sh`, `scripts/smoke.sh`, `scripts/ufo-night-watchdog-lib.sh`, `scripts/ufo-night-watchdog.sh`, `scripts/ufo-sighting`).
   - Membership arithmetic: 91 - 5 + 2 = 88 (matches the declared member counts in the brief; the 91 baseline itself was not re-derived here — [INFERENCE] from the frozen files).
7. Row validation (contract census awk, run on /tmp/r35_row.md): malformed rows = 0 (NF==13); enum check printed nothing (tier A, status queued, kind own-work all valid, no tier inflation).
8. Quote word count: `wc -w` on the quoted string = 15.
9. Registry check: `grep -n 'S021' corpus/SOURCES.md` -> no match (id unused); `grep -c 'S020'` = 3 (registry ends at S020 as expected).

## Findings

- F1 (count discrepancy, must be carried into C2 evidence): the brief's wording "5 deleted, 55 modified" are MEMBER counts. Raw file-level diff is 6 D and 61 M. The row cites both, so C2 must not quote the file-level numbers as member numbers. Extra D and M files are absent from the frozen member files; their membership is inferred from that absence, not from a census command ([INFERENCE]).
- F2 (lane-state): `corpus/knowledge/remaining-scripts-census.md` is the 2026-10-14 census at base 964f443e (63 members per its own header). It predates this range and does not cite any row for the 31c465f1 re-census. A knowledge update citing S021 is needed before the row can flip to `mined`. That write is outside this scribe's scope (the scribe writes only its report).
- F3 (scope/province): row is in-province — `scripts/` is the Core band (PROVINCE.md, "Origin script layer") and the range head commit is a routing-grammar change that touches the same script surface. Not a rejection case. No existing row teaches the 964f443e..31c465f1 range (S008/S009 are own-work on base 16a5441, a different range), so the row is not redundant.
- F4 (commit subject quoted as evidence for scope): the quoted commit subject is evidence that the range head touches scripts/ and crates/; it does not itself state the member counts. The counts row is grounded by command 2, not by the quote. [INFERENCE: the quote grounds `teaches` only indirectly.]

## Tools

No tools installed or upgraded. Used host git (existing) and awk/sort/uniq/comm/wc/grep (existing).

## Out of scope / not done

- Registry (`corpus/SOURCES.md`) not edited, per instruction.
- No knowledge entry, lesson, or census edit made; no `mined` flip.
- Frozen population files not modified; upstream clone read-only (no checkout, fetch, reset).
