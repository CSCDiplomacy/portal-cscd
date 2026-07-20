// Dashboard. Interviews are now closed. Applicants get a card leading into the
// Results screen — a countdown if their interview was evaluated, the
// self-financed route if not. Event tiles stay visible but read "Coming soon"
// until the delegate is enrolled and data is published.
import {
  isApplicant,
  isUnderReview,
  showResultsTab,
  useAuthStore,
} from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import type { Screen } from '../../types';

const TILES: Array<{ screen: Screen; icon: IconName; title: string; sub: string }> = [
  { screen: 'about', icon: 'globe', title: 'The Summit', sub: 'Themes, story & lineage' },
  { screen: 'rundown', icon: 'clock', title: 'Rundown', sub: 'The day-by-day programme' },
  { screen: 'venue', icon: 'hotel', title: 'Institutional visit & dinner', sub: 'City visits, dinner logistics' },
  { screen: 'schedule', icon: 'star', title: 'My Schedule', sub: 'Sessions you starred' },
];

export const Dashboard = () => {
  const { profile } = useAuthStore();
  const { switchScreen } = useUIStore();

  const applicant = isApplicant(profile);
  const underReview = isUnderReview(profile);
  const hasResult = showResultsTab(profile);

  const statusLabel = !applicant ? 'Confirmed delegate' : underReview ? 'Under review' : 'Applicant';
  const statusChip = !applicant ? 'chip-ok' : underReview ? 'chip-review' : 'chip-pending';
  const interviewLabel = underReview ? 'Completed' : applicant ? 'Closed' : '—';

  return (
    <div className="stack">
      {/* Boarding-pass hero */}
      <div className="pass">
        <div className="pass-top">
          <div>
            <div className="pass-eyebrow">
              {applicant ? 'Applicant credential' : 'Delegate credential'}
            </div>
            <div className="pass-title">{profile?.name || 'Welcome'}</div>
            <div className="pass-sub">{profile?.email || ''}</div>
          </div>
          <div className="seal">
            <span>
              YPDS
              <br />
              JKT
              <br />
              2026
            </span>
          </div>
        </div>
        <div className="pass-perf" />
        <div className="pass-bottom">
          <div className="pass-field">
            <span className="pass-field-label">Applicant ID</span>
            <span className="pass-field-value">{profile?.applicant_id || '—'}</span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Status</span>
            <span className="pass-field-value">
              <span className={`chip ${statusChip}`}>{statusLabel}</span>
            </span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Interview</span>
            <span className="pass-field-value">{interviewLabel}</span>
          </div>
        </div>
      </div>

      {/* Applicants with an outcome on record: lead them into the Results screen */}
      {hasResult && (
        <button className="result-cta" onClick={() => switchScreen('results')}>
          <div className="result-cta-tag">
            <Icon name={underReview ? 'check' : 'bell'} size={14} />
            {underReview ? 'Interview received' : 'Interviews concluded'}
          </div>
          <div className="result-cta-title">
            {underReview ? 'Your interview has been evaluated' : 'No interview on record'}
          </div>
          <div className="result-cta-sub">
            {underReview
              ? 'Decisions are being finalised — open your result for the countdown.'
              : 'You can still join the summit self-financed. See your options.'}
          </div>
          <span className="result-cta-go">View your result →</span>
        </button>
      )}

      {/* Featured banner */}
      <div className="dash-banner">
        <img src="/img/ypds-jakarta-2026-banner.png" alt="YPDS Jakarta 2026" loading="lazy" />
      </div>

      {/* Section tiles */}
      <div>
        <div className="section-label">Explore</div>
        <div className="tile-grid">
          {TILES.map((tile) => (
            <button key={tile.screen} className="tile" onClick={() => switchScreen(tile.screen)}>
              <Icon name={tile.icon} size={20} className="tile-icon" />
              <div className="tile-title">{tile.title}</div>
              <div className="tile-sub">{tile.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
