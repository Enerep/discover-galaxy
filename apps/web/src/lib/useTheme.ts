import { useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'discovery-galaxy:theme';
const isPreference = (value: string | null): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark';

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isPreference(value) ? value : 'system';
  } catch { return 'system'; }
}

function applyTheme(preference: ThemePreference) {
  const theme = preference === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
  const color = theme === 'dark' ? '#1f1f24' : '#f5f6f4';
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;
  root.style.backgroundColor = color;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => applyTheme(preference);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [preference]);

  useEffect(() => {
    const syncPreference = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const next = isPreference(event.newValue) ? event.newValue : 'system';
      applyTheme(next);
      setPreference(next);
    };
    window.addEventListener('storage', syncPreference);
    return () => window.removeEventListener('storage', syncPreference);
  }, []);

  function chooseTheme(next: ThemePreference) {
    applyTheme(next);
    setPreference(next);
    try { localStorage.setItem(STORAGE_KEY, next); }
    catch { /* The current choice still works when browser storage is unavailable. */ }
  }

  return { preference, chooseTheme };
}
