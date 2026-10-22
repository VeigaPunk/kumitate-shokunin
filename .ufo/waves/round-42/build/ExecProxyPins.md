RESULT ExecProxyPins rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=implemented warnings_before=3 warnings_after=0 code_changed=yes

Files changed in the scratch clone: `SCORECARD.md` and `scripts/proxy-check.mjs`.
Behavior: kept `kumitate-proxy-v1` at its frozen 23 keys and six pins. Added a separate `kumitate-gate-pins-v1` block. The checker verifies its listed gate hashes, reports `GATE_PIN_DRIFT` on a mismatch or missing file, fails closed for malformed or unknown keys, and suppresses `PIN_UNPINNED` only for listed gate paths. Selftest fixtures cover anchor-truth, sources-check, wave-census, gate-mutants, mismatch, malformed and unknown keys, while retaining the v1 key assertion.
Stanza lines added after the v1 block:
`pin.anchor-truth=5a7893cba3eaecb04025a7983c0ffe779be2acb547f333907533f90a723db65c`
`pin.sources-check=6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f`
`pin.wave-census=d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204`
Changed v1 line: `pin.proxy-check=9b0a0942e851965d2ef024a4c680a8ca5be4d147971a1ed84565e8bea7f68995`.
The future key is exactly `pin.gate-mutants`; the checker and fixture accept it. The production source is absent at this revision, so no production digest is declared yet.
Patch: `/fast/scratch/hyaku/kumitate-r42/seats/ExecProxyPins/ExecProxyPins.patch`.
Patch command: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r42/seats/ExecProxyPins/lane diff b237e3f09c9559e130c7367bd2efa981c4ea516f -- SCORECARD.md scripts/proxy-check.mjs > /fast/scratch/hyaku/kumitate-r42/seats/ExecProxyPins/ExecProxyPins.patch`
Observed: `patch written: /fast/scratch/hyaku/kumitate-r42/seats/ExecProxyPins/ExecProxyPins.patch`

Revision/hash command: `printf 'revision: '; git rev-parse HEAD; sha256sum scripts/proxy-check.mjs`
Observed: `revision: b237e3f09c9559e130c7367bd2efa981c4ea516f`
Observed: `9b0a0942e851965d2ef024a4c680a8ca5be4d147971a1ed84565e8bea7f68995  scripts/proxy-check.mjs`
Before command at b237e3f09c9559e130c7367bd2efa981c4ea516f: `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict`
Before output: `PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=92 computed=93 delta=+1`
Before output: `PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9`
Before output: `PROXY  warn  PIN_UNPINNED  scripts/anchor-truth.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza`
Before output: `PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza`
Before output: `PROXY  warn  PIN_UNPINNED  scripts/wave-census.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza`
Before verdict and exit: `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=92 computed=93 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/anchor-truth.mjs; PIN_UNPINNED term=scripts/sources-check.mjs; PIN_UNPINNED term=scripts/wave-census.mjs; src-rev=31c465f15669)`; exit 1.
After command in the clone at the same revision: `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict`
After output: `PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=92 computed=93 delta=+1`
After output: `PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9`
After verdict and exit: `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=92 computed=93 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`; exit 1, with zero warnings.
Gate hash command: `sha256sum scripts/anchor-truth.mjs scripts/sources-check.mjs scripts/wave-census.mjs`
Observed: `5a7893cba3eaecb04025a7983c0ffe779be2acb547f333907533f90a723db65c  scripts/anchor-truth.mjs`
Observed: `6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f  scripts/sources-check.mjs`
Observed: `d6068d1b213064a4ff69f3489b4261e9fe37911ec4aa0e49a300d06c0ac17204  scripts/wave-census.mjs`
Future file lookup: `glob /fast/scratch/hyaku/kumitate-r42/seats/ExecProxyPins/lane/scripts/gate-mutants.mjs`
Observed: `Path not found: /fast/scratch/hyaku/kumitate-r42/seats/ExecProxyPins/lane/scripts/gate-mutants.mjs`
Not run: `node scripts/proxy-check.mjs --selftest`; the parent owns post-integration checks, so no selftest result is claimed.
LSP was unavailable in this seat's exposed tools; references were located with repository reads and search.
Risk: strict still reports the pre-existing `C2_TOTAL_DRIFT` and `AXES_DRIFT`; this scoped change removes only the three pin warnings. No tools were installed.