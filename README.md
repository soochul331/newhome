# newhome — 알부남 신목사 홈페이지

교회사역에 AI를 접목하려는 분들의 두려움과 혼란을 신학적 분별·현장 실습·온라인 활동으로 풀도록 돕는 교회AI 컨설턴트, 알부남 신목사의 홈페이지 저장소입니다.

## 구성

| 파일 | 역할 |
|---|---|
| `DESIGN.md` | 디자인 시스템 한 장 — 색 토큰, 글꼴 단계, 버튼·카드 규칙, 말투 규칙, AI 도구용 10줄 요약 |
| `.claude/skills/my-homepage/SKILL.md` | 홈페이지 제작 스킬 — 정체성, 목소리, 색, SEO·AEO·GEO 글쓰기 규칙, 검수 체크리스트 10줄 |
| `src/_data/*.yml` | 내용 데이터 — 사이트 기본 정보, 메뉴, 홈 섹션 (관리자 화면에서 편집) |
| `src/pages/`, `src/posts/` | 페이지와 글 (마크다운, 관리자 화면에서 추가·삭제) |
| `src/_includes/` | Eleventy 템플릿 — 디자인이 여기 고정됩니다 |
| `src/admin/` | 관리자 화면(Decap CMS) 설정 — 공개 주소 `/admin/` |
| `scripts/lint-content.js` | 발행 전 내용 검사 — 금지 표현·이름 표기·느낌표·출처 없는 수치 |
| `.appbuild/` | 기획 문서(요구 정의, 화면, 작업 목록, 아키텍처, 완료 게이트) |
| `docs/관리자 사용법.md` | 운영자용 사용 안내 |

## 개발·빌드

```bash
npm install          # 처음 한 번
npm run dev          # 로컬 미리보기 http://localhost:8080
npm run cms          # 로컬 관리자 테스트용 프록시 (별도 터미널)
npm run build        # 내용 검사 + 빌드 → _site/
```

네티파이는 `npm run build`를 실행하고 `_site/`를 발행합니다.

## 원칙

- 색은 배경 `#F6F7FB` · 글자 `#141B34` · 강조 `#2747D6` 세 가지만 씁니다.
- 제목은 Black Han Sans, 본문은 Noto Sans KR입니다.
- 존댓말, 보통 문장으로 씁니다. 지어낸 수치와 지어낸 후기는 쓰지 않습니다.

## 링크

- 늘푸른진건교회: http://www.egjingeon.com/
- 처치AI랩 블로그: https://blog.naver.com/church_ai_lab

감사합니다.
