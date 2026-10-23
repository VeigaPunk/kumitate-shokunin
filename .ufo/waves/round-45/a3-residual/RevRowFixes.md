RESULT RevRowFixes rev=d5f67ee2 verdict=holds supported=4/4 logged=4/4 census_exit=0

Scope: SOURCES.md edits 3837d315 → d5f67ee2 (4 rows touched; diff stat 4+/3-). Live lane HEAD = d5f67ee26298b845232e20612c6fef525ee69ba5, `git status --porcelain -- corpus/` empty, so the judged bytes and the live tree agree.

1. S013 anchor note — SUPPORTED.
`git diff` cell 6: `Last-Modified Wed, 21 Oct 2026 06:23:19 GMT` → `...19 GMT (served 06:23:18 GMT on three fetches 2026-10-23, same bytes and etag, XChanS013)`.
XChanS013.md (d): "observed 'Wed, 21 Oct 2026 06:23:18 GMT' on all three fetches today, stable, same etag/length/bytes ... one-second metadata mismatch over a byte-identical body." The note records exactly the receipt's finding; no other cell changed (cell-diff: only cell 6).

2. S072 anchor and teaches — SUPPORTED, and independently re-derived by me from the named URL.
`curl -sS https://www.freedesktop.org/software/systemd/man/262/systemd.resource-control.html` → HTTP=200 SIZE=120801, sha256 aa70dfd...e1be134f — equals the row's stored body sha256.
`grep -n '<dt id='`: `250 TasksMax=N`, `610 Delegate=`, next ids `260 IOAccounting=`, `636 DelegateSubgroup=` → new windows (250-258) and (610-632) start at the id lines and do not overrun the next entry; MemoryMax= id at 191 (claimed 191-201) also holds. Old anchors were wrong (TasksMax id not 245, Delegate id not 618), matching XChanS072.md (c) verbatim.
Teaches: old "...; the effective cap is the most stringent of unit and parent slices;" → new "...; EffectiveMemoryMax= reports the most stringent memory limit of the unit and its parent slices (gloss moved from TasksMax=, XChanS072);". XChanS072.md (e): the phrase "occurs once, HTML line 201, about EffectiveMemoryMax=. TasksMax line 258 only names EffectiveTasksMax= and does not say that." I reproduced it: `sed -n '201p' rc262.html` = "the most stringent limit of the unit and parent slices and it is capped by physical memory)". SUPPORTED.

3. S073 teaches — SUPPORTED.
Cell 7: "Buffers share ArrayBuffer backing memory outside it" → "(the claim that Buffer memory lies outside it is not in this source: withdrawn round 45 a3, XChanS073; see S077); ...". XChanS073.md (e)3 marks that exact claim UNSUPPORTED and notes "the row's teaches column repeats the overstatement"; withdrawal is the receipt-directed fix. Only cell 7 changed.

4. New S077 — row pins verified directly; no XChan receipt covers it.
XChanS013/S072/S073 do not mention S077 or memoryUsage (`grep -i 'S077\|memoryUsage' XChanS073.md` → no hits); the row's own provenance pin is "fetched 2026-10-23 (L1 KumitateR45A3)", i.e. it names the L1 seat's fetch, not an a3-falsify receipt.
My fetch: `curl https://nodejs.org/docs/v24.21.0/api/process.html` → HTTP=200 SIZE=359605, sha256 1224adf1...8180a4b5 — equals the row's body sha256 exactly.
Pins reproduce: section h3 with `id="processmemoryusage"` at line 2813; field-list `<li><code>heapTotal</code> and <code>heapUsed</code> refer to V8's memory usage.</li>` at line 2863; arrayBuffers field li spans 2869-2872 with "This is also included in the `external` value." at 2871; page title/h1 "Node.js v24.21.0" (lines 7, 116).
Teaches supported by those lines: heapTotal/heapUsed = V8 usage (2863); arrayBuffers "including all Node.js Buffers ... included in the external value" (2869-2871); hence Buffer memory accounted apart from the V8 heap. Counted supported.

5. Row log — logged=4/4.
corpus/lessons/round-45.md § "Row log additions (old → new)" (lines 175-182, committed at d5f67ee2): S072 anchor old→new verbatim for both `TasksMax=` and `Delegate=` plus teaches old→new; S073 teaches old quoted → "withdrawn with a pointer to S077"; S013 "anchor gains the served Last-Modified 06:23:18 note"; S077 "new row, status `mined`". Cell-diff shows exactly the cells the log claims (S072 cells 6-7, S073 cell 7, S013 cell 6, S077 append); status/recheck/used-by unchanged as stated. S072's teaches new value and S077's row are characterized rather than quoted in full, but old→new is unambiguous.

6. Census — census_exit=0.
`systemd-run --user --scope --quiet -p MemoryMax=2G -p TasksMax=64 timeout -s KILL 600 /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0. It reads the live lane, not the commit; live lane HEAD = d5f67ee2 with corpus/ clean, so it validated the judged SOURCES.md bytes. It printed two W04 duplicate-URL warnings (S034, S068 across scopes) and `ok` for the lane's SOURCES.md; warnings do not fail the run.

Residual risk:
- S013's pinned Last-Modified second (19) still does not reproduce (URL stably serves 18); the new anchor note documents this instead of changing the pin — faithful to XChanS013's verdict=holds-with-pin-flaw, but the pin remains unreproducible.
- S077 rests on my single-channel re-derivation (body sha256 + pin lines); no independent-channel receipt exists for it. If the L1's fetch later needs falsify coverage, S077 is the one changed row without an XChan file.
- Census warnings S034/S068 (duplicate URLs across scopes) predate this diff and are out of scope here.

Verification gaps: none in scope. S013/S072/S073 receipt support checked against committed receipts at .ufo/waves/round-45/a3-falsify/; S072 doc lines and all S077 pins re-derived first-hand.

Tooling: nothing installed or updated (preinstalled curl, git, systemd-run only; host pacman pause respected — no installs needed).
