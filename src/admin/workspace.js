(() => {
  const editor = document.getElementById('editor');
  const nav = document.getElementById('navigation');
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('workspace-menu');
  const validRoute = hash => /^#\/(?:collections(?:\/[^?#]*)?|workflow|media)?$/.test(hash);
  const route = () => validRoute(location.hash) ? location.hash : '#/';
  let stopPending = () => {};
  editor.src = '/admin/editor.html' + route();
  function highlight(hash) {
    nav.querySelectorAll('a').forEach(link => {
      const selected = hash === link.hash || (link.dataset.collection === 'true' && hash.startsWith(link.hash + '/'));
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  function sync() {
    const hash = editor.contentWindow.location.hash || '#/';
    if (!validRoute(hash)) return;
    if (location.hash !== hash) history.replaceState(null, '', hash);
    highlight(hash);
  }
  editor.addEventListener('load', () => {
    editor.contentWindow.addEventListener('hashchange', sync);
    sync();
  });
  window.addEventListener('hashchange', () => {
    if (editor.contentWindow.location.hash !== route()) editor.contentWindow.location.hash = route();
  });
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    stopPending();
    const win = editor.contentWindow;
    if (win.location.hash === link.hash) return;
    // Decap needs to leave the current entry before opening another entry.
    // Its own router asks about unsaved changes before leaving.
    const entry = link.hash.match(/^(#\/collections\/[^/]+)\/entries\//);
    if (entry && win.location.hash.includes('/entries/')) {
      const observer = new MutationObserver(() => {
        const target = Array.from(win.document.querySelectorAll('a')).find(a => a.hash === link.hash);
        if (target) { stopPending(); target.click(); }
      });
      const timer = setTimeout(() => observer.disconnect(), 10000);
      stopPending = () => { observer.disconnect(); clearTimeout(timer); };
      observer.observe(win.document.body, { childList: true, subtree: true });
      win.location.hash = entry[1];
    } else win.location.hash = link.hash;
  });
  toggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
    toggle.textContent = menu.hidden ? '메뉴 펼치기' : '메뉴 접기';
  });
  fetch('/admin/navigation.json').then(response => {
    if (!response.ok) throw new Error('menu');
    return response.json();
  }).then(groups => {
    nav.replaceChildren();
    for (const group of groups) {
      const heading = document.createElement('h2');
      heading.textContent = group.label;
      nav.append(heading);
      for (const item of group.items) {
        const link = document.createElement('a');
        link.textContent = item.label;
        link.href = item.route;
        link.dataset.collection = String(item.collection || false);
        nav.append(link);
      }
    }
    highlight(route());
  }).catch(() => {
    nav.textContent = '메뉴를 불러오지 못했습니다. 새로고침해 주세요.';
  });
})();
