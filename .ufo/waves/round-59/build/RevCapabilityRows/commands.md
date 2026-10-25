# RevCapabilityRows command index

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Interpreter for the extractor: `node` `v26.12.0`.

1. Extractor, captured `2026-10-24T21:34:33-03:00`. Exit file `extract.exit` is `0`. Stderr `extract.stderr` is 0 bytes. Stdout sha256 `46e9abad6c95a1fb4be9ffc2dee7a20e26fc155b9bfacc470923c9030d7af417` (`extract.stdout.sha256`).

```console
date -Iseconds > .ufo/waves/round-59/build/RevCapabilityRows/date.txt
git rev-parse HEAD > .ufo/waves/round-59/build/RevCapabilityRows/head.txt
git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213 > .ufo/waves/round-59/build/RevCapabilityRows/score-rev.txt
git status --porcelain --untracked-files=all -- SCORECARD.md > .ufo/waves/round-59/build/RevCapabilityRows/scorecard.status
git diff --stat 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- SCORECARD.md > .ufo/waves/round-59/build/RevCapabilityRows/scorecard.diffstat
node .ufo/waves/round-59/build/RevCapabilityRows/extract.mjs > .ufo/waves/round-59/build/RevCapabilityRows/extract.stdout 2> .ufo/waves/round-59/build/RevCapabilityRows/extract.stderr
echo $? > .ufo/waves/round-59/build/RevCapabilityRows/extract.exit
```

`head.txt` and `score-rev.txt` both contain `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `scorecard.status` and `scorecard.diffstat` are 0 bytes.

2. Archive cross-check of the same blob, plus a clean-index check. Both status commands printed nothing.

```console
node -v
git archive 5469c0a58d7986ff8a5f203938ae1c8785a92213 SCORECARD.md | tar -xO SCORECARD.md | sha256sum
git diff --cached --stat
git status --porcelain --untracked-files=no
```

Observed stdout:

```console
v26.12.0
1450fcd260c75173b70dbaa8a8830f91e57480b6857a15da5237d9f8cf09e050  -
```

That digest equals `extract.stdout` lines `worktree-sha256` and `score-rev` `sha256`.
