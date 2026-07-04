# Monthly close

```
Close [MONTH YYYY] in my IR Kit (read CLAUDE.md for schemas).

Actuals:
- SaaS revenue: $[X]      - Ads/other revenue: $[X]
- Payroll: $[X]           - Infra: $[X]          - Other opex: $[X]
- Financing inflows: $[X or 0]
- Headcount: [N]
- Traction: [traffic/MAU X, pages/day X, platforms X, paying X — whatever your columns track]

Do:
1. Append the month row to data/financials.json (missing values = null, never invented).
2. Tell me: revenue MoM, 3-month avg burn, cash, runway months, and zero-cash date —
   and flag anything that moved >20% month-over-month with a one-line why-it-matters.
3. Compare against what last month's update promised (data/updates.json archive) and
   list any commitment I'm about to miss.
4. Save a close note to ir-workspace/financials/closes/[YYYY-MM].md with the numbers
   and flags, so the next close has a baseline.
Do not touch any other collection.
```
