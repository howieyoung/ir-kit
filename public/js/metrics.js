// Shared financial + cap table math. Pure functions — the numbers investors see all come from here.

// ---------- financials ----------
// month rows: { month:"YYYY-MM", saas, ads, payroll, infra, other, inflow, headcount, traffic, pages, platforms, paying }
export function derive(fin) {
  const rows = [...(fin.months || [])].sort((a, b) => a.month.localeCompare(b.month));
  let cash = fin.openingCash ?? 0;
  return rows.map((m) => {
    const revenue = n(m.saas) + n(m.ads);
    const costs = n(m.payroll) + n(m.infra) + n(m.other);
    const hasData = ['saas', 'ads', 'payroll', 'infra', 'other'].some((k) => m[k] !== null && m[k] !== undefined);
    const pnl = hasData ? revenue - costs : null;
    if (pnl !== null) cash += pnl + n(m.inflow);
    return { ...m, revenue: hasData ? revenue : null, costs: hasData ? costs : null, pnl, cash: hasData ? cash : null };
  });
}

export function latestMetrics(fin) {
  const d = derive(fin).filter((m) => m.pnl !== null);
  if (!d.length) return null;
  const cur = d[d.length - 1];
  const prev = d.length > 1 ? d[d.length - 2] : null;
  const yoy = d.find((m) => sameMonthLastYear(m.month, cur.month));
  const last3 = d.slice(-3);
  const burn3 = last3.reduce((s, m) => s + m.pnl, 0) / last3.length;
  const runway = burn3 >= 0 ? Infinity : cur.cash / -burn3;
  return {
    month: cur.month, revenue: cur.revenue,
    mom: prev && prev.revenue ? (cur.revenue - prev.revenue) / prev.revenue : null,
    arrRunRate: cur.revenue * 12,
    saasShare: cur.revenue ? n(cur.saas) / cur.revenue : null,
    pnl: cur.pnl, burn3, cash: cur.cash, runway,
    zeroCash: runway === Infinity ? null : addMonths(cur.month, Math.floor(runway)),
    traffic: cur.traffic ?? null,
    trafficYoY: yoy && yoy.traffic ? (cur.traffic - yoy.traffic) / yoy.traffic : null,
    pages: cur.pages ?? null, platforms: cur.platforms ?? null, paying: cur.paying ?? null,
    headcount: cur.headcount ?? null,
    series: d,
  };
}

const n = (v) => (v === null || v === undefined || isNaN(v) ? 0 : Number(v));
function sameMonthLastYear(a, b) {
  const [ya, ma] = a.split('-'), [yb, mb] = b.split('-');
  return ma === mb && Number(ya) === Number(yb) - 1;
}
export function addMonths(ym, k) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + k, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ---------- cap table ----------
export function capTotals(cap) {
  const shares = cap.stakeholders.reduce((s, r) => s + n(r.shares), 0);
  const poolShares = cap.stakeholders.filter((r) => r.type === 'Pool').reduce((s, r) => s + n(r.shares), 0);
  return { shares, poolShares };
}

export const safeImpliedPct = (s) => (n(s.principal) > 0 && n(s.cap) > 0 ? s.principal / s.cap : null);

// Priced-round model, post-money SAFE percentage method (see docs in the Playbooks tab):
//  - each post-money SAFE locks Principal/Cap immediately pre-round, then dilutes by (new money + pool top-up)
//  - effective cap = min(cap, (1-discount) x round post-money) when a discount exists
//  - pool top-up solved in closed form so post-round unallocated pool hits the target %
export function modelRound(cap, { preMoney, newMoney, poolTarget }) {
  const { shares: E, poolShares } = capTotals(cap);
  const post = preMoney + newMoney;
  if (!E || !post) return null;
  const nPct = newMoney / post;

  const safes = cap.safes.filter((s) => n(s.principal) > 0).map((s) => {
    const capV = n(s.cap), disc = n(s.discount);
    let eff = null;
    if (capV > 0 && disc > 0) eff = Math.min(capV, (1 - disc) * post);
    else if (capV > 0) eff = capV;
    else if (disc > 0) eff = (1 - disc) * post;
    return { ...s, effCap: eff, prePct: eff ? s.principal / eff : 0 };
  });
  const S = safes.reduce((t, s) => t + s.prePct, 0);

  const e = (poolShares / E) * (1 - S); // existing unallocated pool as % of pre-round company (post SAFE conversion)
  const dp = Math.max(0, (poolTarget - e * (1 - nPct)) / (1 - e || 1)); // pool top-up, % of post
  const k = 1 - nPct - dp; // dilution factor on all pre-round holders
  const T = E / ((1 - S) * k); // total post-round fully-diluted shares
  const pps = post / T;

  const rows = [];
  for (const st of cap.stakeholders) {
    rows.push({ name: st.name, group: 'existing', shares: n(st.shares), pct: n(st.shares) / T });
  }
  for (const s of safes) {
    const pct = s.prePct * k;
    rows.push({ name: `${s.investor} (SAFE)`, group: 'safe', shares: pct * T, pct });
  }
  if (dp > 0) rows.push({ name: 'Pool top-up (new)', group: 'pool', shares: dp * T, pct: dp });
  rows.push({ name: 'New investors', group: 'new', shares: nPct * T, pct: nPct });
  const total = rows.reduce((t, r) => t + r.pct, 0);
  return { post, nPct, S, e, dp, k, T, pps, rows, total };
}

// Sequential dilution walk: SAFE round -> Seed -> Series A (planning approximation)
export function dilutionWalk(founderPct, sc) {
  const afterSafe = founderPct * (1 - (sc.safeRaised && sc.safeCap ? sc.safeRaised / sc.safeCap : 0));
  const afterSeed = afterSafe * (1 - (sc.seedMoney && sc.seedPost ? sc.seedMoney / sc.seedPost : 0) - n(sc.seedPool));
  const afterA = afterSeed * (1 - (sc.aMoney && sc.aPost ? sc.aMoney / sc.aPost : 0) - n(sc.aPool));
  return { afterSafe, afterSeed, afterA, valueAtA: afterA * n(sc.aPost) };
}

// 1x non-participating waterfall at a given exit value
export function waterfall(exit, { prefInvested, prefPct, founderPct, multiple = 1 }) {
  const preference = prefInvested * multiple;
  const asConverted = prefPct * exit;
  const prefTake = Math.max(Math.min(exit, preference), asConverted);
  const common = exit - prefTake;
  const founder = common <= 0 ? 0 : common * (founderPct / (1 - prefPct));
  return { prefTake, converts: asConverted > Math.min(exit, preference), common, founder, moic: prefInvested ? prefTake / prefInvested : null };
}
