/* Shared by the published homepage and the visual CMS control. */
(function (global) {
  const fonts = { sans:'system-ui, "Noto Sans KR", sans-serif', serif:'"Noto Serif KR", Georgia, serif', mono:'ui-monospace, "Noto Sans KR", monospace' };
  function targets(section) {
    const result = [];
    const add = (key, selector, path, kind = 'text') => {
      const el = section.querySelector(selector);
      if (el) result.push({ key, el, path, kind });
    };
    add('title', 'h1', ['title']);
    add('heading', ':scope > .wrap > h2', ['heading']);
    add('caption', 'figcaption', ['caption']);
    add('body', '[data-document-body]', ['body'], 'richtext');
    add('quote', 'blockquote', ['quote']);
    add('label', ':scope > .wrap > .label', ['label']);
    add('lead', '.lead, :scope > .wrap > p:not(.label):not(.muted)', ['lead']);
    add('note', '.question .muted', ['note']);
    add('closing', '.contact + .muted', ['closing']);
    add('primary', '.actions .btn-primary', ['primary','label']);
    add('secondary', '.actions .btn-secondary', ['secondary','label']);
    add('more_label', '.btn-secondary:not(.actions .btn)', ['more_label']);
    section.querySelectorAll('.card').forEach((el, i) => {
      result.push({key:'card-'+i, el, path:['items',i], kind:'box'});
      [['title','h3'],['body','p'],['step','.card-step']].forEach(([field, selector]) => {
        const node = el.querySelector(selector);
        if (node) result.push({key:'item-'+i+'-'+field, el:node, path:['items',i,field], kind:'text'});
      });
    });
    section.querySelectorAll('.evidence > div').forEach((el, i) => {
      [['kind','dt'],['body','dd']].forEach(([field, selector]) => {
        const node = el.querySelector(selector);
        if (node) result.push({key:'item-'+i+'-'+field, el:node, path:['items',i,field], kind:'text'});
      });
    });
    section.querySelectorAll('img').forEach((el, i) => result.push({key:'image-'+i, el, kind:'image'}));
    result.push({key:'section', el:section, kind:'box'});
    return result;
  }
  function references(section) {
    const result = [];
    section.querySelectorAll('.notion-board > li, .learning-journal ol > li').forEach((el,i) => {
      result.push({key:'card-'+i, el, path:['items',i], kind:'box', sourceId:'for-whom'});
      [['title','h3, .journal-title'],['step','.board-stage, .journal-title + p']].forEach(([field,selector]) => {
        const node = el.querySelector(selector);
        if (node) result.push({key:'item-'+i+'-'+field,el:node,path:['items',i,field],kind:'text',sourceId:'for-whom'});
      });
    });
    return result;
  }
  const number = (v, min, max) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : null;
  function style(target, values = {}) {
    const el = target.el;
    if (target.kind === 'richtext') el.querySelectorAll('h1,h2,h3,h4,p,li,blockquote').forEach(node => style({el:node,kind:'text'},values));
    if (fonts[values.font]) el.style.fontFamily = fonts[values.font];
    if (/^#[0-9a-f]{6}$/i.test(values.color || '')) el.style.color = values.color;
    const size = number(values.size, 13, 100);
    if (values.size && size) { el.dataset.visualSize = size; el.style.fontSize = 'min(' + size + 'px, 12vw)'; }
    if (['left','center','right'].includes(values.align)) el.style.textAlign = values.align;
    if (['400','500','600','700'].includes(String(values.weight))) el.style.fontWeight = values.weight;
    if (!['text','richtext'].includes(target.kind)) {
      const width = number(values.width, 25, 100), height = number(values.height, 0, 1000), padding = number(values.padding, 0, 160);
      if (values.width && width) { el.style.width = width + '%'; el.style.maxWidth = '100%'; }
      if (values.height && height) el.style.minHeight = height + 'px';
      if (values.padding != null && padding != null) el.style.padding = padding + 'px';
      if (target.kind === 'image') { el.style.height = 'auto'; el.style.objectFit = 'contain'; }
    }
  }
  function reset(target) {
    const nodes=target.kind==='richtext' ? [target.el,...target.el.querySelectorAll('h1,h2,h3,h4,p,li,blockquote')] : [target.el];
    nodes.forEach(el=>{ ['font-family','font-size','color','font-weight','text-align','width','max-width','min-height','padding'].forEach(p=>el.style.removeProperty(p)); delete el.dataset.visualSize; });
  }
  function styleKey(target) { return ['items','links'].includes(target.path?.[0]) ? (target.kind === 'box' ? 'box' : target.path[2]) : target.key; }
  function chromeTargets(doc) {
    const list = [];
    const add = (key,selector,path,area,kind='text') => { const el=doc.querySelector(selector); if(el) list.push({key,el,path,area,kind}); };
    add('header-box','header',[],'site','box');
    add('footer-box','footer',[],'site','box');
    add('navigation-box','header nav',[],'navigation','box');
    add('hero-box','main > section:first-child',[],'document','box');
    add('body-box','main > section:last-child',[],'document','box');
    add('brand','header .brand',[], 'site');
    add('name','.notion-eyebrow,.hero-eyebrow',[],'site');
    add('byline','footer .wrap > p:first-child',[],'site');
    add('copyright','footer .wrap > p:last-child',[],'site');
    doc.querySelectorAll('[data-site-title]').forEach(el=>list.push({key:'brand',el,path:[],area:'site',kind:'text'}));
    doc.querySelectorAll('footer a').forEach((el,i)=>list.push({key:'link-'+i,el,path:['links',i,'label'],area:'site',kind:'text'}));
    doc.querySelectorAll('header nav a').forEach(el=>list.push({key:'nav-'+el.dataset.navIndex,el,path:['items',Number(el.dataset.navIndex),'label'],area:'navigation',kind:'text'}));
    add('title','main > section h1',[],'document');
    add('description','main > section .lead',[],'document');
    add('body','main > section [data-document-body]',[],'document','richtext');
    doc.querySelectorAll('main [data-document-body] img').forEach((el,i)=>list.push({key:'document-image-'+i,el,path:[],area:'document',kind:'image'}));
    return list;
  }
  function apply(doc) {
    chromeTargets(doc).forEach(target=> {
      try {
        let raw;
        if (['items','links'].includes(target.path[0])) raw=target.el.dataset.itemAppearance;
        else raw=target.area==='site' ? doc.body.dataset.siteAppearance : target.area==='navigation' ? doc.querySelector('header nav')?.dataset.appearance : doc.querySelector('main')?.dataset.appearance;
        style(target,(JSON.parse(raw || '{}') || {})[styleKey(target)]);
      } catch (_) {}
    });
    doc.querySelectorAll('main > section[data-appearance]').forEach(section => {
      [...targets(section), ...references(section)].forEach(target => {
        const owner = ['items','links'].includes(target.path?.[0]) ? target.el.closest('[data-item-appearance]') : section;
        try {
          const raw = owner?.dataset[['items','links'].includes(target.path?.[0]) ? 'itemAppearance' : 'appearance'];
          style(target, (JSON.parse(raw || '{}') || {})[styleKey(target)]);
        } catch (_) {}
      });
    });
  }
  global.VisualLayout = { targets, references, chromeTargets, style, reset, styleKey, apply, fonts };
  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', () => apply(global.document));
  else apply(global.document);
})(window);
