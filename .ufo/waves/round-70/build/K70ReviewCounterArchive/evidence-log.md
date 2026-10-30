# K70ReviewCounterArchive — evidence log

Date: 2026-10-30. Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Lane HEAD: 1e00955a657a5b955992e23915143e7b3e261bb4 (frozen plan commit 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a parent chain intact). No installs/updates performed (node v24.21.0, git 2.56.0 already present).

## Commands and observed outputs

1. `git status --porcelain` (lane) → only untracked wave artifacts (build/, w1.ready.partial, w1/K70AttackReceiptOverwrite.md); `git status --porcelain --untracked-files=no | wc -l` → `0` (tracked tree clean).
2. `git cat-file -e HEAD:<path>` for the counter's archived paths: scripts, corpus, SKILL.md, SCORECARD.md, .ufo/pins, .ufo/pins/counter-pins.json, .ufo/waves/round-69/probe, .ufo/waves/round-69/controls, both frozen control scripts, both r69 probes → all `OK`.
3. Frozen-byte checks (sha256):
   - c1-controls.sh base==HEAD `01efd6dd…aeda12` SAME; c2-controls.sh base==HEAD `679b7d96…3a66f4` SAME.
   - plan.md frozen==HEAD==disk `e518567d…4744b`; replay70-probe.mjs frozen==HEAD==disk `63f52b75…bf0c1`. Frozen bytes unchanged.
4. Counter extraction dry-run at rev=HEAD into scratch: exact archive pipeline `git -C <lane> archive 1e00955a… scripts corpus SKILL.md SCORECARD.md .ufo/pins .ufo/waves/round-69/probe .ufo/waves/round-69/controls | tar -x …` → `ARCHIVE-EXTRACT OK`; all key members present; `scripts/control-replay.mjs` absent at HEAD (expected pre-integration; consistent with base receipt R2/R3–R7/R10 MISS).
5. `node --check replay70-probe.mjs` → syntax OK.
6. R1 data-source check: `git -C lane show 78b98d76…:…/c1-controls.sh` and c2 equivalent → exit 0.
7. c2 fixture anchor: `git cat-file -e 14057f3e…^{commit}` → present.
8. Pins shape: `.ufo/pins/counter-pins.json` → keys {version, pins}, 38 entries, fields {name, path, round, sha256}; includes replay70-probe pin sha256 `63f52b75…` == disk hash.
9. Base receipt `.ufo/waves/round-70/base/replay70-base.txt` → `REPLAY70_UNMET held=2/10`, R1 PASS, R9 PASS, others MISS, exit 1. Matches plan's do-nothing control expectation. `base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.
10. Committed r69 receipts (`controls/c1-*.txt`, `c2-*.txt`) contain the UNMET first lines and `control=MODE exit=… rev=…` trailers, but NO `CONTROL-PASS <mode>` lines (r69 scripts echoed that to terminal only). The r70 counter's `--out` files must therefore capture the private script's stdout to include `CONTROL-PASS <mode>` — a property of the new tool, not of the committed receipts.
11. Revision-binding grep evidence: `grep -c "rev-parse\|fsync\|flock" replay70-probe.mjs` → `0`. The counter contains no lane-HEAD-vs-rev assertion and no cleanliness check.

## Reproduction notes

- Originals `c1-controls.sh` / `c2-controls.sh` were READ ONLY, never executed.
- Full counter not re-run: at HEAD the tool is absent, so a run would only reproduce the frozen base outcome (2/10 UNMET) — the base receipt already records this; unrun is unrun.
- All writes were under /fast/scratch/hyaku/kumitate-r70/K70ReviewCounterArchive/ (removed after copying receipts to this build dir).
