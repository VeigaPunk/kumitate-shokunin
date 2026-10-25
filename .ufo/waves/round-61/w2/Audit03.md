# A3 — Schema-NullIdentity (dispatch record: session id absent/null while exit=0)

**Seat:** Audit03 (leaf, no subagent dispatch)
**Target:** `scripts/dispatch-evidence.mjs` (contract `kumitate-dispatch-evidence-v1`)
**Attack:** dispatch record carries session ids that are absent/null while `exit=0` — does the gate still credit the seat?
**Gate run:** real `node scripts/dispatch-evidence.mjs` (v24.21.0) against fixtures under `/tmp/kumitate-r61/Audit03/.ufo/waves/round-1/`.
No installs performed (tooling directive: nothing to record).

## Verdict summary

- **True null/absent session with exit=0 → seat NOT credited.** `FINDING SESSION_MISMATCH:<seat>` fires, DRIFT, rc=1. The gate's `isDead` treats a sessionless seat as dead even when `exit=0`, so the plain attack is repelled.
- **Null-evasive session spellings with exit=0 → seat IS credited (CLEAN, rc=0).** The gate's null test is a single strict equality on exactly `'null'` (`dispatch-evidence.mjs:64` progress, `:134` registry). Any other non-empty token is accepted as a session id. Proven credited: `' null'` (leading space), `'null '`, `'   '`, `'NULL'`, `'Null'`, `'undefined'`, `'-'`, `'none'`, `'0'`, `'false'`. The seat is counted in `sessions`, `exit0`, and `reports`; `--expect sessions=2` passes on a 2-seat record where one "session" is `' null'`.
- **Realistic route:** the producer/launcher already uses `-` as its "no value" sentinel for `pid`/`start`/`end` (see real `w1/dispatch-actual.json` members). `session=-` is indistinguishable to the gate from a real session.
- **Adjacent defect (identity cross-check):** registry member names are never compared to progress seat names — only counts and the dead-name list. A registry member `"Fake"` with `agentId=session_FAKE` that exists in no progress row yields **CLEAN rc=0** (`P10-phantom-member`).

## Evidence

Baseline (gate sane): selftest `PASS (8/8)` rc=0; real round-61/w1 record `CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` rc=0.

Matrix (2 seats, both `exit=0`, both reports present; A real session; B attack token; registry mirrors the gate's own interpretation — i.e. an attacker-consistent record):

| case | B session token | rc | verdict | findings |
|---|---|---|---|---|
| base | `session_B` | 0 | CLEAN | — |
| P1-true-absent | (no `session=` key) | 1 | DRIFT | `SESSION_MISMATCH:B` |
| P1b-empty | empty | 1 | DRIFT | `SESSION_MISMATCH:B` `DEAD_MISMATCH:declared=noneobserved=B` |
| P2-literal-null | `null` | 1 | DRIFT | `SESSION_MISMATCH:B` `DEAD_MISMATCH:declared=noneobserved=B` |
| P2-honest-null | `null`, honest registry | 1 | DRIFT | `SESSION_MISMATCH:B` |
| P3a-space-null | ` null` | **0** | **CLEAN** | — |
| P3a-honest | ` null`, honest registry | 1 | DRIFT | `REGISTRY_MISMATCH:sessionIds=1observed=2` `DEAD_MISMATCH:declared=Bobserved=none` |
| P3b-trailing | `null ` | **0** | **CLEAN** | — |
| P3c-onlyspace | `   ` | **0** | **CLEAN** | — |
| P3d-null-upper | `NULL` | **0** | **CLEAN** | — |
| P3e-null-cap | `Null` | **0** | **CLEAN** | — |
| P4-undefined | `undefined` | **0** | **CLEAN** | — |
| P5-sentinel-dash | `-` | **0** | **CLEAN** | — |
| P6-none | `none` | **0** | **CLEAN** | — |
| P7-zero | `0` | **0** | **CLEAN** | — |
| P8-false | `false` | **0** | **CLEAN** | — |
| P9-honest-all | `null`, all honest | 1 | DRIFT | `SESSION_MISMATCH:B` |
| P10-phantom-member | — (member `Fake` not in progress) | **0** | **CLEAN** | — |
| P5-expect | ` null` + `--expect sessions=2` | **0** | **CLEAN** | — |

Commands (all exact):
```
node scripts/dispatch-evidence.mjs --selftest                    # PASS 8/8 rc=0
node scripts/dispatch-evidence.mjs --root . --round 61 --wave w1 # CLEAN rc=0
python3 /tmp/kumitate-r61/Audit03/probe.py                      # matrix above
# P1-true-absent / P10-phantom-member / P5-expect: inline python drivers (scratch)
```

## Root cause (defect)

- `dispatch-evidence.mjs:64` — `session: kv.session && kv.session !== 'null' ? kv.session : null`. `' null'`, `'NULL'`, `'-'`, `'0'`, `'none'`, `'false'`, `'undefined'` are all truthy and `!== 'null'` → credited as a session id; whitespace is never trimmed, case never normalized.
- `dispatch-evidence.mjs:134` — same loose rule on the registry side: `!m.agentId || m.agentId === 'null'`.
- Producer contract divergence: `make-dispatch-actual.mjs` `normSession()` (`:98-105`) trims and maps empty/`null`/`undefined` → `null`; the gate re-implements a *weaker* inline test instead of consuming the producer's normalization, so the two sides disagree (see `P3a-honest`).
- `dispatch-evidence.mjs:109-146` — identity cross-check is count-only; member names are never matched against progress rows (only `dead` names are compared), so a forged registry can name phantom members and still pass.

## Severity

- **High:** `exit=0` + null-evasive session token is credited as a full session (`CLEAN`, rc=0, `--expect` satisfied). The `-` sentinel alone — already in use by the real launcher in `w1` — turns the "no session" case into a credited identity, contradicting the gate's own header claim ("A registry whose members carry no session id is DRIFT … never credited").
- **Medium:** registry member identity is unvalidated against progress seats (phantom/fabricated members pass).

## Recommendation (report only — no edits made)

Use one shared normalization for session tokens in both `parseProgress` and the registry check: trim, reject empty, reject `null`/`undefined` (case-insensitive) and the `-`/`none`/`0`/`false` sentinels — or require a strict session-id shape (e.g. `^[A-Za-z0-9._-]+$`) and treat anything outside it as no-session. Add `expect` cases: `SESSION_MISMATCH` is absent from the selftest FINDING list and no selftest case covers `exit=0`+null session. Add a member-name ⊆ progress-seat cross-check.

## Residual risk / verification gaps

- Matrix driven via scratch fixtures (attacker-consistent registry); the real dispatcher's exact session-writing path on failure was not observed end-to-end (no live launcher run in scope).
- Not tested: non-ASCII/long session tokens (same truthy logic applies), duplicate `session=` keys (last-wins), and `session =x` key-with-space (key mismatch → treated as absent → safely uncredited).
