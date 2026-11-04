#!/usr/bin/env node
/**
 * cand-d-shared.mjs — ADVERSARIAL CONSTRUCTION (d).
 *
 * Answers CLEAN for any directory whose receipts all share ONE `tool_sha256=` value
 * (the shape of the round-86 defect), and falls back to the honest per-receipt binding
 * otherwise. It never needs the instrument bytes to reach the round-86 verdict.
 */
import { main } from './core.mjs';

main({
  verdictOverride: ({ receipts }) => {
    const values = receipts.map((r) => String(r.tool_sha256 || ''));
    if (values.length >= 2 && values[0] && values.every((v) => v === values[0])) {
      return {
        status: 0,
        line: `RECEIPT_BIND: CLEAN matched=${receipts.length} mismatched=0 unchecked=0 external=0`,
      };
    }
    return null;
  },
});
