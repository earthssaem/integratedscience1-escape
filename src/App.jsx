import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as THREE from "three";

/* ================================================================
   ARKHE — 138억 년의 귀환 : 통합과학 복습 방탈출
   (오프라인 버전 — 기록은 저장되지 않으며, 엔딩에서 결과 보고서
    이미지를 저장해 선생님께 제출합니다.)
   ================================================================ */

/* ---------- 팔레트 ---------- */
const C = {
  void: "#04060d",
  panel: "rgba(10,16,28,0.92)",
  line: "#1b2a40",
  hud: "#8be9fd",
  dim: "#5a7a9a",
  text: "#dbe7f4",
  ok: "#4ade80",
  bad: "#fb7185",
  warn: "#fbbf24",
};

/* ---------- 방 정의 ---------- */
const ROOMS = [
  { name: "ROOM 01 — 불투명한 우주", era: "빅뱅 직후 · 138억 년 전", tint: "#c2410c" },
  { name: "ROOM 02 — 별의 용광로", era: "항성 내부 · 약 100억 년 전", tint: "#dc2626" },
  { name: "ROOM 03 — 원시 지구", era: "46억 년 전", tint: "#9a3412" },
  { name: "ROOM 04 — 살아있는 시스템", era: "현재 · 지구 궤도", tint: "#2563eb" },
  { name: "ROOM 05 — 귀환 좌표", era: "현재 · 착륙 시퀀스", tint: "#0d9488" },
];

/* ---------- 미션(스텝) 정의 ---------- */
const STEPS = [
  {
    room: 0, kind: "order", label: "MISSION 1-1 · 광학 센서 보정",
    intro: "빛이 전하를 띤 입자들에 산란되어 시야 확보가 불가능합니다. 이 시대의 입자 생성 순서를 재구성하면 센서를 보정할 수 있습니다. 가장 먼저 생성된 입자부터 순서대로 선택하십시오.",
    hint: "출발점은 더 이상 쪼갤 수 없는 기본 입자입니다. 쿼크 3개가 결합하면 무엇이 됩니까? 그리고 그것들이 뭉치면?",
    success: "원자 생성 확인. 전기적으로 중성인 원자는 빛의 진로를 막지 않습니다. 빛이 직진합니다 — 우주가 투명해졌습니다.",
  },
  {
    room: 0, kind: "mcq", label: "MISSION 1-2 · 미지 신호 해독",
    intro: "전 방향에서 거의 같은 세기의 희미한 빛 신호를 감지했습니다. 방금 원자가 생성되면서 우주 공간으로 풀려난 바로 그 빛입니다. 신호의 정체를 규명해야 항법 센서를 켤 수 있습니다.",
    hint: "훗날 펜지어스와 윌슨이 관측하게 될 신호입니다. 약 3 K 물체가 방출하는 복사와 일치합니다.",
    success: "신호 해독 완료. 이 빛이 온 우주를 채우고 있다는 사실은, 우주가 한 점의 대폭발에서 시작되었다는 결정적 증거입니다. 항법 센서 온라인.",
    questions: [
      { q: "원자 생성 직후 우주 전체로 퍼져 나가, 지금도 모든 방향에서 관측되는 이 빛의 이름은?", options: ["오로라", "우주 배경 복사", "방출 스펙트럼", "태양 복사 에너지"], a: 1 },
      { q: "이 신호의 존재가 결정적으로 지지하는 우주론은?", options: ["정상 우주론", "빅뱅 우주론"], a: 1 },
    ],
  },
  {
    room: 0, kind: "spectrum", label: "MISSION 1-3 · 점프 목표 항성 식별",
    intro: "점프할 목표 항성 '별 A'의 흡수 스펙트럼을 수신했습니다. 아래 원소 기준선과 대조하여, 별 A에 존재하는 원소를 모두 선택하십시오. 조성이 확인되면 좌표가 고정됩니다.",
    hint: "원소 기준선의 위치와 별 A 스펙트럼의 검은 흡수선 위치가 겹치면, 그 원소가 별 A에 존재한다는 뜻입니다. 하나씩 위치를 대조하십시오.",
    success: "별 A 조성 확인 — 수소, 헬륨, 나트륨. 어느 별을 보아도 수소와 헬륨이 가장 풍부합니다. 빅뱅의 유산입니다. 좌표 고정, 점프합니다.",
  },
  {
    room: 1, kind: "fusion", label: "MISSION 2-1 · 융합로 재가동",
    intro: "항성 내부 진입. 엔진 재점화에는 이 별과 같은 방식의 에너지가 필요합니다. 융합로에 입자를 투입해 헬륨 원자핵을 조립하십시오.",
    hint: "헬륨 원자핵은 양성자 2개와 중성자 2개가 강하게 결합한 입자입니다.",
    success: "융합 성공. 반응 후 줄어든 질량이 에너지로 방출됩니다. E = mc². 엔진 예열 개시.",
  },
  {
    room: 1, kind: "code", label: "MISSION 2-2 · 점화 온도 입력",
    intro: "융합로 점화 온도를 입력하십시오. 별의 중심에서 수소 핵융합 반응이 시작되는 최소 온도입니다.",
    hint: "'천만 K'. 단위가 '만 K'이므로 네 자리 숫자를 입력해야 합니다.",
    success: "1000만 K — 점화 조건 충족. 수소 원자핵 4개가 헬륨 원자핵 1개로 융합됩니다. 엔진 출력 정상.",
    codeLabel: "수소 핵융합 점화 온도", codeUnit: "만 K", answer: "1000", ph: "숫자 입력",
  },
  {
    room: 1, kind: "supernova", label: "MISSION 2-3 · 충격파 항해",
    intro: "경고 — 전방에 핵융합이 멈춘 별 두 개를 감지했습니다. 초신성 폭발의 충격파를 추진력으로 사용할 것입니다. 내부 구조를 분석해, 곧 초신성 폭발이 일어날 별을 선택하십시오.",
    hint: "질량이 태양의 10배 이상인 별만 중심에 철(Fe)을 만들 수 있습니다. 철은 매우 안정하여 더 이상 융합하지 못하고, 별은 붕괴 후 폭발합니다.",
    success: "대질량 항성 붕괴 감지 — 초신성 폭발. 충격파 탑승 성공. 지금 이 폭발 속에서 철보다 무거운 금, 납, 우라늄이 태어나고 있습니다.",
  },
  {
    room: 2, kind: "blackhole", label: "MISSION 3-1 · 회피 기동",
    intro: "점프 항로 전방에서 거대한 별이 진화의 마지막 단계에 접어들었습니다. 주계열성일 때 질량이 태양의 약 25배였던 별입니다. 진화 경로의 마지막 갈림길을 채워, 이 별이 무엇이 되는지 판단하십시오.",
    hint: "주계열성일 때 질량이 태양의 10~20배이면 중성자별, 20배 이상이면 더 무거운 천체가 됩니다. 빛조차 빠져나오지 못하는…",
    success: "블랙홀 형성 예측 — 회피 기동 성공. 사건의 지평선을 스치듯 통과했습니다. 목표: 46억 년 전, 원시 지구.",
  },
  {
    room: 2, kind: "formation", label: "MISSION 3-2 · 지구 형성 과정 복원",
    intro: "원시 지구 상공 도착. 지표 전체가 마그마 바다입니다. 미래의 착륙 지점을 예측하려면, 이 행성이 어떻게 만들어지는지 형성 과정을 순서대로 복원해야 합니다. 가장 먼저 일어난 사건부터 순서대로 선택하십시오.",
    hint: "충돌로 지구가 뭉치고 → 열로 전체가 녹고 → 무거운 물질이 가라앉아 핵을, 가벼운 물질이 떠올라 맨틀을 이루고 → 식으면서 지각과 바다가 생깁니다.",
    success: "형성 과정 복원 완료. 무거운 철·니켈은 가라앉아 핵을, 가벼운 규산염은 떠올라 맨틀을 이룹니다. 지각이 식고 바다가 생기면 — 최초의 생명이 깨어납니다. 다음 점프, 현재.",
  },
  {
    room: 3, kind: "wiring", label: "MISSION 4-1 · 시스템 상호작용 인증",
    intro: "현재 시간대 도착. 지구 궤도 진입에는 인증이 필요합니다. 1단계 — 이 행성의 각 권이 주고받는 상호작용 회로를 연결하십시오.",
    hint: "'무엇이 무엇에게 영향을 주는가'로 판단하십시오. 화산은 땅(지권)의 물질을 대기(기권)로 내보냅니다.",
    success: "회로 연결 완료. 이 행성의 지권·기권·수권·생물권은 서로 물질과 에너지를 교환하며 균형을 이룹니다.",
  },
  {
    room: 3, kind: "water2", label: "MISSION 4-2 · 물 순환 데이터 해독",
    intro: "인증 2단계 — 물 순환 모식도를 해독하십시오. 대기의 입장에서, 1년 동안 대기로 들어오는 물의 총량(유입량)과 대기에서 나가는 물의 총량(유출량)을 각각 계산해 입력하십시오.",
    hint: "대기로 들어오는 것은 '증발'(바다에서 320 + 육지에서 60), 대기에서 나가는 것은 '강수'(바다로 284 + 육지로 96)입니다.",
    success: "유입량 380, 유출량 380 — 정확합니다. 대기로 들어온 만큼 그대로 빠져나갑니다. 유입량 = 유출량, 이 행성의 물은 완벽한 평형 상태입니다. 궤도 진입 승인.",
  },
  {
    room: 4, kind: "scan", label: "MISSION 5-1 · 지표 위험 스캔",
    intro: "착륙 지점 탐색 중. 지표 스캔 결과 — 지진 다발 지역과 화산 다발 지역이 띠 모양으로 거의 겹칩니다. 이 위험 지대의 정체를 규명하십시오.",
    hint: "지구 표면은 여러 개의 판으로 나뉘어 있고, 지각 변동은 판과 판이 만나는 곳에 집중됩니다.",
    success: "변동대 식별 완료. 지진대와 화산대는 대부분 판의 경계와 일치합니다. 경계를 피해 착륙해야 합니다.",
    questions: [
      { q: "지진대와 화산대가 거의 일치하며 띠 모양으로 분포하는 이 지역의 정체는?", options: ["대륙의 중심부", "판의 경계 (변동대)", "적도 부근", "해안선"], a: 1 },
      { q: "이러한 지각 변동을 일으키는 에너지원은?", options: ["태양 에너지", "조력 에너지", "지구 내부 에너지"], a: 2 },
    ],
  },
  {
    room: 4, kind: "match", label: "MISSION 5-2 · 안전 착륙 좌표 확정",
    intro: "최종 단계. 지표의 대표 지형 4곳의 판 경계 유형을 분석하십시오. 분석이 완료되면 안전 착륙 좌표가 확정됩니다.",
    hint: "두 대륙판이 충돌하면 습곡 산맥, 판이 다른 판 밑으로 섭입하면 해구, 판이 갈라지면 해령, 판이 어긋나며 스치면 변환 단층이 발달합니다.",
    success: "좌표 확정. 착륙 시퀀스 개시. — 138억 년의 항해였습니다. 승무원, 귀환을 환영합니다.",
  },
];

/* 대화 캐릭터 — TEACHER_NAME을 원하는 이름으로 바꾸세요 */
const TEACHER_NAME = "연경썜";
const SPK = {
  T: { name: TEACHER_NAME, emoji: "🧑\u200d🔬", color: "#ffd166" },
  A: { name: "ARKHE-AI", emoji: "🛰️", color: "#8be9fd" },
};
/* 대화 스크립트 */
const DLG = {
  enter: [
    [
      { s: "T", t: "…들려?! 나야, 연경썜! 관제소에서 겨우 통신을 연결했어. 지금 네가 있는 곳은 138억 년 전, 빅뱅 직후라고!" },
      { s: "A", t: "통신 링크 안정화 완료. 발신자 신원 확인 — 지구 관제소, 과학 교사." },
      { s: "T", t: "침착하게 들어. 각 시대의 과학을 네가 직접 증명해야 다음 시대로 점프할 수 있어. 전부 수업 시간에 배운 거야. 넌 할 수 있어!" },
      { s: "T", t: "우선 저기 빛나는 입자 가속기 콘솔부터 가봐! 이 안개, 빛이 왜 퍼지지 못하는지부터 알아내야 해. 천천히 걸어!" },
    ],
    [
      { s: "T", t: "여긴 별의 내부야! 잠깐— 열 차폐 수치가 떨어지고 있어. 복도 끝의 융합로부터 먼저 재가동해, 서둘러!!" },
      { s: "A", t: "잔여 차폐 시간: 임무 수행에 충분. 단, 신속한 진행을 권장." },
      { s: "T", t: "'충분'이래… 기계는 참 태평하다니까. 아무튼 뛰어!" },
    ],
    [
      { s: "T", t: "조심해!! 여긴 벽이 없어. 발밑이 전부 마그마 바다라고! 발판 다리는 한가운데로, 천천히 건너." },
      { s: "A", t: "낙하 감지 시 자동 회수 프로토콜 가동. 시간 손실: 10초." },
      { s: "T", t: "스캐너랑 시뮬레이터가 서로 다른 발판 위에 있어. 떨어지지 마… 아니, 안 떨어질 거라 믿는다?" },
    ],
    [
      { s: "T", t: "우와… 창밖에 지구 보여? 진짜 아름답다……. 아니지! 감상은 착륙하고 나서. 궤도 진입 인증부터 하자." },
      { s: "T", t: "장치 하나는 위층 갑판에 있어. 계단을 찾아서 올라가 봐!" },
    ],
    [
      { s: "T", t: "마지막 방이야! 중앙의 홀로그램 지구 보이지? 착륙 지점만 확정하면 진짜 집에 가는 거야." },
      { s: "A", t: "경고: 판 경계 지역 착륙 시 생존 확률 급감. 정밀 분석 요망." },
      { s: "T", t: "…그러니까 지진대는 피해서 내리자는 얘기야. 거의 다 왔어, 힘내!" },
    ],
  ],
  gate: [
    [{ s: "T", t: "우주가 투명해졌어! 봤지? 원자가 생기니까 빛이 자유로워진 거야. 게이트 열렸어 — 다음 시대로!" }],
    [{ s: "T", t: "융합 에너지 확보! 철까지의 원소가 어디서 왔는지 이제 알겠지? 게이트로 뛰어!" }],
    [{ s: "T", t: "핵과 맨틀 분리 확인! 지구가 만들어지는 과정을 직접 본 거야. 자, 현재로 점프!" }],
    [{ s: "T", t: "궤도 진입 승인!! 이제 진짜 마지막 관문이야. 게이트로!" }],
    [{ s: "T", t: "착륙 좌표 확정!! …138억 년을 건너왔네, 우리. 수고했어, 진짜로. 게이트에서 보자!" }],
  ],
  urgentStar: [
    { s: "T", t: "어어, 잠깐!! 전방 스캔에 뭔가 잡혔어 — 핵융합이 멈춘 별이야! 이건 미룰 수 없어!" },
    { s: "A", t: "권고: 즉시 항성 관측창으로 이동, 폭발 임박 항성을 식별할 것." },
    { s: "T", t: "폭발 충격파를 타고 탈출해야 해. 지금 당장 관측창으로!!" },
  ],
  crystal: [{ s: "T", t: "오!! 그거 크로노 크리스털이잖아! 어떻게 찾았어? 방금 기록 20초 벌었어!" }],
};

const WRONG_LINES = [
  "판단 오류. 시간 축이 불안정해집니다. (+30초)",
  "오답 — 항법 데이터를 재계산합니다. (+30초)",
  "경고: 잘못된 입력이 감지되었습니다. (+30초)",
];

const PROLOGUE = [
  "… 시스템 재부팅 완료.",
  "여기는 탐사선 아르케(ARKHE) 호. 시간 항법 장치 폭주로 인해 현재 위치 — 138억 년 전, 빅뱅 직후.",
  "귀환 방법은 단 하나. 각 시대의 과학 법칙을 재구성하여 다음 시대로의 점프 좌표를 여는 것입니다.",
  "다섯 번의 점프. 다섯 개의 시대. 오답과 힌트는 시간 손실을 유발합니다.",
  "승무원, 준비되면 귀환 프로토콜을 시작하십시오.",
];

/* ---------- 유틸 ---------- */
const fmt = (s) => {
  s = Math.max(0, Math.floor(s));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
};
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- 결과 보고서 이미지 ----------
   엔딩에서 결과를 PNG 이미지로 만들어 저장(다운로드)합니다.
   학생은 저장한 이미지를 선생님께 제출하면 됩니다. */
const submitCode = (rec) => {
  // 보고서 위변조를 어렵게 하는 간단한 제출 확인 코드 (교사 검증용)
  const src = `${rec.nick}|${rec.t}|${rec.w}|${rec.h}|${rec.e}`;
  let acc = 7;
  for (let i = 0; i < src.length; i++) acc = (acc * 31 + src.charCodeAt(i)) % 1679615;
  return acc.toString(36).toUpperCase().padStart(4, "0");
};

function buildReportCanvas(rec) {
  const W = 1080, H = 1560;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");

  // 레트로 폰트: 영문/숫자 강조 = Press Start 2P, 한글·혼합 = 둥근모
  const PX = "'Press Start 2P'";
  const DGM = "'DungGeunMo', monospace";
  // 주어진 최대 폭에 맞게 폰트 크기를 자동 축소(픽셀 폰트가 넓어 오버플로 방지)
  const fitFont = (text, weight, family, maxSize, maxWidth) => {
    let size = maxSize;
    for (; size > 8; size -= 2) {
      ctx.font = `${weight} ${size}px ${family}`;
      if (ctx.measureText(text).width <= maxWidth) break;
    }
    return `${weight} ${size}px ${family}`;
  };

  // 배경
  const bg = ctx.createRadialGradient(W / 2, H * 1.1, 80, W / 2, H * 1.1, H);
  bg.addColorStop(0, "#12305e");
  bg.addColorStop(1, "#04060d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // 별
  for (let i = 0; i < 160; i++) {
    ctx.globalAlpha = Math.random() * 0.7 + 0.15;
    ctx.fillStyle = "#cfe4ff";
    const r = Math.random() * 1.8 + 0.5;
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 패널
  const px = 70, py = 100, pw = W - 140, ph = H - 200;
  ctx.fillStyle = "rgba(7,12,22,0.94)";
  ctx.strokeStyle = "rgba(139,233,253,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 28);
  ctx.fill();
  ctx.stroke();

  const cx = W / 2;
  ctx.textAlign = "center";

  // 헤더
  ctx.fillStyle = "#5a7a9a";
  ctx.font = fitFont("통합과학 · 1학기 복습 방탈출 — 임무 결과 보고서", "normal", DGM, 26, pw - 80);
  ctx.fillText("통합과학 · 1학기 복습 방탈출 — 임무 결과 보고서", cx, py + 76);
  ctx.fillStyle = "#8be9fd";
  ctx.shadowColor = "rgba(139,233,253,0.6)";
  ctx.shadowBlur = 24;
  ctx.font = fitFont("ARKHE", "normal", PX, 76, pw - 160);
  ctx.fillText("ARKHE", cx, py + 190);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#dbe7f4";
  ctx.font = `normal 30px ${DGM}`;
  ctx.fillText("138억 년의 귀환 · 3D", cx, py + 244);

  // 구분선
  const line = (y) => {
    ctx.strokeStyle = "#1b2a40";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 60, y);
    ctx.lineTo(px + pw - 60, y);
    ctx.stroke();
  };
  line(py + 290);

  // MISSION COMPLETE + 승무원
  ctx.fillStyle = "#4ade80";
  ctx.font = fitFont("MISSION COMPLETE — 귀환 성공", "normal", DGM, 34, pw - 100);
  ctx.fillText("MISSION COMPLETE — 귀환 성공", cx, py + 362);
  ctx.fillStyle = "#dbe7f4";
  ctx.font = fitFont(`승무원  ${rec.nick}`, "normal", DGM, 52, pw - 120);
  ctx.fillText(`승무원  ${rec.nick}`, cx, py + 442);

  // 최종 기록
  ctx.fillStyle = "#5a7a9a";
  ctx.font = `normal 28px ${DGM}`;
  ctx.fillText("최종 기록 (페널티 포함)", cx, py + 522);
  ctx.fillStyle = "#8be9fd";
  ctx.shadowColor = "rgba(139,233,253,0.55)";
  ctx.shadowBlur = 28;
  ctx.font = fitFont(fmt(rec.t), "normal", PX, 130, pw - 160);
  ctx.fillText(fmt(rec.t), cx, py + 664);
  ctx.shadowBlur = 0;

  line(py + 724);

  // 세부 통계
  const rows = [
    ["완료 임무", `${rec.total} / ${rec.total} 미션`, "#4ade80"],
    ["오답", `${rec.w}회  (+${rec.w * 30}초)`, rec.w ? "#fb7185" : "#5a7a9a"],
    ["힌트 사용", `${rec.h}회  (+${rec.h * 10}초)`, rec.h ? "#fbbf24" : "#5a7a9a"],
    ["✦ 크로노 크리스털", `${rec.e} / 5  (-${rec.e * 20}초)`, "#ff8ae0"],
  ];
  let ry = py + 804;
  for (const [label, val, color] of rows) {
    ctx.textAlign = "left";
    ctx.fillStyle = "#5a7a9a";
    ctx.font = `normal 32px ${DGM}`;
    ctx.fillText(label, px + 100, ry);
    ctx.textAlign = "right";
    ctx.fillStyle = color;
    ctx.font = `normal 34px ${DGM}`;
    ctx.fillText(val, px + pw - 100, ry);
    ry += 74;
  }

  line(ry - 10);

  // 완료 시각 + 제출 코드
  ctx.textAlign = "center";
  ctx.fillStyle = "#5a7a9a";
  ctx.font = `normal 26px ${DGM}`;
  const when = new Date(rec.at).toLocaleString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  ctx.fillText(`완료 시각 · ${when}`, cx, ry + 58);
  ctx.fillStyle = "#fbbf24";
  ctx.font = `normal 32px ${DGM}`;
  ctx.fillText(`제출 코드 · ${submitCode(rec)}`, cx, ry + 116);

  // 푸터
  ctx.fillStyle = "#5a7a9a";
  ctx.font = `normal 26px ${DGM}`;
  ctx.fillText("이 보고서 이미지를 저장하여 선생님께 제출하세요.", cx, py + ph - 46);
  return cv;
}

/* ---------- 공용 UI ---------- */
function Typewriter({ text, speed = 16 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!text) return;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) { clearInterval(id); return v; }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  const done = n >= (text || "").length;
  return (
    <span>{(text || "").slice(0, n)}
      {!done && <span style={{ color: C.hud }} className="animate-pulse">▍</span>}
    </span>
  );
}

function AiConsole({ msg, tone }) {
  const color = tone === "bad" ? C.bad : tone === "ok" ? C.ok : tone === "hint" ? C.warn : C.hud;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${color}` }}
      className="rounded-lg p-3 mb-3">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ background: color, boxShadow: `0 0 8px ${color}` }} className="w-2 h-2 rounded-full animate-pulse" />
        <span style={{ color, letterSpacing: "0.15em" }} className="font-mono text-xs">ARKHE-AI</span>
      </div>
      <div style={{ color: C.text, lineHeight: 1.65 }} className="text-sm min-h-10">
        <Typewriter text={msg} />
      </div>
    </div>
  );
}

function StarField({ count = 60 }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() * 2 + 1, o: Math.random() * 0.6 + 0.2,
      d: (Math.random() * 3 + 2).toFixed(1),
    })), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((st, i) => (
        <div key={i} style={{
          position: "absolute", left: st.x + "%", top: st.y + "%",
          width: st.s, height: st.s, borderRadius: "50%",
          background: "#cfe4ff", opacity: st.o,
          animation: `arkheTwinkle ${st.d}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className="fixed top-16 left-1/2 z-50 font-mono text-sm px-4 py-2 rounded-lg"
      style={{
        transform: "translateX(-50%)",
        background: toast.kind === "hint" ? "rgba(120,80,0,0.9)" : "rgba(120,20,40,0.92)",
        border: `1px solid ${toast.kind === "hint" ? C.warn : C.bad}`,
        color: toast.kind === "hint" ? C.warn : C.bad,
        animation: "arkheDrop .25s ease-out",
      }}>
      {toast.text}
    </div>
  );
}

const btnPrimary = (extra = {}) => ({
  background: "linear-gradient(180deg,#164e63,#0e3a4c)",
  border: `1px solid ${C.hud}55`, color: C.hud, ...extra,
});
const btnGhost = { background: "transparent", border: `1px solid ${C.line}`, color: C.dim };

/* ================================================================
   미션(스텝) 컴포넌트
   공통 props: done(), wrong(), locked(완료 후 입력 잠금)
   ================================================================ */

/* ----- 1-1 입자 생성 순서 ----- */
function OrderStep({ done, wrong, locked, onProgress }) {
  const CORRECT = ["쿼크 · 전자", "양성자 · 중성자", "원자핵", "원자"];
  const DESC = { "쿼크 · 전자": "기본 입자", "양성자 · 중성자": "쿼크 3개의 결합", "원자핵": "양성자+중성자", "원자": "원자핵+전자" };
  const [pool] = useState(() => shuffle(CORRECT));
  const [placed, setPlaced] = useState([]);
  useEffect(() => { onProgress && onProgress(placed.length / 4); }, [placed.length]);
  const tap = (item) => {
    if (locked || placed.includes(item)) return;
    if (item === CORRECT[placed.length]) {
      const next = [...placed, item];
      setPlaced(next);
      if (next.length === 4) done();
    } else wrong();
  };
  return (
    <div>
      <div className="flex gap-1 mb-4">
        {CORRECT.map((_, i) => (
          <div key={i} className="flex-1 rounded-md text-center py-2 text-xs font-mono"
            style={{
              border: `1px dashed ${placed[i] ? C.ok : C.line}`,
              background: placed[i] ? "rgba(30,80,50,0.35)" : "rgba(0,0,0,0.25)",
              color: placed[i] ? C.ok : C.dim,
            }}>
            {placed[i] ? placed[i] : `${i + 1}번째`}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {pool.map((item) => {
          const used = placed.includes(item);
          return (
            <button key={item} onClick={() => tap(item)}
              className="rounded-lg p-3 text-left transition-all active:scale-95"
              style={{
                border: `1px solid ${used ? C.ok + "55" : C.line}`,
                background: used ? "rgba(30,80,50,0.25)" : C.panel,
                color: used ? C.ok : C.text, opacity: used ? 0.55 : 1,
              }}>
              <div className="font-bold text-sm">{item}</div>
              <div className="text-xs mt-1" style={{ color: C.dim }}>{DESC[item]}</div>
            </button>
          );
        })}
      </div>
      <p className="text-xs mt-3 font-mono" style={{ color: C.dim }}>
        ▸ 순서를 맞출 때마다 시야가 맑아집니다 ({placed.length}/4)
      </p>
    </div>
  );
}

/* ----- 객관식 (연속 질문 지원) ----- */
function McqStep({ step, done, wrong, locked }) {
  const [qi, setQi] = useState(0);
  const [flash, setFlash] = useState(null);
  const qs = step.questions;
  const cur = qs[qi];
  const pick = (i) => {
    if (locked) return;
    if (i === cur.a) {
      setFlash(i);
      setTimeout(() => {
        setFlash(null);
        if (qi + 1 < qs.length) setQi(qi + 1); else done();
      }, 500);
    } else wrong();
  };
  return (
    <div>
      {qs.length > 1 && (
        <div className="font-mono text-xs mb-2" style={{ color: C.dim }}>질문 {qi + 1} / {qs.length}</div>
      )}
      <div className="rounded-lg p-3 mb-3 text-sm font-bold" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.line}`, color: C.text }}>
        {cur.q}
      </div>
      <div className="grid gap-2">
        {cur.options.map((op, i) => (
          <button key={op} onClick={() => pick(i)}
            className="rounded-lg p-3 text-left text-sm transition-all active:scale-95"
            style={{
              border: `1px solid ${flash === i ? C.ok : C.line}`,
              background: flash === i ? "rgba(30,80,50,0.4)" : C.panel,
              color: flash === i ? C.ok : C.text,
            }}>
            <span className="font-mono mr-2" style={{ color: C.hud }}>{String.fromCharCode(65 + i)}</span>{op}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----- 1-3 스펙트럼 대조 ----- */
function SpectrumBar({ lines, tall, guides }) {
  const h = tall ? 40 : 30;
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" style={{ width: "100%", height: h, display: "block", borderRadius: 4 }}>
      <defs>
        <linearGradient id="rb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" /><stop offset="18%" stopColor="#2563eb" />
          <stop offset="38%" stopColor="#059669" /><stop offset="58%" stopColor="#eab308" />
          <stop offset="78%" stopColor="#ea580c" /><stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="300" height="24" fill="url(#rb)" />
      {(guides || []).map((p, i) => (
        <rect key={"g" + i} x={p * 3 - 0.6} y="0" width="1.2" height="24" fill="#ffffff" opacity="0.22" />
      ))}
      {lines.map((p, i) => (
        <rect key={i} x={p * 3 - 1.4} y="0" width="2.8" height="24" fill="#05070d" />
      ))}
    </svg>
  );
}
function SpectrumStep({ done, wrong, locked }) {
  // 흡수선 위치(0~100). 별 A = 수소·헬륨·나트륨의 선을 모두 포함
  const H = [12, 38, 74], HE = [22, 56, 88], NA = [60, 64], CA = [30, 47, 82];
  const STAR_A = [...H, ...HE, ...NA].sort((a, b) => a - b);
  const ELEMENTS = [
    { name: "수소", lines: H, inA: true },
    { name: "헬륨", lines: HE, inA: true },
    { name: "나트륨", lines: NA, inA: true },
    { name: "칼슘", lines: CA, inA: false },
  ];
  const [sel, setSel] = useState({});
  const toggle = (n) => { if (!locked) setSel((s) => ({ ...s, [n]: !s[n] })); };
  const check = () => {
    if (locked) return;
    const ok = ELEMENTS.every((e) => !!sel[e.name] === e.inA);
    ok ? done() : wrong();
  };
  // 라벨 열 너비를 고정해 모든 막대가 같은 x에서 시작·같은 너비로 끝나도록 정렬
  const LABEL_W = 74;
  return (
    <div>
      <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${C.line}` }}>
        {/* 별 A */}
        <div className="flex items-center gap-2 mb-1">
          <div className="font-mono text-xs shrink-0" style={{ width: LABEL_W, color: C.hud }}>★ 별 A</div>
          <div className="flex-1"><SpectrumBar lines={STAR_A} guides={STAR_A} tall /></div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div style={{ width: LABEL_W }} className="shrink-0" />
          <div className="flex-1 font-mono text-center" style={{ color: C.dim, fontSize: 9 }}>▲ 흰 안내선 = 별 A의 흡수선 위치. 아래 원소의 검은 선과 겹치는지 대조하세요</div>
        </div>
        <div style={{ borderTop: `1px dashed ${C.line}` }} className="mb-2" />
        {/* 원소 기준선 — 별 A와 동일 너비·동일 정렬, 같은 안내선 오버레이 */}
        {ELEMENTS.map((e) => (
          <button key={e.name} onClick={() => toggle(e.name)}
            className="w-full flex items-center gap-2 rounded-md py-1 mb-1 transition-all"
            style={{ background: sel[e.name] ? "rgba(20,70,90,0.5)" : "transparent", border: `1px solid ${sel[e.name] ? C.hud : "transparent"}` }}>
            <div className="font-mono text-xs shrink-0 flex items-center gap-1" style={{ width: LABEL_W, color: sel[e.name] ? C.hud : C.dim }}>
              <span className="w-3 text-center">{sel[e.name] ? "✓" : "○"}</span>{e.name}
            </div>
            <div className="flex-1"><SpectrumBar lines={e.lines} guides={STAR_A} /></div>
          </button>
        ))}
      </div>
      <button onClick={check} className="w-full rounded-lg py-3 font-mono font-bold active:scale-95 transition-all" style={btnPrimary()}>
        조성 분석 실행 ▸
      </button>
    </div>
  );
}

/* ----- 2-1 헬륨 원자핵 조립 ----- */
function FusionStep({ done, wrong, locked }) {
  const [reactor, setReactor] = useState([]); // 'p' | 'n'
  const add = (t) => { if (!locked && reactor.length < 6) setReactor((r) => [...r, t]); };
  const removeAt = (i) => { if (!locked) setReactor((r) => r.filter((_, j) => j !== i)); };
  const ignite = () => {
    if (locked) return;
    const p = reactor.filter((x) => x === "p").length;
    const n = reactor.filter((x) => x === "n").length;
    p === 2 && n === 2 && reactor.length === 4 ? done() : wrong();
  };
  const chip = (t, i, inReactor) => (
    <button key={i} onClick={() => (inReactor ? removeAt(i) : add(t))}
      className="rounded-full font-mono font-bold text-sm flex items-center justify-center active:scale-90 transition-all"
      style={{
        width: 44, height: 44,
        background: t === "p" ? "radial-gradient(circle at 35% 30%, #f87171, #991b1b)" : "radial-gradient(circle at 35% 30%, #cbd5e1, #475569)",
        border: "1px solid rgba(255,255,255,0.25)", color: "#fff",
        boxShadow: t === "p" ? "0 0 10px rgba(248,113,113,0.4)" : "0 0 8px rgba(148,163,184,0.3)",
      }}>
      {t === "p" ? "+" : "n"}
    </button>
  );
  return (
    <div>
      <div className="rounded-lg p-4 mb-3 flex flex-col items-center" style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${C.line}` }}>
        <div className="font-mono text-xs mb-2" style={{ color: C.warn }}>FUSION CHAMBER — 융합로</div>
        <div className="rounded-full flex flex-wrap items-center justify-center gap-1 p-3"
          style={{
            width: 150, height: 150,
            border: `2px dashed ${reactor.length ? C.warn : C.line}`,
            background: "radial-gradient(circle, rgba(120,50,10,0.35), rgba(0,0,0,0.2))",
            boxShadow: reactor.length === 4 ? "0 0 24px rgba(251,191,36,0.35)" : "none",
          }}>
          {reactor.length === 0
            ? <span className="text-xs text-center" style={{ color: C.dim }}>아래 입자를 눌러<br />투입하십시오</span>
            : reactor.map((t, i) => chip(t, i, true))}
        </div>
        <div className="text-xs mt-2 font-mono" style={{ color: C.dim }}>투입된 입자를 누르면 제거됩니다</div>
      </div>
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="text-center">
          <div className="flex gap-1">{[0, 1, 2, 3].map((i) => chip("p", "pp" + i, false))}</div>
          <div className="text-xs mt-1 font-mono" style={{ color: C.bad }}>양성자 (+)</div>
        </div>
        <div className="text-center">
          <div className="flex gap-1">{[0, 1, 2, 3].map((i) => chip("n", "nn" + i, false))}</div>
          <div className="text-xs mt-1 font-mono" style={{ color: C.dim }}>중성자</div>
        </div>
      </div>
      <button onClick={ignite} className="w-full rounded-lg py-3 font-mono font-bold active:scale-95 transition-all"
        style={btnPrimary({ borderColor: C.warn + "66", color: C.warn, background: "linear-gradient(180deg,#4a2a06,#331c04)" })}>
        ⚡ 융합 점화
      </button>
    </div>
  );
}

/* ----- 숫자 코드 입력 (2-2 온도 / 4-2 물 순환) ----- */
function CodeStep({ step, done, wrong, locked, extra }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (locked || !val.trim()) return;
    val.trim() === step.answer ? done() : wrong();
  };
  return (
    <div>
      {extra}
      <div className="rounded-lg p-4" style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${C.line}` }}>
        <div className="font-mono text-xs mb-2" style={{ color: C.hud }}>{step.codeLabel}</div>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" value={val} placeholder={step.ph}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 rounded-lg px-3 py-3 font-mono text-xl tracking-widest outline-none"
            style={{ background: "#05070d", border: `1px solid ${C.line}`, color: C.hud, minWidth: 0 }} />
          <span className="font-mono text-sm shrink-0" style={{ color: C.dim }}>{step.codeUnit}</span>
        </div>
        <button onClick={submit} className="w-full mt-3 rounded-lg py-3 font-mono font-bold active:scale-95 transition-all" style={btnPrimary()}>
          코드 전송 ▸
        </button>
      </div>
    </div>
  );
}

/* ----- 2-3 초신성 별 판별 ----- */
function StarCross({ layers, size = 130 }) {
  const n = layers.length;
  return (
    <svg viewBox="0 0 130 130" style={{ width: "100%", maxWidth: size, display: "block", margin: "0 auto" }}>
      {layers.map((l, i) => (
        <circle key={i} cx="65" cy="65" r={60 - i * (52 / n)} fill={l.c} stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />
      ))}
    </svg>
  );
}
function SupernovaStep({ done, wrong, locked }) {
  const starSun = {
    id: "sun", title: "별 α", mass: "질량: 태양과 비슷",
    layers: [{ c: "#93c5fd", t: "수소" }, { c: "#a78bfa", t: "헬륨" }, { c: "#f87171", t: "탄소·산소" }],
    legend: "수소 → 헬륨 → 탄소·산소",
  };
  const starBig = {
    id: "big", title: "별 β", mass: "질량: 태양의 10배 이상",
    layers: [
      { c: "#93c5fd" }, { c: "#a78bfa" }, { c: "#f9a8d4" }, { c: "#fbbf24" }, { c: "#fb923c" }, { c: "#6b7280" },
    ],
    legend: "수소 → 헬륨 → 탄소·산소 → 규소 → … → 철(Fe)",
  };
  const pick = (id) => { if (!locked) (id === "big" ? done() : wrong()); };
  const card = (s) => (
    <button key={s.id} onClick={() => pick(s.id)}
      className="flex-1 rounded-xl p-3 transition-all active:scale-95"
      style={{ background: C.panel, border: `1px solid ${C.line}` }}>
      <div className="font-mono text-sm font-bold mb-1" style={{ color: C.hud }}>{s.title}</div>
      <div className="text-xs mb-2" style={{ color: C.warn }}>{s.mass}</div>
      <StarCross layers={s.layers} />
      <div className="text-xs mt-2 leading-relaxed" style={{ color: C.dim }}>중심까지의 원소<br />{s.legend}</div>
    </button>
  );
  return (
    <div>
      <div className="flex gap-2">{card(starSun)}{card(starBig)}</div>
      <p className="text-xs mt-3 font-mono" style={{ color: C.dim }}>▸ 핵융합이 멈춘 두 별의 내부 구조. 초신성 폭발이 임박한 별을 선택하십시오.</p>
    </div>
  );
}

/* ----- 3-1 블랙홀 갈림길 ----- */
function BlackholeStep({ done, wrong, locked }) {
  const OPTIONS = ["백색 왜성", "중성자별", "블랙홀"];
  const [pick, setPick] = useState(null);
  const stage = (label, sub, color) => (
    <div className="rounded-lg px-3 py-2 text-center" style={{ background: C.panel, border: `1px solid ${C.line}`, minWidth: 0 }}>
      <div className="font-mono text-sm font-bold" style={{ color }}>{label}</div>
      {sub && <div style={{ color: C.dim, fontSize: 10 }}>{sub}</div>}
    </div>
  );
  const arrow = <div className="text-center font-mono" style={{ color: C.dim }}>▼</div>;
  const choose = (op) => {
    if (locked) return;
    setPick(op);
    op === "블랙홀" ? done() : wrong();
  };
  return (
    <div>
      <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${C.line}` }}>
        <div className="font-mono text-xs mb-2 text-center" style={{ color: C.warn }}>질량이 큰 별의 진화 경로</div>
        <div className="grid gap-1">
          {stage("주계열성", "수소 핵융합", C.hud)}
          {arrow}
          {stage("초거성", "적색 거성보다 더 크게 팽창", C.hud)}
          {arrow}
          {stage("초신성 폭발", "철 생성 후 중심부 붕괴 → 폭발", "#fb923c")}
        </div>
        {/* 갈림길 */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="rounded-lg p-2" style={{ background: "rgba(20,40,60,0.4)", border: `1px solid ${C.line}` }}>
            <div className="font-mono text-center" style={{ color: C.dim, fontSize: 10 }}>주계열성 질량<br /><b style={{ color: C.text }}>태양의 10~20배</b></div>
            <div className="text-center font-mono my-1" style={{ color: C.dim }}>▼</div>
            <div className="rounded-md py-2 text-center font-mono text-sm font-bold" style={{ background: "rgba(0,0,0,0.3)", color: "#a5b4fc" }}>중성자별</div>
          </div>
          <div className="rounded-lg p-2" style={{ background: "rgba(60,20,50,0.4)", border: `1px solid ${pick === "블랙홀" ? C.ok : C.warn + "66"}` }}>
            <div className="font-mono text-center" style={{ color: C.dim, fontSize: 10 }}>주계열성 질량<br /><b style={{ color: C.warn }}>태양의 20배 이상</b></div>
            <div className="text-center font-mono my-1" style={{ color: C.dim }}>▼</div>
            <div className="rounded-md py-2 text-center font-mono text-sm font-bold"
              style={{ background: pick === "블랙홀" ? "rgba(30,80,50,0.5)" : "rgba(0,0,0,0.3)", color: pick === "블랙홀" ? C.ok : C.warn, border: `1px dashed ${pick === "블랙홀" ? C.ok : C.warn}` }}>
              {pick === "블랙홀" ? "블랙홀 ✓" : "? ? ?"}
            </div>
          </div>
        </div>
      </div>
      <div className="font-mono text-xs mb-2 text-center" style={{ color: C.text }}>주계열성일 때 질량이 태양의 20배 이상인 별의 최후는?</div>
      <div className="grid gap-2">
        {OPTIONS.map((op) => (
          <button key={op} onClick={() => choose(op)}
            className="rounded-lg p-3 text-center text-sm font-bold transition-all active:scale-95"
            style={{ border: `1px solid ${pick === op && op === "블랙홀" ? C.ok : C.line}`, background: pick === op && op === "블랙홀" ? "rgba(30,80,50,0.4)" : C.panel, color: pick === op && op === "블랙홀" ? C.ok : C.text }}>
            {op}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----- 3-2 지구 형성 과정 순서 배열 ----- */
function FormationStep({ done, wrong, locked }) {
  const CORRECT = [
    { k: "미행성체 충돌", d: "충돌로 뭉쳐 원시 지구 형성" },
    { k: "마그마 바다", d: "충돌열로 지구 전체가 녹음" },
    { k: "무거운 물질 침강", d: "철·니켈이 가라앉아 핵 형성" },
    { k: "가벼운 물질 상승", d: "규산염이 떠올라 맨틀 형성" },
    { k: "원시 지각·바다", d: "표면이 식고 바다·생명 탄생" },
  ];
  const [pool] = useState(() => shuffle(CORRECT.map((c) => c.k)));
  const [placed, setPlaced] = useState([]);
  const DMAP = Object.fromEntries(CORRECT.map((c) => [c.k, c.d]));
  const tap = (k) => {
    if (locked || placed.includes(k)) return;
    if (k === CORRECT[placed.length].k) {
      const next = [...placed, k];
      setPlaced(next);
      if (next.length === CORRECT.length) done();
    } else wrong();
  };
  return (
    <div>
      <div className="grid gap-1 mb-3">
        {CORRECT.map((_, i) => {
          const k = placed[i];
          return (
            <div key={i} className="flex items-center gap-2 rounded-md px-2 py-2"
              style={{ border: `1px ${k ? "solid" : "dashed"} ${k ? C.ok + "66" : C.line}`, background: k ? "rgba(30,80,50,0.25)" : "rgba(0,0,0,0.25)" }}>
              <span className="font-mono text-xs w-4 text-center" style={{ color: k ? C.ok : C.dim }}>{i + 1}</span>
              {k ? (
                <div><div className="text-sm font-bold" style={{ color: C.ok }}>{k}</div><div style={{ color: C.dim, fontSize: 10 }}>{DMAP[k]}</div></div>
              ) : <span className="text-xs font-mono" style={{ color: C.dim }}>{i + 1}번째 사건</span>}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {pool.map((k) => {
          const used = placed.includes(k);
          return (
            <button key={k} onClick={() => tap(k)} disabled={used}
              className="rounded-lg p-2 text-left transition-all active:scale-95"
              style={{ border: `1px solid ${used ? C.ok + "44" : C.line}`, background: used ? "rgba(30,80,50,0.2)" : C.panel, color: used ? C.dim : C.text, opacity: used ? 0.5 : 1 }}>
              <div className="text-sm font-bold">{k}</div>
              <div style={{ color: C.dim, fontSize: 10 }}>{DMAP[k]}</div>
            </button>
          );
        })}
      </div>
      <p className="text-xs mt-3 font-mono" style={{ color: C.dim }}>▸ 가장 먼저 일어난 사건부터 순서대로 선택하세요 ({placed.length}/{CORRECT.length})</p>
    </div>
  );
}

/* ----- 4-1 지구시스템 상호작용 다이어그램 ----- */
function WiringStep({ done, wrong, locked }) {
  // 4개 권 좌표 (SVG 0~300 x 0~300)
  const SPH = {
    지권: { x: 78, y: 232, c: "#f5b78a", cd: "#c97b45" },
    기권: { x: 150, y: 60, c: "#9ec9ef", cd: "#4b90c8" },
    수권: { x: 222, y: 232, c: "#d8d2bf", cd: "#a49877" },
    생물권: { x: 150, y: 168, c: "#a8dca0", cd: "#5aa84a" },
  };
  // 사용하는 양방향 화살표(권 쌍) — 옵션 1
  const EDGES = [
    { id: "지-기", a: "지권", b: "기권" },
    { id: "기-생", a: "기권", b: "생물권" },
    { id: "수-기", a: "수권", b: "기권" },
    { id: "수-지", a: "수권", b: "지권" },
  ];
  const ITEMS = [
    { p: "화산 분출", d: "화산 가스가 대기로 방출된다", edge: "지-기" },
    { p: "광합성", d: "식물이 대기의 이산화 탄소를 흡수한다", edge: "기-생" },
    { p: "태풍", d: "바다의 수증기가 대기로 공급되어 발생한다", edge: "수-기" },
    { p: "해안 침식", d: "파도가 바닷가의 지형을 깎는다", edge: "수-지" },
  ];
  const [assign, setAssign] = useState({}); // edgeId -> itemIndex
  const [selCard, setSelCard] = useState(null);
  const itemOf = (edgeId) => (assign[edgeId] != null ? ITEMS[assign[edgeId]] : null);

  const tapEdge = (edgeId) => {
    if (locked || selCard == null) return;
    setAssign((prev) => {
      const next = {};
      // 같은 카드가 다른 곳에 있으면 제거, 대상 엣지의 기존 카드도 제거
      for (const [e, idx] of Object.entries(prev)) {
        if (idx === selCard) continue;
        if (e === edgeId) continue;
        next[e] = idx;
      }
      next[edgeId] = selCard;
      return next;
    });
    setSelCard(null);
  };
  const check = () => {
    if (locked) return;
    const ok = ITEMS.length === Object.keys(assign).length &&
      EDGES.every((e) => { const it = itemOf(e.id); return it && it.edge === e.id; });
    ok ? done() : wrong();
  };

  const arrowPath = (e) => {
    const A = SPH[e.a], B = SPH[e.b];
    // 원 반지름 32만큼 양 끝을 줄여 화살표가 원에 닿게
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len, r = 34;
    return { x1: A.x + ux * r, y1: A.y + uy * r, x2: B.x - ux * r, y2: B.y - uy * r, mx: (A.x + B.x) / 2, my: (A.y + B.y) / 2 };
  };

  return (
    <div>
      <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto 8px" }}>
        <defs>
          {["#3a4a5c", C.ok, C.hud].map((col, i) => (
            <marker key={i} id={"ah" + i} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={col} />
            </marker>
          ))}
        </defs>
        {/* 양방향 화살표 (탭 영역) */}
        {EDGES.map((e) => {
          const g = arrowPath(e);
          const it = itemOf(e.id);
          const good = it && it.edge === e.id;
          const mi = good ? 1 : (selCard != null ? 2 : 0);
          const col = good ? C.ok : (selCard != null ? C.hud : "#3a4a5c");
          return (
            <g key={e.id} onClick={() => tapEdge(e.id)} style={{ cursor: locked ? "default" : "pointer" }}>
              <line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke="transparent" strokeWidth="24" />
              <line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke={col} strokeWidth={good ? 3.2 : 2.4}
                markerStart={`url(#ah${mi})`} markerEnd={`url(#ah${mi})`} opacity={good ? 1 : 0.85} />
              {it && (
                <g>
                  <rect x={g.mx - 30} y={g.my - 9} width="60" height="18" rx="9"
                    fill={good ? "rgba(20,60,40,0.95)" : "rgba(10,20,35,0.95)"} stroke={good ? C.ok : C.hud} strokeWidth="0.8" />
                  <text x={g.mx} y={g.my + 3.5} textAnchor="middle" fontSize="9" fill={good ? C.ok : C.hud} fontFamily="monospace">{it.p}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* 권 원 */}
        {Object.entries(SPH).map(([name, s]) => (
          <g key={name}>
            <circle cx={s.x} cy={s.y} r="32" fill={s.c} stroke={s.cd} strokeWidth="2" />
            <text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1a2230">{name}</text>
          </g>
        ))}
      </svg>
      <p className="text-center font-mono text-xs mb-2" style={{ color: selCard != null ? C.hud : C.dim }}>
        {selCard != null ? `"${ITEMS[selCard].p}" — 어느 두 권 사이의 현상인가요? 화살표를 탭하세요` : "① 아래 현상 카드를 선택하세요"}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {ITEMS.map((it, i) => {
          const used = Object.values(assign).includes(i);
          const active = selCard === i;
          return (
            <button key={i} onClick={() => !locked && setSelCard(active ? null : i)}
              className="rounded-lg p-2 text-left transition-all active:scale-95"
              style={{
                border: `1px solid ${active ? C.hud : used ? C.ok + "55" : C.line}`,
                background: active ? "rgba(20,70,90,0.5)" : used ? "rgba(20,60,40,0.25)" : C.panel,
                boxShadow: active ? `0 0 10px ${C.hud}44` : "none",
              }}>
              <div className="text-sm font-bold" style={{ color: active ? C.hud : used ? C.ok : C.text }}>
                {used ? "✓ " : ""}{it.p}
              </div>
              <div style={{ color: C.dim, fontSize: 10 }}>{it.d}</div>
            </button>
          );
        })}
      </div>
      <button onClick={check} className="w-full rounded-lg py-3 font-mono font-bold active:scale-95 transition-all" style={btnPrimary()}>
        상호작용 인증 ▸
      </button>
    </div>
  );
}

/* ----- 5-1 지진대/화산대 스캔 ----- */
function ScanStep({ step, done, wrong, locked }) {
  const [phase, setPhase] = useState(0); // 0 지진 1 화산 2 질문
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1600);
    const t2 = setTimeout(() => setPhase(2), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  // 환태평양 '불의 고리' 근사 좌표 (0-300 x 0-150)
  const RING = [
    [30,38],[42,30],[58,26],[76,24],[95,28],[110,40],[118,58],[122,78],[118,98],[110,114],
    [216,110],[224,92],[230,72],[236,54],[246,40],[262,34],[278,30],
    [150,120],[168,116],[186,112],[200,110],
  ];
  const ALPIDE = [[150,60],[168,58],[186,56],[204,58],[220,62]];
  const MID = [[150,86],[152,100],[148,72]];
  const ALL = [...RING, ...ALPIDE, ...MID];
  return (
    <div>
      <div className="rounded-lg p-2 mb-3 relative overflow-hidden" style={{ background: "#03110f", border: `1px solid ${C.line}` }}>
        <div className="font-mono text-xs px-1 pt-1 flex justify-between" style={{ color: "#2dd4bf" }}>
          <span>SURFACE SCAN</span>
          <span>{phase === 0 ? "지진 분포 수신 중…" : phase === 1 ? "화산 분포 수신 중…" : "분석 완료 — 분포 일치"}</span>
        </div>
        <svg viewBox="0 0 300 150" style={{ width: "100%", display: "block" }}>
          {/* 격자 */}
          {[30,60,90,120].map((y) => <line key={"h"+y} x1="0" y1={y} x2="300" y2={y} stroke="#0d3a33" strokeWidth="0.5" />)}
          {[50,100,150,200,250].map((x) => <line key={"v"+x} x1={x} y1="0" x2={x} y2="150" stroke="#0d3a33" strokeWidth="0.5" />)}
          {/* 대륙 실루엣 (간이) */}
          <g fill="#0f4a3f" opacity="0.8">
            <path d="M35,35 q20,-12 45,-8 q18,4 22,20 q3,16 -8,28 q-12,10 -14,26 q-2,14 -10,18 q-10,-6 -14,-22 q-4,-18 -12,-30 q-8,-14 -9,-32z" />
            <path d="M108,96 q10,-4 16,4 q6,10 2,24 q-4,12 -12,16 q-8,-8 -9,-22 q-1,-14 3,-22z" />
            <path d="M148,30 q26,-10 56,-6 q26,4 34,18 q6,12 -2,22 q-12,12 -30,12 q-20,2 -36,-6 q-16,-8 -22,-22 q-4,-12 0,-18z" />
            <path d="M158,70 q12,-2 18,8 q6,12 2,26 q-4,14 -14,18 q-10,-4 -13,-18 q-3,-16 -3,-34z" />
            <path d="M222,104 q12,-6 22,0 q8,6 4,16 q-6,10 -18,10 q-10,-2 -12,-12 q-2,-8 4,-14z" />
          </g>
          {/* 지진 (점) */}
          {phase >= 0 && ALL.map(([x, y], i) => (
            <circle key={"q" + i} cx={x} cy={y} r="2.4" fill="#f87171"
              style={{ animation: `arkheTwinkle 2.4s ease-in-out infinite`, animationDelay: (i * 0.05) + "s" }} />
          ))}
          {/* 화산 (삼각형) — 살짝 어긋난 위치, 같은 띠 */}
          {phase >= 1 && ALL.filter((_, i) => i % 2 === 0).map(([x, y], i) => (
            <polygon key={"v" + i} points={`${x + 3},${y - 6} ${x - 1},${y + 1} ${x + 7},${y + 1}`} fill="#fbbf24" opacity="0.95" />
          ))}
        </svg>
        <div className="font-mono text-xs px-1 pb-1 flex gap-3" style={{ color: C.dim }}>
          <span><span style={{ color: "#f87171" }}>●</span> 지진 다발</span>
          {phase >= 1 && <span><span style={{ color: "#fbbf24" }}>▲</span> 화산 다발</span>}
        </div>
      </div>
      {phase >= 2
        ? <McqStep step={step} done={done} wrong={wrong} locked={locked} />
        : <p className="text-center font-mono text-xs animate-pulse" style={{ color: C.dim }}>스캔 데이터 수신 중…</p>}
    </div>
  );
}

/* ----- 5-2 지형-경계 매칭 ----- */
function MatchStep({ done, wrong, locked }) {
  const ITEMS = [
    { p: "히말라야 산맥", d: "인도판과 유라시아판이 충돌한 거대 습곡 산맥", a: "수렴형 (충돌형)" },
    { p: "일본 해구", d: "태평양판이 유라시아판 아래로 들어가는 깊은 골짜기", a: "수렴형 (섭입형)" },
    { p: "대서양 중앙 해령", d: "판이 양쪽으로 갈라지며 새 해양 지각이 생기는 해저 산맥", a: "발산형" },
    { p: "산안드레아스 단층", d: "두 판이 어긋나는 방향으로 스쳐 지나가는 단층", a: "보존형" },
  ];
  const OPTIONS = ["선택…", "발산형", "수렴형 (충돌형)", "수렴형 (섭입형)", "보존형"];
  const [sel, setSel] = useState(Array(4).fill("선택…"));
  const [status, setStatus] = useState(Array(4).fill(null));
  const check = () => {
    if (locked) return;
    const st = ITEMS.map((it, i) => sel[i] === it.a);
    setStatus(st);
    st.every(Boolean) ? done() : wrong();
  };
  return (
    <div>
      <div className="grid gap-2 mb-3">
        {ITEMS.map((it, i) => (
          <div key={i} className="rounded-lg p-3" style={{
            background: C.panel,
            border: `1px solid ${status[i] === true ? C.ok : status[i] === false ? C.bad : C.line}`,
          }}>
            <div className="text-sm font-bold" style={{ color: status[i] === true ? C.ok : C.text }}>
              {status[i] === true ? "✓ " : ""}{it.p}
            </div>
            <div className="text-xs mb-2" style={{ color: C.dim }}>{it.d}</div>
            <select value={sel[i]} disabled={locked || status[i] === true}
              onChange={(e) => setSel((s) => s.map((v, j) => (j === i ? e.target.value : v)))}
              className="w-full rounded-md px-2 py-2 font-mono text-sm outline-none"
              style={{ background: "#05070d", border: `1px solid ${C.line}`, color: status[i] === true ? C.ok : C.hud }}>
              {OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <button onClick={check} className="w-full rounded-lg py-3 font-mono font-bold active:scale-95 transition-all"
        style={btnPrimary({ borderColor: C.ok + "66", color: C.ok, background: "linear-gradient(180deg,#0b3a26,#062818)" })}>
        착륙 좌표 확정 ▸
      </button>
    </div>
  );
}

/* ----- 물 순환 데이터 패널 (4-2용) ----- */
function WaterDiagram() {
  return (
    <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${C.line}` }}>
      <div className="font-mono text-xs mb-2 text-center" style={{ color: C.hud }}>물의 순환 모식도 (단위: ×1000 km³/년)</div>
      <svg viewBox="0 0 300 170" style={{ width: "100%", display: "block" }}>
        {/* 대기 */}
        <rect x="60" y="10" width="180" height="34" rx="8" fill="rgba(70,130,200,0.25)" stroke="#4b90c8" strokeWidth="1" />
        <text x="150" y="31" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#9ec9ef" fontFamily="monospace">대 기</text>
        {/* 바다 */}
        <rect x="18" y="120" width="120" height="38" rx="8" fill="rgba(40,90,150,0.35)" stroke="#3a6fa8" strokeWidth="1" />
        <text x="78" y="143" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#bcd8f0" fontFamily="monospace">바 다</text>
        {/* 육지 */}
        <rect x="162" y="120" width="120" height="38" rx="8" fill="rgba(120,90,50,0.35)" stroke="#a4783f" strokeWidth="1" />
        <text x="222" y="143" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#e8c89a" fontFamily="monospace">육 지</text>
        <defs>
          <marker id="wup" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#60a5fa" /></marker>
          <marker id="wdn" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8" /></marker>
        </defs>
        {/* 증발 (바다→대기 320, 육지→대기 60) : 유입 */}
        <line x1="62" y1="120" x2="98" y2="46" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#wup)" />
        <text x="52" y="90" fontSize="11" fill="#60a5fa" fontFamily="monospace" fontWeight="bold">↑320</text>
        <line x1="200" y1="120" x2="150" y2="46" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#wup)" />
        <text x="176" y="88" fontSize="11" fill="#60a5fa" fontFamily="monospace" fontWeight="bold">↑60</text>
        {/* 강수 (대기→바다 284, 대기→육지 96) : 유출 */}
        <line x1="118" y1="44" x2="88" y2="120" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#wdn)" />
        <text x="92" y="90" fontSize="11" fill="#94a3b8" fontFamily="monospace" fontWeight="bold">↓284</text>
        <line x1="222" y1="44" x2="240" y2="120" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#wdn)" />
        <text x="238" y="88" fontSize="11" fill="#94a3b8" fontFamily="monospace" fontWeight="bold">↓96</text>
      </svg>
      <div className="flex justify-center gap-4 font-mono" style={{ fontSize: 10 }}>
        <span style={{ color: "#60a5fa" }}>↑ 증발 (대기로 유입)</span>
        <span style={{ color: "#94a3b8" }}>↓ 강수 (대기에서 유출)</span>
      </div>
    </div>
  );
}

/* ----- 4-2 유입량/유출량 각각 입력 ----- */
function Water2Step({ done, wrong, locked }) {
  const [inflow, setInflow] = useState("");
  const [outflow, setOutflow] = useState("");
  const submit = () => {
    if (locked || !inflow.trim() || !outflow.trim()) return;
    (inflow.trim() === "380" && outflow.trim() === "380") ? done() : wrong();
  };
  const field = (label, hint, val, set, color) => (
    <div className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${C.line}` }}>
      <div className="font-mono text-xs mb-1" style={{ color }}>{label}</div>
      <div className="mb-2" style={{ color: C.dim, fontSize: 10 }}>{hint}</div>
      <div className="flex items-center gap-2">
        <input type="number" inputMode="numeric" value={val} placeholder="합계 입력"
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="flex-1 rounded-lg px-3 py-2.5 font-mono text-lg tracking-wide outline-none"
          style={{ background: "#05070d", border: `1px solid ${C.line}`, color, minWidth: 0 }} />
        <span className="font-mono text-xs shrink-0" style={{ color: C.dim }}>×1000 km³</span>
      </div>
    </div>
  );
  return (
    <div>
      <WaterDiagram />
      <div className="grid gap-2 mb-3">
        {field("① 유입량 (대기로 들어오는 물)", "증발: 바다에서 + 육지에서", inflow, setInflow, "#60a5fa")}
        {field("② 유출량 (대기에서 나가는 물)", "강수: 바다로 + 육지로", outflow, setOutflow, "#94a3b8")}
      </div>
      <button onClick={submit} className="w-full rounded-lg py-3 font-mono font-bold active:scale-95 transition-all" style={btnPrimary()}>
        데이터 전송 ▸
      </button>
    </div>
  );
}

/* ================================================================
   3D 월드 — 방 구성 데이터
   ================================================================ */
const STEP_SHORT = ["광학 센서 보정","미지 신호 해독","목표 항성 식별","융합로 재가동","점화 온도","충격파 항해","블랙홀 판정","지구 형성 복원","상호작용 인증","물 순환 해독","지표 스캔","착륙 좌표"];

/* 방별 3D 배치: 퍼즐 오브젝트 / 데이터패드(무료 단서) / 크리스털(보너스) */
const WORLDS = [
  { // ROOM 0 — 원형 관측 데크 (안개)
    fog: [0xd97a3a, 0.125], amb: 0x664433, floor: 0x2a1a10,
    lights: [[0xffa860, 0, 5, 0], [0x88ccff, -6, 3, 6]],
    accent: 0xffa860, layout: "deck",
    props: [
      { type: "console", pos: [-5.5, 0, -4], rotY: 0.6, step: 0, label: "입자 가속기 콘솔", color: 0xff8844 },
      { type: "antenna", pos: [6, 0, -3.5], step: 1, label: "전파 수신 안테나", color: 0x88e0ff },
      { type: "telescope", pos: [5, 0, 5.5], rotY: -2.4, step: 2, label: "관측 망원경", color: 0xffd166 },
    ],
    memos: [
      { pos: [-7.2, 1.3, 2.5], rotY: 1.9, stand: true, label: "항해일지 §7", text: "「…쿼크 셋이 뭉치면 양성자가 된다. 양성자와 중성자가 뭉치면 원자핵이, 원자핵이 전자를 붙잡으면 비로소 원자가 된다. 그리고 그 순간 — 빛이 풀려났다.」" },
      { pos: [2.5, 1.3, 7.2], rotY: -2.8, stand: true, label: "관측 기록 카드", text: "「펜지어스·윌슨 수신 기록: 어느 방향으로 안테나를 돌려도 같은 세기. 약 3 K 물체의 복사와 일치. 이것은… 우주 전체를 채운 빛이다.」" },
    ],
    egg: [6.3, 0.35, 5.9],
    clutter: [[-2.5, -7, "crate2"], [3, -7.5, "barrel"], [-6.5, 6, "crate"], [-3, 3.2, "barrel"], [7.5, 1, "crate"], [1.8, -1.8, "holo"]],
  },
  { // ROOM 1 — 좁고 긴 기관실 복도
    fog: [0x551408, 0.055], amb: 0x552211, floor: 0x2a0d08, wall: 0x40140a,
    lights: [[0xff5522, 0, 3.8, -3], [0xffaa44, 0, 3.5, 7]],
    accent: 0xff6a33, layout: "corridor",
    props: [
      { type: "reactor", pos: [0, 0, -3], step: 3, label: "핵융합로", color: 0xffaa33 },
      { type: "console", pos: [-3, 0, 2], rotY: 1.3, step: 4, label: "점화 제어 콘솔", color: 0xff6644 },
      { type: "screen", pos: [3.55, 0, -6.5], rotY: -Math.PI / 2, step: 5, label: "항성 관측창", color: 0xffcc66 },
    ],
    memos: [
      { pos: [-3.75, 1.4, -1], rotY: Math.PI / 2, label: "정비공의 낙서", text: "「점화 임계 온도 = 10⁷ K. 콘솔 입력은 '만 K' 단위다. 0 하나 빼먹고 폭발할 뻔한 게 두 번째다.」" },
      { pos: [3.75, 1.4, 5], rotY: -Math.PI / 2, label: "찢어진 교범", text: "「철(Fe)에 도달한 별의 심장은 다시 타오르지 않는다. 무거운 별만이 철을 품고 — 폭발로 생을 마친다. 그 폭발 속에서 금과 우라늄이 태어난다.」" },
    ],
    egg: [-3.1, 0.35, -7.6],
    clutter: [[-3.1, 6.5, "barrel"], [3.1, 7.5, "crate"], [-3.1, -5.2, "crate2"], [3.1, 0.5, "barrel"], [-3.1, 4, "crate"]],
  },
  { // ROOM 2 — 마그마 위 징검다리 플랫폼
    fog: [0x66220a, 0.03], amb: 0x663322, floor: 0x22110c,
    lights: [[0xff6633, 0, 5, 0], [0xffaa66, 0, 2, 8]],
    accent: 0xff8844, layout: "platforms",
    props: [
      { type: "antenna", pos: [-7, 0, -3], step: 6, label: "항법 스캐너", color: 0xcc88ff },
      { type: "table", pos: [7, 0, -3], step: 7, label: "행성 시뮬레이터", color: 0xff9955 },
    ],
    memos: [
      { pos: [2.4, 1.3, 6.6], rotY: -2.6, stand: true, label: "경고 표지판", text: "「질량이 태양의 20배를 넘은 별에는 접근 금지. 그 붕괴 뒤에는 — 빛조차 되돌아오지 못하는 천체가 남는다.」" },
    ],
    egg: [0, 0.35, 10.9],
    clutter: [[-1.8, 7.4, "crate"], [1.1, -9.9, "barrel"], [-6, -1.8, "crate"]],
  },
  { // ROOM 3 — 2층 파노라마 브리지
    fog: [0x0a1a3a, 0.026], amb: 0x334466, floor: 0x0c1626, wall: 0x14233d,
    lights: [[0x66aaff, 0, 5, 0], [0x88ddff, -6, 3, 6], [0xaaccff, 6, 4.5, 7]],
    accent: 0x66aaff, layout: "bridge",
    props: [
      { type: "screen", pos: [-6, 0, -5], rotY: 0.7, step: 8, label: "시스템 회로반", color: 0x66ccff },
      { type: "console", pos: [6.2, 2.4, 6.8], rotY: 2.6, step: 9, dist: 2.6, label: "물 순환 모니터 (상부 갑판)", color: 0x44aaff },
    ],
    memos: [
      { pos: [-9.45, 1.4, 2], rotY: Math.PI / 2, label: "대기 관제 장부", text: "「대기는 정직하다. 들어온 만큼(증발) 정확히 내보낸다(강수). 이것이 평형 — 이 행성의 물 총량은 변하지 않는다.」" },
      { pos: [9.45, 3.7, 7.6], rotY: -Math.PI / 2, label: "상부 갑판 근무 일지", text: "「갑판 위에서 보는 지구가 제일 예쁘다. 오늘도 파랗다. — 전임 승무원」" },
    ],
    egg: [0.4, 0.35, 7],
    clutter: [[-8, 6, "crate"], [-4, -7.5, "desk"], [-7.5, -2, "barrel"], [8.6, 1.5, "crate2"]],
  },
  { // ROOM 4 — 원형 계단식 관제실
    fog: [0x06302a, 0.028], amb: 0x2a5a4a, floor: 0x0a1f1a,
    lights: [[0x33ddbb, 0, 5, 0], [0x66ffdd, 6, 4, 5], [0x33ddbb, -6, 4, -5]],
    accent: 0x33ddbb, layout: "theater",
    props: [
      { type: "screen", pos: [-5, 0.5, -2.6], rotY: 1.1, step: 10, label: "지표 스캐너", color: 0x33ddbb },
      { type: "table", pos: [4.8, 0.5, -2.4], step: 11, label: "홀로그램 항법 테이블", color: 0x55ffcc },
    ],
    memos: [
      { pos: [7.9, 2.3, 3.4], rotY: -2.0, stand: true, label: "착륙 안전 수칙", text: "「제1조 — 판과 판이 만나는 곳에 내리지 말 것. 지진과 화산은 언제나 그 경계에 모여 있다.」" },
    ],
    egg: [-1.7, 0.35, 1.5],
    clutter: [[-4.5, 4.5, "desk", 1.0], [4.5, 4.5, "desk", 1.0], [0, 5.8, "crate", 1.0], [8, -3, "barrel", 1.0], [-8, -2.5, "crate2", 1.0]],
  },
];

/* ================================================================
   3D 소품 빌더 (three.js 프리미티브 조합)
   ================================================================ */
function M(color, opt = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3, ...opt }); }
function EM(color, intensity = 1, opt = {}) {
  return new THREE.MeshStandardMaterial({ color: 0x111111, emissive: color, emissiveIntensity: intensity, roughness: 0.5, ...opt });
}

function mkConsole(color) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.8), M(0x2a3340));
  base.position.y = 0.5; g.add(base);
  const scr = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.08), EM(color, 1.1));
  scr.position.set(0, 1.35, -0.15); scr.rotation.x = -0.35; g.add(scr);
  g.userData.pulse = scr;
  return g;
}
function mkAntenna(color) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.2, 8), M(0x556070));
  pole.position.y = 1.1; g.add(pole);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), M(0x8899aa, { side: THREE.DoubleSide }));
  dish.position.y = 2.25; dish.rotation.x = Math.PI * 0.62; g.add(dish);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), EM(color, 1.4));
  tip.position.set(0, 2.35, 0.45); g.add(tip);
  g.userData.pulse = tip;
  return g;
}
function mkTelescope(color) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), M(0x556070));
    const a = (i / 3) * Math.PI * 2;
    leg.position.set(Math.sin(a) * 0.45, 0.7, Math.cos(a) * 0.45);
    leg.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35); g.add(leg);
  }
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.8, 14), M(0x3a4a5c));
  tube.position.y = 1.7; tube.rotation.x = -0.9; g.add(tube);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.06, 14), EM(color, 1.3));
  lens.position.set(0, 1.7 + Math.cos(0.9) * 0.93, Math.sin(0.9) * 0.93);
  lens.rotation.x = -0.9; g.add(lens);
  g.userData.pulse = lens;
  return g;
}
function mkReactor(color) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.28, 12, 36), M(0x44322a, { metalness: 0.6 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 1.3; g.add(ring);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 16), EM(color, 1.6));
  core.position.y = 1.3; g.add(core);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.3, 8), M(0x3a2a20));
    p.position.set(Math.cos(a) * 1.5, 0.65, Math.sin(a) * 1.5); g.add(p);
  }
  g.userData.pulse = core;
  return g;
}
function mkScreen(color) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 0.5), M(0x2a3340));
  stand.position.y = 0.25; g.add(stand);
  const scr = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 0.1), EM(color, 1.0));
  scr.position.y = 1.55; g.add(scr);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.7, 0.06), M(0x1a2230));
  frame.position.set(0, 1.55, -0.04); g.add(frame);
  g.userData.pulse = scr;
  return g;
}
function mkTable(color) {
  const g = new THREE.Group();
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.9, 10), M(0x2a3340));
  leg.position.y = 0.45; g.add(leg);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.12, 24), M(0x38424f, { metalness: 0.5 }));
  top.position.y = 0.95; g.add(top);
  const holo = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.1, 18, 1, true),
    EM(color, 0.9, { transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  holo.position.y = 1.6; g.add(holo);
  g.userData.pulse = holo;
  return g;
}
function mkGate(color) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.22, 12, 40), M(0x3a4452, { metalness: 0.6 }));
  ring.position.y = 2.1; g.add(ring);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.72, 36),
    EM(color, 0.8, { transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  disc.position.y = 2.1; g.add(disc);
  const stepM = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 1.4), M(0x2a3340));
  stepM.position.y = 0.12; g.add(stepM);
  g.userData.pulse = disc; g.userData.disc = disc; g.userData.ring = ring;
  return g;
}
function mkPad(color) {
  const g = new THREE.Group();
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.06), M(0x1a2230));
  g.add(pad);
  const scr = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.02), EM(color, 1.2));
  scr.position.z = 0.035; g.add(scr);
  g.userData.pulse = scr;
  return g;
}
function mkCrystal() {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.24), EM(0xff66dd, 1.6, { transparent: true, opacity: 0.92 }));
  c.position.y = 0; g.add(c);
  g.userData.pulse = c; g.userData.spin = c; g.userData.float = c;
  return g;
}
const PROP_BUILDERS = { console: mkConsole, antenna: mkAntenna, telescope: mkTelescope, reactor: mkReactor, screen: mkScreen, table: mkTable };

/* ================================================================
   3D 엔진
   ================================================================ */
function createEngine(canvas, callbacks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 200);
  camera.rotation.order = "YXZ";
  const clock = new THREE.Clock();
  const ray = new THREE.Raycaster();

  const state = {
    keys: {}, yaw: 0, pitch: 0, tYaw: 0, tPitch: 0,
    look: { l: false, r: false, u: false, d: false },
    firstDrag: false, dust: null, bound: 8.7,
    interactables: [], pulses: [], spins: [],
    gate: null, gateOpen: false, roomIdx: 0,
    hoverMeta: null, running: true, fogTarget: null,
  };

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  function disposeScene() {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    while (scene.children.length) scene.remove(scene.children[0]);
    state.interactables = []; state.pulses = []; state.spins = []; state.floats = []; state.gate = null; state.dust = null;
  }

  function addStars() {
    const geo = new THREE.BufferGeometry();
    const N = 700, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3().randomDirection ? new THREE.Vector3().randomDirection() :
        new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const r = 70 + Math.random() * 30;
      pos[i * 3] = v.x * r; pos[i * 3 + 1] = Math.abs(v.y) * r * 0.9 + 2; pos[i * 3 + 2] = v.z * r;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbfd8ff, size: 0.55, sizeAttenuation: true })));
  }

  function register(group, meta, dist = 4.4) {
    group.userData.meta = { ...meta, dist };
    state.interactables.push(group);
    if (group.userData.pulse) state.pulses.push({ m: group.userData.pulse, base: group.userData.pulse.material.emissiveIntensity, seed: Math.random() * 6 });
    if (group.userData.spin) state.spins.push(group.userData.spin);
    if (group.userData.float) state.floats = (state.floats || []).concat(group.userData.float);
  }

  /* ----- 공통 배치 ----- */
  function placeAll(W, roomIdx, solvedSet, eggsFound, accent) {
    for (const p of W.props) {
      const g = PROP_BUILDERS[p.type](p.color);
      g.position.set(...p.pos); if (p.rotY) g.rotation.y = p.rotY;
      scene.add(g);
      register(g, { kind: "puzzle", step: p.step, label: p.label, solved: solvedSet.has(p.step) }, p.dist || 4.4);
      if (solvedSet.has(p.step) && g.userData.pulse) g.userData.pulse.material.emissive = new THREE.Color(0x33dd77);
    }
    W.memos.forEach((m) => {
      const g = mkPad(0x66ddff);
      g.position.set(...m.pos); g.rotation.y = m.rotY || 0;
      scene.add(g);
      if (m.stand) {
        const groundY = m.pos[1] - 1.3;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.25, 8), M(0x3a4452));
        post.position.set(m.pos[0], groundY + 0.62, m.pos[2]); scene.add(post);
      }
      register(g, { kind: "memo", label: m.label, text: m.text }, 4.0);
    });
    if (!eggsFound.has(roomIdx)) {
      const g = mkCrystal();
      g.position.set(W.egg[0], W.egg[1] + 0.35, W.egg[2]);
      scene.add(g);
      register(g, { kind: "egg", id: roomIdx, label: "???" }, 3.2);
    }
    // 소품
    const crateMat = M(0x3a4452, { roughness: 0.85 });
    const crateEdge = EM(accent, 0.45);
    for (const [cx, cz, kind, cy0] of (W.clutter || [])) {
      const cy = cy0 || 0;
      if (kind === "crate" || kind === "crate2") {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), crateMat);
        c.position.set(cx, cy + 0.45, cz); c.rotation.y = (cx * 7 + cz * 3) % 1.2; scene.add(c);
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.07, 0.94), crateEdge);
        line.position.set(cx, cy + 0.45, cz); line.rotation.y = c.rotation.y; scene.add(line);
        if (kind === "crate2") {
          const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), crateMat);
          c2.position.set(cx + 0.12, cy + 1.25, cz - 0.08); c2.rotation.y = c.rotation.y + 0.5; scene.add(c2);
        }
      } else if (kind === "barrel") {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.0, 12), M(0x2f3947, { metalness: 0.5 }));
        b.position.set(cx, cy + 0.5, cz); scene.add(b);
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.08, 12), EM(accent, 0.5));
        ring.position.set(cx, cy + 0.72, cz); scene.add(ring);
      } else if (kind === "desk") {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.8), M(0x2a3340));
        top.position.set(cx, cy + 0.85, cz); scene.add(top);
        for (const dx of [-0.7, 0.7]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.7), M(0x222c3a));
          leg.position.set(cx + dx, cy + 0.42, cz); scene.add(leg);
        }
        const mon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.06), EM(accent, 0.8));
        mon.position.set(cx, cy + 1.28, cz - 0.22); mon.rotation.x = -0.15; scene.add(mon);
        state.pulses.push({ m: mon, base: 0.8, seed: cx * 3 });
      } else if (kind === "holo") {
        for (let i = 0; i < 3; i++) {
          const r = new THREE.Mesh(new THREE.TorusGeometry(0.45 - i * 0.12, 0.03, 8, 24),
            EM(accent, 1.1, { transparent: true, opacity: 0.6 }));
          r.rotation.x = Math.PI / 2; r.position.set(cx, cy + 0.6 + i * 0.5, cz); scene.add(r);
          state.spins.push(r);
        }
      }
    }
    // 먼지 입자
    const N = 130, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 4.5 + 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: accent, size: 0.06, transparent: true, opacity: 0.55 }));
    scene.add(dust); state.dust = dust;
  }

  function addQuarks() {
    for (const [qx, qy, qz] of [[-2, 2.6, -6.5], [3.5, 3.1, 2], [-6.5, 2.3, 1]]) {
      const grp = new THREE.Group();
      [[0.22, 0, 0, 0xff7766], [-0.14, 0.2, 0, 0x77ccff], [-0.14, -0.2, 0.1, 0xffcc66]].forEach(([ox, oy, oz, c]) => {
        const q = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), EM(c, 0.9));
        q.position.set(ox, oy, oz); grp.add(q);
      });
      grp.position.set(qx, qy, qz); scene.add(grp); state.spins.push(grp);
    }
  }

  /* ----- ROOM 0: 원형 관측 데크 ----- */
  function buildDeck(W, accent) {
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.8, 0.6, 48), M(W.floor, { roughness: 0.9 }));
    deck.position.y = -0.3; scene.add(deck);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(9.6, 0.07, 8, 64), EM(accent, 0.9));
    rim.rotation.x = Math.PI / 2; rim.position.y = 1.04; scene.add(rim);
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(9.85, 0.06, 8, 64), EM(accent, 0.5));
    rim2.rotation.x = Math.PI / 2; rim2.position.y = 0.06; scene.add(rim2);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.05, 6), M(0x3a4452));
      post.position.set(Math.cos(a) * 9.6, 0.52, Math.sin(a) * 9.6); scene.add(post);
    }
    // 중앙 홀로그램 구 + 빛기둥
    const holo = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12),
      new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.5 }));
    holo.position.set(0, 3.5, 0); scene.add(holo); state.spins.push(holo);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.95, 3.3, 16, 1, true),
      EM(accent, 0.5, { transparent: true, opacity: 0.16, side: THREE.DoubleSide }));
    beam.position.set(0, 1.7, 0); scene.add(beam);
    addQuarks();
    return {
      spawn: [0, 7], gate: [0, -8.4], gateY: 0,
      heightAt: () => 0,
      clamp: (x, z) => { const r = Math.hypot(x, z); if (r > 8.8) { const s = 8.8 / r; return [x * s, z * s]; } return [x, z]; },
    };
  }

  /* ----- ROOM 1: 좁고 긴 기관실 복도 ----- */
  function buildCorridor(W, accent) {
    const wallMat = M(W.wall, { roughness: 0.85 });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.3, 24), M(W.floor, { roughness: 0.9 }));
    floor.position.y = -0.15; scene.add(floor);
    for (const sx of [-4.4, 4.4]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.6, 24), wallMat);
      w.position.set(sx, 2.3, 0); scene.add(w);
      for (let i = -2; i <= 2; i++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.6, 0.5), M(W.wall, { metalness: 0.4 }));
        rib.position.set(sx * 0.93, 2.3, i * 4.6); scene.add(rib);
      }
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 23.4), EM(accent, 1.0));
      strip.position.set(sx * 0.93, 4.1, 0); scene.add(strip);
      for (let i = 0; i < 3; i++) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 23.4, 8), M(0x55291a, { metalness: 0.6 }));
        p.rotation.x = Math.PI / 2; p.position.set(sx * 0.9, 3.2 + i * 0.42, 0); scene.add(p);
      }
    }
    for (const sz of [-11.9, 11.9]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(8.8, 4.6, 0.4), wallMat);
      w.position.set(0, 2.3, sz); scene.add(w);
    }
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.3, 24), wallMat);
    ceil.position.y = 4.7; scene.add(ceil);
    for (let i = -2; i <= 2; i++) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.6), EM(accent, 0.9));
      lamp.position.set(0, 4.52, i * 4.6); scene.add(lamp);
    }
    // 바닥 발광 그레이트
    for (const [gx, gz] of [[-2, 0], [2, -4.5], [0, 4.5], [0, -8]]) {
      const gr = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 1.0), EM(0xff5522, 0.7, { transparent: true, opacity: 0.85 }));
      gr.position.set(gx, 0.04, gz); scene.add(gr);
      state.pulses.push({ m: gr, base: 0.7, seed: gx + gz });
    }
    return {
      spawn: [0, 9.6], gate: [0, -9.6], gateY: 0,
      heightAt: () => 0,
      clamp: (x, z) => [Math.max(-3.6, Math.min(3.6, x)), Math.max(-8.4, Math.min(10.8, z))],
    };
  }

  /* ----- ROOM 2: 마그마 위 징검다리 ----- */
  function buildPlatforms(W, accent) {
    const plats = [
      { c: [0, 6], r: 4.4 }, { c: [-7, -3], r: 3.4 }, { c: [7, -3], r: 3.4 },
      { c: [0, -9.5], r: 3.1 }, { c: [0, 10.9], r: 1.1 },
    ];
    const brs = [
      { a: [0, 6], b: [-7, -3], hw: 0.8 }, { a: [0, 6], b: [7, -3], hw: 0.8 },
      { a: [-7, -3], b: [0, -9.5], hw: 0.8 }, { a: [7, -3], b: [0, -9.5], hw: 0.8 },
      { a: [0, 6], b: [0, 10.9], hw: 0.42 },
    ];
    for (const p of plats) {
      const cy = new THREE.Mesh(new THREE.CylinderGeometry(p.r, p.r + 0.5, 0.7, 36), M(W.floor, { roughness: 0.9 }));
      cy.position.set(p.c[0], -0.35, p.c[1]); scene.add(cy);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(p.r - 0.08, 0.055, 6, 48), EM(accent, 0.9));
      ring.rotation.x = Math.PI / 2; ring.position.set(p.c[0], 0.03, p.c[1]); scene.add(ring);
    }
    for (const b of brs) {
      const dx = b.b[0] - b.a[0], dz = b.b[1] - b.a[1];
      const len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
      const mx = (b.a[0] + b.b[0]) / 2, mz = (b.a[1] + b.b[1]) / 2;
      const box = new THREE.Mesh(new THREE.BoxGeometry(b.hw * 2, 0.24, len), M(0x2f3947, { metalness: 0.5 }));
      box.position.set(mx, -0.12, mz); box.rotation.y = ang; scene.add(box);
      for (const side of [-1, 1]) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, len), EM(accent, 0.8));
        st.position.set(mx + Math.cos(ang) * b.hw * side, 0.03, mz - Math.sin(ang) * b.hw * side);
        st.rotation.y = ang; scene.add(st);
      }
    }
    const planet = new THREE.Mesh(new THREE.SphereGeometry(34, 40, 28), EM(0xff5511, 0.55));
    planet.position.set(0, -37, 0); scene.add(planet);
    const glow = new THREE.PointLight(0xff5522, 1.6, 60); glow.position.set(0, -2, 0); scene.add(glow);
    const seg = (x, z, a, b) => {
      const abx = b[0] - a[0], abz = b[1] - a[1];
      const t2 = Math.max(0, Math.min(1, ((x - a[0]) * abx + (z - a[1]) * abz) / (abx * abx + abz * abz)));
      return Math.hypot(x - (a[0] + abx * t2), z - (a[1] + abz * t2));
    };
    return {
      spawn: [0, 6.8], gate: [0, -10.2], gateY: 0,
      heightAt: (x, z) => {
        for (const p of plats) if (Math.hypot(x - p.c[0], z - p.c[1]) <= p.r + 0.12) return 0;
        for (const b of brs) if (seg(x, z, b.a, b.b) <= b.hw + 0.06) return 0;
        return null;
      },
      clamp: (x, z) => [Math.max(-14, Math.min(14, x)), Math.max(-14, Math.min(14, z))],
    };
  }

  /* ----- ROOM 3: 2층 파노라마 브리지 ----- */
  function buildBridge(W, accent) {
    const wallMat = M(W.wall, { roughness: 0.85 });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 20), M(W.floor, { roughness: 0.9 }));
    floor.position.y = -0.15; scene.add(floor);
    const grid = new THREE.GridHelper(20, 20, 0x334455, W.wall);
    grid.position.y = 0.01; scene.add(grid);
    // 남/동/서 벽 + 리브 + 스트립
    for (const [x, z, ry] of [[0, 10, 0], [-10, 0, Math.PI / 2], [10, 0, Math.PI / 2]]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(20, 5.5, 0.4), wallMat);
      w.position.set(x, 2.75, z); w.rotation.y = ry || 0; scene.add(w);
      for (let i = -2; i <= 2; i++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.5, 0.7), M(W.wall, { metalness: 0.4 }));
        rib.position.set(ry ? x * 0.96 : i * 4.2, 2.75, ry ? i * 4.2 : z * 0.96);
        rib.rotation.y = ry || 0; scene.add(rib);
      }
      const strip = new THREE.Mesh(new THREE.BoxGeometry(19.4, 0.14, 0.14), EM(accent, 1.0));
      strip.position.set(ry ? x * 0.965 : 0, 4.9, ry ? 0 : z * 0.965);
      strip.rotation.y = ry || 0; scene.add(strip);
    }
    // 북쪽 = 파노라마 창
    const sill = new THREE.Mesh(new THREE.BoxGeometry(20, 0.85, 0.4), wallMat);
    sill.position.set(0, 0.42, -9.9); scene.add(sill);
    const header = new THREE.Mesh(new THREE.BoxGeometry(20, 1.0, 0.4), wallMat);
    header.position.set(0, 5.05, -9.9); scene.add(header);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(20, 3.75, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x99ccff, transparent: true, opacity: 0.1, roughness: 0.1, metalness: 0.2 }));
    glass.position.set(0, 2.72, -9.9); scene.add(glass);
    for (let i = -2; i <= 2; i++) {
      const mul = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.75, 0.22), M(0x1a2230, { metalness: 0.5 }));
      mul.position.set(i * 4, 2.72, -9.9); scene.add(mul);
    }
    const earth = new THREE.Mesh(new THREE.SphereGeometry(9.5, 36, 26), EM(0x2266dd, 0.5));
    earth.position.set(0, 8, -33); scene.add(earth);
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(9.7, 24, 18), EM(0xffffff, 0.25, { transparent: true, opacity: 0.25 }));
    cloud.position.copy(earth.position); scene.add(cloud);
    // 상부 갑판 + 계단
    const deck = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.3, 5.6), M(0x1a2a44, { metalness: 0.4 }));
    deck.position.set(5.7, 2.25, 6.7); scene.add(deck);
    const deckStrip = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.08, 0.08), EM(accent, 0.9));
    deckStrip.position.set(5.7, 2.42, 3.95); scene.add(deckStrip);
    for (const [lx, lz] of [[2.3, 4.3], [9.1, 4.3], [2.3, 9.1], [9.1, 9.1]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.25, 8), M(0x2a3340));
      leg.position.set(lx, 1.12, lz); scene.add(leg);
    }
    // 난간 (서쪽 가장자리, 계단 입구 z6~8 비움)
    for (const [rz1, rz2] of [[4.1, 5.9], [8.1, 9.4]]) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, rz2 - rz1, 6), M(0x3a4452));
      bar.rotation.x = Math.PI / 2; bar.position.set(2.0, 3.35, (rz1 + rz2) / 2); scene.add(bar);
      for (const rz of [rz1, rz2]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 6), M(0x3a4452));
        post.position.set(2.0, 2.88, rz); scene.add(post);
      }
    }
    for (let i = 0; i < 8; i++) {
      const stp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 2.2), M(0x2a3a55, { metalness: 0.4 }));
      stp.position.set(-1.35 + i * 0.47, 0.14 + i * 0.29, 7); scene.add(stp);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.08), EM(accent, 0.8));
      edge.position.set(-1.35 + i * 0.47, 0.3 + i * 0.29, 5.95); scene.add(edge);
    }
    // 측벽 성도 패널
    for (const [x, z, ry] of [[-9.7, -3, Math.PI / 2], [-9.7, 3, Math.PI / 2]]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.9, 0.08), EM(0x1a3a66, 0.6));
      panel.position.set(x, 2.4, z); panel.rotation.y = ry; scene.add(panel);
      for (let i = 0; i < 10; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), EM(0xaaddff, 1.4));
        dot.position.set(x + 0.06, 1.7 + Math.random() * 1.4, z + (Math.random() - 0.5) * 3);
        scene.add(dot);
      }
    }
    return {
      spawn: [0, 2], gate: [0, -8.6], gateY: 0,
      heightAt: (x, z) => {
        if (x >= 2 && x <= 9.5 && z >= 4 && z <= 9.5) return 2.4;
        if (x >= -1.6 && x < 2 && z >= 5.9 && z <= 8.1) return Math.max(0, Math.min(2.4, ((x + 1.6) / 3.6) * 2.4));
        return 0;
      },
      clamp: (x, z) => [Math.max(-8.7, Math.min(9.45, x)), Math.max(-8.7, Math.min(9.45, z))],
    };
  }

  /* ----- ROOM 4: 원형 계단식 관제실 ----- */
  function buildTheater(W, accent) {
    const ringTier = (rIn, rOut, yTop, h, color) => {
      const n = 24, rMid = (rIn + rOut) / 2;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const seg2 = new THREE.Mesh(new THREE.BoxGeometry(rOut - rIn, h, (2 * Math.PI * rMid) / n * 1.1), M(color, { roughness: 0.85 }));
        seg2.position.set(Math.cos(a) * rMid, yTop - h / 2, Math.sin(a) * rMid);
        seg2.rotation.y = -a; scene.add(seg2);
      }
    };
    ringTier(6.6, 10.2, 1.0, 1.3, W.floor);
    ringTier(3.5, 6.6, 0.5, 0.8, 0x0d2a22);
    const pit = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.9, 0.3, 36), M(0x081712, { roughness: 0.9 }));
    pit.position.y = -0.15; scene.add(pit);
    for (const [rr, yy] of [[9.9, 1.03], [6.6, 1.03], [3.5, 0.53], [3.4, 0.03]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.05, 6, 64), EM(accent, 0.8));
      ring.rotation.x = Math.PI / 2; ring.position.y = yy; scene.add(ring);
    }
    // 돔
    const dome = new THREE.Mesh(new THREE.SphereGeometry(11, 26, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.1 }));
    dome.position.y = 0.2; scene.add(dome);
    // 중앙 홀로그램 지구
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.15, 0.6, 18), M(0x1a3a30, { metalness: 0.5 }));
    ped.position.y = 0.3; scene.add(ped);
    const hEarth = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 14),
      new THREE.MeshBasicMaterial({ color: 0x55bbff, wireframe: true, transparent: true, opacity: 0.55 }));
    hEarth.position.y = 2.6; scene.add(hEarth); state.spins.push(hEarth);
    const hRing = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.045, 6, 48),
      EM(accent, 1.0, { transparent: true, opacity: 0.6 }));
    hRing.rotation.x = 1.25; hRing.position.y = 2.6; scene.add(hRing); state.spins.push(hRing);
    const hBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.0, 3.6, 16, 1, true),
      EM(accent, 0.5, { transparent: true, opacity: 0.14, side: THREE.DoubleSide }));
    hBeam.position.y = 2.0; scene.add(hBeam);
    // 상태등
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), EM(i % 2 ? accent : 0xffaa44, 1.3));
      led.position.set(Math.cos(a) * 6.7, 1.25, Math.sin(a) * 6.7);
      scene.add(led); state.pulses.push({ m: led, base: 1.3, seed: i * 1.7 });
    }
    return {
      spawn: [0, 7.6], gate: [0, -8.3], gateY: 1.0,
      heightAt: (x, z) => { const r = Math.hypot(x, z); return r > 6.6 ? 1.0 : r > 3.5 ? 0.5 : 0; },
      clamp: (x, z) => { const r = Math.hypot(x, z); if (r > 9.3) { const s = 9.3 / r; return [x * s, z * s]; } return [x, z]; },
    };
  }

  const BUILDERS = { deck: buildDeck, corridor: buildCorridor, platforms: buildPlatforms, bridge: buildBridge, theater: buildTheater };

  function loadRoom(roomIdx, solvedSet, eggsFound) {
    disposeScene();
    state.roomIdx = roomIdx; state.gateOpen = false; state.falling = false; state.fallV = 0;
    const W = WORLDS[roomIdx];
    const accent = W.accent || 0x88ccff;
    scene.fog = new THREE.FogExp2(W.fog[0], W.fog[1]);
    state.fogTarget = null;
    scene.background = new THREE.Color(0x02040a);
    scene.add(new THREE.AmbientLight(W.amb, 1.15));
    W.lights.forEach(([c, x, y, z]) => { const L = new THREE.PointLight(c, 1.2, 40); L.position.set(x, y, z); scene.add(L); });
    addStars();

    const cfg = BUILDERS[W.layout](W, accent);
    state.heightAt = cfg.heightAt; state.clampFn = cfg.clamp; state.spawn = cfg.spawn;

    placeAll(W, roomIdx, solvedSet, eggsFound, accent);

    const gate = mkGate(0xdd4455);
    gate.position.set(cfg.gate[0], cfg.gateY || 0, cfg.gate[1]);
    scene.add(gate);
    register(gate, { kind: "gate", label: "점프 게이트" }, 5.2);
    state.gate = gate;

    const sh = cfg.heightAt(cfg.spawn[0], cfg.spawn[1]) || 0;
    camera.position.set(cfg.spawn[0], sh + 1.6, cfg.spawn[1]);
    state.yaw = 0; state.pitch = 0; state.tYaw = 0; state.tPitch = 0;
    resize();
  }

  function setGateOpen(open, last) {
    state.gateOpen = open;
    if (!state.gate) return;
    const c = open ? (last ? 0x66ffcc : 0x44ff88) : 0xdd4455;
    state.gate.userData.disc.material.emissive = new THREE.Color(c);
    state.gate.userData.disc.material.opacity = open ? 0.85 : 0.55;
    const meta = state.gate.userData.meta;
    meta.label = open ? (last ? "착륙 게이트 — 기동 준비 완료" : "점프 게이트 — 기동 준비 완료") : "점프 게이트";
  }
  function markSolved(stepIdx) {
    for (const g of state.interactables) {
      const m = g.userData.meta;
      if (m.kind === "puzzle" && m.step === stepIdx) {
        m.solved = true;
        if (g.userData.pulse) g.userData.pulse.material.emissive = new THREE.Color(0x33dd77);
      }
    }
  }
  function removeEgg() {
    const idx = state.interactables.findIndex((g) => g.userData.meta.kind === "egg");
    if (idx >= 0) { const g = state.interactables[idx]; scene.remove(g); state.interactables.splice(idx, 1); }
  }
  function setFogDensity(d) { state.fogTarget = d; }

  /* ----- 입력 ----- */
  const onKey = (down) => (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "q", "e", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      state.keys[k] = down;
      if (down) e.preventDefault();
    }
  };
  const kd = onKey(true), ku = onKey(false);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);

  let ptr = null;
  canvas.addEventListener("pointerdown", (e) => {
    ptr = { x: e.clientX, y: e.clientY, t: Date.now(), moved: 0 };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!ptr) return;
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
    ptr.moved += Math.abs(dx) + Math.abs(dy);
    ptr.x = e.clientX; ptr.y = e.clientY;
    // 화면 높이 비례 감도: 화면 세로 절반을 쓸면 약 80° 회전
    const sens = 2.8 / Math.max(300, canvas.clientHeight || 600);
    state.tYaw -= dx * sens;
    state.tPitch = Math.max(-1.05, Math.min(1.05, state.tPitch - dy * sens));
    if (!state.firstDrag && ptr.moved > 30) { state.firstDrag = true; callbacks.onFirstDrag && callbacks.onFirstDrag(); }
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!ptr) return;
    const tap = ptr.moved < 10 && Date.now() - ptr.t < 400;
    ptr = null;
    if (!tap) return;
    const r = canvas.getBoundingClientRect();
    const nd = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(nd, camera);
    const hits = ray.intersectObjects(state.interactables, true);
    if (!hits.length) return;
    let obj = hits[0].object;
    while (obj && !obj.userData.meta) obj = obj.parent;
    if (!obj) return;
    const meta = obj.userData.meta;
    const d = camera.position.distanceTo(hits[0].point);
    if (d > meta.dist) { callbacks.onFar(); return; }
    callbacks.onInteract(meta);
  });

  /* ----- 루프 ----- */
  let hoverTick = 0;
  function frame() {
    if (!state.running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // 이동
    const K = state.keys, L = state.look;
    const fwd = (K.w || K.arrowup ? 1 : 0) - (K.s || K.arrowdown ? 1 : 0);
    const str = (K.d ? 1 : 0) - (K.a ? 1 : 0);
    if ((fwd || str) && !state.falling) {
      const f = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
      const rgt = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
      camera.position.addScaledVector(f, fwd * 4.2 * dt);
      camera.position.addScaledVector(rgt, str * 4.2 * dt);
      const cl = state.clampFn ? state.clampFn(camera.position.x, camera.position.z) : [camera.position.x, camera.position.z];
      camera.position.x = cl[0]; camera.position.z = cl[1];
    }
    // 지형 높이 / 추락
    if (!state.falling) {
      const h = state.heightAt ? state.heightAt(camera.position.x, camera.position.z) : 0;
      if (h === null) { state.falling = true; state.fallV = 0; }
      else {
        const bob = (fwd || str) ? Math.sin(t * 9) * 0.04 : 0;
        const ty = h + 1.6 + bob;
        camera.position.y += (ty - camera.position.y) * Math.min(1, dt * 10);
      }
    }
    if (state.falling) {
      state.fallV += 26 * dt;
      camera.position.y -= state.fallV * dt;
      state.tPitch = Math.min(1.05, state.tPitch + dt * 1.4);
      if (camera.position.y < -9) {
        state.falling = false; state.fallV = 0;
        const sh = (state.heightAt && state.heightAt(state.spawn[0], state.spawn[1])) || 0;
        camera.position.set(state.spawn[0], sh + 1.6, state.spawn[1]);
        state.yaw = 0; state.pitch = 0; state.tYaw = 0; state.tPitch = 0;
        callbacks.onFall && callbacks.onFall();
      }
    }
    // 버튼/키 회전 (Q·E, 좌우 방향키, 화면 회전 버튼)
    const rotIn = (K.q || K.arrowleft || L.l ? 1 : 0) - (K.e || K.arrowright || L.r ? 1 : 0);
    const pitIn = (L.u ? 1 : 0) - (L.d ? 1 : 0);
    if (rotIn) state.tYaw += rotIn * 1.9 * dt;
    if (pitIn) state.tPitch = Math.max(-1.05, Math.min(1.05, state.tPitch + pitIn * 1.3 * dt));
    // 부드러운 시점 보간
    state.yaw += (state.tYaw - state.yaw) * Math.min(1, dt * 14);
    state.pitch += (state.tPitch - state.pitch) * Math.min(1, dt * 14);
    camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;

    // 안개 보간 (방 1 클리어링)
    if (scene.fog && state.fogTarget != null && Math.abs(scene.fog.density - state.fogTarget) > 0.0005) {
      scene.fog.density += (state.fogTarget - scene.fog.density) * Math.min(1, dt * 2.2);
    }
    // 펄스/회전
    for (const p of state.pulses) p.m.material.emissiveIntensity = p.base + Math.sin(t * 3 + p.seed) * 0.45;
    for (const s of state.spins) { s.rotation.y += dt * 1.6; }
    if (state.dust) { state.dust.rotation.y += dt * 0.02; state.dust.position.y = Math.sin(t * 0.4) * 0.15; }
    for (const f of (state.floats || [])) f.position.y = 0.15 + Math.sin(t * 2) * 0.12;
    if (state.gate) state.gate.userData.ring.rotation.z += dt * (state.gateOpen ? 1.4 : 0.25);

    // 호버 프롬프트 (중앙 레이캐스트, 8프레임마다)
    if (++hoverTick % 8 === 0) {
      ray.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hits = ray.intersectObjects(state.interactables, true);
      let meta = null;
      if (hits.length) {
        let obj = hits[0].object;
        while (obj && !obj.userData.meta) obj = obj.parent;
        if (obj && camera.position.distanceTo(hits[0].point) < obj.userData.meta.dist + 1.6) {
          meta = { ...obj.userData.meta, near: camera.position.distanceTo(hits[0].point) <= obj.userData.meta.dist };
        }
      }
      const key = meta ? meta.kind + (meta.label || "") + meta.near + !!meta.solved : "";
      if (key !== state.hoverMeta) { state.hoverMeta = key; callbacks.onHover(meta); }
    }
    renderer.render(scene, camera);
  }
  resize(); frame();

  function resetView() { state.tYaw = Math.round(state.tYaw / (Math.PI * 2)) * Math.PI * 2; state.tPitch = 0; }

  return {
    loadRoom, markSolved, setGateOpen, removeEgg, setFogDensity,
    keys: state.keys, look: state.look, resetView,
    destroy() {
      state.running = false;
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", resize);
      disposeScene(); renderer.dispose();
    },
  };
}

/* ================================================================
   메인 앱 (3D)
   ================================================================ */
/* ================================================================
   대화 오버레이
   ================================================================ */
function DialogueBox({ dlg, onClose }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const line = dlg.lines[i];
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((v) => {
      if (v >= line.t.length) { clearInterval(id); return v; }
      return v + 1;
    }), 14);
    return () => clearInterval(id);
  }, [i, dlg.id]);
  const sp = SPK[line.s];
  const done = n >= line.t.length;
  const tap = () => {
    if (!done) { setN(line.t.length); return; }
    if (i + 1 < dlg.lines.length) setI(i + 1); else onClose();
  };
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" onPointerDown={tap} style={{ cursor: "pointer" }}>
      {dlg.urgent && (
        <div className="text-center font-mono text-xs font-bold py-1.5 animate-pulse"
          style={{ background: "rgba(120,20,30,0.88)", color: "#ffb3c0", letterSpacing: "0.25em" }}>
          ⚠ 긴급 통신 수신 ⚠
        </div>
      )}
      <div className="p-3 pt-10" style={{ background: "linear-gradient(180deg, transparent, rgba(2,4,10,0.5) 35%, rgba(2,4,10,0.92))" }}>
        <div className="max-w-2xl mx-auto rounded-xl p-5"
          style={{
            background: "rgba(7,12,22,0.96)", border: `1px solid ${sp.color}55`,
            animation: dlg.urgent && i === 0 ? "arkheShake .5s" : "none",
          }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex items-center justify-center rounded-full"
              style={{ width: 44, height: 44, background: "#0c1524", border: `1px solid ${sp.color}66`, fontSize: 24 }}>{sp.emoji}</div>
            <span className="font-mono text-base font-bold" style={{ color: sp.color }}>{sp.name}</span>
            <span className="ml-auto font-mono" style={{ color: "#5a7a9a", fontSize: 11 }}>{i + 1}/{dlg.lines.length}</span>
          </div>
          <div className="text-lg leading-relaxed" style={{ color: "#dbe7f4", minHeight: 62 }}>
            {line.t.slice(0, n)}
            {!done && <span className="animate-pulse" style={{ color: sp.color }}>▍</span>}
          </div>
          <div className="text-right font-mono text-sm mt-1.5 animate-pulse" style={{ color: done ? sp.color : "transparent" }}>
            {i + 1 < dlg.lines.length ? "▼ 탭하여 계속" : "▼ 탭하여 닫기"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 진행 상황 자동 저장 (localStorage) ----------
   새로고침·뒤로가기·탭 종료로 진행이 날아가지 않도록 기기에만 저장합니다.
   (서버 전송 없음 — 개인정보 미수집 방침 유지) */
const SAVE_KEY = "arkhe:save";
function loadSave() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    return d && d.v === 1 && d.nick && Array.isArray(d.solved) ? d : null;
  } catch (e) { return null; }
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [profile, setProfile] = useState({ nick: "" });
  const [roomIdx, setRoomIdx] = useState(0);
  const [solved, setSolved] = useState(() => new Set());
  const [eggs, setEggs] = useState(() => new Set());
  const [modal, setModal] = useState(null); // {kind:'puzzle',step}|{kind:'memo',label,text}
  const [modalDone, setModalDone] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [aiTone, setAiTone] = useState("");
  const [hudMsg, setHudMsg] = useState("");
  const [hover, setHover] = useState(null);
  const [startTs, setStartTs] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [wrongCnt, setWrongCnt] = useState(0);
  const [hintCnt, setHintCnt] = useState(0);
  const [toast, setToast] = useState(null);
  const [jumping, setJumping] = useState(false);
  const [finalSec, setFinalSec] = useState(0);
  const [report, setReport] = useState(null); // 생성된 보고서 이미지 {url, fname}
  const [inv, setInv] = useState([]); // 수집한 데이터패드 {label, text, room}
  const [invOpen, setInvOpen] = useState(false); // 인벤토리 패널 열림
  const [invNew, setInvNew] = useState(false); // 새 아이템 알림 점멸
  const [confirmExit, setConfirmExit] = useState(false); // 처음 화면 나가기 확인
  const [saveData, setSaveData] = useState(() => loadSave()); // 이어하기용 저장 기록
  const [tut, setTut] = useState(false);
  const [dragHint, setDragHint] = useState(true);
  const [dlg, setDlg] = useState(null);
  const dlgRef = useRef(null); dlgRef.current = dlg;
  const pendingRef = useRef(null);
  const introRef = useRef(false);
  const openDlg = (lines, urgent) => setDlg({ lines, urgent: !!urgent, id: Date.now() });

  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const handlerRef = useRef(() => {});
  const solvedRef = useRef(solved); solvedRef.current = solved;
  const toastTimer = useRef(null);
  const total = Math.max(0, elapsed + penalty);

  /* 타이머 */
  useEffect(() => {
    if (screen !== "game") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTs) / 1000)), 400);
    return () => clearInterval(id);
  }, [screen, startTs]);

  /* 진행 상황 자동 저장 — 게임 중 상태가 바뀔 때마다 (elapsed 틱 포함) */
  useEffect(() => {
    if (screen !== "game" || !startTs) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 1, nick: profile.nick, roomIdx,
        solved: [...solved], eggs: [...eggs], inv,
        penalty, wrongCnt, hintCnt, elapsed, savedAt: Date.now(),
      }));
    } catch (e) { /* 시크릿 모드 등 저장 불가 시 무시 */ }
  }, [screen, startTs, roomIdx, solved, eggs, inv, penalty, wrongCnt, hintCnt, elapsed, profile.nick]);

  /* 인트로로 돌아올 때 저장 기록 갱신 (이어하기 카드 표시용) */
  useEffect(() => {
    if (screen === "intro") setSaveData(loadSave());
  }, [screen]);

  /* 안드로이드 뒤로가기 가드 — 게임 중 뒤로가기 시 이탈 대신 나가기 확인창 */
  useEffect(() => {
    if (screen !== "game") return;
    const onPop = () => {
      window.history.pushState({ arkhe: 1 }, "");
      setConfirmExit(true);
    };
    window.history.pushState({ arkhe: 1 }, "");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [screen]);

  const showToast = (text, kind) => {
    clearTimeout(toastTimer.current);
    setToast({ text, kind, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  /* 엔진 생성/파괴 */
  useEffect(() => {
    if (screen !== "game" || !canvasRef.current) return;
    const eng = createEngine(canvasRef.current, {
      onInteract: (meta) => handlerRef.current(meta),
      onHover: (meta) => setHover(meta),
      onFar: () => {
        setHudMsg("대상이 너무 멉니다 — 더 가까이 접근하십시오.");
        setTimeout(() => setHudMsg(""), 3000);
      },
      onFirstDrag: () => setDragHint(false),
      onFall: () => {
        setPenalty((p) => p + 10);
        showToast("⚠ 추락! 발판으로 복귀 +10초", "bad");
        setHudMsg("발판 한가운데로, 천천히 건너십시오.");
        setTimeout(() => setHudMsg(""), 3000);
      },
    });
    engineRef.current = eng;
    return () => { eng.destroy(); engineRef.current = null; };
  }, [screen]);

  /* 방 로드 */
  useEffect(() => {
    if (screen !== "game" || !engineRef.current) return;
    engineRef.current.loadRoom(roomIdx, solvedRef.current, eggs);
    const req = WORLDS[roomIdx].props.map((p) => p.step);
    const open = req.every((s) => solvedRef.current.has(s));
    engineRef.current.setGateOpen(open, roomIdx === WORLDS.length - 1);
    setAiTone(""); setAiMsg(""); setHudMsg("");
    if (roomIdx > 0) setTimeout(() => openDlg(DLG.enter[roomIdx]), 800);
  }, [screen, roomIdx]);

  /* 상호작용 핸들러 (항상 최신 상태 참조) */
  handlerRef.current = (meta) => {
    if (modal || dlgRef.current) return;
    if (meta.kind === "puzzle") {
      if (meta.solved) { setHudMsg(`${meta.label} — 이미 해석 완료된 장치입니다.`); return; }
      setModal({ kind: "puzzle", step: meta.step }); setModalDone(false);
      setAiTone(""); setAiMsg(STEPS[meta.step].intro);
    } else if (meta.kind === "memo") {
      setModal({ kind: "memo", label: meta.label, text: meta.text });
      // 인벤토리에 수집 (중복 방지) — 이후 🎒에서 언제든 다시 읽기 가능
      setInv((v) => {
        if (v.some((it) => it.label === meta.label)) return v;
        setInvNew(true);
        return [...v, { label: meta.label, text: meta.text, room: roomIdx }];
      });
    } else if (meta.kind === "egg") {
      engineRef.current && engineRef.current.removeEgg();
      setEggs((e) => new Set(e).add(meta.id));
      setPenalty((p) => p - 20);
      setInvNew(true);
      showToast("✦ 크로노 크리스털 발견! 기록 -20초", "hint");
      setTimeout(() => openDlg(DLG.crystal), 250);
    } else if (meta.kind === "gate") {
      const req = WORLDS[roomIdx].props.map((p) => p.step);
      const remain = req.filter((s) => !solvedRef.current.has(s)).length;
      if (remain > 0) {
        setAiTone("bad"); setAiMsg(`게이트 잠김 — 이 시대의 남은 임무: ${remain}건. 방 안의 빛나는 장치를 조사하십시오.`);
        return;
      }
      if (roomIdx === WORLDS.length - 1) {
        const t = Math.max(0, Math.floor((Date.now() - startTs) / 1000) + penalty);
        setFinalSec(t); setReport(null); clearSave(); setScreen("ending");
        return;
      }
      setJumping(true);
      setTimeout(() => { setRoomIdx((r) => r + 1); setTimeout(() => setJumping(false), 500); }, 900);
    }
  };

  const startGame = () => {
    setSolved(new Set()); setEggs(new Set()); setRoomIdx(0);
    setPenalty(0); setWrongCnt(0); setHintCnt(0); setElapsed(0);
    setModal(null); setReport(null); setStartTs(Date.now());
    setInv([]); setInvOpen(false); setInvNew(false); setConfirmExit(false);
    setTut(true); setDragHint(true);
    setDlg(null); pendingRef.current = null; introRef.current = false;
    setScreen("game");
  };

  /* 저장된 진행 상황에서 이어하기 — 타이머는 저장 시점부터 다시 진행 */
  const resumeGame = () => {
    const d = loadSave();
    if (!d) return;
    setProfile({ nick: d.nick });
    setSolved(new Set(d.solved)); setEggs(new Set(d.eggs)); setInv(d.inv || []);
    setRoomIdx(d.roomIdx);
    setPenalty(d.penalty || 0); setWrongCnt(d.wrongCnt || 0); setHintCnt(d.hintCnt || 0);
    setElapsed(d.elapsed || 0); setStartTs(Date.now() - (d.elapsed || 0) * 1000);
    setModal(null); setReport(null); setInvOpen(false); setInvNew(false); setConfirmExit(false);
    setTut(false); setDragHint(false);
    setDlg(null); pendingRef.current = null; introRef.current = true;
    setScreen("game");
  };

  /* 퍼즐 콜백 */
  const onWrong = () => {
    setPenalty((p) => p + 30); setWrongCnt((w) => w + 1);
    setAiTone("bad"); setAiMsg(WRONG_LINES[Math.floor(Math.random() * WRONG_LINES.length)]);
    showToast("⚠ 오답 페널티 +30초", "bad");
  };
  const onHint = (step) => {
    setPenalty((p) => p + 10); setHintCnt((h) => h + 1);
    setAiTone("hint"); setAiMsg("[힌트] " + step.hint);
    showToast("힌트 사용 +10초", "hint");
  };
  const onDone = (stepIdx) => {
    setModalDone(true);
    if (stepIdx === 3) pendingRef.current = "urgent";
    setAiTone("ok"); setAiMsg(STEPS[stepIdx].success);
    setSolved((s) => {
      const ns = new Set(s); ns.add(stepIdx);
      return ns;
    });
    engineRef.current && engineRef.current.markSolved(stepIdx);
  };
  const closePuzzle = () => {
    setModal(null);
    const req = WORLDS[roomIdx].props.map((p) => p.step);
    const open = req.every((s) => solvedRef.current.has(s));
    if (open && engineRef.current) {
      engineRef.current.setGateOpen(true, roomIdx === WORLDS.length - 1);
    }
    if (pendingRef.current === "urgent") {
      pendingRef.current = null;
      setTimeout(() => openDlg(DLG.urgentStar, true), 350);
    } else if (open) {
      setTimeout(() => openDlg(DLG.gate[roomIdx]), 350);
    }
  };
  const orderProgress = (p) => {
    if (roomIdx === 0 && engineRef.current) engineRef.current.setFogDensity(0.125 - p * 0.1);
  };

  /* 결과 보고서 이미지 생성 + 다운로드 */
  const saveReport = async () => {
    const rec = { nick: profile.nick.trim(), t: finalSec, w: wrongCnt, h: hintCnt, e: eggs.size, total: STEPS.length, at: Date.now() };
    // 캔버스에 픽셀 폰트가 정확히 렌더되도록 폰트 로드를 먼저 보장
    try {
      if (document.fonts && document.fonts.load) {
        await Promise.all([
          document.fonts.load("130px 'Press Start 2P'"),
          document.fonts.load("40px 'DungGeunMo'"),
        ]);
      }
    } catch (e) { /* 폰트 로드 실패 시 폴백 폰트로 진행 */ }
    const cv = buildReportCanvas(rec);
    const stamp = new Date(rec.at);
    const pad2 = (n) => String(n).padStart(2, "0");
    const fname = `ARKHE_보고서_${rec.nick}_${stamp.getFullYear()}${pad2(stamp.getMonth() + 1)}${pad2(stamp.getDate())}_${pad2(stamp.getHours())}${pad2(stamp.getMinutes())}.png`;
    cv.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      if (report && report.url) URL.revokeObjectURL(report.url);
      setReport({ url, fname });
      const a = document.createElement("a");
      a.href = url; a.download = fname;
      document.body.appendChild(a); a.click(); a.remove();
    }, "image/png");
  };

  const GlobalCss = (
    <style>{`
      @keyframes arkheTwinkle {0%,100%{opacity:.15}50%{opacity:.9}}
      @keyframes arkheDrop {from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}
      @keyframes arkheFlash {0%{opacity:0}25%{opacity:1}100%{opacity:0}}
      @keyframes arkheShake {0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
      select option{background:#05070d;color:#8be9fd;}
      input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;}
      html,body{overscroll-behavior:none;}
    `}</style>
  );

  /* ---------- 인트로 ---------- */
  if (screen === "intro") {
    const ready = profile.nick.trim();
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: C.void }}>
        {GlobalCss}<StarField />
        <div className="w-full max-w-md relative">
          <div className="text-center mb-5">
            <div className="font-mono text-xs tracking-widest mb-2" style={{ color: C.dim }}>수도여고 통합과학D · 1학기 복습 프로토콜</div>
            <h1 className="font-mono font-bold text-4xl tracking-widest" style={{ color: C.hud, textShadow: `0 0 24px ${C.hud}55` }}>ARKHE</h1>
            <div className="mt-1 text-sm" style={{ color: C.text }}>138억 년의 귀환 · 3D</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="font-mono text-xs mb-3" style={{ color: C.hud }}>승무원 등록</div>
            <input type="text" placeholder="닉네임 (8자 이내)" value={profile.nick} maxLength={8}
              onChange={(e) => setProfile({ ...profile, nick: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter" && profile.nick.trim()) setScreen("prologue"); }}
              className="w-full rounded-lg px-3 py-3 text-sm outline-none mb-1"
              style={{ background: "#05070d", border: `1px solid ${C.line}`, color: C.text }} />
            <p className="text-xs mb-3" style={{ color: C.dim }}>
              닉네임은 탈출 완료 후 <b>결과 보고서</b>에 표시됩니다. 보고서 이미지를 저장해 선생님께 제출하세요.
            </p>
            <button disabled={!ready} onClick={() => setScreen("prologue")}
              className="w-full rounded-lg py-3 font-mono font-bold transition-all active:scale-95"
              style={ready ? btnPrimary() : { ...btnGhost, opacity: 0.5 }}>
              시스템 부팅 ▸
            </button>
          </div>
          {/* 저장된 진행 상황 — 이어하기 */}
          {saveData && (
            <div className="rounded-xl p-4 mt-3" style={{ background: C.panel, border: `1px solid ${C.ok}44` }}>
              <div className="font-mono text-xs mb-2" style={{ color: C.ok }}>💾 저장된 탐사 기록</div>
              <div className="text-sm mb-3" style={{ color: C.text }}>
                <b>{saveData.nick}</b>
                <span className="font-mono text-xs ml-2" style={{ color: C.dim }}>
                  {ROOMS[saveData.roomIdx] ? ROOMS[saveData.roomIdx].name.split(" — ")[0] : ""} ·
                  MISSION {saveData.solved.length}/{STEPS.length} · {fmt(Math.max(0, (saveData.elapsed || 0) + (saveData.penalty || 0)))}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={resumeGame}
                  className="flex-1 rounded-lg py-2.5 font-mono font-bold text-sm active:scale-95 transition-all"
                  style={btnPrimary({ borderColor: C.ok + "66", color: C.ok, background: "linear-gradient(180deg,#0b3a26,#062818)" })}>
                  ▶ 이어서 하기
                </button>
                <button onClick={() => { clearSave(); setSaveData(null); }}
                  className="rounded-lg px-4 py-2.5 font-mono text-sm" style={btnGhost}>
                  🗑 삭제
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- 프롤로그 ---------- */
  if (screen === "prologue") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: C.void }}>
        {GlobalCss}<StarField />
        <div className="w-full max-w-md relative">
          <div className="rounded-xl p-5" style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.bad}` }}>
            <div className="font-mono text-xs mb-3 animate-pulse" style={{ color: C.bad }}>⚠ EMERGENCY — 시간 항법 장치 폭주</div>
            {PROLOGUE.map((line, i) => (
              <p key={i} className="text-sm mb-3 leading-relaxed" style={{ color: i === 0 ? C.dim : C.text }}>{line}</p>
            ))}
            <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${C.line}` }}>
              <div className="font-mono text-xs mb-2" style={{ color: C.hud }}>조작 방법</div>
              <div className="text-xs leading-relaxed" style={{ color: C.text }}>
                <b style={{ color: C.hud }}>W / S</b> 또는 <b style={{ color: C.hud }}>↑ ↓</b> — 앞뒤 이동 · <b style={{ color: C.hud }}>A / D</b> — 옆걸음<br />
                <b style={{ color: C.hud }}>← →</b> 또는 <b style={{ color: C.hud }}>Q / E</b> — 좌우로 둘러보기<br />
                <b style={{ color: C.hud }}>화면을 꾹 누른 채 드래그</b> — 자유롭게 둘러보기<br />
                <b style={{ color: C.hud }}>빛나는 물체를 탭</b> — 조사 · 퍼즐<br />
                방의 임무를 모두 완수하면 <b style={{ color: C.ok }}>점프 게이트</b>가 열립니다.<br />
                숨겨진 <b style={{ color: "#ff8ae0" }}>✦ 크로노 크리스털</b>을 찾으면 기록 -20초!
              </div>
            </div>
            <div className="font-mono text-xs mb-4" style={{ color: C.warn }}>
              승무원: {profile.nick} │ 오답 +30초 · 힌트 +10초
            </div>
            <button onClick={startGame} className="w-full rounded-lg py-3 font-mono font-bold active:scale-95 transition-all" style={btnPrimary()}>
              ▶ 귀환 프로토콜 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 3D 게임 ---------- */
  if (screen === "game") {
    const W = WORLDS[roomIdx];
    const room = ROOMS[roomIdx];
    const req = W.props.map((p) => p.step);
    const modalStep = modal && modal.kind === "puzzle" ? STEPS[modal.step] : null;
    const dpad = (k, sym, cls) => (
      <button key={k} className={"rounded-lg font-mono font-bold text-lg select-none " + cls}
        style={{ width: 52, height: 52, background: "rgba(10,16,28,0.75)", border: `1px solid ${C.line}`, color: C.hud, touchAction: "none" }}
        onPointerDown={(e) => { e.preventDefault(); engineRef.current && (engineRef.current.keys[k] = true); }}
        onPointerUp={() => engineRef.current && (engineRef.current.keys[k] = false)}
        onPointerLeave={() => engineRef.current && (engineRef.current.keys[k] = false)}>
        {sym}
      </button>
    );
    const lookBtn = (k, sym) => (
      <button key={"lk" + k} className="rounded-lg font-mono font-bold text-lg select-none"
        style={{ width: 52, height: 52, background: "rgba(10,16,28,0.75)", border: `1px solid ${C.line}`, color: "#9ad8c8", touchAction: "none" }}
        onPointerDown={(e) => { e.preventDefault(); engineRef.current && (engineRef.current.look[k] = true); }}
        onPointerUp={() => engineRef.current && (engineRef.current.look[k] = false)}
        onPointerLeave={() => engineRef.current && (engineRef.current.look[k] = false)}>
        {sym}
      </button>
    );
    return (
      <div className="fixed inset-0" style={{ background: C.void }}>
        {GlobalCss}
        <canvas ref={canvasRef} className="w-full h-full block" style={{ touchAction: "none" }} />
        {/* 크로스헤어 */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none font-mono" style={{ transform: "translate(-50%,-50%)", color: hover ? (hover.near ? C.ok : C.warn) : "rgba(200,220,255,0.5)", fontSize: 18 }}>+</div>
        {/* 호버 프롬프트 */}
        {hover && (
          <div className="absolute left-1/2 pointer-events-none text-center" style={{ top: "56%", transform: "translateX(-50%)" }}>
            <div className="font-mono text-sm font-bold" style={{ color: hover.solved ? C.ok : C.hud, textShadow: "0 1px 4px #000" }}>
              {hover.kind === "egg" ? "✦ ???" : hover.label}{hover.solved ? " ✓" : ""}
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: hover.near ? C.ok : C.warn, textShadow: "0 1px 4px #000" }}>
              {hover.near ? "[ 탭하여 조사 ]" : "더 가까이 접근하십시오"}
            </div>
          </div>
        )}
        <Toast toast={toast} />
        {/* 상단 HUD */}
        <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(4,6,13,0.9), transparent)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="font-mono text-sm" style={{ color: C.dim }}>
              {room.name}<br /><span style={{ color: C.warn }}>{room.era}</span>
              <div className="mt-1.5">
                {req.map((s) => (
                  <div key={s} style={{ color: solved.has(s) ? C.ok : C.dim, fontSize: 12 }}>
                    {solved.has(s) ? "■" : "□"} {STEP_SHORT[s]}
                  </div>
                ))}
                <div style={{ color: "#ff8ae0", fontSize: 12 }}>✦ 크리스털 {eggs.size}/5</div>
              </div>
            </div>
            {/* 우측: 도움말·나가기 버튼 + 타이머 (버튼을 타이머 왼쪽에 세로로 쌓아 겹침 방지) */}
            <div className="flex items-start gap-2 pointer-events-auto shrink-0">
              <div className="flex flex-col gap-1.5 shrink-0" style={{ marginTop: 4 }}>
                <button onClick={() => setTut(true)} title="조작 방법"
                  className="font-mono font-bold rounded-full"
                  style={{ width: 40, height: 40, fontSize: 18, background: "rgba(10,16,28,0.85)", border: `1px solid ${C.line}`, color: C.hud }}>?</button>
                <button onClick={() => setConfirmExit(true)} title="처음 화면으로"
                  className="font-mono rounded-full"
                  style={{ width: 40, height: 40, fontSize: 17, background: "rgba(10,16,28,0.85)", border: `1px solid ${C.line}`, color: C.dim }}>🏠</button>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-4xl tracking-widest" style={{ color: C.hud, textShadow: "0 1px 8px #000" }}>{fmt(total)}</div>
                <div className="font-mono mt-0.5" style={{ color: C.dim, fontSize: 12 }}>오답 {wrongCnt} · 힌트 {hintCnt}</div>
                <div className="font-mono" style={{ color: C.dim, fontSize: 12 }}>MISSION {solved.size}/{STEPS.length}</div>
              </div>
            </div>
          </div>
        </div>
        {/* AI 메시지 바 */}
        {/* 좁은 화면(폰)에서는 조작 패드 위에 전체 폭으로, 넓은 화면에서는 패드 사이 하단에 표시 */}
        {(hudMsg || aiMsg) && !dlg && <div className="absolute pointer-events-none left-3 right-3 bottom-[204px] sm:left-[176px] sm:right-[176px] sm:bottom-2">
          <div className="max-w-xl mx-auto rounded-lg p-3" style={{ background: "rgba(6,10,20,0.85)", border: `1px solid ${C.line}`, borderLeft: `3px solid ${aiTone === "bad" ? C.bad : aiTone === "ok" ? C.ok : aiTone === "hint" ? C.warn : C.hud}` }}>
            <div className="font-mono mb-1" style={{ color: C.hud, fontSize: 11, letterSpacing: "0.15em" }}>ARKHE-AI</div>
            <div className="text-sm leading-relaxed" style={{ color: C.text }}><Typewriter text={hudMsg || aiMsg} speed={12} /></div>
          </div>
        </div>}
        {/* D-패드 (이동) */}
        <div className="absolute bottom-3 left-3 select-none">
          <div className="grid grid-cols-3 gap-1" style={{ width: 162 }}>
            <div />{dpad("w", "▲", "")}<div />
            {dpad("a", "◀", "")}{dpad("s", "▼", "")}{dpad("d", "▶", "")}
          </div>
          <div className="text-center font-mono mt-0.5" style={{ color: C.dim, fontSize: 9 }}>이동</div>
        </div>
        {/* 시점 패드 (회전) */}
        <div className="absolute bottom-3 right-3 select-none">
          <div className="grid grid-cols-3 gap-1" style={{ width: 162 }}>
            <div />{lookBtn("u", "⤒")}<div />
            {lookBtn("l", "⟲")}
            <button className="rounded-lg font-mono text-lg" style={{ width: 52, height: 52, background: "rgba(10,16,28,0.75)", border: `1px solid ${C.line}`, color: C.warn, touchAction: "none" }}
              onClick={() => engineRef.current && engineRef.current.resetView()}>⌖</button>
            {lookBtn("r", "⟳")}
            <div />{lookBtn("d", "⤓")}<div />
          </div>
          <div className="text-center font-mono mt-0.5" style={{ color: C.dim, fontSize: 9 }}>시점 회전 · ⌖ 정면</div>
        </div>
        {/* 인벤토리 (화면 우측 가장자리) */}
        <div className="absolute right-0 select-none" style={{ top: "44%", transform: "translateY(-50%)", zIndex: 20 }}>
          {!invOpen ? (
            <button onClick={() => { setInvOpen(true); setInvNew(false); }}
              className={"rounded-l-xl font-mono text-center py-2.5 pl-2 pr-1.5" + (invNew ? " animate-pulse" : "")}
              style={{
                background: "rgba(10,16,28,0.88)", color: C.hud,
                border: `1px solid ${invNew ? C.warn : C.line}`, borderRight: "none",
                boxShadow: invNew ? `0 0 12px ${C.warn}55` : "none",
              }}>
              <div style={{ fontSize: 20 }}>🎒</div>
              <div className="font-bold mt-0.5" style={{ fontSize: 11, color: invNew ? C.warn : C.hud }}>{inv.length + eggs.size}</div>
            </button>
          ) : (
            <div className="rounded-l-xl p-3 overflow-y-auto"
              style={{ width: 224, maxHeight: "46vh", background: "rgba(7,12,22,0.96)", border: `1px solid ${C.line}`, borderRight: "none" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold tracking-widest" style={{ color: C.hud }}>🎒 INVENTORY</span>
                <button onClick={() => setInvOpen(false)} className="font-mono text-xs px-2 py-1 rounded-md"
                  style={{ border: `1px solid ${C.line}`, color: C.dim }}>✕</button>
              </div>
              {/* 크로노 크리스털 */}
              <div className="rounded-lg px-2.5 py-2 mb-1.5 flex items-center justify-between"
                style={{ background: "rgba(60,20,50,0.35)", border: "1px solid #ff8ae044" }}>
                <span className="text-xs font-bold" style={{ color: "#ff8ae0" }}>✦ 크로노 크리스털</span>
                <span className="font-mono text-xs font-bold" style={{ color: "#ff8ae0" }}>×{eggs.size}</span>
              </div>
              {/* 데이터패드 목록 — 탭하면 다시 읽기 */}
              {inv.map((it) => (
                <button key={it.label} onClick={() => { setInvOpen(false); setModal({ kind: "memo", label: it.label, text: it.text }); }}
                  className="w-full rounded-lg px-2.5 py-2 mb-1.5 text-left transition-all active:scale-95"
                  style={{ background: "rgba(10,25,40,0.5)", border: `1px solid ${C.line}` }}>
                  <div className="text-xs font-bold" style={{ color: "#66ddff" }}>📄 {it.label}</div>
                  <div className="font-mono mt-0.5" style={{ color: C.dim, fontSize: 9 }}>{ROOMS[it.room].name.split(" — ")[0]} · 탭하여 다시 읽기</div>
                </button>
              ))}
              {inv.length === 0 && eggs.size === 0 && (
                <p className="text-xs py-2 text-center" style={{ color: C.dim }}>
                  아직 비어 있습니다.<br />방 안의 📄 데이터패드와<br />✦ 크리스털을 찾아보세요.
                </p>
              )}
            </div>
          )}
        </div>
        {/* 드래그 안내 (첫 드래그 전까지) */}
        {dragHint && !tut && !modal && (
          <div className="absolute left-1/2 pointer-events-none text-center animate-pulse"
            style={{ top: "26%", transform: "translateX(-50%)", width: "min(420px, calc(100% - 128px))" }}>
            <div className="font-mono text-sm font-bold px-4 py-2 rounded-full"
              style={{ background: "rgba(6,10,20,0.75)", border: `1px solid ${C.hud}55`, color: C.hud }}>
              ◀ &nbsp;화면을 꾹 누른 채 드래그해서 둘러보세요&nbsp; ▶
            </div>
          </div>
        )}
        {/* 처음 화면 나가기 확인 오버레이 */}
        {confirmExit && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(2,4,10,0.85)" }}>
            <div className="w-full max-w-xs rounded-xl p-5 text-center" style={{ background: "#070c16", border: `1px solid ${C.bad}55` }}>
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-mono text-sm font-bold mb-1" style={{ color: C.text }}>처음 화면으로 나갈까요?</div>
              <p className="text-xs mb-4" style={{ color: C.dim }}>진행 상황은 이 기기에 자동 저장됩니다. 처음 화면의 <b style={{ color: C.ok }}>▶ 이어서 하기</b>로 계속할 수 있어요.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmExit(false)}
                  className="flex-1 rounded-lg py-2.5 font-mono text-sm active:scale-95 transition-all" style={btnGhost}>
                  취소
                </button>
                <button onClick={() => { setConfirmExit(false); setScreen("intro"); }}
                  className="flex-1 rounded-lg py-2.5 font-mono text-sm font-bold active:scale-95 transition-all"
                  style={{ background: "rgba(120,20,40,0.4)", border: `1px solid ${C.bad}88`, color: C.bad }}>
                  나가기
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 조작 튜토리얼 오버레이 */}
        {tut && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(2,4,10,0.82)" }}>
            <div className="w-full max-w-md rounded-xl p-5" style={{ background: "#070c16", border: `1px solid ${C.hud}44` }}>
              <div className="font-mono text-xs tracking-widest mb-4 text-center" style={{ color: C.hud }}>— 조작 방법 —</div>
              <div className="grid gap-3 mb-5">
                <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                  <div className="text-3xl">🚶</div>
                  <div className="text-sm" style={{ color: C.text }}>
                    <b style={{ color: C.hud }}>걷기</b> — 키보드 <b>W S</b>(앞뒤) · <b>A D</b>(옆걸음)<br />
                    <span className="text-xs" style={{ color: C.dim }}>또는 화면 왼쪽 아래 ▲▼◀▶ 패드를 꾹 누르기</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                  <div className="text-3xl">👀</div>
                  <div className="text-sm" style={{ color: C.text }}>
                    <b style={{ color: C.hud }}>둘러보기</b> — <b>화면을 꾹 누른 채 천천히 드래그</b><br />
                    <span className="text-xs" style={{ color: C.dim }}>키보드 ← → (또는 Q E)로도 회전 · 오른쪽 아래 ⟲⟳ 버튼도 OK<br />길을 잃으면 <b style={{ color: C.warn }}>⌖</b> 버튼 — 정면(게이트 방향)으로 리셋</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                  <div className="text-3xl">✨</div>
                  <div className="text-sm" style={{ color: C.text }}>
                    <b style={{ color: C.hud }}>조사하기</b> — 빛나는 장치에 <b>가까이 다가가서 탭</b><br />
                    <span className="text-xs" style={{ color: C.dim }}>📄 데이터패드 = 무료 단서 · ✦ 숨은 크리스털 = 기록 -20초<br />획득한 아이템은 화면 오른쪽 <b style={{ color: C.hud }}>🎒 인벤토리</b>에서 다시 볼 수 있어요</span>
                  </div>
                </div>
              </div>
              <button onClick={() => {
                setTut(false);
                if (!introRef.current) { introRef.current = true; setTimeout(() => openDlg(DLG.enter[0]), 300); }
              }} className="w-full rounded-lg py-3 font-mono font-bold active:scale-95 transition-all" style={btnPrimary()}>
                알겠어요, 출발! ▸
              </button>
            </div>
          </div>
        )}
        {/* 대화 오버레이 */}
        {dlg && !tut && <DialogueBox key={dlg.id} dlg={dlg} onClose={() => setDlg(null)} />}
        {/* 점프 오버레이 */}
        {jumping && (
          <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: "#dff6ff", animation: "arkheFlash 1.4s ease-out forwards" }}>
            <div className="font-mono font-bold text-2xl tracking-widest" style={{ color: "#0e3a4c" }}>TIME JUMP ▸▸▸</div>
          </div>
        )}
        {/* 퍼즐/메모 모달 */}
        {modal && (
          <div className="absolute inset-0 z-30 flex items-end sm:items-center justify-center p-3" style={{ background: "rgba(2,4,10,0.72)" }}>
            <div className="w-full max-w-md rounded-xl p-4 overflow-y-auto" style={{ background: "#070c16", border: `1px solid ${C.line}`, maxHeight: "88%" }}>
              {modal.kind === "memo" ? (
                <div>
                  <div className="font-mono text-xs mb-2" style={{ color: "#66ddff" }}>📄 {modal.label}</div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: C.text }}>{modal.text}</p>
                  <button onClick={() => setModal(null)} className="w-full rounded-lg py-2.5 font-mono text-sm" style={btnGhost}>닫기</button>
                </div>
              ) : (
                <div>
                  <div className="font-mono text-xs mb-2 tracking-widest" style={{ color: C.warn }}>{modalStep.label}</div>
                  <AiConsole msg={aiMsg} tone={aiTone} />
                  <div key={modal.step}>
                    {modalStep.kind === "order" && <OrderStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} onProgress={orderProgress} />}
                    {modalStep.kind === "mcq" && <McqStep step={modalStep} done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "spectrum" && <SpectrumStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "fusion" && <FusionStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "code" && <CodeStep step={modalStep} done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "supernova" && <SupernovaStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "blackhole" && <BlackholeStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "formation" && <FormationStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "water2" && <Water2Step done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "wiring" && <WiringStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "scan" && <ScanStep step={modalStep} done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                    {modalStep.kind === "match" && <MatchStep done={() => onDone(modal.step)} wrong={onWrong} locked={modalDone} />}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {!modalDone && (
                      <button onClick={() => onHint(modalStep)} className="flex-1 rounded-lg py-2.5 font-mono text-sm active:scale-95 transition-all"
                        style={{ background: "rgba(60,42,4,0.6)", border: `1px solid ${C.warn}44`, color: C.warn }}>
                        💡 힌트 (+10초)
                      </button>
                    )}
                    <button onClick={closePuzzle} className="flex-1 rounded-lg py-2.5 font-mono text-sm active:scale-95 transition-all"
                      style={modalDone ? btnPrimary({ borderColor: C.ok + "77", color: C.ok, background: "linear-gradient(180deg,#0b3a26,#062818)" }) : btnGhost}>
                      {modalDone ? "✓ 완료 — 방으로 복귀" : "뒤로 (탐색 계속)"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- 엔딩 ---------- */
  if (screen === "ending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: `radial-gradient(90% 60% at 50% 115%, rgba(37,99,235,0.5), transparent 65%), ${C.void}` }}>
        {GlobalCss}<StarField />
        <div className="w-full max-w-md relative">
          <div className="rounded-xl p-5 text-center" style={{ background: C.panel, border: `1px solid ${C.ok}44` }}>
            <div className="text-4xl mb-2">🌍</div>
            <div className="font-mono text-xs tracking-widest mb-1" style={{ color: C.ok }}>MISSION COMPLETE</div>
            <h2 className="font-bold text-xl mb-1" style={{ color: C.text }}>귀환 성공 — {profile.nick}</h2>
            <p className="text-xs mb-4" style={{ color: C.dim }}>138억 년 — 다섯 시대의 방을 모두 탈출했습니다.</p>
            <div className="font-mono font-bold text-5xl tracking-widest mb-1" style={{ color: C.hud, textShadow: `0 0 20px ${C.hud}55` }}>{fmt(finalSec)}</div>
            <div className="font-mono text-xs mb-1" style={{ color: C.dim }}>
              오답 {wrongCnt}회(+{wrongCnt * 30}초) · 힌트 {hintCnt}회(+{hintCnt * 10}초)
            </div>
            <div className="font-mono text-xs mb-4" style={{ color: "#ff8ae0" }}>✦ 크로노 크리스털 {eggs.size}/5 (-{eggs.size * 20}초)</div>
            <button onClick={saveReport} className="w-full rounded-lg py-3 font-mono font-bold mb-2 active:scale-95 transition-all" style={btnPrimary()}>
              📄 결과 보고서 저장 (선생님 제출용)
            </button>
            {report && (
              <div className="rounded-lg p-3 mb-2 text-left" style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${C.ok}44` }}>
                <div className="font-mono text-xs mb-2" style={{ color: C.ok }}>✓ 보고서가 생성되었습니다</div>
                <img src={report.url} alt="임무 결과 보고서" className="w-full rounded-md mb-2" style={{ border: `1px solid ${C.line}` }} />
                <p className="text-xs" style={{ color: C.dim }}>
                  자동 저장(다운로드)되지 않았다면 위 이미지를 <b>길게 눌러(또는 우클릭)</b> 저장한 뒤, 선생님께 제출하세요.
                </p>
              </div>
            )}
            <button onClick={() => setScreen("intro")} className="w-full rounded-lg py-2.5 font-mono text-sm" style={btnGhost}>처음으로</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
