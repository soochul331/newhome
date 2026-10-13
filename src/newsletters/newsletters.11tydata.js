export default {
  layout: "newsletter.njk",
  newsletter_page: true,
  eleventyComputed: {
    description: data => data.summary,
    permalink: data => data.published === false ? false : `/newsletter/${data.page.fileSlug}/`,
    eleventyExcludeFromCollections: data => data.published === false,
  },
};
