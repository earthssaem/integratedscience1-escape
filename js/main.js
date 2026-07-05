'use strict';
/* ============================================================
   main.js — 방 데이터, 화면 전환, 프롤로그, 최종 탈출, 초기화
   ============================================================ */

/* ---------- 방 정의 ---------- */
const ROOMS = {
  1: {
    name: '방 1 · 초기 우주 연구소',
    theme: 'r1',
    puzzles: ['r1-spectrum', 'r1-timeline', 'r1-nucleo', 'r1-light'],
    door: 'r1-door',
    objects: [
      { id: 'spectrumDoc', name: '별의 스펙트럼 자료', icon: 'doc', x: 14, y: 22, open: openSpectrumDoc,
        status: () => state.flags.docCard ? 'done' : 'ready' },
      { id: 'prism', name: '프리즘 · 분광 분석기', icon: 'prism', x: 33, y: 44, open: openPrism,
        status: () => isSolved('r1-spectrum') ? 'done' : 'ready' },
      { id: 'drawer', name: '연구원 서랍', icon: 'drawer', x: 13, y: 74, open: openDrawer,
        status: () => !isSolved('r1-spectrum') ? 'locked' : (state.flags.drawerCard ? 'done' : 'ready') },
      { id: 'clock', name: '우주 시계', icon: 'clock', x: 52, y: 16, open: openClock,
        status: () => isSolved('r1-timeline') ? 'done' : 'ready' },
      { id: 'board', name: '사건 기록 게시판', icon: 'board', x: 68, y: 40, open: openBoard,
        status: () => isSolved('r1-timeline') ? 'done' : 'ready' },
      { id: 'scale', name: '수소·헬륨 질량 저울', icon: 'scale', x: 36, y: 78, open: openScale,
        status: () => !isSolved('r1-timeline') ? 'locked' : (isSolved('r1-nucleo') ? 'done' : 'ready') },
      { id: 'cmb', name: '우주 배경 복사 관측 화면', icon: 'monitor', x: 60, y: 72, open: openCMB,
        status: () => !isSolved('r1-nucleo') ? 'locked' : (isSolved('r1-light') ? 'done' : 'ready') },
      { id: 'door', name: '출구 · 숫자 패드락', icon: 'door', x: 88, y: 44, door: true, open: openR1Door,
        status: () => isSolved('r1-light') ? 'ready' : 'locked' },
    ],
  },
  2: {
    name: '방 2 · 별의 원소 생성실',
    theme: 'r2',
    puzzles: ['r2-film', 'r2-fusion', 'r2-starmass', 'r2-nova'],
    door: 'r2-door',
    objects: [
      { id: 'projector', name: '성운 투영 장치', icon: 'film', x: 18, y: 32, open: openProjector,
        status: () => isSolved('r2-film') ? 'done' : 'ready' },
      { id: 'protostar', name: '원시별 모형', icon: 'star', x: 42, y: 18, open: openProtostar,
        status: () => state.flags.protoPieces ? 'done' : 'ready' },
      { id: 'archive', name: '관측 기록 보관함', icon: 'archive', x: 14, y: 72, open: openArchive,
        status: () => state.flags.archPieces ? 'done' : 'ready' },
      { id: 'reactor', name: '수소 핵융합 반응기', icon: 'reactor', x: 44, y: 60, open: openReactor,
        status: () => !isSolved('r2-film') ? (state.flags.reactorPieces ? 'locked' : 'ready') : (isSolved('r2-fusion') ? 'done' : 'ready') },
      { id: 'stars', name: '별 내부 분석기 (별 2개)', icon: 'nova', x: 68, y: 26, open: openStars,
        status: () => !isSolved('r2-fusion') ? 'locked' : (isSolved('r2-starmass') ? 'done' : 'ready') },
      { id: 'nova', name: '초신성 관측 장치', icon: 'seismo', x: 68, y: 70, open: openNova,
        status: () => !isSolved('r2-starmass') ? 'locked' : (isSolved('r2-nova') ? 'done' : 'ready') },
      { id: 'door', name: '출구 · 복합 자물쇠', icon: 'door', x: 89, y: 48, door: true, open: openR2Door,
        status: () => isSolved('r2-nova') ? 'ready' : 'locked' },
    ],
  },
  3: {
    name: '방 3 · 지구시스템 관제실',
    theme: 'r3',
    puzzles: ['r3-spheres', 'r3-energy', 'r3-water', 'r3-carbon'],
    door: 'r3-door',
    objects: [
      { id: 'poster', name: '권역 안내 벽보', icon: 'poster', x: 12, y: 24, open: openPoster, status: () => 'ready' },
      { id: 'globe', name: '투명한 작은 지구 모형', icon: 'globe', x: 32, y: 44, open: openGlobe,
        status: () => isSolved('r3-spheres') ? 'done' : 'ready' },
      { id: 'panel', name: '에너지원 배전판', icon: 'plug', x: 58, y: 20, open: openPanel,
        status: () => !isSolved('r3-spheres') ? 'locked' : (isSolved('r3-energy') ? 'done' : 'ready') },
      { id: 'pump', name: '물 순환 펌프', icon: 'droplet', x: 56, y: 68, open: openPump,
        status: () => !isSolved('r3-energy') ? 'locked' : (isSolved('r3-water') ? 'done' : 'ready') },
      { id: 'capsule', name: '탄소 이동 캡슐', icon: 'capsule', x: 76, y: 46, open: openCapsule,
        status: () => !isSolved('r3-water') ? 'locked' : (isSolved('r3-carbon') ? 'done' : 'ready') },
      { id: 'desk', name: '관제 데스크', icon: 'desk', x: 16, y: 72, open: openDesk, status: () => 'ready' },
      { id: 'door', name: '출구 · 아이콘 자물쇠', icon: 'door', x: 90, y: 74, door: true, open: openR3Door,
        status: () => isSolved('r3-carbon') ? 'ready' : 'locked' },
    ],
  },
  4: {
    name: '방 4 · 판 구조 제어실',
    theme: 'r4',
    puzzles: ['r4-layers', 'r4-motion', 'r4-landform', 'r4-map'],
    door: 'r4-door',
    objects: [
      { id: 'cross', name: '지구 단면 조립판', icon: 'layers', x: 24, y: 34, open: openCross,
        status: () => isSolved('r4-layers') ? 'done' : 'ready' },
      { id: 'generator', name: '맨틀 대류 발전기', icon: 'gear', x: 18, y: 74, open: openGenerator,
        status: () => isSolved('r4-layers') ? 'done' : 'ready' },
      { id: 'controller', name: '판 운동 방향 조절기', icon: 'sliders', x: 46, y: 24, open: openController,
        status: () => !isSolved('r4-layers') ? 'locked' : (isSolved('r4-motion') ? 'done' : 'ready') },
      { id: 'magnetBox', name: '지형 자석 보관함', icon: 'magnet', x: 48, y: 68, open: openMagnetBox,
        status: () => !isSolved('r4-motion') ? 'locked' : (isSolved('r4-landform') ? 'done' : 'ready') },
      { id: 'map', name: '지진·화산 분포 지도', icon: 'map', x: 70, y: 42, open: openMap,
        status: () => !isSolved('r4-landform') ? 'locked' : (isSolved('r4-map') ? 'done' : 'ready') },
      { id: 'seismo', name: '지진 기록계', icon: 'seismo', x: 76, y: 14, open: openSeismo, status: () => 'ready' },
      { id: 'door', name: '출구 · 슬라이더 자물쇠', icon: 'door', x: 90, y: 74, door: true, open: openR4Door,
        status: () => isSolved('r4-map') ? 'ready' : 'locked' },
    ],
  },
};

/* ---------- 방 배경 아트 (인라인 SVG) ---------- */
function sceneArt(theme) {
  let seed = theme === 'r1' ? 7 : theme === 'r2' ? 13 : theme === 'r3' ? 21 : theme === 'final' ? 31 : 29;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = '';
  for (let i = 0; i < 60; i++) {
    const op = (0.2 + rnd() * 0.6).toFixed(2);
    const twinkle = (!reduceMotion && i % 4 === 0)
      ? `<animate attributeName="opacity" values="${op};0.05;${op}" dur="${(2 + rnd() * 4).toFixed(1)}s" repeatCount="indefinite"/>` : '';
    stars += `<circle cx="${(rnd() * 1200).toFixed(0)}" cy="${(rnd() * 620).toFixed(0)}" r="${(0.6 + rnd() * 1.6).toFixed(1)}" fill="#cfe9ff" opacity="${op}">${twinkle}</circle>`;
  }
  let extra = '';
  if (theme === 'r1') {
    extra = `<path d="M180 520 L260 380 L340 520 Z" fill="none" stroke="rgba(120,200,255,0.3)" stroke-width="2"/>
      <path d="M265 400 L640 300 M265 408 L650 340 M265 416 L655 380" stroke="rgba(120,220,255,0.18)" stroke-width="8"/>
      <rect x="820" y="120" width="260" height="90" rx="8" fill="rgba(40,90,160,0.15)" stroke="rgba(93,205,255,0.25)"/>
      <path d="M835 175 q20 -40 40 0 t40 0 t40 0 t40 0 t40 0" stroke="rgba(85,230,200,0.4)" fill="none" stroke-width="2"/>`;
  } else if (theme === 'r2') {
    extra = `<ellipse cx="380" cy="200" rx="260" ry="150" fill="rgba(150,80,255,0.13)"/>
      <ellipse cx="480" cy="260" rx="180" ry="100" fill="rgba(255,90,200,0.08)"/>
      <circle cx="430" cy="210" r="26" fill="rgba(255,230,170,0.5)"/>
      <circle cx="430" cy="210" r="52" fill="rgba(255,230,170,0.12)"/>
      <circle cx="900" cy="420" r="6" fill="#fff"/><path d="M900 340 v160 M820 420 h160 M845 365 l110 110 M955 365 l-110 110" stroke="rgba(255,210,150,0.25)" stroke-width="3"/>`;
  } else if (theme === 'r3') {
    extra = `<circle cx="600" cy="640" r="330" fill="rgba(40,140,220,0.2)"/>
      <circle cx="600" cy="640" r="330" fill="none" stroke="rgba(120,220,255,0.35)" stroke-width="2" stroke-dasharray="10 8"/>
      <circle cx="600" cy="640" r="255" fill="rgba(30,180,160,0.12)"/>
      <path d="M430 470 q60 -50 130 -20 q80 30 150 -10" stroke="rgba(160,255,220,0.3)" stroke-width="3" fill="none"/>`;
  } else if (theme === 'r4') {
    extra = `<path d="M0 470 h1200 v150 h-1200 Z" fill="rgba(200,90,40,0.22)"/>
      <path d="M0 470 C200 450 300 490 500 470 S 900 450 1200 470" stroke="rgba(255,170,90,0.4)" stroke-width="4" fill="none"/>
      <path d="M120 540 q60 -30 120 0 M700 555 q60 -30 120 0" stroke="rgba(255,210,120,0.35)" stroke-width="3" fill="none" stroke-dasharray="7 6"/>
      <path d="M340 470 l-18 -34 h36 Z M920 470 l-18 -34 h36 Z" fill="rgba(255,120,70,0.5)"/>`;
  } else if (theme === 'final') {
    extra = `<circle cx="600" cy="300" r="180" fill="none" stroke="rgba(85,230,200,0.2)" stroke-width="2" stroke-dasharray="4 10"/>
      <circle cx="600" cy="300" r="250" fill="none" stroke="rgba(82,216,255,0.14)" stroke-width="2" stroke-dasharray="4 14"/>`;
  }
  return `<svg class="scene-art" viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${stars}${extra}</svg>`;
}

/* ---------- 화면 전환 ---------- */
function showScreen(name) {
  state.screen = name;
  ['start', 'prologue', 'game', 'result'].forEach(s => {
    $(`#screen-${s}`).classList.toggle('hidden', s !== name);
  });
  $('#topbar').classList.toggle('hidden', name === 'start');
}

/* ---------- 상단 바 ---------- */
function renderTopbar() {
  const locEl = $('#tb-loc');
  if (!locEl) return;
  const room = state.room;
  locEl.textContent = state.escaped ? '통합과학 교실 (귀환)' :
    room === 'final' ? '타임머신 · 시간 좌표 콘솔' : (ROOMS[room] ? ROOMS[room].name : '-');
  let solvedN = 0, total = 5;
  if (room === 'final') {
    solvedN = (isSolved('final-chips') ? 1 : 0) + (isSolved('final-code') ? 1 : 0);
    total = 2;
  } else if (ROOMS[room]) {
    solvedN = ROOMS[room].puzzles.filter(isSolved).length + (isSolved(ROOMS[room].door) ? 1 : 0);
  }
  $('#tb-progress-fill').style.width = `${(solvedN / total) * 100}%`;
  $('#tb-progress-text').textContent = `${solvedN}/${total}`;
  const chipsBox = $('#tb-chips');
  chipsBox.innerHTML = '';
  ['chip1', 'chip2', 'chip3', 'chip4'].forEach((c, i) => {
    chipsBox.appendChild(el(`<span class="chip-dot ${hasItem(c) ? 'got' : ''}" title="시간 좌표 칩 ${i + 1}">${i + 1}</span>`));
  });
  $('#tb-time').textContent = fmtTime(state.playMs);
  // 시공간 안정도 게이지
  const stab = Math.round(state.stability);
  $('#stab-fill').style.width = `${stab}%`;
  $('#stab-pct').textContent = `${stab}%`;
  $('.stab-gauge').classList.toggle('danger', stab <= 30);
  // 반 · 팀명
  const teamEl = $('#tb-team');
  if (state.team && (state.team.cls || state.team.name)) {
    teamEl.textContent = `🚀 ${[state.team.cls, state.team.name].filter(Boolean).join(' · ')}`;
    teamEl.classList.remove('hidden');
  } else {
    teamEl.classList.add('hidden');
  }
  const sb = $('#btn-sound');
  sb.textContent = state.settings.sound ? '🔊 소리 켜짐' : '🔇 소리 꺼짐';
  sb.setAttribute('aria-pressed', state.settings.sound ? 'true' : 'false');
}

/* ---------- 현재 목표 ---------- */
function objectiveInfo() {
  const r = state.room;
  if (r === 'final') {
    if (!isSolved('final-chips')) return { text: '시간 좌표 칩 4개를 우주의 역사 순서대로 배치하세요.', hint: 'final-chips' };
    return { text: '최종 시간 좌표(5자리)를 입력해 타임머신을 가동하세요.', hint: 'final-code' };
  }
  if (r === 1) {
    if (!isSolved('r1-spectrum')) return { text: '프리즘을 조사해 분광 분석기를 복구하세요.', hint: 'r1-spectrum' };
    if (!isSolved('r1-timeline')) {
      const c = R1_CARDS.filter(hasItem).length;
      return c < 4
        ? { text: `초기 우주 사건 카드를 모으세요 (${c}/4) — 스펙트럼 자료·서랍·우주 시계·게시판`, hint: 'r1-timeline' }
        : { text: '게시판에서 사건 카드 4장을 시간 순서로 배열하세요.', hint: 'r1-timeline' };
    }
    if (!isSolved('r1-nucleo')) return { text: '질량 저울에서 초기 우주 핵합성을 재현하세요.', hint: 'r1-nucleo' };
    if (!isSolved('r1-light')) return { text: '우주 배경 복사 관측 화면을 복구하세요.', hint: 'r1-light' };
    return { text: '출구의 5자리 숫자 패드락을 해제하세요.', hint: 'r1-door' };
  }
  if (r === 2) {
    if (!isSolved('r2-film')) {
      const n = itemCount('film-piece');
      return n < 6
        ? { text: `찢어진 별 탄생 필름 조각을 모으세요 (${n}/6) — 원시별·보관함·반응기 조사`, hint: 'r2-film' }
        : { text: '성운 투영 장치에서 필름을 순서대로 이어 붙이세요.', hint: 'r2-film' };
    }
    if (!isSolved('r2-fusion')) return { text: '수소 핵융합 반응기를 가동하세요.', hint: 'r2-fusion' };
    if (!isSolved('r2-starmass')) return { text: '두 별의 내부 분석기에 알맞은 원소를 배치하세요.', hint: 'r2-starmass' };
    if (!isSolved('r2-nova')) return { text: '초신성 관측 기록을 복구하세요.', hint: 'r2-nova' };
    return { text: '출구의 핵융합 반응기형 복합 자물쇠를 해제하세요.', hint: 'r2-door' };
  }
  if (r === 3) {
    if (!isSolved('r3-spheres')) return { text: '투명 지구 모형에서 네 권역을 분류하세요.', hint: 'r3-spheres' };
    if (!isSolved('r3-energy')) return { text: '에너지원 배전판에 세 에너지원을 연결하세요.', hint: 'r3-energy' };
    if (!isSolved('r3-water')) return { text: '물 순환 펌프를 복구하세요.', hint: 'r3-water' };
    if (!isSolved('r3-carbon')) return { text: '탄소 이동 캡슐의 경로를 완성하세요.', hint: 'r3-carbon' };
    return { text: '출구의 권역 아이콘 자물쇠를 해제하세요.', hint: 'r3-door' };
  }
  if (r === 4) {
    if (!isSolved('r4-layers')) return { text: '지구 단면 조립판에서 암석권·연약권을 복구하세요.', hint: 'r4-layers' };
    if (!isSolved('r4-motion')) return { text: '판 운동 방향 조절기를 설정하세요.', hint: 'r4-motion' };
    if (!isSolved('r4-landform')) return { text: '지형 자석을 알맞은 판 경계에 배치하세요.', hint: 'r4-landform' };
    if (!isSolved('r4-map')) return { text: '지진·화산 분포 지도에서 판 경계를 찾으세요.', hint: 'r4-map' };
    return { text: '출구의 3단 판 운동 슬라이더 자물쇠를 해제하세요.', hint: 'r4-door' };
  }
  return { text: '', hint: null };
}

/* ---------- 방 렌더링 ---------- */
function renderRoom() {
  const view = $('#room-view');
  if (!view) return;
  const obj = objectiveInfo();
  $('#objective-text').textContent = obj.text;
  if (state.room === 'final') { renderFinal(view); renderTopbar(); return; }
  const room = ROOMS[state.room];
  if (!room) return;
  view.innerHTML = '';
  const scene = el(`<div class="room-scene theme-${room.theme}"></div>`);
  scene.insertAdjacentHTML('beforeend', sceneArt(room.theme));
  scene.appendChild(el(`<span class="room-title-tag">${esc(room.name)}</span>`));
  room.objects.forEach(o => {
    const st = o.status();
    const badge = st === 'locked' ? '🔒' : st === 'done' ? '✓' : '·';
    const btn = el(`<button type="button" class="room-obj st-${st} ${o.door ? 'obj-door' : ''}"
      style="left:${o.x}%;top:${o.y}%"
      aria-label="${esc(o.name)}${st === 'locked' ? ' (잠김)' : st === 'done' ? ' (완료)' : ''}">
      <span class="obj-badge" aria-hidden="true">${badge}</span>
      ${svgIcon(o.icon)}
      <span class="obj-name">${esc(o.name)}</span>
    </button>`);
    btn.addEventListener('click', () => { Sound.click(); o.open(); });
    scene.appendChild(btn);
  });
  view.appendChild(scene);
  renderTopbar();
}

function warpFlash() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ov = $('#fx-overlay');
  ov.classList.remove('hidden');
  ov.classList.add('warp-mode');
  ov.innerHTML = '<div class="warp"></div>';
  setTimeout(() => {
    ov.classList.add('hidden');
    ov.classList.remove('warp-mode');
    ov.innerHTML = '';
  }, 620);
}

function enterRoom(r) {
  state.room = r;
  saveGame();
  showScreen('game');
  renderRoom();
  renderInventory();
  warpFlash();
  if (r === 'final') { toast('타임머신 앞에 도착했습니다.'); aiSay(AI_LINES.final); }
  else { toast(`${ROOMS[r].name}에 입장했습니다.`); aiSay(AI_LINES.room[r]); }
}

/* ---------- 방 통과 연출 ---------- */
function roomClearSequence(n) {
  const rc = ROOM_CLEAR[n];
  gainItem(rc.chip);
  const nextRoom = n === 4 ? 'final' : n + 1;
  const body = el(`<div style="text-align:center">
    <div class="clear-chip"><span class="cc-num">${esc(rc.num)}</span><span class="cc-name">${esc(rc.name)}</span></div>
    <div class="clear-summary"><p><strong>핵심 정리</strong></p><p>${esc(rc.summary)}</p></div>
    <p>${esc(rc.next)}</p>
  </div>`);
  body.appendChild(contBtn(n === 4 ? '타임머신으로 이동 →' : '다음 방으로 이동 →', () => {
    closeModal(true);
    enterRoom(nextRoom);
  }, true));
  openModal({ title: `🎉 방 ${n} 통과!`, sub: '시간 좌표 칩 획득', body, onClose: () => enterRoom(nextRoom) });
}

/* ---------- 최종 화면 (타임머신) ---------- */
function machineSVG() {
  return `<svg class="machine-svg" viewBox="0 0 300 190" role="img" aria-label="타임머신">
    <ellipse cx="150" cy="168" rx="120" ry="14" fill="rgba(82,216,255,0.12)"/>
    <path d="M90 160 Q80 60 150 40 Q220 60 210 160 Z" fill="rgba(20,40,80,0.8)" stroke="rgba(93,205,255,0.6)" stroke-width="2"/>
    <circle cx="150" cy="92" r="30" fill="rgba(82,216,255,0.15)" stroke="#52d8ff" stroke-width="2"/>
    <circle cx="150" cy="92" r="16" fill="rgba(85,230,200,0.3)"/>
    <rect x="118" y="132" width="64" height="18" rx="4" fill="#05080f" stroke="rgba(255,171,82,0.6)"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${122 + i * 15}" y="136" width="11" height="10" rx="2" fill="${hasItem('chip' + (i + 1)) ? '#59f2c8' : '#22314f'}"/>`).join('')}
    <path d="M150 40 V22" stroke="#52d8ff" stroke-width="2"/>
    <circle cx="150" cy="18" r="4" fill="#59f2c8"/>
  </svg>`;
}

function renderFinal(view) {
  view.innerHTML = '';
  const scene = el('<div class="room-scene theme-final" style="position:relative;min-height:100%"></div>');
  scene.insertAdjacentHTML('beforeend', sceneArt('final'));
  const box = el(`<div class="final-scene">
    <h2>⏳ 타임머신 · 시간 좌표 콘솔</h2>
    <p class="final-lead">네 개의 시간 좌표 칩을 모두 회수했다. 이제 현재로 돌아갈 시간이다!</p>
    ${machineSVG()}
    <div class="final-panel" id="final-step"></div>
  </div>`);
  scene.appendChild(box);
  view.appendChild(scene);
  const step = $('#final-step', box);

  if (!isSolved('final-chips')) {
    const chipLabel = {
      chip1: '38 · 빅뱅 후 약 38만 년', chip2: '4 · 수소 원자핵 4개',
      chip3: '4 · 네 권역', chip4: '3 · 세 가지 판 경계',
    };
    const puzzle = buildAssignPuzzle({
      prompt: '시간 좌표 칩을 <strong>우주의 역사 순서</strong>대로 슬롯에 배치하세요.',
      binClass: 'final-bins',
      bins: [
        { id: 'slot-1', label: '① 초기 우주의 원자 형성', cap: 1 },
        { id: 'slot-2', label: '② 별 내부의 수소 핵융합', cap: 1 },
        { id: 'slot-3', label: '③ 지구시스템의 구성', cap: 1 },
        { id: 'slot-4', label: '④ 판 구조론', cap: 1 },
      ],
      cards: ['chip1', 'chip2', 'chip3', 'chip4'].map(id => ({ id, label: `칩 [ ${chipLabel[id]} ]` })),
      answer: ANSWERS.chipOrder,
      wrong: FEEDBACK.chips,
      checkLabel: '좌표 칩 삽입',
      okMsg: '좌표 칩이 승인되었습니다! 5자리 키패드가 활성화됩니다.',
      onCorrect() {
        ['chip1', 'chip2', 'chip3', 'chip4'].forEach(useItem);
        markSolved('final-chips');
      },
    });
    const head = el('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem"><strong>1단계 · 좌표 칩 배열</strong><button type="button" class="btn btn-ghost btn-small">💡 힌트</button></div>');
    $('button', head).addEventListener('click', () => openHintPopup('final-chips'));
    step.appendChild(head);
    step.appendChild(puzzle);
  } else if (!isSolved('final-code')) {
    const head = el('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem"><strong>2단계 · 최종 시간 좌표 입력</strong><button type="button" class="btn btn-ghost btn-small">💡 힌트</button></div>');
    $('button', head).addEventListener('click', () => openHintPopup('final-code'));
    step.appendChild(head);
    step.appendChild(el(`<p class="puzzle-note">배열된 칩: <strong>38</strong> → <strong>4</strong> → <strong>4</strong> → <strong>3</strong>.
      숫자를 왼쪽부터 이어 붙여 5자리 좌표를 입력하세요.</p>`));
    step.appendChild(buildKeypad({
      digits: 5,
      code: ANSWERS.finalCode,
      prompt: '최종 시간 좌표를 입력하라.',
      wrongMsg: FEEDBACK.finalCode,
      okMsg: '좌표 승인! 타임머신 전원 상승!',
      onCorrect() { playEscape(); },
    }));
  }
}

function playEscape() {
  state.solved['final-code'] = true;
  saveGame();
  const ov = $('#fx-overlay');
  ov.classList.remove('hidden');
  ov.innerHTML = '<div class="tunnel"></div><div class="tunnel-text">좌표 승인 — 시간 터널 진입… 현재로 귀환합니다!</div>';
  Sound.unlock();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    ov.classList.add('hidden');
    ov.innerHTML = '';
    tickTime();
    state.escaped = true;
    saveGame();
    showResult();
  }, reduce ? 250 : 2700);
}

/* ---------- 탐사 등급 · 결과 보고서 ---------- */
function calcRank() {
  const min = state.playMs / 60000;
  let score = 100 - state.wrongCount * 3 - state.hintCount * 4 - Math.max(0, min - 35) * 1.5;
  score = Math.max(0, Math.round(score));
  const rank = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 60 ? 'B' : 'C';
  return { score, rank };
}
function buildReport() {
  const { score, rank } = calcRank();
  const t = state.team || { cls: '', name: '' };
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const when = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const payload = {
    c: t.cls, t: t.name, ms: Math.round(state.playMs),
    h: state.hintCount, w: state.wrongCount,
    st: Math.round(state.stability), s: score, r: rank, d: when,
  };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const sum = [...json].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 9973;
  const code = (b64 + '.' + sum.toString(36).toUpperCase()).replace(/(.{24})/g, '$1\n');
  const text = [
    '[통합과학 방탈출 · 138억 년의 여정] 탈출 성공 보고서',
    `반: ${t.cls || '-'} / 팀명: ${t.name || '-'}`,
    `탈출 완료: ${when}`,
    `플레이 시간: ${fmtTime(state.playMs)} | 힌트: ${state.hintCount}회 | 오답: ${state.wrongCount}회 | 시공간 안정도: ${Math.round(state.stability)}%`,
    `탐사 평점: ${score}점 / 탐사 등급: ${rank}`,
    '── 검증 코드 (수정 금지) ──',
    code,
  ].join('\n');
  return { text, score, rank };
}

/* ---------- 결과 화면 ---------- */
function showResult() {
  const sec = $('#screen-result');
  sec.innerHTML = '';
  const report = buildReport();
  const t = state.team || { cls: '', name: '' };
  const card = el(`<div class="result-card">
    <p class="start-kicker">MISSION COMPLETE</p>
    <h2>🎉 탈출 성공!</h2>
    <p>${t.name ? `<strong>${esc([t.cls, t.name].filter(Boolean).join(' · '))}</strong> 팀, ` : ''}138억 년의 여정을 지나 현재의 통합과학 교실로 돌아왔습니다.</p>
    <div class="rank-badge"><span class="rank-letter">${esc(report.rank)}</span><span class="rank-k">탐사 등급 · ${report.score}점</span></div>
    <div class="result-story">${FINAL_MESSAGE.map(m => `<p>${esc(m)}</p>`).join('')}</div>
    <div class="result-chips">
      <span class="result-chip">칩① 38</span><span class="result-chip">칩② 4</span>
      <span class="result-chip">칩③ 4</span><span class="result-chip">칩④ 3</span>
    </div>
    <div class="stats-grid">
      <div class="stat"><span class="stat-v">${esc(fmtTime(state.playMs))}</span><span class="stat-k">총 플레이 시간</span></div>
      <div class="stat"><span class="stat-v">${state.hintCount}</span><span class="stat-k">사용한 힌트</span></div>
      <div class="stat"><span class="stat-v">${state.wrongCount}</span><span class="stat-k">오답 횟수</span></div>
      <div class="stat"><span class="stat-v">${Math.round(state.stability)}%</span><span class="stat-k">시공간 안정도</span></div>
    </div>
    <p style="text-align:left;margin:0.8rem 0 0.2rem"><strong>📤 결과 제출</strong>
      <span class="puzzle-note" style="display:block">아래 보고서를 복사하거나 파일로 저장해 선생님께 제출하세요.</span></p>
    <textarea id="report-text" class="report-box" readonly aria-label="탈출 결과 보고서"></textarea>
    <div class="result-btns" style="margin-bottom:0.9rem">
      <button type="button" class="btn" id="btn-copy-report">📋 보고서 복사</button>
      <button type="button" class="btn" id="btn-save-report">💾 파일로 저장</button>
    </div>
    <div class="result-btns">
      <button type="button" class="btn btn-big" id="btn-review">📘 핵심 개념 다시 보기</button>
      <button type="button" class="btn btn-big btn-primary" id="btn-again">↻ 다시 시작</button>
    </div>
  </div>`);
  sec.appendChild(card);
  $('#report-text', card).value = report.text;
  $('#btn-copy-report', card).addEventListener('click', async () => {
    const ta = $('#report-text', card);
    try {
      await navigator.clipboard.writeText(ta.value);
      toast('보고서가 복사되었습니다. 선생님께 제출하세요!');
    } catch (e) {
      ta.focus(); ta.select();
      try { document.execCommand('copy'); toast('보고서가 복사되었습니다.'); }
      catch (e2) { toast('자동 복사가 안 되는 환경입니다. 텍스트를 길게 눌러 직접 복사하세요.'); }
    }
  });
  $('#btn-save-report', card).addEventListener('click', () => {
    const blob = new Blob([$('#report-text', card).value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const safe = (s) => (s || '').replace(/[\\/:*?"<>|\s]+/g, '_');
    a.download = `방탈출결과_${safe(t.cls) || '반'}_${safe(t.name) || '팀'}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('결과 파일이 저장되었습니다.');
  });
  $('#btn-review', card).addEventListener('click', () => {
    openModal({
      title: '핵심 개념 다시 보기',
      body: `<div>${[1, 2, 3, 4].map(n => `<div class="clear-summary"><p><strong>방 ${n} · ${esc(ROOMS[n].name.split('· ')[1])}</strong></p><p>${esc(ROOM_CLEAR[n].summary)}</p></div>`).join('')}
        <div class="clear-summary" style="border-left-color:var(--warn)"><p><strong>전체 흐름</strong></p>
        <p>초기 우주의 수소·헬륨 생성 → 별의 재료 → 별의 진화와 무거운 원소 생성 → 지구와 생명체의 재료 →
        지구시스템 권역의 물질·에너지 교환 → 지구 내부 에너지에 의한 판의 이동과 지권의 변화</p></div></div>`,
    });
  });
  $('#btn-again', card).addEventListener('click', () => confirmRestart());
  showScreen('result');
  renderTopbar();
}

/* ---------- 프롤로그 ---------- */
let proIdx = 0;
const proType = { timer: null, full: '', done: true };

function runPrologue() {
  proIdx = 0;
  showScreen('prologue');
  renderPrologue();
}
function typeProDesc(text) {
  const box = $('#pro-desc');
  clearInterval(proType.timer);
  proType.full = text;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { box.textContent = text; proType.done = true; return; }
  proType.done = false;
  box.textContent = '';
  let i = 0;
  proType.timer = setInterval(() => {
    box.textContent = text.slice(0, ++i);
    if (i % 3 === 0) Sound.tone(1200, 0.015, 'square', 0.012);
    if (i >= text.length) { clearInterval(proType.timer); proType.done = true; }
  }, 20);
}
function renderPrologue() {
  const sc = PROLOGUE[proIdx];
  $('#pro-step').textContent = sc.step;
  $('#pro-icon').textContent = PRO_ICONS[proIdx] || '';
  $('#pro-title').textContent = sc.t;
  typeProDesc(sc.d);
  $('#pro-fx').className = '';
  $('#pro-fx').classList.add(sc.fx);
  $('#btn-pro-next').textContent = proIdx === PROLOGUE.length - 1 ? '탐사 시작!' : '다음';
}
function finishPrologue() {
  clearInterval(proType.timer);
  state.prologueDone = true;
  saveGame();
  aiSay(AI_LINES.boot);
  enterRoom(state.room && state.room !== 'final' ? state.room : 1);
}

/* ---------- 새 게임 / 이어하기 / 다시 시작 ---------- */
function readTeamInputs() {
  return {
    cls: ($('#reg-class').value || '').trim().slice(0, 20),
    name: ($('#reg-team').value || '').trim().slice(0, 24),
  };
}
function validateTeam() {
  const t = readTeamInputs();
  const msg = $('#reg-msg');
  if (!t.cls || !t.name) {
    msg.textContent = '⚠ 반과 팀명을 입력해야 탐사를 시작할 수 있습니다. (대원 등록)';
    msg.classList.remove('pop');
    void msg.offsetWidth;
    msg.classList.add('pop');
    (!t.cls ? $('#reg-class') : $('#reg-team')).focus();
    return null;
  }
  msg.textContent = '';
  return t;
}
function startNewGame(team) {
  clearSave();
  const keep = team || (state.team && state.team.name ? state.team : null);
  state = newState();
  if (keep) state.team = keep;
  state.screen = 'prologue';
  saveGame();
  renderInventory();
  renderTopbar();
  runPrologue();
}

function continueGame() {
  if (!loadGame()) { toast('저장된 게임을 불러올 수 없습니다.'); return; }
  renderInventory();
  renderTopbar();
  if (state.escaped) { showResult(); return; }
  if (!state.prologueDone) { runPrologue(); return; }
  enterRoom(state.room);
}

function confirmRestart() {
  const body = el(`<div style="text-align:center">
    <p>정말 처음부터 다시 시작할까요?</p>
    <p class="puzzle-note">저장된 진행 상황(해결한 퍼즐, 아이템, 기록)이 모두 삭제됩니다.</p>
    <div class="puzzle-actions" style="justify-content:center">
      <button type="button" class="btn" data-a="no">취소</button>
      <button type="button" class="btn btn-warn" data-a="yes">삭제하고 새 게임 시작</button>
    </div>
  </div>`);
  $('[data-a=no]', body).addEventListener('click', () => closeModal());
  $('[data-a=yes]', body).addEventListener('click', () => {
    closeModal(true);
    startNewGame();
  });
  openModal({ title: '처음부터 다시 시작', body });
}

/* ---------- 조작 방법 ---------- */
function openHowto() {
  openModal({
    title: '조작 방법',
    body: `<div>
      <div class="clear-summary"><p><strong>🖱 탐색</strong> — 방 안의 오브젝트를 클릭(또는 Tab + Enter)해 조사합니다.
      🔒 표시는 아직 잠긴 장치, ✓ 표시는 완료된 장치입니다.</p></div>
      <div class="clear-summary"><p><strong>🃏 카드 퍼즐</strong> — 카드를 끌어다 놓거나,
      카드를 클릭한 뒤 놓을 위치를 클릭해도 됩니다. 배치한 카드를 다시 클릭하면 되돌아옵니다.</p></div>
      <div class="clear-summary"><p><strong>💡 힌트</strong> — 막히면 힌트 버튼을 누르세요.
      같은 퍼즐에서 누를 때마다 1단계 → 2단계 → 3단계로 조금씩 더 공개됩니다. (사용 횟수는 결과에 기록)</p></div>
      <div class="clear-summary"><p><strong>💾 저장</strong> — 진행 상황은 이 브라우저에 자동 저장됩니다.
      창을 닫았다가 다시 열어도 「이어하기」로 계속할 수 있습니다.</p></div>
      <div class="clear-summary"><p><strong>⌨ 키보드</strong> — Tab으로 이동, Enter/Space로 실행, ESC로 창 닫기.</p></div>
    </div>`,
  });
}

/* ---------- 초기화 ---------- */
function init() {
  renderInventory();

  $('#btn-newgame').addEventListener('click', () => {
    const team = validateTeam();
    if (!team) return;
    if (hasSavedGame()) {
      const body = el(`<div style="text-align:center">
        <p>저장된 게임이 있습니다. 새 게임을 시작하면 기존 기록이 삭제됩니다.</p>
        <div class="puzzle-actions" style="justify-content:center">
          <button type="button" class="btn" data-a="no">취소</button>
          <button type="button" class="btn btn-warn" data-a="yes">새 게임 시작</button>
        </div></div>`);
      $('[data-a=no]', body).addEventListener('click', () => closeModal());
      $('[data-a=yes]', body).addEventListener('click', () => { closeModal(true); startNewGame(team); });
      openModal({ title: '새 게임', body });
    } else {
      startNewGame(team);
    }
  });
  // 저장된 게임이 있으면 반·팀명 미리 채우기 + Enter로 시작
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.team) {
        if (saved.team.cls) $('#reg-class').value = saved.team.cls;
        if (saved.team.name) $('#reg-team').value = saved.team.name;
      }
    }
  } catch (e) { /* noop */ }
  $('#start-reg').addEventListener('submit', e => { e.preventDefault(); $('#btn-newgame').click(); });
  $('#btn-continue').addEventListener('click', continueGame);
  $('#btn-howto').addEventListener('click', openHowto);
  $('#btn-continue').disabled = !hasSavedGame();

  $('#btn-restart').addEventListener('click', confirmRestart);
  $('#btn-sound').addEventListener('click', () => {
    state.settings.sound = !state.settings.sound;
    if (state.settings.sound) { Sound.ensure(); Sound.click(); }
    saveGame();
    renderTopbar();
  });
  $('#btn-hint').addEventListener('click', () => {
    const modalOpen = !$('#modal-root').classList.contains('hidden');
    const pid = modalOpen && activeHintId ? activeHintId : objectiveInfo().hint;
    if (pid) openHintPopup(pid);
    else toast('지금은 힌트가 필요한 단계가 아닙니다.');
  });

  $('#btn-pro-next').addEventListener('click', () => {
    Sound.click();
    if (!proType.done) { // 타자기 진행 중이면 먼저 문장 완성
      clearInterval(proType.timer);
      $('#pro-desc').textContent = proType.full;
      proType.done = true;
      return;
    }
    if (proIdx >= PROLOGUE.length - 1) finishPrologue();
    else { proIdx++; renderPrologue(); }
  });
  $('#btn-pro-skip').addEventListener('click', () => finishPrologue());

  // 타이머(1초) + 자동 저장(15초) + 시공간 안정도 하락(45초마다 1%)
  let tick = 0;
  setInterval(() => {
    if (state.screen === 'game' && !state.escaped) {
      tickTime();
      const t = $('#tb-time');
      if (t) t.textContent = fmtTime(state.playMs);
      tick++;
      if (tick % 45 === 0) {
        const before = state.stability;
        state.stability = Math.max(10, state.stability - 1);
        if (before !== state.stability) renderTopbar();
        // 임계값을 처음 지날 때 관제 AI 경고 + 알림음
        [75, 50, 25].forEach(th => {
          if (before > th && state.stability <= th && !state.flags['stabWarn' + th]) {
            state.flags['stabWarn' + th] = true;
            aiSay(AI_LINES.stab[th]);
            Sound.tone(520, 0.15, 'square', 0.05);
            Sound.tone(392, 0.2, 'square', 0.05, 0.18);
          }
        });
      }
      if (tick % 15 === 0) saveGame();
    }
  }, 1000);

  showScreen('start');
}

document.addEventListener('DOMContentLoaded', init);
