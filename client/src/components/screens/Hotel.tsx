// Hotel & stay. Enrolled delegates get their booking row merged with the
// shared hotel reference (GET /api/me/hotel). Applicants see Coming Soon.
import { useEffect, useState } from 'react';
import { isApplicant, useAuthStore } from '../../stores/authStore';
import type { MyHotel } from '../../types';
import { api } from '../../services/api';
import { mapsLink } from '../../lib/utils';
import { ComingSoon, COMING_SOON_COPY } from '../ComingSoon';
import { Icon } from '../Icon';

export const Hotel = () => {
  const { profile } = useAuthStore();
  const applicant = isApplicant(profile);
  const [data, setData] = useState<MyHotel | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (applicant) return;
    let cancelled = false;
    api<MyHotel>('/me/hotel')
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [applicant]);

  if (applicant) return <ComingSoon {...COMING_SOON_COPY.hotel} />;

  if (failed || (data && !data.hotel && !data.delegate?.room)) {
    return <ComingSoon {...COMING_SOON_COPY.hotel} />;
  }

  if (!data) {
    return (
      <div className="stack">
        <div className="skel h-40" />
        <div className="skel h-24" />
      </div>
    );
  }

  const { hotel, delegate } = data;
  const map = hotel ? mapsLink(hotel.address || hotel.name) : null;

  return (
    <div className="stack">
      {hotel && (
        <div className="card">
          {hotel.image && <img src={hotel.image} alt={hotel.name} className="card-img" loading="lazy" />}
          <div className="card-eyebrow">{hotel.subtitle || 'Your stay'}</div>
          <h2 className="card-title">{hotel.name}</h2>
          {hotel.location && (
            <div className="t-venue">
              <Icon name="mapPin" size={12} /> {hotel.location}
            </div>
          )}
          {hotel.description && <p className="card-body-text">{hotel.description}</p>}
          {!!hotel.highlights?.length && (
            <ul className="dot-list">
              {hotel.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          {map && (
            <a className="chip chip-link" href={map} target="_blank" rel="noopener noreferrer">
              Open in Maps
            </a>
          )}
        </div>
      )}

      {delegate && (delegate.room || delegate.booking_ref || delegate.check_in) && (
        <div className="card">
          <div className="card-eyebrow">Your booking</div>
          <div className="kv-grid">
            {delegate.room && (
              <div>
                <div className="kv-label">Room</div>
                <div className="kv-value">{delegate.room}</div>
              </div>
            )}
            {delegate.booking_ref && (
              <div>
                <div className="kv-label">Booking ref</div>
                <div className="kv-value mono">{delegate.booking_ref}</div>
              </div>
            )}
            {delegate.check_in && (
              <div>
                <div className="kv-label">Check-in</div>
                <div className="kv-value">{delegate.check_in}</div>
              </div>
            )}
            {delegate.check_out && (
              <div>
                <div className="kv-label">Check-out</div>
                <div className="kv-value">{delegate.check_out}</div>
              </div>
            )}
            {delegate.meals && (
              <div>
                <div className="kv-label">Meals</div>
                <div className="kv-value">{delegate.meals}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
