# ExecChecklist — kumitate round 58, w1

Axes: **operability, coverage**. Scoped execution report; no C1/C2 claim verdict.

Measured revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1). The lane's `HEAD` was R1, and pre/post tracked-file diffs against R1 were empty (exit 0), excluding only round-58 `build/**` and `w1/**` seat outputs.

Primary run: 2026-10-24 19:34:57–19:36:30 -03:00, from the lane root:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/surface-probe.mjs --checklists
```

Only `KUMITATE_GATE_MUTANTS_TMP` was redirected into this seat's build directory; `TMPDIR` was left at its normal default. Observed process exit: **1**. Stderr was empty.

```text
CHECKLIST_SKIPPED: 0
CHECKLIST: 26/28 pass
VERDICT: FAIL
```

## Complete FAIL list

| Item id | Checklist entry | One-line observed cause | Classification |
|---|---|---|---|
| **8** (`SKILL.md:702`) | Proxy recompute | `PROXY: DRIFT` with sole error `A_DRIFT term=A declared=93 computed=859 delta=+766` | **Finding** — not one of the declared known-red exemptions; concurrent-scratch measurement-surface issue, diagnosed below |
| **11** (`SKILL.md:705`) | Kimi-substrate census | `KIMI_CENSUS: DRIFT (MEMBER_MISSING search-index/)`; `search-index` is absent under `/home/vgpnk/.kimi-code` | **Declared known-red** — the named kimi-root `search-index` item |

No src-tree item failed: item 3 (live sighting-surface conformance, `SKILL.md:697`) and item 14 (per-anchor truth burn-down, `SKILL.md:708`) both passed. Item 8's `src-rev` suffix is incidental; its only printed error is the lane-wide `A` count, so it is not covered by the src-tree exemption. All other items passed, including new item 28, receipt-evidence reproduction and sweep (`SKILL.md:722`, exit 0, expected substring hit).

## Item 8 diagnosis

The proxy derives `A` from all runnable files in the live worktree, including untracked wave scratch. A read-only follow-up census at 2026-10-24T22:38:31Z counted **1,528** runnable files: **1,435** under `.ufo/waves/round-58/build/` and **93** outside it. The outside-build count exactly matches the declared R1 value. Counts are time-varying while other seats write, so this later census explains the failure class rather than replacing the primary run's `computed=859` reading.

After removing this seat's discarded-run temp residue, no `*.mjs`, `*.js`, `*.sh`, or `*.py` files remained under `build/ExecChecklist/`. A direct post-cleanup re-run of `node scripts/proxy-check.mjs --strict` still exited 1 with only `A_DRIFT` (`declared=93 computed=1532 delta=+1439`). Thus the failure persists independently of this seat's scratch. The empty pre/post R1 tracked diffs distinguish this live-wave measurement issue from a tracked R1 production-file change.

## Evidence and scope

Full command, environment, stdout, stderr, timestamps, and exit records are under `.ufo/waves/round-58/build/ExecChecklist/`:

- `checklists-clean.*` — primary checklist run (`.command`, `.environment`, `.stdout`, `.stderr`, `.exit`, `.started`, `.finished`).
- `live-head.*`, `r1-head.*`, `r1-tracked-diff.*`, `r1-tracked-diff-post.*` — revision and tracked-byte checks.
- `proxy-a-census.*`, `proxy-a-census-post.*` — runnable-file decomposition before and after seat-owned temp cleanup.
- `proxy-strict-postcleanup.*` — independent item-8 re-run with this seat contributing zero runnable scratch files.
- `checklists.*` — retained but **discarded** setup diagnostic, not the reported result: its seat-local `TMPDIR` invalidated the round-gate suite's `not-a-repo` fixture. The primary `checklists-clean.*` run uses normal temporary-directory isolation.
- `clone-cleanup.*` and `tmp-cleanup.*` — removal of only this seat's unused revision clone and discarded-run temp residue.

No production files, pins, corpus, ledgers, fleet files, sibling repos, Git index, or jj state were changed; no commit/push, seat dispatch, or tool installation occurred.

Report: .ufo/waves/round-58/w1/ExecChecklist.md
