# ScoutW04 — four pre-existing W04 duplicate-url warnings

Axes judged: pair identity (which earlier row), whether the two scopes are distinct claims, and whether the warning is a real defect or a recorded acceptable duplicate.

No tool installed or updated.

## Census (read-only, this tree)

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
exit=0
```

W04 (`scripts/sources-census.sh:644-645`) prints the **later** id when the same normalized source URL (`url_of`, `:600-604`: first `http(s)` URL, fragment and trailing slash stripped, host lowercased) was already seen under a **different** `scope` string. Same scope plus `supersedes S0NN` in `teaches` is silent (E04 exemption, `:646-649`). Pairs below are from `corpus/SOURCES.md` rows only.

| warning id | earlier row | shared URL (as printed) | scopes contradict? | verdict |
|---|---|---|---|---|
| S034 :47 | S023 :36 | `stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics` | no | recorded acceptable duplicate |
| S068 :81 | S060 :73 | `github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99` | no | recorded acceptable duplicate |
| S084 :97 | S047 :60 | `infection.github.io/guide` | yes (S084 supersedes) | recorded correction, not a new defect |
| S095 :108 | S069 :82 | `raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml` | no | recorded acceptable duplicate |

Other same-URL pairs in this file (S013/S082, S041/S083/S096, S051/S085/S097, S052/S086, S053/S087, S054/S088, S055/S089, S073/S091, S076/S092) share the **scope string** and the later `teaches` opens `supersedes S0NN`, so they do not print W04. Not part of the four.

## S034 / S023 — acceptable duplicate

Both `docs` / tier A / `mined`. Neither `teaches` says `supersedes`.

| | S023 (`SOURCES.md:36`, opened 2026-10-20) | S034 (`:47`, opened 2026-10-22) |
|---|---|---|
| scope | Mutation-testing outcome definitions (killed, survived) and mutation score as Stryker defines them | mutant outcome vocabulary for a gate's own mutation evidence (killed, survived, runtime error) |
| teaches | Killed = a test failed while the mutant was active; survived = all tests passed; mutation score = detected / valid | "When at least one test failed while this mutant was active, the mutant is killed." A mutant that only crashes the run is a runtime error, not a kill |
| used-by | `corpus/lessons/round-35.md` | `corpus/lessons/round-39.md`, `corpus/QUALITY.md` |
| recheck | 180d | 365d |

The page legitimately serves two scopes: S023 owns the score formula (`detected / valid`); S034 owns the runtime-error distinction (a crash is not a kill). They overlap on the killed sentence and neither supersedes the other, which is why W04 stays. Recorded as kept: `corpus/lessons/round-40.md` ("W04 kept, explained"; both rows stay; no append-only edit clears it) and `corpus/lessons/round-42.md` (logged warning; editing `scope` is forbidden; rejecting S034 would drop Q19). **Not a real defect.**

## S068 / S060 — acceptable duplicate

Both `code` / tier A / `mined` / opened 2026-10-23 / recheck `on-release`. Neither says `supersedes`. The source URL is the **commit tree**, not a file, so two file-level claims inside `45c35e40` share one URL by construction.

| | S060 (`:73`) | S068 (`:81`) |
|---|---|---|
| scope | which OMP code reads or writes the agent-root members not named in dirs.ts, and with what mode | OMP task isolation on the installed omp/18.12.6: default, backend order, workspace, merge, cleanup |
| teaches | `builtin.ts:423` — RULES.md and hooks/ are read, never written, by OMP | `task.isolation.enabled` defaults to false; Linux backend order btrfs, zfs, reflink, overlayfs, rcopy; merge is patch or branch |
| used-by | `corpus/knowledge/omp-agent-root.md`, `corpus/lessons/round-44.md` | `corpus/knowledge/agent-isolation-substrates.md`, `corpus/lessons/round-45.md` |

Two non-overlapping questions about one pinned tree. S060 was admitted in round 44 (`corpus/lessons/round-44.md`); S068 in round 45 (`corpus/lessons/round-45.md`). The warning has been on the census since the round-45 close (`round-45-verifier-spotcheck.md`) and every later closure treats the line as a warning, not a routed defect. **Not a real defect.** [INFERENCE] blob URLs (as S053 uses) would not collide; the warning is the tree-URL shape, not a false claim.

## S084 / S047 — recorded correction; warning is a scope-string side effect

Both `docs` / tier A / `mined`. Same page. Scopes **contradict**, and S084's `teaches` opens `supersedes S047`.

| | S047 (`:60`, opened 2026-10-22, recheck 180d) | S084 (`:97`, opened 2026-10-23, recheck 180d) |
|---|---|---|
| scope | killed versus escaped mutants, with errors and timeouts collected as their own outcomes **(not the MSI aggregate)** | killed versus escaped mutant outcomes; errors and timeouts collected and **included in the MSI aggregate** |
| teaches | a kill is read off failing tests; never cite it for the MSI sum | supersedes S047 — the guide collects errors/timeouts and includes kills, timeouts, and errors in MSI |
| used-by | `SKILL.md`, `corpus/lessons/round-43.md` | same two paths |

This is not two legitimate concurrent readings. S047's parenthetical is the claim round 43 already errata'd (`corpus/lessons/round-43.md`: lines 94 and 99–101 of the guide sum kills, timeouts and errors) and round 47 replaced with an appended row (`corpus/lessons/round-47.md` Gate: "supersedes S047; the guide does give the MSI sum"). W04 prints because the corrected **scope string differs**, and the `supersedes` exemption applies only to E04 (same scope), not to W04. Same-scope supersessions elsewhere in this file are silent for that reason.

**Not a new defect and not an unnoticed double registration.** The live claim is S084; S047 stays `mined` because the registry is append-only. The warning is the expected trace of that correction and has been carried as one of the four pre-existing W04 lines since the round-47 close.

## S095 / S069 — acceptable duplicate

Both `docs` / tier A / `mined` / opened 2026-10-23 / recheck `on-release`. Same manual, same body pin `sha256 2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`, tag v0.13.1 = `362936aea0d5c6e70f7af75d2d44b5a914cb4ba2`. Neither says `supersedes`. Locators do not overlap.

| | S069 (`:82`) | S095 (`:108`) |
|---|---|---|
| scope | bwrap environment options, PID namespace reaper and --die-with-parent (host bubblewrap 0.13.1) | bubblewrap filesystem action semantics: read-write and read-only binds, tmpfs, and operation order |
| anchor | `bwrap.xml:62-67, 138-140, 217-235, 587-599` | `bwrap.xml:253-255, 295-312, 410-416` |
| teaches | `--clearenv`; PID-1 reaper; `--die-with-parent` | `--bind` vs `--ro-bind`; `--tmpfs`; filesystem operations apply in argument order |
| used-by | `corpus/knowledge/agent-isolation-substrates.md`, `corpus/lessons/round-45.md` | `scripts/cap-run.mjs`, `scripts/cap-spawn.mjs`, `corpus/lessons/round-47.md`, `corpus/knowledge/counter-amendment-discipline.md` |

One manual, two questions. S069 admitted round 45; S095 admitted round 47 (`corpus/lessons/round-47.md` Gate, quote at `:253-254`). Round 48 and round 49 closures list this W04 with the other three as pre-existing, census exit 0. **Not a real defect.**

## Bottom line

All four warnings are real census hits (same URL, different `scope`) and none is an unrepaired double-claim that should be closed this round. Three pairs (S023/S034, S060/S068, S069/S095) are two true scopes of one page or one pinned tree, already logged as kept warnings. S047/S084 is a recorded supersession whose scope text had to change, so W04 fires where E04 would have stayed quiet. Confidence: high (census output plus the registry cells). Pages were not re-fetched; the judgment is the rows' own scope and teaches text.
