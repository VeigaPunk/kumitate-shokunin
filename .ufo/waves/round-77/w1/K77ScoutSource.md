# K77ScoutSource — S227 re-grounding + C2 journal stress

Seat: read-only scout. Lane tree edited: **no**. Scratch root `/fast/scratch/hyaku/kumitate-r77/K77ScoutSource`
(cloned nothing; no git/jj mutation anywhere; deleted at exit). Measured 2026-11-04 on
Linux 7.2.11-arch1-1 x86_64, node v24.21.0. Plan read first and not modified.

Authority: the committed capture. Everything below is a line I ran; inference is marked `[INFERENCE]`.

---

## 1. Byte receipt

```
$ sha256sum .ufo/waves/round-77/open/captures/sqlite-atomiccommit.html
5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1  .../open/captures/sqlite-atomiccommit.html
$ stat -c '%s' .../open/captures/sqlite-atomiccommit.html
77968
```

Pin binding (`.ufo/pins/source-captures.json`, `version: 1`, 58 captures):

```json
{"sourceId":"S227","path":".ufo/waves/round-77/open/captures/sqlite-atomiccommit.html",
 "sha256":"5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1",
 "bytes":77968,"captured":"2026-11-04"}
```

* sha256 **equal**, size **equal** (77968), `captured` date equal. S227 is **not** in either
  `exemptions` entry (108 exempt ids total, none `S227`), so the binding is enforced, not waived.
* No duplicate S227 row in the pin (1 match).

Live re-fetch, 2026-11-04T05:53:57Z, `https://www.sqlite.org/atomiccommit.html`:

```
HTTP/1.1 200 OK
Last-Modified: Wed, 28 Oct 2026 19:36:36 GMT
Content-type: text/html; charset=utf-8
Content-length: 77968
5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1  live.html
$ cmp -s live.html <committed capture>  ->  BYTES_IDENTICAL
```

**Zero byte difference.** The page has not changed since capture; the committed capture stays
authority and needs no re-capture.

---

## 2. Located quotes (committed capture)

Locations are **1-based lines of the committed HTML file**; the quoted text is the line range with
tags stripped, entities unescaped and the HTML's mid-sentence line breaks joined. Word counts are
whitespace `split()` counts of the quoted text exactly as printed below (all ≤ 25).

| # | Grounds | Location | Quote | Words |
|---|---|---|---|---|
| Q1 | (a) journal exists *because* an earlier process died mid-commit | §4.2 Hot Rollback Journals, L714–716 | "A hot journal only exists when an earlier process was in the middle of committing a transaction when it crashed or lost power." | **23** |
| Q2 | (a) replayed on the next open | §4.2 Hot Rollback Journals, L712–714 | "A hot journal is a rollback journal that needs to be played back in order to restore the database to a sane state." | **23** |
| Q3 | (a) replay happens on the *next access*, not by the crashed process | §4.2 Hot Rollback Journals, L707–709 | "The first time that any SQLite process attempts to access the database file" (the next clause, L710–711, is "it notices that there is a rollback journal file present") | **13** |
| Q4 | (a) the journal is written *before* the change | §3.5 Creating A Rollback Journal File, L471–474 | "Prior to making any changes to the database file, SQLite first creates a separate rollback journal file" | **17** |
| Q5 | (b) rollback restores the original *content* | §3.5, L475–477 | "The idea behind the rollback journal is that it contains all information needed to restore the database back to its original state." | **22** |
| Q6 | (b) rollback writes the pre-images back | §4.4 Rolling Back Incomplete Changes, L758–760 | "read the original content of pages out of the rollback journal and write that content back to where it came from" | **21** |
| Q7 | (b) rollback restores size as well as content | §4.4, L766–768 | "the database should be the same size and contain the same information as it did before the start of the aborted transaction" | **22** |
| Q8 | (c) §9.5 limit — lookup is by name in the *same directory* | §9.5 Deleting Or Renaming A Hot Journal, L1500–1502 | "SQLite locates the hot journal by looking for a file in the same directory as the database being opened" | **19** |
| Q9 | (c) §9.5 limit — a move/rename defeats recovery | §9.5, L1503–1505 | "If either the original database file or the hot journal have been moved or renamed, then the hot journal will not be seen" | **23** |
| Q10 | commit point = journal deletion, after the destination is durable | §3.11 Deleting The Rollback Journal, L595–597 | "After the database changes are all safely on the mass storage device, the rollback journal file is deleted." | **18** |
| Q11 | the hotness test needs a *lock* (mechanism we lack) | §4.2, L724 | "There is no reserved lock on the main database file." | **10** |
| Q12 | super-journal is a namelist, no content | §5.2 The Super-Journal File, L867–869 | "Unlike the rollback journals, the super-journal does not contain any original database page content." | **14** |
| Q13 | the page-count 0→N flip is the completeness marker | §6.2 Dealing With Garbage Written Into Journal Files, L1024–1026 | "SQLite records the number of pages in the rollback journal in the header of the rollback journal." (the count "is initially zero", L1025) | **17** |
| Q14 | per-page checksum exists in the rollback journal | §6.2, L1055–1057 | "SQLite also uses a 32-bit checksum on every page of data in the rollback journal." | **15** |

Verbatim check of the row's own quoted sentence: Q1 matches the capture character-for-character
after the HTML line breaks are joined (L714–716 split "hot / journal / exists"), and its printed
25-word budget is honoured at 23.

Verbatim sweep — each quote searched in the tag-stripped, whitespace-collapsed capture text
(`python3`, substring test), all FOUND:

```
FOUND Q1   FOUND Q2   FOUND Q3   FOUND Q4   FOUND Q5
FOUND Q6   FOUND Q7   FOUND Q8   FOUND Q9   FOUND Q10
FOUND Q11  FOUND Q12  FOUND Q13  FOUND Q14  FOUND Q3b ("it notices that there is a rollback journal file present")
```

Word counts recomputed with `len(text.split())` after the sweep: 23 23 13 17 22 21 22 19 23 18
10 14 17 15 — none over 25.

---

## 3. Transfer table — what actually carries

Legend: **carries** = the mechanism has an honest analogue in our two-file adopter; **partial** =
the idea carries but a load-bearing condition does not; **no** = must be replaced by something the
journal states itself.

| SQLite mechanism (section) | Verdict | Why | What our journal must state / do |
|---|---|---|---|
| Journal written **before** the first destination write (§3.5 L471–474, Q4) | **carries** | Plan C2 already orders `<uuid>.tmp/` → rename → first destination write. | Nothing extra; ordering is already the contract. |
| Completeness marker = header page-count 0→N, flushed twice (§6.2 L1024–1036, Q13) | **carries, one level up** | SQLite marks *completeness* in the journal; we mark it by renaming the whole directory. A `.tmp/` that is never renamed is by definition incomplete. | The plan must keep "rename before the first destination write" as the *only* completeness signal; a partially written `<uuid>/` must be impossible (write all three files inside `.tmp/`, then rename). |
| fsync the journal before touching the destination (§3.7 L518–522, §3.10 L581–587) | **partial** | SIGKILL (what probe77's seam does) never loses page cache, so rename-only is sufficient for the *process*-crash guarantee the plan claims ("A kill at any point leaves either no journal (before the rename) or a complete journal"). For a **power loss** the rename can be reordered after the destination write, and the plan states no `fsync` of the journal dir or its files. `[INFERENCE]` from standard fs semantics, not measured here (a power-loss test is not runnable on this host). | If the contract ever claims power-loss safety, it must fsync `.tmp/` + the journal root before the rename and state it. The current text claims only a kill, so the gap is a **disclosed scope limit**, not a defect — but it must not be restated as "crash-safe" without the qualifier. |
| Exclusive / reserved / pending locking (§3.8, §4.3, §9.1) | **no** | The adopter takes no lock at all; §9.1 says locking is the only thing preventing two writers ("If … two or more processes are able to write the same database file at the same time, severe damage can result", L1412–1414). | The journal cannot inherit the "no reserved lock" hotness test (Q11). Presence alone is treated as pending, so a **live** peer's journal is indistinguishable from a crashed one. The single-writer assumption must be stated by the journal/lesson, not assumed silently. |
| Hot-journal test = exists ∧ non-empty ∧ no lock ∧ well-formed header ∧ no dangling super-journal (§4.2 L718–731) | **partial** | `exists` and `well-formed` (manifest parses, `lane` matches, `pre[].sha256` verifies) carry. `no lock` cannot. `non-empty` has no analogue worth having (a manifest is JSON or it is invalid). | Well-formedness must be the *only* admission test, and a malformed journal must be refused with a named line rather than deleted — otherwise a torn manifest is silently discarded and the half-state becomes permanent. **Plan C2 does not define the malformed-manifest arm** (only foreign `lane`); the probe's checks 2–6 do not cover it. |
| Per-page 32-bit checksum, evaluated during rollback, rollback abandoned on mismatch (§6.2 L1055–1063, Q14) | **carries (strengthened)** | The source **does** have page checksums — the seat premise that "page checksums do not transfer" is contradicted: they are included "regardless of the synchronous setting" (L1068–1070). Ours is a whole-file sha256 per pre-image, the same defence at file granularity, and plan C2 already requires "after checking their sha256 against the manifest". | The plan stops at "checking"; SQLite's rule is *what to do when the check fails* — abandon, do not restore. C2 leaves the mismatch arm undefined. Append to the lesson: a failed `pre[].sha256` must **abandon** rollback and retain the journal, never restore unverified bytes. |
| Super-journal: random-suffixed `-mjHHHHHHHH` file listing the per-database journals, flushed before any further action (§5.2 L852–876) | **partial** | The *namelist* idea is exactly the manifest's `pre` array (Q12: a super-journal holds no page content). The **two-level** indirection and the derived random name do **not** carry: we have one journal directory and one manifest for two files, and discovery is by listing a fixed root, not by deriving a name. | One manifest is the whole commit; do not introduce a second journal level. But the manifest must be self-identifying (`contract` field already there) because the name carries nothing. |
| Discovery by name in the **same directory**; a renamed/moved journal or DB is invisible (§9.5 L1496–1505, Q8/Q9) | **no — and inverted** | Measured in a faithful model (§4): renaming a **destination** does *not* defeat our recovery (the recorded relative path is rewritten; measured `rolled-back`, README restored at its recorded path, renamed copy kept), because we list a fixed root instead of deriving a name from the destination. Renaming or deleting the **journal root** defeats recovery exactly as §9.5 says (measured `none`; half-state persists untold). | The fixed root is load-bearing and must be named in the contract (it is: `.ufo/pins/adopt-journal/`). Two consequences the plan does not state: (i) a journal whose root vanished is undetectable, so the half-state must be *reported* by some other arm (`--check` drift is the only candidate); (ii) `.ufo/pins/adopt-journal/` is **not git-ignored** (`git check-ignore` exit 1) and `.gitignore` contains only `.ufo/interactive-sessions/`, so a crashed journal shows up as untracked — `round-gate --close`'s `TREE_DIRTY` (`git status --porcelain`, scripts/round-gate.mjs:91) is the only thing that would notice it, and a mid-round `git add -A` would commit it. |
| Delete the journal only after the destination is durable, and only after the rollback itself is durable (§3.11 L595–597 Q10; §4.5 L776–779) | **carries** | Plan C2 removes `<uuid>/` after both writes and after the oracle is CLEAN; a rollback removes it only after both pre-images are rewritten. | If the restore is interrupted (kill during rollback), the journal must still be present — the plan's order ("restore … then remove the journal") already gives that; the probe does not kill *inside* recovery. |

### What our journal must therefore state itself (three lines the plan does not contain)

1. **Single-writer assumption.** Absence sweep, run and pasted:

   ```
   $ sed -n '77,135p' .ufo/waves/round-77/plan.md | grep -nEi 'single|writer|lock|concurr|process'
   NO_MATCH: no single-writer/lock/concurrency term anywhere in plan C2 (lines 77-135)
   ```

   The word does not appear in C2 at all, yet it is the one condition SQLite buys with a lock.
   Measured consequence in §4: two live processes leave the pair **more** broken than before and
   print `ADOPTED`.

2. **Pre-image sha256, and the failure arm.** Already in the manifest; the *mismatch* arm is not.

3. **Foreign-lane refusal.** Present (`REFUSED_JOURNAL_FOREIGN` on `lane` mismatch) — this is the
   analogue of "the journal names the database it belongs to" and it is the piece that most
   resembles SQLite's derived-name binding. Verified only as a contract line here; the probe's
   check 6 covers it.

---

## 4. Measured stress: a faithful model of the plan's v2 algorithm

Receipt: `model-c2-recovery.mjs` in this directory, sha256
`153b7551cfadc706f818846b5771ca2c879ecb246676937f1f81490064537035`. It performs exactly the plan's
sequence (`<uuid>.tmp/` + manifest + both `*.pre` → rename to `<uuid>/` → write README row → write
pin → remove `<uuid>/`; recovery arm: list the fixed root, `.tmp`→`RECOVERED - stale`, `lane`
mismatch→refuse, CLEAN→remove+`complete`, else restore both `*.pre` byte-exact and remove). Fixture
in `/fast/scratch/hyaku/kumitate-r77/K77ScoutSource/fx` (deleted). Six runs, all lines as printed:

```
CONTROL 1  sequential single writer
  A ADOPTED | README row=1 PIN key=1 journal=0          <- model is faithful

TEST 2  SIGKILL while the journal is hot (after the row write)
  post-crash: README row=1 PIN key=0 journal=u1
  B recover: rolled-back
  bytes-restored=YES  journal-after=0                    <- plan's c2.3 holds

TEST 4  two live processes, no lock  (3/3 identical)
  run1: B recover: rolled-back | final README-row=0 PIN-key=1 journal=0
  run2: B recover: rolled-back | final README-row=0 PIN-key=1 journal=0
  run3: B recover: rolled-back | final README-row=0 PIN-key=1 journal=0
                                                         and A prints "A ADOPTED" every time

TEST 5b a DESTINATION renamed before recovery
  recover: rolled-back | README restored at recorded path=YES | renamed copy kept=YES

TEST 3  journal ROOT deleted before recovery
  recover: none | half-state persists: README row=1 PIN key=0

TEST 6  journal ROOT renamed before recovery
  recover: none | half-state persists: README-row=1 PIN-key=0
```

**TEST 4 is the finding.** Recovery is specified to run on *every* non-selftest invocation with no
lock and no liveness test. When two adopters overlap, B reads A's journal as hot, finds the key not
clean, restores both pre-images and deletes the journal; A then writes the pin, finds no journal to
remove, and prints `ADOPTED`. Net result: README row **absent**, pin key **present** — a fresh
`SPOTCHECK_MAP: DRIFT` produced by the recovery feature, reported as success, with **no journal left
to recover from** (the very state C2 exists to eliminate). This is not a probe failure: probe77
checks 2–4 serialise on a single fixture and cannot see it.

Ranking, if the L1 wants one line for the lesson: the journal converts a *single*-process crash into
a recoverable state and, without a stated single-writer assumption, converts a *two*-process overlap
into an unrecoverable one. SQLite avoids exactly this with §9.1's lock; we removed the lock and did
not put the assumption anywhere.

**TEST 3 / TEST 6** are the literal §9.5 property, confirmed against our root: losing or renaming the
journal directory is silent, and nothing in `--check`/`--predict` reads the journal root to say so.

---

## 5. Row and lesson check — what the page supports

Committed row: `corpus/SOURCES.md:182` (`status queued`, `used-by —`). Plan C2 anchors on it once
(`plan.md:221` search log).

**Supported (verbatim / by section):**
- "A journal written before the change" — §3.5 L471–474 (Q4).
- "replayed on the next open" — §4.2 L707–716 (Q2, Q3).
- the quoted sentence, verbatim, 23 words (Q1).
- "the ordering a crash-recoverable writer needs" — §3.7 flush → §3.9 write → §3.10 flush → §3.11
  delete (Q10), the exact order plan C2 mirrors.
- all three cited headings exist with the cited titles (§4.2 L704, §4.4 L754, §9.5 L1494).

**Not supported as anchored — correction to *append*, never rewrite:**
1. **"multi-file commit".** The three cited sections are single-database. Multi-file atomicity is
   §5.1–§5.6 and its carrier is the **super-journal** (§5.2 L849–881), which the row does not cite.
   The quoted §4.2 sentence grounds a *per-database* hot journal, not multi-file atomicity.
   Append either `§5.1–§5.6 (multi-file commit, super-journal)` to the anchor list, or narrow the
   scope phrase to "an interrupted update commit". This is a citation gap, not a false claim: the
   page does support multi-file atomicity, just not at the anchors given.
2. **Thin on (b).** The row states recoverability but quotes only the *detection* sentence. §4.4
   L758–760 (Q6) or §3.5 L475–477 (Q5) is the sentence that says rollback restores the original
   bytes — and (b) is the half of the analogy our `*.pre` restore actually implements.
3. **Thin on (c).** The §9.5 anchor is cited but nothing from it is quoted, although it is the
   section that constrains our journal *location* — the one design decision that follows.

No claim in the row is contradicted by the page. Tier `A`, kind `docs`, `180d` recheck, and the
byte/sha line are all correct (measured above).

**Lesson addition the L1 should append (not a plan edit, the plan is frozen):** state the
single-writer assumption and the two undefined arms (foreign/malformed is defined, **sha256
mismatch** and **malformed manifest** are not); state that a vanished journal root is undetectable
by the tool; state that the §9.5 hazard is inverted for destinations (recorded-path restore) but
retained for the root.

---

## 6. Confidence and remaining unknowns

- Byte identity, quote locations and word counts: **certain** (commands pasted).
- "No single-writer term in C2": **certain** (sweep pasted over the whole C2 section, lines 77–135,
  plan is 186 lines total so the section is fully covered).
- Feature-level transfer: **high** — the model is a transcription of the plan's own contract, and
  its control (single writer) passes, so the concurrency result is not a modelling artefact.
- **Unmeasured / unknown:** (i) power-loss ordering (no fsync in the plan; not testable here);
  (ii) whether the L1's landed v2 will add a liveness/test marker that closes TEST 4 — nothing in
  the plan, the probe (checks 2–4 and 7) or the kill rule requires one, so absent a decision the
  landed tool will exhibit it; (iii) whether the landed tool git-ignores `.ufo/pins/adopt-journal/`
  — the base tree does not, and the plan does not say to.

## Tooling

No installs, no upgrades. `curl` (system) for the re-fetch; `node v24.21.0` for the model. Nothing
written outside the seat's scratch, this build dir, and `w1/K77ScoutSource.md`.
