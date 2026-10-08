/* Simple publishing still opens a one-item dropdown in Decap.
 * Complete that existing action after the administrator clicks Publish. */
(() => {
  let pending = false;
  let timer;
  document.addEventListener('click', event => {
    const button = event.target.closest('button, [role="button"]');
    if (!button || button.textContent.trim() !== '게시' || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(() => { pending = false; }, 2000);
  }, true);
  new MutationObserver(() => {
    if (!pending) return;
    const item = Array.from(document.querySelectorAll('[role="menuitem"]'))
      .find(element => element.textContent.trim() === '지금 게시');
    if (!item) return;
    pending = false;
    clearTimeout(timer);
    item.click();
  }).observe(document.body, { childList: true, subtree: true });
})();
