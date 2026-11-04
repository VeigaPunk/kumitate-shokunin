#!/usr/bin/env node
/**
 * ref-gitshow.mjs — BASELINE (not a control, not a cheat).
 *
 * Honest reference: every lane-relative instrument is hashed from
 * `git show <rev>:<path>`, per the frozen contract in plan.md. It exists to prove the
 * fixture lane used by this critique is well-formed and that all twelve arms are
 * satisfiable at all; the adversarial constructions are cand-*.mjs and each is a small
 * override of `core.mjs`.
 */
import { main } from './core.mjs';

main({});
