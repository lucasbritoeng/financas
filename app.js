'use strict';

const APP_VERSION = '4.0';

/* =====================================================================
   ÍCONES (traço, uma cor, herdam a cor do texto)
   ===================================================================== */
const IC = {
  home: '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M5.5 10v9.5h13V10"/>',
  receipt: '<path d="M6.5 3.5h11a1 1 0 0 1 1 1V20l-3-1.8-3 1.8-3-1.8-3 1.8V4.5a1 1 0 0 1 1-1z"/><path d="M9.5 8.5h5M9.5 12h5"/>',
  cart: '<path d="M3.5 5h2.3l1.7 9h9.6l1.4-6.5H7"/><circle cx="9.2" cy="18.5" r="1.3"/><circle cx="16.4" cy="18.5" r="1.3"/>',
  plan: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9.2l1.3 1.3L11.8 8M14 9.4h3M8 15l1.3 1.3L11.8 13.8M14 15.2h3"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  plus: '<path d="M12 5.5v13M5.5 12h13"/>',
  left: '<path d="M14.5 6 8.5 12l6 6"/>',
  right: '<path d="M9.5 6l6 6-6 6"/>',
  sliders: '<path d="M4.5 8h8M17.5 8h2M4.5 16h2M11.5 16h8"/><circle cx="15" cy="8" r="2.2"/><circle cx="9" cy="16" r="2.2"/>',
  check: '<path d="M5.5 12.5l4.2 4.2L18.5 8"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  chevd: '<path d="M6 9.5l6 6 6-6"/>',
  chevu: '<path d="M6 14.5l6-6 6 6"/>',
  circle: '<circle cx="12" cy="12" r="8.5"/>',
};
const ico = (n, s = 22, cls = '') =>
  `<svg class="ic ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* =====================================================================
   CATÁLOGOS
   e = essencial (1) ou não (0) · fx = conta fixa (entra no checklist)
   ===================================================================== */
const OUT_BASE = [
  { n: 'Moradia', e: 1, fx: 1, b: 0 },
  { n: 'Energia', e: 1, fx: 1, b: 0 },
  { n: 'Água', e: 1, fx: 1, b: 0 },
  { n: 'Internet', e: 1, fx: 1, b: 0 },
  { n: 'Gás', e: 1, b: 0 },
  { n: 'Combustível', e: 1, b: 0 },
  { n: 'Mercado', e: 1, b: 0 },
  { n: 'Carro', e: 1, b: 0 },
  { n: 'Casa e utilidades', e: 1, b: 0 },
  { n: 'Saúde e farmácia', e: 1, b: 0 },
  { n: 'Filhos', e: 1, b: 0 },
  { n: 'MEI', e: 1, fx: 1, b: 0 },
  { n: 'Cuidados pessoais', e: 1, b: 0 },
  { n: 'Dízimo e ofertas', e: 1, b: 0 },
  { n: 'Lazer e delivery', e: 0, b: 0 },
  { n: 'Compras pessoais', e: 0, b: 0 },
  { n: 'Assinaturas', e: 0, fx: 1, b: 0 },
  { n: 'Outros', e: 0, b: 0 },
];
let OUT = OUT_BASE.slice();
const INC = [
  { n: 'Salário', w: 'main' },
  { n: 'Vale alimentação', w: 'va' },
  { n: 'Projetos e serviços', w: 'main' },
  { n: 'Outras receitas', w: 'main' },
];
const WTAG = { main: '', card: 'Cartão', va: 'Vale' };

const MC_BASE = [
  { n: 'Carnes' }, { n: 'Hortifruti' }, { n: 'Mercearia' }, { n: 'Laticínios e frios' }, { n: 'Padaria' },
  { n: 'Bebidas' }, { n: 'Limpeza' }, { n: 'Higiene' }, { n: 'Congelados' }, { n: 'Outros' },
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
    settings: { cardCap: 0, income: { main: 0, va: 0 } },
    budgets,
    customOut: [],
    customMc: [],
    goals: [
      { id: 'g-reserva', name: 'Reserva de emergência', target: 3000, start: 0, monthly: 0 },
    ],
    debts: [],
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
    'Educação': 'Outros', 'Filho': 'Filhos', 'Levi': 'Filhos', 'Restaurantes e delivery': 'Lazer e delivery', 'Lazer': 'Lazer e delivery',
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
  // dados antigos: 'Levi' virou 'Filhos'
  if (S.budgets.Levi != null) { if (!S.budgets.Filhos) S.budgets.Filhos = S.budgets.Levi; delete S.budgets.Levi; }
  S.tx.forEach(t => { if (t.type === 'out' && t.cat === 'Levi') t.cat = 'Filhos'; });
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
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };

const catInfo = n => OUT.find(c => c.n === n) || { n, e: 1 };
const incInfo = n => INC.find(c => c.n === n) || { n, w: 'main' };
const W = t => t.wallet || 'main';

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
let tab = 'home', flt = 'all', catAll = false, chartOpen = false, chartMode = 'gastos', showSugg = false;
const TITLES = { market: 'Mercado', goals: 'Metas e dívidas' };

function setTab(t) { tab = t; render(); window.scrollTo(0, 0); }

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
const fmtK = v => (v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : v > 0 ? String(Math.round(v)) : '');

function chartBody() {
  const [vy, vm] = view.split('-').map(Number);
  const ms = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(vy, vm - 1 - i, 1); ms.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); }
  const st = ms.map(monthStats);
  const MODES = [['gastos', 'Gastos'], ['ne', 'Não essenciais'], ['sav', 'Metas e dívidas']];
  let h = `<div class="seg2">${MODES.map(([k, l]) => `<button class="chip ${chartMode === k ? 'on' : ''}" data-a="cm" data-id="${k}">${l}</button>`).join('')}</div>`;
  if (!st.some(s => s.ess + s.ne + s.inc + s.sav > 0)) return h + `<div class="hint">O gráfico aparece conforme você lança os meses.</div>`;

  const neLim = sumBy(OUT.filter(c => !c.e), c => S.budgets[c.n]);
  const val = s => (chartMode === 'gastos' ? s.ess + s.ne : chartMode === 'ne' ? s.ne : s.sav);
  const vals = st.map(val);
  const mx = Math.max(1, ...vals, chartMode === 'gastos' ? Math.max(...st.map(s => s.inc)) : 0, chartMode === 'ne' ? neLim : 0) * 1.12;
  const VW = 340, VH = 170, pl = 6, pr = 6, pt = 16, pb = 24;
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
    h += `<div class="sub">Neste mês <b class="n">${brl(cur)}</b>${prev > 0 ? `, mês anterior ${brl(prev)} (<span class="${good ? 'pos' : 'crit'}">${d > 0 ? 'mais' : 'menos'} ${brl(Math.abs(d))}</span>)` : ''}</div>`;
  }
  return h;
}

function limitRow(label, val, lim) {
  const p = lim ? val / lim : 0, cls = p >= 1 ? 'over' : p >= 0.8 ? 'warn' : '';
  return `<div class="lim"><div class="line"><span>${label}</span><span class="n">${brl(val)} <small>de ${brl(lim)}</small></span></div>${bar(p, cls)}
    <div class="sub ${p >= 1 ? 'crit' : ''}">${p >= 1 ? 'Passou ' + brl(val - lim) : 'Restam ' + brl(lim - val)}</div></div>`;
}

function renderHome() {
  const c = calc(view), cap = S.settings.cardCap;
  const neLim = sumBy(OUT.filter(x => !x.e), x => S.budgets[x.n]);
  let h = '';

  h += `<section class="hero"><div class="eyebrow">${view === thisMonth() ? greet() + '. ' : ''}Saldo em dinheiro</div>
    <div class="big n ${c.saldo < 0 ? 'neg' : ''}">${brl(c.saldo)}</div>
    <div class="trio">
      <div><span>Receitas</span><b class="n">${brl(c.incMain)}</b></div>
      <div><span>Despesas</span><b class="n">${brl(c.outMain + c.outCard)}</b></div>
      <div><span>Guardado</span><b class="n">${brl(c.sav + c.debt)}</b></div>
    </div>`;
  if (c.incVA || c.outVA) {
    const left = c.incVA - c.outVA;
    h += `<div class="va"><span>Vale alimentação</span><b class="n ${left < 0 ? 'crit' : ''}">${brl(left)} <small>de ${brl(c.incVA)}</small></b></div>`;
  }
  h += `</section>`;

  if (!c.tx.some(t => t.type === 'in' && W(t) !== 'va')) {
    h += `<button class="note-btn" data-a="go" data-id="plan"><span>Lançar salário e contas do mês</span>${ico('right', 18)}</button>`;
  }

  if (neLim > 0 || cap > 0) {
    h += `<section class="card"><div class="eyebrow">Limites do mês</div>`;
    if (neLim > 0) h += limitRow('Gastos não essenciais', c.ne, neLim);
    if (cap > 0) h += limitRow('Cartão de crédito', c.outCard, cap);
    h += `</section>`;
  }

  const by = {};
  c.tx.filter(t => t.type === 'out').forEach(t => (by[t.cat] = (by[t.cat] || 0) + t.amount));
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]);
  if (rows.length) {
    const show = catAll ? rows : rows.slice(0, 5);
    h += `<section class="card"><div class="eyebrow">Gastos por categoria</div>` + show.map(([name, v]) => {
      const b = S.budgets[name] || 0, over = b > 0 && v > b;
      return `<div class="crow"><div class="line"><span>${esc(name)}</span><span class="n ${over ? 'crit' : ''}">${brl(v)}${b > 0 ? ` <small>de ${brl(b)}</small>` : ''}</span></div>${b > 0 ? bar(v / b, over ? 'over' : '') : ''}</div>`;
    }).join('') + (rows.length > 5 ? `<button class="link" data-a="catall">${catAll ? 'Mostrar menos' : 'Ver todas (' + rows.length + ')'}</button>` : '') + `</section>`;
  }

  if (S.goals.length || S.debts.length) {
    h += `<section class="card"><div class="head-row"><div class="eyebrow">Metas e dívidas</div><button class="link" data-a="go" data-id="goals">Abrir</button></div>`;
    S.goals.forEach(g => {
      const s = goalSaved(g), p = g.target ? s / g.target : 0;
      h += `<div class="crow"><div class="line"><span>${esc(g.name)}</span><span class="n">${brl(s)} <small>de ${brl(g.target)}</small></span></div>${bar(p)}</div>`;
    });
    S.debts.forEach(d => {
      const p = d.total ? debtPaid(d) / d.total : 0;
      h += `<div class="crow"><div class="line"><span>${esc(d.name)}</span><span class="n">${brl(debtLeft(d))} <small>restam</small></span></div>${bar(p)}</div>`;
    });
    h += `</section>`;
  }

  h += `<section class="card"><button class="fold" data-a="tchart"><span class="eyebrow">Evolução, últimos 6 meses</span>${ico(chartOpen ? 'chevu' : 'chevd', 18)}</button>${chartOpen ? chartBody() : ''}</section>`;

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
  };
  const CH = [['all', 'Todos'], ['out', 'Despesas'], ['in', 'Receitas'], ['card', 'Cartão'], ['va', 'Vale']];
  let h = `<div class="chips">${CH.map(([k, l]) => `<button class="chip ${flt === k ? 'on' : ''}" data-a="flt" data-id="${k}">${l}</button>`).join('')}</div>`;
  h += `<section class="card">`;
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
      const kind = t.type === 'save' ? 'Meta' : t.type === 'debt' ? 'Dívida' : '';
      const wt = t.type === 'out' && WTAG[W(t)] ? ' · ' + WTAG[W(t)] : '';
      h += `<button class="tx" data-a="tx" data-id="${t.id}">
        <span class="t"><b>${esc(t.desc || t.cat)}</b><small>${kind ? kind + ' · ' : ''}${esc(t.cat)}${wt}</small></span>
        <span class="v n ${t.type}">${t.type === 'in' ? '+' : '−'}${brl(t.amount)}</span></button>`;
    });
  }
  h += `</section>`;
  $('#main').innerHTML = h;
}

/* =====================================================================
   PLANO
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

  h += `<section class="card"><div class="eyebrow">Plano mensal</div>
    <div class="kv"><span>Renda esperada</span><b class="n">${brl(incTot)}</b></div>
    <div class="kv"><span>Planejado</span><b class="n">${brl(planned)}</b></div>
    <div class="kv strong"><span>${free >= 0 ? 'Livre para alocar' : 'Falta para fechar o plano'}</span><b class="n ${free >= 0 ? 'pos' : 'crit'}">${brl(Math.abs(free))}</b></div>
    <div class="sub">Essenciais ${pc(ess)} · Não essenciais ${pc(ne)} · Dívidas ${pc(dSum)} · Metas ${pc(gSum)}</div>
    <button class="link" data-a="inc">Editar renda esperada</button></section>`;

  CK = {};
  const rows = [];
  rows.push({ k: 'in-sal', l: 'Salário', a: inc.main, pre: { type: 'in', cat: 'Salário', desc: 'Salário' } });
  if (inc.va > 0) rows.push({ k: 'in-va', l: 'Vale alimentação', a: inc.va, pre: { type: 'in', cat: 'Vale alimentação', desc: 'Vale alimentação' } });
  OUT.filter(c => c.fx && S.budgets[c.n] > 0).forEach(c =>
    rows.push({ k: 'out-' + c.n, l: c.n, a: S.budgets[c.n], pre: { type: 'out', cat: c.n, wallet: 'main', desc: c.n } }));
  S.debts.filter(d => d.installment > 0 && debtLeft(d) > 0).forEach(d =>
    rows.push({ k: 'debt-' + d.id, l: 'Parcela: ' + d.name, a: d.installment, pre: { type: 'debt', debt: d.id } }));
  S.goals.filter(g => g.monthly > 0).forEach(g =>
    rows.push({ k: 'goal-' + g.id, l: 'Guardar: ' + g.name, a: g.monthly, pre: { type: 'save', goal: g.id } }));
  rows.forEach(r => { r.done = S.tx.some(t => t.auto === r.k && t.date.startsWith(view)); CK[r.k] = r; });
  const nd = rows.filter(r => r.done).length;

  h += `<section class="card"><div class="head-row"><div class="eyebrow">Checklist do mês</div><span class="tag n">${nd} de ${rows.length}</span></div>`;
  rows.forEach(r => {
    h += `<button class="ck ${r.done ? 'ok' : ''}" data-a="ck" data-id="${esc(r.k)}">
      <svg class="ic circ" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${r.done ? IC.circle + IC.check : IC.circle}</svg>
      <span class="t">${esc(r.l)}</span><b class="n">${brl(r.a)}</b></button>`;
  });
  h += `<div class="sub">Toque para lançar. Você confirma o valor real antes de salvar.</div></section>`;

  const grp = (title, list) => `<div class="group"><div class="eyebrow">${title}</div>` + list.map(c => {
    const custom = S.customOut.some(x => x.n === c.n);
    return `<button class="prow" data-a="${custom ? 'editcat' : 'bud'}" data-id="${esc(c.n)}"><span>${esc(c.n)}${custom ? ' <small>própria</small>' : ''}</span><b class="n">${brl(S.budgets[c.n] || 0)}</b></button>`;
  }).join('') + `</div>`;
  h += `<section class="card"><div class="head-row"><div class="eyebrow">Orçamento por categoria</div><button class="link" data-a="newcat">Nova categoria</button></div>
    ${grp('Essenciais', OUT.filter(c => c.e))}${grp('Não essenciais', OUT.filter(c => !c.e))}
    <div class="sub">Mercado é pago com o vale alimentação.</div></section>`;

  $('#main').innerHTML = h;
}

/* =====================================================================
   METAS E DÍVIDAS
   ===================================================================== */
function renderGoals() {
  let h = `<div class="head-row"><div class="eyebrow">Metas de poupança</div><button class="link" data-a="newgoal">Nova meta</button></div>`;
  if (!S.goals.length) h += `<div class="card empty">Nenhuma meta ainda.</div>`;
  S.goals.forEach(g => {
    const s = goalSaved(g), left = Math.max(0, g.target - s), p = g.target ? s / g.target : 0;
    const eta = left > 0 && g.monthly > 0 ? `, cerca de ${Math.ceil(left / g.monthly)} meses guardando ${brl(g.monthly)} por mês` : '';
    h += `<section class="card goal"><div class="head-row"><b>${esc(g.name)}</b><span class="mut n">${Math.round(p * 100)}%</span></div>
      <div class="line"><b class="n">${brl(s)}</b><small>meta ${brl(g.target)}</small></div>${bar(p)}
      <div class="sub">${left > 0 ? 'Faltam ' + brl(left) + eta : 'Meta atingida'}</div>
      <div class="acts"><button class="ghost small" data-a="paygoal" data-id="${g.id}">Guardar</button><button class="ghost small" data-a="editgoal" data-id="${g.id}">Editar</button></div></section>`;
  });
  h += `<div class="head-row" style="margin-top:8px"><div class="eyebrow">Dívidas</div><button class="link" data-a="newdebt">Nova dívida</button></div>`;
  if (!S.debts.length) h += `<div class="card empty">Nenhuma dívida cadastrada.</div>`;
  S.debts.forEach(d => {
    const left = debtLeft(d), p = d.total ? debtPaid(d) / d.total : 0;
    const eta = d.installment > 0 && left > 0 ? `${Math.ceil(left / d.installment)} parcelas de ${brl(d.installment)}` : (left > 0 ? 'Defina o valor da parcela' : 'Quitada');
    h += `<section class="card goal"><div class="head-row"><b>${esc(d.name)}</b><span class="mut n">${Math.round(p * 100)}% pago</span></div>
      <div class="line"><span>Saldo devedor</span><b class="n">${brl(left)}</b></div>${bar(p)}
      <div class="sub">${eta}</div>
      <div class="acts"><button class="ghost small" data-a="paydebt" data-id="${d.id}">Pagar parcela</button><button class="ghost small" data-a="editdebt" data-id="${d.id}">Editar</button></div></section>`;
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
    `<span class="ph n ${x.p === min && it.prices.length > 1 ? 'best' : ''} ${i === 0 ? 'first' : ''}">${brl(x.p)} <small>${esc(x.m || '—')}</small></span>`).join('');
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
    <button class="chk" data-a="chk" data-id="${x.id}" aria-label="${done ? 'Desmarcar' : 'Marcar como comprado'}">${done ? ico('check', 16) : ''}</button>
    <div class="mt" data-a="medit" data-id="${x.id}"><b>${esc(it.name)}</b> <small>${fq(x.qty)} ${esc(it.unit)}</small>
      <div class="phr">${done ? `<span class="ph first n">${brl(x.paid)}/${esc(it.unit)} <small>${esc(x.mkt || '')}</small></span>` : priceHist(it)}</div></div>
    <div class="mv n">${val ? brl(val) : '—'}</div></div>`;
}

function renderMarket() {
  fillLists();
  const m = M(), l = curList();
  const pend = l.items.filter(x => !x.done && mItem(x.id));
  const done = l.items.filter(x => x.done && mItem(x.id));
  const est = sumBy(pend, x => (mItem(x.id).prices[0] ? mItem(x.id).prices[0].p * x.qty : 0));
  const noPrice = pend.filter(x => !mItem(x.id).prices[0]).length;
  const got = sumBy(done, x => x.paid * x.qty);

  const tally = {};
  m.items.forEach(it => {
    const mk = new Set(it.prices.filter(p => p.m).map(p => p.m));
    if (mk.size < 2) return;
    const best = it.prices.filter(p => p.m).sort((a, b) => a.p - b.p)[0];
    tally[best.m] = (tally[best.m] || 0) + 1;
  });
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];

  let h = `<section class="card">
    <div class="mtitle"><select id="listSel" aria-label="Lista">${m.lists.map(x => `<option value="${x.id}" ${x.id === l.id ? 'selected' : ''}>${esc(x.name)}${x.finished ? ' (lançada)' : ''}</option>`).join('')}</select>
    <button class="icon-btn" data-a="mmenu" aria-label="Opções da lista">${ico('more', 22)}</button></div>
    <div class="msum"><div><span>Estimado</span><b class="n">${brl(est)}</b></div><div><span>Comprado</span><b class="n">${brl(got)}</b></div></div>
    ${noPrice ? `<div class="sub">${noPrice} ${noPrice > 1 ? 'itens' : 'item'} sem preço fora do estimado</div>` : ''}
    ${top ? `<div class="sub">${esc(top[0])} tem o menor preço em ${top[1]} ${top[1] > 1 ? 'itens comparados' : 'item comparado'}.</div>` : ''}
    ${l.finished ? '' : (done.length ? `<button class="primary block" data-a="finish">Finalizar compra (${brl(got)})</button>` : '')}
  </section>`;

  MC.forEach(c => {
    const arr = pend.filter(x => (MC.some(k => k.n === mItem(x.id).cat) ? mItem(x.id).cat : 'Outros') === c.n);
    if (arr.length) h += `<section class="card"><div class="eyebrow">${esc(c.n)}</div>${arr.map(x => mrow(x, false)).join('')}</section>`;
  });
  if (done.length) h += `<section class="card"><div class="eyebrow">Concluído (${done.length})</div>${done.map(x => mrow(x, true)).join('')}</section>`;

  if (!l.items.length || showSugg) {
    const inList = new Set(l.items.map(x => (mItem(x.id) || {}).name && mItem(x.id).name.toLowerCase()));
    const sg = SUGG.map((s, i) => ({ s, i })).filter(o => !inList.has(o.s[1].toLowerCase()));
    if (sg.length) {
      h += `<section class="card"><div class="eyebrow">${l.items.length ? 'Sugestões' : 'Comece por aqui'}</div>
        <div class="sub" style="margin:0 0 10px">Toque para pôr na lista. Para outros itens, use o botão +.</div>
        <div class="chips" style="flex-wrap:wrap">${sg.map(o => `<button class="chip" data-a="sugg" data-id="${o.i}">${esc(o.s[1])}</button>`).join('')}</div></section>`;
    }
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
      { id: 'cat', l: 'Categoria', t: 'select', opts: MC.map(c => ({ v: c.n, l: c.n })), value: 'Mercearia' },
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
    ? `<b>Preços anteriores</b><br>${it.prices.map(p => `<span class="ph n">${brl(p.p)} <small>${esc(p.m || '—')}</small></span>`).join('')}`
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
      { id: 'cat', l: 'Categoria', t: 'select', opts: MC.map(c => ({ v: c.n, l: c.n })), value: it.cat },
      { id: 'unit', l: 'Unidade', t: 'text', value: it.unit },
      { id: 'qty', l: 'Quantidade', t: 'money', req: 1, value: x.qty },
      { id: 'price', l: 'Registrar preço agora (opcional)', t: 'money', ph: '0,00' },
      { id: 'market', l: 'Mercado desse preço', t: 'text', list: 'dlMarkets', value: M().lastMkt },
    ],
    note: `<b>Histórico</b><br>${it.prices.length ? it.prices.map(p => `<span class="ph n">${brl(p.p)} <small>${esc(p.m || '—')} · ${p.d.split('-').reverse().join('/')}</small></span>`).join('') : 'Sem preços registrados.'}`,
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
        opts: [{ v: '', l: 'Lista em branco' }].concat(M().lists.slice().reverse().map(x => ({ v: x.id, l: x.name }))),
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
        opts: [{ v: 'va', l: 'Vale alimentação' }, { v: 'main', l: 'Dinheiro, Pix ou débito' }, { v: 'card', l: 'Cartão de crédito' }],
      },
      { id: 'date', l: 'Data', t: 'date', value: today() },
    ],
    submit: 'Lançar',
    onSubmit: v => {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(v.date) ? v.date : today();
      const t = { id: uid(), type: 'out', cat: 'Mercado', wallet: v.wallet, amount: v.amount, desc: l.name, date };
      S.tx.push(t); l.finished = t.id; view = date.slice(0, 7);
    },
  });
}

function openMarketMenu() {
  const items = [
    { l: 'Nova lista', fn: () => openNewList(false) },
    { l: 'Repetir esta lista', fn: () => openNewList(true) },
    { l: 'Renomear ou excluir a lista', fn: () => openEditList() },
    { l: showSugg ? 'Ocultar sugestões de itens' : 'Mostrar sugestões de itens', fn: () => { showSugg = !showSugg; render(); } },
    { l: 'Nova categoria do mercado', fn: () => editMc(null) },
  ];
  if (S.customMc.length) items.push({ l: 'Editar categorias próprias', fn: () => openActions('Categorias próprias', S.customMc.map(c => ({ l: c.n, fn: () => editMc(c.n) }))) });
  openActions('Lista de compras', items);
}

/* =====================================================================
   FORMULÁRIO GENÉRICO E MENU DE AÇÕES
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
      h += `<label><span>${esc(fd.l)}</span><input data-f="${fd.id}" ${fd.t === 'money' ? 'inputmode="decimal"' : ''} ${fd.t === 'date' ? 'type="date"' : ''} ${fd.list ? `list="${fd.list}"` : ''} placeholder="${esc(fd.ph || '')}" value="${esc(fd.t === 'money' ? toInput(v) : v)}"></label>`;
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
function openActions(title, items) {
  gen = null;
  const f = $('#formGen');
  f.innerHTML = `<h2>${esc(title)}</h2>` + items.map((a, i) => `<button type="button" class="act" data-i="${i}">${esc(a.l)}</button>`).join('')
    + `<div class="row"><button type="button" class="ghost" data-close>Cancelar</button></div>`;
  f.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheets));
  f.querySelectorAll('.act').forEach(b => b.addEventListener('click', () => { closeSheets(); items[+b.dataset.i].fn(); }));
  openSheet($('#sheetGen'));
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
    sel.innerHTML = OUT.map(c => `<option value="${esc(c.n)}">${esc(c.n)}${c.e ? '' : ' (não essencial)'}</option>`).join('');
    if (p.cat) sel.value = p.cat;
    $('#fWallet').value = p.wallet || 'main';
  } else if (type === 'in') {
    $('#catLbl').textContent = 'Categoria';
    sel.innerHTML = INC.map(c => `<option value="${esc(c.n)}">${esc(c.n)}</option>`).join('');
    if (p.cat) sel.value = p.cat;
  } else if (type === 'save') {
    $('#catLbl').textContent = 'Meta';
    sel.innerHTML = S.goals.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('');
    if (p.goal) sel.value = p.goal;
  } else {
    $('#catLbl').textContent = 'Dívida';
    sel.innerHTML = S.debts.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
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
  if (!t && !p.amount) setTimeout(() => $('#fAmount').focus(), 250);
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
   PLANO / METAS / DÍVIDAS / CATEGORIAS: formulários
   ===================================================================== */
function editBudget(name) {
  openForm({
    title: name,
    fields: [{ id: 'v', l: 'Orçamento mensal (R$)', t: 'money', value: S.budgets[name] || 0 }],
    onSubmit: v => { S.budgets[name] = v.v; },
  });
}
function editIncome() {
  openForm({
    title: 'Renda esperada por mês',
    fields: [
      { id: 'main', l: 'Salário e outras receitas em dinheiro (R$)', t: 'money', value: S.settings.income.main },
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

function editCat(name) {
  const cu = name ? S.customOut.find(x => x.n === name) : null;
  openForm({
    title: cu ? 'Editar categoria' : 'Nova categoria de despesa',
    fields: [
      { id: 'name', l: 'Nome', t: 'text', req: 1, value: cu ? cu.n : '', ph: 'Ex.: Pet' },
      {
        id: 'e', l: 'Tipo', t: 'select', value: cu && !cu.e ? '0' : '1',
        opts: [{ v: '1', l: 'Essencial' }, { v: '0', l: 'Não essencial (entra no limite dos supérfluos)' }],
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
        cu.e = +v.e;
      } else {
        S.customOut.push({ n: v.name, e: +v.e, fx: 0 });
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
    fields: [{ id: 'name', l: 'Nome', t: 'text', req: 1, value: cu ? cu.n : '', ph: 'Ex.: Bebê' }],
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
      } else S.customMc.push({ n: v.name });
      syncCats();
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
$('#verLbl').textContent = 'Versão ' + APP_VERSION;

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
  mmenu: () => openMarketMenu(),
  finish: () => openFinish(),
  sugg: id => {
    const s = SUGG[+id], it = addCatalog(s[1], s[0], 'un');
    addToList(curList(), it.id, 1); persist(); render();
  },
  newcat: () => editCat(null),
  editcat: id => editCat(id),
  cm: id => { chartMode = id; render(); },
  tchart: () => { chartOpen = !chartOpen; render(); },
  catall: () => { catAll = !catAll; render(); },
};
$('#main').addEventListener('click', e => {
  const a = e.target.closest('[data-a]');
  if (a && ACT[a.dataset.a]) ACT[a.dataset.a](a.dataset.id, a);
});
$('#main').addEventListener('change', e => {
  if (e.target.id === 'listSel') { M().cur = e.target.value; persist(); render(); }
});

/* =====================================================================
   ÍCONES ESTÁTICOS
   ===================================================================== */
document.querySelectorAll('[data-ic]').forEach(el => {
  el.innerHTML = ico(el.dataset.ic, el.closest('#tabs') ? 22 : el.id === 'fab' ? 24 : 22);
});

/* =====================================================================
   PWA E AVISO DE NOVA VERSÃO
   ===================================================================== */
let userAskedUpdate = false;
function showUpdate(worker) {
  $('#update').hidden = false;
  $('#btnUpdate').onclick = () => {
    userAskedUpdate = true;
    $('#btnUpdate').disabled = true;
    $('#btnUpdate').textContent = 'Atualizando';
    worker.postMessage({ type: 'SKIP_WAITING' });
    // se o navegador não trocar o service worker, recarrega do mesmo jeito
    setTimeout(() => { if (userAskedUpdate) location.reload(); }, 4000);
  };
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (userAskedUpdate) location.reload(); });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const offer = w => { if (w && navigator.serviceWorker.controller) showUpdate(w); };
      if (reg.waiting) offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'installed') offer(w); });
      });
      const check = () => reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      setInterval(check, 30 * 60 * 1000);
    }).catch(() => {});
  });
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

render();
