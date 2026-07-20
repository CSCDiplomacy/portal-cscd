// Interview results. Interviews are over and every applicant has been
// reconciled against the AidaForm export (scripts/reconcile-interviews.js), so
// `result_status` decides what shows here:
//   evaluated     → interview received, live countdown to the announcement
//   not_evaluated → no interview on record, self-financed route
//   pending       → not reconciled yet, Coming Soon
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Icon } from '../Icon';

// Fixed moment the interview results are announced. A hard timestamp means
// every applicant sees the same deadline, not a per-load timer.
export const RESULTS_ANNOUNCEMENT = new Date('2026-07-20T17:15:00Z');

// Where non-selected / missed applicants apply to attend self-financed.
export const JAKARTA_APPLY_URL = 'https://thecscd.org/ypds-jakarta-2026/';

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const CountdownCard = () => {
  const remaining = useCountdown(RESULTS_ANNOUNCEMENT);
  const done = remaining <= 0;

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const announcedLocal = RESULTS_ANNOUNCEMENT.toLocaleString(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="countdown-card">
      <div className="countdown-tag">
        <Icon name="check" size={14} /> Interview received
      </div>
      <div className="countdown-title">
        {done ? 'Results are being announced' : 'Interview results announced in'}
      </div>
      {done ? (
        <p className="countdown-sub">
          The review is complete — refresh your portal to see your outcome.
        </p>
      ) : (
        <>
          <div className="countdown-clock" role="timer" aria-live="off">
            <div className="countdown-unit">
              <span className="countdown-num">{pad(hours)}</span>
              <span className="countdown-label">hrs</span>
            </div>
            <span className="countdown-colon">:</span>
            <div className="countdown-unit">
              <span className="countdown-num">{pad(minutes)}</span>
              <span className="countdown-label">min</span>
            </div>
            <span className="countdown-colon">:</span>
            <div className="countdown-unit">
              <span className="countdown-num">{pad(seconds)}</span>
              <span className="countdown-label">sec</span>
            </div>
          </div>
          <p className="countdown-sub">
            Thank you — your interview is in. Our team is finalising decisions; results go live{' '}
            <strong>{announcedLocal}</strong>. Keep this portal handy.
          </p>
        </>
      )}
    </div>
  );
};

export const SelfFinanceCard = () => (
  <div className="interview-cta is-done">
    <div className="interview-cta-tag">
      <Icon name="bell" size={14} /> Interviews concluded
    </div>
    <div className="interview-cta-title">Interviews have now been conducted</div>
    <div className="interview-cta-sub">
      The interview window for YPDS Jakarta 2026 has closed. You can still join the summit on a
      self-financed basis — apply on the Jakarta page to secure your place.
    </div>
    <a
      className="interview-cta-go"
      href={JAKARTA_APPLY_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Apply self-financed →
    </a>
  </div>
);

export const Results = () => {
  const { profile } = useAuthStore();
  const result = profile?.result_status || 'pending';

  if (result === 'pending') {
    return (
      <div className="coming-soon">
        <div className="coming-soon-badge">Results</div>
        <h2 className="coming-soon-title">Results are being prepared</h2>
        <p className="coming-soon-body">
          Your outcome will appear here as soon as the review panel publishes it.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <div className="eyebrow">Selection</div>
        <h1 className="screen-title">Your Result</h1>
      </div>

      {result === 'evaluated' ? (
        <>
          <CountdownCard />
          <div className="t-card">
            <p className="tag">What happens next</p>
            <div className="t-title">Your interview has been evaluated</div>
            <p className="t-desc">
              The panel has your interview on record and is finalising the delegate list. You'll
              see your outcome on this page — no email needed, and nothing further to submit.
            </p>
          </div>
        </>
      ) : (
        <>
          <SelfFinanceCard />
          <div className="t-card">
            <p className="tag">Still want to attend?</p>
            <div className="t-title">No interview on record</div>
            <p className="t-desc">
              We don't have an interview recorded against your application, so you weren't part of
              the evaluated pool. The self-financed route is still open — apply on the Jakarta page
              above. If you believe you did interview, contact us from the Contact tab.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
