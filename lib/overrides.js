// 디자인별 수동 보정. 파서 휴리스틱이 틀리는 값만 최소한으로 등재한다.
// 형식: { [id]: PartialDesign } — finalize 마지막에 deep merge되어 항상 이긴다.
// 단, colors 키는 파생값(theme/onAccent/accentPool) 계산을 위해 finalize 초두에 선적용된다 —
// 파서가 직접 세팅한 파생값(예: styleref의 onAccent)은 재계산되지 않으니 필요 시 onAccent도 함께 override할 것.
// Task 9 시각 QA에서 채운다.
export const OVERRIDES = {
  // 스크린샷 확인: "라이브 데모" 버튼이 bg #fafafa / fg #eeeeee로 거의 안 보임.
  // 원문 자체가 모순("Light Filled Button" 절이 텍스트 색을 #eeeeee라 적어놓고 바로
  // "실제로는 반전되어 #101010" 이라 부연). 실제 마크업에서 버튼은 다크 캔버스(#101010) 위
  // 히어로에 놓이므로, 원문의 "Ghost Text Link"(투명 배경 + #eeeeee 텍스트) 쪽을 채택.
  factory: {
    components: {
      buttonSecondary: { bg: 'transparent', fg: '#eeeeee' },
      // 카드 fg가 #fafafa로 파싱되어 카드 배경(#eeeeee)과 거의 같은 명도라 헤딩이 안 보임.
      // 원문: "Light Surface Card ... Contains dark text (#101010 or #060505) inside."
      card: { fg: '#101010' }
    }
  },
  // 스크린샷 확인: 카드가 흰색이어야 하는데 accent(#ff682c, Signal Orange)로 파싱됨.
  // 원문: "White card (#ffffff)"가 반복 명시, "never as a button background or large surface".
  ventriloc: {
    components: {
      card: { bg: '#ffffff' }
    }
  },
  // colors.accent가 #ffffff로 오파싱됨: Tokens 테이블에서 accent 정규식(/primary action|.../)이
  // Paper White 행의 Role("Primary action button fill...")에 먼저 매칭되고, 진짜 accent인 Copper
  // 행("...warm accent punctuation — the only chromatic color...")은 테이블상 그 다음 줄이라
  // roleMatch의 첫-매치 우선 규칙에 밀림. 원문 프로즈("a single warm copper accent")와 스펙
  // 요약("- accent: #cc9166 (Copper — editorial links, category labels)")이 Copper를 명시.
  slash: {
    colors: { accent: '#cc9166' }
  },
  // slash.badge.fontSize 오버라이드(99px 오탐)는 parse-styleref-components.js의
  // 폴백 정규식 앵커링 근본 수정으로 제거함 (리뷰 픽스 라운드 1 참고).

  // 버튼이 약 21px로 납작함: parseOmd의 comp()가 height를 버리고 padding "0 20px"만 남김.
  // 원문: "Primary and secondary public actions … Full-pill, 44px height, 0 20px, Inter 16px/510"
  // → 세로 padding으로 44px 맞춤 (primary는 1px 보더 포함, secondary는 보더 없음).
  // 네비 CTA는 "compact 32px variant"와 Navigation 13px로 32px 맞춤. 실측(브라우저) 44/44/32px.
  linear: {
    components: {
      buttonPrimary: { padding: '11px 20px' },
      buttonSecondary: { padding: '12px 20px' },
      navCta: { padding: '7px 16px', fontSize: 13 }
    }
  }
};
