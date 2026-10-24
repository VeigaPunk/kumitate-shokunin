# ExecCounterPins — round 58

- Item: `ExecCounterPins` (executor)
- Axes: operability, coverage
- Measured integration revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Scoped result: **corroborated; no discrepancy observed**. This is an execution report for `counter-pins`, not an A58/D58 claim verdict.

## Required lane invocation

Command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/counter-pins.mjs
```

Observed stdout:

```text
COUNTER_PINS: CLEAN pins=17
```

Observed stderr: empty. Observed exit code: `0`.

## Revision-pinned corroboration

Because `counter-pins.mjs` reads the tree adjacent to its own script, I extracted revision `6affb9ebde37b7d663658f1959d64f0f0b68f480` with read-only `git archive` into this seat's build directory and ran the extracted gate there. The archive pipeline exited `0` with empty stdout/stderr. The archived-R1 gate independently printed:

```text
COUNTER_PINS: CLEAN pins=17
```

Its stderr was empty and its exit code was `0`.

A separate Python stdlib audit of the archived-R1 registry and pinned files recomputed every SHA-256 digest rather than relying on the Node gate's verdict. It exited `0`, with empty stderr, and reported:

```text
REGISTRY: version=1 pins=17 unique_names=17
EXPECTED_SET: MATCH expected=17 actual=17 missing=[] unexpected=[] duplicate_names=[] duplicate_keys=[]
PROBE_ENTRIES: rounds=53..58 present=12/12
AUDIT_COUNTER_PINS: PASS pins=17 probes=12/12 hashes=17/17 regular_files=17/17
```

All 17 registry paths matched the expected paths, all pinned members were regular files, and every recomputed digest matched its recorded digest.

## Round coverage observed at R1

| Round | Pins | Probe entries present | Other pinned entries |
|---|---:|---|---|
| 53 | 3 | `attest53-probe`, `doctrine53-probe` | `receipt-attest` |
| 54 | 2 | `attest54-probe`, `doctrine54-probe` | — |
| 55 | 3 | `attest55-probe`, `doctrine55-probe` | `source-capture` |
| 56 | 3 | `attest56-probe`, `doctrine56-probe` | `source-dupes` |
| 57 | 2 | `attest57-probe`, `doctrine57-probe` | — |
| 58 | 4 | `attest58-probe`, `doctrine58-probe` | `readme-map`, `receipt-evidence` |
| Total | 17 | 12/12 probes across rounds 53–58 | 5 supporting instruments |

## Evidence index

All paths below are under `.ufo/waves/round-58/build/ExecCounterPins/`. For each execution, the full command, stdout, stderr, and exit code are stored in the corresponding `.command.txt`, `.stdout.txt`, `.stderr.txt`, and `.exit.txt` files.

- Required lane run: `live-counter-pins.*`
- Read-only R1 archive: `r1-archive.*`
- Archived-R1 gate run: `r1-counter-pins.*`
- Independent registry/hash audit: `r1-independent-audit.*`
- Auditable helper source: `audit_counter_pins.py`
- Extracted measured tree: `r1-tree/`

No tools were installed. No production file, pin, index, or VCS state was modified; no commit or push was performed, and HEAD was not moved.
