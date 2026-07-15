import { useState } from 'react';
import type { JSX } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useAppData } from '../../hooks/useAppData';
import { useApplicantGate } from '../../hooks/useApplicantGate';
import { useDelegateStore } from '../../stores/delegateStore';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Dashboard } from '../screens/Dashboard';
import { Placeholder } from '../screens/Placeholder';
import { Interview } from '../screens/Interview';
import { Rundown } from '../screens/Rundown';
import { Hotel } from '../screens/Hotel';
import { Contact } from '../screens/Contact';
import { Schedule } from '../screens/Schedule';

interface AppLayoutProps {
  eventName: string;
}

export const AppLayout = ({ eventName }: AppLayoutProps) => {
  const { activeScreen, switchScreen } = useUIStore();
  const { announcements } = useDelegateStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  // Load all app data on mount
  useAppData();

  // Check if user is applicant (show interview tab)
  const { showInterview } = useApplicantGate();

  const unreadCount = announcements && Array.isArray(announcements)
    ? announcements.filter((a) => !a.read).length
    : 0;

  const renderScreen = (): JSX.Element => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'interview':
        return <Interview />;
      case 'rundown':
        return <Rundown />;
      case 'hotel':
        return <Hotel />;
      case 'schedule':
        return <Schedule />;
      case 'contact':
        return <Contact />;
      case 'visits':
        return <Placeholder title="Visits" icon="🗺️" />;
      case 'speakers':
        return <Placeholder title="Speakers" icon="🎤" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar (desktop) */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={switchScreen}
        showInterview={showInterview}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopBar
          eventName={eventName}
          onMenuClick={() => setMenuOpen(!menuOpen)}
          onBellClick={() => setRailOpen(!railOpen)}
          unreadCount={unreadCount}
        />

        {/* Screen content */}
        <main className="flex-1 overflow-auto">
          {renderScreen()}
        </main>

        {/* Bottom nav (mobile) */}
        <BottomNav
          activeScreen={activeScreen}
          onNavigate={switchScreen}
          showInterview={showInterview}
        />
      </div>

      {/* Backdrop for modals */}
      {(menuOpen || railOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => {
            setMenuOpen(false);
            setRailOpen(false);
          }}
        />
      )}

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-surface border-l border-on-surface-2 border-opacity-10 overflow-y-auto">
            <div className="p-4 border-b border-on-surface-2 border-opacity-10 flex justify-between items-center">
              <h3 className="font-display font-bold">Menu</h3>
              <button
                className="icon-btn"
                onClick={() => setMenuOpen(false)}
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  switchScreen('hotel');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-on-surface-2 hover:bg-opacity-5 rounded"
              >
                Hotel & Check-in
              </button>
              <button
                onClick={() => {
                  switchScreen('contact');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-on-surface-2 hover:bg-opacity-5 rounded"
              >
                Contact us
              </button>
              <a
                href="https://thecscd.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 hover:bg-on-surface-2 hover:bg-opacity-5 rounded"
              >
                CSCD website
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Updates rail (right side) */}
      {railOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-surface border-l border-on-surface-2 border-opacity-10 overflow-y-auto z-40">
          <div className="p-4 border-b border-on-surface-2 border-opacity-10 flex justify-between items-center">
            <h3 className="font-display font-bold">Updates</h3>
            <button
              className="icon-btn"
              onClick={() => setRailOpen(false)}
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            {announcements.length === 0 ? (
              <p className="text-sm text-on-surface-2">No updates yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-3 border border-on-surface-2 border-opacity-10 rounded"
                  >
                    <h4 className="font-bold text-sm mb-1">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-on-surface-2 line-clamp-3">
                      {announcement.body}
                    </p>
                    <div className="text-xs text-on-surface-2 mt-2">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
