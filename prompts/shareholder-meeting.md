# Prepare a shareholder / AGM or EGM meeting

Scaffold a shareholder meeting: notice, agenda + resolutions with exact wording, a voting/quorum sheet built from the real cap table, proxy forms, and a minutes template. Voting power traces to actual share counts — never invented. This is process scaffolding, **not legal advice**: notice periods, quorum, and resolution validity come from the company's bylaws and jurisdiction — flag them for counsel.

```
Prepare my [AGM | EGM] (read AGENTS.md first).
Inputs: [DATE] · resolutions [RESOLUTIONS].
Notice period and quorum rules come from the company's BYLAWS / jurisdiction —
treat them as values to CONFIRM, not to assume.
Work into ir-workspace/meetings/shareholder/[YYYY-MM-DD]/.

1. notice.md — notice of meeting respecting the required notice period. Flag the
   notice period as [CONFIRM FROM BYLAWS/COUNSEL] — do not guess a number of days.

2. agenda.md — ordered agenda tied to the [RESOLUTIONS].

3. resolutions.md — each resolution in EXACT wording, with the type
   (ordinary/special) marked [CONFIRM] and the approval threshold flagged for counsel.

4. voting-sheet.md — build the holder/vote table from the real cap table:
   ./bin/ir.js export captable → a CSV of holders + shares in ir-workspace/exports/.
   Voting power traces to those share counts. Note quorum as
   [CONFIRM FROM BYLAWS] and show whether expected attendance meets it once known.

5. proxy-form.md — proxy appointment / written-consent form holders can return.

6. minutes.md — template: attendance, quorum check, each resolution's for/against/
   abstain tally, and the carried/failed outcome.

GUARDRAILS: this is process scaffolding, NOT legal advice — notice periods, quorum,
and resolution validity depend on jurisdiction and the company's governing docs;
flag them for counsel. Never invent share or vote counts — they trace to the
exported cap table. Local only; nothing sends without me.
```
