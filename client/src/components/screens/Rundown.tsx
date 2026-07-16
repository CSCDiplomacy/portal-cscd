// Event rundown: static day-by-day summary. Applicants (and anyone before the
// programme is published) see Coming Soon.
import { useDelegateStore } from '../../stores/delegateStore';

export const Rundown = () => {
  const { rundown } = useDelegateStore();

  if (!rundown?.days?.length) {
    return (
      <div className="coming-soon">
        <div className="coming-soon-badge">Programme</div>
        <h2 className="coming-soon-title">Agenda being finalised</h2>
        <p className="coming-soon-body">
          The programme for Jakarta is coming together. Check back shortly — it will appear here
          as it's confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <div className="eyebrow">Program structure</div>
        <h1 className="screen-title">Days of Strategy</h1>
      </div>

      <div className="stack">
        {rundown.days.map((day) => (
          <div key={day.date} className="t-card">
            <p className="tag">{day.label || day.date}</p>
            <div className="t-title">{day.title}</div>
            {day.description && <p className="t-desc">{day.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
