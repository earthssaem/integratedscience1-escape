'use strict';
/* ============================================================
   data.js — 게임 정적 데이터
   (아이콘 SVG, 아이템 정의, 정답 데이터, 힌트, 오답 피드백, 프롤로그)
   ============================================================ */

/* ---------- 인라인 SVG 아이콘 ---------- */
const ICONS = {
  prism: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3.5 19.5h17Z"/><path d="M2 9l5 3.7" opacity=".8"/><path d="M13.5 14.5 21 12M13.5 15.5 21 15M13.5 16.5 21 18" opacity=".8"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4.5"/></svg>',
  drawer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 12h18M10 8h4M10 16h4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 6.5V12l3.5 2.5"/></svg>',
  board: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="2.5" y="4" width="19" height="14" rx="2"/><rect x="5" y="7" width="4" height="5" rx="1"/><rect x="10" y="9" width="4" height="5" rx="1"/><rect x="15" y="6.5" width="4" height="5" rx="1"/><path d="M9 21h6"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M5 20h14M12 4 6 7l-3 6a3.4 3.4 0 0 0 6 0L6 7M12 4l6 3 3 6a3.4 3.4 0 0 1-6 0l3-6"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M4.5 12c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0" opacity=".9"/><path d="M9 21h6M12 17v4"/></svg>',
  door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="15" cy="12" r="1" fill="currentColor"/><rect x="8" y="6" width="8" height="3" rx="1" opacity=".7"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 6v12M17.5 6v12M2.5 10h4M2.5 14h4M17.5 10h4M17.5 14h4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5Z"/><circle cx="19" cy="18" r="1.4" opacity=".7"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="3.5" width="18" height="5" rx="1"/><rect x="3" y="9.5" width="18" height="5" rx="1"/><rect x="3" y="15.5" width="18" height="5" rx="1"/><path d="M10 6h4M10 12h4M10 18h4"/></svg>',
  reactor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9.5" ry="4"/><ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(120 12 12)"/></svg>',
  nova: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8"/><circle cx="12" cy="12" r="3.2"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.5 9h17M3.5 15h17"/></svg>',
  plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0Z"/><path d="M12 16v5"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z"/><path d="M9 14.5a3 3 0 0 0 3 3" stroke-linecap="round" opacity=".8"/></svg>',
  capsule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M9.5 8.4l5 7.2" opacity=".8"/></svg>',
  poster: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="4.5" y="3.5" width="15" height="17" rx="1.5"/><circle cx="12" cy="3.5" r="1"/><circle cx="12" cy="10" r="3.4" opacity=".8"/><path d="M8 17h8"/></svg>',
  desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 9h18M4.5 9v11M19.5 9v11M4.5 14h6v6"/><rect x="7" y="4" width="10" height="5" rx="1"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 7c3-2.5 6-2.5 9 0s6 2.5 9 0M3 12c3-2.5 6-2.5 9 0s6 2.5 9 0M3 17c3-2.5 6-2.5 9 0s6 2.5 9 0"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="7" cy="17" r="2" fill="currentColor"/></svg>',
  magnet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v8a6 6 0 0 0 12 0V3M6 3h4v5H6zM14 3h4v5h-4z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',
  seismo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M5 13h3l1.5-5 3 8 2-6 1.5 3H19"/></svg>',
  chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 6V3M15 6V3M9 21v-3M15 21v-3M6 9H3M6 15H3M21 9h-3M21 15h-3"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="4.5" y="3" width="15" height="18" rx="2"/><circle cx="12" cy="9" r="2.4"/><path d="M8 15.5h8M8 18h5"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 17.8 10 4 4 0 0 1 17 18Z"/></svg>',
  rock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 4h7l5 6-2 9H6L3 12l5-8Z"/><path d="M8 4l3 6-5 2M15 4l1 6 4 0M11 10l1 9" opacity=".7"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4C10 4 4.5 9.5 4.5 16.5c0 1.5.3 2.7.8 3.5C12 20 19 14 20 4Z"/><path d="M5.5 19C9 14 13 10 18 6.5" opacity=".8"/></svg>',
  cert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3.5" y="4" width="17" height="13" rx="2"/><circle cx="12" cy="9.5" r="2.6"/><path d="M12 12v8M9.5 20 12 18l2.5 2"/></svg>',
  clue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M8 10.5h5M10.5 8v5" opacity=".8"/></svg>',
};

/* ---------- 아이템 정의 ---------- */
const ITEM_DEFS = [
  // 방 1
  { id: 'film', room: 1, icon: 'film', name: '투명 필름',
    desc: '분광 분석기에서 나온 투명 필름. 숫자는 없고 기호만 그려져 있다.\n\n[ 우주 시계 → 질량 저울 → 우주 달력 ]\n\n이 방의 숫자 암호를 "읽는 순서"를 뜻하는 것 같다.' },
  { id: 'card-quark', room: 1, icon: 'card', name: '사건 카드: 쿼크·전자 생성',
    desc: '초기 우주 사건 카드.\n빅뱅 직후 매우 뜨거운 우주에서 물질의 기본 입자인 쿼크와 전자가 생성되었다.' },
  { id: 'card-nucleon', room: 1, icon: 'card', name: '사건 카드: 양성자·중성자 생성',
    desc: '초기 우주 사건 카드.\n우주가 식으면서 쿼크들이 결합하여 양성자와 중성자가 만들어졌다.' },
  { id: 'card-henuc', room: 1, icon: 'card', name: '사건 카드: 헬륨 원자핵 생성',
    desc: '초기 우주 사건 카드.\n양성자와 중성자가 결합하여 헬륨 원자핵이 만들어졌다.' },
  { id: 'card-atom', room: 1, icon: 'card', name: '사건 카드: 원자 생성',
    desc: '초기 우주 사건 카드.\n전자가 원자핵과 결합하여 수소 원자와 헬륨 원자가 만들어졌다.' },
  { id: 'clue-clock', room: 1, icon: 'clue', name: '우주 시계 단서: 3',
    desc: '우주 시계가 가리키는 숫자.\n\n· 헬륨 원자핵 생성: 빅뱅 후 약 3분\n· 원자 생성: 빅뱅 후 약 38만 년' },
  { id: 'clue-scale', room: 1, icon: 'clue', name: '질량 저울 단서: 3 1',
    desc: '질량 저울이 가리키는 숫자.\n\n수소 원자핵 : 헬륨 원자핵의 질량비 = 약 3 : 1' },
  { id: 'clue-cal', room: 1, icon: 'clue', name: '우주 달력 단서: 3 8',
    desc: '우주 달력(관측 화면)이 가리키는 숫자.\n\n원자 생성: 빅뱅 후 약 38만 년.\n이때 자유로워진 빛이 오늘날 우주 배경 복사로 관측된다.' },
  { id: 'chip1', room: 1, icon: 'chip', name: '시간 좌표 칩 ①: 38',
    desc: '첫 번째 시간 좌표 칩.\n\n값: 38\n의미: 원자가 형성된 빅뱅 후 약 38만 년.' },
  // 방 2
  { id: 'film-piece', room: 2, icon: 'film', name: '별 탄생 필름 조각', count: true, max: 6,
    desc: '찢어진 "별 탄생 기록 필름"의 조각. 6조각을 모두 모아 성운 투영 장치에서 순서대로 이어 붙여야 한다.' },
  { id: 'cert4', room: 2, icon: 'cert', name: '핵융합 인증판: 4',
    desc: '수소 핵융합 반응기가 발급한 인증판.\n\n"수소 원자핵 4개 → 헬륨 원자핵 1개 + 에너지"\n\n큼직하게 숫자 4가 찍혀 있다.' },
  { id: 'small-star', room: 2, icon: 'star', name: '작은 별 문양',
    desc: '질량이 태양과 비슷한 별의 분석기에서 얻은 문양.\n이런 별의 중심부에서는 핵융합으로 최종적으로 탄소까지 만들어진다.' },
  { id: 'big-star', room: 2, icon: 'star', name: '큰 별 문양',
    desc: '질량이 태양보다 훨씬 큰 별의 분석기에서 얻은 문양.\n이런 별의 중심부에서는 연속적인 핵융합으로 최종적으로 철까지 만들어진다.' },
  { id: 'nova-mark', room: 2, icon: 'nova', name: '초신성 폭발 문양',
    desc: '초신성 관측 장치에서 얻은 문양.\n초신성 폭발 과정에서 철보다 무거운 원소가 만들어지고, 별의 원소가 우주로 방출되어 새로운 별과 행성의 재료가 된다.' },
  { id: 'chip2', room: 2, icon: 'chip', name: '시간 좌표 칩 ②: 4',
    desc: '두 번째 시간 좌표 칩.\n\n값: 4\n의미: 헬륨 원자핵 하나를 만드는 데 필요한 수소 원자핵의 수.' },
  // 방 3
  { id: 'icon-cloud', room: 3, icon: 'cloud', name: '권역 아이콘: 구름(기권)',
    desc: '기권을 나타내는 아이콘. 지구를 둘러싼 공기의 층.' },
  { id: 'icon-drop', room: 3, icon: 'droplet', name: '권역 아이콘: 물방울(수권)',
    desc: '수권을 나타내는 아이콘. 바닷물·강물·지하수·빙하 등 지구의 물.' },
  { id: 'icon-rock', room: 3, icon: 'rock', name: '권역 아이콘: 암석(지권)',
    desc: '지권을 나타내는 아이콘. 암석과 토양, 지구 내부.' },
  { id: 'icon-leaf', room: 3, icon: 'leaf', name: '권역 아이콘: 잎(생물권)',
    desc: '생물권을 나타내는 아이콘. 지구에 사는 모든 생명체.' },
  { id: 'chip3', room: 3, icon: 'chip', name: '시간 좌표 칩 ③: 4',
    desc: '세 번째 시간 좌표 칩.\n\n값: 4\n의미: 지구시스템을 구성하는 네 권역(기권·수권·지권·생물권).' },
  // 방 4
  { id: 'magnets', room: 4, icon: 'magnet', name: '지형 자석 세트',
    desc: '해령·열곡대·변환 단층·해구·호상열도·습곡 산맥 모양의 자석 세트. 판 경계 모형에 붙일 수 있다.' },
  { id: 'chip4', room: 4, icon: 'chip', name: '시간 좌표 칩 ④: 3',
    desc: '네 번째 시간 좌표 칩.\n\n값: 3\n의미: 판 경계의 세 가지 유형(발산형·보존형·수렴형).' },
];

/* ---------- 정답 데이터 (한 곳에서만 관리) ---------- */
const ANSWERS = {
  // 방 1
  spectrum: { 'spec-cont': ['src-white'], 'spec-emit': ['src-hot'], 'spec-abs': ['src-cool'] },
  starElements: ['h', 'he'],
  timeline: ['card-quark', 'card-nucleon', 'card-henuc', 'card-atom'],
  heRecipe: { p: 2, n: 2 },
  massH: 12, massHe: 4, ratio: [3, 1],
  lightRooms: {
    'ch-a': ['pc-freeE', 'pc-hnuc', 'pc-henuc', 'pc-zig'],
    'ch-b': ['pc-hatom', 'pc-heatom', 'pc-straight'],
  },
  blanks: { 'bl-age': 'op-38man', 'bl-temp': 'op-3000k', 'bl-what': 'op-atom' },
  cmbQuiz: 'q-cmb',
  r1code: '33138',
  // 방 2
  film: ['f-ism', 'f-nebula', 'f-contract', 'f-proto', 'f-heat', 'f-fusion'],
  fusionCount: 4,
  starmass: { 'bin-small': ['el-c'], 'bin-big': ['el-fe'] },
  nova: ['n-iron', 'n-collapse', 'n-explode', 'n-heavy', 'n-eject', 'n-recycle'],
  r2lock: { dial: 4, small: 'el-c', big: 'el-fe', slot: 'el-heavy' },
  // 방 3
  spheres: {
    'sp-atm': ['e-air'],
    'sp-hydro': ['e-sea', 'e-river', 'e-ground', 'e-glacier'],
    'sp-geo': ['e-rock', 'e-soil', 'e-interior'],
    'sp-bio': ['e-life'],
  },
  energy: {
    'en-sun': ['ph-circulation', 'ph-weather', 'ph-photo', 'ph-lifeact'],
    'en-internal': ['ph-plate', 'ph-quake', 'ph-volcano', 'ph-crust'],
    'en-tide': ['ph-tide', 'ph-sealevel'],
  },
  water: ['w-sun', 'w-evap', 'w-vapor', 'w-condense', 'w-cloud', 'w-rain', 'w-riverground', 'w-tosea'],
  carbon: ['c-photo', 'c-organic', 'c-buried', 'c-fossil', 'c-burn', 'c-back'],
  carbonPath: ['기권', '생물권', '지권', '기권'],
  r3lock: ['ic-cloud', 'ic-leaf', 'ic-rock', 'ic-cloud'],
  // 방 4
  layers: { 'ly-top': ['lb-crust'], 'ly-under': ['lb-umantle'], 'ly-band': ['lb-litho'], 'ly-flow': ['lb-astheno'] },
  motion: { 'bd-div': 'mv-apart', 'bd-cons': 'mv-slide', 'bd-conv': 'mv-toward' },
  landform: {
    'lf-div': ['tf-ridge', 'tf-rift'],
    'lf-cons': ['tf-transform'],
    'lf-conv': ['tf-trench', 'tf-arc', 'tf-fold'],
  },
  mapZones: ['z1', 'z3', 'z5'],
  mapQuiz: 'mq-cons',
  r4lock: ['sl-div', 'sl-cons', 'sl-conv'],
  // 최종
  chipOrder: { 'slot-1': ['chip1'], 'slot-2': ['chip2'], 'slot-3': ['chip3'], 'slot-4': ['chip4'] },
  finalCode: '38443',
};

/* ---------- 오답 피드백 (개념 설명) ---------- */
const FEEDBACK = {
  spectrum: '고온의 기체가 방출한 빛에서는 특정 위치에 밝은 선이 나타나고, 백색광이 저온의 기체를 통과하면 같은 위치에 검은 선이 나타납니다. 각 장치의 빛이 어떤 무늬를 만들지 다시 생각해 보세요.',
  starSpectrum: '별의 스펙트럼에 나타난 검은 선(흡수선)의 위치를 각 원소의 밝은 선 위치와 비교해 보세요. 선의 위치가 일치하는 원소가 그 별에 들어 있습니다.',
  timeline: '헬륨 원자핵이 만들어지기 위해서는 먼저 양성자와 중성자가 존재해야 합니다. 작은 입자부터 만들어진 순서를 다시 생각해 보세요.',
  heRecipe: '헬륨 원자핵 1개는 양성자 2개와 중성자 2개로 이루어집니다. 조립 영역의 입자 수를 다시 확인해 보세요.',
  ratio: '이 퍼즐은 헬륨 원자핵의 생성이 끝난 이후의 질량비를 나타냅니다. 남은 수소 원자핵 12개(각 1질량 단위)와 헬륨 원자핵 1개(4질량 단위)의 전체 질량을 비교해 보세요.',
  ratioSimplify: '값은 맞지만, 가장 간단한 비로 나타내 보세요. 12와 4를 같은 수로 나눌 수 있습니다.',
  lightPlace: '원자가 만들어지기 전에는 전자가 원자핵과 결합하지 않고 자유롭게 돌아다니며 빛과 계속 상호작용했습니다. 자유 전자와 원자가 각각 어느 관측실에 있어야 할지 생각해 보세요.',
  blanks: '원자가 만들어진 시기의 우주 나이와 온도를 우주 시계에서 다시 확인해 보세요. 헬륨 원자핵이 생긴 "3분"과 헷갈리지 않도록 주의하세요.',
  cmb: '이 빛은 우주가 팽창하며 식는 동안 파장이 길어져, 오늘날 우주 "전역"에서 관측됩니다. 특정 별이나 태양에서 오는 빛이 아닙니다.',
  r1code: '투명 필름에 그려진 순서(우주 시계 → 질량 저울 → 우주 달력)대로 각 장치의 숫자를 이어 붙여 보세요.',
  film: '별은 성간 물질이 중력에 의해 모이고 수축하면서 만들어집니다. 온도가 충분히 높아진 다음에야 수소 핵융합이 시작됩니다.',
  fusion: '헬륨 원자핵 하나가 만들어질 때 필요한 수소 원자핵의 수를 확인해 보세요.',
  starmass: '질량이 큰 별일수록 중심부 온도가 더 높아져 더 무거운 원소까지 만들 수 있습니다. 태양과 비슷한 질량의 별은 철까지 만들지 못합니다.',
  nova: '철은 폭발 "전" 별의 중심부에서 만들어지는 마지막 원소이고, 철보다 무거운 원소는 초신성 폭발 "과정"에서 만들어집니다. 순서를 다시 생각해 보세요.',
  novaSlot: '초신성 폭발 과정에서는 어떤 원소가 만들어지는지 떠올려 보세요. 특정 원소 이름이 아니라 "철보다 무거운 원소"입니다.',
  spheres: '각 요소가 공기(기권), 물(수권), 암석·토양(지권), 생명체(생물권) 중 무엇에 해당하는지 다시 생각해 보세요. 빙하는 얼어 있어도 물입니다.',
  energy: '지진과 화산 활동은 지구 내부에서 공급되는 에너지와 관련이 있습니다. 날씨와 물의 순환, 광합성은 태양 에너지, 밀물과 썰물은 조력 에너지와 관련됩니다.',
  water: '물은 태양 에너지를 흡수해 증발한 뒤, 수증기 → 응결 → 구름 → 강수의 순서로 이동하여 다시 바다로 돌아갑니다.',
  carbon: '광합성 과정에서 기권의 이산화 탄소가 어느 권역으로 이동하는지 생각해 보세요. 생물의 사체가 묻히면 지권의 화석 연료가 되고, 연소하면 다시 기권으로 돌아갑니다.',
  r3lock: '탄소 캡슐이 지나간 권역의 순서(기록 화면 참고)를 각 권역의 아이콘으로 바꾸어 보세요.',
  layers: '암석권은 지각만이 아니라 지각과 상부 맨틀의 일부를 포함하는 단단한 부분입니다. 연약권은 그 아래에서 유동성을 띠는 부분입니다.',
  motion: '두 판의 이동 방향과, 그 경계에서 판이 생성되거나 소멸하는지를 함께 확인해 보세요.',
  landform: '해령·열곡대는 판이 멀어지는 곳, 변환 단층은 판이 어긋나는 곳, 해구·호상열도·습곡 산맥은 판이 가까워지는 곳에서 만들어집니다.',
  map: '지진과 화산은 아무 곳에서나 일어나지 않습니다. 점들이 좁고 긴 띠 모양으로 밀집한 구역만 선택해 보세요.',
  mapQuiz: '보존형 경계에서는 두 판이 어긋나기만 하므로 지진은 활발하지만 화산 활동은 거의 나타나지 않습니다.',
  r4lock: '판이 "생성"되는 경계 → 생성도 소멸도 없는 경계 → "섭입·충돌"하는 경계 순서로 설정해야 합니다.',
  chips: '우주의 역사 순서를 떠올려 보세요. 초기 우주의 원자 형성 → 별 내부의 수소 핵융합 → 지구시스템의 구성 → 판 구조론.',
  finalCode: '배열한 칩의 숫자를 왼쪽부터 순서대로 이어 붙여 보세요. 38 · 4 · 4 · 3.',
};

/* ---------- 3단계 힌트 ---------- */
const HINTS = {
  'r1-spectrum': [
    '빛을 내는 방식이 다르면 스펙트럼의 모양도 달라집니다. 밝은 선과 검은 선이 각각 언제 생기는지 떠올려 보세요.',
    '고온의 기체는 특정 위치에 "밝은 선"을, 백색광이 저온의 기체를 통과하면 같은 위치에 "검은 선"을 만듭니다. 별 스펙트럼의 검은 선 위치를 원소의 밝은 선 위치와 겹쳐 보세요.',
    '백색 광원 → 연속 스펙트럼, 고온의 기체 → 방출 스펙트럼, 백색 광원+저온 기체 → 흡수 스펙트럼. 이 별에는 수소와 헬륨이 들어 있습니다.',
  ],
  'r1-timeline': [
    '크기가 작은 입자부터 만들어졌습니다. 쿼크 → ? → 원자핵 → 원자 순서를 생각해 보세요.',
    '헬륨 원자핵이 만들어지려면 먼저 양성자와 중성자가 존재해야 합니다. 카드 4장을 아직 다 모으지 못했다면 스펙트럼 자료, 서랍, 우주 시계, 게시판을 조사해 보세요.',
    '정답: 쿼크와 전자 생성 → 양성자와 중성자 생성 → 헬륨 원자핵 생성 → 원자 생성.',
  ],
  'r1-nucleo': [
    '헬륨 원자핵 1개는 양성자 2개와 중성자 2개로 이루어집니다.',
    '중성자가 2개뿐이므로 헬륨 원자핵은 1개만 만들 수 있습니다. 남은 양성자 12개는 각각 수소 원자핵이 됩니다.',
    '수소 원자핵 전체 질량 12, 헬륨 원자핵 전체 질량 4. 가장 간단한 비로 나타내면 3 : 1입니다.',
  ],
  'r1-light': [
    '전자가 자유롭게 돌아다닐 때 빛은 전자와 계속 상호작용하여 곧게 나아가지 못합니다.',
    '관측실 A(원자 형성 전)에는 원자핵·자유 전자·꺾여 진행하는 빛을, 관측실 B(원자 형성 후)에는 원자·곧게 진행하는 빛을 배치하세요.',
    '빈칸의 정답은 약 38만 년, 약 3000 K, 원자입니다. 오늘날 관측되는 이 빛은 우주 배경 복사입니다.',
  ],
  'r1-door': [
    '투명 필름에는 숫자가 아니라 "읽는 순서"가 그려져 있습니다. 인벤토리에서 필름을 다시 확인해 보세요.',
    '우주 시계(3) → 질량 저울(3:1) → 우주 달력(38)의 숫자를 순서대로 이어 붙이세요.',
    '숫자 자물쇠의 마지막 두 자리는 38입니다.',
  ],
  'r2-film': [
    '별은 성간 물질이 중력으로 모이면서 만들어집니다. 필름 조각이 부족하다면 방 안의 장치들을 더 조사해 보세요.',
    '성간 물질 → 성운 → 수축 → 원시별 → 온도 상승 → 핵융합 시작의 흐름을 생각해 보세요.',
    '정답 순서: 성간 물질 → 성운 형성 → 중력 수축 → 원시별 형성 → 중심부 온도 상승 → 수소 핵융합 시작.',
  ],
  'r2-fusion': [
    '수소 핵융합에서는 수소 원자핵 여러 개가 모여 헬륨 원자핵 1개가 되면서 에너지가 방출됩니다.',
    '헬륨 원자핵 하나가 만들어질 때 필요한 수소 원자핵의 수를 확인해 보세요. 방 1에서 만든 헬륨 원자핵의 구성(양성자 2 + 중성자 2)도 참고가 됩니다.',
    '수소 원자핵 4개를 반응기에 넣고 가동하세요.',
  ],
  'r2-starmass': [
    '질량이 큰 별일수록 중심부 온도가 더 높아져 더 무거운 원소까지 만들 수 있습니다.',
    '태양과 비슷한 질량의 별은 철까지 만들지 못하고, 철은 질량이 훨씬 큰 별의 중심부에서만 만들어집니다.',
    '태양과 비슷한 별 → 탄소, 태양보다 훨씬 큰 별 → 철.',
  ],
  'r2-nova': [
    '중심부에 철이 만들어진 뒤에는 별이 더 이상 중심부 핵융합으로 에너지를 만들기 어려워집니다.',
    '중심부가 급격히 수축한 다음 폭발이 일어나고, 철보다 무거운 원소는 그 폭발 "과정"에서 만들어집니다.',
    '정답: 철 생성 → 중심부 수축 → 초신성 폭발 → 철보다 무거운 원소 생성 → 원소 방출 → 새로운 별·행성의 재료.',
  ],
  'r2-door': [
    '이 방에서 얻은 인증판과 문양들이 네 장치의 답을 알려 줍니다. 인벤토리를 확인해 보세요.',
    '숫자 다이얼은 핵융합 인증판의 숫자, 두 별 장치는 각 별의 중심부에서 최종적으로 만들어지는 원소입니다.',
    '다이얼 4, 작은 별 → 탄소, 큰 별 → 철, 초신성 슬롯 → 철보다 무거운 원소.',
  ],
  'r3-spheres': [
    '기권은 공기, 수권은 물, 지권은 암석·토양·지구 내부, 생물권은 생명체입니다.',
    '빙하는 얼어 있어도 "물"이므로 수권입니다. 지하수도 수권입니다.',
    '공기→기권 / 바닷물·강물·지하수·빙하→수권 / 암석·토양·지구 내부→지권 / 생명체→생물권.',
  ],
  'r3-energy': [
    '지진과 화산 활동은 지구 내부에서 공급되는 에너지와 관련이 있습니다.',
    '날씨·물의 순환·광합성·생명활동은 태양 에너지, 밀물과 썰물·해수면 높이 변화는 조력 에너지와 관련됩니다.',
    '태양: 대기와 물의 순환·기상 현상·광합성·생명활동 / 지구 내부: 판의 이동·지진·화산 활동·지각 변동 / 조력: 밀물과 썰물·해수면 높이 변화.',
  ],
  'r3-water': [
    '물의 순환은 물이 태양 에너지를 흡수해 증발하면서 시작됩니다.',
    '증발 → 수증기 → 응결 → 구름 → 강수 순서를 떠올려 보세요. 내린 비는 하천수와 지하수가 되어 바다로 흘러갑니다.',
    '정답: 태양 에너지 흡수 → 증발 → 기권의 수증기 → 응결 → 구름 → 강수 → 하천수와 지하수 → 바다로 이동.',
  ],
  'r3-carbon': [
    '광합성 과정에서 기권의 이산화 탄소가 어느 권역으로 이동하는지 생각해 보세요.',
    '생물의 사체가 오랜 시간 묻히면 지권의 화석 연료가 되고, 화석 연료가 연소하면 탄소는 다시 기권으로 돌아갑니다.',
    '경로: 기권 → (광합성) 생물권 → (매몰) 지권 → (연소) 기권.',
  ],
  'r3-door': [
    '탄소 캡슐이 지나간 권역의 "순서"가 곧 자물쇠의 암호입니다.',
    '기권 → 생물권 → 지권 → 기권 순서를 각 권역의 아이콘으로 바꾸어 보세요.',
    '아이콘 순서: 구름 → 잎 → 암석 → 구름.',
  ],
  'r4-layers': [
    '암석권은 "지각"과 같은 말이 아닙니다.',
    '암석권 = 지각 + 상부 맨틀의 일부. 연약권은 암석권 아래에서 유동성을 띠는 층입니다.',
    '맨 위 얇은 층은 지각, 그 아래 단단한 층은 상부 맨틀의 일부. 이 둘을 묶은 단단한 판이 암석권이고, 그 아래가 연약권입니다.',
  ],
  'r4-motion': [
    '두 판의 이동 방향과, 판이 생성되거나 소멸하는지를 함께 확인해 보세요.',
    '새로운 지각이 생기는 곳은 판이 서로 멀어지는 곳이고, 섭입·충돌은 판이 서로 가까워지는 곳에서 일어납니다.',
    '발산형: 서로 멀어짐(← →) / 보존형: 서로 어긋남 / 수렴형: 서로 가까워짐(→ ←).',
  ],
  'r4-landform': [
    '해령에서는 새로운 해양 지각이 만들어집니다. 어떤 경계일까요?',
    '해구·호상열도·습곡 산맥은 판이 가까워지며 섭입하거나 충돌할 때 만들어집니다.',
    '발산형: 해령·열곡대 / 보존형: 변환 단층 / 수렴형: 해구·호상열도·습곡 산맥.',
  ],
  'r4-map': [
    '지진과 화산은 아무 곳에서나 일어나지 않고 특정 지역에 띠 모양으로 밀집되어 있습니다.',
    '점들이 좁고 길게 이어진 구역만 고르세요. 드문드문 흩어진 곳은 판 경계가 아닙니다.',
    '점이 빽빽한 세 구역(왼쪽 세로 띠, 가운데 사선 띠, 오른쪽 아래 가로 띠)이 판 경계입니다. 화산 없이 지진만 활발한 곳이 보존형 경계입니다.',
  ],
  'r4-door': [
    '판이 "생성"되는 경계에서는 두 판이 서로 멀어집니다.',
    '생성 → 보존(생성·소멸 없음) → 소멸(섭입·충돌) 순서로 설정하세요.',
    '슬라이더 순서: 발산형 → 보존형 → 수렴형.',
  ],
  'final-chips': [
    '우주의 역사가 진행된 순서를 떠올려 보세요.',
    '초기 우주의 원자 형성 → 별 내부의 수소 핵융합 → 지구시스템의 구성 → 판 구조론 순서입니다.',
    '칩 숫자 순서: 38 → 4 → 4 → 3.',
  ],
  'final-code': [
    '배열한 칩의 숫자를 왼쪽부터 그대로 이어 붙이면 5자리 좌표가 됩니다.',
    '38, 4, 4, 3을 이어 붙여 보세요.',
    '최종 시간 좌표는 38443입니다.',
  ],
};

/* ---------- 프롤로그 장면 ---------- */
const PROLOGUE = [
  { step: 'PROLOGUE 1/7', t: '현재, 통합과학 실험실', d: '한 학기 동안의 수업 기록이 모니터에 흐르고 있다. 실험대 위에는 시험 가동을 앞둔 타임머신이 조용히 놓여 있다.', fx: 'fx-lab' },
  { step: 'PROLOGUE 2/7', t: '타임머신 전원 ON', d: '"시간 좌표 시스템을 초기화합니다…" 장치가 낮게 울리며 청록색 빛을 내기 시작한다.', fx: 'fx-power' },
  { step: 'PROLOGUE 3/7', t: '⚠ 경고', d: '"좌표 연산 오류 발생. 시간 좌표가 불안정합니다." 계기판의 숫자가 제멋대로 뒤엉키기 시작한다!', fx: 'fx-warn' },
  { step: 'PROLOGUE 4/7', t: '시간 좌표 오류', d: '제어할 수 없는 빛이 실험실을 가득 채운다. 바닥이 흔들리고, 시야가 하얗게 물든다!', fx: 'fx-flash' },
  { step: 'PROLOGUE 5/7', t: '시간 좌표 칩 분리', d: '타임머신의 시간 좌표가 네 조각의 칩으로 분리되어 시공간 곳곳으로 흩어져 버렸다.', fx: 'fx-chips' },
  { step: 'PROLOGUE 6/7', t: '……', d: '긴 침묵. 눈을 뜨자 사방은 깊은 어둠, 그리고 아주 미세한 빛의 흔적뿐이다.', fx: 'fx-dark' },
  { step: 'PROLOGUE 7/7', t: '약 138억 년 전, 초기 우주에 도착했습니다', d: '네 개의 시간 좌표 칩을 모두 회수하고 우주의 역사 순서대로 배열해야 현재로 돌아올 수 있습니다. 먼저 눈앞의 「초기 우주 연구소」를 조사하세요.', fx: 'fx-arrive' },
];

/* ---------- 방 통과 정리 문구 ---------- */
const ROOM_CLEAR = {
  1: {
    chip: 'chip1', num: '38', name: '시간 좌표 칩 ① — 원자가 형성된 빅뱅 후 약 38만 년',
    summary: '초기 우주에서는 쿼크와 전자 → 양성자와 중성자 → 헬륨 원자핵 → 원자의 순서로 물질이 만들어졌고, 원자가 형성되자 자유로워진 빛이 오늘날 우주 배경 복사로 관측됩니다. 천체의 스펙트럼을 비교하면 직접 가 보지 않고도 구성 원소를 알 수 있습니다.',
    next: '수소와 헬륨은 별의 재료가 됩니다. 다음 공간: 별의 원소 생성실.',
  },
  2: {
    chip: 'chip2', num: '4', name: '시간 좌표 칩 ② — 헬륨 원자핵 하나를 만드는 데 필요한 수소 원자핵의 수',
    summary: '별의 내부에서는 핵융합 반응으로 무거운 원소가 만들어지며, 생성 가능한 원소는 별의 질량과 진화 과정에 따라 달라집니다. 별에서 방출된 원소는 새로운 별과 행성, 그리고 우리 몸의 재료가 됩니다.',
    next: '별에서 만들어진 원소가 지구를 이룹니다. 다음 공간: 지구시스템 관제실.',
  },
  3: {
    chip: 'chip3', num: '4', name: '시간 좌표 칩 ③ — 지구시스템을 구성하는 네 권역',
    summary: '지구시스템의 여러 권역(기권·수권·지권·생물권)은 물질을 순환시키고 에너지를 주고받으며 서로 영향을 미칩니다.',
    next: '지구 내부 에너지는 지권을 움직입니다. 다음 공간: 판 구조 제어실.',
  },
  4: {
    chip: 'chip4', num: '3', name: '시간 좌표 칩 ④ — 판 경계의 세 가지 유형',
    summary: '판의 상대적인 이동 방향에 따라 발산형·보존형·수렴형 경계가 형성되며, 서로 다른 지형과 지각 변동이 나타납니다. 지진대와 화산대는 판의 경계와 대체로 일치합니다.',
    next: '네 개의 시간 좌표 칩을 모두 모았습니다! 타임머신으로 이동합니다.',
  },
};

/* ---------- 프롤로그 장면 아이콘 ---------- */
const PRO_ICONS = ['🧪', '⚡', '🚨', '🌀', '💠', '🌑', '🌌'];

/* ---------- 관제 AI 「K.O.S.M.O.」 교신 대사 ---------- */
const AI_LINES = {
  boot: '관제 AI K.O.S.M.O. 접속 완료. 대원들, 들리나? 지금부터 내가 귀환을 지원한다.',
  room: {
    1: '여긴 초기 우주 관측 구역. 분광 분석기부터 살펴보자 — 빛이 모든 단서를 쥐고 있다.',
    2: '성운 구역 진입. 별이 태어나는 곳이다. 흩어진 필름 조각부터 회수하자.',
    3: '지구시스템 관제실이다. 끊어진 권역 회로를 복구해야 한다. 중앙의 지구 모형을 조사해 봐.',
    4: '마지막 구역, 판 구조 제어실. 발밑의 맨틀이 아직 뜨겁다. 지구 단면부터 조립하자.',
  },
  solve: {
    'r1-spectrum': '분광 분석기 복구! 별빛의 검은 선이 원소의 지문이라는 걸 증명했군.',
    'r1-timeline': '우주 시계 재가동. 쿼크에서 원자까지 — 순서가 완벽하다.',
    'r1-nucleo': '질량비 3:1 확인. 계산까지 정확하다. 저쪽 관측 화면이 깨어난다.',
    'r1-light': '우주 배경 복사 수신! 138억 년 전의 빛이 우리에게 문을 열어 줬다.',
    'r1-door': '패드락 해제. 첫 번째 좌표 칩 확보!',
    'r2-film': '필름 복원 완료. 성운 속에서 원시별이 눈을 떴다.',
    'r2-fusion': '핵융합 점화! 수소 4개가 헬륨이 되며 에너지가 쏟아진다.',
    'r2-starmass': '정확한 분석이다. 별은 질량에 따라 만들 수 있는 원소가 다르지.',
    'r2-nova': '초신성 기록 복구. 우리 몸의 무거운 원소도 저 폭발에서 왔다.',
    'r2-door': '복합 자물쇠 해제. 두 번째 칩 확보!',
    'r3-spheres': '네 권역 분류 완료. 지구 모형에 빛이 돌기 시작한다.',
    'r3-energy': '세 에너지원 연결 완료. 관제실 전력 정상화.',
    'r3-water': '물 순환 재가동. 저 작은 물방울 하나가 날씨를 만든다.',
    'r3-carbon': '탄소 캡슐 귀환. 지나간 권역 순서를 기록해 뒀다 — 출구 자물쇠에 쓰일 거다.',
    'r3-door': '아이콘 자물쇠 해제. 세 번째 칩이다!',
    'r4-layers': '암석권·연약권 복구 확인. 맨틀 대류가 다시 흐른다.',
    'r4-motion': '판 이동 방향 설정 완료. 자석 보관함이 열렸다.',
    'r4-landform': '지형 매칭 완료. 분포 지도에 전원이 들어온다.',
    'r4-map': '판 경계 확인! 지진대가 경계를 따라 빛나고 있다.',
    'r4-door': '슬라이더 자물쇠 해제. 마지막 칩이 우리 손에!',
    'final-chips': '좌표 칩 배열 승인. 이제 최종 좌표만 남았다.',
  },
  wrong: [
    '괜찮다, 실패도 데이터다. 피드백을 다시 읽어 보자.',
    '침착하게. 개념을 하나씩 다시 짚어 봐.',
    '아깝다! 막히면 힌트 버튼도 전략이다.',
    '오답 기록됨. 하지만 시간은 아직 우리 편이다.',
  ],
  stab: {
    75: '주의: 시공간 안정도 75% 이하. 서두르되, 정확하게.',
    50: '경고: 안정도 50%. 오답이 늘수록 좌표가 흔들린다!',
    25: '위험: 안정도 25%! 귀환 좌표가 요동친다. 집중해라, 대원들!',
  },
  final: '모든 칩 확보 확인. 타임머신 콘솔로 — 우주의 역사 순서를 기억해라.',
  escape: '좌표 승인. 잘했다, 대원들. 이제 집으로 돌아가자.',
};

const FINAL_MESSAGE = [
  '초기 우주에서 만들어진 원소는 별의 재료가 되었습니다.',
  '별에서 만들어진 원소는 지구와 생명체를 이루었습니다.',
  '지구의 여러 권역은 물질과 에너지를 주고받으며 하나의 시스템을 이루고 있습니다.',
  '그리고 지구 내부 에너지는 판을 움직여 오늘날에도 지구의 모습을 변화시키고 있습니다.',
];
