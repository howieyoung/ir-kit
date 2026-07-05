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
1. Close it with the CLI (preferred): `./bin/ir.js close-month [YYYY-MM] --saas ... --ads ...`
   — it validates, appends, and returns the >20% MoM flags itself. Missing values stay
   unset, never invented. (Only edit data/financials.json directly if amending an
   existing month — then run `./bin/ir.js check`.)
2. Run `./bin/ir.js status` and tell me: revenue MoM, 3-month avg burn, cash, runway
   months, zero-cash date, plus a one-line why-it-matters for every flag from step 1.
3. Compare against what last month's update promised (data/updates.json archive) and
   list any commitment I'm about to miss.
4. Save a close note to ir-workspace/financials/closes/[YYYY-MM].md with the numbers
   and flags, so the next close has a baseline.
Do not touch any other collection.
```
