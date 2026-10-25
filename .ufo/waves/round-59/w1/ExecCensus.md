# ExecCensus — kumitate round 59

## Axes

operability, coverage. This file corroborates or falsifies the named census item. It is not a verdict on C1 or C2.

## Scope

Assigned item: run the live source-registry validator and quote the exit code and every warning. Expectation stated in the item: exit 0, the five existing W04 lines, no E03 and no E04.

The census command takes no revision. It reads the live tree. At execution time `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213` (the score revision). `git status --porcelain -- corpus/SOURCES.md` printed nothing. D59 E5 is the collision-guard receipt (`.ufo/waves/round-59/assimilation/collisions`), not this command. Probe header: a live census is not a DOCTRINE59 check (`.ufo/waves/round-59/probe/doctrine59-probe.mjs` lines 26–32).

## Executed command

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
```

Started `2026-10-25T00:30:09Z`, finished `2026-10-25T00:30:09Z`. Observed exit code: **0**. Stderr was empty (0 bytes; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).

Full observed stdout (sha256 `ceaafeb2d6a6826f4e50a46cbe0780be09265570d818fb453678cd6580d494cb`, 6 lines, 604 bytes):

```text
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
```

Evidence: `.ufo/waves/round-59/build/ExecCensus/command.txt`, `started-at.txt`, `finished-at.txt`, `stdout.txt`, `stderr.txt`, `exit-code.txt`.

## Every warning

Field 2 of stdout, counted after the run:

```sh
awk -F '\t' '{print $2}' stdout.txt | sort | uniq -c
awk -F '\t' '$2 == "W04" {n++} END {print n+0}' stdout.txt
awk -F '\t' '$2 == "E03" {n++} END {print n+0}' stdout.txt
awk -F '\t' '$2 == "E04" {n++} END {print n+0}' stdout.txt
awk -F '\t' '$2 ~ /^E/ {n++} END {print n+0}' stdout.txt
awk -F '\t' '$2 ~ /^W/ && $2 != "W04" {n++} END {print n+0}' stdout.txt
```

Observed: `5 W04`, `1 ok`, W04 count `5`, E03 count `0`, E04 count `0`, any E-code `0`, any non-W04 warning `0`. Evidence: `.ufo/waves/round-59/build/ExecCensus/counts.txt`.

The five warnings, and only these warnings, are:

1. S034 — `stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics`
2. S068 — `github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99`
3. S084 — `infection.github.io/guide`
4. S095 — `raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`
5. S123 — `docs.langchain.com/oss/python/langgraph/checkpointers`

`diff -u` of this stdout against `.ufo/waves/round-59/close/census-after.txt` exited 0. `diff -u` against `.ufo/waves/round-58/build/ExecCensus/stdout.txt` exited 0. The five lines are the existing set, not a new set. Script contract (header lines 16–18 and 33): W-codes do not change validate status; E findings exit 1. Exit 0 is consistent with zero E lines.

## Registry spot-check

Each warned URL string also occurs on an earlier `corpus/SOURCES.md` row (live file, clean at the score revision):

- S034 also at S023 (`corpus/SOURCES.md:36` and `:47`)
- S068 also at S060 (`:73` and `:81`)
- S084 also at S047 (`:60` and `:97`)
- S095 also at S069 (`:82` and `:108`)
- S123 also at S028 (`:41` and `:135`)

This read confirms the URL strings are repeated. It does not reimplement the census scope comparison. The W04/E04 distinction remains the validator's: W04 is same URL, different scope; E04 is same URL and scope without a `supersedes S` + 3-digit teach (`scripts/sources-census.sh:644-649`). No E04 line was printed.

## Finding

**Named item corroborated on this run.** Exit code 0. Five W04 warnings, the existing five, quoted above. No E03. No E04. No other warning and no other E-code.

Not inferred: `DOCTRINE59_HELD`, `REPAIR59_HELD`, or any claim score. E5 remains the collision-guard receipt. Used-by existence (E11) was not separately re-walked; the validator printed no E11 and exited 0 on the live disk.

No production file, registry, ledger, pin, Git index, or jj state was changed. No install, commit, push, or seat dispatch.

Report: .ufo/waves/round-59/w1/ExecCensus.md
