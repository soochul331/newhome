export default {
  layout: "column.njk",
  column_page: true,
  eleventyComputed: {
    description: data => data.summary,
    permalink: data => data.published === false ? false : `/column/${data.page.fileSlug}/`,
    eleventyExcludeFromCollections: data => data.published === false,
  },
};
