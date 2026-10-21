SOURCE_ROW status=queued tier=A quote_words=14

# Round 35 build — ScribeSrcGitRelnotes (frontier step: git 2.55.0 release notes)

Lane: kumitate-shokunin (orchestration & tooling). Judged on: coverage. Registry not edited; this report is the draft row.

## Draft registry row (for the integration owner to append; id is the S0NN placeholder)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0NN | git v2.55.0 release notes, Documentation/RelNotes/2.55.0.adoc — https://github.com/git/git/blob/v2.55.0/Documentation/RelNotes/2.55.0.adoc | docs | A | git 2.55.0 worktree-relevant release items: linked-worktree exclude sharing | § UI, Workflows & Features, bullet at line 38; tag v2.55.0, file sha256 14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4 | Git 2.55.0 documents that .git/info/exclude is shared by every worktree linked to one repository; the v2.55.0 git-worktree page does not mention it, so this release note is the only primary statement found | queued | 2026-10-20 | on-release | — |

Next unused numeric id per the registry as read: S021 (S001–S020 present). Placeholder kept as requested.

## Access and quote

- URL fetched: https://raw.githubusercontent.com/git/git/v2.55.0/Documentation/RelNotes/2.55.0.adoc (canonical blob URL above).
- Access date: 2026-10-20 (per the assignment's date; see clock note below).
- Quote (14 words), location `2.55.0.adoc` § "UI, Workflows & Features" (heading at line 4–5), bullet at lines 38–39:
  "Document the fact that .git/info/exclude is shared across worktrees linked to the same repository."
- Verified: `grep -n 'exclude is shared' 2.55.0.adoc` → `38: * Document the fact that .git/info/exclude is shared across worktrees`.

## Commands run and output

1. `curl -sS -o 2.55.0.adoc https://raw.githubusercontent.com/git/git/v2.55.0/Documentation/RelNotes/2.55.0.adoc` → HTTP 200; `wc -l` → 460 lines.
2. `grep -n -i 'worktree' 2.55.0.adoc` → lines 38, 358, 439.
3. `grep -n -B1 '^-----' 2.55.0.adoc` → section headings: line 4 "UI, Workflows & Features"; line 82 "Performance, Internal Implementation, Development Support etc."; line 236 "Fixes since v2.54".
4. `sha256sum 2.55.0.adoc` → 14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4.
5. Negative sweep (for the "only primary statement" claim): `curl -sS https://raw.githubusercontent.com/git/git/v2.55.0/Documentation/git-worktree.adoc | grep -n -i exclude` → no output (file itself returns HTTP 200). Scope of the sweep: that one page at tag v2.55.0 only.
6. `date -u +%F` → 2026-10-21 (host UTC clock). The assignment and session date say 2026-10-20; the row uses 2026-10-20 as instructed. [observed, unresolved clock disagreement — flagged, not reconciled]
7. `git --version` → git version 2.56.0. The S014 row says "host git 2.55.0"; the host now reports 2.56.0. [observed; S014 is not edited here]

## Other worktree-relevant items considered (not drafted; one row requested)

- Line 358 (in "Fixes since v2.54", merge 44d04e4426): the GIT_WORK_TREE variable prepared for the push-to-checkout hook leaked into the environment when no hook ran, breaking push-to-deploy. Candidate for a second row on worktree environment isolation; not drafted per "ONE row".
- Line 439 (merge 8547908eb3 pw/rename-to-get-current-worktree): listed only under "Other code cleanup"; no description in the notes. Not teachable from the notes alone; excluded.

## Gate notes for the integration owner

- Row is a claim: URL, access date and quote above ground `teaches`. Non-author verification can re-run command 1 and the `grep -n 'exclude is shared'` line.
- Tier A scoped to the release-note statement only (maintainer-authored release notes for the tagged version). It does not extend to git-worktree behaviour generally.
- Admission of any knowledge entry citing this row is out of scope here (QUALITY.md governs).
- The S014 Leads bullet "git 2.55.0 release notes … not opened" is now resolved by this row once appended; the lead itself is not edited here.

## Out of scope / not done

- No registry edit, no knowledge/ or lessons/ entry, no other lanes or repos touched.
- No installs or updates performed.
