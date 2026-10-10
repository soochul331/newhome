# 2026-10-09 도메인 및 결제 작업 기록

## 2026-10-10 업데이트 및 새 프로젝트 인계
- 실제 브라우저에서 https://churchailab.org/ 홈페이지가 인증서 오류 없이 정상 표시됨을 확인.
- https://www.churchailab.org/ 접속도 https://churchailab.org/ 로 정상 이동 확인.
- DNS·HTTPS 확인 자동화 churchailab-org-dns-https는 성공 확인 후 PAUSED로 변경 완료.
- 아래의 DNS 미완료 기록은 10월 9일 당시 기록이며, 현재 실제 HTTPS 접속은 성공함.
- Codex 새 프로젝트에는 이 문서가 있는 newhome 폴더 자체를 연결할 것. 저장소를 복제하거나 파일을 옮길 필요 없음.
- 새 채팅은 이 문서와 docs/2026-10-09-four-learning-cards.md를 읽고 Git 상태 및 배포 상태를 확인하는 것부터 시작. 사용자 추가 요청 전에는 코드 수정·배포하지 말 것.

## 완료
- Netlify soochul331 팀 Personal 월 $9 결제 완료 확인, 1,000 크레딧 지급 확인.
- Free 전환 예약 완료. Netlify 예약 화면 표시일: 2026-11-07. 화면별 날짜 표시에 차이가 있어 전환 시 다시 확인할 것.
- 크레딧 자동충전 Disabled 확인.
- churchailab.org 첫해 $11.99 등록 완료. 현대카드 추가 인증은 사용자가 직접 완료.
- 도메인 자동갱신 해제 완료. 관리 화면에 Enable auto-renewal 표시.
- 도메인 만료일: 2027-10-09. 등록 당시 갱신 가격: 연 $17.39 (실제 갱신 때 재확인).
- 기본 도메인 churchailab.org 및 www 리디렉션 연결 설정 완료.
- DNS·HTTPS 확인 자동화 생성 완료: churchailab-org-dns-https, ACTIVE, 12시간 간격. 정상 연결 또는 조치가 필요한 변화 때 알림, 정상 완료 알림 후 일시중지.

## 10월 9일 당시 미완료 기록 (현재 상태는 상단 및 아래 업데이트 참고)
- 마지막 실제 접속 확인에서 churchailab.org는 ERR_NAME_NOT_RESOLVED. Netlify DNS propagating 상태, DNS verification failed로 인증서 발급 대기. 접속 및 HTTPS 성공으로 보고하지 말 것.
- DNS 반영 후 기본 주소 HTTPS, www 리디렉션, /admin/ 로그인 확인.
- 만료 30일 전(2027-09-09 오전 9시 한국 시간) 알림은 suggested_create 예약 카드만 준비됨. 사용자가 카드에서 생성했는지는 확인되지 않음. 실제 예약 완료로 보고하지 말 것.
- 보류된 홈페이지 4단계 카드 변경은 main ea0c10f에 저장됨. 배포 여부를 먼저 확인하고 필요할 때만 한 번 배포.

## 운영 원칙 및 주소
- 로컬 수정·미리보기 후 변경을 모아 한 번 배포하여 크레딧 절약.
- 기존 관리자: https://newhome-shin.netlify.app/admin/
- 새 홈페이지: https://churchailab.org/
- 새 관리자: https://churchailab.org/admin/ (별도 도메인 구매 불필요, DNS·인증 확인 필요)
- 도메인 관리: https://app.netlify.com/teams/soochul331/dns/churchailab.org
- HTTPS 상태: https://app.netlify.com/projects/newhome-shin/domain-management
- 사용자 요청에 따라 오늘 작업 종료. 추가 수정이나 배포는 진행하지 않음.

## 2026-10-10 코드·배포 재확인 및 복원 작업
- 실제 HTTPS 홈페이지와 www → 기본 도메인 이동 정상 확인.
- Netlify Published 커밋은 `077ec60`. `3c3b03e`와 `ea0c10f`는 크레딧 초과로 Skipped.
- `077ec60`의 관리자 home 저장에서 네 단계 콘텐츠가 기존 세 카드로 돌아간 것을 Git diff로 확인. 기능 코드는 유지되어 있으므로 단순 재배포로는 네 단계가 복원되지 않음.
- 최신 main 기준으로 for-whom 섹션만 `ea0c10f` 내용으로 복원하고, site.yml 및 관리자 site_url/display_url을 https://churchailab.org로 정리.
- 로컬 빌드 통과(내용 경고 0), PC 2열·휴대폰 1열, 단계 13px, 가로 넘침 없음 확인.
- 로컬 관리자에서 카드 4개·단계 입력란·실시간 미리보기 확인. 단계 값을 비우면 표시가 사라지고 복원하면 다시 표시됨. 검증 입력은 복원하고 게시하지 않음.
- DNS·HTTPS 자동화 파일의 PAUSED 상태 재확인.
- 로컬 자동화 목록에 만료 알림은 없음. 2027-09-09 09:00 KST 알림 생성은 여전히 미확인. 이번 작업에서 새 예약은 생성하지 않음.
- 운영 관리자 로그인 완료 여부와 복원 변경의 실제 배포 결과는 아래 후속 기록으로 확인할 것.
- 추가 확인: churchailab.org에서 GitHub 로그인 후 운영 편집기 컬렉션과 홈 항목 접근 성공. 운영 콘텐츠는 수정·게시하지 않음.
