# ExecStanzaDrift — round 52

## Finding

The missing map entry is `corpus/lessons/round-51-verifier-spotcheck.md`.

- `corpus/README.md` targeted search for that exact path: no match.
- Corpus inventory: 118 Markdown notes; the frozen plan records the inherited 117 declared / 118 computed C2 drift and says one note lacks a README row.
- `sha256sum corpus/lessons/round-51-verifier-spotcheck.md`: `233b729f80b322ec419b16bd3352872e336ae1f26e15e913ec9f1c2d9b1201d7`.
- The note is the Round-51 non-author close spot-check: C1/C2 evidence re-checks, independent re-measurements, and the R52-11 missing measured-close receipt finding.

Draft row (also saved at `.ufo/waves/round-52/build/ExecStanzaDrift/README-row.md`):

```md
| `lessons/round-51-verifier-spotcheck.md` | Round-51 non-author closure: C1 and C2 evidence-verified; A-term re-counted; R52-11 measured-close receipt gap routed | `.ufo/reports/round-51/kumitate.md`; `.ufo/waves/round-51/close/`; `.ufo/waves/round-51/` |
```

## Scratch census and expected stanza

Created a committed-tree scratch archive from `HEAD` `ac5674393f68fb6510be48ad3fb3b20ebf4e1cc4`, inserted the draft row into its README, and performed static counts (no checker execution):

- `A=73`: the whole-tree runnable-file rule counts the two committed round-52 `.mjs` probes. Current stanza declares 71.
- `C=23`.
- After the row, `C2=118`, `C2_total=118`.
- Layer terms from the current stanza / frozen origin evidence (`src-rev=31c465f15669`): `S_members=88`, `S_sections=88`, `coverage_script=10`, `R_members=92`, `R_sections=92`, `coverage_runtime=10`.
- Other existing terms remain `C1=19/19`, `C1k=5/5`, `K_members=53`, `K_sections=53`, `coverage_kimi=10`; expected derived axes are `operability=9`, `coverage=10`.

**Predicted result for adding only the README row: PROXY does not flip to MATCH.** With the unchanged stanza, the comparator will still find `A_DRIFT` (71→73), `C2_DRIFT` (117→118), and `C2_TOTAL_DRIFT` (117→118). The inherited `coverage` axes drift should clear once C2 is 118/118. To match this committed-tree snapshot, the stanza needs the values above; the current C2 v2 entry and round-52 lesson are not in this scratch snapshot, so the integration close must rederive C2 after those arrive.

Caution: the live, in-flight worktree's same runnable-file census is 991 because it includes active auxiliary build outputs. I did not treat that as the committed-tree stanza value; the eventual close A must be measured on the integrated tree, since any committed runnable artifacts add to A.

## Verification limits

I did **not** run `node scripts/proxy-check.mjs --strict` on the scratch tree: the fleet-executor instruction forbids gate/test execution during the wave and reserves it for the parent. Therefore the no-match result above is a static prediction, not an observed PROXY line. The repository README itself was not edited. No tools were installed. LSP was not applicable to this corpus-map entry.

Report: .ufo/waves/round-52/w1/ExecStanzaDrift.md
