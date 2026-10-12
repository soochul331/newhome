/* Small accessible tab controller, shared with the visual editor. */
(function(global){
  function init(doc, selectedIndex){
    doc.querySelectorAll('[data-showcase]').forEach(root=>{
      if(root.dataset.showcaseReady) return;
      root.dataset.showcaseReady='true';
      const tabs=[...root.querySelectorAll('[role="tab"]')];
      const panels=[...root.querySelectorAll('[role="tabpanel"]')];
      function activate(index,focus){
        tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
        panels.forEach((panel,i)=>{panel.hidden=i!==index;});
        if(focus) tabs[index].focus();
      }
      if(Number.isInteger(selectedIndex) && tabs[selectedIndex]) activate(selectedIndex,false);
      tabs.forEach((tab,index)=>{
        tab.addEventListener('click',()=>activate(index,false),true);
        tab.addEventListener('keydown',e=>{
          let next;
          if(e.key==='ArrowRight') next=(index+1)%tabs.length;
          if(e.key==='ArrowLeft') next=(index-1+tabs.length)%tabs.length;
          if(e.key==='Home') next=0;
          if(e.key==='End') next=tabs.length-1;
          if(next!==undefined){e.preventDefault();activate(next,true);}
        });
      });
    });
  }
  global.HomeShowcase={init};
  if(global.document.readyState==='loading') global.document.addEventListener('DOMContentLoaded',()=>init(global.document));
  else init(global.document);
})(window);
