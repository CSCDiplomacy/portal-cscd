import type { Screen } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  showInterview: boolean;
}

const NAV_ITEMS: Array<{ label: string; screen: Screen; icon: string }> = [
  {
    label: 'Dashboard',
    screen: 'dashboard',
    icon: 'M3 11l9-8 9 8 M5 10v10h14V10',
  },
  {
    label: 'Rundown',
    screen: 'rundown',
    icon: 'M12 12r10 M12 7v5l3 2',
  },
  {
    label: 'Hotel',
    screen: 'hotel',
    icon: 'M3 21V8l9-5 9 5v13 M9 21v-7h6v7',
  },
  {
    label: 'Contact',
    screen: 'contact',
    icon: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z',
  },
  {
    label: 'My Schedule',
    screen: 'schedule',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.65L7 14.14 2 9.27l6.91-1.01L12 2',
  },
];

export const Sidebar = ({
  activeScreen,
  onNavigate,
  showInterview,
}: SidebarProps) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-on-surface-2 border-opacity-10">
      {/* Header */}
      <div className="p-6 border-b border-on-surface-2 border-opacity-10">
        <div className="flex items-center gap-3 mb-2">
          <img src="/img/cscd-logo.png" alt="CSCD" className="w-10 h-10" />
          <div>
            <div className="text-xs font-medium text-on-surface-2">CSCD</div>
            <div className="text-sm font-display font-bold">Jakarta 2026</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                activeScreen === item.screen
                  ? 'bg-on-surface-2 bg-opacity-10 text-on-surface font-medium'
                  : 'hover:bg-on-surface-2 hover:bg-opacity-5 text-on-surface-2 hover:text-on-surface'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}

          {showInterview && (
            <button
              onClick={() => onNavigate('interview')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                activeScreen === 'interview'
                  ? 'bg-on-surface-2 bg-opacity-10 text-on-surface font-medium'
                  : 'hover:bg-on-surface-2 hover:bg-opacity-5 text-on-surface-2 hover:text-on-surface'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              <span className="text-sm font-medium">Interview</span>
            </button>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-on-surface-2 border-opacity-10 p-4 space-y-3">
        {user && (
          <div className="px-3 py-2 rounded bg-on-surface-2 bg-opacity-5">
            <div className="text-xs font-bold truncate">{user.name}</div>
            <div className="text-xs text-on-surface-2 truncate">{user.email}</div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="btn ghost w-full text-sm"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};
