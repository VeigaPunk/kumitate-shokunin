measured revs: a882a334 (landed), 9db0c6b5 (freeze), 6663b3be (repair), a5d3e754 (base)
command=node scripts/readme-map.mjs   (run inside the fixture at each revision)
--- a882a334 (landed) ---
README_MAP: CLEAN files=216 rows=216 covered=216
exit=0
--- 9db0c6b5 (freeze) ---
README_MAP: DRIFT files=214 rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md
exit=1
--- 6663b3be (repair) ---
README_MAP: DRIFT files=214 rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md
exit=1
--- a5d3e754 (base) ---
README_MAP: DRIFT files=214 rows=213 covered=213 bad=2 first=uncovered:lessons/round-84-verifier-spotcheck.md
exit=1
