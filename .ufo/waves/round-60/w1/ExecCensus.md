# ExecCensus — kumitate round 60

## Axes

operability, coverage. This file corroborates or falsifies the named census item only. It is not a verdict on C1 (`dispatch-evidence`) or C2 (band-4 doctrine).

## Scope

Assigned item: run the live source-registry validator scoped to kumitate and quote the exit code and every warning line. Expectation stated in the item: exit 0, exactly six W04 lines — S034, S068, S084, S095, S123, and the round-60 append S126 — and no E-code.

The census takes no revision argument; it reads the live tree. Live state at run time, read this session:

- Lane HEAD: `a745a3b0e02253e722834ef95042d97ed92e5e53` (the round work commit). Base: `ffbfe3cc38ff8eaa6375550b16472c90a006a179`.
- `git status --porcelain` shows modified: `LOG.md`, `PROVINCE.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md`; untracked: round-60 wave runtime (`launcher.py.txt`, `w1-*.json`, `w1-launcher.log`, `w1/`). So the live `corpus/SOURCES.md` is **dirty** against the work commit — reported, not hidden.
- The dirt is one 7-line prose bullet in `## Paths` (`git diff --stat` → `7 insertions(+)`; full diff read). It contains row ids but **no URL and no registry row**. The S117 row (line 130) and S126 row (line 140) are byte-identical between `a745a3b0:corpus/SOURCES.md` and the live file — `diff` of the S117/S126 line sets differs only by the new prose lines 152/155, and the inserted text adds no URL. The census result is therefore not an artifact of the uncommitted edit.
- The URL was already held twice at base: `git show ffbfe3cc…:corpus/SOURCES.md | grep -c detecting-activity-failures` → `2` (the S117 row plus one prose mention). The S126 row exists at the work commit (line 140). The sixth W04 line is genuinely new with this round's append.

## Executed command

```sh
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
```

Run three times this session. Exit code **0** all three times. Third run started and finished `2026-10-25T02:21:35Z` (UTC clock; sub-second runtime). Stdout byte-identical across all three runs (`diff` exited 0). Stderr empty, 0 bytes, sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty-string hash).

Full observed stdout (sha256 `ccf2d262941300ebc35ba3a1cd85e5598dc6854aa62d4b065a1cc02469f34757`, 708 bytes, 7 lines):

```text
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
```

Scratch evidence: `/tmp/kumitate-r60/ExecCensus/` (`command.txt`, `started-at.txt`, `finished-at.txt`, `exit-code3.txt`, `stdout3.txt`, `stderr3.txt`, `counts-uniq.txt`, `live-diff-head.txt`).

## Every warning

Field-2 counts after the run (`awk -F '\t' '{print $2}' stdout3.txt | sort | uniq -c`): `6 W04`, `1 ok`. Sweeps: any E-code `0`; any non-W04 warning `0`. W04 count `6`.

The six warnings, and only these, are:

1. S034 — `stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics`
2. S068 — `github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99`
3. S084 — `infection.github.io/guide`
4. S095 — `raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`
5. S123 — `docs.langchain.com/oss/python/langgraph/checkpointers`
6. S126 — `docs.temporal.io/encyclopedia/detecting-activity-failures` (the new line this round)

All six match the item's frozen expectation exactly — same ids, same order, same URL strings, no seventh line.

## Why W04 and not E04 (read from the script this run, not inherited)

`scripts/sources-census.sh` header lines 24–33: `E04 duplicate URL+scope (no supersedes)`; `W04 same URL across scopes (warnings do not affect clean lanes)`. Implementation (lines 643–649): W04 prints when the URL was already seen under a *different* (url, scope) pair; E04 prints when the *same* (url, scope) pair repeats, non-rejected, without a `supersedes S[0-9]{3}` teach.

Applied to the new pair: S117's scope cell is "Temporal worker-liveness contract: Activity Heartbeats are pings…"; S126's scope cell is "the failure-detection and timeout contract a durable-execution orchestrator must implement…". Same URL, different scope cells → W04, and no E04 line is possible for this pair without a scope collision. This matches the plan's F5 story (`docs.temporal.io/encyclopedia/detecting-activity-failures` held under two scopes).

Cross-check against the lane's own dupe registry: `.ufo/pins/source-dupes.json` (read this run) pins exactly six groups — S023/S034, S047/S084, S060/S068, S069/S095, S028/S123, S117/S126 — one-to-one with the six W04 lines, and its S117/S126 entry records byte-identical captures (body sha256 `c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50`), which is also the anchor-cell body sha on both rows in `corpus/SOURCES.md`. The warning set and the pin set agree.

## Finding

**Named item corroborated on this run.** Exit code 0 on three consecutive runs, byte-identical output. Exactly the six expected W04 lines, quoted in full above — the five pre-existing plus the new S126 line. No E-code of any kind. No other warning. The `ok` trailer names the lane registry.

Explicitly not inferred: `DISPATCH60_HELD`, `DOCTRINE60_HELD`, or any claim score. Per the plan's Limits the live census is not a D60 check ("it already exits 0 at the base"); D60 F5 runs `source-dupes` over the extracted tree, not the live fleet — this report only records that the live pin file carries the six groups, which is consistent with, not proof of, F5. The A10 dispatch record was not touched.

Nothing inside the lane was written except this report. No commit, no push, no jj/git mutation, no install, no seat dispatch. Scratch confined to `/tmp/kumitate-r60/ExecCensus/`.

Report: .ufo/waves/round-60/w1/ExecCensus.md
