// 발행 전 내용 검사 — my-homepage 스킬 2.2·3.1·3.4·5.3절을 코드로 옮긴 것.
// 실패(error)가 하나라도 있으면 빌드를 멈춘다. 경고(warn)는 로그만 남긴다.
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const TARGETS = ["src/_data", "src/pages", "src/posts"];

const BANNED = ["지금 바로", "마감 임박", "서두르세요", "혁명적", "완벽한", "국내 최초", "유일한", "뒤처집니다", "안 하면 큰일", "축복받은 가격", "은혜로운 할인"];
const NAME_VARIANTS = ["알부남", "신목사", "신 목사님", "신수철목사"];
const CANON_NAME = "신수철 목사";
const AI_PERSON = ["AI가 생각합니다", "AI가 알고 있습니다", "AI가 느낍니다", "AI가 믿습니다"];

const errors = [];
const warns = [];

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => /\.(ya?ml|md)$/.test(f)).map((f) => path.join(dir, f));
}

function splitFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] } : { fm: "", body: src };
}

function flattenStrings(obj, prefix = "") {
  const out = [];
  if (obj == null) return out;
  if (typeof obj === "string") return [[prefix, obj]];
  if (Array.isArray(obj)) obj.forEach((v, i) => out.push(...flattenStrings(v, `${prefix}[${i}]`)));
  else if (typeof obj === "object") for (const [k, v] of Object.entries(obj)) out.push(...flattenStrings(v, prefix ? `${prefix}.${k}` : k));
  return out;
}

function check(file, where, text) {
  for (const b of BANNED) if (text.includes(b)) errors.push(`${file} › ${where}: 금지 표현 "${b}"`);
  for (const v of NAME_VARIANTS) if (text.includes(v)) errors.push(`${file} › ${where}: 이름 표기 오류 "${v}" → "${CANON_NAME}"`);
  for (const a of AI_PERSON) if (text.includes(a)) errors.push(`${file} › ${where}: AI를 사람처럼 말함 "${a}"`);
  const bangs = (text.match(/!/g) || []).length;
  if (bangs >= 2) errors.push(`${file} › ${where}: 느낌표 ${bangs}개 (최대 1개)`);
  // 출처 없는 수치: %·배·명·건·개·회 와 숫자가 함께 있는데 출처/링크가 없을 때
  if (/\d+\s*(%|배|명|건|개|회)/.test(text) && !/출처|https?:\/\//.test(text)) warns.push(`${file} › ${where}: 숫자가 있는데 출처·링크가 없습니다 — "${text.slice(0, 40)}…"`);
}

for (const dir of TARGETS) {
  for (const file of walk(dir)) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    if (file.endsWith(".md")) {
      const { fm, body } = splitFrontmatter(src);
      let data = {};
      try { data = yaml.load(fm) || {}; } catch (e) { errors.push(`${file}: 프런트매터 YAML 오류 — ${e.message}`); continue; }
      for (const [k, v] of flattenStrings(data)) check(file, k, v);
      if (body.trim()) check(file, "본문", body);
      if (typeof data.description === "string" && (data.description.length < 80 || data.description.length > 110)) warns.push(`${file} › description: ${data.description.length}자 (권장 80~110자)`);
    } else {
      let data;
      try { data = yaml.load(src); } catch (e) { errors.push(`${file}: YAML 오류 — ${e.message}`); continue; }
      for (const [k, v] of flattenStrings(data)) check(file, k, v);
      if (file.endsWith("site.yml")) {
        if (typeof data.name !== "string" || !data.name.trim()) errors.push(`${file} › name: 사이트 이름을 입력해 주세요.`);
        if (typeof data.description === "string" && (data.description.length < 80 || data.description.length > 110)) warns.push(`${file} › description: ${data.description.length}자 (권장 80~110자)`);
      }
    }
  }
}

for (const w of warns) console.log(`경고  ${w}`);
for (const e of errors) console.log(`오류  ${e}`);
if (errors.length) {
  console.log(`\n내용 검사 실패: 오류 ${errors.length}개. 위 항목을 고친 뒤 다시 발행해 주세요.`);
  process.exit(1);
}
console.log(`내용 검사 통과 (경고 ${warns.length}개).`);
