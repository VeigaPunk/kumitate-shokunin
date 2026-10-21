ATTACK S8 member section `## `scripts/ufo-watchdog-repend.mjs`` verdict=partial defects=1

Scope: the round-35 edit of the member section `## `scripts/ufo-watchdog-repend.mjs``
in `corpus/knowledge/remaining-scripts-census.md` (working-tree lines 806-808), its
population-table row (line 180) and every positional anchor the section cites. Source
read only via `/fast/scratch/kumitate-r35/src` (detached at
`31c465f15669f744848bd9f5d56191c5085670f7`, `git status --porcelain` empty). No lane
file, git/jj state, or host state was written; the only lane write is this report.

## Anchors — every cited line read at 31c465f1 (8/8 hit)

| note site | pin line, verbatim (truncated) | verdict |
|---|---|---|
| `scripts/ufo-watchdog-repend.mjs:366` for "exported as `main`" | `export function main(argv = process.argv.slice(2)) {` | hit |
| `:426-427` for `isMainModule(import.meta.url)` → `process.exitCode = main()` | `426: if (isMainModule(import.meta.url)) {` / `427: process.exitCode = main();` | hit |
| `:360` for `unsupported argument` | `faults.push(\`unsupported argument: ${arg}\`);` | hit |
| `:366-371` for "printed to stderr with exit 64" | `368: if (faults.length > 0) { 369: for (const line of faults) process.stderr.write(\`ufo-watchdog-repend: ${line}\n\`); 370: return 64; 371: }` | hit |
| `:58` for `MAX_ATTEMPTS` = 3 | `export const MAX_ATTEMPTS = 3;` | hit |
| `:57` for `STATE_SCHEMA` = 2 | `export const STATE_SCHEMA = 2;` | hit |
| `:64` for `STABLE_REFUSAL_REASONS` = {`mission_stale_registered`} | `export const STABLE_REFUSAL_REASONS = Object.freeze(new Set(["mission_stale_registered"]));` | hit |
| `:159` for `SPAWN_FAILURE_TAIL_MAX` = 120 | `export const SPAWN_FAILURE_TAIL_MAX = 120;` | hit |

Mechanical corroboration:
`node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --self . --fleet .. --symbols --json`
-> for `remaining-scripts-census.md` line 808 every reference resolves `OK`: 8
path:line refs incl. `:366-371`/`:426-427`, the bare member path, and
`ufo-night-watchdog.sh`; the only other row is a `FRAGMENT` note for the `{key` prose
token. No `LINE_OOR`, `SYMBOL_OFF_LINE`, or `SYMBOL_MISS` on the section. (The same run reports errors elsewhere in the note, e.g. line 804
`./ufo-mission-result.mjs`; outside this section.) No instrumented LSP server existed
for this markdown/source pair; source was read directly with `git show` + line reads.

## Count and revision label

- Population row `| \`scripts/ufo-watchdog-repend.mjs\` | 428 | tool |` (line 180)
  equals `git show 31c465f1:scripts/ufo-watchdog-repend.mjs | wc -l` -> `428`
  (blob ends `}\n`, so no missing-newline offset). Companion row 181 (422) also matches
  `wc -l` (422). Frozen `s-modified-members-55.tsv:54` records `+81/-24`, and
  `git diff --numstat 964f443e 31c465f1` -> `81 24`: 371 + 81 - 24 = 428.
- Original revision label: the master section (line 841 at `1770305f`) had **no**
  per-section revision label, so none could be dropped; it only cited lines implicitly
  at `964f443e`. The round-35 text keeps the new trace `re-anchored at 31c465f1
  (round 35)` and the note header still carries the historical 964f443e census. Not a
  defect.
- Provenance claim "extracted from `ufo-night-watchdog.sh`" still resolves: the shell
  file exists at the pin (226 L) and calls `node scripts/ufo-watchdog-repend.mjs`
  (`scripts/ufo-night-watchdog.sh:219`).

## Defect 1 — three true internals clauses dropped with no round-35 trace

Path: `corpus/knowledge/remaining-scripts-census.md:808`.

The rewrite silently removed clauses that are still TRUE at the pin:

1. master: "keys for rows no longer blocked pruned on write" - absent from the current
   sentence; behavior present at `scripts/ufo-watchdog-repend.mjs:341-345`
   (`// Prune keys for rows no longer blocked`, `for (const key of Object.keys(attempts)) ... delete`).
2. master: "transient classes are never suppressed" - absent; behavior present at
   `scripts/ufo-watchdog-repend.mjs:244-249` (`STABLE_REFUSAL_REASONS.has(refusal.reason)`
   is the gate) and pinned by the suite case
   `ok   transient_refusal_class_never_suppresses` (29/29 run, below).
3. master: "The r07 addition is stable-refusal suppression" plus its rationale
   ("the dispatcher refuses that class by design and repend can never succeed") - absent,
   no replacement or trace.

No `gone`/falsity removal is involved: the wave-1 report says `gone=0` and my own
master-vs-pin check confirms every removed clause remains true at 31c465f1. This is a
coverage/fidelity regression of the member's internals-level section, and the note's own
convention for removed content is an explicit trace (cf. line 670
`(round 35: removed boundaryRefusal - absent at 31c465f1)`); here removal is silent.

Minimal fix (one edit, line 808): restore the two behavior clauses, e.g.
"...legacy bare `{key: n}` reads as attempts; attempts/refusals/notes are pruned for
rows no longer blocked (`:343-345`), and the state now also carries a `notes` dedupe
member. `STABLE_REFUSAL_REASONS` = {`mission_stale_registered`} (`:64`) is quieted for
`DEFAULT_QUIET_SECONDS` (900) ...; transient classes are never suppressed (`:244-249`)."
If the round prefers compression, append instead:
"(round 35: dropped 964f443e clauses - state pruning `:343-345` and transient-class
non-suppression `:244-249` remain true at 31c465f1)".

## Residual accuracy issue (pre-existing, not counted as a defect)

`corpus/knowledge/remaining-scripts-census.md:808` says suppression holds "while
`rowSignature(row)` is unchanged". At the pin the quieted signature is
`${rowSignature(row)}|m:${manifestClass(row.runId)}` (`scripts/ufo-watchdog-repend.mjs:282`);
a manifest-class change resets suppression even with an unchanged row signature, which
the suite proves (`ok   main_end_to_end_scratch_suppresses_then_manifest_change_resets`,
`ok   sig_change_resets_suppression_immediately`). The wording is carried over verbatim
from master, so round 35 did not introduce it; fixing it while touching line 808 would
remove a real under-specification: append "and the manifest class is unchanged (`:282`)".
Also unchanged from master: "plus fleet membership" is only applied when `--fleet` is
given (`:379` `fleet = values.get("--fleet") ?? null`; `:280` skips the filter when
null). [INFERENCE] Neither wording is load-bearing for the section's anchor claims.

## Commands run (observed output)

- `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` -> `31c465f15669f744848bd9f5d56191c5085670f7`
- `git show 31c465f1:scripts/ufo-watchdog-repend.mjs | sed -n '57p;58p;64p;159p;360p;366,371p;426,427p'`
  -> lines quoted in the table above; `... | wc -l` -> `428`; `964f443e` -> `371`.
- `git diff --numstat 964f443e 31c465f1 -- scripts/ufo-watchdog-repend.mjs` -> `81 24`
  (matches `frozen/s-modified-members-55.tsv:54`).
- `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --self . --fleet .. --symbols --json`
  -> census line 808: 8/8 refs `OK`, no symbol/line errors.
- `node scripts/ufo-watchdog-repend.mjs --bogus` (scratch pin copy)
  -> rc `64`, stdout 0 lines, stderr `ufo-watchdog-repend: unsupported argument: --bogus`.
- `node scripts/ufo-watchdog-repend.mjs --queue /nonexistent/queue.json --state <scratch> --now 1000000000`
  -> rc `0`, stdout exactly `2001-09-09T01:46:40Z watchdog-repend: queue unreadable (ENOENT: no such file or directory) - no repends this tick`.
- `node scripts/ufo-watchdog-repend.test.mjs` (pin archive in scratch) -> `29/29`, rc 0.
  First run failed 2 cases only because the extracted tree lacked `.ufo/` (mkdtemp
  ENOENT); after `mkdir -p .ufo` both passed. Environmental, not a source defect.

Tooling: nothing installed or upgraded (node 24.21.0 and git sufficed).
