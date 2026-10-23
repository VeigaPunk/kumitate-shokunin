RESULT CtlOffTopicRow rev=a2e5b54c verdict=meets script_caught=1/3 reading_caught=2/3

# CONTROL — off-topic real source, committed F1 procedure plus the K3 reading

Built three control rows in scratch from real pages, ran the committed procedure unmodified, then
applied K3's reading (quote under the row's stated section; teaches fits quote). Nothing committed;
the only lane file written is this one. Scratch `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlOffTopicRow/`.

Scripts run are byte-identical to the committed blobs: `sha256sum work/reopen-quote.sh work/normalize.py`
→ `41ffd87f…`, `87ba6408…` = `git -C lane show a2e5b54c:.ufo/waves/round-45/probe/*.txt | sha256sum`.

## Pages opened (curl only)

```
200 bytes=99050  sha256=008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f  https://git-scm.com/docs/git-worktree
200 bytes=830737 sha256=5a63888b1c15a172c75aad56899b8b53f6a706cac6c649392d327a2d9aa799c0  https://git-scm.com/docs/git-config
200 bytes=98696  sha256=ec9c7af936e36188d42c0eb7042dcc1c43e392f3e9e2011cf96e1e1141a14b59  https://git-scm.com/docs/git-worktree/2.54.0
```

The unversioned worktree body hash equals S062's pinned `008ed08f…`. The `/2.54.0` page marks itself
`Version 2.54.0` in the body yet still carries the footer `last updated in 2.56.0`, so the footer
cannot identify a version.

## The three rows and the committed procedure

(a) URL git-worktree, stated `§ REFS`, quote «Manage multiple working trees attached to the same
repository.» (9 words, real, § DESCRIPTION), teaches «refs are shared between worktrees».
(b) URL git-worktree, stated `§ CONFIGURATION FILE`, quote «core.worktree Set the path to the root of
the working tree.» (11 words, real, on git-config § CONFIGURATION FILE), teaches «a linked worktree
shares refs and repository configuration».
(c) URL git-worktree, stated `§ REFS`, quote «In general, all pseudo refs are per-worktree and all
refs starting with refs/ are shared.» (15 words, real, § REFS), teaches «every ref, including HEAD,
refs/bisect and refs/worktree, is shared between all worktrees».

```
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash ./reopen-quote.sh
FETCH CTL-A-wrongsection http=200 bytes=99050 sha256=008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f
REOPEN: FOUND   CTL-A-wrongsection   ctl(a)
REOPEN: MISSING  CTL-B-otherpage   ctl(b)
REOPEN: FOUND   CTL-C-overstated   ctl(c)
```

## K3 reading (section offsets from the page's own `<h2>` markers)

```
DESCRIPTION@50744 COMMANDS@54305 OPTIONS@64434 REFS@78735 CONFIGURATION FILE@81232 BUGS@97460
CTL-A quote -> raw offset 50879 -> DESCRIPTION            (stated REFS: locality fails; teaches unfounded)
CTL-B quote -> absent from cited URL; on git-config at CONFIGURATION FILE, offset 326426
CTL-C quote -> raw offset 79208 -> REFS                   (locality holds)
```

For (c) the same section continues «There are exceptions, however: refs inside refs/bisect,
refs/worktree and refs/rewritten are not shared.» and «Pseudo refs are ones like HEAD», so the teaches
contradicts the quote it rests on.

| row | committed script | K3 reading | bucket |
|---|---|---|---|
| (a) wrong section | FOUND (passes) | rejects: section + teaches | reading-only |
| (b) other page | MISSING (catches) | rejects: section | script |
| (c) teaches overstates | FOUND (passes) | rejects: teaches vs quote | reading-only |

Script caught 1/3, the reading caught the other 2/3, none escapes both. The one script catch is an
absence catch, not a topic-fit judgment — a real off-topic sentence on the cited URL passes by
construction, as the plan states.

## Extra probes that bound the answer

- (a2) «The worktree list command has two output formats.» (8 words) filed under `§ REFS`: script
  FOUND, reading rejects (it sits in § LIST OUTPUT FORMAT, offset 89453). The item's `git worktree
  list` sentence cannot also be a § DESCRIPTION sentence, so both shapes were run; both reading-only.
- (E) «Git is a member of Software Freedom Conservancy» (8 words) filed under `§ REFS` of the worktree
  URL: real and present in both pages (in § GIT of each). Script FOUND — a cross-page quote is
  invisible to a URL-level check when the text is shared boilerplate. Reading rejects.
- (D) **nothing catches this shape.** Row cites `https://git-scm.com/docs/git-worktree/2.54.0` (body
  says `Version 2.54.0`) while its label claims Git 2.56.0; quote «Multiple checkout in general is
  still experimental, and the support for submodules is incomplete.» (14 words) under § BUGS,
  byte-identical in both texts. Script FOUND, section FOUND, K3 reading passes: the version claim
  lives in the row label/locator and neither check reads it or the page's version marker.

## Defect in frozen K3 (needs an appended erratum)

K3 says normalization «strips « » and folds apostrophe variants before matching». The committed
procedure does neither: `grep -c '«\|»' normalize.py reopen-quote.sh` → `normalize.py:0`,
`reopen-quote.sh:0`; the quote side is only whitespace-collapsed. Observed false MISSINGs on real
quotes: CTL-F (body U+2019, quote typed U+0027) MISSING; CTL-G (real sentence kept in « ») MISSING.
Both reject correct rows, so they pass no defect, but a seat following K3 literally and a seat
running the script disagree.

## Smallest safe correction (tested in scratch, not applied)

Section locality is mechanical: `work/probe/reopen-quote-section.sh` adds one `rows.tsv` column (the
stated heading) plus a per-`<h2>` containment test.

```
REOPEN: WRONGSEC CTL-A-wrongsection  (actual=DESCRIPTION stated=REFS)
REOPEN: MISSING  CTL-B-otherpage
REOPEN: FOUND    CTL-C-overstated    # the teaches overstatement stays the reader's call
REOPEN: WRONGSEC CTL-E-footer        (actual=GIT stated=REFS)
```

For (D), add one reading duty: record the page's own version marker (`Version 2.54.0` vs
`Latest version`) and require it to match the row's claimed version. Impacted axes: coverage (C1's
F1/K3 evidence chain — URL-level presence leaves topic fit wholly to a reader) and operability (the
section and version checks are mechanical, ~40 lines, demonstrated above).

## Host hygiene

Every run under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL
900`, exit 0 each. `pgrep -af 'kumitate-r45/seats/a2-CtlOffTopicRow'` → exit 1. No git or jj write in
the lane or fleet repo, no sibling lane or operator config touched, no install needed (curl, python3
stdlib, coreutils). Scratch 54 MB.
