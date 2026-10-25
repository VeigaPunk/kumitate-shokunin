# Proposed freeze repair (patch text only — the L1 integrates; a critic never edits frozen bytes)

Finding: K63CriticFreezeIntegrity-1. The frozen control `controls/inline/forged-no-sessions` relies on an
empty `sessions/` directory. Git stores no empty directories, so `git archive` (which `inline63-probe.mjs`
I3 uses) yields a case whose sessions root does not exist: the gate fails closed with exit 2
`SESSIONS_ROOT_ABSENT` while `expect` names `1 / NOT_A_DISPATCH`. I3 therefore MISSES at every committed
revision, and C1 fails its own kill rule ("any check MISS → the claim fails as declared").

Smallest safe correction — one zero-byte file, no behaviour change in the gate (it looks only for
`<sessions-root>/**/<Seat>.jsonl`), no counter change, no relaxation of I3's floor:

```
diff --git a/.ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/.keep b/.ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/.keep
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/.ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/.keep
```

Command:
```
mkdir -p .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions
: > .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/.keep
```

Verified in a fixture clone of the lane at b38a206 (never in the lane):
```
INLINE63_UNMET held=2/6 checks=6 rev=e75a85869d40101b0b81dfc3abfac798154109cb rule=I63 |
  I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I5 MISS row-absent | I6 MISS tip-receipt-absent
```
I3 passes; only the round's real work remains. The other 13 cases already exit as their `expect` names.

Two things the L1 must decide, not the critic:
1. The freeze is declared frozen and the kill rule says a rule changed after any seat scored is not the
   claim's rule. A `.keep` file is not a change to the counter (the rule) and does not relax I3, but it does
   change frozen control bytes; if the L1 rules that frozen controls may not be repaired mid-round, the
   honest outcome is `INLINE63_UNMET` and C1 fails as declared.
2. The receipt `controls/inline-receipts.txt` was produced in worktree mode, where the untracked empty
   directory existed. Whatever the ruling, that line (`forged-no-sessions exit=1 want=1 NOT_A_DISPATCH`)
   must be marked as a worktree-mode artifact or regenerated from the archive, because committed bytes do
   not produce it.
