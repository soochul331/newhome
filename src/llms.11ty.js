const oneLine = value => String(value ?? "").replace(/\s+/g, " ").trim();
const label = value => oneLine(value).replace(/\[/g, "(").replace(/\]/g, ")");

export default class {
  data() {
    return { permalink: "/llms.txt", layout: false, eleventyExcludeFromCollections: true };
  }

  render({ site, collections }) {
    const origin = site.url.replace(/\/$/, "");
    const link = (title, url, description) =>
      `- [${label(title)}](${new URL(url, origin).href}): ${oneLine(description)}`;
    const pages = collections.pages.filter(page => page.url && page.data.published !== false);
    const resources = pages.filter(page => page.url.startsWith("/resources/"))
      .sort((a, b) => a.url.localeCompare(b.url));
    const columns = collections.columns.filter(page => page.url && page.data.published !== false).slice(0, 20);
    const tools = pages.filter(page => !page.url.startsWith("/resources/"));

    return [
      "# Church AI Lab · 처치AI랩",
      "",
      `> ${oneLine(site.description)}`,
      "",
      `운영자: ${oneLine(site.name)}. 주 언어: 한국어. 공식 홈페이지: ${origin}/.`,
      "핵심 활용 분야는 설교준비, 목회행정, 교회교육, 나만의 AI 도구입니다.",
      "실습 자료실은 회원가입 없이 읽고 내려받을 수 있는 요청문과 점검표를 제공합니다.",
      "칼럼은 외부 기사와 교회 사역 활용을 함께 다루는 글입니다. 외부 소식의 사실과 작성자의 해석은 각 글의 출처·발행일과 함께 확인할 수 있습니다.",
      "가상의 교회·회의·행사 예시는 실습 자료이며 실제 모집·행사 또는 실제 사용 후기와 구분됩니다.",
      "이 파일은 공개 콘텐츠 안내입니다. 검색 순위·AI 답변 인용을 보장하거나 접근 권한을 부여하는 문서가 아닙니다.",
      "",
      "## 사이트 안내",
      link("Church AI Lab 홈페이지", "/", "목회자를 위한 AI 활용 교육·컨설팅과 공개 콘텐츠 안내."),
      link("활용 분야", "/#together", "설교준비·목회행정·교회교육·나만의 AI 도구."),
      link("운영자 소개", "/#about", "신수철 목사와 Church AI Lab 소개."),
      link("문의", "/#contact", "교육·컨설팅 문의 안내."),
      "",
      "## 무료 실습 자료",
      ...resources.map(page => link(page.data.title, page.url, page.data.description)),
      "",
      "## 도구 안내",
      ...tools.map(page => link(page.data.title, page.url, page.data.description)),
      "",
      "## 칼럼 · AI와 교회 사이",
      link("칼럼 전체 목록", "/column/", "공개 칼럼의 전체 목록. 아래는 최신 공개 글 최대 20편입니다."),
      ...columns.map(page => link(page.data.title, page.url,
        `${new Date(page.date).toISOString().slice(0, 10)}. ${oneLine(page.data.summary)}`)),
      "",
      "## Optional",
      link("처치AI랩 네이버 블로그", "https://blog.naver.com/church_ai_lab", "공식 외부 블로그. 홈페이지와 별도의 네이버 서비스입니다."),
      ""
    ].join("\n");
  }
}
