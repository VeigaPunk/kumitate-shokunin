VERDICT: The jj "Concurrency" page (docs.jj-vcs.dev/latest/technical/concurrency/, = v0.46.0) fetched cleanly and yields 8 verified single-occurrence quotes for S198, but it says nothing about stale workspaces and only one line about workspaces; host jj is 0.45.1, not the page's version (the page text is byte-identical to v0.45.1 raw docs).

## Evidence
- Fetch: `curl -sSL -A 'Mozilla/5.0 (kumitate-r64)' https://docs.jj-vcs.dev/latest/technical/concurrency/` -> `status=200 ctype=text/html; charset=UTF-8 size=48988` (no redirect; url_effective unchanged), fetched Sun 25 Oct 2026 22:43:37 GMT.
- Headers (build/K64ScoutConcurrencyOpen/capture/response-headers.txt): `etag: "b5edb601d478f3dc04090a15bb914a64-ssl"`, `cache-control: public,max-age=0,must-revalidate`, `server: Netlify`; NO Last-Modified header.
- Bytes: `jj-technical-concurrency.html` 48988 B, sha256 `5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6`; a second fetch gave the same sha256 (stable).
- Normalised text (frozen norm() from jj64-probe.mjs:56-63, copied verbatim in build/.../norm.mjs): 8602 chars. Word counts in it: "workspace" 1, "stale" 0, "shared" 0, "working copy" 2 + "working-copy" 1, "lock-free" 3, "divergent" 8, "operation log" 10.
- Page version: `https://docs.jj-vcs.dev/versions.json` -> `v0.46.0` has alias `latest`; `v0.45.1` is the previous release. Page generator: mkdocs-1.6.1, mkdocs-material-9.6.23.
- Host: `jj --version` -> `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`.
- Source markdown: `raw.githubusercontent.com/jj-vcs/jj/{v0.45.1,v0.46.0,main}/docs/technical/concurrency.md` all 7295 B, sha256 `7dcac7dda7fdcc900db3c59292bb7a5aba8836eab5741d4cf780535359d5f752` (cmp: identical 0.45.1 vs 0.46.0).
- Quote check (`node build/K64ScoutConcurrencyOpen/q.mjs` after `node norm.mjs <capture>`; indexOf count over norm text; heading present in norm text): each of the 8 quotes below -> `occurs=1 heading=true`, words <= 25 (counts 15,20,23,19,14,12,25,24).

## Findings
- K64ScoutConcurrencyOpen-1 (medium, coverage): The page has NO text on stale workspaces (grep "stale" = 0) and nothing on what workspaces share; "workspace" occurs once (quote 5, the view object holds a working-copy commit per workspace). Do not cite S198 for stale-workspace or shared-store claims; those stay with S067 (working-copy.md § Workspaces :74-118 incl. stale working copy). Repro: `grep -oi stale /tmp/kumitate-r64/K64ScoutConcurrencyOpen/norm.txt | wc -l` -> 0.
- K64ScoutConcurrencyOpen-2 (low): "latest" is v0.46.0 but host jj is 0.45.1; a row saying "(host jj 0.45.1)" like S066/S067 would be wrong for the URL. Because the markdown is byte-identical at v0.45.1 and v0.46.0, the row may truthfully say "page text identical at v0.45.1 and v0.46.0 (sha256 7dcac7dd…f752)". A /latest/ URL drifts; the row should also pin the capture sha256 (5e2f7576…0bf6, HTML) and ETag, or cite the versioned raw URL `…/v0.45.1/docs/technical/concurrency.md` as the pinnable form.
- K64ScoutConcurrencyOpen-3 (low): normalised heading text is "Syncing with rsync , NFS, Dropbox, etc" (space before comma from tag stripping) and the page's ¶ anchors become the entity "&para;" (not decoded by norm()); quote 3's heading must be written that way if a probe matches headings; quotes themselves are unaffected. Repro: `grep -o 'Syncing with rsync[^&]*' norm.txt`.
- K64ScoutConcurrencyOpen-4 (info): the page's "Syncing with rsync…" section warns of known bugs (Git backend not entirely lock-free, repo corruption possible, `jj debug reindex` recovery, colocated repos not well tested): relevant to seat containment but not quoted (length); add a 9th line only if the L1 wants it.
- Overlap vs S066/S067: adds. Existing rows cover git-compatibility.md (colocation) and working-copy.md (snapshots, ignores, workspaces); neither is concurrency.md. This page adds the operation log / view / divergent-operation merge model and the no-lock-file rationale; it repeats S067 only in the one fact that each workspace has its own working-copy commit. No `grep -n 'concurrency\|operation' corpus/SOURCES.md` row existed for jj before (rows 79-80 and S074 are the only jj rows seen).

## Ready-to-paste (each verified, 1 occurrence, quote text as normalised)
- S198 — "Unlike those DVCSs, Jujutsu treats concurrent edits the same whether they're made locally or remotely." (§ Introduction)
- S198 — "The working copy may mismatch what's supposed to be checked out, but no changes to the repo will be lost" (§ Syncing with rsync, NFS, Dropbox, etc)
- S198 — "The most important piece in the lock-free design is the "operation log". That is what allows us to detect and merge divergent operations." (§ Operation log)
- S198 — "The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace." (§ Operation log)
- S198 — "The operation log is normally linear. It becomes non-linear if there are divergent operations." (§ Operation log)
- S198 — "When a command starts, it loads the repo at the latest operation." (§ Operation log)
- S198 — "If Jujutsu tries to load the repo and finds multiple heads in the operation log, it will do a 3-way merge of the view objects" (§ Merging divergent operations)
- S198 — "The operation objects and view objects are stored in content-addressed storage just like Git commits are. That makes them safe to write without locking." (§ Storage)

Suggested row facts: `https://docs.jj-vcs.dev/latest/technical/concurrency/ | docs | A | jj operation log and lock-free concurrency (page = v0.46.0, markdown identical to v0.45.1; host jj 0.45.1) | HTML sha256 5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6, 48988 B, ETag "b5edb601d478f3dc04090a15bb914a64-ssl", no Last-Modified; fetched 2026-10-25 (seat K64ScoutConcurrencyOpen)`.

## Artifacts
- .ufo/waves/round-64/build/K64ScoutConcurrencyOpen/capture/jj-technical-concurrency.html (exact bytes)
- .ufo/waves/round-64/build/K64ScoutConcurrencyOpen/capture/response-headers.txt
- .ufo/waves/round-64/build/K64ScoutConcurrencyOpen/norm.mjs, q.mjs (normaliser copy + quote checker)
- scratch: /tmp/kumitate-r64/K64ScoutConcurrencyOpen/ (norm.txt, v0451-conc.md, v0460-conc.md, latest-raw.md)

## Limits
- Did not run the frozen counter jj64-probe.mjs (no entry/row exists yet). Did not check the page against S198's eventual entry bullets. Did not fetch other versions' rendered HTML; the v0.46.0==v0.45.1 identity is of the markdown source only. Did not read S066/S067 bodies beyond their SOURCES.md rows. No tool installed.
