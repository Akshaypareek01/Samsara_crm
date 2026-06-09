import { ThemeChanger } from '@/shared/redux/action';
import store from '@/shared/redux/store';

/**
 * Dispatches a theme update through Redux.
 * @param payload - Full theme state patch.
 */
function dispatchThemeChange(payload: ReturnType<typeof store.getState>): void {
  store.dispatch(ThemeChanger(payload) as never);
}

/**
 * Toggles the company dashboard sidebar (mobile overlay + desktop collapse).
 */
export function toggleCompanySidebar(): void {
  const theme = store.getState();

  if (window.innerWidth >= 992) {
    if (theme.dataToggled === 'close-menu-close') {
      dispatchThemeChange({ ...theme, dataToggled: '' });
    } else {
      dispatchThemeChange({ ...theme, dataToggled: 'close-menu-close' });
    }
    return;
  }

  if (theme.dataToggled === 'close') {
    dispatchThemeChange({ ...theme, dataToggled: 'open' });
  } else {
    dispatchThemeChange({ ...theme, dataToggled: 'close' });
  }
}
