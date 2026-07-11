# Contributing to IR Kit

PRs welcome — from humans and from agents. CI enforces everything below, so read this once (agents: this file is part of your contract alongside [AGENTS.md](AGENTS.md)).

## The four promises every PR keeps

1. **Zero dependencies, no build step.** PRs adding packages will be rejected. The stdlib is enough.
2. **Local-first.** Nothing may send founder data anywhere. `data/` and `ir-workspace/` stay gitignored.
3. **Full language coverage.** Every user-facing UI string goes through `t()` with its key defined in **all six locales** (`en`, `zh-TW`, `ja`, `ko`, `es`, `fr`) — one file per locale in `public/js/i18n/`. Long-form content mirrors per locale in `public/js/content/`. CI runs `node scripts/check-i18n.js` and fails on any missing, extra, or empty key, missing content module, or checkbox-count mismatch. If you add or change a string, you translate it — machine translation reviewed for terminology is acceptable; missing locales are not. English is the canonical source; open an issue tagged `i18n` if a translation needs a native-speaker review.
   - **Terminology rule:** specialized finance acronyms and jargon (ARR, MRR, MoM, YoY, MOIC, NRR, P&L, FD, MFN, net burn, runway, post-money, SAFE, 409A…) keep the **English term first, followed by a local gloss in parentheses** on primary use — e.g. zh-TW「ARR（年化營收）」, ja「ARR（年換算収益）」, ko「ARR(연환산 매출)」, es «ARR (ingresos anualizados)», fr « ARR (revenu annualisé) ». Native full-word terms with an established local equivalent (e.g. 股權結構表 / 資本政策表 for cap table) may be fully localized. Data enum VALUES (`Signed`, `Wired`, segment names…) always stay English — only their display labels (`opt.*` keys) are translated; translating stored values breaks `ir check` invariants.
   - **Select options:** use `{ value, label }` pairs — value is the stored English enum, label is `t('opt.…')`.
4. **Docs stay generated.** Tutorial content lives in `public/js/guide.js`; run `npm run build-tutorial` after editing it (CI fails on a stale `docs/TUTORIAL.md`). Translated READMEs live in `docs/i18n/` — substantive README changes should be reflected there too.

## Where things go

- New operation → `core/ops.js` (invariants in code) → verb in `bin/ir.js` → documented in `AGENTS.md`, `docs/CLI.md`, and `ir help`.
- New page → `public/js/<name>.js` exporting `render<Name>(root)`, registered in `app.js`, nav link in `index.html` (+ `nav.*` key in all locales).
- Releases → bump `public/js/version.js` **and** `package.json` together, tag `vX.Y.Z`, publish a GitHub release.

## Verifying your change

```bash
node server.js                    # every page renders, zero console errors
./bin/ir.js check                 # data invariants
node scripts/check-i18n.js        # locale parity
npm run build-tutorial            # if you touched guide.js
```

## Reporting issues

Never include real financials, cap tables, or investor names — reproduce with the sample company (Settings → Reset to sample).
