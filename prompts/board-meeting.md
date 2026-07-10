# Organize a board meeting

Turn a date and a decision list into a runnable board meeting: a numbers pack from real actuals, an agenda that spends most of its time deciding (not narrating), a pre-read sent 72h ahead, resolutions drafted before the vote, and after-meeting minutes + action tracker. Numbers trace to the exported pack; the narrative is yours. Everything is local; invitations are drafts you send yourself.

```
Organize my board meeting (read AGENTS.md first).
Inputs: [DATE] · attendees [ATTENDEES] · [REGULAR | AD-HOC] · key decisions [KEY DECISIONS].
Work into ir-workspace/meetings/board/[YYYY-MM-DD]/.

1. Numbers pack. Run ./bin/ir.js export board-pack — real actuals from data/ →
   ir-workspace/exports/. Reference that file; never retype or alter its numbers.

2. agenda.md — timeboxed, with ≥50% of total time on DISCUSS/DECIDE items (the
   [KEY DECISIONS]), not status narration. Each item: owner, minutes, and whether
   it's for info / discussion / decision.

3. invitation.md — calendar note / invite text for [ATTENDEES] on [DATE].
   DRAFT ONLY — I send it; never auto-send.

4. pre-read-index.md — links the board pack + prior minutes + any decision memos,
   with a note to circulate 72 hours ahead.

5. resolutions.md — for anything needing a vote, draft the EXACT wording in advance
   (one resolution per decision, with the ask and the required approvers).

6. minutes.md — a template to fill live: attendance/quorum, decisions, and an
   action-item tracker (each action: owner + due date).

Privacy: local only. Numbers trace to the exported board pack; the narrative
(CEO letter, asks) is mine to write. Nothing sends without me.
```
