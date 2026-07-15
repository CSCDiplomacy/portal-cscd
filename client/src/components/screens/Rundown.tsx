import { useState, useEffect } from 'react';
import { useDelegateStore } from '../../stores/delegateStore';
import { useAuthStore } from '../../stores/authStore';
import { format12Hour, sortBy } from '../../lib/utils';

const ICON_MAP: Record<string, string> = {
  meal: '☕',
  keynote: '🎤',
  visit: '🗺️',
  social: '👥',
  workshop: '🔧',
  panel: '💬',
  ceremony: '🏆',
  default: '📅',
};

export const Rundown = () => {
  const { rundown, loading } = useDelegateStore();
  const { session } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (rundown?.dates && rundown.dates.length > 0) {
      setSelectedDate(rundown.dates[0]);
    }
  }, [rundown]);

  if (!session) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-on-surface-2">Please log in to view the rundown.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <svg
            className="w-8 h-8 animate-spin text-on-surface mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" opacity="0.25" />
            <path d="M12 3a9 9 0 0 1 9 9" />
          </svg>
          <p className="text-on-surface-2">Loading rundown…</p>
        </div>
      </div>
    );
  }

  if (!rundown || !rundown.dates || rundown.dates.length === 0) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Event Rundown
          </h1>
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-on-surface-2">
              The event schedule will be published soon. Check back later!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const events = selectedDate && rundown.events[selectedDate] ? rundown.events[selectedDate] : [];
  const sortedEvents = sortBy(events, 'time', 'asc');

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">
          Event Rundown
        </h1>

        {/* Day tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {rundown.dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedDate === date
                  ? 'bg-signal text-white'
                  : 'bg-on-surface-2 bg-opacity-10 hover:bg-opacity-20'
              }`}
            >
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {sortedEvents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-on-surface-2">No events scheduled for this day.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, idx) => (
              <div key={event.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className="text-2xl">
                    {ICON_MAP[event.type.toLowerCase()] || ICON_MAP.default}
                  </div>
                  {idx < sortedEvents.length - 1 && (
                    <div className="w-1 h-12 bg-on-surface-2 bg-opacity-20 mt-2" />
                  )}
                </div>

                {/* Event card */}
                <div className="flex-1 card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-on-surface-2 uppercase tracking-wide">
                        {format12Hour(event.time)} {event.duration && `· ${event.duration}`}
                      </div>
                      <h3 className="font-display font-bold text-lg mt-1">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-on-surface-2 text-sm mt-2">
                          {event.description}
                        </p>
                      )}
                      {event.speaker && (
                        <div className="text-sm text-on-surface-2 mt-2">
                          <strong>Speaker:</strong> {event.speaker}
                        </div>
                      )}
                      {event.venue && (
                        <div className="text-sm text-on-surface-2 mt-1">
                          <strong>Location:</strong> {event.venue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
