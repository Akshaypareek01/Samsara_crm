import { ThemeChanger } from '@/shared/redux/action';
import store from '@/shared/redux/store';

/**
 * Toggles the company dashboard sidebar (mobile overlay + desktop collapse).
 */
export function toggleCompanySidebar(): void {
  const theme = store.getState();

  if (window.innerWidth >= 992) {
    if (theme.dataToggled === 'close-menu-close') {
      ThemeChanger({ ...theme, dataToggled: '' });
    } else {
      ThemeChanger({ ...theme, dataToggled: 'close-menu-close' });
    }
    return;
  }

  if (theme.dataToggled === 'close') {
    ThemeChanger({ ...theme, dataToggled: 'open' });
    setTimeout(() => {
      const overlay = document.querySelector('#responsive-overlay');
      if (overlay) {
        overlay.classList.add('active');
        overlay.addEventListener('click', () => {
          overlay.classList.remove('active');
          const current = store.getState();
          ThemeChanger({ ...current, dataToggled: 'close' });
        });
      }
    }, 100);
  } else {
    ThemeChanger({ ...theme, dataToggled: 'close' });
  }
}
