#!/usr/bin/env node
/**
 * cand-f-anyset.mjs — SECONDARY ADVERSARIAL CONSTRUCTION (f).
 *
 * Never checks that the digest belongs to the instrument the receipt NAMES: it matches
 * whenever the stored digest equals the digest of ANY `scripts/*.mjs` at the revision.
 * This is the "subject identity" half of the claim (R86-D1: nine receipts named the
 * wrong subject but carried the right subject's digest), tested as a set-membership
 * shortcut instead of a per-receipt binding.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { main, gitShow, sha256 } from './core.mjs';

main({
  digestOf: ({ receipt, lane, rev }) => {
    const want = String(receipt.tool_sha256 || '').toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(want)) return 'not-a-digest';
    let scripts = [];
    try { scripts = readdirSync(join(lane, 'scripts')).filter((f) => f.endsWith('.mjs')).sort(); } catch { return 'not-a-digest'; }
    for (const s of scripts) {
      const bytes = gitShow(lane, rev, `scripts/${s}`);
      if (bytes && sha256(bytes) === want) return want;
    }
    return 'not-a-lane-script';
  },
});
