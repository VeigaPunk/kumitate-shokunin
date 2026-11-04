# K75MutTipDrift — C2 mutation receipt

Axes: operability + coverage. Frozen plan read without modification. No integration or admission judgment.

| Mutant | Minimal real mode | Executor patched tool |
|---|---|---|
| M1 equality/state branch removed | KILLED: moved becomes IN_SYNC | KILLED: equal becomes MOVED |
| M2 commits hardcoded 0 | KILLED: commits | KILLED: commits |
| M3 every path other | KILLED: scripts/runtime/other | KILLED: scripts/runtime/other |
| M4 non-git fail-closed branch removed | KILLED: wrong MOVED | **SURVIVOR**: later count guard still refuses |
| M5 pin-validation branch removed | KILLED: malformed pin accepted | KILLED: wrong-contract pin accepted |
| M6 MOVED/IN_SYNC exits swapped | KILLED: state/exit | KILLED: state/exit |

Each mutant was preceded by the expected detection description, then measured using the same four-case external CLI detector on pristine, mutated and exact-restored bytes. All pristine/restored detectors printed `VERDICT: PASS`, exit 0. Kills printed `VERDICT: FAIL <field/state case>`, exit 1. No inconclusive baseline. Exact tool lines, exits, hashes and commands are in `../build/K75MutTipDrift/mutation-receipt.txt`; machine-readable matrices are `minimal-matrix.json` and `real-matrix.json` in that build directory. Drivers and mutation seams are retained there.

## Survivor and structural limit

Real M4 removes only `if (head === null) return refuse(...)`. The existing non-git directory passes the directory-kind guard; the later failed `rev-list` independently returns the same fail-closed token and exit 2. Detector: `VERDICT: PASS`, exit 0. This is a named equivalent/redundant-branch survivor on the bounded fixture, not proof the entire refusal arm is dispensable. The contract was not changed and no additional multi-guard deletion was substituted.

Real M1 removes the equality branch, so a moved origin remains MOVED through fallthrough. That is not dead code: the equal-origin case becomes MOVED exit 1 and kills it. The minimal mode instead uses a MOVED inequality branch, whose removal produces IN_SYNC on a moved origin. These different mutations are explicitly distinguished.

## Live receipt

Both implementations observed:

`ORIGIN_TIP_DRIFT: MOVED pin=31c465f15669 origin=fb7157fcf146 commits=58 changed=241 scripts=57 runtime=23 other=161`

Exit 1. Real invocation uses `--self <lane>` to resolve the live lane pin in the isolated clone.

## Reproduction and restoration

Commands: `node "$S/battery.mjs"`; clone lane with `git -C <lane> clone --no-hardlinks --quiet <lane> "$S/real-tool"`; assert `git -C "$S/real-tool" rev-parse --show-toplevel` equals that owned clone; `git -C "$S/real-tool" apply <executor patch>`; `node "$S/real-battery.mjs"`. Fixtures use explicit `TMPDIR=$S`, `mktemp -d "$S/fixture.XXXXXX"`, `git -C "$D" init -q`, verified root before any commit, explicit `-C` thereafter, isolated global/system Git configuration. No commits outside the owned fixture. Patch arrived within the 20-minute watcher window; watcher checked at 20-second intervals and completed after 60 seconds.

Minimal before/restored SHA256: `f19efc192497e63316ad643e581c4636f4922e4174e6578835f9ce7136abcd4c`.
Real before/restored SHA256: `92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e`.
All twelve restoration comparisons are exact. Scratch cleanup command: `rm -rf -- /fast/scratch/hyaku/kumitate-r75/K75MutTipDrift` after copying receipts. No tools installed/upgraded; no lane tracked source changed. No default-mode or full selftest claim is made by this seat; only the assigned bounded mutation probes ran.

Self-evaluation: accuracy 4 (explicit minimal/real structural distinction); completeness 4 (all six mutations measured in both tools, one redundant-guard survivor limits arm proof); clarity 4 (table plus detailed receipt); actionability 4 (drivers and seams preserved, scratch fixtures intentionally removed); conciseness 4 (raw repetition confined to receipt). Overall 4.0. Most important next decision belongs to L1: whether the frozen arm-removal criterion accepts a redundant-branch survivor; this seat does not reinterpret it.
