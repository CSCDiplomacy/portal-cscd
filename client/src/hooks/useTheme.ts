import { useUIStore } from '../stores/uiStore';

export const useTheme = () => {
  const { theme, toggleTheme } = useUIStore();

  const applyTheme = (newTheme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('cscd_theme', newTheme);
  };

  return {
    theme,
    toggleTheme: () => {
      toggleTheme();
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    },
  };
};
