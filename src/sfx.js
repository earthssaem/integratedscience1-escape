/* ================================================================
   ARKHE 효과음 — Web Audio 합성 (오디오 파일 없이 코드로 생성)
   브라우저 자동재생 정책 때문에 AudioContext는 사용자 입력(버튼 클릭)
   이후 init()으로 생성/재개됩니다. 실패해도 게임은 정상 동작합니다.
   ================================================================ */
let ctx = null;
let master = null;
let muted = false;
let amb = null; // 현재 방 앰비언트 노드

function ensure() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch (e) { return null; }
}

/* 단일 톤 — 짧은 어택 후 지수 감쇠 */
function tone(freq, at, dur, { type = "sine", vol = 0.25, slideTo = 0 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(master);
  o.start(at); o.stop(at + dur + 0.05);
}

/* 노이즈 버스트 — 필터 스윕 (게이트·추락 등) */
function noiseBurst(at, dur, { vol = 0.2, from = 300, to = 2500, type = "bandpass" } = {}) {
  const len = Math.ceil(ctx.sampleRate * dur) + 1;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, at);
  f.frequency.exponentialRampToValueAtTime(Math.max(40, to), at + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(at); src.stop(at + dur + 0.05);
}

export const Sfx = {
  /* 사용자 입력 시점에 호출해 오디오를 잠금 해제 */
  init() { ensure(); },

  setMuted(m) {
    muted = !!m;
    if (master) master.gain.value = muted ? 0 : 0.5;
  },

  /* 모달·UI 열기 — 짧은 블립 */
  ui() {
    if (!ensure()) return;
    tone(660, ctx.currentTime, 0.09, { type: "square", vol: 0.08 });
  },

  /* 데이터패드 조사 — 데이터 수신 느낌의 2음 */
  memo() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(880, t, 0.08, { type: "square", vol: 0.1 });
    tone(1320, t + 0.09, 0.12, { type: "square", vol: 0.09 });
  },

  /* 정답 — 상승 아르페지오 */
  correct() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => tone(f, t + i * 0.08, 0.22, { type: "triangle", vol: 0.22 }));
  },

  /* 오답 — 낮은 이중 버저 */
  wrong() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(150, t, 0.16, { type: "sawtooth", vol: 0.18 });
    tone(120, t + 0.19, 0.22, { type: "sawtooth", vol: 0.18 });
  },

  /* 잠긴 게이트 등 거부 — 단일 저음 */
  deny() {
    if (!ensure()) return;
    tone(196, ctx.currentTime, 0.18, { type: "square", vol: 0.12 });
  },

  /* 힌트 — 부드러운 2음 */
  hint() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(587.33, t, 0.14, { type: "sine", vol: 0.16 });
    tone(493.88, t + 0.15, 0.2, { type: "sine", vol: 0.14 });
  },

  /* 크리스털 획득 — 반짝이는 고음 아르페지오 */
  crystal() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.06, 0.3, { type: "triangle", vol: 0.16 }));
  },

  /* 방 클리어 — 팡파르 */
  clear() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    [392, 523.25, 659.25].forEach((f, i) => tone(f, t + i * 0.11, 0.24, { type: "triangle", vol: 0.22 }));
    tone(783.99, t + 0.33, 0.55, { type: "triangle", vol: 0.26 });
  },

  /* 타임 점프 — 라이저 + 노이즈 스윕 */
  jump() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(180, t, 0.9, { type: "sawtooth", vol: 0.14, slideTo: 1400 });
    noiseBurst(t, 1.0, { vol: 0.14, from: 300, to: 5000 });
  },

  /* 추락 — 하강 슬라이드 */
  fall() {
    if (!ensure()) return;
    tone(700, ctx.currentTime, 0.5, { type: "sine", vol: 0.18, slideTo: 90 });
  },

  /* 착륙 시퀀스 — 대기권 진입 럼블 (dur초) */
  rumble(dur = 6) {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = "lowpass";
    f.frequency.setValueAtTime(90, t);
    f.frequency.linearRampToValueAtTime(300, t + dur * 0.85);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 1.2);
    g.gain.setValueAtTime(0.3, t + Math.max(1.3, dur - 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.1);
  },

  /* 착지 충격 */
  thud() {
    if (!ensure()) return;
    const t = ctx.currentTime;
    tone(75, t, 0.5, { type: "sine", vol: 0.5, slideTo: 34 });
    noiseBurst(t, 0.25, { vol: 0.22, from: 900, to: 120, type: "lowpass" });
  },

  /* 방별 앰비언트 드론 — 아주 작은 볼륨으로 은은하게 */
  ambient(roomIdx) {
    if (!ensure()) return;
    this.stopAmbient();
    const base = [58, 49, 44, 62, 66][roomIdx % 5];
    const g = ctx.createGain(); g.gain.value = 0.045;
    const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = base;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = base * 1.5 + 0.7;
    const g2 = ctx.createGain(); g2.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08; // 천천히 일렁임
    const lg = ctx.createGain(); lg.gain.value = 0.018;
    lfo.connect(lg); lg.connect(g.gain);
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    o1.start(); o2.start(); lfo.start();
    const c = ctx;
    amb = {
      stop() {
        try {
          g.gain.cancelScheduledValues(c.currentTime);
          g.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.4);
          setTimeout(() => { try { o1.stop(); o2.stop(); lfo.stop(); } catch (e) {} }, 500);
        } catch (e) {}
      },
    };
  },

  stopAmbient() {
    if (amb) { try { amb.stop(); } catch (e) {} amb = null; }
  },
};
