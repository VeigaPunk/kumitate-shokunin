RESULT ReopenS027 rev=a2e5b54c verdict=confirmed quotes_found=0/0

Re-derived the inherited candidate SOURCES row S027 from fresh fetches on 2026-10-23 (seat KumitateR45A2.ReopenS027; scratch /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS027/). No tool installs; ordinary curl + git show (read-only) only.

Inherited row (UNTRUSTED, attempt 1, inherited-rows.md, identical to the uncommitted working copy of corpus/SOURCES.md): source = git v2.55.0 release notes at the GitHub blob URL https://github.com/git/git/blob/v2.55.0/Documentation/RelNotes/2.55.0.adoc; kind docs; tier A; anchor = § UI, Workflows & Features, bullet at lines 38-39; tag v2.55.0 (host git 2.56.0); teaches = .git/info/exclude is shared by every worktree linked to one repository; the v2.55.0 git-worktree page does not say so; status flipped queued->mined with used-by corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md.
Base state: `git show a2e5b54c:corpus/SOURCES.md` line 40 has S027 `queued`, used-by `—`, same kind/tier/anchor/teaches. So the flip is attempt 1's uncommitted edit; this seat re-derives the row's content only. Seat reports behind the row: CtlQuoteFabricated.md (quote re-open receipts), CritRoundShape.md O4 and ReviewPlan.md:78 (base = queued, used-by —).

FETCHES (curl -sS -L; redirects followed)
1. Row URL (GitHub blob): HTTP 200, final URL unchanged, 408069 bytes, body sha256 0adf4208d5615bf1847ce16373449d3db01a531677dd42a3de911ca7055ce29b.
2. Raw bytes at tag v2.55.0, https://raw.githubusercontent.com/git/git/v2.55.0/Documentation/RelNotes/2.55.0.adoc: HTTP 200, 20770 bytes, sha256 14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4. Version the text belongs to: git 2.55.0 release notes at tag v2.55.0 (file line 1 "Git v2.55 Release Notes").
3. Documentation/git-worktree.adoc at v2.55.0: HTTP 200, 21886 bytes, sha256 9dffe46a7cb20420ea638a59b0c8e103ea0a783c4900f68258343c05ff411c9c (git-worktree.txt at the tag: HTTP 404 — docs are .adoc at 2.55.0).
4. https://git-scm.com/docs/git-worktree/2.55.0: HTTP 200, final URL unchanged (trailing slash), 608 bytes, sha256 cc023ab1055471947fe2bc85ef8b1861723a141c378607d024fc38211210dca5; body is a canonical/meta-refresh redirect stub to https://git-scm.com/docs/git-worktree/2.54.0 (the drift S014 already records).

CHECK 1 — locator exists and says what teaches/gloss claims: CONFIRMED
- notes.adoc lines 4-5 carry the section header "UI, Workflows & Features"; lines 38-39 hold the bullet exactly:
  38: ` * Document the fact that .git/info/exclude is shared across worktrees`
  39: `   linked to the same repository.`
  Verbatim quote (14 words; `printf '%s' … | wc -w` = 14): «Document the fact that .git/info/exclude is shared across worktrees linked to the same repository.» (locator: § UI, Workflows & Features, lines 38-39, tag v2.55.0; body sha256 14b333ba…).
- teaches (".git/info/exclude is shared by every worktree linked to one repository") is a faithful paraphrase of that bullet, not a claimed verbatim string; the verbatim form is also the round-35 lesson quote (corpus/lessons/round-35.md:61) and re-opens byte-for-byte in my fetch.
- Gloss "the v2.55.0 git-worktree page does not say so": CONFIRMED. Grep `exclude` over Documentation/git-worktree.adoc@v2.55.0: zero matches, while the same file discusses shared refs ("some refs are shared between all worktrees", line 299) and shared config ("the repository `config` file is shared across all worktrees", line 328). The git-scm.com/2.55.0 URL serves 2.54.0 text anyway (item 4), also without the note.

CHECK 2 — verbatim quotes the inherited entry draft attributes to S027: 0/0 (none exist); the paraphrased claim is confirmed
- Grep `S027` over inherited-entry-draft.md: hits only at line 1 (the `source:` header citation) and line 73: "including `info/exclude` and `hooks/` (S027: exclude is shared across linked worktrees)." — a parenthetical paraphrase, not a «» verbatim quote. The adjacent verbatim quotes belong to S063 (line 72) and S068 (lines 74-75). Grep `exclude|2\.55|RelNotes` surfaces only demo prose (lines 76-81) and the M4 table row (cites S062, S063, DemoWorktreeShared — not S027).
- So there is no S027 quote to find in the draft (quotes_found 0/0); the paraphrased claim itself re-derives as TRUE from the fetched bullet, and the corpus's prior verbatim quote (round-35 lesson) is present in both the raw bytes (lines 38-39) and the blob-page payload.

CHECK 3 — pinned sha256: N/A, with a stability note
- The row pins no body sha256. Note: the blob URL is byte-unstable per request — my blob fetch sha256 0adf4208… (408069 B) differs from CtlQuoteFabricated's recorded blob fetches (4eaa7ea5… 408077 B; also 57d1cb6b…/697ff70e…/d998b780…); the quote re-opened FOUND in every fetch including mine. The raw URL is byte-stable: my sha256 14b333ba… equals attempt 1's recorded raw sha256 exactly. CtlQuoteFabricated's recommendation stands: any future hash pin for this row must pin the raw URL, never the blob page.

CHECK 4 — kind/tier per QUALITY.md Q2: CONFIRMED
- QUALITY.md Q2 (lines 18-19): tier C is never sole support; community is never tier A. The source is git's own release notes in the canonical github.com/git/git repository at a release tag — primary/official upstream documentation — so tier A is correct and kind docs fits. Same kind/tier as the already-accepted base row (created round 35).

CHECK 5 — rejection reason: N/A — the row is not rejected (base `queued`; proposed `mined`).

Corrections: none. The inherited row text is accurate as far as it goes and every checkable claim re-derived CONFIRMED. Optional hardening, not required: add the raw URL and its sha256 beside the blob URL in the anchor for receipt stability.

Residual risk / verification gaps
- I verified the tagged 2.55.0 doc text (what the versioned page should render), not a rendered live page; the row's recheck=on-release already fires for git 2.56.0, so the L1 should re-open the matching source at the new tag when touching versions (noted: in 2.55.0 the info/exclude note lives in the gitignore docs, not gitworktree).
- Blob-page receipts are non-regenerable (per-request nonce); only raw-URL hashes are.
- Cleanup: no stray processes (pgrep clean); scratch receipts kept small (notes.adoc 20770 B, wt.adoc 21886 B, base-SOURCES.md 45538 B); 408 KB blob page and redirect stub deleted.
