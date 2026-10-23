RESULT SupersedeS055 rev=cac43009 verdict=CONFIRMED row=S089
| S089 | oh-my-pi v18.12.6, packages/ai/src/auth/sqlite-credential-store.ts — https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/ai/src/auth/sqlite-credential-store.ts | code | A | agent.db's permission (0600) and that OMP may quarantine it on corruption | packages/ai/src/auth/sqlite-credential-store.ts:580-601 @ 45c35e40c46166dc726ccc52f5d27f40f2449f99; file sha256 11bfdcd9f2b9c99c691fb36b47cedad1640e78b74c78a79cec679d1c234e2673; re-opened 2026-10-23 | supersedes S055 — open() defaults dbPath to getAgentDbPath(); it attempts chmod 0600 (ignored on failure) and requests corruption recovery, but names no quarantine family. | mined | 2026-10-23 | on-release | corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md |

Gate record
- URL: https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/ai/src/auth/sqlite-credential-store.ts
- Access date: 2026-10-23; HTTP 200.
- Verbatim quote: “await fs.chmod(dbPath, 0o600);” — locator: packages/ai/src/auth/sqlite-credential-store.ts:594; word count 3.
- Body SHA-256: 11bfdcd9f2b9c99c691fb36b47cedad1640e78b74c78a79cec679d1c234e2673.

Findings
- The 2b2bf7bb row's anchor was 590-601 and taught “agent.db ceiling 0600 and the agent.db.corrupt-* family.” The cac43009 correction widens the anchor to 580-601 and says the path defaults to getAgentDbPath(), chmod is attempted and failures are ignored, and corruption recovery is requested; it removes the quarantine-family assertion because that name belongs to S054. The correction is confirmed by the reopened bytes: lines 580-601 show the default, chmod inside try/catch with the ignore comment at 596, and `{ recoverCorruption: true }` at 601. The method comment at 579 also describes one-shot corruption recovery. The 153-character teaching above preserves these supported corrections and does not claim a quarantine name.
- The row's concrete `agent.db` mapping is via S053's getAgentDbPath identification; this file itself uses `getAgentDbPath()` rather than spelling `agent.db`. This file does not establish the quarantine-family name or the helper's exact recovery implementation.
- Scope: R46-1 supersede re-open; the only lane artifact written is this report. No source registry row was appended here.

Evidence
- Ran `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2b2bf7bb:corpus/SOURCES.md`; the S055 row was read from the output at registry line 68. Original anchor: `lines 590-601`; original teaching ends `agent.db ceiling 0600 and the agent.db.corrupt-* family`.
- Ran `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show cac43009b22232c1ae8efdab4f2789516c1fcc6f:corpus/SOURCES.md`; the S055 row was read from the output at registry line 68. Corrected anchor: `lines 580-601`; corrected teaching narrows chmod to an attempt, records ignored failure, and removes the family name.
- Ran `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -p --follow -- corpus/SOURCES.md`; history output included commits 980a16af and adedf671.
- Ran `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --format=fuller 980a16af -- corpus/SOURCES.md`; observed the round-46 S055 rewrite and its claim that agent.db was set to 0600 and had an agent.db.corrupt-* family.
- Ran `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show --format=fuller adedf671 -- corpus/SOURCES.md`; observed the recorded correction at S055 with the widened lines and narrowed teaching.
- Re-opened the pinned raw source at the Gate URL above using the read tool (2026-10-23); fetched lines 580-601 and searched the fetched source for `corrupt`, `recoverCorruption`, and `chmod`. Relevant bytes: `static async open(dbPath: string = getAgentDbPath())`, `await fs.chmod(dbPath, 0o600);`, catch comment `Ignore chmod failures (e.g., Windows)`, and `{ recoverCorruption: true }`.
- Ran `curl -sS -o /dev/null -w 'HTTP %{http_code}\n' https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/ai/src/auth/sqlite-credential-store.ts` → `HTTP 200`.
- Ran `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/ai/src/auth/sqlite-credential-store.ts | sha256sum` → `11bfdcd9f2b9c99c691fb36b47cedad1640e78b74c78a79cec679d1c234e2673  -`.
- Ran `printf '%s' 'await fs.chmod(dbPath, 0o600);' | wc -w` → `3`.
- Ran `printf '%s' 'open() defaults dbPath to getAgentDbPath(); it attempts chmod 0600 (ignored on failure) and requests corruption recovery, but names no quarantine family.' | wc -c` → `153` characters after the required prefix.

Gates and touched surfaces
- Gate outcome: CONFIRMED; no test, selftest, build, or counter was run. This item re-opened a source and drafted a registry correction only.
- Touched surface: `.ufo/waves/round-47/build/SupersedeS055.md` (this report). `corpus/SOURCES.md` was read-only and unchanged by this seat.
- Out of scope: applying S089 or restoring S055 in the lane, product/source edits, and any candidate/control scoring. No tools were installed or updated.