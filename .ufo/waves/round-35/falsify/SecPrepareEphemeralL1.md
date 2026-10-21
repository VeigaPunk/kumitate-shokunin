ATTACK S8-section scripts/prepare-ephemeral-l1.mjs verdict=holds defects=0

Target: `## \`scripts/prepare-ephemeral-l1.mjs\`` at corpus/knowledge/remaining-scripts-census.md:639-641
(lane working tree; base master 1770305f; upstream pin 31c465f1, base 964f443e).
All reads against `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/prepare-ephemeral-l1.mjs`.
The section's one changed line (641) carries 13 file:N anchors + 1 range anchor; 14/14 hold.

## Anchors (all at note:641)
| anchor | line at 31c465f1 | verdict |
|---|---|---|
| `:659` | `export function createEphemeralL1({ source = ROOT, root, id = ..., policy = readPolicy() } = {}) {` | ok |
| `:814` | `export function destroyEphemeralL1({ target, root, force = false, policy = readPolicy() } = {}) {` | ok |
| `:912` | `export function main(argv = process.argv.slice(2)) {` | ok |
| `:917` | `throw new Error("usage: prepare-ephemeral-l1.mjs create … \| destroy --root …")` | ok (a throw, not a code) |
| `:29` | `export const ROOT = realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));` | ok; `create` default `source = ROOT` |
| `:30` | `export const POLICY_PATH = path.join(ROOT, "config", "ephemeral-l1.machine.json");` | ok |
| `:736` | `writeFileSync(markerPath, markerBytes, { flag: O_WRONLY\|O_CREAT\|O_EXCL\|O_NOFOLLOW, mode: 0o600, flush: true });` | ok |
| `:756` | `function readValidatedMarker(target, configuredRoot, policy) {` (ordinary path calls it at `:890`) | ok |
| `:760` | `if (path.dirname(candidate) !== root) throw new Error("destroy target must be one direct child of the configured root");` | ok |
| `:814-887` | 814 = destroy decl (`force = false`); heuristic `:845-877`; `rmSync` `:887` inside `if (force)` | ok range |
| `:92` | `export function readPolicy(policyPath = POLICY_PATH) {` | ok |
| `:45` | `const PATH_VARIABLES = Object.freeze([` → exactly 8 keys (HOME, XDG_CONFIG_HOME, XDG_DATA_HOME, XDG_CACHE_HOME, XDG_STATE_HOME, TMPDIR, OPENCODE_CONFIG_DIR, OPENCODE_DB) | ok |
| `:959` | `process.stderr.write(\`${JSON.stringify({ error: error.message })}\n\`);` | ok |
| `:960` | `process.exitCode = 2;` | ok |

Behaviour clauses checked against source, all true: create/destroy are the only verbs; marker has one write
(`:736`; `:729` joins the path, `:765/:770/:829` read); `policy.root` is the default destination root
(`:664`, `:820`, `:890`); `--force` may delete from the layout heuristic when the marker is absent/invalid.

## Population-table row
note:149 `| \`scripts/prepare-ephemeral-l1.mjs\` | 962 | tool |`;
`git show 31c465f1:scripts/prepare-ephemeral-l1.mjs | wc -l` → **962**; base 964f443e also 962, so the row
is correctly untouched by the diff (962 = 962). Note has 60 `^## \`scripts/` headings, exactly one for this
member, matching C2's 60-member heading set (Arm 1).

## Revision label / removed-clause traces
- Master's section (619-621) contains **no** `964f443e` label (grep count 0) and no per-section size claim,
  so there was nothing to keep; nothing was dropped. The new section carries `31c465f1` once
  ("re-anchored at 31c465f1 (round 35)").
- Two unreplaceable clauses carry explicit removal traces at `:641`: "(round 35: removed PrepareError —
  absent at 31c465f1)" and "(round 35: removed internal_error — absent at 31c465f1)".
- The other stale clauses (`fail("cli_usage", usage)`, `SECURE_WRITE_OPTIONS`, `destroy_target_not_child`,
  "derived from ROOT", "destroy validates that marker before deleting anything") were rewritten in place to
  correct statements rather than silently deleted — the master→now text is a full visible replacement.

## New-claim audit
No new false claim found. Wave-1's claim-level findings are addressed: `--force` deletion path is now stated
("ordinary destroy … while the `--force` path also permits a layout heuristic"), and "two library entry points"
was replaced by "lifecycle entry points … plus `main`" (12 `export` declarations exist; the two lifecycle ones
plus `main` are the claimed three).

## Mechanical corroboration
- `node scripts/cite-check.mjs --json --src /fast/scratch/kumitate-r35/src` → findings for lines 639-641: all
  14 anchors `kind=OK` (including the `:814-887` range); zero `UNRESOLVED`/`LINE_OOR`/`AMBIG`/`PIN_MISMATCH`.
  Only non-OK token is `FRAGMENT` for prose `{error` (not a citation).
- The integrated paragraph is byte-identical to the wave-1 patch line
  (`sed -n '141p' /fast/scratch/kumitate-r35/w/ExecS8Fidelity.patch` minus leading `+`), md5
  `e58c62d9cbd580a2bbc096f9dac394af` — the L1 integrated wave-1 faithfully.
- `git diff master -- corpus/knowledge/remaining-scripts-census.md`: this section changes only at the
  paragraph; heading (639) and table row (149) unchanged.

## Nits (not defects)
1. `corpus/knowledge/remaining-scripts-census.md:641` — "removed internal_error — absent at 31c465f1" is true
   of this member but not tree-wide: `git grep -l internal_error 31c465f1` → 5 files
   (scripts/fleet-dispatcher.mjs, scripts/local-helper.mjs, scripts/the-tick-config.mjs,
   scripts/ufo-state-retention.mjs, tests/the-tick.test.js). Minimal fix: "absent in this member at 31c465f1".
2. `:641` — both traces omit that `PrepareError`/`internal_error` were already absent in this member at
   964f443e (`git grep -c PrepareError 964f443e -- scripts/prepare-ephemeral-l1.mjs` → 0; same for
   internal_error). Optional: "(also absent at 964f443e)" so the trace does not imply the pin advance removed
   them.

## Commands run (all read-only)
- `git -C .../src show 31c465f1:scripts/prepare-ephemeral-l1.mjs | awk 'NR==N'` for N=29,30,45,92,659,736,756,
  760,814,887,912,917,959,960; same lines at 964f443e for the label/symbol history.
- `git show 31c465f1:scripts/prepare-ephemeral-l1.mjs | wc -l` → 962 (964f443e → 962).
- `git grep -l/-c 'PrepareError|internal_error|cli_usage|destroy_target_not_child|SECURE_WRITE_OPTIONS' 31c465f1`
  and member-scoped at 964f443e.
- `git show 31c465f1:... | sed -n '814,890p;955,962p'` for the force path and CLI envelope.
- `git -C lane diff master -- corpus/knowledge/remaining-scripts-census.md` (section-only replacement).
- `node scripts/cite-check.mjs --json --src /fast/scratch/kumitate-r35/src` (jq-filtered to this note).
- md5 comparison of note:641 against the wave-1 patch `+` line.

Tooling installs: none. No secrets read. No lane-tree edits (only this report).
