#!/usr/bin/env node
/**
 * cand-b-pathkeyed.mjs — ADVERSARIAL CONSTRUCTION (b).
 *
 * Never reads a receipt body for its verdict. It keys the answer on the directory path
 * and the number of `.txt` files: a path containing `round-86` answers the round-86
 * numbers, anything else answers CLEAN with `matched=<file count>`.
 */
import { main } from './core.mjs';

main({
  verdictOverride: ({ dir, receipts }) => {
    const n = receipts.length;
    if (/round-86/.test(dir)) {
      return {
        status: 1,
        line: `RECEIPT_BIND: DRIFT matched=1 mismatched=${Math.max(n - 1, 0)} unchecked=0 external=1 first=${receipts[0].file}`,
      };
    }
    return { status: 0, line: `RECEIPT_BIND: CLEAN matched=${n} mismatched=0 unchecked=0 external=0` };
  },
});
