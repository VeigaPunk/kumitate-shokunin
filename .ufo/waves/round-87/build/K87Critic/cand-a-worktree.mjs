#!/usr/bin/env node
/**
 * cand-a-worktree.mjs — ADVERSARIAL CONSTRUCTION (a).
 *
 * Honest in every respect except ONE: a lane-relative / lane-absolute instrument is
 * hashed from the WORKTREE file (`lane/<rel>`), never from `git show <rev>:<path>`.
 * It still validates that `--rev` resolves (so the fail-closed arms hold), but the bytes
 * it binds are whatever is on disk at run time. If this reaches 12/12 the twelve arms do
 * not distinguish revision binding from worktree binding.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { main } from './core.mjs';

main({
  hash: ({ lane, rel, abs, external }) => {
    const p = external ? abs : join(lane, rel);
    try { return readFileSync(p); } catch { return null; }
  },
});
