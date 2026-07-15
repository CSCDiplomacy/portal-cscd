// Venue & stay. The shared venue (Tugu Kunstkring Paleis) comes from the public
// /api/hotel endpoint so every user can explore it; a delegate's personal
// booking (room, dates) is merged in from the auth'd /api/me/hotel when present.
import { useEffect, useState } from 'react';
import type { HotelInfo, MyHotel, PublicHotel } from '../../types';
import { api } from '../../services/api';
import { mapsLink } from '../../lib/utils';
import { Icon } from '../Icon';

export const Venue = () => {
  const [hotel, setHotel] = useState<HotelInfo | null>(null);
  const [booking, setBooking] = useState<MyHotel['delegate']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Public venue for everyone.
    api<PublicHotel>('/hotel')
      .then((d) => {
        if (!cancelled) setHotel(d.hotel);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Personal booking if the delegate has one (ignore failures / applicants).
    api<MyHotel>('/me/hotel')
      .then((d) => {
        if (!cancelled && d.delegate) setBooking(d.delegate);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="stack">
        <div className="skel" style={{ height: 220 }} />
        <div className="skel" style={{ height: 120 }} />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="coming-soon">
        <div className="coming-soon-badge">Venue</div>
        <h2 className="coming-soon-title">Details on the way</h2>
        <p className="coming-soon-body">Venue and stay information will appear here soon.</p>
      </div>
    );
  }

  const map = mapsLink(hotel.address || hotel.name);
  const hasBooking = booking && (booking.room || booking.booking_ref || booking.check_in);

  return (
    <div className="stack">
      <div className="card">
        {hotel.image && (
          <figure className="venue-photo-frame">
            <img src={hotel.image} alt={hotel.name} className="venue-photo" loading="lazy" />
          </figure>
        )}
        <div className="card-eyebrow">{hotel.subtitle || 'The venue'}</div>
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

      {!!hotel.amenities?.length && (
        <div className="card">
          <div className="card-eyebrow">On site</div>
          <ul className="dot-list">
            {hotel.amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {hasBooking && (
        <div className="card">
          <div className="card-eyebrow">Your booking</div>
          <div className="kv-grid">
            {booking!.room && (
              <div>
                <div className="kv-label">Room</div>
                <div className="kv-value">{booking!.room}</div>
              </div>
            )}
            {booking!.booking_ref && (
              <div>
                <div className="kv-label">Booking ref</div>
                <div className="kv-value mono">{booking!.booking_ref}</div>
              </div>
            )}
            {booking!.check_in && (
              <div>
                <div className="kv-label">Check-in</div>
                <div className="kv-value">{booking!.check_in}</div>
              </div>
            )}
            {booking!.check_out && (
              <div>
                <div className="kv-label">Check-out</div>
                <div className="kv-value">{booking!.check_out}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
