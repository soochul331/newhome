# Notion 로컬 미리보기

- 디자인: notion/DESIGN.md, `npx getdesign@latest add notion --out ./notion/DESIGN.md`로 받음.
- 실행: npm run dev
- 주소: http://localhost:8080/notion-preview/
- 같은 홈페이지 데이터로 굵은 고딕 제목, 흰색/따뜻한 회색 바탕, 파란 행동 버튼, 얇은 테두리 카드 적용.
- 다운로드한 최신 분석은 Inter 기반 고딕체를 명시하므로, 이전 추천 설명의 세리프 대신 Inter/Noto Sans KR 사용.
- 첫 화면의 문서 보드는 home.yml의 실제 네 단계 데이터를 사용. 사이드바/자세히 보기 링크는 해당 본문으로 이동.
- 레이아웃은 밝은 문서형 변형. 참고 문서의 어두운 인디고 히어로는 적용하지 않음.
- PC 1440px: 보드 4열, 본문 학습 카드 2열. 모바일 390px: 각 1열. 가로 넘침 없음.
- 빌드 내용 검사 경고 0, git diff --check 통과.
- 기존 DESIGN.md와 사이트 기본 테마 apple 보존. 기존 Tesla/Claude 미리보기 유지.
- 커밋·푸시·배포하지 않음.
