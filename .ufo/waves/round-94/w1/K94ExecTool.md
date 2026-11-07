# K94ExecTool — w1 executor: production candidate `round-gate.mjs` (claim C1)

Seat produced the candidate only (no lane file touched). Deliverable lives at
`.ufo/waves/round-94/K94ExecTool/round-gate.mjs`, sha256
`341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20`
(`.ufo/waves/round-94/K94ExecTool/sha256.txt`); `READY` holds that one line.

## Behavior (implemented rule)

Resolution order in `runChecks` is now lane → main → origin → **declared** →
unresolved/unverifiable (`diff.txt`, hunk at `@@ -390,6 +450,8`). A token that
reached the declared step is `declared` iff it is a prefix of a 40-hex string
that is a complete URL path segment (URL split on `/`, `?`, `#`) of an
`http(s)://` URL on a `corpus/SOURCES.md` registry row (`^ {0,3}\|\s*S\d{3,}\s*\|`)
whose status cell (8th column) is not `rejected`; no SOURCES.md ⇒ no pins.
`declaredPins()`/`isDeclaredPin()` are the whole rule; the registry is read
lazily, once per run, only when a token reaches that step. `citations.declared`
is in every `--json` citations object (audit and fail-closed); a declared token
is never a finding; text-mode `COMMIT_CITED_UNRESOLVED` detail appends
`declared=<n>` when n>0. Contract id stays `kumitate-round-gate-v1` — additive
field, no field removed, `checks=10`/`checks=13` unchanged. Header doc block
carries the resolution order, the rule sentence, and `citations.declared`.

## Counter (frozen probe, both runs on the final bytes)

    node .ufo/waves/round-94/probe/probe94-c1.mjs --tool .ufo/waves/round-94/K94ExecTool/round-gate.mjs \
      --work /fast/scratch/hyaku/kumitate-r94/K94ExecTool/probe[2] --freeze 73317eca18c3927fc3c92fe492cd882dc4cda953

- `score1.txt`: `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1 tool_sha256=341726f3…`
- `score2.txt`: `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1 tool_sha256=341726f3…`
- r93: `base_exit=1 cand_exit=0 declared=["79fa222e","79fa222e8390aed3494f4bc6746814e6c74c21cf"] unresolved=[]`
- FX sources: `declared=[url8 full commitfrag] unresolved=[digest prose rejected mid none]`
- FX nosources: `exit=1 verdict=DRIFT unresolved=8/8`

## Selftest

`node .ufo/waves/round-94/K94ExecTool/round-gate.mjs --selftest` → exit 0,
`ROUND_GATE_SELFTEST: 71/71 pass` / `VERDICT: PASS` (`selftest.txt`). Count
**before 61 → after 71** (10 new arms: eight forgery shapes (i)–(viii), the
`--json citations.declared` shape arm, and the text-mode `declared=<n>` arm).
All 61 pre-existing arms still pass (BASE receipt in `controls/ctl-positive.txt`
is 61/61 at the same 61-arm suite).

## Arm teeth (`arm-teeth.txt`, `mutate94.py`)

Each rule-shape forgery patched into a scratch copy of the candidate (patch
asserted to apply exactly once), its `--selftest` run, failing arms recorded:

| mutant | selftest | targeted arms it kills |
|---|---|---|
| declared-check removed | 66/71 | (i) (ii) (iii) text-`declared=<n>` |
| blanket (always declared) | 61/71 | (iv) (v) (vi) (vii) (viii) text-detail + 3 old arms |
| substring (token anywhere in file) | 66/71 | (iv) (v) (vi) (vii) |
| anyline (no registry-row filter) | 69/71 | (v) |
| contains (segment.includes) | 69/71 | (vii) |
| norejfilter (rejected rows count) | 69/71 | (vi) |
| slashonly (split on `/` only) | 69/71 | (iii) |

Every mutant is killed; the seven arms (i)–(vii) each have at least one mutant
that only they detect. (viii) is killed only by the blanket mutant. The
`hermeticity: --selftest passes …` arm fails for every mutant by construction
(it re-runs the mutant's own suite) and is not counted as targeted teeth.

## Risks / notes

- Behavior changes only for tokens that resolve in no probeable repo; the seven
  KEEP rounds keep their exact unresolved sets (counter b=7/7) and no other
  filed report gains a `declared` entry (c=77/77).
- The read is `<repo>/corpus/SOURCES.md` via the existing `readText` (unreadable
  ⇒ empty set ⇒ pre-round-94 behavior); no path is written, no new spawn.
- `scripts/` is untouched: the candidate is seat-local until integration copies
  it over `scripts/round-gate.mjs` (then re-pin `pin.round-gate` and run the K3
  harm battery).

Receipts (all under `.ufo/waves/round-94/K94ExecTool/`): `round-gate.mjs`,
`READY`, `sha256.txt`, `diff.txt`, `selftest.txt`, `score1.txt`, `score2.txt`,
`arm-teeth.txt`, `mutate94.py`, plus run aids `cap-spawn.mjs`/`cap-run.mjs`.
