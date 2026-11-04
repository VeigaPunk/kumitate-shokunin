# K75SentinelCensus — C1 boundary probes

Axes: operability + coverage (orchestration/tooling). Read-only investigation; no remediation or admission judgment.

## Evidence

Receipt: `.ufo/waves/round-75/build/K75SentinelCensus/fail-closed.txt` (31 probe rows); raw stdout/stderr and numeric exits in sibling `raw/`. All expected probe observations held, including the deliberately passing mention-binding limit. No tools installed.

Base extracted read-only with `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c38382d547a1ec21bb7f51b4c08ef08053e7abae:scripts/omp-census.mjs`; byte comparison with the then-current lane script was identical. Executor patch became available during base probing, without a waiting poll loop, and was applied only with `patch -p1 -d "$S/patched" -i <executor-patch>`. The receipt records its SHA-256. No git writes, lane code changes, or live-root writes.

`S=/fast/scratch/hyaku/kumitate-r75/K75SentinelCensus`; every fixture and selftest work directory was explicitly beneath S. Base commands were `node <lane>/scripts/omp-census.mjs --root <fixture>`; selftests added `--selftest --work "$S/fixtures"`, with and without `--root /nonexistent-sentinel-xyz`. Fixture probes: absent root, regular-file root, chmod-000 root, empty directory, declared-name symlink, unlisted symlink, `kimi-device-id` chmod 0644, and `config.yml` chmod 000. Symlinks targeted `/etc/hostname` but were only lstatted, never followed by the census.

Shape specificity command: `bash <lane>/.ufo/waves/round-75/controls/mk-shape-fixture.sh /home/vgpnk/.omp/agent "$S/root" bogus-75.txt`, then `node <tool> --root "$S/root"`. The supplied helper copies empty-file/directory shape, not hardlinks. Base: `UNLISTED bogus-75.txt`, entries=65 findings=41, exit 1. Patched: same UNLISTED, entries=65 findings=1, exit 1.

Other base observations: missing/regular-file/unreadable roots exit 2 with ENOENT/ENOTDIR/EACCES; empty root exit 1 with EMPTY; symlink exit 1 with KIND/UNLISTED; 0644 device-id exit 1 with `MODE kimi-device-id want<=0600 got=0644`; bogus-root selftest `VERDICT: PASS (29 cases)` exit 0. Repeated each root/kind/mode/specificity boundary against the patched tool with a valid 35-token note: all held. Patched bogus-root/bogus-note selftest: `VERDICT: PASS (47 cases)` exit 0.

Patched declaration probes: `node "$S/patched/scripts/omp-census.mjs" --root <fixture> --note <note>`; exact executable driver retained as `build/K75SentinelCensus/patch-probes.py`. Both literal requested `config.yml.pre-x-2026` (four digits, not seven) and actual seven-digit `config.yml.pre-x-2026110` remain UNLISTED; bogus-75.txt remains UNLISTED; exit 1. Empty note: 35 NOTE_UNBOUND findings, exit 1. Missing note: NOTE_MISSING reason=ENOENT, exit 2.

## Findings / named limits

### Medium — mention-binding is not semantic binding

Exploit path: supply a note containing all 35 declaration names only inside a fenced code block. Observed `OMP_CENSUS: CLEAN (... entries=1 findings=0 bound=35/35)` exit 0. Evidence: patched source line 218 uses `noteText.includes(name)`; `raw/patch-fenced-note.txt` records the passing probe. Impact: bound=35/35 proves textual mentions only, not explanatory coverage, correct provenance, or meaningful declarations. This is a named limit of the arm, not by itself a failure of the frozen mention-count contract. Smallest remediation: describe the metric explicitly as mention-binding; only if a stronger future contract is desired, require structured declaration entries rather than arbitrary substrings. No change to this round's frozen predicate proposed.

### Medium — drop-mutant failure needs causal attribution

Ran `node <controls>/c1-junkwiden.mjs` on the live root: CLEAN entries=64 findings=0 exit 0. On the 65-entry bogus fixture it also reads CLEAN exit 0. Thus frozen (b) definitively rejects this control: it neither emits UNLISTED bogus-75.txt nor exits 1. Its unmodified selftest already fails three cases (`unlisted-name`, `unlisted-chain-on-another-owner`, `optional-dir-unlisted-name-is-drift`), `VERDICT: FAIL (3 of 29 cases failed)` exit 1; frozen (c) rejects it too.

Frozen (d) alone is not independent proof against a catch-all: dropping a family leaves acceptance of otherwise-valid family names unchanged, while an already-red baseline can produce nonzero/FAIL before and after a drop. Impact: a bare nonzero mutant receipt may falsely attribute an existing failure to the mutation. Smallest remediation: interpret the existing baseline requirement and Q23 flip requirement causally—retain baseline PASS and compare sorted named failures introduced by each drop, including rerun. This seat did not execute blanket drop mutants or replace the mutation seat's work.

### Informational — member content scan versus note content read

Base content-read search (`readFileSync|openSync|createReadStream`) has no matches, search exit 1. Patched source necessarily imports readFileSync and calls `readFileSync(note, 'utf8')` at line 273: a global no-readFileSync statement would be false. The member scan (`readShape`, lines 123–136) uses lstat/readdir only. A chmod-000 declared member still produces CLEAN entries=1 on both base and patched tools, exit 0, supporting shape-only operation. Impact: do not conflate note reads with member content reads. Explicit `--note` can designate any readable path, including a member; no sandbox promise was tested. Smallest remediation: qualify the assurance as no member-content reads by the shape scan.

## Limits and cleanup

No syscall trace or race/vanishing-entry stress test; no claim of calendar-date validity or semantic note validation. Selftest bogus-root evidence plus static main dispatch supports hermetic branching, not arbitrary runtime instrumentation. Frozen plan unchanged. No secrets/member content collected. Scratch is removed after copying evidence.

Self-evaluation: accuracy 4/5 (no syscall tracing); completeness 5/5 (all assigned probe surfaces exercised); clarity 4/5 (full command details split between report and retained driver); actionability 5/5 (named evidence and smallest remedies); conciseness 4/5 (raw evidence intentionally separate). Overall 4.4/5. Highest-value future improvement: syscall tracing if stronger no-content-read assurance is required; not needed to interpret these findings.
