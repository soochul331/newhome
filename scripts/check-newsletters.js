import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='src/newsletters/';
const fixtures=[['test-public','2026-10-13',true],['test-newest','2026-10-14',true],['test-private','2026-10-15',false]];
for(const [slug] of fixtures) assert(!fs.existsSync(dir+slug+'.md'), '테스트 파일 이름이 기존 글과 겹칩니다.');
try {
 for(const [slug,date,published] of fixtures) fs.writeFileSync(dir+slug+'.md',`---\ntitle: ${slug}\ndate: '${date}'\nsummary: 테스트 요약\npublished: ${published}\n---\n## 본문 제목\n\n본문 확인\n`);
 execFileSync('npx',['eleventy'],{stdio:'pipe'});
 const list=fs.readFileSync('_site/newsletter/index.html','utf8');
 assert(list.includes('/newsletter/test-public/'));
 assert(list.indexOf('/newsletter/test-newest/')<list.indexOf('/newsletter/test-public/'));
 assert(!list.includes('test-private'));
 assert(!fs.existsSync('_site/newsletter/test-private/index.html'));
 const detail=fs.readFileSync('_site/newsletter/test-public/index.html','utf8');
 assert(detail.includes('<h2>본문 제목</h2>'));
 assert(detail.includes('뉴스레터 목록'));
 assert(detail.includes('name="description" content="테스트 요약"'));
 const nav=JSON.parse(fs.readFileSync('_site/admin/navigation.json','utf8'));
 assert(nav.some(group=>group.label==='뉴스레터'));
 console.log('뉴스레터: 최신순, 상세 본문, 메타 설명, 비공개 제외, 관리자 메뉴 통과');
} finally {
 for(const [slug] of fixtures){fs.rmSync(dir+slug+'.md',{force:true});fs.rmSync('_site/newsletter/'+slug,{recursive:true,force:true});}
 execFileSync('npx',['eleventy'],{stdio:'pipe'});
}
