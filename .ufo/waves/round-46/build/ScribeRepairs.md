RESULT ScribeRepairs rev=516977af verdict=drafted s073=overstates leftover_count=46

## Scope and gates
- Frozen lane tip from the round-46 plan: `516977af2216b1cc426ee970d260dee53714bf4f`; opened `.ufo/waves/round-46/plan.md` first. This item drafts repairs only.
- Read-only surfaces inspected: `.ufo/waves/round-45/plan.md`, `corpus/SOURCES.md`, `corpus/README.md`, `corpus/lessons/round-45-verifier-spotcheck.md`; reopened the named external locators below.
- Exact leftover-count command: `/usr/bin/find /fast/scratch/hyaku/kumitate-r45/a3/untracked-snapshot -type f | wc -l` → `46`.
- No C1/C2 frozen counter, gate, selftest, build, or test was run. This is not execution evidence or a gate verdict. No tools installed or updated.
- Only intended lane write: this report. No plan, SOURCES, README, judge, or product-code file was changed.

## D1 — append-only plan erratum draft
OLD (preserve; `.ufo/waves/round-45/plan.md:93-94`):
```text
Written 2026-10-23 ~05:20Z from `build/CritRoundShape.md` (11 objections). No data run judges C1; the entry is not
yet drafted, so nothing here changes a judged object.
```
OLD count paragraph (preserve as historical text; `:212-215`):
```text
Attempt-2 leftovers in the lane at 06:42Z (45 untracked files: attempt-1 `build/*` reports and specs,
`open/checklist-pass.txt`, and `a2-control/VerifyCritCensusVsDomain.md`, a report that arrived after `31656bdf`) are
untrusted scratch: copied byte-exact to `/fast/scratch/hyaku/kumitate-r45/a3/untracked-snapshot/` and removed from the
lane; none is cited.
```
NEW (append after existing plan content; do not rewrite the old paragraphs):
```markdown
## Erratum — E1–E6 receipt provenance and leftover count (appended in round 46)

The `build/CritRoundShape.md` citation above points to an uncommitted attempt-1 receipt that cannot be resolved in the committed record. E1–E6 therefore rest on an uncommitted, unresolvable receipt; this erratum does not independently validate or retract their contents. Preserve the original text as history; this note corrects its provenance status.

The `45 untracked files` count at :212 is corrected to 46 files in the copied `a3/untracked-snapshot`. Verified: `/usr/bin/find /fast/scratch/hyaku/kumitate-r45/a3/untracked-snapshot -type f | wc -l` → `46`.
```

## D3 — S076 teach-cell replacement
Reopened `https://git-scm.com/docs/gitrepository-layout/2.56.0` with:
```sh
curl -sS -L --max-redirs 5 -D /tmp/scribe-r46-s076-headers -o /tmp/scribe-r46-s076-body -w 'http_code=%{http_code}\nsize_download=%{size_download}\nurl_effective=%{url_effective}\n' 'https://git-scm.com/docs/gitrepository-layout/2.56.0' && printf 'canonical=' && grep -i '^link:.*rel="canonical"' /tmp/scribe-r46-s076-headers | tr -d '\r' && printf 'sha256=' && sha256sum /tmp/scribe-r46-s076-body && printf 'body=' && cat /tmp/scribe-r46-s076-body
```
Observed: `http_code=200`; `size_download=632`; effective URL `https://git-scm.com/docs/gitrepository-layout/2.56.0/`; the HTTP-header canonical lookup was empty, and the HTML body canonical link points to `https://git-scm.com/docs/gitrepository-layout/2.49.0`; body SHA-256 `c4cd41972b3b752ac40ac145f98c7e7a887d086dd03c362a3c4a9951e2d79ca5`. The body is a redirect wrapper, not manual text.

OLD S076 teach cell (`corpus/SOURCES.md:89`):
```text
REJECTED: the versioned 2.56.0 URL is a redirect to 2.49.0 text, not manual text for the host version; S063 (the unversioned page whose history covers 2.56.0) is used instead. flip: a versioned 2.56.0 page serves the manual text
```
NEW S076 teach cell:
```text
REJECTED: redirect wrapper, no manual text; S063 (the unversioned page whose history covers 2.56.0) is used instead. flip: a versioned 2.56.0 page serves the manual text
```

## S073 — Node locator comparison
At the requested lane revision, the current S073 teach cell (`corpus/SOURCES.md:86`) is exactly these three adjacent segments, joined with spaces (each quote kept within 25 words):
```text
“--max-old-space-size sets the size of V8's old memory section only;”
“(the claim that Buffer memory lies outside it is not in this source: withdrawn round 45 a3, XChanS073; see S077);”
“RLIMIT_AS limits virtual address space per process (brk/mmap fail with ENOMEM) and is inherited by children”
```
Reopened both Node.js v24.21.0 locators by bounded `curl` downloads (each `--max-filesize 5242880`):
```sh
curl -sS -L --max-filesize 5242880 -o /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeRepairs/node-cli.html -w 'cli_http=%{http_code} size=%{size_download} url=%{url_effective}\n' 'https://nodejs.org/docs/v24.21.0/api/cli.html' && wc -c /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeRepairs/node-cli.html && sha256sum /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeRepairs/node-cli.html && curl -sS -L --max-filesize 5242880 -o /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeRepairs/node-buffer.html -w 'buffer_http=%{http_code} size=%{size_download} url=%{url_effective}\n' 'https://nodejs.org/docs/v24.21.0/api/buffer.html' && wc -c /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeRepairs/node-buffer.html && sha256sum /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeRepairs/node-buffer.html
```
Observed CLI: HTTP 200, 278644 bytes, canonical `https://nodejs.org/api/cli.html`, SHA-256 `7302f93cda9694927010d4171e181e8a7617a8852242d70f005f1ea65365538c`. At `cli.html:4148-4150`, the locator says: “Sets the max memory size of V8's old memory section.” (10 words). Observed Buffer: HTTP 200, 503390 bytes, canonical `https://nodejs.org/api/buffer.html`, SHA-256 `5c9f23a729a68d4ec02fd113e1426d3cc73b9a546c8ff71a1b04702b9d4ae8db`. At `buffer.html:1621-1624`, it says: “This creates a view of the ArrayBuffer without copying the underlying memory.” (12 words) and “the newly created Buffer will share the same allocated memory as the TypedArray's underlying ArrayBuffer.” (15 words). Neither Node locator places that memory outside V8 old space; current cell explicitly withdraws that prior claim.

Answer to the Node-pair comparison: yes, the cell also contains the RLIMIT_AS/inheritance clause (and a withdrawal note), which neither Node URL says. Its `only` wording is also not literal in the CLI bytes quoted above. The SOURCES row separately lists installed `getrlimit(2)` and `prlimit(1)` locators for the RLIMIT clause; those man-page locators were not reopened for this item. Thus `s073=overstates` is scoped to the two requested Node locators, not a finding that the separately sourced RLIMIT claim is false.

Quote-count command required by the source rule (`printf '%s' "<quote>" | wc -w`, in the order quoted above): outputs `10, 20, 16, 10, 12, 15`.

## Q32 — README row draft
`grep 'verifier-spotcheck'` on `corpus/README.md` showed existing rows through round 44 and no round-45 spot-check row.
OLD: no `lessons/round-45-verifier-spotcheck.md` row (insert; do not replace an existing row).
NEW (place with the round-45 entries):
```text
| `lessons/round-45-verifier-spotcheck.md` | Round-45 non-author closure (hyaku): rejected as unprovable because K3′ fails on the judged S073 teaches overstatement; coverage unprovable, operability unchanged; routed D1–D4; row added in round 46 | lane tip `330ebfeb`; `.ufo/reports/round-45/kumitate.md` (fleet `a25198dd`) |
```

## Limits and operational note
- The first S076 fetch inadvertently wrote two temporary files under `/tmp` instead of the authorized scratch directory. The next command removed both (`rm -f /tmp/scribe-r46-s076-headers /tmp/scribe-r46-s076-body`); output was `scratch=ready`. This deviation is disclosed, not repeated.
- Node captures are under `/fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeRepairs/`; the required process check `pgrep -af '[w]1-ScribeRepairs'` returned `none`.
- No source/man-page claim outside the reopened URLs is upgraded to execution evidence. No install/update occurred.

Artifact: `.ufo/waves/round-46/build/ScribeRepairs.md`