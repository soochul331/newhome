# 04-Tasks — 작업 목록 (수직 슬라이스)

| ID | 작업 | 산출물 | 수용 기준 | 상태(2026-10-08) |
|---|---|---|---|---|
| T0-1 | 네티파이 사이트를 깃허브 저장소에 연결(자동 발행) | 네티파이 설정 | main 푸시 → 자동 빌드 시작 | **오너 작업 대기** |
| T0-2 | 깃허브 OAuth 앱 생성 + 네티파이 OAuth 공급자 등록 | GitHub OAuth App, 네티파이 설정 | /admin에서 깃허브 로그인 성공 | **오너 작업 대기** |
| T1-1 | Eleventy 도입(패키지·설정·YAML 데이터) | package.json, eleventy.config.js | `npm run build` 성공 | 완료 |
| T1-2 | index.html을 레이아웃·섹션 템플릿·데이터로 분해 | src/_includes, src/_data | 핵심 문구·폼·JSON-LD 원본과 동일 | 완료(검증함) |
| T1-3 | 페이지·글 컬렉션 템플릿 | page.njk, post.njk, 11tydata | /lecture/ 생성·삭제 테스트 통과 | 완료(검증함) |
| T2-1 | Decap 관리자(index.html, config.yml), 한국어, editorial workflow | src/admin | 로컬 프록시 로그인 → 컬렉션 3종·섹션 7개 표시 | 완료(검증함) |
| T3-1 | 내용 검사 스크립트 + 빌드 연동 | scripts/lint-content.js | 금지 표현 넣으면 exit 1, 정상이면 통과 | 완료(검증함) |
| T3-2 | netlify.toml 빌드 명령·publish 전환 | netlify.toml | 네티파이 빌드 성공, 공개 사이트 동일 | 배포 후 확인 |
| T4-1 | 수용 기준 F1~F11 실측 검증(공개 환경) | 05-gate 체크 | 전부 통과 | T0 완료 후 |
| T5-1 | 운영자 사용 안내서 | docs/관리자 사용법.md | 오너가 읽고 수정→발행 1회 성공 | 초안 완료 |
| 2차 | F12 문의 수신함 / F13 미리보기 디자인 / F14 협력자 / F15 SEO 보조 | — | — | 별도 계획 |
