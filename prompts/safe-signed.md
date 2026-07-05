# SAFE signed / wired

```
[INVESTOR NAME] just [signed|signed and wired] a $[AMOUNT] post-money SAFE,
cap $[CAP], discount [X% or none], dated [DATE]. Contact: [NAME, EMAIL].

Update my IR Kit (read AGENTS.md):
1. One command does the three-way reconciliation (cap table + CRM commitment +
   distribution list):
   `./bin/ir.js safe add "[INVESTOR]" --principal [N] --cap [N] --status [Signed|Wired]
    --email [E] --contact "[NAME]"`
2. From its output, tell me: implied ownership, total SAFE overhang vs the 15%
   guardrail, and round progress (signed+wired vs target).
3. Run `./bin/ir.js check` to confirm everything reconciles.
4. Add today's action items to ir-workspace/crm/next-actions.md:
   countersign + send executed doc, thank-you note, first update within 30 days.
Flag anything unusual about the terms vs my other SAFEs (different cap, discount, side letter).
```
