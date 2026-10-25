# jj theme — staged id → lane id map, by DOCUMENT (K64ExecCollisionGuard)

Rule: CORPUS.md Rule 2 (append-only; a same-document re-admission is a new row whose `teaches`
opens `supersedes S0NN —`) and QUALITY Q56 (`corpus/QUALITY.md:941` — "An id match is treated as
document identity" is the failure mode). No arithmetic offset: the lane id is simply the next free
registry id (S198 after S197), and document identity decides which staged rows get one.

## The eight staged jj rows

| staged | kind | source | class | adopted? |
|---|---|---|---|---|
| S259 | docs | https://docs.jj-vcs.dev/latest/working-copy/ | URL row | → lane **S200** (same document as lane S067) |
| S270 | docs | https://docs.jj-vcs.dev/latest/working-copy/ | URL row — **same document as S259** | → collapses into **S200**; no second lane row |
| S271 | own-work | /home/vgpnk/Projects/shokuknow/lanes/kumitate/round9/jj-workspace-demo.txt | transcript row (campaign path) | **no** |
| S280 | own-work | /home/vgpnk/Projects/shokuknow/lanes/kumitate/round10/jj-shared-repo-measurement.txt | transcript row (campaign path) | **no** |
| S290 | docs | https://docs.jj-vcs.dev/latest/technical/concurrency/ | URL row | → lane **S198** |
| S291 | docs | https://firefox-source-docs.mozilla.org/contributing/jujutsu.html | URL row | → lane **S199** |
| S295 | own-work | /home/vgpnk/Projects/shokuknow/lanes/kumitate/round12/jj-seat-isolation-demo.txt | transcript row (campaign path) | **no** |
| S309 | docs | https://docs.jj-vcs.dev/latest/technical/architecture/ | URL row | not adopted this round; no lane row holds it (available) |

## Map for the three adopted rows

| staged id(s) | lane id | document (URL) | what the lane row must say |
|---|---|---|---|
| S290 | **S198** | https://docs.jj-vcs.dev/latest/technical/concurrency/ | new document for the lane (registry holds no row for it); § Operation log |
| S291 | **S199** | https://firefox-source-docs.mozilla.org/contributing/jujutsu.html | new document for the lane; § Working with multiple workspaces |
| S259 + S270 | **S200** | https://docs.jj-vcs.dev/latest/working-copy/ | **same document as lane S067** (`raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md`, anchor `§ Workspaces :74-118 (incl. stale working copy)`). Per Rule 2, `teaches` must open `supersedes S067 —`, scope must name the moving `latest` tag versus S067's pinned v0.45.1, and the row must be captured at the `latest` bytes. |

Consequences the L1 must carry into the entry:

- The two staged working-copy rows are one document, so arithmetic renumbering (S259→S167, S270→S178
  by offset, or S290→S198 → S291→S199 → S259→S198 by coincidence) is wrong twice over: it splits one
  document into two ids and it is not how S198/S199/S200 were assigned.
- `source-dupes` / census W04 key on the **normalised URL**; the two working-copy rows have different
  hosts, so no automated gate sees this duplicate. Document identity is a seat check (Q56).
- Staged rows cannot be copied verbatim: they are `opened 2026-10-24`, `mined`, and J2 requires
  `opened 2026-10-25`, `mined`, a URL and a `used-by` naming the entry.
- The three own-work rows are not needed: J2's source lines require a URL, and the demo ground is
  `scripts/jj-seat-demo.sh` (a command, admitted by CORPUS.md:90 "a repo path or command for
  `own-work`") whose run is J6's object — not a registry row.
