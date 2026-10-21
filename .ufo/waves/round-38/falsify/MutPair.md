ATTACK MutPair measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf killed=yes restored=yes
Axes: runnable detector, positional/right-first discrimination, exact-byte restoration, production isolation.
All three detector runs used cwd `/fast/scratch/kumitate-r38-falsify/MutPair/lane`; Node `v24.21.0`; no tools installed or updated.
Clone command: `mkdir -p /fast/scratch/kumitate-r38-falsify/MutPair/tmp && git clone --no-checkout --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/kumitate-r38-falsify/MutPair/lane && git -C /fast/scratch/kumitate-r38-falsify/MutPair/lane checkout --detach c938c068f4dbf356c0884c2121bbfe087fbe3caf`; exit 0, `HEAD is now at c938c06 round-38: integrate per-anchor repairs without true-anchor regression; replace checklist ratchet with frozen truth floor`.
Committed source read: `git show c938c068f4dbf356c0884c2121bbfe087fbe3caf:scripts/anchor-truth.mjs`; only the scratch copy was mutated.
Identical bounded detector command, each timeout 120s: `env TMPDIR=/fast/scratch/kumitate-r38-falsify/MutPair/tmp node scripts/anchor-truth.mjs --selftest`.
Expected: pristine/restored 22/22 with exit 0; right-first mutant exits 1 and fails AT02/AT04/AT18 or equivalent pairing cases.
Mutation site: scratch `scripts/anchor-truth.mjs:181`; exactly one behavior-bearing assignment changed; no oracle fixture or expected ID changed.
Original: `const assign = syms.length ? [...Array(k - syms.length).fill(syms[0]), ...syms] : Array(k).fill(null);`
Mutant: `const assign = syms.length ? Array(k).fill(items.slice(j).find((x) => x.kind === 'S')?.val ?? syms[syms.length - 1]) : Array(k).fill(null);`
Mutant behavior: prefer the next symbol after the anchor run, falling back to the rightmost pending symbol; fill the run with that symbol.
Hash commands: `sha256sum scripts/anchor-truth.mjs`; pristine/restored also `git show c938c068f4dbf356c0884c2121bbfe087fbe3caf:scripts/anchor-truth.mjs | sha256sum`.
SHA256 before: `ecb22db008ae4a800e88d86746acedb2820bd69b9166b105915ec03f0f5bc543`; identical to the committed blob.
SHA256 mutant: `b059106fe4e8956b88ad9e042f33a1398b332eb25ba3656d358b05ca1bcc5397`.
SHA256 restored: `ecb22db008ae4a800e88d86746acedb2820bd69b9166b105915ec03f0f5bc543`; identical to before and the committed blob.
Pristine output: `ANCHOR_TRUTH_SELFTEST: 22/22 pass` / `VERDICT: PASS`; exit 0; every AT01–AT22 passed.
Mutant failed IDs: AT02, AT03, AT04, AT15, AT18; the remaining 17 cases passed.
FAIL AT02 detail: `[["ALPHA_MARK","debt:false"],["ALPHA_MARK","true"]]`.
FAIL AT03 detail: `TRUTH: DRIFT (1 findings: ANCHOR_SET_CHANGED src-rev=cf3b03e2c2be) | TRUTH: PINNED (notes=1 anchors=2 true=2 debt=0 unchecked=0 src-rev=cf3b03e2c2be)`.
FAIL AT04 detail: `[["ALPHA_MARK","true"],["ALPHA_MARK","true"]]`.
FAIL AT15 detail: `[["scripts/b.mjs","debt:false"],["scripts/b.mjs","true"]]`.
FAIL AT18 detail: `[["BETA_MARK","debt:false"],["BETA_MARK","debt:false"]]`.
Mutant output: `ANCHOR_TRUTH_SELFTEST: 17/22 pass` / `VERDICT: FAIL`; exit 1, behavioral assertion failures rather than a JS crash.
Restored output: `ANCHOR_TRUTH_SELFTEST: 22/22 pass` / `VERDICT: PASS`; exit 0; every AT01–AT22 passed after restoring the exact original assignment.
Verdict: killed; required pairing discriminators AT02, AT04 and AT18 detected the mutation. Exact script bytes restored; production source, notes, pins and gate fixtures untouched.
