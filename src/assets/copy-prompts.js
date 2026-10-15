/* Add copy controls to boxed text in every article, including future pages. */
(() => {
  document.querySelectorAll('[data-document-body] pre').forEach((pre, index) => {
    if (pre.closest('.prompt-block')) return;
    const block = document.createElement('div');
    block.className = 'prompt-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'prompt-toolbar';
    const status = document.createElement('span');
    status.className = 'prompt-copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prompt-copy';
    button.textContent = '복사';
    button.setAttribute('aria-label', `${index + 1}번째 상자 내용 복사`);
    toolbar.append(status, button);
    pre.before(block);
    block.append(toolbar, pre);
    let reset;
    button.addEventListener('click', async () => {
      clearTimeout(reset);
      const text = (pre.querySelector('code') || pre).textContent;
      button.disabled = true;
      let copied = false;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // Older browsers or denied Clipboard API: keep the same user gesture.
        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('aria-label', '복사할 내용');
        input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
        document.body.append(input);
        input.focus();
        input.select();
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        input.remove();
      }
      button.disabled = false;
      button.focus({ preventScroll: true });
      if (copied) {
        button.textContent = '복사됨';
        status.textContent = '상자 내용을 복사했습니다.';
      } else {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(pre);
        selection?.removeAllRanges();
        selection?.addRange(range);
        button.textContent = '다시 복사';
        status.textContent = '자동 복사가 되지 않았습니다. 선택된 내용을 직접 복사해 주세요.';
      }
      reset = setTimeout(() => {
        button.textContent = '복사';
        status.textContent = '';
      }, 4000);
    });
  });
})();
