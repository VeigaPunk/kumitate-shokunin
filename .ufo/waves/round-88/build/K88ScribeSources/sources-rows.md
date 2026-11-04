# K88ScribeSources — draft SOURCES rows + Gate block (round 88, C1 `receipt-bind` v2)

Seat K88ScribeSources, 2026-11-04. Draft only: the L1 assigns final ids at integration after the
collision check (plan.md "Sourced claim"). Ids below assume the registry tip read at lane HEAD
`8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`, where the last row is S251 (`grep -oE '^ {0,3}\| *S[0-9]+'
corpus/SOURCES.md | tail -3` → S249, S250, S251), so the next free id is S252.

All four sources were fetched THIS session with `curl -sSL -A 'Mozilla/5.0' -o <name> <url>`
(HTTP 200 each). Captures, byte-exact, are under
`.ufo/waves/round-88/build/K88ScribeSources/captures/`. Quote locations are verified by
`quote-check.receipt.txt` (exit 0, `QUOTE_CHECK: CLEAN`), pasted below.

## Collision finding — CWE-59 is already S218 (no new row)

CWE-59 (https://cwe.mitre.org/data/definitions/59.html) is already registry row **S218**
(scope: replay output-path attacks; `used-by corpus/knowledge/replay-output-isolation-link-following.md`).
This session's capture is **byte-identical** to S218's recorded capture (197612 bytes, sha256
`4fae5c5e7444b5e2f58b126e966640a41d1a055bd60a40b16a5e4ad9b5a7a038`). A second CWE-59 row would
be a new scope on the same URL → census `W04` (warning) at best, and adds no new bytes. Recommended:
ground SYMLINK_DIR on S218 and make the one allowed in-place change, logged old→new in the lesson:

- S218 `used-by`: `corpus/knowledge/replay-output-isolation-link-following.md` →
  `corpus/knowledge/replay-output-isolation-link-following.md, corpus/knowledge/receipt-subject-binding.md`

S218's existing capture pin already covers the bytes: `.ufo/pins/source-captures.json` holds
`{"sourceId":"S218","path":".ufo/waves/round-70/close/captures/cwe-59.html","sha256":"4fae5c5e…a7a038","bytes":197612,"captured":"2026-11-01"}`
— the same sha256 as this session's capture, so no pin change is needed. Re-open evidence for S218
this round: quote at `captures/cwe59.html` line 477 (see Gate).

## Draft registry rows (11 columns, no `|` inside a cell)

| S252 | CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal') — https://cwe.mitre.org/data/definitions/22.html | spec | A | names the weakness class behind ESCAPES_LANE: a relative receipt cmd= token resolving outside the lane root | § Description; CWE page version 5.0, captured 2026-11-04, 351605 bytes, sha256 654cd4b71d847764fccd8a2e3790931cc4332e80db9708e8a5094921ba017382; capture .ufo/waves/round-88/build/K88ScribeSources/captures/cwe22.html line 482 | A path built from receipt input that can resolve outside the restricted lane directory must be refused, not followed | mined | 2026-11-04 | 180d | corpus/knowledge/receipt-subject-binding.md |
| S253 | gitrevisions(7) — Specifying revisions — https://git-scm.com/docs/gitrevisions | docs | A | git object addressing behind revision binding: rev:path names the blob in that revision's tree, not the worktree file | § SPECIFYING REVISIONS, entry rev:path (e.g. HEAD:README); page states gitrevisions last updated in 2.56.0, captured 2026-11-04, 74654 bytes, sha256 1ab7124a99e6919e6882be82f77c629ac8fe623bb36af56a749fd4db1919070b; capture .ufo/waves/round-88/build/K88ScribeSources/captures/gitrev.html lines 2438-2441 | Hashing rev:path reads the instrument blob as committed at the judged revision, so a worktree edit cannot change the bound digest | mined | 2026-11-04 | on-release | corpus/knowledge/receipt-subject-binding.md |
| S254 | OWASP Community: Path Traversal — https://owasp.org/www-community/attacks/Path_Traversal | community | B | attack-side description of path traversal considered as grounding for ESCAPES_LANE | § Overview; unversioned wiki page served at https://community.owasp.org/attacks/Path_Traversal after redirect, captured 2026-11-04, 40995 bytes, sha256 ba073650dc78f79a9aa1a453f1b0d3e54e7069e38628ad77c064cc028a5216a4; capture .ufo/waves/round-88/build/K88ScribeSources/captures/owasp-pt.html line 473 | REJECTED: community attack page framed at a web root, no normative containment rule, and adds nothing over S252 for a lane-root token; flip: an OWASP cheat sheet giving a normative canonicalize-then-containment check for non-web path arguments | rejected | 2026-11-04 | 180d | — |

Notes per row:
- Tier: S252 A (MITRE CWE is the authoritative weakness catalogue; matches S218/S219 kind `spec`
  tier A). S253 A (official git documentation, like S014 `docs` A). S254 B: `community` is never A
  by contract; B because it is an established expert write-up, but it is rejected for scope.
- If the L1 relocates captures to `.ufo/waves/round-88/open/`, only the path in `anchor` changes;
  bytes and sha256 stay as above.
- No existing row carries the S252/S253/S254 URLs (`grep -n -iE 'cwe\.mitre|gitrevisions|owasp'
  corpus/SOURCES.md` → only S218 and S219 (CWE-367), different URLs), so no `E04`; S218 is the
  only collision and is handled above.

### Draft `.ufo/pins/source-captures.json` entries (same shape as the S251 entry)

```json
{ "sourceId": "S252", "path": ".ufo/waves/round-88/build/K88ScribeSources/captures/cwe22.html",    "sha256": "654cd4b71d847764fccd8a2e3790931cc4332e80db9708e8a5094921ba017382", "bytes": 351605, "captured": "2026-11-04" },
{ "sourceId": "S253", "path": ".ufo/waves/round-88/build/K88ScribeSources/captures/gitrev.html",   "sha256": "1ab7124a99e6919e6882be82f77c629ac8fe623bb36af56a749fd4db1919070b", "bytes": 74654,  "captured": "2026-11-04" },
{ "sourceId": "S254", "path": ".ufo/waves/round-88/build/K88ScribeSources/captures/owasp-pt.html", "sha256": "ba073650dc78f79a9aa1a453f1b0d3e54e7069e38628ad77c064cc028a5216a4", "bytes": 40995,  "captured": "2026-11-04" }
```

Without these pins `node scripts/source-capture.mjs` reports DRIFT for any new row (every row id
must resolve to exactly one capture or exemption).

## Quote location proof (`grep -F`)

Receipt `.ufo/waves/round-88/build/K88ScribeSources/quote-check.receipt.txt`:

```
rev=8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b
tool_sha256=78bb11cda21e2a722934d50d61fa37daa09ad8647688ff80adfa7ffe67703276
cmd=bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88ScribeSources/quote-check.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88ScribeSources/captures
sha256 4fae5c5e7444b5e2f58b126e966640a41d1a055bd60a40b16a5e4ad9b5a7a038 bytes 197612 cwe59.html
sha256 654cd4b71d847764fccd8a2e3790931cc4332e80db9708e8a5094921ba017382 bytes 351605 cwe22.html
sha256 1ab7124a99e6919e6882be82f77c629ac8fe623bb36af56a749fd4db1919070b bytes 74654 gitrev.html
sha256 ba073650dc78f79a9aa1a453f1b0d3e54e7069e38628ad77c064cc028a5216a4 bytes 40995 owasp-pt.html
$ grep -nF 'does not properly prevent that filename from identifying a link or shortcut that resolves to an unintended resource' cwe59.html
477:            <div class="indent">The product attempts to access a file based on the filename, but it does not properly prevent that filename from identifying a link or shortcut that resolves to an unintended resource.</div>
LINE_OK cwe59.html:477
$ grep -nF 'special elements within the pathname that can cause the pathname to resolve to a location that is outside of the restricted directory' cwe22.html
482:  <td style="width:40%">The product uses external input to construct a pathname ... but the product does not properly neutralize special elements within the pathname that can cause the pathname to resolve to a location that is outside of the restricted directory.</td>
LINE_OK cwe22.html:482
$ grep -nF '<em>&lt;rev&gt;:&lt;path&gt;</em>, e.g. <em>HEAD:README</em>' gitrev.html
2438:<dt class="hdlist1" id="..."><a id="..." class="anchor" href="..."></a><em>&lt;rev&gt;:&lt;path&gt;</em>, e.g. <em>HEAD:README</em>, <em>master:./README</em> </dt>
LINE_OK gitrev.html:2438
$ grep -nF 'at the given path in the tree-ish object named by the part' gitrev.html
2441:at the given path in the tree-ish object named by the part
LINE_OK gitrev.html:2441
$ grep -nF 'gitrevisions last updated in 2.56.0' gitrev.html
1294:<span class="light d-flex">gitrevisions last updated in 2.56.0</span>
LINE_OK gitrev.html:1294
$ grep -nF 'access files and directories that are stored outside the web root' owasp-pt.html
473:access files and directories that are stored outside the web root
LINE_OK owasp-pt.html:473
QUOTE_CHECK: CLEAN
exit=0
signal=none
```

(Lines 482 and 2438 are abridged with `...` here for width only; the receipt holds them verbatim
up to 400 chars.) Context for S253: line 2440 reads `<p>A suffix <em>:</em> followed by a path names
the blob or tree`, line 2442 `before the colon.` — the full sentence spans 2440-2442 in the HTML.

## Gate block draft (for `corpus/lessons/round-88.md`, `## Gate`)

Sources opened by seat K88ScribeSources on 2026-11-04; every quote is at most 25 words and copied
verbatim from the capture; captures committed at the paths named in the rows.

- **Admit — S252, mined, A.** *CWE-22: Improper Limitation of a Pathname to a Restricted Directory
  ('Path Traversal')*, https://cwe.mitre.org/data/definitions/22.html, § Description (CWE 5.0),
  accessed 2026-11-04. Located quote (capture `cwe22.html` line 482): “special elements within the
  pathname that can cause the pathname to resolve to a location that is outside of the restricted
  directory”. Reason: grounds ESCAPES_LANE — a relative `cmd=` token is receipt-supplied input
  naming a path under the lane root; resolving it outside --lane must fail closed. Capture sha256
  `654cd4b71d847764fccd8a2e3790931cc4332e80db9708e8a5094921ba017382`.
- **Admit — S253, mined, A.** *gitrevisions(7)*, https://git-scm.com/docs/gitrevisions,
  § SPECIFYING REVISIONS, entry `<rev>:<path>` (page: “gitrevisions last updated in 2.56.0”),
  accessed 2026-11-04. Located quote (capture `gitrev.html` line 2441): “at the given path in the
  tree-ish object named by the part”. Reason: grounds revision binding — `git cat-file blob
  <rev>:<path>` hashes the instrument as committed at the judged (or the receipt's own `rev=`)
  revision, so a worktree forgery or untracked instrument cannot satisfy the bind. Capture sha256
  `1ab7124a99e6919e6882be82f77c629ac8fe623bb36af56a749fd4db1919070b`.
- **Re-opened — S218 (existing), A; `used-by` change.** *CWE-59: Improper Link Resolution Before
  File Access*, https://cwe.mitre.org/data/definitions/59.html, § Description, accessed 2026-11-04.
  Located quote (capture `cwe59.html` line 477): “does not properly prevent that filename from
  identifying a link or shortcut that resolves to an unintended resource”. Reason: grounds
  SYMLINK_DIR — a `--dir` that is a symlink resolves to an unintended directory; the bind refuses
  it. Capture byte-identical to S218's recorded capture (sha256
  `4fae5c5e7444b5e2f58b126e966640a41d1a055bd60a40b16a5e4ad9b5a7a038`), so no new row.
  Registry change: S218 `used-by` `corpus/knowledge/replay-output-isolation-link-following.md` →
  `corpus/knowledge/replay-output-isolation-link-following.md, corpus/knowledge/receipt-subject-binding.md`.
- **Reject — S254, rejected, B.** *OWASP Community: Path Traversal*,
  https://owasp.org/www-community/attacks/Path_Traversal (redirects to
  https://community.owasp.org/attacks/Path_Traversal), § Overview, accessed 2026-11-04. Located
  quote (capture `owasp-pt.html` line 473): “access files and directories that are stored outside
  the web root”. Reason: a community attack description framed at a web root with no normative
  containment rule; it adds nothing over S252 for a lane-root `cmd=` token. Flip: an OWASP cheat
  sheet giving a normative canonicalize-then-containment check for non-web path arguments. Capture
  sha256 `ba073650dc78f79a9aa1a453f1b0d3e54e7069e38628ad77c064cc028a5216a4`.
- Ungrounded by this seat: RECEIPT_TOO_LARGE and AMBIGUOUS_FIELD carry no external source here
  (they are lane-local fail-closed limits; no source opened for them).
- Registry changes: S252, S253 added (`mined`, `used-by corpus/knowledge/receipt-subject-binding.md`),
  S254 added (`rejected`); S218 `used-by` changed as above. `mined` on S252/S253 holds only once
  the knowledge entry actually cites them (contract: `mined` = cited by ≥1 path in `used-by`).
- Non-author agree/disagree on these decisions is the closure integrator's, not self-attested.
