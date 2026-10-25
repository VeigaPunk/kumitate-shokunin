VERDICT: Drafted the three SCORECARD additions (capabilities row, round-63 section, R61-V2 retirement correction, saturation paragraph) from committed bytes only, and found that C1's I3 arm cannot pass at any revision because the `forged-no-sessions` control's empty `sessions/` tree is untrackable in git.

## Evidence

Freeze/base read first: `.ufo/waves/round-63/plan.md`; `git rev-parse HEAD` → `b38a2065ab8ac5b198f6569b9013d04411c3d40d` (`round-63: freeze — plan (C1 inline-dispatch-evidence, C2 coordinator topology), frozen counters I63/T63, controls, base receipts, inline-dispatch-evidence gate, captures`).

Base receipts (committed, quoted verbatim):
- `base/inline63-base.txt`: `INLINE63_UNMET held=0/6 checks=6 rev=dfa6fca8f362e9c962f5b940025a2619380b759b rule=I63 | I1 MISS tool-absent | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS tool-absent;cases=0<10;no-honest-case | I5 MISS row-absent | I6 MISS tip-receipt-absent` / `exit=1`
- `base/topology63-base.txt`: `TOPOLOGY63_UNMET held=1/7 checks=7 rev=dfa6fca8f362e9c962f5b940025a2619380b759b rule=T63 | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS province-names-entry=false readme-map-clean=false` / `exit=1`
- `base/proxy-before.txt`: `PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 330: pin.make-dispatch-actual is not a kumitate-gate-pins-v1 key` / `EXIT=2`
- `base/readme-map-before.txt`: `README_MAP: DRIFT files=151 rows=150 covered=150 bad=2 first=uncovered:lessons/round-62-verifier-spotcheck.md` / `EXIT=1`
- `base/census-before.txt`: `kumitate ok /…/corpus/SOURCES.md` / `EXIT=0`, six `W04` lines (S034, S068, S084, S095, S123, S126)

Counters run by this seat at the freeze rev (committed bytes, `git archive`):
```
$ node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin b38a2065ab8ac5b198f6569b9013d04411c3d40d
INLINE63_UNMET held=1/6 checks=6 rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d rule=I63 | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH | I5 MISS row-absent | I6 MISS tip-receipt-absent
exit=1
$ node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin b38a2065ab8ac5b198f6569b9013d04411c3d40d
TOPOLOGY63_UNMET held=1/7 checks=7 rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d rule=T63 | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS province-names-entry=false readme-map-clean=false
exit=1
```
I1 holds at the freeze bytes: `node <archive>/scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (25/25)`, exit 0. Gate is committed and unmodified: `sha256sum scripts/inline-dispatch-evidence.mjs` → `fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd`, 376 L; `git status --porcelain` lists no modification to `scripts/` or `SCORECARD.md`.

Controls as committed: `git ls-tree -r -d … -- .ufo/waves/round-63/controls/inline` → 14 case dirs (13 with a committed `sessions/` tree; `forged-no-sessions` has none). `controls/topology/` → 12 fixture receipts + `summary.txt`; `c0-honest exit=0 expect=HELD :: TOPOLOGY63_HELD held=7/7 checks=7 rev=afb5912daaa91800da0cac2ff62ec9b6fd400ace rule=T63`; every `f1..f11` `AS-EXPECTED … UNMET` naming its arm. `controls/inline-real-hosts.txt` → 18 waves: 3 `INLINE_DISPATCH: CLEAN` (kengaku r35 build, kengaku r35 falsify, mori r47 w2), 15 `DRIFT`.

Frozen-state counts for the skeleton: `git show b38a2065:PROVINCE.md | grep -c coordinator` → `0`; `git show b38a2065:corpus/SOURCES.md | grep -c '^| S'` → `134`; `test -e corpus/knowledge/multi-agent-coordinator-topologies.md` → absent (worktree and archive); no `.ufo/waves/round-63/*-results.json` committed; `close/` empty. `w1-dispatch.json` `counts={"spawn":40,"resume":0,"total":40}` is **uncommitted** at the freeze rev (`?? .ufo/waves/round-63/w1-dispatch.json`), so the 40-seat figure in the draft is cited from the frozen plan, not from bytes.

SCORECARD anchors used (current bytes): capabilities table at `SCORECARD.md:1773-1795` (`dispatch-evidence` is the last row, line 1795, followed by the Round-48 note at 1796); `## Saturation` at 1945 with `**Round 45 (2026-10-23).**` as its last entry; round-61 section 2907, round-62 section 2944, EOF at 2952. Draft row re-parsed with the probe's own I5 expression: `cells=6 first-working="63"`.

## Findings

**K63ScribeScorecard-1 — HIGH — C1's I3 arm is unsatisfiable at every revision from committed bytes.** What it attacks: the claim that `controls/inline/` holds 14 committed cases that each exit as `expect` names. `git` cannot commit an empty directory, so the case's deliberate empty `sessions/orch` exists only in the worktree; `git archive` therefore yields no `sessions/` root and the gate fails closed where the case expects a forged-lane DRIFT. Repro:
```
$ git archive b38a2065 | tar -x -C /tmp/kumitate-r63/K63ScribeScorecard/ar
$ node /tmp/…/ar/scripts/inline-dispatch-evidence.mjs --root /tmp/…/ar/.ufo/waves/round-63/controls/inline/forged-no-sessions/lane --round 7 --wave w1 --sessions-root /tmp/…/ar/.ufo/waves/round-63/controls/inline/forged-no-sessions/sessions --dispatcher-log /tmp/…/ar/.ufo/waves/round-63/controls/inline/forged-no-sessions/dispatcher.log
INLINE_DISPATCH: FAIL-CLOSED sessions-root-absent path=/tmp/…/forged-no-sessions/sessions
FINDING SESSIONS_ROOT_ABSENT
exit=2        # expect names: 1 / NOT_A_DISPATCH
```
Same command on the worktree (where the empty dir survives) → `INLINE_DISPATCH: DRIFT (seats=3 sessions=0 done=0 reports=3 dead=0)` + `FINDING NOT_A_DISPATCH`, exit 1. Fix is a freeze amendment (add a committed non-`.jsonl` leaf such as `sessions/.keep`; the gate tests only `existsSync` and indexes `*.jsonl` leaves, `scripts/inline-dispatch-evidence.mjs:96-112,202`), drafted as Part E of the build file. This seat did not touch `controls/`.

**K63ScribeScorecard-2 — MEDIUM — a committed receipt records a state that is not committed.** `controls/inline-receipts.txt` is headed `# gate run on 14 committed fixture cases (worktree mode)` and records `forged-no-sessions exit=1 want=1 NOT_A_DISPATCH`, but that exit 1 needs the worktree's empty `sessions/orch`; from committed bytes the same case reads exit 2 (finding 1). Repro: the two commands above, plus `git ls-tree -r b38a2065 -- .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions | wc -l` → `0`.

**K63ScribeScorecard-3 — MEDIUM — the topology controls' fixtures are not archived, so 12 of 12 readings are not re-derivable from committed bytes.** `controls/topology/*.txt` cite fixture revisions (`afb5912d…`, `b77f9a3f…`, `0cc8aba9…`, `62682345…`, `5180d3a3…`, `3b8eaa24…`, `9543d38c…`, `97bb9574…`, `d4510b2b…`, `5cdff2f8…`, `9a986b8c…`, `d7670dc4…`) and `fixture-base=dfa6fca8…`, but no bundle/repo for them exists under `.ufo/waves/round-63/` (`find .ufo/waves/round-63 -name '*.bundle'` → only a mirror copy under `build/K63ExecProxyStanza/mirror/.ufo/waves/round-61/`). Round 61 archived its forgery as `controls/r61-c2-full-forgery.bundle`; round 63 did not. Repro: `find .ufo/waves/round-63 -name '*.bundle'; ls .ufo/waves/round-63/controls/topology/`.

## Artifacts

- `.ufo/waves/round-63/build/K63ScribeScorecard/scorecard-additions.md` — the draft: A capabilities row (with `{{L1:enter only if HELD}}`), B `## Round 63 — claims, verdicts, limits (2026-10-25)` skeleton with `{{L1:after}}` tokens, C `## Round 63 correction — append-only R61-V2 retirement (2026-10-25)`, D saturation paragraph, E freeze-amendment proposal for findings 1–2.
- `.ufo/waves/round-63/w1/K63ScribeScorecard.md` — this report.
- Scratch: `/tmp/kumitate-r63/K63ScribeScorecard/ar/` (archive extraction of the freeze rev).

## Limits

- Not checked: whether C1 or C2 will hold at the measured revision — no wave results, no entry, no `close/` receipt is committed yet; every after-value in the draft is an `{{L1:after}}` token.
- Not checked: the live-fetch arm (T5) and the real host transcripts/dispatcher log for round 63's own waves — the waves had not landed at this seat's run.
- Not checked: `PROVINCE.md`, `corpus/`, `scripts/`, `.ufo/pins/` repairs (L1-owned); the proxy stanza is unchanged in the draft.
- The 40-seat wave-1 figure is from the frozen plan; `w1-dispatch.json` is uncommitted, so it is not cited as bytes.
- No tool installs or upgrades; no subagents, no background jobs; nothing written outside the two report/build paths and `/tmp/kumitate-r63/K63ScribeScorecard/`.
