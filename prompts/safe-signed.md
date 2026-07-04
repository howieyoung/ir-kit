# SAFE signed / wired

```
[INVESTOR NAME] just [signed|signed and wired] a $[AMOUNT] post-money SAFE,
cap $[CAP], discount [X% or none], dated [DATE]. Contact: [NAME, EMAIL].

Update my IR Kit (read CLAUDE.md — these three must reconcile):
1. data/captable.json → add to safes[] with status [Signed|Wired].
2. data/crm.json → commitments[]: set their stage; investors[]: add/update the record;
   distribution[]: add them, segment "All investors" (or "Board/Major" if lead-sized).
3. Tell me: new total SAFE implied ownership %, how far that is from the 15% guardrail,
   and round progress (signed+wired vs target).
4. Add today's action items to ir-workspace/crm/next-actions.md:
   countersign + send executed doc, thank-you note, first update within 30 days.
Flag anything unusual about the terms vs my other SAFEs (different cap, discount, side letter).
```
