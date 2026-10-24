# MutMap1 — readme-map name-only mutation

- Round: kumitate 58, wave w1
- Revision tested: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1)
- Axes: operability, coverage
- **Result: UNKILLED — the name-only mutant passes the directory-naming covered-entry control.** Under the item's explicit `passes (unkilled)` convention, the directory drift does not still fire.
- This is a scoped mutation observation, not an ATTEST58 or round verdict.

## Mutation

The gate bytes were extracted from R1 with read-only `git show`; no HEAD or index operation was performed. The R1 copy has sha256 `b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e`.

In `readme-map.name-only.mjs`, exactly one block was removed: the covered-member `lstatSync(join(dirFor[ns], leaf))`, symlink handling, and `lst.isFile()` rejection. The preceding name-based `fileSet` check and the registry parser were retained. The mutant has sha256 `148c7a8a873fe03a585878829cb0751b949f6ad43012304416c1637dd3e50822`.

Evidence: `.ufo/waves/round-58/build/MutMap1/03-mutation-diff.transcript.txt` and `04-hashes.transcript.txt`. The diff command's exit 1 is the expected files-differ result.

## Observed controls

Each fixture has regular `knowledge/a.md` and `lessons/b.md` files, a directory named `knowledge/dir.md`, README rows for all three names, and a registry covering all three. Only the registry bytes differ in the version-1 and malformed-JSON variants.

1. Directory-naming covered entry:
   - Honest R1 gate: exit 1, `README_MAP: DRIFT files=3 rows=3 covered=3 bad=1 first=covered-not-file:knowledge/dir.md`.
   - Name-only mutant: exit 0, `README_MAP: CLEAN files=3 rows=3 covered=3`.
   - Evidence: `10-original-directory.transcript.txt`, `11-mutant-directory.transcript.txt`.
2. Version-1 registry:
   - Honest R1 gate and mutant both exit 2: `README_MAP: FAIL-CLOSED reason=registry version 1 !== 2 (want the v2 lstat semantics)`.
   - Evidence: `12-original-version-1.transcript.txt`, `13-mutant-version-1.transcript.txt`.
3. Malformed registry JSON:
   - Honest R1 gate and mutant both exit 2: `README_MAP: FAIL-CLOSED reason=registry not valid JSON`.
   - Evidence: `14-original-malformed-json.transcript.txt`, `15-mutant-malformed-json.transcript.txt`.

All evidence filenames above are under `.ufo/waves/round-58/build/MutMap1/`. Each capture also has `.command.json`, `.stdout`, `.stderr`, and `.exit` files; the transcripts contain the full argv, cwd, stdout, stderr, and exit code. Setup and R1 extraction are captured as `00-rev.*`, `01-r1-gate.*`, and `02-setup.*`.

No production file, registry, corpus file, Git index, or jj state was changed. No commit, clone, install, or source assessment was needed.

Report: .ufo/waves/round-58/w1/MutMap1.md
