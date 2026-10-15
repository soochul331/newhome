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
const settings = config.collections.find(c => c.name === 'settings').files.find(f => f.name === 'site').fields;
for (const name of ['theme', 'homepage_layout']) assert.equal(settings.find(f => f.name === name).widget, 'hidden');
for (const theme of ['classic', 'apple', 'tesla', 'claude', 'notion', 'beagle', undefined]) {
  const site = { ...base.site, theme };
  const result = registered.site.render.call({state:{base,viewport:'desktop',overflow:0},props:{entry:{get:()=>({toJS:()=>site})}},fitPreview(){}});
  const html = findIframe(result);
  assert.ok(html?.includes('class="theme-beagle motion-demo"'));
  assert.ok(html.includes('data-studio-css'));
  assert.ok(html.includes('data-lab'));
}
for (const name of ['pages', 'posts', 'columns']) {
  const result = registered[name].render.call({state:{base,viewport:'desktop',overflow:0},props:{entry:{get:()=>({toJS:()=>({title:'일반 문서 확인',body:'새 페이지 본문',date:'2026-10-15'})})}},fitPreview(){}});
  const html = findIframe(result);
  assert.ok(html?.includes('data-studio-css'), name + ': common styles missing');
  assert.ok(html.includes('새 페이지 본문'), name + ': content missing');
  assert.ok(html.includes('letter-body'), name + ': reading layout missing');
}
console.log('CMS: legacy settings cannot restore old themes; new pages/posts/columns share Studio.');
const published = fs.readFileSync('_site/index.html', 'utf8');
assert.ok(published.includes('class="theme-beagle motion-demo"'));
assert.ok(published.includes('data-lab'));
assert.ok(published.includes('church-ai-lab-horizontal.webp'));
assert.ok(published.includes('church-ai-lab-stacked.webp'));
assert.ok(!published.includes('class="preview-notice"'));
assert.ok(!published.includes('-preview/#'));
assert.ok(published.includes('name="contact"'));
assert.ok(!published.includes('name="robots" content="noindex'));
assert.ok(!published.includes('디자인 데모'));
console.log('Production homepage: studio, real contact form, correct navigation, no comparison banner');
