// 홈 구획 색(tone) 자동 배정 — 애플 테마의 "밝음↔어두움 교차" 리듬.
// 명시한 tone이 있으면 그대로, 없으면 종류별 기본값, 그래도 없으면 밝음/연회색을 번갈아 준다.
// 같은 규칙이 관리자 미리보기(src/admin/preview.js)에도 복사되어 있다.
const DEFAULT_TONE = { hero: "light", question: "dark", evidence: "dark" };
export function assignTones(sections) {
  let lastLight = "parchment";
  return (sections || []).map((s) => {
    let tone = s.tone && s.tone !== "auto" ? s.tone : DEFAULT_TONE[s.type];
    if (!tone) tone = lastLight === "light" ? "parchment" : "light";
    if (tone !== "dark") lastLight = tone;
    return { ...s, _tone: tone };
  });
}
