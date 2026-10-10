import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import nunjucks from 'nunjucks';
import markdownit from 'markdown-it';
import yaml from 'js-yaml';

const base = JSON.parse(fs.readFileSync('_site/admin/preview-data.json', 'utf8'));
const registered = {};
const sandbox = {
  location: { origin: "http://localhost:8080" },
  fetch: async () => ({ ok: true, json: async () => base }),
  window: { markdownit }, nunjucks,
  createClass: spec => spec,
  h: (tag, props, ...children) => ({ tag, props, children }),
  CMS: {
    registerPreviewStyle() {},
    registerPreviewTemplate(name, spec) { registered[name] = spec; },
  },
};
vm.runInNewContext(fs.readFileSync('src/admin/preview.js', 'utf8'), sandbox);
function findIframe(node) {
  if (node?.tag === 'iframe') return node.props.srcDoc;
  for (const child of node?.children || []) {
    const result = findIframe(child);
    if (result) return result;
  }
}
const config = yaml.load(fs.readFileSync('src/admin/config.yml', 'utf8'));
const themeField = config.collections.find(c => c.name === 'settings').files.find(f => f.name === 'site').fields.find(f => f.name === 'theme');
const themes = ['classic', 'apple', 'tesla', 'claude', 'notion'];
assert.deepEqual(themeField.options.map(o => o.value), themes);
for (const theme of themes) {
  const site = { ...base.site, theme };
  const result = registered.site.render.call({
    state: { base, viewport: 'desktop', overflow: 0 },
    props: { entry: { get: () => ({ toJS: () => site }) } },
    fitPreview() {},
  });
  const html = findIframe(result);
  assert.ok(html, `${theme}: editor preview failed to render`);
  assert.ok(html.includes(`class="theme-${theme}"`), `${theme}: wrong body theme`);
  assert.ok(!html.includes('class="preview-notice"'), `${theme}: comparison banner leaked`);
  assert.ok(!html.includes('href="/notion-preview/#'), `${theme}: comparison navigation leaked`);
  const stylesheet = theme === 'classic' ? 'style.css' : `theme-${theme}.css`;
  assert.ok(html.includes(`/assets/${stylesheet}`), `${theme}: stylesheet missing`);
  assert.ok(fs.existsSync(`_site/assets/${stylesheet}`));
  if (theme === 'notion') {
    assert.ok(html.includes('notion-workspace'));
    assert.ok(html.includes('4단계 · 나만의 도구'));
  }
  if (theme === 'claude') assert.ok(html.includes('learning-journal'));
  if (theme === 'tesla') assert.ok(fs.existsSync('_site/assets/tesla/chapel-hero.png'));
  console.log(`${theme}: administrator preview and assets passed`);
}
const published = fs.readFileSync('_site/index.html', 'utf8');
assert.ok(published.includes('class="theme-notion"'));
assert.ok(published.includes('notion-workspace'));
assert.ok(!published.includes('class="preview-notice"'));
assert.ok(!published.includes('-preview/#'));
console.log('Production homepage: Notion, correct navigation, no comparison banner');
