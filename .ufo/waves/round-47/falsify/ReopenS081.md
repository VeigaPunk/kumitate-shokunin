RESULT ReopenS081 rev=269dadb6 verdict=HOLDS row=S081 supersedes=S004

## Re-open: S081 at 269dadb6a56744531bd1201e5944185e96ff6a4c

### Row and Gate record
- Registry row (SOURCES.md:94 at 269dadb6): `| S081 | `omp --version` on this host — stdout `omp/18.12.6` | tool | A | Installed OMP harness version on this host | stdout line 1; host `omp/18.12.6`, re-opened 2026-10-23 | supersedes S004 — Installed harness version omp/18.12.6 on 2026-10-23 for version-skew checks against upstream main docs; S004's omp/18.12.3 is a dated 2026-10-19 observation, not current. | mined | 2026-10-23 | on-release | corpus/knowledge/omp-task-contract.md |`
- Cells (id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by): S081 | `omp --version` on this host — stdout `omp/18.12.6` | tool | A | Installed OMP harness version on this host | stdout line 1; host `omp/18.12.6`, re-opened 2026-10-23 | supersedes S004 — … | mined | 2026-10-23 | on-release | corpus/knowledge/omp-task-contract.md
- Gate table (lessons/round-47.md:29): `| S081 | local `omp --version` | 2026-10-23 | "omp/18.12.6" (stdout line 1; 1 word) | admit A, mined — supersedes S004 (SupersedeS004) |` — matches row (URL, accessed, quote+locator, decision). "New rows, each opened this round by a seat (build/<seat>.md holds the fetched-bytes hash and the command)".
- Drafting seat report build/SupersedeS004.md (rev=cac43009, verdict=CONFIRMED row=S081): quote "omp/18.12.6", body digest sha256 `3e2d89936e0abf71012a410c259da03c372b33d31cdb09ac096cc2d841294a7b`, wc -w=1; reported same row bytes; carried tier A / mined / on-release / used-by from corrected row; noted no URL source (local command output).

### Source fetch (ordinary means: local binary)
- `command -v omp` → `/home/vgpnk/.local/bin/omp`
- `omp --version` → `omp/18.12.6` on stdout line 1, exit 0.
- sha256 of stdout bytes `omp/18.12.6\n` = `3e2d89936e0abf71012a410c259da03c372b33d31cdb09ac096cc2d841294a7b` — identical to drafting seat's digest and Gate-table expectation.
- Word count: `printf '%s' "omp/18.12.6" | wc -w` → `1` (≤25).
- Quote is verbatim at stated locator (stdout line 1) and matches the source cell.

### teaches clauses vs located bytes
1. "Installed OMP harness version on this host" — supported: `omp --version` prints installed version on this host.
2. "Installed harness version omp/18.12.6 on 2026-10-23 for version-skew checks against upstream main docs" — version part supported by bytes; date/purpose consistent with S053 (oh-my-pi v18.12.6) and knowledge file's version-skew section.
3. "S004's omp/18.12.3 is a dated 2026-10-19 observation, not current." — supported: S004 row (2b2bf7bb; restored identical at 269dadb6) is dated 2026-10-19 with stdout omp/18.12.3, and today's `omp --version` differs (18.12.6), so 18.12.3 is not current.

### supersedes S004 correctness
- S004 (original `2b2bf7bb` bytes, restored at 269dadb6 — `diff` of `| S004 |` rows IDENTICAL): `omp --version` on this host — stdout omp/18.12.3, tool/A, opened 2026-10-19, on-release, used-by corpus/knowledge/omp-task-contract.md. Same domain (installed OMP host version), same kind/tier/scope/anchor shape — S004 is the correct supersede target.
- Fleet CORPUS.md rule 2: "A correction is a new row whose `teaches` opens `supersedes S0NN —`." S081 is a new row (absent at parent; parent only had S004) whose teaches opens `supersedes S004 —`. S081 is within the appended supersedes set S080–S092 (lesson row log; R46-1), one per restored row; `grep -o 'supersedes S0[0-9][0-9]'` shows exactly one S004 mapping.
- No conflicting row claims current host version as its observation: S053 (code, dirs.ts at v18.12.6) records the pin, not the host-version observation; S083's scope is agent-directory names.

### tier/kind/scope/anchor
- kind=tool: source is a local tool command output (S004 precedent: same kind).
- tier=A  scope=host installed OMP harness version; quality bar (QUALITY.md Q2) forbids `community` at tier A, not tool output; Gate decision "admit A, mined" is consistent.
- anchor=stdout line 1 — verified contains the quote byte-exact.
- status=mined, opened=2026-10-23, recheck=on-release, used-by=corpus/knowledge/omp-task-contract.md — carried from S004 (metadata, not command-emitted facts).

### Residual risk / gaps
- The frozen fleet contract file `SOURCES-CONTRACT-v1.md` is not present in the checkout (referenced from SOURCES.md header / QUALITY.md, resides in fleet-ledger worktree not currently on disk); tier/kind vocabulary checked against the on-disk quality bar (QUALITY.md Q1/Q2/Q8, Q35) and row precedent instead. Not a row defect.
- `corpus/knowledge/omp-task-contract.md` (used-by) still cites S004 for the 2026-10-19 host version (lines 205-207, 214); S081 supersedes it for current version, row relation correct.

### Evidence note
- No tool installed/updated; no gate/counter/selftest run; no lane file modified except this report (.ufo/waves/round-47/falsify/ReopenS081.md). Rev quoted: 269dadb6a56744531bd1201e5944185e96ff6a4c (lane tip).
