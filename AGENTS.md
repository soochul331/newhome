## 최신 사용자 결정 (2026-10-19, 아래 과거 분담보다 우선)

홈페이지·네이버 블로그 작업은 Codex 전담입니다. 홈페이지 /resources/와 /column/은 운영 종료했습니다. 해당 경로를 복원하거나 새 칼럼을 작성하지 마세요. 네이버 AI 관련 기사 리뷰(20번) 자동 발행은 docs/blog-automation/article-review.md를 따릅니다. AI 도구 리뷰(18번)는 기존 ai 자동화의 검토·실습 규칙을 유지합니다. 홈페이지 최근 글은 src/_data/blogFeed.json을 예약 배포 직전 scripts/sync-naver-blog.py로 갱신합니다.

# Homepage changes

Read `.claude/skills/my-homepage/SKILL.md` before changing this site. The 2026-10-15 common design decision supersedes older theme instructions.

All public pages and administrator previews inherit Studio from `base.njk`. Do not gate the common design on a page-specific flag. Use `document.njk` for ordinary reading pages and posts. Keep column and product layouts on the same base. Do not restore `page.njk`, `post.njk`, legacy themes, or theme selection from `docs/legacy-designs/`.

Run `npm run build` and `npm run test:design`. For UI changes, compare actual homepage and changed-page colors, header, footer and typography at mobile and desktop widths. Check overflow and links. A successful build alone is not visual verification.

Keep review drafts and blog publication status distinct from website deployment status. Never claim untested AI tools were personally reviewed.

Boxed text in article bodies inherits copy controls from `copy-prompts.js`. Keep prompt text separate from controls, preserve whitespace, and provide accurate success/failure feedback with keyboard access. Do not add per-page inline copy handlers.

For Korean text wrapping, apply the user-wide `korean-text-layout` skill. Keep Korean words intact, prefer natural wrapping, and never shrink prose or insert viewport-specific breaks to hide defects. Run `npm run test:korean` in the Playwright environment against the local preview before deploying typography changes.

## Blog drafts and Aside publishing (2026-10-16)

Naver blog drafts for 처치AI랩 (the daily 16:00 Codex automation `ai`, and any Aside publishing run) follow `.agents/skills/aside-blog-autopublish/SKILL.md`. Codex and Antigravity both discover it from that path. Keep `docs/blog-automation/content-ledger.json` as the single status ledger, and keep the review rules in `docs/blog-automation/README.md`. The churchailab.org column (`src/columns/`, `docs/column/`) is published by Claude scheduled tasks only; this skill never writes there.

## Deployment cadence (2026-10-16)

Pushing to `main` no longer deploys. Netlify charges 15 credits per production deploy and the team (Personal, 1,000 credits/month) is shared with sermonshorts. `scripts/netlify-ignore.sh` skips every build except the build hook. `.github/workflows/daily-deploy.yml` calls the hook every day at 08:30 KST, and Netlify only builds if `main` changed since the last deploy. For an urgent change, run the "홈페이지 배포" workflow manually (Actions → Run workflow). Do not deploy with the Netlify CLI or the "Trigger deploy" button, and do not tell the owner a change is live until the next scheduled or manual deploy has finished.
