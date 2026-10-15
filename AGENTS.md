# Homepage changes

Read `.claude/skills/my-homepage/SKILL.md` before changing this site. The 2026-10-15 common design decision supersedes older theme instructions.

All public pages and administrator previews inherit Studio from `base.njk`. Do not gate the common design on a page-specific flag. Use `document.njk` for ordinary reading pages and posts. Keep column and product layouts on the same base. Do not restore `page.njk`, `post.njk`, legacy themes, or theme selection from `docs/legacy-designs/`.

Run `npm run build` and `npm run test:design`. For UI changes, compare actual homepage and changed-page colors, header, footer and typography at mobile and desktop widths. Check overflow and links. A successful build alone is not visual verification.

Keep review drafts and blog publication status distinct from website deployment status. Never claim untested AI tools were personally reviewed.

Boxed text in article bodies inherits copy controls from `copy-prompts.js`. Keep prompt text separate from controls, preserve whitespace, and provide accurate success/failure feedback with keyboard access. Do not add per-page inline copy handlers.
