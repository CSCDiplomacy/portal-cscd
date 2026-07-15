// My Schedule: the delegate's starred sessions, grouped by day.
import { useDelegateStore } from '../../stores/delegateStore';
import { sessionId } from '../../types';
import { format12Hour } from '../../lib/utils';
import { Icon, typeIcon } from '../Icon';

export const Schedule = () => {
  const { rundown, favourites, toggleFavourite } = useDelegateStore();

  if (!rundown?.days?.length) {
    return (
      <div className="coming-soon">
        <div className="coming-soon-badge">My schedule</div>
        <h2 className="coming-soon-title">Your personal agenda</h2>
        <p className="coming-soon-body">
          Once the programme is published, star the sessions you want and they will gather here.
        </p>
      </div>
    );
  }

  const days = rundown.days
    .map((day) => ({
      day,
      items: day.items.filter((item) => favourites.has(sessionId(day, item))),
    }))
    .filter((d) => d.items.length > 0);

  if (days.length === 0) {
    return (
      <div className="coming-soon">
        <div className="coming-soon-badge">Nothing starred yet</div>
        <h2 className="coming-soon-title">Build your day</h2>
        <p className="coming-soon-body">
          Star sessions in the Rundown (☆ Save) and they will appear here as your personal
          schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <div className="eyebrow">Sessions you starred</div>
        <h1 className="screen-title">My Schedule</h1>
      </div>
      {days.map(({ day, items }) => (
        <div key={day.date}>
          <div className="section-label">{day.label || day.date}</div>
          <div className="timeline">
            {items.map((item) => {
              const id = sessionId(day, item);
              return (
                <div key={id} className="t-item">
                  <div className="t-time">
                    <span className="t-hm">{format12Hour(item.time)}</span>
                  </div>
                  <div className="t-card">
                    <div className="t-head">
                      <span className="t-type">
                        <Icon name={typeIcon(item.type)} size={12} /> {item.type || 'session'}
                      </span>
                      <button
                        className="star-btn starred"
                        onClick={() => toggleFavourite(id)}
                        title="Remove from my schedule"
                      >
                        ★ Saved
                      </button>
                    </div>
                    <div className="t-title">{item.title}</div>
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
      ))}
    </div>
  );
};
