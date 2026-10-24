# ExecD57Close — D57 close-revision execution, round 57

Seat: leaf executor (no subdispatch, no commit, no production write).
Item: run the frozen counter `doctrine57-probe.mjs` at **the measured close revision**, capture
the full `held=k/5` line, and independently corroborate (or falsify) it.

Claim under test: **C2 — coverage frontier entry `corpus/knowledge/worker-heartbeat-liveness.md`**,
predicate `DOCTRINE57_HELD` (rule D57 v1, checks E1–E5). Axes: operability + coverage.

## Cited measured revisions

- **R1 = `f0dc6d1160e66af65355bd353665adac22bbf4a9`** — the plan's close sequence names R1 as the
  integration tip whose tree the report/SCORECARD cite; SCORECARD round-57 fills its measured
  slot with this revision (`git cat-file -t` → `commit`).
- **Tip = `8c6f5b017d149b18134917378cdbed3b492d8e89`** (lane HEAD before and after this seat;
  not moved) — the plan's "the tip carries a re-run against its own bytes".

Lane HEAD was read, never moved. `git status --porcelain` before and after shows only
pre-existing sibling seat artifacts plus this seat's own untracked build dir.

## Primary measurement — CORROBORATED at both revisions

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-57/probe/doctrine57-probe.mjs \
    /home/vgpnk/Projects/shokunin/kumitate-shokunin 8c6f5b017d149b18134917378cdbed3b492d8e89
DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=8c6f5b017d149b18134917378cdbed3b492d8e89 rule=D57 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
EXIT=0
```

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-57/probe/doctrine57-probe.mjs \
    /home/vgpnk/Projects/shokunin/kumitate-shokunin f0dc6d1160e66af65355bd353665adac22bbf4a9
DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=f0dc6d1160e66af65355bd353665adac22bbf4a9 rule=D57 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
EXIT=0
```

Both stdout lines match the frozen predicate sentence exactly through `rule=D57` (the probe
appends the per-check tail after `|`, the same shape A57 uses). stderr empty for both runs.

Byte-identity against the committed transcripts (`diff`, all empty):

| rev | committed file | result |
| --- | --- | --- |
| `f0dc6d11…` (R1) | `.ufo/waves/round-57/close/FINAL-doctrine57-R1.txt` | IDENTICAL |
| `798d4d23…` (R2) | `close/IDEMPOTENCE-798d4d2.txt` (DOCTRINE line) | IDENTICAL |
| `c42afe1c…` | `close/IDEMPOTENCE-c42afe1c….txt` (DOCTRINE line) | IDENTICAL |
| `b3bd0633…` | `close/doctrine57-final.txt` | IDENTICAL |
| `7178bfd3…` (base) | `base/doctrine57-base.txt` | IDENTICAL |

## Instrument binding (frozen counter is not a drifted probe)

- `sha256(.ufo/waves/round-57/probe/doctrine57-probe.mjs)` on disk =
  `8837a090ce76419ac996fafb9103357427935791a0399471e52dbf2ead670d53`.
- `git show f0dc6d11:.ufo/waves/round-57/probe/doctrine57-probe.mjs | sha256sum` = same value;
  blob id `0370f3df90ba0c4633858aaa106e66a3228f6eb5` is the same at freeze `f0dc6d1` and at tip
  `8c6f5b0` — the counter file was not edited after data ran.
- `.ufo/pins/counter-pins.json` round-57 entry `doctrine57-probe` carries the same
  `8837a090…` sha256 (round-57 also pins `attest57-probe`; B5 in the sibling A57 seat).

## Independent recomputation (probe code not imported)

`build/ExecD57Close/xv-verify.mjs` re-extracts the rev with its own `git archive` and recomputes
E1–E3 with its own regexes/hashes — the frozen probe is not called:

```
XV rev=8c6f5b017d149b18134917378cdbed3b492d8e89 E1=1 E2=1 E3=1 — independent recomputation, probe code not imported
E1 PASS source-line-chars=251 verified-at=true recheck=true
E2 PASS clauses=13 unbound=0 duplicate-path=0 hash-miss=0 distinct-paths=13
E3 S117 PASS status="mined" used-by="corpus/knowledge/worker-heartbeat-liveness.md" tier="docs"
E3 S118 PASS … E3 S119 PASS …
E3 pin S117/S118/S119/S120 PASS (capture blobs hash-match the registry)
E3 PASS (aggregate)
```

- **E4** re-run by hand inside the extracted tree: `SOURCES_CHECK: CLEAN
  (rows=120 tiers=A:99,B:13,C:8 status=queued:12,mined:88,rejected:20 entries_with_source=14
  legacy=38)`, exit 0.
- **E5** live census re-run: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
  --root /home/vgpnk/Projects/shokunin kumitate` → `kumitate ok …/corpus/SOURCES.md`, exit 0
  (the four `W04 duplicate url` warnings are the plan's declared pinned set: S034, S068, S084, S095).
- **All-token sweep** (stronger than E2 as frozen): 13 clause lines carry **15** receipt tokens;
  all 15 resolve to blobs at rev with matching sha256 (`ALL-TOKEN … tokens=15 hash-ok=15 miss=0`).

Sourced-substance spot check (my assessment, not a probe arm): the entry's 11 quoted phrases were
located inside the pinned capture bytes at rev — `QUOTE-LOCATION found=11/11`.

| id | URL opened (via pinned capture) | access date | located quote (≤25 words) | tier |
| --- | --- | --- | --- | --- |
| S117 | https://docs.temporal.io/encyclopedia/detecting-activity-failures | 2026-10-24 | "An Activity Heartbeat is a ping from the Worker that is executing the Activity to the Temporal Service" | A (docs) |
| S118 | https://kafka.apache.org/43/configuration/consumer-configs | 2026-10-24 | "typically should be set no higher than 1/3" (of the session timeout) | A (docs) |
| S119 | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ | 2026-10-24 | "Kubernetes provides liveness probes to detect and remedy" | A (docs) |
| S120 | https://www.rabbitmq.com/docs/heartbeats | 2026-10-24 | "ensure that the application layer promptly finds out about disrupted connections (and peers)" | B (docs; rejected — connection keepalive, not worker liveness) |

SOURCES rows agree: S117/S118/S119 `status=mined` with used-by naming the entry; S120
`status=rejected`, used-by `—`. Tier letters in the row are A/A/A/B as the plan states.

## Falsification arms (scratch clone under `build/ExecD57Close/`, never the lane)

Each mutant is derived from the pristine tip with `git reset --hard` (never cumulative); the
probe runs against the sandbox repo only.

| arm | mutation | verdict line | exit |
| --- | --- | --- | --- |
| K1 do-nothing | probe at base `7178bfd3…` | `DOCTRINE57_UNMET held=2/5 … E1 MISS entry-absent \| E2 MISS entry-absent \| E3 MISS S117:missing,…S120:pin-miss \| E4 PASS \| E5 PASS` | 1 |
| M1 `ab7fd95d…` | drop 2 of 13 clause lines | `UNMET held=4/5 … E2 MISS clauses=11 bound=11 distinct=11 hash-miss=0` | 1 |
| M2 `aa64911d…` | flip one hex digit of the first receipt token | `UNMET held=4/5 … E2 MISS clauses=13 … hash-miss=1` | 1 |
| M3 `fc1cbc3b…` | S118 SOURCES status `mined`→`queued` | `UNMET held=4/5 … E3 MISS S118:queued` | 1 |
| M4 `fcd47e90…` | delete the `verified-at:` line | `UNMET held=3/5 … E1 MISS head="source: S117 …" \| E4 MISS exit=1 last="SOURCES_CHECK: DRIFT (HEADER_INCOMPLETE)"` | 1 |
| C control | pristine tree restored | `DOCTRINE57_HELD held=5/5 checks=5 rev=8c6f5b01… rule=D57 \| E1..E5 PASS` | 0 |

The control reproduces the primary run byte-for-byte (same sha256), so the mutant series does not
disturb the measurement. Each of E1/E2/E3 was killed by its own targeted mutant; E2 has two
independent kill shapes (clause floor, hash binding).

## Maintained state / write boundary

Wrote only under `.ufo/waves/round-57/build/ExecD57Close/` plus this report. No production file,
SCORECARD/LOG/SKILL/PROVINCE/corpus edit, no commit, checkout, reset or jj command in the lane;
both sandbox clones (`sandbox/`, `sandbox2/`) and the extracted trees live inside the build dir.
No install was needed or performed (pacman paused; untouched).

Retained evidence (sha256 of the captures actually read for this report):

| file | sha256 |
| --- | --- |
| `build/ExecD57Close/doctrine57-tip.stdout.txt` | `9e16683bc148ee29ce3de16582764994cfc34d85d7bc37503849f960b3e18ea9` |
| `build/ExecD57Close/doctrine57-R1.stdout.txt` | `8c16ddbed31d51ce6e7d4d8c1b12c36ac41b33a646d3c9462009411a1c506ae9` |
| `build/ExecD57Close/doctrine57-base-repro.stdout.txt` | `12fccd620bf9cb40afa11bd52dfd1f9eb6bd1e3af20ad00f79777e1a1550c4ef` |
| `build/ExecD57Close/mut2-M1-drop-clauses.stdout.txt` | `be1ff211b3935cc2513072520025af87ef173095116b2f2bc088b9ed6b639b3e` |
| `build/ExecD57Close/mut2-M2-corrupt-hash.stdout.txt` | `6f4c867e398ce82162b967bc027ee27ff22e6b715a25b0c9d04439ec2ede9a08` |
| `build/ExecD57Close/mut2-M3-status-queued.stdout.txt` | `d6cc394f4a18529c04181277cb08d0ef74471b5d097db6f13f89ec5dc5611103` |
| `build/ExecD57Close/mut2-M4-drop-verified-at.stdout.txt` | `bca2caa15781bc0d1556b19f1445eff53d36a8e7e1eb412ccb2b30d622918b1d` |
| `build/ExecD57Close/mut2-C-pristine-control.stdout.txt` | `9e16683bc148ee29ce3de16582764994cfc34d85d7bc37503849f960b3e18ea9` |
| `build/ExecD57Close/mut2-summary.txt` | `1be2ba7a3a5b985e1c4753f140d8946966ddd11049462060f9fcb30a8fa58497` |
| `build/ExecD57Close/xv-tip.txt` | `42ce88fd2d14b8eb546948167ab767458478454dda8ea4e06783d3f94c6f2ff2` |
| `build/ExecD57Close/quote-locate.txt` | `d8c2b8bc9152a6c42fa8479166a216bd619718c8865e26681d1b6e6dcefb51ba` |
| `build/ExecD57Close/alltoken-check.txt` | `90ffd04c3218144a4b5afd8debf32b55c953c40f84ceac7c9ec37d7ccab275da` |
| `build/ExecD57Close/e4-independent.stdout.txt` | `e508d6c15fbaf8be455172034c8836781e9f129abfbc2448d154bbce62f2c0e0` |

Runs at `798d4d2`, `c42afe1c`, `b3bd0633` are retained too (`doctrine57-<rev>.stdout.txt`,
sha256 `e7923f0a…`, `02f8d2c8…`, `6ffea71d…`) and are the byte-identity evidence for the
idempotence table above. `sources-rows.txt` holds the SOURCES cells for S117–S120.

## Risks and limits

- **E2 binds one token per clause line, not all of them.** The probe uses `line.match(...)`
  (non-global), so only the first `receipt:…@sha256:…` on each `- ` line is checked. The entry
  carries 15 tokens across 13 lines; the two extra tokens (Kafka/K8s `source-metadata.txt` on the
  "Observed revisions" clause) are outside the frozen check. Both happen to hash-match at rev
  (`alltoken-check.txt`), so this run is not a false HELD — but the arm cannot catch a smuggled
  second receipt in future entries.
- **E1 and E4 share a dependency.** Deleting one `verified-at:` line costs two arms (M4, held=3/5):
  the entry header feeds both E1 and `sources-check`'s HEADER_INCOMPLETE arm. `held` is therefore
  not one-arm-per-defect in that region.
- **E5 is live-only.** It validates the working corpus, not the extracted rev tree, so a rev-tree
  regression with a clean live census would not move this arm (the probe header declares this).
- **Base UNMET is 2/5, not 0/5.** E4 and E5 pass at base `7178bfd3` because `SOURCES_CHECK: CLEAN`
  and census exit 0 pre-exist the C2 move; those two arms are not capability-attributable and the
  base receipt should not be read as 5-arm non-satisfaction.
- **Quote-location is lexical.** `quote-locate.mjs` normalizes HTML (drops tags, decodes common
  entities, collapses whitespace, lowercases) and substring-tests; it proves the quoted strings
  exist in the pinned bytes, not that each is the strongest evidence for its clause.
- **Disclosed harness defect.** My first mutant script (`mutate-run.sh`) restored with
  `git checkout --` from the *previous mutant commit*, so mutants were cumulative and the
  "restored" control read `1/5`. Its outputs are retained prefixed `v1flawed-`; the corrected
  series (`mutate-run2.sh`, `reset --hard <pristine>` per arm, control back at pristine `5/5`) is
  the one reported. The counter itself was never implicated.
- No blocker. The measured item is corroborated at R1 and at the tip; nothing was widened outside
  the item's revisions and the frozen counter.

## Verdict

`DOCTRINE57_HELD held=5/5 checks=5` at **R1 `f0dc6d11…`** and at tip **`8c6f5b01…`**, exit 0,
byte-identical to the committed close/idempotence transcripts. Six falsification arms (base,
four targeted mutants, pristine control) all behave as the frozen predicate says they must.
