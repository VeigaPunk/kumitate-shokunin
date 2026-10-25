VERDICT: The frozen `inline-dispatch-evidence` gate reads CLEAN on a 40-seat wave whose only evidence is five hand-written JSON rows per seat, so the r63 ratchet binds here: five measured shape arms (SESSION_HEADER / TOOL_JOIN / ROWGRAPH / TIMELINE / TEMPLATE) kill every cheap forgery at 458/458 real-seat pass rate, and the patch keeps all 18 real host waves on their frozen verdicts (0 new findings).

## Evidence

E1 — cheapest faithful forgery, built with no seat having run (40 seats, 743-byte transcripts, 40 reports):
```
$ node .ufo/waves/round-63/build/K63ExecGateForgery/gen-forgery.mjs controls cheap-40-seats
WROTE 1 cases under …/build/K63ExecGateForgery/controls
$ node scripts/inline-dispatch-evidence.mjs --root …/controls/cheap-40-seats/lane --round 7 --wave w1 \
    --sessions-root …/controls/cheap-40-seats/sessions --dispatcher-log …/controls/cheap-40-seats/dispatcher.log
INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)      exit=0
$ ls …/controls/cheap-40-seats/sessions/orch | wc -l → 40 ; …/lane/.ufo/waves/round-7/w1 | wc -l → 40
```
Each transcript is exactly: `session` (id, parentSession) · `model_change` (role `subagent:<Seat>`) · user text
carrying `# Seat <name>`, the context head and the task tail · assistant `toolCall yield` · `custom session_exit normal`.

E2 — the same 40-seat forgery under the patched copy (`…/build/K63ExecGateForgery/inline-dispatch-evidence.mjs`):
```
INLINE_DISPATCH: DRIFT (seats=40 sessions=40 done=40 reports=40 dead=0)      exit=1
FINDING SESSION_HEADER:K63Forged01 … FINDING SESSION_TOOL_JOIN:K63Forged01 … SESSION_ROWGRAPH / SESSION_TIMELINE / SESSION_TEMPLATE
```

E3 — frozen vs patched on all 14 build controls (`bash cmp14.sh`), exit codes match every `expect`:
```
cheap-40-seats            frozen=CLEAN patched=DRIFT  expect=1/SESSION_TOOL_JOIN
cheap-padded-bytes        frozen=CLEAN patched=DRIFT  expect=1/SESSION_TOOL_JOIN
rich-broken-rowgraph      frozen=CLEAN patched=DRIFT  expect=1/SESSION_ROWGRAPH
rich-instant-timeline     frozen=CLEAN patched=DRIFT  expect=1/SESSION_TIMELINE
rich-no-header            frozen=CLEAN patched=DRIFT  expect=1/SESSION_HEADER
rich-no-rowids            frozen=CLEAN patched=DRIFT  expect=1/SESSION_ROWGRAPH
rich-orphan-result        frozen=CLEAN patched=DRIFT  expect=1/SESSION_TOOL_JOIN
rich-result-name-mismatch frozen=CLEAN patched=DRIFT  expect=1/SESSION_TOOL_JOIN
rich-thin-transcript      frozen=CLEAN patched=DRIFT  expect=1/SESSION_ROWGRAPH
rich-toolcalls-no-results frozen=CLEAN patched=DRIFT  expect=1/SESSION_TOOL_JOIN
rich-untimed              frozen=CLEAN patched=DRIFT  expect=1/SESSION_TIMELINE
template-renamed-transcript frozen=CLEAN patched=DRIFT expect=1/SESSION_TEMPLATE
honest / rich-honest-shape  frozen=CLEAN patched=CLEAN expect=0/CLEAN
```

E4 — patched selftest: `INLINE_DISPATCH_SELFTEST: PASS (37/37)` exit 0 (frozen: 25/25).

E5 — real-seat pass rate through the gate's own arms (`node measure-real.mjs …`):
`PASS-RATE 458/458 finished real seats read CLEAN under inline-dispatch-evidence.mjs` (428/428 on the first run; the
host store is live and grows while this wave runs) (one-seat synthetic wave per seat,
context/task cut from that transcript's own user text). Failures found and answered in F3/F4.

E6 — 18 real waves from `controls/inline-real-hosts.txt`, worktree mode, default sessions root + dispatcher log:
```
kengaku-shokunin r35/build   ok was=CLEAN now=CLEAN shape=0      kengaku-shokunin r35/falsify ok was=CLEAN now=CLEAN shape=0
mori-shokunin    r47/w2      ok was=CLEAN now=CLEAN shape=0      15 further waves: verdict identical to the frozen record, shape=0
```
`shape=` counts only `FINDING SESSION_(HEADER|TOOL_JOIN|ROWGRAPH|TIMELINE|TEMPLATE)`; total 0 across all 18 waves.

E7 — raw metric census, every finished real seat in `~/.omp/agent/sessions` (1497 at 18:2x) (`measure/census-arms.mjs`,
`measure/tool-join-deficit.mjs`, `measure/normalised-body-uniqueness.mjs`): every arm passes the whole set; honest minima
rows 15, bytes 46421, span 425 s, distinct timestamps 10, assistants 2, unpaired-call deficit max 1 (2 seats);
normalised-body collisions 0 of 1435 checked.

E8 — patch operability: `gate.patch` 252 lines (+167/−16 incl. headers) applies with `patch -p1` from the lane root and the
result byte-matches the build copy (`sha256 f01c574a…`); `scripts/inline-dispatch-evidence.mjs` sha256 `fdd88392…` unchanged.

E9 — `make-inline-controls.patch` (56 lines, +34/−8) applies to the frozen generator; regenerated 14/14 cases exit as
their `expect` under the patched gate, `honest` CLEAN.

## Findings

**K63ExecGateForgery-1 — HIGH — the frozen gate accepts a 40-seat forgery for 29 KiB of hand-written JSON.**
Attacks C1's I2/I3: the row markers (`# Seat`, context head, task tail, `session`, `yield`, `session_exit`) are all
lane-authorable, so a do-nothing lane that writes 5 lines per seat plus 40 reports reads CLEAN. This is the plan's
stated limit, now reproducible and committed as a control.
Repro: E1.

**K63ExecGateForgery-2 — HIGH — the committed `honest` control is the same 5-row stub, so the control set cannot
distinguish honesty from the cheapest forgery; any fix to F1 necessarily flips it.** `controls/inline/honest/sessions/orch/*.jsonl`
are 704/699/714 bytes with exactly the forgery's rows. Integration consequence: the L1 must land
`gate.patch` **and** replace `controls/inline/honest/sessions/` with the real-shape transcripts shipped in
`build/K63ExecGateForgery/controls/honest/sessions/` (proved drop-in: frozen lane bytes + those sessions →
`INLINE_DISPATCH: CLEAN` under both gates) **and** land `make-inline-controls.patch`, or I3's `honest` case fails.
Under the patch alone, 13/14 frozen controls keep their verdict; only `honest` flips.
Repro: `diff -r …/controls/inline/honest/sessions …/build/K63ExecGateForgery/controls/honest/sessions`; E3.

**K63ExecGateForgery-3 — MED — a `subagent:<Seat>` role check false-positives on resumed seats (caught on mori r47 w2).**
First draft bound `model_change.role` to the dispatched seat name; mori r47 w2 flipped CLEAN→DRIFT on `ScribeScorecard`
and `RevReadme`, whose matched files are `ScribeScorecard-2.jsonl` / retries whose role is `subagent:ScribeScorecard-2`.
The arm now binds the role to the transcript's own file stem (1382/1382 measured); after the fix mori r47 w2 is CLEAN.
Repro: `node inline-dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/mori-shokunin --round 47 --wave w2` → CLEAN.

**K63ExecGateForgery-4 — LOW — one real seat keeps an orphan `toolResult` (compacted transcript).**
`ScoutPlanned.jsonl` has 162 results for 161 calls: the call was pruned, its result survived. A strict `orphans == 0`
would flag 1/1497 honest seats, so `SESSION_TOOL_JOIN` tolerates ≤ 1 orphan and keeps the exact deficit rule
(`calls - paired <= 1 + yieldCalls`) which is what actually binds. Repro: E7 census; `measure/tool-join-deficit.mjs`.

**K63ExecGateForgery-5 — MED — residual: a lane that copies one real transcript and regenerates ids/timestamps/content
per seat still passes.** The five arms move the forgery cost from five lines to a generator over harness-shaped rows;
`SESSION_TEMPLATE` kills the cheap name-swap variant (and `SESSION_ID_DUP` the id-preserving variant), but a per-seat
regenerated copy is out of reach of structural evidence and must be answered by the non-author closure the plan names.
Repro: `controls/template-renamed-transcript` (name-swap, killed) vs a hand-built regenerated copy (not covered).

**K63ExecGateForgery-6 — INFO — rejected invariant: monotonic timestamps.** A plausible arm (non-decreasing per-row
timestamps) fails 158/1466 real seats (out-of-order `updatedAt`/`timestamp` pairs), so it is not in the patch; the
timeline arm only requires parseable, ≥10 distinct, ≥120 s span. Recorded so no later seat re-adds it.

## Artifacts
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63ExecGateForgery/`
- `inline-dispatch-evidence.mjs` — patched gate copy (selftest 37/37)
- `gate.patch` — unified diff against `scripts/inline-dispatch-evidence.mjs` (252 lines, +167/−16)
- `make-inline-controls.mjs`, `make-inline-controls.patch` — generator fix so I3 regeneration stays green
- `controls/` — 14 cases in `controls/inline/<case>/` layout (`lane/`, `sessions/`, `dispatcher.log`, `expect`):
  12 killed forgeries (incl. `cheap-40-seats`, 40 seats/29 720 B sessions/18 256 B lane), `honest` (drop-in), `rich-honest-shape`
- `gen-forgery.mjs` (independent fixture writer), `measure-real.mjs`, `measure/census-arms.mjs`,
  `measure/tool-join-deficit.mjs`, `measure/normalised-body-uniqueness.mjs`
Scratch: `/tmp/kumitate-r63/K63ExecGateForgery/`. No tool installs; no pacman/uv/npx use.

## Limits
- Arms are structural only: they do not verify that a seat's work was real or useful; a lane that runs seats which do
  nothing still reads CLEAN (unchanged from the contract).
- `SESSION_TIMELINE` is the weakest arm (timestamps are forgeable); it is a cost floor, not proof.
- Real-seat measurement covers this host's store at 2026-10-25 18:2x (live: counts move). Only the finished seats whose
  user text carries a `# Seat <stem>` marker can be matched in a synthetic wave (458 of ~1500); the rest are top-level or
  probe sessions, so the arm pass rate is quoted on those 458 plus the raw metrics over the full set.
- I did not run the round-63 counter (`inline63-probe.mjs`) against a modified tree: `scripts/` and `controls/` are the
  L1's to change, and the patch is unapplied here by design.
- No git/jj state was touched; no fixture repo was created (no commits needed).
