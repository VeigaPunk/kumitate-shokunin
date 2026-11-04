DRAFT `corpus/README.md` map rows — one line per entry, in the Coverage map table's 3-column shape.
Both entry paths already have a row in the live README at `509afb1d`; the lines below **replace** the
current rows for those two paths if the L1 lands these drafts (the `Primary sources` cell changes).

| `knowledge/two-reading-verdicts.md` | One tool, one verdict per surface: the spotcheck set and the README map as separate readings, delta-scoped `--adopt`, the CI own-verdict-versus-aggregate ground (GHA `outcome`/`conclusion`, GitLab `allow_failure`), and the folded-green failure modes | S236, S237; `scripts/spotcheck-adopt.mjs`, `.ufo/waves/round-80/probe/probe80-c1.mjs` |
| `knowledge/snapshot-bound-derived-scores.md` | A derived score reads a committed, hash-pinned snapshot by default with an explicit live opt-in: the Terraform and npm lockfile grounds, the r80 `coverage:omp` flake, the watch table and the invisibility limit | S234, S238; `scripts/proxy-check.mjs`, `.ufo/pins/omp-shape.json`, `.ufo/pins/origin.json` |

Current live rows (for the diff), read 2026-11-04 from the working tree:

- `knowledge/two-reading-verdicts.md` → `S119; scripts/spotcheck-adopt.mjs, .ufo/waves/round-80/probe/probe80-c1.mjs`
- `knowledge/snapshot-bound-derived-scores.md` → `S234; scripts/proxy-check.mjs, .ufo/pins/omp-shape.json, .ufo/pins/origin.json`
