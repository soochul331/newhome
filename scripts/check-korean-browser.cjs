const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({reducedMotion:'reduce'});const origin=process.env.SITE_URL||'http://127.0.0.1:8765';
 const routes=['/','/sermon-shorts/','/thanks.html','/proposal-thanks.html'];
 const results=[];
 for(const width of [320,375,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   await page.goto(origin+route,{waitUntil:'networkidle'});
   const result=await page.evaluate(()=>{
    const broken=[];let words=0;
    for(const el of document.querySelectorAll('main p,main li,main dd,main dt,main h1,main h2,main h3')){
     if(!el.getClientRects().length||el.closest('pre,[hidden],.prompt-copy-status'))continue;
     const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
     while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.parentElement.closest('pre,svg,button'))continue;
      for(const match of node.textContent.matchAll(/[가-힣]{2,}/g)){
       const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
       const rects=[...range.getClientRects()].filter(box=>box.width&&box.height);
       // Line clamping can emit duplicate rectangles on the same baseline.
       const lines=new Set(rects.map(box=>Math.round(box.top)));
       words++;if(lines.size>1)broken.push(match[0]);
      }
     }
    }
    return {overflow:document.documentElement.scrollWidth>innerWidth,broken:[...new Set(broken)],words,toolbars:document.querySelectorAll('.prompt-toolbar').length,icons:[...document.querySelectorAll('.prompt-copy')].map(b=>({hit:b.getBoundingClientRect().width,icon:b.querySelector('svg').getBoundingClientRect().width}))};
   });
   assert.equal(result.overflow,false,`${width} ${route}: horizontal overflow`);
   assert.deepEqual(result.broken,[],`${width} ${route}: Korean words split`);
   assert.equal(result.toolbars,0);for(const icon of result.icons){assert.equal(icon.icon,18);assert.ok(icon.hit>=44);}
   results.push({width,route,words:result.words});
   if(route==='/'&&[375,1280].includes(width)) { await page.locator('#posts').scrollIntoViewIfNeeded(); await page.locator('.blog-card').last().scrollIntoViewIfNeeded(); await page.waitForFunction(()=>[...document.querySelectorAll('.blog-cover img')].every(i=>i.complete&&i.naturalWidth>0)); await page.locator('#posts').screenshot({path:`docs/blog-automation/cards-${width}.png`}); }
  }
 }
 await page.setViewportSize({width:375,height:900});await page.goto(origin+'/');
 await page.addStyleTag({content:'body p,body li,.blog-card h3{font-size:150%!important}'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Larger text must not clip');
 fs.writeFileSync('docs/blog-automation/typography-verification.json',JSON.stringify({checks:results},null,2)+'\n');
 await browser.close();console.log(`PASS: ${results.length} route/viewport checks, intact Korean words, no dedicated copy row, 18px icon/44px hit area, larger text.`);
})().catch(e=>{console.error(e);process.exit(1)});
