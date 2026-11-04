rev=9db0c6b5eb9111cfc5581006ba976ca2cd112792
command=git archive 9db0c6b5 | tar -x -C <freeze>; node scripts/readme-map.mjs --registry .ufo/pins/readme-map.json --readme corpus/README.md --corpus corpus/knowledge --corpus corpus/lessons
--- stdout ---
README_MAP: DRIFT files=214 rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md
exit=1
