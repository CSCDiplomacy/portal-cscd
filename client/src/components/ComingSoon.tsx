// "Coming Soon" gate. Applicants see every event section like this on purpose
// (engagement model: sections laid out, data fills in) — copy mirrors the
// vanilla app.

interface ComingSoonProps {
  title: string;
  body: string;
}

export const ComingSoon = ({ title, body }: ComingSoonProps) => (
  <div className="coming-soon">
    <div className="coming-soon-badge">Coming soon</div>
    <h2 className="coming-soon-title">{title}</h2>
    <p className="coming-soon-body">{body}</p>
  </div>
);

export const COMING_SOON_COPY = {
  rundown: {
    title: 'The full programme',
    body: 'The hour-by-hour rundown for Jakarta will appear here once you are confirmed and the schedule is published.',
  },
  hotel: {
    title: 'Your stay',
    body: 'Hotel, room and check-in details will show here once your attendance is confirmed and logistics are set.',
  },
  schedule: {
    title: 'My schedule',
    body: 'Your personal schedule of starred sessions becomes available once the programme is live.',
  },
} as const;
