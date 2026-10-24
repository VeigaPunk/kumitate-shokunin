# UFO-FSD

Local-first Rust runtime for the Umwelt-Frontier Orchestrator (UFO), with thin
Node entrypoints for native substrate shape. One canonical `ufo-core-runtime`
executes self-iteration; OMP, Kimi, Codex, Cursor, OpenCode, Grok, and Devin select the
substrate identity without changing judge semantics.

The single self-driving `ufo` skill (`skills/ufo/SKILL.md`) is the L1
orchestration contract on the seven supported local substrates. Native admission
(`NativeRoundHandoff`) remains solely in `crates/ufo-core-runtime`. On an
unjudged fleet mission, the L1 judges settled advisory wave findings under that
round's declared axes; those findings never become a `Proposal` or enter native
admission.

This repository validates the pattern and its failure protections. It does **not** claim benchmark superiority, model quality, throughput, token savings, or a live 64-worker result.

**Wiki:** [project overview](https://app.devin.ai/org/veigapunk/wiki/VeigaPunk/ufo-fsd-alpha?branch=main)

## What is implemented

- Axis sets are declared per round, externally visible and fingerprinted before specialist work begins: stable within that round, free to evolve between rounds.
- Strict Pareto dominance as the sole move-admission rule: no regression on any axis and strict improvement on at least one.
- No utility target or terminal scalar. Confidence, priority, and utility metadata are logged and ignored by admission.
- Saturation requires a complete, sound, clean zero-admission round with no pending refinement; a degraded zero-accept round is inconclusive. Limits produce labeled halts: `budget_halt` for the round cap, `honesty_brake` for token and wall-clock budgets.
- Planner/WWKD phase before judged rounds, with concurrent L1 data-walk work.
- Parallel local specialists, L1 work in flight, frozen logical-lane identity with cache-carry round digests, typed route failures, same-identity rerouting, and next-round route records.
- Lineage, deduplication, invalid-record separation, refinement queueing, reinjection records, frontier movement, and bounded filesystem audit artifacts (JSONL only on explicitly named ledgers and transcripts).
- Byte-pinned canonical Godspeed directive/filter/velocity. Delegates receive only the directive; only the judge seat may load `filter.md` and `velocity.md`, and no runtime mechanism loads them.
- Native CLI surfaces for OMP, Kimi, Codex, Cursor, OpenCode, Grok, and Devin. Their `doctor`/`selfcheck` verbs verify declared skill mirrors against `skills/ufo/SKILL.md`; `self-iter` delegates to the canonical Rust runtime rather than injecting a skill into a host-agent session.
- OMP-only `/skill:swarm` and `/skill:tower` shortcuts live under `.omp/skills/`: swarm uses the UFO wave validator and global role/fallback routing; tower coordinates separate OMP worktrees and registered UFO Sighting missions. Neither changes the canonical judged-round topology or global authentication/configuration.
- Deterministic local process fixture for credential-free unit, integration, and end-to-end tests.


## Canonical contracts

`skills/ufo/SKILL.md`, `skills/ufo/references/run-logic.md`, and `agents/*.md`
are the semantic source of truth. Seven CLI-family package roots keep byte-identical
skill clones; five of them (OMP, OpenCode, Codex, Grok, Kimi) also carry adjacent
generated `ufo-skill-scope.json` tags; their separate
editorial membership source is `docs/ufo-fsd-charterlist.json`. Run
`npm run contracts:check` to fail on mirror, scope, or charterlist drift.
The OMP native evidence hash additionally binds its route config, canonical
mirrors, launcher, collector, attached entry point, Rust execution profile and
judge, and CLI source; a mid-round byte change invalidates the handoff.

## Install

Rust 1.85 or newer and Node.js 22 or newer; the full gate battery also
requires `tmux`, and the deterministic loop fixture requires `python3`:

```bash
npm install
cargo install --path crates/ufo-cli --locked
```

## Native substrate checks

Each supported local substrate exposes the same `doctor`, `capabilities`,
`selfcheck`, `version`, and `self-iter` contract:

```bash
(
  for seat in omp kimi codex cursor opencode grok devin; do
    node "substrates/$seat/bin/cli.mjs" doctor || exit $?
  done
)
```

After dependencies are installed, exit `0` means the seat, canonical runtime,
and host CLI passed local capability and bounded `--version` probes; it does
**not** prove authentication or execute a work request. Exit `2` reports a
typed doctor prerequisite block. A startup failure before `doctor` runs (for
example, unresolved npm workspace imports before `npm install`) can exit
differently and is not a doctor result.

## Run locally without credentials

```bash
cargo run -p ufo-cli -- self-iter \
  --task "improve the local runtime" \
  --rounds 2 \
  --concurrency 6 \
  --substrate omp
```

The deterministic fixture admits one strict Pareto improvement, preserves
same-identity substrate routing, then stops only after a complete zero-admission
round.

## Verify

```bash
npm install
npm run gates
```

The gate battery is lean by default (`UFO_GATES=fast`, stripped 2026-09-21):
wall probes (tmux, sighting session, tick handoffs root), canonical contract
mirrors — which carry the seat-routing equivalence check against the global
OMP config — and the fleet regression group selected from git-touched paths.
Every unselected stage records an honest SKIP, and `UFO_GATES=full` runs the
complete vocabulary (fleet dispatcher and ledger selfheal suites, selfheal
report census, and sekhmet compat stages when enabled). These are local
contract and fleet checks, not authenticated provider execution; the Rust and
TypeScript build-and-test surfaces live outside `gates.sh`.

For a direct local run through the shell wrapper (single substrate, OMP by
default), first build the workspace CLI with `cargo build -p ufo-cli`:

```bash
npm run self-iter -- \
  --task "self-iterate the runtime" \
  --rounds 2 \
  --concurrency 6
```

`npm run run:portable` remains the explicitly named TypeScript portability
surface. It is not a second self-iteration authority.

Automatic native missions select OMP; the other six adapters are compatibility
surfaces, never fallback transports. OMP L1/L2 seat routes and typed cascades
resolve from the fd-bound global OMP config (`~/.omp/agent/config.yml`) and its
generated `crates/ufo-core-runtime/bundled/omp-seat-routing.json` mirror.
`config/ufo.json` owns sighting dispatch and native-profile topology/policy, not
seat pins; `skills/ufo/SKILL.md` owns the dispatch contract. The seven explicit substrate
commands remain supported, including `opencode`, but `opencode-go` is not an automatic or primary OMP transport; it remains a typed fallback hop on the `@m_flash`, `@m_z53`, and `@m_zfl` cascades (see [docs/L2-L3-ROUTING.md](docs/L2-L3-ROUTING.md)). This policy never mutates the installed OpenCode product.

## Authority boundary

Semantic authority lives in **Canonical contracts**. Executable behavior additionally
comes from `config/ufo.json`, the canonical Rust crates, `scripts/`, and the seven
`substrates/<seat>` adapters; checked mirrors and generated host projections are not
independent authorities. `docs/ufo-fsd-charterlist.json` is the gate-enforced editorial
membership exception. Other material under `docs`, `evidence`, `reports`, `research`,
and `ports` is retained provenance; each dump tree is fenced by its own README —
[`evidence/README.md`](evidence/README.md), [`research/README.md`](research/README.md),
[`reports/README.md`](reports/README.md), and the in-tree dump index
[`docs/artifacts/README.md`](docs/artifacts/README.md). The dated 2026-09-17 improvement-pack
advisory specs live under
[`docs/advisory/2026-09-17-ufo-improvement-pack/README.md`](docs/advisory/2026-09-17-ufo-improvement-pack/README.md)
(`DECISIONS.md` records operator re-charter choices). The optional, gitignored `uploads/` staging
directory is provenance when present, not an active runtime or command contract.

*2026-09-24 (nc5-docs r2, isolation distinction):* on the nc5 magga-2 OMP fleet
experiment, fleet L1 owners make path-scoped commits and push to the local bare
`origin` inside the isolation root for an audit trail only — not to the cursor or
public remote. That trail does not grant publish authority; see
[`docs/EPHEMERAL-L1-MISSIONS.md`](docs/EPHEMERAL-L1-MISSIONS.md) and
[`docs/AUTO-SHIP.md`](docs/AUTO-SHIP.md).
*2026-09-24 (nc5-docs r4):* on magga-2, L1/L2 seat routes resolve from isolated
`$HOME/.omp/agent/config.yml` (live pin in
[`docs/L2-L3-ROUTING.md`](docs/L2-L3-ROUTING.md)); do not assume the host OMP
home table applies to fleet lanes.
*2026-09-24 (nc5-docs r5):* the sighting wall uses `UFO_SIGHTING_TMUX_SOCKET`
(socket `nc5` on this fleet), not the host default tmux server — see
[`docs/ufo-sighting-terminal-respawn.md`](docs/ufo-sighting-terminal-respawn.md).
*2026-09-24 (nc5-docs r9, periodic re-verify):* doctor loop at HEAD `48f2e17b` — **6× exit 0**, opencode **exit 2**; OMP pin `7072817d…` equals bundled `source.sha256`; `node scripts/sync-global-routing.mjs --check` ok; collapsed **495** advisory-pack README session stamps and duplicate artifact index stamps; behavioral-doc rotation: `EPHEMERAL-L1-MISSIONS`, `BEHAVIOR-MATRIX`, `FRAMEWORK`, `ARCHITECTURE`, `SWARM-REROUTE`, `ufo-sighting-terminal-respawn`.
