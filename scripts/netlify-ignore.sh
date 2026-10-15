#!/usr/bin/env bash
# Netlify 빌드 여부 결정 (2026-10-16). exit 0 = 이번 빌드 건너뜀, exit 1 = 빌드.
# 배포 1번이 15크레딧이라, GitHub에 올릴 때마다 배포하지 않고
# 예약 배포(매일 오전 8:30, .github/workflows/daily-deploy.yml)와 '지금 반영' 버튼으로만 배포한다.
if [ -z "${INCOMING_HOOK_URL:-}" ]; then
  echo "GitHub 푸시 빌드는 건너뜀 — 매일 오전 8:30 예약 배포 때 함께 반영됩니다."
  exit 0
fi
if [ -n "${CACHED_COMMIT_REF:-}" ] && [ "${CACHED_COMMIT_REF}" = "${COMMIT_REF:-}" ]; then
  echo "지난 배포 뒤 바뀐 것이 없어 건너뜀."
  exit 0
fi
echo "예약 배포: 바뀐 내용을 반영합니다."
exit 1
