VERDICT: 12/14 mutants were caught by the frozen counter; 2 survived as measured coverage/design tolerances.

## Evidence

- Fixture: shared clone of lane tip `39f61816`; asserted `git rev-parse --show-toplevel` equals the clone before first commit. Added the drafted entry, S207–S213 rows/pins/captures, PROVINCE mention, README coverage row and readme-map pin. Pristine fixture commit: `31eee08f19b47e97c2b49bce47e477e10c6ae14a`.
- Fixture gates: `README_MAP: CLEAN files=164 rows=164 covered=164`; `SOURCES_CHECK: CLEAN (rows=152 tiers=A:129,B:15,C:8 status=queued:13,mined:120,rejected:19 entries_with_source=23 legacy=38)`; `SOURCE_CAPTURE: CLEAN captures=45 exemptions=107`; census output `file ok /fast/scratch/hyaku/kumitate-r68/K68MutEntry/lane/corpus/SOURCES.md`.
- Pristine bounded detector (`--no-live`): `DEPREC68_UNMET held=9/10 checks=10 rev=31eee08f19b47e97c2b49bce47e477e10c6ae14a rule=M68 | M5 MISS no-live` exit 1; all other checks held.
- Pristine live detector: `DEPREC68_HELD held=10/10 checks=10 rev=3008951c50c1be10e5af97c81e8d8fb5ddf20997 rule=M68` exit 0.
- Semantic quote swap, live: `DEPREC68_HELD held=10/10 checks=10 rev=9c198fdeab4303b6aa0bdf6f9d615a83083740e5 rule=M68` exit 0.
- Battery: 15 runs (pristine + 14 mutants); full lines/revisions in `build/K68MutEntry/mutant-results.jsonl`; per-mutant checks in `build/K68MutEntry/mutants.md`.
- Restoration: driver asserted after each mutant that entry bytes hash to `2d528bd77134af7e483179de77bfbf799915f4cd4b785b5a11bbe3fd83fd7675`; final hash equaled initial. After the final live semantic run, restored entry sha256 began `2d528bd77134af7e`.
- Counter caveat from concurrent probe review: K68ReviewProbes reported M10(b)'s self-run recursively spawning itself on symlink-entry fixtures (unbounded chain; their observed process tree exceeded 25 levels). My counter verdicts are quoted as actually emitted; I stopped processes matching my own `/fast/scratch/.../K68MutEntry/deprec68.*/deprec68-probe.mjs` paths and confirmed zero such matches afterward. Other seats' processes were not touched. This cautions interpretation of M10; it does not alter the observed M1–M9 mutant deltas.

## Findings

1. **K68MutEntry-1 — coverage (survived):** dropping one non-required S207 Located-quote bullet leaves 9 bullets, S207 still covered, and both required snippets intact; M4 does not fire. Per-row coverage forces at least 8 bullets here, making the 6-bullet floor redundant for this 8-source entry. Reproduce with X2 transform in `build/K68MutEntry/battery.py`; observed `held=9/10`, only baseline M5 miss, rev `9fb6ce069ab0e5591c80127b71bf1694ecb8f76e`.
2. **K68MutEntry-2 — semantic coverage (survived):** replacing S211's quote with another true sentence from the same capture survives M4 and live M5. These checks bind quotes to capture/live text, length and required substrings, not relevance. Reproduce X11; live output `HELD 10/10`, rev `9c198fdeab4303b6aa0bdf6f9d615a83083740e5`.
3. **K68MutEntry-3 — M6 order tolerance (survived by design):** reversing the six snapshot rows survives; M6 compares rows via a Feature-keyed map. Reproduce X12; `held=9/10`, only baseline M5 miss, rev `78b2bf67e7176fb5112829e719d5a2c8db8492c5`.
4. **K68MutEntry-4 — M8 diagnostic detail (low):** removing the section's `18.13.1` mention is caught by M8, but its MISS reason reports `section=true cites201-206=true v18.13.1-row=true`, omitting the failing section-version predicate. Reproduce X7; rev `35c49073f8cfa220513d1b956b2b1cd9583126a6`.

## Artifacts

- `.ufo/waves/round-68/build/K68MutEntry/mutants.md` — per-mutant outcomes, catch checks, findings and restoration evidence.
- `.ufo/waves/round-68/build/K68MutEntry/mutant-results.jsonl` — verbatim detector verdicts and mutant revisions.
- `.ufo/waves/round-68/build/K68MutEntry/battery.py` — scratch driver copied as a reproducibility receipt.

## Limits

- M5 is deliberately disabled for the 14-mutant comparison (`--no-live`); pristine and semantic-swap live runs both succeeded 10/10.
- The counter's recursive M10 behavior was reported by a concurrent probe reviewer; no counter change or rerun was attempted. No source files in the lane were modified.
