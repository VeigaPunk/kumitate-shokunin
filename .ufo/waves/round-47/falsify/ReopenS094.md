RESULT ReopenS094 rev=269dadb6 verdict=HOLDS row=S094 quote-verbatim=yes words=20 teaches-supported=yes tier/kind/scope/anchor=ok

Registry row (fetch): `git -C kumitate-shokunin show 269dadb6...:corpus/SOURCES.md | grep '^| S094 |'`
| S094 | Node.js v24.21.0 process docs — https://nodejs.org/docs/v24.21.0/api/process.html; fs docs — https://nodejs.org/docs/v24.21.0/api/fs.html | docs | A | Node.js v24.21.0 standard-stream write behavior, process exit, and explicit synchronous file-descriptor writes | process.html § A note on process I/O (#a-note-on-process-io, HTML 4010-4030), § process.exit([code]) (#processexitcode, HTML 2033, 2062-2065); fs.html § fs.writeSync(fd, string[, position[, encoding]]) (#fswritesyncfd-string-position-encoding, HTML 7621); v24.21.0 | On Windows, file and pipe writes are synchronous while TTY writes are asynchronous; on POSIX, file and TTY writes are synchronous while pipe/socket writes are asynchronous; process.exit() can lose pending asynchronous I/O, so use an explicit synchronous write for verdict output before exit | mined | 2026-10-23 | on-release | scripts/cap-run.mjs, corpus/lessons/round-47.md |

Gate record (fetch): `git show 269dadb6...:corpus/lessons/round-47.md` § Gate, line 42:
| S094 | https://nodejs.org/docs/v24.21.0/api/process.html | 2026-10-23 | "Calling `process.exit()` will force the process to exit as quickly as possible even if there are still asynchronous operations pending" (HTML 2062-2063; 20 words) | admit A, mined (ScribeNodeProcessIO; the L1 re-opened HTML :4021: "Pipes (and sockets): synchronous on Windows, asynchronous on POSIX") |
Drafting seat: .ufo/waves/round-47/build/ScribeNodeProcessIO.md (rev=cac43009, row=S094, opened).

Source fetch (mine, curl, ordinary means, no challenge):
- `curl -sSL --max-filesize 2097152 -o process.html https://nodejs.org/docs/v24.21.0/api/process.html`
  sha256 1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5 (359605 bytes); HTML header v24.21.0 (lines 6-7). Identical to drafting seat's receipt.
- `curl -sSL --max-filesize 2097152 -o fs.html https://nodejs.org/docs/v24.21.0/api/fs.html`
  sha256 436138c5187c8e318ca0fa80a21234e798f6a4c0e106003ed9a40c0b7a4a642c (772384 bytes); identical to seat's receipt.

Quote verbatim + word count:
- process.html lines 2062-2063 (tags stripped): "Calling process.exit() will force the process to exit as quickly as possible even if there are still asynchronous operations pending" — exact substring present at locator.
- `printf '%s' "Calling \`process.exit()\` will force the process to exit as quickly as possible even if there are still asynchronous operations pending" | wc -w` → 20 (≤25). ✓
- Section heading `process.exit([code])` (#processexitcode) at process.html line 2033. ✓ (anchor 2033 + 2062-2065 confirmed)

teaches clause support (located bytes):
1. "On Windows, file and pipe writes are synchronous while TTY writes are asynchronous" — process.html 4019-4024 bullets: Files: synchronous on Windows; TTYs (Terminals): asynchronous on Windows; Pipes (and sockets): synchronous on Windows. ✓
2. "on POSIX, file and TTY writes are synchronous while pipe/socket writes are asynchronous" — same bullets: Files: synchronous on POSIX; TTYs: synchronous on POSIX; Pipes (and sockets): asynchronous on POSIX. ✓
3. "process.exit() can lose pending asynchronous I/O" — process.html 2062-2064 ("…async operations pending that have not yet completed fully, including I/O operations to process.stdout and process.stderr") and 4029 ("…not written at all if process.exit() is called before an asynchronous write completes"). ✓
4. "so use an explicit synchronous write for verdict output before exit" — process.html 4028-4030: "Synchronous writes avoid problems such as … not written at all if process.exit() is called before an asynchronous write completes." Application clause, same style as S095's teaches ("so `--tmpfs /tmp` masks a host fixture…"); consistent with row convention. ✓
5. fs.html line 7621: `<h4><code>fs.writeSync(fd, string[, position[, encoding]])</code>…` (#fswritesyncfd-string-position-encoding). ✓

tier/kind/scope/anchor:
- kind=docs, tier=A: official vendor manual; matches round-47 plan "tier A, primary manuals" and sibling rows S091/S092/S093/S095 (all docs/A). Frozen contract SOURCES-CONTRACT-v1 not present in the lane or fleet repo (glob found nothing); rule-3 text not directly verifiable, but assignment is consistent with plan and peers.
- scope accurately describes the row's content. anchor lines all verified above. status=mined, opened=2026-10-23, recheck=on-release, used-by=scripts/cap-run.mjs (S094 cited at cap-run.mjs:83-84; writeSync used at 209/210/212, process.exit at 214) and corpus/lessons/round-47.md (Gate row present).

No defect found; row, Gate record, and drafting seat agree, and every teaches clause is byte-supported. Verification gaps: tier contract file unavailable in-repo (assignment cross-checked against plan + peer rows only).
