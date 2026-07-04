# Investor meeting prep

```
I'm meeting [INVESTOR / FUND, PARTNER NAME] [today|on DATE] — [first meeting | follow-up | diligence].

Prep me from local data only (read CLAUDE.md):
1. History: everything about them in data/crm.json (interactions, commitments stage,
   asks) and ir-workspace/crm/notes/[investor].md if it exists.
2. Numbers I must know cold — from data/financials.json and data/captable.json:
   latest revenue + MoM, burn, cash, runway; total SAFE implied %; round progress.
3. The 3 hardest questions THIS investor will ask, given their stage and what they
   probed last time — with 45-second answer frames from the playbooks FAQ style.
4. My goal for the meeting and the one specific next step to ask for.

Output a one-page brief to ir-workspace/crm/meeting-briefs/[YYYY-MM-DD]-[investor].md.
After the meeting I'll dictate notes — then log the interaction in data/crm.json and
set the follow-up with a due date.
```
