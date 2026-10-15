export default {
  tags: ["pages"],
  layout: "document.njk",
  eleventyComputed: {
    permalink: (data) => data.permalink || `/${data.page.fileSlug}/`,
  },
};
