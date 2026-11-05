# Gate 3 — omp-census DRIFT entries=80 findings=7: classification

Base reading (live root, lane worktree): `node scripts/omp-census.mjs` → `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=80 findings=7)`, exit 1. Receipt: `receipts/base-live-worktree.txt`.

Only names, kinds and permission bits were taken, via `stat(1)` (inode metadata) and the census's own `readdir`/`lstat`. No member was opened, read or hashed. Receipt: `receipts/gate3-lstat-findings.txt`.

All seven findings are `UNLISTED <name>`, so there are no `KIND` or `MODE` findings from the census itself. All seven are regular files. None of the seven appears in `.ufo/pins/omp-shape.json` (captured 2026-11-04T09:45:44Z, 65 entries). Their mtimes run from 10:04 to 18:46 today, so they arrived after the shape receipt.

| # | member (name only) | kind | mode | class | proposed action |
|---|---|---|---|---|---|
| 1 | `agent.db.reset-a37b64321d6cc959` | file | 0644 | **violation** — (a) mode 0644 exceeds the 0600 ceiling that every `agent.db` family carries; this is a copy of the credentials-bearing database, so it is world-readable. (b) No declared family matches the name. Provenance is not established: [INFERENCE] an operator or recovery copy made 11:00 today, not verified by content. | **Repair:** operator runs `chmod 0600` on it (host state; not applied). Then the operator either confirms provenance and declares a family, or removes or renames the file. Clearing the mode alone does not clear `UNLISTED`. Declaration text, only if provenance is confirmed: `{ id: 'agent-reset', owner: 'agent.db', re: /^agent\.db\.reset-[0-9a-f]{16}$/, kind: 'file', mode: 0o600, note: '...' }` plus an `agent-reset` row in `corpus/knowledge/omp-agent-root.md`. Adding it raises `O_bound` 35→36 in the proxy stanza. |
| 2 | `config.yml.pre-all-m_mim-opus-20261104` | file | 0600 | **genuine new member** of `config-pre` (operator pre-edit copy of `config.yml`; mode and `YYYYMMDD` date both conform). The only deviation is the slug charset: it contains `_`, and none of the 30 `config-pre` generations in the snapshot (`.ufo/pins/omp-shape.json`) uses an underscore. | **Declare:** widen the slug class to `[a-z0-9_-]` (`[a-z0-9][a-z0-9_-]*`). Judgment call: the slug is an operator label and carries no security weight; the mode ceiling and date rule still bind. Applied in candidate (`gate3-omp-census-config-pre.patch`). |
| 3 | `config.yml.pre-m_swe-exec-review-20261104` | file | 0600 | genuine new member, same deviation as #2 | declare, same edit as #2 |
| 4 | `config.yml.pre-m_swe-flash-20261104` | file | 0600 | genuine new member, same deviation as #2 | declare, same edit as #2 |
| 5 | `config.yml.pre-run15-devin-unavailable-20261104.Qfa62SXH.bak` | file | 0600 | **violation** — a random 8-character token and a `.bak` suffix follow the date. Neither is a form of any family, and the token looks tool-generated. | **Repair:** operator renames it to `config.yml.pre-run15-devin-unavailable-20261104`, or removes it if it duplicates another copy. Do not declare `.bak`. Not applied; remains in the candidate's residual findings. |
| 6 | `config.yml.pre-run15-most-off-zfl-20261104T153242` | file | 0600 | genuine new member; the date token has an added `T<HHMMSS>` time suffix that the family's `YYYYMMDD` form does not allow. The registry already accepts a UTC stamp in `agent-pre-restore` (`YYYYMMDDTHHMMSSZ`), so this is a recognised form. | **Declare:** widen the date token to `20\d{6}(T\d{6})?`. Applied in candidate. |
| 7 | `config.yml.pre-run15-zai-restored-20261104T105305` | file | 0600 | genuine new member, same deviation as #6 | declare, same edit as #6 |

## Candidate effect (verified)

`gate3-omp-census-config-pre.patch` widens the `config-pre` regex and adds the note wording. Applied to a copy of HEAD and run against the live root, the census reads `UNLISTED agent.db.reset-a37b64321d6cc959` and `UNLISTED config.yml.pre-run15-devin-unavailable-20261104.Qfa62SXH.bak`, `OMP_CENSUS: DRIFT ... findings=2`, exit 1. Findings fall from 7 to 2, and both residual items are violations that need the operator (#1, #5). Receipt: `receipts/candidate-tree-gates.txt`.

Its selftest reads `VERDICT: PASS (108 cases)`, the same as at HEAD (`receipts/omp-census-selftest-*.txt`).

Because `scripts/omp-census.mjs` changed, `pin.omp-census` in the SCORECARD gate-pins block must be re-pinned: `f6ace3e2…` → `a080652c…`. That hunk is included in the same patch.

`coverage:omp` is derived from the shape snapshot and not from the live root, so the proxy did not see these seven findings (`O_findings=0`). The live drift still exists and is reported here.
