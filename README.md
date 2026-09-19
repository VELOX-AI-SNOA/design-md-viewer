# DesignMD 뷰어

프로젝트 폴더의 `design-md/`에 모아둔 디자인 시스템 md 파일들을
공통 랜딩페이지 목업으로 시각화하는 뷰어.

## 사용법

- **보기 (권장)**: `DesignMD 뷰어.bat` 더블클릭 — 자동으로 재빌드 후 브라우저가 열립니다.
  md 파일을 추가·수정했어도 항상 최신 상태로 보입니다.
- 수동 빌드: `node build.js` (다른 폴더 대상: `node build.js "D:\다른\폴더"`)
- `index.html`만 열어도 되지만 마지막 빌드 시점의 내용입니다.
- 테스트: `npm test`
- 최초 1회: `npm install` (js-yaml 설치) — bat은 필요한 패키지(js-yaml)가 없으면 자동으로 설치합니다.

## 폰트

각 디자인 문서에 명시된 폰트를 사용합니다. 상용 폰트는 문서가 지정한 대체 폰트로
렌더링합니다 (Ivy Presto→Playfair Display, PolySans→Space Grotesk, SF Pro/Haas/FerrariSans→Inter,
Berkeley Mono→JetBrains Mono). 한글은 Pretendard(세리프는 Noto Serif KR)로 폴백합니다.
문서의 Do's and Don'ts 지침(Ferrari 대문자 CTA, Slash 세리프 28px 이상 등)은
`lib/usage-rules.js`에 데이터로 반영되어 있습니다.

## 지원 포맷

1. OMD — frontmatter에 `tokens:` (kakao 등)
2. alpha — frontmatter에 `version: alpha` (airtable 등)
3. Style Reference — `# 이름 — Style Reference` 헤더 (slash 등). `**Theme:** dark|light` 라인 필수 — 없으면 light로 고정됨

파싱이 어긋나는 디자인은 `lib/overrides.js`에 id별 보정값을 넣어 고친다.
