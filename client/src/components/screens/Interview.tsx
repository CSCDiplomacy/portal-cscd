// Interview screen. The form URL ideally comes from GET /api/me/interview
// (a per-applicant tokenized URL so the webhook can tie a submission back to
// the applicant). If the backend can't supply one — env not set, request fails
// — we fall back to the shared public form so the interview always works.
// The AidaForm embed widget script must be injected imperatively: React never
// executes <script> tags rendered in JSX.
import { useEffect, useRef, useState } from 'react';
import type { InterviewInfo } from '../../types';
import { api, track } from '../../services/api';
import { Icon } from '../Icon';

const SHARED_FORM_URL = 'https://15158.aidaform.com/interview-copy';
const FORM_ID = 'form202405';
const WIDGET_SRC = 'https://widget.aidaform.com/embed.js';
const WIDGET_ID = 'aidaform-app';

function ensureWidgetScript() {
  if (document.getElementById(WIDGET_ID)) {
    const w = window as unknown as { AidaForm?: { embed?: () => void } };
    w.AidaForm?.embed?.();
    return;
  }
  const script = document.createElement('script');
  script.id = WIDGET_ID;
  script.src = WIDGET_SRC;
  document.head.appendChild(script);
}

const Notice = ({ title, body, done }: { title: string; body: string; done?: boolean }) => (
  <div className={`interview-notice${done ? ' is-done' : ''}`}>
    <div className="interview-notice-icon">
      <Icon name={done ? 'check' : 'clock'} size={26} />
    </div>
    <h2 className="interview-notice-title">{title}</h2>
    <p className="interview-notice-body">{body}</p>
  </div>
);

export const Interview = () => {
  const [info, setInfo] = useState<InterviewInfo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    track('interview_open');
    api<InterviewInfo>('/me/interview')
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        // Network / config failure — treat as "show the form" below.
        if (!cancelled) setInfo(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Submitted / already-enrolled are terminal — no form.
  const terminal = info?.state === 'submitted' || info?.state === 'not_applicable';
  const formUrl = SHARED_FORM_URL;

  useEffect(() => {
    if (loaded && !terminal) {
      const timer = window.setInterval(() => {
        api<InterviewInfo>('/me/interview')
          .then((data) => setInfo(data))
          .catch(() => {});
      }, 10000);
      return () => window.clearInterval(timer);
    }
    return undefined;
  }, [loaded, terminal]);

  // Load the widget once the embed div is on the page.
  useEffect(() => {
    if (loaded && !terminal && embedRef.current) {
      ensureWidgetScript();
    }
  }, [loaded, terminal]);

  if (!loaded) {
    return (
      <div className="stack">
        <div className="skel" style={{ height: 96 }} />
        <div className="skel" style={{ height: 16, width: '66%' }} />
      </div>
    );
  }

  if (info?.state === 'submitted') {
    const when = info.submitted_at
      ? new Date(info.submitted_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;
    return (
      <Notice
        done
        title={`Interview submitted${when ? ` · ${when}` : ''}`}
        body="Thank you. Your responses are in and our team is reviewing them. Watch this portal for the outcome — nothing more is needed from you right now."
      />
    );
  }

  if (info?.state === 'not_applicable') {
    return (
      <Notice
        done
        title="You are all set"
        body="Your place is confirmed — the interview stage is behind you. Explore the event sections as they open up."
      />
    );
  }

  // Open / unavailable / failed → always show the form until the server marks it submitted.
  return (
    <div className="stack">
      <div>
        <div className="eyebrow">Selection · your interview</div>
        <h1 className="screen-title">The Interview</h1>
        <p className="tag">One form stands between you and Jakarta.</p>
      </div>
      <div className="interview-embed-wrap">
        <div className="interview-embed-clip">
          <div
            ref={embedRef}
            data-aidaform-app={FORM_ID}
            data-url={formUrl}
            data-width="100%"
            data-height="700px"
            data-do-resize=""
          />
        </div>
      </div>
    </div>
  );
};
