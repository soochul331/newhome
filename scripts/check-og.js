import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
}
const pages=walk('_site').filter(file=>file.endsWith('.html')&&!file.startsWith('_site/admin/'));
for(const file of pages) {
  const html=fs.readFileSync(file,'utf8'),head=html.split('</head>')[0];
  const tags={};
  for(const match of head.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"\s*\/?\s*>/g)) {
    if(!match[1].startsWith('og:')&&!match[1].startsWith('twitter:'))continue;
    assert.equal(tags[match[1]],undefined,`${file}: duplicate ${match[1]}`);
    tags[match[1]]=match[2];
  }
  for(const key of ['og:title','og:description','og:type','og:locale','og:site_name','og:url','og:image','og:image:secure_url','og:image:type','og:image:width','og:image:height','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt'])
    assert.ok(tags[key]?.trim(),`${file}: missing ${key}`);
  assert.equal(tags['og:site_name'],'Church AI Lab');
  assert.equal(tags['og:locale'],'ko_KR');
  assert.equal(tags['twitter:card'],'summary_large_image');
  for(const [og,tw] of [['og:title','twitter:title'],['og:description','twitter:description'],['og:image','twitter:image'],['og:image:alt','twitter:image:alt']])
    assert.equal(tags[og],tags[tw],`${file}: ${og} and ${tw} differ`);
  assert.equal(tags['og:image'],tags['og:image:secure_url']);
  const pageUrl=new URL(tags['og:url']),imageUrl=new URL(tags['og:image'].replaceAll('&amp;','&'));
  assert.equal(imageUrl.protocol,'https:');
  assert.equal(pageUrl.protocol,'https:');
  const canonical=head.match(/<link rel="canonical" href="([^"]+)"/);
  assert.equal(tags['og:url'],canonical?.[1],`${file}: canonical mismatch`);
  if(imageUrl.origin===pageUrl.origin) {
    const local=path.resolve('_site','.'+decodeURIComponent(imageUrl.pathname));
    assert.ok(local.startsWith(path.resolve('_site')+path.sep));
    assert.ok(fs.existsSync(local),`${file}: missing share image ${local}`);
    const image=fs.readFileSync(local);
    if(tags['og:image:type']==='image/png') {
      assert.equal(image.subarray(1,4).toString(),'PNG',`${file}: invalid PNG`);
      assert.equal(image.readUInt32BE(16),Number(tags['og:image:width']),`${file}: image width mismatch`);
      assert.equal(image.readUInt32BE(20),Number(tags['og:image:height']),`${file}: image height mismatch`);
    }
  }
}
const home=fs.readFileSync('_site/index.html','utf8');
assert.match(home,/<meta property="og:title" content="Church AI Lab · 목회자를 위한 AI 활용 교육">/);
assert.match(fs.readFileSync('_site/sermon-shorts/index.html','utf8'),/<meta property="og:title" content="설교 숏츠 제작기 · Church AI Lab">/);
console.log(`Open Graph: ${pages.length} public pages have matching OG/Twitter metadata, HTTPS images and valid local PNG dimensions.`);
