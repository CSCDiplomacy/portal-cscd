// Mobile bottom navigation. When the applicant still owes an interview it
// takes a slot; otherwise the standard four tabs show.
import { useUIStore } from '../../stores/uiStore';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import type { Screen } from '../../types';

type NavItem = { screen: Screen; label: string; icon: IconName };

const BASE: NavItem[] = [
  { screen: 'dashboard', label: 'Home', icon: 'home' },
  { screen: 'about', label: 'Summit', icon: 'globe' },
  { screen: 'rundown', label: 'Rundown', icon: 'clock' },
  { screen: 'venue', label: 'Visit', icon: 'hotel' },
  { screen: 'schedule', label: 'Schedule', icon: 'star' },
];

const WITH_INTERVIEW: NavItem[] = [
  BASE[0],
  { screen: 'interview', label: 'Interview', icon: 'video' },
  BASE[1],
  BASE[2],
  BASE[3],
];

// The bar holds five tabs. Results is what applicants come back for, so it
// takes the slot after Home and pushes the last event tab off.
const RESULTS_TAB: NavItem = { screen: 'results', label: 'Result', icon: 'award' };

export const BottomNav = ({
  showInterview,
  showResults,
}: {
  showInterview: boolean;
  showResults: boolean;
}) => {
  const { activeScreen, switchScreen } = useUIStore();
  const base = showInterview ? WITH_INTERVIEW : BASE;
  const items = showResults ? [base[0], RESULTS_TAB, ...base.slice(1, 4)] : base;

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.screen}
          className={`nav-item${activeScreen === item.screen ? ' active' : ''}`}
          onClick={() => switchScreen(item.screen)}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
