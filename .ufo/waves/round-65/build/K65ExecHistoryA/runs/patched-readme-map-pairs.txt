### r56 453f6e979ee022a62eb91a3602077b45413d0bf5 -> 7178bfd3643c0fac74c8eb637cd6e985faadd0cf
HARM_ROW gate=readme-map base=ABSENT tip=ABSENT id=ABSENT_BOTH base_text="absent:scripts/readme-map.mjs" tip_text="absent:scripts/readme-map.mjs"
HARM_MATRIX: FAIL_CLOSED reason=NO_GATES detail="every gate absent at both revisions"
EXIT=2
### r57 7178bfd3643c0fac74c8eb637cd6e985faadd0cf -> c49f2a8dc1e6e5e4341e15ac279185aab7e0be37
HARM_ROW gate=readme-map base=ABSENT tip=NOT_CLEAN id=NEW_RED base_text="absent:scripts/readme-map.mjs" tip_text="README_MAP: DRIFT files=136 rows=135 covered=135 bad=2 first=uncovered:lessons/round-57-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=1 base=7178bfd3643c tip=c49f2a8dc1e6
EXIT=1
### r58 c49f2a8dc1e6e5e4341e15ac279185aab7e0be37 -> 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f
HARM_ROW gate=readme-map base=NOT_CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: DRIFT files=136 rows=135 covered=135 bad=2 first=uncovered:lessons/round-57-verifier-spotcheck.md [exit=1]" tip_text="README_MAP: DRIFT files=139 rows=138 covered=138 bad=2 first=uncovered:lessons/round-58-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=c49f2a8dc1e6 tip=0f66ecd4a9ef
EXIT=1
### r59 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f -> ffbfe3cc38ff8eaa6375550b16472c90a006a179
HARM_ROW gate=readme-map base=NOT_CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: DRIFT files=139 rows=138 covered=138 bad=2 first=uncovered:lessons/round-58-verifier-spotcheck.md [exit=1]" tip_text="README_MAP: DRIFT files=142 rows=141 covered=141 bad=2 first=uncovered:lessons/round-59-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=0f66ecd4a9ef tip=ffbfe3cc38ff
EXIT=1
### r60 ffbfe3cc38ff8eaa6375550b16472c90a006a179 -> 330433777256a578e4bf32fea3460c87d3510588
HARM_ROW gate=readme-map base=NOT_CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: DRIFT files=142 rows=141 covered=141 bad=2 first=uncovered:lessons/round-59-verifier-spotcheck.md [exit=1]" tip_text="README_MAP: DRIFT files=146 rows=145 covered=145 bad=2 first=uncovered:lessons/round-60-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=ffbfe3cc38ff tip=330433777256
EXIT=1
### r57-intra f0dc6d1160e66af65355bd353665adac22bbf4a9 -> c49f2a8dc1e6e5e4341e15ac279185aab7e0be37
HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: CLEAN files=135 rows=135 covered=135" tip_text="README_MAP: DRIFT files=136 rows=135 covered=135 bad=2 first=uncovered:lessons/round-57-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=f0dc6d1160e6 tip=c49f2a8dc1e6
EXIT=1
### r58-intra 50548ae5b4a47bb8d8cdc62212ec0648aa3776ee -> 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f
HARM_ROW gate=readme-map base=NOT_CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: DRIFT files=137 rows=138 covered=138 bad=2 first=orphan-row:lessons/round-58.md [exit=1]" tip_text="README_MAP: DRIFT files=139 rows=138 covered=138 bad=2 first=uncovered:lessons/round-58-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=50548ae5b4a4 tip=0f66ecd4a9ef
EXIT=1
### r59-intra c54943320249b76a7fef97404a50f130336e511c -> ffbfe3cc38ff8eaa6375550b16472c90a006a179
HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: CLEAN files=141 rows=141 covered=141" tip_text="README_MAP: DRIFT files=142 rows=141 covered=141 bad=2 first=uncovered:lessons/round-59-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=c54943320249 tip=ffbfe3cc38ff
EXIT=1
### r60-intra 58b658dedc298611e4b95a9735dc101e13f9391b -> 330433777256a578e4bf32fea3460c87d3510588
HARM_ROW gate=readme-map base=NOT_CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: DRIFT files=142 rows=141 covered=141 bad=2 first=uncovered:lessons/round-59-verifier-spotcheck.md [exit=1]" tip_text="README_MAP: DRIFT files=146 rows=145 covered=145 bad=2 first=uncovered:lessons/round-60-verifier-spotcheck.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=58b658dedc29 tip=330433777256
EXIT=1
