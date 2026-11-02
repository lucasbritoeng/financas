'use strict';

/* =====================================================================
   CATÁLOGOS
   e = essencial (1) ou não (0) · fx = conta fixa (entra no checklist)
   b = orçamento padrão (editável na aba Plano)
   ===================================================================== */
const OUT_BASE = [
  { n: 'Moradia', i: '🏠', e: 1, fx: 1, b: 700 },
  { n: 'Energia', i: '💡', e: 1, fx: 1, b: 200 },
  { n: 'Água', i: '🚰', e: 1, fx: 1, b: 65 },
  { n: 'Internet', i: '📶', e: 1, fx: 1, b: 120 },
  { n: 'Gás', i: '🔥', e: 1, b: 40 },
  { n: 'Combustível', i: '⛽', e: 1, b: 500 },
  { n: 'Mercado', i: '🛒', e: 1, b: 1000 },
  { n: 'Carro', i: '🚗', e: 1, b: 400 },
  { n: 'Casa e utilidades', i: '🧰', e: 1, b: 300 },
  { n: 'Saúde e farmácia', i: '💊', e: 1, b: 100 },
  { n: 'Levi', i: '🧸', e: 1, b: 200 },
  { n: 'MEI', i: '🧾', e: 1, fx: 1, b: 90 },
  { n: 'Cuidados pessoais', i: '💈', e: 1, b: 115 },
  { n: 'Dízimo e ofertas', i: '🙏', e: 1, b: 0 },
  { n: 'Lazer e delivery', i: '🎬', e: 0, b: 160 },
  { n: 'Compras pessoais', i: '🛍️', e: 0, b: 200 },
  { n: 'Assinaturas', i: '📺', e: 0, fx: 1, b: 40 },
  { n: 'Outros', i: '🎲', e: 0, b: 0 },
];
let OUT = OUT_BASE.slice(); // base + categorias próprias (ver syncCats)
const INC = [
  { n: 'Salário', i: '💼', w: 'main' },
  { n: 'Vale alimentação', i: '🥗', w: 'va' },
  { n: 'Projetos e serviços', i: '📐', w: 'main' },
  { n: 'Outras receitas', i: '💰', w: 'main' },
];
const WTAG = { main: '', card: '💳 cartão', va: '🥗 VA' };

const MC_BASE = [
  { n: 'Carnes', i: '🥩' }, { n: 'Hortifruti', i: '🥬' }, { n: 'Mercearia', i: '🍚' },
  { n: 'Laticínios e frios', i: '🧀' }, { n: 'Padaria', i: '🍞' }, { n: 'Bebidas', i: '🥤' },
  { n: 'Limpeza', i: '🧽' }, { n: 'Higiene', i: '🧴' }, { n: 'Congelados', i: '🧊' }, { n: 'Outros', i: '📦' },
];
let MC = MC_BASE.slice();
const SUGG = [
  ['Carnes', 'Frango'], ['Carnes', 'Carne moída'], ['Carnes', 'Alcatra'], ['Carnes', 'Linguiça'], ['Carnes', 'Ovos'],
  ['Hortifruti', 'Banana'], ['Hortifruti', 'Tomate'], ['Hortifruti', 'Cebola'], ['Hortifruti', 'Batata'],
  ['Mercearia', 'Arroz'], ['Mercearia', 'Feijão'], ['Mercearia', 'Macarrão'], ['Mercearia', 'Óleo'],
  ['Mercearia', 'Açúcar'], ['Mercearia', 'Café'],
  ['Laticínios e frios', 'Leite'], ['Laticínios e frios', 'Queijo'], ['Laticínios e frios', 'Presunto'],
  ['Padaria', 'Pão'], ['Bebidas', 'Suco'],
  ['Limpeza', 'Detergente'], ['Limpeza', 'Sabão em pó'],
  ['Higiene', 'Papel higiênico'], ['Higiene', 'Creme dental'], ['Higiene', 'Fralda'],
];

/* =====================================================================
   ESTADO
   ===================================================================== */
const KEY = 'financas-v2';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function defaults() {
  const budgets = {};
  OUT.forEach(c => (budgets[c.n] = c.b));
  return {
    v: 2,
    tx: [],
    settings: { cardCap: 1000, income: { main: 6000, va: 1000 } },
    budgets,
    customOut: [],
    customMc: [],
    goals: [
      { id: 'g-reserva', name: 'Reserva de emergência', target: 3000, start: 0, monthly: 400 },
      { id: 'g-moto', name: 'Moto da Carol', target: 5000, start: 2000, monthly: 0 },
    ],
    debts: [
      { id: 'd-cartao', name: 'Cartão (renegociação)', total: 17000, installment: 0 },
      { id: 'd-fies', name: 'FIES', total: 9000, installment: 600 },
    ],
    market: { items: [], lists: [], cur: null, markets: [], lastMkt: '' },
  };
}

function fill(d) {
  const b = defaults();
  return {
    ...b, ...d,
    settings: { ...b.settings, ...d.settings, income: { ...b.settings.income, ...((d.settings || {}).income || {}) } },
    budgets: { ...b.budgets, ...(d.budgets || {}) },
    market: { ...b.market, ...(d.market || {}) },
  };
}

function migrate(o, s) {
  const map = {
    'Contas (luz, água, internet)': 'Energia', 'Transporte': 'Combustível', 'Saúde': 'Saúde e farmácia',
    'Educação': 'Outros', 'Filho': 'Levi', 'Restaurantes e delivery': 'Lazer e delivery', 'Lazer': 'Lazer e delivery',
    'Compras': 'Compras pessoais', 'Outros (não essencial)': 'Outros',
  };
  s.tx = o.tx.map(t => ({
    id: t.id, type: t.type, amount: t.amount, desc: t.desc || '', date: t.date, wallet: 'main',
    cat: t.type === 'out' ? (map[t.cat] || t.cat) : t.cat,
    ...(t.type === 'save' ? { goal: 'g-reserva', cat: 'Reserva de emergência' } : {}),
  }));
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.v === 2) return fill(d);
  } catch (e) {}
  const s = defaults();
  try {
    const o = JSON.parse(localStorage.getItem('financas-v1'));
    if (o && Array.isArray(o.tx)) migrate(o, s);
  } catch (e) {}
  return s;
}
let S = load();
function syncCats() {
  OUT = OUT_BASE.concat(S.customOut || []);
  MC = MC_BASE.concat(S.customMc || []);
  OUT.forEach(c => { if (S.budgets[c.n] == null) S.budgets[c.n] = c.b || 0; });
}
syncCats();
function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* =====================================================================
   UTILIDADES
   ===================================================================== */
const $ = s => document.querySelector(s);
const brl = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sum = a => a.reduce((t, x) => t + x.amount, 0);
const sumBy = (a, f) => a.reduce((t, x) => t + (f(x) || 0), 0);
const fq = n => String(+(+n).toFixed(2)).replace('.', ',');
const toInput = n => (n ? String(n).replace('.', ',') : '');

function parseMoney(v) {
  v = String(v).trim().replace(/[^\d.,-]/g, '');
  if (!v) return 0;
  if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(v);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const thisMonth = () => today().slice(0, 7);
let view = thisMonth();
const defaultDate = () => (view === thisMonth() ? today() : view + '-01');

const catInfo = n => OUT.find(c => c.n === n) || { n, i: '•', e: 1 };
const incInfo = n => INC.find(c => c.n === n) || { n, i: '💰', w: 'main' };
const W = t => t.wallet || 'main';
const txIcon = t => (t.type === 'out' ? catInfo(t.cat).i : t.type === 'in' ? incInfo(t.cat).i : t.type === 'save' ? '🐷' : '🧾');

const goalSaved = g => (g.start || 0) + sum(S.tx.filter(t => t.type === 'save' && t.goal === g.id));
const debtPaid = d => sum(S.tx.filter(t => t.type === 'debt' && t.debt === d.id));
const debtLeft = d => Math.max(0, d.total - debtPaid(d));

function calc(mo) {
  const tx = S.tx.filter(t => t.date.startsWith(mo));
  const by = f => sum(tx.filter(f));
  const r = { tx };
  r.incMain = by(t => t.type === 'in' && W(t) !== 'va');
  r.incVA = by(t => t.type === 'in' && W(t) === 'va');
  r.outMain = by(t => t.type === 'out' && W(t) === 'main');
  r.outCard = by(t => t.type === 'out' && W(t) === 'card');
  r.outVA = by(t => t.type === 'out' && W(t) === 'va');
  r.sav = by(t => t.type === 'save');
  r.debt = by(t => t.type === 'debt');
  r.ne = by(t => t.type === 'out' && !catInfo(t.cat).e);
  r.saldo = r.incMain - r.outMain - r.outCard - r.sav - r.debt;
  return r;
}

const bar = (p, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.min(100, Math.max(0, p * 100))}%"></i></div>`;

/* =====================================================================
   NAVEGAÇÃO
   ===================================================================== */
let tab = 'home';
let flt = 'all';
const TITLES = { market: 'Mercado', goals: 'Metas e dívidas' };

function setTab(t) {
  tab = t;
  render();
  window.scrollTo(0, 0);
}

function render() {
  const monthly = ['home', 'tx', 'plan'].includes(tab);
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $('#prev').classList.toggle('hid', !monthly);
  $('#next').classList.toggle('hid', !monthly);
  if (monthly) {
    const [y, m] = view.split('-').map(Number);
    const mt = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    $('#title').textContent = mt.charAt(0).toUpperCase() + mt.slice(1);
  } else $('#title').textContent = TITLES[tab];
  $('#fab').hidden = !['home', 'tx', 'market'].includes(tab);
  ({ home: renderHome, tx: renderTx, market: renderMarket, plan: renderPlan, goals: renderGoals })[tab]();
}

/* =====================================================================
   INÍCIO
   ===================================================================== */
/* ---------- gráfico dos últimos 6 meses ---------- */
let chartMode = 'gastos';
const fmtK = v => (v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : v > 0 ? String(Math.round(v)) : '');

function monthStats(mo) {
  const tx = S.tx.filter(t => t.date.startsWith(mo));
  const out = tx.filter(t => t.type === 'out');
  return {
    ess: sumBy(out.filter(t => catInfo(t.cat).e), t => t.amount),
    ne: sumBy(out.filter(t => !catInfo(t.cat).e), t => t.amount),
    inc: sumBy(tx.filter(t => t.type === 'in'), t => t.amount),
    sav: sumBy(tx.filter(t => t.type === 'save' || t.type === 'debt'), t => t.amount),
  };
}

function chartCard() {
  const [vy, vm] = view.split('-').map(Number);
  const ms = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(vy, vm - 1 - i, 1); ms.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); }
  const st = ms.map(monthStats);
  const MODES = [['gastos', 'Gastos'], ['ne', 'Não essenciais'], ['sav', 'Metas e dívidas']];
  let h = `<div class="card"><h3>Últimos 6 meses</h3><div class="chips" style="margin-bottom:6px">${MODES.map(([k, l]) =>
    `<button class="chip ${chartMode === k ? 'on' : ''}" data-a="cm" data-id="${k}">${l}</button>`).join('')}</div>`;
  if (!st.some(s => s.ess + s.ne + s.inc + s.sav > 0)) return h + `<div class="hint">O gráfico aparece conforme você lança os meses.</div></div>`;

  const neLim = sumBy(OUT.filter(c => !c.e), c => S.budgets[c.n]);
  const val = s => (chartMode === 'gastos' ? s.ess + s.ne : chartMode === 'ne' ? s.ne : s.sav);
  const vals = st.map(val);
  const mx = Math.max(1, ...vals, chartMode === 'gastos' ? Math.max(...st.map(s => s.inc)) : 0, chartMode === 'ne' ? neLim : 0) * 1.12;
  const VW = 340, VH = 176, pl = 6, pr = 6, pt = 16, pb = 24;
  const bw = (VW - pl - pr) / 6, bwid = bw * 0.56;
  const Y = v => pt + (VH - pt - pb) * (1 - v / mx);

  let s = `<svg class="chart" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Gráfico dos últimos 6 meses">`;
  s += `<line class="ax" x1="${pl}" x2="${VW - pr}" y1="${Y(0)}" y2="${Y(0)}"/>`;
  if (chartMode === 'ne' && neLim > 0) {
    s += `<line class="lim" x1="${pl}" x2="${VW - pr}" y1="${Y(neLim)}" y2="${Y(neLim)}"/><text x="${VW - pr}" y="${Y(neLim) - 3}" style="text-anchor:end">teto ${fmtK(neLim)}</text>`;
  }
  st.forEach((m, i) => {
    const x = pl + i * bw + (bw - bwid) / 2, cx = x + bwid / 2;
    const label = new Date(+ms[i].slice(0, 4), +ms[i].slice(5) - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const tt = `<title>${label}: ${brl(val(m))}</title>`;
    if (chartMode === 'gastos') {
      s += `<rect class="b-ess" x="${x}" y="${Y(m.ess)}" width="${bwid}" height="${Y(0) - Y(m.ess)}">${tt}</rect>`;
      s += `<rect class="b-ne" x="${x}" y="${Y(m.ess + m.ne)}" width="${bwid}" height="${Y(m.ess) - Y(m.ess + m.ne)}">${tt}</rect>`;
      if (m.inc > 0) s += `<line class="b-inc" x1="${x - 5}" x2="${x + bwid + 5}" y1="${Y(m.inc)}" y2="${Y(m.inc)}"/>`;
    } else {
      s += `<rect class="${chartMode === 'ne' ? 'b-ne' : 'b-sav'}" x="${x}" y="${Y(val(m))}" width="${bwid}" height="${Y(0) - Y(val(m))}">${tt}</rect>`;
    }
    s += `<text x="${cx}" y="${Y(val(m)) - 4}">${fmtK(val(m))}</text>`;
    s += `<text class="${ms[i] === view ? 'cur' : ''}" x="${cx}" y="${VH - 8}">${label}</text>`;
  });
  s += `</svg>`;
  h += s;

  if (chartMode === 'gastos') {
    h += `<div class="lg"><span><i class="d-ess"></i>Essenciais</span><span><i class="d-ne"></i>Não essenciais</span><span><i class="d-inc"></i>Receitas</span></div>`;
  }
  const cur = vals[5], prev = vals[4];
  if (cur > 0 || prev > 0) {
    const d = cur - prev, good = chartMode === 'sav' ? d >= 0 : d <= 0;
    h += `<div class="hint" style="margin-top:6px">Neste mês: <b>${brl(cur)}</b>${prev > 0 ? ` · mês anterior ${brl(prev)} (<span class="${good ? 'ok-t' : 'over-t'}">${d > 0 ? '↑' : '↓'} ${brl(Math.abs(d))}</span>)` : ''}</div>`;
  }
  return h + `</div>`;
}

function renderHome() {
  const c = calc(view);
  const neLim = sumBy(OUT.filter(x => !x.e), x => S.budgets[x.n]);
  let h = '';

  h += `<div class="card"><h3>Saldo em dinheiro</h3>
    <div class="balance ${c.saldo < 0 ? 'neg' : ''}">${brl(c.saldo)}</div>
    <div class="grid3">
      <div class="in">Receitas<b>${brl(c.incMain)}</b></div>
      <div class="out">Despesas<b>${brl(c.outMain + c.outCard)}</b></div>
      <div class="sav">Metas e dívidas<b>${brl(c.sav + c.debt)}</b></div>
    </div>`;
  if (c.incVA || c.outVA) {
    const left = c.incVA - c.outVA;
    h += `<div class="line sub"><span>🥗 Vale alimentação</span><span class="${left < 0 ? 'over-t' : ''}">${brl(left)} <small>de ${brl(c.incVA)}</small></span></div>`;
  }
  h += `</div>`;

  if (!c.tx.some(t => t.type === 'in' && W(t) !== 'va')) {
    h += `<div class="card tip"><b>Salário ainda não lançado neste mês.</b><br>Use o checklist do mês para lançar salário, vale e contas fixas.
      <br><button class="cta" data-a="go" data-id="plan">Abrir checklist</button></div>`;
  }

  // Não essenciais
  h += `<div class="card"><h3>Gastos não essenciais</h3>`;
  if (neLim > 0) {
    const pct = c.ne / neLim;
    const cls = pct >= 1 ? 'over' : pct >= 0.8 ? 'warn' : '';
    const msg = pct >= 1 ? `<span class="over-t">Estourou em ${brl(c.ne - neLim)}</span>`
      : `<span class="${pct >= 0.8 ? 'warn-t' : 'ok-t'}">Restam ${brl(neLim - c.ne)}</span>`;
    h += `<div class="line"><b>${brl(c.ne)}</b><span class="mut">de ${brl(neLim)}</span></div>${bar(pct, cls)}
      <div class="line">${msg}<span class="mut">${Math.round(pct * 100)}%</span></div>`;
  } else {
    h += `<div class="mut">Defina orçamento para lazer, compras e assinaturas na aba Plano.</div>`;
  }
  h += `</div>`;

  // Cartão
  const cap = S.settings.cardCap;
  if (c.outCard || cap) {
    const pct = cap ? c.outCard / cap : 0;
    const cls = pct >= 1 ? 'over' : pct >= 0.8 ? 'warn' : '';
    h += `<div class="card"><h3>💳 Cartão de crédito no mês</h3>
      <div class="line"><b>${brl(c.outCard)}</b><span class="mut">${cap ? 'teto ' + brl(cap) : 'sem teto'}</span></div>
      ${cap ? bar(pct, cls) : ''}
      <div class="hint">Pague a fatura inteira todo mês. Compra no cartão que não cabe no mês vira dívida.</div></div>`;
  }

  h += chartCard();

  // Categorias
  const by = {};
  c.tx.filter(t => t.type === 'out').forEach(t => (by[t.cat] = (by[t.cat] || 0) + t.amount));
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]);
  if (rows.length) {
    h += `<div class="card"><h3>Gasto por categoria <span class="mut" style="text-transform:none">(gasto / orçado)</span></h3>`;
    rows.forEach(([name, v]) => {
      const ci = catInfo(name), b = S.budgets[name] || 0;
      const over = b > 0 && v > b;
      h += `<div class="cat ${ci.e ? '' : 'ne'} ${over ? 'ov' : ''}">
        <div class="line"><span>${ci.i} ${esc(name)}${ci.e ? '' : ' <small class="ne">não essencial</small>'}</span>
        <b class="${over ? 'over-t' : ''}">${brl(v)}${b > 0 ? ` <small>/ ${brl(b)}</small>` : ''}</b></div>
        ${bar(b > 0 ? v / b : 1)}</div>`;
    });
    h += `</div>`;
  }

  // Metas e dívidas (resumo)
  if (S.goals.length || S.debts.length) {
    h += `<div class="card"><div class="sect"><h3 style="margin:0">Metas e dívidas</h3><button class="chip" data-a="go" data-id="goals">Ver</button></div>`;
    S.goals.forEach(g => {
      const s = goalSaved(g), p = g.target ? s / g.target : 0;
      h += `<div class="cat"><div class="line"><span>🎯 ${esc(g.name)}</span><b>${brl(s)} <small>/ ${brl(g.target)}</small></b></div>${bar(p, 'sav')}</div>`;
    });
    S.debts.forEach(d => {
      const left = debtLeft(d), p = d.total ? debtPaid(d) / d.total : 0;
      h += `<div class="cat"><div class="line"><span>🧾 ${esc(d.name)}</span><b>${brl(left)} <small>restam</small></b></div>${bar(p)}</div>`;
    });
    h += `</div>`;
  }

  $('#main').innerHTML = h;
}

/* =====================================================================
   LANÇAMENTOS
   ===================================================================== */
function renderTx() {
  const c = calc(view);
  const F = {
    all: () => true, out: t => t.type === 'out', in: t => t.type === 'in',
    card: t => t.type === 'out' && W(t) === 'card', va: t => W(t) === 'va',
    sav: t => t.type === 'save' || t.type === 'debt',
  };
  const CH = [['all', 'Todos'], ['out', 'Despesas'], ['in', 'Receitas'], ['card', '💳 Cartão'], ['va', '🥗 VA'], ['sav', 'Metas e dívidas']];
  let h = `<div class="chips">${CH.map(([k, l]) => `<button class="chip ${flt === k ? 'on' : ''}" data-a="flt" data-id="${k}">${l}</button>`).join('')}</div>`;
  h += `<div class="card">`;
  const list = c.tx.filter(F[flt]);
  if (!list.length) {
    h += `<div class="empty">Nada por aqui.<br>Toque em + para lançar.</div>`;
  } else {
    const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    let last = '';
    sorted.forEach(t => {
      if (t.date !== last) {
        last = t.date;
        const [yy, mm, dd] = t.date.split('-').map(Number);
        h += `<div class="day">${new Date(yy, mm - 1, dd).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</div>`;
      }
      const sign = t.type === 'in' ? '+' : '-';
      const wt = WTAG[W(t)] && t.type !== 'in' ? ' · ' + WTAG[W(t)] : '';
      h += `<button class="tx" data-a="tx" data-id="${t.id}">
        <span class="ic">${txIcon(t)}</span>
        <span class="t"><b>${esc(t.desc || t.cat)}</b><small>${esc(t.cat)}${wt}</small></span>
        <span class="v ${t.type}">${sign}${brl(t.amount)}</span></button>`;
    });
  }
  h += `</div>`;
  $('#main').innerHTML = h;
}

/* =====================================================================
   PLANO (orçamento + checklist)
   ===================================================================== */
let CK = {};

function renderPlan() {
  const inc = S.settings.income, incTot = inc.main + inc.va;
  const catSum = sumBy(OUT, c => S.budgets[c.n]);
  const ess = sumBy(OUT.filter(c => c.e), c => S.budgets[c.n]);
  const ne = catSum - ess;
  const dSum = sumBy(S.debts, d => d.installment), gSum = sumBy(S.goals, g => g.monthly);
  const planned = catSum + dSum + gSum, free = incTot - planned;
  const pc = v => (incTot ? Math.round((v / incTot) * 100) : 0) + '%';
  let h = '';

  h += `<div class="card"><div class="sect"><h3 style="margin:0">Plano do mês</h3><button class="chip" data-a="inc">Editar renda</button></div>
    <div class="line"><span>Renda esperada</span><b>${brl(incTot)}</b></div>
    <div class="line"><small>Dinheiro ${brl(inc.main)} + vale alimentação ${brl(inc.va)}</small></div>
    <div class="line sub"><span>Planejado (categorias, metas e dívidas)</span><b>${brl(planned)}</b></div>
    <div class="line"><span>${free >= 0 ? 'Livre para alocar' : 'Falta para fechar o plano'}</span>
      <b class="free ${free >= 0 ? 'ok-t' : 'over-t'}">${brl(Math.abs(free))}</b></div>
    <div class="stack">
      <div><span>Essenciais</span><span>${brl(ess)} · ${pc(ess)}</span></div>
      <div><span>Não essenciais</span><span>${brl(ne)} · ${pc(ne)}</span></div>
      <div><span>Dívidas</span><span>${brl(dSum)} · ${pc(dSum)}</span></div>
      <div><span>Metas</span><span>${brl(gSum)} · ${pc(gSum)}</span></div>
    </div>
    ${free > 0 ? `<div class="hint">Dê um destino a esse valor: parcela do cartão, dízimo, moto. Dinheiro sem destino vira gasto.</div>` : ''}</div>`;

  // Checklist
  CK = {};
  const rows = [];
  rows.push({ k: 'in-sal', i: '💼', l: 'Salário', a: inc.main, pre: { type: 'in', cat: 'Salário', desc: 'Salário' } });
  if (inc.va > 0) rows.push({ k: 'in-va', i: '🥗', l: 'Vale alimentação', a: inc.va, pre: { type: 'in', cat: 'Vale alimentação', desc: 'Vale alimentação' } });
  OUT.filter(c => c.fx && S.budgets[c.n] > 0).forEach(c =>
    rows.push({ k: 'out-' + c.n, i: c.i, l: c.n, a: S.budgets[c.n], pre: { type: 'out', cat: c.n, wallet: 'main', desc: c.n } }));
  S.debts.filter(d => d.installment > 0 && debtLeft(d) > 0).forEach(d =>
    rows.push({ k: 'debt-' + d.id, i: '🧾', l: 'Parcela: ' + d.name, a: d.installment, pre: { type: 'debt', debt: d.id } }));
  S.goals.filter(g => g.monthly > 0).forEach(g =>
    rows.push({ k: 'goal-' + g.id, i: '🐷', l: 'Guardar: ' + g.name, a: g.monthly, pre: { type: 'save', goal: g.id } }));
  rows.forEach(r => { r.done = S.tx.some(t => t.auto === r.k && t.date.startsWith(view)); CK[r.k] = r; });
  const nd = rows.filter(r => r.done).length;

  h += `<div class="card"><div class="sect"><h3 style="margin:0">Checklist do mês</h3><span class="tag">${nd}/${rows.length}</span></div>
    <div class="hint" style="margin:0 0 4px">Toque para lançar. Você confirma o valor real antes de salvar.</div>`;
  rows.forEach(r => {
    h += `<button class="prow ${r.done ? 'ok' : ''}" data-a="ck" data-id="${esc(r.k)}"><span>${r.done ? '✅' : '⬜'} ${r.i} ${esc(r.l)}</span><b>${brl(r.a)}</b></button>`;
  });
  h += `</div>`;

  // Orçamentos
  h += `<div class="card"><div class="sect"><h3 style="margin:0">Orçamento por categoria</h3><button class="chip" data-a="newcat">+ Categoria</button></div>`;
  OUT.forEach(c => {
    const custom = S.customOut.some(x => x.n === c.n);
    h += `<button class="prow" data-a="${custom ? 'editcat' : 'bud'}" data-id="${esc(c.n)}"><span>${c.i} ${esc(c.n)}${c.e ? '' : ' <small>não essencial</small>'}${custom ? ' <small>própria</small>' : ''}</span><b>${brl(S.budgets[c.n] || 0)}</b></button>`;
  });
  h += `<div class="hint">Toque numa linha para mudar o valor. Mercado é pago com o vale alimentação.</div></div>`;

  $('#main').innerHTML = h;
}

/* =====================================================================
   METAS E DÍVIDAS
   ===================================================================== */
function renderGoals() {
  let h = '';
  h += `<div class="sect"><h3 style="margin:0;color:var(--mut);font-size:13px;text-transform:uppercase">Metas de poupança</h3><button class="chip" data-a="newgoal">+ Nova meta</button></div>`;
  if (!S.goals.length) h += `<div class="card empty">Nenhuma meta ainda.</div>`;
  S.goals.forEach(g => {
    const s = goalSaved(g), left = Math.max(0, g.target - s), p = g.target ? s / g.target : 0;
    const eta = left > 0 && g.monthly > 0 ? ` · ~${Math.ceil(left / g.monthly)} meses no ritmo de ${brl(g.monthly)}/mês` : '';
    h += `<div class="card goal"><div class="head"><b>🎯 ${esc(g.name)}</b><span class="mut">${Math.round(p * 100)}%</span></div>
      ${bar(p, 'sav')}
      <div class="line"><span>${brl(s)}</span><span class="mut">meta ${brl(g.target)}</span></div>
      <div class="hint">${left > 0 ? 'Faltam ' + brl(left) + eta : 'Meta atingida 🎉'}</div>
      <div class="acts"><button class="ghost small" data-a="paygoal" data-id="${g.id}">Guardar</button><button class="ghost small" data-a="editgoal" data-id="${g.id}">Editar</button></div></div>`;
  });
  h += `<div class="sect" style="margin-top:8px"><h3 style="margin:0;color:var(--mut);font-size:13px;text-transform:uppercase">Dívidas</h3><button class="chip" data-a="newdebt">+ Nova dívida</button></div>`;
  if (!S.debts.length) h += `<div class="card empty">Nenhuma dívida cadastrada.</div>`;
  S.debts.forEach(d => {
    const left = debtLeft(d), p = d.total ? debtPaid(d) / d.total : 0;
    const eta = d.installment > 0 && left > 0 ? `${Math.ceil(left / d.installment)} parcelas de ${brl(d.installment)}` : (left > 0 ? 'defina o valor da parcela' : 'quitada 🎉');
    h += `<div class="card goal"><div class="head"><b>🧾 ${esc(d.name)}</b><span class="mut">${Math.round(p * 100)}% pago</span></div>
      ${bar(p)}
      <div class="line"><span>Saldo devedor</span><b>${brl(left)}</b></div>
      <div class="hint">${eta}</div>
      <div class="acts"><button class="ghost small" data-a="paydebt" data-id="${d.id}">Pagar parcela</button><button class="ghost small" data-a="editdebt" data-id="${d.id}">Editar</button></div></div>`;
  });
  $('#main').innerHTML = h;
}

/* =====================================================================
   MERCADO
   ===================================================================== */
const M = () => S.market;
const mItem = id => M().items.find(x => x.id === id);

function curList() {
  const m = M();
  let l = m.lists.find(x => x.id === m.cur) || m.lists[m.lists.length - 1];
  if (!l) l = newList();
  m.cur = l.id;
  return l;
}
function newList(name, copyFrom) {
  const d = new Date();
  const l = { id: uid(), name: name || `Lista ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, created: today(), items: [] };
  const src = copyFrom && M().lists.find(x => x.id === copyFrom);
  if (src) l.items = src.items.map(i => ({ id: i.id, qty: i.qty, done: false }));
  M().lists.push(l);
  M().cur = l.id;
  return l;
}
function addCatalog(name, cat, unit) {
  let it = M().items.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (!it) { it = { id: uid(), name, cat, unit: unit || 'un', prices: [] }; M().items.push(it); }
  else { it.cat = cat; if (unit) it.unit = unit; }
  return it;
}
function addPrice(it, p, m) {
  if (!(p > 0)) return;
  const last = it.prices[0];
  if (last && last.p === p && (last.m || '') === (m || '')) last.d = today();
  else { it.prices.unshift({ p, m: m || '', d: today() }); it.prices = it.prices.slice(0, 3); }
  if (m) { if (!M().markets.includes(m)) M().markets.push(m); M().lastMkt = m; }
}
function addToList(l, itemId, qty) {
  const ex = l.items.find(x => x.id === itemId && !x.done);
  if (ex) ex.qty = +(ex.qty + (qty || 1)).toFixed(2);
  else l.items.push({ id: itemId, qty: qty || 1, done: false });
}

function priceHist(it) {
  if (!it.prices.length) return '<span class="ph nop">sem preço ainda</span>';
  const min = Math.min(...it.prices.map(x => x.p));
  return it.prices.map((x, i) =>
    `<span class="ph ${x.p === min && it.prices.length > 1 ? 'best' : ''} ${i === 0 ? 'first' : ''}">${brl(x.p)} <small>${esc(x.m || '—')}</small></span>`).join('');
}

function fillLists() {
  $('#dlItems').innerHTML = M().items.map(i => `<option value="${esc(i.name)}">`).join('');
  $('#dlMarkets').innerHTML = M().markets.map(m => `<option value="${esc(m)}">`).join('');
}

function mrow(x, done) {
  const it = mItem(x.id);
  if (!it) return '';
  const val = done ? x.paid * x.qty : (it.prices[0] ? it.prices[0].p * x.qty : 0);
  return `<div class="mi ${done ? 'done' : ''}">
    <button class="chk" data-a="chk" data-id="${x.id}" aria-label="${done ? 'desmarcar' : 'marcar como comprado'}">${done ? '✓' : ''}</button>
    <div class="mt" data-a="medit" data-id="${x.id}"><b>${esc(it.name)}</b> <small>${fq(x.qty)} ${esc(it.unit)}</small>
      <div class="phr">${done ? `<span class="ph first">${brl(x.paid)}/${esc(it.unit)} <small>${esc(x.mkt || '')}</small></span>` : priceHist(it)}</div></div>
    <div class="mv">${val ? brl(val) : '—'}</div></div>`;
}

function renderMarket() {
  fillLists();
  const m = M(), l = curList();
  const pend = l.items.filter(x => !x.done && mItem(x.id));
  const done = l.items.filter(x => x.done && mItem(x.id));
  const est = sumBy(pend, x => (mItem(x.id).prices[0] ? mItem(x.id).prices[0].p * x.qty : 0));
  const noPrice = pend.filter(x => !mItem(x.id).prices[0]).length;
  const got = sumBy(done, x => x.paid * x.qty);

  // Mercado mais barato (itens com preço em 2+ mercados)
  const tally = {};
  m.items.forEach(it => {
    const mk = new Set(it.prices.filter(p => p.m).map(p => p.m));
    if (mk.size < 2) return;
    const best = it.prices.filter(p => p.m).sort((a, b) => a.p - b.p)[0];
    tally[best.m] = (tally[best.m] || 0) + 1;
  });
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];

  let h = `<div class="card mhead">
    <select id="listSel" aria-label="Lista">${m.lists.map(x => `<option value="${x.id}" ${x.id === l.id ? 'selected' : ''}>${esc(x.name)}${x.finished ? ' ✓' : ''}</option>`).join('')}</select>
    <div class="btns">
      <button class="ghost small" data-a="newlist">＋ Nova lista</button>
      <button class="ghost small" data-a="replist">↻ Repetir esta</button>
      <button class="ghost small" data-a="editlist">⋯</button>
    </div>
    <div class="chips" style="flex-wrap:wrap"><button class="chip" data-a="newmc">＋ Categoria</button>${S.customMc.map(c => `<button class="chip" data-a="editmc" data-id="${esc(c.n)}">${c.i} ${esc(c.n)}</button>`).join('')}</div>
    <div class="line"><span>Estimado (pendente)</span><b>${brl(est)}</b></div>
    ${noPrice ? `<div class="hint" style="margin:0">${noPrice} ${noPrice > 1 ? 'itens sem preço' : 'item sem preço'} no estimado</div>` : ''}
    <div class="line"><span>Comprado</span><b class="ok-t">${brl(got)}</b></div>
    ${top ? `<div class="hint" style="margin:0">💡 ${esc(top[0])} tem o menor preço em ${top[1]} ${top[1] > 1 ? 'itens comparados' : 'item comparado'}.</div>` : ''}
    ${l.finished ? `<span class="tag">✓ já lançada no financeiro</span>` : (done.length ? `<button class="cta" data-a="finish">Finalizar compra (${brl(got)})</button>` : '')}
  </div>`;

  MC.forEach(c => {
    const arr = pend.filter(x => (MC.some(k => k.n === mItem(x.id).cat) ? mItem(x.id).cat : 'Outros') === c.n);
    if (arr.length) h += `<div class="card"><h3>${c.i} ${c.n}</h3>${arr.map(x => mrow(x, false)).join('')}</div>`;
  });
  if (done.length) h += `<div class="card"><h3>✅ Concluído (${done.length})</h3>${done.map(x => mrow(x, true)).join('')}</div>`;

  // Adicionar rápido: sugestões que ainda não estão na lista
  const inList = new Set(l.items.map(x => (mItem(x.id) || {}).name && mItem(x.id).name.toLowerCase()));
  const sg = SUGG.map((s, i) => ({ s, i })).filter(o => !inList.has(o.s[1].toLowerCase()));
  if (sg.length) {
    h += `<div class="card"><h3>${l.items.length ? 'Adicionar rápido' : 'Comece por aqui'}</h3>
      <div class="hint" style="margin:0 0 8px">Toque para pôr na lista. Para outros itens, use o botão +.</div>
      <div class="chips" style="flex-wrap:wrap">${sg.map(o => `<button class="chip" data-a="sugg" data-id="${o.i}">${esc(o.s[1])}</button>`).join('')}</div></div>`;
  }

  $('#main').innerHTML = h;
}

/* ---- formulários do mercado ---- */
function openAddItem() {
  fillLists();
  openForm({
    title: 'Adicionar item',
    fields: [
      { id: 'name', l: 'Item', t: 'text', req: 1, ph: 'Ex.: Alcatra', list: 'dlItems' },
      { id: 'cat', l: 'Categoria', t: 'select', opts: MC.map(c => ({ v: c.n, l: c.i + ' ' + c.n })), value: 'Mercearia' },
      { id: 'unit', l: 'Unidade', t: 'text', value: 'un', ph: 'un, kg, L, pct' },
      { id: 'qty', l: 'Quantidade', t: 'money', value: 1 },
      { id: 'price', l: 'Preço de referência (opcional)', t: 'money', ph: '0,00' },
      { id: 'market', l: 'Mercado do preço (opcional)', t: 'text', list: 'dlMarkets', value: M().lastMkt },
    ],
    submit: 'Adicionar',
    after: f => {
      const n = f.querySelector('[data-f=name]');
      n.addEventListener('input', () => {
        const it = M().items.find(x => x.name.toLowerCase() === n.value.trim().toLowerCase());
        if (it) { f.querySelector('[data-f=cat]').value = it.cat; f.querySelector('[data-f=unit]').value = it.unit; }
      });
    },
    onSubmit: v => {
      const it = addCatalog(v.name, v.cat, v.unit || 'un');
      addPrice(it, v.price, v.market);
      addToList(curList(), it.id, v.qty || 1);
    },
  });
}

function openBuy(x) {
  const it = mItem(x.id), l = curList();
  const note = it.prices.length
    ? `<b>Preços anteriores</b><br>${it.prices.map(p => `<span class="ph">${brl(p.p)} <small>${esc(p.m || '—')}</small></span>`).join('')}`
    : 'Primeiro registro de preço deste item.';
  fillLists();
  openForm({
    title: 'Comprei: ' + it.name,
    note,
    fields: [
      { id: 'price', l: `Preço por ${it.unit} (R$)`, t: 'money', req: 1, value: it.prices[0] ? it.prices[0].p : '' },
      { id: 'market', l: 'Mercado', t: 'text', list: 'dlMarkets', value: M().lastMkt, ph: 'Ex.: Mercado A' },
      { id: 'qty', l: 'Quantidade', t: 'money', req: 1, value: x.qty },
    ],
    submit: 'Marcar comprado',
    onSubmit: v => {
      x.done = true; x.paid = v.price; x.mkt = v.market; x.qty = v.qty;
      addPrice(it, v.price, v.market);
      // item concluído vai para o fim da lista
      l.items = l.items.filter(y => y !== x).concat(x);
    },
  });
}

function openEditItem(x) {
  const it = mItem(x.id);
  fillLists();
  openForm({
    title: 'Editar item',
    fields: [
      { id: 'name', l: 'Nome', t: 'text', req: 1, value: it.name },
      { id: 'cat', l: 'Categoria', t: 'select', opts: MC.map(c => ({ v: c.n, l: c.i + ' ' + c.n })), value: it.cat },
      { id: 'unit', l: 'Unidade', t: 'text', value: it.unit },
      { id: 'qty', l: 'Quantidade', t: 'money', req: 1, value: x.qty },
      { id: 'price', l: 'Registrar preço agora (opcional)', t: 'money', ph: '0,00' },
      { id: 'market', l: 'Mercado desse preço', t: 'text', list: 'dlMarkets', value: M().lastMkt },
    ],
    note: `<b>Histórico</b><br>${it.prices.length ? it.prices.map(p => `<span class="ph">${brl(p.p)} <small>${esc(p.m || '—')} · ${p.d.split('-').reverse().join('/')}</small></span>`).join('') : 'Sem preços registrados.'}`,
    delLabel: 'Remover da lista',
    confirm: 'Remover este item da lista?',
    onDelete: () => { const l = curList(); l.items = l.items.filter(y => y !== x); },
    onSubmit: v => {
      it.name = v.name; it.cat = v.cat; it.unit = v.unit || 'un'; x.qty = v.qty;
      addPrice(it, v.price, v.market);
    },
  });
}

function openNewList(copyCur) {
  const l = curList();
  openForm({
    title: copyCur ? 'Repetir lista' : 'Nova lista',
    fields: [
      { id: 'name', l: 'Nome da lista', t: 'text', req: 1, value: (() => { const d = new Date(); return `Lista ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; })() },
      {
        id: 'copy', l: 'Começar com os itens de', t: 'select', value: copyCur ? l.id : '',
        opts: [{ v: '', l: '— lista em branco —' }].concat(M().lists.slice().reverse().map(x => ({ v: x.id, l: x.name }))),
      },
    ],
    submit: 'Criar lista',
    onSubmit: v => { newList(v.name, v.copy); },
  });
}

function openEditList() {
  const l = curList();
  openForm({
    title: 'Lista',
    fields: [{ id: 'name', l: 'Nome', t: 'text', req: 1, value: l.name }],
    delLabel: 'Excluir lista',
    confirm: 'Excluir esta lista? Os preços salvos continuam no histórico.',
    onDelete: () => { M().lists = M().lists.filter(x => x.id !== l.id); M().cur = null; },
    onSubmit: v => { l.name = v.name; },
  });
}

function openFinish() {
  const l = curList();
  const got = sumBy(l.items.filter(x => x.done), x => x.paid * x.qty);
  openForm({
    title: 'Finalizar compra',
    note: 'Isso lança uma despesa de <b>Mercado</b> no financeiro.',
    fields: [
      { id: 'amount', l: 'Valor total (R$)', t: 'money', req: 1, value: Math.round(got * 100) / 100 },
      {
        id: 'wallet', l: 'Pago com', t: 'select', value: 'va',
        opts: [{ v: 'va', l: 'Vale alimentação' }, { v: 'main', l: 'Dinheiro / Pix / débito' }, { v: 'card', l: 'Cartão de crédito' }],
      },
      { id: 'date', l: 'Data', t: 'text', value: defaultDateIso() },
    ],
    submit: 'Lançar',
    onSubmit: v => {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(v.date) ? v.date : today();
      const t = { id: uid(), type: 'out', cat: 'Mercado', wallet: v.wallet, amount: v.amount, desc: l.name, date };
      S.tx.push(t); l.finished = t.id; view = date.slice(0, 7);
    },
  });
}
const defaultDateIso = () => today();

/* =====================================================================
   FORMULÁRIO GENÉRICO
   ===================================================================== */
let gen = null;
function openForm(cfg) {
  gen = cfg;
  let h = `<h2>${esc(cfg.title)}</h2>`;
  if (cfg.note) h += `<div class="note">${cfg.note}</div>`;
  cfg.fields.forEach(fd => {
    const v = fd.value == null ? '' : fd.value;
    if (fd.t === 'select') {
      h += `<label><span>${esc(fd.l)}</span><select data-f="${fd.id}">${fd.opts.map(o => `<option value="${esc(o.v)}"${String(o.v) === String(v) ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select></label>`;
    } else {
      h += `<label><span>${esc(fd.l)}</span><input data-f="${fd.id}" ${fd.t === 'money' ? 'inputmode="decimal"' : ''} ${fd.list ? `list="${fd.list}"` : ''} placeholder="${esc(fd.ph || '')}" value="${esc(fd.t === 'money' ? toInput(v) : v)}"></label>`;
    }
  });
  h += `<div class="row">${cfg.onDelete ? `<button type="button" class="ghost danger" id="gDel">${esc(cfg.delLabel || 'Excluir')}</button>` : ''}
    <button type="button" class="ghost" data-close>Cancelar</button><button type="submit" class="primary">${esc(cfg.submit || 'Salvar')}</button></div>`;
  const f = $('#formGen');
  f.innerHTML = h;
  f.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheets));
  openSheet($('#sheetGen'));
  if (cfg.after) cfg.after(f);
}
$('#formGen').addEventListener('submit', e => {
  e.preventDefault();
  if (!gen) return;
  const vals = {}; let bad = null;
  gen.fields.forEach(fd => {
    const el = $(`#formGen [data-f="${fd.id}"]`);
    const v = fd.t === 'money' ? parseMoney(el.value) : el.value.trim();
    vals[fd.id] = v;
    if (fd.req && (fd.t === 'money' ? !(v > 0) : !v) && !bad) bad = el;
  });
  if (bad) { bad.focus(); return; }
  const cfg = gen;
  if (cfg.onSubmit(vals) === false) return;
  persist(); closeSheets(); render();
});
$('#formGen').addEventListener('click', e => {
  if (e.target.id === 'gDel' && gen && gen.onDelete && confirm(gen.confirm || 'Excluir?')) {
    gen.onDelete(); persist(); closeSheets(); render();
  }
});

/* =====================================================================
   SHEETS
   ===================================================================== */
const backdrop = $('#backdrop');
function openSheet(el) { backdrop.classList.add('open'); el.classList.add('open'); }
function closeSheets() {
  backdrop.classList.remove('open');
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
  if (document.activeElement) document.activeElement.blur();
}
backdrop.addEventListener('click', closeSheets);
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheets));

/* =====================================================================
   LANÇAMENTO (formulário)
   ===================================================================== */
let editing = null, curType = 'out', curAuto = null;

function setType(type, p = {}) {
  curType = type;
  document.querySelectorAll('#seg button').forEach(b => b.classList.toggle('on', b.dataset.type === type));
  const sel = $('#fCat');
  $('#lblWallet').hidden = type !== 'out';
  if (type === 'out') {
    $('#catLbl').textContent = 'Categoria';
    sel.innerHTML = OUT.map(c => `<option value="${esc(c.n)}">${c.i} ${esc(c.n)}${c.e ? '' : ' (não essencial)'}</option>`).join('');
    if (p.cat) sel.value = p.cat;
    $('#fWallet').value = p.wallet || 'main';
  } else if (type === 'in') {
    $('#catLbl').textContent = 'Categoria';
    sel.innerHTML = INC.map(c => `<option value="${esc(c.n)}">${c.i} ${esc(c.n)}</option>`).join('');
    if (p.cat) sel.value = p.cat;
  } else if (type === 'save') {
    $('#catLbl').textContent = 'Meta';
    sel.innerHTML = S.goals.map(g => `<option value="${g.id}">🎯 ${esc(g.name)}</option>`).join('');
    if (p.goal) sel.value = p.goal;
  } else {
    $('#catLbl').textContent = 'Dívida';
    sel.innerHTML = S.debts.map(d => `<option value="${d.id}">🧾 ${esc(d.name)}</option>`).join('');
    if (p.debt) sel.value = p.debt;
  }
}
document.querySelectorAll('#seg button').forEach(b => b.addEventListener('click', () => setType(b.dataset.type)));

function openTx(id, pre) {
  editing = id || null;
  const t = id ? S.tx.find(x => x.id === id) : null;
  const p = t || pre || {};
  $('#txTitle').textContent = t ? 'Editar lançamento' : 'Novo lançamento';
  $('#btnDel').hidden = !t;
  curAuto = t ? t.auto : (p.auto || null);
  setType(p.type || 'out', p);
  $('#fAmount').value = p.amount ? toInput(p.amount) : '';
  $('#fDesc').value = p.desc || '';
  $('#fDate').value = p.date || defaultDate();
  openSheet($('#sheetTx'));
  if (!t && !p.amount) setTimeout(() => $('#fAmount').focus(), 300);
}

$('#formTx').addEventListener('submit', e => {
  e.preventDefault();
  const amount = parseMoney($('#fAmount').value);
  if (amount <= 0) { $('#fAmount').focus(); return; }
  const val = $('#fCat').value;
  if (!val) { alert(curType === 'save' ? 'Crie uma meta primeiro (aba Metas).' : 'Crie uma dívida primeiro (aba Metas).'); return; }
  const obj = { id: editing || uid(), type: curType, amount, desc: $('#fDesc').value.trim(), date: $('#fDate').value };
  if (curAuto) obj.auto = curAuto;
  if (curType === 'out') { obj.cat = val; obj.wallet = $('#fWallet').value; }
  else if (curType === 'in') { obj.cat = val; obj.wallet = incInfo(val).w; }
  else if (curType === 'save') { obj.goal = val; obj.cat = (S.goals.find(g => g.id === val) || {}).name; }
  else { obj.debt = val; obj.cat = (S.debts.find(d => d.id === val) || {}).name; }
  if (editing) S.tx = S.tx.map(t => (t.id === editing ? obj : t)); else S.tx.push(obj);
  persist();
  view = obj.date.slice(0, 7);
  closeSheets();
  render();
});

$('#btnDel').addEventListener('click', () => {
  if (editing && confirm('Excluir este lançamento?')) {
    S.tx = S.tx.filter(t => t.id !== editing);
    persist(); closeSheets(); render();
  }
});

/* =====================================================================
   PLANO / METAS / DÍVIDAS: formulários
   ===================================================================== */
function editBudget(name) {
  const ci = catInfo(name);
  openForm({
    title: `${ci.i} ${name}`,
    fields: [{ id: 'v', l: 'Orçamento mensal (R$)', t: 'money', value: S.budgets[name] || 0 }],
    onSubmit: v => { S.budgets[name] = v.v; },
  });
}
function editIncome() {
  openForm({
    title: 'Renda esperada por mês',
    fields: [
      { id: 'main', l: 'Salário / dinheiro (R$)', t: 'money', value: S.settings.income.main },
      { id: 'va', l: 'Vale alimentação (R$)', t: 'money', value: S.settings.income.va },
    ],
    onSubmit: v => { S.settings.income = { main: v.main, va: v.va }; },
  });
}
function editGoal(id) {
  const g = id ? S.goals.find(x => x.id === id) : null;
  const saved = g ? goalSaved(g) : 0, lancado = g ? goalSaved(g) - (g.start || 0) : 0;
  openForm({
    title: g ? 'Editar meta' : 'Nova meta',
    fields: [
      { id: 'name', l: 'Nome', t: 'text', req: 1, value: g ? g.name : '', ph: 'Ex.: Viagem' },
      { id: 'target', l: 'Valor da meta (R$)', t: 'money', req: 1, value: g ? g.target : '' },
      { id: 'saved', l: 'Já guardado no total (R$)', t: 'money', value: saved },
      { id: 'monthly', l: 'Guardar por mês (R$)', t: 'money', value: g ? g.monthly : '' },
    ],
    onDelete: g ? () => { S.goals = S.goals.filter(x => x.id !== id); } : null,
    confirm: 'Excluir esta meta? Os lançamentos continuam no histórico.',
    onSubmit: v => {
      const o = g || { id: uid() };
      o.name = v.name; o.target = v.target; o.monthly = v.monthly; o.start = Math.max(0, v.saved - lancado);
      if (!g) S.goals.push(o);
    },
  });
}
const cleanIcon = (s, d) => Array.from(s || '').slice(0, 2).join('') || d;

function editCat(name) {
  const cu = name ? S.customOut.find(x => x.n === name) : null;
  openForm({
    title: cu ? 'Editar categoria' : 'Nova categoria de despesa',
    fields: [
      { id: 'name', l: 'Nome', t: 'text', req: 1, value: cu ? cu.n : '', ph: 'Ex.: Pet' },
      { id: 'icon', l: 'Emoji (ícone)', t: 'text', value: cu ? cu.i : '🏷️' },
      {
        id: 'e', l: 'Tipo', t: 'select', value: cu && !cu.e ? '0' : '1',
        opts: [{ v: '1', l: 'Essencial' }, { v: '0', l: 'Não essencial (entra no teto dos supérfluos)' }],
      },
      { id: 'b', l: 'Orçamento mensal (R$)', t: 'money', value: cu ? S.budgets[cu.n] : '' },
    ],
    onDelete: cu ? () => {
      S.tx.forEach(t => { if (t.type === 'out' && t.cat === cu.n) t.cat = 'Outros'; });
      S.customOut = S.customOut.filter(x => x.n !== cu.n);
      delete S.budgets[cu.n];
      syncCats();
    } : null,
    confirm: 'Excluir a categoria? Os lançamentos dela passam para "Outros".',
    onSubmit: v => {
      if (OUT.some(c => c.n.toLowerCase() === v.name.toLowerCase() && (!cu || c.n !== cu.n))) { alert('Já existe uma categoria com esse nome.'); return false; }
      if (cu) {
        if (cu.n !== v.name) {
          S.tx.forEach(t => { if (t.type === 'out' && t.cat === cu.n) t.cat = v.name; });
          delete S.budgets[cu.n];
          cu.n = v.name;
        }
        cu.i = cleanIcon(v.icon, '🏷️'); cu.e = +v.e;
      } else {
        S.customOut.push({ n: v.name, i: cleanIcon(v.icon, '🏷️'), e: +v.e, fx: 0 });
      }
      S.budgets[v.name] = v.b;
      syncCats();
    },
  });
}

function editMc(name) {
  const cu = name ? S.customMc.find(x => x.n === name) : null;
  openForm({
    title: cu ? 'Editar categoria do mercado' : 'Nova categoria do mercado',
    fields: [
      { id: 'name', l: 'Nome', t: 'text', req: 1, value: cu ? cu.n : '', ph: 'Ex.: Bebê' },
      { id: 'icon', l: 'Emoji (ícone)', t: 'text', value: cu ? cu.i : '🏷️' },
    ],
    onDelete: cu ? () => {
      M().items.forEach(it => { if (it.cat === cu.n) it.cat = 'Outros'; });
      S.customMc = S.customMc.filter(x => x.n !== cu.n);
      syncCats();
    } : null,
    confirm: 'Excluir a categoria? Os itens dela passam para "Outros".',
    onSubmit: v => {
      if (MC.some(c => c.n.toLowerCase() === v.name.toLowerCase() && (!cu || c.n !== cu.n))) { alert('Já existe uma categoria com esse nome.'); return false; }
      if (cu) {
        if (cu.n !== v.name) { M().items.forEach(it => { if (it.cat === cu.n) it.cat = v.name; }); cu.n = v.name; }
        cu.i = cleanIcon(v.icon, '🏷️');
      } else S.customMc.push({ n: v.name, i: cleanIcon(v.icon, '🏷️') });
      syncCats();
    },
  });
}

function editDebt(id) {
  const d = id ? S.debts.find(x => x.id === id) : null;
  openForm({
    title: d ? 'Editar dívida' : 'Nova dívida',
    note: d ? 'Depois de renegociar, atualize o saldo devedor e a parcela aqui.' : '',
    fields: [
      { id: 'name', l: 'Nome', t: 'text', req: 1, value: d ? d.name : '', ph: 'Ex.: Cartão' },
      { id: 'left', l: 'Saldo devedor atual (R$)', t: 'money', req: 1, value: d ? debtLeft(d) : '' },
      { id: 'inst', l: 'Parcela mensal (R$)', t: 'money', value: d ? d.installment : '' },
    ],
    onDelete: d ? () => { S.debts = S.debts.filter(x => x.id !== id); } : null,
    confirm: 'Excluir esta dívida? Os lançamentos continuam no histórico.',
    onSubmit: v => {
      const o = d || { id: uid() };
      o.name = v.name; o.installment = v.inst;
      o.total = v.left + (d ? debtPaid(d) : 0);
      if (!d) S.debts.push(o);
    },
  });
}

/* =====================================================================
   CONFIGURAÇÕES
   ===================================================================== */
$('#openSet').addEventListener('click', () => {
  $('#sCardCap').value = toInput(S.settings.cardCap);
  openSheet($('#sheetSet'));
});
$('#formSet').addEventListener('submit', e => {
  e.preventDefault();
  S.settings.cardCap = parseMoney($('#sCardCap').value);
  persist(); closeSheets(); render();
});
$('#btnExport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `financas-backup-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('#btnImport').addEventListener('click', () => $('#fileImport').click());
$('#fileImport').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || !Array.isArray(d.tx)) throw 0;
      if (!confirm('Isso substitui os dados atuais pelos do backup. Continuar?')) return;
      S = fill(d); syncCats();
      persist(); closeSheets(); render();
    } catch (err) { alert('Arquivo inválido.'); }
  };
  r.readAsText(f);
  e.target.value = '';
});
$('#btnWipe').addEventListener('click', () => {
  if (confirm('Apagar TODOS os dados? Não dá para desfazer.')) {
    S = defaults(); syncCats(); persist(); closeSheets(); render();
  }
});

/* =====================================================================
   EVENTOS GLOBAIS
   ===================================================================== */
function shiftMonth(d) {
  const [y, m] = view.split('-').map(Number);
  const n = new Date(y, m - 1 + d, 1);
  view = `${n.getFullYear()}-${pad(n.getMonth() + 1)}`;
  render();
}
$('#prev').addEventListener('click', () => shiftMonth(-1));
$('#next').addEventListener('click', () => shiftMonth(1));
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
$('#fab').addEventListener('click', () => (tab === 'market' ? openAddItem() : openTx()));

const ACT = {
  go: id => setTab(id),
  flt: id => { flt = id; render(); },
  tx: id => openTx(id),
  inc: () => editIncome(),
  bud: id => editBudget(id),
  ck: id => { const r = CK[id]; if (r && !r.done) openTx(null, { ...r.pre, amount: r.a, auto: r.k, date: defaultDate() }); },
  newgoal: () => editGoal(null),
  editgoal: id => editGoal(id),
  paygoal: id => openTx(null, { type: 'save', goal: id }),
  newdebt: () => editDebt(null),
  editdebt: id => editDebt(id),
  paydebt: id => { const d = S.debts.find(x => x.id === id); openTx(null, { type: 'debt', debt: id, amount: d && d.installment }); },
  chk: id => {
    const l = curList(), x = l.items.find(y => y.id === id);
    if (!x) return;
    if (x.done) { x.done = false; delete x.paid; delete x.mkt; persist(); render(); } else openBuy(x);
  },
  medit: id => { const x = curList().items.find(y => y.id === id); if (x) openEditItem(x); },
  newlist: () => openNewList(false),
  replist: () => openNewList(true),
  editlist: () => openEditList(),
  finish: () => openFinish(),
  newcat: () => editCat(null),
  editcat: id => editCat(id),
  newmc: () => editMc(null),
  editmc: id => editMc(id),
  cm: id => { chartMode = id; render(); },
  sugg: id => {
    const s = SUGG[+id], it = addCatalog(s[1], s[0], 'un');
    addToList(curList(), it.id, 1); persist(); render();
  },
};
$('#main').addEventListener('click', e => {
  const a = e.target.closest('[data-a]');
  if (a && ACT[a.dataset.a]) ACT[a.dataset.a](a.dataset.id, a);
});
$('#main').addEventListener('change', e => {
  if (e.target.id === 'listSel') { M().cur = e.target.value; persist(); render(); }
});

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

render();
