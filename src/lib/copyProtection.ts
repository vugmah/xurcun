/**
 * Copy Protection for Public Site
 * Prevents right-click, text selection, image dragging
 * Does NOT apply to admin panel
 */

let isInitialized = false;

function isAdminRoute(): boolean {
  return window.location.pathname.startsWith('/admin');
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'A' || tag === 'BUTTON';
}

export function initCopyProtection() {
  if (isInitialized) return;
  isInitialized = true;

  // Skip admin panel
  if (isAdminRoute()) return;

  // Right-click prevention
  document.addEventListener('contextmenu', (e) => {
    if (isInputElement(e.target)) return;
    e.preventDefault();
  }, true);

  // Copy prevention
  document.addEventListener('copy', (e) => {
    if (isInputElement(e.target)) return;
    e.preventDefault();
  }, true);

  // Cut prevention
  document.addEventListener('cut', (e) => {
    if (isInputElement(e.target)) return;
    e.preventDefault();
  }, true);

  // Image drag prevention
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
    }
  }, true);

  // Keyboard shortcuts (Ctrl+C, Ctrl+S, Ctrl+P)
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;

    const blockedKeys = ['c', 's', 'p', 'u', 'i'];
    if (blockedKeys.includes(e.key.toLowerCase())) {
      if (isInputElement(e.target)) return;
      e.preventDefault();
    }
  }, true);
}
