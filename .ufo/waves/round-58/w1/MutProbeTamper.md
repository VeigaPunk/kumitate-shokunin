# MutProbeTamper — kumitate round 58

- Seat: `MutProbeTamper` (leaf; no dispatch or subagents)
- Axes: operability + coverage
- Measured integration revision R1: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- R1 parent / freeze commit: `50548ae5b4a47bb8d8cdc62212ec0648aa3776ee`
- Named base: `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37`
- Sandbox mutation commit: `27279974ed0e6a5acb011e51a20bd810f53d23f9` (parent R1)
- Mutation-probe result: **one-byte tamper detected** by `counter-pins`; this is not an ATTEST58 or DOCTRINE58 claim verdict.

## Frozen predicate text (context only; not scored by this seat)

ATTEST58_HELD — node .ufo/waves/round-58/probe/attest58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST58: ATTEST58_HELD held=10/10 checks=10 rev=<rev> rule=A58 version=v1" and exits 0.
DOCTRINE58_HELD — node .ufo/waves/round-58/probe/doctrine58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE58: DOCTRINE58_HELD held=5/5 checks=5 rev=<rev> rule=D58" and exits 0.

## Mutation

Created the required non-hardlinked clone under `build/MutProbeTamper/lane`, detached it at R1, and confirmed the R1/freeze parent relationship (`evidence/01-clone.log` through `04-r1-identity.log`). The pristine clone-local gate printed:

```text
COUNTER_PINS: CLEAN pins=17
exit_code=0
```

Changed exactly one byte in the clone's `.ufo/waves/round-58/probe/attest58-probe.mjs`: `const EXPECTED_CHECKS = 10;` became `const EXPECTED_CHECKS = 11;`. The diff contains only that line (`evidence/10-one-byte-diff.log`); `cmp -l` printed only `6315 60 61` (`evidence/11-byte-cmp.log`). `node --check` exited 0 after the change (`evidence/24-tampered-syntax-check.log`). The one-file, pathspec-limited sandbox commit succeeded and the clone was clean immediately afterward (`evidence/14-stage-tamper.log` through `17-postcommit-status.log`).

The registry pin and committed probe digests are:

```text
pinned / pristine: 6e5c67693f8409959f51bcab0a2255c44153b678b2934708a10812d32a69d84b
tampered commit:   455f8db8e008731644b94c26acaf513f72cb2da72117c63675d542a058cc6617
```

Sources: `evidence/07-baseline-probe-sha256.log`, `08-attest58-pin.log`, `12-tampered-probe-sha256.log`, and `20-committed-probe-sha256.log`.

## Detection results

1. **Requested argv, run literally after the commit:** the production `scripts/counter-pins.mjs` accepted `--registry <clone>/.ufo/pins/counter-pins.json` and exited 1, but printed `COUNTER_PINS: DRIFT pins=17 bad=17 first=attest53-probe:absent`, with every pin reported absent (`evidence/18-tampered-requested-explicit-registry.log`). This is not tamper-specific mismatch detection: the identical invocation on the pristine clone already printed the same `bad=17` all-absent result (`evidence/06-baseline-requested-explicit-registry.log`). The documented explicit-registry base is the registry's own directory, not the lane root (`scripts/counter-pins.mjs:120-124`), so `<clone>/.ufo/pins` is the wrong base for repo-relative pin paths.

2. **Tamper-specific clone-local control:** `node <clone>/scripts/counter-pins.mjs` exited 1 and printed exactly:

   ```text
   COUNTER_PINS: DRIFT pins=17 bad=1 first=attest58-probe:hash-mismatch
   ```

   See `evidence/19-tampered-clone-default.log`. Against the pristine `CLEAN pins=17` baseline, this independently corroborates that the one-byte change is detected and correctly attributed; the other 16 pins did not drift.

3. **Same external tool, corrected explicit-registry base:** copied the registry byte-for-byte to the sandbox clone root and passed that copy to the production tool. It also exited 1 with `COUNTER_PINS: DRIFT pins=17 bad=1 first=attest58-probe:hash-mismatch` (`evidence/25-copy-registry-to-clone-root.log` and `26-tampered-external-root-registry.log`). The production and clone counter-tool files had identical sha256 `060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e` (`evidence/09-counter-tool-identity.log`).

## Operability / coverage finding and boundary

The pin gate covers the requested one-byte counter tamper and fails nonzero with the precise pin name and `hash-mismatch`. The only observed operability caveat is invocation-specific: the requested explicit registry location produces a pre-existing all-absent DRIFT and must not itself be cited as proof of tamper detection. The clone-default or correctly based explicit-registry readings supply that proof.

No production mutation occurred. Production HEAD before and after was R1 (`evidence/00-production-head-before.log`, `21-production-head-after.log`); its probe retained the pinned digest (`evidence/22-production-probe-sha256-after.log`); `git diff --exit-code -- .` exited 0 (`evidence/23-production-tracked-diff-after.log`); and the production gate still printed `COUNTER_PINS: CLEAN pins=17`, exit 0 (`evidence/27-production-counter-pins-after.log`). No source was assessed, no claim counter was run, no tools were installed, and no fleet or sibling files were written.

Full commands, combined stdout/stderr, and exit codes are under `.ufo/waves/round-58/build/MutProbeTamper/evidence/`; the evidence runner is `.ufo/waves/round-58/build/MutProbeTamper/capture.sh`.
