import fs from 'node:fs';
import yaml from 'js-yaml';
export default class {
  data() { return { permalink: '/admin/navigation.json', eleventyExcludeFromCollections: true }; }
  render() {
    const config = yaml.load(fs.readFileSync('src/admin/config.yml', 'utf8'));
    return JSON.stringify(config.collections.map(collection => ({
      label: collection.label,
      items: collection.files ? collection.files.map(file => ({
        label: file.label,
        route: `#/collections/${collection.name}/entries/${file.name}`
      })) : [{ label: collection.label + ' 목록', route: `#/collections/${collection.name}`, collection: true }]
    })));
  }
}
