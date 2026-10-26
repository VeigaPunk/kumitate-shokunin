VERDICT: The harm-matrix copy in `build/K65ExecHarmNormalize/work/` fixes all five named defects (each with a red-first selftest case), reads `HARM_MATRIX_SELFTEST: PASS (36/36)` exit 0 — the 26 frozen cases still pass — and the patch applies cleanly to a fresh lane clone where the same selftest and the frozen H2 control set read identically to the frozen tool.

## Evidence

Work copy + patch (no lane byte written; `scripts/harm-matrix-gates.json` untouched, `diff -q` exit 0):

```
$ diff -u --label a/scripts/harm-matrix.mjs --label b/scripts/harm-matrix.mjs \
    kumitate-shokunin/scripts/harm-matrix.mjs work/harm-matrix.mjs          # + cases diff, concatenated
build/K65ExecHarmNormalize/patch.diff                       21274 bytes, 2 files
$ git -C <fresh-clone> apply -v patch.diff ; git -C <fresh-clone> -c user.name=k65 -c user.email=k65@invalid commit -qam …
Applied patch scripts/harm-matrix.mjs cleanly.
Applied patch scripts/harm-cases.json cleanly.
clone_rev=0d62b2cea10fd63ef54b89c0418546bfde6cd0cb   (fixture clone of the lane at 2ca91a0 + patch)
```

Red first — the nine new cases + one guard on the **unfixed** tool (`logs/red-new-cases.txt`):

```
$ node work/harm-matrix.unfixed.mjs --selftest --cases work/harm-cases.new-only.json
CASE FAIL normalise-temp-path-fixed exit=0 want=0 rows=["g1 CARRIED_MOVED"] wantrows=["g1 CARRIED"] summary="HARM_MATRIX: CLEAN gates=1 held=0 repaired=0 carried=0 moved=1 …"
CASE FAIL normalise-temp-path-per-run exit=0 want=0 rows=["g1 CARRIED_MOVED"] wantrows=["g1 CARRIED"] summary="… moved=1 …"
CASE FAIL bg-grandchild-pipe-release exit=0 want=0 rows=["g1 CARRIED"] wantrows=["g1 HELD"] summary="… carried=1 …"
CASE FAIL oversize-truncation-not-clean exit=0 want=0 rows=["g1 HELD"] wantrows=["g1 CARRIED"] summary="… held=1 …"
CASE FAIL non-utf8-verdict-line exit=0 want=0 rows=["g1 HELD"] wantrows=["g1 REPAIRED"] summary="… held=1 repaired=0 …"
CASE FAIL verdict-literal-flags-rejected exit=0 want=2 rows=["g1 CARRIED"] wantrows=[] summary="… carried=1 …"
HARM_MATRIX_SELFTEST: FAIL (4/10)   wall 30.16s
```

Green — patched copy, full suite (26 frozen + 10 new), `logs/green-all-36.txt`; and the same in the patched clone, `logs/green-in-clone-36.txt`:

```
$ node work/harm-matrix.mjs --selftest              -> HARM_MATRIX_SELFTEST: PASS (36/36)  exit=0  (36 CASE ok)
$ cd <clone> && node scripts/harm-matrix.mjs --selftest -> HARM_MATRIX_SELFTEST: PASS (36/36)  exit=0
$ node work/harm-matrix.mjs --selftest --cases work/harm-cases.unfixed.json   # the 26 frozen cases only
  -> HARM_MATRIX_SELFTEST: PASS (26/26)  exit=0            (logs/green-frozen-26-patched.txt)
$ node work/harm-matrix.mjs --selftest --cases work/harm-cases.new-only.json  # the 10 new cases only
  -> HARM_MATRIX_SELFTEST: PASS (10/10)  exit=0            (logs/green-new-cases.txt)
```

Defect 2, measured on the same fixture (`logs/bg-grandchild-timing.txt`; gate `echo 'G1: CLEAN'; sleep 60 &`, timeout 5):

```
--- unfixed elapsed_ms=26134 exit=0
HARM_ROW gate=g1 base=TIMEOUT tip=TIMEOUT id=CARRIED base_text="timeout>5s" tip_text="timeout>5s"
--- patched elapsed_ms=85 exit=0
HARM_ROW gate=g1 base=CLEAN tip=CLEAN id=HELD base_text="G1: CLEAN" tip_text="G1: CLEAN"
```

Defect 3, `ok_exit:[0,128]`, gate `echo 'G1: CLEAN'; head -c 70000000 /dev/zero | tr '\0' x` (`logs/oversize-cli.txt`):

```
--- unfixed  HARM_ROW gate=g1 base=CLEAN tip=CLEAN id=HELD base_text="G1: CLEAN" …
--- patched  HARM_ROW gate=g1 base=FAIL_CLOSED tip=FAIL_CLOSED id=CARRIED base_text="output>67108864B" …
```

Compatibility with the frozen counter (`logs/h1h2-patched.txt`, `logs/h1h2-frozen.txt`; H1+H2 code copied verbatim from `probe/harm65-probe.mjs` into a scratch harness):

```
rev=0d62b2c… H1 selftest exit=0 line=HARM_MATRIX_SELFTEST: PASS (36/36)
rev=0d62b2c… H2 controls=16 ids=9 exit0-cases=9 H2 OK
rev=2ca91a0c… H1 selftest exit=0 line=HARM_MATRIX_SELFTEST: PASS (26/26)
rev=2ca91a0c… H2 controls=16 ids=9 exit0-cases=9 H2 OK
```

Real pair `a004902d` → `47fe2383` (`logs/real-pair-unfixed.txt`, `logs/real-pair-patched.txt`) — rows byte-identical, both exit 1: `readme-map HARM`, `proxy-check HARM`, `base=a004902d77d1 tip=47fe23831519`.

Defect 5 confirmation (`logs/verdict-flags-probe.txt`):

```
plain: built global=false sticky=false
inline (?g): THROWS SyntaxError: Invalid regular expression: /(?g)^G1: (\w+)/: Invalid group
literal /re/g as string: built global=false sticky=false src="\\/^G1: (\\w+)\\/g"
literal string match on a real line: null
g-flag statefulness: first= ["G1: CLEAN","CLEAN"] second= null lastIndex= 0
```

One unexplained red on the frozen-26 baseline: the first run read `HARM_MATRIX_SELFTEST: FAIL (25/26)` with `CASE FAIL repaired-from-timeout … rows=["g1 GONE"]` (`logs/red-frozen-26.txt`). Seven later runs — 3 single-case, 2 full, 6 concurrent full (`logs/red-frozen-26b.txt`, `conc-a/b.txt`, `conc6-1..6.txt`) — read 26/26. Reported as observed, not diagnosed.

## Findings

**K65ExecHarmNormalize-1 (medium, attacked: CARRIED/CARRIED_MOVED).** `transition()` compared the raw verdict text, so a not-clean line carrying a per-run temp path (`PLAN_BEFORE_READY_SELFTEST … fixtures=/tmp/pbr-selftest.9xK2pQ`) read `CARRIED_MOVED` on every run — exactly the limit the plan states. Fix R1: compare `normText(text)`, which rewrites the random suffix of `<tmp-root>/<stem>.<6+ alnum>` to `<tmp>` (roots `os.tmpdir()`, `/tmp`, `/var/tmp`, `/dev/shm`); the raw line is still printed and a normalised row ends with ` normalized=1`. Repro: `node work/harm-matrix.unfixed.mjs --selftest --cases <one-case-file>` for `normalise-temp-path-*`.

**K65ExecHarmNormalize-2 (high, attacked: process control / false TIMEOUT).** `spawnSync` captured gate output through pipes, so a background grandchild inheriting the stream kept the matrix waiting until its own T+8s backstop fired: 26 134 ms and a **false `TIMEOUT`** for a gate that printed `G1: CLEAN` and exited 0 in milliseconds (a false HARM whenever the other side is clean). Fix R2: stdout/stderr go to files in a per-run scratch dir (`stdio: ['ignore', fd, fd]`), unlinked after reading; the `timeout -k 2 T` wrapper and the T+8s SIGKILL backstop are unchanged. 85 ms after the fix.

**K65ExecHarmNormalize-3 (high, attacked: output cap).** On Node v24.21.0 a >64 MiB gate does **not** crash the tool (`spawnSync` returns `ENOBUFS`, `status=null`); it silently truncates at 64 MiB, invents exit `128`, and then (a) reads `no-verdict exit=128` — a diagnosis indistinguishable from a gate that printed no verdict — or (b) reads **CLEAN** when the registry's `ok_exit` contains 128, which is a lie about output the tool could not hold. Fix R3: capture into files, `statSync` first, combined size > 67 108 864 B → `FAIL_CLOSED output>67108864B` without reading. Repro: `logs/oversize-cli.txt` command in the header of that log.

**K65ExecHarmNormalize-4 (medium, attacked: encoding).** A latin-1 byte inside the matched verdict line decoded to U+FFFD and read `CLEAN`. Fix R4: lines are decoded strictly per line; a matching line that is not valid UTF-8 → `FAIL_CLOSED verdict-not-utf8 exit=n`; invalid bytes on non-matching lines are ignored (`non-utf8-noise-ignored` guards against over-triggering).

**K65ExecHarmNormalize-5 (low, attacked: verdict flags — confirmed, not a live bug).** The registry holds a plain string and `new RegExp(g.verdict)` passes no flags, so `g`/`y` cannot be expressed and no `lastIndex` state can leak between the base and tip run (a `g` regex would — `second= null` above). Inline `(?g)` is already rejected by the constructor (`GATES_INVALID`). The one reachable operator error — a JS-literal value `/^G1: (\w+)/g`, which silently matched nothing and read `CARRIED` — is now rejected at load: `FAIL_CLOSED reason=GATES_INVALID detail="g1: verdict-literal (flags are not accepted; write a bare pattern)"`.

**K65ExecHarmNormalize-6 (medium, attacked: sandbox trust).** `sandbox()` trusted `git checkout` and measured whatever tree it got; an incomplete/stale checkout reports a gate's `needs` path as absent and is classified `ABSENT`/`GONE` — a gate change — which is the shape of the one unexplained `rows=["g1 GONE"]` above. Fix: after checkout, `git rev-parse HEAD` must equal the requested revision, else `FAIL_CLOSED reason=SANDBOX_FAILED detail="stale-checkout: …"`. Exercised twice on every matrix run; no negative case (a checkout that lies cannot be built from real git).

**K65ExecHarmNormalize-7 (info, harness operability).** The selftest could assert only rows / exit / summary, so neither defect 3 nor defect 2 is observable at case level. Added `expect.text` (required substring of a gate's row text) and `expect.max_ms` (wall-clock bound on the whole matrix run). Case classes are labelled in each case's `note`: six red-first cases, and `oversize-output-early-verdict`/`-late-verdict`/`non-utf8-noise-ignored`/`verdict-inline-flags-rejected` are guards that pass on both tools (the unfixed harness has no text assertion).

Nothing relaxed: the gates registry is byte-identical, the changed reading semantics are R1–R5 only, and every one of them can turn a clean reading into a not-clean one, never the reverse.

## Artifacts

- `build/K65ExecHarmNormalize/patch.diff` — `git apply -p1`-clean, both files (tool +99/−19, cases +290/−0).
- `build/K65ExecHarmNormalize/tool.diff`, `cases.diff` — split diffs.
- `build/K65ExecHarmNormalize/work/harm-matrix.mjs` (patched draft), `harm-cases.json` (36 cases), `harm-cases.new-only.json` (10 new), `harm-matrix.unfixed.mjs` + `harm-cases.unfixed.json` (frozen copies for the red runs), `harm-matrix-gates.json` (unchanged copy).
- `build/K65ExecHarmNormalize/logs/`: `red-new-cases.txt`, `red-frozen-26.txt`, `red-frozen-26b.txt`, `green-new-cases.txt`, `green-all-36.txt`, `green-in-clone-36.txt`, `h1h2-patched.txt`, `h1h2-frozen.txt`, `real-pair-unfixed.txt`, `real-pair-patched.txt`, `oversize-cli.txt`, `bg-grandchild-timing.txt`, `verdict-flags-probe.txt`, `conc-a/b.txt`, `conc6-1..6.txt`.
- Scratch `/tmp/kumitate-r65/K65ExecHarmNormalize/` (68 K): `h2compat.mjs` (H1+H2 replica), `one.json`, `tool.diff`, `cases.diff`. Fixtures and lane clones deleted; no tool installed (node v24.21.0, GNU timeout, git from the host).

## Limits

- The frozen H65 counter was not run here (H3/H4/H5 and the real-pair direct commands are the parent's gate). I replicated H1+H2 with the probe's own code, on a fixture clone; H3(a) was only spot-checked through the tool (`real-pair-*.txt`), not against direct gate runs.
- maxBuffer overflow did not crash on Node v24.21.0; the ticket's "not crash" clause is satisfied by observation, but the real defect is silent truncation (finding −3). A Node that throws `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` is out of reach here.
- A runaway-output gate can still write up to its own timeout's worth of bytes into the scratch file before R3 fires (the cap is applied after the child returns). No `RLIMIT_FSIZE` guard was added: it would also restrict files real gates may legitimately write.
- R1 normalises only `<tmp-root>/<stem>.<6+ alnum>`. A per-run token elsewhere (a PID-suffixed name outside a temp root, a timestamp in a non-temp path) still reads `CARRIED_MOVED`. It does not touch `<stem>`, other path text or the `[exit=n]` marker.
- The `stale-checkout` assertion has no case (unconstructible); the throw path of `buildFixture` still leaks its `harm-fixture.*` dir when a fixture git commit fails (pre-existing, unchanged).
- The plan's stated limit "text that embeds a random temp path makes a not-clean gate read CARRIED_MOVED" is obsolete once R1 lands; the frozen plan must not be edited, so the L1 should record the retired limit in the round report.
- New `note` keys in `harm-cases.json` are documentation only; the L1 may drop them without changing any reading.
