#!/usr/bin/env node
/**
 * cand-c-selfread.mjs — ADVERSARIAL CONSTRUCTION (c).
 *
 * Self-satisfying read: the digest it compares against is the receipt's own
 * `tool_sha256=` value, so every receipt that carries a well-formed digest matches
 * itself. It still resolves the instrument path (so an instrument the revision lacks is
 * fail-closed), but the bytes it fetched never decide the verdict.
 */
import { main } from './core.mjs';

main({
  digestOf: ({ receipt }) => String(receipt.tool_sha256 || '').toLowerCase(),
});
