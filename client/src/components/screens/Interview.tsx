// Interview screen. The form URL comes from GET /api/me/interview — it is a
// secret handed only to authenticated applicants who haven't submitted, with
// their token appended (see routes/me.js). The AidaForm embed widget script
// must be injected imperatively: React never executes <script> tags in JSX.
import { useEffect, useRef, useState } from 'react';
import type { InterviewInfo } from '../../types';
import { api, track } from '../../services/api';
import { Icon } from '../Icon';

const WIDGET_SRC = 'https://widget.aidaform.com/embed.js';
const WIDGET_ID = 'aidaform-app';

function ensureWidgetScript() {
  if (document.getElementById(WIDGET_ID)) {
    // Already loaded — ask the widget to (re)scan for embed divs if it can.
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
  const [failed, setFailed] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    track('screen_view', 'interview');
    api<InterviewInfo>('/me/interview')
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Once the "open" state renders the embed div, load the widget script.
  useEffect(() => {
    if (info?.state === 'open' && info.url && embedRef.current) {
      ensureWidgetScript();
    }
  }, [info]);

  if (failed) {
    return (
      <Notice
        title="Something went wrong"
        body="We could not load your interview just now. Please refresh and try again."
      />
    );
  }

  if (!info) {
    return (
      <div className="screen-pad">
        <div className="skel h-24" />
        <div className="skel h-4 w-2/3" />
      </div>
    );
  }

  if (info.state === 'submitted') {
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

  if (info.state === 'not_applicable') {
    return (
      <Notice
        done
        title="You are all set"
        body="Your place is confirmed — the interview stage is behind you. Explore the event sections as they open up."
      />
    );
  }

  if (info.state === 'open' && info.url) {
    return (
      <div className="interview-embed-wrap">
        <div
          ref={embedRef}
          data-aidaform-app={info.form_id || 'form202405'}
          data-url={info.url}
          data-width="100%"
          data-height="700px"
          data-do-resize=""
        />
        <p className="interview-hint">
          Trouble with the embedded form?{' '}
          <a href={info.url} target="_blank" rel="noopener noreferrer">
            Open it in a new tab →
          </a>
        </p>
      </div>
    );
  }

  // 'unavailable' — form not configured yet.
  return (
    <Notice
      title="Interview opens soon"
      body="Your interview is not quite ready. Please check back shortly — we will notify you here when it is live."
    />
  );
};
