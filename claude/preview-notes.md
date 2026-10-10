# Claude 로컬 미리보기

- 디자인 참고: claude/DESIGN.md (`npx getdesign@latest add claude --out ./claude/DESIGN.md`)
- 실행: npm run dev
- 주소: http://localhost:8080/claude-preview/
- 기존 화면: http://localhost:8080/
- Tesla 화면: http://localhost:8080/tesla-preview/
- 크림색 바탕, 명조 계열 제목, 테라코타 버튼, 밝은 학습 카드와 어두운 질문 구역 적용.
- Copernicus/StyreneB 대신 Noto Serif KR/Noto Sans KR 사용. 한글 본문 17px 유지.
- 작은 버튼의 흰 글자 대비를 위해 기본 코럴 #cc785c 대신 문서의 진한 변형 #a9583e 사용.
- 홈페이지의 실제 데이터 사용. 첫 화면 옆 학습 흐름은 네 단계 내용을 요약한 소개 패널.
- 원래 사이트 기본 테마 apple과 기존 DESIGN.md 유지. 미리보기 페이지 noindex.
- 빌드 경고 0. PC 1440px/모바일 390px에서 가로 넘침 없음, 네 카드 2열/1열 확인.
- 이번 작업에서 커밋·푸시·배포하지 않음.
