# kumitate-shokunin

Orchestration and tooling for UFO-FSD on OMP: which dispatch shape a piece
of work actually is, and the gates that re-derive the lane's own claims
from the trees they cite.

Rank: **shonen**. [`SHONEN.md`](SHONEN.md) boxes are open.

Fleet: [shokunin](https://github.com/VeigaPunk/shokunin).

## The question

> Which dispatch shape does this work require, and does the documentation
> still match the code it cites?

`SKILL.md` distinguishes three shapes. A swarm wave produces unjudged
parallel evidence. A sighting mission is operator-visible lifecycle on the
tmux wall. A native judged round is the only path whose output is judged.
Fixture `self-iter` is drill evidence, never native host execution. Pick
by what the work needs. The skill's disambiguation rules are the
authority; this paragraph is the index.

## Boundary

**Owns:** OMP task and hub dispatch, the ufo-fsd scripts and runtime this
lane documents, and the six gates in `scripts/`.

**Hands off:** anything outside orchestration and tooling. Endpoint health
is kama. Credential material is kagi. Fleet liveness observation is mori.
Host package and driver state is tsukuroi.

Source paths in `SKILL.md` cite the origin tree
(`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` at the time they were
written). Later lanes record that tree as relocated. Treat a path in the
skill as a citation to re-resolve, which is what `cite-check.mjs` is for.

## Gates

Node, read-only, zero runtime dependencies. Each file's header is the
contract.

| Script | Contract | Job |
|---|---|---|
| `scripts/cite-check.mjs` | `kumitate-cite-check-v1` | re-resolve path, line, symbol, and pin citations |
| `scripts/claims-check.mjs` | `kumitate-claims-v1` | member-claims behind scorecard cells |
| `scripts/proxy-check.mjs` | `kumitate-proxy-v1` | recompute the measurement proxy |
| `scripts/kimi-census.mjs` | `kumitate-kimi-census-v1` | `~/.kimi-code` shape against the frozen member set |
| `scripts/surface-probe.mjs` | `kumitate-surface-probe-v1` | live conformance of the two origin surfaces |
| `scripts/round-gate.mjs` | `kumitate-round-gate-v1` | one lane's round-close artifacts |

```sh
node scripts/cite-check.mjs --selftest
node scripts/proxy-check.mjs --selftest
node scripts/round-gate.mjs --selftest
```

`--selftest` is the hermetic mode named in those headers. A live run needs
the trees the header lists (`--src`, `--kimi-root`, and so on).

## Map

| Path | What it is |
|---|---|
| [`SKILL.md`](SKILL.md) | dispatch-shape decision table and script vocabulary |
| [`PROVINCE.md`](PROVINCE.md) | orchestration and tooling |
| [`corpus/knowledge/`](corpus/knowledge/) | sourced notes the gates re-derive |
| [`LOG.md`](LOG.md), [`SCORECARD.md`](SCORECARD.md) | rounds and axis verdicts |

Swarm output is evidence. It is not a judge input, and it is not a handoff.
