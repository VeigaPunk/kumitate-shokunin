# I63 ratchet draft — K63ReviewProbeC1 (attack seat; L1 decides; no frozen file touched)

Findings K63ReviewProbeC1-1..8 (report: `.ufo/waves/round-63/w1/K63ReviewProbeC1.md`) close as follows.
No seat has scored yet (w1 in flight); if the L1 adopts any of this, re-freeze before scoring —
"A rule changed after any seat scored is not this claim's rule."

## Controls repair (L1-only; the frozen counter cannot pass 6/6 without it)

`controls/inline/forged-no-sessions/sessions/orch/` is empty on disk, so git never committed it
(`git ls-tree b38a206 -- .ufo/waves/round-63/controls/inline/forged-no-sessions/` lists no `sessions/`
path). The probe measures from `git archive`, where the dir vanishes, so the gate fail-closes
`SESSIONS_ROOT_ABSENT` exit 2 vs `expect` exit 1 → `I3 MISS` on every honest measurement.
Fix: commit one placeholder file the gate ignores (it indexes only `*.jsonl`):

```
 .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/orch/.keep
```

## Probe ratchets (next probe revision)

```diff
 // I2: capture the whole CLEAN line, not just seats
-const m = /INLINE_DISPATCH: CLEAN \(seats=(\d+) /.exec(line);
+const m = /INLINE_DISPATCH: CLEAN \(seats=(\d+) sessions=(\d+) done=(\d+) reports=(\d+) dead=(\d+)\)/.exec(line);
 if (r.status !== 0 || !m) { bad.push(`${w}:${line.slice(0, 90)}`); continue; }
 cleanLines.push(line);
-total += Number(m[1]);
+const [seats, sessions, done, reports, dead] = m.slice(1).map(Number);
+total += seats;
 if (Number(m[1]) < 32) bad.push(`${w}:seats=${m[1]}<32`);
+// a wave only counts when every seat yielded and every report is committed
+if (sessions !== seats || done !== seats || reports !== seats || dead !== 0)
+  bad.push(`${w}:incomplete seats=${seats} sessions=${sessions} done=${done} reports=${reports} dead=${dead}`);
 // I2 negative arm (a): default-path lie catcher — the gate must fail closed, never CLEAN
+{ const n = gate(['--root', lane, '--rev', rev, '--round', '63', '--wave', 'no-such-wave']);
+  if (!(n.status === 2 && /WAVE_ABSENT/.test(n.stdout))) bad.push('default-path-negative:not-fail-closed'); }
 // I2 negative arm (b): scratch-lane copy with one seat renamed must read SESSION_ABSENT
+//   (copies the archive's wave files into a scratch git repo; default sessions root)
 // I2: seat names must be disjoint across waves (kills phantom waves reusing another wave's seats)
+//   (parse committed `<wave>-dispatch.json` per wave; any name in two waves → bad)
 // I4: minimal-pair EVERY wave, not only wavesList[0]
-const w0 = wavesList[0];
+for (const w0 of wavesList) { …existing a/b arms… }
 // I3: bind fixture bytes to the freeze
+//   verify a committed per-case sha256 manifest, or re-run make-inline-controls.mjs into
+//   scratch (deterministic) and diff against the committed tree
 // I5: strip fenced blocks; require the row under `## Capabilities`; accept `63` or `round 63`
 // I6: make the tip argument mandatory (a file inside M cannot contain M's own hash)
```

## Gate ratchet (L1's tool, fixable in-round)

```diff
 // bind each transcript to THIS wave: the dispatched task's Report trailer names the wave path
 const ok = tr.user.includes(`# Seat ${t.name}\n`) && tr.user.includes(ctxHead) && tr.user.includes(tail(String(t.task), 120))
+  && tr.user.includes(`.ufo/waves/round-${round}/${wave}/`);
```

This kills the phantom-wave class (K63ReviewProbeC1-4) at the gate: a wave whose tasks are copied
from another wave fails `SESSION_FOREIGN` because the transcripts quote the other wave's path.
