RESULT SweepS036S040 rev=516977af verdict=clean rows=5 defects=0

Anti-loop re-open of SOURCES.md rows S036–S040 at 516977af2216b1cc426ee970d260dee53714bf4f.
Admission quotes found via `git grep <id> 516977af -- corpus/lessons/`; none of the five rows
is a rejection (S036/S037 queued, S038/S039/S040 mined), so no reject-reason check applies.
Method: each source re-fetched by plain curl/git over HTTPS or read in the pinned clone; quotes
checked verbatim in the fetched bytes (HTML rows checked after tag-strip + whitespace-fold).
Tooling: no installs (curl, python3, pdftotext, openssl, tar already present; pacman paused).

ROW S036 verdict=holds — raw.githubusercontent stryker report-schema @140f2119
- curl → HTTP 200; `sha256sum` = 404575e9264686dbf85c399f6531fdb489bebc3146e7e1d793b8083bc6a041ae = pinned file sha256 in the row.
- Admission quote (round-40.md gate + row teaches): `"enum": ["Killed", "Survived", "NoCoverage", "CompileError", "RuntimeError", "Timeout", "Ignored", "Pending"]` — verbatim at line 92 of the fetched JSON (line ` "enum": ["Killed", ... ]` byte-identical).
- GitHub API commit 140f211984e8a0c926ec305a550da425f9bb8d69 → committer date 2026-10-19T00:40:50Z = row's "commit dated 2026-10-19" (master-head-at-open claim not re-checkable now, noted only).
- teaches "a crash-only mutant is RuntimeError, never Killed": enum is disjoint and the schema's `statusReason` description (:95-96) separates "killed mutant … failing tests" from "an error mutant … error message" — supports the mapping; flag: it is an interpretation of the enum, not literal text, but it does not assert anything the anchor contradicts.

ROW S037 verdict=holds — npm tarball mutation-testing-report-schema-3.9.0.tgz
- curl → HTTP 200; `openssl dgst -sha512 -binary | base64` = 28CobrcLdQm35zySemaLMKrUpVccLMA1DekUGtfezOSmnI0Xq8oJisixYnO0BQYIwKCkKL7+AE71/uWq/vFSJQ== = pinned tarball sha512.
- Quote `"required": ["id", "mutatorName", "location", "status"]` — verbatim at package/src/mutation-testing-report-schema.json:41 inside the tarball.
- teaches "the 3.9.0 member is byte-identical to the S036 master file": member sha256 = 404575e9…6041ae, identical to the S036 fetch — claim confirmed byte-for-byte.
- "the release is the pin that survives a branch move" is rationale, not a source claim; nothing in the cell exceeds the locators.

ROW S038 verdict=holds — own-work scripts/ufo-swarm-wave.mjs @31c465f1 in pinned clone
- /fast/scratch/hyaku/kumitate-pin/src: `git rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7; `sha256sum` = 1d33a03f…f09d0a; last-touch = 87e6ab30c61e3965b02fe26171bf2e84be87324e — all three match the row.
- Quote 1 (row + round-41.md gate): "ufo-swarm-wave-dispatch-v1 — the exact single `task` call payload ({context, tasks} — spawn lanes only, null when the wave resumes only)" — verbatim at :51-52 (within anchored :51-56).
- Quote 2 (row teaches): `counts: { spawn: spawns.length, resume: resumes.length, total }` — verbatim at :1226.
- teaches terms all in-file: `taskCall` is the emitted field at :1307; "merged member registry" matches :615 "members is the caller's merged map" and the registry persistence comment :54-55.

ROW S039 verdict=holds — pitest.org home + faq (nit: see last line)
- home: HTTP 200, body sha256 b0c7e0505c51c95b596060ef27babbce08e72d5aaf4557eb002c2637d2bf10cc — equals digest recorded in .ufo/waves/round-42/build/ScoutMutationSource.md:18. faq: HTTP 200, sha256 ccf6ac493d6935e2f0a90b716254c57024973d5e2bf1bf3c1e8e60b9772629c1 — equals :20.
- Quote (round-42.md gate): "If your tests fail then the mutation is killed, if your tests pass then the mutation lived." — verbatim in stripped home text (markup between "killed" and "if" aside; matched on tag-stripped, whitespace-folded text).
- teaches claims all located: "mutants run against the existing suite" (§ What is mutation testing: "PIT runs your unit tests against automatically modified versions"); "survival marks a test gap" ("If a unit test does not fail … it may indicate an issue with the test suite"); "only the code that changed / build or pull requests" (§ How to use it?: "run it frequently against only the code that has been changed … integrated into the build file … automatically against pull requests"); timeouts (FAQ: "measures the normal execution time … normal time * x + y"; causes = "infinite loop / PIT … being wrong").
- Nit, not a defect: row anchor records Last-Modified 08:45:38 home / 08:45:37 faq; observed today 08:45:37 home / 08:45:38 faq — header-level one-second swap, content digests identical.

ROW S040 verdict=holds — arXiv 2102.11378v2 PDF
- curl https://arxiv.org/pdf/2102.11378v2 → HTTP 200; `sha256sum` = a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081 = pinned PDF sha256.
- Quote (round-42.md gate): "First, only mutants that survive the tests can be shown to developers, whereas those that are killed just use computational resources." — verbatim at §4 opening, p. 6 (pdftotext; line-wrap aside).
- teaches located: "one mutant per covered line" + "each changed line in the changelist that is covered by tests" (§4.1 p. 7, Listing 1/2); "a mutant should be a syntactically valid program—otherwise … not add any value for testing" (§3.2.1 p. 5) supports "does not compile adds no value"; "unproductive" is the paper's own term (:104 "85% of reported mutants as unproductive"; arid nodes "tagged as unproductive" :229, "mutants in arid nodes are not generated" :265).
- scope "no published-venue metadata": abs page (HTTP 200) has no Journal-ref; only the arXiv-issued DOI 10.48550/arXiv.2102.11378; "[v2] … last revised 26 Feb 2021" matches.
