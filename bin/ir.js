#!/usr/bin/env node
// ir — the IR Kit command line. Built for agents first, humans second.
// Every command supports --json. Data location overrides: IRKIT_DATA_DIR, IRKIT_ROOT.
import { status, closeMonth, addSafe, draftUpdate, markSent, modelPricedRound, exportCaptableCsv, exportBoardPack, exportTearsheet, scanDocuments } from '../core/ops.js';
import { check } from '../core/check.js';
import { DATA_DIR } from '../core/store.js';

const [cmd, ...rest] = process.argv.slice(2);
const { positional, flags } = parseArgs(rest);
const json = !!flags.json;

const HELP = `ir — agent-native investor relations (data: ${DATA_DIR})

  ir status [--json]                     every derived metric in one call
  ir check [--json]                      validate schemas + invariants (exit 1 on errors)
  ir close-month <YYYY-MM> --saas N --ads N --payroll N --infra N --other N
       [--inflow N --headcount N --traffic N --pages N --platforms N --paying N]
  ir safe add "<investor>" --principal N [--cap N] [--discount 0.2]
       [--status Signed|Wired|Verbal|"SAFE sent"|Target] [--email E] [--contact C] [--type Fund]
       (reconciles cap table + CRM commitment + distribution in one pass)
  ir update draft [--month YYYY-MM]      write the metrics-filled draft to ir-workspace/updates/drafts/
  ir update mark-sent [--subject S] [--month YYYY-MM]
  ir model round --pre N --new N [--pool 0.10]
  ir export board-pack|tearsheet|captable   real-data artifacts → ir-workspace/exports/
  ir scan <folder> [...]                 onboarding: find candidate financial docs by FILENAME only
                                         (consent-first; inventory → ir-workspace/onboarding/candidates.md)
  ir schedule show                       cron lines for the monthly rituals

Rules of engagement (full contract in AGENTS.md):
  prefer these verbs over editing data/*.json · after any direct edit, run: ir check
  never invent a number · drafts never auto-send`;

try {
  switch (cmd) {
    case 'status': out(status(), humanStatus); break;

    case 'check': {
      const r = check();
      out(r, () => {
        for (const e of r.errors) console.log(`✗ ERROR  [${e.code}] ${e.where}: ${e.msg}`);
        for (const w of r.warnings) console.log(`⚠ warn   [${w.code}] ${w.where}: ${w.msg}`);
        console.log(r.ok ? `✓ ok — 0 errors, ${r.warnings.length} warning(s)` : `✗ ${r.errors.length} error(s), ${r.warnings.length} warning(s)`);
      });
      if (!r.ok) process.exit(1);
      break;
    }

    case 'close-month': {
      const r = closeMonth(positional[0], flags);
      out(r, () => {
        console.log(`✓ ${r.month} closed — revenue ${usd(r.revenue)} · net P&L ${usd(r.netPnl)} · cash ${usd(r.cash)}`);
        for (const f of r.flags) console.log(`⚠ ${f}`);
        console.log('next: ir update draft');
      });
      break;
    }

    case 'safe': {
      if (positional[0] !== 'add') fail('usage: ir safe add "<investor>" --principal N --cap N');
      const r = addSafe({
        investor: positional[1], principal: num(flags.principal), cap: num(flags.cap),
        discount: num(flags.discount), date: flags.date, status: flags.status || 'Signed',
        email: flags.email, contact: flags.contact, type: flags.type, segment: flags.segment,
      });
      out(r, () => {
        console.log(`✓ SAFE recorded — ${r.investor} ${usd(r.principal)}${r.impliedPct !== null ? ` · implied ${pct(r.impliedPct)}` : ''}`);
        console.log(`${r.guardrailOk ? '✓' : '⚠'} total SAFE overhang ${pct(r.totalSafeImpliedPct)} (guardrail <15%)`);
        console.log(`✓ CRM reconciled — commitment → ${r.crmStage}${r.addedToDistribution ? ' · added to update distribution' : ''}`);
        console.log(`round: ${usd(r.round.signedWired)} of ${usd(r.round.target)} signed/wired`);
        if (r.reminder) console.log(`→ ${r.reminder}`);
      });
      break;
    }

    case 'update': {
      if (positional[0] === 'draft') {
        const r = draftUpdate(flags.month);
        out(r, () => console.log(r.blocked ? `✗ blocked — ${r.file}` : `✓ draft written — ${r.file}\nnext: review, edit, send from the web UI or your mail client, then: ir update mark-sent`));
        if (r.blocked) process.exit(1);
      } else if (positional[0] === 'mark-sent') {
        const r = markSent({ subject: flags.subject, month: flags.month });
        out(r, () => console.log(`✓ archived ${r.archived} — streak ${r.streakMonths} month(s) · next due ${r.nextDue}`));
      } else fail('usage: ir update draft|mark-sent');
      break;
    }

    case 'model': {
      if (positional[0] !== 'round') fail('usage: ir model round --pre N --new N [--pool 0.10]');
      const r = modelPricedRound({ pre: num(flags.pre), newMoney: num(flags.new), pool: num(flags.pool) ?? 0.1 });
      out(r, () => {
        console.log(`post-money ${usd(r.postMoney)} · new investors ${pct(r.newInvestorPct)} · SAFEs ${pct(r.safePreRoundPct)} · PPS $${r.pricePerShare}`);
        for (const row of r.proForma) console.log(`  ${row.stakeholder.padEnd(38)} ${String(row.shares).padStart(12)}  ${pct(row.pct)}`);
      });
      break;
    }

    case 'export': {
      const what = positional[0];
      const r = what === 'captable' ? exportCaptableCsv()
        : what === 'board-pack' ? exportBoardPack()
        : what === 'tearsheet' ? exportTearsheet()
        : fail('usage: ir export board-pack|tearsheet|captable');
      out(r, () => console.log(`✓ exported — ${r.file}`));
      break;
    }

    case 'scan': {
      const r = scanDocuments(positional);
      out(r, () => {
        console.log(`✓ scanned ${r.folders.join(', ')} — ${r.filesVisited.toLocaleString()} files seen, ${r.matched} candidates (filenames only, no contents read)`);
        for (const [cat, n] of Object.entries(r.byCategory)) console.log(`  ${cat}: ${n}`);
        console.log(`inventory: ${r.inventory}`);
        console.log('next: review the checklist with your founder, then continue prompts/onboard.md stage 2');
      });
      break;
    }

    case 'schedule': {
      const lines = {
        closeReminder: '0 9 1 * *  cd <repo> && ./bin/ir.js status  # 1st: month-end close reminder',
        draft: '0 9 3 * *  cd <repo> && ./bin/ir.js update draft  # 3rd: draft waiting for review',
        check: '0 9 * * 1  cd <repo> && ./bin/ir.js check  # Mondays: data integrity',
      };
      out(lines, () => { console.log('# crontab -e'); Object.values(lines).forEach((l) => console.log(l)); });
      break;
    }

    case 'help': case undefined: console.log(HELP); break;
    default: fail(`unknown command "${cmd}"\n\n${HELP}`);
  }
} catch (e) {
  if (json) { console.error(JSON.stringify({ error: e.message })); } else { console.error('✗ ' + e.message); }
  process.exit(1);
}

function humanStatus(s) {
  console.log(`${s.company.name}${s.company.sample ? '  [SAMPLE DATA]' : ''}`);
  if (s.financials) {
    const f = s.financials;
    console.log(`${f.month}: revenue ${usd(f.revenue)} (${f.momPct === null ? '—' : pct(f.momPct)} MoM) · ARR run-rate ${usd(f.arrRunRate)}`);
    console.log(`cash ${usd(f.cash)} · burn(3mo) ${usd(f.burn3moAvg)} · ${f.cashFlowPositive ? 'cash-flow positive' : `runway ${f.runwayMonths} mo → ${f.zeroCashMonth}`}`);
  } else console.log('no closed months yet — ir close-month YYYY-MM --saas ...');
  console.log(`update: due ${s.cadence.nextDue} (${s.cadence.overdue ? 'OVERDUE' : s.cadence.daysUntilDue + 'd'}) · streak ${s.cadence.streakMonths}`);
  console.log(`round: ${usd(s.round.signedWired)} of ${usd(s.round.target)} (${s.round.pctClosed === null ? '—' : pct(s.round.pctClosed)}) · weighted ${usd(s.round.weightedPipeline)}`);
  console.log(`cap table: ${s.capTable.safeCount} SAFEs ${usd(s.capTable.safePrincipal)} · implied ${pct(s.capTable.safeImpliedTotalPct)} ${s.capTable.safeGuardrailOk ? '(ok)' : '(OVER 15% GUARDRAIL)'} · founder ${pct(s.capTable.founderPct)}`);
}

function parseArgs(list) {
  const positional = []; const flags = {};
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (a.startsWith('--')) {
      let k = a.slice(2); let v = true;
      if (k.includes('=')) { const j = k.indexOf('='); v = k.slice(j + 1); k = k.slice(0, j); }
      else if (i + 1 < list.length && !list[i + 1].startsWith('--')) v = list[++i];
      flags[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
    } else positional.push(a);
  }
  return { positional, flags };
}
function out(data, human) { if (json) console.log(JSON.stringify(data, null, 2)); else human(data); }
function num(v) { return v === undefined || v === true ? undefined : Number(v); }
function usd(n) { return n === null || n === undefined ? '—' : (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US'); }
function pct(x) { return x === null || x === undefined ? '—' : (x * 100).toFixed(1) + '%'; }
function fail(msg) { console.error(msg); process.exit(1); }
