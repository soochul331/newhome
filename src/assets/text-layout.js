(function (global) {
  const active = new WeakMap();
  const scale = value => Math.min(140, Math.max(70, Number(value) || 100)) / 100;

  function layout(doc) {
    const win = doc.defaultView;
    const headings = [...doc.querySelectorAll('[data-text-layout] h1,[data-text-layout] h2,[data-text-layout] h3,[data-text-layout] blockquote')];
    const body = [...doc.querySelectorAll('[data-text-layout] p,[data-text-layout] dd,[data-text-layout] dt,[data-text-layout] .prose li')];
    const nodes = [...headings, ...body];
    nodes.forEach(el => {
      el.style.removeProperty('font-size');
      el.style.removeProperty('white-space');
      delete el.dataset.fitOverflow;
    });
    // Measure all defaults before changing sizes, so nested text is not scaled twice.
    const defaults = nodes.map(el => parseFloat(win.getComputedStyle(el).fontSize));
    nodes.forEach((el, i) => {
      const scope = el.closest('[data-text-layout]');
      const isTitle = i < headings.length;
      const size = defaults[i] * scale(scope.dataset[isTitle ? 'titleScale' : 'bodyScale']);
      el.style.fontSize = size + 'px';
      if (!isTitle || scope.dataset.autoFit === 'false') return;
      el.style.whiteSpace = 'nowrap'; // Explicit <br> still starts a new line.
      const fits = () => el.scrollWidth <= el.clientWidth + 1;
      if (fits()) return;
      const rootSize = parseFloat(win.getComputedStyle(doc.documentElement).fontSize);
      const minimum = Math.min(size, Math.max(rootSize * 1.25, defaults[i] * 0.65));
      el.style.fontSize = minimum + 'px';
      if (!fits()) {
        el.style.whiteSpace = 'normal';
        el.dataset.fitOverflow = 'true';
        return;
      }
      let low = minimum, high = size;
      for (let n = 0; n < 10; n++) {
        const mid = (low + high) / 2;
        el.style.fontSize = mid + 'px';
        if (fits()) low = mid; else high = mid;
      }
      el.style.fontSize = low + 'px';
    });
    return headings.filter(el => el.dataset.fitOverflow).length;
  }

  function observe(doc, onResult = () => {}) {
    if (active.has(doc)) active.get(doc)();
    const win = doc.defaultView;
    let frame = 0, stopped = false;
    const update = () => {
      win.cancelAnimationFrame(frame);
      frame = win.requestAnimationFrame(() => {
        if (!stopped) onResult(layout(doc));
      });
    };
    let lastWidth = -1;
    const observer = new win.ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (width !== lastWidth) { lastWidth = width; update(); }
    });
    observer.observe(doc.body);
    win.addEventListener('resize', update);
    doc.fonts.ready.then(update);
    update();
    const stop = () => {
      stopped = true;
      observer.disconnect();
      win.cancelAnimationFrame(frame);
      win.removeEventListener('resize', update);
      active.delete(doc);
    };
    active.set(doc, stop);
    return stop;
  }
  global.TextLayout = { layout, observe };
  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', () => observe(global.document));
  } else observe(global.document);
})(window);
