/* Standalone studio demo: native motion, complete static reading order. */
(() => {
  const body=document.body,preference=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.querySelector('[data-motion-toggle]'),replay=document.querySelector('[data-motion-replay]');
  let enabled=!preference.matches;
  body.classList.add('motion-demo');
  const tabs=[...document.querySelectorAll('.lab-tabs [role="tab"]')],panels=[...document.querySelectorAll('.lab-panel')];
  let animationGeneration=0;
  function play(panel){
    const generation=++animationGeneration;
    panels.forEach(p=>p.classList.remove('is-playing'));
    if(enabled&&panel)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(generation===animationGeneration)panel.classList.add('is-playing');}));
  }
  function activate(index,focus=false){
    tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1;});
    panels.forEach((p,i)=>p.hidden=i!==index);
    play(panels[index]);if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(index));
    tab.addEventListener('keydown',event=>{
      let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();activate(next,true);}
    });
  });
  const reveals=[...document.querySelectorAll('[data-reveal]')];
  reveals.forEach((el,i)=>el.style.setProperty('--delay',(i%4)*100+'ms'));
  const toolEntries=[...document.querySelectorAll('.tool-entry')];
  const lowerSections=[...document.querySelectorAll('[data-lower-motion]')];
  document.querySelectorAll('.about-copy dl>div,.studio-posts li').forEach((el,i)=>el.style.setProperty('--lower-index',el.parentElement?Array.from(el.parentElement.children).indexOf(el):i));
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
  },{threshold:.12}):null;
  [...reveals,...toolEntries,...lowerSections].forEach(el=>observer?observer.observe(el):el.classList.add('is-visible'));
  const art=document.querySelector('.story-art'),chapters=[...document.querySelectorAll('[data-chapter]')];
  const captions=tabs.map(tab=>tab.textContent.trim());let active=-1;
  function story(index){
    if(active===index)return;active=index;art.dataset.active=index;
    art.querySelector('.art-caption').textContent=captions[index];art.querySelector('.art-marker').textContent='0'+(index+1)+' / 0'+panels.length;
    art.querySelector('.art-icon').replaceChildren(panels[index].querySelector('svg').cloneNode(true));
  }
  const progress=document.createElement('div');progress.className='motion-progress';progress.setAttribute('aria-hidden','true');body.append(progress);
  let scheduled=false;
  function update(){
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,scrollY/max)):0)+')';
    if(enabled&&innerWidth>760){
      let nearest=0,distance=Infinity;
      chapters.forEach((el,i)=>{const rect=el.getBoundingClientRect();const d=Math.abs(rect.top+rect.height/2-innerHeight/2);if(d<distance){distance=d;nearest=i;}});
      story(nearest);
    }
    scheduled=false;
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  // Pointer depth is confined to the visual output, with no effect on reading/navigation.
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const consoleEl=document.querySelector('.lab-console');let pointerFrame=false,px=0,py=0;
  if('IntersectionObserver' in window){
    const labObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){play(panels.find(p=>!p.hidden));labObserver.unobserve(entry.target);}});},{threshold:.2});
    labObserver.observe(consoleEl);
  }
  document.addEventListener('visibilitychange',()=>body.classList.toggle('motion-suspended',document.hidden));
  consoleEl.addEventListener('pointermove',event=>{
    if(!enabled||!finePointer.matches)return;
    const rect=consoleEl.getBoundingClientRect();px=(event.clientX-rect.left)/rect.width-.5;py=(event.clientY-rect.top)/rect.height-.5;
    if(!pointerFrame){pointerFrame=true;requestAnimationFrame(()=>{if(enabled)panels.forEach(p=>p.querySelector('.lab-output').style.transform=`rotateY(${px*7}deg) rotateX(${-py*5}deg)`);pointerFrame=false;});}
  });
  consoleEl.addEventListener('pointerleave',()=>panels.forEach(p=>p.querySelector('.lab-output').style.transform=''));
  function sync(){
    body.classList.toggle('motion-off',!enabled);toggle?.setAttribute('aria-pressed',String(enabled));
    if(toggle) toggle.textContent=preference.matches?'기기 설정: 모션 줄이기':enabled?'모션 켜짐':'모션 꺼짐';
    if(toggle) toggle.disabled=preference.matches;if(replay) replay.disabled=!enabled;progress.hidden=!enabled;
    panels.forEach(p=>p.querySelector('.lab-output').style.transform='');
    if(enabled)play(panels.find(p=>!p.hidden));else{++animationGeneration;panels.forEach(p=>p.classList.remove('is-playing'));story(0);}
    schedule();
  }
  toggle?.addEventListener('click',()=>{enabled=!enabled;sync();});
  preference.addEventListener('change',()=>{enabled=!preference.matches;sync();});
  replay?.addEventListener('click',()=>{
    body.classList.remove('motion-ready');
    [...reveals,...toolEntries,...lowerSections].forEach(el=>{el.classList.remove('is-visible');observer?.observe(el);});
    scrollTo({top:0,behavior:'smooth'});activate(0);
    requestAnimationFrame(()=>requestAnimationFrame(()=>body.classList.add('motion-ready')));
  });
  document.querySelectorAll('header nav a').forEach(a=>{if(a.getAttribute('href').startsWith('/#'))a.setAttribute('href',a.hash);});
  body.classList.add('motion-ready');story(0);sync();
})();
