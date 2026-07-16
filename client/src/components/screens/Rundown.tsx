// Event rundown: timeline with star-to-save favourites.
// Applicants (and anyone before the programme is published) see Coming Soon.
import { useEffect, useState } from 'react';
import { useDelegateStore } from '../../stores/delegateStore';
import { sessionId } from '../../types';
import { format12Hour } from '../../lib/utils';
import { Icon, typeIcon } from '../Icon';

const RUNDOWN_DAY_KEY = 'cscd_rundown_day';

export const Rundown = () => {
  const { rundown, favourites, toggleFavourite } = useDelegateStore();
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    if (!rundown?.days?.length) {
      setActiveDay(null);
      return;
    }

    let savedDay: string | null = null;
    try {
      savedDay = localStorage.getItem(RUNDOWN_DAY_KEY);
    } catch {
      savedDay = null;
    }

    const fallback = rundown.days[0].date;
    const nextDay =
      (savedDay && rundown.days.some((entry) => entry.date === savedDay) && savedDay) || fallback;
    setActiveDay((current) => current || nextDay);
  }, [rundown]);

  useEffect(() => {
    if (!activeDay) return;
    try {
      localStorage.setItem(RUNDOWN_DAY_KEY, activeDay);
    } catch {
      // Ignore storage failures (private mode, blocked storage).
    }
  }, [activeDay]);

  if (!rundown?.days?.length) {
    return (
      <div className="coming-soon">
        <div className="coming-soon-badge">Programme</div>
        <h2 className="coming-soon-title">Agenda being finalised</h2>
        <p className="coming-soon-body">
          The hour-by-hour programme for Jakarta is coming together. Check back shortly — it will
          appear here as sessions are confirmed.
        </p>
      </div>
    );
  }

  const day = rundown.days.find((entry) => entry.date === activeDay) || rundown.days[0];

  return (
    <div className="stack">
      <div>
        <div className="eyebrow">The programme</div>
        <h1 className="screen-title">Rundown</h1>
        <p className="tag">{day.label || day.date}</p>
      </div>

      <div className="day-tabs" role="tablist" aria-label="Programme days">
        {rundown.days.map((entry) => {
          const isActive = entry.date === day.date;
          return (
            <button
              key={entry.date}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`day-tab${isActive ? ' active' : ''}`}
              onClick={() => setActiveDay(entry.date)}
            >
              {entry.label || entry.date}
            </button>
          );
        })}
      </div>

      <div className="timeline">
        {day.items.map((item) => {
          const id = sessionId(day, item);
          const starred = favourites.has(id);
          return (
            <div key={id} className="t-item">
              <div className="t-time">
                <span className="t-hm">{format12Hour(item.time)}</span>
                {item.end_time && <span className="t-end">– {format12Hour(item.end_time)}</span>}
              </div>
              <div className="t-card">
                <div className="t-head">
                  <span className="t-type">
                    <Icon name={typeIcon(item.type)} size={12} /> {item.type || 'session'}
                  </span>
                  <button
                    className={`star-btn${starred ? ' starred' : ''}`}
                    onClick={() => toggleFavourite(id)}
                    title={starred ? 'Remove from my schedule' : 'Add to my schedule'}
                  >
                    {starred ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
                <div className="t-title">{item.title}</div>
                {item.description && <p className="t-desc">{item.description}</p>}
                {item.venue && (
                  <div className="t-venue">
                    <Icon name="mapPin" size={12} /> {item.venue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
