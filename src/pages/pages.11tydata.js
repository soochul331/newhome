export default {
  tags: ["pages"],
  layout: "page.njk",
  eleventyComputed: {
    permalink: (data) => data.permalink || `/${data.page.fileSlug}/`,
  },
};
