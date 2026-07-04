// Sample dataset — a FICTIONAL pre-seed company profile for exploring the kit.
// "Protico" is used as the sample brand with permission; every number, investor,
// and contact below is invented and demonstrates the data shapes, nothing more.
// Replace via the UI (Settings), a JSON import, or by pointing your agent at data/.

const months2025 = {
  saas: [400, 550, 800, 1200, 1700, 2400, 3200, 4200, 5500, 7000, 8800, 11000],
  ads: [100, 150, 250, 400, 650, 950, 1300, 1800, 2400, 3100, 3900, 5000],
  payroll: [7000, 7000, 7000, 7000, 7000, 7000, 11000, 11000, 11000, 11000, 11000, 11000],
  infra: [900, 900, 900, 900, 900, 900, 1800, 1800, 1800, 1800, 1800, 1800],
  other: Array(12).fill(800),
  inflow: [0, 0, 0, 0, 150000, 0, 0, 0, 0, 0, 0, 0],
  headcount: [3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4],
  traffic: [2, 2.6, 3.4, 4.5, 5.8, 7.5, 9.6, 12, 15, 19, 24, 30].map((x) => Math.round(x * 1e6)),
  pages: [50, 65, 85, 110, 145, 190, 240, 300, 370, 450, 530, 600].map((x) => x * 1e3),
  platforms: [5, 6, 8, 10, 12, 15, 18, 21, 25, 29, 34, 40],
  paying: [1, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18],
};
const months2026 = {
  saas: [13000, 15200, 17800, 20500, 23500, 27000],
  ads: [5800, 6800, 8000, 9300, 10800, 12500],
  payroll: Array(6).fill(34000), infra: Array(6).fill(4800), other: Array(6).fill(3800),
  inflow: Array(6).fill(0), headcount: Array(6).fill(6),
  traffic: [33, 36, 40, 44, 48, 53].map((x) => x * 1e6),
  pages: [640, 690, 750, 820, 900, 990].map((x) => x * 1e3),
  platforms: [43, 46, 50, 54, 58, 63], paying: [20, 22, 25, 28, 31, 35],
};
function buildMonths() {
  const out = [];
  for (let i = 0; i < 12; i++) out.push(row('2025', i, months2025));
  for (let i = 0; i < 6; i++) out.push(row('2026', i, months2026));
  return out;
}
const row = (y, i, src) => ({
  month: `${y}-${String(i + 1).padStart(2, '0')}`,
  saas: src.saas[i], ads: src.ads[i], payroll: src.payroll[i], infra: src.infra[i], other: src.other[i],
  inflow: src.inflow[i], headcount: src.headcount[i], traffic: src.traffic[i], pages: src.pages[i],
  platforms: src.platforms[i], paying: src.paying[i],
});

export const seed = {
  company: {
    name: 'Protico',
    founder: 'Casey Founder',
    email: 'founder@protico.example',
    tagline: 'Sample company — embedded community & trust infrastructure',
    roundTarget: 750000,
    roundInstrument: 'Post-money SAFE, $8M cap, $50K tickets',
    sample: true,
  },
  captable: {
    stakeholders: [
      { id: 'st1', name: 'Casey Founder', type: 'Founder', security: 'Common', shares: 8500000, notes: 'SAMPLE — replace with incorporation docs' },
      { id: 'st2', name: 'Team option grants (allocated)', type: 'Employees', security: 'Options', shares: 600000, notes: 'Requires 409A before granting' },
      { id: 'st3', name: 'Option pool (unallocated)', type: 'Pool', security: 'Reserved', shares: 1400000, notes: '' },
    ],
    safes: [
      { id: 'sf1', investor: 'Nightingale Ventures', date: '2025-05-01', principal: 150000, cap: 6500000, discount: null, status: 'Signed', notes: 'SAMPLE — fictional investor' },
      { id: 'sf2', investor: 'Orbit Accelerator', date: '2025-01-15', principal: null, cap: null, discount: null, status: 'Verify', notes: 'Enter actual program equity terms — they must be on the cap table' },
      { id: 'sf3', investor: 'Current round — SAFE #1', date: '', principal: 50000, cap: 8000000, discount: null, status: 'Target', notes: '$50K ticket at $8M cap' },
      { id: 'sf4', investor: 'Current round — SAFE #2', date: '', principal: 50000, cap: 8000000, discount: null, status: 'Target', notes: '' },
      { id: 'sf5', investor: 'Current round — SAFE #3', date: '', principal: 50000, cap: 8000000, discount: null, status: 'Target', notes: '' },
    ],
    roundModel: { preMoney: 12000000, newMoney: 3000000, poolTarget: 0.10 },
    scenarios: [
      { id: 'sc1', name: 'Conservative', safeRaised: 750000, safeCap: 7000000, seedMoney: 2000000, seedPost: 12000000, seedPool: 0.12, aMoney: 7000000, aPost: 35000000, aPool: 0.07 },
      { id: 'sc2', name: 'Base', safeRaised: 750000, safeCap: 8000000, seedMoney: 3000000, seedPost: 18000000, seedPool: 0.10, aMoney: 12000000, aPost: 60000000, aPool: 0.05 },
      { id: 'sc3', name: 'Aggressive', safeRaised: 750000, safeCap: 10000000, seedMoney: 4000000, seedPost: 25000000, seedPool: 0.08, aMoney: 15000000, aPost: 90000000, aPool: 0.05 },
    ],
    waterfall: { prefInvested: 15000000, prefPct: 0.45, multiple: 1, exits: [10000000, 25000000, 50000000, 75000000, 100000000, 250000000] },
  },
  financials: { openingCash: 180000, months: buildMonths() },
  crm: {
    investors: [
      { id: 'iv1', name: 'Nightingale Ventures', type: 'Fund', contact: 'Robin Partner', email: 'robin@nightingale.example', instrument: 'SAFE', amount: 150000, cap: 6500000, date: '2025-05-01', segment: 'Board/Major', lastUpdate: '', notes: 'SAMPLE — fictional' },
      { id: 'iv2', name: 'Orbit Accelerator', type: 'Accelerator', contact: '', email: '', instrument: 'Program equity', amount: null, cap: null, date: '', segment: 'Board/Major', lastUpdate: '', notes: 'Program terms must appear on cap table' },
      { id: 'iv3', name: 'Cloud Credits Program', type: 'Program', contact: '', email: '', instrument: 'Credits only', amount: null, cap: null, date: '', segment: 'All investors', lastUpdate: '', notes: 'Non-equity — never present as an investor' },
    ],
    commitments: [
      { id: 'cm1', investor: '(example) Fund A', source: 'Pipeline top-10 #3', ticket: 50000, stage: 'Verbal', probability: 0.5, nextAction: 'Send SAFE + wire details', owner: 'Casey', lastTouch: '' },
    ],
    interactions: [
      { id: 'in1', date: '2026-07-01', investor: 'Nightingale Ventures', type: 'Call', summary: '(example) Quarterly check-in; asked about enterprise pipeline', followUp: 'Send GTM one-pager', due: '2026-07-08', done: false },
    ],
    asks: [
      { id: 'as1', date: '2026-07-05', ask: '(example) Intro to a community/audience lead at a top-50 consumer platform', askedOf: 'All investors (July update)', status: 'Open', outcome: '', thanked: false },
    ],
    distribution: [
      { id: 'dl1', name: 'Nightingale Ventures — Robin Partner', email: 'robin@nightingale.example', segment: 'Board/Major', active: true, lastSent: '', notes: 'SAMPLE — fictional' },
      { id: 'dl2', name: 'Orbit Accelerator — program lead', email: '', segment: 'Board/Major', active: true, lastSent: '', notes: '' },
    ],
  },
  updates: { archive: [] },
  checklists: {},
};
