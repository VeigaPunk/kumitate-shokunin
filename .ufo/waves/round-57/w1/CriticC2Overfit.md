# CriticC2Overfit — attack D57 (C2 `worker-heartbeat-liveness`)

Seat: critic. Question assigned: do the 12+ clauses genuinely require S117/S118/S119,
or could an unsourced entry satisfy E1–E3? Per-clause: does each clause bind a receipt
that required opening the source?

Judged rev: R1 `f0dc6d1160e66af65355bd353665adac22bbf4a9` (re-run of the committed probe
in my own build dir prints `DOCTRINE57_HELD held=5/5`, `probe-r1-rerun.txt` — matches
`close/FINAL-doctrine57-R1.txt`).

## Verdict

**COUNTEREXAMPLE FOUND — executed, not hypothetical.** An unsourced entry satisfies
E1–E5, and only **9 of 13** clause receipts (10 of 16 tokens) are artifacts of opening
the admitted sources. The predicate does not bind a clause to the source; it binds it
to any committed blob.

## Executed counterexample (F1 — fatal to the "sourced" claim's counter)

Scratch clone under `build/CriticC2Overfit/scratch/repo` (lane untouched). Replaced the
entry at rev `4fb0e48475473f8b613607b87f3eda1eeb5fc71b` with 13 clauses, each a
*fabricated* "quote" (e.g. `"the Temporal SERVER heartbeats the Worker every 30
seconds"` — a falsehood verbatim in no capture), bound to 13 self-minted scratch blobs.
Result of the real frozen probe:

```
DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=4fb0e48… rule=D57 | E1–E5 PASS  (exit 0)
```

(`forged-probe.txt`.) E1 is a header regex; E3/E4/E5 exercise only `SOURCES.md`,
`source-captures.json`, `sources-check`, and census — never the entry's clause text.
E2 asks only that the receipt path exist at rev and hash to the token, so the receipt
is a self-consistency check on the author's own files. `sources-check.mjs` (E4)
validates the entry header trio and used-by asymmetry; **no gate anywhere compares
clause text against pinned capture bytes**. The "sourced" property is attested by the
author and the capture-pins layer alone; D57 adds zero binding between the two.

## Per-clause classification at R1 (`receipt-hash-check.txt`, `quote-membership.txt`)

All 16 tokens across 13 `- ` lines hash-match real blobs. Source-derivation:

| Clause | Receipt binds | Required opening an admitted source? |
|---|---|---|
| L18–L20 ×3 | ScoutTemporalHb quote files | **YES** — all quotes verbatim in S117 capture |
| L21–L23 ×3 | ScoutKafka quote files | **YES** — verbatim in S118 capture |
| L24–L25 ×2 | ScoutK8s quote files | **YES** — verbatim in S119 capture |
| L26 ×3 tokens | source-metadata ×3 | Partly — fetch receipts cite the pinned capture sha256 (which I confirmed); but the *file* is author-minted prose, no membership test exists |
| L30–L31 ×2 | ScoutQueue (fleet-dispatcher observations, `[INFERENCE]` on L31) | **NO** — origin-tree reading, not S117–S119; yet two of the 12 required clauses are lane prose |
| L35–L36 ×2 | ScoutRabbitmqHb | **NO** (for the three admitted sources) — binds **rejected** S120; two of the 12 clauses are about a source the plan says is out of scope |

So `clauses ≥ 12` is met with only 8–9 source-derived clauses; the lane-mapping and
rejected-row padding (4 clauses) would suffice alone with zero sources opened. E2 as
written permits an entry whose every clause binds lane observations.

## F2 — multi-receipt lines: tokens after the first are never verified

E2 uses non-global `String.match`: only the **first** `receipt:` token per line enters
`tokens`. Line 26 binds 3 receipts; the probe verifies 1 (`distinct=13`, 3 invisible).
Executed: my forged line f1 carried a second receipt `…/BOGUS.txt@sha256:111…` —
nonexistent path, all-ones hash — and E2 still passed. The probe's own `bound`/`distinct`
counters under-report; an author may attach unverified receipts that read as evidence.

## Impacted axes

- **coverage** (primary): the sourced-frontier claim is corroborated *by my independent
  re-derivation* — every entry quote is verbatim in the pinned captures — but D57 does
  not measure that; `held=5/5` is consistent with total fabrication.
- **operability**: unaffected.

## Defect vs. tradeoff

The gap is inherited from the D-line design (D56 mirrors it); the *data* is genuinely
sourced, so this is a **fixable defect of the counter**, not a reason to reject the
round's evidence. Whether the canonical judge rejects on an un-forgeable-but-unbound
counter is its call — precedent is counter-amendment (strictness-only impossible here;
the fix *adds* a check).

## Smallest safe correction

Amend E2 (mirroring the A-line's selftest discipline) per the counter-amendment
convention: (a) use `matchAll` so every `receipt:` token on a line is bound — kills the
invisible-token hole; (b) require ≥ N receipts whose blob's quoted lines appear in the
normalized bytes of the `source-captures.json` pin for the source the clause cites
(path convention `build/Scout*/…` already implies it; the registry is the lookup key);
(c) keep lane-mapping clauses but count them in a separate bound so they cannot fill
the sourced-clause floor. Until then, `DOCTRINE57_HELD` means "well-formed receipts",
not "clauses derived from S117/S118/S119".

## Reopened-source checks (assignment requires reopen judgment)

S117–S120 reopened only via the committed pinned captures (registry sha256 verified
against the extracted blobs at R1 — `quote-membership.txt`); access 2026-10-24. Quotes
above are the located sentences; tier A stands for S117–S119. S120 rejection stands:
its located sentence ("ensure that the application layer promptly finds out about
disrupted connections (and peers)") is verbatim in its capture and is indeed
connection-scope keepalive — worker-liveness claims about it would be false provenance.

## Evidence files (all under `.ufo/waves/round-57/build/CriticC2Overfit/`)

- `probe-r1-rerun.txt` — probe re-run at R1, `DOCTRINE57_HELD held=5/5` exit 0
- `receipt-hash-check.txt` — 13 clause lines, 16 tokens, all hash-match; distinct-path analysis
- `quote-membership.txt` — 23 quote strings tested against normalized pinned captures: all IN-CAPTURE
- `forged-probe.txt` — executed unsourced forgery → `DOCTRINE57_HELD` exit 0
- `extract/` — `git archive` of R1 used for all verification
- `scratch/repo` — independent scratch clone carrying forged rev `4fb0e48…`

No installs this round; pacman untouched. Lane production files, git/jj state unmodified.
