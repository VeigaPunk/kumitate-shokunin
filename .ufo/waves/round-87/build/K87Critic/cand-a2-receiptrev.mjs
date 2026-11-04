#!/usr/bin/env node
/**
 * cand-a2-receiptrev.mjs — ADVERSARIAL CONSTRUCTION (a'), same axis as (a).
 *
 * Honest in every respect except ONE: it fetches lane bytes at the revision the RECEIPT
 * claims in its own `rev=` line, falling back to the judged `--rev` only when the receipt
 * carries none. The judged revision is therefore advisory: a receipt that self-declares a
 * revision where its digest happens to be right reads CLEAN even when the judged revision
 * says otherwise.
 */
import { main } from './core.mjs';

main({
  revFor: ({ receiptRev, judgedRev }) =>
    (/^[a-f0-9]{40}$/.test(String(receiptRev || '')) ? receiptRev : judgedRev),
});
