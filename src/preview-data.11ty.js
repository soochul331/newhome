import fs from "node:fs";
import path from "node:path";

export default class {
  data() { return { permalink: "/admin/preview-data.json", eleventyExcludeFromCollections: true }; }
  render(data) {
    const templates = {};
    function read(dir, prefix = "") {
      for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
        const name = prefix + file.name;
        if (file.isDirectory()) read(path.join(dir, file.name), name + "/");
        else if (name.endsWith(".njk")) templates[name] = fs.readFileSync(path.join(dir, file.name), "utf8").replace(/^---[\s\S]*?---\s*/, "");
      }
    }
    read("src/_includes");
    return JSON.stringify({ templates, site: data.site, home: data.home, navigation: data.navigation,
      collections: { posts: data.collections.posts.map(p => ({ data: { title:p.data.title, external_url:p.data.external_url }, date: p.date, url: p.url })) }
    });
  }
}
