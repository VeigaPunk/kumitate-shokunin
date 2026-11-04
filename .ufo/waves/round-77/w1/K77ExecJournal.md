# K77ExecJournal — scoped implementation handoff

Axes: operability + coverage (orchestration/tooling).
Base: `4dc470a131e10900fdd456b6b68d7ba27151d9d2`; uncommitted patch only.

## Deliverables

- `build/K77ExecJournal/spotcheck-adopt.patch` (relative to this round directory), changing only `scripts/spotcheck-adopt.mjs`.
- `build/K77ExecJournal/tool-sha256.txt`: new tool SHA-256 `1f1f4a0ffafb6f4abeee2188a1deb38575f042b3b8221abccf71bbbf109016e5`.
- No lane implementation file, index, scorecard, oracle, external substrate, or frozen counter was edited.

## Changes by symbol

- Header: v2 contract, journal lifecycle, single-writer and process-crash boundary; documents test-only SIGKILL seam.
- `stageJournal`: writes both immutable pre-images and versioned manifest in UUID.tmp, publishes UUID via rename before destination writes.
- `recover`: runs before every valid non-selftest arm; removes stale staging directories, refuses foreign ownership before destination mutation, consults unchanged oracle, keeps complete destination bytes or verifies BOTH hashes before atomic rollback. Malformed/corrupt journals fail `REFUSED_ORACLE` and remain available.
- `insertRow`: inserts after last lessons row inside Coverage map; if no lessons row exists, uses the last existing map row; empty map inserts before following section. This covers the frozen fixture, which has only a knowledge row. Other README bytes remain unchanged.
- `evaluate`: journals the existing pair, triggers journal/row/pin crash seams, removes journal only after oracle approval, retains existing caught-failure rollback. Existing pin splice preserves trailing-byte/newline state.
- `main`: recovery prefixes are printed before requested-arm output; usage and selftest remain separate.
- `selftest`: adds ten arms (three child SIGKILL windows; stale tmp through predict; foreign journal; placement; recovery idempotence; both final-newline states; corrupt-pre-image refusal). Static case count is 26; this is NOT an observed passing tally. Crash arms log child status/signal and subsequent CLI recovery output.

## Evidence and blocked acceptance

Observed command (scratch edited file, based on frozen revision):

`sha256sum /fast/scratch/hyaku/kumitate-r77/K77ExecJournal/lane/scripts/spotcheck-adopt.mjs`

```
1f1f4a0ffafb6f4abeee2188a1deb38575f042b3b8221abccf71bbbf109016e5  /fast/scratch/hyaku/kumitate-r77/K77ExecJournal/lane/scripts/spotcheck-adopt.mjs
```

No probe, selftest, crash driver, build, lint, formatter or smoke check was run. The higher-priority fleet instructions prohibit verification during the editing wave and assign post-integration execution to the parent. Therefore no `held=11/11`, PASS tally, SIGKILL observation, or observed recovery line is claimed, and no synthetic transcripts were created. Acceptance remains unmeasured, not held. LSP unavailable: this seat exposes no LSP tool.

Exact IMPLEMENTED output strings (not execution evidence):

```
RECOVERED corpus/lessons/round-99-verifier-spotcheck.md rolled-back
RECOVERED corpus/lessons/round-99-verifier-spotcheck.md complete
RECOVERED - stale
REFUSED_JOURNAL_FOREIGN
```

Parent gate: apply patch to frozen-base integration, set TMPDIR beneath `/fast/scratch/hyaku/kumitate-r77/`, execute adopter `--selftest` and frozen probe `--set c2 --lane <integration> --work <fresh scratch work>`, retain transcripts, then repeat the probe with a fresh work directory. Retain separate crash journal/row/pin receipts from the selftest child output or dedicated fixtures. Do not label this implementation held until those results exist.

## Risks / plan reading

- Door left open: one writer per lane, no locking or concurrent-adopter guarantee. Not power-loss durability; no fsync contract was requested.
- No existing lessons row: frozen fixture has a knowledge-only table, so fall back to its final map row instead of EOF; an empty Coverage map gets its first row before the next section. No predicate was changed.
- CLEAN interpreted as the existing oracle's whole-map CLEAN result, as in the existing adoption implementation. DRIFT or invalid oracle result triggers verified rollback during recovery; normal arm evaluation retains its existing refusal semantics.
- UUID publication is atomic; a process killed during staging leaves a removable .tmp directory. Interrupted rollback keeps its journal until both images are restored.
- No tools installed or updated. No tests delegated. No commit or push performed.

## Self-evaluation

Accuracy 4/5: digest observed, runtime behavior explicitly unverified. Completeness 3/5: implementation and selftests supplied, requested execution receipts blocked by fleet policy. Clarity 4/5: symbol-level handoff separates implementation from evidence. Actionability 4/5: patch and parent gate commands supplied, integration still required. Conciseness 4/5: detailed evidence caveats retained to prevent false acceptance. Overall 3.8/5. Highest-impact improvement: parent runs the frozen gate twice and retains real crash/selftest transcripts. Would the user agree? Likely only after parent verification; no acceptance claim made here.
