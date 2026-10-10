# 관리자 테마 모드 · Notion 기본 적용

## 사용법
1. /admin/ → 사이트 설정 → 기본 정보 → 화면 테마.
2. 기본(브랜드 디자인), Apple, Tesla, Claude, Notion 중 선택.
3. 오른쪽 실시간 미리보기 확인 후 게시. 배포 완료 후 공개 화면에 반영.
4. 오래 열어 둔 관리자 탭은 새로고침해서 최신 설정을 받을 것.

## 구현
- 기본 사이트 테마를 Notion으로 설정. 기존 홈페이지 콘텐츠·문의 폼·메타·도메인 유지.
- 각 스타일 CSS와 Tesla 건축 이미지 포함. 참고 DESIGN.md는 원래 파일과 별도로 claude/, notion/, tesla/에 보관.
- hero.njk가 선택한 테마에 맞는 첫 화면을 렌더링하여 관리자와 공개 홈페이지가 동일한 템플릿 사용.
- Notion 문서 보드와 Claude 학습 패널은 실제 home.yml의 카드 제목·단계 사용.
- 새 세 테마는 문장 길이에 맞춰 자연스럽게 줄바꿈하고 기존 글자 크기 비율 설정을 적용. 기존·Apple의 한 줄 자동 맞춤은 유지.
- 비교용 경로 /tesla-preview/, /claude-preview/, /notion-preview/ 유지(noindex). 비교 안내와 경로는 운영 홈페이지에 출력하지 않음.
- 공통 테마 선택·편집 UI를 추가함. 각 참고 브랜드의 제품 기능이나 로고를 복제하지 않음.

## 검증
- npm run build: 내용 검사 경고 0.
- node scripts/check-themes.js: 실제 관리자 미리보기 코드로 다섯 테마 렌더링·CSS 자산·기본 홈페이지 Notion과 비교 안내 없음 검사.
- 로컬 관리자에서 Tesla → Claude → Notion 전환과 내부 iframe 테마 변경 확인. 검증 입력은 Notion으로 복원하고 게시하지 않음.
- Notion 공개용 루트 화면 PC/모바일 가로 넘침 없음, 모바일 네 카드 1열 확인.
- 배포 후 Netlify Published 커밋 및 운영 관리자 선택지·Notion 공개 화면을 확인할 것.
