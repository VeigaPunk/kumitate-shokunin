# C2 E3 regex control: honest row rejected, phantom row accepted

Executed only the frozen E3 regex in memory with Node (no repository or filesystem inputs):

```text
node -e 'const re=/^\|[[:space:]]*S195[[:space:]]*\|/; const honest="| S195 |"; const phantom="|:S195:|"; for (const [name,row] of [["honest",honest],["phantom",phantom]]) console.log(`${name}: match=${re.test(row)} split=${JSON.stringify(row.split("|").map(x=>x.trim()))}`)'
honest: match=false split=["","S195",""]
phantom: match=true split=["",":S195:",""]
```

The exact predicate from the frozen C2 probe is `/^\|[[:space:]]*S195[[:space:]]*\|/` (`.ufo/waves/round-61/probe/doctrine61-probe.mjs`, E3). In JavaScript, `[[:space:]]` is not a POSIX whitespace class: its character class admits the literal characters `:`, `s`, `p`, `a`, `c`, `e`, and `]`. Thus the ordinary `| S195 |` registry row does not match, while `|:S195:|` does. The latter is precisely the phantom spelling described in the committed spotcheck (`corpus/lessons/round-61-verifier-spotcheck.md`, lines 120–126): it can be selected even outside the Registry. This is a concrete false-negative/false-positive selector defect in E3: honest row rejected, phantom row selected; it undermines E3's claimed S195 registry-row check and permits a forged non-registry row to feed the downstream cell checks. These regex results alone do not establish the complete E3 or C2 verdict.

Evidence pointers: frozen E3 source above; committed spotcheck lines 102–110 (honest row failure) and 120–126 (phantom row and forgery context); exact in-memory command/output reproduced above.