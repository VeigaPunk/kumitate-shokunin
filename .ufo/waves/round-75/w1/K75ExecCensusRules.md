# K75ExecCensusRules

Axes: coverage:omp + operability (tooling). C1 implementation only; no lane-tree application.

## Delivered

`build/K75ExecCensusRules/K75ExecCensusRules.patch` changes only `scripts/omp-census.mjs` against base `c38382d547a1ec21bb7f51b4c08ef08053e7abae`.

Adds exact `lsp.json` (S224) and anchored `config-pre` / `agent-pre-named` (S225) / `models-corrupt` (S054) declarations, all file/0600. No ceiling widening or catch-all. Models comment discloses that per-store opt-in was not located.

Adds note binding before verdict, defaulting to `<self>/corpus/knowledge/omp-agent-root.md`; `--self DIR` and `--note FILE` select it. Verbatim presence binds every base name/family id. Unbound names produce `NOTE_UNBOUND`; unreadable note produces `NOTE_MISSING`, exit 2. Only CLEAN gains `bound=b/n`.

## Retained evidence

- `build/K75ExecCensusRules/red-before.txt`: baseline `VERDICT: PASS (29 cases)`; changed `VERDICT: PASS (47 cases)`. Initial missing fixture-parent ENOENT is retained; creating the parent corrected setup, not code.
- `build/K75ExecCensusRules/live-census.txt`: `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)`, exit 0, using the completed `build/K75ScribeNote/omp-agent-root.md` draft via `--note`.
- `build/K75ExecCensusRules/note-arm.txt`: scratch note with all declared names except `models-corrupt`; `NOTE_UNBOUND models-corrupt`, `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=64 findings=1)`, exit 1.
- `build/K75ExecCensusRules/commands.txt`: exact clone/checkout/selftest/diff commands, scratch location and boundaries. Live and negative receipts include exact invocations, timestamps, base+patch identity and numeric exits.

The 18 additional cases cover LSP absent/present/MODE, each new family's generation/sidecars/malformed timestamp/MODE, total bound=35, NOTE_UNBOUND, and NOTE_MISSING. Every existing case remains green. Independent mutant seat received the patch; no mutation verdict is claimed here.

## Limits / handoff

Live CLEAN measures the scratch implementation plus scribe draft, not an integrated lane commit. L1 must apply both patches, then run default census and frozen specificity/drop-unit/post-integration gates. No corpus file was edited by this seat. Binding deliberately follows the requested literal substring contract, not semantic evaluation of prose or markdown sections; critic separately disclosed token-stuffing permissiveness for L1 judgment.

No supported LSP device was exposed in the session or mounted device inventory; source reads supplied symbol context. No tools installed/updated; no builds/linters/formatters, commits/pushes or external-state writes. Explicit assignment-authorized selftest/live/negative runs only. Agent-root member contents never read; only readdir/lstat shape plus separately selected knowledge-note text.

Scratch clone and fixtures removed after receipt capture. No implementation blockers.
