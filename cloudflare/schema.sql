-- 문의 접수 표 (Cloudflare D1, 이름 예: churchailab-forms)
-- 적용: npx wrangler d1 execute churchailab-forms --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  form TEXT NOT NULL,          -- contact | tool-proposal
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  payload TEXT NOT NULL,       -- 양식 전체(JSON)
  created_at TEXT NOT NULL,    -- ISO 시각(UTC)
  handled INTEGER NOT NULL DEFAULT 0  -- 답변 끝나면 1
);
CREATE INDEX IF NOT EXISTS submissions_created ON submissions (created_at DESC);
