import { useHalo } from '../../state/context';
import { Island } from '../island/Island';
import { OnboardingWindow } from '../onboarding/OnboardingWindow';
import { SettingsWindow } from '../settings/SettingsWindow';
import { DemoPanel } from './DemoPanel';
import { DesktopWindows } from './DesktopWindows';
import { Dock } from './Dock';
import { MenuBar } from './MenuBar';
import { Toasts } from './Toasts';

const WALLPAPER_DARK = 'linear-gradient(175deg,#1B2430 0%,#2A2431 48%,#120F17 100%)';
const WALLPAPER_LIGHT = 'linear-gradient(170deg,#EBD9C4 0%,#C9A88A 45%,#8E6F5C 100%)';

/**
 * The desktop the island sits on. It exists so the island can be judged in
 * context — over real windows, a menu bar, and a bright or dark wallpaper.
 */
export function Desktop() {
  const { state } = useHalo();

  const menubarBg = state.reduceTransparency
    ? 'rgba(0,0,0,.92)'
    : state.increaseContrast
      ? 'rgba(0,0,0,.62)'
      : 'rgba(0,0,0,.3)';

  return (
    <div
      className="desktop"
      style={
        {
          '--wallpaper': state.wallpaperLight ? WALLPAPER_LIGHT : WALLPAPER_DARK,
          '--menubar-bg': menubarBg,
        } as React.CSSProperties
      }
    >
      <div className="desktop__wallpaper" aria-hidden />
      <div className="desktop__sheen" aria-hidden />

      <DesktopWindows />
      <MenuBar />
      <Island />
      <Dock />
      <DemoPanel />
      <Toasts />

      {state.settings.open && <SettingsWindow />}
      {state.onboardOpen && <OnboardingWindow />}
    </div>
  );
}
