# K90ExecAudit — Q82 audit of the frozen round-90 C1 probe

Seat: K90ExecAudit (leaf executor). Writable seat dir: `.ufo/waves/round-90/K90ExecAudit/` (copy of this report is there as `REPORT.md`).

## Deliverables
- `.ufo/waves/round-90/K90ExecAudit/q82-audit.mjs` — the audit (stdlib only, Node v24.21.0).
- `.ufo/waves/round-90/K90ExecAudit/q82-recorder.mjs` — the recording tool; copied by the audit into `<scratch>/<mode>/recorder.mjs`.
- `.ufo/waves/round-90/K90ExecAudit/audit-clean.txt` — ends `Q82_AUDIT: CLEAN labels=47 scanned=130 hits=0`, exit 0.
- `.ufo/waves/round-90/K90ExecAudit/audit-keyed-negative.txt` — ends `Q82_AUDIT: LEAK hits=161`, exit 1.
- Supporting: `probe-run-clean.txt`, `probe-run-keyed-negative.txt` (full probe output), `scanned-clean.txt` (130 recorded values), `scanned-keyed-negative.txt` (200 recorded values). Names only, no contents.

## Method
1. Label extraction (read-only on the probe): regex `\barm\(\s*'([^']+)'` gives 41 literal call sites. One dynamic site `arm(name, …)` (the definition `function arm(name,` is excluded by lookbehind) takes its name from the prefix table `['dup-…', '\uXXXX']`, which yields 6 labels (`dup-feff`, `dup-zwsp`, `dup-zwnj`, `dup-zwj`, `dup-lrm`, `dup-nbsp`). Total 47 unique labels, none shorter than 5 characters, so `skipped=0`. Cross-check: the probe's printed `ARM <name>:` lines equal the extracted set (`arm_names_match_extraction=yes`, both runs, 47 lines each).
2. Recorder: logs `ARGV` per invocation, `PATH --lane|--rev <value>` and `PATH --dir <value>`, and `FILE <name>` for each `*.txt` in `--dir`. It delegates to `scripts/receipt-bind.mjs` with the same argv; stdout, stderr and exit status pass through.
3. The frozen probe was run with `--tool <recorder> --work <scratch>/<mode>/w --rev 7218699cfbdec702ba42f35ceac0a8e52d1bd564`, `cwd` in scratch.
4. Scan: every label of length >= 5 as a substring of every recorded PATH value or FILE name.
5. Negative control (`--negative-control`): the keyed recorder copies each `--dir` receipt set into `<scratch>/keyed-negative/copies/<n>/` under arm-label names (`<label>.txt`, `<label>-<k>.txt`, labels assigned round-robin) and delegates with that copy as `--dir`.

## Results
| run | labels | invocations | scanned values | hits | verdict | exit |
|---|---|---|---|---|---|---|
| clean | 47 | 57 | 130 (55 fixture paths + 75 names/revs) | 0 | `Q82_AUDIT: CLEAN labels=47 scanned=130 hits=0` | 0 |
| keyed negative | 47 | 57 | 200 | 161 | `Q82_AUDIT: LEAK hits=161` | 1 |

Probe verdicts under the recorder (informational, not gating): clean `C90_C1: UNMET held=39/47` (matches the base-v3 control 39/47 in `controls/table.txt`); keyed `C90_C1: UNMET held=35/47`.

Probe integrity: `sha256sum probe90-c1.mjs` = `70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694` before and after both runs (the audit fails if it changes). Probe not edited.

Instrument hashed for the record: `scripts/receipt-bind.mjs` = `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` (v3, the base).

## Residual findings (scope)
- The probe's `--lane` values are its fixture repositories (under the random `r-<hex>` root), not the kumitate lane. Every recorded path therefore lies under the per-run fixture root; the lane path itself is never passed to the candidate in a probe call.
- Literal components visible in fixture paths are `scripts`, `link-<nonce>.mjs`, `fresh-<nonce>.mjs`, and their symlink targets `tool-<nonce>.mjs`, `sp-<nonce>.mjs`, `to ol-<nonce>.mjs`. None contains a label. Other directory names are random (`d-`, `an-`, `r-`), and file names are counters (`r.txt`, `r2.txt`, `q01-0.txt`, `s01.txt`, …).
- Q82 concerns path and file names. The audit does not scan contents. Receipt bodies (`cmd=` tokens) carry the per-run nonce and random names only; none carries an arm label as a path component, but the audit does not prove absence from body text.
- The keyed recorder's round-robin label assignment is a deliberate negative control. It does not replicate the arm sequence; its only purpose is to prove the scanner can return LEAK.

## Tools and cleanup
- Tools installed or updated: none. Node v24.21.0 was already present. No pacman, no sysctl, no PATH changes, no git or jj commands in the lane, no fleet-repo writes.
- Scratch `/fast/scratch/hyaku/kumitate-r90/K90ExecAudit/` removed at the end (the persistent shell did not fire the EXIT trap, so removal was explicit).
- Lane reads only: the probe, the instrument, and the controls table. Nothing written under `scripts/`, `corpus/`, `.ufo/pins/`, `probe/`, `plan.md`, or `controls/`.

## Reproduce
```
S=$(mktemp -d /fast/scratch/hyaku/kumitate-r90/K90ExecAudit.XXXX); SEAT=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-90/K90ExecAudit
node $SEAT/q82-audit.mjs --scratch $S; echo $?                    # CLEAN, 0
node $SEAT/q82-audit.mjs --scratch $S --negative-control; echo $?  # LEAK, 1
rm -rf -- "$S"
```
