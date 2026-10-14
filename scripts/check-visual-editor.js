import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import nunjucks from 'nunjucks';
import markdownit from 'markdown-it';
import yaml from 'js-yaml';
const base = JSON.parse(fs.readFileSync('_site/admin/preview-data.json','utf8'));
const window = { markdownit, document:{readyState:'loading',addEventListener(){}} };
const sandbox = {window, nunjucks, fetch:async()=>({ok:true,json:async()=>base}), CMS:{registerPreviewTemplate(){},registerPreviewStyle(){}},createClass:x=>x};
vm.runInNewContext(fs.readFileSync('src/admin/preview.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('src/assets/visual-layout.js','utf8'),{window});
const env = window.HomePreview.environment(base.templates);
for (const theme of ['classic','apple','tesla','claude','notion']) {
  const s = {type:'cards',id:'fixture',heading:'제목 <script>',items:[{title:'카드',body:'본문',appearance:{title:{font:'serif',color:'#2747d6',size:42},box:{width:90}}}],appearance:{heading:{size:36}}};
  const html = env.render('sections/cards.njk',{...base,site:{...base.site,theme},s});
  assert.ok(html.includes('제목 &lt;script&gt;'));
  assert.ok(html.includes('data-item-appearance="{&quot;title&quot;'));
  assert.ok(html.includes('&quot;width&quot;:90'));
  assert.ok(!html.includes('contenteditable'));
}
const image = env.render('sections/image.njk',{s:{id:'image',src:'/media/test.png',alt:'설명',appearance:{'image-0':{width:60}}}});
assert.ok(image.includes('/media/test.png'));
assert.ok(image.includes('alt="설명"'));
const target = {kind:'text',el:{style:{},dataset:{}}};
window.VisualLayout.style(target,{font:'serif',color:'#2747d6',size:999,weight:'700',align:'center'});
assert.equal(target.el.dataset.visualSize,100);
assert.equal(target.el.style.color,'#2747d6');
const unsafe = {kind:'text',el:{style:{},dataset:{}}};
window.VisualLayout.style(unsafe,{font:'url(https://example.com)',color:'red;background:url(x)',size:'NaN',align:'expression(x)'});
assert.deepEqual(unsafe.el.style,{});
assert.equal(window.VisualLayout.styleKey({kind:'text',path:['items',3,'title']}),'title');
assert.equal(window.VisualLayout.styleKey({kind:'box',path:['items',1]}),'box');
const config = yaml.load(fs.readFileSync('src/admin/config.yml','utf8'));
const sections = config.collections[0].files.find(f=>f.name==='home').fields.find(f=>f.name==='sections');
assert.equal(sections.widget,'canvaslist');
assert.ok(sections.types.every(t=>t.fields.some(f=>f.name==='appearance')));
assert.ok(sections.types.some(t=>t.name==='image'));
console.log('Visual editor: all themes, safe appearance metadata, per-card persistence and image rendering passed');

for(const collection of config.collections) for(const entry of collection.files || [collection]) {
  if(collection.name === 'columns') {
    assert.equal(entry.fields.find(f=>f.name==='body').widget,'markdown');
    assert.equal(entry.fields.find(f=>f.name==='published').widget,'boolean');
    continue; // Long-form columns use the standard writing editor with live preview.
  }
  const canvas=entry.fields[0];
  assert.equal(canvas.widget,'visualcanvas');
  assert.deepEqual(canvas.fieldnames,entry.fields.slice(1).map(f=>f.name));
  assert.ok(entry.fields.slice(1).every(f=>f.widget.startsWith('canvas')));
}
// Values registered for the canvas must retain optional and falsy field data.
const registered={};
const cms={registerEventListener(){},getWidget:name=>registered[name] || {control:()=>null},registerWidget:(name,control,preview,schema)=>{registered[name]={control,preview,schema};}};
vm.runInNewContext(fs.readFileSync('src/admin/visual-editor.js','utf8'),{CMS:cms,createClass:x=>x,window:{},h:()=>null});
const values={enabled:false,count:0,label:'',optional:undefined,items:[{label:'메뉴',visible:false}]};
for(const [name,value] of Object.entries(values)) registered.canvastext.control.componentDidMount.call({props:{field:{get:()=>name},value}});
const actual=registered.visualcanvas.control.read.call({props:{field:{get:()=>({toArray:()=>Object.keys(values)})}}});
assert.deepEqual(JSON.parse(JSON.stringify(actual)),JSON.parse(JSON.stringify(values)));
assert.equal(actual.optional,undefined);
console.log('Default canvas: page canvas and column writing entries covered; empty, optional and boolean values preserved');

let cleared=false;
registered.canvastext.control.componentDidMount.call({props:{field:{get:()=> 'summary'},value:'추가한 요약',onChange:value=>{assert.equal(value,undefined);cleared=true;}}});
registered.visualcanvas.control.syncDraft.call({draft:{},props:{field:{get:()=>({toArray:()=>['summary']})}}});
assert.equal(cleared,true,'Undo must clear newly added optional fields in the real CMS draft');
