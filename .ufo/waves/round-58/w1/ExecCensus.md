# ExecCensus — kumitate round 58

## Scope

- Item: `ExecCensus`; axes: **operability + coverage**.
- Checked the assigned live source-registry census only. This is an evidence report, not a verdict on either round claim.
- R1 context: `6affb9ebde37b7d663658f1959d64f0f0b68f480`. The assigned census has no revision parameter; D58 E5 explicitly defines it as live-only (`.ufo/waves/round-58/probe/doctrine58-probe.mjs`, E5). This run therefore does not independently establish the state of R1's committed bytes or `DOCTRINE58_HELD`.

## Executed command

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
```

Executed 2026-10-24 22:30:18–22:30:19 UTC. **Observed exit code: 0.** Stderr was empty.

Full observed stdout:

```text
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
```

Evidence: `.ufo/waves/round-58/build/ExecCensus/command.txt`, `execution.txt`, `stdout.txt`, `stderr.txt`, and `exit-code.txt`.

## Warning census

Counting command, re-executed against the captured stdout:

```sh
awk -F '\t' '$2 == "W04" {n++} END {print n+0}' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ExecCensus/stdout.txt
```

Observed stdout `5`, empty stderr, exit code 0. Evidence: `.ufo/waves/round-58/build/ExecCensus/warning-count-command.txt`, `warning-count.txt`, `warning-count-stderr.txt`, and `warning-count-exit-code.txt`.

The five observed W04 groups are exactly **S034, S068, S084, S095, and S123**, matching the item's expected set, including the S123 LangGraph duplicate. The only other output line was the final `kumitate ok`; no additional warning line appeared in stdout or stderr.

## Finding

**Independently corroborated for ExecCensus at the observed live-tree execution time.** Operability: the assigned validator ran successfully and exited 0. Coverage: all five expected duplicate-group warnings were emitted, with S123 present. No broader C1/C2 or R1 verdict is inferred from this live-only check.

No production file, registry, ledger, pin, Git index, or jj state was changed. No install, commit, push, seat dispatch, or source-registry edit was performed.

Report: .ufo/waves/round-58/w1/ExecCensus.md
