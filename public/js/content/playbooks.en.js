// English playbook content — the CANONICAL source. Translations live in
// playbooks.<locale>.js exporting DOCS with the SAME ids, order, and checkbox counts
// (checklist state is keyed by docId:index — reordering or resizing breaks user ticks).
// Playbook content — condensed operating doctrine. Tailor freely (or have your agent do it).
// Checkbox state persists to the checklists collection keyed by doc id + position,
// so REORDERING checklist items resets their ticks. Append new items at the end.

export const DOCS = [
  {
    id: 'updates',
    title: 'Update doctrine',
    md: `# Investor update doctrine

**Cadence:** monthly, same date every month (the 5th, after close, works). The unbroken streak itself is the trust asset a future lead diligences. Never skip a bad month — going dark is read, correctly, as bad news.

## Writing rules
1. **Metrics first, narrative second.** Investors scan the table before reading a word.
2. **Same metrics, same order, every month.** Changing definitions mid-stream torches credibility. If one must change, flag old vs. new explicitly.
3. **Lowlights are mandatory.** Investors judge founders more on lowlight quality than highlight quality. Problem + what you learned + what changes = operating maturity.
4. **Asks are the ROI.** "Intro to the head of audience at Condé Nast" gets action; "intros to media companies" gets ignored. 1–3 asks max.
5. **3-minute read.** Cut until it hurts.

## Segments
| Segment | Who | Gets |
|---|---|---|
| Board/Major | Leads, board, observers | Full update + financial detail |
| All investors | Every SAFE holder | Full monthly update |
| Prospect nurture | "Too early" passes | The same update — 6 months of 80% MoM converts a pass into a warm second meeting |

Send BCC or mail-merge only — CC leaks your cap table and prospect list at once.

## The diligence lens
A lead will read your entire archive in one sitting and grade: Do the same metrics appear every month? Did stated plans happen? Did lowlights surface before they became crises? Do asks get specific and loops get closed? Write every update for that reader.`,
  },
  {
    id: 'fundraising',
    title: 'Fundraising process',
    md: `# Fundraising playbook — run it like a batch, not a drip

The #1 pre-seed failure mode is sequential outreach over six months. Compress instead:

## Prep gate — do not book meetings until all true
- [ ] Data room tier 1 complete (see Data room tab)
- [ ] Deck + memo dated, numbers consistent everywhere
- [ ] FAQ answers rehearsed (see Investor FAQ tab)
- [ ] CRM round-commitments tab live

## The batch
- **Weeks 1–2:** warm intros + top-priority funds, 15–20 first meetings inside a 2-week window. Density creates urgency; urgency moves terms.
- **Weeks 3–4:** second tier + "give me a few weeks" people. Announce first soft-circles ("we're at $200K of $500K").
- **Weeks 5–6:** hard deadline. SAFEs close rolling — never let a committed check wait.
- **Every Friday:** update commitments, send a 3-line status note to soft-circled investors.

## Meeting → close mechanics
1. First meeting → same-day follow-up with memo + a specific next step.
2. Serious interest → data room access, logged in CRM.
3. Verbal yes → SAFE via DocuSign within 24h, wire details in the same email.
4. Signed + wired → same day: countersigned doc, thank-you, added to update list, entered in cap table.
5. Pass → thank them, ask what would change their mind, move to prospect-nurture. A pass + a strong update streak is the warmest seed lead you'll ever get.

## Cap discipline
- Uniform terms for every check. A stack of SAFEs at different caps is a diligence mess and signals weak conviction.
- Post-money SAFEs stack — founders absorb 100% of that dilution. Keep total SAFE ownership under ~15% before pricing a round (the cap table tab computes it live).
- Never say a fund's name to another fund without permission. Never inflate committed numbers — funds compare notes.
- Answer every diligence question within 24h; latency reads as how you'll treat them post-investment.`,
  },
  {
    id: 'dataroom',
    title: 'Data room',
    md: `# Data room checklist

Host on a permissioned drive or DocSend. Every doc dated and versioned. Track who has access.

## Tier 1 — current round (have ready NOW)
- [ ] One-pager / investment memo
- [ ] Pitch deck (dated)
- [ ] Product demo video or sandbox access
- [ ] Certificate of incorporation + good standing
- [ ] Metrics summary with written definitions
- [ ] Usage/traffic evidence (investors WILL verify the headline number)
- [ ] Client list: paying vs. free, contract type; renewals highlighted
- [ ] Revenue detail: monthly series behind the growth claim
- [ ] Current cap table export
- [ ] All executed SAFEs + side letters (undisclosed side letters blow up trust — MFN clauses surface them anyway)
- [ ] Form of SAFE for this round
- [ ] Bank statement supporting stated cash
- [ ] IP assignments: founder + every engineer + every contractor (the #1 pre-seed diligence trip-wire)

## Tier 2 — priced-round room (build over the next 6 months)
- [ ] Bylaws, all board/stockholder consents
- [ ] Stock ledger + 409A (required before option grants)
- [ ] Option plan + grant paperwork
- [ ] Prior financing docs incl. accelerator terms
- [ ] Customer contracts (top 10 + form agreement)
- [ ] Revenue recognition policy
- [ ] Churn/renewal history, documented
- [ ] Employment agreements, full IP chain, trademark filings
- [ ] 18-month operating model with sourced assumptions`,
  },
  {
    id: 'board',
    title: 'Board pack',
    md: `# Board / investor-council pack

No formal board yet? Run this quarterly with major investors anyway — the muscle and the paper trail both pay off at the priced round.

**Send the pack 72 hours ahead. Never present slides that weren't pre-read — meeting time is for discussion, not narration.** Target ≥50% of the agenda on Discuss/Decide items.

## Agenda skeleton (60–90 min)
| Time | Item | Type |
|---|---|---|
| 0:00 | CEO framing: the one thing that matters this quarter | Inform |
| 0:05 | Metrics & financial review (pre-read Q&A only) | Inform |
| 0:15 | Deep dive 1: the hardest strategic question right now | **Discuss** |
| 0:35 | Deep dive 2 | **Discuss** |
| 0:50 | Fundraising / cash strategy | Discuss |
| 0:60 | Asks, approvals, formal consents | **Decide** |

## CEO letter (1 page, prose)
State of the company in 3 sentences · what I said last quarter vs. what happened · the 1–2 decisions I need help making · what keeps me up at night.

## Minutes (circulate within 48h)
Decisions made (numbered, exact wording) · consents passed · action items (owner + deadline) · topics discussed (2–3 lines each — not a transcript).

## Consent & resolution log
Log every corporate action from day one: SAFE issuances, option grants, 409A adoptions. At the priced round, counsel asks for all of it — a maintained log turns three weeks of archaeology into an hour.`,
  },
  {
    id: 'faq',
    title: 'Investor FAQ',
    md: `# The hard questions — answer frames

Fill with current facts before each meeting; keep answers ~45 seconds.

**"Big traffic, small revenue — why?"** Own it as sequencing, not failure. Distribution asset first, monetization switched on at [date] — the MoM curve shows it working now. The honest version disarms; the defensive version disqualifies.

**"Defend your ads-upside assumptions."** Measured beats modeled: lead with actual campaign data, label everything else as modeled. Never let a modeled number pass as a measured one — that's the credibility moment of the meeting.

**"Solo founder risk?"** They're really asking whether you can recruit a bench. Durability evidence + real system ownership across the team + named mitigation (documentation, redundancy, retention equity).

**"Why won't platforms build this themselves / use an off-the-shelf community?"** Name the wedge (embedded-native, zero data leakage) and the moat (the data asset generated in-product). Have one customer anecdote where you won exactly this comparison.

**"What are your existing investors' terms?"** Instant, precise answer — hesitation is the red flag. Ledger exportable on request.

**"Why this amount?"** The raise must reach a milestone that prices the next round, not just extend survival. Cite the runway scenario table.

**"What happens to all these SAFEs at the priced round?"** Do the conversion math live from the Round Modeler. A founder who knows their own dilution cold earns more trust than any deck slide.

**Meta-rule:** any metric question should be answerable from this kit in 30 seconds. "I'll get back to you" on your own numbers ends meetings.`,
  },
  {
    id: 'metrics',
    title: 'Metric definitions',
    md: `# Metric definitions — the diligence answer sheet

| Metric | Definition | Pitfall |
|---|---|---|
| Total revenue | Recognized SaaS + ads revenue in the month | Never blend credits or grants into revenue |
| ARR run-rate | Current month revenue × 12 | Don't call run-rate "ARR" to a SaaS investor |
| Contracted ARR | Annualized value of signed annual contracts only | Report both when they diverge |
| MoM growth | Month-over-month % change in total revenue | State the averaging window for any "avg MoM" claim |
| Traffic | Unique monthly visits where the product actually rendered | Loaded-and-rendered, not script-included |
| Net burn | Costs minus revenue, cash basis | Exclude financing inflows from burn |
| Runway | Cash ÷ 3-month average net burn | Last-month burn flatters the number; use the average |
| NRR | Net revenue retention across annual cohorts | Start logging cohorts now so the Series A dataset exists |

When a definition changes: version it here, flag old vs. new in the next update, restate the prior month in both.`,
  },
];
