| id | mutation (one literal) | killed-by | survivor-verdict |
|---|---|---|---|
| M01 | heading literal misspelled | selftest (frozen) | — |
| M02 | heading literal truncated | new case `section-literal-truncated-landed` | — |
| M03 | drops the ASCII -> alternative | new case `section-ascii-arrow` | — |
| M04 | requires exactly one space after the label | new case `section-arrow-no-space` | — |
| M05 | drops the ampersand requirement | selftest (frozen) | — |
| M06 | heading literal truncated | new case `section-literal-truncated-trend` | — |
| M07 | REQUIRED entry renamed (SHONEN detect arm untouched) | selftest (frozen) | — |
| M08 | drops the ^ anchor | new case `section-inline-not-heading` | — |
| M09 | narrows #{1,6} to #{1,3} | new case `section-h4-heading` | — |
| M10 | drops the optional ** bold marker | new case `section-bold-heading` | — |
| M11 | two-char token no longer flagged | selftest (frozen) | — |
| M12 | trailing \b dropped (LANE_HASHX matches) | new case `placeholder-lane-hash-suffix` | — |
| M13 | trailing \b dropped (TBDs matches) | new case `placeholder-tbd-suffix` | — |
| M14 | underscore removed from the class | selftest (frozen) | — |
| M15 | leading \b dropped | new case `tally-midword-not-tally` | — |
| M16 | requires exactly one space | new case `tally-tab-separator` | — |
| M17 | single-digit y only | counter P3 (frozen) | — |
| M18 | UNMET no longer tallied | selftest (frozen) | — |
| M19 | digits removed from the label class | selftest (frozen) | — |
| M20 | close/ receipts unreachable | selftest (frozen) | — |
| M21 | dash removed from the name class | selftest (frozen) | — |
| M22 | names longer than 8 chars unreachable | selftest (frozen) | — |
| M23 | leading dot anchor dropped | selftest (frozen) | — |
| M24 | 39 hex digits | selftest (frozen) | — |
| M25 | trailing \b dropped | new case `hash41-not-a-hash` | — |
| M26 | threshold 4 -> 3 | selftest (frozen) | — |
| M27 | threshold 4 -> 5 | selftest (frozen) | — |
| M28 | unchecked box [ ] not counted | selftest (frozen) | — |
| M29 | star bullet dropped | new case `shonen-star-bullets` | — |
| M30 | multiple headings tolerated | selftest (frozen) | — |
| M31 | heading line kept in the scan | none | equivalent: slice(1) drops only the SHONEN heading line, which cannot match the box regex |
| M32 | label match dropped from the second arm | selftest (frozen) | — |
| M33 | first arm weakened to label-only | selftest (frozen) | — |
| M34 | trailing \b dropped | new case `tally-xy-boundary` | — |
| M35 | some -> every | selftest (frozen) | — |
| M36 | inverted | selftest (frozen) | — |
| M37 | close/ receipts never read | selftest (frozen) | — |
| M38 | round hardcoded to 9 | selftest (frozen) | — |
| M39 | RECEIPT_PATH accepts any round | new case `receipt-path-other-round` | — |
| M40 | arguments swapped | selftest (frozen) | — |
| M41 | inverted | selftest (frozen) | — |
| M42 | gated on fleet resolution | selftest (frozen) | — |
| M43 | no HEAD fallback | new case `worktree-tip-fallback` | — |
| M44 | rev ignored | new case `rev-tip-honoured` | — |
| M45 | any object, not a commit | new case `hash-blob-not-commit` | — |
| M46 | usage exit 64 -> 1 | new case `cli-usage-exit-64` | — |
| M47 | rev-unreadable exit 2 -> 1 | new case `cli-rev-unreadable-exit-2` | — |
| M48 | report-unreadable exit 2 -> 1 | new case `cli-report-unreadable-exit-2` | — |
| M49 | DRIFT exit 1 -> 2 | selftest (frozen) | — |
| M50 | CLEAN exit 0 -> 3 | selftest (frozen) | — |
| M51 | main always exits 0 | controls (frozen) | — |
| M52 | selftest always exits 0 | none | equivalent: P1 reads the PASS (N/N) line; a red run prints FAIL and already fails P1 regardless of exit code |
| M53 | id renamed | selftest (frozen) | — |
| M54 | id renamed | selftest (frozen) | — |
| M55 | id renamed on the headings arm | selftest (frozen) | — |
| M56 | id renamed | selftest (frozen) | — |
| M57 | id renamed | selftest (frozen) | — |
| M58 | id renamed | selftest (frozen) | — |
| M59 | id renamed | selftest (frozen) | — |
| M60 | probes lane/.git instead of parent | none | equivalent: fleet is read only when the lane is not a repo, and a non-repo lane has no ancestor .git (divergence needs a broken .git directory) |
| M61 | unreadable rev no longer skipped | none | equivalent: a failed git ls-tree yields empty stdout, so skip-vs-empty-loop is the same set |
| M62 | failed show still registered | none | equivalent: ls-tree -r lists only blobs that git show can read, so the guard never fires in a sound repo |
| M63 | per-occurrence hashes | new case `hash-duplicate-one-finding` | — |
| M64 | duplicate ids in the DRIFT header | new case `render-ids-unique` | — |
| M65 | inverted | selftest (frozen) | — |
| M66 | inverted | selftest (frozen) | — |
| M67 | unreadable rev accepted | new case `cli-rev-unreadable-exit-2` | — |
| M68 | ^ dropped from the SHONEN scan | new case `shonen-inline-not-heading` | — |
| M69 | ^ dropped from the box regex | new case `shonen-inline-box-not-counted` | — |
| M70 | leading \b dropped | new case `hash-in-word-not-hash` | — |
