# 03-Architecture — 관리자 페이지 아키텍처

작성일 2026-10-08 · 상태: 초안(오너 확인 대기) · 근거 PRD: `.appbuild/01-prd.md`

## 1. 선택지 비교

| | A. 깃 기반 CMS (Decap CMS + Eleventy) **추천** | B. 직접 만든 관리자 (Netlify Functions + DB) | C. 외부 헤드리스 CMS (Sanity 등) |
|---|---|---|---|
| 작동 방식 | 관리자 화면이 저장소 파일(마크다운·YAML)을 직접 고치고 커밋 → 네티파이가 자동 빌드 | 관리자 화면 → 서버 함수 → DB 저장 → 사이트가 DB를 읽어 렌더 | 외부 서비스에 내용 저장, 사이트가 API로 받아 빌드 |
| 비용 | 0원 | 0원(무료 한도 내) | 무료 등급 있음, 한도 초과 시 유료 |
| 한국어 UI | 있음(Decap `ko` 번역 포함, 확인함) | 우리가 직접 만들므로 당연히 한국어 | 대부분 영어 |
| 되돌리기 | 깃 커밋 = 자동 버전 관리 | 직접 구현해야 함 | 서비스별 다름 |
| 로그인 | 깃허브 OAuth(네티파이 내장 클라이언트) | 직접 구현(위험 부담) | 서비스 계정 |
| 구현량 | 작음~중간 | 큼 | 중간 |
| 디자인 맞춤 | 미리보기만 맞춤 가능, 편집 UI는 기본 | 완전 자유 | 제한 |
| 위험 | 빌드 1~2분 지연, UI 다소 투박 | 인증·보안·유지보수 부담 전부 우리 몫 | 종속, 영어 |

**결정: A.** 운영자 1명, 정적 사이트, 비용 0원, 되돌리기 필수라는 조건에서 가장 검증된 길이다. B는 2차 이후 "문의 수신함"처럼 꼭 필요한 부분만 함수로 덧붙인다.

조사 근거(2026-10-08 확인): Decap CMS는 v3.2.1로 활발히 유지 중이며 깃허브 OAuth 백엔드를 지원한다. 네티파이는 2025-02 Identity 폐기 발표를 2026-02-19에 번복해 "계속 지원"으로 바꿨다. 다만 우리는 Identity가 아니라 **깃허브 OAuth**를 쓰므로 어느 쪽이든 영향이 없다. 네티파이 Free는 월 빌드 300분·폼 100건·함수 125,000회 수준이다(서드파티 정리 기준, 공식 요금표 재확인 필요).

## 2. 전체 구조

```
[운영자 브라우저]
   └─ /admin (Decap CMS, 한국어)
        │ 깃허브 OAuth 로그인 (네티파이 OAuth 클라이언트)
        ▼
[GitHub: soochul331/newhome]
   ├─ src/_data/site.yml          사이트 기본 정보 (F2)
   ├─ src/_data/navigation.yml    메뉴 (F3)
   ├─ src/_data/home.yml          홈 섹션·순서·켜기끄기 (F4)
   ├─ src/pages/*.md              일반 페이지 (F5)
   ├─ src/posts/*.md              글·소식 (F6)
   ├─ src/media/                  이미지 (F7)
   ├─ src/_includes/              Eleventy 템플릿 (디자인 고정)
   ├─ admin/config.yml            CMS 컬렉션 정의
   └─ scripts/lint-content.js     규칙 검사 (F11)
        │ 커밋/푸시 (발행 = main 브랜치 병합)
        ▼
[Netlify 빌드: npx @11ty/eleventy]  ── 실패 시 발행 중단 (F11)
        ▼
[공개 사이트 newhome-shin.netlify.app]  정적 HTML (지금과 동일한 속도)
```

- **초안·발행(F8):** Decap의 `publish_mode: editorial_workflow`. 저장하면 깃허브 PR(초안)이 만들어지고, "발행"이 main에 병합한다. 미리보기는 Decap 내장 미리보기 + 네티파이 Deploy Preview URL.
- **자동 발행(F9):** 네티파이 사이트를 깃허브 저장소에 연결(현재는 수동 업로드). main 푸시마다 빌드.
- **되돌리기(F10):** 깃허브 커밋 기록 또는 네티파이 "이전 배포로 되돌리기" 버튼.

## 3. 데이터 모델

### 3.1 `site.yml` (단일 파일)
| 필드 | 타입 | 필수 | 예 |
|---|---|---|---|
| name | string | ✓ | 신수철 목사 (Church AI Lab 디렉터) |
| byline | string | ✓ | 신수철 목사 · 늘푸른진건교회 교육목사 |
| title_tag | string(≤40) | ✓ | 신수철 목사 · 목회 AI 교육 코치 |
| description | string(80~110) | ✓ | 교회사역에 AI를… |
| links | list{label, url} | ✓ | 늘푸른진건교회 / 처치AI랩 블로그 |
| copyright | string | ✓ | © 2026 신수철 목사 |

### 3.2 `navigation.yml`
| 필드 | 타입 | 필수 |
|---|---|---|
| items[] | list | ✓ |
| items[].label | string | ✓ |
| items[].url | string (내부 `#id`·`/path/` 또는 외부 URL) | ✓ |
| items[].visible | boolean (기본 true) | ✓ |
| items[].hide_on_mobile | boolean (기본 false) | |
순서 = 배열 순서(드래그 정렬).

### 3.3 `home.yml`
| 필드 | 타입 | 설명 |
|---|---|---|
| sections[] | list (타입별 위젯) | 배열 순서 = 화면 순서 |
| sections[].type | enum: hero, question, cards, evidence, posts, contact, richtext | 섹션 종류 |
| sections[].enabled | boolean | 켜기/끄기 |
| sections[].id | string | 앵커(메뉴 연결용) |
| sections[].heading | string | 질문형 소제목 |
| sections[].lead | text | 첫 문장 직답 |
| hero: label, title, lead, primary{label,url}, secondary{label,url} | | |
| question: quote, note | | |
| cards: items[]{title, body} (최대 3) | | |
| evidence: items[]{kind, body, link} (4개) | | |
| posts: count(기본 3), more_label, more_url | | |
| contact: body, form_enabled, closing(기본 "감사합니다") | | |

### 3.4 `pages/*.md`
| 프런트매터 | 타입 | 필수 |
|---|---|---|
| title | string | ✓ |
| permalink | string (`/slug/`) | ✓ |
| description | string(80~110) | ✓ |
| in_nav | boolean | |
| body (마크다운) | | ✓ |

### 3.5 `posts/*.md`
| 프런트매터 | 타입 | 필수 |
|---|---|---|
| title | string | ✓ |
| date | date | ✓ |
| external_url | string | 둘 중 하나 |
| body | 마크다운 | 둘 중 하나 |
| summary | string | |

### 3.6 `media/`
이미지 파일. Decap `media_folder: src/media`, `public_folder: /media`. 10MB 제한(F7).

## 4. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 정적 사이트 생성 | Eleventy (11ty) 3.x, Nunjucks 템플릿 | 설정 가벼움, 데이터 파일(YAML)을 그대로 템플릿에 공급, 빌드 수 초 |
| 관리자 | Decap CMS 3.x (CDN 스크립트 1개 + `admin/config.yml`) | 한국어 UI, 깃허브 백엔드, editorial workflow, 유지보수 활발 |
| 인증 | GitHub OAuth via Netlify OAuth 클라이언트 | 비밀번호 저장 없음, 네티파이 사이트 설정에서 GitHub App 등록만 |
| 호스팅·빌드 | Netlify (기존 사이트 newhome-shin, 깃허브 연결로 전환) | 이미 발행 중, Free 요금제 |
| 규칙 검사 | Node 스크립트(`scripts/lint-content.js`), 빌드 전 실행 | my-homepage 스킬 3.4·6절을 코드로. 실패 시 빌드 중단 |
| 폼 | Netlify Forms(기존 유지) | 변경 없음 |

Node는 이 Mac에 v24가 있다. 패키지는 `@11ty/eleventy`, `js-yaml`(검사 스크립트용) 두 개가 핵심.

## 5. 관리자 화면 구성 (Decap 컬렉션)

| 메뉴(좌측) | 대응 파일 | 편집 가능한 것 |
|---|---|---|
| 사이트 설정 | site.yml | 이름·바이라인·메타·링크·저작권 |
| 메뉴 | navigation.yml | 항목 추가/삭제/정렬/표시 |
| 홈 화면 | home.yml | 섹션 추가/삭제/정렬/켜기끄기 + 섹션별 내용 |
| 페이지 | pages/ | 새 페이지 만들기·수정·삭제 |
| 글·소식 | posts/ | 새 글·수정·삭제 |
| 미디어 | media/ | 이미지 업로드·삭제 |
| 작업 흐름(상단) | PR | 초안 → 검토 중 → 발행 준비 → 발행 |

고정(편집 불가): 색·글꼴·버튼·카드 모양(템플릿 CSS), 이름 표기 규칙(검사 스크립트).

## 6. 규칙 검사(F11) 명세

빌드 명령: `node scripts/lint-content.js && npx @11ty/eleventy`

| 검사 | 수준 | 근거 |
|---|---|---|
| "지금 바로", "마감 임박", "서두르세요", "혁명적", "완벽한", "국내 최초", "유일한", "뒤처집니다" 포함 | 실패 | 스킬 3.4 |
| 느낌표 2개 이상(파일 단위) | 실패 | 스킬 3.4 |
| "알부남 신목사", "신목사", "신 목사님" 등 변형 표기 | 실패 | 스킬 2.2 |
| 메타 설명 80~110자 벗어남 | 경고 | 스킬 5.3 |
| 숫자(%·배·명) 포함 문장에 "출처" 또는 링크 없음 | 경고 | 스킬 3.4·5.3 |
| 반말 어미 추정("~다." 문장 끝, 제목 제외) | 경고 | 스킬 3.1 |

## 7. 단계별 구현 계획

| 단계 | 내용 | 산출물 | 예상 작업량 |
|---|---|---|---|
| P0 선행 | 네티파이 사이트 ↔ 깃허브 저장소 연결(자동 발행), GitHub OAuth 앱 등록 | 네티파이 설정 | 작음 (오너 승인 2회 필요) |
| P1 골격 | Eleventy 도입, 현재 index.html을 템플릿+데이터 파일로 분해(화면 결과 동일) | src/, package.json, netlify.toml 수정 | 중간 |
| P2 관리자 | admin/index.html + config.yml, 컬렉션 6개, editorial workflow, 한국어 | /admin | 중간 |
| P3 검사 | lint-content.js, 빌드 연동, 실패 메시지 한국어 | scripts/ | 작음 |
| P4 검증 | 수용 기준 F1~F11 전부 실제로 눌러서 확인(appbuild-orchestrate-verify) | 검증 보고 | 중간 |
| P5 인수 | 운영자 사용 안내서 1장(로그인·수정·발행·되돌리기) | docs/관리자 사용법.md | 작음 |
| 2차 | F12 문의 수신함(Netlify Function 1개), F13 미리보기 디자인, F14 협력자, F15 SEO 보조 | | 별도 계획 |

## 8. 위험과 대응

| 위험 | 대응 |
|---|---|
| 네티파이 OAuth 클라이언트 설정이 UI에서 바뀌었을 수 있음 | P0에서 실제 화면 확인 후 진행. 안 되면 Netlify Function으로 OAuth 중계(공개 예제 다수) |
| Decap 한국어 번역이 일부 영어로 남을 수 있음 | 사용 안내서에 영어 용어 대응표 포함 |
| 빌드 분 소진(월 300분 추정) | 빌드 수 초 수준이라 월 수백 회 발행 가능. 모니터링만 |
| 운영자가 섹션을 잘못 지움 | editorial workflow로 발행 전 확인 + 깃 되돌리기 |
| 폼 월 100건 한도 | 현재 수요에서는 충분. 초과 시 알림 |
