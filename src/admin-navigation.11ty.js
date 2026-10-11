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
      })) : [
        ...fs.readdirSync(collection.folder).filter(name=>name.endsWith('.md')).map(name=>{
          const raw=fs.readFileSync(`${collection.folder}/${name}`,'utf8');
          const data=yaml.load(raw.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] || '') || {};
          return {label:data.title || name,route:`#/collections/${collection.name}/entries/${name.replace(/\.md$/,'')}`};
        }),
        { label: collection.label + ' 추가·목록', route: `#/collections/${collection.name}`, collection: true }
      ]
    })));
  }
}
