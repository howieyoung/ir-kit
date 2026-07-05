<!-- GENERATED from public/js/guide.js — edit there, then `npm run build-tutorial` -->
# IR Kit tutorial

The same guide that lives in the app (**Get started** in the sidebar), for reading on GitHub.

- [Use it yourself](#your-first-30-minutes) — the human track
- [Use it with your agent](#operating-ir-kit-with-your-agent) — the agent track
- [Cap table 101](#cap-table-101--the-ten-minute-version) — if SAFEs and dilution are new to you
- [Glossary](#glossary)

---

# Your first 30 minutes

IR Kit works on one loop: **enter what happened → the dashboard computes what matters → the update tells your investors.** Set it up once, then it's ~1 hour a month.

## 1. Make it yours (Settings, 3 min)
Set your company name, founder, email, round target, and the day of month your update goes out. Leave the **sample flag on** until your real data has replaced the sample everywhere — the amber SAMPLE pill in the sidebar is your reminder that nothing here is real yet.

## 2. Enter your financials (Financials, 10 min)
Set **opening cash** (bank balance before your first month), then one row per month: revenue split, payroll/infra/other costs, financing inflows, headcount, and your traction numbers. Missing something? Leave it blank — never guess. The computed columns (revenue, costs, P&L, cash) and the dashboard update as you type.

Start with the last 6–12 months if you have them: history is what makes your MoM and runway numbers credible.

## 3. Enter your cap table (Cap Table, 10 min)
- **Stakeholders:** founder shares, allocated options, unallocated pool — from your incorporation docs, not memory.
- **SAFE ledger:** every SAFE ever signed: principal, cap, discount, date, status. If you're not sure of a term, get the executed PDF and check — "not sure" on your own cap table is the thing diligence punishes hardest.
- New to this? Read the **Cap table 101** tab first.

## 4. Set up your investors (Investor CRM, 5 min)
Add current investors, then everyone who should receive updates (Update distribution tab, with segments). If you're raising, add your pipeline to Round commitments.

## 5. Send your first update (Updates, ongoing)
The composer pre-fills your real metrics — fill the brackets, cut to a 3-minute read, send via the BCC button, then **Mark sent → archive**. The archive is the point: a future lead investor will read it back-to-back, and an unbroken streak is the cheapest credibility a startup can own.

## The monthly rhythm from here
| When | What | Where |
|---|---|---|
| Month-end + 10 days max | Close the month | Financials |
| Same day | Check burn/runway/flags | Dashboard |
| Update day (you set it) | Send the update | Updates |
| Any SAFE signed | Ledger + CRM + distribution, same day | Cap Table + CRM |
| Quarterly | Board/investor-council pack | Playbooks → Board pack |

Download the calendar file in Updates to put this rhythm in your actual calendar.

---

# Operating IR Kit with your agent

The browser UI and your coding agent (Claude Code, Cursor, etc.) read and write the **same JSON files** in `data/`. You click; the agent edits files; both see the same truth. That's the design: you make the calls, the agent does the clerical work — that's your "IR team of ten".

## Setup (once)
1. Run your agent in the repo folder. It will find [CLAUDE.md](CLAUDE.md) automatically — that file teaches it the data schemas, the reconciliation rules, and the privacy guardrails.
2. Scaffold your private document workspace: `node scripts/init-workspace.js` — data-room folders, board records, meeting briefs. It's gitignored; your agent files documents into it.

## The rituals (prompts/)
Each recurring IR task has a canonical prompt in [prompts/](prompts/) — copy, fill the brackets, paste:

| Prompt | What the agent does |
|---|---|
| `monthly-close.md` | Appends the month, computes burn/runway, flags >20% moves, checks promises from last update |
| `safe-signed.md` | Updates cap table + CRM + distribution in one reconciled pass, checks the 15% SAFE guardrail |
| `draft-update.md` | Writes the YC-format update from real numbers only, keeps metric continuity with the archive |
| `meeting-prep.md` | One-page brief: history with this investor, numbers to know cold, their 3 hardest questions |
| `data-room-audit.md` | Walks your data room against the tier checklists, outputs a punch list by blocker severity |
| `round-kickoff.md` | Models the raise, seeds the CRM pipeline, builds the batch-process round plan |

## Put the agent on a schedule
The real leverage: the draft is waiting for you on update day instead of you remembering to start. With Claude Code, for example:

```
# crontab: 9am on the 3rd of each month — draft the update from last month's close
0 9 3 * * cd ~/ir-kit && claude -p "$(cat prompts/draft-update.md)" >> ir-workspace/updates/drafts/cron.log
```

Or use your agent's built-in scheduled tasks / the schedule feature in Claude Code. Details and safety notes: [prompts/schedule-updates.md](prompts/schedule-updates.md).

## Guardrails your agent already knows (CLAUDE.md)
- **Never invent a number.** Missing data stays null.
- **Reconcile the three:** a signed SAFE touches cap table + CRM + distribution together.
- **Privacy:** `data/` and `ir-workspace/` never leave the machine, never get committed, never get pasted into hosted tools.

---

# Cap table 101 — the ten-minute version

Never seen a cap table before? This is the minimum to use the Cap Table page confidently. (Planning knowledge, not legal advice.)

## The basics
Your **cap table** is the list of who owns what. Ownership is counted in **shares**; your percentage is your shares divided by all shares — on a **fully diluted** basis, which includes the **option pool** (shares reserved for future employees) even though nobody holds them yet. That's the honest denominator, and it's the one investors use.

## SAFEs, in plain terms
A **SAFE** is money now for shares later: the investor wires cash today and gets shares when you raise a **priced round**. The key term is the **valuation cap** — on the standard **post-money SAFE**, the investor's ownership right before your priced round is simply:

**implied ownership = principal ÷ post-money cap** (e.g. $100K at an $8M cap = 1.25%)

That's why the SAFE ledger shows "implied %". Two rules of thumb the kit enforces visually:
- Keep **total SAFE implied ownership under ~15%** before you price a round — post-money SAFEs stack, and **founders alone absorb** that dilution.
- Keep every SAFE on the **same terms**. A stack of different caps is a diligence mess and signals weak conviction.

A **discount** (e.g. 20%) lets the SAFE convert at a cheaper price than new investors pay; if there's both a cap and a discount, the investor gets whichever is better for them.

## What the Round modeler shows
When you eventually raise a priced round, three things happen at once: SAFEs convert to shares, the option pool usually gets **topped up** to a target %, and new investors buy in. Everyone's percentage moves. The modeler does that math with real post-money SAFE mechanics — change the pre-money valuation, raise amount, and pool target, and watch who ends up with what. Founders: check the **dilution scenarios** tab — if you land under ~50% going into Series A, your round sizes or caps need rethinking *now*, not at the term sheet.

## What the Exit waterfall shows
Investors typically hold **preferred** stock with a **1x liquidation preference**: at a sale, they take back their money first *or* convert to their ownership percentage — whichever pays more. The waterfall shows who gets what at different sale prices, including where common (you and your team) starts seeing real money. **MOIC** is the investor's multiple on invested capital.

## The three numbers to know cold in any investor meeting
1. Total SAFE implied ownership today.
2. Founder % after the next priced round (base scenario).
3. Your runway in months.

All three are on screen in this kit within two clicks. "I'll get back to you" on your own cap table ends meetings.

---

# Glossary

| Term | Meaning |
|---|---|
| ARR run-rate | Current month revenue × 12. Not the same as contracted ARR — label honestly |
| Burn (net) | Costs minus revenue for a month; financing inflows excluded |
| Cap (valuation cap) | The valuation used to convert a SAFE — lower cap = more shares for the investor |
| Data room | The organized folder of documents an investor reviews in diligence |
| Dilution | Your % shrinking as new shares are issued to investors/pool — your share *count* doesn't change |
| Discount | SAFE converts at (1 − discount) × the round price; investor gets better of cap or discount |
| Fully diluted (FD) | Share count including all options and the unissued pool — the honest denominator |
| Liquidation preference | Preferred investors get their money back first at an exit (1x non-participating = money back OR convert, not both) |
| MFN | "Most favored nation" side letter — if a later investor gets better terms, this one gets them too. Why secret side deals always surface |
| MoM | Month-over-month growth. State the averaging window when quoting an average |
| MOIC | Multiple on invested capital — investor's payout ÷ what they put in |
| Option pool | Shares reserved for future team grants; topped up at rounds, usually diluting founders |
| Post-money SAFE | The standard (2018+) YC SAFE: ownership locked at principal ÷ cap immediately pre-round |
| Post-money / pre-money | Company value after / before the new money comes in: post = pre + raise |
| Pro-rata | An investor's right to invest again to maintain their % in future rounds |
| Priced round | Equity financing at a negotiated share price (seed, Series A…) — when SAFEs convert |
| Runway | Cash ÷ average monthly burn = months until zero cash |
| SAFE | Simple Agreement for Future Equity — cash now, shares at the next priced round |
| Side letter | Extra terms granted to one investor alongside their SAFE — must be disclosed in diligence |
| 409A | Independent valuation of common stock; required before granting options in the US |
