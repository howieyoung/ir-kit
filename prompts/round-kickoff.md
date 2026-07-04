# Round kickoff

```
I'm kicking off a raise: $[TARGET] on [post-money SAFEs at $[CAP] cap | priced round],
target close [DATE]. (Read CLAUDE.md.)

1. data/company.json → set roundTarget and roundInstrument.
2. data/captable.json → model it: add placeholder SAFEs at ticket size $[X] to the
   ledger (status Target), then tell me total SAFE overhang % if fully subscribed and
   founder % after the NEXT priced round (dilution scenarios, base case). If founders
   land under 50% before Series A, say so loudly and suggest cap/size alternatives.
3. data/crm.json → commitments[]: seed rows for my target list: [PASTE LIST or point
   to file], stage Contacted, with source and owner.
4. ir-workspace/fundraising/ → create round-plan.md from the batch process in the
   fundraising playbook: prep-gate checklist, wave 1/wave 2 dates working back from
   the close date, and the Friday status-note ritual.
5. Run the data-room-audit prompt and put its punch list at the top of round-plan.md —
   the prep gate stays closed until tier-1 is complete.
```
