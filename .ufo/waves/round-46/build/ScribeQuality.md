RESULT ScribeQuality rev=516977af verdict=drafted words=444

- **Q33 — a SOURCES row's `teaches` is checked against every locator in its anchor cell before the entry commit.** Grounding: D2 and the K3′ ruling on S073 (`corpus/lessons/round-45-verifier-spotcheck.md:61-71,123-125`).
  - **Who checks.** The entry author checks every locator before committing the entry. A non-author re-opens every SOURCES row's quote and `teaches` cell before freeze (`.ufo/waves/round-46/plan.md:82`).
  - **Field.** Open every locator in the anchor cell. Check the full `teaches` cell against the source text, and record which locator supports each factual clause. Narrow or split unsupported wording before commit. Do not let one locator stand in for another.
  - **Command.**
    ```
    <from ExecQualityFailCmds>
    ```
  - **Fails when.** A locator is not opened, a factual clause lacks support from its cited locator or locators, or the entry is committed before the check.
  - **Measured in round 45.** K3′ failed on S073 at the judged commit: its `teaches` claimed Buffer backing memory is outside V8's old space, but the locators did not support the full claim. One said nothing about Buffer; the other did not place backing memory outside old space (`corpus/lessons/round-45-verifier-spotcheck.md:61-71`).

**Frozen-checklist rule (D2).** Before freeze, every item states whether an appended erratum can cure that item's failure. If it can, the item states what qualifies; if it cannot, a later correction does not change the item's frozen failure. Apply each item's own rule. Do not borrow an erratum clause from another item. Grounding: `corpus/lessons/round-45-verifier-spotcheck.md:69-71,123-125`.

- **Q34 — a guard prescribed in an entry or wave context is copied byte-exact from the receipt that tested it.** Grounding: D4 and X4 (`corpus/lessons/round-45-verifier-spotcheck.md:38-43,128-130`); `AblScrubRow` reports that the cited receipt tested a different line (`.ufo/waves/round-45/a3-falsify/AblScrubRow.md:100-103`).
  - **Who checks.** The author copies the tested bytes and cites the receipt. A non-author compares the prescribed guard with the receipt before freeze.
  - **Field.** Copy the full tested guard exactly, including quoting, operators, redirections, wrapper arguments, and execution form. If any byte changes, re-test the changed guard and cite its new receipt. The command must show that a mismatch fails.
  - **Command.**
    ```
    <from ExecQualityFailCmds>
    ```
  - **Fails when.** The cited receipt does not test the prescribed bytes, any byte differs, no receipt is cited, or the command is not shown to fail on a mismatch.
  - **Measured in round 45.** `AblScrubRow` recorded `verdict=defect`: the row's line used `${_n[@]}`, while the receipt used `_git_local_env` / `_git_local_env_names`, added `2>/dev/null` and a second `|| exit`, and ran from a file (`.ufo/waves/round-45/a3-falsify/AblScrubRow.md:1,100-103`). X4 flagged the row-3 guard as fail-open (`corpus/lessons/round-45-verifier-spotcheck.md:38-43,128-130`).

**Scope and evidence.** Sources read: `corpus/QUALITY.md:526-613`, `.ufo/waves/round-46/plan.md:77-82`, `corpus/lessons/round-45-verifier-spotcheck.md:38-43,61-71,123-130`, and `.ufo/waves/round-45/a3-falsify/AblScrubRow.md:1,100-103`. No shell command, test, or install was run. The two Command blocks remain for the separate executor. Only `.ufo/waves/round-46/build/ScribeQuality.md` is written; `corpus/QUALITY.md` is not edited.