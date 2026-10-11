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
    if (fonts[values.font]) el.style.fontFamily = fonts[values.font];
    if (/^#[0-9a-f]{6}$/i.test(values.color || '')) el.style.color = values.color;
    const size = number(values.size, 13, 100);
    if (values.size && size) { el.dataset.visualSize = size; el.style.fontSize = 'min(' + size + 'px, 12vw)'; }
    if (['left','center','right'].includes(values.align)) el.style.textAlign = values.align;
    if (['400','500','600','700'].includes(String(values.weight))) el.style.fontWeight = values.weight;
    if (target.kind !== 'text') {
      const width = number(values.width, 25, 100), height = number(values.height, 0, 1000), padding = number(values.padding, 0, 160);
      if (values.width && width) { el.style.width = width + '%'; el.style.maxWidth = '100%'; }
      if (values.height && height) el.style.minHeight = height + 'px';
      if (values.padding != null && padding != null) el.style.padding = padding + 'px';
      if (target.kind === 'image') { el.style.height = 'auto'; el.style.objectFit = 'contain'; }
    }
  }
  function styleKey(target) { return target.path?.[0] === 'items' ? (target.kind === 'box' ? 'box' : target.path[2]) : target.key; }
  function apply(doc) {
    doc.querySelectorAll('main > section[data-appearance]').forEach(section => {
      [...targets(section), ...references(section)].forEach(target => {
        const owner = target.path?.[0] === 'items' ? target.el.closest('[data-item-appearance]') : section;
        try {
          const raw = owner?.dataset[target.path?.[0] === 'items' ? 'itemAppearance' : 'appearance'];
          style(target, (JSON.parse(raw || '{}') || {})[styleKey(target)]);
        } catch (_) {}
      });
    });
  }
  global.VisualLayout = { targets, references, style, styleKey, apply, fonts };
  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', () => apply(global.document));
  else apply(global.document);
})(window);
