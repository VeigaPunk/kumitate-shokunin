RESULT SupersedeS004 rev=cac43009 verdict=CONFIRMED row=S081
| S081 | `omp --version` on this host — stdout `omp/18.12.6` | tool | A | Installed OMP harness version on this host | stdout line 1; host `omp/18.12.6`, re-opened 2026-10-23 | supersedes S004 — Installed harness version omp/18.12.6 on 2026-10-23 for version-skew checks against upstream main docs; S004's omp/18.12.3 is a dated 2026-10-19 observation, not current. | mined | 2026-10-23 | on-release | corpus/knowledge/omp-task-contract.md |

Gate record
URL: N/A — the reopened source is local command output, not a URL-backed source.
Access date: 2026-10-23.
Quote: “omp/18.12.6” — stdout line 1; 1 word (≤25).
Body digest: sha256 `3e2d89936e0abf71012a410c259da03c372b33d31cdb09ac096cc2d841294a7b` over stdout bytes `omp/18.12.6\n`.

Evidence
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2b2bf7bb:corpus/SOURCES.md | grep '^| S004 |'` → `| S004 | omp --version on this host — stdout omp/18.12.3 | tool | A | Installed OMP harness version on this host | stdout line 1; host omp/18.12.3 (2026-10-19) | Installed harness version omp/18.12.3 for version-skew checks against upstream main docs | mined | 2026-10-19 | on-release | corpus/knowledge/omp-task-contract.md |`
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show cac43009b22232c1ae8efdab4f2789516c1fcc6f:corpus/SOURCES.md | grep '^| S004 |'` → `| S004 | omp --version on this host — stdout omp/18.12.3 | tool | A | Installed OMP harness version on this host | stdout line 1; host omp/18.12.3 (2026-10-19); re-run 2026-10-23 (round 46, SweepS001S005): omp/18.12.6 — the 18.12.3 capture is a dated observation, no longer reproducible | Installed harness version omp/18.12.3 on 2026-10-19 for version-skew checks against upstream main docs (the host has since moved to 18.12.6; S053) | mined | 2026-10-19 | on-release | corpus/knowledge/omp-task-contract.md |`
- Re-opened source: `omp --version` → `omp/18.12.6` (2026-10-23). The output confirms round 46's re-run/version-moved statement and that 18.12.3 is not the current output; the historical 2026-10-19 observation remains dated, not overwritten.
- Quote/hash command: `printf '%s' "omp/18.12.6" | wc -w && printf '%s\n' 'omp/18.12.6' | sha256sum` → `1` and `3e2d89936e0abf71012a410c259da03c372b33d31cdb09ac096cc2d841294a7b  -`.
- History command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --format=fuller 980a16af -- corpus/SOURCES.md && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --format=fuller adedf671 -- corpus/SOURCES.md`. At `980a16afc7caafe4e924ef117692248fdc7acbd6`, the in-place S004 correction added the 2026-10-23 re-run and narrowed its teaching to a dated 18.12.3 capture, noting 18.12.6/S053. The `adedf6719127dbb62db5425b4535a542b7995a52` patch did not alter S004.
- Consumer check: `corpus/knowledge/omp-task-contract.md:1-3,205-207,214` cites S004 as the host's 2026-10-19 `omp --version` output and treats it as the version-skew boundary; its `source` path matches the row's `used-by`.
- Rule reference: `/home/vgpnk/Projects/shokunin/CORPUS.md:112-118` requires opening the source in the row-writing round and append-only corrections beginning `supersedes S0NN —`.

Cell audit and scope
The observed output supports the new source/version, tool kind, host-version scope, stdout-line anchor and teaching. Existing tier A, status `mined`, recheck `on-release`, and the same used-by path are carried from the corrected row; they are registry metadata, not facts emitted by this command. The 2026-10-19 value is preserved only as the historical observation described by the correction. No cell in the round-46 correction conflicts with today's reopened output.

Touched surfaces and limits
Only this report was written. `corpus/SOURCES.md`, `CORPUS.md`, `corpus/knowledge/omp-task-contract.md`, and the round-46 lesson were read-only. No URL source exists for this tool-output claim, so no external page was fetched and no URL or HTTP body is claimed. No package/tool was installed; no gate, counter, selftest, build, or test was run. The S081 row is proposed for the L1's registry append; this seat did not modify the registry.