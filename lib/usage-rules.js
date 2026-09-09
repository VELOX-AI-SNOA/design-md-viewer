// 문서별 사용 지침(Do's and Don'ts) 데이터. 각 항목에 출처 문구 주석 필수.
// 병합: finalize 폴백 완성 → USAGE_RULES[id] → OVERRIDES[id]. 배열 금지.
// palette/accentPool은 배열이므로 USAGE_RULES/OVERRIDES에 절대 넣지 않는다 (deepMerge가 배열을 참조 대입).
// 주의: USAGE_RULES의 colors는 (OVERRIDES와 달리) 선적용되지 않아 파생값에 반영되지 않는다 — colors 변경은 OVERRIDES를 사용할 것.
const SYSTEM_KR = `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`;
const SLASH_SANS = `"Inter", "Pretendard Variable", Pretendard, "Noto Sans KR", "Malgun Gothic", sans-serif`;

export const USAGE_RULES = {
  linear: {
    // "Use Inter Variable with font-feature-settings 'cv01' on, 'ss03' on, 'zero' on" (Do's)
    fonts: { features: '"cv01", "ss03", "zero"' },
    // "Use #e4f222 exclusively for the single primary action per view" (Do's) → 네비 CTA는
    // "Sign-up Button (Rounded Pill, Neutral)" 스펙: bg #ffffff, text #08090a, radius 9999px,
    // padding 8px 16px, Inter 13px / weight 510
    components: { navCta: { bg: '#ffffff', fg: '#08090a', border: 'none', radius: '9999px', padding: '8px 16px', fontSize: 13, fontWeight: 510, textTransform: 'none', letterSpacing: null } }
  },
  slash: {
    // "Use Ivy Presto for all display and heading text at 28px and above — never for body copy under 20px"
    // → 카드 제목(24px)·로고(19px)는 산세리프
    fonts: { heading: SLASH_SANS, logo: SLASH_SANS },
    // "Use the white (#ffffff) filled pill button exclusively for the single most important action
    // on each screen — it is a scarce visual resource" (Do's) → 네비 CTA는 "Ghost Outline Button"
    // 스펙: transparent fill, 1px #ffffff border, 9999px radius, white text 14px Inter weight 500,
    // padding 10px 20px
    components: { navCta: { bg: 'transparent', fg: '#ffffff', border: '1px solid #ffffff', radius: '9999px', padding: '10px 20px', fontSize: 14, fontWeight: 500, textTransform: 'none', letterSpacing: null } }
  },
  airtable: {
    // "Reserve button-primary for one primary action per viewport" + "Use button-secondary (white
    // with hairline outline) as the natural pair with button-primary. The two together form
    // Airtable's signature button row." → 네비 CTA는 button-secondary 스펙. 보더는 "Hairline (#dddddd):
    // The 1px border tone for … secondary-button outlines" (Color 섹션)의 헤어라인 톤을 따름 (button-secondary
    // 산문 스펙의 "1px hairline outline"과 일치) — surface-dark(#181d26)는 다른 컴포넌트의 배경색.
    // fontSize 14 / padding '10px 18px'는 md의 button-secondary 스펙(typography.button 16px/500,
    // padding 16px 24px)을 컴팩트 네비에 맞게 축소한 적응값이며 스펙 원문 수치가 아님.
    components: { navCta: { bg: '#ffffff', fg: '#181d26', border: '1px solid #dddddd', radius: '12px', padding: '10px 18px', fontSize: 14, fontWeight: 500, textTransform: 'none', letterSpacing: null } }
  },
  factory: {
    // "Geist Mono — Captions, labels, status tags, metric units — always uppercase 12px with
    // tight tracking" (Typography 섹션)
    components: {
      badge: { mono: true, uppercase: true, fontSize: 12 },
      // "Light Filled Button (Log In)" 산문 실측: "Background #fafafa, text #eeeeee (note: on the
      // light fill, text is inverted to dark in practice — #101010), 3px border-radius, 0 14px
      // padding. The only chromatic-contrast button in the system; appears once in the nav."
      // Top Navigation Bar 문단이 동일 스펙을 재확인: "Log In = #fafafa fill, 3px radius, #101010
      // text, 0 14px padding." 폰트는 자매 컴포넌트 "Dark Filled Button" 스펙(Geist 14px weight 400,
      // 3px radius, 0 14px padding — 색만 반전)을 따른다.
      navCta: { bg: '#fafafa', fg: '#101010', border: 'none', radius: '3px', padding: '0 14px', fontSize: 14, fontWeight: 400, textTransform: 'none', letterSpacing: null }
    }
  },
  ferrari: {
    // "CTA labels render uppercase with 1.4px tracking." / "Render CTA labels in uppercase with
    // 1.4px tracking via {typography.button}." (Do's)
    components: {
      buttonPrimary: { textTransform: 'uppercase', letterSpacing: '1.4px' },
      buttonSecondary: { textTransform: 'uppercase', letterSpacing: '1.4px' },
      navCta: { textTransform: 'uppercase', letterSpacing: '1.4px' }
    }
  },
  apple: {
    // "Inter at weight 600 with font-feature-settings: 'ss03' approximates SF Pro's rounded 'a'
    // character." (Note on Font Substitutes)
    fonts: { features: '"ss03"' },
    // "Nudge letter-spacing down by -0.01em on display sizes to re-create the Apple tight feel;
    // Inter's default tracking runs slightly wider than SF Pro." (Note on Font Substitutes)
    // 실측: 파싱된 type.display는 typography.display-lg(40px/600/1.10/letterSpacing 0)에 매칭되며
    // letterSpacing=0은 finalize의 0-필터링으로 null이 된다. 문서의 다른 type 값들이 전부 px 단위이므로
    // -0.01em을 display 크기(40px) 기준 px로 환산: -0.01 * 40px = -0.4px → 0px - 0.4px = -0.4px
    type: { display: { letterSpacing: '-0.4px' } }
  },
  kakao: {
    // "Use system fonts for all conversational/functional UI" (Do's)
    fonts: { sans: SYSTEM_KR, display: SYSTEM_KR, heading: SYSTEM_KR, logo: SYSTEM_KR }
  },
  kakaogames: {
    // "Preserve the documented 40px card-bottom spacing and square corners for the captured
    // game-card wrapper." (Do's)
    radius: { card: '0px' },
    layout: { cardsGap: '40px' },
    components: { card: { radius: '0px' } }
  }
};
