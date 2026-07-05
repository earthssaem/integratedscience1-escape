'use strict';
/* ============================================================
   engine.js — 게임 상태, 저장, 사운드, 모달, 인벤토리, 퍼즐 공통 빌더
   ============================================================ */

/* ---------- DOM 유틸 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function svgIcon(name, cls = 'obj-icon') {
  return `<span class="${cls}" aria-hidden="true">${ICONS[name] || ''}</span>`;
}
function fmtTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}시간 ${m % 60}분`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/* ---------- 사운드 (Web Audio API) ---------- */
const Sound = {
  ctx: null,
  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (e) { /* 사운드 미지원 환경 */ }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, dur, type = 'sine', gain = 0.07, delay = 0) {
    if (!state.settings.sound) return;
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  },
  click() { this.tone(660, 0.07, 'triangle', 0.045); },
  success() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.2, 'sine', 0.07, i * 0.09)); },
  error() { this.tone(185, 0.22, 'sawtooth', 0.05); this.tone(140, 0.3, 'sawtooth', 0.045, 0.09); },
  unlock() { [392, 523, 659, 880].forEach((f, i) => this.tone(f, 0.24, 'sine', 0.08, i * 0.1)); },
};

/* ---------- 게임 상태 & 저장 ---------- */
const SAVE_KEY = 'is1escape_save_v1';

function newState() {
  return {
    screen: 'start',        // start | prologue | game | result
    room: 1,                // 1~4 | 'final'
    prologueDone: false,
    solved: {},             // { puzzleId: true }
    items: {},              // { itemId: 'owned' | 'used' }
    counts: {},             // { itemId: n } (count형 아이템)
    flags: {},              // 오브젝트 1회성 이벤트
    hintLv: {},             // { puzzleId: 0~3 }
    hintCount: 0,
    wrongCount: 0,
    team: { cls: '', name: '' }, // 반 · 팀명
    stability: 100,         // 시공간 안정도(%) — 진행을 막지 않는 긴장감 요소
    settings: { sound: true },
    playMs: 0,
    lastTick: Date.now(),
    escaped: false,
    startedAt: Date.now(),
  };
}

let state = newState();

function tickTime() {
  const now = Date.now();
  if (state.screen !== 'start' && !state.escaped) {
    state.playMs += Math.max(0, now - state.lastTick);
  }
  state.lastTick = now;
}

function saveGame() {
  tickTime();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* 저장 불가 환경 */ }
}
function hasSavedGame() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object' || !s.solved) return false;
    state = Object.assign(newState(), s);
    state.settings = Object.assign({ sound: true }, s.settings);
    state.team = Object.assign({ cls: '', name: '' }, s.team);
    if (typeof state.stability !== 'number') state.stability = 100;
    state.lastTick = Date.now();
    return true;
  } catch (e) { return false; }
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* noop */ }
}
function isSolved(id) { return !!state.solved[id]; }

function markSolved(pid) {
  if (state.solved[pid]) return;
  state.solved[pid] = true;
  state.stability = Math.min(100, state.stability + 3); // 복구 성공 → 안정도 소폭 회복
  saveGame();
  renderRoom();
  renderTopbar();
  if (typeof AI_LINES !== 'undefined' && AI_LINES.solve[pid]) aiSay(AI_LINES.solve[pid]);
}

/* ---------- 관제 AI 「K.O.S.M.O.」 교신 (타자기 효과) ---------- */
const Comm = { queue: [], busy: false, typeTimer: null, waitTimer: null };

function aiSay(msg) {
  if (!msg) return;
  Comm.queue.push(msg);
  if (!Comm.busy) commNext();
}
function commNext() {
  const box = $('#comm-text');
  const msg = Comm.queue.shift();
  if (!box || msg == null) { Comm.busy = false; return; }
  Comm.busy = true;
  Sound.tone(880, 0.05, 'sine', 0.03);
  clearInterval(Comm.typeTimer);
  clearTimeout(Comm.waitTimer);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    box.textContent = msg;
    Comm.waitTimer = setTimeout(commNext, 1800);
    return;
  }
  box.textContent = '';
  let i = 0;
  Comm.typeTimer = setInterval(() => {
    box.textContent = msg.slice(0, ++i);
    if (i >= msg.length) {
      clearInterval(Comm.typeTimer);
      Comm.waitTimer = setTimeout(commNext, 2400);
    }
  }, 18);
}

/* ---------- 아이템 / 인벤토리 ---------- */
function itemDef(id) { return ITEM_DEFS.find(d => d.id === id); }
function hasItem(id) { return state.items[id] === 'owned' || state.items[id] === 'used'; }
function itemCount(id) { return state.counts[id] || 0; }

function gainItem(id, n = 1) {
  const def = itemDef(id);
  if (!def) return;
  if (def.count) {
    state.counts[id] = Math.min(def.max, (state.counts[id] || 0) + n);
    state.items[id] = 'owned';
    toast(`${def.name} ${n}개 획득 (${state.counts[id]}/${def.max})`);
  } else {
    if (state.items[id]) return;
    state.items[id] = 'owned';
    toast(`획득: ${def.name}`);
  }
  saveGame();
  renderInventory();
  renderTopbar();
}
function useItem(id) {
  if (state.items[id] === 'owned') {
    state.items[id] = 'used';
    saveGame();
    renderInventory();
  }
}

function renderInventory() {
  const grid = $('#inv-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ITEM_DEFS.forEach(def => {
    const st = state.items[def.id]; // undefined | 'owned' | 'used'
    const locked = !st;
    const label = locked ? '???' : def.name;
    const badge = st === 'used' ? '<span class="inv-badge">사용됨</span>' :
      st === 'owned' ? '<span class="inv-badge">보유</span>' :
      '<span class="inv-badge" aria-hidden="true">🔒</span>';
    const count = def.count && st ? `<span class="inv-count">×${itemCount(def.id)}</span>` : '';
    const b = el(`<button type="button" class="inv-item ${locked ? 'locked' : st}" aria-label="${esc(locked ? '아직 획득하지 않은 아이템' : def.name)}">
      ${badge}${svgIcon(def.icon, 'inv-icon')}<span class="inv-name">${esc(label)}</span>${count}</button>`);
    b.addEventListener('click', () => openItemDetail(def.id));
    grid.appendChild(b);
  });
}

function openItemDetail(id) {
  const def = itemDef(id);
  const st = state.items[id];
  if (!st) {
    openModal({
      title: '잠긴 아이템',
      body: `<div class="item-detail">${svgIcon('clue', 'id-icon')}<p>아직 획득하지 않은 아이템입니다.<br>방 안을 더 조사해 보세요.</p></div>`,
    });
    return;
  }
  const statusText = st === 'used' ? '이미 사용함 (기록 보관)' : '획득함';
  const countText = def.count ? ` · ${itemCount(id)}/${def.max}개` : '';
  openModal({
    title: def.name,
    body: `<div class="item-detail">
      ${svgIcon(def.icon, 'id-icon')}
      <span class="id-status">${esc(statusText)}${esc(countText)}</span>
      <div class="id-desc">${esc(def.desc).replace(/\n/g, '<br>')}</div>
    </div>`,
  });
}

/* ---------- 토스트 ---------- */
function toast(msg) {
  const root = $('#toast-root');
  if (!root) return;
  const t = el(`<div class="toast">${esc(msg)}</div>`);
  root.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 2600);
}

/* ---------- 모달 ---------- */
let modalPrevFocus = null;
let modalOnClose = null;
let activeHintId = null;

function openModal(opts) {
  closeModal(true);
  modalPrevFocus = document.activeElement;
  modalOnClose = opts.onClose || null;
  activeHintId = opts.hintId || activeHintId;
  const root = $('#modal-root');
  root.classList.remove('hidden');
  root.innerHTML = '';
  const panel = el(`<div class="modal ${opts.className || ''}" role="dialog" aria-modal="true" aria-label="${esc(opts.title || '창')}">
    <div class="modal-head">
      <div><h2>${esc(opts.title || '')}</h2>${opts.sub ? `<p class="modal-sub">${esc(opts.sub)}</p>` : ''}</div>
      <div class="modal-head-btns">
        ${opts.hintId ? '<button class="btn btn-ghost btn-small btn-hint" type="button">💡 힌트</button>' : ''}
        <button class="btn btn-ghost btn-small modal-close" type="button" aria-label="닫기">✕ 닫기</button>
      </div>
    </div>
    <div class="modal-body"></div>
  </div>`);
  const bodyBox = $('.modal-body', panel);
  if (typeof opts.body === 'string') bodyBox.innerHTML = opts.body;
  else if (opts.body) bodyBox.appendChild(opts.body);
  root.appendChild(panel);
  $('.modal-close', panel).addEventListener('click', () => closeModal());
  const hintBtn = $('.btn-hint', panel);
  if (hintBtn) hintBtn.addEventListener('click', () => openHintPopup(opts.hintId));
  root.onmousedown = (e) => { if (e.target === root) closeModal(); };
  panel.addEventListener('keydown', trapFocus);
  $('.modal-close', panel).focus();
  return panel;
}

function setModalBody(content) {
  const bodyBox = $('#modal-root .modal-body');
  if (!bodyBox) return;
  bodyBox.innerHTML = '';
  if (typeof content === 'string') bodyBox.innerHTML = content;
  else bodyBox.appendChild(content);
}

function closeModal(silent) {
  const root = $('#modal-root');
  if (!root || root.classList.contains('hidden')) return;
  root.classList.add('hidden');
  root.innerHTML = '';
  const cb = modalOnClose;
  modalOnClose = null;
  if (!silent && modalPrevFocus && document.contains(modalPrevFocus)) {
    try { modalPrevFocus.focus(); } catch (e) { /* noop */ }
  }
  if (!silent && cb) cb();
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const panel = e.currentTarget;
  const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel)
    .filter(x => !x.disabled && x.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const hint = $('#hint-pop');
    if (hint) { hint.remove(); return; }
    closeModal();
  }
});

/* ---------- 힌트 ---------- */
function openHintPopup(pid) {
  const hints = HINTS[pid];
  if (!hints) { toast('이 단계에는 힌트가 없습니다.'); return; }
  const cur = state.hintLv[pid] || 0;
  const next = Math.min(cur + 1, 3);
  if (next > cur) {
    state.hintLv[pid] = next;
    state.hintCount++;
    saveGame();
    renderTopbar();
  }
  const old = $('#hint-pop');
  if (old) old.remove();
  const box = el(`<div id="hint-pop" role="dialog" aria-label="힌트">
    <div class="hint-head"><strong>💡 힌트 ${next}/3 단계</strong>
    <button class="btn btn-ghost btn-small" id="hint-close" type="button" aria-label="힌트 닫기">✕</button></div>
    <ol>${hints.slice(0, next).map(h => `<li>${esc(h)}</li>`).join('')}</ol>
    ${next < 3 ? '<button class="btn btn-small" id="hint-more" type="button">다음 단계 힌트 보기</button>'
      : '<p class="hint-max">마지막 단계 힌트입니다.</p>'}
  </div>`);
  document.body.appendChild(box);
  $('#hint-close', box).addEventListener('click', () => box.remove());
  const more = $('#hint-more', box);
  if (more) more.addEventListener('click', () => openHintPopup(pid));
  $('#hint-close', box).focus();
}

/* ---------- 정답/오답 공통 ---------- */
function recordWrong(msg, box) {
  state.wrongCount++;
  state.stability = Math.max(10, state.stability - 2); // 오답 → 안정도 하락 (10% 밑으로는 안 내려감)
  saveGame();
  Sound.error();
  renderTopbar();
  if (typeof AI_LINES !== 'undefined' && !Comm.busy) {
    aiSay(AI_LINES.wrong[Math.floor(Math.random() * AI_LINES.wrong.length)]);
  }
  if (box) {
    box.className = 'feedback fb-err';
    box.innerHTML = `<span class="fb-icon" aria-hidden="true">✖</span><div><strong>다시 생각해 보세요</strong><p>${esc(msg)}</p></div>`;
    box.classList.remove('pop');
    void box.offsetWidth;
    box.classList.add('pop');
  } else {
    toast('오답입니다. 다시 시도해 보세요.');
  }
}
function showOk(box, msg) {
  if (box) {
    box.className = 'feedback fb-ok pop';
    box.innerHTML = `<span class="fb-icon" aria-hidden="true">✔</span><div><strong>정답!</strong>${msg ? `<p>${esc(msg)}</p>` : ''}</div>`;
  }
  Sound.success();
}
function lockPuzzle(root) {
  $$('.game-card, .particle, .seg-btn, .cyc-btn, .key, input, [data-act]', root).forEach(b => {
    b.disabled = true;
    if (b.draggable) b.draggable = false;
  });
}

/* ============================================================
   퍼즐 공통 빌더
   ============================================================ */

/* 순서 배열 퍼즐 (카드 → 번호 슬롯) */
function buildOrderPuzzle(cfg) {
  const root = el(`<div class="puzzle order-puzzle">
    ${cfg.prompt ? `<div class="puzzle-prompt">${cfg.prompt}</div>` : ''}
    <div class="order-slots" role="list" aria-label="순서 배열 칸"></div>
    <p class="pool-label">카드를 클릭하면 다음 빈 칸에 놓입니다. 놓인 카드를 클릭하면 되돌아옵니다. (끌어다 놓기 가능)</p>
    <div class="card-pool" aria-label="카드 보관함"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions">
      <button type="button" class="btn" data-act="reset">초기화</button>
      <button type="button" class="btn btn-primary" data-act="check">${esc(cfg.checkLabel || '순서 확인')}</button>
    </div>
  </div>`);
  const slotsBox = $('.order-slots', root);
  const pool = $('.card-pool', root);
  const fb = $('.feedback', root);
  const n = cfg.answer.length;
  const slots = [];
  if (cfg.fixedFirst) {
    slotsBox.appendChild(el(`<div class="order-slot fixed" role="listitem"><span class="slot-num">시작</span><div class="locked-card">${esc(cfg.fixedFirst)}</div></div>`));
  }
  for (let i = 0; i < n; i++) {
    const s = el(`<div class="order-slot" role="listitem"><span class="slot-num">${i + 1}단계</span><div class="slot-drop" data-i="${i}"></div></div>`);
    slotsBox.appendChild(s);
    slots.push({ drop: $('.slot-drop', s), card: null });
  }
  const cards = {};
  shuffle(cfg.cards).forEach(c => {
    const b = el(`<button type="button" class="game-card" draggable="true" data-card="${c.id}">${esc(c.label)}</button>`);
    cards[c.id] = b;
    pool.appendChild(b);
    b.addEventListener('click', () => {
      Sound.click();
      if (b.parentElement === pool) {
        const s = slots.find(x => !x.card);
        if (!s) { toast('빈 칸이 없습니다. 카드를 먼저 되돌려 주세요.'); return; }
        place(c.id, s);
      } else {
        unplace(c.id);
      }
    });
    b.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', c.id);
      e.dataTransfer.effectAllowed = 'move';
    });
  });
  function place(id, slot) {
    if (slot.card) unplace(slot.card);
    const prev = slots.find(x => x.card === id);
    if (prev) prev.card = null;
    slot.card = id;
    slot.drop.appendChild(cards[id]);
  }
  function unplace(id) {
    const s = slots.find(x => x.card === id);
    if (s) s.card = null;
    pool.appendChild(cards[id]);
  }
  slots.forEach(s => {
    s.drop.addEventListener('dragover', e => { e.preventDefault(); s.drop.classList.add('drag-over'); });
    s.drop.addEventListener('dragleave', () => s.drop.classList.remove('drag-over'));
    s.drop.addEventListener('drop', e => {
      e.preventDefault();
      s.drop.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      if (cards[id]) place(id, s);
    });
  });
  pool.addEventListener('dragover', e => e.preventDefault());
  pool.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (cards[id]) unplace(id);
  });
  $('[data-act=reset]', root).addEventListener('click', () => {
    cfg.cards.forEach(c => unplace(c.id));
    fb.className = 'feedback'; fb.innerHTML = '';
  });
  $('[data-act=check]', root).addEventListener('click', () => {
    if (slots.some(s => !s.card)) { toast('모든 칸을 채운 뒤 확인하세요.'); return; }
    const seq = slots.map(s => s.card);
    if (seq.every((id, i) => id === cfg.answer[i])) {
      showOk(fb, cfg.okMsg);
      lockPuzzle(root);
      cfg.onCorrect(root);
    } else {
      recordWrong(cfg.wrongMsg, fb);
    }
  });
  return root;
}

/* 분류/배치 퍼즐 (카드 → 상자) */
function buildAssignPuzzle(cfg) {
  const root = el(`<div class="puzzle assign-puzzle">
    ${cfg.prompt ? `<div class="puzzle-prompt">${cfg.prompt}</div>` : ''}
    <div class="bins ${cfg.binClass || ''}"></div>
    <p class="pool-label">${esc(cfg.poolLabel || '카드를 클릭해 선택한 뒤 놓을 상자를 클릭하세요. 상자 안의 카드를 클릭하면 되돌아옵니다. (끌어다 놓기 가능)')}</p>
    <div class="card-pool" aria-label="카드 보관함"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions">
      <button type="button" class="btn" data-act="reset">초기화</button>
      <button type="button" class="btn btn-primary" data-act="check">${esc(cfg.checkLabel || '배치 확인')}</button>
    </div>
  </div>`);
  const binsBox = $('.bins', root);
  const pool = $('.card-pool', root);
  const fb = $('.feedback', root);
  const binEls = {};
  const cardEls = {};
  const loc = {}; // cardId -> binId | null
  let selected = null;

  cfg.bins.forEach(b => {
    const bel = el(`<div class="bin" data-bin="${b.id}" tabindex="0" role="group" aria-label="${esc(b.label)}">
      <div class="bin-head">${b.html || ''}<span class="bin-label">${esc(b.label)}</span>${b.desc ? `<span class="bin-desc">${esc(b.desc)}</span>` : ''}</div>
      <div class="bin-drop"></div>
    </div>`);
    binsBox.appendChild(bel);
    binEls[b.id] = bel;
    const putSelected = () => {
      if (selected && loc[selected] === null) {
        placeCard(selected, b.id);
        setSelected(null);
        Sound.click();
      }
    };
    bel.addEventListener('click', e => { if (!e.target.closest('.game-card')) putSelected(); });
    bel.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === bel) { e.preventDefault(); putSelected(); }
    });
    bel.addEventListener('dragover', e => { e.preventDefault(); bel.classList.add('drag-over'); });
    bel.addEventListener('dragleave', () => bel.classList.remove('drag-over'));
    bel.addEventListener('drop', e => {
      e.preventDefault();
      bel.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      if (cardEls[id]) placeCard(id, b.id);
    });
  });

  shuffle(cfg.cards).forEach(c => {
    const cel = el(`<button type="button" class="game-card" draggable="true" data-card="${c.id}">${c.html || esc(c.label)}</button>`);
    cardEls[c.id] = cel;
    loc[c.id] = null;
    pool.appendChild(cel);
    cel.addEventListener('click', () => {
      Sound.click();
      if (loc[c.id]) { placeCard(c.id, null); setSelected(null); }
      else setSelected(selected === c.id ? null : c.id);
    });
    cel.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', c.id);
      setSelected(null);
    });
  });
  pool.addEventListener('dragover', e => e.preventDefault());
  pool.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (cardEls[id]) placeCard(id, null);
  });

  function setSelected(id) {
    selected = id;
    Object.entries(cardEls).forEach(([cid, elm]) => elm.classList.toggle('selected', cid === selected));
  }
  function placeCard(id, binId) {
    if (binId) {
      const b = cfg.bins.find(x => x.id === binId);
      const cap = b.cap || Infinity;
      const inBin = Object.keys(loc).filter(k => loc[k] === binId);
      if (inBin.length >= cap) placeCard(inBin[0], null);
      loc[id] = binId;
      $('.bin-drop', binEls[binId]).appendChild(cardEls[id]);
    } else {
      loc[id] = null;
      pool.appendChild(cardEls[id]);
    }
  }

  $('[data-act=reset]', root).addEventListener('click', () => {
    Object.keys(cardEls).forEach(id => placeCard(id, null));
    setSelected(null);
    fb.className = 'feedback'; fb.innerHTML = '';
  });
  $('[data-act=check]', root).addEventListener('click', () => {
    let ok = true;
    for (const b of cfg.bins) {
      const want = (cfg.answer[b.id] || []).slice().sort();
      const got = Object.keys(loc).filter(k => loc[k] === b.id).sort();
      if (want.length !== got.length || want.some((v, i) => v !== got[i])) { ok = false; break; }
    }
    if (ok) {
      showOk(fb, cfg.okMsg);
      lockPuzzle(root);
      cfg.onCorrect(root);
    } else {
      const placedCount = Object.values(loc).filter(v => v).length;
      const needCount = Object.values(cfg.answer).reduce((a, v) => a + v.length, 0);
      if (placedCount < needCount) { toast('아직 배치하지 않은 카드가 있습니다.'); return; }
      const msg = typeof cfg.wrong === 'function' ? cfg.wrong(loc) : cfg.wrong;
      recordWrong(msg, fb);
    }
  });
  return root;
}

/* 숫자 키패드 자물쇠 */
function buildKeypad(cfg) {
  const root = el(`<div class="puzzle keypad-puzzle">
    ${cfg.prompt ? `<div class="puzzle-prompt">${cfg.prompt}</div>` : ''}
    ${cfg.note ? `<p class="puzzle-note">${cfg.note}</p>` : ''}
    <div class="code-display" aria-label="입력한 암호"></div>
    <div class="keypad"></div>
    <div class="feedback" aria-live="polite"></div>
  </div>`);
  const disp = $('.code-display', root);
  const pad = $('.keypad', root);
  const fb = $('.feedback', root);
  let val = '';
  function render() {
    disp.innerHTML = Array.from({ length: cfg.digits }, (_, i) =>
      `<span class="code-cell ${i === val.length ? 'cur' : ''}">${val[i] || ''}</span>`).join('');
  }
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '지움', '0', '확인'].forEach(k => {
    const b = el(`<button type="button" class="key ${k === '확인' ? 'key-ok' : ''} ${k === '지움' ? 'key-del' : ''}">${k}</button>`);
    pad.appendChild(b);
    b.addEventListener('click', () => {
      Sound.click();
      if (k === '지움') { val = val.slice(0, -1); }
      else if (k === '확인') {
        if (val.length < cfg.digits) { toast(`${cfg.digits}자리를 모두 입력하세요.`); return; }
        if (val === cfg.code) {
          showOk(fb, cfg.okMsg);
          Sound.unlock();
          lockPuzzle(root);
          cfg.onCorrect(root);
        } else {
          recordWrong(cfg.wrongMsg, fb);
          val = '';
        }
      } else if (val.length < cfg.digits) { val += k; }
      render();
    });
  });
  render();
  return root;
}

/* 회전식(사이클) 선택기 — 옵션을 ◀ ▶ 로 돌려 선택 */
function buildCycler(cfg) {
  // cfg: {label, options: [{id, label, html}], startIndex, num}
  let idx = cfg.startIndex || 0;
  const root = el(`<div class="cycler">
    <span class="cyc-label">${esc(cfg.label)}</span>
    <div class="cyc-ctrl">
      <button type="button" class="cyc-btn" aria-label="${esc(cfg.label)} 이전 값">◀</button>
      <div class="cyc-val ${cfg.num ? 'num' : ''}" aria-live="polite"></div>
      <button type="button" class="cyc-btn" aria-label="${esc(cfg.label)} 다음 값">▶</button>
    </div>
  </div>`);
  const val = $('.cyc-val', root);
  const [prev, next] = $$('.cyc-btn', root);
  function render() {
    const o = cfg.options[idx];
    val.innerHTML = o.html ? `<span class="cyc-icon" aria-hidden="true">${o.html}</span><span class="cyc-text">${esc(o.label)}</span>` :
      cfg.num ? esc(o.label) : `<span class="cyc-text">${esc(o.label)}</span>`;
    val.setAttribute('aria-label', `${cfg.label}: ${o.label}`);
  }
  prev.addEventListener('click', () => { Sound.click(); idx = (idx - 1 + cfg.options.length) % cfg.options.length; render(); });
  next.addEventListener('click', () => { Sound.click(); idx = (idx + 1) % cfg.options.length; render(); });
  render();
  return { root, get: () => cfg.options[idx].id };
}

/* 세그먼트(다중 보기 중 1개 선택) */
function buildSegGroup(cfg) {
  // cfg: {title, desc, options: [{id, html|label}]}
  const root = el(`<div class="seg-group" role="radiogroup" aria-label="${esc(cfg.title)}">
    <span class="seg-title">${esc(cfg.title)}</span>
    ${cfg.desc ? `<p class="seg-desc">${esc(cfg.desc)}</p>` : ''}
    <div class="seg"></div>
  </div>`);
  const segBox = $('.seg', root);
  let value = null;
  cfg.options.forEach(o => {
    const b = el(`<button type="button" class="seg-btn" role="radio" aria-checked="false" data-opt="${o.id}">${o.html || esc(o.label)}</button>`);
    segBox.appendChild(b);
    b.addEventListener('click', () => {
      Sound.click();
      value = o.id;
      $$('.seg-btn', segBox).forEach(x => {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-checked', x === b ? 'true' : 'false');
      });
    });
  });
  return { root, get: () => value };
}
