// Dashboard. Applicants lead with the interview CTA; the event tiles stay
// visible but read "Coming soon" until the delegate is enrolled and data is
// published (the client's engagement model).
import { isApplicant, showInterviewTab, useAuthStore } from '../../stores/authStore';
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
  const interviewPending = showInterviewTab(profile);
  const interviewSubmitted = profile?.interview_status === 'submitted';

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
              <span className={`chip ${applicant ? 'chip-pending' : 'chip-ok'}`}>
                {applicant ? 'Applicant' : 'Confirmed delegate'}
              </span>
            </span>
          </div>
          <div className="pass-field">
            <span className="pass-field-label">Interview</span>
            <span className="pass-field-value">
              {interviewSubmitted ? 'Completed' : applicant ? 'Awaiting' : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Applicant: the interview is the next step */}
      {interviewPending && (
        <button className="interview-cta" onClick={() => switchScreen('interview')}>
          <div className="interview-cta-tag">Your next step</div>
          <div className="interview-cta-title">Complete your interview</div>
          <div className="interview-cta-sub">
            One form stands between you and Jakarta. It takes just a few minutes — find a quiet
            spot and tell us your story.
          </div>
          <span className="interview-cta-go">Start now →</span>
        </button>
      )}
      {applicant && interviewSubmitted && (
        <div className="interview-cta is-done">
          <div className="interview-cta-tag">
            <Icon name="check" size={14} /> Interview complete
          </div>
          <div className="interview-cta-title">Thank you — your interview is done</div>
          <div className="interview-cta-sub">
            Our team is reviewing your submission. Watch this portal for the outcome.
          </div>
        </div>
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
