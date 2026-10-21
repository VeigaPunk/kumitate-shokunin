ATTACK S027 verdict=holds defects=0

Target: `corpus/SOURCES.md:40` (row S027), quote also at `corpus/lessons/round-35.md:57`.
Contract: `/home/vgpnk/Projects/shokunin/CORPUS.md:64-175` (contract v1).
Scratch: `/fast/scratch/kumitate-r35/w/KumitateR35.SrcS027Reopen/` (fetches + empirical repo).
No installs, no package transactions; no lane-tree writes except this report.

## Cell-by-cell

| cell | value | check |
|---|---|---|
| id | `S027` | matches `^S[0-9]{3,}$`; absent at base (`git show master:corpus/SOURCES.md \| grep -n S027` → no output) ⇒ new row, append-only N/A; unique (dup-id census prints nothing) |
| source | title — URL | `curl -o /dev/null -w '%{http_code}' -L <blob URL>` → `200`; tag `v2.55.0` exists (annotated, tagger Junio C Hamano `2026-06-29T14:59:19Z`, peeled `e9019fca…` "Git 2.55") |
| kind | `docs` | in enum (release notes are prose docs, not `spec`) |
| tier | `A` | official maintainer release notes; `kind=docs`, so no tier-inflation (`community`-A) hit |
| scope | "git 2.55.0 worktree-relevant release items" | names topic + revision |
| anchor | "§ UI, Workflows & Features, bullet at lines 38-39; tag v2.55.0 (host git 2.56.0)" | headings by `grep -n -B1 '^-----' relnotes.adoc`: line 4 `UI, Workflows & Features`, line 82 `Performance, …`, line 236 `Fixes since v2.54` ⇒ bullet is inside the named section; `git --version` → `git version 2.56.0` |
| teaches | shared-exclude fact + worktree-page negative | both clauses re-tested below; primary is the verbatim quote |
| status | `queued` | no `corpus/knowledge/*`, no `## Paths` sequence and no lesson cites S027 (`grep -rn S027` shows only `SOURCES.md:40,118,134`, `lessons/round-35.md:57`) ⇒ not `mined`; `used-by —` correct |
| opened | `2026-10-20` | local `date +%F` → `2026-10-20` (author TZ; see R3) |
| recheck | `on-release` | allowed cadence |
| used-by | `—` | consistent with `queued` |
| columns | 13 fields, no `\|` in cells | `awk -F'\|'` on the row → `NF=13` |

Registry gate: `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,rejected:2 entries_with_source=2 legacy=38)`; manual census → `28`, `malformed=0`, no duplicate ids, no tier/status/kind violation.

## Quote and location (re-fetched at the tag)

```
curl -sSfL https://raw.githubusercontent.com/git/git/v2.55.0/Documentation/RelNotes/2.55.0.adoc
→ 460 lines, sha256 14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4
sed -n '38,39p'
 * Document the fact that .git/info/exclude is shared across worktrees
   linked to the same repository.
```

Joined with a single space that is byte-identical to the row's teaches and to
`lessons/round-35.md:57` between «» (only a trailing newline differs, from `sed`).
Word count `wc -w` → `14` (limit 25). Location "lines 38-39" is exact; the section
is exact. Gate line carries URL + `2026-10-20` + quote + location ⇒ rule 1 met.

## Negative clause — "the v2.55.0 git-worktree page does not say so"

```
curl -sSfL .../v2.55.0/Documentation/git-worktree.adoc → 546 lines
grep -n -i -E 'exclude|ignore' worktree.adoc → no match (rc=1)
curl -sSfL .../v2.54.0/Documentation/git-worktree.adoc | grep -c -i exclude → 0
git-scm.com/docs/git-worktree/2.55.0 → HTTP 301; -L lands on a 608-byte redirect
page to git-worktree/2.54.0; grep -c -i 'info/exclude' → 0
```
Holds under both readings of "page" (.adoc at tag; published git-scm path, which
redirects to 2.54.0 — itself silent). Includes pulled by the page
(`includes/cmd-config-section-all.adoc`, `config/worktree.adoc`) also contain no
"exclude" (both `grep -c` → 0).

## Fact clause — empirically re-tested (host git 2.56.0)

```
git init main; commit; git worktree add ../wt
printf 'ignored.txt\n' > main/.git/info/exclude
git -C ../wt status --porcelain           → ?? tracked.txt   (ignored.txt absent)
git -C ../wt check-ignore -v ignored.txt  → main/.git/info/exclude:1:ignored.txt  ignored.txt
git -C ../wt rev-parse --git-path info/exclude → main/.git/info/exclude
```
The linked worktree consumes the main repository's exclude file. Corroboration:
`gitignore.adoc` v2.54.0→v2.55.0 changes `$GIT_DIR/info/exclude` →
`$GIT_COMMON_DIR/info/exclude` at lines 10, 37, 53, 100, 149-150 — the doc patch
the release-note bullet describes. No contradiction found.

## Residuals (not counted as defects)

- **R1 — negative clause has no `## Search log` line.** Rule 5 ("a negative claim
  carries its sweep") is satisfied only in
  `.ufo/waves/round-35/build/ScribeSrcGitRelnotes.md` §Commands run 5 ("scope: that
  one page at tag v2.55.0 only"), which the Gate cites wholesale
  (`corpus/lessons/round-35.md:46-47`); `corpus/SOURCES.md` round-35 Search-log
  paragraph counts 8 identified / 8 screened and omits this seventh fetch. The
  clause is true; only its contract's designated location is thin. Minimal fix if
  wanted: append to that paragraph "One scope-limited negative check:
  `Documentation/git-worktree.adoc` at v2.55.0 — 1 fetched, 0 matched `exclude`."
  **[INFERENCE]** a reviewer may or may not score this under rule 5.
- **R2 — stale cross-row host version (out of target).** `corpus/SOURCES.md:27`
  (S014) still says "(host git 2.55.0)"; host is 2.56.0, so S027's parenthetical is
  the accurate one. S014's anchor cannot be edited in place under rule 2; the
  contract-legal correction is a superseding row. `sources-check.mjs` does not
  detect host-version drift. Flag to L1 only.
- **R3 — clock.** `date -u +%F` → `2026-10-21`, `date +%F` → `2026-10-20`; the row's
  `opened` matches the author's local date and the session date (S021's commit
  stamp is `-0300`). The contract fixes no timezone, so `2026-10-20` is correct as
  written; the scribe's unresolved-clock note is evidence, not a row defect.

## Unobserved

- Git 2.55.0 itself was not run (host is 2.56.0; no packages installed). The fact
  clause was verified on 2.56.0 and by the v2.54→v2.55 doc diff; **[INFERENCE]**
  that 2.55.0 behaviour is identical, supported by the bullet's "Document the
  fact" phrasing (documentation-only change).
