SOURCE-GITREV anchor="--verify" words=11

# ScoutSourceGitRev — `git rev-parse HEAD` revision/verify semantics

Access date: **2026-10-21**. Lane repo: /home/vgpnk/Projects/shokunin/kumitate-shokunin (read-only seat; no lane edits).
**Revision scored:** `31c465f15669f744848bd9f5d56191c5085670f7` (`src-rev=31c465f1`), the HEAD of `/fast/scratch/kumitate-r36/src`; observed 2026-10-21, 40 hex chars, detached (`git symbolic-ref -q HEAD` → rc=1), clone dirs mode 555 (`dr-xr-xr-x`).

## URL

https://git-scm.com/docs/git-rev-parse

Served page: HTTP 200, `final=%{url_effective}` equals the request (no redirect). Version banner in page: "git-rev-parse last updated in **2.56.0**" (dated 2026-09-28), matching host `git version 2.56.0`. Version-pinned twin: https://git-scm.com/docs/git-rev-parse/2.56.0.

## Exact section

Section path: **OPTIONS → Options for Output → `--verify`**.

Served HTML (ids are verbatim):

```html
<h3 id="_options_for_output"><a class="anchor" href="#_options_for_output"></a>Options for Output</h3>
<dt class="hdlist1" id="Documentation/git-rev-parse.txt---verify"><a class="anchor" href="#Documentation/git-rev-parse.txt---verify"></a>--verify </dt>
```

Fragment URL: https://git-scm.com/docs/git-rev-parse#Documentation/git-rev-parse.txt---verify

Companion section that defines the revision spelling `HEAD` resolves through: H2 **SPECIFYING REVISIONS** (`id="_specifying_revisions"`), which defines `<sha1>` as a full object name or "a leading substring that is unique within the repository".

## Verbatim quote (11 words, <=25)

> If so, emit it to the standard output; otherwise, error out.

Confirmed against served HTML: `…that can be used to access the object database. If so, emit it to the standard output; otherwise, error out.</p>`.

Supporting clause from the same `<dd>` (19 words, also verbatim, fragment of the preceding sentence):

> that it can be turned into a raw 20-byte SHA-1 that can be used to access the object database

Non-repo sentence from H2 **DESCRIPTION** (verbatim, cited but not the gated quote): "Unless otherwise specified, most of the options and operation modes require you to run this command inside a git repository or a working tree that is under the control of a git repository, and will give you a fatal error otherwise."

## Observed behaviour of `git rev-parse HEAD` (git 2.56.0, 2026-10-21)

| probe | stdout | stderr | rc |
|---|---|---|---|
| `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` | `31c465f15669f744848bd9f5d56191c5085670f7` (40 hex, no prefix) | — | 0 |
| `git -C <clone> rev-parse --verify 'HEAD^{commit}'` | same 40 hex | — | 0 |
| `cd /tmp/notrepo-probe && git rev-parse HEAD` (dir exists, not a repo) | **empty** | `fatal: not a git repository (or any parent up to mount point /)` | 128 |
| `cd /tmp/revprobe && git rev-parse HEAD` (`git init`, zero commits) | **literal `HEAD`** | `fatal: ambiguous argument 'HEAD': unknown revision or path not in the working tree.` | 128 |
| `env PATH= git rev-parse HEAD` (git absent) | empty | `env: 'git': No such file or directory` | 127 |

The numeric codes are observation, not documented in this page; the doc only promises "emit … / otherwise, error out" and "a fatal error otherwise" outside a repository.

## What it teaches PIN v1

1. **Success contract is exact-string.** `rev-parse HEAD` prints only the full object name (SPECIFYING REVISIONS: "The full SHA-1 object name (40-byte hexadecimal string), or a leading substring that is unique within the repository."), one line, rc 0. PIN v1 should compare `stdout.trim()` to the pin's **full** `revision`, not a prefix — the doc explicitly blesses unique abbreviations, so a 12-hex compare would also "verify" a different object whose prefix collides, and the verdict already renders `src-rev=<first 12 hex>` from the verified full output.
2. **Unverifiable must be decided by exit status, never by stdout content.** A non-repo exits 128 with stdout **empty**; a naive `stdout.trim() === revision` check would classify that as `SRC_REV_MISMATCH` instead of `SRC_REV_UNVERIFIABLE`. Run the process, and on nonzero status / spawn error (`git` absent → 127/ENOENT) emit `SRC_REV_UNVERIFIABLE` before ever formatting a verdict from stdout.
3. **`rev-parse` conflates failure classes**: an initialized repo with no commits prints the literal token `HEAD` **and** exits 128. So even the "no repo" branch cannot assume stdout is empty on failure. Guard the success path with a shape test (`/^[0-9a-f]{40}$/`) before slicing `src-rev=`, or the line can read `src-rev=HEAD`; a shape-only check without the rc check would still emit a bogus revision. Order: rc → shape → equality.
4. **`--verify` is the tightening lever, not the default.** The `--verify` dd documents "exactly one parameter", raw object-name emission, error otherwise, and `--quiet` for silent nonzero — and `^{commit}` peeling proves HEAD names an existing commit. PIN v1's frozen probe (`rev-parse HEAD`) is the correct primitive for "which revision is checked out" and needs no repo predicate, but it does not peel; if upstream HEAD were ever a tag or non-commit the gate should switch to `rev-parse --verify 'HEAD^{commit}'` (observed identical output, rc 0). The lane already uses that idiom at `scripts/cite-check.mjs:1147` and a repo predicate at `scripts/round-gate.mjs:219` (`rev-parse --is-inside-work-tree`), so PIN v1 has house precedent for both without new invention.
5. **SHA-1 assumption is embedded.** "raw 20-byte SHA-1" / "40-byte hexadecimal string" (the page is internally loose about 40-byte vs 20-byte) means the pin's 40-hex equality is valid only for SHA-1 object-format repositories. A SHA-256 clone prints 64 hex and would read as permanent `SRC_REV_MISMATCH`; the pinned upstream is SHA-1 (observed 40 hex), so the pin file is correct today but the contract inherits the SHA-1 assumption.
6. **The query is write-free enough for a chmod a-w tree**: the clone's dirs are mode 555 and `rev-parse HEAD` returned rc 0 there, so resolving the pin needs no write inside `<src>`. [INFERENCE] This does not by itself prove no lockfile/index side-writes on every path (no full mtime census taken) — the surface-probe dispatcher fix remains the place that must prove tree immutability.

## Commands run

```
curl -sS https://git-scm.com/docs/git-rev-parse | grep -oE '<h[1-4][^>]*>.{0,80}'
curl -sS … | grep -o 'id="[^"]*verify[^"]*"'                              # Documentation/git-rev-parse.txt---verify
curl -sS … | grep -o '.\{0,100\}Documentation/git-rev-parse.txt---verify.\{0,200\}'
curl -sS … | tr '\n' ' ' | grep -o '.\{0,260\}emit it to the standard output.\{0,160\}'
curl -sS … | grep -o 'The full SHA-1 object name (40-byte.\{0,140\}'
curl -sS -o /dev/null -w 'http=%{http_code} final=%{url_effective}\n' <url>   # 200, no redirect
python3 - <<'PY'  # word counts: 11 / 19 / 18
git -C /fast/scratch/kumitate-r36/src rev-parse HEAD; echo rc=$?               # 40 hex, rc 0
git -C … rev-parse --verify 'HEAD^{commit}'; git -C … symbolic-ref -q HEAD      # rc 0 / rc 1 (detached)
cd /tmp/notrepo-probe && git rev-parse HEAD                                    # stdout empty, rc 128
cd /tmp/revprobe && git rev-parse HEAD                                         # stdout "HEAD", rc 128
env PATH= git rev-parse HEAD                                                   # rc 127
stat -c '%A %a %n' /fast/scratch/kumitate-r36/src /fast/scratch/kumitate-r36/src/.git
```

No tools installed or upgraded; no lane files, jj state, or Git index touched; probe dirs live only under /tmp.

## Remaining unknowns

- Exit code 128 for non-repo / unresolved HEAD is observed on git 2.56.0 but is not documented on this page; treat it as "nonzero", not as a contract.
- SHA-256-clone behaviour untested (no such repo available); statement 5 is doc-derived plus [INFERENCE] on output shape.
- SOURCES row intentionally not added (item scope): the scribe should cite `--verify` under `Options for Output`, fragment `#Documentation/git-rev-parse.txt---verify`, anchor `--verify`, opened 2026-10-21.
