// Top bar: brand (mobile), theme toggle, updates bell (with unread dot), menu.
import { useAuthStore } from '../../stores/authStore';
import { useDelegateStore } from '../../stores/delegateStore';
import { useUIStore } from '../../stores/uiStore';
import { Icon } from '../Icon';

export const TopBar = () => {
  const { eventName } = useAuthStore();
  const { announcements } = useDelegateStore();
  const { theme, toggleTheme, readIds, setRailOpen, setMenuOpen, markAllRead } = useUIStore();

  const unread = announcements.filter((a) => !readIds.has(String(a.id))).length;

  const openRail = () => {
    setRailOpen(true);
    markAllRead(announcements.map((a) => String(a.id)));
  };

  return (
    <header className="topbar">
      <div className="brand">
        <img src="/img/cscd-logo.png" className="brand-logo" alt="CSCD" />
        <span className="brand-sub">{eventName}</span>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <button className="icon-btn bell" onClick={openRail} aria-label="Updates">
          <Icon name="bell" size={18} />
          {unread > 0 && <span className="bell-dot" />}
        </button>
        <button
          className="icon-btn menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
        >
          <Icon name="menu" size={18} />
        </button>
      </div>
    </header>
  );
};
