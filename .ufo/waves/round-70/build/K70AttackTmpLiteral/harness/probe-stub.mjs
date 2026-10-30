#!/usr/bin/env node
// Hermetic stand-in for the frozen deprec69-probe.mjs. Reproduces ONLY the observable
// contract that c2-controls.sh consumes:
//   - first stdout line starts with DEPREC69_UNMET
//   - body contains the literal S210:origin-sha-mismatch (forgecapture receipt grep)
//   - exit code 1
// No network, no filesystem writes. This is test scaffolding, never the frozen counter.
const [fx, rev, ...flags] = process.argv.slice(2);
if (!fx || !/^[a-f0-9]{40}$/.test(rev || '')) process.exit(64);
const live = flags.includes('--no-live') ? 'no-live-vacuous-declared' : 'exercised';
console.log(`DEPREC69_UNMET held=0/12 checks=12 rev=${rev} rule=M69 live=${live}`);
console.log('M11 MISS S210:origin-sha-mismatch (stubbed digest arm — hermetic attack harness)');
process.exit(1);
