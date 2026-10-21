SEC1 hits=94 leaks=0 verdict=refuted

# Sec1 — secret, hostile-input and misroot check on the restored notes (round 37 falsify)

Scope: corpus/knowledge/{native-trial-launch,route-probe-cluster,sighting-wall,remaining-scripts-census}.md (2050 lines), plus .ufo/waves/round-37/repairs.md and the round-36 reject evidence. Lane /home/vgpnk/Projects/shokunin/kumitate-shokunin (HEAD a5d627b; base 0614092). Pin /fast/scratch/kumitate-r36/src (dr-xr-xr-x; HEAD 31c465f15669f744848bd9f5d56191c5085670f7). Read-only throughout. No secret member opened. No scratch written. Tools installed or updated: none (node v24.21.0 pre-existing).

## Verdict basis
- leaks=0: control holds for secret material.
- accepted hostile input = 0 in the four notes: control holds (latent gap in §3, not triggered).
- unrecorded misroot: FAILS. 15 runnable bash lines in two restored notes resolve to a non-pin root (live origin ufo-fsd-alpha, or round-35 clone kumitate-r35) or to host /tmp. None is recorded in repairs.md or the four restoration notices. Five round-35 /tmp residue files are likewise unrecorded.

## 1. Counters (four notes, distinct lines; classes overlap, UNION is hits)
| class | lines | disposition |
|---|---|---|
| secret shapes: gh/sk/xox/AKIA/AIza/glpat/npm_/dapi/ya29, JWT, PEM, op://, scheme://user:pass@, Bearer, assign-style | 0 | none |
| invisible: Cf/Co/Cn/Mn, bidi, ZWSP, control, ANSI; Greek/Cyrillic | 0 | none |
| matcher or quoted literals in prose | 2 | rem:621 (`sk-42`, `eyJ…`, PRIVATE KEY named in prose); route:465 quoted probe-redact.mjs:8 regex |
| sensitive-name words (credential, oauth, .omp/, process.env) | 43 | policy or design prose; no credential-file path named |
| entropy candidates (≥32 chars, H≥4.5, non-hex) | 6 | all `KEY=/abs/path` (route 47, 397; rem 333, 343, 552, 564) |
| hostile-shaped tokens (chmod, ~/, $(, SSH, pacman -S) | 9 | documented local commands, paths, or prose (§3) |
| misroot-class roots | 43 | 10 prose, 18 transcript, 15 runnable bash (§4) |
| external URL | 1 | loopback http://127.0.0.1:34113, no userinfo |
| UNION = hits | 94 | native 9, route 40, sighting 2, remaining 43 |

Command outputs:
- `_grep` secret-shape pattern over the four notes: `No matches found`. Same over repairs.md and rej: none. Independent Python re-scan: 0 secret-shape lines (agrees).
- `_grep` invisible/control/bidi pattern: `No matches found`. Python Cf/Co/Cn/Mn census: {} for every file.
- Exact root-token multiset diff, base `git show 0614092:<note>` vs working tree: native, route, sighting identical. remaining differs only in in-repo anchor paths (scripts/charter-scribe/config.json, …/charter-scribe.timer, scripts/lean-cargo/measure.sh added; scripts/lean-cargo/README.md removed x2). No /home, /fast, /tmp or /scratch token added.
- sha256 (16-char): native e7f0cd2e085ba5a0, route 9b116b2e15d370e8, sighting 11ebf15264046a31, remaining 0664c514ea95b75f, repairs.md 274772b7fbbcaeae, rej 3f51c7e7c3caf1c5.

## 2. Control operability
- Pinned evidence-side screen, `node --input-type=module -e` importing containsCredentialShape / containsSensitiveShape from /fast/scratch/kumitate-r36/src/scripts/ufo-credential-screen.mjs (sha256 6ce399b026ffccec…, 3796 B, r--r--r--). Output {credShape, sensitiveShape}: native F/F; route F/T (line 465); sighting F/F; remaining F/T (line 621); rej F/T (139,140).
- Synthetic controls (not secrets, inline only): "sk-"+20×A → T/T; "sk-"+U+200B+20×a → F/T (judge side accepts, evidence side catches); JWT-shape → F/T; "sk-42" → F/F; "task-failed" → F/F.
- Lane scripts/ holds no executable secret, hostile, or misroot gate. grep for containsCredential|assertNoSecrets|PRIVATE KEY returned only origin-candidate text and secret-member policy. The round-36 SentinelSecrets grep recipe is manual, so the control is not operable as a gate.
- Secret-member policy in lane tools holds: kimi-census.mjs imports no readFileSync (import list lines 87-90; stat-only per header). proxy-check.mjs reads only the pin (readPin :412), lane notes/SKILL/README/scorecard (readText :870, :1191-1207), and declared lane files (sha256File :1026). No call site touches the kimi root or mcp.json, server.token, credentials/, oauth/.

## 3. Hostile-input evidence
- Role-directed injection phrases ("note to agent/assistant/model/AI", role tags, IMPORTANT:, secretly, do-not-tell): 0. Matches were only the words override(s) or ignore inside code or prose (e.g. route:164, route:419, remaining:577).
- Remote fetch or exec (curl, wget, pipe-to-shell, base64 -d, eval): 0.
- The 9 shell-shaped lines: native:73, :75 fchmod (prose); native:237 ~/.cargo/bin/ufo (path); sighting:105 chmod (atomic-write prose); remaining:81 documented local `$(cat … | sed …)` count pipeline; remaining:466 "SSH URL" (prose); remaining:552 ~/.cargo/bin/cargo path and `pacman -S sccache` recorded as a historical pin (no instruction to run); remaining:556, :560 path prose.
- Latent control gap, not triggered: the round-36 grep set has no Cf stripping. "sk-<U+200B>…" passes the judge-side screen (F) and is caught only evidence-side (T). The restored notes contain 0 Cf characters.
- Host residue /tmp/member-probe.mjs: joins MEMBERS entries unconfined onto UFO_SRC (line 35, readFileSync(`${SRC}/${mem}`)). It echoes only member names and verdict tokens (lines 57-63), never file lines. At most a boolean oracle over operator-supplied paths. Low.

## 4. Misroot evidence
(a) The repair introduced no root (§1 diff).
(b) 15 runnable bash lines off the pin, unrecorded:
  - route-probe:397 `ORIGIN=/home/vgpnk/Projects/ufo-fsd-alpha` (hard-coded live origin; the falsify contract says never pass it).
  - route-probe:402, 404, 405, 406: /tmp/s7-members.txt, /tmp/s7-headings.txt.
  - remaining:40 `SRC=/fast/scratch/kumitate-r35/src`; remaining:223 `SRC=${UFO_SRC:-/fast/scratch/kumitate-r35/src}`. stat: `dr-xr-xr-x vgpnk directory /fast/scratch/kumitate-r35/src`. The default silently resolves to an existing read-only round-35 clone, not the r36 pin.
  - remaining:41, 43, 76, 78, 79, 224, 226, 228: /tmp/s8-* writes and reads. Line 224 defaults MEMBERS to /tmp/s8-members-live.txt.
(c) Host residue outside the lane, dated 2026-10-20 (pre-round-37), not in repairs.md: /tmp/s8-members-live.txt (2068 B), /tmp/s8-s1s7-live.txt (966 B), /tmp/s8-all-scripts.txt (3034 B), /tmp/s8-headings.txt (2068 B), /tmp/member-probe.mjs (3174 B). Named paths /tmp/s7-members.txt, /tmp/s7-headings.txt, /tmp/clap-probe, /tmp/kumitate-r13/s8-members.txt: ABSENT (stat). A /tmp glob sweep timed out, so absence is claimed for named paths only.
(d) Adjacent, outside the notes: cite-check.mjs:106-108, round-gate.mjs:150-152 and surface-probe.mjs:148-150 default --src/--origin to the live candidates (~/Projects/ufo-fsd-alpha, then origin-work). Their help text shows no --pin. claims-check.mjs:93-95 and proxy-check.mjs:310-312 take the pin's clone by default.
(e) Record gap, not a misroot: repairs.md records D1, D2, ratchet, D6, D7 only. Commit 5ceb8cd cites D3–D8; D3–D5 and D8 are absent from repairs.md.
(f) Strays: no *.rej, *.orig, *.bak or *.patch at lane root or in corpus/knowledge (glob). ExecFidSmall.patch absent (only ExecFidSmall.md report). Fleet-root `-.rej`: `stat: cannot stat './-.rej': No such file or directory`. Evidence copy present, 72390 B, valid reject header; cmp against the deleted original is unverifiable now [INFERENCE: D6 accepted as recorded]. Committed repair set 5833351..HEAD: 22 files (11 M, 11 A), no suspicious names, no renames. Lane status: only untracked falsify reports Pair1–8, Verify2–3.
(g) Fleet root, not lane artifacts: ` M .ufo/watchdog.log`; 14 untracked .ufo/state/<seat>.report-baseline. kumitate's baseline is 68 B, a digest only (e3b0c442…, the SHA-256 of empty input).

## 5. Severity, exploit path, impact, smallest remediation (no edits made)
- Leak: none found.
- Misroot, Medium (measurement integrity, no confidentiality impact). No attacker is needed. Following remaining:223 with UFO_SRC unset measures the round-35 clone; route:397 measures the live origin. Verdicts silently come from the wrong tree, and /tmp residue sits outside the lane contract.
- member-probe, Low: unconfined read gives a boolean oracle over operator-supplied paths; no content echo.
- Smallest remediation: (1) point remaining:40 and :223 defaults to /fast/scratch/kumitate-r36/src, and route:397 ORIGIN to that pin; (2) rewrite runnable /tmp paths to ${SCRATCH:-/fast/scratch/kumitate-r37/<name>}, or record each line in repairs.md; (3) delete or record the five /tmp residue files; (4) record D3–D5, D8 in repairs.md. Add root-class and Cf checks to the lane note gate.

## 6. Commands (read-only; cwd lane unless absolute)
- GIT_OPTIONAL_LOCKS=0 git --no-pager status --porcelain=v1 --untracked-files=all
- GIT_OPTIONAL_LOCKS=0 git --no-pager diff --name-status 5833351 HEAD
- GIT_OPTIONAL_LOCKS=0 git --no-pager show 0614092:<note> (base for the root-token diff)
- git -C /home/vgpnk/Projects/shokunin status --porcelain=v1 --untracked-files=normal (fleet, read-only)
- sha256sum, stat, cat of the 68-byte fleet baseline
- node --input-type=module -e (pinned screen import; synthetic controls inline, not written)
- _grep: secret shapes, matcher, sensitive, hostile, invisible, misroot, injection phrases, external URL, residue, gate scan
- Python (eval): line-level union, fence-aware census, root-token multiset diff, entropy (masked or skeleton only; no secret value printed)

## Tools
None installed or updated. No package transactions. Only this report was written.
