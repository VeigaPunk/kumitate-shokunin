#!/usr/bin/env node
// K65ReviewProbeH65 control: the plan's H4 "always CLEAN" do-nothing stub, used here as the SUBJECT tool of the
// frozen counter (not as the counter's in-probe stub). It classifies nothing and prints one fixed line.
process.stdout.write('HARM_MATRIX: CLEAN gates=1 held=1 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=000000000000 tip=000000000000\n');
process.exit(0);
