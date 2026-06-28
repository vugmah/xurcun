/**
 * Light image-drag deterrent for the public site.
 *
 * NOTE: the previous version also blocked right-click, copy, cut and
 * Ctrl/Cmd+C/S/P/U/I. That hurt real users (couldn't copy an address/phone,
 * couldn't print the legal pages) and assistive tech, while giving ~zero
 * protection (all content is in the DOM/API anyway). Those handlers were
 * removed; only image dragging is still prevented.
 * Does NOT apply to the admin panel.
 */

let isInitialized = false;

function isAdminRoute(): boolean {
  return window.location.pathname.startsWith('/admin');
}

export function initCopyProtection() {
  if (isInitialized) return;
  isInitialized = true;

  // Skip admin panel
  if (isAdminRoute()) return;

  // Image drag prevention (harmless, no UX/a11y cost)
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
    }
  }, true);
}
