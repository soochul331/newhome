export default {
  eleventyComputed: {
    site: data => ({ ...data.site, theme: 'claude' }),
  },
};
