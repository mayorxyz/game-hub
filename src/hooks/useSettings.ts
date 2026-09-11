import { useState, useEffect } from 'react';
import { getSettings, updateSettings, type Settings } from '../lib/persistence';

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(getSettings);

  const updateSettingsState = (newSettings: Partial<Settings>) => {
    updateSettings(newSettings);
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  // Apply theme whenever it changes or on mount
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
        root.classList.toggle('light', !prefersDark);
      } else {
        root.classList.toggle('dark', settings.theme === 'dark');
        root.classList.toggle('light', settings.theme === 'light');
      }
    };

    applyTheme();

    // Listen for system theme changes when in system mode
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  return {
    settings,
    updateSettings: updateSettingsState,
  };
}
