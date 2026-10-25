# R13-CensusExit — end source census

Executed at lane root HEAD `0cbe0d75e5a08718e2256408329692908c837766`:

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
```

Observed output (exit 0):

```text
kumitate\tW04\tS034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate\tW04\tS068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate\tW04\tS084 duplicate url infection.github.io/guide across scopes
kumitate\tW04\tS095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate\tW04\tS123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate\tW04\tS126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
kumitate\tok\t/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
```

`validate` returns 0 and prints `ok` for the registry, meeting the §2b required end condition. It additionally emits six W04 duplicate-URL warnings; those warnings are observed and must not be omitted from the evidence, but do not change the observed exit code. The command was run only at the current/end state; no start-state output was recorded here, so no start-vs-end drift is asserted. The round-62 prompt §2b says exit 2 is expected at start only when `corpus/SOURCES.md` is absent; unlike that conditional start case, the end census requires exit 0. Here the registry exists and validated successfully. Specification: `/home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-62.md` §2b (lines 54–66); canonical census command and frozen contract: `/home/vgpnk/Projects/shokunin/CORPUS.md` §“SOURCES.md — where a shokunin learns” (lines 131–155).
