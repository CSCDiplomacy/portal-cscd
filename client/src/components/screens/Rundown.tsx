// Event rundown: timeline with star-to-save favourites.
// Applicants (and anyone before the programme is published) see Coming Soon.
import { useDelegateStore } from '../../stores/delegateStore';
import { sessionId } from '../../types';
import { format12Hour } from '../../lib/utils';
import { Icon, typeIcon } from '../Icon';

export const Rundown = () => {
  const { rundown, favourites, toggleFavourite } = useDelegateStore();

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

  const day = rundown.days[0];

  return (
    <div className="stack">
      <div>
        <div className="eyebrow">The programme</div>
        <h1 className="screen-title">Rundown</h1>
        <p className="tag">{day.label || day.date}</p>
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
