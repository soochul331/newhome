export default {
  tags: ["posts"],
  layout: "document.njk",
  eleventyComputed: {
    permalink: (data) => (data.external_url ? false : `/posts/${data.page.fileSlug}/`),
  },
};
