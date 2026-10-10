# Tesla 로컬 미리보기 · 2026-10-10

- 실행: `npm run dev`
- Tesla: http://localhost:8080/tesla-preview/
- 기존 디자인: http://localhost:8080/
- 홈페이지 콘텐츠는 공통 home.yml 사용, 사이트 기본 테마는 apple 유지.
- Tesla 참고 문서의 전면 사진·여백·400/500 굵기·4px 버튼을 적용. 한글 본문은 17px, 라이선스가 필요한 Universal Sans 대신 시스템 고딕 사용.
- 네 단계 카드와 모든 본문 섹션 유지. Tesla 화면은 자동 글자 축소 대신 자연스러운 줄바꿈 사용.
- 미리보기 페이지 noindex 설정. 이번 작업에서는 커밋·푸시·배포하지 않음.
- 빌드 통과 및 1440px/390px 화면의 가로 넘침 없음 확인.

## 이미지

- 파일: src/assets/tesla/chapel-hero.png
- 내장 image_gen으로 생성한 가상의 예배당 이미지. 실제 사역 장소 사진이 아님.
- 최종 프롬프트:
  Use case: photorealistic-natural. Asset type: wide website hero background 16:9. Create a refined cinematic architectural photograph of an imagined contemporary Korean chapel / community learning space nestled in quiet mountains, warm grey minimalist concrete and clear glass, discreet thin cross on the far right building facade, low horizontal building in lower half of frame, foreground stone plaza and restrained native grasses. Bright overcast morning, pale silver sky occupying upper 55 percent, sky very clean and uniform light grey to accommodate dark headline overlay, softly distant mountains. Fine real photographic texture, calm welcoming hopeful atmosphere, premium automotive campaign photographic restraint, monochrome neutral palette. Wide composition 1792x1024 or similar. NO text, NO UI, NO logos, NO people, NO cars, NO watermarks. This is a fictional illustrative image, not an actual church location.
