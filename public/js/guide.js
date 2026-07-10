// The Get-started guide: human track, agent track, and a founder's glossary.
// docs/TUTORIAL.md is generated from these exports (npm run build-tutorial) — edit here, then regenerate.
import { el, tabs } from './ui.js';
import { markdown } from './playbooks.js';
import { renderSetupProgress } from './onboarding.js';

export function renderGuide(root) {
  root.append(el('h1', {}, 'Get started'));
  root.append(el('p', { class: 'page-sub' }, 'Two ways to run this kit: with a coding agent doing the clerical work, or yourself in the browser. Most founders end up doing both.'));
  root.append(renderSetupProgress());
  root.append(tabs([
    { label: 'Use it with your agent', render: () => doc(GUIDE_AGENT, 'guide-agent') },
    { label: 'Use it yourself', render: () => doc(GUIDE_HUMAN, 'guide-human') },
    { label: 'Cap table 101', render: () => doc(CAPTABLE_101, 'guide-cap101') },
    { label: 'Glossary', render: () => doc(GLOSSARY, 'guide-glossary') },
  ]));
}

function doc(md, id) {
  const box = el('div', { class: 'section doc' });
  box.append(...markdown(md, id));
  return box;
}

export const GUIDE_HUMAN = `# Your first 30 minutes

IR Kit works on one loop: **enter what happened → the dashboard computes what matters → the update tells your investors.** Set it up once, then it's ~1 hour a month.

> Working with a coding agent? You can skip most of the manual entry below — hand it [prompts/onboard.md](prompts/onboard.md) and it populates the system from your real documents, with your consent at every step. See the "Use it with your agent" tab.

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

Download the calendar file in Updates to put this rhythm in your actual calendar.`;

export const GUIDE_AGENT = `# Operating IR Kit with your agent

Your coding agent (Claude Code, Codex, Cursor, etc.) is a **peer of this UI**, not a hack on top of it. It works through the \`ir\` command line, which enforces the same rules this interface does — you make the calls, the agent does the clerical work. That's your "IR team of ten".

## From download to a real dashboard — the ideal first hour
1. **Get the kit:** \`git clone https://github.com/howieyoung/ir-kit && cd ir-kit\`
2. **Start the app:** \`node server.js\` → http://127.0.0.1:4820 — it runs immediately with a sample company.
3. **Open your coding agent in the repo folder** (Claude Code, Codex, Cursor…). It reads [AGENTS.md](AGENTS.md) automatically — the contract with the capability map, schemas, and privacy guardrails.
4. **Hand it the onboarding ritual:** *"Read prompts/onboard.md and take over my IR data setup."*
5. **It asks before touching anything:** which folders it may scan (appointed folders recommended — you stay in control), then runs \`ir scan\` — filenames only, no contents read — and reviews the candidate documents with you.
6. **You approve; it does the clerical work:** organizes approved files into your private data room, extracts your real cap table, SAFEs, and monthly financials — every number cited to a source document, ambiguities parked in an open-questions list instead of guessed.
7. **It verifies before showing you anything:** \`ir check\` must pass clean, then it walks you through the dashboard against the citations.
8. **You confirm the numbers** → the sample flag comes off → reload: your company, real data.

From then on it's the monthly rhythm — the rituals and schedule below.

## The full IR-master journey
You don't need to know investor relations — you delegate each job to your agent in plain English. The whole arc, and the ritual behind each step:

| You want to… | Say to your agent | Ritual |
|---|---|---|
| Set up from your real docs | "Read prompts/onboard.md and take over my IR setup" | \`onboard.md\` |
| Build a clean data room | "Audit my data room against the checklists" | \`data-room-audit.md\` |
| **Find fitted investors + reach out** | "Read prompts/investor-sourcing.md and find investors that fit us" | \`investor-sourcing.md\` |
| Prep for an investor meeting | "Prep me for my meeting with [investor]" | \`meeting-prep.md\` |
| Send the monthly update | "Draft this month's investor update" | \`draft-update.md\` |
| **Run a board meeting** | "Read prompts/board-meeting.md and organize my [date] board meeting" | \`board-meeting.md\` |
| **Run a shareholder / AGM meeting** | "Read prompts/shareholder-meeting.md and prepare my AGM" | \`shareholder-meeting.md\` |
| Kick off a raise | "Model my round and build the pipeline plan" | \`round-kickoff.md\` |

Everything runs on your machine, cites your real numbers, and drafts nothing it will send without you.

## The interface: the ir CLI
Full reference with examples: [docs/CLI.md](docs/CLI.md).

\`\`\`
# read
ir status [--json]    every derived metric in one call — ground yourself first
ir check              the test suite — run after ANY direct edit to data/*.json
ir model round --pre 12000000 --new 3000000    priced-round SAFE conversion

# write (invariants enforced)
ir close-month 2026-07 --saas 31000 --ads 14000 --payroll 34000 ...
ir safe add "Fund X" --principal 50000 --cap 8000000 --status Signed
ir prospect add "Acme Capital" --fit "leads pre-seed dev-tools" --source "<url>"
ir update draft | mark-sent

# onboarding & artifacts
ir scan <folders>     candidate financial docs — filenames only, never opened
ir export board-pack | tearsheet | captable
ir schedule show      cron lines for the monthly rituals
\`\`\`

Three rules the agent follows (and you should too):
1. **Prefer \`ir\` verbs over editing JSON** — one \`safe add\` reconciles the cap table, CRM commitment, investor record, and distribution list; a raw edit can silently break them apart.
2. **After any direct JSON edit, run \`ir check\`** — exit 1 means an invariant broke; fix before anything else.
3. **Never invent a number.** Missing data stays null; unclosed months block the update draft.

## The rituals (prompts/)
Each recurring IR task has a canonical prompt in [prompts/](prompts/) — copy, fill the brackets, paste. They route through the CLI verbs:

| Prompt | What the agent does |
|---|---|
| \`onboard.md\` | **Start here** — consent-gated: scans your folders, organizes the data room, populates real data with a citation per number |
| \`investor-sourcing.md\` | Researches fitted investors, logs each with \`ir prospect add\` (fit + source), drafts personalized outreach — never sends |
| \`monthly-close.md\` | \`ir close-month\` + explains every flag it raises, checks promises from last update |
| \`safe-signed.md\` | \`ir safe add\` + guardrail report + same-day action items |
| \`draft-update.md\` | \`ir update draft\` for the skeleton, then writes the narrative from your raw material |
| \`meeting-prep.md\` | One-page brief: history with this investor, numbers to know cold, their 3 hardest questions |
| \`board-meeting.md\` | \`ir export board-pack\` + agenda, invitation, pre-read, resolutions, and a minutes template |
| \`shareholder-meeting.md\` | AGM/EGM notice, agenda, resolutions, cap-table voting sheet, proxy form, minutes |
| \`data-room-audit.md\` | Walks your data room against the tier checklists, outputs a punch list by blocker severity |
| \`round-kickoff.md\` | Models the raise, seeds the CRM pipeline, builds the batch-process round plan |

## Put it on a schedule
The mechanical part doesn't even need an agent — \`ir update draft\` is deterministic:

\`\`\`
# crontab -e   (or: ir schedule show)
0 9 1 * *  cd ~/ir-kit && ./bin/ir.js status          # 1st: close reminder
0 9 3 * *  cd ~/ir-kit && ./bin/ir.js update draft    # 3rd: draft waiting for review
0 9 * * 1  cd ~/ir-kit && ./bin/ir.js check           # Mondays: data integrity
\`\`\`

Add an agent run on top to fill in the narrative (highlights/lowlights) — recipes and safety rules in [prompts/schedule-updates.md](prompts/schedule-updates.md). Drafts never auto-send: the review and the send stay yours.

## Extending the kit
The codebase is deliberately agent-editable: dependency-free vanilla JS, no build step. Ask your agent for a new module ("add ESOP tracking", "multi-currency support") and point it at [AGENTS.md](AGENTS.md) — the conventions are written down: new operations go in \`core/ops.js\` and get a CLI verb, the math lives in \`public/js/metrics.js\`, new pages register in \`app.js\`. Keep the kit's promise when extending: zero dependencies, local-first, and \`ir check\` still passes.`;

export const CAPTABLE_101 = `# Cap table 101 — the ten-minute version

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

All three are on screen in this kit within two clicks. "I'll get back to you" on your own cap table ends meetings.`;

export const GLOSSARY = `# Glossary

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
| 409A | Independent valuation of common stock; required before granting options in the US |`;
