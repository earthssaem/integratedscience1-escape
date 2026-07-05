'use strict';
/* ============================================================
   build.js — 다중 파일(index.html + styles.css + js/*.js)을
   CSS·JS가 모두 포함된 단일 실행 파일 standalone.html 로 합칩니다.

   실행: node build.js

   ※ 치환 값에 포함된 $, $$, ${} 등이 String.replace 의 특수 패턴으로
     해석되지 않도록, 치환은 반드시 "함수" 형태로 전달합니다.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

let html = read('index.html');
const css = read('styles.css');
const js = ['js/data.js', 'js/engine.js', 'js/puzzles.js', 'js/main.js']
  .map(read).join('\n\n');

// 1) 외부 CSS 링크 → 인라인 <style>
html = html.replace(
  /<link rel="stylesheet" href="styles\.css">/,
  () => '<style>\n' + css + '\n</style>'
);

// 2) 4개의 외부 스크립트 → 인라인 <script> 하나
html = html.replace(
  /<script src="js\/data\.js"><\/script>\s*<script src="js\/engine\.js"><\/script>\s*<script src="js\/puzzles\.js"><\/script>\s*<script src="js\/main\.js"><\/script>/,
  () => '<script>\n' + js + '\n<' + '/script>'
);

// 3) 안내 주석 추가
html = html.replace(
  '<title>',
  () => '<!-- 이 파일은 CSS/JS가 모두 포함된 단일 실행 파일입니다. ' +
        '이 파일 하나만 다운로드해 브라우저로 열면 바로 실행됩니다. ' +
        'build.js 로 자동 생성되므로 직접 편집하지 마세요. -->\n<title>'
);

// 무결성 검증
const leftover = (html.match(/href="styles\.css"|src="js\//g) || []).length;
if (leftover > 0) { console.error('빌드 실패: 외부 참조가 남아 있습니다.'); process.exit(1); }
if (!/const \$\$ =/.test(html)) { console.error('빌드 실패: $$ 선언이 손상되었습니다.'); process.exit(1); }

fs.writeFileSync(path.join(root, 'standalone.html'), html);
console.log('standalone.html 생성 완료 (' + (Buffer.byteLength(html) / 1024).toFixed(0) + 'KB)');
