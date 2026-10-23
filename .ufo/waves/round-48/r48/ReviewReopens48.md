# ReviewReopens48 — attempt-1 re-open report verification (2026-10-23)

RESULT ReviewReopens48 verdict=verified
Seat `kumitate-r48-ReviewReopens48`, item ReviewReopens48 (leaf, no subagent dispatch).

Summary: all four attempt-1 re-open reports land. ReopenS084 HOLDS, ReopenS091 HOLDS, ReopenS092 HOLDS, ReconcileS088 HOLDS (seat completed + S088 HOLDS). Findings by severity below; no blocker.

## What was verified (re-fetch + repo-side)

Independent re-fetches (scratch `/fast/scratch/hyaku/kumitate-r48a/seats/ReviewReopens48/`), plus read-only git checks at the lane HEAD `fe3d45bf929246915c8c0de5f7f8682b5015b22c`:

| report | fetch check | result |
|---|---|---|
| ReopenS084 | pinned `guide/index.md` at `4d7570f5…` sha256 `8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc`, 139 lines / 5041 bytes, HTTP/2 200 | **exact match** |
| ReopenS084 | live `https://infection.github.io/guide/` sha256 `3c540f69dc6bc630c6496258524964ef0f7429f557a6bd328e5e5f2e8b336ef5`, 43231 bytes; commit API: pinned sha = main head, committer 2026-10-14T09:57:05Z, message `Document the new --threads=auto option (#4)` | **exact match** |
| ReopenS091 | `cli.html` v24.21.0 sha256 `7302f93cda9694927010d4171e181e8a7617a8852242d70f005f1ea65365538c`, 4200 lines, meta node-version v24.21.0 | **exact match** |
| ReopenS092 | final 200 body 632 bytes sha256 `c4cd41972b3b752ac40ac145f98c7e7a887d086dd03c362a3c4a9951e2d79ca5`, 301 → `/2.56.0/`, meta refresh line 7 to 2.49.0 (see Finding 3 for drift) | **match at re-open fetch time** |
| ReconcileS088 | `sqlite.ts` at `45c35e40…` sha256 `4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b`, 437 lines; tag `v18.12.6` = `45c35e40…` | **exact match** |

### ReopenS084 (HOLDS confirmed)
- Gate quotes verbatim: q1 at line 13 (`grep -c` = 1), q2 exactly line 99 (and repeats at 125). Word counts: q1=12, q2=7, pair with `/` = 20 (matches gate "(20 words)"; `SupersedeS047.md:16` `printf|wc -w` = 20).
- Locator lines 13, 23, 35, 94, 99–101 all verbatim; sweep for `exit|verdict|status|K43` over the pinned `guide/index.md` = 0 hits; guide-tree (19 `guide/*.md` fetched at the pinned commit, each HTTP 200) has 0 `verdict` hits, and the only `exit` sentences are `command-line-options.md:472` (`--dry-run`) and `:559` (`--ignore-msi-with-no-mutations`); `mutators.md:415` matches only as the substring `exit` inside "complexity" (non-rule false positive — this is what the report's "substring false positive" refers to).
- `infection/site` does **not** contain commit `4d7570f5…` (API: "No commit found") — the report's claim that the repo serving the bytes is `infection/infection.github.io` is verified; S047's `infection/site` locator is the stale naming S084 fixes.
- S047 is byte-identical at `2b2bf7bb` and HEAD (739 bytes); its teaches ("a kill is read off the run's reported failure (K43 (b)-(c))") is contradicted by the bytes; K43 (b)-(c) in `round-43.md:16-21` matches what the report says they are; `SKILL.md` cites S047 (count 1, gate-mutants row) not S084 (count 0); `round-43.md` cites S047 7×, S084 0×.
- Row shape: 11 cells/12 pipes (the report's "13 `|`-fields" = awk `NF`=13 counting the outer empty fields; S088/S091/S092 rows are structurally identical, so no shape defect). `teaches` opens `supersedes S047 —`; used-by paths exist; append-only held (S084 present at HEAD only).

### ReopenS091 (HOLDS confirmed)
- Quote verbatim, exactly one occurrence, at line 4148; straight apostrophe U+0027 in `V8's`, no U+2019 anywhere in the file; 10 words.
- Locator `:4147-4150` matches heading+paragraph; `:4147-4153` contains 0 "only" — S073's teaches ("…section only") is unsupported; S073 byte-identical across `2b2bf7bb`↔HEAD with the same wrong "only" clause.
- S091 teaches "docs do not say Buffer memory is outside it" is accurate for the assignment URL; the non-re-fetched anchors (`buffer.html`, getrlimit/prlimit man pages) are indeed outside the cli URL and do not affect the clause verdict.

### ReopenS092 (HOLDS confirmed, with Finding 3)
- At re-open fetch time the recorded 632 bytes/sha256 matched the row pin and S076's pin, so the re-open evidence was internally consistent.
- S076 at `2b2bf7bb` carries the same pre-correction teaches and the same owned pin; S092 is the only supersede-S076 row; suffix after `supersedes S076 — ` = 169 chars (verified).
- Rejection basis re-verified against the pinned bytes: title/h1 `Redirecting…`, no manual text, all three `2.49.0` nav URLs canonical; host `git version 2.56.0` (verified).
- Re-fetch of the unversioned S063 page the same minute: 200/0 redirects, footer `last updated in 2.49.0`, history `<li>2.49.1 → 2.56.0 no changes</li>` — the S063 content claims hold.

### ReconcileS088 (HOLDS confirmed)
- (a) Seat-completed ruling verified: `falsify-dispatch.json` task 25 = ReopenS088 (34 tasks); registry `ReopenS088.agentId = KumitateR47.ReopenS088`; `falsify/` holds 13 Reopen reports and none for S084/S091/S092; `ReopenS088.md` is in close commit `67ebb32dab08b006b1b95a29855eba08773b704e` (the only commit for the file), ancestor of the freeze; committed bytes ≡ worktree bytes (sha256 `8ed7ce1b30e246bc29996a136fd211ba985bf77f0f9c65cca6232a0dff440820`); its recorded fetch evidence (sha256, 437 lines, `git ls-remote` = `45c35e40…`) matches my independent re-fetch; chronology dispatch 10:46Z / registry 10:49:03Z / scratch 10:51Z / close 10:56:39Z is coherent and the seat finished inside the close commit that also mis-lists it as cancelled.
- Cancelled list: fleet report `.ufo/reports/round-47/kumitate.md:105` and lesson `round-47.md:122-125` list ReopenS084/S088/S091/S092 with the other 12 — both citations exist; removing S088 ⇒ 15 (the "-→15, not 16" correction is right; the arithmetic "13 of the 16" is consistent with the 13 report files present).
- (b) S088 row: append-only (808 at `2b2bf7bb`, introduced at `269dadb6`); teaches supersedes S054 with the corrected clause; S054 byte-identical at `2b2bf7bb`↔HEAD and carries the unsupported attribution; `omp-agent-root.md:1/44` and `round-44.md:32/64/175` cite S054 and match; used-by carry-over is the convention; raw sha256 pin matches.

## Findings by severity

**Finding 1 (INFO, new observation): live drift of the git-scm pages since the re-open fetches.** At 18:23Z the versioned `/2.56.0` page is 629 bytes, sha256 `5e3255549dfd04bd7ca599b2c7a69f1b2cbb5457333bd10ae204b26228a10f59`, etag `W/"6adb6526-275"`, last-modified 13:46Z — it no longer matches the S076/S092 pins (`c4cd4197…`, `W/"6ad8e07e-278"`), and the three nav URLs are now `http://git-scm.com/…` (was `https://`), which also breaks the gate quote verbatim (`:40` quotes `https://`). The unversioned page is now 64401 bytes, sha256 `ad7b52fb…` (was `d497ee1e…`), so the S063 pin is stale too. The *rulings* survive: the page is still a redirect wrapper to 2.49.0 with no manual text (teaches still true, flip still unmet). Effect: S076/S092/S063 anchor pins and the S092 gate quote are no longer live-verifiable; any future re-open of these rows must re-fetch and re-pin. Not a defect of the attempt-1 reports (their claims were true at fetch time; the drift is post-fetch, after the 11:52Z fetches and before 18:23Z) — but it is a new condition the L1 should know before close (row pins for git-scm will not re-verify on demand).

**Finding 2 (INFO): ReconcileS088's transcript citations are not re-verifiable here.** `history://KumitateR47.ReopenS088` and `history://KumitateR47.ReopenS084` are unknown to the history namespace in this session, so the transcript-derived quotes (final RESULT message verbatim; ReopenS084 "ends mid-verification with no final RESULT") were not directly confirmed. The observable evidence that the report does carry (dispatch, registry, committed report + hash, scratch file `w2-ReopenS088/sqlite.ts` exists with the exact sha256/437 lines/mtime, absence of S084/S091/S092 reports, single close commit, coherent chronology) is fully verified and independently sufficient for the (a) ruling. Residual gap only: the transcript rendering itself.

**Finding 3 (INFO): ReopenS091's anchor includes `buffer.html` and installed `getrlimit(2)`/`prlimit(1)`, which the re-open deliberately did not re-fetch.** The cli clause, the gate quote, tier, and supersede target are independent of them and are verified. The buffer/getrlimit part of the S091 anchor therefore remains un-restated by this item (as the report discloses). Not a defect — a scope note.

**Finding 4 (INFO): `SupersedeS047.md:3` records a 62-hex digest `3c540f69…e8b336ef5`.** The actual live-HTML digest is 64 hex `3c540f69dc6bc630c6496258524964ef0f7429f557a6bd328e5e5f2e8b336ef5` — the draft is missing `e5` at index 51, exactly as ReopenS084 describes ("matches that string with `e5` inserted at index 51"). The row and gate store only the pinned markdown digest (verified exact), so the error does not propagate. Confirmed as reported.

## Verdicts (rows that may land as re-opened)

- S084 re-opened: **yes** (HOLDS, no defect).
- S091 re-opened: **yes** (HOLDS, no defect).
- S092 re-opened: **yes** (HOLDS; note the new live drift of the pinned page — Finding 1).
- S088 re-opened: **yes** (ReconcileS088 HOLDS: seat completed + S088 HOLDS; the round-47 cancelled list should drop ReopenS088 → 15 cancelled, per that report's corrections, which are for the scribes/L1).

## Residual risk / verification gaps

- Live drift of git-scm pages (Finding 1) postdates the re-opens; the S092/S076/S063 pins are now stale against live content.
- Transcript rendering of the round-47 seats not directly readable in this session (Finding 2); rulable by the remaining evidence.
- S091's buffer.html/getrlimit/prlimit anchor parts not re-fetched (Finding 3); no impact on the assigned checks.
- S076's restored-row used-by at `2b2bf7bb` shows `round-45.md` (S092 at HEAD shows `round-45.md, round-46.md`); both paths exist and the difference is the round-46 lesson's later addition — benign, not pursued further.

No tools installed (official-channel rule respected; no installs were needed). Bounds respected: no git/jj writes; the only written file is this report (and the scratch fetches under `/fast/scratch/…/ReviewReopens48/`).
