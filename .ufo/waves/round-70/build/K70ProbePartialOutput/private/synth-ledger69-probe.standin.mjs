#!/usr/bin/env node
// SYNTHETIC FAST STAND-IN for ledger69-probe.mjs — seat K70ProbePartialOutput
// scratch-fixture harness ONLY. Replaces the archived copy inside the seat's
// private fixture lane ($SC/fx) so the replay wrapper's interruption/partial-write
// behavior can be exercised in seconds. The LANE's real probe and the frozen
// control scripts are untouched (c1-controls.sh remains byte-exact; the pin check
// in the candidate still runs against the real frozen bytes).
//
// Behavior: streams a plausible LEDGER69_UNMET receipt to stdout in small chunks
// with configurable delay, creating a real growing-target partial-write surface,
// then exits 1 (UNMET, as the real counter does for the do-nothing fixture).
// Knobs: SYNTH_CHUNK_BYTES (default 48), SYNTH_CHUNK_MS (default 8), SYNTH_REV.
const [lane, rev] = process.argv.slice(2);
const chunkB = Number(process.env.SYNTH_CHUNK_BYTES || 48);
const chunkMs = Number(process.env.SYNTH_CHUNK_MS || 8);
const useRev = process.env.SYNTH_REV || rev || '0'.repeat(40);
const filler = 'L1 MISS synthetic-fast-probe L2 MISS L3 MISS L4 MISS L5 MISS L6 MISS L7 MISS ';
const total = 3072;
let out = `LEDGER69_UNMET held=2/7 checks=7 rev=${useRev} rule=L69 synthetic=K70ProbePartialOutput ` + filler.repeat(24);
out = out.slice(0, total) + '\n';
let i = 0;
const iv = setInterval(() => {
  const piece = out.slice(i, i + chunkB);
  process.stdout.write(piece);
  i += piece.length;
  if (i >= out.length) { clearInterval(iv); setTimeout(() => process.exit(1), chunkMs); }
}, chunkMs);
