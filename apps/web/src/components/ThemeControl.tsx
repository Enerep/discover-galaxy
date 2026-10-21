import { useTheme } from '../lib/useTheme.ts';
import type { ThemePreference } from '../lib/useTheme.ts';
import { Icon } from './ui.tsx';

export function ThemeControl() {
  const { preference, chooseTheme } = useTheme();
  return (
    <label className="theme-control" title={`Color theme: ${preference}`}>
      <span className="theme-symbol"><Icon name={preference === 'system' ? 'monitor' : preference === 'dark' ? 'moon' : 'sun'} size={17} /></span>
      <select aria-label="Color theme" value={preference} onChange={(event) => chooseTheme(event.target.value as ThemePreference)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <span className="theme-chevron"><Icon name="down" size={14} /></span>
    </label>
  );
}
