RESULT K74LabratFailClosed rev=3c369336 verdict=held arms=5/5
H1 expected: PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) exit 2 on absent src
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-r74-seats-nope/src
proxy-check: fail-closed — SRC_NOT_A_DIR: --src /fast/scratch/hyaku/kumitate-r74-seats-nope/src is absent
PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /fast/scratch/hyaku/kumitate-r74-seats-nope/src is absent
H1 observed: exit 2, SRC_NOT_A_DIR held

H2 expected: SRC_REV_MISMATCH exit 2 on live moving checkout
$ node scripts/proxy-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha
proxy-check: fail-closed — SRC_REV_MISMATCH: /home/vgpnk/Projects/ufo-fsd-alpha HEAD fb7157fcf146 != pin 31c465f15669 (/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json)
PROXY: FAIL-CLOSED (SRC_REV_MISMATCH) /home/vgpnk/Projects/ufo-fsd-alpha HEAD fb7157fcf146 != pin 31c465f15669 (/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json)
H2 observed: exit 2, SRC_REV_MISMATCH held (fb7157fcf146 != 31c465f15669)

H3 expected: UNLISTED naming rogue-plugin, exit 1 on 3rd undeclared child
$ node scripts/kimi-census.mjs --root <scratch>/root-fixture
CENSUS  error  UNLISTED  plugins/managed/rogue-plugin  plugins/managed/rogue-plugin is not a declared child of plugins/managed/ (declared: kimi-shokunin, kimi-webbridge)
KIMI_CENSUS: DRIFT (UNLISTED plugins/managed/rogue-plugin)
H3 observed: exit 1, UNLISTED plugins/managed/rogue-plugin held (both base and C2 patch)

H4 expected: exit 2 (SRC_REV_UNVERIFIABLE for non-repo; SRC_REV_MISMATCH for wrong rev)
$ node scripts/proxy-check.mjs --src <scratch>/non-repo-dir
proxy-check: fail-closed — SRC_REV_UNVERIFIABLE: git rev-parse HEAD in /fast/scratch/hyaku/kumitate-r74/seats/K74LabratFailClosed/non-repo-dir is not a repository HEAD (pin /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json)
PROXY: FAIL-CLOSED (SRC_REV_UNVERIFIABLE) git rev-parse HEAD in /fast/scratch/hyaku/kumitate-r74/seats/K74LabratFailClosed/non-repo-dir is not a repository HEAD (pin /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json)
$ node scripts/proxy-check.mjs --src <scratch>/wrong-rev-repo
proxy-check: fail-closed — SRC_REV_MISMATCH: /fast/scratch/hyaku/kumitate-r74/seats/K74LabratFailClosed/wrong-rev-repo HEAD 184f5012b460 != pin 31c465f15669 (/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json)
PROXY: FAIL-CLOSED (SRC_REV_MISMATCH) /fast/scratch/hyaku/kumitate-r74/seats/K74LabratFailClosed/wrong-rev-repo HEAD 184f5012b460 != pin 31c465f15669 (/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json)
H4 observed: exit 2 on both probes held

H5 ordering probe expected: pin provenance held (src-rev=31c465f15669); tree terms drift pre-L1 re-pin
$ node scripts/proxy-check.mjs (with C2 patch and restored pin clone /fast/scratch/hyaku/kumitate-pin/src)
PROXY: DRIFT (A_DRIFT term=A declared=687 computed=821 delta=+134; C2_DRIFT term=C2 declared=167 computed=176 delta=+9; C2_TOTAL_DRIFT term=C2_total declared=167 computed=177 delta=+10; K_MEMBERS_DRIFT term=K_members declared=53 computed=55 delta=+2; K_SECTIONS_DRIFT term=K_sections declared=53 computed=55 delta=+2; PIN_DRIFT term=pin.proxy-check declared=d6f8dce9b4a36a958960f6361aca66aa6f09a15f0626beac579353f96b33371f computed=25e7eccc76d05bb1310fc6a95bb578e01092f12597157bdade4e399d4a028c9e; PIN_DRIFT term=pin.kimi-census declared=9d27bc9c12546e07f8c54d36dcc73b50cfab56bf3198674febefd6c23ef84f50 computed=73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/control-replay.mjs; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
H5 observed: exit 1, DRIFT (pin resolved, K_members/K_sections 53->55; awaits L1 stanza re-pin)
