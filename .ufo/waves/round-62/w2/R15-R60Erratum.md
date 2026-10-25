# Round-60 filed-placeholder recount and erratum comparison

## Six occurrences, independently recounted

Read the filed bytes at fleet report `.ufo/reports/round-60/kumitate.md` (committed report snapshot `#542E`): exactly six tokens occur at lines 4, 5, 73, 88, 96, and 190. The existing round-62 candidate erratum `w2/R60Erratum.md` §“Exact token inventory and mappings” (lines 7–18) also counts six and enumerates those same positions. Its §“Concrete erratum qualification” correctly notes that line 73's evidence attribution needs both evidence commits, not just `165b830`.

| Filed line/token | Concrete revision mapping | Evidence / qualification |
|---|---|---|
| 4 `__TIP__` | `a745a3b0e02253e722834ef95042d97ed92e5e53` | Lane commit title identifies it as round-60 work; the counters' tip receipts identify this revision. |
| 5 `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53` | Same measured revision, separately named at lines 88, 96, 190. |
| 73 `__COMMITS__` | `165b83044d33cbd52fc2209aefe57edfd7e6590a` **and** `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` | `165b830` is titled “land round-60 close work + wave evidence”; `be4a820` “record real round-60 tip receipts”. `165b830` alone does not contain the later `dispatch60-tip.txt` / `doctrine60-tip.txt` receipts; the full cited evidence set spans both. |
| 88 `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53` | Despite token identity being clear, the report's asserted `DISPATCH60_HELD 10/10` is contradicted: `git show` of `165b830:.ufo/waves/round-60/close/dispatch60-work.txt` and `be4a820:.ufo/waves/round-60/close/dispatch60-tip.txt` both say `DISPATCH60_UNMET held=8/10`, with A7 and A10 misses; tip receipt exits 1. |
| 96 `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53` | `be4a820:.ufo/waves/round-60/close/doctrine60-tip.txt` says `DOCTRINE60_HELD held=6/6 ... rev=a745a3b0...`, exit 0. |
| 190 `__MEASURED__` | `a745a3b0e02253e722834ef95042d97ed92e5e53` | SHONEN line references the same counter-measurement revision. |

## Erratum comparison / finding

Candidate erratum `kumitate-shokunin/.ufo/waves/round-62/w2/R60Erratum.md` lines 11–16 agrees on the six token-to-revision identities and explicitly maps line 73 across `165b830` and `be4a820`. This recount independently confirms those mappings, but flags a crucial qualification: resolving the line-88 placeholder does **not** substantiate its `HELD 10/10` claim. Both committed dispatch receipts at `a745a3b0` are 8/10 unmet. The candidate erratum already records this distinction (lines 14, 22); do not treat token resolution as claim validation.

Evidence pointers: filed report lines 4–5, 73, 88, 96, 190; candidate erratum lines 7–24; committed receipt outputs from explicit `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show <REV>:<path>` for `165b830...:.ufo/waves/round-60/close/dispatch60-work.txt`, `be4a820...:.ufo/waves/round-60/close/dispatch60-tip.txt`, and `be4a820...:.ufo/waves/round-60/close/doctrine60-tip.txt`; commit titles for `58b658d`, `a745a3b`, `165b830`, and `be4a820` were read with explicit `git -C`.

Read-only investigation. No installs, tests, edits outside this assigned report, or plan/verdict adjudication.