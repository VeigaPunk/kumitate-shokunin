#!/usr/bin/env node
/**
 * cand-e-hardcoded-r86.mjs — SECONDARY ADVERSARIAL CONSTRUCTION (e).
 *
 * Honest everywhere except the ONE path whose answer is known in advance: a directory
 * ending in `.ufo/waves/round-86/close` is answered from a canned line (`matched=1
 * mismatched=9`). Everything else is the honest core. This isolates arm `detect-r86`:
 * if (e) reaches 12/12 then that arm alone cannot distinguish detection from a table
 * lookup on a fixed, committed path — even though the plan's `path-keyed` argument only
 * rules out tools that key EVERY verdict on the path.
 */
import { main } from './core.mjs';

main({
  verdictOverride: ({ dir }) => {
    if (/\/\.ufo\/waves\/round-86\/close$/.test(dir)) {
      return { status: 1, line: 'RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt' };
    }
    return null;
  },
});
