/**
 * Inline script run before React hydrates to prevent dark-mode flash.
 * Keep in sync with applyLightModeToDocument().
 */
export const FORCE_LIGHT_MODE_INLINE_SCRIPT = `
(function () {
  var root = document.documentElement;
  root.classList.remove('dark');
  root.classList.add('light');
  root.style.colorScheme = 'light only';
  root.style.setProperty('--body-bg', '255 255 255');
  root.removeAttribute('data-icon-overlay');
  document.querySelectorAll('#responsive-overlay').forEach(function (el) {
    el.classList.remove('active');
  });
  try {
    localStorage.removeItem('ynexdarktheme');
    localStorage.setItem('ynexlighttheme', 'light');
    localStorage.removeItem('bodyBgRGB');
    localStorage.removeItem('darkBgRGB');
  } catch (e) {}
})();
`;

/**
 * Pin the document to light mode only (blocks Ynex dark theme + OS auto-dark).
 */
export function applyLightModeToDocument(): void {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  html.classList.remove('dark');
  html.classList.add('light');
  html.style.colorScheme = 'light only';

  try {
    localStorage.removeItem('ynexdarktheme');
    localStorage.setItem('ynexlighttheme', 'light');
    localStorage.removeItem('bodyBgRGB');
    localStorage.removeItem('darkBgRGB');
  } catch {
    // localStorage may be unavailable in private mode
  }

  html.style.setProperty('--body-bg', '255 255 255');
}
