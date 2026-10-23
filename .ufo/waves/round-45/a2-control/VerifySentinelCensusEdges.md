RESULT VerifySentinelCensusEdges rev=a2e5b54c verdict=confirmed confirmed=1 refuted=0 unverified=0 new=1

Axis: operability.
Revision: my detached scratch clone reports `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`.
Source identity command: `printf 'd81978cd '; git show d81978cd:scripts/omp-census.mjs | sha256sum && printf 'pinned '; sha256sum scripts/omp-census.mjs`.
Observed: both hashes are `fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7`.

Inherited tally — CONFIRMED: `cases=10`, `defects=1`; all ten case records and the single reported finding reproduced. No inherited finding was refuted or unverified.
Case-run command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusEdges/verify-cases.mjs`.
The runner invoked the pinned script per case with `spawnSync(process.execPath, [script, '--root', root], {encoding:'utf8', timeout:10000, maxBuffer:8388608})`; each root was a fixture created in my scratch directory.
Observed: ten records, all `timedOut=false`; after the run, `pgrep -af '[/]fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusEdges/verify-cases[.]mjs$'` printed `no matching scratch process remains`.

Case results (exit; observed finding or verdict):
1. Symlink loop: `1`; `UNLISTED loop`; DRIFT, entries=1, findings=1.
2. FIFO at RULES.md: `1`; `KIND RULES.md want=file got=other`; DRIFT, entries=1, findings=1.
3. Socket at RULES.md: `1`; `KIND RULES.md want=file got=other`; DRIFT, entries=1, findings=1.
4. Mode-000 agents directory with hidden child: `0`; CLEAN, entries=1, findings=0. This matches the depth-1-only contract; the census does not visit that child.
5. Root symlink: `2`; stderr `OMP_CENSUS: ERROR ... reason=ENOTDIR`; no verdict line.
6. Filename `fake\nOMP_CENSUS: CLEAN (root=claimed entries=0 findings=0)`: `1`; output contains that forged CLEAN line and the genuine DRIFT line.
7. Unicode name `snow-雪-é`: `1`; `UNLISTED snow-雪-é`.
8. Leading-dash name `-leading`: `1`; `UNLISTED -leading`.
9. 10,000 extra entries: `1`; summary `entries=10000 findings=10000`; first three findings shown and 9,997 omitted from the runner's display; no timeout.
10. RULES.md symlink to `/etc/passwd`: `1`; `KIND RULES.md want=file got=symlink`; no file content was opened.

Inherited finding F1 — CONFIRMED, LOW: a newline in an untrusted member name can forge another verdict-looking stdout line.
Evidence: `scripts/omp-census.mjs:14-20` promises exactly one verdict line; `:186-190` interpolates `e.name` raw; `:259-262` prints findings and summary without escaping. The fixture run exited 1 but emitted `OMP_CENSUS: CLEAN (root=claimed entries=0 findings=0)` before the genuine `OMP_CENSUS: DRIFT ... findings=1`.
Exploit path: a writer able to add an entry under the supplied census root uses a newline and a verdict-like suffix. A consumer trusting the first or any CLEAN-looking stdout line could be misled [INFERENCE; no consumer was invoked]. Correctly honoring exit 1 still rejects this run.
Impact: the one-verdict-line output contract is broken and stdout is ambiguous to simple parsers or reviewers.
Smallest remediation: encode control characters in member names and the root string when rendering (or emit structured, escaped records with a reserved verdict field).

New finding N1 — LOW: the permission ceiling ignores special mode bits.
Exact command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r45/seats/a2-VerifySentinelCensusEdges/verify-special-mode.mjs`.
Observed: fixture `agents` mode was `2755`; exit `0`; output `OMP_CENSUS: CLEAN (... entries=1 findings=0)`; no timeout; process check printed `no matching scratch process remains`.
Evidence: `:58` sets the agents ceiling to `0755`; `:127` masks `st.mode` with `0o777`, dropping setgid; `:196-197` compares only the resulting mode. Thus a mode above the stated ceiling passes.
Exploit path and impact: a writer able to change a fixture/root entry adds setgid to `agents` (`chmod 2755`); the census reports CLEAN although the mode exceeds 0755. In group-based deployments this also changes group inheritance for subsequently created children.
Smallest remediation: retain `st.mode & 0o7777` in `readShape`; the existing ceiling comparison then flags special bits and `oct4` can render them.

No tools were installed or updated. No lane file other than this report was written.