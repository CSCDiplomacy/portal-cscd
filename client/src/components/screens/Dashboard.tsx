// Dashboard. Applicants lead with the interview CTA; the event tiles stay
// visible but read "Coming soon" until the delegate is enrolled and data is
// published (the client's engagement model).
import { useState } from 'react';
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
  const [reminderAt, setReminderAt] = useState('');

  const applicant = isApplicant(profile);
  const interviewPending = showInterviewTab(profile);
  const interviewSubmitted = profile?.interview_status === 'submitted';

  const reminderTitle = 'Complete your YPDS Jakarta interview';

  const handleAddToCalendar = () => {
    if (!reminderAt) return;
    const start = new Date(reminderAt);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + 30 * 60000);
    const asGoogleStamp = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}` +
      `T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', reminderTitle);
    url.searchParams.set('dates', `${asGoogleStamp(start)}/${asGoogleStamp(end)}`);
    url.searchParams.set('ctz', tz);
    url.searchParams.set('details', 'Reminder set from your YPDS Jakarta 2026 delegate portal.');
    window.open(url.toString(), '_blank', 'noopener');
  };

  const [reminderDate, reminderTime] = reminderAt.split('T');
  const icsHref = reminderDate && reminderTime
    ? `/api/ics?date=${reminderDate}&time=${reminderTime}&duration=30&title=${encodeURIComponent(reminderTitle)}`
    : null;

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

      {interviewPending && (
        <div className="remind-card">
          <div className="remind-tag">
            <Icon name="bell" size={14} /> Remind me later
          </div>
          <div className="remind-title">Don't miss your interview</div>
          <p className="remind-sub">
            Pick a date and time — Add to calendar opens a ready-made Google Calendar event so
            you get a reminder.
          </p>
          <div className="remind-controls">
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              aria-label="Reminder date and time"
            />
            <button
              type="button"
              className="btn brass small"
              onClick={handleAddToCalendar}
              disabled={!reminderAt}
            >
              <Icon name="calendar" size={14} /> Add to calendar
            </button>
          </div>
          {icsHref && (
            <a className="remind-ics" href={icsHref} target="_blank" rel="noopener noreferrer">
              Or download an .ics file instead
            </a>
          )}
        </div>
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
