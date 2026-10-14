# 뉴스레터 → 칼럼 「AI와 교회 사이」 전환 (2026-10-14)

- 공개 목록: /column/ (최신 발행일 순). 옛 주소 /newsletter/* 는 netlify.toml의 301 리다이렉트로 /column/* 로 이동한다.
- 원본: src/columns/*.md. 상세 주소는 /column/파일이름(날짜 제외)/.
- 관리자 → 칼럼: 제목, 발행일, 공개, 요약, 다룬 기사(매체·제목·링크·날짜), 선택 이미지, 본문.
- 레이아웃 src/_includes/column.njk: source_url이 있으면 글 머리에 '다룬 기사' 상자와 글 끝에 저작권 안내를 표시한다.
- 첫 글(설교 묵상 정리)은 오너 결정으로 삭제했다.
- 자동 발행은 Claude 예약 작업이 담당한다. 지침: docs/column/발행지침.md, 운영계획: docs/column/운영계획.md. Codex·Aside는 관여하지 않는다.
- 검증: node scripts/check-columns.js
