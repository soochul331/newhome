import yaml from "js-yaml";

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
