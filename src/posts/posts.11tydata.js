export default {
  tags: ["posts"],
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => (data.external_url ? false : `/posts/${data.page.fileSlug}/`),
  },
};
