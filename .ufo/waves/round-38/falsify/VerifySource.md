ATTACK VerifySource measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf quote=verbatim words=23 census_exit=0

## Findings by severity

- None. The S033 citation is accurate for its stated file-URL claim; the lesson and row explicitly identify applying that stability argument to line anchors as inference.

## Evidence

- Reopened https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files; the page says branch-head file content may change and a commit ID links to the exact version. It separately links to code-snippet permalinks.
- Frozen lesson `corpus/lessons/round-38.md` at c938 quotes: “so if you were to copy the normal URL, the file contents might not be the same when someone looks at it later.” Exact wording; 23 whitespace-delimited words.
- Lesson §S033 says the page states the claim for file URLs and applying it to line anchors is an inference. Frozen `corpus/SOURCES.md` S033 likewise states that distinction in `teaches`; its scope describes the lane's line-anchor application, not a quoted line-anchor guarantee.
- `git diff --no-ext-diff --unified=2 e18ff1af3392e3823227644c977c237737fe65c9 c938c068f4dbf356c0884c2121bbfe087fbe3caf -- corpus/SOURCES.md` → 1 file changed, 1 insertion(+), 0 deletions(-); the only added registry row is S033. Existing rows were not edited.
- S033 is `mined`; its `used-by` is `corpus/lessons/round-38.md`.
- Command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → `kumitate\tok\t/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`; exit 0.
- Scratch source check: clone `/fast/scratch/kumitate-r38-falsify/CloseKumitate37.VerifySource` was checked out at c938; command `node /fast/scratch/kumitate-r38-falsify/CloseKumitate37.VerifySource/scripts/sources-check.mjs --self /fast/scratch/kumitate-r38-falsify/CloseKumitate37.VerifySource --today 2026-10-21 --json` → `{"schema":"kumitate-sources-v1","verdict":"CLEAN","exitCode":0,"findings":[],"totals":{"errors":0,"warnings":0},"counts":{"rows":33,"tiers":{"A":32,"B":1,"C":0},"status":{"queued":14,"mined":17,"rejected":2},"entriesWithSource":3,"legacy":38},"info":{"legacyEntriesWithoutHeader":38}}`; exit 0.
- The census/source checker establishes registry validity and that the used-by target resolves; it does not prove the prose's semantic inference. No install or production-file edits were made.

## Residual risk

- The line-anchor stability claim remains an acknowledged inference from commit-specific file permalinks; the lesson does not present it as the source's direct statement.

## Verification gaps

- None for this scoped source/registry review.