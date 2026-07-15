import { useEffect, useState } from 'react';
import { useDelegateStore } from '../../stores/delegateStore';
import { useAuthStore } from '../../stores/authStore';
import { format12Hour, sortBy } from '../../lib/utils';
import type { RundownEvent } from '../../types';

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

export const Schedule = () => {
  const { rundown, favourites, loading: delegateLoading, toggleFavourite } = useDelegateStore();
  const { session } = useAuthStore();
  const [favoriteEvents, setFavoriteEvents] = useState<RundownEvent[]>([]);

  useEffect(() => {
    if (rundown && favourites.size > 0) {
      const events: RundownEvent[] = [];
      Object.values(rundown.events).forEach((dayEvents) => {
        dayEvents.forEach((event) => {
          if (favourites.has(event.id)) {
            events.push(event);
          }
        });
      });
      const sorted = sortBy(events, 'time', 'asc');
      setFavoriteEvents(sorted);
    } else {
      setFavoriteEvents([]);
    }
  }, [rundown, favourites]);

  if (!session) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-on-surface-2">Please log in to view your schedule.</p>
        </div>
      </div>
    );
  }

  if (delegateLoading) {
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
          <p className="text-on-surface-2">Loading your schedule…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
          My Schedule
        </h1>
        <p className="text-on-surface-2 mb-6">
          You have {favourites.size} event{favourites.size !== 1 ? 's' : ''} in your schedule.
        </p>

        {favoriteEvents.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="font-display font-bold mb-2">No events yet</h2>
            <p className="text-on-surface-2 mb-4">
              You haven't added any events to your schedule yet.
            </p>
            <p className="text-sm text-on-surface-2">
              Go to the Rundown tab to add events to your personal schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteEvents.map((event, idx) => (
              <div key={event.id} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => toggleFavourite(event.id)}
                    className="text-2xl hover:scale-110 transition-transform"
                    title="Remove from schedule"
                  >
                    {ICON_MAP[event.type.toLowerCase()] || ICON_MAP.default}
                  </button>
                  {idx < favoriteEvents.length - 1 && (
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

                    {/* Remove button */}
                    <button
                      onClick={() => toggleFavourite(event.id)}
                      className="icon-btn text-signal hover:bg-red-50"
                      title="Remove from schedule"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                      >
                        <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-on-surface-2 bg-opacity-5 rounded-lg border-l-4 border-signal">
          <p className="text-sm">
            <strong>Tip:</strong> Click on events in the Rundown to add them to your personal schedule.
          </p>
        </div>
      </div>
    </div>
  );
};
