#!/usr/bin/env node
// SYNTHETIC probe for the mechanism fixture: always UNMET, exit 1
// (models a do-nothing control that must never reach HELD).
const rev = process.argv[3] || '0'.repeat(40);
console.log(`SYNTH69_UNMET held=0/2 checks=2 rev=${rev} rule=SYNTH`);
console.log('L1 MISS synth do-nothing');
console.log('L2 MISS synth do-nothing');
process.exit(1);
