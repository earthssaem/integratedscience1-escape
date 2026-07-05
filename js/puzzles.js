'use strict';
/* ============================================================
   puzzles.js — 방 1~4 오브젝트 조사 및 퍼즐 구현
   ============================================================ */

const R1_CARDS = ['card-quark', 'card-nucleon', 'card-henuc', 'card-atom'];

/* ---------- 공통 소도구 ---------- */
function infoModal(title, sub, html) {
  openModal({ title, sub, body: html });
}
function contBtn(label, fn, center) {
  const wrap = el(`<div class="puzzle-actions"${center ? ' style="justify-content:center"' : ''}><button type="button" class="btn btn-primary">${esc(label)}</button></div>`);
  $('button', wrap).addEventListener('click', () => { Sound.click(); fn(); });
  return wrap;
}
function successBox(title, lines, iconChar) {
  return el(`<div class="success-panel">
    ${iconChar ? `<span class="success-icon" aria-hidden="true">${iconChar}</span>` : ''}
    <h3>${esc(title)}</h3>
    ${lines.map(l => `<p>${esc(l)}</p>`).join('')}
  </div>`);
}

/* ---------- 스펙트럼 SVG ---------- */
let specUid = 0;
const SPEC_H_LINES = [40, 95, 185];
const SPEC_HE_LINES = [60, 130, 215];
const SPEC_NA_LINES = [80, 160];
const SPEC_CA_LINES = [110, 240];

function spectrumSVG(kind, lines = []) {
  const id = 'rb' + (++specUid);
  const W = 260, H = 40;
  const grad = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#7a4dff"/><stop offset="0.2" stop-color="#3d6bff"/>
    <stop offset="0.4" stop-color="#2fd06e"/><stop offset="0.6" stop-color="#ffe14d"/>
    <stop offset="0.8" stop-color="#ff8c3a"/><stop offset="1" stop-color="#ff4040"/>
  </linearGradient>`;
  const lineColor = x => `hsl(${270 - (x / W) * 270}, 95%, 62%)`;
  let bg, marks = '';
  if (kind === 'cont') {
    bg = `<rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  } else if (kind === 'emit') {
    bg = `<rect width="${W}" height="${H}" fill="#05070d"/>`;
    marks = lines.map(x => `<rect x="${x - 1.6}" width="3.2" height="${H}" fill="${lineColor(x)}"/>`).join('');
  } else { // abs
    bg = `<rect width="${W}" height="${H}" fill="url(#${id})"/>`;
    marks = lines.map(x => `<rect x="${x - 1.6}" width="3.2" height="${H}" fill="#020308"/>`).join('');
  }
  return `<svg class="spec-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${kind === 'cont' ? '연속 스펙트럼' : kind === 'emit' ? '방출 스펙트럼(검은 바탕에 밝은 선)' : '흡수 스펙트럼(무지개 바탕에 검은 선)'}"><defs>${grad}</defs>${bg}${marks}<rect width="${W}" height="${H}" fill="none" stroke="rgba(140,180,240,.5)"/></svg>`;
}

/* ============================================================
   방 1 — 초기 우주 연구소
   ============================================================ */

function openSpectrumDoc() {
  const first = !state.flags.docCard;
  if (first) {
    state.flags.docCard = true;
    gainItem('card-quark');
  }
  infoModal('별의 스펙트럼 자료', '연구원이 남긴 관측 자료집', `
    <p>여러 별의 스펙트럼을 기록한 자료집이다. 첫 장에 이렇게 적혀 있다.</p>
    <div class="clear-summary"><p>“원소마다 스펙트럼 선이 나타나는 위치는 <strong>고유</strong>하다.
    천체의 스펙트럼을 원소의 스펙트럼과 비교하면, 직접 가 보지 않고도 그 천체의 구성 원소를 알아낼 수 있다.”</p></div>
    ${first ? '<p>📇 자료집 사이에서 <strong>사건 카드(쿼크·전자 생성)</strong>를 발견했다!</p>' : '<p>사건 카드는 이미 회수했다.</p>'}
    <p class="puzzle-note">이 자료는 프리즘 옆의 분광 분석기에서 사용할 수 있을 것 같다.</p>`);
}

function openPrism() {
  if (isSolved('r1-spectrum')) {
    infoModal('분광 분석기 (복구됨)', '퍼즐 완료', `
      <p>분광 분석기가 정상 작동 중이다. 별의 흡수 스펙트럼에서 수소와 헬륨의 선을 확인했다.</p>
      <p>분석기에서 나온 <strong>투명 필름</strong>은 인벤토리에 보관되어 있다.</p>
      <div class="clear-summary"><p>투명 필름의 기호: <strong>우주 시계 → 질량 저울 → 우주 달력</strong></p></div>`);
    return;
  }
  const stage1 = buildAssignPuzzle({
    prompt: '분광 분석기를 복구하려면 <strong>세 가지 실험 장치</strong>를 각각 알맞은 스펙트럼에 연결해야 한다.<br>장치 카드를 스펙트럼 아래에 배치하세요.',
    bins: [
      { id: 'spec-cont', label: '연속 스펙트럼', cap: 1, html: spectrumSVG('cont') },
      { id: 'spec-emit', label: '방출 스펙트럼', cap: 1, html: spectrumSVG('emit', SPEC_H_LINES) },
      { id: 'spec-abs', label: '흡수 스펙트럼', cap: 1, html: spectrumSVG('abs', SPEC_H_LINES) },
    ],
    cards: [
      { id: 'src-white', label: '① 백색 광원' },
      { id: 'src-hot', label: '② 고온의 기체' },
      { id: 'src-cool', label: '③ 백색 광원의 빛이 저온의 기체를 통과' },
    ],
    answer: ANSWERS.spectrum,
    wrong: FEEDBACK.spectrum,
    okMsg: '세 스펙트럼이 모두 연결되었습니다.',
    onCorrect(root) {
      root.appendChild(contBtn('별 스펙트럼 분석하기 →', () => setModalBody(prismStage2())));
    },
  });
  openModal({ title: '퍼즐 · 분광 분석기 복구', sub: '실험 장치와 스펙트럼 연결', body: stage1, hintId: 'r1-spectrum' });
}

function prismStage2() {
  const starLines = SPEC_H_LINES.concat(SPEC_HE_LINES).sort((a, b) => a - b);
  const elems = [
    { id: 'h', name: '수소', lines: SPEC_H_LINES },
    { id: 'he', name: '헬륨', lines: SPEC_HE_LINES },
    { id: 'na', name: '나트륨', lines: SPEC_NA_LINES },
    { id: 'ca', name: '칼슘', lines: SPEC_CA_LINES },
  ];
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">분광 분석기에 <strong>어느 별의 흡수 스펙트럼</strong>이 나타났다.<br>
    별 스펙트럼의 <strong>검은 선 위치</strong>를 각 원소의 <strong>밝은 선 위치</strong>와 비교하여,
    이 별에 포함된 원소를 <strong>모두</strong> 선택하세요.</div>
    <div class="spec-row"><span class="spec-name">🌟 별의 스펙트럼</span>${spectrumSVG('abs', starLines)}</div>
    <hr style="border-color:rgba(120,170,230,.25)">
    <div class="elem-rows"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">원소 확인</button></div>
  </div>`);
  const rows = $('.elem-rows', root);
  const picked = new Set();
  elems.forEach(e => {
    const row = el(`<div class="spec-row">
      <button type="button" class="seg-btn" style="flex:0 0 130px" aria-pressed="false" data-el="${e.id}">${esc(e.name)}</button>
      ${spectrumSVG('emit', e.lines)}
    </div>`);
    $('button', row).addEventListener('click', ev => {
      Sound.click();
      const b = ev.currentTarget;
      if (picked.has(e.id)) picked.delete(e.id); else picked.add(e.id);
      b.classList.toggle('on', picked.has(e.id));
      b.setAttribute('aria-pressed', picked.has(e.id) ? 'true' : 'false');
    });
    rows.appendChild(row);
  });
  const fb = $('.feedback', root);
  $('[data-act=check]', root).addEventListener('click', () => {
    const want = ANSWERS.starElements.slice().sort().join(',');
    const got = Array.from(picked).sort().join(',');
    if (got === want) {
      showOk(fb, '이 별에는 수소와 헬륨이 포함되어 있습니다!');
      lockPuzzle(root);
      gainItem('film');
      markSolved('r1-spectrum');
      root.appendChild(successBox('분광 분석기 복구 완료', [
        '분석기 출력구에서 투명 필름이 나왔다.',
        '필름에는 숫자 대신 기호만 그려져 있다: 우주 시계 → 질량 저울 → 우주 달력',
        '잠겨 있던 연구원 서랍의 잠금이 풀리는 소리가 들렸다!',
      ], '🎞️'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    } else {
      recordWrong(FEEDBACK.starSpectrum, fb);
    }
  });
  return root;
}

function openDrawer() {
  if (!isSolved('r1-spectrum')) {
    infoModal('연구원 서랍 (잠김)', null, `
      <p>🔒 서랍이 전자식으로 잠겨 있다. 표시등에 이렇게 적혀 있다.</p>
      <div class="clear-summary"><p>“분광 분석기 복구 시 자동 해제”</p></div>
      <p class="puzzle-note">먼저 프리즘 쪽의 분광 분석기를 복구해야 할 것 같다.</p>`);
    return;
  }
  const first = !state.flags.drawerCard;
  if (first) {
    state.flags.drawerCard = true;
    gainItem('card-nucleon');
  }
  infoModal('연구원 서랍 (열림)', null, `
    <p>서랍이 열렸다. 연구 노트 한 권과 카드가 들어 있다.</p>
    <div class="clear-summary"><p>연구 노트: “우주가 식으면서 쿼크들이 결합해 양성자와 중성자가 되었다.
    이들이 곧 원자핵의 재료다.”</p></div>
    ${first ? '<p>📇 <strong>사건 카드(양성자·중성자 생성)</strong>를 획득했다!</p>' : '<p>사건 카드는 이미 회수했다.</p>'}`);
}

function openClock() {
  const first = !state.flags.clockCard;
  if (first) {
    state.flags.clockCard = true;
    gainItem('card-henuc');
  }
  if (isSolved('r1-timeline')) {
    infoModal('우주 시계 (작동 중)', '단서 확보', `
      <p>우주 시계가 초기 우주의 시간을 가리키고 있다.</p>
      <div class="clear-summary">
        <p>· 헬륨 원자핵 생성: 빅뱅 후 약 <strong>3분</strong></p>
        <p>· 원자 생성: 빅뱅 후 약 <strong>38만 년</strong></p>
      </div>
      <p>시계 아래 단서 표시등: <strong style="color:var(--warn);font-size:1.3em">3</strong></p>`);
    return;
  }
  infoModal('우주 시계 (멈춤)', null, `
    <p>바늘이 멈춘 커다란 시계다. 문자판에 “빅뱅 후 경과 시간”이라고 적혀 있다.</p>
    ${first ? '<p>📇 시계 뒤에 끼워져 있던 <strong>사건 카드(헬륨 원자핵 생성)</strong>를 발견했다!</p>' : ''}
    <p class="puzzle-note">게시판의 사건 카드를 시간 순서대로 정리하면 시계가 다시 움직일 것 같다.</p>`);
}

function openBoard() {
  const first = !state.flags.boardCard;
  if (first) {
    state.flags.boardCard = true;
    gainItem('card-atom');
  }
  if (isSolved('r1-timeline')) {
    infoModal('사건 기록 게시판 (완성)', '퍼즐 완료', `
      <p>초기 우주 사건이 시간 순서대로 정리되어 있다.</p>
      <div class="clear-summary"><p>쿼크와 전자 생성 → 양성자와 중성자 생성 → 헬륨 원자핵 생성 → 원자 생성</p></div>`);
    return;
  }
  const owned = R1_CARDS.filter(hasItem);
  if (owned.length < 4) {
    infoModal('사건 기록 게시판', null, `
      ${first ? '<p>📇 게시판 뒤에 붙어 있던 <strong>사건 카드(원자 생성)</strong>를 발견했다!</p>' : ''}
      <p>게시판에는 카드 4장을 시간 순서대로 꽂는 홈이 있다.</p>
      <p>지금까지 모은 사건 카드: <strong>${owned.length} / 4</strong></p>
      <p class="puzzle-note">스펙트럼 자료 · 연구원 서랍 · 우주 시계 · 게시판 근처를 조사하면 카드를 찾을 수 있다.</p>`);
    return;
  }
  const puzzle = buildOrderPuzzle({
    prompt: `${first ? '📇 게시판 뒤에서 <strong>사건 카드(원자 생성)</strong>를 발견했다!<br>' : ''}모은 사건 카드 4장을 <strong>초기 우주에서 일어난 시간 순서</strong>대로 배열하세요.`,
    cards: R1_CARDS.map(id => ({ id, label: itemDef(id).name.replace('사건 카드: ', '') })),
    answer: ANSWERS.timeline,
    wrongMsg: FEEDBACK.timeline,
    okMsg: '초기 우주의 사건이 올바르게 정리되었습니다!',
    onCorrect(root) {
      R1_CARDS.forEach(useItem);
      gainItem('clue-clock');
      markSolved('r1-timeline');
      root.appendChild(successBox('우주 시계 작동!', [
        '멈췄던 우주 시계가 다시 움직이기 시작했다.',
        '헬륨 원자핵 생성: 빅뱅 후 약 3분 · 원자 생성: 빅뱅 후 약 38만 년',
        '시계가 단서 숫자 「3」을 가리킨다.',
        '잠겨 있던 수소·헬륨 질량 저울이 활성화되었다!',
      ], '🕰️'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 초기 우주 사건 시간선', sub: '사건 카드를 시간 순서대로', body: puzzle, hintId: 'r1-timeline' });
}

/* --- 퍼즐 3: 초기 우주 핵합성 시뮬레이터 --- */
function openScale() {
  if (!isSolved('r1-timeline')) {
    infoModal('수소·헬륨 질량 저울 (비활성)', null, `
      <p>🔒 저울의 전원이 들어오지 않는다. 화면에 흐릿하게 표시가 떠 있다.</p>
      <div class="clear-summary"><p>“우주 시계 동기화 필요”</p></div>
      <p class="puzzle-note">게시판의 사건 카드를 정리해 우주 시계를 먼저 작동시키자.</p>`);
    return;
  }
  if (isSolved('r1-nucleo')) {
    infoModal('수소·헬륨 질량 저울 (측정 완료)', '퍼즐 완료', `
      <p>저울이 측정값을 표시하고 있다.</p>
      <div class="clear-summary"><p>수소 원자핵 : 헬륨 원자핵의 질량비 = <strong>3 : 1</strong></p></div>
      <p>단서 표시등: <strong style="color:var(--warn);font-size:1.3em">3 1</strong></p>`);
    return;
  }
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">“초기 우주에는 <strong>양성자가 중성자보다 훨씬 많았습니다.</strong><br>
    양성자와 중성자를 결합하여 만들 수 있는 <strong>헬륨 원자핵</strong>을 모두 만들어 보세요.”</div>
    <p class="puzzle-note">※ 이 모형은 초기 우주의 입자 구성을 학습하기 위해 단순화한 모형입니다.
    양성자(붉은색)와 중성자(회색)는 클릭하거나 끌어서 옮길 수 있습니다. 작은 푸른 입자는 자유 전자, 〰는 빛입니다.</p>
    <div class="particle-stage">
      <div class="particle-zone" data-zone="pool">
        <span class="pz-title">빅뱅 후 약 3분이 되기 전의 초기 우주</span>
        <div class="pz-body"></div>
      </div>
      <div class="particle-zone assembly" data-zone="asm">
        <span class="pz-title">헬륨 원자핵 조립 영역</span>
        <div class="pz-body"></div>
      </div>
    </div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="fuse">⚡ 핵융합 실행</button></div>
  </div>`);
  const poolBody = $('[data-zone=pool] .pz-body', root);
  const asmBody = $('[data-zone=asm] .pz-body', root);
  const fb = $('.feedback', root);

  function makeParticle(type, i) {
    const label = type === 'p' ? '양성자' : '중성자';
    const b = el(`<button type="button" class="particle pt-${type}" draggable="true" data-pt="${type}" aria-label="${label}">${type === 'p' ? 'p' : 'n'}</button>`);
    b.addEventListener('click', () => {
      if (b.disabled) return;
      Sound.click();
      (b.parentElement === poolBody ? asmBody : poolBody).appendChild(b);
    });
    b.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', `pt-${type}-${i}`));
    b.dataset.key = `pt-${type}-${i}`;
    return b;
  }
  const particles = [];
  for (let i = 0; i < 14; i++) particles.push(makeParticle('p', i));
  for (let i = 0; i < 2; i++) particles.push(makeParticle('n', 100 + i));
  shuffle(particles).forEach(p => poolBody.appendChild(p));
  for (let i = 0; i < 6; i++) {
    const e = el('<button type="button" class="particle pt-e" aria-label="자유 전자">e</button>');
    e.addEventListener('click', () => toast('이 시기의 전자는 아직 원자핵과 결합하지 못하고 자유롭게 움직입니다.'));
    poolBody.appendChild(e);
  }
  for (let i = 0; i < 3; i++) {
    const w = el('<button type="button" class="particle pt-wave" aria-label="빛">〰</button>');
    w.addEventListener('click', () => toast('빛은 입자들과 계속 상호작용하며 우주를 채우고 있습니다.'));
    poolBody.appendChild(w);
  }
  [[poolBody, 'pool'], [asmBody, 'asm']].forEach(([zone]) => {
    zone.parentElement.addEventListener('dragover', e => e.preventDefault());
    zone.parentElement.addEventListener('drop', e => {
      e.preventDefault();
      const key = e.dataTransfer.getData('text/plain');
      const p = particles.find(x => x.dataset.key === key);
      if (p && !p.disabled) zone.appendChild(p);
    });
  });
  $('[data-act=fuse]', root).addEventListener('click', () => {
    const pN = $$('.pt-p', asmBody).length;
    const nN = $$('.pt-n', asmBody).length;
    if (pN === ANSWERS.heRecipe.p && nN === ANSWERS.heRecipe.n) {
      showOk(fb, '양성자 2개 + 중성자 2개 → 헬륨 원자핵 1개가 만들어졌습니다!');
      $$('.particle', asmBody).forEach(x => x.remove());
      asmBody.appendChild(el('<div class="he-core" role="img" aria-label="헬륨 원자핵"><span class="hp"></span><span class="hn"></span><span class="hn"></span><span class="hp"></span></div>'));
      $$('.pt-p', poolBody).forEach(x => { x.classList.add('h-label'); x.disabled = true; });
      $$('.particle', root).forEach(x => { x.draggable = false; if (x.dataset.pt) x.disabled = true; });
      $('[data-act=fuse]', root).disabled = true;
      root.appendChild(successBox('핵융합 완료', [
        '중성자는 2개뿐이므로 헬륨 원자핵은 1개만 만들 수 있습니다.',
        '남은 양성자 12개는 각각 「수소 원자핵」이 되었습니다.',
        '아직 전자는 원자핵과 결합하지 않았습니다. (수소 원자 ×, 수소 원자핵 ○)',
      ], '⚛️'));
      root.appendChild(contBtn('질량 계산 단계로 →', () => setModalBody(massStage()), true));
    } else if (pN + nN === 0) {
      toast('먼저 양성자와 중성자를 조립 영역으로 옮기세요.');
    } else {
      recordWrong(FEEDBACK.heRecipe, fb);
    }
  });
  openModal({ title: '퍼즐 · 초기 우주 핵합성 시뮬레이터', sub: '수소·헬륨 질량 저울', body: root, hintId: 'r1-nucleo' });
}

function massStage() {
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">핵융합이 끝난 초기 우주에는 <strong>수소 원자핵 12개</strong>와 <strong>헬륨 원자핵 1개</strong>가 남았다.<br>
    두 원자핵의 <strong>전체 질량</strong>을 계산하고, 가장 간단한 <strong>질량비</strong>로 나타내세요.</div>
    <ul style="margin:0.4rem 0 0.8rem; padding-left:1.3rem; color:var(--text-dim); font-size:0.92rem">
      <li>양성자와 중성자의 질량은 각각 약 1질량 단위로 생각한다.</li>
      <li>수소 원자핵 1개의 질량 ≈ 1질량 단위</li>
      <li>헬륨 원자핵 1개의 질량 ≈ 4질량 단위</li>
    </ul>
    <div class="mass-calc">
      <div class="mass-row"><span>수소 원자핵 전체 질량: 12개 × 1 =</span>
        <input id="in-mh" type="number" inputmode="numeric" min="0" max="99" aria-label="수소 원자핵 전체 질량"></div>
      <div class="mass-row"><span>헬륨 원자핵 전체 질량: 1개 × 4 =</span>
        <input id="in-mhe" type="number" inputmode="numeric" min="0" max="99" aria-label="헬륨 원자핵 전체 질량"></div>
      <div class="mass-row"><span>가장 간단한 질량비 → 수소 원자핵</span>
        <input id="in-r1" type="number" inputmode="numeric" min="0" max="99" aria-label="질량비의 수소 값">
        <span class="ratio-sep">:</span>
        <input id="in-r2" type="number" inputmode="numeric" min="0" max="99" aria-label="질량비의 헬륨 값">
        <span>헬륨 원자핵</span></div>
    </div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">질량비 확인</button></div>
  </div>`);
  const fb = $('.feedback', root);
  $('[data-act=check]', root).addEventListener('click', () => {
    const mh = Number($('#in-mh', root).value);
    const mhe = Number($('#in-mhe', root).value);
    const r1 = Number($('#in-r1', root).value);
    const r2 = Number($('#in-r2', root).value);
    if (![mh, mhe, r1, r2].every(v => Number.isFinite(v)) || $('#in-r1', root).value === '' || $('#in-r2', root).value === '') {
      toast('모든 칸을 채운 뒤 확인하세요.');
      return;
    }
    if (mh === ANSWERS.massH && mhe === ANSWERS.massHe && r1 === ANSWERS.ratio[0] && r2 === ANSWERS.ratio[1]) {
      showOk(fb, '수소 원자핵 : 헬륨 원자핵의 질량비 = 3 : 1');
      lockPuzzle(root);
      gainItem('clue-scale');
      markSolved('r1-nucleo');
      root.appendChild(successBox('질량 표시기 작동: 12 : 4 → 3 : 1', [
        '헬륨 원자핵이 생성된 뒤에도 많은 양성자가 남았습니다.',
        '남은 양성자는 수소 원자핵이 되었고, 수소 원자핵과 헬륨 원자핵의 질량비는 약 3:1이 되었습니다.',
        '질량 저울이 단서 숫자 「3 1」을 가리킵니다.',
      ], '⚖️'));
      root.appendChild(el(`<div class="clear-summary"><p>💡 화면 속 자유 전자들은 여전히 원자핵 주위를 떠돌고 있다…<br>
        “아직 전자들은 원자핵과 결합하지 않았습니다. 그렇다면 <strong>빛은 언제 자유롭게 이동할 수 있었을까요?</strong>”<br>
        → 우주 배경 복사 관측 화면이 활성화되었다!</p></div>`));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    } else if (mh === ANSWERS.massH && mhe === ANSWERS.massHe && r2 > 0 && r1 * ANSWERS.ratio[1] === r2 * ANSWERS.ratio[0]) {
      recordWrong(FEEDBACK.ratioSimplify, fb);
    } else {
      recordWrong(FEEDBACK.ratio, fb);
    }
  });
  return root;
}

/* --- 퍼즐 4: 빛의 탈출 실험 --- */
function openCMB() {
  if (!isSolved('r1-nucleo')) {
    infoModal('우주 배경 복사 관측 화면 (비활성)', null, `
      <p>🔒 관측 화면이 꺼져 있다. 하단 표시등에 이렇게 적혀 있다.</p>
      <div class="clear-summary"><p>“질량 저울 측정 완료 후 가동 가능”</p></div>`);
    return;
  }
  if (isSolved('r1-light')) {
    infoModal('우주 배경 복사 관측 화면 (복구됨)', '퍼즐 완료', `
      <p>화면에 우주 전역에서 오는 빛의 지도가 표시되고 있다.</p>
      <div class="clear-summary"><p>약 38만 년, 약 3000 K에서 원자가 형성되며 자유로워진 빛은
      파장이 길어져 오늘날 <strong>우주 배경 복사</strong>로 관측된다.</p></div>
      <p>우주 달력 단서: <strong style="color:var(--warn);font-size:1.3em">3 8</strong></p>`);
    return;
  }
  const stage1 = buildAssignPuzzle({
    prompt: '두 개의 투명한 우주 관측실이 있다. 입자·상태 카드를 <strong>원자 형성 전(A)</strong>과 <strong>원자 형성 후(B)</strong>의 우주에 알맞게 배치하세요.',
    bins: [
      { id: 'ch-a', label: '관측실 A · 원자 형성 전', desc: '전자가 원자핵과 결합하기 전의 우주' },
      { id: 'ch-b', label: '관측실 B · 원자 형성 후', desc: '전자가 원자핵과 결합한 뒤의 우주' },
    ],
    cards: [
      { id: 'pc-freeE', label: '자유롭게 움직이는 전자' },
      { id: 'pc-hnuc', label: '수소 원자핵' },
      { id: 'pc-henuc', label: '헬륨 원자핵' },
      { id: 'pc-hatom', label: '전자와 결합한 수소 원자' },
      { id: 'pc-heatom', label: '전자와 결합한 헬륨 원자' },
      { id: 'pc-zig', label: '여러 방향으로 꺾여 진행하는 빛' },
      { id: 'pc-straight', label: '곧게 진행하는 빛' },
    ],
    answer: ANSWERS.lightRooms,
    wrong: FEEDBACK.lightPlace,
    okMsg: '두 관측실의 준비가 끝났습니다. 빛 발사 실험이 가능합니다!',
    onCorrect(root) {
      root.appendChild(contBtn('빛 발사 실험 →', () => setModalBody(lightStage2()), true));
    },
  });
  openModal({ title: '퍼즐 · 빛의 탈출 실험', sub: '우주 배경 복사 관측 화면 복구', body: stage1, hintId: 'r1-light' });
}

function lightStage2() {
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">두 관측실에서 각각 <strong>빛 발사</strong> 버튼을 눌러, 빛이 어떻게 이동하는지 관찰하세요.</div>
    <div class="chambers">
      <div class="chamber" data-ch="a">
        <h4>관측실 A · 원자 형성 전</h4>
        <div class="ch-deco">
          ${Array.from({ length: 7 }, (_, i) => `<span class="ch-particle" style="left:${12 + i * 12}%;top:${(i * 37) % 80 + 5}%;background:#61d4ff"></span>`).join('')}
          ${Array.from({ length: 4 }, (_, i) => `<span class="ch-particle big" style="left:${20 + i * 20}%;top:${(i * 53) % 70 + 10}%;background:#ff8f6b"></span>`).join('')}
        </div>
        <div class="beam-dot"></div>
        <div class="ch-btn-row"><button type="button" class="btn btn-small" data-fire="a">💡 빛 발사</button></div>
      </div>
      <div class="chamber" data-ch="b">
        <h4>관측실 B · 원자 형성 후</h4>
        <div class="ch-deco">
          ${Array.from({ length: 5 }, (_, i) => `<span class="ch-particle big" style="left:${12 + i * 18}%;top:${(i * 43) % 70 + 12}%;background:radial-gradient(circle at 35% 30%, #9ad9ff, #2c6ea8)"></span>`).join('')}
        </div>
        <div class="beam-dot"></div>
        <div class="ch-btn-row"><button type="button" class="btn btn-small" data-fire="b">💡 빛 발사</button></div>
      </div>
    </div>
    <div class="light-result" aria-live="polite"></div>
    <div class="stage2-next"></div>
  </div>`);
  const fired = { a: false, b: false };
  const resBox = $('.light-result', root);
  const msgs = {
    a: '관측실 A: 빛이 자유 전자와 계속 상호작용하여 진행 방향이 여러 번 바뀌었고, 반대편까지 곧게 도달하지 못했습니다.',
    b: '관측실 B: 전자가 원자핵과 결합해 원자가 되어 있어, 빛이 방해를 적게 받고 반대편까지 곧게 이동했습니다!',
  };
  $$('[data-fire]', root).forEach(b => {
    b.addEventListener('click', () => {
      Sound.click();
      const ch = b.dataset.fire;
      const chamber = $(`.chamber[data-ch=${ch}]`, root);
      chamber.classList.remove('fired-zig', 'fired-straight');
      void chamber.offsetWidth;
      chamber.classList.add(ch === 'a' ? 'fired-zig' : 'fired-straight');
      fired[ch] = true;
      resBox.appendChild(el(`<p class="puzzle-note">· ${esc(msgs[ch])}</p>`));
      b.textContent = '💡 다시 발사';
      if (fired.a && fired.b && !$('.cmp-table', root)) {
        root.appendChild(el(`<div class="table-wrap"><table class="cmp-table">
          <caption class="puzzle-note" style="text-align:left">두 관측실 비교</caption>
          <tr><th>비교 항목</th><th>원자 형성 전</th><th>원자 형성 후</th></tr>
          <tr><td>전자 상태</td><td>원자핵과 분리되어 자유롭게 움직임</td><td>원자핵과 결합함</td></tr>
          <tr><td>물질의 상태</td><td>원자핵과 전자가 따로 존재함</td><td>수소 원자와 헬륨 원자가 존재함</td></tr>
          <tr><td>빛의 이동</td><td>입자들과 계속 상호작용하여 자유롭게 이동하기 어려움</td><td>우주 공간을 자유롭게 이동할 수 있음</td></tr>
        </table></div>`));
        $('.stage2-next', root).appendChild(contBtn('추론 문제로 →', () => setModalBody(lightStage3()), true));
      }
    });
  });
  return root;
}

function lightStage3() {
  const options = [
    { id: 'op-3min', label: '3분' },
    { id: 'op-38man', label: '38만 년' },
    { id: 'op-3000k', label: '3000 K' },
    { id: 'op-1e9k', label: '10억 K' },
    { id: 'op-atom', label: '원자' },
    { id: 'op-nuc', label: '원자핵' },
    { id: 'op-star', label: '별' },
    { id: 'op-galaxy', label: '은하' },
  ];
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">실험 결과를 바탕으로, 카드를 끌어(또는 클릭해) 문장의 빈칸을 완성하세요.</div>
    <div class="blank-sentence">
      우주의 나이가 약 <span class="blank-slot" data-bl="bl-age" tabindex="0" aria-label="첫 번째 빈칸: 우주의 나이"></span> 이 되었을 때,
      우주의 온도는 약 <span class="blank-slot" data-bl="bl-temp" tabindex="0" aria-label="두 번째 빈칸: 우주의 온도"></span> 로 낮아졌고,
      전자가 원자핵과 결합하여 <span class="blank-slot" data-bl="bl-what" tabindex="0" aria-label="세 번째 빈칸"></span> 가 만들어졌다.<br>
      그 결과 빛이 우주 공간을 자유롭게 이동할 수 있게 되었다.
    </div>
    <div class="card-pool" aria-label="선택 카드"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">문장 완성 확인</button></div>
  </div>`);
  const pool = $('.card-pool', root);
  const fb = $('.feedback', root);
  const cardEls = {};
  const loc = {};
  let selected = null;
  function setSelected(id) {
    selected = id;
    Object.entries(cardEls).forEach(([cid, e]) => e.classList.toggle('selected', cid === selected));
  }
  function place(id, bl) {
    if (bl) {
      const slot = $(`.blank-slot[data-bl=${bl}]`, root);
      const cur = Object.keys(loc).find(k => loc[k] === bl);
      if (cur) { loc[cur] = null; pool.appendChild(cardEls[cur]); }
      loc[id] = bl;
      slot.appendChild(cardEls[id]);
    } else {
      loc[id] = null;
      pool.appendChild(cardEls[id]);
    }
  }
  shuffle(options).forEach(o => {
    const c = el(`<button type="button" class="game-card" draggable="true" data-card="${o.id}">${esc(o.label)}</button>`);
    cardEls[o.id] = c;
    loc[o.id] = null;
    pool.appendChild(c);
    c.addEventListener('click', () => {
      Sound.click();
      if (loc[o.id]) { place(o.id, null); setSelected(null); }
      else setSelected(selected === o.id ? null : o.id);
    });
    c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', o.id); setSelected(null); });
  });
  $$('.blank-slot', root).forEach(slot => {
    const putSelected = () => {
      if (selected && loc[selected] === null) { place(selected, slot.dataset.bl); setSelected(null); Sound.click(); }
    };
    slot.addEventListener('click', e => { if (!e.target.closest('.game-card')) putSelected(); });
    slot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); putSelected(); } });
    slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      if (cardEls[id]) place(id, slot.dataset.bl);
    });
  });
  pool.addEventListener('dragover', e => e.preventDefault());
  pool.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (cardEls[id]) place(id, null);
  });
  $('[data-act=check]', root).addEventListener('click', () => {
    const blanks = Object.keys(ANSWERS.blanks);
    if (blanks.some(bl => !Object.values(loc).includes(bl))) { toast('빈칸을 모두 채운 뒤 확인하세요.'); return; }
    const ok = blanks.every(bl => loc[ANSWERS.blanks[bl]] === bl);
    if (ok) {
      showOk(fb, '약 38만 년 · 약 3000 K · 원자!');
      lockPuzzle(root);
      root.appendChild(el(`<div class="success-panel nova-flash">
        <span class="success-icon" aria-hidden="true">🌌</span>
        <h3>빛이 우주 공간으로 퍼져 나갑니다!</h3>
        <p>이 빛은 우주가 팽창하며 식는 동안 파장이 점점 길어져,</p>
        <p>오늘날 우주 전역에서 관측됩니다. 그렇다면…</p>
      </div>`));
      root.appendChild(contBtn('마지막 확인 문제 →', () => setModalBody(lightStage4()), true));
    } else {
      recordWrong(FEEDBACK.blanks, fb);
    }
  });
  return root;
}

function lightStage4() {
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">마지막 확인 문제 — “오늘날 우주 전역에서 관측되는 <strong>이 빛</strong>은 무엇인가?”</div>
    <div class="seg" style="flex-direction:column"></div>
    <div class="feedback" aria-live="polite"></div>
  </div>`);
  const seg = $('.seg', root);
  const opts = [
    { id: 'q-wind', label: '태양풍' },
    { id: 'q-starlight', label: '별빛' },
    { id: 'q-cmb', label: '우주 배경 복사' },
    { id: 'q-aurora', label: '오로라' },
  ];
  const fb = $('.feedback', root);
  shuffle(opts).forEach(o => {
    const b = el(`<button type="button" class="seg-btn" data-opt="${o.id}">${esc(o.label)}</button>`);
    seg.appendChild(b);
    b.addEventListener('click', () => {
      if (o.id === ANSWERS.cmbQuiz) {
        showOk(fb, '정답은 우주 배경 복사입니다!');
        lockPuzzle(root);
        gainItem('clue-cal');
        markSolved('r1-light');
        root.appendChild(successBox('관측 화면 복구 완료', [
          '약 38만 년 전 원자가 형성되자 빛이 우주 공간을 자유롭게 이동하기 시작했습니다.',
          '이때의 빛은 오늘날 우주 배경 복사로 관측되며, 빅뱅 우주론을 뒷받침하는 결정적인 증거입니다.',
          '우주 달력이 단서 숫자 「3 8」을 가리킵니다. 출구의 숫자 패드락이 활성화되었습니다!',
        ], '📡'));
        root.appendChild(contBtn('닫기', () => closeModal(), true));
      } else {
        recordWrong(FEEDBACK.cmb, fb);
      }
    });
  });
  return root;
}

function openR1Door() {
  if (!isSolved('r1-light')) {
    infoModal('출구 · 5자리 숫자 패드락 (비활성)', null, `
      <p>🔒 패드락에 전원이 들어오지 않는다.</p>
      <p class="puzzle-note">이 방의 장치 4개(분광 분석기 → 게시판 → 질량 저울 → 관측 화면)를 모두 복구해야 활성화된다.</p>`);
    return;
  }
  const note = hasItem('film')
    ? '🎞️ 투명 필름의 기호: <strong>우주 시계 → 질량 저울 → 우주 달력</strong> — 이 순서대로 단서 숫자를 이어 붙이자.'
    : '단서 숫자를 읽는 순서가 필요하다.';
  const pad = buildKeypad({
    digits: 5,
    code: ANSWERS.r1code,
    prompt: '출구가 5자리 숫자 패드락으로 잠겨 있다.',
    note,
    wrongMsg: FEEDBACK.r1code,
    okMsg: '패드락 해제! 문이 열립니다.',
    onCorrect() {
      markSolved('r1-door');
      setTimeout(() => roomClearSequence(1), 700);
    },
  });
  openModal({ title: '출구 · 5자리 숫자 패드락', sub: '방 1 최종 잠금장치', body: pad, hintId: 'r1-door' });
}

/* ============================================================
   방 2 — 별의 원소 생성실
   ============================================================ */

function starSVG(size, color, label) {
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" role="img" aria-label="${label}">
    <circle cx="30" cy="30" r="24" fill="${color}" opacity="0.14"/>
    <circle cx="30" cy="30" r="15" fill="${color}" opacity="0.55"/>
    <circle cx="30" cy="30" r="9" fill="#fff" opacity="0.85"/>
  </svg>`;
}

function grantPieces(flag, n, place) {
  if (state.flags[flag]) return `<p>필름 조각은 이미 회수했다. (${itemCount('film-piece')}/6)</p>`;
  state.flags[flag] = true;
  gainItem('film-piece', n);
  return `<p>🎞️ ${esc(place)}에서 <strong>필름 조각 ${n}개</strong>를 발견했다! (${itemCount('film-piece')}/6)</p>`;
}

function openProtostar() {
  const found = grantPieces('protoPieces', 2, '원시별 모형 받침대 아래');
  infoModal('원시별 모형', null, `
    <p>성간 물질이 중력으로 수축하며 만들어지는 <strong>원시별</strong>의 모형이다.
    중심부 온도가 충분히 높아지면 수소 핵융합이 시작되어 스스로 빛나는 별이 된다.</p>
    ${found}`);
}

function openArchive() {
  const found = grantPieces('archPieces', 2, '관측 기록 보관함 서류 사이');
  infoModal('관측 기록 보관함', null, `
    <p>여러 성운과 별의 관측 기록이 보관되어 있다. 기록 하나가 눈에 띈다.</p>
    <div class="clear-summary"><p>“별 사이의 공간은 비어 있지 않다. 옅은 가스와 티끌 — <strong>성간 물질</strong>이 퍼져 있고,
    이것이 모여 성운이 된다.”</p></div>
    ${found}`);
}

function openProjector() {
  if (isSolved('r2-film')) {
    infoModal('성운 투영 장치 (작동 중)', '퍼즐 완료', `
      <p>보랏빛 성운 영상이 투영되고 있다. 성운 속에서 원시별이 빛난다.</p>
      <div class="clear-summary"><p>성간 물질 → 성운 → 중력 수축 → 원시별 → 중심부 온도 상승 → 수소 핵융합 시작</p></div>`);
    return;
  }
  const pieces = itemCount('film-piece');
  if (pieces < 6) {
    infoModal('성운 투영 장치', null, `
      <p>「별 탄생 기록 필름」을 재생하는 투영 장치다. 필름이 찢어져 조각나 있다.</p>
      <p>모은 필름 조각: <strong>${pieces} / 6</strong></p>
      <p class="puzzle-note">원시별 모형, 관측 기록 보관함, 핵융합 반응기 근처를 조사하면 조각을 찾을 수 있다.</p>`);
    return;
  }
  const puzzle = buildOrderPuzzle({
    prompt: '필름 조각 6개를 <strong>별이 탄생하는 순서</strong>대로 이어 붙이세요.',
    cards: [
      { id: 'f-ism', label: '우주 공간의 성간 물질' },
      { id: 'f-nebula', label: '성간 물질이 모여 성운 형성' },
      { id: 'f-contract', label: '중력에 의해 물질이 모이고 수축' },
      { id: 'f-proto', label: '원시별 형성' },
      { id: 'f-heat', label: '중심부의 온도 상승' },
      { id: 'f-fusion', label: '수소 핵융합 반응 시작' },
    ],
    answer: ANSWERS.film,
    wrongMsg: FEEDBACK.film,
    okMsg: '필름이 완성되어 투영 장치가 작동합니다!',
    onCorrect(root) {
      useItem('film-piece');
      markSolved('r2-film');
      root.appendChild(successBox('성운 투영 장치 작동!', [
        '보랏빛 성운 속에서 원시별이 빛나기 시작했다.',
        '수소 핵융합 반응기의 전원이 켜졌다!',
      ], '🌠'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 찢어진 별 탄생 필름', sub: '성운 투영 장치', body: puzzle, hintId: 'r2-film' });
}

function openReactor() {
  if (!isSolved('r2-film')) {
    const found = grantPieces('reactorPieces', 2, '꺼진 반응기의 통풍구 틈');
    infoModal('수소 핵융합 반응기 (전원 꺼짐)', null, `
      <p>🔒 거대한 반응기의 전원이 꺼져 있다. 계기판에 “성운 투영 장치와 연동됨”이라고 적혀 있다.</p>
      ${found}`);
    return;
  }
  if (isSolved('r2-fusion')) {
    infoModal('수소 핵융합 반응기 (안정 가동)', '퍼즐 완료', `
      <p>반응기가 안정적으로 가동 중이다.</p>
      <div class="clear-summary"><p>수소 원자핵 4개 → 헬륨 원자핵 1개 + 에너지</p></div>
      <p>발급된 <strong>핵융합 인증판(4)</strong>은 인벤토리에 있다.</p>`);
    return;
  }
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">“원시별 중심부의 온도가 약 <strong>1000만 K</strong> 이상으로 높아졌다.
    <strong>수소 핵융합 반응</strong>을 시작하라.”<br>
    헬륨 원자핵 1개가 생성되도록, 필요한 만큼의 수소 원자핵을 반응기에 넣으세요.</div>
    <p class="puzzle-note">수소 원자핵(H)을 클릭하거나 끌어서 반응기에 넣습니다.</p>
    <div class="particle-stage">
      <div class="particle-zone" data-zone="pool"><span class="pz-title">수소 원자핵 공급 장치</span><div class="pz-body"></div></div>
      <div class="particle-zone assembly" data-zone="asm"><span class="pz-title">핵융합 반응기 투입구</span><div class="pz-body"></div></div>
    </div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="fuse">⚡ 핵융합 시작</button></div>
  </div>`);
  const poolBody = $('[data-zone=pool] .pz-body', root);
  const asmBody = $('[data-zone=asm] .pz-body', root);
  const fb = $('.feedback', root);
  const hs = [];
  for (let i = 0; i < 8; i++) {
    const b = el(`<button type="button" class="particle pt-p" draggable="true" data-key="h${i}" aria-label="수소 원자핵">H</button>`);
    b.addEventListener('click', () => {
      if (b.disabled) return;
      Sound.click();
      (b.parentElement === poolBody ? asmBody : poolBody).appendChild(b);
    });
    b.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', `h${i}`));
    hs.push(b);
    poolBody.appendChild(b);
  }
  [[poolBody], [asmBody]].forEach(([zone]) => {
    zone.parentElement.addEventListener('dragover', e => e.preventDefault());
    zone.parentElement.addEventListener('drop', e => {
      e.preventDefault();
      const p = hs.find(x => x.dataset.key === e.dataTransfer.getData('text/plain'));
      if (p && !p.disabled) zone.appendChild(p);
    });
  });
  $('[data-act=fuse]', root).addEventListener('click', () => {
    const n = $$('.pt-p', asmBody).length;
    if (n === ANSWERS.fusionCount) {
      showOk(fb, '수소 원자핵 4개 → 헬륨 원자핵 1개 + 에너지!');
      $$('.pt-p', asmBody).forEach(x => x.remove());
      asmBody.parentElement.classList.add('nova-flash');
      asmBody.appendChild(el('<div class="he-core" role="img" aria-label="생성된 헬륨 원자핵"><span class="hp"></span><span class="hn"></span><span class="hn"></span><span class="hp"></span></div>'));
      asmBody.appendChild(el('<span style="align-self:center;font-weight:800;color:var(--warn)">＋ 에너지 방출!</span>'));
      lockPuzzle(root);
      gainItem('cert4');
      markSolved('r2-fusion');
      root.appendChild(successBox('반응기 안정화', [
        '반응기가 「핵융합 인증판」을 발급했다. 숫자 4가 찍혀 있다.',
        '질량이 서로 다른 두 별의 내부 분석기가 활성화되었다!',
      ], '⚡'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    } else if (n === 0) {
      toast('수소 원자핵을 먼저 반응기에 넣으세요.');
    } else {
      recordWrong(FEEDBACK.fusion, fb);
    }
  });
  openModal({ title: '퍼즐 · 수소 핵융합 반응기', sub: '별 내부의 에너지원', body: root, hintId: 'r2-fusion' });
}

function openStars() {
  if (!isSolved('r2-fusion')) {
    infoModal('별 내부 분석기 (비활성)', null, `
      <p>🔒 질량이 서로 다른 두 별의 내부 단면 분석기다. 아직 전원이 들어오지 않는다.</p>
      <p class="puzzle-note">수소 핵융합 반응기를 먼저 가동해야 한다.</p>`);
    return;
  }
  if (isSolved('r2-starmass')) {
    infoModal('별 내부 분석기 (분석 완료)', '퍼즐 완료', `
      <div class="clear-summary">
        <p>· 질량이 태양과 비슷한 별 → 최종적으로 <strong>탄소</strong>까지 생성</p>
        <p>· 질량이 태양보다 훨씬 큰 별 → 최종적으로 <strong>철</strong>까지 생성</p>
      </div>`);
    return;
  }
  const puzzle = buildAssignPuzzle({
    prompt: `두 분석 장치의 질문에 답하도록, 각 별의 <strong>중심부</strong>에 알맞은 원소 카드를 배치하세요.<br>
      <span class="puzzle-note">장치 A: “<strong>수소 핵융합으로 헬륨이 생성된 이후</strong>, 질량이 태양과 비슷한 별의 중심부에서는 핵융합 반응을 통해 최종적으로 어떤 원소까지 만들어지는가?”<br>
      장치 B: “<strong>수소 핵융합으로 헬륨이 생성된 이후</strong>, 질량이 태양보다 훨씬 큰 별의 중심부에서는 연속적인 핵융합 반응을 통해 최종적으로 어떤 원소까지 만들어지는가?”</span>`,
    bins: [
      { id: 'bin-small', label: '장치 A · 질량이 태양과 비슷한 별', cap: 1, html: starSVG(56, '#ffd97a', '질량이 태양과 비슷한 별') },
      { id: 'bin-big', label: '장치 B · 질량이 태양보다 훨씬 큰 별', cap: 1, html: starSVG(76, '#9fd0ff', '질량이 태양보다 훨씬 큰 별') },
    ],
    cards: [
      { id: 'el-h', label: '수소' },
      { id: 'el-he', label: '헬륨' },
      { id: 'el-c', label: '탄소' },
      { id: 'el-o', label: '산소' },
      { id: 'el-fe', label: '철' },
      { id: 'el-heavy', label: '철보다 무거운 원소' },
    ],
    answer: ANSWERS.starmass,
    wrong: FEEDBACK.starmass,
    okMsg: '두 별의 최종 생성 원소가 확인되었습니다!',
    onCorrect(root) {
      gainItem('small-star');
      gainItem('big-star');
      markSolved('r2-starmass');
      root.appendChild(successBox('분석 완료', [
        '작은 별 문양과 큰 별 문양을 획득했다.',
        '초신성 관측 장치가 활성화되었다!',
      ], '⭐'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 별의 질량에 따른 원소 생성', sub: '별 내부 단면 분석기', body: puzzle, hintId: 'r2-starmass' });
}

function openNova() {
  if (!isSolved('r2-starmass')) {
    infoModal('초신성 관측 장치 (비활성)', null, `
      <p>🔒 초신성 관측 기록이 뒤엉켜 재생되지 않는다.</p>
      <p class="puzzle-note">두 별의 내부 분석을 먼저 완료해야 한다.</p>`);
    return;
  }
  if (isSolved('r2-nova')) {
    infoModal('초신성 관측 장치 (기록 복구됨)', '퍼즐 완료', `
      <div class="clear-summary"><p>철 생성 → 중심부 수축 → 초신성 폭발 → 철보다 무거운 원소 생성 → 원소 방출 → 새로운 별과 행성의 재료</p></div>`);
    return;
  }
  const puzzle = buildOrderPuzzle({
    prompt: '뒤엉킨 초신성 관측 기록을 <strong>사건이 일어난 순서</strong>대로 복구하세요.',
    cards: [
      { id: 'n-iron', label: '질량이 매우 큰 별의 중심부에 철 생성' },
      { id: 'n-collapse', label: '별의 중심부가 급격히 수축' },
      { id: 'n-explode', label: '초신성 폭발' },
      { id: 'n-heavy', label: '철보다 무거운 원소 생성' },
      { id: 'n-eject', label: '별에서 생성된 원소가 우주 공간으로 방출' },
      { id: 'n-recycle', label: '방출된 원소가 새로운 별과 행성의 재료가 됨' },
    ],
    answer: ANSWERS.nova,
    wrongMsg: FEEDBACK.nova,
    okMsg: '관측 기록이 복구되었습니다!',
    onCorrect(root) {
      root.classList.add('nova-flash');
      gainItem('nova-mark');
      markSolved('r2-nova');
      root.appendChild(successBox('💥 초신성 폭발 영상 재생!', [
        '초신성 폭발 과정에서 철보다 무거운 원소가 만들어집니다.',
        '(특정 원소 이름을 외울 필요는 없습니다 — 「철보다 무거운 원소」라는 개념이 핵심입니다.)',
        '별에서 방출된 원소는 새로운 별과 행성, 그리고 생명체의 재료가 됩니다.',
        '출구의 복합 자물쇠가 활성화되었다!',
      ], '💥'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 초신성 관측 기록 복구', sub: '초신성 관측 장치', body: puzzle, hintId: 'r2-nova' });
}

function openR2Door() {
  if (!isSolved('r2-nova')) {
    infoModal('출구 · 핵융합 반응기형 복합 자물쇠 (비활성)', null, `
      <p>🔒 네 개의 장치가 달린 복합 자물쇠다. 아직 전원이 들어오지 않는다.</p>
      <p class="puzzle-note">이 방의 장치들(투영 장치 → 반응기 → 별 분석기 → 초신성 기록)을 모두 복구해야 한다.</p>`);
    return;
  }
  const elemOpts = [
    { id: 'el-h', label: '수소' }, { id: 'el-he', label: '헬륨' }, { id: 'el-c', label: '탄소' },
    { id: 'el-o', label: '산소' }, { id: 'el-fe', label: '철' }, { id: 'el-heavy', label: '철보다 무거운 원소' },
  ];
  const digitOpts = Array.from({ length: 10 }, (_, i) => ({ id: 'd' + i, label: String(i) }));
  const dial = buildCycler({ label: '장치 ① 숫자 다이얼 — 헬륨 원자핵 1개에 필요한 수소 원자핵 수', options: digitOpts, num: true });
  const small = buildCycler({ label: '장치 ② 작은 별 — 태양과 비슷한 별의 최종 원소', options: elemOpts });
  const big = buildCycler({ label: '장치 ③ 큰 별 — 태양보다 훨씬 큰 별의 최종 원소', options: elemOpts });
  const slot = buildCycler({ label: '장치 ④ 초신성 카드 슬롯 — 폭발 과정에서 만들어지는 원소', options: elemOpts });
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">핵융합 반응기형 <strong>복합 자물쇠</strong>. 네 장치를 모두 올바르게 설정해야 문이 열린다.</div>
    <div class="cycler-row"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">🔓 자물쇠 해제 시도</button></div>
  </div>`);
  const row = $('.cycler-row', root);
  [dial, small, big, slot].forEach(c => row.appendChild(c.root));
  const fb = $('.feedback', root);
  $('[data-act=check]', root).addEventListener('click', () => {
    const a = ANSWERS.r2lock;
    if (dial.get() !== 'd' + a.dial) { recordWrong(FEEDBACK.fusion, fb); return; }
    if (small.get() !== a.small || big.get() !== a.big) { recordWrong(FEEDBACK.starmass, fb); return; }
    if (slot.get() !== a.slot) { recordWrong(FEEDBACK.novaSlot, fb); return; }
    showOk(fb, '복합 자물쇠 해제! 문이 열립니다.');
    Sound.unlock();
    lockPuzzle(root);
    markSolved('r2-door');
    setTimeout(() => roomClearSequence(2), 700);
  });
  openModal({ title: '출구 · 핵융합 반응기형 복합 자물쇠', sub: '방 2 최종 잠금장치', body: root, hintId: 'r2-door' });
}

/* ============================================================
   방 3 — 지구시스템 관제실
   ============================================================ */

function sphereIconHTML(name) {
  return `<span class="cyc-icon" style="width:34px;height:34px;color:var(--accent)" aria-hidden="true">${ICONS[name]}</span>`;
}

function openGlobe() {
  if (isSolved('r3-spheres')) {
    infoModal('투명한 작은 지구 모형 (복구됨)', '퍼즐 완료', `
      <p>지구 모형의 네 권역이 서로 다른 빛으로 표시되고 있다.</p>
      <div class="clear-summary"><p>기권(공기) · 수권(물) · 지권(암석·토양·지구 내부) · 생물권(생명체)</p></div>`);
    return;
  }
  const puzzle = buildAssignPuzzle({
    prompt: '투명한 지구 모형의 <strong>네 권역 분류 패널</strong>이 초기화되었다.<br>각 요소 카드를 알맞은 권역에 배치하세요.',
    bins: [
      { id: 'sp-atm', label: '기권', html: sphereIconHTML('cloud') },
      { id: 'sp-hydro', label: '수권', html: sphereIconHTML('droplet') },
      { id: 'sp-geo', label: '지권', html: sphereIconHTML('rock') },
      { id: 'sp-bio', label: '생물권', html: sphereIconHTML('leaf') },
    ],
    cards: [
      { id: 'e-air', label: '공기' },
      { id: 'e-sea', label: '바닷물' },
      { id: 'e-river', label: '강물' },
      { id: 'e-ground', label: '지하수' },
      { id: 'e-glacier', label: '빙하' },
      { id: 'e-rock', label: '암석' },
      { id: 'e-soil', label: '토양' },
      { id: 'e-interior', label: '지구 내부' },
      { id: 'e-life', label: '지구에 사는 생명체' },
    ],
    answer: ANSWERS.spheres,
    wrong: FEEDBACK.spheres,
    okMsg: '네 권역이 올바르게 분류되었습니다!',
    onCorrect(root) {
      ['icon-cloud', 'icon-drop', 'icon-rock', 'icon-leaf'].forEach(id => gainItem(id));
      markSolved('r3-spheres');
      root.appendChild(successBox('권역 아이콘 획득!', [
        '구름(기권) · 물방울(수권) · 암석(지권) · 잎(생물권) 아이콘을 획득했다.',
        '에너지원 배전판의 전원이 켜졌다!',
      ], '🌍'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 작은 지구의 네 권역', sub: '투명한 지구 모형', body: puzzle, hintId: 'r3-spheres' });
}

function openPanel() {
  if (!isSolved('r3-spheres')) {
    infoModal('에너지원 배전판 (비활성)', null, `
      <p>🔒 세 개의 에너지 플러그가 뽑힌 배전판이다. 전원이 들어오지 않는다.</p>
      <p class="puzzle-note">먼저 지구 모형의 네 권역을 분류해야 한다.</p>`);
    return;
  }
  if (isSolved('r3-energy')) {
    infoModal('에너지원 배전판 (연결 완료)', '퍼즐 완료', `
      <div class="clear-summary">
        <p>· 태양 에너지 → 대기와 물의 순환, 기상 현상, 광합성, 생명활동</p>
        <p>· 지구 내부 에너지 → 판의 이동, 지진, 화산 활동, 지각 변동</p>
        <p>· 조력 에너지 → 밀물과 썰물, 해수면 높이 변화</p>
      </div>`);
    return;
  }
  const puzzle = buildAssignPuzzle({
    prompt: '지구시스템의 <strong>세 에너지원 플러그</strong>에 알맞은 현상 카드를 모두 연결하세요.',
    bins: [
      { id: 'en-sun', label: '☀ 태양 에너지', desc: '지구시스템 에너지원 중 가장 많은 양' },
      { id: 'en-internal', label: '🔥 지구 내부 에너지', desc: '지구 내부에서 공급' },
      { id: 'en-tide', label: '🌗 조력 에너지', desc: '달·태양의 인력에 의해 발생' },
    ],
    cards: [
      { id: 'ph-circulation', label: '대기와 물의 순환' },
      { id: 'ph-weather', label: '기상 현상' },
      { id: 'ph-photo', label: '광합성' },
      { id: 'ph-lifeact', label: '생명활동' },
      { id: 'ph-plate', label: '판의 이동' },
      { id: 'ph-quake', label: '지진' },
      { id: 'ph-volcano', label: '화산 활동' },
      { id: 'ph-crust', label: '지각 변동' },
      { id: 'ph-tide', label: '밀물과 썰물' },
      { id: 'ph-sealevel', label: '해수면 높이 변화' },
    ],
    answer: ANSWERS.energy,
    wrong: FEEDBACK.energy,
    okMsg: '세 에너지원이 모두 연결되었습니다!',
    onCorrect(root) {
      markSolved('r3-energy');
      root.appendChild(successBox('배전판 연결 완료', [
        '물 순환 펌프와 탄소 이동 캡슐에 전력이 공급되기 시작했다!',
      ], '🔌'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 에너지원 배전판', sub: '지구시스템의 세 에너지원', body: puzzle, hintId: 'r3-energy' });
}

function openPump() {
  if (!isSolved('r3-energy')) {
    infoModal('물 순환 펌프 (전력 없음)', null, `
      <p>🔒 펌프에 전력이 공급되지 않는다.</p>
      <p class="puzzle-note">에너지원 배전판을 먼저 연결해야 한다.</p>`);
    return;
  }
  if (isSolved('r3-water')) {
    infoModal('물 순환 펌프 (가동 중)', '퍼즐 완료', `
      <div class="orbit-box" aria-hidden="true"><div class="orbit-earth"></div><div class="orbit-drop"></div></div>
      <div class="clear-summary"><p>바다와 지표의 물 → 태양 에너지 흡수 → 증발 → 수증기 → 응결 → 구름 → 강수 → 하천수·지하수 → 바다</p></div>`);
    return;
  }
  const puzzle = buildOrderPuzzle({
    prompt: '물이 지구시스템의 권역 사이를 순환하는 과정을 <strong>순서대로</strong> 연결하세요.',
    fixedFirst: '바다와 지표의 물',
    cards: [
      { id: 'w-sun', label: '태양 에너지 흡수' },
      { id: 'w-evap', label: '증발' },
      { id: 'w-vapor', label: '기권의 수증기' },
      { id: 'w-condense', label: '응결' },
      { id: 'w-cloud', label: '구름' },
      { id: 'w-rain', label: '강수' },
      { id: 'w-riverground', label: '하천수와 지하수' },
      { id: 'w-tosea', label: '바다로 이동' },
    ],
    answer: ANSWERS.water,
    wrongMsg: FEEDBACK.water,
    okMsg: '물의 순환이 완성되었습니다!',
    onCorrect(root) {
      markSolved('r3-water');
      root.appendChild(el('<div class="orbit-box" aria-hidden="true"><div class="orbit-earth"></div><div class="orbit-drop"></div></div>'));
      root.appendChild(successBox('물방울이 지구 모형 안을 순환합니다!', [
        '물질은 지구시스템의 권역 사이를 순환합니다.',
        '이 과정에는 에너지의 흐름이 필요합니다.',
        '물의 순환은 날씨와 지표의 변화에 영향을 줍니다.',
        '탄소 이동 캡슐이 활성화되었다!',
      ], '💧'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 물 순환 펌프', sub: '권역 사이를 순환하는 물', body: puzzle, hintId: 'r3-water' });
}

function openCapsule() {
  if (!isSolved('r3-water')) {
    infoModal('탄소 이동 캡슐 (대기 중)', null, `
      <p>🔒 탄소 캡슐이 출발 준비가 되지 않았다.</p>
      <p class="puzzle-note">물 순환 펌프를 먼저 가동해야 한다.</p>`);
    return;
  }
  if (isSolved('r3-carbon')) {
    infoModal('탄소 이동 캡슐 (기록 완료)', '퍼즐 완료', `
      <div class="clear-summary"><p>캡슐이 지나간 권역의 순서:<br>
      <strong style="font-size:1.15em">기권 → 생물권 → 지권 → 기권</strong></p></div>
      <p class="puzzle-note">이 순서가 출구 아이콘 자물쇠의 암호다.</p>`);
    return;
  }
  const puzzle = buildOrderPuzzle({
    prompt: '탄소 캡슐이 이동할 경로를 <strong>순서대로</strong> 완성하세요. 출발점은 「기권의 이산화 탄소」다.',
    fixedFirst: '기권의 이산화 탄소',
    cards: [
      { id: 'c-photo', label: '광합성' },
      { id: 'c-organic', label: '생물권의 유기물' },
      { id: 'c-buried', label: '생물의 사체가 묻힘' },
      { id: 'c-fossil', label: '지권의 화석 연료' },
      { id: 'c-burn', label: '연소' },
      { id: 'c-back', label: '다시 기권의 이산화 탄소' },
    ],
    answer: ANSWERS.carbon,
    wrongMsg: FEEDBACK.carbon,
    okMsg: '탄소 캡슐이 경로를 따라 이동합니다!',
    onCorrect(root) {
      markSolved('r3-carbon');
      root.appendChild(successBox('캡슐 이동 기록 저장', [
        `캡슐이 지나간 권역의 순서: ${ANSWERS.carbonPath.join(' → ')}`,
        '탄소처럼 물질은 권역 사이를 이동하며 순환합니다.',
        '출구의 권역 아이콘 자물쇠가 활성화되었다!',
      ], '🧪'));
      root.appendChild(el(`<div class="clear-summary"><p>💡 보조 단서: 기권의 이산화 탄소는 해수에 녹아
        <strong>수권</strong>으로 이동하기도 한다. (기권 → 수권)</p></div>`));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 탄소 이동 캡슐', sub: '권역 사이를 이동하는 탄소', body: puzzle, hintId: 'r3-carbon' });
}

function openPoster() {
  infoModal('권역 안내 벽보', null, `
    <p>지구시스템의 네 권역을 소개하는 벽보다.</p>
    <div class="clear-summary">
      <p>· 기권 — 지구를 둘러싼 공기의 층</p>
      <p>· 수권 — 바닷물, 강물, 지하수, 빙하 등 지구의 물</p>
      <p>· 지권 — 암석과 토양, 지구 내부</p>
      <p>· 생물권 — 지구에 사는 모든 생명체</p>
    </div>
    <p class="puzzle-note">한쪽 구석의 메모: “물에 녹는 기체도 있다. 기권의 이산화 탄소는 해수에 용해되어 수권으로 이동하기도 한다.”</p>`);
}

function openDesk() {
  infoModal('관제 데스크', null, `
    <p>관제 일지가 펼쳐져 있다.</p>
    <div class="clear-summary"><p>“출구 자물쇠는 <strong>탄소 캡슐이 지나간 권역의 순서</strong>대로
    권역 아이콘을 맞춰야 열린다. 캡슐 기록을 꼭 확인할 것!”</p></div>`);
}

function openR3Door() {
  if (!isSolved('r3-carbon')) {
    infoModal('출구 · 권역 아이콘 자물쇠 (비활성)', null, `
      <p>🔒 네 칸의 회전식 아이콘 자물쇠다. 아직 전원이 들어오지 않는다.</p>
      <p class="puzzle-note">지구 모형 → 배전판 → 물 순환 펌프 → 탄소 캡슐을 모두 복구해야 한다.</p>`);
    return;
  }
  const iconOpts = [
    { id: 'ic-cloud', label: '구름', html: ICONS.cloud },
    { id: 'ic-drop', label: '물방울', html: ICONS.droplet },
    { id: 'ic-rock', label: '암석', html: ICONS.rock },
    { id: 'ic-leaf', label: '잎', html: ICONS.leaf },
  ];
  const dials = ANSWERS.r3lock.map((_, i) =>
    buildCycler({ label: `${i + 1}번째 칸`, options: iconOpts, startIndex: (i + 1) % 4 }));
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">4칸 <strong>권역 아이콘 회전식 자물쇠</strong>.<br>
    “탄소 캡슐이 이동한 권역의 순서대로 아이콘을 설정하라.”</div>
    <div class="cycler-row"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">🔓 자물쇠 해제 시도</button></div>
  </div>`);
  const row = $('.cycler-row', root);
  dials.forEach(d => row.appendChild(d.root));
  const fb = $('.feedback', root);
  $('[data-act=check]', root).addEventListener('click', () => {
    const ok = dials.every((d, i) => d.get() === ANSWERS.r3lock[i]);
    if (ok) {
      showOk(fb, '아이콘 자물쇠 해제! 문이 열립니다.');
      Sound.unlock();
      lockPuzzle(root);
      markSolved('r3-door');
      setTimeout(() => roomClearSequence(3), 700);
    } else {
      recordWrong(FEEDBACK.r3lock, fb);
    }
  });
  openModal({ title: '출구 · 권역 아이콘 자물쇠', sub: '방 3 최종 잠금장치', body: root, hintId: 'r3-door' });
}

/* ============================================================
   방 4 — 판 구조 제어실
   ============================================================ */

function earthCrossSVG() {
  return `<svg viewBox="0 0 420 200" style="width:100%;max-width:460px;display:block;margin:0 auto 0.6rem" role="img"
    aria-label="지구 단면: 맨 위 얇은 층(㉠), 그 아래 단단한 층(㉡), 두 층을 묶은 판(㉢), 그 아래 유동성 있는 층(㉣)">
    <rect x="10" y="20" width="330" height="16" fill="#8a5a3b"/>
    <rect x="10" y="36" width="330" height="30" fill="#a34e2c"/>
    <rect x="10" y="66" width="330" height="60" fill="#d97a2f"/>
    <rect x="10" y="126" width="330" height="60" fill="#b3431f"/>
    <path d="M60 96c30-18 60 18 90 0s60 18 90 0s50 14 80 0" fill="none" stroke="#ffd97a" stroke-width="2.5" stroke-dasharray="6 5" opacity="0.9"/>
    <line x1="340" y1="20" x2="368" y2="20" stroke="#e9f2ff"/><line x1="340" y1="36" x2="368" y2="36" stroke="#e9f2ff"/>
    <text x="374" y="33" fill="#e9f2ff" font-size="14">㉠</text>
    <line x1="340" y1="66" x2="368" y2="52" stroke="#e9f2ff"/>
    <text x="374" y="57" fill="#e9f2ff" font-size="14">㉡</text>
    <path d="M348 20v46" stroke="#52d8ff" stroke-width="3"/>
    <text x="374" y="85" fill="#52d8ff" font-size="14">㉢ (㉠+㉡)</text>
    <line x1="340" y1="96" x2="368" y2="108" stroke="#ffd97a"/>
    <text x="374" y="113" fill="#ffd97a" font-size="14">㉣</text>
  </svg>`;
}

function openCross() {
  if (isSolved('r4-layers')) {
    infoModal('지구 단면 조립판 (복구됨)', '퍼즐 완료', `
      ${earthCrossSVG()}
      <div class="clear-summary"><p>㉠ 지각 · ㉡ 상부 맨틀의 일부 · ㉢ 암석권(㉠+㉡) · ㉣ 연약권(유동성 있음)</p></div>
      <p>연약권에서 맨틀 대류가 일어나며 판을 움직입니다.</p>`);
    return;
  }
  const puzzle = buildAssignPuzzle({
    prompt: `${earthCrossSVG()}지구 단면의 각 위치(㉠~㉣)에 알맞은 이름표를 배치하세요.<br>
      <span class="puzzle-note">㉢은 ㉠과 ㉡을 합친 "단단한 판 전체"를 가리킵니다.</span>`,
    bins: [
      { id: 'ly-top', label: '㉠ 가장 바깥의 얇은 층', cap: 1 },
      { id: 'ly-under', label: '㉡ ㉠ 바로 아래의 단단한 부분', cap: 1 },
      { id: 'ly-band', label: '㉢ ㉠+㉡을 합친 단단한 판 전체', cap: 1 },
      { id: 'ly-flow', label: '㉣ ㉢ 아래의 유동성이 있는 층', cap: 1 },
    ],
    cards: [
      { id: 'lb-crust', label: '지각' },
      { id: 'lb-umantle', label: '상부 맨틀의 일부' },
      { id: 'lb-litho', label: '암석권' },
      { id: 'lb-astheno', label: '연약권' },
    ],
    answer: ANSWERS.layers,
    wrong(loc) {
      if (loc['lb-litho'] === 'ly-top' || loc['lb-litho'] === 'ly-under') {
        return '암석권을 하나의 층에만 놓았습니다. ' + FEEDBACK.layers;
      }
      return FEEDBACK.layers;
    },
    okMsg: '암석권과 연약권이 올바르게 복구되었습니다!',
    onCorrect(root) {
      markSolved('r4-layers');
      root.appendChild(successBox('맨틀 대류 시작!', [
        '연약권에서 맨틀 대류 애니메이션이 시작되었다. (노란 점선 흐름)',
        '맨틀 대류는 판을 움직이는 원동력이다.',
        '판 운동 방향 조절기의 전원이 켜졌다!',
      ], '🌋'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 암석권과 연약권 복구', sub: '지구 단면 조립판', body: puzzle, hintId: 'r4-layers' });
}

function openGenerator() {
  if (!isSolved('r4-layers')) {
    infoModal('맨틀 대류 발전기 (정지)', null, `
      <p>연약권 회로가 복구되지 않아 대류가 멈춰 있다.</p>
      <p class="puzzle-note">지구 단면 조립판에서 암석권과 연약권을 먼저 복구하자.</p>`);
    return;
  }
  infoModal('맨틀 대류 발전기 (가동 중)', null, `
    <p>연약권의 대류가 발전기를 돌리고 있다.</p>
    <div class="clear-summary"><p>지구 내부 에너지에 의한 <strong>맨틀 대류</strong>가 그 위에 놓인
    <strong>암석권(판)</strong>을 조금씩 움직인다. 판의 이동 방향에 따라 경계의 종류가 달라진다.</p></div>`);
}

function openController() {
  if (!isSolved('r4-layers')) {
    infoModal('판 운동 방향 조절기 (비활성)', null, `
      <p>🔒 조절기에 전원이 들어오지 않는다.</p>
      <p class="puzzle-note">지구 단면 조립판을 먼저 복구해야 한다.</p>`);
    return;
  }
  if (isSolved('r4-motion')) {
    infoModal('판 운동 방향 조절기 (설정 완료)', '퍼즐 완료', `
      <div class="clear-summary">
        <p>· 발산형 경계: ← → 서로 멀어짐 (새로운 지각 생성)</p>
        <p>· 보존형 경계: 서로 어긋남 (생성·소멸 없음)</p>
        <p>· 수렴형 경계: → ← 서로 가까워짐 (충돌·섭입)</p>
      </div>`);
    return;
  }
  const motionOpts = [
    { id: 'mv-apart', html: '<span class="seg-arrows">←&emsp;→</span>두 판이 서로 멀어짐' },
    { id: 'mv-toward', html: '<span class="seg-arrows">→&emsp;←</span>두 판이 서로 가까워짐' },
    { id: 'mv-slide', html: '<span class="seg-arrows">⇅</span>두 판이 서로 어긋나게 이동' },
  ];
  const segs = [
    { id: 'bd-div', title: '발산형 경계', desc: '새로운 지각이 생성되는 경계' },
    { id: 'bd-cons', title: '보존형 경계', desc: '판이 생성되거나 소멸하지 않는 경계' },
    { id: 'bd-conv', title: '수렴형 경계', desc: '판과 판이 충돌하거나 한 판이 다른 판 아래로 섭입하는 경계' },
  ].map(s => ({ ...s, ctl: buildSegGroup({ title: s.title, desc: s.desc, options: motionOpts }) }));
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">세 장치에 <strong>판의 상대적인 이동 방향</strong>을 설정하세요.</div>
    <div class="segs"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">설정 확인</button></div>
  </div>`);
  const box = $('.segs', root);
  segs.forEach(s => box.appendChild(s.ctl.root));
  const fb = $('.feedback', root);
  $('[data-act=check]', root).addEventListener('click', () => {
    if (segs.some(s => !s.ctl.get())) { toast('세 경계의 이동 방향을 모두 선택하세요.'); return; }
    const ok = segs.every(s => s.ctl.get() === ANSWERS.motion[s.id]);
    if (ok) {
      showOk(fb, '세 경계의 이동 방향이 올바르게 설정되었습니다!');
      lockPuzzle(root);
      gainItem('magnets');
      markSolved('r4-motion');
      root.appendChild(successBox('지형 자석 보관함 열림!', [
        '해령·열곡대·변환 단층·해구·호상열도·습곡 산맥 모양의 지형 자석 세트를 획득했다.',
      ], '🧲'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    } else {
      recordWrong(FEEDBACK.motion, fb);
    }
  });
  openModal({ title: '퍼즐 · 판 운동 방향 조절기', sub: '세 가지 판 경계', body: root, hintId: 'r4-motion' });
}

function openMagnetBox() {
  if (!isSolved('r4-motion')) {
    infoModal('지형 자석 보관함 (잠김)', null, `
      <p>🔒 보관함이 잠겨 있다. “판 운동 방향 조절기 설정 완료 시 해제”라고 적혀 있다.</p>`);
    return;
  }
  if (isSolved('r4-landform')) {
    infoModal('판 경계 모형 (완성)', '퍼즐 완료', `
      <div class="clear-summary">
        <p>· 발산형: 해령, 열곡대</p>
        <p>· 보존형: 변환 단층</p>
        <p>· 수렴형: 해구, 호상열도, 습곡 산맥</p>
      </div>`);
    return;
  }
  const puzzle = buildAssignPuzzle({
    prompt: '지형 자석을 알맞은 <strong>판 경계 모형</strong>에 배치하세요.',
    bins: [
      { id: 'lf-div', label: '발산형 경계', desc: '← → 서로 멀어짐' },
      { id: 'lf-cons', label: '보존형 경계', desc: '서로 어긋남' },
      { id: 'lf-conv', label: '수렴형 경계', desc: '→ ← 서로 가까워짐' },
    ],
    cards: [
      { id: 'tf-ridge', label: '해령' },
      { id: 'tf-rift', label: '열곡대' },
      { id: 'tf-transform', label: '변환 단층' },
      { id: 'tf-trench', label: '해구' },
      { id: 'tf-arc', label: '호상열도' },
      { id: 'tf-fold', label: '습곡 산맥' },
    ],
    answer: ANSWERS.landform,
    wrong: FEEDBACK.landform,
    okMsg: '모든 지형이 알맞은 경계에 배치되었습니다!',
    onCorrect(root) {
      markSolved('r4-landform');
      root.appendChild(successBox('지진·화산 분포 지도에 불이 들어왔다!', [
        '실제 지역 예 — 동아프리카 열곡대·대서양 중앙 해령(발산형), 산안드레아스 단층(보존형),',
        '안데스산맥(해양판–대륙판 수렴), 일본 열도(섭입에 의한 호상열도), 히말라야산맥(대륙판끼리 충돌).',
      ], '🗺️'));
      root.appendChild(contBtn('닫기', () => closeModal(), true));
    },
  });
  openModal({ title: '퍼즐 · 경계와 지형 매칭', sub: '지형 자석 배치', body: puzzle, hintId: 'r4-landform' });
}

/* --- 지진·화산 분포 지도 --- */
function quakeMapSVG() {
  // 시드 고정 의사난수 (항상 같은 지도)
  let seed = 42;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const quake = (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#ff6b6b" opacity="0.9"/>`;
  const volcano = (x, y) => `<path d="M${(x - 4).toFixed(1)} ${(y + 3.5).toFixed(1)} l4 -7 l4 7 z" fill="#ffab52"/>`;
  let dots = '';
  // 띠 1 (세로, 발산형): x≈120
  for (let i = 0; i < 26; i++) {
    const y = 40 + i * 10 + rnd() * 6;
    dots += quake(112 + rnd() * 20, y);
    if (i % 4 === 1) dots += volcano(114 + rnd() * 14, y + 3);
  }
  // 띠 2 (사선, 보존형): (262,60) → (338,278) — 지진만 활발
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    dots += quake(262 + t * 76 + (rnd() - 0.5) * 16, 60 + t * 218 + (rnd() - 0.5) * 12);
  }
  // 띠 3 (가로, 수렴형): y≈258
  for (let i = 0; i < 24; i++) {
    const x = 392 + i * 7 + rnd() * 4;
    dots += quake(x, 250 + rnd() * 18);
    if (i % 4 === 2) dots += volcano(x, 252 + rnd() * 10);
  }
  // 흩어진 잡음
  const noise = [[60, 60], [200, 40], [430, 60], [520, 120], [40, 200], [210, 300], [560, 40], [480, 170], [70, 300], [350, 30]];
  noise.forEach(([x, y]) => { dots += quake(x + rnd() * 10, y + rnd() * 10); });
  return `<svg viewBox="0 0 600 340" role="img" aria-label="지진(붉은 점)과 화산(주황 삼각형) 분포 지도. 세 곳에 점이 띠 모양으로 밀집해 있다.">
    <rect width="600" height="340" fill="#0a1a2e"/>
    <g fill="#14314f">
      <path d="M30 40 Q120 10 190 55 T90 150 Q30 120 30 40Z"/>
      <path d="M240 30 Q380 20 430 90 Q470 160 380 200 Q290 230 250 150 Q220 80 240 30Z"/>
      <path d="M60 230 Q160 210 210 260 Q240 310 140 320 Q50 310 60 230Z"/>
      <path d="M440 210 Q560 190 570 260 Q560 320 470 310 Q420 270 440 210Z"/>
    </g>
    <g class="belt-line" stroke="#ffd97a" stroke-width="3" stroke-dasharray="9 6" fill="none">
      <path d="M122 40 V300"/>
      <path d="M262 60 L338 278"/>
      <path d="M392 258 H560"/>
    </g>
    ${dots}
  </svg>`;
}

function openMap() {
  if (!isSolved('r4-landform')) {
    infoModal('지진·화산 분포 지도 (꺼짐)', null, `
      <p>🔒 지도 화면이 꺼져 있다.</p>
      <p class="puzzle-note">지형 자석 배치를 먼저 완료해야 한다.</p>`);
    return;
  }
  if (isSolved('r4-map')) {
    infoModal('지진·화산 분포 지도 (분석 완료)', '퍼즐 완료', `
      <div class="mapwrap belts-shown">${quakeMapSVG()}</div>
      <div class="clear-summary"><p>지진대와 화산대는 띠 모양으로 분포하며 <strong>판의 경계와 대체로 일치</strong>한다.
      보존형 경계에서는 지진은 활발하지만 화산 활동은 거의 나타나지 않는다.</p></div>`);
    return;
  }
  const zones = [
    { id: 'z1', l: 13, t: 8, w: 15, h: 82 },
    { id: 'z2', l: 66, t: 6, w: 28, h: 24 },
    { id: 'z3', l: 40, t: 12, w: 20, h: 74 },
    { id: 'z4', l: 2, t: 60, w: 10, h: 30 },
    { id: 'z5', l: 63, t: 62, w: 31, h: 28 },
    { id: 'z6', l: 30, t: 8, w: 8, h: 30 },
  ];
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">지도에 지진(<span class="lg-quake" aria-hidden="true"></span>붉은 점)과
    화산(<span class="lg-volcano" aria-hidden="true"></span>주황 삼각형)의 발생 위치가 표시되어 있다.<br>
    지진과 화산이 <strong>띠 모양으로 밀집된 구역</strong>을 모두 선택하여 숨겨진 판 경계를 찾으세요.</div>
    <div class="mapwrap">${quakeMapSVG()}</div>
    <div class="map-legend"><span><span class="lg-quake"></span>지진</span><span><span class="lg-volcano"></span>화산</span></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">경계 확인</button></div>
  </div>`);
  const wrap = $('.mapwrap', root);
  const selected = new Set();
  zones.forEach((z, i) => {
    const b = el(`<button type="button" class="map-zone" data-zone="${z.id}" aria-pressed="false"
      style="left:${z.l}%;top:${z.t}%;width:${z.w}%;height:${z.h}%">${String.fromCharCode(65 + i)}</button>`);
    b.addEventListener('click', () => {
      Sound.click();
      if (selected.has(z.id)) selected.delete(z.id); else selected.add(z.id);
      b.classList.toggle('on', selected.has(z.id));
      b.setAttribute('aria-pressed', selected.has(z.id) ? 'true' : 'false');
    });
    wrap.appendChild(b);
  });
  const fb = $('.feedback', root);
  $('[data-act=check]', root).addEventListener('click', () => {
    if (!selected.size) { toast('구역을 먼저 선택하세요.'); return; }
    const want = ANSWERS.mapZones.slice().sort().join(',');
    const got = Array.from(selected).sort().join(',');
    if (got === want) {
      showOk(fb, '판 경계선이 지도 위에 나타납니다!');
      lockPuzzle(root);
      $$('.map-zone', wrap).forEach(z => z.disabled = true);
      wrap.classList.add('belts-shown');
      root.appendChild(el(`<div class="clear-summary">
        <p>· 지진대와 화산대는 특정 지역에 <strong>띠 모양</strong>으로 분포한다.</p>
        <p>· 지진대와 화산대는 <strong>판의 경계와 대체로 일치</strong>한다.</p>
        <p>· 모든 판 경계에서 화산 활동이 동일하게 나타나는 것은 아니다.</p>
      </div>`));
      root.appendChild(contBtn('마지막 분석 →', () => setModalBody(mapStage2()), true));
    } else {
      recordWrong(FEEDBACK.map, fb);
    }
  });
  openModal({ title: '퍼즐 · 지진·화산 분포 지도', sub: '숨겨진 판 경계 찾기', body: root, hintId: 'r4-map' });
}

function mapStage2() {
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">가운데 사선 띠 구역(C)에서는 <strong>지진은 활발하지만 화산 활동이 거의 없었다.</strong><br>
    이 구역의 판 경계는 어떤 유형일까?</div>
    <div class="seg" style="flex-direction:column"></div>
    <div class="feedback" aria-live="polite"></div>
  </div>`);
  const seg = $('.seg', root);
  const fb = $('.feedback', root);
  [
    { id: 'mq-div', label: '발산형 경계' },
    { id: 'mq-cons', label: '보존형 경계' },
    { id: 'mq-conv', label: '수렴형 경계' },
  ].forEach(o => {
    const b = el(`<button type="button" class="seg-btn" data-opt="${o.id}">${esc(o.label)}</button>`);
    seg.appendChild(b);
    b.addEventListener('click', () => {
      if (o.id === ANSWERS.mapQuiz) {
        showOk(fb, '보존형 경계에서는 지진은 활발하지만 화산 활동은 거의 나타나지 않습니다!');
        lockPuzzle(root);
        markSolved('r4-map');
        root.appendChild(successBox('지도 분석 완료', [
          '출구의 판 운동 슬라이더 자물쇠가 활성화되었다!',
        ], '🗺️'));
        root.appendChild(contBtn('닫기', () => closeModal(), true));
      } else {
        recordWrong(FEEDBACK.mapQuiz, fb);
      }
    });
  });
  return root;
}

function openSeismo() {
  infoModal('지진 기록계', null, `
    <p>오래된 지진 기록계다. 기록지 여백에 메모가 있다.</p>
    <div class="clear-summary"><p>“어떤 경계에서는 지진은 활발한데 화산은 거의 없다.
    판이 스쳐 지나가기만 하는 곳 — 판이 생성되지도, 소멸하지도 않는 곳이다.”</p></div>`);
}

function openR4Door() {
  if (!isSolved('r4-map')) {
    infoModal('출구 · 판 운동 슬라이더 자물쇠 (비활성)', null, `
      <p>🔒 3단 슬라이더 자물쇠다. 아직 전원이 들어오지 않는다.</p>
      <p class="puzzle-note">단면 조립판 → 방향 조절기 → 지형 자석 → 분포 지도를 모두 복구해야 한다.</p>`);
    return;
  }
  const sliderOpts = [
    { id: 'sl-div', html: '<span class="seg-arrows">←&emsp;→</span>발산형 경계' },
    { id: 'sl-cons', html: '<span class="seg-arrows">⇅</span>보존형 경계 (서로 어긋남)' },
    { id: 'sl-conv', html: '<span class="seg-arrows">→&emsp;←</span>수렴형 경계' },
  ];
  const segs = [
    { title: '슬라이더 ① — 판이 생성되는 경계' },
    { title: '슬라이더 ② — 판이 생성되거나 소멸하지 않는 경계' },
    { title: '슬라이더 ③ — 판이 섭입하거나 충돌하는 경계' },
  ].map(s => buildSegGroup({ title: s.title, options: sliderOpts }));
  const root = el(`<div class="puzzle">
    <div class="puzzle-prompt">3단 <strong>판 운동 슬라이더 자물쇠</strong>.<br>
    “판이 생성되는 경계, 판이 생성되거나 소멸하지 않는 경계, 판이 섭입하거나 충돌하는 경계를 차례로 설정하라.”</div>
    <div class="segs"></div>
    <div class="feedback" aria-live="polite"></div>
    <div class="puzzle-actions"><button type="button" class="btn btn-primary" data-act="check">🔓 자물쇠 해제 시도</button></div>
  </div>`);
  const box = $('.segs', root);
  segs.forEach(s => box.appendChild(s.root));
  const fb = $('.feedback', root);
  $('[data-act=check]', root).addEventListener('click', () => {
    if (segs.some(s => !s.get())) { toast('세 슬라이더를 모두 설정하세요.'); return; }
    const ok = segs.every((s, i) => s.get() === ANSWERS.r4lock[i]);
    if (ok) {
      showOk(fb, '슬라이더 자물쇠 해제! 문이 열립니다.');
      Sound.unlock();
      lockPuzzle(root);
      markSolved('r4-door');
      setTimeout(() => roomClearSequence(4), 700);
    } else {
      recordWrong(FEEDBACK.r4lock, fb);
    }
  });
  openModal({ title: '출구 · 판 운동 슬라이더 자물쇠', sub: '방 4 최종 잠금장치', body: root, hintId: 'r4-door' });
}
