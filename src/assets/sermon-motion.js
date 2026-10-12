/* Product page shares the studio palette; independent progressive motion. */
(() => {
  const body=document.body,button=document.querySelector('[data-product-motion]');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');let enabled=!preference.matches;
  document.querySelectorAll('header nav a').forEach(a=>{
    const href=a.getAttribute('href');if(href?.startsWith('/#'))a.setAttribute('href','/motion-preview/'+href.slice(1));
  });
  document.querySelectorAll('.product-page main a[href="/#contact"]').forEach(a=>a.href='https://churchailab.org/#contact');
  const chapters=[...document.querySelectorAll('.product-chapter')];
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
  }),{threshold:.08}):null;
  chapters.forEach(el=>observer?observer.observe(el):el.classList.add('is-visible'));
  function sync(){body.classList.toggle('motion-off',!enabled);button.textContent=preference.matches?'기기 설정: 모션 줄이기':enabled?'모션 켜짐':'모션 꺼짐';button.setAttribute('aria-pressed',String(enabled));button.disabled=preference.matches;}
  button.addEventListener('click',()=>{enabled=!enabled;sync();});preference.addEventListener('change',()=>{enabled=!preference.matches;sync();});
  document.addEventListener('visibilitychange',()=>body.classList.toggle('motion-suspended',document.hidden));
  body.classList.add('motion-ready');sync();
})();
