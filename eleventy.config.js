import yaml from "js-yaml";
import { assignTones } from "./scripts/tones.js";

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets");
  eleventyConfig.addPassthroughCopy({ "node_modules/nunjucks/browser/nunjucks.min.js": "admin/vendor/nunjucks.min.js" });
  eleventyConfig.addPassthroughCopy({ "node_modules/markdown-it/dist/markdown-it.min.js": "admin/vendor/markdown-it.min.js" });
  eleventyConfig.ignores.add("src/admin/**");

  const toDate = (d) => (d instanceof Date ? d : new Date(d));
  eleventyConfig.addFilter("dateKo", (d) => {
    const x = toDate(d);
    return `${x.getUTCFullYear()}년 ${x.getUTCMonth() + 1}월 ${x.getUTCDate()}일`;
  });
  eleventyConfig.addFilter("isoDate", (d) => toDate(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("visible", (items) => (items || []).filter((i) => i.visible !== false));
  eleventyConfig.addFilter("toned", (items) => assignTones(items));
  // 관리자에서 Enter로 넣은 줄바꿈을 화면에 그대로 보이게(<br>), 메타 태그는 한 줄로
  const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  eleventyConfig.addFilter("br", (v) => esc(String(v ?? "").replace(/\r\n?/g, "\n").trim()).replace(/\n/g, "<br>"));
  eleventyConfig.addFilter("oneline", (v) => String(v ?? "").replace(/\s*[\r\n]+\s*/g, " ").trim());
  eleventyConfig.addFilter("enabled", (items) => (items || []).filter((i) => i.enabled !== false));

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("pages", (api) => api.getFilteredByGlob("src/pages/*.md"));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
