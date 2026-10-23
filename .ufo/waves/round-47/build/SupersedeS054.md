RESULT SupersedeS054 rev=cac43009 verdict=CONFIRMED row=S088
| S088 | oh-my-pi v18.12.6, packages/utils/src/sqlite.ts — https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/sqlite.ts | code | A | how OMP quarantines a corrupt SQLite store: the backup-name template and the copied sidecar suffixes | lines 12, 193, 197-200 at commit 45c35e40c46166dc726ccc52f5d27f40f2449f99; raw-file sha256 4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b; reopened 2026-10-23 | supersedes S054 — lines 193 and 197-200 show the helper names a timestamped backup from dbPath, then chmods and copies available -wal, -shm, -journal and main files; this file does not identify callers | mined | 2026-10-23 | on-release | corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md |

Gate record
URL: https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/sqlite.ts
Access date: 2026-10-23
Quote: “fs.copyFileSync(`${dbPath}${suffix}`, `${backupPath}${suffix}`, fs.constants.COPYFILE_EXCL);” — sqlite.ts:200; 3 words (`printf '%s' 'fs.copyFileSync(`${dbPath}${suffix}`, `${backupPath}${suffix}`, fs.constants.COPYFILE_EXCL);' | wc -w` → `3`)
Body SHA-256: 4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b

Evidence
- Read `.ufo/waves/round-47/plan.md` first; its R46-1 instruction calls for restoring the 2b2bf7bb row and appending a re-opened `supersedes` row.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2b2bf7bb:corpus/SOURCES.md | grep '^| S054 |'` returned the pre-correction row; its teaches claims the helper “grounds the history.db/agent.db corrupt chains at 0600”.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show cac43009b22232c1ae8efdab4f2789516c1fcc6f:corpus/SOURCES.md | grep '^| S054 |'` returned the round-46 correction: helper is for “any dbPath”; “which stores call it is not in this file”.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -p --follow -- corpus/SOURCES.md` showed the S054 in-place rewrite in `980a16af` and `adedf671`'s R46 narrowing/removal of the unsupported store-chain attribution (`SweepS051S055`).
- Re-opened the pinned GitHub source with `read` at the URL above (raw response). `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/sqlite.ts | grep -nE 'SQLITE_STORE_SUFFIXES|const backupPath|fs\.chmodSync|fs\.copyFileSync'` returned lines 12, 193, 197, 199, 200, and 228: suffixes are `-wal`, `-shm`, `-journal`, and empty (main file); helper derives backup name from `dbPath`, chmods and copies the files. No caller store names occur in the fetched file.
- `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/sqlite.ts | sha256sum` → `4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b  -`.
- `git ls-remote https://github.com/can1357/oh-my-pi.git refs/tags/v18.12.6` → `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6`; the source label and pinned revision agree.
- `printf '%s' 'lines 193 and 197-200 show the helper names a timestamped backup from dbPath, then chmods and copies available -wal, -shm, -journal and main files; this file does not identify callers' | wc -m` → `183` characters after the required prefix, within 200.

Cell check and disposition
The re-open confirms the corrected source, kind, tier, scope, and anchored source claim: the helper uses generic `dbPath`, and lines 12/197-200 define and copy sidecar plus main-file suffixes. It does not identify caller stores, so the round-46 correction is supported; no corrected cell conflicts with the fetched bytes. `status=mined`, `recheck=on-release`, and `used-by=corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md` are carried unchanged from the corrected row as directed (they are registry metadata, not claims established by this source). The new anchor and opened date record this round's re-open.

Touched surfaces: this report only. No lane source row was edited; S088 above is the requested draft for the L1 to append. No tests, gates, or frozen counter were run; no tools were installed. Source-body limit: this file establishes helper behavior, not which stores invoke it.