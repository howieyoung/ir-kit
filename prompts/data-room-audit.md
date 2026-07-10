# Data room audit

```
Audit my data room at ir-workspace/data-room/ (read CLAUDE.md).

1. Walk the folder tree and compare against the tier-1 / tier-2 checklists in
   public/js/content/playbooks.en.js (Data room doc).
2. For every checklist item: present ✅ / missing ❌ / present-but-stale ⚠️
   (undated files, or dated >6 months ago for financials).
3. Hard blockers first: IP assignments for every contractor and employee,
   executed SAFEs + all side letters, cap table export freshness, bank statement
   recency. These are the items that stall wires.
4. Check consistency: does the cap table export in the data room match
   data/captable.json? Does the metrics one-pager match data/financials.json?
   Inconsistent numbers across documents is the #1 diligence red flag.
5. Write the punch list to ir-workspace/data-room/AUDIT-[YYYY-MM-DD].md,
   ordered by blocker severity, each item with who/what/by-when.

Do not create placeholder documents — real gaps stay visibly open.
```
