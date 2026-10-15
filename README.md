# newhome — 신수철 목사 (Church AI Lab 디렉터) 홈페이지

교회사역에 AI를 접목하려는 분들의 두려움과 혼란을 신학적 분별·현장 실습·온라인 활동으로 풀도록 돕는 교회AI 컨설턴트, 신수철 목사의 홈페이지 저장소입니다.

## 구성

| 파일 | 역할 |
|---|---|
| `DESIGN.md` | 디자인 시스템 한 장 — 색 토큰, 글꼴 단계, 버튼·카드 규칙, 말투 규칙, AI 도구용 10줄 요약 |
| `.claude/skills/my-homepage/SKILL.md` | 홈페이지 제작 스킬 — 정체성, 목소리, 색, SEO·AEO·GEO 글쓰기 규칙, 검수 체크리스트 10줄 |
| `src/_data/*.yml` | 내용 데이터 — 사이트 기본 정보, 메뉴, 홈 섹션 (관리자 화면에서 편집) |
| `src/pages/`, `src/posts/` | 페이지와 글 (마크다운, 관리자 화면에서 추가·삭제) |
| `src/_includes/` | Eleventy 템플릿 — 디자인이 여기 고정됩니다 |
| `src/assets/theme-apple.css` · `style.css` | 화면 테마 두 가지 — 애플 스타일(현재) · 기본. 관리자 "화면 테마"로 전환 |
| `src/admin/` | 관리자 화면(Decap CMS) 설정 — 공개 주소 `/admin/` |
| `scripts/lint-content.js` | 발행 전 내용 검사 — 금지 표현·이름 표기·느낌표·출처 없는 수치 |
| `.appbuild/` | 기획 문서(요구 정의, 화면, 작업 목록, 아키텍처, 완료 게이트) |
| `docs/관리자 사용법.md` | 운영자용 사용 안내 |

## 개발·빌드

```bash
npm install          # 처음 한 번
npm run dev          # 로컬 미리보기 http://localhost:8080
npm run cms          # 로컬 관리자 테스트용 프록시 (별도 터미널)
npm run build        # 내용 검사 + 출력 정리 + 빌드 + 공통 디자인 검사 → _site/
npm run test:design  # 관리자 미리보기·문서·Studio 회귀 검사
```

네티파이는 `npm run build`를 실행하고 `_site/`를 발행합니다.

## 공통 디자인

- 공개 화면과 관리자 미리보기는 모두 현재 Studio 디자인을 기본으로 사용합니다.
- `base.njk`가 공통 스타일을 적용합니다. 페이지별 활성화 플래그를 추가하지 않습니다.
- 읽기 페이지와 게시글은 `document.njk`를 사용합니다. 칼럼과 제품 소개는 본문 구성만 다릅니다.
- 이전 일반 템플릿은 제거했고, 과거 테마와 미리보기는 `docs/legacy-designs/`에 보관합니다. 이 폴더는 배포 대상이 아닙니다.
- 새 페이지를 만들면 `npm run build`와 `npm run test:design`을 실행하고 홈과의 화면 일관성을 확인합니다.
- 존댓말과 사실에 근거한 설명을 사용합니다. 지어낸 수치와 후기는 쓰지 않습니다.

## 링크

- 늘푸른진건교회: http://www.egjingeon.com/
- 처치AI랩 블로그: https://blog.naver.com/church_ai_lab

감사합니다.

## 요청문 복사 검증

본문의 코드 상자는 공통 복사 버튼을 자동으로 제공합니다. 로컬 미리보기 서버(8765 포트)를 켠 상태에서 Playwright가 설치된 환경으로 `npm run test:copy`를 실행합니다. 별도 런타임을 쓰면 `PLAYWRIGHT_MODULE`에 Playwright 모듈 경로를 지정합니다. 원문과 실제 클립보드의 일치, 키보드, 모바일, 오류 시 안내를 검사합니다.

## 한글 문단 검증

`npm run test:korean`은 로컬 미리보기(8765)에서 320·375·768·1280px 화면의 실제 한글 어절 분리, 가로 넘침, 복사 아이콘 크기와 큰 글자 표시를 검사합니다. Playwright 모듈 경로는 `test:copy`와 동일하게 `PLAYWRIGHT_MODULE`로 지정할 수 있습니다. `SITE_URL`을 지정하면 공개 사이트에서도 같은 검사를 실행합니다.
