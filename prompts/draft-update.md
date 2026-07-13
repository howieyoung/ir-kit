# Draft the monthly investor update

```
Draft my [MONTH] investor update (read CLAUDE.md).

Start from the deterministic skeleton: run `./bin/ir.js update draft` — it writes the
metrics-filled template to ir-workspace/updates/drafts/ (or a BLOCKED note if the month
isn't closed). Your job is the narrative on top of it.

Sources — use ONLY these, never invent a number:
- Metrics: derive from data/financials.json (latest month vs prior; 3-mo avg burn).
- Fundraising line: data/crm.json commitments (signed+wired vs data/company.json roundTarget).
- Thanks section: crm asks[] with status Delivered and thanked=false.
- Continuity: read the last 2 updates in data/updates.json archive — keep the same
  metric set and order, and follow up on anything I said I'd do.

This month's raw material (turn into highlights/lowlights, don't editorialize into hype):
- Wins: [...]
- Problems: [...]
- Shipped: [...]
- The ask: [specific person/company/role]

Format: TL;DR / metrics table / highlights / lowlights / product / fundraising
/ asks / thanks — under 3 minutes to read. Lowlights must be real.
Write it to ir-workspace/updates/drafts/[YYYY-MM].md for my edit — do NOT add it to the
archive; I archive from the web UI after sending.
```
