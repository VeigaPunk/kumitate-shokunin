# round-5 aggregator mirror — cross-province latent defect with no owning repo (`membrane-seal write` argv)

- **Repo:** `kumitate-shokunin` — recorded here because this lane found and filed the defect, not because this repo can fix it.
- **Filed by:** kumitate round-5 report (2026-09-28), `kumitate-shokunin@e748e44` §"Latent defect surfaced (cross-domain, reported — not owned)"; also documented in `SKILL.md:177-190` ("⚠ Cross-domain defect (reported, not owned)") and `corpus/lessons/round-5.md:54`.
- **Mirrored by:** aggregator round-5 (main-repo lane, `m_qwen`) per `PROTOCOL.md` integrator step 2 (mirror routed defects into the owning repo's `corpus/lessons/`). **No owning shokunin repo exists for the defect's target**, so the mirror lands in the discoverer's corpus and records the routing instead: the fix belongs to `origin-work/ufo-fsd-alpha`, which is outside every fleet province, and routing there is integrator/operator-level.
- **Safety:** read-only spot-check; no build, no `ufo` invocation against live state, no deploy.

## Claim — the launcher's seal argv cannot parse against the CLI's clap surface

`sealBoundaryViaRuntime` shells `ufo membrane-seal write --root … --run …` while `Command::MembraneSeal` is a flat flag struct with no `write` subcommand or positional — so every real `authority_boundary` seal write fails `membrane_seal_write_failed`, the verdict stays durable, no seal lands, and the next fresh dispatch refuses `membrane_seal_standing` until an operator signs or removes.

Pointers, re-verified read-only this round (all in `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`, repo HEAD `ee907f1cf`, 2026-09-27 20:27:46 -0300):

| Artifact | Pointer | Observed |
|---|---|---|
| launcher | `scripts/run-omp-native-trial.mjs` | `sealBoundaryViaRuntime` def at L1904; `spawnSync` argv `"membrane-seal", "write"` at L1931; failure arm `membrane_seal_write_failed` at L1941 |
| CLI | `crates/ufo-cli/src/main.rs` | `MembraneSeal {` at L95 (fields `root`/`run`/`session`/`round`/`accepts` — no `write` variant or positional); dispatch L276-282 passes flags only; impl `membrane_seal` L292-308 |
| clap pin | `Cargo.lock` | `clap` 4.6.6 |
| stub-side pin (why it survived) | `tests/run-omp-native-trial.test.js:3939` | asserts the exact argv string `membrane-seal write --root … --run …` against a fake runtime |
| real-side omission | `crates/ufo-cli/tests/cli_contract.rs:1507-1530` | `membrane_seal_write_lands_named_seal_and_binds_digest`; argv at L1514 omits `write` |

## Routing — why this is an aggregator/operator note, not a per-repo correction

`grep -rn 'ufo-fsd-alpha' *-shokunin/PROVINCE.md` → no match: no shokunin province owns that repo. kumitate's `PROVINCE.md` declares the *domain* ("OMP task/hub, ufo-fsd scripts & runtime"), but lane write scope per `PROTOCOL.md` is the lane's own child repo plus its main-repo report — `origin-work/ufo-fsd-alpha` is outside the fleet provinces. Candidate fixes belong upstream (drop the `write` token from the launcher argv, or add a `MembraneSealAction::Write` subcommand in `ufo-cli`). Operator/integrator disposition required; recorded as an open row in the aggregator ledger (`AGGREGATE.md`).

## Falsifiable next check

```
grep -n '"membrane-seal", "write"' ~/Projects/origin-work/ufo-fsd-alpha/scripts/run-omp-native-trial.mjs
grep -n 'MembraneSeal' -A16 ~/Projects/origin-work/ufo-fsd-alpha/crates/ufo-cli/src/main.rs | head -20
# on a built tree (not available in this audit):
# target/debug/ufo membrane-seal write --root /tmp/ms-probe --run r --session s --round 1; echo exit=$?
#   expected: clap parse error ("unexpected argument 'write'"), no seal file — matches kumitate's minimal clap 4.6.6 repro
```
