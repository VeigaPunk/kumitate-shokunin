source: S247 (https://arxiv.org/abs/2212.06118, abstract); S248 (https://eecs481.org/readings/testoracles.pdf, section 1); scripts/counter-receipt.mjs; .ufo/waves/round-86/plan.md
verified-at: 2026-11-04 — source pages reopened; frozen probe and controls at e7228850690c6bd48400140964cbaf18667fbc06
recheck: node .ufo/waves/round-86/probe/probe86-c1.mjs --lane . --work /fast/scratch/hyaku/kumitate-r86/recheck; node scripts/counter-receipt.mjs --selftest

# Bind the source half, not just the receipt half

A counter answer has two distinct inputs: the runtime transcript and the source against which its arm roster is reconciled. A digest of only the transcript cannot identify which source bytes were inspected. Contract v3 adds `sha256` to the source line, computed from the same raw buffer used to extract sites and declarations:

```
SOURCE: sites=<n> declared=<n-or-absent> receipt=<r> sha256=<source-sha-or-dash>
```

Changing a comment in the source preserves the extracted counts but must change this digest. The round-86 frozen probe generates random names and counts at runtime and derives expected output from the bytes it writes. It includes two source texts with identical counts but different bytes. This defeats replay keyed only on an arm label, filename or a fixed fixture table; it is not an authentication boundary.

## Controls and limits

The frozen probe has 24 arms (`cases.length === 24` in the command above). Committed pre-data receipts under `.ufo/waves/round-86/controls/` read: v2 base 14/24; constant printer 0/24; label-keyed no-reader 0/24; nonce replay 0/24. Every receipt carries its command, revision and observed exit code. These are failing controls, not evidence that the candidate has passed.

An independently implemented parser that reads the bytes and derives the same answer is an equivalent implementation, not a no-reader cheat. Neither a matching digest nor an internally consistent transcript proves authorship, semantic correctness, complete case coverage or actual process exit provenance. S247 explains why coverage does not establish oracle quality; S248 defines the separate job of distinguishing expected from incorrect behaviour.

The binding remains textual: literal call sites inside strings or comments count, non-decimal declarations are absent, and no hostile-filesystem/liveness guarantee is made. The final round-86 measurements and any surviving adversaries belong in `corpus/lessons/round-86.md`, rather than being inferred from this mechanism description.

## Round-85 correction (R85-V8, V9, V10, V11)

This entry supersedes the orphan fragment at lines 7–12 of `counter-receipt-discrimination.md`: its historical v2 command is `node scripts/counter-receipt.mjs --receipt .ufo/waves/round-83/close/c1-probe.txt`, and the corresponding committed transcript is `.ufo/waves/round-85/close/history-v2.txt`. The historical 41/41 independent result tested candidate digest `7659be6e…`, not the integrated `f385bd7a…` bytes. S247 corrects S245's title to *A Brief Survey on Oracle-based Test Adequacy Metrics* and its survey tier to B. S248 supersedes S246's unreachable-locator conclusion with accessible full text; the historical failed ACM fetch is retained, not rewritten.
