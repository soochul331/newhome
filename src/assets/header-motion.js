/* Keep ordinary links until saved navigation appearance has been applied. */
(() => {
  function setup() {
    const header=document.querySelector('header.site');
    if(!header)return;
    const logo=header.querySelector('.brand');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function revealLogo() {
      if(reduced.matches||document.body.classList.contains('motion-off'))return;
      logo.classList.remove('header-logo-play');
      void logo.offsetWidth;
      logo.classList.add('header-logo-play');
    }
    header.querySelectorAll('nav a').forEach(link=>{
      if(link.querySelector('.header-nav-roll'))return;
      const roll=document.createElement('span');roll.className='header-nav-roll';
      const label=document.createElement('span');label.className='header-nav-label';
      while(link.firstChild)label.append(link.firstChild);
      const echo=label.cloneNode(true);echo.setAttribute('aria-hidden','true');
      echo.removeAttribute('id');
      echo.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
      roll.append(label,echo);link.append(roll);
    });
    if(logo){
      logo.addEventListener('pointerenter',revealLogo);
      logo.addEventListener('focus',revealLogo);
      revealLogo();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
