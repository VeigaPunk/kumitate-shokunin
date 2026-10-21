ATTACK S8:scripts/charter-scribe/sync.mjs verdict=holds defects=0

Target: re-anchored member section `## `scripts/charter-scribe/sync.mjs`` in
corpus/knowledge/remaining-scripts-census.md (working tree lines 469-471), edited
this round against pinned upstream 31c465f1. Master text (line 433) claimed a
tagged-refusal surface that does not exist at the pin; wave-1 re-anchored the
section and dropped two clauses.

# Anchor-by-anchor verification (all at 31c465f1)

1. `runBeat` (`scripts/charter-scribe/sync.mjs:604`) "preflights both worktrees,
   then collects local evidence, composes a thread note, injects it into the
   charter `index.html` and pushes".
   Command: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/charter-scribe/sync.mjs | nl -ba | sed -n '600,640p'`
   Output: `604  async function runBeat(argv = process.argv.slice(2)) {`; lines
   613-618 call `resolveBeatPaths(cfg)`, `assertGitWorktree(paths.repo, "charter repo")`
   and `assertGitWorktree(paths.charterRepo, "charter publish repo")` before
   step "1. collect" at 625-626; compose at 681-688, inject at 713-716, push at
   840. VERIFIED. "Preflights both worktrees" is new-but-true behavior added by
   the pinned diff (resolveBeatPaths/assertGitWorktree, 59 insertions, commit
   2a04baf in 964f443e..31c465f1).

2. "The exported `BEGIN_MARKER` (`:56`) and `END_MARKER` (`:57`)".
   Output: `56  export const BEGIN_MARKER = "<!-- charter-scribe-beat:begin -->";`
   `57  export const END_MARKER = "<!-- charter-scribe-beat:end -->";`. VERIFIED.
   (Master cited only `:57` for the pair and called :57 BEGIN_MARKER — the
   re-anchor fixed a mislabeled line.)

3. "injection verifies exactly one `BEGIN_MARKER` (`:717-718`)".
   Output: `717  const markerCount = after.split(BEGIN_MARKER).length - 1;`
   `718  if (markerCount !== 1) throw new Error(...)`; a second post-pull check
   exists at 796-797 (uncited, not false). VERIFIED.

4. "ordinary errors reach the CLI catch, which logs `err.message` and exits 1
   (`:898-900`)".
   Output: `898  runBeat(argv).catch((err) => {` `899
   console.error(\`charter-scribe: ${err.message}\`);` `900    process.exit(1);`.
   VERIFIED. Cross-checked with
   `git grep -n -e ScribeError -e CHARTER_SCRIBE_REFUSAL_SCHEMA -e emitTypedRefusal 31c465f1 -- scripts/charter-scribe/sync.mjs`
   → exit 1, no matches (control: same command for BEGIN_MARKER → 5 hits, exit 0,
   so grep syntax was valid). 26 `throw new Error` sites at the pin, all plain
   Error.

5. "Direct invocation is guarded by `isMain` (`:881-883`)".
   Output: `881  const isMain =` `882    process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(resolve(process.argv[1]));`
   `883  if (isMain) {`. VERIFIED (realpath argv[1] match, exactly as stated).

6. Population-table row: line 124 `| `scripts/charter-scribe/sync.mjs` | 902 | tool |`.
   Command: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/charter-scribe/sync.mjs | wc -l`
   → `902`. Master row said 844 = the 964f443e count (`git show 964f443e:... | wc -l` → `844`),
   so the update is a true re-measurement at the pin, not an inflation. Also
   cross-ref at line 467: `replaceAll` fills the four Kimi placeholders —
   output: `506  export function renderKimiPrompt(template, vars) {` with
   `.replaceAll("{{DATE}}"...)` ... `{{COMMITS}}` at 508-511. VERIFIED.

# Removed clauses left a trace / no false residue

- Master clause "Every refusal on the beat path is a tagged `ScribeError` (`:85`)
  carrying a stable snake_case code plus discriminator details" and "put on the
  wire as one `CHARTER_SCRIBE_REFUSAL_SCHEMA` line (`:104`) by `emitTypedRefusal`":
  both dropped; replacement paragraph states "The former tagged-refusal surface
  is absent". Trace kept via the parenthetical markers at the section tail:
  "(round 35: removed ScribeError — absent at 31c465f1)" and "(round 35: removed
  CHARTER_SCRIBE_REFUSAL_SCHEMA — absent at 31c465f1)" plus "re-anchored at
  31c465f1 (round 35)".
- Lineage check that "absent" is honest, not a stale-clone artifact:
  `git -C /fast/scratch/kumitate-r35/src log --oneline --all -S ScribeError -- scripts/charter-scribe/sync.mjs`
  → empty (same for CHARTER_SCRIBE_REFUSAL_SCHEMA, emitTypedRefusal); clone has
  146 commits, 964f443e is ancestor of 31c465f1, 38 commits between. The symbols
  never existed upstream; wave-1's master text was the fabrication, and this
  round's removal is the fix. [INFERENCE on intent, observation on absence]
- Master clause "composes a thread note over grok-web (degrading to a
  deterministic local template on route failure)" was dropped. It was TRUE at
  the pin (composeViaGrokWeb :431 with scribe_route_failure telemetry; fallback
  at 696-700 `surface = "local-fallback"`); its removal loses a true anchor but
  is not a false claim — coverage-surface shrink, noted as residual risk.
- "The former..." sentence: every noun-verb claim re-verified:
  pushurl override refused (739-742), push refspec refused (745-748), push-URL
  equality (752-755), non-main/detached refused (758-761), dirty index.html
  refused (763-771). "pushes the evidence repo itself" refusal — the beat only
  ever runs `push origin main` in cfg.charterRepo (840); no push targets the
  ufo-fsd-alpha repo. VERIFIED.
- Stale-citation sweep:
  `grep -n 'sync\.mjs:[0-9]' corpus/knowledge/remaining-scripts-census.md` → only
  lines 467 (`:508-511`) and 471 (`:604`, `:56`, `:57`, `:717-718`, `:898-900`,
  `:881-883`); all six verified above. No dangling old-number citation (665/85/
  104/1054/1084) survives anywhere in the file. The only other sync.mjs mention
  (line 463, config.json note) is path-only, no line anchor.

# Verdict rationale

Six of six anchors in the re-anchored section read correct at 31c465f1; both
population-row and cross-ref line counts match `wc -l`/`nl` exactly; the original
"round 35" revision label plus per-clause removal traces are present; the
rewritten refusal sentence is strictly true at the pin; no new false claim found.
No mutation gates named for this member; line counts and greps are the assigned
re-checks and all pass.

Residual risk (no defect):
- The dropped "grok-web compose + local-fallback" clause shrinks the section's
  coverage surface (a true behavior no longer named). Restoring it with pin
  anchors (e.g. composeViaGrokWeb `:431`, fallback `:696-700`) would be a
  coverage gain, not a correctness fix.
- Injection's second post-pull marker check (:796-797) is uncited; census names
  only the first. Optional anchor addition.
- `git grep` used as symbol-absence evidence after LSP was unavailable in this
  leaf context (plain .mjs, no language server configured); both positive
  (control) and negative greps behaved consistently, so absence is trusted.

Verification gaps: none in scope. Not run (out of leaf scope): node execution
of the beat, proxy selftest rerun (main-level C1/C2 gates).
