import type { Screen } from '../../types';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  showInterview: boolean;
}

const NAV_ITEMS: Array<{ label: string; screen: Screen; icon: string }> = [
  {
    label: 'Home',
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
    label: 'Schedule',
    screen: 'schedule',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.65L7 14.14 2 9.27l6.91-1.01L12 2',
  },
];

export const BottomNav = ({
  activeScreen,
  onNavigate,
  showInterview,
}: BottomNavProps) => {
  const interviewItems: Array<{ label: string; screen: Screen; icon: string }> = [
    {
      label: 'Home',
      screen: 'dashboard',
      icon: 'M3 11l9-8 9 8 M5 10v10h14V10',
    },
    {
      label: 'Interview',
      screen: 'interview',
      icon: 'M23 7l-7 5 7 5V7z M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1',
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
  ];
  const items = showInterview ? interviewItems : NAV_ITEMS.slice(0, 4);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-on-surface-2 border-opacity-10">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
              activeScreen === item.screen
                ? 'text-on-surface'
                : 'text-on-surface-2 hover:text-on-surface'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.icon} />
            </svg>
            <span className="text-xs font-medium">{item.label}</span>
            {activeScreen === item.screen && (
              <div className="w-1 h-1 bg-on-surface rounded-full absolute bottom-0" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
