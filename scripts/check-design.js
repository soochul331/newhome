import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);}
const pages=walk('_site').filter(p=>p.endsWith('.html')&&!p.startsWith('_site/admin/'));
for(const route of ['_site/index.html','_site/sermon-shorts/index.html','_site/thanks.html','_site/proposal-thanks.html']) assert.ok(pages.includes(route),route);
for(const route of ['_site/resources','_site/column']) assert.ok(!fs.existsSync(route),route+' must remain retired');
for(const p of pages){const h=fs.readFileSync(p,'utf8');assert.match(h,/class="theme-beagle motion-demo/ ,p);assert.match(h,/data-studio-css=/,p);assert.match(h,/document.css/,p);assert.match(h,/copy-prompts\.js/,p);assert.doesNotMatch(h,/href="[^" ]*(?:theme-apple|theme-tesla|theme-claude|theme-notion|resources)\.css/,p);assert.doesNotMatch(p,/-preview/);}
for(const name of ['page.njk','post.njk'])assert.ok(!fs.existsSync('src/_includes/'+name));
for(const name of ['pages','posts'])assert.match(fs.readFileSync(`src/${name}/${name}.11tydata.js`,'utf8'),/layout: "document.njk"/);
console.log(`Design contract: ${pages.length} public pages share Studio; old layouts and preview routes absent.`);
