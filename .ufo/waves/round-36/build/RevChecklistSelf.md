REV checklist recursion=bound skip-rules=2 safe-shape="node scripts/claims-check.mjs --fidelity"

# `--checklists` recursion and self-skip (read-only review of master 0614092e)

## Verdict
- **recursion=bound.** The only recursion guard is a literal substring test on the item's command text; a direct `node scripts/surface-probe.mjs --checklists` item is **skipped, never spawned**. The bound is lexical, not structural — shell quoting that reconstructs the flag at runtime defeats it (demonstrated below), and there is no depth counter, env marker or process guard.
- **skip-rules=2.** `SKIP(checked)` for `- [x]`/`- [X]`, `SKIP(self)` for any command containing `--checklists`. Nothing else skips: a malformed task line is a *failed* item, and there is no code-fence awareness.
- **claims-check -> proxy-check -> claims-check does not recurse today**, and must not be built: `proxy-check` -> `claims-check` is an in-process import (safe, claims-check has an entry guard); claims-check never references proxy-check as code. The reverse import would be fatal, not recursive: **proxy-check has no entrypoint guard** and executes its CLI on import.

## Evidence: parser and skip order
`scripts/surface-probe.mjs`
```text
182  const CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u;
801    if (!/^\s*- \[/.test(line)) continue;
803    const match = CHECKLIST_RE.exec(line);
819    if (/^\s*- \[[xX]\]/.test(line)) {
820      items.push({ line: index + 1, checked: true, label: ... });
```

`scripts/surface-probe.mjs:847-860` (run loop; note order: checked -> malformed -> self -> spawn)
```text
849  for (const item of parsed) {
850    if (item.checked) { results.push({ ...item, skipped: 'SKIP(checked)' }); continue; }
851    if (item.malformed) {
852      results.push({ ...item, failed: true });
853      findings.push({ severity: 'error', kind: 'CHECKLIST_GRAMMAR', ... });
856    }
857    if (item.command.includes('--checklists')) { results.push({ ...item, skipped: 'SKIP(self)' }); continue; }
858    const run = spawnSync('bash', ['-c', item.command], {
859      cwd: opts.self, encoding: 'utf8', timeout: CHECKLIST_TIMEOUT_MS, maxBuffer: MAX_BUFFER,
```

`scripts/surface-probe.mjs:867-882` — skipped items leave the denominator
```text
867  const ran = results.filter((r) => !r.skipped);
868  const passed = ran.filter((r) => !r.failed).length;
869  const failed = ran.length - passed;
870  const skipped = results.length - ran.length;
882  lines.push(`CHECKLIST: ${passed}/${ran.length} pass`);
```

Consequences:
1. `- [x]`/`- [X]` never reaches the grammar check (the regex at :182 requires `- [ ]`), so a checked line may hold *any* text and a failing command; it is reported `SKIP(checked)` and is invisible to the verdict. Silent, permanent escape hatch.
2. `SKIP(self)` is `String.includes('--checklists')` on the raw backticked command (:857), before `spawnSync` (:858). It matches anywhere in the command, including a `--self` value or a harmless mention; conversely `--check"lists"` is *not* matched and the child is spawned.
3. Malformed lines (a `- [` line that is neither the frozen grammar nor `- [x]`) are pushed without `skipped`, so they land in `ran` as failed: `CHECKLIST_GRAMMAR` error + exit 1. They are not skips.
4. `parseChecklist` is fence-blind: every line matching `/^\s*- \[/` is parsed, including inside fenced blocks. A documented example item in SKILL.md prose **executes**.

### Empirical proof (fixtures under /tmp, lane tree untouched)
Outer fixture (child item, self item, checked-failing item, malformed item):
```text
CHECKLIST  PASS SKILL.md:3 exit=0 expected=0 substring=hit — lexical-evasion child
CHECKLIST  SKIP(self)  SKILL.md:4 self-recursive
CHECKLIST  SKIP(checked)  SKILL.md:5 checked-but-failing — `node -e "process.exit(3)"` → exit 0 + `never`
CHECKLIST  ERROR  SKILL.md:6 grammar (- [ ] malformed item without arrow)
CHECKLIST_SKIPPED: 2
CHECKLIST: 1/2 pass
VERDICT: FAIL   exit=1
```
Line 3's command was `node <lane>/scripts/surface-probe.mjs --check"lists" --self <child>`: the substring test at :857 saw no literal `--checklists`, so the **nested checklist run executed** and its `CHECKLIST: 1/1 pass` satisfied the parent's expect. Depth is therefore unbounded under quoting/expansion; each level is one serial `spawnSync` with `CHECKLIST_TIMEOUT_MS = 120_000` (`:161`). [INFERENCE] `spawnSync` timeout SIGTERMs the `bash -c` child only, so a recursion bomb would orphan node grandchildren; not tested (deliberately not run unbounded).

Fence + case fixture:
```text
CHECKLIST  FAIL SKILL.md:4 exit=7 expected=0 substring=miss — documented example
CHECKLIST  SKIP(checked)  SKILL.md:7 upper-x fails — `node -e "process.exit(7)"` → exit 0 + `never`
CHECKLIST  PASS SKILL.md:8 exit=0 expected=0 substring=hit — live
CHECKLIST: 1/2 pass   exit=1
```
The item inside a ```` ```text ```` fence was executed (exit 7), and `- [X]` was skipped.

## Evidence: import vs subprocess across the gates
`scripts/proxy-check.mjs:248-251`
```text
248  // The claims gate is imported IN PROCESS (never spawned as a subprocess): the
249  // two layer terms need its registry-row derivation and its single walk of the
250  // origin tree. Importing it runs no CLI — its main() is guarded.
251  import { probeSections } from './claims-check.mjs';
```
`scripts/claims-check.mjs:916-926`
```text
916  /** Entrypoint guard: the CLI runs only when this file started the process.
917   *  `await import()` (proxy-check's probe) must never print a verdict or exit. */
919  const isEntry = (() => {
920    if (process.argv[1] === undefined) return false;
921    const invoked = resolve(process.argv[1]);
922    if (invoked === TOOL_FILE) return true;
923    try { return realpathSync(invoked) === TOOL_FILE; } catch { return false; }
924  })();
926  if (isEntry) main();
```
`scripts/proxy-check.mjs:2486` — no guard:
```text
2486  process.exitCode = main();
```
Imports performed (read-only):
```text
$ node --input-type=module -e "const m = await import('file://<lane>/scripts/claims-check.mjs'); ..." -- --fidelity
imported probeSections=function walkFiles=function exitCode=undefined   exit=0
$ node --input-type=module -e "await import('file://<lane>/scripts/proxy-check.mjs'); ..." -- --fidelity
import-claims wrapper reached end                                      exit=0
$ node /tmp/.../import-proxy.mjs --fidelity
stderr: proxy-check: unknown argument: --fidelity
exit=64   (wrapper reached end with exitCode=64)
$ node --input-type=module -e "await import('file://<lane>/scripts/proxy-check.mjs')" -- --fidelity
PROXY: DRIFT (C2_TOTAL_DRIFT ... declared=79 computed=80; AXES_DRIFT coverage 10 vs 9; PIN_UNPINNED scripts/sources-check.mjs)   exit=1
```
(the `-e` form slices `process.argv.slice(2)`, which is empty, so it ran a full live recompute — harmless, read-only, and it reproduces the ticket's baseline drift.)

Findings:
- `proxy-check` is **not import-safe**: any `import` of it executes `main()` with the *importer's* argv and sets `exitCode`. If claims-check imported proxy-check, claims-check's `--fidelity` would instead see `proxy-check: unknown argument: --fidelity`, exit 64.
- Even as an ESM cycle (`claims-check -> proxy-check -> claims-check`) it would not loop: the module map returns the in-progress claims-check namespace from cache. It would still break: proxy-check's top-level `main()` runs before claims-check's `const DEFAULT_SELF/CORPUS_DIRS/SCORECARD_FILE` initialize, so the imported `probeSections` would hit a TDZ `ReferenceError` (`INTERNAL_ERROR` exit 2) or the argv collision above.
- Subprocess direction is acyclic. `claims-check` has no import/spawn of proxy-check (only comments at `:7,:456,:460`); its single `spawnSync` (`:64`, `:582`) spawns **itself** for `--selftest` fixtures, not the CLI-on-CLI recursion shape. `proxy-check`'s single `spawnSync` (`:1277`) spawns itself for selftests.
- Neither gate reads `SKILL.md` (only `proxy-check:284 SKILL_FILE` for the C count and `proxy-check:70` defining C as `lines of <self>/SKILL.md matching /^\s*- \[/`). So a checklist item that runs either gate is a single process tree; the only recursive executor in the lane is `surface-probe --checklists` spawning itself.

## Safe command shape for the new fidelity item
Validated against the frozen `CHECKLIST_RE` (:182): it matches, contains no backtick, and contains no `--checklists` substring (so it can never be `SKIP(self)`):
```text
- [ ] Fidelity sweep (anchors resolve at the pin) — `node scripts/claims-check.mjs --fidelity` → exit 0 + `FIDELITY: CLEAN`
```
Rules the shape encodes:
- Keep `- [ ]` (never `- [x]`, or the item silently leaves the denominator). The target string `CHECKLIST: 14/14 pass` is the only evidence the item *ran*: `proxy-check`'s `C` term counts `/^\s*- \[/` lines (`proxy-check.mjs:70,284`), so a skipped item still raises C 13 -> 14 while `CHECKLIST` would print 13/13. Do not write the line inside a fenced block anywhere in SKILL.md (it would execute).
- Call `claims-check` directly, never `surface-probe --checklists` (self-skip) and never through `proxy-check` (import guard gap above). No `--src`: PIN v1 resolves the clone from the default `<self>/.ufo/pins/origin.json` and asserts `git rev-parse HEAD`; an explicit `--src` would hardcode the clone path in prose.
- Expect `FIDELITY: CLEAN`, **not** `src-rev=31c465f1`: the rev is re-pinned each round and the literal would stale. If the L1 wants the pin proven live inside the item, the portable stricter expect is the bare token `src-rev=` (still present only when a pin is active).
- Optional stricter variant (adds a re-pin obligation: `RATCHET_REV_STALE` exit 2 if the file's `revision` is not the active pin): `` `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` `` with `{revision:<pin>, notes:{}, total:0}`. At the post-re-anchor target nonok=0 this file carries no information, so the plain shape is recommended.
- Portability note: a checklist run with `--self <older tree>` executes *that tree's* `scripts/claims-check.mjs`; a pre-round-36 snapshot without `--fidelity` answers `claims-check: unsupported argument: --fidelity` exit 64 and the item fails — expected for historical replays, not a regression.

## Commands run
```text
node scripts/surface-probe.mjs --checklists --self /tmp/revcheck.<x>/outer      (fixtures above; outputs quoted)
node -e '<CHECKLIST_RE>.exec(candidate)'                                        (both candidate lines: matched)
node --input-type=module -e "await import('file://<lane>/scripts/{claims,proxy}-check.mjs')" -- --fidelity
node /tmp/revcheck-imp.<x>/import-proxy.mjs --fidelity
```
No lane file was written, no git/jj mutation, no tool installed. Temp fixtures were under /tmp and removed.
