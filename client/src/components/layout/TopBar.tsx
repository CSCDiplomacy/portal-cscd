import { useTheme } from '../../hooks/useTheme';

interface TopBarProps {
  eventName: string;
  onMenuClick: () => void;
  onBellClick: () => void;
  unreadCount: number;
}

export const TopBar = ({
  eventName,
  onMenuClick,
  onBellClick,
  unreadCount,
}: TopBarProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-on-surface-2 border-opacity-10">
      <div className="flex items-center justify-between px-4 h-16 md:h-20">
        {/* Logo (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <img
            src="/img/cscd-logo.png"
            alt="CSCD"
            className="w-8 h-8"
          />
          <div>
            <div className="text-xs font-medium text-on-surface-2">CSCD</div>
            <div className="text-sm font-display font-bold">{eventName}</div>
          </div>
        </div>

        {/* Logo (mobile) */}
        <div className="md:hidden flex items-center gap-2">
          <img
            src="/img/cscd-logo.png"
            alt="CSCD"
            className="w-6 h-6"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>

          {/* Bell/Updates */}
          <button
            className="icon-btn relative"
            onClick={onBellClick}
            aria-label="Updates"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Menu (mobile) */}
          <button
            className="icon-btn md:hidden"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
